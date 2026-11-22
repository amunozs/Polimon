'use strict';
/* =====================================================================
   UTILIDADES: funciones pequeñas que usa todo el juego.
   ===================================================================== */

const IMG=id=>`img/${id}.webp?v=${CONFIG.version}`;
const monImg=m=>IMG(m.pana?'felipe82':m.p.id);
const $=s=>document.querySelector(s);
const rnd=n=>Math.floor(Math.random()*n);
const shuffle=a=>{a=a.slice();for(let i=a.length-1;i>0;i--){const j=rnd(i+1);[a[i],a[j]]=[a[j],a[i]];}return a;};
function eff(atk,defTypes){if(!atk)return 1;return defTypes.reduce((m,d)=>m*((CHART[atk]||{})[d]??1),1);}
function calcStats(b){const f=x=>Math.floor((2*x+31)*LV/100);return{hp:f(b[0])+LV+10,atk:f(b[1])+5,def:f(b[2])+5,spa:f(b[3])+5,spd:f(b[4])+5,spe:f(b[5])+5};}
function c1(p){return TYPES[p.types[0]].c;}
function chipHTML(t){return `<span class="chip" style="--tc:${TYPES[t].c}">${TYPES[t].e} ${TYPES[t].n}</span>`;}
function effTxt(e){return e===0?'×0':e===.25?'×¼':e===.5?'×½':e===2?'×2':e===4?'×4':'';}
function esc(s){return String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));}
const avs=p=>`<div class="avs" style="--c1:${c1(p)}66"><img src="${IMG(p.id)}" alt=""></div>`;


/* ---------- Estadísticas anónimas (GoatCounter) ---------- */
// evento('victoria') → aparece en tu panel como «evento/victoria».
function evento(nombre){
  if(!ANALITICA_ON)return;
  try{if(window.goatcounter&&window.goatcounter.count)window.goatcounter.count({path:'evento/'+nombre,title:nombre,event:true});}catch(_){}
}
