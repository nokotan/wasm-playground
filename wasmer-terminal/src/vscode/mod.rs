pub mod fileerror;
pub mod fileevent;
pub mod filesystem;
pub mod stat;
pub mod uri;

use js_sys::Function;
use serde::{Deserialize, Serialize};
use wasm_bindgen::prelude::*;

use crate::vscode::fileerror::FileSystemError;

#[wasm_bindgen(typescript_custom_section)]
const TS_APPEND_CONTENT: &'static str = r#"
import * as vscode from "vscode";
"#;

#[derive(Clone, Serialize, Deserialize)]
pub struct WriteFileOptions {
    pub create: bool,
    pub overwrite: bool,
}

#[derive(Clone, Serialize, Deserialize)]
pub struct RenameFileOptions {
    pub overwrite: bool,
}

#[wasm_bindgen(module = "/js/vscode.ts")]
extern "C" {
    #[wasm_bindgen(js_name = "createDisposable")]
    fn create_disposable_internal(f: &Function) -> JsValue;

    #[wasm_bindgen(js_name = "createFileNotFoundError")]
    fn create_file_not_found_error_internal(e: String) -> JsValue;
}

pub fn create_disposable(f: &Function) -> Disposable {
    Disposable::from(create_disposable_internal(f))
}

pub fn create_file_not_found_error(e: String) -> FileSystemError {
    FileSystemError::from(create_file_not_found_error_internal(e))
}

#[wasm_bindgen(module = "vscode")]
extern "C" {
    #[wasm_bindgen(typescript_type = "vscode.Disposable")]
    pub type Disposable;

    #[wasm_bindgen(constructor)]
    pub fn new(f: &Function) -> Disposable;

    #[wasm_bindgen(typescript_type = "vscode.FileStat")]
    pub type FileEntry;

    #[wasm_bindgen(typescript_type = "[string, vscode.FileType][]")]
    pub type DirectoryEntries;
}
