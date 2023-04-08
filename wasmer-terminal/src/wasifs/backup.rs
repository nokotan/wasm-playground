use async_recursion::async_recursion;
use std::path::{Path, PathBuf};
use std::sync::{Arc, RwLock};
use std::sync::{RwLockReadGuard, RwLockWriteGuard};
use wasmer_os::fs::{UnionFileSystem};
use wasmer_os::wasmer_vfs::FileSystem;
use wasmer_os::wasmer_wasi::FsError;

use crate::wasifs::fs::TmpFileSystem;
use crate::vscode::fileerror::FileSystemError;
use crate::vscode::filesystem::WorkSpace;
use crate::vscode::stat::{FileType};
use crate::vscode::uri::{UriComponent};

#[derive(Clone, Debug)]
pub struct BackupContext {
    fs: Arc<RwLock<UnionFileSystem>>,
    backup_url: Option<UriComponent>,
}

impl BackupContext {
    pub fn new(fs: Arc<RwLock<UnionFileSystem>>, backup_url: Option<UriComponent>) -> Self {
        Self { fs, backup_url }
    }

    pub async fn backup(&self) -> Result<(), FileSystemError> {
        let backup_url = match &self.backup_url {
            Some(x) => x,
            None => return Ok(()),
        };
        let fs = self
            .fs
            .as_ref()
            .try_read()
            .map_err(|_| FileSystemError::from(FsError::IOError))?;

        let base_uri = backup_url.join_path(&Path::new("/.app"));
        let _ = WorkSpace::create_directory(base_uri.into()).await;
        let base_uri = backup_url.join_path(&Path::new("/bin"));
        let _ = WorkSpace::create_directory(base_uri.into()).await;
        let base_uri = backup_url.join_path(&Path::new("/lib"));
        let _ = WorkSpace::create_directory(base_uri.into()).await;

        Self::backup_recursive(backup_url, &fs, "/.app/", "").await?;
        Self::backup_recursive(backup_url, &fs, "", "/bin").await?;
        Self::backup_recursive(backup_url, &fs, "", "/lib").await
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
        let fs = self
            .fs
            .as_ref()
            .try_write()
            .map_err(|_| FileSystemError::from(FsError::IOError))?;
        Self::restore_recursive(backup_url, &fs, "/.app").await?;
        Self::restore_recursive(backup_url, &fs, "/bin").await?;
        Self::restore_recursive(backup_url, &fs, "/lib").await
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
}
