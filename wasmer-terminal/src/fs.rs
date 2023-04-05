use async_recursion::async_recursion;
use std::future::Future;
use std::path::{Path, PathBuf};
use std::sync::{Arc, RwLock};
use std::sync::{RwLockReadGuard, RwLockWriteGuard};
use tracing::info;
use wasm_bindgen::prelude::*;
use wasm_bindgen_futures::spawn_local;
use wasmer_os::fs::UnionFileSystem;
use wasmer_os::wasmer_vfs::FileSystem;
use wasmer_os::wasmer_wasi::FsError;

use crate::codefs::fs::CodeFS;
use crate::vscode::fileerror::FileSystemError;
use crate::vscode::fileevent::{
    create_event_emitter, FileChangeEvent, FileChangeEventEmitter, VSCodeFileChangeEvent,
};
use crate::vscode::filesystem::WorkSpace;
use crate::vscode::stat::{FileStat, FileType};
use crate::vscode::uri::{Uri, UriComponent};
use crate::vscode::{create_disposable, DirectoryEntries, Disposable, FileEntry, WriteFileOptions};

#[wasm_bindgen]
pub struct WasiFS {
    pub(crate) fs: Arc<RwLock<UnionFileSystem>>,

    pub(crate) event_emitter: FileChangeEventEmitter,

    pub(crate) event: VSCodeFileChangeEvent,

    pub(crate) event_buffer: Vec<FileChangeEvent>,

    backup_url: Option<UriComponent>,
}

#[wasm_bindgen]
impl WasiFS {
    pub async fn new(backup_url: Option<Uri>) -> Self {
        let emitter = create_event_emitter().await;

        Self {
            fs: Arc::new(RwLock::new(wasmer_os::fs::create_root_fs(None))),
            event_emitter: emitter.clone().into(),
            event: emitter.event(),
            event_buffer: Vec::new(),
            backup_url: backup_url.map(UriComponent::from),
        }
    }

    pub fn mount(&mut self, base_uri: Uri, mount_point: String) {
        let mut vscode_fs = CodeFS::new(base_uri);

        let mut fs = self.fs.as_ref().write().expect("cannot write");

        fs.mount(
            "vscode",
            &mount_point,
            false,
            Box::new(vscode_fs.create_client()),
            None,
        );

        spawn_local(async move { vscode_fs.poll().await });
    }

    pub fn unmount(&mut self, mount_point: String) {
        let mut fs = self.fs.as_ref().write().expect("cannot write");
        fs.unmount(&mount_point);
    }

    pub async fn backup(&self) -> Result<(), JsValue> {
        let backup_url = match &self.backup_url {
            Some(x) => x,
            None => return Ok(()),
        };
        let fs = self.fs.as_ref().read().expect("cannot read");

        let base_uri = backup_url.join_path(&Path::new("/.app"));
        let _ = WorkSpace::create_directory(base_uri.into()).await;
        let base_uri = backup_url.join_path(&Path::new("/bin"));
        let _ = WorkSpace::create_directory(base_uri.into()).await;

        Self::backup_recursive(backup_url, &fs, "/.app", "")
            .await
            .map_err::<JsValue, _>(FileSystemError::into)?;
        Self::backup_recursive(backup_url, &fs, "", "/bin")
            .await
            .map_err(FileSystemError::into)
    }

