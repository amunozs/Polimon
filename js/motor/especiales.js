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
async function fxTrunk(c,escape){
  const W=$('#field').clientWidth,dir=c.s===0?1:-1,y=c.a.y+18;
  SND.sfx('engine');
  const car=mk('<span style="display:inline-block;transform:scaleX('+(dir>0?-1:1)+')">🚗</span>',64);
  const from=P(c.s===0?-60:W+60,y),at=P(c.a.x+dir*44,y);
  await car.animate([{transform:T(from,1,0),opacity:1},{transform:T(at,1,0),opacity:1}],{duration:650*FXS(),easing:'ease-out',fill:'forwards'}).finished.catch(()=>{});
  SND.sfx('door');
  if(escape){
    await all(sprA(c.s,[{transform:'none'},{transform:'translateY(-30px) scale(.8)',offset:.4},{transform:`translate(${dir*44}px,16px) scale(.15)`,opacity:0}],520),word('¡AL MALETERO!',up(c.a,70),{color:'#ffd36b',size:20,d:800}));
    $('#sp'+c.s).style.opacity='0';
    SND.sfx('engine');
    await all(car.animate([{transform:T(at,1,0)},{transform:T(P(c.s===0?W+80:-80,y),1,0)}],{duration:700*FXS(),easing:'ease-in',fill:'forwards'}).finished.catch(()=>{}),rain('💨',P(at.x,y),{n:6,size:22,spread:80,h:6,stagger:50,d:600}),word('BRRRUM',P(W/2,y-40),{size:22,d:700,delay:150}));
  }else{
    await all(pop('🗳️',up(at,40),{size:34,d:900}),word('LLENO DE URNAS',up(at,80),{color:'#ff7a7a',size:16,d:1000}));
    await car.animate([{transform:T(at,1,0)},{transform:T(P(c.s===0?W+80:-80,y),1,0)}],{duration:600*FXS(),easing:'ease-in',fill:'forwards'}).finished.catch(()=>{});
  }
}
async function trunkEscape(s){
  const m=active(s);
  await fxRun(c=>fxTrunk(c,true),s);
  spriteOut(s);$('#sp'+s).style.opacity='';
  await say(`¡${m.name} se escapa en un maletero!`,'🚗 El golpe da en el hueco vacío.');
  const idx=s===0?await askSwitch(true):aiReplace();
  await doSwitch(s,idx,true);
}
