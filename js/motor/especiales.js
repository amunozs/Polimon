'use strict';
/* =====================================================================
   MECÁNICAS ESPECIALES: borrachera de Isabel, Manual de Resistencia de Sanxe,
   Chaqueta de pana de Felipe (montaje de 1982 y plató del PSOE) y Culpar a los menas.
   ===================================================================== */

const LEFTY=['huelga','asaltar','desahucios','casta','lucha'];
const DKPH=['','achispada','borracha','como una cuba'];
const DKCHIP=['','🍺 ACHISPADA','🍺🍺 BORRACHA','🍺🍺🍺 COMO UNA CUBA'];
const DKCHAOS=[0,.4,.6,.8];
const dkPhase=m=>m.vol&&m.vol.drunk?4-m.vol.drunk:0;
function dkLine(m){const n=m.name,p=dkPhase(m);return p===1?`¡${n} está achispada y se le va la mano!`:p===2?`¡${n} está tan borracha que se ha liado!`:`¡${n} va como una cuba y no sabe ni dónde está!`;}
function dkGood(m){const n=m.name,p=dkPhase(m);return p===1?`${n} lo clava… de milagro.`:p===2?`${n} acierta… más o menos.`:`¡Increíble! ${n} acierta a la primera, y sin soltar la caña.`;}
async function dkBanner(s,big,small){SND.sfx('hic');await fxRun(c=>run(mk(`<div class="drunkbn"><small>${small}</small>${big}</div>`,16),[{transform:T(P($('#field').clientWidth/2,$('#field').clientHeight*.42),2.4,-14),opacity:0},{transform:T(P($('#field').clientWidth/2,$('#field').clientHeight*.42),1,-5),opacity:1,offset:.18},{transform:T(P($('#field').clientWidth/2,$('#field').clientHeight*.42),1.05,4),opacity:1,offset:.5},{transform:T(P($('#field').clientWidth/2,$('#field').clientHeight*.42),1,-4),opacity:1,offset:.85},{transform:T(P($('#field').clientWidth/2,$('#field').clientHeight*.42),1,-4),opacity:0}],1300,{ease:'ease-out'}),s);}
function slur(t,rand){const V='aeiouáéíóú';let a=t.split('');let last=-1;for(let i=a.length-1;i>=0;i--)if(V.includes(a[i].toLowerCase())){last=i;break;}
  if(last>=0)a[last]=a[last]+a[last]+a[last];
  if(rand){const idx=a.map((ch,i)=>V.includes(ch.toLowerCase())&&i!==last?i:-1).filter(i=>i>=0);if(idx.length){const k=idx[rnd(idx.length)];a[k]=a[k]+a[k];}}
  return a.join('');}
