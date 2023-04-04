use wasmer_os::wasmer_vfs::FileOpener;

use crate::codefs::client::CodeFSClient;
use crate::codefs::file::CodeFSVirtualFile;
use crate::vscode::stat::FileStat;
use wasmer_os::wasmer_vfs::FileSystem;

pub struct CodeFSFileOpener {
    fs: CodeFSClient,
}

impl CodeFSFileOpener {
    pub fn new(fs: CodeFSClient) -> Self {
        Self { fs }
    }
}

impl FileOpener for CodeFSFileOpener {
    fn open(
        &mut self,
        path: &std::path::Path,
        conf: &wasmer_os::wasmer_vfs::OpenOptionsConfig,
    ) -> wasmer_os::wasmer_vfs::Result<
        Box<dyn wasmer_os::wasmer_wasi::VirtualFile + Send + Sync + 'static>,
    > {
        let buffer = if conf.read() {
            self.fs.read_all(path)?
        } else {
            Vec::new()
        };

        let metadata = if conf.read() {
            self.fs.metadata(path).unwrap()
        } else {
            FileStat::new().into()
        };

        Ok(Box::new(CodeFSVirtualFile::new(
            self.fs.clone(),
            metadata,
            path.to_owned(),
            buffer,
        )))
    }
}
