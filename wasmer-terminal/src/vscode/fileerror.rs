use wasm_bindgen::prelude::*;
use wasmer_os::wasmer_wasi::FsError;

#[wasm_bindgen(module = "/js/vscode.ts")]
extern "C" {
    #[wasm_bindgen]
    pub type FileSystemError;

    #[wasm_bindgen(js_name = "getFileSystemError")]
    pub fn get_file_system_error() -> FileSystemError;

    #[wasm_bindgen(method, getter)]
    pub fn code(this: &FileSystemError) -> String;

    #[wasm_bindgen(method)]
    pub fn FileNotFound(this: &FileSystemError, message: String) -> FileSystemError;

    #[wasm_bindgen(method)]
    pub fn FileExists(this: &FileSystemError, message: String) -> FileSystemError;

    #[wasm_bindgen(method)]
    pub fn FileNotADirectory(this: &FileSystemError, message: String) -> FileSystemError;

    #[wasm_bindgen(method)]
    pub fn FileIsADirectory(this: &FileSystemError, message: String) -> FileSystemError;

    #[wasm_bindgen(method)]
    pub fn NoPermissions(this: &FileSystemError, message: String) -> FileSystemError;

    #[wasm_bindgen(method)]
    pub fn Unavailable(this: &FileSystemError, message: String) -> FileSystemError;
}

impl Into<FsError> for FileSystemError {
    fn into(self) -> FsError {
        match self.code().as_str() {
            "FileNotFound" => FsError::EntityNotFound,
            "FileExists" => FsError::AlreadyExists,
            "FileNotADirectory" => FsError::BaseNotDirectory,
            "FileIsADirectory" => FsError::NotAFile,
            "NoPermissions" => FsError::PermissionDenied,
            "Unavailable" => FsError::IOError,
            _ => FsError::UnknownError,
        }
    }
}
