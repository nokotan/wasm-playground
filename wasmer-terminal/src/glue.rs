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

use crate::system::TerminalCommand;
use crate::system::WebConsole;
use crate::system::WebSystem;
use crate::terminal::Terminal;
use crate::vscode::uri::Uri;
use crate::vscode::uri::UriComponent;
use crate::wasifs::WasiFS;

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
    let web_system = WebSystem::new(pool);
    wasmer_os::api::set_system_abi(web_system);
}

#[derive(Debug)]
pub enum InputEvent {
    Data(String),
    Exit,
}

#[wasm_bindgen]
pub struct TerminalSession {
    console_tx: mpsc::Sender<TerminalCommand>,

    on_input_callback: Closure<dyn FnMut (String)>,
    input_tx: mpsc::Sender<InputEvent>,

    on_dimension_change: Closure<dyn FnMut ()>,
}

impl Drop for TerminalSession {
    fn drop(&mut self) {
        self.console_tx.blocking_send(TerminalCommand::Exit);
        self.input_tx.blocking_send(InputEvent::Exit);
    }
}

#[wasm_bindgen]
pub fn open(
    terminal: Terminal,
    fs: WasiFS,
    location: String,
    pwd: Option<Uri>,
) -> Result<TerminalSession, JsValue> {
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
                    TerminalCommand::Exit => {
                        terminal.on_close(0);
                        break;
                    }
                }
            }
        });
    }

    let web_console = WebConsole::new(term_tx.clone());
    let system = System::default();
    let compiled_modules = Arc::new(CachedCompiledModules::new(None));
  
    let mut console = Console::new(
        location + "?no_welcome",
        "".to_string(),
        wasmer_os::eval::Compiler::Browser,
        Arc::new(web_console),
        None,
        fs.fs.as_ref().try_read().expect("cannot read").clone(),
        compiled_modules,
    );

    if let Some(pwd) = pwd {
        let pwd = UriComponent::from(pwd);
        console.set_current_dir(&pwd.path.unwrap());
    }

    console.set_env("PYTHONHOME", "/");

    console.add_preopen_dir("/bin");
    console.add_preopen_dir("/lib");
    console.add_preopen_dir("/mnt");

    let tty = console.tty().clone();

    let (tx, mut rx) = mpsc::channel(MAX_MPSC);

    let tx_data = tx.clone();
    let callback = {
        Closure::wrap(Box::new(move |data: String| {
            tx_data.blocking_send(InputEvent::Data(data)).unwrap();
        }) as Box<dyn FnMut(_)>)
    };
    terminal.on_data(callback.as_ref().unchecked_ref());

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

    // hook the stdin to a TTY (which will have access to the terminal object)
    system.fork_local(async move {
        console.init().await;

        while let Some(event) = rx.recv().await {
            match event {
                InputEvent::Data(data) => {
                    console.on_data(data).await;
                },
                InputEvent::Exit => {
                    break;
                }
            }
        }
    });

    Ok(TerminalSession {
        on_dimension_change: closure,
        on_input_callback: callback,
        input_tx: tx,
        console_tx: term_tx,
    })
}
