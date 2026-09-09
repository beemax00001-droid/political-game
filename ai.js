window.RepublicAI=(()=>{"use strict";
const endpoint="https://political-game-ai.tm1190128.workers.dev/";
function clean(e){if(!e||!e.title||!Array.isArray(e.choices)||e.choices.length!==3)return null;return{...e,choices:e.choices.slice(0,3).map((c,i)=>({title:String(c.title||["احتیاط","مذاکره","اقدام سریع"][i]),text:String(c.text||"این تصمیم مسیر جمهوری را تغییر می‌دهد."),effects:c.effects&&typeof c.effects==="object"?c.effects:{}}))}}
async function event(context){
try{const r=await fetch(endpoint,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({type:"event",context})});if(!r.ok)throw Error("AI_HTTP_"+r.status);const j=await r.json();return clean(j.event||j.result||j)}catch(e){console.warn("AI unavailable:",e);return null}
}
return{event};
})();