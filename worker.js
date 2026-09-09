/*
CLOUDFLARE WORKER — AI DIRECTOR
Set HF_TOKEN as a Cloudflare Worker secret. NEVER put the token in ai.js or GitHub.
Deploy this file to your Worker and keep the same URL in ai.js.
*/
const MODEL="meta-llama/Llama-3.2-3B-Instruct";
export default {async fetch(req,env){
if(req.method==="OPTIONS")return new Response("",{headers:{"Access-Control-Allow-Origin":"*","Access-Control-Allow-Headers":"Content-Type","Access-Control-Allow-Methods":"POST,OPTIONS"}});
if(req.method!=="POST")return json({ok:true});
try{
const body=await req.json();
const context=body.context||{};
const prompt=`You are the AI Director of a fictional political strategy game. Return ONLY valid JSON. Create exactly one event with title, description, rarity and exactly 3 choices. Each choice needs title, text, effects. Effects must use only numeric values from: money,economy,energy,popularity,stability,relations,sanctions,reputation,parliament,bureaucracy,tension,market,worldEnergy,diplomacy,inflation,mediaNoise. No graphic violence. Context: ${JSON.stringify(context)}`;
const r=await fetch("https://api-inference.huggingface.co/models/"+MODEL,{method:"POST",headers:{Authorization:"Bearer "+env.HF_TOKEN,"Content-Type":"application/json"},body:JSON.stringify({inputs:prompt,parameters:{max_new_tokens:700,temperature:.85}})});
const j=await r.json();const raw=Array.isArray(j)?j[0]?.generated_text||"":j.generated_text||"";const match=raw.match(/\{[\s\S]*\}/);if(!match)throw Error("No JSON");
return json({event:JSON.parse(match[0])});
}catch(e){return json({event:null,error:String(e.message||e)})}}
};
function json(x){return new Response(JSON.stringify(x),{headers:{"Content-Type":"application/json","Access-Control-Allow-Origin":"*"}})}
