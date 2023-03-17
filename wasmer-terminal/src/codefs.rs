use std::cmp;
use std::io;
use std::{
    io::{Read, Seek, Write},
    path::PathBuf,
};

use tokio::sync::mpsc::{self, Receiver, Sender};
use tracing::info;
use wasmer_bus::task::block_on;
use wasmer_os::fs::MountedFileSystem;
use wasmer_os::wasmer_vfs::Result;
use wasmer_os::{
    wasmer_vfs::{FileOpener, FileSystem, Metadata, ReadDir},
    wasmer_wasi::VirtualFile,
};

use crate::vscode::fileerror::FileSystemError;
use crate::vscode::uri::Uri;
use crate::vscode::DirectoryEntries;
use crate::vscode::{filesystem::WorkSpace, stat::FileStat, uri::UriComponent};

#[derive(Debug)]
enum FileCommands {
    Stat {
        path: PathBuf,
        tx: Sender<Result<Metadata>>,
    },

    ReadDirectory {
        path: PathBuf,
        tx: Sender<Result<ReadDir>>,
    },

    CreateDirectory {
        path: PathBuf,
        tx: Sender<()>,
    },

    ReadFile {
        path: PathBuf,
        tx: Sender<Vec<u8>>,
    },

    WriteFile {
        path: PathBuf,
        data: Vec<u8>,
        tx: Sender<()>,
    },

    Delete {
        path: PathBuf,
        tx: Sender<()>,
    },

    Rename {
        old_path: PathBuf,
        new_path: PathBuf,
        tx: Sender<()>,
    },
}

pub struct CodeFS {
    base_uri: UriComponent,

    rx: Receiver<FileCommands>,

    tx: Sender<FileCommands>,
}

impl CodeFS {
    pub fn new(base_path: Uri) -> Self {
        let (tx, rx) = mpsc::channel(1024);

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
                    let stat = WorkSpace::read_file(path.into()).await;
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
        CodeFSClient {
            tx: self.tx.clone(),
        }
    }
}

#[derive(Clone, Debug)]
pub struct CodeFSClient {
    tx: Sender<FileCommands>,
}

impl CodeFSClient {
    fn read_all(&self, path: &std::path::Path) -> Vec<u8> {
        let (tx, mut rx) = mpsc::channel(1);

        block_on(self.tx.send(FileCommands::ReadFile {
            path: path.into(),
            tx,
        }));
        let data = block_on(rx.recv());
        data.unwrap()
    }

    fn write_all(&self, path: &std::path::Path, data: &[u8]) {
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
        wasmer_os::wasmer_vfs::OpenOptions::new(Box::new(CodeFSFileOpener { fs: self.clone() }))
    }
}

struct CodeFSFileOpener {
    fs: CodeFSClient,
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
            self.fs.read_all(path)
        } else {
            Vec::new()
        };

        let metadata = if conf.read() {
            self.fs.metadata(path).unwrap()
        } else {
            FileStat::new().into()
        };

        Ok(Box::new(CodeFSVirtualFile {
            fs: self.fs.clone(),
            path: path.to_owned(),
            buffer,
            metadata,
            cursor: 0usize,
        }))
    }
}

#[derive(Debug)]
struct CodeFSVirtualFile {
    fs: CodeFSClient,

    metadata: Metadata,

    path: PathBuf,

    buffer: Vec<u8>,

    cursor: usize,
}

impl VirtualFile for CodeFSVirtualFile {
    fn last_accessed(&self) -> u64 {
        self.metadata.accessed
    }

    fn last_modified(&self) -> u64 {
        self.metadata.modified
    }

    fn created_time(&self) -> u64 {
        self.metadata.created
    }

    fn size(&self) -> u64 {
        self.metadata.len
    }

    fn set_len(&mut self, new_size: u64) -> wasmer_os::wasmer_vfs::Result<()> {
        self.buffer.resize(new_size.try_into().unwrap(), 0);
        Ok(())
    }

    fn unlink(&mut self) -> wasmer_os::wasmer_vfs::Result<()> {
        self.fs.remove_file(&self.path)
    }
}

