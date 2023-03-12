use super::uri::UriComponent;
use serde::{Deserialize, Serialize};
use serde_repr::{Deserialize_repr, Serialize_repr};
use wasm_bindgen::prelude::*;

/**
 * Enumeration of file change types.
 */
#[derive(Clone, PartialEq, Serialize_repr, Deserialize_repr)]
#[repr(u32)]

pub enum FileChangeType {
    /**
     * The contents or metadata of a file have changed.
     */
    Changed = 1,

    /**
     * A file has been created.
     */
    Created = 2,

    /**
     * A file has been deleted.
     */
    Deleted = 3,
}

#[derive(Clone, Serialize, Deserialize)]
pub struct FileChangeEvent {
    #[serde(rename = "type")]
    pub event_type: FileChangeType,

    pub uri: UriComponent,
}

#[wasm_bindgen(module = "/js/vscode.ts")]
extern "C" {
    #[wasm_bindgen(js_name = "createEventEmitter")]
    async fn create_event_emitter_internal() -> JsValue;
}

pub async fn create_event_emitter() -> FileChangeEventEmitter {
    FileChangeEventEmitter::from(create_event_emitter_internal().await)
}

#[wasm_bindgen(module = "vscode")]
extern "C" {
    #[wasm_bindgen(
        js_name = "EventEmitter",
        typescript_type = "vscode.EventEmitter<vscode.FileChangeEvent[]>"
    )]
    pub type FileChangeEventEmitter;

    #[wasm_bindgen(constructor, js_class = "EventEmitter")]
    pub fn new() -> FileChangeEventEmitter;

    #[wasm_bindgen(method, js_class = "EventEmitter")]
    pub fn fire(this: &FileChangeEventEmitter, events: JsValue);

    #[wasm_bindgen(typescript_type = "vscode.Event<vscode.FileChangeEvent[]>")]
    pub type VSCodeFileChangeEvent;

    #[wasm_bindgen(method, getter)]
    pub fn event(this: &FileChangeEventEmitter) -> VSCodeFileChangeEvent;
}
