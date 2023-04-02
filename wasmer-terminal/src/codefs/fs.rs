use crate::codefs::FileCommands;
use tokio::sync::mpsc::{self, Receiver, Sender};

use crate::codefs::client::CodeFSClient;
use crate::vscode::fileerror::FileSystemError;
use crate::vscode::uri::Uri;
use crate::vscode::DirectoryEntries;
use crate::vscode::{filesystem::WorkSpace, stat::FileStat, uri::UriComponent};
use tracing::info;

pub struct CodeFS {
    base_uri: UriComponent,

    rx: Receiver<FileCommands>,

    tx: Sender<FileCommands>,
}

impl CodeFS {
    pub fn new(base_path: Uri) -> Self {
        let (tx, rx) = mpsc::channel::<FileCommands>(1024);

        Self {
            base_uri: UriComponent::from(base_path),
            rx,
            tx,
        }
    }

    pub async fn poll(&mut self) {
        while let Some(command) = self.rx.recv().await {
            info!("Received Command: {:?}", command);
            match command {
                FileCommands::CreateDirectory { path, tx } => {
                    let path = self.base_uri.with_path(&path);
                    let _ = WorkSpace::create_directory(path.into()).await;
                    let _ = tx.send(()).await;
                }
                FileCommands::Delete { path, tx } => {
                    let path = self.base_uri.with_path(&path);
                    let _ = WorkSpace::delete(path.into()).await;
                    let _ = tx.send(()).await;
                }
                FileCommands::Stat { path, tx } => {
                    let path = self.base_uri.with_path(&path);
                    let stat = WorkSpace::stat(path.into()).await;
                    let stat = stat
                        .map(FileStat::from)
                        .map(FileStat::into)
                        .map_err(FileSystemError::into);
                    let _ = tx.send(stat).await;
                }
                FileCommands::ReadDirectory { path, tx } => {
                    let path = self.base_uri.with_path(&path);
                    let stat = WorkSpace::read_directory(path.into()).await;
                    let stat = stat
                        .map(DirectoryEntries::into)
                        .map_err(FileSystemError::into);
                    let _ = tx.send(stat).await;
                }
                FileCommands::Rename {
                    old_path,
                    new_path,
                    tx,
                } => {
                    let old_path = self.base_uri.with_path(&old_path);
                    let new_path = self.base_uri.with_path(&new_path);
                    let _ = WorkSpace::rename(old_path.into(), new_path.into()).await;
                    let _ = tx.send(()).await;
                }
                FileCommands::ReadFile { path, tx } => {
                    let path = self.base_uri.with_path(&path);
                    let stat = WorkSpace::read_file(path.into()).await.unwrap();
                    let _ = tx.send(stat.to_vec()).await;
                }
                FileCommands::WriteFile { path, data, tx } => {
                    let path = self.base_uri.with_path(&path);
                    let _ = WorkSpace::write_file(path.into(), &data).await;
                    let _ = tx.send(()).await;
                }
            }
        }
    }

    pub fn create_client(&self) -> CodeFSClient {
        CodeFSClient::new(self.tx.clone())
    }
}
