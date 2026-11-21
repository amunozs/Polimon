'use strict';
/* =====================================================================
   PANTALLAS: inicio, selección de equipo, fichas, flujo del combate, final y desbloqueos.
   ===================================================================== */

let picked=[];
let lastTeam=null;
function renderGrid(){
  $('#grid').innerHTML=POL.map(p=>{
    if(isLocked(p))return `<div class="card locked" role="button" tabindex="0" data-id="${p.id}">
      <div class="hd">${avs(p)}<div class="nm">???</div></div>
      <div><span class="lgtag">⭐ LEGENDARIO</span></div>
      <div class="meta">Gana un combate para desbloquearlo.</div></div>`;
    const i=picked.indexOf(p.id);const tot=p.base.reduce((a,b)=>a+b,0);
    return `<div class="card${i>=0?' sel':''}${p.legend?' legend':''}" role="button" tabindex="0" aria-pressed="${i>=0}" data-id="${p.id}">
      ${i>=0?`<span class="num">${i+1}</span>`:''}
      <div class="hd">${avs(p)}<div class="nm">${esc(p.name)}</div></div>
      ${p.legend?'<div><span class="lgtag">⭐ LEGENDARIO</span></div>':''}
      <div class="chips">${p.types.map(chipHTML).join('')}</div>
      <div class="meta">${ABIL[p.ability].n} · Total ${tot}</div>
      <button class="fx" type="button" data-ficha="${p.id}">Ver ficha</button>
    </div>`;}).join('');
  $('#slots').innerHTML=[0,1,2].map(i=>{const p=POLBY[picked[i]];return p?`<div class="slot full" style="--c1:${c1(p)}"><img src="${IMG(p.id)}" alt="${esc(p.name)}"></div>`:'<div class="slot"></div>';}).join('');
  $('#btnGo').disabled=picked.length!==3;
}
function togglePick(id){
  const p=POLBY[id];
  if(isLocked(p)){SND.sfx('lock');openSheet(`<h2>🔒 Personaje legendario</h2><p style="line-height:1.5;margin:10px 0 0">Hay un expresidente esperando su momento. <b>Gana un combate</b> para desbloquearlo… y prepárate para algo muy distinto.</p>`);return;}
  if(p.legend&&!picked.includes(id)){const other=picked.find(x=>POLBY[x].legend);if(other)picked.splice(picked.indexOf(other),1);}
  const i=picked.indexOf(id);
  if(i>=0)picked.splice(i,1);else if(picked.length<3){picked.push(id);SND.cry(id);}else{picked.shift();picked.push(id);SND.cry(id);}
  renderGrid();
}
function renderTitle(){
  const one=POL.map(p=>`<div class="pc${isLocked(p)?' lock':p.legend?' leg':''}"><img src="${IMG(p.id)}" alt=""></div>`).join('');
  $('#parade').innerHTML=one+one;
  $('#ttNew').innerHTML=UNL.felipe?'⭐ Tienes desbloqueado a <b>Felipe GALzález</b>, legendario. Llévalo al debate.':'🆕 Hay un político <b>LEGENDARIO</b> escondido. Gana un combate para desbloquearlo.';
}
function openSheet(html){$('#pane').innerHTML=`<button class="x" type="button" id="sheetX">Cerrar</button>`+html;$('#sheet').classList.add('on');$('#sheetX').onclick=closeSheet;$('#sheetX').focus();}
function closeSheet(){$('#sheet').classList.remove('on');}
function moveMeta(m,pp){
  if(m.cat==='X')return `Estado · PP ${pp}${m.prio?' · Prioridad +'+m.prio:''}`;
  const pw=m.eruption?'≤'+m.power:m.multi?`${m.power} ×${m.multi===2?'3-6':'2-5'}`:m.power;
  return `${m.cat==='P'?'Físico':'Especial'} · Potencia ${pw}${m.acc?' · Precisión '+m.acc:''} · PP ${pp}${m.prio?' · Prioridad +'+m.prio:''}`;
}
function openFicha(p,mon){
  const tot=p.base.reduce((a,b)=>a+b,0);
  const labels=['PS','Ataque','Defensa','Ataque Esp.','Defensa Esp.','Velocidad'];
  const stats=p.base.map((v,i)=>`<span>${labels[i]}</span><span class="bar"><i style="width:${Math.min(100,v/150*100)}%"></i></span><span class="v">${v}</span>`).join('');
  const mv=(mon?mon.moves.map(x=>x.id):p.moves).map((id,i)=>{const m=MOVES[id];const pp=mon?`${mon.moves[i].pp}/${m.pp}`:m.pp;
    return `<div class="mvi" style="--tc:${TYPES[m.type].c}"><div class="a"><span>${esc(m.name)}</span><span>${TYPES[m.type].e} ${TYPES[m.type].n}</span></div>
    <div class="b">${moveMeta(m,pp)}</div>
    <div class="c">${esc(m.desc)} <i>${esc(m.quip)}</i></div></div>`;}).join('');
  openSheet(`<div class="big" style="${p.legend?'display:flex;gap:8px;width:auto':''}"><img src="${IMG(p.id)}" alt="" style="${p.legend?'width:120px':''}">${p.legend?`<img src="${IMG('felipe82')}" alt="Forma del 82" style="width:120px">`:''}</div><h2>${p.legend?'⭐ ':''}${esc(p.name)}</h2>${p.legend?'<p style="margin:4px 0 0;font-size:13px;color:#6c6577">Legendario. Solo puedes llevar uno por equipo. Con «Chaqueta de pana» se transforma en el Felipe del 82.</p>':''}<div class="chips" style="margin-top:8px">${p.types.map(chipHTML).join('')}</div>
    <h4>Habilidad</h4><div><b>${ABIL[p.ability].n}.</b> ${ABIL[p.ability].d}</div>
    <h4>Estadísticas base · total ${tot}</h4><div class="stats">${stats}</div>
    <h4>Argumentos</h4><div class="mvl">${mv}</div>${p.legend?`<h4>Argumentos de la forma del 82</h4><div class="mvl">${F82.map(id=>{const m=MOVES[id];return `<div class="mvi" style="--tc:${TYPES[m.type].c}"><div class="a"><span>${esc(m.name)}</span><span>${TYPES[m.type].e} ${TYPES[m.type].n}</span></div><div class="b">${moveMeta(m,m.pp)}</div><div class="c">${esc(m.desc)} <i>${esc(m.quip)}</i></div></div>`;}).join('')}</div>`:''}`);
}
function openTypeChart(){
  const rows=Object.keys(TYPES).map(a=>{
    const gr={2:[],.5:[],0:[]};for(const[d,v]of Object.entries(CHART[a]))gr[v].push(TYPES[d].e+' '+TYPES[d].n);
    const parts=[];if(gr[2].length)parts.push('<b style="display:inline">×2</b> '+gr[2].join(', '));if(gr[.5].length)parts.push('<b style="display:inline">×½</b> '+gr[.5].join(', '));if(gr[0].length)parts.push('<b style="display:inline">×0</b> '+gr[0].join(', '));
    return `<div class="r" style="--tc:${TYPES[a].c}"><b>${TYPES[a].e} ${TYPES[a].n} ataca a…</b>${parts.join(' · ')||'Todo a ×1'}</div>`;}).join('');
  openSheet(`<h2>Tabla de tipos</h2><p style="font-size:13px;color:#6c6577;margin:6px 0 10px">Lo que no aparece hace daño normal (×1). Si el atacante es del mismo tipo que su argumento, +50%. Con lluvia, lo Tuit pega ×1,3 y lo Castizo ×0,5; con terrazas, al revés.</p><div class="tch">${rows}</div>`);
}

