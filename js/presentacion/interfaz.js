'use strict';
/* =====================================================================
   INTERFAZ DEL COMBATE: mensajes, bocadillos, barras de vida y botones del jugador.
   ===================================================================== */

function pause(ms){return new Promise(r=>{let done=false;const fin=()=>{if(done)return;done=true;clearTimeout(t);skipFn=null;r();};const t=setTimeout(fin,ms*SPEED);skipFn=fin;});}
function typeOut(text,sub){
  return new Promise(res=>{
    const tEl=$('#msgText'),qEl=$('#msgSub');qEl.hidden=true;qEl.textContent=sub||'';
    $('#msg').classList.remove('ready');
    const step=MODES[MODE].type;
    if(SPEED===0||RM){tEl.textContent=text;if(sub)qEl.hidden=false;res();return;}
    let i=0;tEl.textContent='';
    const fin=()=>{clearInterval(iv);tEl.textContent=text;if(sub)qEl.hidden=false;skipFn=null;res();};
    const iv=setInterval(()=>{i+=1;tEl.textContent=text.slice(0,i);if(i>=text.length)fin();},step);
    skipFn=fin;
  });
}
function waitTap(){$('#msg').classList.add('ready');return new Promise(r=>{skipFn=()=>{skipFn=null;r();};});}
function bubble(s,m,line){
  if(SPEED===0||!line)return null;
  const f=$('#field'),fr=f.getBoundingClientRect(),r=$('#sp'+s).getBoundingClientRect();
  const b=document.createElement('div');b.className='bub b'+s;
  b.innerHTML=`<small style="--nc:${TYPES[m.p.types[0]].c}">${esc(m.name)}</small>${esc(line.replace(/^«|»$/g,''))}`;
  f.appendChild(b);
  const h=b.offsetHeight,fh=f.clientHeight;
  if(s===0){b.style.left=Math.max(6,r.left-fr.left+r.width*.45-24)+'px';b.style.top=Math.max(4,r.top-fr.top+6-h-18)+'px';}
  else{b.style.right=Math.max(6,fr.right-r.right+r.width*.45-24)+'px';b.style.top=Math.min(fh-h-4,r.bottom-fr.top-6+18)+'px';}
  const R=e=>({l:e.offsetLeft,t:e.offsetTop,r:e.offsetLeft+e.offsetWidth,b:e.offsetTop+e.offsetHeight}),nb=R(b);document.querySelectorAll('.bub:not(.out)').forEach(o=>{if(o===b)return;const q=R(o);if(q.l<nb.r&&nb.l<q.r&&q.t<nb.b&&nb.t<q.b)unbubble(o);});
  if(!RM)$('#sp'+s).animate([{transform:'none'},{transform:'translateY(-10px) scale(1.06)',offset:.4},{transform:'none'}],{duration:380});
  SND.sfx('pop');
  return b;
}
function unbubble(b){if(!b||b.classList.contains('out'))return;b.classList.add('out');setTimeout(()=>b.remove(),240);}
function clearBubbles(){document.querySelectorAll('.bub').forEach(unbubble);}
async function say(text,sub,opt){
  if(ABORT)throw ABORTERR;
  renderPlates();
  let bb=null;
  if(opt&&opt.bub){if(!opt.bub.keep)clearBubbles();if(opt.bub.m&&opt.bub.m.vol&&opt.bub.m.vol.drunk&&opt.bub.line&&!/Hic/.test(opt.bub.line))opt.bub.line=slur(opt.bub.line,true)+' ¡Hic!';bb=bubble(opt.bub.s,opt.bub.m,opt.bub.line);if(!bb&&opt.bub.line)sub=opt.bub.line;}
  const msg=$('#msg');msg.classList.toggle('tweet',!!(opt&&opt.tweet));
  if(opt&&opt.tweet)$('#msgAv').src=IMG('rufian');
  msg.classList.toggle('tilt',!!(opt&&opt.tilt));
  await typeOut(text,sub);
  if(ABORT)throw ABORTERR;
  if(MODE==='tap'&&SPEED!==0)await waitTap();
  else{msg.classList.add('ready');await pause(Math.max(1500,(text.length+(sub?sub.length:0)+(bb?opt.bub.line.length+10:0))*55)*MODES[MODE].read);}
  msg.classList.remove('ready','tweet','tilt');
  if(bb&&!opt.bub.keep)unbubble(bb);
  if(ABORT)throw ABORTERR;
}
function setModeLabel(){$('#btnSpeed').textContent=MODES[MODE].lbl;}
function hpCls(m){const f=m.hp/m.max;return f>.5?'':f>.2?' mid':' low';}
function plateHTML(s){
  const m=active(s);const st=m.status?STLBL[m.status]:null;
  const pips=B.teams[s].map(x=>`<span class="pip${x.hp<=0?' dead':''}"></span>`).join('');
  const extra=(m.vol.drunk?`<span class="st" style="background:#f0a530;color:#1c1a24">${DKCHIP[dkPhase(m)]}</span>`:'')+(m.vol.canas?`<span class="st" style="background:#5a3d12">${'🍺'.repeat(m.vol.canas)}</span>`:'')+(m.vol.confuse?'<span class="st" style="background:#8a5bd1">LIADO</span>':'')+(isAway(m)?'<span class="st" style="background:#4a6fd1">DE GIRA</span>':'')+(m.vol.charging?(m.vol.charging==='flotilla'?'<span class="st" style="background:#2a7fc4">⛵ NAVEGANDO</span>':'<span class="st" style="background:#2f8f49">EN TRÁMITE</span>'):'')+(m.vol.cap>0?`<span class="st" style="background:#7dbb62;color:#1c1a24">TOPE ${m.vol.cap}</span>`:'')+(m.vol.parlem?'<span class="st" style="background:#fff;color:#1c1a24">🏳️ PARLEM</span>':'')+(m.vol.isidoro>0?`<span class="st" style="background:#333">🕶️ ISIDORO ${m.vol.isidoro}</span>`:'')+(m.vol.vase>0?'<span class="st" style="background:#3e7fb3">🏺 JARRÓN</span>':'')+(m.vol.otan?'<span class="st" style="background:#e5533d">EN GUARDIA</span>':'');
  return `<div class="top"><span class="nm">${m.p.legend?`<span class="lgt">${m.pana?'FORMA 82':'LEGENDARIO'}</span>`:''}${esc(dispName(m))}</span><span class="lv">Nv${LV}</span></div>
  <div class="mid"><span class="chips">${m.types.map(t=>`<span class="chip" style="--tc:${TYPES[t].c}">${TYPES[t].e}</span>`).join('')}${st?`<span class="st" style="background:${st[1]}">${st[0]}</span>`:''}${extra}</span><span class="pips">${pips}</span></div>
  <div class="hp${hpCls(m)}"><i style="width:${(m.hp/m.max*100).toFixed(1)}%"></i></div>
  ${s===0?`<div class="hpnum">${m.hp}/${m.max}</div>`:`<div class="hpnum">${Math.ceil(m.hp/m.max*100)}%</div>`}`;
}
function renderField(){
  const w=B.field.w;$('#wx').className=w||'';
  const tag=$('#ftag');
  if(w){tag.textContent=w==='rain'?`🌧️ Llueve en Galicia · ${B.field.turns}`:`☀️ Terrazas abiertas · ${B.field.turns}`;tag.classList.add('on');}else tag.classList.remove('on');
  for(const s of [0,1]){
    const sd=B.sides[s],m=active(s);let h='';
    if(sd.obras>0)h+=`<div class="cones">🚧🚧🚧🚧</div>`;
    if(sd.caganer)h+=`<div class="cag" title="Caganer">💩</div>`;
    if(sd.publico>0)h+=[[-14,20],[118,30],[-6,70],[120,80],[50,-6]].map(([x,y],i)=>`<span class="clap" style="left:${x}px;top:${y}px;animation-delay:${-i*.13}s">👏</span>`).join('');
    $('#deco'+s).innerHTML=h;
    const el=$('#sp'+s);
    el.classList.toggle('subbed',m.vol.sub>0&&m.hp>0);
    el.classList.toggle('vased',m.vol.vase>0&&m.hp>0);el.classList.toggle('clan',m.vol.isidoro>0&&m.hp>0);el.classList.toggle('legend',!!m.p.legend&&m.hp>0);el.classList.toggle('f82',!!m.pana);
    if(isAway(m)&&!el.classList.contains('gone')&&!B.animating)el.classList.add('gone');
    if(!isAway(m))el.classList.remove('gone');
  }
  const dz=!!(active(0).vol.confuse&&active(0).hp>0);
  $('#field').classList.toggle('dizzy',dz&&!RM);
}
function renderPlates(){if(!B)return;for(const s of [0,1]){const m=active(s),pl=$('#plate'+s);pl.innerHTML=plateHTML(s);pl.classList.toggle('legend',!!m.p.legend);pl.classList.toggle('f82',!!m.pana);}renderField();drunkVisuals();}
function setSprite(s){const m=active(s),el=$('#sp'+s);try{el.closest('.pod').style.setProperty('--pc',c1(m.p));}catch(_){}el.innerHTML=`<img src="${monImg(m)}" alt="${esc(m.p.name)}"><span class="chalet">🏡</span><span class="vase">🏺</span><span class="shades">🕶️</span>`;el.className='sprite';void el.offsetWidth;el.className=m.p.legend?'sprite prelegend':'sprite in';}
function flash(s){const el=$('#sp'+s);el.classList.remove('hit','in');void el.offsetWidth;el.classList.add('hit');}
function spriteOut(s){const el=$('#sp'+s);el.classList.remove('gone','subbed','vased','clan','legend','f82');el.classList.add('out');}

