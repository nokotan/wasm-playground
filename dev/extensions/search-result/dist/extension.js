(()=>{"use strict";var e={23:e=>{function t(e){if("string"!=typeof e)throw new TypeError("Path must be a string. Received "+JSON.stringify(e))}function n(e,t){for(var n,r="",i=0,o=-1,a=0,l=0;l<=e.length;++l){if(l<e.length)n=e.charCodeAt(l);else{if(47===n)break;n=47}if(47===n){if(o===l-1||1===a);else if(o!==l-1&&2===a){if(r.length<2||2!==i||46!==r.charCodeAt(r.length-1)||46!==r.charCodeAt(r.length-2))if(r.length>2){var s=r.lastIndexOf("/");if(s!==r.length-1){-1===s?(r="",i=0):i=(r=r.slice(0,s)).length-1-r.lastIndexOf("/"),o=l,a=0;continue}}else if(2===r.length||1===r.length){r="",i=0,o=l,a=0;continue}t&&(r.length>0?r+="/..":r="..",i=2)}else r.length>0?r+="/"+e.slice(o+1,l):r=e.slice(o+1,l),i=l-o-1;o=l,a=0}else 46===n&&-1!==a?++a:a=-1}return r}var r={resolve:function(){for(var e,r="",i=!1,o=arguments.length-1;o>=-1&&!i;o--){var a;o>=0?a=arguments[o]:(void 0===e&&(e=process.cwd()),a=e),t(a),0!==a.length&&(r=a+"/"+r,i=47===a.charCodeAt(0))}return r=n(r,!i),i?r.length>0?"/"+r:"/":r.length>0?r:"."},normalize:function(e){if(t(e),0===e.length)return".";var r=47===e.charCodeAt(0),i=47===e.charCodeAt(e.length-1);return 0!==(e=n(e,!r)).length||r||(e="."),e.length>0&&i&&(e+="/"),r?"/"+e:e},isAbsolute:function(e){return t(e),e.length>0&&47===e.charCodeAt(0)},join:function(){if(0===arguments.length)return".";for(var e,n=0;n<arguments.length;++n){var i=arguments[n];t(i),i.length>0&&(void 0===e?e=i:e+="/"+i)}return void 0===e?".":r.normalize(e)},relative:function(e,n){if(t(e),t(n),e===n)return"";if((e=r.resolve(e))===(n=r.resolve(n)))return"";for(var i=1;i<e.length&&47===e.charCodeAt(i);++i);for(var o=e.length,a=o-i,l=1;l<n.length&&47===n.charCodeAt(l);++l);for(var s=n.length-l,c=a<s?a:s,g=-1,u=0;u<=c;++u){if(u===c){if(s>c){if(47===n.charCodeAt(l+u))return n.slice(l+u+1);if(0===u)return n.slice(l+u)}else a>c&&(47===e.charCodeAt(i+u)?g=u:0===u&&(g=0));break}var f=e.charCodeAt(i+u);if(f!==n.charCodeAt(l+u))break;47===f&&(g=u)}var h="";for(u=i+g+1;u<=o;++u)u!==o&&47!==e.charCodeAt(u)||(0===h.length?h+="..":h+="/..");return h.length>0?h+n.slice(l+g):(l+=g,47===n.charCodeAt(l)&&++l,n.slice(l))},_makeLong:function(e){return e},dirname:function(e){if(t(e),0===e.length)return".";for(var n=e.charCodeAt(0),r=47===n,i=-1,o=!0,a=e.length-1;a>=1;--a)if(47===(n=e.charCodeAt(a))){if(!o){i=a;break}}else o=!1;return-1===i?r?"/":".":r&&1===i?"//":e.slice(0,i)},basename:function(e,n){if(void 0!==n&&"string"!=typeof n)throw new TypeError('"ext" argument must be a string');t(e);var r,i=0,o=-1,a=!0;if(void 0!==n&&n.length>0&&n.length<=e.length){if(n.length===e.length&&n===e)return"";var l=n.length-1,s=-1;for(r=e.length-1;r>=0;--r){var c=e.charCodeAt(r);if(47===c){if(!a){i=r+1;break}}else-1===s&&(a=!1,s=r+1),l>=0&&(c===n.charCodeAt(l)?-1==--l&&(o=r):(l=-1,o=s))}return i===o?o=s:-1===o&&(o=e.length),e.slice(i,o)}for(r=e.length-1;r>=0;--r)if(47===e.charCodeAt(r)){if(!a){i=r+1;break}}else-1===o&&(a=!1,o=r+1);return-1===o?"":e.slice(i,o)},extname:function(e){t(e);for(var n=-1,r=0,i=-1,o=!0,a=0,l=e.length-1;l>=0;--l){var s=e.charCodeAt(l);if(47!==s)-1===i&&(o=!1,i=l+1),46===s?-1===n?n=l:1!==a&&(a=1):-1!==n&&(a=-1);else if(!o){r=l+1;break}}return-1===n||-1===i||0===a||1===a&&n===i-1&&n===r+1?"":e.slice(n,i)},format:function(e){if(null===e||"object"!=typeof e)throw new TypeError('The "pathObject" argument must be of type Object. Received type '+typeof e);return function(e,t){var n=t.dir||t.root,r=t.base||(t.name||"")+(t.ext||"");return n?n===t.root?n+r:n+"/"+r:r}(0,e)},parse:function(e){t(e);var n={root:"",dir:"",base:"",ext:"",name:""};if(0===e.length)return n;var r,i=e.charCodeAt(0),o=47===i;o?(n.root="/",r=1):r=0;for(var a=-1,l=0,s=-1,c=!0,g=e.length-1,u=0;g>=r;--g)if(47!==(i=e.charCodeAt(g)))-1===s&&(c=!1,s=g+1),46===i?-1===a?a=g:1!==u&&(u=1):-1!==a&&(u=-1);else if(!c){l=g+1;break}return-1===a||-1===s||0===u||1===u&&a===s-1&&a===l+1?-1!==s&&(n.base=n.name=0===l&&o?e.slice(1,s):e.slice(l,s)):(0===l&&o?(n.name=e.slice(1,a),n.base=e.slice(1,s)):(n.name=e.slice(l,a),n.base=e.slice(l,s)),n.ext=e.slice(a,s)),l>0?n.dir=e.slice(0,l-1):o&&(n.dir="/"),n},sep:"/",delimiter:":",win32:null,posix:null};r.posix=r,e.exports=r},549:e=>{e.exports=require("vscode")}},t={};function n(r){var i=t[r];if(void 0!==i)return i.exports;var o=t[r]={exports:{}};return e[r](o,o.exports,n),o.exports}var r={};(()=>{var e=r;Object.defineProperty(e,"__esModule",{value:!0}),e.activate=void 0;const t=n(549),i=n(23),o=/^(\S.*):$/,a=/^(\s+)(\d+)(: |  )(\s*)(.*)$/,l=/⟪ ([0-9]+) characters skipped ⟫/g,s={language:"search-result",exclusive:!0},c=["# Query:","# Flags:","# Including:","# Excluding:","# ContextLines:"],g=["RegExp","CaseSensitive","IgnoreExcludeSettings","WordMatch"];let u,f;function h(e,n){const r="(Settings) ";if(e.startsWith(r))return t.Uri.file(e.slice(r.length)).with({scheme:"vscode-userdata"});if(i.isAbsolute(e))return/^[\\\/]Untitled-\d*$/.test(e)?t.Uri.file(e.slice(1)).with({scheme:"untitled",path:e.slice(1)}):t.Uri.file(e);if(0===e.indexOf("~/")){const n={}.HOME||{}.HOMEPATH||"";return t.Uri.file(i.join(n,e.slice(2)))}const o=(e,n)=>t.Uri.joinPath(e.uri,n);if(t.workspace.workspaceFolders){const r=/^(.*) • (.*)$/.exec(e);if(r){const[,e,n]=r,i=t.workspace.workspaceFolders.filter((t=>t.name===e))[0];if(i)return o(i,n)}else{if(1===t.workspace.workspaceFolders.length)return o(t.workspace.workspaceFolders[0],e);if("untitled"!==n.scheme){const r=t.workspace.workspaceFolders.filter((e=>n.toString().startsWith(e.uri.toString())))[0];if(r)return o(r,e)}}}console.error(`Unable to resolve path ${e}`)}e.activate=function(e){const n=t.window.createTextEditorDecorationType({opacity:"0.7"}),r=t.window.createTextEditorDecorationType({fontWeight:"bold"}),i=e=>{const t=v(e.document).filter(p),i=t.filter((e=>e.isContext)).map((e=>e.prefixRange)),o=t.filter((e=>!e.isContext)).map((e=>e.prefixRange));e.setDecorations(n,i),e.setDecorations(r,o)};t.window.activeTextEditor&&"search-result"===t.window.activeTextEditor.document.languageId&&i(t.window.activeTextEditor),e.subscriptions.push(t.languages.registerDocumentSymbolProvider(s,{provideDocumentSymbols:(e,n)=>v(e,n).filter(d).map((e=>new t.DocumentSymbol(e.path,"",t.SymbolKind.File,e.allLocations.map((({originSelectionRange:e})=>e)).reduce(((e,t)=>e.union(t)),e.location.originSelectionRange),e.location.originSelectionRange)))}),t.languages.registerCompletionItemProvider(s,{provideCompletionItems(e,t){const n=e.lineAt(t.line);if(t.line>3)return[];if(0===t.character||1===t.character&&"#"===n.text){const n=Array.from({length:c.length}).map(((t,n)=>e.lineAt(n).text));return c.filter((e=>n.every((t=>-1===t.indexOf(e))))).map((e=>({label:e,insertText:e.slice(t.character)+" "})))}return-1===n.text.indexOf("# Flags:")?[]:g.filter((e=>-1===n.text.indexOf(e))).map((e=>({label:e,insertText:e+" "})))}},"#"),t.languages.registerDefinitionProvider(s,{provideDefinition(e,n,r){const i=v(e,r)[n.line];if(!i)return[];if("file"===i.type)return i.allLocations;const o=i.locations.find((e=>e.originSelectionRange.contains(n)));if(!o)return[];const a=new t.Position(o.targetSelectionRange.start.line,o.targetSelectionRange.start.character+(n.character-o.originSelectionRange.start.character));return[{...o,targetSelectionRange:new t.Range(a,a)}]}}),t.languages.registerDocumentLinkProvider(s,{provideDocumentLinks:async(e,t)=>v(e,t).filter(d).map((({location:e})=>({range:e.originSelectionRange,target:e.targetUri})))}),t.window.onDidChangeActiveTextEditor((e=>{"search-result"===e?.document.languageId&&(u=void 0,f?.dispose(),f=t.workspace.onDidChangeTextDocument((t=>{t.document.uri===e.document.uri&&i(e)})),i(e))})),{dispose(){u=void 0,f?.dispose()}})};const d=e=>"file"===e.type,p=e=>"result"===e.type;function v(e,n){if(u&&u.uri===e.uri&&u.version===e.version)return u.parse;const r=e.getText().split(/\r?\n/),i=[];let s,c;for(let g=0;g<r.length;g++){if(n?.isCancellationRequested)return[];const u=r[g],f=o.exec(u);if(f){const[,n]=f;if(s=h(n,e.uri),!s)continue;c=[];const r={targetRange:new t.Range(0,0,0,1),targetUri:s,originSelectionRange:new t.Range(g,0,g,u.length)};i[g]={type:"file",location:r,allLocations:c,path:n}}if(!s)continue;const d=a.exec(u);if(d){const[,e,n,r]=d,o=+n-1,a=(e+n+r).length,f=new t.Range(Math.max(o-3,0),0,o+3,u.length),h=[];let p,v=a,x=0;for(l.lastIndex=a;p=l.exec(u);)h.push({targetRange:f,targetSelectionRange:new t.Range(o,x,o,x),targetUri:s,originSelectionRange:new t.Range(g,v,g,l.lastIndex-p[0].length)}),x+=l.lastIndex-v-p[0].length+Number(p[1]),v=l.lastIndex;v<u.length&&h.push({targetRange:f,targetSelectionRange:new t.Range(o,x,o,x),targetUri:s,originSelectionRange:new t.Range(g,v,g,u.length)}),r.includes(":")&&c?.push(...h);const m={targetRange:f,targetSelectionRange:new t.Range(o,0,o,1),targetUri:s,originSelectionRange:new t.Range(g,0,g,a-1)};h.push(m),i[g]={type:"result",locations:h,isContext:" "===r,prefixRange:new t.Range(g,0,g,a)}}}return u={version:e.version,parse:i,uri:e.uri},i}})();var i=exports;for(var o in r)i[o]=r[o];r.__esModule&&Object.defineProperty(i,"__esModule",{value:!0})})();
//# sourceMappingURL=https://ticino.blob.core.windows.net/sourcemaps/7f329fe6c66b0f86ae1574c2911b681ad5a45d63/extensions/search-result/dist/extension.js.map