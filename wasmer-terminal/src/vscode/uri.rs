use std::path::Path;

use serde::{Deserialize, Serialize};
use url::Url;
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

impl UriComponent {
    pub fn parse(uri: &str) -> Self {
        let url = Url::parse(uri).unwrap();

        Self {
            scheme: url.scheme().to_string(),
            authority: url.domain().map(|s| s.to_string()),
            path: Some(url.path().to_string()),
            query: url.query().map(|s| s.to_string()),
            fragment: url.fragment().map(|s| s.to_string()),
        }
    }

    pub fn file(path: &Path) -> Self {
        Self {
            scheme: "file".to_string(),
            authority: None,
            path: Some(path.to_string_lossy().to_string()),
            query: None,
            fragment: None,
        }
    }

    pub fn with_path(&self, path: &Path) -> Self {
        let mut uri = self.clone();
        uri.path = Some(path.to_string_lossy().to_string());
        uri
    }

    pub fn join_path(&self, path: &Path) -> Self {
        let mut uri = self.clone();
        uri.path = self
            .path
            .as_ref()
            .map(|s| s.to_owned() + &path.to_string_lossy());
        uri
    }
}

impl From<Uri> for UriComponent {
    fn from(uri: Uri) -> UriComponent {
        serde_wasm_bindgen::from_value(uri.into()).unwrap()
    }
}

impl Into<Uri> for UriComponent {
    fn into(self) -> Uri {
        serde_wasm_bindgen::to_value(&self).unwrap().into()
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
