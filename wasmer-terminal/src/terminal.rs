use wasm_bindgen::prelude::*;
use js_sys::Function;

#[wasm_bindgen(module = "/js/terminal.ts")]
extern "C" {

    #[wasm_bindgen(js_name = "WasmPseudoTerminal")]
    pub type Terminal;

    #[wasm_bindgen(method)]
    pub fn write(this: &Terminal, text: &str);

    #[wasm_bindgen(method)]
    pub fn clear(this: &Terminal);

    #[wasm_bindgen(method, js_name = "onData")]
    pub fn on_data(
        this: &Terminal,
        f: &Function, // Event<&str>
    );

    #[wasm_bindgen(method, js_name = "onDimensionChanged")]
    pub fn on_dimension_changed(
        this: &Terminal,
        f: &Function, // Event<&str>
    );

    #[wasm_bindgen(method, getter, js_name = "rows")]
    pub fn get_rows(this: &Terminal) -> u32;

    #[wasm_bindgen(method, getter, js_name = "cols")]
    pub fn get_cols(this: &Terminal) -> u32;
}