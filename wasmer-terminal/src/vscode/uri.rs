use serde::{Deserialize, Serialize};
use wasm_bindgen::prelude::*;
use wasm_bindgen::JsValue;

#[derive(Clone, Serialize, Deserialize)]
pub struct UriComponent {
    pub scheme: String,

    pub authority: Option<String>,

    pub path: Option<String>,

    pub query: Option<String>,

    pub fragment: Option<String>,
}

impl Into<JsValue> for UriComponent {
    fn into(self) -> JsValue {
        serde_wasm_bindgen::to_value(&self).unwrap()
    }
}

impl From<Uri> for UriComponent {
    fn from(uri: Uri) -> UriComponent {
        serde_wasm_bindgen::from_value(uri.into()).unwrap()
    }
}

#[wasm_bindgen(module = "vscode")]
extern "C" {
    #[wasm_bindgen(typescript_type = "vscode.Uri")]
    pub type Uri;

    #[wasm_bindgen(method, getter)]
    pub fn scheme(this: &Uri) -> String;

    #[wasm_bindgen(method, getter)]
    pub fn authority(this: &Uri) -> String;

    #[wasm_bindgen(method, getter)]
    pub fn path(this: &Uri) -> String;

    #[wasm_bindgen(method, getter)]
    pub fn query(this: &Uri) -> String;

    #[wasm_bindgen(method, getter)]
    pub fn fragment(this: &Uri) -> String;

    #[wasm_bindgen(static_method_of = Uri)]
    pub fn parse(value: String) -> Uri;

    #[wasm_bindgen(static_method_of = Uri)]
    pub fn from(value: JsValue) -> Uri;
}
