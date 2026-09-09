window.Office3D=(()=>{"use strict";let scene=null,raf=0,t=0;
function init(){scene=document.querySelector(".world-scene");if(!scene)return;cancelAnimationFrame(raf);function loop(){t+=.004;scene.style.backgroundPosition=`${Math.sin(t)*1.5}% ${Math.cos(t)*1.5}%`;raf=requestAnimationFrame(loop)}loop()}
function event(){document.body.animate([{filter:"brightness(1)"},{filter:"brightness(1.25)"},{filter:"brightness(1)"}],{duration:420})}
function news(text){const x=document.querySelector(".screen-glow");if(x)x.title=text}
function resetCamera(){}
return{init,event,news,resetCamera};
})();