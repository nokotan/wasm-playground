use std::path::PathBuf;
use tracing::info;
use wasm_bindgen::prelude::*;
use wasm_bindgen_futures::spawn_local;
use wasmer_os::fs::UnionFileSystem;
use wasmer_os::wasmer_vfs::FileSystem;

use crate::codefs::CodeFS;
use crate::vscode::fileerror::FileSystemError;
use crate::vscode::fileevent::{
    create_event_emitter, FileChangeEvent, FileChangeEventEmitter, VSCodeFileChangeEvent,
};
use crate::vscode::stat::{FileStat, FileType};
use crate::vscode::uri::{Uri, UriComponent};
use crate::vscode::{
    create_disposable, create_file_not_found_error, DirectoryEntries, Disposable, FileEntry,
    WriteFileOptions,
};

#[wasm_bindgen]
pub struct WasiFS {
    pub(crate) fs: UnionFileSystem,

    pub(crate) event_emitter: FileChangeEventEmitter,

    pub(crate) event: VSCodeFileChangeEvent,

    pub(crate) event_buffer: Vec<FileChangeEvent>,
}

#[wasm_bindgen]
impl WasiFS {
    pub async fn new() -> Self {
        let emitter = create_event_emitter().await;

        Self {
            fs: wasmer_os::fs::create_root_fs(None),
            event_emitter: emitter.clone().into(),
            event: emitter.event(),
            event_buffer: Vec::new(),
        }
    }

    pub fn mount(&mut self, base_uri: Uri, mount_point: String) {
        let mut vscode_fs = CodeFS::new(base_uri);

        self.fs.mount(
            "vscode",
            &mount_point,
            false,
            Box::new(vscode_fs.create_client()),
            None,
        );

        spawn_local(async move { vscode_fs.poll().await });
    }

    pub fn unmount(&mut self, mount_point: String) {
        self.fs.unmount(&mount_point);
    }

    pub fn clone(&self) -> Self {
        Self {
            fs: self.fs.clone(),
            event_emitter: self.event_emitter.clone().into(),
            event: self.event.clone().into(),
            event_buffer: Vec::new(),
        }
    }

    pub fn dispose(&mut self) {
        drop(self);
    }

    fn stat_internal(&self, uri: &Uri) -> Result<FileStat, FileSystemError> {
        let path = PathBuf::from(uri.path());

        match self.fs.metadata(&path) {
            Err(e) => Err(create_file_not_found_error(e.to_string())),
            Ok(metadata) => Ok(FileStat::from(metadata)),
        }
    }

    pub fn stat(&mut self, uri: Uri) -> Result<FileEntry, FileSystemError> {
        let stat = FileStat::from(self.stat_internal(&uri)?);
        Ok(stat.into())
    }

    #[wasm_bindgen(js_name = "readDirectory")]
    pub fn read_directory(&self, uri: Uri) -> Result<DirectoryEntries, FileSystemError> {
        if self.stat_internal(&uri)?.file_type != FileType::Directory {
            return Err(create_file_not_found_error("Not a directory".to_string()));
        }

        let path = PathBuf::from(uri.path());
        let files = self.fs.read_dir(&path).unwrap();
        let entries: Vec<_> = files
            .into_iter()
            .map(|meta| {
                let meta = meta.unwrap();
                (
                    meta.path.to_string_lossy().to_string(),
                    FileStat::from(meta.metadata.unwrap()).file_type,
                )
            })
            .collect();

        // let val = DirectoryStat { entries };

        Ok(serde_wasm_bindgen::to_value(&entries).unwrap().into())
    }

