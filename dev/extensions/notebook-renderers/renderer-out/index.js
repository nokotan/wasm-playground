function d(s,t){let e=Math.pow(10,t);return Math.round(s*e)/e}var E=class{constructor(t,e,i,n=1){this._rgbaBrand=void 0;this.r=Math.min(255,Math.max(0,t))|0,this.g=Math.min(255,Math.max(0,e))|0,this.b=Math.min(255,Math.max(0,i))|0,this.a=d(Math.max(Math.min(1,n),0),3)}static equals(t,e){return t.r===e.r&&t.g===e.g&&t.b===e.b&&t.a===e.a}},T=class{constructor(t,e,i,n){this._hslaBrand=void 0;this.h=Math.max(Math.min(360,t),0)|0,this.s=d(Math.max(Math.min(1,e),0),3),this.l=d(Math.max(Math.min(1,i),0),3),this.a=d(Math.max(Math.min(1,n),0),3)}static equals(t,e){return t.h===e.h&&t.s===e.s&&t.l===e.l&&t.a===e.a}static fromRGBA(t){let e=t.r/255,i=t.g/255,n=t.b/255,l=t.a,r=Math.max(e,i,n),c=Math.min(e,i,n),a=0,_=0,m=(c+r)/2,b=r-c;if(b>0){switch(_=Math.min(m<=.5?b/(2*m):b/(2-2*m),1),r){case e:a=(i-n)/b+(i<n?6:0);break;case i:a=(n-e)/b+2;break;case n:a=(e-i)/b+4;break}a*=60,a=Math.round(a)}return new T(a,_,m,l)}static _hue2rgb(t,e,i){return i<0&&(i+=1),i>1&&(i-=1),i<1/6?t+(e-t)*6*i:i<1/2?e:i<2/3?t+(e-t)*(2/3-i)*6:t}static toRGBA(t){let e=t.h/360,{s:i,l:n,a:l}=t,r,c,a;if(i===0)r=c=a=n;else{let _=n<.5?n*(1+i):n+i-n*i,m=2*n-_;r=T._hue2rgb(m,_,e+1/3),c=T._hue2rgb(m,_,e),a=T._hue2rgb(m,_,e-1/3)}return new E(Math.round(r*255),Math.round(c*255),Math.round(a*255),l)}},U=class{constructor(t,e,i,n){this._hsvaBrand=void 0;this.h=Math.max(Math.min(360,t),0)|0,this.s=d(Math.max(Math.min(1,e),0),3),this.v=d(Math.max(Math.min(1,i),0),3),this.a=d(Math.max(Math.min(1,n),0),3)}static equals(t,e){return t.h===e.h&&t.s===e.s&&t.v===e.v&&t.a===e.a}static fromRGBA(t){let e=t.r/255,i=t.g/255,n=t.b/255,l=Math.max(e,i,n),r=Math.min(e,i,n),c=l-r,a=l===0?0:c/l,_;return c===0?_=0:l===e?_=((i-n)/c%6+6)%6:l===i?_=(n-e)/c+2:_=(e-i)/c+4,new U(Math.round(_*60),a,l,t.a)}static toRGBA(t){let{h:e,s:i,v:n,a:l}=t,r=n*i,c=r*(1-Math.abs(e/60%2-1)),a=n-r,[_,m,b]=[0,0,0];return e<60?(_=r,m=c):e<120?(_=c,m=r):e<180?(m=r,b=c):e<240?(m=c,b=r):e<300?(_=c,b=r):e<=360&&(_=r,b=c),_=Math.round((_+a)*255),m=Math.round((m+a)*255),b=Math.round((b+a)*255),new E(_,m,b,l)}},x=class{static fromHex(t){return x.Format.CSS.parseHex(t)||x.red}get hsla(){return this._hsla?this._hsla:T.fromRGBA(this.rgba)}get hsva(){return this._hsva?this._hsva:U.fromRGBA(this.rgba)}constructor(t){if(t)if(t instanceof E)this.rgba=t;else if(t instanceof T)this._hsla=t,this.rgba=T.toRGBA(t);else if(t instanceof U)this._hsva=t,this.rgba=U.toRGBA(t);else throw new Error("Invalid color ctor argument");else throw new Error("Color needs a value")}equals(t){return!!t&&E.equals(this.rgba,t.rgba)&&T.equals(this.hsla,t.hsla)&&U.equals(this.hsva,t.hsva)}getRelativeLuminance(){let t=x._relativeLuminanceForComponent(this.rgba.r),e=x._relativeLuminanceForComponent(this.rgba.g),i=x._relativeLuminanceForComponent(this.rgba.b),n=.2126*t+.7152*e+.0722*i;return d(n,4)}static _relativeLuminanceForComponent(t){let e=t/255;return e<=.03928?e/12.92:Math.pow((e+.055)/1.055,2.4)}getContrastRatio(t){let e=this.getRelativeLuminance(),i=t.getRelativeLuminance();return e>i?(e+.05)/(i+.05):(i+.05)/(e+.05)}isDarker(){return(this.rgba.r*299+this.rgba.g*587+this.rgba.b*114)/1e3<128}isLighter(){return(this.rgba.r*299+this.rgba.g*587+this.rgba.b*114)/1e3>=128}isLighterThan(t){let e=this.getRelativeLuminance(),i=t.getRelativeLuminance();return e>i}isDarkerThan(t){let e=this.getRelativeLuminance(),i=t.getRelativeLuminance();return e<i}lighten(t){return new x(new T(this.hsla.h,this.hsla.s,this.hsla.l+this.hsla.l*t,this.hsla.a))}darken(t){return new x(new T(this.hsla.h,this.hsla.s,this.hsla.l-this.hsla.l*t,this.hsla.a))}transparent(t){let{r:e,g:i,b:n,a:l}=this.rgba;return new x(new E(e,i,n,l*t))}isTransparent(){return this.rgba.a===0}isOpaque(){return this.rgba.a===1}opposite(){return new x(new E(255-this.rgba.r,255-this.rgba.g,255-this.rgba.b,this.rgba.a))}blend(t){let e=t.rgba,i=this.rgba.a,n=e.a,l=i+n*(1-i);if(l<1e-6)return x.transparent;let r=this.rgba.r*i/l+e.r*n*(1-i)/l,c=this.rgba.g*i/l+e.g*n*(1-i)/l,a=this.rgba.b*i/l+e.b*n*(1-i)/l;return new x(new E(r,c,a,l))}makeOpaque(t){if(this.isOpaque()||t.rgba.a!==1)return this;let{r:e,g:i,b:n,a:l}=this.rgba;return new x(new E(t.rgba.r-l*(t.rgba.r-e),t.rgba.g-l*(t.rgba.g-i),t.rgba.b-l*(t.rgba.b-n),1))}flatten(...t){let e=t.reduceRight((i,n)=>x._flatten(n,i));return x._flatten(this,e)}static _flatten(t,e){let i=1-t.rgba.a;return new x(new E(i*e.rgba.r+t.rgba.a*t.rgba.r,i*e.rgba.g+t.rgba.a*t.rgba.g,i*e.rgba.b+t.rgba.a*t.rgba.b))}toString(){return this._toString??(this._toString=x.Format.CSS.format(this)),this._toString}static getLighterColor(t,e,i){if(t.isLighterThan(e))return t;i=i||.5;let n=t.getRelativeLuminance(),l=e.getRelativeLuminance();return i=i*(l-n)/l,t.lighten(i)}static getDarkerColor(t,e,i){if(t.isDarkerThan(e))return t;i=i||.5;let n=t.getRelativeLuminance(),l=e.getRelativeLuminance();return i=i*(n-l)/n,t.darken(i)}},A=x;A.white=new x(new E(255,255,255,1)),A.black=new x(new E(0,0,0,1)),A.red=new x(new E(255,0,0,1)),A.blue=new x(new E(0,0,255,1)),A.green=new x(new E(0,255,0,1)),A.cyan=new x(new E(0,255,255,1)),A.lightgrey=new x(new E(211,211,211,1)),A.transparent=new x(new E(0,0,0,0));(t=>{let s;(i=>{let e;(M=>{function n(u){return u.rgba.a===1?`rgb(${u.rgba.r}, ${u.rgba.g}, ${u.rgba.b})`:t.Format.CSS.formatRGBA(u)}M.formatRGB=n;function l(u){return`rgba(${u.rgba.r}, ${u.rgba.g}, ${u.rgba.b}, ${+u.rgba.a.toFixed(2)})`}M.formatRGBA=l;function r(u){return u.hsla.a===1?`hsl(${u.hsla.h}, ${(u.hsla.s*100).toFixed(2)}%, ${(u.hsla.l*100).toFixed(2)}%)`:t.Format.CSS.formatHSLA(u)}M.formatHSL=r;function c(u){return`hsla(${u.hsla.h}, ${(u.hsla.s*100).toFixed(2)}%, ${(u.hsla.l*100).toFixed(2)}%, ${u.hsla.a.toFixed(2)})`}M.formatHSLA=c;function a(u){let R=u.toString(16);return R.length!==2?"0"+R:R}function _(u){return`#${a(u.rgba.r)}${a(u.rgba.g)}${a(u.rgba.b)}`}M.formatHex=_;function m(u,R=!1){return R&&u.rgba.a===1?t.Format.CSS.formatHex(u):`#${a(u.rgba.r)}${a(u.rgba.g)}${a(u.rgba.b)}${a(Math.round(u.rgba.a*255))}`}M.formatHexA=m;function b(u){return u.isOpaque()?t.Format.CSS.formatHex(u):t.Format.CSS.formatRGBA(u)}M.format=b;function v(u){let R=u.length;if(R===0||u.charCodeAt(0)!==35)return null;if(R===7){let g=16*f(u.charCodeAt(1))+f(u.charCodeAt(2)),p=16*f(u.charCodeAt(3))+f(u.charCodeAt(4)),o=16*f(u.charCodeAt(5))+f(u.charCodeAt(6));return new t(new E(g,p,o,1))}if(R===9){let g=16*f(u.charCodeAt(1))+f(u.charCodeAt(2)),p=16*f(u.charCodeAt(3))+f(u.charCodeAt(4)),o=16*f(u.charCodeAt(5))+f(u.charCodeAt(6)),L=16*f(u.charCodeAt(7))+f(u.charCodeAt(8));return new t(new E(g,p,o,L/255))}if(R===4){let g=f(u.charCodeAt(1)),p=f(u.charCodeAt(2)),o=f(u.charCodeAt(3));return new t(new E(16*g+g,16*p+p,16*o+o))}if(R===5){let g=f(u.charCodeAt(1)),p=f(u.charCodeAt(2)),o=f(u.charCodeAt(3)),L=f(u.charCodeAt(4));return new t(new E(16*g+g,16*p+p,16*o+o,(16*L+L)/255))}return null}M.parseHex=v;function f(u){switch(u){case 48:return 0;case 49:return 1;case 50:return 2;case 51:return 3;case 52:return 4;case 53:return 5;case 54:return 6;case 55:return 7;case 56:return 8;case 57:return 9;case 97:return 10;case 65:return 10;case 98:return 11;case 66:return 11;case 99:return 12;case 67:return 12;case 100:return 13;case 68:return 13;case 101:return 14;case 69:return 14;case 102:return 15;case 70:return 15}return 0}})(e=i.CSS||(i.CSS={}))})(s=t.Format||(t.Format={}))})(A||(A={}));var H=[],j={"terminal.ansiBlack":{index:0},"terminal.ansiRed":{index:1},"terminal.ansiGreen":{index:2},"terminal.ansiYellow":{index:3},"terminal.ansiBlue":{index:4},"terminal.ansiMagenta":{index:5},"terminal.ansiCyan":{index:6},"terminal.ansiWhite":{index:7},"terminal.ansiBrightBlack":{index:8},"terminal.ansiBrightRed":{index:9},"terminal.ansiBrightGreen":{index:10},"terminal.ansiBrightYellow":{index:11},"terminal.ansiBrightBlue":{index:12},"terminal.ansiBrightMagenta":{index:13},"terminal.ansiBrightCyan":{index:14},"terminal.ansiBrightWhite":{index:15}};for(let s in j){let t=j[s],e=s.substring(13);H[t.index]={colorName:e,colorValue:"var(--vscode-"+s.replace(".","-")+")"}}var k=typeof window<"u"?window.trustedTypes?.createPolicy("notebookRenderer",{createHTML:s=>s,createScript:s=>s}):void 0;var X="\\u0000-\\u0020\\u007f-\\u009f",et=new RegExp("(?:[a-zA-Z][a-zA-Z0-9+.-]{2,}:\\/\\/|data:|www\\.)[^\\s"+X+'"]{2,}[^\\s'+X+`"')}\\],:;.!?]`,"ug"),it=/(?<=^|\s)(?:[a-zA-Z]:(?:(?:\\|\/)[\w\.-]*)+)/,st=/(?<=^|\s)(?:(?:\~|\.)(?:(?:\\|\/)[\w\.-]*)+)/,lt=new RegExp(`(${it.source}|${st.source})`),rt=/(?<=^|\s)((?:\~|\.)?(?:\/[\w\.-]*)+)/,ct=/(?:\:([\d]+))?(?:\:([\d]+))?/,ot=typeof navigator<"u"?navigator.userAgent&&navigator.userAgent.indexOf("Windows")>=0:!1,at=new RegExp(`${ot?lt.source:rt.source}${ct.source}`,"g"),ut=/<a\s+(?:[^>]*?\s+)?href=(["'])(.*?)\1[^>]*?>.*?<\/a>/gi,_t=2e3,D=class{shouldGenerateHtml(t){return t&&(!!D.injectedHtmlCreator||!!k)}createHtml(t){return D.injectedHtmlCreator?D.injectedHtmlCreator(t):k?.createHTML(t).toString()}linkify(t,e,i){if(i){let l=t.split(`
`);for(let a=0;a<l.length-1;a++)l[a]=l[a]+`
`;l[l.length-1]||l.pop();let r=l.map(a=>this.linkify(a,e,!1));if(r.length===1)return r[0];let c=document.createElement("span");return r.forEach(a=>c.appendChild(a)),c}let n=document.createElement("span");for(let l of this.detectLinks(t,!!e.trustHtml,e.linkifyFilePaths))try{let r=null;switch(l.kind){case"text":n.appendChild(document.createTextNode(l.value));break;case"web":case"path":n.appendChild(this.createWebLink(l.value));break;case"html":r=document.createElement("span"),r.innerHTML=this.createHtml(l.value),n.appendChild(r);break}}catch{n.appendChild(document.createTextNode(l.value))}return n}createWebLink(t){let e=this.createLink(t);return e.href=t,e}createLink(t){let e=document.createElement("a");return e.textContent=t,e}detectLinks(t,e,i){if(t.length>_t)return[{kind:"text",value:t,captures:[]}];let n=[],l=[],r=[];this.shouldGenerateHtml(e)&&(n.push(ut),l.push("html")),n.push(et),l.push("web"),i&&(n.push(at),l.push("path"));let c=(a,_)=>{if(_>=n.length){r.push({value:a,kind:"text",captures:[]});return}let m=n[_],b=0,v;for(m.lastIndex=0;(v=m.exec(a))!==null;){let M=a.substring(b,v.index);M&&c(M,_+1);let u=v[0];r.push({value:u,kind:l[_],captures:v.slice(1)}),b=v.index+u.length}let f=a.substring(b);f&&c(f,_+1)};return c(t,0),r}},mt=new D;function z(s,t,e){return mt.linkify(s,t,e)}function O(s,t){let e=document.createElement("span"),i=s.length,n=[],l,r,c,a=!1,_=0,m="";for(;_<i;){let g=!1;if(s.charCodeAt(_)===27&&s.charAt(_+1)==="["){let p=_;_+=2;let o="";for(;_<i;){let L=s.charAt(_);if(o+=L,_++,L.match(/^[ABCDHIJKfhmpsu]$/)){g=!0;break}}if(g){if(J(e,m,t,n,l,r,c),m="",o.match(/^(?:[34][0-8]|9[0-7]|10[0-7]|[0-9]|2[1-5,7-9]|[34]9|5[8,9]|1[0-9])(?:;[349][0-7]|10[0-7]|[013]|[245]|[34]9)?(?:;[012]?[0-9]?[0-9])*;?m$/)){let L=o.slice(0,-1).split(";").filter(w=>w!=="").map(w=>parseInt(w,10));if(L[0]===38||L[0]===48||L[0]===58){let w=L[0]===38?"foreground":L[0]===48?"background":"underline";L[1]===5?u(L,w):L[1]===2&&M(L,w)}else f(L)}}else _=p}g===!1&&(m+=s.charAt(_),_++)}return m&&J(e,m,t,n,l,r,c),e;function b(g,p){g==="foreground"?l=p:g==="background"?r=p:g==="underline"&&(c=p),n=n.filter(o=>o!==`code-${g}-colored`),p!==void 0&&n.push(`code-${g}-colored`)}function v(){let g=l;b("foreground",r),b("background",g)}function f(g){for(let p of g)switch(p){case 0:{n=[],l=void 0,r=void 0;break}case 1:{n=n.filter(o=>o!=="code-bold"),n.push("code-bold");break}case 2:{n=n.filter(o=>o!=="code-dim"),n.push("code-dim");break}case 3:{n=n.filter(o=>o!=="code-italic"),n.push("code-italic");break}case 4:{n=n.filter(o=>o!=="code-underline"&&o!=="code-double-underline"),n.push("code-underline");break}case 5:{n=n.filter(o=>o!=="code-blink"),n.push("code-blink");break}case 6:{n=n.filter(o=>o!=="code-rapid-blink"),n.push("code-rapid-blink");break}case 7:{a||(a=!0,v());break}case 8:{n=n.filter(o=>o!=="code-hidden"),n.push("code-hidden");break}case 9:{n=n.filter(o=>o!=="code-strike-through"),n.push("code-strike-through");break}case 10:{n=n.filter(o=>!o.startsWith("code-font"));break}case 11:case 12:case 13:case 14:case 15:case 16:case 17:case 18:case 19:case 20:{n=n.filter(o=>!o.startsWith("code-font")),n.push(`code-font-${p-10}`);break}case 21:{n=n.filter(o=>o!=="code-underline"&&o!=="code-double-underline"),n.push("code-double-underline");break}case 22:{n=n.filter(o=>o!=="code-bold"&&o!=="code-dim");break}case 23:{n=n.filter(o=>o!=="code-italic"&&o!=="code-font-10");break}case 24:{n=n.filter(o=>o!=="code-underline"&&o!=="code-double-underline");break}case 25:{n=n.filter(o=>o!=="code-blink"&&o!=="code-rapid-blink");break}case 27:{a&&(a=!1,v());break}case 28:{n=n.filter(o=>o!=="code-hidden");break}case 29:{n=n.filter(o=>o!=="code-strike-through");break}case 53:{n=n.filter(o=>o!=="code-overline"),n.push("code-overline");break}case 55:{n=n.filter(o=>o!=="code-overline");break}case 39:{b("foreground",void 0);break}case 49:{b("background",void 0);break}case 59:{b("underline",void 0);break}case 73:{n=n.filter(o=>o!=="code-superscript"&&o!=="code-subscript"),n.push("code-superscript");break}case 74:{n=n.filter(o=>o!=="code-superscript"&&o!=="code-subscript"),n.push("code-subscript");break}case 75:{n=n.filter(o=>o!=="code-superscript"&&o!=="code-subscript");break}default:{R(p);break}}}function M(g,p){if(g.length>=5&&g[2]>=0&&g[2]<=255&&g[3]>=0&&g[3]<=255&&g[4]>=0&&g[4]<=255){let o=new E(g[2],g[3],g[4]);b(p,o)}}function u(g,p){let o=g[2],L=gt(o);if(L)b(p,L);else if(o>=0&&o<=15){if(p==="underline"){b(p,H[o].colorValue);return}o+=30,o>=38&&(o+=52),p==="background"&&(o+=10),R(o)}}function R(g){let p,o;g>=30&&g<=37?(o=g-30,p="foreground"):g>=90&&g<=97?(o=g-90+8,p="foreground"):g>=40&&g<=47?(o=g-40,p="background"):g>=100&&g<=107&&(o=g-100+8,p="background"),o!==void 0&&p&&b(p,H[o]?.colorValue)}}function J(s,t,e,i,n,l,r){if(!s||!t)return;let c=document.createElement("span");c.childElementCount===0&&(c=z(t,e,!0)),c.className=i.join(" "),n&&(c.style.color=typeof n=="string"?n:A.Format.CSS.formatRGB(new A(n))),l&&(c.style.backgroundColor=typeof l=="string"?l:A.Format.CSS.formatRGB(new A(l))),r&&(c.style.textDecorationColor=typeof r=="string"?r:A.Format.CSS.formatRGB(new A(r))),s.appendChild(c)}function gt(s){if(s%1===0)if(s>=16&&s<=231){s-=16;let t=s%6;s=(s-t)/6;let e=s%6;s=(s-e)/6;let i=s,n=255/5;return t=Math.round(t*n),e=Math.round(e*n),i=Math.round(i*n),new E(i,e,t)}else if(s>=232&&s<=255){s-=232;let t=Math.round(s/23*255);return new E(t,t,t)}else return}var G="scrollable",y=5e3,bt=8e3;function pt(s){let t=document.createElement("div");t.classList.add("truncation-message");let e=document.createElement("span");e.textContent="Output is truncated. View as a ",t.appendChild(e);let i=document.createElement("a");i.textContent="scrollable element",i.href=`command:cellOutput.enableScrolling?${s}`,i.ariaLabel="enable scrollable output",t.appendChild(i);let n=document.createElement("span");n.textContent=" or open in a ",t.appendChild(n);let l=document.createElement("a");l.textContent="text editor",l.href=`command:workbench.action.openLargeOutput?${s}`,l.ariaLabel="open output in text editor",t.appendChild(l);let r=document.createElement("span");r.textContent=". Adjust cell output ",t.appendChild(r);let c=document.createElement("a");c.textContent="settings",c.href="command:workbench.action.openSettings?%5B%22%40tag%3AnotebookOutputLayout%22%5D",c.ariaLabel="notebook output settings",t.appendChild(c);let a=document.createElement("span");return a.textContent="...",t.appendChild(a),t}function Et(s){let t=document.createElement("div"),e=document.createElement("a");return e.textContent="...",e.href=`command:workbench.action.openLargeOutput?${s}`,e.ariaLabel="Open full output in text editor",e.title="Open full output in text editor",e.style.setProperty("text-decoration","none"),t.appendChild(e),t}function ft(s,t,e,i){let n=document.createElement("div"),l=t.length;if(l<=e){let c=O(t.join(`
`),i);return n.appendChild(c),n}n.appendChild(O(t.slice(0,e-5).join(`
`),i));let r=document.createElement("div");return r.innerText="...",n.appendChild(r),n.appendChild(O(t.slice(l-5).join(`
`),i)),n.appendChild(pt(s)),n}function xt(s,t,e){let i=document.createElement("div");return t.length>y&&i.appendChild(Et(s)),i.appendChild(O(t.slice(-1*y).join(`
`),e)),i}var I={};function Lt(s,t,e,i){I[t]||(I[t]=0);let n=e.split(/\r\n|\r|\n/g),l=n.length+I[t];return l>bt?!1:(s.appendChild(O(n.join(`
`),i)),I[t]=l,!0)}function S(s,t,e){let{linesLimit:i,error:n,scrollable:l,trustHtml:r,linkifyFilePaths:c}=e,a={linkifyFilePaths:c,trustHtml:r},_=t.split(/\r\n|\r|\n/g);I[s]=I[s]=Math.min(_.length,y);let m;return l?m=xt(s,_,a):m=ft(s,_,i,a),m.setAttribute("output-item-id",s),n&&m.classList.add("error"),m}function N(s,t,e){let i=s.appendedText?.(),n={linkifyFilePaths:e.linkifyFilePaths,trustHtml:e.trustHtml};if(i&&e.scrollable&&Lt(t,s.id,i,n))return;let l=S(s.id,s.text(),e);for(t.replaceWith(l);l.nextSibling;)l.nextSibling.remove()}function Z(s){let t;return t=s.replace(/\u001b\[4\dm/g,""),t=t.replace(/\u001b\[38;.*?\d+m/g,"\x1B[39m"),t=t.replace(/(;32m[ ->]*?)(\d+)(.*)\n/g,(e,i,n,l)=>(l=l.replace(/\u001b\[3\d+m/g,"\x1B[39m"),`${i}${n}${l}
`)),Rt(t)?Tt(t):t}var At=/\u001b\[.+?m/g,$=/File\s+(?:\u001b\[.+?m)?(.+):(\d+)/,Y=/^((?:\u001b\[.+?m)?[ \->]+?)(\d+)(?:\u001b\[0m)?( .*)/,F=/(?<prefix>Cell\s+(?:\u001b\[.+?m)?In\s*\[(?<executionCount>\d+)\],\s*)(?<lineLabel>line (?<lineNumber>\d+)).*/,B=/(?<prefix>Input\s+?(?:\u001b\[.+?m)(?<cellLabel>In\s*\[(?<executionCount>\d+)\]))(?<postfix>.*)/;function Rt(s){return F.test(s)||B.test(s)||$.test(s)}function P(s){return s.replace(At,"").trim()}function Tt(s){let t=s.split(`
`),e;for(let i in t){let n=t[i];if($.test(n)){let l=t[i].match($);e={kind:"file",path:P(l[1])};continue}else if(F.test(n)){e={kind:"cell",path:P(n.replace(F,"vscode-notebook-cell:?execution_count=$<executionCount>"))},t[i]=n.replace(F,`$<prefix><a href='${e.path}&line=$<lineNumber>'>line $<lineNumber></a>`);continue}else if(B.test(n)){e={kind:"cell",path:P(n.replace(B,"vscode-notebook-cell:?execution_count=$<executionCount>"))},t[i]=n.replace(B,`Input <a href='${e.path}>'>$<cellLabel></a>$<postfix>`);continue}else if(!e||n.trim()===""){e=void 0;continue}else if(Y.test(n)){t[i]=n.replace(Y,(l,r,c,a)=>e?.kind==="file"?`${r}<a href='${e?.path}:${c}'>${c}</a>${a}`:`${r}<a href='${e?.path}&line=${c}'>${c}</a>${a}`);continue}}return t.join(`
`)}function W(s){for(;s.firstChild;)s.removeChild(s.firstChild)}function vt(s,t){let e=new Blob([s.data()],{type:s.mime}),i=URL.createObjectURL(e),n={dispose:()=>{URL.revokeObjectURL(i)}};if(t.firstChild){let a=t.firstChild;if(a.firstChild&&a.firstChild.nodeName==="IMG"&&a.firstChild instanceof HTMLImageElement)return a.firstChild.src=i,n}let l=document.createElement("img");l.src=i;let r=nt(s);r&&(l.alt=r),l.setAttribute("data-vscode-context",JSON.stringify({webviewSection:"image",outputId:s.id,preventDefaultContextMenuItems:!0}));let c=document.createElement("div");return c.classList.add("display"),c.appendChild(l),t.appendChild(c),n}var Ut=["type","src","nonce","noModule","async"],tt=s=>{let t=Array.from(s.getElementsByTagName("script"));for(let e=0;e<t.length;e++){let i=t[e],n=document.createElement("script"),l=k?.createScript(i.innerText)??i.innerText;n.text=l;for(let r of Ut){let c=i[r]||i.getAttribute&&i.getAttribute(r);c&&n.setAttribute(r,c)}s.appendChild(n).parentNode.removeChild(n)}};function nt(s){let t=s.metadata;if(typeof t=="object"&&t&&"vscode_altText"in t&&typeof t.vscode_altText=="string")return t.vscode_altText}function dt(s,t){if(s.mime.indexOf("svg")>-1){let e=t.querySelector("svg"),i=nt(s);if(e&&i){let n=document.createElement("title");n.innerText=i,e.prepend(n)}}}async function kt(s,t,e,i){W(t);let n=document.createElement("div"),l=s.text(),r=k?.createHTML(l)??l;n.innerHTML=r,dt(s,n);for(let c of i)if(n=await c.postRender(s,n,e)??n,e.aborted)return;t.appendChild(n),tt(n)}async function Dt(s,t,e,i){let n=s.text();for(let a of i)if(n=await a.preEvaluate(s,t,n,e)??n,e.aborted)return;let l=document.createElement("script");l.type="module",l.textContent=n;let r=document.createElement("div"),c=k?.createHTML(l.outerHTML)??l.outerHTML;r.innerHTML=c,t.appendChild(r),tt(r)}function K(){let s=[];return{push:(...e)=>{s.push(...e)},dispose:()=>{s.forEach(e=>e.dispose())}}}function wt(s,t,e,i){let n=K();W(t);let l;try{l=JSON.parse(s.text())}catch(r){return console.log(r),n}if(l.stack){t.classList.add("traceback");let r=Z(l.stack),c=q(s,e.settings),a={linesLimit:e.settings.lineLimit,scrollable:c,trustHtml:i,linkifyFilePaths:e.settings.linkifyFilePaths},_=S(s.id,r??"",a),m=document.createElement("div");m.classList.toggle("word-wrap",e.settings.outputWordWrap),n.push(e.onDidChangeSettings(b=>{m.classList.toggle("word-wrap",b.outputWordWrap)})),m.classList.toggle("scrollable",c),m.appendChild(_),t.appendChild(m),V(m,n)}else{let r=document.createElement("div"),c=l.name&&l.message?`${l.name}: ${l.message}`:l.name||l.message;c&&(r.innerText=c,t.appendChild(r))}return t.classList.add("error"),n}function Ot(s){let t=s.parentElement,e,i=t?.previousSibling;for(;i;){let n=i.firstChild;if(!n||!n.classList.contains("output-stream"))break;e=n.firstChild,i=i?.previousSibling}return e}function Q(s){let t=s.target;t.scrollTop===0?t.classList.remove("more-above"):t.classList.add("more-above")}function h(s){s.ctrlKey||s.shiftKey||(s.code==="ArrowDown"||s.code==="ArrowUp"||s.code==="End"||s.code==="Home"||s.code==="PageUp"||s.code==="PageDown")&&s.stopPropagation()}function V(s,t,e){if(s.classList.contains(G)){let i=s.scrollHeight>s.clientHeight;s.classList.toggle("scrollbar-visible",i),s.scrollTop=e!==void 0?e:s.scrollHeight,i&&(s.addEventListener("scroll",Q),t.push({dispose:()=>s.removeEventListener("scroll",Q)}),s.addEventListener("keydown",h),t.push({dispose:()=>s.removeEventListener("keydown",h)}))}}function It(s){let t=s.querySelector("."+G);if(t&&t.scrollHeight-t.scrollTop-t.clientHeight>2)return t.scrollTop}function q(s,t){let e=s.metadata;return typeof e=="object"&&e&&"scrollable"in e&&typeof e.scrollable=="boolean"?e.scrollable:t.outputScrolling}function C(s,t,e,i){let n=K(),l=q(s,i.settings),r={linesLimit:i.settings.lineLimit,scrollable:l,trustHtml:!1,error:e,linkifyFilePaths:i.settings.linkifyFilePaths};t.classList.add("output-stream");let c=l?It(t):void 0,a=Ot(t);if(a){let _=a.querySelector(`[output-item-id="${s.id}"]`);if(_)N(s,_,r);else{let m=S(s.id,s.text(),r);a.appendChild(m)}a.classList.toggle("scrollbar-visible",a.scrollHeight>a.clientHeight),a.scrollTop=c!==void 0?c:a.scrollHeight}else{let _=t.querySelector(`[output-item-id="${s.id}"]`),m=_?.parentElement;if(_&&m)N(s,_,r);else{let b=S(s.id,s.text(),r);for(m=document.createElement("div"),m.appendChild(b);t.firstChild;)t.removeChild(t.firstChild);t.appendChild(m)}m.classList.toggle("scrollable",l),m.classList.toggle("word-wrap",i.settings.outputWordWrap),n.push(i.onDidChangeSettings(b=>{m.classList.toggle("word-wrap",b.outputWordWrap)})),V(m,n,c)}return n}function St(s,t,e){let i=K();W(t);let n=s.text(),l=q(s,e.settings),r={linesLimit:e.settings.lineLimit,scrollable:l,trustHtml:!1,linkifyFilePaths:e.settings.linkifyFilePaths},c=S(s.id,n,r);return c.classList.add("output-plaintext"),e.settings.outputWordWrap&&c.classList.add("word-wrap"),c.classList.toggle("scrollable",l),t.appendChild(c),V(c,i),i}var Jt=s=>{let t=new Map,e=new Set,i=new Set,n=s,l=document.createElement("style");return l.textContent=`
	#container div.output.remove-padding {
		padding-left: 0;
		padding-right: 0;
	}
	.output-plaintext,
	.output-stream,
	.traceback {
		display: inline-block;
		width: 100%;
		line-height: var(--notebook-cell-output-line-height);
		font-family: var(--notebook-cell-output-font-family);
		font-size: var(--notebook-cell-output-font-size);
		user-select: text;
		-webkit-user-select: text;
		-ms-user-select: text;
		cursor: auto;
		word-wrap: break-word;
		/* text/stream output container should scroll but preserve newline character */
		white-space: pre;
	}
	/* When wordwrap turned on, force it to pre-wrap */
	#container div.output_container .word-wrap span {
		white-space: pre-wrap;
	}
	#container div.output>div {
		padding-left: var(--notebook-output-node-left-padding);
		padding-right: var(--notebook-output-node-padding);
		box-sizing: border-box;
		border-width: 1px;
		border-style: solid;
		border-color: transparent;
	}
	#container div.output>div:focus {
		outline: 0;
		border-color: var(--theme-input-focus-border-color);
	}
	#container div.output .scrollable {
		overflow-y: scroll;
		max-height: var(--notebook-cell-output-max-height);
	}
	#container div.output .scrollable.scrollbar-visible {
		border-color: var(--vscode-editorWidget-border);
	}
	#container div.output .scrollable.scrollbar-visible:focus {
		border-color: var(--theme-input-focus-border-color);
	}
	#container div.truncation-message {
		font-style: italic;
		font-family: var(--theme-font-family);
		padding-top: 4px;
	}
	#container div.output .scrollable div {
		cursor: text;
	}
	#container div.output .scrollable div a {
		cursor: pointer;
	}
	#container div.output .scrollable.more-above {
		box-shadow: var(--vscode-scrollbar-shadow) 0 6px 6px -6px inset
	}
	.output-plaintext .code-bold,
	.output-stream .code-bold,
	.traceback .code-bold {
		font-weight: bold;
	}
	.output-plaintext .code-italic,
	.output-stream .code-italic,
	.traceback .code-italic {
		font-style: italic;
	}
	.output-plaintext .code-strike-through,
	.output-stream .code-strike-through,
	.traceback .code-strike-through {
		text-decoration: line-through;
	}
	.output-plaintext .code-underline,
	.output-stream .code-underline,
	.traceback .code-underline {
		text-decoration: underline;
	}
	`,document.body.appendChild(l),{renderOutputItem:async(r,c,a)=>{switch(c.classList.add("remove-padding"),r.mime){case"text/html":case"image/svg+xml":{if(!s.workspace.isTrusted)return;await kt(r,c,a,e);break}case"application/javascript":{if(!s.workspace.isTrusted)return;Dt(r,c,a,i);break}case"image/gif":case"image/png":case"image/jpeg":case"image/git":{t.get(r.id)?.dispose();let _=vt(r,c);t.set(r.id,_)}break;case"application/vnd.code.notebook.error":{t.get(r.id)?.dispose();let _=wt(r,c,n,s.workspace.isTrusted);t.set(r.id,_)}break;case"application/vnd.code.notebook.stdout":case"application/x.notebook.stdout":case"application/x.notebook.stream":{t.get(r.id)?.dispose();let _=C(r,c,!1,n);t.set(r.id,_)}break;case"application/vnd.code.notebook.stderr":case"application/x.notebook.stderr":{t.get(r.id)?.dispose();let _=C(r,c,!0,n);t.set(r.id,_)}break;case"text/plain":{t.get(r.id)?.dispose();let _=St(r,c,n);t.set(r.id,_)}break;default:break}c.querySelector("div")&&(c.querySelector("div").tabIndex=0)},disposeOutputItem:r=>{r?t.get(r)?.dispose():t.forEach(c=>c.dispose())},experimental_registerHtmlRenderingHook:r=>(e.add(r),{dispose:()=>{e.delete(r)}}),experimental_registerJavaScriptRenderingHook:r=>(i.add(r),{dispose:()=>{i.delete(r)}})}};export{Jt as activate};
