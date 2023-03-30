use tokio::sync::mpsc::{self, Sender};
use wasmer_bus::task::block_on;
use wasmer_os::fs::MountedFileSystem;
use wasmer_os::wasmer_vfs::{Metadata, ReadDir};

use crate::codefs::opener::CodeFSFileOpener;
use crate::codefs::FileCommands;

#[derive(Clone, Debug)]
pub struct CodeFSClient {
    tx: Sender<FileCommands>,
}

impl CodeFSClient {
    pub fn new(tx: Sender<FileCommands>) -> Self {
        Self { tx }
    }

    pub fn read_all(&self, path: &std::path::Path) -> Vec<u8> {
        let (tx, mut rx) = mpsc::channel(1);

        block_on(self.tx.send(FileCommands::ReadFile {
            path: path.into(),
            tx,
        }));
        let data = block_on(rx.recv());
        data.unwrap()
    }

    pub fn write_all(&self, path: &std::path::Path, data: &[u8]) {
        let (tx, mut rx) = mpsc::channel(1);

        block_on(self.tx.send(FileCommands::WriteFile {
            path: path.into(),
            data: data.to_vec(),
            tx,
        }));
        block_on(rx.recv());
    }
}

impl MountedFileSystem for CodeFSClient {
    fn set_ctx(&self, ctx: &wasmer_os::bus::WasmCallerContext) {}
}

impl wasmer_os::wasmer_vfs::FileSystem for CodeFSClient {
    fn metadata(&self, path: &std::path::Path) -> wasmer_os::wasmer_vfs::Result<Metadata> {
        let (tx, mut rx) = mpsc::channel(1);

        block_on(self.tx.send(FileCommands::Stat {
            path: path.into(),
            tx,
        }));
        let metadata = block_on(rx.recv());
        metadata.unwrap()
    }

    fn create_dir(&self, path: &std::path::Path) -> wasmer_os::wasmer_vfs::Result<()> {
        let (tx, mut rx) = mpsc::channel(1);

        block_on(self.tx.send(FileCommands::CreateDirectory {
            path: path.into(),
            tx,
        }))
        .unwrap();
        block_on(rx.recv());
        Ok(())
    }

    fn read_dir(&self, path: &std::path::Path) -> wasmer_os::wasmer_vfs::Result<ReadDir> {
        let (tx, mut rx) = mpsc::channel(1);

        block_on(self.tx.send(FileCommands::ReadDirectory {
            path: path.into(),
            tx,
        }));
        let readdir = block_on(rx.recv());
        readdir.unwrap()
    }

    fn rename(
        &self,
        from: &std::path::Path,
        to: &std::path::Path,
    ) -> wasmer_os::wasmer_vfs::Result<()> {
        let (tx, mut rx) = mpsc::channel(1);

        block_on(self.tx.send(FileCommands::Rename {
            old_path: from.into(),
            new_path: to.into(),
            tx,
        }));
        block_on(rx.recv());
        Ok(())
    }

    fn remove_file(&self, path: &std::path::Path) -> wasmer_os::wasmer_vfs::Result<()> {
        let (tx, mut rx) = mpsc::channel(1);

        block_on(self.tx.send(FileCommands::Delete {
            path: path.into(),
            tx,
        }));
        block_on(rx.recv());
        Ok(())
    }

    fn remove_dir(&self, path: &std::path::Path) -> wasmer_os::wasmer_vfs::Result<()> {
        let (tx, mut rx) = mpsc::channel(1);

        block_on(self.tx.send(FileCommands::Delete {
            path: path.into(),
            tx,
        }));
        block_on(rx.recv());
        Ok(())
    }

    fn new_open_options(&self) -> wasmer_os::wasmer_vfs::OpenOptions {
        wasmer_os::wasmer_vfs::OpenOptions::new(Box::new(CodeFSFileOpener::new(self.clone())))
    }
}