impl Write for CodeFSVirtualFile {
    fn write(&mut self, buf: &[u8]) -> io::Result<usize> {
        match self.cursor {
            // The cursor is at the end of the buffer: happy path!
            position if position == self.buffer.len() => {
                self.buffer.extend_from_slice(buf);
            }

            // The cursor is at the beginning of the buffer (and the
            // buffer is not empty, otherwise it would have been
            // caught by the previous arm): almost a happy path!
            0 => {
                let mut new_buffer = Vec::with_capacity(self.buffer.len() + buf.len());
                new_buffer.extend_from_slice(buf);
                new_buffer.append(&mut self.buffer);

                self.buffer = new_buffer;
            }

            // The cursor is somewhere in the buffer: not the happy path.
            position => {
                self.buffer.reserve_exact(buf.len());

                let mut remainder = self.buffer.split_off(position);
                self.buffer.extend_from_slice(buf);
                self.buffer.append(&mut remainder);
            }
        }

        self.cursor += buf.len();

        Ok(buf.len())
    }

    fn flush(&mut self) -> io::Result<()> {
        self.fs.write_all(&self.path, &self.buffer);
        Ok(())
    }
}

impl Read for CodeFSVirtualFile {
    fn read(&mut self, buf: &mut [u8]) -> std::io::Result<usize> {
        let max_to_read = cmp::min(self.buffer.len() - self.cursor, buf.len());
        let data_to_copy = &self.buffer[self.cursor..][..max_to_read];

        // SAFETY: `buf[..max_to_read]` and `data_to_copy` have the same size, due to
        // how `max_to_read` is computed.
        buf[..max_to_read].copy_from_slice(data_to_copy);

        self.cursor += max_to_read;

        Ok(max_to_read)
    }

    fn read_to_end(&mut self, buf: &mut Vec<u8>) -> io::Result<usize> {
        let data_to_copy = &self.buffer[self.cursor..];
        let max_to_read = data_to_copy.len();

        // `buf` is too small to contain the data. Let's resize it.
        if max_to_read > buf.len() {
            // Let's resize the capacity if needed.
            if max_to_read > buf.capacity() {
                buf.reserve_exact(max_to_read - buf.capacity());
            }

            // SAFETY: The space is reserved, and it's going to be
            // filled with `copy_from_slice` below.
            unsafe { buf.set_len(max_to_read) }
        }

        // SAFETY: `buf` and `data_to_copy` have the same size, see
        // above.
        buf.copy_from_slice(data_to_copy);

        self.cursor += max_to_read;

        Ok(max_to_read)
    }

    fn read_exact(&mut self, buf: &mut [u8]) -> io::Result<()> {
        if buf.len() > (self.buffer.len() - self.cursor) {
            return Err(io::Error::new(
                io::ErrorKind::UnexpectedEof,
                "not enough data available in file",
            ));
        }

        let max_to_read = cmp::min(buf.len(), self.buffer.len() - self.cursor);
        let data_to_copy = &self.buffer[self.cursor..][..max_to_read];

        // SAFETY: `buf` and `data_to_copy` have the same size.
        buf.copy_from_slice(data_to_copy);

        self.cursor += data_to_copy.len();

        Ok(())
    }
}

impl Seek for CodeFSVirtualFile {
    fn seek(&mut self, position: io::SeekFrom) -> io::Result<u64> {
        let to_err = |_| io::ErrorKind::InvalidInput;

        // Calculate the next cursor.
        let next_cursor: i64 = match position {
            // Calculate from the beginning, so `0 + offset`.
            io::SeekFrom::Start(offset) => offset.try_into().map_err(to_err)?,

            // Calculate from the end, so `buffer.len() + offset`.
            io::SeekFrom::End(offset) => {
                TryInto::<i64>::try_into(self.buffer.len()).map_err(to_err)? + offset
            }

            // Calculate from the current cursor, so `cursor + offset`.
            io::SeekFrom::Current(offset) => {
                TryInto::<i64>::try_into(self.cursor).map_err(to_err)? + offset
            }
        };

        // It's an error to seek before byte 0.
        if next_cursor < 0 {
            return Err(io::Error::new(
                io::ErrorKind::InvalidInput,
                "seeking before the byte 0",
            ));
        }

        // In this implementation, it's an error to seek beyond the
        // end of the buffer.
        self.cursor = cmp::min(self.buffer.len(), next_cursor.try_into().map_err(to_err)?);

        Ok(self.cursor.try_into().map_err(to_err)?)
    }
}
