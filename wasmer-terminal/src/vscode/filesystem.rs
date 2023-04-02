use js_sys::Uint8Array;
use serde::{Deserialize, Serialize};
use wasm_bindgen::prelude::*;

use super::fileerror::FileSystemError;
use super::uri::Uri;

#[derive(Clone, Serialize, Deserialize)]
pub struct WriteFileOptions {
    pub create: bool,
    pub overwrite: bool,
}

#[derive(Clone, Serialize, Deserialize)]
pub struct RenameFileOptions {
    pub overwrite: bool,
}

#[wasm_bindgen(module = "vscode")]
extern "C" {
    #[wasm_bindgen(typescript_type = "vscode.FileStat")]
    pub type FileEntry;

    #[wasm_bindgen(typescript_type = "[string, vscode.FileType][]")]
    pub type DirectoryEntries;
}

#[wasm_bindgen(module = "/js/vscode.ts")]
extern "C" {

    pub type FileSystem;

    #[wasm_bindgen(method, catch, js_name = "copy")]
    async fn copy_js(this: &FileSystem, source: Uri, target: Uri) -> Result<(), JsValue>;

    #[wasm_bindgen(method, catch, js_name = "createDirectory")]
    async fn create_directory_js(this: &FileSystem, uri: Uri) -> Result<(), JsValue>;

    #[wasm_bindgen(method, catch, js_name = "delete")]
    async fn delete_js(this: &FileSystem, uri: Uri) -> Result<(), JsValue>;

    #[wasm_bindgen(method, js_name = "isWritableFileSystem")]
    pub fn is_writable_file_system(this: &FileSystem, scheme: String) -> bool;

    #[wasm_bindgen(method, catch, js_name = "readDirectory")]
    async fn read_directory_js(this: &FileSystem, uri: Uri) -> Result<JsValue, JsValue>;

    #[wasm_bindgen(method, catch, js_name = "readFile")]
    async fn read_file_js(this: &FileSystem, uri: Uri) -> Result<JsValue, JsValue>;

    #[wasm_bindgen(method, catch, js_name = "rename")]
    async fn rename_js(this: &FileSystem, source: Uri, target: Uri) -> Result<(), JsValue>;

    #[wasm_bindgen(method, catch, js_name = "stat")]
    async fn stat_js(this: &FileSystem, uri: Uri) -> Result<JsValue, JsValue>;

    #[wasm_bindgen(method, catch, js_name = "writeFile")]
    async fn write_file_js(this: &FileSystem, uri: Uri, content: &[u8]) -> Result<(), JsValue>;

    #[wasm_bindgen(js_name = "getWorkspaceFs")]
    pub fn get_workspace_fs() -> FileSystem;
}

pub struct WorkSpace {}

impl WorkSpace {
    pub async fn copy(source: Uri, target: Uri) -> Result<(), FileSystemError> {
        let fs = get_workspace_fs();
        let result = fs.copy_js(source, target).await;
        result.map_err(FileSystemError::from)
    }

    pub async fn create_directory(uri: Uri) -> Result<(), FileSystemError> {
        let fs = get_workspace_fs();
        let result = fs.create_directory_js(uri).await;
        result.map_err(FileSystemError::from)
    }

    pub async fn delete(uri: Uri) -> Result<(), FileSystemError> {
        let fs = get_workspace_fs();
        let result = fs.delete_js(uri).await;
        result.map_err(FileSystemError::from)
    }

    pub async fn read_file(uri: Uri) -> Result<Uint8Array, FileSystemError> {
        let fs = get_workspace_fs();
        let data = fs.read_file_js(uri).await;
        data.map(Uint8Array::from).map_err(FileSystemError::from)
    }

    pub async fn read_directory(uri: Uri) -> Result<DirectoryEntries, FileSystemError> {
        let fs = get_workspace_fs();
        let data = fs.read_directory_js(uri).await;

        data.map(DirectoryEntries::from)
            .map_err(FileSystemError::from)
    }

    pub async fn stat(uri: Uri) -> Result<FileEntry, FileSystemError> {
        let fs = get_workspace_fs();
        let data = fs.stat_js(uri).await;

        data.map(FileEntry::from).map_err(FileSystemError::from)
    }

    pub async fn rename(source: Uri, target: Uri) -> Result<(), FileSystemError> {
        let fs = get_workspace_fs();
        let result = fs.rename_js(source, target).await;
        result.map_err(FileSystemError::from)
    }

    pub async fn write_file(uri: Uri, content: &[u8]) -> Result<(), FileSystemError> {
        let fs = get_workspace_fs();
        let result = fs.write_file_js(uri, content).await;
        result.map_err(FileSystemError::from)
    }
}
