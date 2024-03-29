const config = {
    additionalBuiltinExtensions: [	
        { 
            scheme: "https",
            authority: "wasm-playground.kamenokosoft.com",
            path: "/addon/wasm-playground/extension"
        },
        {
            scheme: "https",
            authority: "wasm-playground.kamenokosoft.com",
            path: "/addon/emscripten-remote-build/extension"
        },	
        { 
            scheme: "https",
            authority: "wasm-playground.kamenokosoft.com",
            path: "/addon/gistpad/extension"
        },
        { 
            scheme: "https",
            authority: "wasm-playground.kamenokosoft.com",
            path: "/addon/vscode-clangd/extension"
        },
        { 
            scheme: "https",
            authority: "wasm-playground.kamenokosoft.com",
            path: "/addon/wasmer-terminal/extension"
        }
    ],
    callbackRoute: "callback",
    configurationDefaults: {
        "workbench.startupEditor": "none",
        "extensions.ignoreRecommendations": true,
        "editor.fontFamily": "Menlo, Monaco, \"Courier New\", Meiryo, monospace"
    },
    productConfiguration: {
        extensionsGallery: {
            serviceUrl: "https://open-vsx.org/vscode/gallery",
            itemUrl: "https://open-vsx.org/vscode/item"
        },
        extensionEnabledApiProposals: {
            "kamenokosoft.wasm-playground": [
                "fileSearchProvider",
                "textSearchProvider"
            ]
        },
        webEndpointUrlTemplate: "https://wasm-playground.kamenokosoft.com",
    },
    codeExchangeProxyEndpoints: {
        github: "https://exchange-code.herokuapp.com/github/"
    }
};
const configElement = document.querySelector("#vscode-workbench-web-configuration");
configElement?.setAttribute("data-settings", JSON.stringify(config));