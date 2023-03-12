use serde::{Deserialize, Serialize};
use serde_repr::{Deserialize_repr, Serialize_repr};
use wasm_bindgen::prelude::*;
use wasmer_os::wasmer_vfs::Metadata;

#[derive(Copy, Clone, PartialEq, Serialize_repr, Deserialize_repr)]
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

#[derive(Serialize, Deserialize)]
pub struct FileStat {
    #[serde(rename = "type")]
    pub file_type: FileType,

    pub ctime: u32,

    pub mtime: u32,

    pub size: u32,
}

impl From<Metadata> for FileStat {
    fn from(from: Metadata) -> FileStat {
        let file_type = from.file_type();

        let file_type = if file_type.is_file() {
            FileType::File
        } else if file_type.is_dir() {
            FileType::Directory
        } else {
            FileType::Unknown
        };

        FileStat {
            file_type,
            ctime: from.created as u32,
            mtime: from.modified as u32,
            size: from.len as u32,
        }
    }
}

impl Into<JsValue> for FileStat {
    fn into(self) -> JsValue {
        serde_wasm_bindgen::to_value(&self).unwrap()
    }
}

#[derive(Serialize, Deserialize)]
pub struct DirectoryStat {
    pub entries: Vec<(String, FileType)>,
}
