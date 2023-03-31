/*!--------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/(function(){var k=["require","exports","vs/base/common/ternarySearchTree","vs/platform/instantiation/common/instantiation","vs/platform/profiling/common/profiling","vs/base/common/path","vs/platform/profiling/common/profilingModel","vs/base/common/arrays","vs/base/common/strings","vs/platform/profiling/electron-sandbox/profileAnalysisWorker","vs/base/common/uri"],E=function(S){for(var c=[],b=0,p=S.length;b<p;b++)c[b]=k[S[b]];return c};define(k[2],E([0,1,7,8]),function(S,c,b,p){"use strict";Object.defineProperty(c,"__esModule",{value:!0}),c.TernarySearchTree=c.UriIterator=c.PathIterator=c.ConfigKeysIterator=c.StringIterator=void 0;class w{constructor(){this.b="",this.c=0}reset(e){return this.b=e,this.c=0,this}next(){return this.c+=1,this}hasNext(){return this.c<this.b.length-1}cmp(e){const i=e.charCodeAt(0),r=this.b.charCodeAt(this.c);return i-r}value(){return this.b[this.c]}}c.StringIterator=w;class v{constructor(e=!0){this.e=e}reset(e){return this.b=e,this.c=0,this.d=0,this.next()}hasNext(){return this.d<this.b.length}next(){this.c=this.d;let e=!0;for(;this.d<this.b.length;this.d++)if(this.b.charCodeAt(this.d)===46)if(e)this.c++;else break;else e=!1;return this}cmp(e){return this.e?(0,p.compareSubstring)(e,this.b,0,e.length,this.c,this.d):(0,p.compareSubstringIgnoreCase)(e,this.b,0,e.length,this.c,this.d)}value(){return this.b.substring(this.c,this.d)}}c.ConfigKeysIterator=v;class m{constructor(e=!0,i=!0){this.f=e,this.g=i}reset(e){this.d=0,this.e=0,this.b=e,this.c=e.length;for(let i=e.length-1;i>=0;i--,this.c--){const r=this.b.charCodeAt(i);if(!(r===47||this.f&&r===92))break}return this.next()}hasNext(){return this.e<this.c}next(){this.d=this.e;let e=!0;for(;this.e<this.c;this.e++){const i=this.b.charCodeAt(this.e);if(i===47||this.f&&i===92)if(e)this.d++;else break;else e=!1}return this}cmp(e){return this.g?(0,p.compareSubstring)(e,this.b,0,e.length,this.d,this.e):(0,p.compareSubstringIgnoreCase)(e,this.b,0,e.length,this.d,this.e)}value(){return this.b.substring(this.d,this.e)}}c.PathIterator=m;var l;(function(f){f[f.Scheme=1]="Scheme",f[f.Authority=2]="Authority",f[f.Path=3]="Path",f[f.Query=4]="Query",f[f.Fragment=5]="Fragment"})(l||(l={}));class u{constructor(e,i){this.f=e,this.g=i,this.d=[],this.e=0}reset(e){return this.c=e,this.d=[],this.c.scheme&&this.d.push(1),this.c.authority&&this.d.push(2),this.c.path&&(this.b=new m(!1,!this.f(e)),this.b.reset(e.path),this.b.value()&&this.d.push(3)),this.g(e)||(this.c.query&&this.d.push(4),this.c.fragment&&this.d.push(5)),this.e=0,this}next(){return this.d[this.e]===3&&this.b.hasNext()?this.b.next():this.e+=1,this}hasNext(){return this.d[this.e]===3&&this.b.hasNext()||this.e<this.d.length-1}cmp(e){if(this.d[this.e]===1)return(0,p.compareIgnoreCase)(e,this.c.scheme);if(this.d[this.e]===2)return(0,p.compareIgnoreCase)(e,this.c.authority);if(this.d[this.e]===3)return this.b.cmp(e);if(this.d[this.e]===4)return(0,p.compare)(e,this.c.query);if(this.d[this.e]===5)return(0,p.compare)(e,this.c.fragment);throw new Error}value(){if(this.d[this.e]===1)return this.c.scheme;if(this.d[this.e]===2)return this.c.authority;if(this.d[this.e]===3)return this.b.value();if(this.d[this.e]===4)return this.c.query;if(this.d[this.e]===5)return this.c.fragment;throw new Error}}c.UriIterator=u;class d{constructor(){this.height=1}isEmpty(){return!this.left&&!this.mid&&!this.right&&!this.value}rotateLeft(){const e=this.right;return this.right=e.left,e.left=this,this.updateHeight(),e.updateHeight(),e}rotateRight(){const e=this.left;return this.left=e.right,e.right=this,this.updateHeight(),e.updateHeight(),e}updateHeight(){this.height=1+Math.max(this.heightLeft,this.heightRight)}balanceFactor(){return this.heightRight-this.heightLeft}get heightLeft(){return this.left?.height??0}get heightRight(){return this.right?.height??0}}var g;(function(f){f[f.Left=-1]="Left",f[f.Mid=0]="Mid",f[f.Right=1]="Right"})(g||(g={}));class a{static forUris(e=()=>!1,i=()=>!1){return new a(new u(e,i))}static forPaths(e=!1){return new a(new m(void 0,!e))}static forStrings(){return new a(new w)}static forConfigKeys(){return new a(new v)}constructor(e){this.b=e}clear(){this.c=void 0}fill(e,i){if(i){const r=i.slice(0);(0,b.shuffle)(r);for(const s of r)this.set(s,e)}else{const r=e.slice(0);(0,b.shuffle)(r);for(const s of r)this.set(s[0],s[1])}}set(e,i){const r=this.b.reset(e);let s;this.c||(this.c=new d,this.c.segment=r.value());const t=[];for(s=this.c;;){const o=r.cmp(s.segment);if(o>0)s.left||(s.left=new d,s.left.segment=r.value()),t.push([-1,s]),s=s.left;else if(o<0)s.right||(s.right=new d,s.right.segment=r.value()),t.push([1,s]),s=s.right;else if(r.hasNext())r.next(),s.mid||(s.mid=new d,s.mid.segment=r.value()),t.push([0,s]),s=s.mid;else break}const n=s.value;s.value=i,s.key=e;for(let o=t.length-1;o>=0;o--){const h=t[o][1];h.updateHeight();const N=h.balanceFactor();if(N<-1||N>1){const I=t[o][0],T=t[o+1][0];if(I===1&&T===1)t[o][1]=h.rotateLeft();else if(I===-1&&T===-1)t[o][1]=h.rotateRight();else if(I===1&&T===-1)h.right=t[o+1][1]=t[o+1][1].rotateRight(),t[o][1]=h.rotateLeft();else if(I===-1&&T===1)h.left=t[o+1][1]=t[o+1][1].rotateLeft(),t[o][1]=h.rotateRight();else throw new Error;if(o>0)switch(t[o-1][0]){case-1:t[o-1][1].left=t[o][1];break;case 1:t[o-1][1].right=t[o][1];break;case 0:t[o-1][1].mid=t[o][1];break}else this.c=t[0][1]}}return n}get(e){return this.d(e)?.value}d(e){const i=this.b.reset(e);let r=this.c;for(;r;){const s=i.cmp(r.segment);if(s>0)r=r.left;else if(s<0)r=r.right;else if(i.hasNext())i.next(),r=r.mid;else break}return r}has(e){const i=this.d(e);return!(i?.value===void 0&&i?.mid===void 0)}delete(e){return this.e(e,!1)}deleteSuperstr(e){return this.e(e,!0)}e(e,i){const r=this.b.reset(e),s=[];let t=this.c;for(;t;){const n=r.cmp(t.segment);if(n>0)s.push([-1,t]),t=t.left;else if(n<0)s.push([1,t]),t=t.right;else if(r.hasNext())r.next(),s.push([0,t]),t=t.mid;else break}if(!!t){if(i?(t.left=void 0,t.mid=void 0,t.right=void 0,t.height=1):(t.key=void 0,t.value=void 0),!t.mid&&!t.value)if(t.left&&t.right){const n=this.f(t.right);if(n.key){const{key:o,value:h,segment:N}=n;this.e(n.key,!1),t.key=o,t.value=h,t.segment=N}}else{const n=t.left??t.right;if(s.length>0){const[o,h]=s[s.length-1];switch(o){case-1:h.left=n;break;case 0:h.mid=n;break;case 1:h.right=n;break}}else this.c=n}for(let n=s.length-1;n>=0;n--){const o=s[n][1];o.updateHeight();const h=o.balanceFactor();if(h>1?(o.right.balanceFactor()>=0||(o.right=o.right.rotateRight()),s[n][1]=o.rotateLeft()):h<-1&&(o.left.balanceFactor()<=0||(o.left=o.left.rotateLeft()),s[n][1]=o.rotateRight()),n>0)switch(s[n-1][0]){case-1:s[n-1][1].left=s[n][1];break;case 1:s[n-1][1].right=s[n][1];break;case 0:s[n-1][1].mid=s[n][1];break}else this.c=s[0][1]}}}f(e){for(;e.left;)e=e.left;return e}findSubstr(e){const i=this.b.reset(e);let r=this.c,s;for(;r;){const t=i.cmp(r.segment);if(t>0)r=r.left;else if(t<0)r=r.right;else if(i.hasNext())i.next(),s=r.value||s,r=r.mid;else break}return r&&r.value||s}findSuperstr(e){return this.g(e,!1)}g(e,i){const r=this.b.reset(e);let s=this.c;for(;s;){const t=r.cmp(s.segment);if(t>0)s=s.left;else if(t<0)s=s.right;else if(r.hasNext())r.next(),s=s.mid;else return s.mid?this.h(s.mid):i?s.value:void 0}}hasElementOrSubtree(e){return this.g(e,!0)!==void 0}forEach(e){for(const[i,r]of this)e(r,i)}*[Symbol.iterator](){yield*this.h(this.c)}h(e){const i=[];return this.j(e,i),i[Symbol.iterator]()}j(e,i){!e||(e.left&&this.j(e.left,i),e.value&&i.push([e.key,e.value]),e.mid&&this.j(e.mid,i),e.right&&this.j(e.right,i))}_isBalanced(){const e=i=>{if(!i)return!0;const r=i.balanceFactor();return r<-1||r>1?!1:e(i.left)&&e(i.right)};return e(this.c)}}c.TernarySearchTree=a}),define(k[3],E([0,1]),function(S,c){"use strict";Object.defineProperty(c,"__esModule",{value:!0}),c.refineServiceDecorator=c.createDecorator=c.IInstantiationService=c._util=void 0;var b;(function(m){m.serviceIds=new Map,m.DI_TARGET="$di$target",m.DI_DEPENDENCIES="$di$dependencies";function l(u){return u[m.DI_DEPENDENCIES]||[]}m.getServiceDependencies=l})(b=c._util||(c._util={})),c.IInstantiationService=w("instantiationService");function p(m,l,u){l[b.DI_TARGET]===l?l[b.DI_DEPENDENCIES].push({id:m,index:u}):(l[b.DI_DEPENDENCIES]=[{id:m,index:u}],l[b.DI_TARGET]=l)}function w(m){if(b.serviceIds.has(m))return b.serviceIds.get(m);const l=function(u,d,g){if(arguments.length!==3)throw new Error("@IServiceName-decorator can only be used to decorate a parameter");p(l,u,g)};return l.toString=()=>m,b.serviceIds.set(m,l),l}c.createDecorator=w;function v(m){return m}c.refineServiceDecorator=v}),define(k[4],E([0,1,5,3]),function(S,c,b,p){"use strict";Object.defineProperty(c,"__esModule",{value:!0}),c.Utils=c.IV8InspectProfilingService=void 0,c.IV8InspectProfilingService=(0,p.createDecorator)("IV8InspectProfilingService");var w;(function(v){function m(u){return Boolean(u.samples&&u.timeDeltas)}v.isValidProfile=m;function l(u,d="noAbsolutePaths"){for(const g of u.nodes)g.callFrame&&g.callFrame.url&&((0,b.isAbsolute)(g.callFrame.url)||/^\w[\w\d+.-]*:\/\/\/?/.test(g.callFrame.url))&&(g.callFrame.url=(0,b.join)(d,(0,b.basename)(g.callFrame.url)));return u}v.rewriteAbsolutePaths=l})(w=c.Utils||(c.Utils={}))}),define(k[6],E([0,1]),function(S,c){"use strict";Object.defineProperty(c,"__esModule",{value:!0}),c.processNode=c.BottomUpNode=c.buildModel=void 0;const b=(l,u)=>{const d=u[l];if(d.aggregateTime)return d.aggregateTime;let g=d.selfTime;for(const a of d.children)g+=b(a,u);return d.aggregateTime=g},p=l=>{let u=0;const d=new Map,g=a=>{const f=[a.functionName,a.url,a.scriptId,a.lineNumber,a.columnNumber].join(":"),e=d.get(f);if(e)return e.id;const i=u++;return d.set(f,{id:i,callFrame:a,location:{lineNumber:a.lineNumber+1,columnNumber:a.columnNumber+1}}),i};for(const a of l.nodes)a.locationId=g(a.callFrame),a.positionTicks=a.positionTicks?.map(f=>({...f,startLocationId:g({...a.callFrame,lineNumber:f.line-1,columnNumber:0}),endLocationId:g({...a.callFrame,lineNumber:f.line,columnNumber:0})}));return[...d.values()].sort((a,f)=>a.id-f.id).map(a=>({locations:[a.location],callFrame:a.callFrame}))},w=l=>{if(!l.timeDeltas||!l.samples)return{nodes:[],locations:[],samples:l.samples||[],timeDeltas:l.timeDeltas||[],duration:l.endTime-l.startTime};const{samples:u,timeDeltas:d}=l,a=p(l).map((t,n)=>{const o=t.locations[0];return{id:n,selfTime:0,aggregateTime:0,ticks:0,callFrame:t.callFrame,src:o}}),f=new Map,e=t=>{let n=f.get(t);return n===void 0&&(n=f.size,f.set(t,n)),n},i=new Array(l.nodes.length);for(let t=0;t<l.nodes.length;t++){const n=l.nodes[t],o=e(n.id);i[o]={id:o,selfTime:0,aggregateTime:0,locationId:n.locationId,children:n.children?.map(e)||[]};for(const h of n.positionTicks||[])h.startLocationId&&(a[h.startLocationId].ticks+=h.ticks)}for(const t of i)for(const n of t.children)i[n].parent=t.id;const r=l.endTime-l.startTime;let s=r-d[0];for(let t=0;t<d.length-1;t++){const n=d[t+1];i[e(u[t])].selfTime+=n,s-=n}i.length&&(i[e(u[d.length-1])].selfTime+=s,d.push(s));for(let t=0;t<i.length;t++){const n=i[t],o=a[n.locationId];o.aggregateTime+=b(t,i),o.selfTime+=n.selfTime}return{nodes:i,locations:a,samples:u.map(e),timeDeltas:d,duration:r}};c.buildModel=w;class v{static root(){return new v({id:-1,selfTime:0,aggregateTime:0,ticks:0,callFrame:{functionName:"(root)",lineNumber:-1,columnNumber:-1,scriptId:"0",url:""}})}get id(){return this.location.id}get callFrame(){return this.location.callFrame}get src(){return this.location.src}constructor(u,d){this.location=u,this.parent=d,this.children={},this.aggregateTime=0,this.selfTime=0,this.ticks=0,this.childrenSize=0}addNode(u){this.selfTime+=u.selfTime,this.aggregateTime+=u.aggregateTime}}c.BottomUpNode=v;const m=(l,u,d,g=u)=>{let a=l.children[u.locationId];a||(a=new v(d.locations[u.locationId],l),l.childrenSize++,l.children[u.locationId]=a),a.addNode(g),u.parent&&(0,c.processNode)(a,d.nodes[u.parent],d,g)};c.processNode=m}),define(k[9],E([0,1,5,2,10,4,6]),function(S,c,b,p,w,v,m){"use strict";Object.defineProperty(c,"__esModule",{value:!0}),c.create=void 0;function l(){return new u}c.create=l;class u{analyseBottomUp(r){if(!v.Utils.isValidProfile(r))return{kind:1,samples:[]};const s=(0,m.buildModel)(r),t=e(s,5).filter(n=>!n.isSpecial);return t.length===0||t[0].percentage<10?{kind:1,samples:[]}:{kind:2,samples:t}}analyseByUrlCategory(r,s){const t=p.TernarySearchTree.forUris();t.fill(s);const n=(0,m.buildModel)(r),o=new Map;for(const N of n.nodes){const I=n.locations[N.locationId];let T;try{T=t.findSubstr(w.URI.parse(I.callFrame.url))}catch{}T||(T=g(I.callFrame));const F=(o.get(T)??0)+N.selfTime;o.set(T,F)}const h=[];for(const[N,I]of o)h.push([N,I]);return h}}function d(i){return i.functionName.startsWith("(")&&i.functionName.endsWith(")")}function g(i){let r=i.functionName||"(anonymous)";return i.url&&(r+="#",r+=(0,b.basename)(i.url),i.lineNumber>=0&&(r+=":",r+=i.lineNumber+1),i.columnNumber>=0&&(r+=":",r+=i.columnNumber+1)),r}function a(i){let r=i.functionName||"(anonymous)";return i.url&&(r+=" (",r+=i.url,i.lineNumber>=0&&(r+=":",r+=i.lineNumber+1),i.columnNumber>=0&&(r+=":",r+=i.columnNumber+1),r+=")"),r}function f(i,r){const s={};for(const n of i.nodes)s[n.locationId]=(s[n.locationId]||0)+n.selfTime;const t=Object.entries(s).sort(([,n],[,o])=>o-n).slice(0,r).map(([n])=>Number(n));return new Set(t)}function e(i,r){const s=m.BottomUpNode.root(),t=f(i,r);for(const h of i.nodes)t.has(h.locationId)&&((0,m.processNode)(s,h,i),s.addNode(h));const n=Object.values(s.children).sort((h,N)=>N.selfTime-h.selfTime).slice(0,r),o=[];for(const h of n){const N={selfTime:Math.round(h.selfTime/1e3),totalTime:Math.round(h.aggregateTime/1e3),location:g(h.callFrame),absLocation:a(h.callFrame),url:h.callFrame.url,caller:[],percentage:Math.round(h.selfTime/(i.duration/100)),isSpecial:d(h.callFrame)},I=[h];for(;I.length;){const T=I.pop();let y;for(const F of Object.values(T.children))(!y||y.selfTime<F.selfTime)&&(y=F);if(y){const F=Math.round(y.selfTime/(T.selfTime/100));N.caller.push({percentage:F,location:g(y.callFrame),absLocation:a(y.callFrame)}),I.push(y)}}o.push(N)}return o}})}).call(this);

//# sourceMappingURL=https://ticino.blob.core.windows.net/sourcemaps/7f329fe6c66b0f86ae1574c2911b681ad5a45d63/core/vs/platform/profiling/electron-sandbox/profileAnalysisWorker.js.map
