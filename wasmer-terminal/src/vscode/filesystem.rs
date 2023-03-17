use js_sys::Uint8Array;
use wasm_bindgen::prelude::*;

use super::fileerror::FileSystemError;
use super::uri::Uri;
use super::{DirectoryEntries, FileEntry};

#[wasm_bindgen(module = "/js/vscode.ts")]
extern "C" {

    pub type FileSystem;

    #[wasm_bindgen(method)]
    async fn copy_js(this: &FileSystem, source: Uri, target: Uri);

    #[wasm_bindgen(method, js_name = "createDirectory")]
    async fn create_directory_js(this: &FileSystem, uri: Uri);

    #[wasm_bindgen(method, js_name = "delete")]
    async fn delete_js(this: &FileSystem, uri: Uri);

    #[wasm_bindgen(method, js_name = "isWritableFileSystem")]
    pub fn is_writable_file_system(this: &FileSystem, scheme: String) -> bool;

    #[wasm_bindgen(method, catch, js_name = "readDirectory")]
    async fn read_directory_js(this: &FileSystem, uri: Uri) -> Result<JsValue, JsValue>;

    #[wasm_bindgen(method, js_name = "readFile")]
    async fn read_file_js(this: &FileSystem, uri: Uri) -> JsValue;

    #[wasm_bindgen(method, js_name = "rename")]
    async fn rename_js(this: &FileSystem, source: Uri, target: Uri);

    #[wasm_bindgen(method, catch, js_name = "stat")]
    async fn stat_js(this: &FileSystem, uri: Uri) -> Result<JsValue, JsValue>;

    #[wasm_bindgen(method, js_name = "writeFile")]
    async fn write_file_js(this: &FileSystem, uri: Uri, content: &[u8]);

    #[wasm_bindgen(js_name = "getWorkspaceFs")]
    pub fn get_workspace_fs() -> FileSystem;
}

pub struct WorkSpace {}

impl WorkSpace {
    pub async fn copy(source: Uri, target: Uri) {
        let fs = get_workspace_fs();
        fs.copy_js(source, target).await;
    }

    pub async fn create_directory(uri: Uri) {
        let fs = get_workspace_fs();
        fs.create_directory_js(uri).await;
    }

    pub async fn delete(uri: Uri) {
        let fs = get_workspace_fs();
        fs.delete_js(uri).await;
    }

    pub async fn read_file(uri: Uri) -> Uint8Array {
        let fs = get_workspace_fs();
        let data = fs.read_file_js(uri).await;
        Uint8Array::from(data)
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

    pub async fn rename(source: Uri, target: Uri) {
        let fs = get_workspace_fs();
        fs.rename_js(source, target).await;
    }

    pub async fn write_file(uri: Uri, content: &[u8]) {
        let fs = get_workspace_fs();
        fs.write_file_js(uri, content).await;
    }
}
