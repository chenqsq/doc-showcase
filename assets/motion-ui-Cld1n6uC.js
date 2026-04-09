import{r as s,j as h,R as G,a as R}from"./react-core-C2jVpWOr.js";/**
 * @license lucide-react v1.7.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const J=(...e)=>e.filter((t,o,n)=>!!t&&t.trim()!==""&&n.indexOf(t)===o).join(" ").trim();/**
 * @license lucide-react v1.7.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const _e=e=>e.replace(/([a-z0-9])([A-Z])/g,"$1-$2").toLowerCase();/**
 * @license lucide-react v1.7.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const we=e=>e.replace(/^([A-Z])|[\s-_]+(\w)/g,(t,o,n)=>n?n.toUpperCase():o.toLowerCase());/**
 * @license lucide-react v1.7.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Z=e=>{const t=we(e);return t.charAt(0).toUpperCase()+t.slice(1)};/**
 * @license lucide-react v1.7.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */var W={xmlns:"http://www.w3.org/2000/svg",width:24,height:24,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:2,strokeLinecap:"round",strokeLinejoin:"round"};/**
 * @license lucide-react v1.7.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Re=e=>{for(const t in e)if(t.startsWith("aria-")||t==="role"||t==="title")return!0;return!1},Ie=s.createContext({}),Ne=()=>s.useContext(Ie),Te=s.forwardRef(({color:e,size:t,strokeWidth:o,absoluteStrokeWidth:n,className:r="",children:a,iconNode:i,...c},u)=>{const{size:l=24,strokeWidth:d=2,absoluteStrokeWidth:f=!1,color:m="currentColor",className:v=""}=Ne()??{},b=n??f?Number(o??d)*24/Number(t??l):o??d;return s.createElement("svg",{ref:u,...W,width:t??l??W.width,height:t??l??W.height,stroke:e??m,strokeWidth:b,className:J("lucide",v,r),...!a&&!Re(c)&&{"aria-hidden":"true"},...c},[...i.map(([g,p])=>s.createElement(g,p)),...Array.isArray(a)?a:[a]])});/**
 * @license lucide-react v1.7.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const y=(e,t)=>{const o=s.forwardRef(({className:n,...r},a)=>s.createElement(Te,{ref:a,iconNode:t,className:J(`lucide-${_e(Z(e))}`,`lucide-${e}`,n),...r}));return o.displayName=Z(e),o};/**
 * @license lucide-react v1.7.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Pe=[["path",{d:"M5 12h14",key:"1ays0h"}],["path",{d:"m12 5 7 7-7 7",key:"xquz4c"}]],En=y("arrow-right",Pe);/**
 * @license lucide-react v1.7.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Ae=[["path",{d:"M12 7v14",key:"1akyts"}],["path",{d:"M16 12h2",key:"7q9ll5"}],["path",{d:"M16 8h2",key:"msurwy"}],["path",{d:"M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z",key:"ruj8y"}],["path",{d:"M6 12h2",key:"32wvfc"}],["path",{d:"M6 8h2",key:"30oboj"}]],bn=y("book-open-text",Ae);/**
 * @license lucide-react v1.7.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const $e=[["path",{d:"M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z",key:"p7xjir"}]],Sn=y("cloud",$e);/**
 * @license lucide-react v1.7.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Oe=[["path",{d:"m15 15 6 6",key:"1s409w"}],["path",{d:"m15 9 6-6",key:"ko1vev"}],["path",{d:"M21 16v5h-5",key:"1ck2sf"}],["path",{d:"M21 8V3h-5",key:"1qoq8a"}],["path",{d:"M3 16v5h5",key:"1t08am"}],["path",{d:"m3 21 6-6",key:"wwnumi"}],["path",{d:"M3 8V3h5",key:"1ln10m"}],["path",{d:"M9 9 3 3",key:"v551iv"}]],kn=y("expand",Oe);/**
 * @license lucide-react v1.7.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const je=[["path",{d:"M15 3h6v6",key:"1q9fwt"}],["path",{d:"M10 14 21 3",key:"gplh6r"}],["path",{d:"M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6",key:"a6xqqp"}]],Mn=y("external-link",je);/**
 * @license lucide-react v1.7.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Fe=[["circle",{cx:"15",cy:"19",r:"2",key:"u2pros"}],["path",{d:"M20.9 19.8A2 2 0 0 0 22 18V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2h5.1",key:"1jj40k"}],["path",{d:"M15 11v-1",key:"cntcp"}],["path",{d:"M15 17v-2",key:"1279jj"}]],_n=y("folder-archive",Fe);/**
 * @license lucide-react v1.7.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Le=[["path",{d:"M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z",key:"nnexq3"}],["path",{d:"M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12",key:"mt58a7"}]],wn=y("leaf",Le);/**
 * @license lucide-react v1.7.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const De=[["rect",{width:"8",height:"18",x:"3",y:"3",rx:"1",key:"oynpb5"}],["path",{d:"M7 3v18",key:"bbkbws"}],["path",{d:"M20.4 18.9c.2.5-.1 1.1-.6 1.3l-1.9.7c-.5.2-1.1-.1-1.3-.6L11.1 5.1c-.2-.5.1-1.1.6-1.3l1.9-.7c.5-.2 1.1.1 1.3.6Z",key:"1qboyk"}]],Rn=y("library-big",De);/**
 * @license lucide-react v1.7.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Ve=[["path",{d:"M8 5h13",key:"1pao27"}],["path",{d:"M13 12h8",key:"h98zly"}],["path",{d:"M13 19h8",key:"c3s6r1"}],["path",{d:"M3 10a2 2 0 0 0 2 2h3",key:"1npucw"}],["path",{d:"M3 5v12a2 2 0 0 0 2 2h3",key:"x1gjn2"}]],In=y("list-tree",Ve);/**
 * @license lucide-react v1.7.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const We=[["path",{d:"M4 5h16",key:"1tepv9"}],["path",{d:"M4 12h16",key:"1lakjw"}],["path",{d:"M4 19h16",key:"1djgab"}]],Nn=y("menu",We);/**
 * @license lucide-react v1.7.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Ue=[["path",{d:"M5 12h14",key:"1ays0h"}]],Tn=y("minus",Ue);/**
 * @license lucide-react v1.7.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Be=[["path",{d:"M18 5h4",key:"1lhgn2"}],["path",{d:"M20 3v4",key:"1olli1"}],["path",{d:"M20.985 12.486a9 9 0 1 1-9.473-9.472c.405-.022.617.46.402.803a6 6 0 0 0 8.268 8.268c.344-.215.825-.004.803.401",key:"kfwtm"}]],Pn=y("moon-star",Be);/**
 * @license lucide-react v1.7.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Ge=[["path",{d:"M12 22a1 1 0 0 1 0-20 10 9 0 0 1 10 9 5 5 0 0 1-5 5h-2.25a1.75 1.75 0 0 0-1.4 2.8l.3.4a1.75 1.75 0 0 1-1.4 2.8z",key:"e79jfc"}],["circle",{cx:"13.5",cy:"6.5",r:".5",fill:"currentColor",key:"1okk4w"}],["circle",{cx:"17.5",cy:"10.5",r:".5",fill:"currentColor",key:"f64h9f"}],["circle",{cx:"6.5",cy:"12.5",r:".5",fill:"currentColor",key:"qy21gx"}],["circle",{cx:"8.5",cy:"7.5",r:".5",fill:"currentColor",key:"fotxhn"}]],An=y("palette",Ge);/**
 * @license lucide-react v1.7.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const ze=[["rect",{width:"18",height:"18",x:"3",y:"3",rx:"2",key:"afitv7"}],["path",{d:"M9 3v18",key:"fh3hqa"}],["path",{d:"m16 15-3-3 3-3",key:"14y99z"}]],$n=y("panel-left-close",ze);/**
 * @license lucide-react v1.7.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Ke=[["rect",{width:"18",height:"18",x:"3",y:"3",rx:"2",key:"afitv7"}],["path",{d:"M9 3v18",key:"fh3hqa"}],["path",{d:"m14 9 3 3-3 3",key:"8010ee"}]],On=y("panel-left-open",Ke);/**
 * @license lucide-react v1.7.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const qe=[["rect",{width:"18",height:"18",x:"3",y:"3",rx:"2",key:"afitv7"}],["path",{d:"M3 9h18",key:"1pudct"}],["path",{d:"m15 14-3 3-3-3",key:"g215vf"}]],jn=y("panel-top-open",qe);/**
 * @license lucide-react v1.7.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Ze=[["path",{d:"M5 12h14",key:"1ays0h"}],["path",{d:"M12 5v14",key:"s699le"}]],Fn=y("plus",Ze);/**
 * @license lucide-react v1.7.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const He=[["path",{d:"M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8",key:"1357e3"}],["path",{d:"M3 3v5h5",key:"1xhq8a"}]],Ln=y("rotate-ccw",He);/**
 * @license lucide-react v1.7.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Ye=[["path",{d:"m21 21-4.34-4.34",key:"14j7rj"}],["circle",{cx:"11",cy:"11",r:"8",key:"4ej97u"}]],Dn=y("search",Ye);/**
 * @license lucide-react v1.7.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Xe=[["circle",{cx:"12",cy:"12",r:"4",key:"4exip2"}],["path",{d:"M12 3v1",key:"1asbbs"}],["path",{d:"M12 20v1",key:"1wcdkc"}],["path",{d:"M3 12h1",key:"lp3yf2"}],["path",{d:"M20 12h1",key:"1vloll"}],["path",{d:"m18.364 5.636-.707.707",key:"1hakh0"}],["path",{d:"m6.343 17.657-.707.707",key:"18m9nf"}],["path",{d:"m5.636 5.636.707.707",key:"1xv1c5"}],["path",{d:"m17.657 17.657.707.707",key:"vl76zb"}]],Vn=y("sun-medium",Xe);/**
 * @license lucide-react v1.7.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Je=[["path",{d:"M12 4v16",key:"1654pz"}],["path",{d:"M4 7V5a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v2",key:"e0r10z"}],["path",{d:"M9 20h6",key:"s66wpe"}]],Wn=y("type",Je);/**
 * @license lucide-react v1.7.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Qe=[["path",{d:"M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.106-3.105c.32-.322.863-.22.983.218a6 6 0 0 1-8.259 7.057l-7.91 7.91a1 1 0 0 1-2.999-3l7.91-7.91a6 6 0 0 1 7.057-8.259c.438.12.54.662.219.984z",key:"1ngwbx"}]],Un=y("wrench",Qe);/**
 * @license lucide-react v1.7.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const et=[["path",{d:"M18 6 6 18",key:"1bl5f8"}],["path",{d:"m6 6 12 12",key:"d8bk6v"}]],Bn=y("x",et);/**
 * @license lucide-react v1.7.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const tt=[["circle",{cx:"11",cy:"11",r:"8",key:"4ej97u"}],["line",{x1:"21",x2:"16.65",y1:"21",y2:"16.65",key:"13gj7c"}],["line",{x1:"11",x2:"11",y1:"8",y2:"14",key:"1vmskp"}],["line",{x1:"8",x2:"14",y1:"11",y2:"11",key:"durymu"}]],Gn=y("zoom-in",tt);/**
 * @license lucide-react v1.7.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const nt=[["circle",{cx:"11",cy:"11",r:"8",key:"4ej97u"}],["line",{x1:"21",x2:"16.65",y1:"21",y2:"16.65",key:"13gj7c"}],["line",{x1:"8",x2:"14",y1:"11",y2:"11",key:"durymu"}]],zn=y("zoom-out",nt);function H(e,t){if(typeof e=="function")return e(t);e!=null&&(e.current=t)}function L(...e){return t=>{let o=!1;const n=e.map(r=>{const a=H(r,t);return!o&&typeof a=="function"&&(o=!0),a});if(o)return()=>{for(let r=0;r<n.length;r++){const a=n[r];typeof a=="function"?a():H(e[r],null)}}}}function O(...e){return s.useCallback(L(...e),e)}var ot=Symbol.for("react.lazy"),j=G[" use ".trim().toString()];function rt(e){return typeof e=="object"&&e!==null&&"then"in e}function Q(e){return e!=null&&typeof e=="object"&&"$$typeof"in e&&e.$$typeof===ot&&"_payload"in e&&rt(e._payload)}function ee(e){const t=at(e),o=s.forwardRef((n,r)=>{let{children:a,...i}=n;Q(a)&&typeof j=="function"&&(a=j(a._payload));const c=s.Children.toArray(a),u=c.find(it);if(u){const l=u.props.children,d=c.map(f=>f===u?s.Children.count(l)>1?s.Children.only(null):s.isValidElement(l)?l.props.children:null:f);return h.jsx(t,{...i,ref:r,children:s.isValidElement(l)?s.cloneElement(l,void 0,d):null})}return h.jsx(t,{...i,ref:r,children:a})});return o.displayName=`${e}.Slot`,o}var Kn=ee("Slot");function at(e){const t=s.forwardRef((o,n)=>{let{children:r,...a}=o;if(Q(r)&&typeof j=="function"&&(r=j(r._payload)),s.isValidElement(r)){const i=lt(r),c=ct(a,r.props);return r.type!==s.Fragment&&(c.ref=n?L(n,i):i),s.cloneElement(r,c)}return s.Children.count(r)>1?s.Children.only(null):null});return t.displayName=`${e}.SlotClone`,t}var st=Symbol("radix.slottable");function it(e){return s.isValidElement(e)&&typeof e.type=="function"&&"__radixId"in e.type&&e.type.__radixId===st}function ct(e,t){const o={...t};for(const n in t){const r=e[n],a=t[n];/^on[A-Z]/.test(n)?r&&a?o[n]=(...c)=>{const u=a(...c);return r(...c),u}:r&&(o[n]=r):n==="style"?o[n]={...r,...a}:n==="className"&&(o[n]=[r,a].filter(Boolean).join(" "))}return{...e,...o}}function lt(e){var n,r;let t=(n=Object.getOwnPropertyDescriptor(e.props,"ref"))==null?void 0:n.get,o=t&&"isReactWarning"in t&&t.isReactWarning;return o?e.ref:(t=(r=Object.getOwnPropertyDescriptor(e,"ref"))==null?void 0:r.get,o=t&&"isReactWarning"in t&&t.isReactWarning,o?e.props.ref:e.props.ref||e.ref)}var ut=["a","button","div","form","h2","h3","img","input","label","li","nav","ol","p","select","span","svg","ul"],dt=ut.reduce((e,t)=>{const o=ee(`Primitive.${t}`),n=s.forwardRef((r,a)=>{const{asChild:i,...c}=r,u=i?o:t;return typeof window<"u"&&(window[Symbol.for("radix-ui")]=!0),h.jsx(u,{...c,ref:a})});return n.displayName=`Primitive.${t}`,{...e,[t]:n}},{}),ft="Separator",Y="horizontal",pt=["horizontal","vertical"],te=s.forwardRef((e,t)=>{const{decorative:o,orientation:n=Y,...r}=e,a=mt(n)?n:Y,c=o?{role:"none"}:{"aria-orientation":a==="vertical"?a:void 0,role:"separator"};return h.jsx(dt.div,{"data-orientation":a,...c,...r,ref:t})});te.displayName=ft;function mt(e){return pt.includes(e)}var qn=te;function _(e,t,{checkForDefaultPrevented:o=!0}={}){return function(r){if(e==null||e(r),o===!1||!r.defaultPrevented)return t==null?void 0:t(r)}}function z(e,t=[]){let o=[];function n(a,i){const c=s.createContext(i),u=o.length;o=[...o,i];const l=f=>{var x;const{scope:m,children:v,...b}=f,g=((x=m==null?void 0:m[e])==null?void 0:x[u])||c,p=s.useMemo(()=>b,Object.values(b));return h.jsx(g.Provider,{value:p,children:v})};l.displayName=a+"Provider";function d(f,m){var g;const v=((g=m==null?void 0:m[e])==null?void 0:g[u])||c,b=s.useContext(v);if(b)return b;if(i!==void 0)return i;throw new Error(`\`${f}\` must be used within \`${a}\``)}return[l,d]}const r=()=>{const a=o.map(i=>s.createContext(i));return function(c){const u=(c==null?void 0:c[e])||a;return s.useMemo(()=>({[`__scope${e}`]:{...c,[e]:u}}),[c,u])}};return r.scopeName=e,[n,ht(r,...t)]}function ht(...e){const t=e[0];if(e.length===1)return t;const o=()=>{const n=e.map(r=>({useScope:r(),scopeName:r.scopeName}));return function(a){const i=n.reduce((c,{useScope:u,scopeName:l})=>{const f=u(a)[`__scope${l}`];return{...c,...f}},{});return s.useMemo(()=>({[`__scope${t.scopeName}`]:i}),[i])}};return o.scopeName=t.scopeName,o}function X(e){const t=yt(e),o=s.forwardRef((n,r)=>{const{children:a,...i}=n,c=s.Children.toArray(a),u=c.find(gt);if(u){const l=u.props.children,d=c.map(f=>f===u?s.Children.count(l)>1?s.Children.only(null):s.isValidElement(l)?l.props.children:null:f);return h.jsx(t,{...i,ref:r,children:s.isValidElement(l)?s.cloneElement(l,void 0,d):null})}return h.jsx(t,{...i,ref:r,children:a})});return o.displayName=`${e}.Slot`,o}function yt(e){const t=s.forwardRef((o,n)=>{const{children:r,...a}=o;if(s.isValidElement(r)){const i=xt(r),c=Ct(a,r.props);return r.type!==s.Fragment&&(c.ref=n?L(n,i):i),s.cloneElement(r,c)}return s.Children.count(r)>1?s.Children.only(null):null});return t.displayName=`${e}.SlotClone`,t}var vt=Symbol("radix.slottable");function gt(e){return s.isValidElement(e)&&typeof e.type=="function"&&"__radixId"in e.type&&e.type.__radixId===vt}function Ct(e,t){const o={...t};for(const n in t){const r=e[n],a=t[n];/^on[A-Z]/.test(n)?r&&a?o[n]=(...c)=>{const u=a(...c);return r(...c),u}:r&&(o[n]=r):n==="style"?o[n]={...r,...a}:n==="className"&&(o[n]=[r,a].filter(Boolean).join(" "))}return{...e,...o}}function xt(e){var n,r;let t=(n=Object.getOwnPropertyDescriptor(e.props,"ref"))==null?void 0:n.get,o=t&&"isReactWarning"in t&&t.isReactWarning;return o?e.ref:(t=(r=Object.getOwnPropertyDescriptor(e,"ref"))==null?void 0:r.get,o=t&&"isReactWarning"in t&&t.isReactWarning,o?e.props.ref:e.props.ref||e.ref)}function Et(e){const t=e+"CollectionProvider",[o,n]=z(t),[r,a]=o(t,{collectionRef:{current:null},itemMap:new Map}),i=g=>{const{scope:p,children:x}=g,M=R.useRef(null),C=R.useRef(new Map).current;return h.jsx(r,{scope:p,itemMap:C,collectionRef:M,children:x})};i.displayName=t;const c=e+"CollectionSlot",u=X(c),l=R.forwardRef((g,p)=>{const{scope:x,children:M}=g,C=a(c,x),S=O(p,C.collectionRef);return h.jsx(u,{ref:S,children:M})});l.displayName=c;const d=e+"CollectionItemSlot",f="data-radix-collection-item",m=X(d),v=R.forwardRef((g,p)=>{const{scope:x,children:M,...C}=g,S=R.useRef(null),I=O(p,S),N=a(d,x);return R.useEffect(()=>(N.itemMap.set(S,{ref:S,...C}),()=>void N.itemMap.delete(S))),h.jsx(m,{[f]:"",ref:I,children:M})});v.displayName=d;function b(g){const p=a(e+"CollectionConsumer",g);return R.useCallback(()=>{const M=p.collectionRef.current;if(!M)return[];const C=Array.from(M.querySelectorAll(`[${f}]`));return Array.from(p.itemMap.values()).sort((N,A)=>C.indexOf(N.ref.current)-C.indexOf(A.ref.current))},[p.collectionRef,p.itemMap])}return[{Provider:i,Slot:l,ItemSlot:v},b,n]}var F=globalThis!=null&&globalThis.document?s.useLayoutEffect:()=>{},bt=G[" useId ".trim().toString()]||(()=>{}),St=0;function ne(e){const[t,o]=s.useState(bt());return F(()=>{o(n=>n??String(St++))},[e]),t?`radix-${t}`:""}function kt(e){const t=Mt(e),o=s.forwardRef((n,r)=>{const{children:a,...i}=n,c=s.Children.toArray(a),u=c.find(wt);if(u){const l=u.props.children,d=c.map(f=>f===u?s.Children.count(l)>1?s.Children.only(null):s.isValidElement(l)?l.props.children:null:f);return h.jsx(t,{...i,ref:r,children:s.isValidElement(l)?s.cloneElement(l,void 0,d):null})}return h.jsx(t,{...i,ref:r,children:a})});return o.displayName=`${e}.Slot`,o}function Mt(e){const t=s.forwardRef((o,n)=>{const{children:r,...a}=o;if(s.isValidElement(r)){const i=It(r),c=Rt(a,r.props);return r.type!==s.Fragment&&(c.ref=n?L(n,i):i),s.cloneElement(r,c)}return s.Children.count(r)>1?s.Children.only(null):null});return t.displayName=`${e}.SlotClone`,t}var _t=Symbol("radix.slottable");function wt(e){return s.isValidElement(e)&&typeof e.type=="function"&&"__radixId"in e.type&&e.type.__radixId===_t}function Rt(e,t){const o={...t};for(const n in t){const r=e[n],a=t[n];/^on[A-Z]/.test(n)?r&&a?o[n]=(...c)=>{const u=a(...c);return r(...c),u}:r&&(o[n]=r):n==="style"?o[n]={...r,...a}:n==="className"&&(o[n]=[r,a].filter(Boolean).join(" "))}return{...e,...o}}function It(e){var n,r;let t=(n=Object.getOwnPropertyDescriptor(e.props,"ref"))==null?void 0:n.get,o=t&&"isReactWarning"in t&&t.isReactWarning;return o?e.ref:(t=(r=Object.getOwnPropertyDescriptor(e,"ref"))==null?void 0:r.get,o=t&&"isReactWarning"in t&&t.isReactWarning,o?e.props.ref:e.props.ref||e.ref)}var Nt=["a","button","div","form","h2","h3","img","input","label","li","nav","ol","p","select","span","svg","ul"],T=Nt.reduce((e,t)=>{const o=kt(`Primitive.${t}`),n=s.forwardRef((r,a)=>{const{asChild:i,...c}=r,u=i?o:t;return typeof window<"u"&&(window[Symbol.for("radix-ui")]=!0),h.jsx(u,{...c,ref:a})});return n.displayName=`Primitive.${t}`,{...e,[t]:n}},{});function Tt(e){const t=s.useRef(e);return s.useEffect(()=>{t.current=e}),s.useMemo(()=>(...o)=>{var n;return(n=t.current)==null?void 0:n.call(t,...o)},[])}var Pt=G[" useInsertionEffect ".trim().toString()]||F;function oe({prop:e,defaultProp:t,onChange:o=()=>{},caller:n}){const[r,a,i]=At({defaultProp:t,onChange:o}),c=e!==void 0,u=c?e:r;{const d=s.useRef(e!==void 0);s.useEffect(()=>{const f=d.current;f!==c&&console.warn(`${n} is changing from ${f?"controlled":"uncontrolled"} to ${c?"controlled":"uncontrolled"}. Components should not switch from controlled to uncontrolled (or vice versa). Decide between using a controlled or uncontrolled value for the lifetime of the component.`),d.current=c},[c,n])}const l=s.useCallback(d=>{var f;if(c){const m=$t(d)?d(e):d;m!==e&&((f=i.current)==null||f.call(i,m))}else a(d)},[c,e,a,i]);return[u,l]}function At({defaultProp:e,onChange:t}){const[o,n]=s.useState(e),r=s.useRef(o),a=s.useRef(t);return Pt(()=>{a.current=t},[t]),s.useEffect(()=>{var i;r.current!==o&&((i=a.current)==null||i.call(a,o),r.current=o)},[o,r]),[o,n,a]}function $t(e){return typeof e=="function"}var Ot=s.createContext(void 0);function re(e){const t=s.useContext(Ot);return e||t||"ltr"}var U="rovingFocusGroup.onEntryFocus",jt={bubbles:!1,cancelable:!0},P="RovingFocusGroup",[B,ae,Ft]=Et(P),[Lt,se]=z(P,[Ft]),[Dt,Vt]=Lt(P),ie=s.forwardRef((e,t)=>h.jsx(B.Provider,{scope:e.__scopeRovingFocusGroup,children:h.jsx(B.Slot,{scope:e.__scopeRovingFocusGroup,children:h.jsx(Wt,{...e,ref:t})})}));ie.displayName=P;var Wt=s.forwardRef((e,t)=>{const{__scopeRovingFocusGroup:o,orientation:n,loop:r=!1,dir:a,currentTabStopId:i,defaultCurrentTabStopId:c,onCurrentTabStopIdChange:u,onEntryFocus:l,preventScrollOnEntryFocus:d=!1,...f}=e,m=s.useRef(null),v=O(t,m),b=re(a),[g,p]=oe({prop:i,defaultProp:c??null,onChange:u,caller:P}),[x,M]=s.useState(!1),C=Tt(l),S=ae(o),I=s.useRef(!1),[N,A]=s.useState(0);return s.useEffect(()=>{const k=m.current;if(k)return k.addEventListener(U,C),()=>k.removeEventListener(U,C)},[C]),h.jsx(Dt,{scope:o,orientation:n,dir:b,loop:r,currentTabStopId:g,onItemFocus:s.useCallback(k=>p(k),[p]),onItemShiftTab:s.useCallback(()=>M(!0),[]),onFocusableItemAdd:s.useCallback(()=>A(k=>k+1),[]),onFocusableItemRemove:s.useCallback(()=>A(k=>k-1),[]),children:h.jsx(T.div,{tabIndex:x||N===0?-1:0,"data-orientation":n,...f,ref:v,style:{outline:"none",...e.style},onMouseDown:_(e.onMouseDown,()=>{I.current=!0}),onFocus:_(e.onFocus,k=>{const be=!I.current;if(k.target===k.currentTarget&&be&&!x){const q=new CustomEvent(U,jt);if(k.currentTarget.dispatchEvent(q),!q.defaultPrevented){const V=S().filter(w=>w.focusable),Se=V.find(w=>w.active),ke=V.find(w=>w.id===g),Me=[Se,ke,...V].filter(Boolean).map(w=>w.ref.current);ue(Me,d)}}I.current=!1}),onBlur:_(e.onBlur,()=>M(!1))})})}),ce="RovingFocusGroupItem",le=s.forwardRef((e,t)=>{const{__scopeRovingFocusGroup:o,focusable:n=!0,active:r=!1,tabStopId:a,children:i,...c}=e,u=ne(),l=a||u,d=Vt(ce,o),f=d.currentTabStopId===l,m=ae(o),{onFocusableItemAdd:v,onFocusableItemRemove:b,currentTabStopId:g}=d;return s.useEffect(()=>{if(n)return v(),()=>b()},[n,v,b]),h.jsx(B.ItemSlot,{scope:o,id:l,focusable:n,active:r,children:h.jsx(T.span,{tabIndex:f?0:-1,"data-orientation":d.orientation,...c,ref:t,onMouseDown:_(e.onMouseDown,p=>{n?d.onItemFocus(l):p.preventDefault()}),onFocus:_(e.onFocus,()=>d.onItemFocus(l)),onKeyDown:_(e.onKeyDown,p=>{if(p.key==="Tab"&&p.shiftKey){d.onItemShiftTab();return}if(p.target!==p.currentTarget)return;const x=Gt(p,d.orientation,d.dir);if(x!==void 0){if(p.metaKey||p.ctrlKey||p.altKey||p.shiftKey)return;p.preventDefault();let C=m().filter(S=>S.focusable).map(S=>S.ref.current);if(x==="last")C.reverse();else if(x==="prev"||x==="next"){x==="prev"&&C.reverse();const S=C.indexOf(p.currentTarget);C=d.loop?zt(C,S+1):C.slice(S+1)}setTimeout(()=>ue(C))}}),children:typeof i=="function"?i({isCurrentTabStop:f,hasTabStop:g!=null}):i})})});le.displayName=ce;var Ut={ArrowLeft:"prev",ArrowUp:"prev",ArrowRight:"next",ArrowDown:"next",PageUp:"first",Home:"first",PageDown:"last",End:"last"};function Bt(e,t){return t!=="rtl"?e:e==="ArrowLeft"?"ArrowRight":e==="ArrowRight"?"ArrowLeft":e}function Gt(e,t,o){const n=Bt(e.key,o);if(!(t==="vertical"&&["ArrowLeft","ArrowRight"].includes(n))&&!(t==="horizontal"&&["ArrowUp","ArrowDown"].includes(n)))return Ut[n]}function ue(e,t=!1){const o=document.activeElement;for(const n of e)if(n===o||(n.focus({preventScroll:t}),document.activeElement!==o))return}function zt(e,t){return e.map((o,n)=>e[(t+n)%e.length])}var Kt=ie,qt=le;function Zt(e,t){return s.useReducer((o,n)=>t[o][n]??o,e)}var de=e=>{const{present:t,children:o}=e,n=Ht(t),r=typeof o=="function"?o({present:n.isPresent}):s.Children.only(o),a=O(n.ref,Yt(r));return typeof o=="function"||n.isPresent?s.cloneElement(r,{ref:a}):null};de.displayName="Presence";function Ht(e){const[t,o]=s.useState(),n=s.useRef(null),r=s.useRef(e),a=s.useRef("none"),i=e?"mounted":"unmounted",[c,u]=Zt(i,{mounted:{UNMOUNT:"unmounted",ANIMATION_OUT:"unmountSuspended"},unmountSuspended:{MOUNT:"mounted",ANIMATION_END:"unmounted"},unmounted:{MOUNT:"mounted"}});return s.useEffect(()=>{const l=$(n.current);a.current=c==="mounted"?l:"none"},[c]),F(()=>{const l=n.current,d=r.current;if(d!==e){const m=a.current,v=$(l);e?u("MOUNT"):v==="none"||(l==null?void 0:l.display)==="none"?u("UNMOUNT"):u(d&&m!==v?"ANIMATION_OUT":"UNMOUNT"),r.current=e}},[e,u]),F(()=>{if(t){let l;const d=t.ownerDocument.defaultView??window,f=v=>{const g=$(n.current).includes(CSS.escape(v.animationName));if(v.target===t&&g&&(u("ANIMATION_END"),!r.current)){const p=t.style.animationFillMode;t.style.animationFillMode="forwards",l=d.setTimeout(()=>{t.style.animationFillMode==="forwards"&&(t.style.animationFillMode=p)})}},m=v=>{v.target===t&&(a.current=$(n.current))};return t.addEventListener("animationstart",m),t.addEventListener("animationcancel",f),t.addEventListener("animationend",f),()=>{d.clearTimeout(l),t.removeEventListener("animationstart",m),t.removeEventListener("animationcancel",f),t.removeEventListener("animationend",f)}}else u("ANIMATION_END")},[t,u]),{isPresent:["mounted","unmountSuspended"].includes(c),ref:s.useCallback(l=>{n.current=l?getComputedStyle(l):null,o(l)},[])}}function $(e){return(e==null?void 0:e.animationName)||"none"}function Yt(e){var n,r;let t=(n=Object.getOwnPropertyDescriptor(e.props,"ref"))==null?void 0:n.get,o=t&&"isReactWarning"in t&&t.isReactWarning;return o?e.ref:(t=(r=Object.getOwnPropertyDescriptor(e,"ref"))==null?void 0:r.get,o=t&&"isReactWarning"in t&&t.isReactWarning,o?e.props.ref:e.props.ref||e.ref)}var D="Tabs",[Xt]=z(D,[se]),fe=se(),[Jt,K]=Xt(D),pe=s.forwardRef((e,t)=>{const{__scopeTabs:o,value:n,onValueChange:r,defaultValue:a,orientation:i="horizontal",dir:c,activationMode:u="automatic",...l}=e,d=re(c),[f,m]=oe({prop:n,onChange:r,defaultProp:a??"",caller:D});return h.jsx(Jt,{scope:o,baseId:ne(),value:f,onValueChange:m,orientation:i,dir:d,activationMode:u,children:h.jsx(T.div,{dir:d,"data-orientation":i,...l,ref:t})})});pe.displayName=D;var me="TabsList",he=s.forwardRef((e,t)=>{const{__scopeTabs:o,loop:n=!0,...r}=e,a=K(me,o),i=fe(o);return h.jsx(Kt,{asChild:!0,...i,orientation:a.orientation,dir:a.dir,loop:n,children:h.jsx(T.div,{role:"tablist","aria-orientation":a.orientation,...r,ref:t})})});he.displayName=me;var ye="TabsTrigger",ve=s.forwardRef((e,t)=>{const{__scopeTabs:o,value:n,disabled:r=!1,...a}=e,i=K(ye,o),c=fe(o),u=xe(i.baseId,n),l=Ee(i.baseId,n),d=n===i.value;return h.jsx(qt,{asChild:!0,...c,focusable:!r,active:d,children:h.jsx(T.button,{type:"button",role:"tab","aria-selected":d,"aria-controls":l,"data-state":d?"active":"inactive","data-disabled":r?"":void 0,disabled:r,id:u,...a,ref:t,onMouseDown:_(e.onMouseDown,f=>{!r&&f.button===0&&f.ctrlKey===!1?i.onValueChange(n):f.preventDefault()}),onKeyDown:_(e.onKeyDown,f=>{[" ","Enter"].includes(f.key)&&i.onValueChange(n)}),onFocus:_(e.onFocus,()=>{const f=i.activationMode!=="manual";!d&&!r&&f&&i.onValueChange(n)})})})});ve.displayName=ye;var ge="TabsContent",Ce=s.forwardRef((e,t)=>{const{__scopeTabs:o,value:n,forceMount:r,children:a,...i}=e,c=K(ge,o),u=xe(c.baseId,n),l=Ee(c.baseId,n),d=n===c.value,f=s.useRef(d);return s.useEffect(()=>{const m=requestAnimationFrame(()=>f.current=!1);return()=>cancelAnimationFrame(m)},[]),h.jsx(de,{present:r||d,children:({present:m})=>h.jsx(T.div,{"data-state":d?"active":"inactive","data-orientation":c.orientation,role:"tabpanel","aria-labelledby":u,hidden:!m,id:l,tabIndex:0,...i,ref:t,style:{...e.style,animationDuration:f.current?"0s":void 0},children:m&&a})})});Ce.displayName=ge;function xe(e,t){return`${e}-trigger-${t}`}function Ee(e,t){return`${e}-content-${t}`}var Zn=pe,Hn=he,Yn=ve,Xn=Ce,E=function(e,t,o){if(o||arguments.length===2)for(var n=0,r=t.length,a;n<r;n++)(a||!(n in t))&&(a||(a=Array.prototype.slice.call(t,0,n)),a[n]=t[n]);return e.concat(a||Array.prototype.slice.call(t))},Qt=["onCopy","onCut","onPaste"],en=["onCompositionEnd","onCompositionStart","onCompositionUpdate"],tn=["onFocus","onBlur"],nn=["onInput","onInvalid","onReset","onSubmit"],on=["onLoad","onError"],rn=["onKeyDown","onKeyPress","onKeyUp"],an=["onAbort","onCanPlay","onCanPlayThrough","onDurationChange","onEmptied","onEncrypted","onEnded","onError","onLoadedData","onLoadedMetadata","onLoadStart","onPause","onPlay","onPlaying","onProgress","onRateChange","onSeeked","onSeeking","onStalled","onSuspend","onTimeUpdate","onVolumeChange","onWaiting"],sn=["onClick","onContextMenu","onDoubleClick","onMouseDown","onMouseEnter","onMouseLeave","onMouseMove","onMouseOut","onMouseOver","onMouseUp"],cn=["onDrag","onDragEnd","onDragEnter","onDragExit","onDragLeave","onDragOver","onDragStart","onDrop"],ln=["onSelect"],un=["onTouchCancel","onTouchEnd","onTouchMove","onTouchStart"],dn=["onPointerDown","onPointerMove","onPointerUp","onPointerCancel","onGotPointerCapture","onLostPointerCapture","onPointerEnter","onPointerLeave","onPointerOver","onPointerOut"],fn=["onScroll"],pn=["onWheel"],mn=["onAnimationStart","onAnimationEnd","onAnimationIteration"],hn=["onTransitionEnd"],yn=["onToggle"],vn=["onChange"],gn=E(E(E(E(E(E(E(E(E(E(E(E(E(E(E(E(E(E([],Qt,!0),en,!0),tn,!0),nn,!0),on,!0),rn,!0),an,!0),sn,!0),cn,!0),ln,!0),un,!0),dn,!0),fn,!0),pn,!0),mn,!0),hn,!0),vn,!0),yn,!0);function Jn(e,t){var o={};return gn.forEach(function(n){var r=e[n];r&&(t?o[n]=(function(a){return r(a,t(n))}):o[n]=r)}),o}function Qn(e){var t=!1,o=new Promise(function(n,r){e.then(function(a){return!t&&n(a)}).catch(function(a){return!t&&r(a)})});return{promise:o,cancel:function(){t=!0}}}function eo(){for(var e=[],t=0;t<arguments.length;t++)e[t]=arguments[t];var o=e.filter(Boolean);if(o.length<=1){var n=o[0];return n||null}return function(a){o.forEach(function(i){typeof i=="function"?i(a):i&&(i.current=a)})}}export{En as A,bn as B,Xn as C,Mn as E,_n as F,Rn as L,Tn as M,Fn as P,Ln as R,Dn as S,Wn as T,Un as W,Bn as X,zn as Z,Jn as a,eo as b,Gn as c,kn as d,On as e,$n as f,Kn as g,qn as h,An as i,Hn as j,Yn as k,Zn as l,Qn as m,In as n,jn as o,Nn as p,Pn as q,Vn as r,wn as s,Sn as t};
