window.RepublicRealtime=(()=>{"use strict";
const URL="https://kkltydnftjwdgqtufdvl.supabase.co",KEY="sb_publishable_MB7iy1qpKxJf83gwh1TsjA_Bs0Ox6Bk";
let sb=null,ch=null,online=false,room="";
async function load(){if(sb)return sb;if(!window.supabase){await new Promise((ok,bad)=>{const s=document.createElement("script");s.src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2";s.onload=ok;s.onerror=bad;document.head.appendChild(s)})}sb=window.supabase.createClient(URL,KEY);return sb}
async function connect(code,player,handlers={}){room=code;try{const c=await load();ch=c.channel("roa-"+code,{config:{broadcast:{self:true},presence:{key:player.id}}});ch.on("broadcast",{event:"roa"} ,m=>handlers.message?.(m.payload)).on("presence",{event:"sync"},()=>handlers.presence?.(ch.presenceState())).on("presence",{event:"join"},()=>handlers.presence?.(ch.presenceState())).on("presence",{event:"leave"},()=>handlers.presence?.(ch.presenceState()));await ch.subscribe(async s=>{online=s==="SUBSCRIBED";if(online)await ch.track(player)});return online}catch(e){online=false;console.warn("Realtime fallback",e);return false}}
async function send(payload){if(online&&ch)try{await ch.send({type:"broadcast",event:"roa",payload})}catch{}}
function leave(){try{ch?.unsubscribe()}catch{}ch=null;online=false}
return{connect,send,leave,get online(){return online}};
})();