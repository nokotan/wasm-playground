use std::cmp;
use std::io;
use std::{
    io::{Read, Seek, Write},
    path::PathBuf,
};

use wasmer_os::{wasmer_vfs::Metadata, wasmer_wasi::VirtualFile};

use crate::codefs::client::CodeFSClient;
use wasmer_os::wasmer_vfs::FileSystem;

#[derive(Debug)]
pub struct CodeFSVirtualFile {
    fs: CodeFSClient,

    metadata: Metadata,

    path: PathBuf,

    buffer: Vec<u8>,

    cursor: usize,
}

impl CodeFSVirtualFile {
    pub fn new(fs: CodeFSClient, metadata: Metadata, path: PathBuf, buffer: Vec<u8>) -> Self {
        Self {
            fs,
            metadata,
            buffer,
            path,
            cursor: 0usize,
        }
    }
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
