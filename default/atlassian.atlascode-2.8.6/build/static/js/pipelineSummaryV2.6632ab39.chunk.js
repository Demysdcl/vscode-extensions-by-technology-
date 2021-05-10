(window.webpackJsonp=window.webpackJsonp||[]).push([[17],{143:function(e,t,a){"use strict";a.d(t,"a",(function(){return l}));var n,r=a(0);!function(e){e.Error="error",e.OnlineStatus="onlineStatus",e.PMFStatus="pmfStatus"}(n||(n={}));var s=a(18),i=a(20);function l(e){const t=Object(r.useMemo)(acquireVsCodeApi,[acquireVsCodeApi]),a=Object(r.useCallback)(e=>{t.postMessage(e)},[t]),l=Object(r.useCallback)((e,a,r,s)=>(t.postMessage(e),new Promise((e,t)=>{const i=setTimeout(()=>{window.removeEventListener("message",l),clearTimeout(i),t("timeout waiting for event "+a)},r),l=r=>{!r.data.type||!a||r.data.type!==a||s&&r.data.nonce!==s||(clearTimeout(i),window.removeEventListener("message",l),e(r.data)),r.data.type===n.Error&&s&&r.data.nonce===s&&(window.removeEventListener("message",l),clearTimeout(i),t(r.data.reason))};window.addEventListener("message",l)})),[t]),c=Object(r.useContext)(s.a),o=Object(r.useContext)(i.a),d=Object(r.useCallback)(t=>{const a=t.data;if(a&&a.type)switch(a.type){case n.Error:c.showError(a.reason);break;case n.OnlineStatus:break;case n.PMFStatus:a.showPMF&&o.showPMFBanner();break;default:e(a)}},[c,o,e]);return Object(r.useEffect)(()=>(window.addEventListener("message",d),t.postMessage({type:"refresh"}),()=>{window.removeEventListener("message",d)}),[e,d,t]),[a,l]}},918:function(e,t,a){"use strict";a.r(t);var n,r,s,i,l,c=a(109),o=a(68),d=a(679),u=a(73),p=a(379),g=a(694),m=a(678),f=a(74),b=a(71),_=a(353),h=a(407),v=a(912),E=a(849),C=a.n(E),w=a(850),k=a.n(w),x=a(142),y=a.n(x),O=a(132),S=a(0),j=a.n(S),R=a(96);function N(e){if(!e)return n.Unknown;switch(e.type){case"pipeline_state_completed":case"pipeline_step_state_completed":return function(e){switch(e.type){case"pipeline_state_completed_successful":case"pipeline_step_state_completed_successful":return n.Successful;case"pipeline_state_completed_error":case"pipeline_step_state_completed_error":return n.Error;case"pipeline_state_completed_failed":case"pipeline_step_state_completed_failed":return n.Failed;case"pipeline_state_completed_stopped":case"pipeline_step_state_completed_stopped":return n.Stopped;case"pipeline_step_state_completed_not_run":return n.NotRun;default:return n.Unknown}}(e.result);case"pipeline_state_in_progress":case"pipeline_step_state_in_progress":return P(e.stage);case"pipeline_state_pending":return n.Pending;case"pipeline_step_state_pending":return P(e.stage);default:return n.Unknown}}function P(e){if(!e)return n.InProgress;switch(e.type){case"pipeline_state_in_progress_running":return n.InProgress;case"pipeline_step_state_pending_pending":case"pipeline_step_state_in_progress_pending":return n.Pending;case"pipeline_step_state_pending_paused":case"pipeline_state_in_progress_paused":return n.Paused;case"pipeline_step_state_pending_halted":case"pipeline_state_in_progress_halted":return n.Stopped;default:return n.Unknown}}!function(e){e[e.Pending=0]="Pending",e[e.InProgress=1]="InProgress",e[e.Paused=2]="Paused",e[e.Stopped=3]="Stopped",e[e.Successful=4]="Successful",e[e.Error=5]="Error",e[e.Failed=6]="Failed",e[e.NotRun=7]="NotRun",e[e.Unknown=8]="Unknown"}(n||(n={})),function(e){e.Branch="branches",e.Tag="tags",e.Bookmark="bookmarks",e.Custom="custom",e.PullRequests="pull-requests",e.Default="default"}(r||(r={})),function(e){e.Reference="pipeline_ref_target",e.Commit="pipeline_commit_target",e.PullRequest="pipeline_pullrequest_target"}(s||(s={})),function(e){e.Branch="branch",e.NamedBranch="named_branch",e.Tag="tag",e.AnnotatedTag="annotated_tag",e.Bookmark="bookmark"}(i||(i={})),function(e){e[e.SETUP=0]="SETUP",e[e.BUILD=1]="BUILD",e[e.TEARDOWN=2]="TEARDOWN"}(l||(l={}));const A={type:s.Reference},H={repository:{id:"",name:"",displayName:"",fullName:"",url:"",avatarUrl:"",issueTrackerEnabled:!1},site:{details:Object.assign(Object.assign({},R.g),{product:R.b}),ownerSlug:"",repoSlug:""},build_number:0,created_on:"",state:{name:"",type:""},uuid:"",target:A};var U=a(661);function B(e){return j.a.createElement(U.a,Object.assign({},e,{viewBox:"0 0 16 16",component:t=>j.a.createElement("svg",Object.assign({},t,{fill:"currentColor","fill-rule":"evenodd"}),j.a.createElement("title",null,e.titleAccess),j.a.createElement("path",{d:"M7.061 9h2V4h-2v5zm0 3h2v-2h-2v2zm8.367-7.102a8.039 8.039 0 0 0-1.703-2.546A8.122 8.122 0 0 0 11.17.641 7.765 7.765 0 0 0 8.061 0a7.792 7.792 0 0 0-3.102.633 8.055 8.055 0 0 0-2.547 1.703A8.11 8.11 0 0 0 .701 4.891 7.764 7.764 0 0 0 .061 8c0 1.083.21 2.117.632 3.102.422.984.99 1.833 1.703 2.546a8.122 8.122 0 0 0 2.555 1.711 7.77 7.77 0 0 0 3.11.641 7.788 7.788 0 0 0 3.101-.633 8.055 8.055 0 0 0 2.547-1.703 8.1 8.1 0 0 0 1.711-2.555A7.765 7.765 0 0 0 16.061 8a7.796 7.796 0 0 0-.633-3.102z"}))}))}function I(e){return j.a.createElement(U.a,Object.assign({},e,{viewBox:"0 0 16 16",component:t=>j.a.createElement("svg",Object.assign({},t,{fill:"currentColor","fill-rule":"evenodd"}),j.a.createElement("title",null,e.titleAccess),j.a.createElement("path",{d:"M.052 8a7.77 7.77 0 0 0 .637 3.105 8.055 8.055 0 0 0 1.707 2.551 8.055 8.055 0 0 0 2.55 1.707A7.77 7.77 0 0 0 8.053 16a7.77 7.77 0 0 0 3.105-.637 8.055 8.055 0 0 0 2.55-1.707 8.055 8.055 0 0 0 1.708-2.551A7.77 7.77 0 0 0 16.052 8a7.77 7.77 0 0 0-.637-3.105 8.055 8.055 0 0 0-1.707-2.551A8.055 8.055 0 0 0 11.157.637 7.77 7.77 0 0 0 8.052 0a7.77 7.77 0 0 0-3.105.637 8.055 8.055 0 0 0-2.551 1.707A8.055 8.055 0 0 0 .689 4.895 7.77 7.77 0 0 0 .052 8zm12.39 1.396a4.675 4.675 0 0 0-5.883-5.883l.61 1.904a2.676 2.676 0 0 1 3.368 3.369l1.905.61zM8.74 10.583a2.677 2.677 0 0 1-2.715-.653 2.678 2.678 0 0 1-.653-2.715l-1.905-.611a4.677 4.677 0 0 0 5.883 5.884l-.61-1.905z"}))}))}function L(e){return j.a.createElement(U.a,Object.assign({},e,{viewBox:"0 0 16 16",component:t=>j.a.createElement("svg",Object.assign({},t,{fill:"currentColor","fill-rule":"evenodd"}),j.a.createElement("title",null,e.titleAccess),j.a.createElement("path",{d:"M8,14 C11.3137085,14 14,11.3137085 14,8 C14,4.6862915 11.3137085,2 8,2 C4.6862915,2 2,4.6862915 2,8 C2,11.3137085 4.6862915,14 8,14 Z"}))}))}function M(e){return j.a.createElement(U.a,Object.assign({},e,{viewBox:"0 0 16 16",component:t=>j.a.createElement("svg",Object.assign({},t,{fill:"currentColor","fill-rule":"evenodd"}),j.a.createElement("title",null,e.titleAccess),j.a.createElement("path",{d:"M8,16 C3.581722,16 0,12.418278 0,8 C0,3.581722 3.581722,0 8,0 C12.418278,0 16,3.581722 16,8 C16,12.418278 12.418278,16 8,16 Z M8,14 C11.3137085,14 14,11.3137085 14,8 C14,4.6862915 11.3137085,2 8,2 C4.6862915,2 2,4.6862915 2,8 C2,11.3137085 4.6862915,14 8,14 Z M8,12 C5.790861,12 4,10.209139 4,8 C4,5.790861 5.790861,4 8,4 C10.209139,4 12,5.790861 12,8 C12,10.209139 10.209139,12 8,12 Z"}))}))}function T(e){return j.a.createElement(U.a,Object.assign({},e,{viewBox:"0 0 16 16",component:t=>j.a.createElement("svg",Object.assign({},t,{fill:"currentColor","fill-rule":"evenodd"}),j.a.createElement("title",null,e.titleAccess),j.a.createElement("path",{d:"M4.184 9h8V7h-8v2zm11.367-4.102a8.039 8.039 0 0 0-1.703-2.546A8.122 8.122 0 0 0 11.293.641 7.769 7.769 0 0 0 8.184 0a7.789 7.789 0 0 0-3.102.633 8.043 8.043 0 0 0-2.547 1.703A8.11 8.11 0 0 0 .824 4.891 7.747 7.747 0 0 0 .184 8c0 1.083.211 2.117.632 3.102.422.984.99 1.833 1.704 2.546a8.084 8.084 0 0 0 2.554 1.711 7.766 7.766 0 0 0 3.11.641 7.788 7.788 0 0 0 3.101-.633 8.043 8.043 0 0 0 2.547-1.703 8.133 8.133 0 0 0 1.711-2.555A7.765 7.765 0 0 0 16.184 8a7.796 7.796 0 0 0-.633-3.102z"}))}))}function F(e){return j.a.createElement(U.a,Object.assign({},e,{viewBox:"0 0 16 16",component:t=>j.a.createElement("svg",Object.assign({},t,{fill:"currentColor","fill-rule":"evenodd"}),j.a.createElement("title",null,e.titleAccess),j.a.createElement("path",{d:"M11.922 6.375l-4.328 4.359c-.188.146-.37.219-.547.219h-.375a.791.791 0 0 1-.297-.062.739.739 0 0 1-.25-.157L4.078 8.672A.344.344 0 0 1 4 8.445c0-.088.026-.164.078-.226l.813-.797a.254.254 0 0 1 .219-.11c.093 0 .17.037.234.11L6.64 8.719a.308.308 0 0 0 .226.094.314.314 0 0 0 .227-.094l3.562-3.594a.41.41 0 0 1 .243-.078.29.29 0 0 1 .21.078l.813.797a.408.408 0 0 1 .078.242.285.285 0 0 1-.078.211m3.445-1.477a8.039 8.039 0 0 0-1.703-2.546A8.118 8.118 0 0 0 11.11.641 7.777 7.777 0 0 0 8 0a7.784 7.784 0 0 0-3.101.633 8.032 8.032 0 0 0-2.547 1.703A8.11 8.11 0 0 0 .64 4.891 7.748 7.748 0 0 0 0 8c0 1.083.21 2.117.633 3.102a8.022 8.022 0 0 0 1.703 2.546 8.1 8.1 0 0 0 2.555 1.711A7.762 7.762 0 0 0 8 16a7.796 7.796 0 0 0 3.102-.633 8.055 8.055 0 0 0 2.547-1.703 8.15 8.15 0 0 0 1.71-2.555C15.787 10.12 16 9.083 16 8a7.796 7.796 0 0 0-.632-3.102"}))}))}var $,z,D=a(21),W=a(12);!function(e){e.FetchLogRange="fetchLogRange",e.ReRunPipeline="reRunPipeline"}($||($={})),function(e){e.Update="pipelineUpdate",e.StepsUpdate="stepsUpdate"}(z||(z={}));var V=a(143);const q={refresh:()=>{},rerun:()=>{},fetchLogs:(e,t)=>Promise.resolve("")};var J;!function(e){e.Update="update",e.StepsUpdate="stepsUpdate",e.Refreshing="refreshing"}(J||(J={}));const Y=j.a.createContext(q),Z={pipeline:H,isSomethingLoading:!1,isRefreshing:!1};function K(e,t){switch(t.type){case J.Update:return Object.assign(Object.assign({},e),{pipeline:t.data,steps:void 0,isRefreshing:!1});case J.StepsUpdate:return Object.assign(Object.assign({},e),{steps:t.steps});case J.Refreshing:return Object.assign(Object.assign({},e),{isRefreshing:!0});default:return Object(D.b)(e,t)}}const G=Object(o.a)(e=>({title:{flexGrow:0,marginRight:e.spacing(3)},targetSelectLabel:{marginRight:e.spacing(1)},floatLeft:{float:"left"},floatRight:{float:"right"},loadingIndicator:{marginTop:"20px"},logs:{whiteSpace:"pre-wrap",fontFamily:"Monaco, Courier New, Courier, monospace",fontSize:"1.2em",width:"100%"},logHeader:{whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",fontFamily:"Monaco, Courier New, Courier, monospace",fontSize:"1.2em"},paper100:{overflow:"hidden",height:"100%"},hiddenOverflow:{overflow:"hidden"},greenHeader:{backgroundColor:"rgb(54, 178, 126)",color:"rgb(255,255,255)"},greenHeaderButton:{backgroundColor:"rgba(9, 30, 66, 0.08)",color:"rgb(255,255,255)"},blueHeader:{backgroundColor:"rgb(0, 101, 255)",color:"rgb(255,255,255)"},blueHeaderButton:{backgroundColor:"rgba(9, 30, 66, 0.133)",color:"rgb(255,255,255)"},orangeHeader:{backgroundColor:"rgb(255, 171, 0)",color:"rgb(0,0,0)"},orangeHeaderButton:{backgroundColor:"rgba(9, 30, 66, 0.176)",color:"rgb(0,0,0)"},redHeader:{backgroundColor:"rgb(255, 86, 48)",color:"rgb(255, 255, 255)"},redHeaderButton:{backgroundColor:"rgba(9, 30, 66, 0.08)",color:"rgb(255, 255, 255)"},grayHeader:{backgroundColor:"rgb(192, 192, 192)",color:"rgb(0, 0, 0)"},grayHeaderButton:{backgroundColor:"rgba(9, 30, 66, 0.133)",color:"rgb(0, 0, 0)"},pipelineHeader:{display:"flex",justifyContent:"space-between",alignItems:"center",width:"100%"},pipelineHeaderText:{display:"flex",alignItems:"center"},pipelineHeaderStatusIcon:{marginRight:"5px",display:"flex"},stepHeader:{paddingRight:"24px",paddingLeft:"24px",paddingTop:"9px",paddingBottom:"9px",marginTop:"9px",border:"1px solid black",borderRadius:"5px 5px 0 0"},loglessStepHeader:{paddingRight:"24px",paddingLeft:"24px",paddingTop:"9px",paddingBottom:"9px",marginTop:"9px",border:"1px solid black",borderRadius:"5px 5px 5px 5px"},stepHeaderContent:{display:"flex",justifyContent:"space-between",alignItems:"center"},small:{width:e.spacing(3),height:e.spacing(3)},icon:{marginLeft:"15px",marginRight:"5px",verticalAlign:"text-bottom"},stepStatusIcon:{marginRight:"5px",height:"23px",width:"23px",border:"2px solid White",borderRadius:"50%",backgroundColor:"White"},statusIcon:{marginRight:"5px",verticalAlign:"text-bottom"},avatar:{marginRight:"12px",width:"32px",height:"32px",border:"2px solid White"},flex:{display:"flex",alignItems:"center"}}));function Q(e){if(!e)return"";const t=e%60,a=Math.trunc(e/60);return a>0?`${a} min ${t} sec`:t+" sec"}t.default=()=>{const e=G(),[t,a]=function(){const[e,t]=Object(S.useReducer)(K,Z),a=Object(S.useCallback)(e=>{switch(e.type){case z.Update:t({type:J.Update,data:e.pipeline});break;case z.StepsUpdate:t({type:J.StepsUpdate,steps:e.steps})}},[]),[n]=Object(V.a)(a),r=Object(S.useCallback)(()=>{t({type:J.Refreshing,data:{}}),n({type:W.a.Refresh})},[n]),s=Object(S.useCallback)(()=>{n({type:$.ReRunPipeline})},[n]),i=Object(S.useCallback)((e,t)=>{n({type:$.FetchLogRange,uuid:e,reference:t})},[n]);return[e,Object(S.useMemo)(()=>({refresh:r,rerun:s,fetchLogs:i}),[r,s,i])]}();function r(e){let t="rgb(192, 192, 192)";switch(N(e)){case n.Pending:case n.InProgress:t="rgb(0, 101, 255)";break;case n.Paused:case n.Successful:t="rgb(54, 178, 126)";break;case n.Stopped:t="rgb(255, 171, 0)";break;case n.Error:case n.Failed:t="rgb(255, 86, 48)";break;default:t="rgb(192, 192, 192)"}return{color:t}}function s({aKey:t,name:a,logs:n,logRange:r,onChange:s}){return j.a.createElement(g.a,{key:t,square:!1,onChange:s,disabled:void 0===r||r.lastByte<0},j.a.createElement(m.a,{className:e.hiddenOverflow,expandIcon:j.a.createElement(y.a,null),id:t},j.a.createElement("div",{className:e.logHeader},a)),function(t){return j.a.createElement(d.a,null,t?j.a.createElement("pre",{className:e.logs},t):j.a.createElement(u.a,{container:!0,justify:"center"},j.a.createElement(p.a,null)))}(n))}const i=Object(S.useCallback)((e,t)=>{if(!e)return n.Unknown;switch(N(e)){case n.Successful:return j.a.createElement(F,{className:t,titleAccess:"Success"});case n.Paused:return j.a.createElement(M,{className:t,titleAccess:"Paused"});case n.Pending:return j.a.createElement(I,{className:t,titleAccess:"Pending"});case n.InProgress:return j.a.createElement(I,{className:t,titleAccess:"Building"});case n.Stopped:return j.a.createElement(T,{className:t,titleAccess:"Stopped"});case n.Error:return j.a.createElement(B,{className:t,titleAccess:"Error"});case n.Failed:return j.a.createElement(B,{className:t,titleAccess:"Failed"});case n.NotRun:return j.a.createElement(L,{className:t,titleAccess:"Not Run"});default:return j.a.createElement(B,{className:t,titleAccess:"Failed"})}},[]);function o(e,t,a,n,r,i){const c=a===l.SETUP?"Build setup":"Build teardown";return j.a.createElement(s,{aKey:`${c}-${e}`,name:c,logs:n,logRange:r,onChange:(r,s)=>{s&&!n&&i(e,{stepIndex:t,stage:a})},key:`${c}-${e}`})}const E=Object(S.useCallback)((t,a,n,s)=>{var l;return j.a.createElement("div",{className:a,style:n},j.a.createElement(f.a,{variant:"h4"},j.a.createElement("div",{className:e.stepHeaderContent},j.a.createElement("div",{className:e.flex},t.state?j.a.createElement("div",{style:r(t.state),className:e.flex},i(t.state,e.stepStatusIcon)):"",j.a.createElement("span",null,null!==(l=t.name)&&void 0!==l?l:`Step ${s+1} `)),j.a.createElement("span",null,!t.duration_in_seconds||function(e){var t,a;return"PAUSED"===(null===(a=null===(t=e.state)||void 0===t?void 0:t.stage)||void 0===a?void 0:a.name)}(t)?"Not run":Q(t.duration_in_seconds)))))},[e.stepHeaderContent,e.flex,i,e.stepStatusIcon]),w=Object(S.useCallback)((t,n)=>{var r,i;const c=`${t.uuid}-${n}`;if("NOT_RUN"===(null===(i=null===(r=t.state)||void 0===r?void 0:r.result)||void 0===i?void 0:i.name))return j.a.createElement("div",{key:c},E(t,e.loglessStepHeader,{},n));const d=function(e){var t,a;return"FAILED"===(null===(a=null===(t=e.state)||void 0===t?void 0:t.result)||void 0===a?void 0:a.name)}(t)?{color:"White",backgroundColor:"rgb(255, 86, 48)"}:{};return j.a.createElement("div",{key:c},E(t,e.stepHeader,d,n),j.a.createElement("div",null,o(t.uuid,n,l.SETUP,t.setup_logs,t.setup_log_range,a.fetchLogs),(u=t.uuid,p=n,g=t.script_commands,m=a.fetchLogs,j.a.createElement("div",null,g.map((e,t)=>j.a.createElement(s,{aKey:`${u}-${t}`,name:e.name,logs:e.logs,logRange:e.log_range,onChange:(a,n)=>{n&&!e.logs&&m(u,{stepIndex:p,stage:l.BUILD,commandIndex:t})},key:`${u}-${t}`})))),o(t.uuid,n,l.TEARDOWN,t.teardown_logs,t.teardown_log_range,a.fetchLogs)));var u,p,g,m},[e.loglessStepHeader,e.stepHeader,a.fetchLogs,E]),x=Object(S.useCallback)((e,t)=>w(e,t),[w]),R=Object(S.useMemo)(()=>t.steps?t.steps.map((e,t)=>x(e,t)):j.a.createElement(u.a,{container:!0,justify:"center"},j.a.createElement(p.a,{className:e.loadingIndicator})),[x,t.steps,e.loadingIndicator]),[P,A]=function(t){switch(N(t.state)){case n.Pending:case n.InProgress:return[e.blueHeader,e.blueHeaderButton];case n.Paused:return[e.greenHeader,e.greenHeaderButton];case n.Stopped:return[e.orangeHeader,e.orangeHeaderButton];case n.Successful:return[e.greenHeader,e.greenHeaderButton];case n.Error:case n.Failed:return[e.redHeader,e.redHeaderButton];default:return[e.grayHeader,e.grayHeaderButton]}}(t.pipeline);return j.a.createElement(Y.Provider,{value:a},j.a.createElement(b.a,{maxWidth:"xl"},j.a.createElement(_.a,{className:P},t.pipeline===H?j.a.createElement("div",null):j.a.createElement("div",{className:e.pipelineHeader},j.a.createElement(f.a,{variant:"h3",className:e.pipelineHeaderText},j.a.createElement("div",{className:e.pipelineHeaderStatusIcon},i(t.pipeline.state,e.pipelineHeaderStatusIcon)),j.a.createElement("a",{className:P,href:`${t.pipeline.repository.url}/addon/pipelines/home#!/results/${t.pipeline.build_number}`},"Pipeline #"+t.pipeline.build_number),t.pipeline.duration_in_seconds?j.a.createElement(C.a,{className:e.icon}):"",""+Q(t.pipeline.duration_in_seconds),t.pipeline.completed_on?j.a.createElement(k.a,{className:e.icon}):"",j.a.createElement("span",{title:(U=t.pipeline.completed_on,U?Object(O.format)(U,"MMM do YYYY, h:mm:ss a"):"")},""+function(e,t){return e||t?Object(O.distanceInWordsToNow)(null!==e&&void 0!==e?e:t)+" ago":""}(t.pipeline.completed_on))),j.a.createElement("div",{className:e.flex},j.a.createElement(h.a,{alt:t.pipeline.creator_name,src:t.pipeline.creator_avatar,className:e.avatar}),function(e){const t=N(e.state);return t===n.Pending||t===n.InProgress}(t.pipeline)?"":j.a.createElement(v.a,{variant:"contained",className:A,onClick:a.rerun},"Rerun"),j.a.createElement(c.e,{loading:t.isRefreshing,onClick:a.refresh})))),R));var U}},96:function(e,t,a){"use strict";var n;a.d(t,"c",(function(){return r})),a.d(t,"b",(function(){return s})),a.d(t,"a",(function(){return l})),a.d(t,"h",(function(){return c})),a.d(t,"g",(function(){return o})),a.d(t,"d",(function(){return d})),a.d(t,"e",(function(){return u})),a.d(t,"f",(function(){return p})),function(e){e.Update="update",e.Remove="remove"}(n||(n={}));const r={name:"Jira",key:"jira"},s={name:"Bitbucket",key:"bitbucket"};var i,l;!function(e){e.BitbucketCloud="bbcloud",e.BitbucketCloudStaging="bbcloudstaging",e.JiraCloud="jiracloud",e.JiraCloudStaging="jiracloudstaging"}(i||(i={})),function(e){e[e.Valid=0]="Valid",e[e.Invalid=1]="Invalid"}(l||(l={}));const c={id:"",displayName:"",email:"",avatarUrl:""},o={id:"",name:"",avatarUrl:"",host:"",baseLinkUrl:"",baseApiUrl:"",product:{name:"",key:""},isCloud:!0,userId:"",credentialId:""},d={id:"",name:"",avatarUrl:"",scopes:[],baseUrlSuffix:"atlassian.net"},u={user:c,state:l.Valid},p={user:c,username:"",password:"",state:l.Valid}}}]);