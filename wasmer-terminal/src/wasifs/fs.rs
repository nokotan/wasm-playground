//! Wraps the memory file system implementation - this has been
//! enhanced to support mounting file systems, shared static files,
//! readonly files, etc...

use std::fmt::Debug;
use std::io::{Read, Seek, Write};
use std::path::Path;
use std::sync::{Arc, RwLock};
use wasmer_os::fs::MountedFileSystem;
use wasmer_os::wasmer_vfs::{
    mem_fs, FileOpener, FileSystem, Metadata, OpenOptions, OpenOptionsConfig, ReadDir, Result,
    VirtualFile,
};

#[derive(Clone)]
pub struct TmpFileSystem {
    fs: mem_fs::FileSystem,
    pub(crate) callback: Option<Arc<dyn Fn() + Send + Sync + Send + Sync>>,
}

impl Debug for TmpFileSystem {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        Debug::fmt(&self.fs, f)
    }
}

impl MountedFileSystem for TmpFileSystem {
    fn set_ctx(&self, ctx: &wasmer_os::bus::WasmCallerContext) {}
}

impl TmpFileSystem {
    pub fn new<T: Fn() + Send + Sync + 'static>(callback: Option<T>) -> Self {
        Self {
            fs: Default::default(),
            callback: if let Some(x) = callback {
                Some(Arc::from(x))
            } else {
                None
            },
        }
    }
}

impl FileSystem for TmpFileSystem {
    fn read_dir(&self, path: &Path) -> Result<ReadDir> {
        self.fs.read_dir(path)
    }

    fn create_dir(&self, path: &Path) -> Result<()> {
        self.fs.create_dir(path)?;
        if let Some(ref callback) = self.callback {
            callback();
        }
        Ok(())
    }

    fn remove_dir(&self, path: &Path) -> Result<()> {
        self.fs.remove_dir(path)?;
        if let Some(ref callback) = self.callback {
            callback();
        }
        Ok(())
    }

    fn rename(&self, from: &Path, to: &Path) -> Result<()> {
        self.fs.rename(from, to)?;
        if let Some(ref callback) = self.callback {
            callback();
        }
        Ok(())
    }

    fn metadata(&self, path: &Path) -> Result<Metadata> {
        self.fs.metadata(path)
    }

    fn symlink_metadata(&self, path: &Path) -> Result<Metadata> {
        self.fs.symlink_metadata(path)
    }

    fn remove_file(&self, path: &Path) -> Result<()> {
        self.fs.remove_file(path)?;
        if let Some(ref callback) = self.callback {
            callback();
        }
        Ok(())
    }

    fn new_open_options(&self) -> OpenOptions {
        OpenOptions::new(Box::new(TmpFileOpener::new(
            self.fs.new_open_options(),
            self.callback.clone(),
        )))
    }
}

pub struct TmpFileOpener {
    opener: OpenOptions,
    callback: Option<Arc<dyn Fn() + Send + Sync>>,
}

impl TmpFileOpener {
    fn new(opener: OpenOptions, callback: Option<Arc<dyn Fn() + Send + Sync>>) -> Self {
        Self { opener, callback }
    }
}

impl FileOpener for TmpFileOpener {
    fn open(
        &mut self,
        path: &Path,
        conf: &OpenOptionsConfig,
    ) -> Result<Box<dyn VirtualFile + Send + Sync + 'static>> {
        self.opener.options(conf.clone());
        let file = self.opener.open(path)?;
        Ok(Box::new(VirtualTmpFile::new(file, self.callback.clone())))
    }
}

#[derive(Clone)]
pub struct VirtualTmpFile {
    file: Arc<RwLock<Box<dyn VirtualFile + Send + Sync + 'static>>>,
    callback: Option<Arc<dyn Fn() + Send + Sync>>,
}

impl Debug for VirtualTmpFile {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        Debug::fmt(&self.file, f)
    }
}

impl VirtualTmpFile {
    fn new(
        file: Box<dyn VirtualFile + Send + Sync + 'static>,
        callback: Option<Arc<dyn Fn() + Send + Sync>>,
    ) -> Self {
        Self {
            file: Arc::from(RwLock::from(file)),
            callback,
        }
    }
}

impl VirtualFile for VirtualTmpFile {
    fn last_accessed(&self) -> u64 {
        self.file.try_read().unwrap().last_accessed()
    }

    fn last_modified(&self) -> u64 {
        self.file.try_read().unwrap().last_modified()
    }

    fn created_time(&self) -> u64 {
        self.file.try_read().unwrap().created_time()
    }

    fn size(&self) -> u64 {
        self.file.try_read().unwrap().size()
    }

    fn set_len(&mut self, new_size: u64) -> Result<()> {
        self.file.try_write().unwrap().set_len(new_size)
    }

    fn unlink(&mut self) -> Result<()> {
        self.file.try_write().unwrap().unlink()
    }
}

impl Read for VirtualTmpFile {
    fn read(&mut self, buf: &mut [u8]) -> std::io::Result<usize> {
        self.file.try_write().unwrap().read(buf)
    }
}

impl Write for VirtualTmpFile {
    fn write(&mut self, buf: &[u8]) -> std::io::Result<usize> {
        let ret = self.file.try_write().unwrap().write(buf)?;
        if let Some(ref callback) = self.callback {
            callback();
        }
        Ok(ret)
    }

    fn flush(&mut self) -> std::io::Result<()> {
        self.file.try_write().unwrap().flush()?;
        if let Some(ref callback) = self.callback {
            callback();
        }
        Ok(())
    }
}

impl Seek for VirtualTmpFile {
    fn seek(&mut self, pos: std::io::SeekFrom) -> std::io::Result<u64> {
        self.file.try_write().unwrap().seek(pos)
    }
}
