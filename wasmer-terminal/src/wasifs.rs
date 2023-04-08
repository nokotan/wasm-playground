use async_recursion::async_recursion;
use downcast::Downcast;
use js_sys::Date;
use wasmer_os::common::MAX_MPSC;
use std::future::Future;
use std::path::{Path, PathBuf};
use std::sync::{Arc, RwLock};
use std::sync::{RwLockReadGuard, RwLockWriteGuard};
use std::thread::spawn;
use std::any::{Any, TypeId};
use tracing::{info, warn};
use wasm_bindgen::prelude::*;
use wasm_bindgen_futures::{spawn_local, JsFuture};
use wasmer_os::fs::{create_root_fs, UnionFileSystem, seed_root_fs};
use wasmer_os::wasmer_vfs::FileSystem;
use wasmer_os::wasmer_wasi::FsError;

use crate::backup::BackupContext;
use crate::codefs::fs::CodeFS;
use crate::fs::TmpFileSystem;
use crate::system::sleep;
use crate::vscode::fileerror::FileSystemError;
use crate::vscode::fileevent::{
    create_event_emitter, FileChangeEvent, FileChangeEventEmitter, VSCodeFileChangeEvent,
};
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
        let union_fs = UnionFileSystem::new();

        let backup_url = backup_url.map(UriComponent::from);
        let fs = Arc::new(RwLock::new(union_fs));
        let backup_ctx = BackupContext::new(fs.clone(), backup_url.clone());
        
        let (tx, mut rx) = tokio::sync::mpsc::channel(MAX_MPSC);
        let root_fs = TmpFileSystem::new(Some(move || {
            tx.blocking_send(()).unwrap();
        }));

        spawn_local(async move {

            let mut last_updated = 0f64;
            
            while let Some(_) = rx.recv().await {
                let now = Date::now();

                if now - last_updated < 1000f64 {
                    continue;
                }

                JsFuture::from(sleep(100)).await;

                info!("backup start");

                if let Err(e) = backup_ctx.backup().await {
                    warn!("{}", e.code());
                }

                last_updated = now;
            }
        });

        {
            let mut union_fs = fs.write().unwrap();
            union_fs.mount("root", "/", false, Box::new(root_fs), None);
            seed_root_fs(&mut union_fs);
        } 
      
        Self {
            fs,
            event_emitter: emitter.clone().into(),
            event: emitter.event(),
            event_buffer: Vec::new(),
            backup_url,
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

    pub async fn backup(&self) -> Result<(), FileSystemError> {
        let ctx = BackupContext::new(self.fs.clone(), self.backup_url.clone());
        ctx.backup().await
    }

    pub async fn restore(&self) -> Result<(), FileSystemError> {
        let ctx = BackupContext::new(self.fs.clone(), self.backup_url.clone());
        ctx.restore().await
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
