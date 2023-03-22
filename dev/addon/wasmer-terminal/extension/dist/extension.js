/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ 235:
/***/ (() => {



/***/ }),

/***/ 496:
/***/ ((module) => {

"use strict";
module.exports = require("vscode");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat get default export */
/******/ 	(() => {
/******/ 		// getDefaultExport function for compatibility with non-harmony modules
/******/ 		__webpack_require__.n = (module) => {
/******/ 			var getter = module && module.__esModule ?
/******/ 				() => (module['default']) :
/******/ 				() => (module);
/******/ 			__webpack_require__.d(getter, { a: getter });
/******/ 			return getter;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/create fake namespace object */
/******/ 	(() => {
/******/ 		var getProto = Object.getPrototypeOf ? (obj) => (Object.getPrototypeOf(obj)) : (obj) => (obj.__proto__);
/******/ 		var leafPrototypes;
/******/ 		// create a fake namespace object
/******/ 		// mode & 1: value is a module id, require it
/******/ 		// mode & 2: merge all properties of value into the ns
/******/ 		// mode & 4: return value when already ns object
/******/ 		// mode & 16: return value when it's Promise-like
/******/ 		// mode & 8|1: behave like require
/******/ 		__webpack_require__.t = function(value, mode) {
/******/ 			if(mode & 1) value = this(value);
/******/ 			if(mode & 8) return value;
/******/ 			if(typeof value === 'object' && value) {
/******/ 				if((mode & 4) && value.__esModule) return value;
/******/ 				if((mode & 16) && typeof value.then === 'function') return value;
/******/ 			}
/******/ 			var ns = Object.create(null);
/******/ 			__webpack_require__.r(ns);
/******/ 			var def = {};
/******/ 			leafPrototypes = leafPrototypes || [null, getProto({}), getProto([]), getProto(getProto)];
/******/ 			for(var current = mode & 2 && value; typeof current == 'object' && !~leafPrototypes.indexOf(current); current = getProto(current)) {
/******/ 				Object.getOwnPropertyNames(current).forEach((key) => (def[key] = () => (value[key])));
/******/ 			}
/******/ 			def['default'] = () => (value);
/******/ 			__webpack_require__.d(ns, def);
/******/ 			return ns;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/global */
/******/ 	(() => {
/******/ 		__webpack_require__.g = (function() {
/******/ 			if (typeof globalThis === 'object') return globalThis;
/******/ 			try {
/******/ 				return this || new Function('return this')();
/******/ 			} catch (e) {
/******/ 				if (typeof window === 'object') return window;
/******/ 			}
/******/ 		})();
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/publicPath */
/******/ 	(() => {
/******/ 		var scriptUrl;
/******/ 		if (__webpack_require__.g.importScripts) scriptUrl = __webpack_require__.g.location + "";
/******/ 		var document = __webpack_require__.g.document;
/******/ 		if (!scriptUrl && document) {
/******/ 			if (document.currentScript)
/******/ 				scriptUrl = document.currentScript.src
/******/ 			if (!scriptUrl) {
/******/ 				var scripts = document.getElementsByTagName("script");
/******/ 				if(scripts.length) scriptUrl = scripts[scripts.length - 1].src
/******/ 			}
/******/ 		}
/******/ 		// When supporting browsers where an automatic publicPath is not supported you must specify an output.publicPath manually via configuration
/******/ 		// or pass an empty string ("") and set the __webpack_public_path__ variable from your code to use your own logic.
/******/ 		if (!scriptUrl) throw new Error("Automatic publicPath is not supported in this browser");
/******/ 		scriptUrl = scriptUrl.replace(/#.*$/, "").replace(/\?.*$/, "").replace(/\/[^\/]+$/, "/");
/******/ 		__webpack_require__.p = scriptUrl;
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be in strict mode.
(() => {
"use strict";
// ESM COMPAT FLAG
__webpack_require__.r(__webpack_exports__);

// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  "activate": () => (/* binding */ activate)
});

// EXTERNAL MODULE: external "vscode"
var external_vscode_ = __webpack_require__(496);
// EXTERNAL MODULE: ./pkg/index.js
var pkg = __webpack_require__(235);
var pkg_default = /*#__PURE__*/__webpack_require__.n(pkg);
;// CONCATENATED MODULE: ./js/vscode.ts
let code;
async function importVSCode() {
    return code || (code = await Promise.resolve(/* import() */).then(__webpack_require__.t.bind(__webpack_require__, 496, 23)));
}
function getWorkspaceFs() {
    return code?.workspace.fs;
}
async function createEventEmitter() {
    const code = await importVSCode();
    return new code.EventEmitter();
}
function createDisposable(callback) {
    return code && new code.Disposable(callback);
}
function getFileSystemError() {
    return code?.FileSystemError;
}

;// CONCATENATED MODULE: ./js/terminal.ts


class WasmPseudoTerminal {
    constructor(fs, writeEmitter, closeEmitter, location) {
        this.fs = fs;
        this.writeEmitter = writeEmitter;
        this.closeEmitter = closeEmitter;
        this.location = location;
        this.onDidWrite = this.writeEmitter.event;
        this.onDidClose = this.closeEmitter.event;
    }
    static async createWasmPseudoTerminal(fs, location) {
        const vscode = await importVSCode();
        return new WasmPseudoTerminal(fs, new vscode.EventEmitter(), new vscode.EventEmitter(), location);
    }
    async open(initialDimensions) {
        if (initialDimensions) {
            this.m_rows = initialDimensions.rows;
            this.m_cols = initialDimensions.columns;
        }
        (0,pkg.open)(this, this.fs, this.location);
    }
    close() {
    }
    write(data) {
        this.writeEmitter.fire(data);
    }
    handleInput(data) {
        this.onDataCallback?.call(this, data);
    }
    onData(callback) {
        this.onDataCallback = callback;
    }
    setDimensions(dimensions) {
        this.m_rows = dimensions.rows;
        this.m_cols = dimensions.columns;
        this.onDimensionChangedCallback?.call(this, dimensions);
    }
    onDimensionChanged(callback) {
        this.onDimensionChangedCallback = callback;
    }
    get rows() {
        return this.m_rows;
    }
    get cols() {
        return this.m_cols;
    }
}

;// CONCATENATED MODULE: ./js/index.ts



async function activate(context) {
    __webpack_require__.p = decodeURIComponent(context.extensionUri.toString() + "/dist/");
    await pkg_default()();
    const fs = await pkg.WasiFS["new"]();
    external_vscode_.workspace.registerFileSystemProvider("wasmfs", fs, { isCaseSensitive: true });
    fs.createDirectory(external_vscode_.Uri.parse("wasmfs:/mnt"));
    if (external_vscode_.workspace.workspaceFolders) {
        for (const added of external_vscode_.workspace.workspaceFolders) {
            console.log(`mount /mnt/${added.index}`);
            fs.createDirectory(external_vscode_.Uri.parse(`wasmfs:/mnt/${added.index}`));
            fs.mount(added.uri, "/mnt/" + added.index);
        }
    }
    external_vscode_.workspace.onDidChangeWorkspaceFolders(e => {
        for (const added of e.added) {
            console.log(`mount /mnt/${added.index}`);
            fs.createDirectory(external_vscode_.Uri.parse(`wasmfs:/mnt/${added.index}`));
            fs.mount(added.uri, "/mnt/" + added.index);
        }
        for (const removed of e.removed) {
            console.log(`unmount /mnt/${removed.index}`);
            fs.unmount("/mnt" + removed.index);
            fs.delete(external_vscode_.Uri.parse(`wasmfs:/mnt/${removed.index}`));
        }
    });
    external_vscode_.window.registerTerminalProfileProvider('wasmer-term.terminal', {
        provideTerminalProfile(token) {
            return (async () => new external_vscode_.TerminalProfile({
                name: "wasm terminal",
                pty: await WasmPseudoTerminal.createWasmPseudoTerminal(fs.clone(), __webpack_require__.p)
            }))();
        }
    });
    context.subscriptions.push(external_vscode_.commands.registerCommand("wasmer-term.openTerminal", async function () {
        const terminal = external_vscode_.window.createTerminal({
            name: "wasm terminal",
            pty: await WasmPseudoTerminal.createWasmPseudoTerminal(fs.clone(), __webpack_require__.p)
        });
        terminal.show();
    }));
}

})();

module.exports = __webpack_exports__;
/******/ })()
;
//# sourceMappingURL=extension.js.map