use std::sync::Arc;
use tokio::sync::mpsc;
#[allow(unused_imports, dead_code)]
use tracing::{debug, error, info, trace, warn};
use wasm_bindgen::prelude::*;
use wasm_bindgen::JsCast;
use wasmer_os::api::*;
use wasmer_os::bin_factory::CachedCompiledModules;
use wasmer_os::common::MAX_MPSC;
use wasmer_os::console::Console;

use crate::fs::WasiFS;
use crate::system::TerminalCommand;
use crate::system::WebConsole;
use crate::system::WebSystem;
use crate::terminal::Terminal;

use super::common::*;
use super::pool::*;

#[macro_export]
#[doc(hidden)]
macro_rules! csi {
    ($( $l:expr ),*) => { concat!("\x1B[", $( $l ),*) };
}

#[wasm_bindgen(start)]
pub fn main() {
    //let _ = console_log::init_with_level(log::Level::Debug);
    set_panic_hook();

    //ate::log_init(0i32, false);
    tracing_wasm::set_as_global_default_with_config(
        tracing_wasm::WASMLayerConfigBuilder::new()
            .set_report_logs_in_timings(false)
            .set_max_level(tracing::Level::TRACE)
            .build(),
    );

    let pool = WebThreadPool::new_with_max_threads().unwrap();
    let web_system = WebSystem::new(pool.clone());
    wasmer_os::api::set_system_abi(web_system);
}

#[derive(Debug)]
pub enum InputEvent {
    Data(String),
}

#[wasm_bindgen]
pub unsafe fn open(terminal: Terminal, fs: WasiFS, location: String) -> Result<(), JsValue> {
    #[wasm_bindgen]
    extern "C" {
        #[wasm_bindgen(js_namespace = navigator, js_name = userAgent)]
        static USER_AGENT: String;
    }

    info!("glue::start");

    let (term_tx, mut term_rx) = mpsc::channel(MAX_MPSC);
    {
        let terminal: Terminal = terminal.clone().dyn_into().unwrap();
        wasm_bindgen_futures::spawn_local(async move {
            while let Some(cmd) = term_rx.recv().await {
                match cmd {
                    TerminalCommand::Print(text) => {
                        terminal.write(text.as_str());
                    }
                    TerminalCommand::ConsoleRect(tx) => {
                        let _ = tx
                            .send(ConsoleRect {
                                cols: terminal.get_cols(),
                                rows: terminal.get_rows(),
                            })
                            .await;
                    }
                    TerminalCommand::Cls => {
                        terminal.clear();
                    }
                }
            }
        });
    }

    let web_console = WebConsole::new(term_tx);
    let system = System::default();
    let compiled_modules = Arc::new(CachedCompiledModules::new(None));
    let fs = fs.fs.as_ref().read().expect("cannot read");

    let mut console = Console::new(
        location,
        "".to_string(),
        wasmer_os::eval::Compiler::Browser,
        Arc::new(web_console),
        None,
        fs.clone(),
        compiled_modules,
    );
    let tty = console.tty().clone();

    let (tx, mut rx) = mpsc::channel(MAX_MPSC);

    let tx_data = tx.clone();
    let callback = {
        Closure::wrap(Box::new(move |data: String| {
            tx_data.blocking_send(InputEvent::Data(data)).unwrap();
        }) as Box<dyn FnMut(_)>)
    };
    terminal.on_data(callback.as_ref().unchecked_ref());
    callback.forget();

    {
        let term: Terminal = terminal.clone().dyn_into().unwrap();
        let closure = {
            Closure::wrap(Box::new(move || {
                let terminal: Terminal = term.clone().dyn_into().unwrap();

                let tty = tty.clone();
                system.fork_local(async move {
                    let cols = terminal.get_cols();
                    let rows = terminal.get_rows();
                    tty.set_bounds(cols, rows).await;
                });
            }) as Box<dyn FnMut()>)
        };
        terminal.on_dimension_changed(closure.as_ref().unchecked_ref());
        closure.forget();
    }

    // hook the stdin to a TTY (which will have access to the terminal object)
    system.fork_local(async move {
        console.init().await;

        while let Some(event) = rx.recv().await {
            match event {
                InputEvent::Data(data) => {
                    console.on_data(data).await;
                }
            }
        }
    });

    Ok(())
}
