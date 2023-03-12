use wasm_bindgen::prelude::*;
use wasmer_os::fs::UnionFileSystem;

#[wasm_bindgen]
pub struct WasiFS {

    fs: UnionFileSystem
}

impl WasiFS {
    pub fn new() -> Self {
        Self {
            fs: wasmer_os::fs::create_root_fs(None)
        }
    }
}