function dispName(m){return m.vol&&m.vol.drunk?slur(m.name):m.name;}
function drunkVisuals(){
  if(!B||!B.teams)return;let any=false,maxp=0;
  for(const s of [0,1]){const m=active(s),el=$('#sp'+s);if(!el)continue;const dr=!!(m&&m.vol&&m.vol.drunk&&m.hp>0);any=any||dr;
    el.classList.toggle('drunk',dr);const ph=dr?dkPhase(m):0;['p1','p2','p3'].forEach((c,i)=>el.classList.toggle(c,ph===i+1));if(ph>maxp)maxp=ph;
    if(dr&&!el.querySelector('.ghost')){const im=el.querySelector('img');if(im){const g=im.cloneNode();g.className='ghost';g.alt='';el.appendChild(g);}const b1=document.createElement('span');b1.className='bubs';b1.textContent='🫧';const b2=document.createElement('span');b2.className='bubs b2';b2.textContent='🫧';el.append(b1,b2);}
    if(!dr)el.querySelectorAll('.ghost,.bubs').forEach(e=>e.remove());}
  stageTheme();const fe=$('#field');fe.classList.toggle('drunkf',any&&!RM&&SPEED!==0);['dk1','dk2','dk3'].forEach((c,i)=>fe.classList.toggle(c,any&&maxp===i+1));
}
async function hiccup(s){SND.sfx('hic');await fxRun(c=>all(word('¡HIC!',up(c.a,70),{color:'#ffd36b',size:20,d:650,rot:-8}),sprA(c.s,[{transform:'none'},{transform:'translateY(-14px) rotate(-6deg)',offset:.3},{transform:'none'}],400)),s);}
async function addCana(m,s){
  if(m.hp<=0||m.vol.drunk||m.status==='slp')return;
  m.vol.canas=(m.vol.canas||0)+1;SND.sfx('glug');
  await fxRun(c=>all(pop('🍺',up(c.a,64),{size:34,d:700}),word(`${m.vol.canas}ª CAÑA`,up(c.a,100),{color:'#ffd36b',size:16,d:800})),s);
  renderPlates();
  if(m.vol.canas>=3){delete m.vol.canas;await getDrunk(m,s);}
  else await say(`${label(m)} se toma otra caña.`,`🍺 Lleva ${m.vol.canas}. A la tercera, se viene arriba.`);
}
async function getDrunk(m,s){
  m.vol.drunk=3;delete m.vol.confuse;delete m.vol.canas;
  SND.sfx('organillo');setTimeout(()=>{SND.sfx('applause');},500);
  await fxRun(async c=>{
    flashScr('#ffd36b',300);shake(500,6);
    await all(rain(['🍺','🍻','🍺','🎉'],c.a,{n:14,size:28,spread:200,h:220,stagger:50,d:900}),
      word('¡SALUD!',up(c.a,80),{color:'#ffd36b',size:30,d:1200,rot:-6}),
      sprA(c.s,[{transform:'none'},{transform:'rotate(-12deg) translateX(-8px)'},{transform:'rotate(10deg) translateX(8px)'},{transform:'rotate(-8deg)'},{transform:'none'}],1100));
  },s);
  renderPlates();
  await say(`¡${m.name} se ha venido arriba con las cañas!`,'🍺 Fase 1: achispada. A partir de ahora, a saber qué hace.');
}
async function drunkAct(s,a){
  const u=active(s),t=active(1-s);
  await hiccup(s);
  if(Math.random()>=DKCHAOS[dkPhase(u)]){await say(dkGood(u));return false;}
  const ph=dkPhase(u);
  await dkBanner(s,'¡LA HA LIADO!',DKCHIP[ph]);
  const r=Math.random();
  if(r<.5){
    const id=LEFTY[rnd(LEFTY.length)];
    await say(dkLine(u),`…y se le escapa ${MOVES[id].name}.`,{tilt:true});
    await execMove(s,id,false);
    if(u.hp>0&&!B.over)await say(`💬 ${label(u)}`,null,{bub:{s,m:u,line:'¿He dicho yo eso? ¡Hic!'}});
    return true;
  }
  if(r<.67){
    await say(dkLine(u),'…y le paga una ronda al rival.',{tilt:true});
    await fxRun(c=>all(...[0,1,2].map(i=>fly('🍺',c.a,c.b,{d:600,size:26,arc:(i-1)*30,delay:i*120}))),s);
    await say(`💬 ${label(u)}`,null,{bub:{s,m:u,line:'¡Esta ronda la pago yo! ¡Hic!'}});
    if(t.hp>0&&!isAway(t)&&t.hp<t.max){heal(t,Math.floor(t.max*.15));SND.sfx('heal');renderPlates();await say(`${label(t)} se toma la caña a su salud y recupera vida.`);}
    else await say(`${label(t)} no quiere la caña, pero gracias.`);
    return true;
  }
  if(r<.84){
    await say(dkLine(u),'…y se arranca con un chotis.',{tilt:true});
    SND.sfx('organillo');
    await fxRun(c=>all(orbit('🎵',up(c.a,50),{r:34,d:1300,turns:2}),orbit('🎶',up(c.a,50),{r:34,d:1300,turns:2,phase:Math.PI}),sprA(c.s,[{transform:'none'},{transform:'rotate(-10deg) translateX(-10px)'},{transform:'rotate(10deg) translateX(10px)'},{transform:'rotate(-10deg) translateX(-10px)'},{transform:'none'}],1300)),s);
    await say(`${label(u)} canta a pleno pulmón y se olvida del debate.`,'Pierde el turno.');
    return true;
  }
  await say(dkLine(u),'…y se cae de la silla de la terraza.',{tilt:true});
  await fxRun(c=>all(pop('🪑',P(c.a.x+30,c.a.y+20),{size:40,d:900}),sprA(c.s,[{transform:'none'},{transform:'rotate(75deg) translateY(20px)',offset:.35},{transform:'rotate(75deg) translateY(20px)',offset:.7},{transform:'none'}],1000),(async()=>{await sleep(330);SND.sfx('thud');shake(300,8);})()),s);
  hurt(u,Math.max(1,Math.floor(u.max/8)));flash(s);renderPlates();
  await say(`¡${label(u)} se hace daño!`,'Pierde vida por la caída.');
  return true;
}
async function resistCheck(){
  if(!B||!B.teams)return;
  for(const s of [0,1])for(const m of B.teams[s]){
    if(!m.resistPending)continue;delete m.resistPending;renderPlates();
    if(m===active(s))await resistFX(s);
    await say(`¡${m.name} todavía resiste!`);
  }
}
async function resistFX(s){
  const el=$('#sp'+s),row=el.closest('.row');row.style.zIndex='7';
  await fxRun(async c=>{
    const f=$('#field'),W=f.clientWidth,H=f.clientHeight;
    // 1) se desploma
    const fall=el.animate([{transform:'none',filter:'none'},{transform:'translateY(18px) rotate(-78deg) scale(.92)',filter:'grayscale(1) brightness(.7)'}],{duration:650*FXS(),easing:'ease-in',fill:'forwards'});
    const bk=document.createElement('div');bk.className='fxflash';bk.style.background='#000';bk.style.opacity='0';$('#fx').appendChild(bk);
    SND.music(null);SND.sfx('flatline');
    await bk.animate([{opacity:0},{opacity:.82}],{duration:500*FXS(),fill:'forwards'}).finished.catch(()=>{});
    // 2) electrocardiograma: plano... y latido
    const y=c.a.y-10,sx=W*.04,ex=W*.96,kx=c.a.x;
    const pts=[[sx,y],[kx-30,y],[kx-20,y-8],[kx-12,y+6],[kx-4,y-62],[kx+6,y+38],[kx+14,y-14],[kx+22,y],[ex,y]].map(p=>p.map(v=>v.toFixed(1)).join(',')).join(' ');
    const e=document.createElement('div');e.className='fxi';
    e.innerHTML=`<svg width="${W}" height="${H}" style="width:${W}px;height:${H}px;overflow:visible"><polyline pathLength="100" points="${pts}" fill="none" stroke="#3dff7a" stroke-width="4" stroke-linejoin="round" stroke-dasharray="100" stroke-dashoffset="100" style="filter:drop-shadow(0 0 6px #3dff7a)"/></svg>`;
    $('#fx').appendChild(e);const pl=e.querySelector('polyline');
    await pl.animate([{strokeDashoffset:100},{strokeDashoffset:52}],{duration:1100*FXS(),easing:'linear',fill:'forwards'}).finished.catch(()=>{});
    await sleep(250);
    SND.sfx('beat');
    pl.animate([{strokeDashoffset:52},{strokeDashoffset:0}],{duration:500*FXS(),easing:'ease-out',fill:'forwards'});
    await sleep(180);
    // 3) ¡se levanta!
    fall.cancel();
    SND.sfx('fanfare');SND.sfx('thud');
    const card=document.createElement('div');card.className='rescard';card.textContent=`¡${active(s).name} todavía resiste!`;card.style.opacity='0';$('#fx').appendChild(card);
    await all(
      bk.animate([{opacity:.82},{opacity:0}],{duration:450*FXS(),fill:'forwards'}).finished.catch(()=>{}),
      sprA(s,[{transform:'translateY(18px) rotate(-78deg) scale(.92)'},{transform:'translateY(-34px) rotate(8deg) scale(1.3)',offset:.45},{transform:'translateY(0) rotate(-4deg) scale(.95)',offset:.75},{transform:'none'}],650,{ease:'ease-out'}),
      flashScr('#ff3b3b',380),shake(520,10),ring(c.a,{color:'#ff3b3b',size:50,d:700}),ring(c.a,{color:'#ffffff',size:40,d:700,delay:150}),
      burst(['🌹','✊','💪','🌹'],c.a,{n:10,r:80,size:26,d:900}),
      run(card,[{opacity:0,transform:'translate(-50%,-50%) scale(3) rotate(-8deg)'},{opacity:1,transform:'translate(-50%,-50%) scale(1) rotate(-4deg)',offset:.12},{opacity:1,transform:'translate(-50%,-50%) scale(1.06) rotate(-4deg)',offset:.5},{opacity:1,transform:'translate(-50%,-50%) scale(1) rotate(-4deg)',offset:.88},{opacity:0,transform:'translate(-50%,-50%) scale(1) rotate(-4deg)'}],2100,{ease:'ease-out'}),
      (async()=>{await sleep(300);await glow(s,'#ff3b3b',1500);})()
    );
  },s);
  row.style.zIndex='';updateMusic();
}
const RETRO=[['puno',380/253],['cartel',277/380],['pana',331/520],['libreria',284/520],['congreso2',275/359],['micro',286/380],['porelcambio',480/269],['congreso',380/252],['gafas',520/329],['sonrisa',1],['jura',520/317],['balcon',520/292]];
let RETROPRE=null;
function preloadRetro(){if(RETROPRE)return;RETROPRE=[...RETRO.map(r=>r[0]),'portada','psoe'].map(k=>{const i=new Image();i.src=`img/retro/${k}.webp`;return i;});}
async function retroMontage(){
  const st=$('#stage');if(!st)return;
  const box=document.createElement('div');box.className='retro';st.appendChild(box);
  clearBubbles();const hid=[$('#plate0'),$('#plate1'),$('#sp1').closest('.pod')].filter(Boolean);hid.forEach(e=>{e.style.transition='opacity .4s';e.style.opacity='.06';});box._hid=hid;
  let k=0,prev=null,dur=1150;SND.sfx('roll');
  const SW=st.clientWidth,SH=st.clientHeight;
  for(const [id,ar] of RETRO){
    const d=document.createElement('div');d.className='ph';d.innerHTML=`<img src="img/retro/${id}.webp" alt="">`;
    const aw=SW*.9,ah=SH*.74;let w=aw,h=w/ar;if(h>ah){h=ah;w=h*ar;}
    d.style.cssText=`left:${(SW-w)/2}px;top:${SH*.05+(ah-h)/2}px;width:${w}px;height:${h}px;right:auto`;box.appendChild(d);
    const rot=k%2?1.5:-1.5;k++;
    SND.sfx('camera');flashScr('#ffffff',260);
    if(prev){const pv=prev;pv.style.opacity='0';setTimeout(()=>pv.remove(),50);}
    d.style.opacity='1';
    d.animate([{transform:`rotate(${rot}deg) scale(1.04)`,filter:'brightness(2.2)'},{transform:`rotate(${rot}deg) scale(1)`,filter:'brightness(1)',offset:.18},{transform:`rotate(${rot}deg) scale(1.06)`,filter:'brightness(1)'}],{duration:(dur+80)*FXS(),easing:'ease-out',fill:'forwards'});
    prev=d;await sleep(dur);dur=Math.max(170,dur*.78);
  }
  if(prev){SND.sfx('camera');flashScr('#ffffff',260);prev.style.opacity='0';}
  await sleep(450);
  const np=document.createElement('div');np.className='ph np';np.innerHTML='<img src="img/retro/portada.webp" alt="">';box.appendChild(np);
  await np.animate([{opacity:0,transform:'translateX(-50%) rotate(-540deg) scale(.1)'},{opacity:1,transform:'translateX(-50%) rotate(-3deg) scale(1.06)',offset:.8},{opacity:1,transform:'translateX(-50%) rotate(-3deg) scale(1)'}],{duration:750*FXS(),easing:'ease-out',fill:'forwards'}).finished.catch(()=>{});
  SND.sfx('thud');SND.sfx('crit');shake(450,9);setTimeout(()=>SND.sfx('applause'),150);
  await sleep(1500);
  box.animate([{opacity:1},{opacity:0}],{duration:400*FXS(),fill:'forwards'});
  return box;
}
function stageTheme(){if(!B||!B.teams)return;const on=[0,1].some(s=>{const m=active(s);return m&&m.pana&&m.hp>0;});const st=$('#stage');if(st)st.classList.toggle('psoe',on);}
async function transformPana(s){
  const u=active(s);
  SND.music(null);SND.sfx('tvon');
  await fxRun(async c=>{
    const f=$('#field');
    const bk=document.createElement('div');bk.className='fxflash';bk.style.background='#000';bk.style.opacity='0';$('#fx').appendChild(bk);
    await run(bk,[{opacity:0},{opacity:1}],400,{ease:'linear'});bk.style.opacity='1';
    await sleep(500);
    f.style.filter='grayscale(1) contrast(1.35) sepia(.25)';
    const sc=document.createElement('div');sc.className='scan';$('#fx').appendChild(sc);
    const sb=document.createElement('div');sb.className='sidebars';sb.style.cssText='position:absolute;inset:0';$('#fx').appendChild(sb);
    const cap=document.createElement('div');cap.className='cap82';cap.textContent='';$('#fx').appendChild(cap);
    SND.sfx('static');
    await run(bk,[{opacity:1},{opacity:0}],500,{ease:'linear'});bk.style.opacity='0';
    const txt='28 de octubre de 1982';for(let i=1;i<=txt.length;i++){cap.textContent=txt.slice(0,i);await sleep(40);}
    const rbox=await retroMontage();
    await sleep(200);
    SND.sfx('whoosh');
    await all(sprA(c.s,[{transform:'none'},{transform:'rotate(360deg) scale(1.2)'},{transform:'rotate(720deg) scale(1.3)'},{transform:'rotate(1080deg) scale(1)'}],1100,{ease:'ease-in'}),glow(c.s,'#ffffff',1100),burst(['👔','💼','🚬'],c.a,{n:9,size:30,r:90,d:900,delay:500}));
    u.pana=true;const img=$('#sp'+s+' img');if(img)img.src=IMG('felipe82');stageTheme();
    f.style.filter='';sc.remove();sb.remove();cap.remove();if(rbox){(rbox._hid||[]).forEach(e=>{e.style.opacity='';setTimeout(()=>e.style.transition='',450);});rbox.remove();}
    SND.sfx('crit');SND.sfx('applause');SND.sfx('chant');
    await all(flashScr('#ffffff',500),rain('🌹',P(f.clientWidth/2,f.clientHeight/2),{n:22,size:28,spread:f.clientWidth,h:f.clientHeight/2+40,stagger:45,d:1000}),
      ...[0,1,2,3].map(i=>word('¡Felipe!',P(40+Math.random()*(f.clientWidth-80),40+Math.random()*(f.clientHeight-80)),{color:'#e5533d',size:22,d:700,delay:i*260,rot:(Math.random()-.5)*20})));
    SND.sfx('fanfare');
    await all(letterbox(1500),word('¡VUELVE EL FELIPE DEL 82!',P(f.clientWidth/2,f.clientHeight/2),{color:'#ff5a3d',size:24,d:1500,rot:-3}),glow(c.s,'#ff4a3d',1500));
  },s);
  $('#field').style.filter='';
  u.pana=true;u.hp=u.max;u.status=null;delete u.vol.confuse;
  u.moves=F82.map(id=>({id,pp:MOVES[id].pp}));
  const img=$('#sp'+s+' img');if(img)img.src=IMG('felipe82');
  renderPlates();updateMusic();
  await say(`¡${label(u)} vuelve a ser el Felipe del 82!`,'Se cura entero, pega un 50% más y cambia todos sus ataques.');
  SND.sfx('thud');
  await fxRun(async c=>{await all(ring(c.a,{color:'#ff4a3d',size:60,d:800}),ring(c.a,{color:'#ffffff',size:60,d:800,delay:150}),ring(c.a,{color:'#ff4a3d',size:60,d:800,delay:300}),shake(700,12));},s);
}

