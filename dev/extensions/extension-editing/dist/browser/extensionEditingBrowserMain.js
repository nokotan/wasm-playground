(()=>{"use strict";var e={516:(e,t,r)=>{function n(e,t){void 0===t&&(t=!1);var r=e.length,n=0,f="",c=0,s=16,u=0,l=0,h=0,g=0,d=0;function p(t,r){for(var o=0,a=0;o<t||!r;){var i=e.charCodeAt(n);if(i>=48&&i<=57)a=16*a+i-48;else if(i>=65&&i<=70)a=16*a+i-65+10;else{if(!(i>=97&&i<=102))break;a=16*a+i-97+10}n++,o++}return o<t&&(a=-1),a}function v(){if(f="",d=0,c=n,l=u,g=h,n>=r)return c=r,s=17;var t=e.charCodeAt(n);if(o(t)){do{n++,f+=String.fromCharCode(t),t=e.charCodeAt(n)}while(o(t));return s=15}if(a(t))return n++,f+=String.fromCharCode(t),13===t&&10===e.charCodeAt(n)&&(n++,f+="\n"),u++,h=n,s=14;switch(t){case 123:return n++,s=1;case 125:return n++,s=2;case 91:return n++,s=3;case 93:return n++,s=4;case 58:return n++,s=6;case 44:return n++,s=5;case 34:return n++,f=function(){for(var t="",o=n;;){if(n>=r){t+=e.substring(o,n),d=2;break}var i=e.charCodeAt(n);if(34===i){t+=e.substring(o,n),n++;break}if(92!==i){if(i>=0&&i<=31){if(a(i)){t+=e.substring(o,n),d=2;break}d=6}n++}else{if(t+=e.substring(o,n),++n>=r){d=2;break}switch(e.charCodeAt(n++)){case 34:t+='"';break;case 92:t+="\\";break;case 47:t+="/";break;case 98:t+="\b";break;case 102:t+="\f";break;case 110:t+="\n";break;case 114:t+="\r";break;case 116:t+="\t";break;case 117:var f=p(4,!0);f>=0?t+=String.fromCharCode(f):d=4;break;default:d=5}o=n}}return t}(),s=10;case 47:var v=n-1;if(47===e.charCodeAt(n+1)){for(n+=2;n<r&&!a(e.charCodeAt(n));)n++;return f=e.substring(v,n),s=12}if(42===e.charCodeAt(n+1)){n+=2;for(var y=r-1,k=!1;n<y;){var m=e.charCodeAt(n);if(42===m&&47===e.charCodeAt(n+1)){n+=2,k=!0;break}n++,a(m)&&(13===m&&10===e.charCodeAt(n)&&n++,u++,h=n)}return k||(n++,d=1),f=e.substring(v,n),s=13}return f+=String.fromCharCode(t),n++,s=16;case 45:if(f+=String.fromCharCode(t),++n===r||!i(e.charCodeAt(n)))return s=16;case 48:case 49:case 50:case 51:case 52:case 53:case 54:case 55:case 56:case 57:return f+=function(){var t=n;if(48===e.charCodeAt(n))n++;else for(n++;n<e.length&&i(e.charCodeAt(n));)n++;if(n<e.length&&46===e.charCodeAt(n)){if(!(++n<e.length&&i(e.charCodeAt(n))))return d=3,e.substring(t,n);for(n++;n<e.length&&i(e.charCodeAt(n));)n++}var r=n;if(n<e.length&&(69===e.charCodeAt(n)||101===e.charCodeAt(n)))if((++n<e.length&&43===e.charCodeAt(n)||45===e.charCodeAt(n))&&n++,n<e.length&&i(e.charCodeAt(n))){for(n++;n<e.length&&i(e.charCodeAt(n));)n++;r=n}else d=3;return e.substring(t,r)}(),s=11;default:for(;n<r&&b(t);)n++,t=e.charCodeAt(n);if(c!==n){switch(f=e.substring(c,n)){case"true":return s=8;case"false":return s=9;case"null":return s=7}return s=16}return f+=String.fromCharCode(t),n++,s=16}}function b(e){if(o(e)||a(e))return!1;switch(e){case 125:case 93:case 123:case 91:case 34:case 58:case 44:case 47:return!1}return!0}return{setPosition:function(e){n=e,f="",c=0,s=16,d=0},getPosition:function(){return n},scan:t?function(){var e;do{e=v()}while(e>=12&&e<=15);return e}:v,getToken:function(){return s},getTokenValue:function(){return f},getTokenOffset:function(){return c},getTokenLength:function(){return n-c},getTokenStartLine:function(){return l},getTokenStartCharacter:function(){return c-g},getTokenError:function(){return d}}}function o(e){return 32===e||9===e||11===e||12===e||160===e||5760===e||e>=8192&&e<=8203||8239===e||8287===e||12288===e||65279===e}function a(e){return 10===e||13===e||8232===e||8233===e}function i(e){return e>=48&&e<=57}function f(e,t,r){var o,a,i,f,u;if(t){for(f=t.offset,u=f+t.length,i=f;i>0&&!s(e,i-1);)i--;for(var l=u;l<e.length&&!s(e,l);)l++;a=e.substring(i,l),o=function(e,t){for(var r=0,n=0,o=t.tabSize||4;r<e.length;){var a=e.charAt(r);if(" "===a)n++;else{if("\t"!==a)break;n+=o}r++}return Math.floor(n/o)}(a,r)}else a=e,o=0,i=0,f=0,u=e.length;var h,g=function(e,t){for(var r=0;r<t.length;r++){var n=t.charAt(r);if("\r"===n)return r+1<t.length&&"\n"===t.charAt(r+1)?"\r\n":"\r";if("\n"===n)return"\n"}return e&&e.eol||"\n"}(r,e),d=!1,p=0;h=r.insertSpaces?c(" ",r.tabSize||4):"\t";var v=n(a,!1),b=!1;function y(){return g+c(h,o+p)}function k(){var e=v.scan();for(d=!1;15===e||14===e;)d=d||14===e,e=v.scan();return b=16===e||0!==v.getTokenError(),e}var m=[];function A(t,r,n){!b&&r<u&&n>f&&e.substring(r,n)!==t&&m.push({offset:r,length:n-r,content:t})}var C=k();if(17!==C){var T=v.getTokenOffset()+i;A(c(h,o),i,T)}for(;17!==C;){for(var O=v.getTokenOffset()+v.getTokenLength()+i,w=k(),E="";!d&&(12===w||13===w);)A(" ",O,v.getTokenOffset()+i),O=v.getTokenOffset()+v.getTokenLength()+i,E=12===w?y():"",w=k();if(2===w)1!==C&&(p--,E=y());else if(4===w)3!==C&&(p--,E=y());else{switch(C){case 3:case 1:p++,E=y();break;case 5:case 12:E=y();break;case 13:E=d?y():" ";break;case 6:E=" ";break;case 10:if(6===w){E="";break}case 7:case 8:case 9:case 11:case 2:case 4:12===w||13===w?E=" ":5!==w&&17!==w&&(b=!0);break;case 16:b=!0}!d||12!==w&&13!==w||(E=y())}A(E,O,v.getTokenOffset()+i),C=w}return m}function c(e,t){for(var r="",n=0;n<t;n++)r+=e;return r}function s(e,t){return-1!=="\r\n".indexOf(e.charAt(t))}var u;function l(e,t,r){void 0===t&&(t=[]),void 0===r&&(r=u.DEFAULT);var n={type:"array",offset:-1,length:-1,children:[],parent:void 0};function o(e){"property"===n.type&&(n.length=e-n.offset,n=n.parent)}function a(e){return n.children.push(e),e}g(e,{onObjectBegin:function(e){n=a({type:"object",offset:e,length:-1,parent:n,children:[]})},onObjectProperty:function(e,t,r){(n=a({type:"property",offset:t,length:-1,parent:n,children:[]})).children.push({type:"string",value:e,offset:t,length:r,parent:n})},onObjectEnd:function(e,t){o(e+t),n.length=e+t-n.offset,n=n.parent,o(e+t)},onArrayBegin:function(e,t){n=a({type:"array",offset:e,length:-1,parent:n,children:[]})},onArrayEnd:function(e,t){n.length=e+t-n.offset,n=n.parent,o(e+t)},onLiteralValue:function(e,t,r){a({type:d(e),offset:t,length:r,parent:n,value:e}),o(t+r)},onSeparator:function(e,t,r){"property"===n.type&&(":"===e?n.colonOffset=t:","===e&&o(t))},onError:function(e,r,n){t.push({error:e,offset:r,length:n})}},r);var i=n.children[0];return i&&delete i.parent,i}function h(e,t){if(e){for(var r=e,n=0,o=t;n<o.length;n++){var a=o[n];if("string"==typeof a){if("object"!==r.type||!Array.isArray(r.children))return;for(var i=!1,f=0,c=r.children;f<c.length;f++){var s=c[f];if(Array.isArray(s.children)&&s.children[0].value===a){r=s.children[1],i=!0;break}}if(!i)return}else{var u=a;if("array"!==r.type||u<0||!Array.isArray(r.children)||u>=r.children.length)return;r=r.children[u]}}return r}}function g(e,t,r){void 0===r&&(r=u.DEFAULT);var o=n(e,!1);function a(e){return e?function(){return e(o.getTokenOffset(),o.getTokenLength(),o.getTokenStartLine(),o.getTokenStartCharacter())}:function(){return!0}}function i(e){return e?function(t){return e(t,o.getTokenOffset(),o.getTokenLength(),o.getTokenStartLine(),o.getTokenStartCharacter())}:function(){return!0}}var f=a(t.onObjectBegin),c=i(t.onObjectProperty),s=a(t.onObjectEnd),l=a(t.onArrayBegin),h=a(t.onArrayEnd),g=i(t.onLiteralValue),d=i(t.onSeparator),p=a(t.onComment),v=i(t.onError),b=r&&r.disallowComments,y=r&&r.allowTrailingComma;function k(){for(;;){var e=o.scan();switch(o.getTokenError()){case 4:m(14);break;case 5:m(15);break;case 3:m(13);break;case 1:b||m(11);break;case 2:m(12);break;case 6:m(16)}switch(e){case 12:case 13:b?m(10):p();break;case 16:m(1);break;case 15:case 14:break;default:return e}}}function m(e,t,r){if(void 0===t&&(t=[]),void 0===r&&(r=[]),v(e),t.length+r.length>0)for(var n=o.getToken();17!==n;){if(-1!==t.indexOf(n)){k();break}if(-1!==r.indexOf(n))break;n=k()}}function A(e){var t=o.getTokenValue();return e?g(t):c(t),k(),!0}return k(),17===o.getToken()?!!r.allowEmptyContent||(m(4,[],[]),!1):function e(){switch(o.getToken()){case 3:return function(){l(),k();for(var t=!1;4!==o.getToken()&&17!==o.getToken();){if(5===o.getToken()){if(t||m(4,[],[]),d(","),k(),4===o.getToken()&&y)break}else t&&m(6,[],[]);e()||m(4,[],[4,5]),t=!0}return h(),4!==o.getToken()?m(8,[4],[]):k(),!0}();case 1:return function(){f(),k();for(var t=!1;2!==o.getToken()&&17!==o.getToken();){if(5===o.getToken()){if(t||m(4,[],[]),d(","),k(),2===o.getToken()&&y)break}else t&&m(6,[],[]);(10!==o.getToken()?(m(3,[],[2,5]),0):(A(!1),6===o.getToken()?(d(":"),k(),e()||m(4,[],[2,5])):m(5,[],[2,5]),1))||m(4,[],[2,5]),t=!0}return s(),2!==o.getToken()?m(7,[2],[]):k(),!0}();case 10:return A(!0);default:return function(){switch(o.getToken()){case 11:var e=0;try{"number"!=typeof(e=JSON.parse(o.getTokenValue()))&&(m(2),e=0)}catch(e){m(2)}g(e);break;case 7:g(null);break;case 8:g(!0);break;case 9:g(!1);break;default:return!1}return k(),!0}()}}()?(17!==o.getToken()&&m(9,[],[]),!0):(m(4,[],[]),!1)}function d(e){switch(typeof e){case"boolean":return"boolean";case"number":return"number";case"string":return"string";case"object":return e?Array.isArray(e)?"array":"object":"null";default:return"null"}}function p(e,t,r){var n=v(e,t),o=t.offset,a=t.offset+t.content.length;if(0===t.length||0===t.content.length){for(;o>0&&!s(n,o-1);)o--;for(;a<n.length&&!s(n,a);)a++}for(var i=f(n,{offset:o,length:a-o},r),c=i.length-1;c>=0;c--){var u=i[c];n=v(n,u),o=Math.min(o,u.offset),a=Math.max(a,u.offset+u.length),a+=u.content.length-u.length}return[{offset:o,length:e.length-(n.length-a)-o,content:n.substring(o,a)}]}function v(e,t){return e.substring(0,t.offset)+t.content+e.substring(t.offset+t.length)}r.r(t),r.d(t,{applyEdits:()=>P,createScanner:()=>b,findNodeAtLocation:()=>A,findNodeAtOffset:()=>C,format:()=>j,getLocation:()=>y,getNodePath:()=>T,getNodeValue:()=>O,modify:()=>x,parse:()=>k,parseTree:()=>m,printParseErrorCode:()=>S,stripComments:()=>E,visit:()=>w}),function(e){e.DEFAULT={allowTrailingComma:!1}}(u||(u={}));var b=n,y=function(e,t){var r=[],n=new Object,o=void 0,a={value:{},offset:0,length:0,type:"object",parent:void 0},i=!1;function f(e,t,r,n){a.value=e,a.offset=t,a.length=r,a.type=n,a.colonOffset=void 0,o=a}try{g(e,{onObjectBegin:function(e,a){if(t<=e)throw n;o=void 0,i=t>e,r.push("")},onObjectProperty:function(e,o,a){if(t<o)throw n;if(f(e,o,a,"property"),r[r.length-1]=e,t<=o+a)throw n},onObjectEnd:function(e,a){if(t<=e)throw n;o=void 0,r.pop()},onArrayBegin:function(e,a){if(t<=e)throw n;o=void 0,r.push(0)},onArrayEnd:function(e,a){if(t<=e)throw n;o=void 0,r.pop()},onLiteralValue:function(e,r,o){if(t<r)throw n;if(f(e,r,o,d(e)),t<=r+o)throw n},onSeparator:function(e,a,f){if(t<=a)throw n;if(":"===e&&o&&"property"===o.type)o.colonOffset=a,i=!1,o=void 0;else if(","===e){var c=r[r.length-1];"number"==typeof c?r[r.length-1]=c+1:(i=!0,r[r.length-1]=""),o=void 0}}})}catch(e){if(e!==n)throw e}return{path:r,previousNode:o,isAtPropertyKey:i,matches:function(e){for(var t=0,n=0;t<e.length&&n<r.length;n++)if(e[t]===r[n]||"*"===e[t])t++;else if("**"!==e[t])return!1;return t===e.length}}},k=function(e,t,r){void 0===t&&(t=[]),void 0===r&&(r=u.DEFAULT);var n=null,o=[],a=[];function i(e){Array.isArray(o)?o.push(e):null!==n&&(o[n]=e)}return g(e,{onObjectBegin:function(){var e={};i(e),a.push(o),o=e,n=null},onObjectProperty:function(e){n=e},onObjectEnd:function(){o=a.pop()},onArrayBegin:function(){var e=[];i(e),a.push(o),o=e,n=null},onArrayEnd:function(){o=a.pop()},onLiteralValue:i,onError:function(e,r,n){t.push({error:e,offset:r,length:n})}},r),o[0]},m=l,A=h,C=function e(t,r,n){if(void 0===n&&(n=!1),function(e,t,r){return void 0===r&&(r=!1),t>=e.offset&&t<e.offset+e.length||r&&t===e.offset+e.length}(t,r,n)){var o=t.children;if(Array.isArray(o))for(var a=0;a<o.length&&o[a].offset<=r;a++){var i=e(o[a],r,n);if(i)return i}return t}},T=function e(t){if(!t.parent||!t.parent.children)return[];var r=e(t.parent);if("property"===t.parent.type){var n=t.parent.children[0].value;r.push(n)}else if("array"===t.parent.type){var o=t.parent.children.indexOf(t);-1!==o&&r.push(o)}return r},O=function e(t){switch(t.type){case"array":return t.children.map(e);case"object":for(var r=Object.create(null),n=0,o=t.children;n<o.length;n++){var a=o[n],i=a.children[1];i&&(r[a.children[0].value]=e(i))}return r;case"null":case"string":case"number":case"boolean":return t.value;default:return}},w=g,E=function(e,t){var r,o,a=n(e),i=[],f=0;do{switch(o=a.getPosition(),r=a.scan()){case 12:case 13:case 17:f!==o&&i.push(e.substring(f,o)),void 0!==t&&i.push(a.getTokenValue().replace(/[^\r\n]/g,t)),f=a.getPosition()}}while(17!==r);return i.join("")};function S(e){switch(e){case 1:return"InvalidSymbol";case 2:return"InvalidNumberFormat";case 3:return"PropertyNameExpected";case 4:return"ValueExpected";case 5:return"ColonExpected";case 6:return"CommaExpected";case 7:return"CloseBraceExpected";case 8:return"CloseBracketExpected";case 9:return"EndOfFileExpected";case 10:return"InvalidCommentToken";case 11:return"UnexpectedEndOfComment";case 12:return"UnexpectedEndOfString";case 13:return"UnexpectedEndOfNumber";case 14:return"InvalidUnicode";case 15:return"InvalidEscapeCharacter";case 16:return"InvalidCharacter"}return"<unknown ParseErrorCode>"}function j(e,t,r){return f(e,t,r)}function x(e,t,r,n){return function(e,t,r,n,o){for(var a,i=t.slice(),f=l(e,[]),c=void 0,s=void 0;i.length>0&&(s=i.pop(),void 0===(c=h(f,i))&&void 0!==r);)"string"==typeof s?((a={})[s]=r,r=a):r=[r];if(c){if("object"===c.type&&"string"==typeof s&&Array.isArray(c.children)){var u=h(c,[s]);if(void 0!==u){if(void 0===r){if(!u.parent)throw new Error("Malformed AST");var g=c.children.indexOf(u.parent),d=void 0,v=u.parent.offset+u.parent.length;return g>0?d=(C=c.children[g-1]).offset+C.length:(d=c.offset+1,c.children.length>1&&(v=c.children[1].offset)),p(e,{offset:d,length:v-d,content:""},n)}return p(e,{offset:u.offset,length:u.length,content:JSON.stringify(r)},n)}if(void 0===r)return[];var b=JSON.stringify(s)+": "+JSON.stringify(r),y=o?o(c.children.map((function(e){return e.children[0].value}))):c.children.length,k=void 0;return p(e,k=y>0?{offset:(C=c.children[y-1]).offset+C.length,length:0,content:","+b}:0===c.children.length?{offset:c.offset+1,length:0,content:b}:{offset:c.offset+1,length:0,content:b+","},n)}if("array"===c.type&&"number"==typeof s&&Array.isArray(c.children)){if(-1===s)return b=""+JSON.stringify(r),k=void 0,p(e,k=0===c.children.length?{offset:c.offset+1,length:0,content:b}:{offset:(C=c.children[c.children.length-1]).offset+C.length,length:0,content:","+b},n);if(void 0===r&&c.children.length>=0){var m=s,A=c.children[m];if(k=void 0,1===c.children.length)k={offset:c.offset+1,length:c.length-2,content:""};else if(c.children.length-1===m){var C,T=(C=c.children[m-1]).offset+C.length;k={offset:T,length:c.offset+c.length-2-T,content:""}}else k={offset:A.offset,length:c.children[m+1].offset-A.offset,content:""};return p(e,k,n)}throw new Error("Array modification not supported yet")}throw new Error("Can not add "+("number"!=typeof s?"index":"property")+" to parent of type "+c.type)}if(void 0===r)throw new Error("Can not delete in empty document");return p(e,{offset:f?f.offset:0,length:f?f.length:0,content:JSON.stringify(r)},n)}(e,t,r,n.formattingOptions,n.getInsertionIndex)}function P(e,t){for(var r=t.length-1;r>=0;r--)e=v(e,t[r]);return e}},111:(e,t,r)=>{Object.defineProperty(t,"__esModule",{value:!0}),t.PackageDocument=void 0;const n=r(549),o=r(516);t.PackageDocument=class{constructor(e){this.a=e}provideCompletionItems(e,t){const r=(0,o.getLocation)(this.a.getText(),this.a.offsetAt(e));if(r.path.length>=2&&"configurationDefaults"===r.path[1])return this.b(r,e)}b(e,t){let r=this.c(e,t);const o=this.a.getText(r);if(2===e.path.length){let e='"[${1:language}]": {\n\t"$0"\n}';return o&&o.startsWith('"')&&(r=new n.Range(new n.Position(r.start.line,r.start.character+1),r.end),e=e.substring(1)),Promise.resolve([this.e({label:n.l10n.t("Language specific editor settings"),documentation:n.l10n.t("Override editor settings for language"),snippet:e,range:r})])}return 3===e.path.length&&e.previousNode&&"string"==typeof e.previousNode.value&&e.previousNode.value.startsWith("[")?(r=new n.Range(new n.Position(r.start.line,r.start.character+2),r.end),n.languages.getLanguages().then((e=>e.map((e=>this.d(e,r,"",e+']"')))))):Promise.resolve([])}c(e,t){const r=e.previousNode;if(r){const e=this.a.positionAt(r.offset),o=this.a.positionAt(r.offset+r.length);if(e.isBeforeOrEqual(t)&&o.isAfterOrEqual(t))return new n.Range(e,o)}return new n.Range(t,t)}d(e,t,r,o){const a=new n.CompletionItem(e);return a.kind=n.CompletionItemKind.Value,a.detail=r,a.insertText=o||e,a.range=t,a}e(e){const t=new n.CompletionItem(e.label);return t.kind=n.CompletionItemKind.Value,t.documentation=e.documentation,t.insertText=new n.SnippetString(e.snippet),t.range=e.range,t}}},549:e=>{e.exports=require("vscode")}},t={};function r(n){var o=t[n];if(void 0!==o)return o.exports;var a=t[n]={exports:{}};return e[n](a,a.exports,r),a.exports}r.d=(e,t)=>{for(var n in t)r.o(t,n)&&!r.o(e,n)&&Object.defineProperty(e,n,{enumerable:!0,get:t[n]})},r.o=(e,t)=>Object.prototype.hasOwnProperty.call(e,t),r.r=e=>{"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})};var n={};(()=>{var e=n;Object.defineProperty(e,"__esModule",{value:!0}),e.activate=void 0;const t=r(549),o=r(111);e.activate=function(e){e.subscriptions.push(t.languages.registerCompletionItemProvider({language:"json",pattern:"**/package.json"},{provideCompletionItems:(e,t,r)=>new o.PackageDocument(e).provideCompletionItems(t,r)}))}})();var o=exports;for(var a in n)o[a]=n[a];n.__esModule&&Object.defineProperty(o,"__esModule",{value:!0})})();
//# sourceMappingURL=https://ticino.blob.core.windows.net/sourcemaps/ee2b180d582a7f601fa6ecfdad8d9fd269ab1884/extensions/extension-editing/dist/browser/extensionEditingBrowserMain.js.map