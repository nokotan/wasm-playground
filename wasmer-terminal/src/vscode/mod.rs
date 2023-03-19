pub mod fileerror;
pub mod fileevent;
pub mod filesystem;
pub mod stat;
pub mod uri;

use js_sys::Function;
use wasm_bindgen::prelude::*;

pub use filesystem::*;

#[wasm_bindgen(typescript_custom_section)]
const TS_APPEND_CONTENT: &'static str = r#"
import * as vscode from "vscode";
"#;

#[wasm_bindgen(module = "/js/vscode.ts")]
extern "C" {
    #[wasm_bindgen(js_name = "createDisposable")]
    fn create_disposable_internal(f: &Function) -> JsValue;
}

pub fn create_disposable(f: &Function) -> Disposable {
    Disposable::from(create_disposable_internal(f))
}

#[wasm_bindgen(module = "vscode")]
extern "C" {
    #[wasm_bindgen(typescript_type = "vscode.Disposable")]
    pub type Disposable;

    #[wasm_bindgen(constructor)]
    pub fn new(f: &Function) -> Disposable;
}
