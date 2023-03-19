"use strict";
const config = {
    additionalBuiltinExtensions: [
        {
            scheme: "https",
            authority: "wasm-playground.kamenokosoft.com/dev",
            path: "/addon/wasm-playground/extension"
        },
        {
            scheme: "https",
            authority: "wasm-playground.kamenokosoft.com/dev",
            path: "/addon/emscripten-remote-build/extension"
        },
        {
            scheme: "https",
            authority: "wasm-playground.kamenokosoft.com/dev",
            path: "/addon/gistpad/extension"
        },
        {
            scheme: "https",
            authority: "wasm-playground.kamenokosoft.com/dev",
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
        }
    },
    codeExchangeProxyEndpoints: {
        github: "https://exchange-code.herokuapp.com/github/"
    }
};
const configElement = document.querySelector("#vscode-workbench-web-configuration");
configElement?.setAttribute("data-settings", JSON.stringify(config));