function show(id){document.querySelectorAll('.screen').forEach(s=>s.classList.toggle('on',s.id==='scr-'+id));if(id==='title')renderTitle();}
async function startBattle(ids){
  ABORT=false;if(skipFn)skipFn();
  lastTeam=ids.slice();
  const foeIds=shuffle(POL.filter(p=>!p.legend).map(p=>p.id).filter(id=>!ids.includes(id))).slice(0,3);
  B={teams:[ids.map(id=>makeMon(id,0)),foeIds.map(id=>makeMon(id,1))],act:[0,0],lastMove:null,over:false,acted:new Set(),resolve:null,rivSeen:new Set(),lastKO:null,
     field:{w:null,turns:0},sides:[{obras:0,caganer:false,publico:0,rescate:false},{obras:0,caganer:false,publico:0,rescate:false}],animating:false};
  $('#end').classList.remove('on');$('#fx').innerHTML='';$('#field').classList.remove('dizzy');document.querySelectorAll('.bub').forEach(e=>e.remove());
  show('battle');SND.init();SND.music('battle');waitControls();setSprite(0);setSprite(1);renderPlates();
  try{
    await say('¡Empieza el debate!',`Tu rival trae a ${B.teams[1].map(m=>m.name).join(', ')}.`);
    SND.cry(active(1).p.id);await say(`El rival saca a ${active(1).name}.`,null,{bub:{s:1,m:active(1),line:active(1).p.entry}});
    SND.cry(active(0).p.id);if(active(0).p.legend)await legendIntro(0);updateMusic();await say(`¡Adelante, ${active(0).name}!`,null,{bub:{s:0,m:active(0),line:active(0).p.entry}});
    await onEntry(1);await onEntry(0);await checkRivalry();
    const myB=B;
    while(B===myB&&!B.over){const a=await getPlayerAction();if(B!==myB)return;const ai=aiChoose();await runTurn([a,ai]);}
  }catch(e){if(e!==ABORTERR)console.error(e);}
}
function headline(){
  const ko=B.lastKO;
  const allm=B.teams[0].concat(B.teams[1]);
  const mvp=allm.reduce((a,m)=>((m.dealtTot||0)>(a.dealtTot||0)?m:a),allm[0]);
  const pick=a=>a[rnd(a.length)];
  let h;
  if(ko){const W=ko.by.name,L=ko.victim.name,M=ko.move;
    h=pick([`${W} tumba a ${L} con «${M}»`,`${L} se queda sin argumentos tras «${M}» de ${W}`,`${L} pide cinco días para digerir la derrota ante ${W}`,`${W} gana el debate; ${L} asegura que técnicamente ha ganado`,`«${M}»: la frase de ${W} que ha hundido a ${L}`]);}
  else h=pick(['El debate acaba con todos sin argumentos','Nadie gana el debate, pero todos dicen haberlo ganado']);
  const sub=(mvp&&mvp.dealtTot)?`Mejor del debate: ${mvp.name}, con ${mvp.dealtTot} PS de daño.`:'';
  return{h,sub};
}
function finish(won){
  const left=B.teams[0].filter(m=>m.hp>0).length;
  const{h,sub}=headline();
  $('#field').classList.remove('dizzy');
  const paper=`<div class="news"><div class="mast">EL HEMICICLO · Edición 29‑N</div><div class="hl" id="hl">${esc(h)}</div><div class="sb">${esc(sub)}</div></div>`;
  $('#endBox').innerHTML=(won
    ?`<h2>¡VICTORIA!</h2><p>Has ganado el debate con ${left} de 3 en pie. Según el CIS, por 99 puntos.</p>`
    :`<h2>DERROTA</h2><p>Te has quedado sin argumentos. Toca dimitir… o escribir un manual de resistencia.</p>`)+paper;
  $('#endBox').innerHTML+=`<button class="btn ghost" type="button" id="eCopy">📋 Copiar titular</button><button class="btn" type="button" id="eAgain">Revancha</button><button class="btn ghost" type="button" id="eNew">Cambiar de equipo</button>`;
  SND.jingle(won);
  if(won&&!UNL.felipe){UNL.felipe=true;try{localStorage.setItem(KEY('legend-felipe'),'1');}catch(_){}setTimeout(showUnlock,1200);}
  else setTimeout(()=>$('#end').classList.add('on'),900*SPEED);
  $('#eCopy').onclick=async()=>{const txt=`${h}. ${sub} #Polimón`;try{await navigator.clipboard.writeText(txt);$('#eCopy').textContent='✔ Copiado';}catch(_){const r=document.createRange();r.selectNodeContents($('#hl'));const sel=getSelection();sel.removeAllRanges();sel.addRange(r);$('#eCopy').textContent='Selecciónalo y cópialo';}};
  $('#eAgain').onclick=()=>startBattle(lastTeam);
  $('#eNew').onclick=()=>{$('#end').classList.remove('on');show('select');SND.music('title');};
}
function showUnlock(){
  const u=$('#unlock');
  $('#ulBox').innerHTML=`<div class="ttl">¡NUEVO PERSONAJE DESBLOQUEADO!</div><div class="pic" id="ulPic"><img src="${IMG('felipe')}" alt="Felipe GALzález"></div><div class="nm">Felipe GALzález</div><span class="lgtag">⭐ LEGENDARIO</span><p>Jarrón chino, OTAN, Isidoro… y una chaqueta de pana que lo cambia todo.</p><button class="btn" type="button" id="ulPlay">⭐ Jugar con él</button><button class="btn ghost" type="button" id="ulSkip">Ver el resultado</button>`;
  u.classList.add('on');SND.sfx('legend');
  setTimeout(()=>{$('#ulPic').classList.add('rev');SND.sfx('fanfare');SND.cry('felipe');},900);
  $('#ulPlay').onclick=()=>{u.classList.remove('on');$('#end').classList.remove('on');picked=['felipe'];show('select');renderGrid();SND.music('title');};
  $('#ulSkip').onclick=()=>{u.classList.remove('on');$('#end').classList.add('on');};
}