function waitControls(){$('#controls').className='controls';$('#controls').innerHTML='<p class="wait">Toca el cuadro de texto para avanzar.</p>';}
function getPlayerAction(){
  const m=active(0);
  if(isAway(m))return Promise.resolve({type:'move',away:true});
  if(m.vol.vase>0)return Promise.resolve({type:'move',vase:true});
  if(m.vol.charging)return Promise.resolve({type:'move',forced:true});
  return new Promise(res=>{B.resolve=res;showMoves();});
}
function choose(a){SND.sfx('blip');const r=B.resolve;B.resolve=null;waitControls();if(r)r(a);}
function showMoves(){
  const m=active(0),foe=active(1);
  const dk=!!m.vol.drunk,dz=!!m.vol.confuse||dk;
  $('#msgText').textContent=`¿Qué argumento usa ${dispName(m)}?`;$('#msgSub').hidden=true;$('#msg').classList.remove('ready','tweet','tilt');
  const any=m.moves.some(x=>x.pp>0);
  const perm=dz?shuffle([0,1,2,3]):[0,1,2,3];
  const btns=any?m.moves.map((x,i)=>{const shown=m.moves[perm[i]];const mv=MOVES[shown.id];const e=mv.cat==='X'?1:eff(mv.type,foe.types);const et=mv.cat==='X'?'':effTxt(e);
    const pw=mv.cat==='X'?'Estado':mv.multi?`Pot ${mv.power}×${mv.multi===2?'3-6':'2-5'}`:'Pot '+(mv.eruption?Math.max(1,Math.floor(mv.power*m.hp/m.max)):mv.power);
    return `<button class="move${m.pana?' f82':''}" type="button" data-i="${i}" style="--tc:${TYPES[mv.type].c}" ${x.pp<=0?'disabled':''}>
      ${et?`<span class="ef${e<1?' bad':''}">${et}</span>`:''}<b>${esc(dk?slur(mv.name,true):mv.name)}</b>
      <small>${shown.cut?'✂️ Recortado':`${TYPES[mv.type].e} ${pw} · PP ${shown.pp}/${mv.pp}`}</small></button>`;}).join('')
    :`<button class="move" type="button" data-struggle="1" style="--tc:#c3bcb1;grid-column:1/-1"><b>Pataleta</b><small>Sin PP: patalea y se hace daño</small></button>`;
  const trapped=B.sides[0].obras>0;
  const canSwitch=!trapped&&B.teams[0].some((x,i)=>i!==B.act[0]&&x.hp>0);
  $('#controls').className='controls'+(dk&&!RM?' drunkc p'+dkPhase(m):dz&&!RM?' dizzy':'');
  $('#controls').innerHTML=`${dk?`<div class="dzhint drunkh">${DKCHIP[dkPhase(m)]}: los botones bailan y a saber qué hace.</div>`:dz?'<div class="dzhint">💫 Estás liado: los botones no dicen la verdad.</div>':''}<div class="moves">${btns}</div>
    <div class="cbar"><button class="btn ghost" type="button" id="cSw" ${canSwitch?'':'disabled'}>${trapped?'🚧 Calle cortada':'🔁 Cambiar'}</button><button class="btn ghost" type="button" id="cInfo">ⓘ Ficha</button></div>`;
  $('#controls').querySelectorAll('.move').forEach(b=>b.onclick=()=>{if(b.dataset.struggle)choose({type:'move',struggle:true});else choose({type:'move',idx:+b.dataset.i});});
  $('#cSw').onclick=async()=>{const idx=await askSwitch(false);if(idx===null)showMoves();else choose({type:'switch',idx});};
  $('#cInfo').onclick=()=>openFicha(m.p,m);
}
function askSwitch(forced){
  return new Promise(res=>{
    const list=B.teams[0].map((m,i)=>{const dis=m.hp<=0||i===B.act[0];
      return `<button class="swi" type="button" data-i="${i}" ${dis?'disabled':''}>
        ${avs(m.p)}
        <div class="grow"><b>${esc(m.name)}</b> <span style="font-size:12px;color:#6c6577">${m.fled?'🚗 Huido a Waterloo':`${m.hp}/${m.max} PS`}${i===B.act[0]&&m.hp>0?' · en combate':''}${m.status?' · '+STLBL[m.status][0].toLowerCase():''}</span>
        <div class="hp${hpCls(m)}"><i style="width:${(m.hp/m.max*100).toFixed(1)}%"></i></div></div></button>`;}).join('');
    $('#controls').className='controls';
    $('#controls').innerHTML=`<div class="swl"><h3>${forced?'¿A quién sacas ahora?':'¿A quién sacas?'}</h3>${B.sides[0].caganer?'<div class="dzhint">💩 Ojo: hay un caganer. Quien entre perderá algo de vida.</div>':''}${list}${forced?'':'<button class="btn ghost" type="button" id="swBack">Volver</button>'}</div>`;
    if(forced){$('#msgText').textContent='Elige a quién sacas al debate.';$('#msgSub').hidden=true;$('#msg').classList.remove('ready','tweet');}
    $('#controls').querySelectorAll('.swi').forEach(b=>b.onclick=()=>{waitControls();res(+b.dataset.i);});
    if(!forced)$('#swBack').onclick=()=>res(null);
  });
}