/* ---------- Maletero de Puchi ---------- */
// Rótulo de habilidad: entra desde el lado del personaje (sirve para cualquier habilidad)
async function abilityBanner(s,name,sub){
  SND.sfx('chime');
  await fxRun(c=>{const W=$('#field').clientWidth;const at=P(W/2,c.a.y-70<40?60:c.a.y-70);
    return run(mk(`<div class="drunkbn" style="background:linear-gradient(#fff6c8,#ffd36b)"><small>⭐ HABILIDAD</small>${esc(name)}<small style="margin-top:3px;letter-spacing:0;font-size:11px">${esc(sub)}</small></div>`,16),
      [{transform:T(P(c.s===0?-200:W+200,at.y),1,0),opacity:1},{transform:T(at,1,-3),opacity:1,offset:.18},{transform:T(at,1,-3),opacity:1,offset:.85},{transform:T(at,1,-3),opacity:0}],1700,{ease:'ease-out'});},s);
}
async function fxTrunk(c,escape){
  const f=$('#field'),W=f.clientWidth,dir=c.s===0?1:-1,y=c.a.y+22;
  const from=P(c.s===0?-70:W+70,y),at=P(c.a.x+dir*58,y);
  SND.sfx('screech');SND.sfx('engine');
  const car=mk(`<div style="position:relative;display:inline-block"><span style="display:inline-block;font-size:76px;transform:scaleX(${dir>0?-1:1})">🚗</span><div class="trunk" style="position:absolute;${dir>0?'left':'right'}:2px;top:22px;width:30px;height:16px;background:#7a0d12;border:3px solid #1c1a24;border-radius:3px;transform-origin:${dir>0?'left':'right'} bottom;transform:rotate(0deg)"></div></div>`,16);
  car.style.opacity='1';const lid=car.querySelector('.trunk');
  await all(car.animate([{transform:T(from,1,0)},{transform:T(P(at.x+dir*14,y),1,dir*-6),offset:.8},{transform:T(at,1,0)}],{duration:700*FXS(),easing:'ease-out',fill:'forwards'}).finished.catch(()=>{}),
    word('¡ÑIIIIC!',P(at.x,y-56),{color:'#fff',size:20,d:700,delay:350}),rain('💨',P(at.x-dir*40,y+10),{n:4,size:18,spread:40,h:4,stagger:40,d:500,delay:300}));
  lid.animate([{transform:'rotate(0deg)'},{transform:`rotate(${dir>0?-110:110}deg)`}],{duration:220*FXS(),fill:'forwards'});SND.sfx('door');
  await sleep(250);
  if(escape){
    await all(sprA(c.s,[{transform:'none'},{transform:'translateY(-44px) scale(.85) rotate(-10deg)',offset:.45},{transform:`translate(${dir*58}px,12px) scale(.12)`,opacity:0}],600),word('¡HOP!',up(c.a,80),{color:'#ffd36b',size:22,d:700}));
    $('#sp'+c.s).style.opacity='0';
    lid.animate([{transform:`rotate(${dir>0?-110:110}deg)`},{transform:'rotate(0deg)'}],{duration:150*FXS(),fill:'forwards'});SND.sfx('thud');
    word('¡PLAM!',P(at.x,y-50),{color:'#ff7a7a',size:20,d:600});await sleep(350);
    // señal de Waterloo
    const sx=c.s===0?W-70:70,sign=mk('<div style="background:#1a4fb3;color:#fff;border:3px solid #fff;outline:2px solid #1a4fb3;border-radius:6px;padding:5px 9px;font:800 13px/1 system-ui;white-space:nowrap">WATERLOO '+(dir>0?'→':'←')+'</div>',13);
    const sy=c.s===1?c.a.y+78:c.a.y-120;sign.animate([{transform:T(P(sx,sy),.2,0),opacity:0},{transform:T(P(sx,sy),1,0),opacity:1}],{duration:250*FXS(),fill:'forwards'});
    SND.sfx('engine');
    await all(car.animate([{transform:T(at,1,0)},{transform:T(P(c.s===0?W+90:-90,y),1,0)}],{duration:800*FXS(),easing:'ease-in',fill:'forwards'}).finished.catch(()=>{}),
      rain('💨',P(at.x,y+8),{n:6,size:22,spread:90,h:6,stagger:50,d:600}),word('BRRRUM',P(W/2,y-30),{size:22,d:800,delay:150}));
    await sleep(500);
  }else{
    // Último del equipo: la policía le corta el paso
    SND.sfx('siren');
    const fl=document.createElement('div');fl.className='fxflash';fl.style.opacity='0';$('#fx').appendChild(fl);
    fl.animate([{opacity:0,background:'#e5333d'},{opacity:.28,background:'#e5333d',offset:.25},{opacity:.28,background:'#2f6bff',offset:.5},{opacity:.28,background:'#e5333d',offset:.75},{opacity:0,background:'#2f6bff'}],{duration:1400*FXS(),iterations:1});
    const pol=mk(`<span style="display:inline-block;font-size:70px;transform:scaleX(${dir>0?1:-1})">🚓</span>`,16);pol.style.opacity='1';
    const pfrom=P(c.s===0?W+80:-80,y),pat=P(at.x+dir*96,y);
    await all(pol.animate([{transform:T(pfrom,1,0)},{transform:T(pat,1,0)}],{duration:600*FXS(),easing:'ease-out',fill:'forwards'}).finished.catch(()=>{}),
      word('¡ALTO, POLICÍA!',P(W/2,y-70),{color:'#fff',size:24,d:1500,delay:250}));
    lid.animate([{transform:`rotate(${dir>0?-110:110}deg)`},{transform:'rotate(0deg)'}],{duration:150*FXS(),fill:'forwards'});SND.sfx('thud');
    await all(pop('🚫',up(at,44),{size:40,d:900}),sprA(c.s,[{transform:'none'},{transform:'translateY(-8px) rotate(-6deg)'},{transform:'rotate(6deg)'},{transform:'none'}],600),word('¡NO TE VAS!',up(c.a,80),{color:'#ff7a7a',size:20,d:900}));
    await all(car.animate([{transform:T(at,1,0)},{transform:T(P(c.s===0?-90:W+90,y),1,0)}],{duration:600*FXS(),easing:'ease-in',fill:'forwards'}).finished.catch(()=>{}),
      pol.animate([{transform:T(pat,1,0)},{transform:T(pat,1,0)}],{duration:600*FXS(),fill:'forwards'}).finished.catch(()=>{}));
  }
}
async function koWarning(s){
  SND.sfx('beat');
  await fxRun(async c=>{
    const pl=$('#plate'+s);if(pl)pl.animate([{boxShadow:'0 0 0 0 #e5333d00'},{boxShadow:'0 0 0 5px #e5333d'},{boxShadow:'0 0 0 0 #e5333d00'},{boxShadow:'0 0 0 5px #e5333d'},{boxShadow:'0 0 0 0 #e5333d00'}],{duration:1100*FXS()});
    await all(pop('☠️',up(c.a,58),{size:44,d:1200}),word('¡ESTE GOLPE LE DEJA KO!',P($('#field').clientWidth/2,c.s===1?c.a.y+70:c.a.y-110),{color:'#ff5a5a',size:19,d:1300}),
      sprA(c.s,[{transform:'none'},{transform:'translateX(-5px)'},{transform:'translateX(5px)'},{transform:'translateX(-5px)'},{transform:'none'}],500));
  },s);
}
async function trunkEscape(s){
  const m=active(s);
  await koWarning(s);
  await say(`¡Ese golpe deja KO a ${m.name}!`,'…pero tiene un plan.');
  await abilityBanner(s,'MALETERO',`${m.name} no piensa dar la cara`);
  await fxRun(c=>fxTrunk(c,true),s);
  spriteOut(s);$('#sp'+s).style.opacity='';
  m.hp=0;m.fled=true;m.status=null;renderPlates();
  await say(`¡${m.name} huye en un maletero rumbo a Waterloo!`,'🚗 Se salva del golpe… pero ya no vuelve a este debate. Y deja a otro dando la cara.');
  const idx=s===0?await askSwitch(true):aiReplace();
  await doSwitch(s,idx,true);
  const n=active(s);
  await fxRun(c=>all(word('¡TE TOCA!',up(c.a,80),{color:'#ff7a7a',size:22,d:900}),sprA(c.s,[{transform:'none'},{transform:'translateY(-8px) rotate(-6deg)'},{transform:'rotate(6deg)'},{transform:'none'}],600)),s);
  await say(`¡${n.name} da la cara por ${m.name}… y se come el golpe!`);
}