    #[wasm_bindgen(js_name = "readFile")]
    pub fn read_file(&self, uri: Uri) -> Result<Box<[u8]>, FileSystemError> {
        let path = PathBuf::from(uri.path());

        let mut file = match self.fs.new_open_options().read(true).open(path) {
            Ok(file) => file,
            Err(e) => return Err(create_file_not_found_error(e.to_string())),
        };

        let mut buf = Vec::new();

        match file.read_to_end(&mut buf) {
            Ok(_) => Ok(buf.into_boxed_slice()),
            Err(e) => Err(create_file_not_found_error(e.to_string())),
        }
    }

    #[wasm_bindgen(js_name = "writeFile")]
    pub fn write_file(
        &mut self,
        uri: Uri,
        buf: &[u8],
        options: JsValue,
    ) -> Result<(), FileSystemError> {
        let path = PathBuf::from(uri.path());
        let options: WriteFileOptions = serde_wasm_bindgen::from_value(options).unwrap();

        let mut file = match self
            .fs
            .new_open_options()
            .write(true)
            .create(options.create)
            .append(!options.overwrite)
            .open(path)
        {
            Ok(file) => file,
            Err(e) => return Err(create_file_not_found_error(e.to_string())),
        };

        let ret = match file.write_all(buf) {
            Ok(_) => Ok(()),
            Err(e) => return Err(create_file_not_found_error(e.to_string())),
        };

        let mut events = Vec::new();
        events.push(FileChangeEvent {
            event_type: crate::vscode::fileevent::FileChangeType::Changed,
            uri: UriComponent::from(uri),
        });
        self.fire_soon(events);

        ret
    }

    pub fn rename(
        &mut self,
        old_uri: Uri,
        uri: Uri,
        options: JsValue,
    ) -> Result<(), FileSystemError> {
        let old_path = PathBuf::from(old_uri.path());
        let path = PathBuf::from(uri.path());

        let ret = self
            .fs
            .rename(&old_path, &path)
            .map_err(|e| create_file_not_found_error(e.to_string()));

        let mut events = Vec::new();
        events.push(FileChangeEvent {
            event_type: crate::vscode::fileevent::FileChangeType::Changed,
            uri: UriComponent::from(old_uri),
        });
        self.fire_soon(events);

        ret
    }

    pub fn delete(&mut self, uri: Uri) -> Result<(), FileSystemError> {
        let path = PathBuf::from(uri.path());

        let ret = self
            .fs
            .remove_file(&path)
            .map_err(|e| create_file_not_found_error(e.to_string()));

        let mut events = Vec::new();
        events.push(FileChangeEvent {
            event_type: crate::vscode::fileevent::FileChangeType::Deleted,
            uri: UriComponent::from(uri),
        });
        self.fire_soon(events);

        ret
    }

    #[wasm_bindgen(js_name = "createDirectory")]
    pub fn create_directory(&mut self, uri: Uri) -> Result<(), FileSystemError> {
        let path = PathBuf::from(uri.path());

        let ret = self
            .fs
            .create_dir(&path)
            .map_err(|e| create_file_not_found_error(e.to_string()));

        let mut events = Vec::new();
        events.push(FileChangeEvent {
            event_type: crate::vscode::fileevent::FileChangeType::Created,
            uri: UriComponent::from(uri),
        });
        self.fire_soon(events);

        ret
    }

    pub fn watch(&self, uri: Uri) -> Result<Disposable, FileSystemError> {
        let closure = { Closure::wrap(Box::new(move || {}) as Box<dyn FnMut()>) };
        let disposable = create_disposable(closure.as_ref().unchecked_ref());
        closure.forget();
        Ok(disposable)
    }

    #[wasm_bindgen(getter, js_name = "onDidChangeFile")]
    pub fn on_did_change_file(&self) -> VSCodeFileChangeEvent {
        self.event.clone().into()
    }

    fn fire_soon(&mut self, mut events: Vec<FileChangeEvent>) {
        self.event_buffer.append(&mut events);

        let events = serde_wasm_bindgen::to_value(&self.event_buffer).unwrap();
        self.event_emitter.fire(events);

        self.event_buffer.clear();
    }
}
