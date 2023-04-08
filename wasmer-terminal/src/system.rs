use async_trait::async_trait;
use bytes::Bytes;
use js_sys::Promise;
use std::future::Future;
use std::pin::Pin;
use tokio::sync::mpsc;
#[allow(unused_imports, dead_code)]
use tracing::{debug, error, info, trace, warn};
use wasm_bindgen::prelude::*;
use wasm_bindgen_futures::*;
use wasmer_os::api::abi::SystemAbi;
use wasmer_os::wasmer::Module;
use wasmer_os::wasmer::Store;
use wasmer_os::wasmer::VMMemory;
use wasmer_os::wasmer_wasi::WasiThreadError;
use web_sys::WebGl2RenderingContext;

use super::common::*;
use super::pool::WebThreadPool;
use super::ws::WebSocket;
use wasmer_os::api::*;

pub(crate) enum TerminalCommand {
    Print(String),
    ConsoleRect(mpsc::Sender<ConsoleRect>),
    Cls,
}

pub(crate) struct WebSystem {
    pool: WebThreadPool,
}

impl WebSystem {
    pub(crate) fn new(pool: WebThreadPool) -> WebSystem {
        WebSystem { pool }
    }
}

#[async_trait]
impl SystemAbi for WebSystem {
    fn task_shared(
        &self,
        task: Box<
            dyn FnOnce() -> Pin<Box<dyn Future<Output = ()> + Send + 'static>> + Send + 'static,
        >,
    ) {
        self.pool.spawn_shared(Box::new(move || {
            Box::pin(async move {
                let fut = task();
                fut.await;
            })
        }));
    }

    fn task_wasm(
        &self,
        task: Box<
            dyn FnOnce(
                    Store,
                    Option<Module>,
                    Option<VMMemory>,
                ) -> Pin<Box<dyn Future<Output = ()> + 'static>>
                + Send
                + 'static,
        >,
        store: Store,
        module: Option<Module>,
        spawn_type: SpawnType,
    ) -> Result<(), WasiThreadError> {
        let run = move |store, module, memory| task(store, Some(module), memory);
        let module_bytes = module.map_or(Vec::new(), |module| module.serialize().unwrap());
        self.pool
            .spawn_wasm(run, store, Bytes::from(module_bytes), spawn_type)
    }

    fn task_dedicated(&self, task: Box<dyn FnOnce() + Send + 'static>) {
        self.pool.spawn_dedicated(task);
    }

    fn task_dedicated_async(
        &self,
        task: Box<dyn FnOnce() -> Pin<Box<dyn Future<Output = ()> + 'static>> + Send + 'static>,
    ) {
        self.pool.spawn_dedicated_async(task);
    }

    fn task_local(&self, task: Pin<Box<dyn Future<Output = ()> + 'static>>) {
        wasm_bindgen_futures::spawn_local(async move {
            task.await;
        });
    }

    fn sleep(&self, ms: u128) -> AsyncResult<()> {
        let ms = ms as i32;
        let (tx, rx) = mpsc::channel(1);
        self.pool.spawn_shared(Box::new(move || {
            Box::pin(async move {
                let promise = sleep(ms);
                let js_fut = JsFuture::from(promise);

                let _ = js_fut.await;
                let _ = tx.send(()).await;
            })
        }));
        AsyncResult::new(SerializationFormat::Json, rx)
    }

    fn fetch_file(&self, path: &str) -> AsyncResult<Result<Vec<u8>, u32>> {
        let url = path.to_string();
        let headers = vec![("Accept".to_string(), "application/wasm".to_string())];

        let (tx, rx) = mpsc::channel(1);
        self.pool.spawn_shared(Box::new(move || {
            Box::pin(async move {
                let ret =
                    crate::common::fetch_data(url.as_str(), "GET", false, None, headers, None)
                        .await;
                let _ = tx.send(ret).await;
            })
        }));
        AsyncResult::new(SerializationFormat::Bincode, rx)
    }

    fn reqwest(
        &self,
        url: &str,
        method: &str,
        options: ReqwestOptions,
        headers: Vec<(String, String)>,
        data: Option<Vec<u8>>,
    ) -> AsyncResult<Result<ReqwestResponse, u32>> {
        let url = url.to_string();
        let method = method.to_string();

        let (tx, rx) = mpsc::channel(1);
        self.pool.spawn_shared(Box::new(move || {
            Box::pin(async move {
                let resp = match crate::common::fetch(
                    url.as_str(),
                    method.as_str(),
                    options.gzip,
                    options.cors_proxy,
                    headers,
                    data,
                )
                .await
                {
                    Ok(a) => a,
                    Err(err) => {
                        let _ = tx.send(Err(err)).await;
                        return;
                    }
                };

                let ok = resp.ok();
                let redirected = resp.redirected();
                let status = resp.status();
                let status_text = resp.status_text();

                let data = match crate::common::get_response_data(resp).await {
                    Ok(a) => a,
                    Err(err) => {
                        let _ = tx.send(Err(err)).await;
                        return;
                    }
                };

                let headers = Vec::new();
                // we can't implement this as the method resp.headers().keys() is missing!
                // how else are we going to parse the headers

                debug!("received {} bytes", data.len());
                let resp = ReqwestResponse {
                    pos: 0,
                    ok,
                    redirected,
                    status,
                    status_text,
                    headers,
                    data: Some(data),
                };
                debug!("response status {}", status);

                let _ = tx.send(Ok(resp)).await;
            })
        }));
        AsyncResult::new(SerializationFormat::Bincode, rx)
    }

    async fn web_socket(&self, url: &str) -> Result<Box<dyn WebSocketAbi>, String> {
        WebSocket::new(url)
    }

    /// Open the WebGL
    async fn webgl(&self) -> Option<Box<dyn WebGlAbi>> {
        None
    }
}

pub(crate) struct WebConsole {
    term_tx: mpsc::Sender<TerminalCommand>,
}

impl WebConsole {
    pub(crate) fn new(term_tx: mpsc::Sender<TerminalCommand>) -> WebConsole {
        WebConsole { term_tx }
    }
}

#[async_trait]
impl ConsoleAbi for WebConsole {
    async fn stdout(&self, data: Vec<u8>) {
        if let Ok(text) = String::from_utf8(data) {
            let _ = self.term_tx.send(TerminalCommand::Print(text)).await;
        }
    }

    async fn stderr(&self, data: Vec<u8>) {
        if let Ok(text) = String::from_utf8(data) {
            let _ = self.term_tx.send(TerminalCommand::Print(text)).await;
        }
    }

    async fn flush(&self) {}

    async fn log(&self, text: String) {
        console::log(text.as_str());
    }

    async fn console_rect(&self) -> ConsoleRect {
        let (ret_tx, mut ret_rx) = mpsc::channel(1);
        let _ = self
            .term_tx
            .send(TerminalCommand::ConsoleRect(ret_tx))
            .await;
        ret_rx.recv().await.unwrap()
    }

    async fn cls(&self) {
        let _ = self.term_tx.send(TerminalCommand::Cls).await;
    }

    async fn exit(&self) {
        // Web terminals can not exit as they have nowhere to go!
    }
}

#[wasm_bindgen(module = "/js/time.ts")]
extern "C" {
    #[wasm_bindgen(js_name = "sleep")]
    pub fn sleep(ms: i32) -> Promise;
}