/* =====================================================================
   GESTIÓN de Núñez Fariña: se elige una carpeta y, sea cual sea, es un recorte.
   ===================================================================== */
const GESTION=[
  {id:'sanidad',  n:'Sanidad',   ico:'🏥'},
  {id:'educacion',n:'Educación', ico:'🎓'},
  {id:'pensiones',n:'Pensiones', ico:'🐷'}
];
// Cómo elige la máquina (y las pruebas automáticas)
function gestionIA(s){
  const foe=active(1-s);
  if(s===1&&CONFIG.rival!=='listo')return rnd(3);
  if(foe.hp<=Math.floor(foe.max/4))return 0;
  if(foe.st.atk>=foe.st.spa&&foe.stages.atk>-4)return 2;
  if(foe.stages.spa>-4)return 1;
  return 0;
}
// El jugador elige carpeta en los botones de abajo
function elegirGestion(s){
  if(s!==0||SPEED===0)return Promise.resolve(gestionIA(s));
  return new Promise(res=>{
    $('#msgText').textContent=`¿Qué gestiona ${active(0).name}?`;$('#msgSub').hidden=true;$('#msg').classList.remove('ready','tweet','tilt');
    $('#controls').className='controls';
    $('#controls').innerHTML=`<div class="gbtns">${GESTION.map((g,i)=>`<button class="gbtn" type="button" data-i="${i}"><span class="gtab"></span><span class="glbl">GESTIÓN</span><span class="gi">${g.ico}</span><small>${g.n}</small></button>`).join('')}</div>`;
    $('#controls').querySelectorAll('.gbtn').forEach(b=>b.onclick=()=>{SND.sfx('blip');waitControls();$('#msgText').textContent=`${active(0).name} firma el plan de ${GESTION[+b.dataset.i].n}.`;res(+b.dataset.i);});
  });
}
async function gestion(s){
  const u=active(s),t=active(1-s);
  const i=await elegirGestion(s);const g=GESTION[i];
  const d=i===0?Math.min(t.hp,Math.max(1,Math.floor(t.max/4))):0;
  await fxRun(c=>fxGestion(c,i),s,{frac:d/t.max});
  if(i===0){
    hurt(t,d);if(t.hp<=0)B.lastKO={by:u,victim:t,move:'Gestión'};flash(1-s);renderPlates();
    await say(`Recorte en ${g.n}.`,`${label(t)} pierde ${d} PS.`);
    await resistCheck();
  }else{
    await say(`Recorte en ${g.n}.`,i===2?'Se vacía la hucha de las pensiones.':null);
    await boost(t,i===1?{spa:-2}:{atk:-2},u);
  }
}
