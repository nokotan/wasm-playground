use serde::{Deserialize, Serialize};
use serde_repr::{Deserialize_repr, Serialize_repr};
use wasm_bindgen::prelude::*;
use wasmer_os::wasmer_vfs::DirEntry;
use wasmer_os::wasmer_vfs::Metadata;
use wasmer_os::wasmer_vfs::ReadDir;

use super::{DirectoryEntries, FileEntry};

#[derive(Copy, Clone, Debug, PartialEq, Serialize_repr, Deserialize_repr)]
#[repr(u32)]
pub enum FileType {
    Unknown = 0b00000000,
    File = 0b00000001,
    Directory = 0b00000010,
}

impl From<JsValue> for FileType {
    fn from(js: JsValue) -> Self {
        let value = js.as_f64().map(|v| v as u32);
        match value {
            Some(0b01) => FileType::File,
            Some(0b10) => FileType::Directory,
            _ => FileType::Unknown,
        }
    }
}

impl From<wasmer_os::wasmer_vfs::FileType> for FileType {
    fn from(value: wasmer_os::wasmer_vfs::FileType) -> Self {
        if value.is_file() {
            FileType::File
        } else if value.is_dir() {
            FileType::Directory
        } else {
            FileType::Unknown
        }
    }
}

impl Into<wasmer_os::wasmer_vfs::FileType> for FileType {
    fn into(self) -> wasmer_os::wasmer_vfs::FileType {
        match self {
            FileType::File => wasmer_os::wasmer_vfs::FileType {
                dir: false,
                file: true,
                symlink: false,
                char_device: false,
                block_device: false,
                socket: false,
                fifo: false,
            },
            FileType::Directory => wasmer_os::wasmer_vfs::FileType {
                dir: true,
                file: false,
                symlink: false,
                char_device: false,
                block_device: false,
                socket: false,
                fifo: false,
            },
            FileType::Unknown => wasmer_os::wasmer_vfs::FileType {
                dir: false,
                file: false,
                symlink: false,
                char_device: false,
                block_device: false,
                socket: false,
                fifo: false,
            },
        }
    }
}

#[derive(Serialize, Deserialize, Debug)]
pub struct FileStat {
    #[serde(rename = "type")]
    pub file_type: FileType,

    pub ctime: u32,

    pub mtime: u32,

    pub size: u32,
}

impl FileStat {
    pub fn new() -> Self {
        Self {
            file_type: FileType::File,
            ctime: 0u32,
            mtime: 0u32,
            size: 0u32,
        }
    }
}

impl From<Metadata> for FileStat {
    fn from(from: Metadata) -> FileStat {
        FileStat {
            file_type: FileType::from(from.file_type()),
            ctime: from.created as u32,
            mtime: from.modified as u32,
            size: from.len as u32,
        }
    }
}

impl Into<Metadata> for FileStat {
    fn into(self) -> Metadata {
        Metadata {
            ft: self.file_type.into(),
            accessed: self.mtime as u64,
            created: self.ctime as u64,
            modified: self.mtime as u64,
            len: self.size as u64,
        }
    }
}

impl Into<FileEntry> for FileStat {
    fn into(self) -> FileEntry {
        serde_wasm_bindgen::to_value(&self).unwrap().into()
    }
}

impl From<FileEntry> for FileStat {
    fn from(value: FileEntry) -> Self {
        serde_wasm_bindgen::from_value(value.into()).unwrap()
    }
}

impl From<ReadDir> for DirectoryEntries {
    fn from(value: ReadDir) -> Self {
        let entries: Vec<_> = value
            .into_iter()
            .map(|meta| {
                let meta = meta.unwrap();
                (
                    meta.path.to_string_lossy().to_string(),
                    FileStat::from(meta.metadata.unwrap()).file_type,
                )
            })
            .collect();
        serde_wasm_bindgen::to_value(&entries).unwrap().into()
    }
}

impl Into<ReadDir> for DirectoryEntries {
    fn into(self) -> ReadDir {
        let entries: Vec<(String, FileType)> = serde_wasm_bindgen::from_value(self.into()).unwrap();
        let entries: Vec<_> = entries
            .into_iter()
            .map(|(path, file_type)| DirEntry {
                path: path.into(),
                metadata: Ok(Metadata {
                    ft: file_type.into(),
                    accessed: 0u64,
                    created: 0u64,
                    modified: 0u64,
                    len: 0u64,
                }),
            })
            .collect();
        ReadDir::new(entries)
    }
}
