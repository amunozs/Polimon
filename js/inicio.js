'use strict';
/* =====================================================================
   ARRANQUE: conecta los botones y pinta la primera pantalla. Se carga el último.
   ===================================================================== */

$('#grid').addEventListener('click',e=>{
  const f=e.target.closest('[data-ficha]');if(f){e.stopPropagation();openFicha(POLBY[f.dataset.ficha]);return;}
  const c=e.target.closest('.card');if(c)togglePick(c.dataset.id);
});
$('#grid').addEventListener('keydown',e=>{if((e.key==='Enter'||e.key===' ')&&e.target.classList.contains('card')){e.preventDefault();togglePick(e.target.dataset.id);}});
$('#btnRandom').onclick=()=>{const pool=shuffle(POL.filter(p=>!isLocked(p)).map(p=>p.id));const out=[];for(const id of pool){if(out.length===3)break;if(POLBY[id].legend&&out.some(x=>POLBY[x].legend))continue;out.push(id);}picked=out;renderGrid();};
$('#btnGo').onclick=()=>{if(picked.length===3)startBattle(picked.slice());};
$('#btnTypes').onclick=openTypeChart;

$('#btnStart').onclick=async()=>{SND.init();SND.sfx('start');const b=$('#btnStart');b.style.animation='none';b.style.background='#fff';b.style.color='var(--accent)';
  await new Promise(r=>setTimeout(r,350));b.style.cssText='';show('select');renderGrid();SND.music('title');};
$('#btnHow').onclick=()=>openSheet(`<h2>Cómo se juega</h2><ol style="line-height:1.55;padding-left:20px;margin:10px 0 0">
  <li>Elige a 3 políticos para tu equipo.</li>
  <li>Cada turno, elige un argumento. Los botones marcan ×2 si es súper eficaz contra el rival.</li>
  <li>Puedes cambiar de político cuando quieras, como en Pokémon.</li>
  <li>Gana quien deje al rival sin argumentos. Toca el cuadro de texto para avanzar más rápido.</li>
  <li>Gana un combate para desbloquear a un personaje legendario.</li></ol>`);

$('#sheet').addEventListener('click',e=>{if(e.target.id==='sheet')closeSheet();});
document.addEventListener('keydown',e=>{if(e.key==='Escape')closeSheet();});
document.addEventListener('pointerdown',()=>{SND.init();if($('#scr-select').classList.contains('on')||$('#scr-title').classList.contains('on'))SND.music('title');},{passive:true});
document.addEventListener('click',e=>{const b=e.target.closest('.sndbtn');if(b){SND.toggle();syncSoundBtns();}});

$('#msg').addEventListener('click',()=>{if(skipFn)skipFn();});
$('#btnSpeed').onclick=()=>{MODE=MODE==='normal'?'fast':MODE==='fast'?'tap':'normal';setModeLabel();try{localStorage.setItem(KEY('ritmo'),MODE);}catch(_){}};
setModeLabel();

$('#btnQuit').onclick=()=>{ABORT=true;if(skipFn)skipFn();if(B)B.over=true;closeSheet();$('#end').classList.remove('on');$('#fx').innerHTML='';$('#field').classList.remove('dizzy');document.querySelectorAll('.bub').forEach(e=>e.remove());show('select');SND.music('title');};

document.addEventListener('visibilitychange',()=>{if(document.hidden)SND.music(null);else if($('#scr-battle').classList.contains('on')&&B&&!B.over)SND.music('battle');else if($('#scr-select').classList.contains('on'))SND.music('title');});
renderGrid();renderTitle();syncSoundBtns();

// Distintivo de preproducción
if(ENTORNO==='pre'){const b=document.createElement('div');b.className='prebadge';b.textContent='PRE';document.body.appendChild(b);}
