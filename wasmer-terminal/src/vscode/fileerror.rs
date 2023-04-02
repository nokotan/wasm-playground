use wasm_bindgen::prelude::*;
use wasmer_os::wasmer_wasi::FsError;

#[wasm_bindgen(module = "/js/vscode.ts")]
extern "C" {
    #[wasm_bindgen]
    #[derive(Debug)]
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

impl From<FsError> for FileSystemError {
    fn from(value: FsError) -> Self {
        let error = get_file_system_error();
        let message = value.to_string();

        match value {
            FsError::EntityNotFound => error.FileNotFound(message),
            FsError::AlreadyExists => error.FileExists(message),
            FsError::NotAFile => error.FileIsADirectory(message),
            FsError::BaseNotDirectory => error.FileNotADirectory(message),
            FsError::PermissionDenied => error.NoPermissions(message),
            _ => error.Unavailable(message),
        }
    }
}

impl From<std::io::Error> for FileSystemError {
    fn from(value: std::io::Error) -> Self {
        let error = get_file_system_error();
        error.Unavailable(value.to_string())
    }
}