    #[async_recursion(?Send)]
    async fn backup_recursive<'a>(
        backup_uri: &UriComponent,
        fs: &RwLockReadGuard<'a, UnionFileSystem>,
        root_path: &str,
        path: &str,
    ) -> Result<(), FileSystemError> {
        let path = root_path.to_string() + path;
        let entries = fs.read_dir(&PathBuf::from(&path))?;

        for entry in entries.into_iter() {
            let entry = entry.unwrap();
            let full_path = root_path.to_string() + &entry.path().to_string_lossy();
            let metadata = entry.metadata.unwrap();
            let save_url = backup_uri.clone();
            let save_url = save_url.join_path(&PathBuf::from(&full_path));

            match FileType::from(metadata.file_type()) {
                FileType::Directory => {
                    let _ = WorkSpace::create_directory(save_url.clone().into()).await;

                    Self::backup_recursive(
                        backup_uri,
                        fs,
                        root_path,
                        &entry.path.to_string_lossy(),
                    )
                    .await?;
                }
                FileType::File => {
                    let result = async move {
                        let mut file = fs
                            .new_open_options()
                            .read(true)
                            .open(&PathBuf::from(&full_path))?;

                        let mut buf = Vec::new();
                        file.read_to_end(&mut buf)?;

                        WorkSpace::write_file(save_url.into(), &buf).await
                    };
                    if let Err(error) = result.await {
                        tracing::error!("{}", error.code());
                    }
                }
                _ => {}
            }
        }

        return Ok(());
    }

    pub async fn restore(&self) -> Result<(), FileSystemError> {
        let backup_url = match self.backup_url.as_ref() {
            Some(value) => value,
            None => return Ok(()),
        };
        let fs = self.fs.as_ref().write().expect("cannot write");
        Self::restore_recursive(backup_url, &fs, "/.app").await?;
        Self::restore_recursive(backup_url, &fs, "/bin").await
    }

    #[async_recursion(?Send)]
    async fn restore_recursive<'a>(
        backup_url: &UriComponent,
        fs: &RwLockWriteGuard<'a, UnionFileSystem>,
        base_path: &str,
    ) -> Result<(), FileSystemError> {
        let save_url = backup_url.join_path(&PathBuf::from(base_path));

        let entries = WorkSpace::read_directory(save_url.into()).await?;
        let entries: Vec<(String, FileType)> =
            serde_wasm_bindgen::from_value(entries.into()).unwrap();

        for (ref path, file_type) in entries {
            let full_path = format!("{}/{}", base_path, path);
            match file_type {
                FileType::Directory => {
                    fs.create_dir(&PathBuf::from(&full_path))?;
                    Self::restore_recursive(backup_url, fs, &full_path).await?;
                }
                FileType::File => {
                    let result = async move {
                        let content = WorkSpace::read_file(
                            backup_url.join_path(&PathBuf::from(&full_path)).into(),
                        )
                        .await?
                        .to_vec();

                        let mut file = fs
                            .new_open_options()
                            .write(true)
                            .create(true)
                            .open(&PathBuf::from(&full_path))?;

                        file.write_all(&content).map_err(FileSystemError::from)
                    };

                    // continue on errors, displaying error content
                    if let Err(error) = result.await {
                        tracing::error!("{}", error.code());
                    }
                }
                _ => {}
            }
        }

        return Ok(());
    }

    pub fn clone(&self) -> Self {
        Self {
            fs: self.fs.clone(),
            event_emitter: self.event_emitter.clone().into(),
            event: self.event.clone().into(),
            event_buffer: Vec::new(),
            backup_url: self.backup_url.clone(),
        }
    }

    pub fn dispose(&mut self) {
        drop(self);
    }

    fn stat_internal(&self, uri: &Uri) -> Result<FileStat, FileSystemError> {
        let path = PathBuf::from(uri.path());
        let fs = self.fs.as_ref().read().expect("cannot read");

        fs.metadata(&path)
            .map(FileStat::from)
            .map_err(FileSystemError::from)
    }

    pub fn stat(&mut self, uri: Uri) -> Result<FileEntry, FileSystemError> {
        let stat = FileStat::from(self.stat_internal(&uri)?);
        Ok(stat.into())
    }

    #[wasm_bindgen(js_name = "readDirectory")]
    pub fn read_directory(&self, uri: Uri) -> Result<DirectoryEntries, FileSystemError> {
        if self.stat_internal(&uri)?.file_type != FileType::Directory {
            return Err(FileSystemError::from(FsError::BaseNotDirectory));
        }

        let path = PathBuf::from(uri.path());
        let fs = self.fs.as_ref().read().expect("cannot read");
        let files = fs.read_dir(&path).unwrap();
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

        Ok(serde_wasm_bindgen::to_value(&entries).unwrap().into())
    }

    #[wasm_bindgen(js_name = "readFile")]
    pub fn read_file(&self, uri: Uri) -> Result<Box<[u8]>, FileSystemError> {
        let path = PathBuf::from(uri.path());
        let fs = self.fs.as_ref().read().expect("cannot read");

        let mut file = fs.new_open_options().read(true).open(path)?;
        let mut buf = Vec::new();

        file.read_to_end(&mut buf)
            .map(|_| buf.into_boxed_slice())
            .map_err(FileSystemError::from)
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

        let ret = {
            let fs = self.fs.as_ref().read().expect("cannot read");
            let mut file = fs
                .new_open_options()
                .write(true)
                .create(options.create)
                .append(!options.overwrite)
                .open(path)?;

            file.write_all(buf)
                .map(|_| ())
                .map_err(FileSystemError::from)
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

        let ret = {
            let fs = self.fs.as_ref().read().expect("cannot read");
            fs.rename(&old_path, &path).map_err(FileSystemError::from)
        };

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

        let ret = {
            let fs = self.fs.as_ref().read().expect("cannot read");
            fs.remove_file(&path).map_err(FileSystemError::from)
        };

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

        let ret = {
            let fs = self.fs.as_ref().read().expect("cannot read");
            fs.create_dir(&path).map_err(FileSystemError::from)
        };

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
