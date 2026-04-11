import{r as s,j as m,R as z,a as N}from"./react-core-C2jVpWOr.js";/**
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
 */const Ne=e=>{for(const t in e)if(t.startsWith("aria-")||t==="role"||t==="title")return!0;return!1},Re=s.createContext({}),Ie=()=>s.useContext(Re),Pe=s.forwardRef(({color:e,size:t,strokeWidth:o,absoluteStrokeWidth:n,className:r="",children:a,iconNode:i,...c},u)=>{const{size:l=24,strokeWidth:d=2,absoluteStrokeWidth:f=!1,color:h="currentColor",className:v=""}=Ie()??{},b=n??f?Number(o??d)*24/Number(t??l):o??d;return s.createElement("svg",{ref:u,...W,width:t??l??W.width,height:t??l??W.height,stroke:e??h,strokeWidth:b,className:J("lucide",v,r),...!a&&!Ne(c)&&{"aria-hidden":"true"},...c},[...i.map(([g,p])=>s.createElement(g,p)),...Array.isArray(a)?a:[a]])});/**
 * @license lucide-react v1.7.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const y=(e,t)=>{const o=s.forwardRef(({className:n,...r},a)=>s.createElement(Pe,{ref:a,iconNode:t,className:J(`lucide-${_e(Z(e))}`,`lucide-${e}`,n),...r}));return o.displayName=Z(e),o};/**
 * @license lucide-react v1.7.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Te=[["path",{d:"M5 12h14",key:"1ays0h"}],["path",{d:"m12 5 7 7-7 7",key:"xquz4c"}]],Sn=y("arrow-right",Te);/**
 * @license lucide-react v1.7.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Ae=[["path",{d:"M12 7v14",key:"1akyts"}],["path",{d:"M16 12h2",key:"7q9ll5"}],["path",{d:"M16 8h2",key:"msurwy"}],["path",{d:"M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z",key:"ruj8y"}],["path",{d:"M6 12h2",key:"32wvfc"}],["path",{d:"M6 8h2",key:"30oboj"}]],Mn=y("book-open-text",Ae);/**
 * @license lucide-react v1.7.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const $e=[["path",{d:"M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z",key:"p7xjir"}]],_n=y("cloud",$e);/**
 * @license lucide-react v1.7.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Oe=[["path",{d:"m15 15 6 6",key:"1s409w"}],["path",{d:"m15 9 6-6",key:"ko1vev"}],["path",{d:"M21 16v5h-5",key:"1ck2sf"}],["path",{d:"M21 8V3h-5",key:"1qoq8a"}],["path",{d:"M3 16v5h5",key:"1t08am"}],["path",{d:"m3 21 6-6",key:"wwnumi"}],["path",{d:"M3 8V3h5",key:"1ln10m"}],["path",{d:"M9 9 3 3",key:"v551iv"}]],wn=y("expand",Oe);/**
 * @license lucide-react v1.7.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const je=[["path",{d:"M15 3h6v6",key:"1q9fwt"}],["path",{d:"M10 14 21 3",key:"gplh6r"}],["path",{d:"M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6",key:"a6xqqp"}]],Nn=y("external-link",je);/**
 * @license lucide-react v1.7.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Fe=[["path",{d:"M10.5 22H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.706.706l3.588 3.588A2.4 2.4 0 0 1 20 8v6",key:"g5mvt7"}],["path",{d:"M14 2v5a1 1 0 0 0 1 1h5",key:"wfsgrz"}],["path",{d:"m14 20 2 2 4-4",key:"15kota"}]],Rn=y("file-check-corner",Fe);/**
 * @license lucide-react v1.7.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Le=[["circle",{cx:"15",cy:"19",r:"2",key:"u2pros"}],["path",{d:"M20.9 19.8A2 2 0 0 0 22 18V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2h5.1",key:"1jj40k"}],["path",{d:"M15 11v-1",key:"cntcp"}],["path",{d:"M15 17v-2",key:"1279jj"}]],In=y("folder-archive",Le);/**
 * @license lucide-react v1.7.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const De=[["rect",{width:"18",height:"7",x:"3",y:"3",rx:"1",key:"f1a2em"}],["rect",{width:"7",height:"7",x:"3",y:"14",rx:"1",key:"1bb6yr"}],["rect",{width:"7",height:"7",x:"14",y:"14",rx:"1",key:"nxv5o0"}]],Pn=y("layout-panel-top",De);/**
 * @license lucide-react v1.7.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Ve=[["path",{d:"M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z",key:"nnexq3"}],["path",{d:"M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12",key:"mt58a7"}]],Tn=y("leaf",Ve);/**
 * @license lucide-react v1.7.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const We=[["rect",{width:"8",height:"18",x:"3",y:"3",rx:"1",key:"oynpb5"}],["path",{d:"M7 3v18",key:"bbkbws"}],["path",{d:"M20.4 18.9c.2.5-.1 1.1-.6 1.3l-1.9.7c-.5.2-1.1-.1-1.3-.6L11.1 5.1c-.2-.5.1-1.1.6-1.3l1.9-.7c.5-.2 1.1.1 1.3.6Z",key:"1qboyk"}]],An=y("library-big",We);/**
 * @license lucide-react v1.7.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Ue=[["path",{d:"M8 5h13",key:"1pao27"}],["path",{d:"M13 12h8",key:"h98zly"}],["path",{d:"M13 19h8",key:"c3s6r1"}],["path",{d:"M3 10a2 2 0 0 0 2 2h3",key:"1npucw"}],["path",{d:"M3 5v12a2 2 0 0 0 2 2h3",key:"x1gjn2"}]],$n=y("list-tree",Ue);/**
 * @license lucide-react v1.7.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Be=[["path",{d:"M4 5h16",key:"1tepv9"}],["path",{d:"M4 12h16",key:"1lakjw"}],["path",{d:"M4 19h16",key:"1djgab"}]],On=y("menu",Be);/**
 * @license lucide-react v1.7.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const ze=[["path",{d:"M5 12h14",key:"1ays0h"}]],jn=y("minus",ze);/**
 * @license lucide-react v1.7.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Ge=[["path",{d:"M15.033 9.44a.647.647 0 0 1 0 1.12l-4.065 2.352a.645.645 0 0 1-.968-.56V7.648a.645.645 0 0 1 .967-.56z",key:"vbtd3f"}],["path",{d:"M12 17v4",key:"1riwvh"}],["path",{d:"M8 21h8",key:"1ev6f3"}],["rect",{x:"2",y:"3",width:"20",height:"14",rx:"2",key:"x3v2xh"}]],Fn=y("monitor-play",Ge);/**
 * @license lucide-react v1.7.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const qe=[["path",{d:"M18 5h4",key:"1lhgn2"}],["path",{d:"M20 3v4",key:"1olli1"}],["path",{d:"M20.985 12.486a9 9 0 1 1-9.473-9.472c.405-.022.617.46.402.803a6 6 0 0 0 8.268 8.268c.344-.215.825-.004.803.401",key:"kfwtm"}]],Ln=y("moon-star",qe);/**
 * @license lucide-react v1.7.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Ke=[["path",{d:"M12 22a1 1 0 0 1 0-20 10 9 0 0 1 10 9 5 5 0 0 1-5 5h-2.25a1.75 1.75 0 0 0-1.4 2.8l.3.4a1.75 1.75 0 0 1-1.4 2.8z",key:"e79jfc"}],["circle",{cx:"13.5",cy:"6.5",r:".5",fill:"currentColor",key:"1okk4w"}],["circle",{cx:"17.5",cy:"10.5",r:".5",fill:"currentColor",key:"f64h9f"}],["circle",{cx:"6.5",cy:"12.5",r:".5",fill:"currentColor",key:"qy21gx"}],["circle",{cx:"8.5",cy:"7.5",r:".5",fill:"currentColor",key:"fotxhn"}]],Dn=y("palette",Ke);/**
 * @license lucide-react v1.7.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Ze=[["rect",{width:"18",height:"18",x:"3",y:"3",rx:"2",key:"afitv7"}],["path",{d:"M9 3v18",key:"fh3hqa"}],["path",{d:"m16 15-3-3 3-3",key:"14y99z"}]],Vn=y("panel-left-close",Ze);/**
 * @license lucide-react v1.7.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const He=[["rect",{width:"18",height:"18",x:"3",y:"3",rx:"2",key:"afitv7"}],["path",{d:"M9 3v18",key:"fh3hqa"}],["path",{d:"m14 9 3 3-3 3",key:"8010ee"}]],Wn=y("panel-left-open",He);/**
 * @license lucide-react v1.7.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Ye=[["rect",{width:"18",height:"18",x:"3",y:"3",rx:"2",key:"afitv7"}],["path",{d:"M3 9h18",key:"1pudct"}],["path",{d:"m15 14-3 3-3-3",key:"g215vf"}]],Un=y("panel-top-open",Ye);/**
 * @license lucide-react v1.7.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Xe=[["path",{d:"M5 12h14",key:"1ays0h"}],["path",{d:"M12 5v14",key:"s699le"}]],Bn=y("plus",Xe);/**
 * @license lucide-react v1.7.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Je=[["path",{d:"M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8",key:"1357e3"}],["path",{d:"M3 3v5h5",key:"1xhq8a"}]],zn=y("rotate-ccw",Je);/**
 * @license lucide-react v1.7.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Qe=[["path",{d:"m21 21-4.34-4.34",key:"14j7rj"}],["circle",{cx:"11",cy:"11",r:"8",key:"4ej97u"}]],Gn=y("search",Qe);/**
 * @license lucide-react v1.7.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const et=[["circle",{cx:"12",cy:"12",r:"4",key:"4exip2"}],["path",{d:"M12 3v1",key:"1asbbs"}],["path",{d:"M12 20v1",key:"1wcdkc"}],["path",{d:"M3 12h1",key:"lp3yf2"}],["path",{d:"M20 12h1",key:"1vloll"}],["path",{d:"m18.364 5.636-.707.707",key:"1hakh0"}],["path",{d:"m6.343 17.657-.707.707",key:"18m9nf"}],["path",{d:"m5.636 5.636.707.707",key:"1xv1c5"}],["path",{d:"m17.657 17.657.707.707",key:"vl76zb"}]],qn=y("sun-medium",et);/**
 * @license lucide-react v1.7.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const tt=[["path",{d:"M12 4v16",key:"1654pz"}],["path",{d:"M4 7V5a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v2",key:"e0r10z"}],["path",{d:"M9 20h6",key:"s66wpe"}]],Kn=y("type",tt);/**
 * @license lucide-react v1.7.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const nt=[["path",{d:"M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.106-3.105c.32-.322.863-.22.983.218a6 6 0 0 1-8.259 7.057l-7.91 7.91a1 1 0 0 1-2.999-3l7.91-7.91a6 6 0 0 1 7.057-8.259c.438.12.54.662.219.984z",key:"1ngwbx"}]],Zn=y("wrench",nt);/**
 * @license lucide-react v1.7.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const ot=[["path",{d:"M18 6 6 18",key:"1bl5f8"}],["path",{d:"m6 6 12 12",key:"d8bk6v"}]],Hn=y("x",ot);/**
 * @license lucide-react v1.7.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const rt=[["circle",{cx:"11",cy:"11",r:"8",key:"4ej97u"}],["line",{x1:"21",x2:"16.65",y1:"21",y2:"16.65",key:"13gj7c"}],["line",{x1:"11",x2:"11",y1:"8",y2:"14",key:"1vmskp"}],["line",{x1:"8",x2:"14",y1:"11",y2:"11",key:"durymu"}]],Yn=y("zoom-in",rt);/**
 * @license lucide-react v1.7.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const at=[["circle",{cx:"11",cy:"11",r:"8",key:"4ej97u"}],["line",{x1:"21",x2:"16.65",y1:"21",y2:"16.65",key:"13gj7c"}],["line",{x1:"8",x2:"14",y1:"11",y2:"11",key:"durymu"}]],Xn=y("zoom-out",at);function H(e,t){if(typeof e=="function")return e(t);e!=null&&(e.current=t)}function L(...e){return t=>{let o=!1;const n=e.map(r=>{const a=H(r,t);return!o&&typeof a=="function"&&(o=!0),a});if(o)return()=>{for(let r=0;r<n.length;r++){const a=n[r];typeof a=="function"?a():H(e[r],null)}}}}function O(...e){return s.useCallback(L(...e),e)}var st=Symbol.for("react.lazy"),j=z[" use ".trim().toString()];function it(e){return typeof e=="object"&&e!==null&&"then"in e}function Q(e){return e!=null&&typeof e=="object"&&"$$typeof"in e&&e.$$typeof===st&&"_payload"in e&&it(e._payload)}function ee(e){const t=ct(e),o=s.forwardRef((n,r)=>{let{children:a,...i}=n;Q(a)&&typeof j=="function"&&(a=j(a._payload));const c=s.Children.toArray(a),u=c.find(ut);if(u){const l=u.props.children,d=c.map(f=>f===u?s.Children.count(l)>1?s.Children.only(null):s.isValidElement(l)?l.props.children:null:f);return m.jsx(t,{...i,ref:r,children:s.isValidElement(l)?s.cloneElement(l,void 0,d):null})}return m.jsx(t,{...i,ref:r,children:a})});return o.displayName=`${e}.Slot`,o}var Jn=ee("Slot");function ct(e){const t=s.forwardRef((o,n)=>{let{children:r,...a}=o;if(Q(r)&&typeof j=="function"&&(r=j(r._payload)),s.isValidElement(r)){const i=ft(r),c=dt(a,r.props);return r.type!==s.Fragment&&(c.ref=n?L(n,i):i),s.cloneElement(r,c)}return s.Children.count(r)>1?s.Children.only(null):null});return t.displayName=`${e}.SlotClone`,t}var lt=Symbol("radix.slottable");function ut(e){return s.isValidElement(e)&&typeof e.type=="function"&&"__radixId"in e.type&&e.type.__radixId===lt}function dt(e,t){const o={...t};for(const n in t){const r=e[n],a=t[n];/^on[A-Z]/.test(n)?r&&a?o[n]=(...c)=>{const u=a(...c);return r(...c),u}:r&&(o[n]=r):n==="style"?o[n]={...r,...a}:n==="className"&&(o[n]=[r,a].filter(Boolean).join(" "))}return{...e,...o}}function ft(e){var n,r;let t=(n=Object.getOwnPropertyDescriptor(e.props,"ref"))==null?void 0:n.get,o=t&&"isReactWarning"in t&&t.isReactWarning;return o?e.ref:(t=(r=Object.getOwnPropertyDescriptor(e,"ref"))==null?void 0:r.get,o=t&&"isReactWarning"in t&&t.isReactWarning,o?e.props.ref:e.props.ref||e.ref)}var pt=["a","button","div","form","h2","h3","img","input","label","li","nav","ol","p","select","span","svg","ul"],ht=pt.reduce((e,t)=>{const o=ee(`Primitive.${t}`),n=s.forwardRef((r,a)=>{const{asChild:i,...c}=r,u=i?o:t;return typeof window<"u"&&(window[Symbol.for("radix-ui")]=!0),m.jsx(u,{...c,ref:a})});return n.displayName=`Primitive.${t}`,{...e,[t]:n}},{}),mt="Separator",Y="horizontal",yt=["horizontal","vertical"],te=s.forwardRef((e,t)=>{const{decorative:o,orientation:n=Y,...r}=e,a=vt(n)?n:Y,c=o?{role:"none"}:{"aria-orientation":a==="vertical"?a:void 0,role:"separator"};return m.jsx(ht.div,{"data-orientation":a,...c,...r,ref:t})});te.displayName=mt;function vt(e){return yt.includes(e)}var Qn=te;function _(e,t,{checkForDefaultPrevented:o=!0}={}){return function(r){if(e==null||e(r),o===!1||!r.defaultPrevented)return t==null?void 0:t(r)}}function G(e,t=[]){let o=[];function n(a,i){const c=s.createContext(i),u=o.length;o=[...o,i];const l=f=>{var x;const{scope:h,children:v,...b}=f,g=((x=h==null?void 0:h[e])==null?void 0:x[u])||c,p=s.useMemo(()=>b,Object.values(b));return m.jsx(g.Provider,{value:p,children:v})};l.displayName=a+"Provider";function d(f,h){var g;const v=((g=h==null?void 0:h[e])==null?void 0:g[u])||c,b=s.useContext(v);if(b)return b;if(i!==void 0)return i;throw new Error(`\`${f}\` must be used within \`${a}\``)}return[l,d]}const r=()=>{const a=o.map(i=>s.createContext(i));return function(c){const u=(c==null?void 0:c[e])||a;return s.useMemo(()=>({[`__scope${e}`]:{...c,[e]:u}}),[c,u])}};return r.scopeName=e,[n,gt(r,...t)]}function gt(...e){const t=e[0];if(e.length===1)return t;const o=()=>{const n=e.map(r=>({useScope:r(),scopeName:r.scopeName}));return function(a){const i=n.reduce((c,{useScope:u,scopeName:l})=>{const f=u(a)[`__scope${l}`];return{...c,...f}},{});return s.useMemo(()=>({[`__scope${t.scopeName}`]:i}),[i])}};return o.scopeName=t.scopeName,o}function X(e){const t=Ct(e),o=s.forwardRef((n,r)=>{const{children:a,...i}=n,c=s.Children.toArray(a),u=c.find(kt);if(u){const l=u.props.children,d=c.map(f=>f===u?s.Children.count(l)>1?s.Children.only(null):s.isValidElement(l)?l.props.children:null:f);return m.jsx(t,{...i,ref:r,children:s.isValidElement(l)?s.cloneElement(l,void 0,d):null})}return m.jsx(t,{...i,ref:r,children:a})});return o.displayName=`${e}.Slot`,o}function Ct(e){const t=s.forwardRef((o,n)=>{const{children:r,...a}=o;if(s.isValidElement(r)){const i=Et(r),c=bt(a,r.props);return r.type!==s.Fragment&&(c.ref=n?L(n,i):i),s.cloneElement(r,c)}return s.Children.count(r)>1?s.Children.only(null):null});return t.displayName=`${e}.SlotClone`,t}var xt=Symbol("radix.slottable");function kt(e){return s.isValidElement(e)&&typeof e.type=="function"&&"__radixId"in e.type&&e.type.__radixId===xt}function bt(e,t){const o={...t};for(const n in t){const r=e[n],a=t[n];/^on[A-Z]/.test(n)?r&&a?o[n]=(...c)=>{const u=a(...c);return r(...c),u}:r&&(o[n]=r):n==="style"?o[n]={...r,...a}:n==="className"&&(o[n]=[r,a].filter(Boolean).join(" "))}return{...e,...o}}function Et(e){var n,r;let t=(n=Object.getOwnPropertyDescriptor(e.props,"ref"))==null?void 0:n.get,o=t&&"isReactWarning"in t&&t.isReactWarning;return o?e.ref:(t=(r=Object.getOwnPropertyDescriptor(e,"ref"))==null?void 0:r.get,o=t&&"isReactWarning"in t&&t.isReactWarning,o?e.props.ref:e.props.ref||e.ref)}function St(e){const t=e+"CollectionProvider",[o,n]=G(t),[r,a]=o(t,{collectionRef:{current:null},itemMap:new Map}),i=g=>{const{scope:p,children:x}=g,M=N.useRef(null),C=N.useRef(new Map).current;return m.jsx(r,{scope:p,itemMap:C,collectionRef:M,children:x})};i.displayName=t;const c=e+"CollectionSlot",u=X(c),l=N.forwardRef((g,p)=>{const{scope:x,children:M}=g,C=a(c,x),E=O(p,C.collectionRef);return m.jsx(u,{ref:E,children:M})});l.displayName=c;const d=e+"CollectionItemSlot",f="data-radix-collection-item",h=X(d),v=N.forwardRef((g,p)=>{const{scope:x,children:M,...C}=g,E=N.useRef(null),R=O(p,E),I=a(d,x);return N.useEffect(()=>(I.itemMap.set(E,{ref:E,...C}),()=>void I.itemMap.delete(E))),m.jsx(h,{[f]:"",ref:R,children:M})});v.displayName=d;function b(g){const p=a(e+"CollectionConsumer",g);return N.useCallback(()=>{const M=p.collectionRef.current;if(!M)return[];const C=Array.from(M.querySelectorAll(`[${f}]`));return Array.from(p.itemMap.values()).sort((I,A)=>C.indexOf(I.ref.current)-C.indexOf(A.ref.current))},[p.collectionRef,p.itemMap])}return[{Provider:i,Slot:l,ItemSlot:v},b,n]}var F=globalThis!=null&&globalThis.document?s.useLayoutEffect:()=>{},Mt=z[" useId ".trim().toString()]||(()=>{}),_t=0;function ne(e){const[t,o]=s.useState(Mt());return F(()=>{o(n=>n??String(_t++))},[e]),t?`radix-${t}`:""}function wt(e){const t=Nt(e),o=s.forwardRef((n,r)=>{const{children:a,...i}=n,c=s.Children.toArray(a),u=c.find(It);if(u){const l=u.props.children,d=c.map(f=>f===u?s.Children.count(l)>1?s.Children.only(null):s.isValidElement(l)?l.props.children:null:f);return m.jsx(t,{...i,ref:r,children:s.isValidElement(l)?s.cloneElement(l,void 0,d):null})}return m.jsx(t,{...i,ref:r,children:a})});return o.displayName=`${e}.Slot`,o}function Nt(e){const t=s.forwardRef((o,n)=>{const{children:r,...a}=o;if(s.isValidElement(r)){const i=Tt(r),c=Pt(a,r.props);return r.type!==s.Fragment&&(c.ref=n?L(n,i):i),s.cloneElement(r,c)}return s.Children.count(r)>1?s.Children.only(null):null});return t.displayName=`${e}.SlotClone`,t}var Rt=Symbol("radix.slottable");function It(e){return s.isValidElement(e)&&typeof e.type=="function"&&"__radixId"in e.type&&e.type.__radixId===Rt}function Pt(e,t){const o={...t};for(const n in t){const r=e[n],a=t[n];/^on[A-Z]/.test(n)?r&&a?o[n]=(...c)=>{const u=a(...c);return r(...c),u}:r&&(o[n]=r):n==="style"?o[n]={...r,...a}:n==="className"&&(o[n]=[r,a].filter(Boolean).join(" "))}return{...e,...o}}function Tt(e){var n,r;let t=(n=Object.getOwnPropertyDescriptor(e.props,"ref"))==null?void 0:n.get,o=t&&"isReactWarning"in t&&t.isReactWarning;return o?e.ref:(t=(r=Object.getOwnPropertyDescriptor(e,"ref"))==null?void 0:r.get,o=t&&"isReactWarning"in t&&t.isReactWarning,o?e.props.ref:e.props.ref||e.ref)}var At=["a","button","div","form","h2","h3","img","input","label","li","nav","ol","p","select","span","svg","ul"],P=At.reduce((e,t)=>{const o=wt(`Primitive.${t}`),n=s.forwardRef((r,a)=>{const{asChild:i,...c}=r,u=i?o:t;return typeof window<"u"&&(window[Symbol.for("radix-ui")]=!0),m.jsx(u,{...c,ref:a})});return n.displayName=`Primitive.${t}`,{...e,[t]:n}},{});function $t(e){const t=s.useRef(e);return s.useEffect(()=>{t.current=e}),s.useMemo(()=>(...o)=>{var n;return(n=t.current)==null?void 0:n.call(t,...o)},[])}var Ot=z[" useInsertionEffect ".trim().toString()]||F;function oe({prop:e,defaultProp:t,onChange:o=()=>{},caller:n}){const[r,a,i]=jt({defaultProp:t,onChange:o}),c=e!==void 0,u=c?e:r;{const d=s.useRef(e!==void 0);s.useEffect(()=>{const f=d.current;f!==c&&console.warn(`${n} is changing from ${f?"controlled":"uncontrolled"} to ${c?"controlled":"uncontrolled"}. Components should not switch from controlled to uncontrolled (or vice versa). Decide between using a controlled or uncontrolled value for the lifetime of the component.`),d.current=c},[c,n])}const l=s.useCallback(d=>{var f;if(c){const h=Ft(d)?d(e):d;h!==e&&((f=i.current)==null||f.call(i,h))}else a(d)},[c,e,a,i]);return[u,l]}function jt({defaultProp:e,onChange:t}){const[o,n]=s.useState(e),r=s.useRef(o),a=s.useRef(t);return Ot(()=>{a.current=t},[t]),s.useEffect(()=>{var i;r.current!==o&&((i=a.current)==null||i.call(a,o),r.current=o)},[o,r]),[o,n,a]}function Ft(e){return typeof e=="function"}var Lt=s.createContext(void 0);function re(e){const t=s.useContext(Lt);return e||t||"ltr"}var U="rovingFocusGroup.onEntryFocus",Dt={bubbles:!1,cancelable:!0},T="RovingFocusGroup",[B,ae,Vt]=St(T),[Wt,se]=G(T,[Vt]),[Ut,Bt]=Wt(T),ie=s.forwardRef((e,t)=>m.jsx(B.Provider,{scope:e.__scopeRovingFocusGroup,children:m.jsx(B.Slot,{scope:e.__scopeRovingFocusGroup,children:m.jsx(zt,{...e,ref:t})})}));ie.displayName=T;var zt=s.forwardRef((e,t)=>{const{__scopeRovingFocusGroup:o,orientation:n,loop:r=!1,dir:a,currentTabStopId:i,defaultCurrentTabStopId:c,onCurrentTabStopIdChange:u,onEntryFocus:l,preventScrollOnEntryFocus:d=!1,...f}=e,h=s.useRef(null),v=O(t,h),b=re(a),[g,p]=oe({prop:i,defaultProp:c??null,onChange:u,caller:T}),[x,M]=s.useState(!1),C=$t(l),E=ae(o),R=s.useRef(!1),[I,A]=s.useState(0);return s.useEffect(()=>{const S=h.current;if(S)return S.addEventListener(U,C),()=>S.removeEventListener(U,C)},[C]),m.jsx(Ut,{scope:o,orientation:n,dir:b,loop:r,currentTabStopId:g,onItemFocus:s.useCallback(S=>p(S),[p]),onItemShiftTab:s.useCallback(()=>M(!0),[]),onFocusableItemAdd:s.useCallback(()=>A(S=>S+1),[]),onFocusableItemRemove:s.useCallback(()=>A(S=>S-1),[]),children:m.jsx(P.div,{tabIndex:x||I===0?-1:0,"data-orientation":n,...f,ref:v,style:{outline:"none",...e.style},onMouseDown:_(e.onMouseDown,()=>{R.current=!0}),onFocus:_(e.onFocus,S=>{const be=!R.current;if(S.target===S.currentTarget&&be&&!x){const K=new CustomEvent(U,Dt);if(S.currentTarget.dispatchEvent(K),!K.defaultPrevented){const V=E().filter(w=>w.focusable),Ee=V.find(w=>w.active),Se=V.find(w=>w.id===g),Me=[Ee,Se,...V].filter(Boolean).map(w=>w.ref.current);ue(Me,d)}}R.current=!1}),onBlur:_(e.onBlur,()=>M(!1))})})}),ce="RovingFocusGroupItem",le=s.forwardRef((e,t)=>{const{__scopeRovingFocusGroup:o,focusable:n=!0,active:r=!1,tabStopId:a,children:i,...c}=e,u=ne(),l=a||u,d=Bt(ce,o),f=d.currentTabStopId===l,h=ae(o),{onFocusableItemAdd:v,onFocusableItemRemove:b,currentTabStopId:g}=d;return s.useEffect(()=>{if(n)return v(),()=>b()},[n,v,b]),m.jsx(B.ItemSlot,{scope:o,id:l,focusable:n,active:r,children:m.jsx(P.span,{tabIndex:f?0:-1,"data-orientation":d.orientation,...c,ref:t,onMouseDown:_(e.onMouseDown,p=>{n?d.onItemFocus(l):p.preventDefault()}),onFocus:_(e.onFocus,()=>d.onItemFocus(l)),onKeyDown:_(e.onKeyDown,p=>{if(p.key==="Tab"&&p.shiftKey){d.onItemShiftTab();return}if(p.target!==p.currentTarget)return;const x=Kt(p,d.orientation,d.dir);if(x!==void 0){if(p.metaKey||p.ctrlKey||p.altKey||p.shiftKey)return;p.preventDefault();let C=h().filter(E=>E.focusable).map(E=>E.ref.current);if(x==="last")C.reverse();else if(x==="prev"||x==="next"){x==="prev"&&C.reverse();const E=C.indexOf(p.currentTarget);C=d.loop?Zt(C,E+1):C.slice(E+1)}setTimeout(()=>ue(C))}}),children:typeof i=="function"?i({isCurrentTabStop:f,hasTabStop:g!=null}):i})})});le.displayName=ce;var Gt={ArrowLeft:"prev",ArrowUp:"prev",ArrowRight:"next",ArrowDown:"next",PageUp:"first",Home:"first",PageDown:"last",End:"last"};function qt(e,t){return t!=="rtl"?e:e==="ArrowLeft"?"ArrowRight":e==="ArrowRight"?"ArrowLeft":e}function Kt(e,t,o){const n=qt(e.key,o);if(!(t==="vertical"&&["ArrowLeft","ArrowRight"].includes(n))&&!(t==="horizontal"&&["ArrowUp","ArrowDown"].includes(n)))return Gt[n]}function ue(e,t=!1){const o=document.activeElement;for(const n of e)if(n===o||(n.focus({preventScroll:t}),document.activeElement!==o))return}function Zt(e,t){return e.map((o,n)=>e[(t+n)%e.length])}var Ht=ie,Yt=le;function Xt(e,t){return s.useReducer((o,n)=>t[o][n]??o,e)}var de=e=>{const{present:t,children:o}=e,n=Jt(t),r=typeof o=="function"?o({present:n.isPresent}):s.Children.only(o),a=O(n.ref,Qt(r));return typeof o=="function"||n.isPresent?s.cloneElement(r,{ref:a}):null};de.displayName="Presence";function Jt(e){const[t,o]=s.useState(),n=s.useRef(null),r=s.useRef(e),a=s.useRef("none"),i=e?"mounted":"unmounted",[c,u]=Xt(i,{mounted:{UNMOUNT:"unmounted",ANIMATION_OUT:"unmountSuspended"},unmountSuspended:{MOUNT:"mounted",ANIMATION_END:"unmounted"},unmounted:{MOUNT:"mounted"}});return s.useEffect(()=>{const l=$(n.current);a.current=c==="mounted"?l:"none"},[c]),F(()=>{const l=n.current,d=r.current;if(d!==e){const h=a.current,v=$(l);e?u("MOUNT"):v==="none"||(l==null?void 0:l.display)==="none"?u("UNMOUNT"):u(d&&h!==v?"ANIMATION_OUT":"UNMOUNT"),r.current=e}},[e,u]),F(()=>{if(t){let l;const d=t.ownerDocument.defaultView??window,f=v=>{const g=$(n.current).includes(CSS.escape(v.animationName));if(v.target===t&&g&&(u("ANIMATION_END"),!r.current)){const p=t.style.animationFillMode;t.style.animationFillMode="forwards",l=d.setTimeout(()=>{t.style.animationFillMode==="forwards"&&(t.style.animationFillMode=p)})}},h=v=>{v.target===t&&(a.current=$(n.current))};return t.addEventListener("animationstart",h),t.addEventListener("animationcancel",f),t.addEventListener("animationend",f),()=>{d.clearTimeout(l),t.removeEventListener("animationstart",h),t.removeEventListener("animationcancel",f),t.removeEventListener("animationend",f)}}else u("ANIMATION_END")},[t,u]),{isPresent:["mounted","unmountSuspended"].includes(c),ref:s.useCallback(l=>{n.current=l?getComputedStyle(l):null,o(l)},[])}}function $(e){return(e==null?void 0:e.animationName)||"none"}function Qt(e){var n,r;let t=(n=Object.getOwnPropertyDescriptor(e.props,"ref"))==null?void 0:n.get,o=t&&"isReactWarning"in t&&t.isReactWarning;return o?e.ref:(t=(r=Object.getOwnPropertyDescriptor(e,"ref"))==null?void 0:r.get,o=t&&"isReactWarning"in t&&t.isReactWarning,o?e.props.ref:e.props.ref||e.ref)}var D="Tabs",[en]=G(D,[se]),fe=se(),[tn,q]=en(D),pe=s.forwardRef((e,t)=>{const{__scopeTabs:o,value:n,onValueChange:r,defaultValue:a,orientation:i="horizontal",dir:c,activationMode:u="automatic",...l}=e,d=re(c),[f,h]=oe({prop:n,onChange:r,defaultProp:a??"",caller:D});return m.jsx(tn,{scope:o,baseId:ne(),value:f,onValueChange:h,orientation:i,dir:d,activationMode:u,children:m.jsx(P.div,{dir:d,"data-orientation":i,...l,ref:t})})});pe.displayName=D;var he="TabsList",me=s.forwardRef((e,t)=>{const{__scopeTabs:o,loop:n=!0,...r}=e,a=q(he,o),i=fe(o);return m.jsx(Ht,{asChild:!0,...i,orientation:a.orientation,dir:a.dir,loop:n,children:m.jsx(P.div,{role:"tablist","aria-orientation":a.orientation,...r,ref:t})})});me.displayName=he;var ye="TabsTrigger",ve=s.forwardRef((e,t)=>{const{__scopeTabs:o,value:n,disabled:r=!1,...a}=e,i=q(ye,o),c=fe(o),u=xe(i.baseId,n),l=ke(i.baseId,n),d=n===i.value;return m.jsx(Yt,{asChild:!0,...c,focusable:!r,active:d,children:m.jsx(P.button,{type:"button",role:"tab","aria-selected":d,"aria-controls":l,"data-state":d?"active":"inactive","data-disabled":r?"":void 0,disabled:r,id:u,...a,ref:t,onMouseDown:_(e.onMouseDown,f=>{!r&&f.button===0&&f.ctrlKey===!1?i.onValueChange(n):f.preventDefault()}),onKeyDown:_(e.onKeyDown,f=>{[" ","Enter"].includes(f.key)&&i.onValueChange(n)}),onFocus:_(e.onFocus,()=>{const f=i.activationMode!=="manual";!d&&!r&&f&&i.onValueChange(n)})})})});ve.displayName=ye;var ge="TabsContent",Ce=s.forwardRef((e,t)=>{const{__scopeTabs:o,value:n,forceMount:r,children:a,...i}=e,c=q(ge,o),u=xe(c.baseId,n),l=ke(c.baseId,n),d=n===c.value,f=s.useRef(d);return s.useEffect(()=>{const h=requestAnimationFrame(()=>f.current=!1);return()=>cancelAnimationFrame(h)},[]),m.jsx(de,{present:r||d,children:({present:h})=>m.jsx(P.div,{"data-state":d?"active":"inactive","data-orientation":c.orientation,role:"tabpanel","aria-labelledby":u,hidden:!h,id:l,tabIndex:0,...i,ref:t,style:{...e.style,animationDuration:f.current?"0s":void 0},children:h&&a})})});Ce.displayName=ge;function xe(e,t){return`${e}-trigger-${t}`}function ke(e,t){return`${e}-content-${t}`}var eo=pe,to=me,no=ve,oo=Ce,k=function(e,t,o){if(o||arguments.length===2)for(var n=0,r=t.length,a;n<r;n++)(a||!(n in t))&&(a||(a=Array.prototype.slice.call(t,0,n)),a[n]=t[n]);return e.concat(a||Array.prototype.slice.call(t))},nn=["onCopy","onCut","onPaste"],on=["onCompositionEnd","onCompositionStart","onCompositionUpdate"],rn=["onFocus","onBlur"],an=["onInput","onInvalid","onReset","onSubmit"],sn=["onLoad","onError"],cn=["onKeyDown","onKeyPress","onKeyUp"],ln=["onAbort","onCanPlay","onCanPlayThrough","onDurationChange","onEmptied","onEncrypted","onEnded","onError","onLoadedData","onLoadedMetadata","onLoadStart","onPause","onPlay","onPlaying","onProgress","onRateChange","onSeeked","onSeeking","onStalled","onSuspend","onTimeUpdate","onVolumeChange","onWaiting"],un=["onClick","onContextMenu","onDoubleClick","onMouseDown","onMouseEnter","onMouseLeave","onMouseMove","onMouseOut","onMouseOver","onMouseUp"],dn=["onDrag","onDragEnd","onDragEnter","onDragExit","onDragLeave","onDragOver","onDragStart","onDrop"],fn=["onSelect"],pn=["onTouchCancel","onTouchEnd","onTouchMove","onTouchStart"],hn=["onPointerDown","onPointerMove","onPointerUp","onPointerCancel","onGotPointerCapture","onLostPointerCapture","onPointerEnter","onPointerLeave","onPointerOver","onPointerOut"],mn=["onScroll"],yn=["onWheel"],vn=["onAnimationStart","onAnimationEnd","onAnimationIteration"],gn=["onTransitionEnd"],Cn=["onToggle"],xn=["onChange"],kn=k(k(k(k(k(k(k(k(k(k(k(k(k(k(k(k(k(k([],nn,!0),on,!0),rn,!0),an,!0),sn,!0),cn,!0),ln,!0),un,!0),dn,!0),fn,!0),pn,!0),hn,!0),mn,!0),yn,!0),vn,!0),gn,!0),xn,!0),Cn,!0);function ro(e,t){var o={};return kn.forEach(function(n){var r=e[n];r&&(t?o[n]=(function(a){return r(a,t(n))}):o[n]=r)}),o}function ao(e){var t=!1,o=new Promise(function(n,r){e.then(function(a){return!t&&n(a)}).catch(function(a){return!t&&r(a)})});return{promise:o,cancel:function(){t=!0}}}function so(){for(var e=[],t=0;t<arguments.length;t++)e[t]=arguments[t];var o=e.filter(Boolean);if(o.length<=1){var n=o[0];return n||null}return function(a){o.forEach(function(i){typeof i=="function"?i(a):i&&(i.current=a)})}}export{Sn as A,Mn as B,oo as C,Nn as E,Rn as F,Pn as L,Fn as M,Bn as P,zn as R,Gn as S,Kn as T,Zn as W,Hn as X,Xn as Z,ro as a,so as b,An as c,jn as d,Yn as e,wn as f,Wn as g,Vn as h,Jn as i,Qn as j,In as k,Dn as l,ao as m,to as n,no as o,eo as p,$n as q,Un as r,On as s,Ln as t,qn as u,Tn as v,_n as w};
