'use strict';
/* =====================================================================
   ANIMACIONES: piezas básicas (fly, burst, word…), reacciones generales y FX de cada ataque.
   ===================================================================== */

const RM=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
const FXS=()=>MODE==='fast'?.7:1;
const sleep=ms=>new Promise(r=>setTimeout(r,ms*FXS()));
function ctr(s){const f=$('#field').getBoundingClientRect(),r=$('#sp'+s).getBoundingClientRect();return{x:r.left-f.left+r.width/2,y:r.top-f.top+r.height/2,w:r.width};}
const P=(x,y)=>({x,y});
const up=(p,d)=>P(p.x,p.y-d);
const T=(p,s=1,r=0)=>`translate(${p.x}px,${p.y}px) translate(-50%,-50%) scale(${s}) rotate(${r}deg)`;
function mk(html,size=30){const e=document.createElement('div');e.className='fxi';e.style.fontSize=size+'px';e.style.opacity='0';e.innerHTML=html;$('#fx').appendChild(e);return e;}
async function run(e,kf,d,o={}){try{await e.animate(kf,{duration:d*FXS(),easing:o.ease||'ease-out',delay:(o.delay||0)*FXS(),fill:'forwards'}).finished;}catch(_){}e.remove();}
function fly(gl,a,b,{d=550,size=30,arc=0,spin=0,delay=0,s0=1,s1=1,ease='ease-in'}={}){const e=mk(gl,size);const m=P((a.x+b.x)/2,(a.y+b.y)/2-arc);return run(e,[{transform:T(a,s0,0),opacity:1},{transform:T(m,(s0+s1)/2,spin/2),opacity:1,offset:.5},{transform:T(b,s1,spin),opacity:1}],d,{delay,ease});}
function burst(gl,at,{n=7,r=55,d=650,size=24,delay=0}={}){const ps=[];for(let i=0;i<n;i++){const an=i/n*Math.PI*2+Math.random()*.5;const to=P(at.x+Math.cos(an)*r,at.y+Math.sin(an)*r*.8);const gg=Array.isArray(gl)?gl[i%gl.length]:gl;ps.push(run(mk(gg,size),[{transform:T(at,.4),opacity:1},{transform:T(to,1.1,an*57),opacity:.9,offset:.7},{transform:T(to,1,an*57),opacity:0}],d,{delay}));}return Promise.all(ps);}
function rain(gl,at,{n=7,spread=80,d=650,size=26,delay=0,h=150,stagger=80}={}){const ps=[];for(let i=0;i<n;i++){const x=at.x+(Math.random()-.5)*spread;const gg=Array.isArray(gl)?gl[i%gl.length]:gl;ps.push(run(mk(gg,size),[{transform:T(P(x,at.y-h),1,-20),opacity:1},{transform:T(P(x,at.y+(Math.random()-.3)*30),1,20),opacity:1,offset:.8},{transform:T(P(x,at.y+20),1,20),opacity:0}],d,{delay:delay+i*stagger,ease:'ease-in'}));}return Promise.all(ps);}
function rise(gl,at,{n=6,spread=70,d=950,size=20,delay=0,stagger=110}={}){const ps=[];for(let i=0;i<n;i++){const x=at.x+(Math.random()-.5)*spread;const gg=Array.isArray(gl)?gl[i%gl.length]:gl;ps.push(run(mk(gg,size),[{transform:T(P(x,at.y+30),.5),opacity:0},{transform:T(P(x,at.y),1),opacity:1,offset:.3},{transform:T(P(x,at.y-60),1),opacity:0}],d,{delay:delay+i*stagger}));}return Promise.all(ps);}
function pop(gl,at,{size=48,d=850,delay=0,rot=0}={}){return run(mk(gl,size),[{transform:T(at,0,rot-20),opacity:0},{transform:T(at,1.25,rot),opacity:1,offset:.25},{transform:T(at,1,rot),opacity:1,offset:.75},{transform:T(at,1.1,rot),opacity:0}],d,{delay});}
function word(txt,at,{color='#f3c34d',size=34,d=1000,delay=0,rot=-6}={}){return pop(`<span class="fxw" style="color:${color}">${txt}</span>`,at,{size,d,delay,rot});}
function stamp(txt,at,{d=1200,delay=0}={}){return run(mk(`<span class="stamp">${txt}</span>`,28),[{transform:T(at,3,-14),opacity:0},{transform:T(at,1,-14),opacity:1,offset:.15},{transform:T(at,1,-14),opacity:1,offset:.85},{transform:T(at,1,-14),opacity:0}],d,{delay,ease:'ease-in'});}
function orbit(gl,at,{r=46,d=1100,size=28,phase=0,turns=1.5,delay=0}={}){const kf=[];for(let i=0;i<=16;i++){const t=i/16,an=phase+t*turns*2*Math.PI;kf.push({transform:T(P(at.x+Math.cos(an)*r,at.y+Math.sin(an)*r*.55),1,t*360),opacity:i===16?0:1});}return run(mk(gl,size),kf,d,{ease:'linear',delay});}
function beam(a,b,{color='#ffe066',w=14,d=600,delay=0}={}){const e=document.createElement('div');e.className='fxbeam';const L=Math.hypot(b.x-a.x,b.y-a.y),an=Math.atan2(b.y-a.y,b.x-a.x)*180/Math.PI;Object.assign(e.style,{width:L+'px',height:w+'px',left:a.x+'px',top:(a.y-w/2)+'px',transformOrigin:'0 50%',opacity:'0',background:`linear-gradient(90deg,${color}00,${color} 25%,#ffffff 60%,${color})`});$('#fx').appendChild(e);return run(e,[{transform:`rotate(${an}deg) scaleX(0)`,opacity:1},{transform:`rotate(${an}deg) scaleX(1)`,opacity:1,offset:.45},{transform:`rotate(${an}deg) scaleX(1) scaleY(.15)`,opacity:0}],d,{delay});}
function zigzag(a,b,{color='#ffe066',d=500,delay=0,w=4}={}){const f=$('#field');const W=f.clientWidth,H=f.clientHeight;let pts=[];const n=7;for(let i=0;i<=n;i++){const t=i/n;const x=a.x+(b.x-a.x)*t,y=a.y+(b.y-a.y)*t;const j=(i===0||i===n)?0:(Math.random()-.5)*34;pts.push((x+j).toFixed(1)+','+(y+j).toFixed(1));}const e=document.createElement('div');e.className='fxi';e.style.opacity='0';e.innerHTML=`<svg width="${W}" height="${H}" style="width:${W}px;height:${H}px"><polyline points="${pts.join(' ')}" fill="none" stroke="#1c1a24" stroke-width="${w+5}" stroke-linejoin="round"/><polyline points="${pts.join(' ')}" fill="none" stroke="${color}" stroke-width="${w}" stroke-linejoin="round"/></svg>`;$('#fx').appendChild(e);return run(e,[{opacity:1},{opacity:0,offset:.3},{opacity:1,offset:.45},{opacity:0}],d,{delay,ease:'linear'});}
function ring(at,{color='#ffffff',d=650,size=40,delay=0}={}){const e=document.createElement('div');e.className='fxring';Object.assign(e.style,{width:size+'px',height:size+'px',borderColor:color,opacity:'0'});$('#fx').appendChild(e);return run(e,[{transform:`translate(${at.x}px,${at.y}px) translate(-50%,-50%) scale(.2)`,opacity:1},{transform:`translate(${at.x}px,${at.y}px) translate(-50%,-50%) scale(3.2)`,opacity:0}],d,{delay});}
function flashScr(color='#ffffff',d=320,delay=0){const e=document.createElement('div');e.className='fxflash';e.style.background=color;e.style.opacity='0';$('#fx').appendChild(e);return run(e,[{opacity:0},{opacity:.65,offset:.25},{opacity:0}],d,{delay});}
function shake(d=480,amp=8){return $('#field').animate([{transform:'none'},{transform:`translate(${amp}px,${-amp/2}px)`},{transform:`translate(${-amp}px,${amp/2}px)`},{transform:`translate(${amp/2}px,${amp/2}px)`},{transform:`translate(${-amp/2}px,0)`},{transform:'none'}],{duration:d*FXS()}).finished.catch(()=>{});}
function cam(c,{z=1.12,d=900}={}){const f=$('#field');const ox=(c.a.x/f.clientWidth*100).toFixed(0),oy=(c.a.y/f.clientHeight*100).toFixed(0);f.style.transformOrigin=`${ox}% ${oy}%`;return f.animate([{transform:'scale(1)'},{transform:`scale(${z})`,offset:.3},{transform:`scale(${z})`,offset:.7},{transform:'scale(1)'}],{duration:d*FXS(),easing:'ease-in-out'}).finished.catch(()=>{});}
async function letterbox(d=1400){const t=document.createElement('div'),b=document.createElement('div');t.className='lbox';b.className='lbox';t.style.top='0';b.style.bottom='0';$('#fx').appendChild(t);$('#fx').appendChild(b);await all(run(t,[{height:'0'},{height:'16%',offset:.2},{height:'16%',offset:.8},{height:'0'}],d,{ease:'ease-in-out'}),run(b,[{height:'0'},{height:'16%',offset:.2},{height:'16%',offset:.8},{height:'0'}],d,{ease:'ease-in-out'}));}
function sprA(s,kf,d,o={}){return $('#sp'+s).animate(kf,{duration:d*FXS(),easing:o.ease||'ease-in-out',delay:(o.delay||0)*FXS()}).finished.catch(()=>{});}
function lunge(c,{dist=46,d=380,delay=0}={}){const dx=c.b.x-c.a.x,dy=c.b.y-c.a.y,L=Math.hypot(dx,dy)||1;return sprA(c.s,[{transform:'none'},{transform:`translate(${dx/L*dist}px,${dy/L*dist}px)`,offset:.4},{transform:'none'}],d,{delay});}
function tint(s,filter,d=700,delay=0){return sprA(s,[{filter:'none'},{filter,offset:.2},{filter,offset:.8},{filter:'none'}],d,{delay});}
function glow(s,color,d=900){return sprA(s,[{filter:'drop-shadow(0 0 0 transparent)'},{filter:`drop-shadow(0 0 14px ${color}) brightness(1.15)`,offset:.5},{filter:'drop-shadow(0 0 0 transparent)'}],d);}
const all=(...p)=>Promise.all(p);
const side=(c,dx)=>P(c.a.x+(c.b.x>c.a.x?dx:-dx),c.a.y);

function boomEl(t){return `<div class="boom"><svg viewBox="0 0 150 110"><polygon points="75,2 88,30 120,10 110,40 148,42 118,60 140,92 104,80 95,108 75,84 55,108 46,80 10,92 32,60 2,42 40,40 30,10 62,30" fill="#ffe14d" stroke="#14121a" stroke-width="4" stroke-linejoin="round"/></svg><span>${t}</span></div>`;}
async function fxSuper(c){
  SND.sfx('pow');const f=$('#field');
  f.animate([{filter:'none'},{filter:'contrast(1.4) saturate(1.5)',offset:.1},{filter:'contrast(1.4) saturate(1.5)',offset:.85},{filter:'none'}],{duration:850*FXS()});
  await all(run(mk(boomEl(ONOMA[rnd(ONOMA.length)]),16),[{transform:T(up(c.b,20),.2,-25),opacity:1},{transform:T(up(c.b,20),1.15,-6),opacity:1,offset:.18},{transform:T(up(c.b,20),1,-6),opacity:1,offset:.85},{transform:T(up(c.b,20),1.1,-6),opacity:0}],850,{ease:'ease-out'}),
    sprA(c.t,[{transform:'none'},{transform:'scale(1.25,.6) translateY(22px)',offset:.15},{transform:'scale(1.25,.6) translateY(22px)',offset:.6},{transform:'scale(.9,1.12)',offset:.8},{transform:'none'}],850),shake(380,9));
}
async function fxWeak(c){
  SND.sfx('cricket');
  await sleep(350);SND.sfx('yawn');await pop('🥱',P(c.b.x+34,c.b.y-48),{size:34,d:1000});
}
async function fxMiss(c){
  SND.sfx('whoosh');const el=$('#sp'+c.t);const o=el.style.transformOrigin;el.style.transformOrigin='50% 100%';const dir=c.t===1?1:-1;
  const past=P(c.b.x+(c.b.x-c.a.x)*.9,c.b.y+(c.b.y-c.a.y)*.9);
  await all(fly('💨',c.a,past,{d:520,size:34,ease:'linear',delay:120}),
    sprA(c.t,[{transform:'none',filter:'none'},{transform:`skewX(${dir*22}deg) rotate(${-dir*38}deg)`,filter:'drop-shadow(-8px 0 0 #67a9f288) drop-shadow(-16px 0 0 #67a9f244)',offset:.25},{transform:`skewX(${dir*22}deg) rotate(${-dir*38}deg)`,filter:'drop-shadow(-8px 0 0 #67a9f288) drop-shadow(-16px 0 0 #67a9f244)',offset:.7},{transform:'none',filter:'none'}],1100));
  el.style.transformOrigin=o;SND.sfx('trombone');setTimeout(()=>SND.sfx('laugh'),700);
}
function chyron(){
  if(SPEED===0||RM)return null;SND.sfx('news');
  const e=document.createElement('div');e.className='chyron';e.innerHTML=`<b>ÚLTIMA HORA</b><span>${esc(HEADL[rnd(HEADL.length)])}</span>`;$('#field').appendChild(e);return e;
}
function unchyron(e){if(!e)return;e.classList.add('out');setTimeout(()=>e.remove(),260);}
function hitReact(s,mv,big){
  if(SPEED===0||RM)return;
  if(mv.type==='cas'){tint(s,'brightness(.35) sepia(.5)',1100);fxRun(c=>rise('💨',P(c.a.x,c.a.y-20),{n:4,size:18,spread:40}),s);return;}
  if(big){const el=$('#sp'+s);el.animate([{transform:'none'},{transform:'scale(1.35,.45) translateY(30px)',offset:.12},{transform:'scale(1.35,.45) translateY(30px)',offset:.55},{transform:'scale(.85,1.2) translateY(-6px)',offset:.75},{transform:'none'}],{duration:900*FXS()});}
}
async function koFly(s){
  const el=$('#sp'+s);
  if(SPEED===0||RM){spriteOut(s);SND.sfx('faint');return;}
  const f=$('#field'),W=f.clientWidth,H=f.clientHeight,row=el.closest('.row');row.style.zIndex='7';
  const r=el.getBoundingClientRect(),fr=f.getBoundingClientRect(),x0=r.left-fr.left+r.width/2,y0=r.top-fr.top+r.height/2;
  const dir=s===1?1:-1,tx=(s===1?W*.82:W*.18)-x0,ty=18-y0;
  SND.sfx('whoosh');
  await el.animate([{transform:'none'},{transform:`translate(${-dir*14}px,14px) scale(1.1,.8)`,offset:.15},{transform:`translate(${tx}px,${ty}px) rotate(${dir*1080}deg) scale(.08)`}],{duration:1000*FXS(),easing:'cubic-bezier(.5,0,.9,.6)',fill:'forwards'}).finished.catch(()=>{});
  SND.sfx('twinkle');
  await fxRun(c=>pop('✨',P(x0+tx,y0+ty),{size:30,d:700}),s);
  el.style.transition='none';el.getAnimations().forEach(a=>a.cancel());spriteOut(s);void el.offsetWidth;el.style.transition='';row.style.zIndex='';
  SND.sfx('laugh');
}
let REFC=null;
/* ---- Gestión: la carpeta, las pegatinas y las tijeras ---- */
const anim=(e,kf,d,o={})=>e.animate(kf,{duration:d*FXS(),easing:o.ease||'ease-out',delay:(o.delay||0)*FXS(),fill:'forwards'}).finished.catch(()=>{});
function partido(html,at,size){ // dos mitades exactas de lo mismo, para cortarlas
  return [0,1].map(h=>{const e=mk(`<span style="display:inline-block;clip-path:${h?'inset(0 0 0 50%)':'inset(0 50% 0 0)'}">${html}</span>`,size);e.style.transform=T(at);return e;});
}
async function fxGestion(c,i){
  const f=$('#field'),W=f.clientWidth,H=f.clientHeight,G=GESTION[i];
  const at=P(W/2,H*.45);
  const fo=document.createElement('div');fo.className='gfold';
  fo.innerHTML=`<span class="gtab"></span><div class="gico">${G.ico}</div><div class="glab r">RECORTES</div><div class="glab a">AUSTERIDAD</div><div class="glab e">EFICIENCIA</div><div class="glab g">GESTIÓN</div>`;
  fo.style.transform=T(at,0);$('#fx').appendChild(fo);
  SND.sfx('ding');
  await anim(fo,[{transform:T(at,0,-14)},{transform:T(at,1.18,4),offset:.6},{transform:T(at,1,0)}],480);
  await sleep(420);
  // las pegatinas se despegan una a una
  for(const k of ['g','e','a']){
    const l=fo.querySelector('.glab.'+k);SND.sfx('peel');
    await anim(l,[{transform:'none',opacity:1},{transform:'rotate(-7deg) translate(-3px,-3px)',opacity:1,offset:.3},{transform:'rotate(-40deg) translate(-80px,-60px)',opacity:0}],560,{ease:'ease-in'});
    await sleep(k==='a'?200:110);
  }
  // debajo, lo de siempre
  SND.sfx('thud');shake(300,6);
  await anim(fo.querySelector('.glab.r'),[{transform:'scale(1)'},{transform:'scale(1.3) rotate(-3deg)',offset:.4},{transform:'scale(1) rotate(-3deg)'}],420);
  await sleep(500);
  // la carpeta se abre: dentro solo hay unas tijeras… y la verdad
  const sc=P(at.x,H*.6),tp=P(W/2,H*.3);
  SND.sfx('superE');
  const msg=pop('<span class="fxw gtruth">¡La gestión son,<br>en realidad,<br>RECORTES!</span>',tp,{size:26,d:2600,rot:-4});
  await all(anim(fo,[{transform:T(at,1)},{transform:T(at,1.05,-4),offset:.4},{transform:T(at,.3,14),opacity:0}],420),pop('✂️',sc,{size:70,d:700}),shake(400,8));
  await sleep(500);
  if(i===0){ // Sanidad: le cortan un trozo de la barra de vida
    const bar=$('#plate'+c.t+' .hp'),fill=bar&&bar.querySelector('i');
    if(!fill)return;
    const fr=f.getBoundingClientRect(),br=bar.getBoundingClientRect(),ir=fill.getBoundingClientRect();
    const cw=Math.max(6,Math.min(ir.width,br.width*(c.frac||.25))),x1=ir.right-fr.left,x0=x1-cw,y=ir.top-fr.top+ir.height/2;
    SND.sfx('whoosh');await fly('✂️',sc,P(x0,y-4),{d:480,size:40,spin:360,ease:'ease-in-out'});
    SND.sfx('snip');
    const ch=document.createElement('div');ch.className='gchunk';Object.assign(ch.style,{left:x0+'px',top:(ir.top-fr.top)+'px',width:cw+'px',height:ir.height+'px',background:getComputedStyle(fill).backgroundColor||'#3fb950'});
    $('#fx').appendChild(ch);fill.style.width=Math.max(0,(ir.width-cw)/br.width*100)+'%';
    await all(pop('✂️',P(x0,y-4),{size:34,d:420}),anim(ch,[{transform:'none',opacity:1},{transform:'translate(6px,-8px) rotate(-8deg)',opacity:1,offset:.2},{transform:'translate(26px,150px) rotate(70deg)',opacity:0}],1000,{ease:'ease-in'}),burst('✨',P(x0,y),{n:5,r:26,size:16,d:500}));
  }else if(i===1){ // Educación: le recortan un ataque
    if(!c.mv){await msg;return;}
    const bp=clampX(P(c.b.x-10,c.b.y+62),115),tt=TYPES[c.mv.type];
    const [L,R]=partido(`<span class="gcard" style="--tc:${tt.c}"><b>${esc(c.mv.name)}</b><small>${tt.e} ${tt.n}</small></span>`,bp,15);
    await all(anim(L,[{opacity:0,transform:T(bp,.4)},{opacity:1,transform:T(bp,1)}],260),anim(R,[{opacity:0,transform:T(bp,.4)},{opacity:1,transform:T(bp,1)}],260));
    SND.sfx('whoosh');await fly('✂️',sc,up(bp,40),{d:420,size:40,spin:-180});
    SND.sfx('snip');
    await all(fly('✂️',up(bp,40),P(bp.x,bp.y+40),{d:260,size:40,ease:'linear'}),
      anim(L,[{transform:T(bp)},{transform:T(P(bp.x-34,bp.y+120),1,-30),opacity:0}],900,{ease:'ease-in',delay:180}),
      anim(R,[{transform:T(bp)},{transform:T(P(bp.x+34,bp.y+120),1,30),opacity:0}],900,{ease:'ease-in',delay:180}));
  }else{ // Pensiones: parten la hucha
    const hp=P(c.b.x,c.b.y-4);
    const [L,R]=partido('🐷',hp,84);
    SND.sfx('coin');
    await all(anim(L,[{opacity:0,transform:T(hp,.3)},{opacity:1,transform:T(hp,1.1)},{opacity:1,transform:T(hp,1)}],380),anim(R,[{opacity:0,transform:T(hp,.3)},{opacity:1,transform:T(hp,1.1)},{opacity:1,transform:T(hp,1)}],380));
    SND.sfx('whoosh');await fly('✂️',sc,up(hp,56),{d:440,size:42,spin:180});
    SND.sfx('snip');SND.sfx('coins');
    await all(fly('✂️',up(hp,56),P(hp.x,hp.y+50),{d:240,size:42,ease:'linear'}),
      anim(L,[{transform:T(hp)},{transform:T(P(hp.x-40,hp.y+16),1,-28),offset:.5},{transform:T(P(hp.x-56,hp.y+70),1,-60),opacity:0}],1000,{delay:160}),
      anim(R,[{transform:T(hp)},{transform:T(P(hp.x+40,hp.y+16),1,28),offset:.5},{transform:T(P(hp.x+56,hp.y+70),1,60),opacity:0}],1000,{delay:160}),
      ...Array.from({length:10},(_,k)=>fly('🪙',P(hp.x+(Math.random()-.5)*40,hp.y),P(c.a.x+(Math.random()-.5)*50,c.a.y+(Math.random()-.5)*30),{d:650,size:22,arc:60+Math.random()*60,spin:360,delay:200+k*70,ease:'ease-in-out'})));
    SND.sfx('coins');
    await all(glow(c.s,'#ffd84d',900),burst('🪙',c.a,{n:7,r:50,size:18,d:700}),rise('✨',c.a,{n:5,size:18}));
  }
  await msg;
}

/* ---- Piezas de la Flotilla a Gaza: mar, barcos y prensa ---- */
const FLOTA=['⛵','⛵','🛥️','⛵','⛵'];
const FLOTA_POS=[[0,0],[-34,-22],[30,-18],[-26,24],[36,20]];
function seaOn(){const e=document.createElement('div');e.className='fxsea';$('#field').insertBefore(e,$('#wx'));e.animate([{opacity:0},{opacity:1}],{duration:450*FXS(),fill:'forwards'});return e;}
function clampX(p,m=140){const W=$('#field').clientWidth;return P(Math.min(Math.max(p.x,m),W-m),p.y);}
const popa=c=>P(c.a.x-(c.b.x>c.a.x?70:-70),c.a.y+40);
const rumbo=c=>P((c.a.x+c.b.x)/2,(c.a.y+c.b.y)/2+10);
function sail(gl,a,b,{d=1600,size=40,delay=0,bob=6,phase=0}={}){
  const H=$('#field').clientHeight||400;const kf=[];const n=16;
  for(let i=0;i<=n;i++){const t=i/n;const w=t*Math.PI*6+phase;const x=a.x+(b.x-a.x)*t,y=a.y+(b.y-a.y)*t+Math.sin(w)*bob;
    kf.push({transform:T(P(x,y),.75+.5*(y/H),Math.sin(w+1)*7),opacity:i===0?0:1});}
  return run(mk(gl,size),kf,d,{delay,ease:'linear'});
}
function fleet(a,b,{d=1700,delay=0,size=38}={}){return Promise.all(FLOTA.map((g,i)=>{const[ox,oy]=FLOTA_POS[i];return sail(g,P(a.x+ox,a.y+oy),P(b.x+ox*.6,b.y+oy*.6),{d,size:i===2?size+8:size,delay:delay+i*90,phase:i*1.3});}));}
async function press(at){const b=burst('📸',at,{n:6,r:62,size:22,d:700});for(let i=0;i<3;i++){SND.sfx('camera');flashScr('#ffffff',150);await sleep(190);}await b;}
async function fxInterceptada(c){
  SND.sfx('horn');seaOn();const m=rumbo(c),dir=c.b.x>c.a.x?1:-1;
  await all(letterbox(3100),fleet(popa(c),m,{d:1300}),
    sleep(1450).then(()=>{SND.sfx('siren');return all(
      fly('🚢',P(c.b.x+dir*90,c.b.y),P(m.x+dir*62,m.y-14),{d:650,size:58,ease:'ease-out'}),
      ...FLOTA.map((g,i)=>{const[ox,oy]=FLOTA_POS[i];const p=P(m.x+ox*.6,m.y+oy*.6);return run(mk(g,i===2?46:38),[{transform:T(p,1,0),opacity:1},{transform:T(P(p.x+3,p.y),1,-8),opacity:1,offset:.2},{transform:T(P(p.x-3,p.y),1,8),opacity:1,offset:.4},{transform:T(p,1,0),opacity:1,offset:.75},{transform:T(p,.9,0),opacity:0}],1500);}),
      ring(m,{color:'#e5533d',size:70,d:700,delay:250}),ring(m,{color:'#e5533d',size:70,d:700,delay:650}),
      stamp('INTERCEPTADA',clampX(up(m,64)),{d:1400,delay:450}));}));
}
async function fxHeroina(c){
  const m=rumbo(c);SND.sfx('jet');
  await fly('✈️',m,up(c.a,20),{d:900,size:46,arc:70,ease:'ease-in-out'});
  SND.sfx('applause');
  await all(press(c.a),burst(['🌹','👏','💐'],c.a,{n:10,r:78,size:26,d:1000}),rise('🌹',c.a,{n:6,spread:110,size:22}),
    glow(c.s,'#ffd27a',1300),word('¡HEROÍNA!',clampX(up(c.a,86)),{color:'#f3c34d',size:32,d:1400}));
}

const FX={
  peugeot:async c=>{const dir=c.s===0?-1:1;await all(pop('🔑',up(c.a,50),{size:30,d:500}),glow(c.s,'#ffd27a',500));await sprA(c.s,[{opacity:1,transform:'none'},{opacity:0,transform:'scale(.6)'}],350);$('#sp'+c.s).classList.add('gone');await all(fly('🚗',P(c.a.x,c.a.y+30),P(c.a.x+dir*320,c.a.y+30),{d:900,size:42,ease:'ease-in'}),burst('💨',P(c.a.x,c.a.y+36),{n:5,r:30}));},
  peugeotBack:async c=>{const dir=c.s===0?-1:1;await fly('🚗',P(c.a.x+dir*320,c.a.y+30),P(c.a.x,c.a.y+30),{d:800,size:42,ease:'ease-out'});$('#sp'+c.s).classList.remove('gone');await all(sprA(c.s,[{opacity:0,transform:'scale(.6)'},{opacity:1,transform:'none'}],350),rise(['✨','💚'],c.a,{n:7}),word('¡HE VUELTO!',up(c.a,62),{size:22}));},
  dondedije:async c=>{await all(sprA(c.s,[{transform:'none'},{transform:'rotateY(180deg)'},{transform:'rotateY(360deg)'}],700),word('¿Dije?',up(c.a,58),{size:24,d:800}),tint(c.s,'hue-rotate(160deg) saturate(1.6)',900));},
  tezanazo:[async c=>{await word('CIS: 99%',up(c.b,70),{color:'#e5533d',size:26,d:700});await all(fly('📊',P(c.b.x,c.b.y-180),c.b,{d:420,size:58,ease:'ease-in'}));await all(shake(400,10),burst('📈',c.b,{n:6,size:22}));},
    async c=>{await word('CIS: 104%',up(c.b,70),{color:'#e5533d',size:26,d:800});await fly('🥧',c.a,c.b,{d:480,size:46,arc:70,spin:360,ease:'ease-in'});SND.sfx('slap');await all(shake(400,10),rain('🥧',c.b,{n:4,size:18,h:40,spread:60}),word('¡ZAS, EN TODA LA ENCUESTA!',up(c.b,24),{size:14,d:900}));}],
  falcon:async c=>{await all(fly('✈️',c.a,c.b,{arc:110,size:42,d:800,spin:25}),lunge(c,{dist:20,d:300}),cam(c,{z:1.08,d:700}));shake(500,10);await all(burst(['💥','🔥','💨'],c.b,{n:8,size:28}),flashScr('#ffd27a',300));},
  derogar:async c=>{
    await all(zigzag(c.a,c.b,{w:5,d:450}),beam(c.a,c.b,{color:'#ffe066',w:10,d:450}));
    SND.sfx('thud');shake(420,10);
    await all(run(mk('<span class="stamp" style="font-size:30px;padding:2px 12px;border-width:5px;background:#fffc">DEROGADO</span>',30),[{transform:T(c.b,3,-14),opacity:0},{transform:T(c.b,1,-10),opacity:1,offset:.18},{transform:T(c.b,1,-10),opacity:1,offset:.8},{transform:T(c.b,1,-10),opacity:0}],1200,{ease:'ease-in'}),
      (async()=>{await sleep(500);SND.sfx('printer');await burst(['📄','✂️','📄'],c.b,{n:12,size:20,r:80,d:800});})());
  },
  nisino:async c=>{
    SND.sfx('flip');const at=up(c.b,62);
    const co=mk('<div class="coin2">¿SÍ?</div>',16),tx=co.querySelector('.coin2');
    co.animate([{transform:T(P(c.a.x,c.a.y-40),.3,0),opacity:1},{transform:T(at,1,0),opacity:1}],{duration:350*FXS(),easing:'ease-out',fill:'forwards'});
    await sleep(350);
    for(let i=0;i<9;i++){await tx.animate([{transform:'scaleX(1)'},{transform:'scaleX(0)'}],{duration:65*FXS(),fill:'forwards'}).finished.catch(()=>{});tx.textContent=i%2?'¿SÍ?':'¿NO?';await tx.animate([{transform:'scaleX(0)'},{transform:'scaleX(1)'}],{duration:65*FXS(),fill:'forwards'}).finished.catch(()=>{});}
    tx.textContent='¿…?';
    await all(sprA(c.t,[{transform:'none'},{transform:'rotate(-14deg)'},{transform:'rotate(14deg)'},{transform:'rotate(-10deg)'},{transform:'none'}],700),orbit('💫',up(c.b,40),{r:34,d:900}),orbit('💫',up(c.b,40),{r:34,d:900,phase:Math.PI}));
    co.animate([{opacity:1},{opacity:0}],{duration:200*FXS(),fill:'forwards'});
    await all(zigzag(P(c.b.x,0),c.b,{d:400}),flashScr('#fff3a0',220));
  },
  lluvia:async c=>{await all(rain('☁️',P(c.a.x+60,c.a.y),{n:4,size:40,h:60,spread:240,stagger:90}),rain('💧',c.b,{n:10,size:20,spread:260,h:180,stagger:40}));},
  barco:async c=>{await all(fly('🚤',P(c.a.x,c.a.y+20),P(c.b.x,c.b.y+10),{d:620,size:46,arc:-20,ease:'ease-in'}),rain('💦',P((c.a.x+c.b.x)/2,(c.a.y+c.b.y)/2),{n:6,size:20,spread:160,h:40,stagger:50}));await all(burst('💦',c.b,{n:8,size:24}),shake(380,8));},
  comunismo:async c=>{
    const at=P(Math.min($('#field').clientWidth-80,Math.max(80,c.b.x)),c.b.y-6);
    const wh=mk('<div class="wheel"><div class="w"><span class="t">COMUNISMO</span><span class="bt">LIBERTAD</span></div><div class="ptr">▼</div></div>',14),w=wh.querySelector('.w');
    wh.animate([{transform:T(at,.2,0),opacity:0},{transform:T(at,1,0),opacity:1}],{duration:300*FXS(),fill:'forwards'});
    await sleep(300);SND.sfx('flip');
    await w.animate([{transform:'rotate(0deg)'},{transform:'rotate(1080deg)'}],{duration:1300*FXS(),easing:'cubic-bezier(.2,.7,.3,1)',fill:'forwards'}).finished.catch(()=>{});
    word('¿COMUNISMO?',P(at.x,at.y+82),{color:'#e5333d',size:18,d:700});await sleep(500);
    await fly('👆',P(at.x+90,at.y+60),P(at.x+52,at.y),{d:300,size:30});SND.sfx('blip');
    await w.animate([{transform:'rotate(1080deg)'},{transform:'rotate(1260deg)'}],{duration:500*FXS(),easing:'ease-out',fill:'forwards'}).finished.catch(()=>{});
    SND.sfx('fanfare');wh.animate([{opacity:1},{opacity:0}],{duration:300*FXS(),delay:500*FXS(),fill:'forwards'});
    word('¡LIBERTAD!',up(c.b,52),{color:'#f08457',size:30,d:1100});await rain('🔥',c.b,{n:9,size:28,spread:90});await flashScr('#ff8a50',240);
  },
  fruta:async c=>{await all(...FRUITS.concat(FRUITS).map((f,i)=>fly(f,P(c.a.x,c.a.y-10),P(c.b.x+(Math.random()-.5)*40,c.b.y+(Math.random()-.5)*30),{d:520,size:26,arc:20+Math.random()*60,spin:360,delay:i*65})));shake(400,6);},
  cana:async c=>{await all(pop('🍺',P(c.a.x+30,c.a.y-40),{size:44,d:900,rot:-25}),pop('☀️',P(c.b.x,30),{size:46,d:1000}));},
  bocata:async c=>{
    const ang=Math.atan2(c.b.y-c.a.y,c.b.x-c.a.x)*180/Math.PI,mid=P(c.a.x+(c.b.x-c.a.x)*.55,c.a.y+(c.b.y-c.a.y)*.55);
    SND.sfx('whoosh');
    const fin=run(mk('👉',34),[{transform:T(c.a,.3,ang),opacity:1},{transform:T(mid,2.6,ang),opacity:1,offset:.22},{transform:T(mid,2.4,ang),opacity:1,offset:.3},{transform:T(mid,2.6,ang),opacity:1,offset:.85},{transform:T(mid,2.8,ang),opacity:0}],2300,{ease:'ease-out'});
    lunge(c,{dist:28,d:320});
    const W=$('#field').clientWidth,H=$('#field').clientHeight,cx=(x,m)=>Math.min(W-m,Math.max(m,x)),cy=y=>Math.min(H-24,Math.max(24,y));
    const acc=[['¿LLUEVE?',-40,-46,'#67a9f2'],['¿ATASCO?',40,-12,'#f08457'],['¿ES LUNES?',-40,22,'#c3bcb1'],['¿PIERDE EL MADRID?',30,56,'#ffffff']];
    const ws=acc.map(([t,dx,dy,col],i)=>{setTimeout(()=>SND.sfx('blipbeep'),(260+i*230)*FXS());return word(t,P(cx(c.b.x+dx,t.length*6+10),cy(c.b.y+dy)),{color:col,size:17,d:900,delay:260+i*230,rot:(i%2?6:-6)});});
    await all(...ws);
    setTimeout(()=>{SND.sfx('thud');shake(420,9);},330*FXS());
    await all(
      run(mk('🏛️',64),[{transform:T(P(c.b.x,c.b.y-190),1.3,-10),opacity:1},{transform:T(c.b,1.15,4),opacity:1,offset:.45},{transform:T(P(c.b.x,c.b.y+6),1.3,0),opacity:1,offset:.55},{transform:T(c.b,1.15,0),opacity:1,offset:.85},{transform:T(c.b,1.2,0),opacity:0}],1000,{ease:'ease-in'}),
      burst(['💨','💢'],c.b,{n:8,r:70,size:22,d:700,delay:300}),
      stamp('CULPA SUYA',P(cx(c.b.x,100),c.b.y-8),{d:1300,delay:420}),
      fin);
    await all(...[0,1,2,3].map(i=>fly('💚',c.b,c.a,{d:600,size:18,arc:(i-1.5)*20,delay:i*90,ease:'ease-out'})));
  },
  obras:async c=>{await all(...[0,1,2,3,4].map(i=>fly('🚧',c.a,P(c.b.x-50+i*25,c.b.y+50),{d:600,size:26,arc:70,delay:i*90,ease:'ease-out'})),pop('👷',up(c.a,58),{size:34,d:900}));},
  m360:async c=>{const img=$('#sp'+c.s+' img');if(!img)return;const old=img.src;await all(sprA(c.s,[{transform:'none'},{transform:'rotate(360deg) scale(.8)'},{transform:'none'}],600),pop('🔄',up(c.a,62),{size:34,d:700}));img.src=IMG(B&&active(c.t)?active(c.t).p.id:'almeida');await all(word('¿Quién soy?',up(c.a,62),{size:20,d:900}),sleep(900));img.src=old;},
  calderon:async c=>{await all(...[0,1,2,3,4,5,6,7].map(i=>fly(i%2?'🎵':'🎶',c.a,c.b,{d:700,size:24,arc:(i%2?1:-1)*40,delay:i*90})),ring(c.a,{color:'#e5533d'}),ring(c.a,{color:'#ffffff',delay:200}),ring(c.b,{color:'#e5533d',delay:600}));},
  verbena:async c=>{await fly('🎇',c.a,c.b,{arc:90,d:620,size:30});await all(burst(['🎆','✨','🔥'],c.b,{n:10,size:26,r:66}),flashScr('#ffb36b',320));},
  caballo:async c=>{
    const W=$('#field').clientWidth;SND.sfx('hooves');
    letterbox(2300);
    await all(cam(c,{z:1.12,d:900}),word('¡SANTIAGOOO!',up(c.a,70),{color:'#f3c34d',size:24,d:1100,rot:-4}));
    const dir=c.b.x>c.a.x?1:-1,y=c.b.y+16;
    const hz=mk('<span style="display:inline-block;transform:scaleX('+(dir>0?-1:1)+')">🐎</span>',72);
    await all(run(hz,[{transform:T(P(c.a.x-dir*60,c.a.y),.7,0),opacity:1},{transform:T(P((c.a.x+c.b.x)/2,(c.a.y+c.b.y)/2-30),1,-dir*8),opacity:1,offset:.55},{transform:T(P(c.b.x+dir*W*.6,y),1.2,dir*6),opacity:1}],1100,{ease:'ease-in'}),
      lunge(c,{dist:90,d:700}),rain('💨',P((c.a.x+c.b.x)/2,(c.a.y+c.b.y)/2+30),{n:8,size:22,spread:160,h:10,stagger:70,d:700}));
    shake(500,12);SND.sfx('thud');await all(burst(['💥','💨','🐾'],c.b,{n:9,size:24,r:70}),flashScr('#f3c34d',260));
  },
  publico:async c=>{await all(letterbox(1600),rise('👏',c.a,{n:10,size:24,spread:150,stagger:70}),word('¡OLÉ!',up(c.a,64),{size:30,delay:300}),glow(c.s,'#ffd166',1200));},
  derechita:[async c=>{await word('¡COBARDE!',up(c.b,56),{color:'#e5533d',size:28,d:900});await all(fly('🐔',c.a,c.b,{d:500,size:38,spin:360}),lunge(c,{dist:50}));await burst('🪶',c.b,{n:7,size:20});},
    async c=>{SND.sfx('cluck');await all(rain('🐣',c.b,{n:8,size:26,spread:120,h:160,stagger:60}),word('¡CO-CO-COBARDE!',up(c.b,62),{color:'#e5533d',size:20,d:1100}));await all(lunge(c,{dist:60}),burst('🪶',c.b,{n:9,size:20}),shake(300,8));}],
  chiringuitos:async c=>{await all(...[0,1,2].map(i=>fly('🔒',c.a,P(c.b.x+(i-1)*24,c.b.y),{d:520,size:26,delay:i*110,spin:180})));await all(burst('❄️',c.b,{n:8,size:22}),tint(c.t,'hue-rotate(180deg) saturate(1.8)',800));},
  asaltar:async c=>{await all(beam(c.a,P(c.a.x,c.a.y-170),{color:'#9bd07d',w:20,d:600}),glow(c.s,'#9bd07d'),cam(c,{z:1.06,d:600}));await all(rain('🍃',c.b,{n:14,size:26,spread:110,stagger:45,h:170}),flashScr('#9bd07d',400,300));shake(400,6);},
  casta:[async c=>{await burst('🎩',c.b,{n:5,size:28});await all(...[0,1,2,3,4].map(i=>fly('💚',c.b,c.a,{d:600,size:20,arc:(i-2)*18,delay:i*90,ease:'ease-out'})));await glow(c.s,'#7dff9a',500);},
    async c=>{await all(pop('🧐',up(c.b,50),{size:40,d:800}),rain(['🎩','💰','🍾'],c.b,{n:8,size:24,spread:110,h:150,stagger:60}));await all(...[0,1,2,3,4].map(i=>fly('💚',c.b,c.a,{d:600,size:20,arc:(i-2)*18,delay:i*90,ease:'ease-out'})),word('¡CASTA!',up(c.b,60),{color:'#7dbb62',size:26,d:900}));}],
  chalet:async c=>{await all(rain('🧱',c.a,{n:6,size:22,h:100,spread:60,stagger:70}),sprA(c.s,[{transform:'none'},{transform:'scale(.7)',offset:.5},{transform:'none'}],700));},
  purga:async c=>{await all(word('¡PURGA!',up(c.b,58),{color:'#b77ad8',size:30}),ring(c.a,{color:'#b77ad8'}),lunge(c,{dist:60}));await all(shake(600,10),rise('✊',P(c.b.x,c.b.y+20),{n:6,size:26,spread:90,stagger:60,d:700}));await burst('💜',c.a,{n:5,size:18,r:40});},
  escucha:async c=>{await all(pop('👂',P(c.b.x-46,c.b.y-10),{size:40,d:1100}),pop('👂',P(c.b.x+46,c.b.y-10),{size:40,d:1100,delay:150}));await rain('🌱',c.b,{n:4,size:22,h:70});},
  sonrisa:async c=>{
    await pop('😁',up(c.a,64),{size:52,d:800});SND.sfx('ding');
    await all(run(mk('<span style="color:#fff;text-shadow:0 0 18px #fff,0 0 30px #9ff">✦</span>',60),[{transform:T(P(c.a.x+18,c.a.y-58),.2,0),opacity:1},{transform:T(P(c.a.x+18,c.a.y-58),1.6,90),opacity:1,offset:.4},{transform:T(P(c.a.x+18,c.a.y-58),.2,180),opacity:0}],700),flashScr('#ffffff',380,150),glow(c.s,'#ff9ed1'),rise(['💖','✨'],c.a,{n:8}));
    await all(pop('😎',P(c.b.x,c.b.y-12),{size:46,d:1100}),word('¡QUÉ BRILLO!',up(c.b,62),{color:'#fff',size:18,d:1000,delay:150}));
  },
  jornada:async c=>{await all(beam(c.a,c.b,{color:'#fff3a0',w:30,d:800}),flashScr('#fff7c0',500,200),cam(c,{z:1.08,d:800}));await all(burst('📜',c.b,{n:6,size:24}),word('¡APROBADA!',up(c.b,50),{color:'#9bd07d',size:24}));},
  huelga:async c=>{
    const W=$('#field').clientWidth,y=c.b.y+22;SND.sfx('whistle');
    const tr=mk('<span style="white-space:nowrap">🪧✊📣🪧✊🪧📣✊🪧</span>',30);
    await all(run(tr,[{transform:`translate(${-W*1.1}px,${y}px) translate(0,-50%)`,opacity:1},{transform:`translate(${W*1.05}px,${y}px) translate(0,-50%)`,opacity:1}],1700,{ease:'linear'}),
      (async()=>{await sleep(500);SND.sfx('whistle');await sleep(400);SND.sfx('chant');})(),
      word('¡HUELGA!',up(c.b,60),{color:'#e5533d',size:30,d:1300,delay:300}),shake(900,5));
    await all(orbit('🪧',up(c.b,10),{r:52,d:1000}),orbit('✊',up(c.b,10),{r:52,d:1000,phase:Math.PI*2/3}),orbit('📣',up(c.b,10),{r:52,d:1000,phase:Math.PI*4/3}));
  },
  maletero:async c=>{await all(pop('🚘',c.a,{size:76,d:1000}),sprA(c.s,[{opacity:1},{opacity:0,offset:.2},{opacity:0,offset:.8},{opacity:1}],1000),ring(c.a,{color:'#ad9ff3',delay:200}));},
  referendum:async c=>{const f=$('#field');REFC&&REFC.remove();REFC=document.createElement('div');REFC.className='refbox';REFC.innerHTML='🗳️ SÍ: <b>0%</b>';f.appendChild(REFC);REFC.style.left=Math.max(6,Math.min(f.clientWidth-130,c.b.x-140))+'px';REFC.style.top=Math.max(6,c.b.y-30)+'px';await all(pop('🥡',up(c.b,56),{size:44,d:800}),word('URNA DE TÁPER',up(c.b,96),{size:16,d:900}));},
  proces:async c=>{
    const W=$('#field').clientWidth,H=$('#field').clientHeight;SND.sfx('printer');
    const ban=mk('<div style="background:#fff;border:3px solid #1c1a24;border-radius:4px;padding:6px 10px;font:900 18px/1 system-ui;color:#c9302c;white-space:nowrap;box-shadow:3px 4px 0 #0007">PROCÉS · PROCÉS · PROCÉS · PROCÉS · PROCÉS · PROCÉS · PROCÉS · PROCÉS · PROCÉS · PROCÉS</div>',18);
    const y=(c.a.y+c.b.y)/2;
    await all(ban.animate([{transform:`translate(${-W*1.6}px,${y}px) translate(0,-50%)`,opacity:1},{transform:`translate(${-W*.2}px,${y}px) translate(0,-50%)`,opacity:1,offset:.75},{transform:`translate(${-W*.1}px,${y}px) translate(0,-50%)`,opacity:0}],{duration:1800*FXS(),easing:'linear',fill:'forwards'}).finished.catch(()=>{}),
      word('…y sigue… y sigue…',P(W/2,y-40),{size:16,d:1400,delay:500}));
    await lunge(c,{dist:50});SND.sfx('slap');shake(300,6);await burst(['💥','📜'],c.b,{n:6,size:22,r:55});
  },
  segadors:async c=>{
    const W=$('#field').clientWidth,H=$('#field').clientHeight;
    const flag=document.createElement('div');flag.className='fxi';flag.style.cssText=`left:0;top:0;width:${W}px;height:${H}px;background:repeating-linear-gradient(180deg,#fcdd09 0 11.11%,#da121a 11.11% 22.22%);opacity:0`;$('#fx').appendChild(flag);
    flag.animate([{opacity:0,transform:'skewY(0deg)'},{opacity:.32,transform:'skewY(-3deg)',offset:.2},{opacity:.3,transform:'skewY(3deg)',offset:.6},{opacity:.26,transform:'skewY(-2deg)',offset:.85},{opacity:0,transform:'skewY(0deg)'}],{duration:3200*FXS(),fill:'forwards'});
    SND.sfx('segadors');
    const u=active(c.s);
    const tv=mk(`<div style="background:#1c1a24;border:4px solid #444;border-radius:10px;padding:4px;width:120px;box-shadow:0 4px 0 #0008"><div style="position:relative;background:#2a3550;border-radius:5px;overflow:hidden;height:82px"><img src="${IMG(u.p.id)}" style="width:100%;height:100%;object-fit:contain"><span style="position:absolute;left:4px;top:4px;background:#e5333d;color:#fff;font:800 8px/1 system-ui;padding:2px 4px;border-radius:3px">● EN DIRECTO</span></div><div style="color:#ffd36b;font:800 9px/1.2 system-ui;text-align:center;margin-top:3px">DESDE WATERLOO</div></div>`,12);
    const tp=P(Math.min(W-70,Math.max(70,c.a.x)),Math.max(60,c.a.y-90));
    await tv.animate([{transform:T(tp,.2,0),opacity:0},{transform:T(tp,1,-3),opacity:1}],{duration:350*FXS(),fill:'forwards'}).finished.catch(()=>{});
    await all(word('🎵 Bon cop de…',P(W/2,H*.16),{color:'#fcdd09',size:20,d:1400,rot:-3}),sprA(c.s,[{transform:'none'},{transform:'translateY(-6px)'},{transform:'none'},{transform:'translateY(-6px)'},{transform:'none'}],1400));
    const sk='<svg width="46" height="46" viewBox="0 0 46 46"><path d="M8 38 C 4 16, 26 2, 42 10 C 30 8, 14 18, 16 36 Z" fill="#d9dde6" stroke="#1c1a24" stroke-width="2.5" stroke-linejoin="round"/><rect x="5" y="34" width="7" height="12" rx="2" fill="#8a5a2b" stroke="#1c1a24" stroke-width="2" transform="rotate(-20 8 40)"/></svg>';
    const ss=[0,1,2].map(i=>fly(sk,P(W*(.2+i*.3),-30),P(c.b.x+(i-1)*18,c.b.y-6),{d:520,size:16,spin:720,delay:i*140,ease:'ease-in'}));
    await all(...ss,word('¡FALÇ!',up(c.b,60),{color:'#fcdd09',size:30,d:900,delay:420}));
    SND.sfx('slap');shake(420,10);flashScr('#fcdd09',220);
    await all(burst(['✨','💥'],c.b,{n:7,size:22,r:60}),tv.animate([{opacity:1},{opacity:0}],{duration:300*FXS(),fill:'forwards'}).finished.catch(()=>{}));
  },
  caganer:async c=>{await all(fly('💩',c.a,P(c.b.x+40,c.b.y+40),{d:700,arc:90,size:30,spin:360,ease:'ease-out'}),word('¡Bon Nadal!',up(c.a,58),{size:20,d:900}));},
  independencia:async c=>{await all(letterbox(1700),word('¡INDEPENDENCIA!',P((c.a.x+c.b.x)/2,(c.a.y+c.b.y)/2),{size:26,d:1300,rot:-4}));await all(lunge(c,{dist:70,d:420}),cam(c,{z:1.08,d:500}));shake(500,10);await burst(['💥','🎆'],c.b,{n:8,size:26});},
  zasca:[async c=>{await fly('👋',c.a,c.b,{d:280,size:46,ease:'ease-in'});await all(word('¡ZASCA!',up(c.b,40),{color:'#67a9f2',size:36}),flashScr('#ffffff',200),shake(350,10));},
    async c=>{await fly('🩴',c.a,c.b,{d:380,size:44,spin:900,arc:60,ease:'ease-in'});SND.sfx('slap');await all(word('¡ZASCA!',up(c.b,40),{color:'#67a9f2',size:36}),flashScr('#ffffff',200),shake(350,10),burst('⭐',c.b,{n:5,size:20}));},
    async c=>{await pop('🎤',up(c.a,62),{size:40,d:500});await fly('🎤',up(c.a,62),up(c.b,10),{d:500,size:40,arc:-120,spin:540,ease:'ease-in'});SND.sfx('thud');await all(word('MIC DROP',up(c.b,46),{color:'#67a9f2',size:28}),shake(400,10),burst('💥',c.b,{n:5,size:24}));}],
  tuit3am:async c=>{
    const bk=document.createElement('div');bk.className='fxflash';bk.style.background='radial-gradient(circle at 20% 15%,#2a3a7a,#04060f 70%)';bk.style.opacity='0';$('#fx').appendChild(bk);
    await bk.animate([{opacity:0},{opacity:.92}],{duration:400*FXS(),fill:'forwards'}).finished.catch(()=>{});
    const W=$('#field').clientWidth;rain('⭐',P(W/2,40),{n:6,size:12,spread:W*.9,h:20,d:1800,stagger:60});pop('🌙',P(W*.15,34),{size:30,d:2200});
    const ph=up(c.a,62);SND.sfx('blipbeep');
    await all(pop('<span style="filter:drop-shadow(0 0 12px #9cf)">📱</span>',ph,{size:42,d:1300}),word('• • •',up(c.a,104),{color:'#cfe6ff',size:20,d:1100,delay:200,rot:0}));
    const u=active(c.s);
    const card=mk(`<div class="tcard"><div class="h"><img src="${IMG(u.p.id)}"><span>${esc(u.name)} <i>· 3:07</i></span></div><p>${esc(TWEETS[rnd(TWEETS.length)])}</p><div class="k"><span>💬 <b class="r">0</b></span><span>🔁 <b class="rt">0</b></span><span>❤️ <b class="lk">0</b></span></div></div>`,13);
    const at=P(Math.min($('#field').clientWidth-100,Math.max(100,c.b.x)),c.b.y-10);SND.sfx('tweet');
    card.animate([{transform:T(c.a,.2,-20),opacity:1},{transform:T(at,1.05,4),opacity:1}],{duration:450*FXS(),easing:'ease-in',fill:'forwards'});
    await sleep(450);SND.sfx('hitS');shake(300,6);
    const lk=card.querySelector('.lk'),rt=card.querySelector('.rt'),rr=card.querySelector('.r');
    for(let i=1;i<=12;i++){lk.textContent=(i<6?i*173:((i*i*0.41).toFixed(1)+'K'));rt.textContent=i<6?i*41:((i*0.9).toFixed(1)+'K');rr.textContent=i*37;if(i%3===0)SND.sfx('blip');await sleep(55);}
    await sleep(300);card.animate([{opacity:1},{opacity:0}],{duration:250*FXS(),fill:'forwards'});
    await bk.animate([{opacity:.92},{opacity:0}],{duration:350*FXS(),fill:'forwards'}).finished.catch(()=>{});
  },
  impresora:async c=>{SND.sfx('printer');await all(pop('🖨️',up(c.a,62),{size:52,d:900}),word('BRRRT',up(c.a,100),{color:'#ffffff',size:22,d:800,delay:150}),sprA(c.s,[{transform:'none'},{transform:'translateX(-4px)'},{transform:'translateX(4px)'},{transform:'translateX(-4px)'},{transform:'none'}],500));},
  captura:async c=>{await pop('📸',P(c.a.x+20,c.a.y-40),{size:36,d:500});await all(flashScr('#ffffff',300),rain('❄️',c.b,{n:7,size:22,h:90}),tint(c.t,'hue-rotate(170deg) brightness(1.25)',900));},
  alcalde:async c=>{await all(orbit('🏛️',c.b,{phase:0}),orbit('🏘️',c.b,{phase:Math.PI}),word('¿?',up(c.b,60),{size:34,delay:300}),sprA(c.t,[{transform:'none'},{transform:'rotate(-12deg)'},{transform:'rotate(12deg)'},{transform:'rotate(-6deg)'},{transform:'none'}],1100));},
  vecino:async c=>{await word('¿Peor? ¿Mejor?',up(c.b,62),{size:20,d:800});await all(zigzag(P(c.b.x-30,c.b.y-110),c.b,{d:400}),zigzag(P(c.b.x+30,c.b.y-110),c.b,{d:400,delay:150}),zigzag(P(c.b.x,c.b.y-120),c.b,{d:400,delay:300}),flashScr('#fff3a0',260,250));},
  plasma:async c=>{await pop('📺',c.a,{size:30,d:400});await all(fly('🌪️',c.a,c.b,{d:600,size:34,spin:360}),tint(c.t,'grayscale(1) contrast(2.2)',900,350),burst('📡',c.b,{n:4,size:20,delay:450}));},
  rescate:async c=>{await all(rain(['💶','💵','💶'],P(c.a.x,c.a.y),{n:12,size:24,spread:180,stagger:50,h:160}),word('¡RESCATE!',up(c.a,64),{size:26,d:1100}),glow(c.s,'#7dff9a',1100));},
  flotilla:async c=>{const f=$('#field');seaOn();
    await all(letterbox(3000),word('LA FLOTILLA',P(f.clientWidth/2,f.clientHeight*.3),{color:'#5bc0ff',size:30,d:1500,rot:-3}),
      fleet(popa(c),c.b,{d:1700,delay:150}),
      rain('🌊',rumbo(c),{n:8,size:22,spread:220,h:30,stagger:130,d:700,delay:200}),
      sleep(1750).then(()=>all(shake(650,14),flashScr('#cdeeff',380),burst(['🌊','💦','⛵'],c.b,{n:12,r:95,size:30,d:900}),
        ring(c.b,{color:'#5bc0ff',size:70,d:800}),ring(c.b,{color:'#ffffff',size:40,d:800,delay:150}),
        word('¡TIERRA A LA VISTA!',clampX(P(c.b.x,c.b.y+78)),{color:'#ffe066',size:22,d:1100}))));},
  desahucios:async c=>{await all(pop('🪧',up(c.a,40),{size:70,d:900}),word('STOP DESAHUCIOS',up(c.a,90),{color:'#7dbb62',size:20,d:1100}),letterbox(1200));await all(lunge(c,{dist:70}),shake(500,10));await burst(['📢','✊'],c.b,{n:6,size:24});},
  lucha:async c=>{await all(pop('🚩',up(c.a,58),{size:40,d:700}),glow(c.t,'#e5533d',600));await all(fly('✊',c.b,P(c.b.x,c.b.y-60),{d:300,size:30,ease:'ease-out'}));await all(fly('🔧',c.a,c.b,{d:420,size:36,spin:540}),lunge(c,{dist:50}));await all(burst('💥',c.b,{n:5}),shake(400,8));},
  alquiler:async c=>{await all(pop('🏷️',up(c.a,58),{size:44,d:900}),word('TOPE',up(c.a,20),{color:'#7dbb62',size:30,d:1000}),ring(c.a,{color:'#7dbb62'}));},
  parlem:async c=>{await all(rain('🏳️',c.b,{n:7,size:26,spread:120,h:140}),pop('🪑',P(c.b.x-34,c.b.y+20),{size:34,d:1100}),pop('🪑',P(c.b.x+34,c.b.y+20),{size:34,d:1100,delay:150}),word('Parlem?',up(c.b,62),{size:22,d:1000}));},
  cambio:async c=>{await all(fly('💚',c.a,c.b,{d:800,size:34,arc:60,spin:360}),fly('💔',c.b,c.a,{d:800,size:34,arc:-60,spin:-360}),word('¡CAMBIO!',P((c.a.x+c.b.x)/2,(c.a.y+c.b.y)/2),{color:'#e5533d',size:30,d:1000}),sprA(c.s,[{transform:'none'},{transform:'rotateY(180deg)'},{transform:'none'}],800),sprA(c.t,[{transform:'none'},{transform:'rotateY(180deg)'},{transform:'none'}],800));},
  otan:async c=>{
    const at=side(c,40);SND.sfx('flip');
    const sg=mk('<div class="otsign" style="background:#e5333d">NO</div>',16),d=sg.querySelector('.otsign');
    sg.animate([{transform:T(at,.2,0),opacity:0},{transform:T(at,1,0),opacity:1}],{duration:300*FXS(),fill:'forwards'});
    word('DE ENTRADA…',up(c.a,70),{size:20,d:1100});await sleep(1000);
    await d.animate([{transform:'rotateY(0)'},{transform:'rotateY(90deg)'}],{duration:180*FXS(),fill:'forwards'}).finished.catch(()=>{});
    d.textContent='SÍ';d.style.background='#2f8f49';SND.sfx('ding');
    await d.animate([{transform:'rotateY(90deg)'},{transform:'rotateY(0)'}],{duration:180*FXS(),fill:'forwards'}).finished.catch(()=>{});
    await all(word('…SÍ',up(c.a,70),{color:'#7dff9a',size:24,d:900}),pop('🛡️',side(c,40),{size:60,d:900,delay:200}),ring(c.a,{color:'#4a6fd1'}));
  },
  isidoro:async c=>{await all(pop('🕶️',up(c.a,30),{size:46,d:800}),rise('💨',c.a,{n:6,size:24}),word('ISIDORO',up(c.a,66),{color:'#cfc8de',size:24,d:900}),sprA(c.s,[{opacity:1},{opacity:.2},{opacity:.42}],800));},
  giratoria:async c=>{await all(pop('🚪',side(c,44),{size:60,d:900}),sprA(c.s,[{transform:'none'},{transform:'rotateY(360deg)'},{transform:'rotateY(720deg)'}],900));await all(pop('💼',up(c.a,58),{size:36,d:700}),fly('💶',c.b,c.a,{d:600,size:24,arc:30}),fly('💶',c.b,c.a,{d:600,size:24,arc:-20,delay:120}),lunge(c,{dist:50}));await burst('💥',c.b,{n:5});},
  rosa:async c=>{await all(fly('✊',c.a,c.b,{d:420,size:44}),fly('🌹',c.a,c.b,{d:500,size:36,arc:50,spin:360,delay:80}),lunge(c,{dist:70}),cam(c,{z:1.08,d:600}));await all(ring(c.b,{color:'#e5533d',size:50}),burst(['🌹','💥'],c.b,{n:8,size:26}),shake(500,10));},
  ave:async c=>{const f=$('#field');SND.sfx('whistle');await letterbox(300);const y=c.b.y+10;const tr=mk('🚄🚃🚃🚃🚃',46);await all(letterbox(1500),run(tr,[{transform:`translate(${f.clientWidth*1.05}px,${y}px) translate(0,-50%)`,opacity:1},{transform:`translate(${-f.clientWidth*1.4}px,${y}px) translate(0,-50%)`,opacity:1}],1100,{ease:'linear'}),sleep(450).then(()=>all(shake(700,14),flashScr('#ffffff',300),burst(['💥','💨'],c.b,{n:10,size:30,r:80}))));word('MADRID–SEVILLA',up(c.b,70),{size:22,d:900});await sleep(400);},
  votos:async c=>{await all(word('10.000.000',up(c.b,70),{color:'#e5533d',size:28,d:1400}),rain(['🗳️','📄','🌹'],c.b,{n:14,size:24,spread:160,stagger:40,h:180}));},
  hijo:async c=>{const f=$('#field');await all(rise(['🙋','📣','🙌','💃'],P(f.clientWidth/2,f.clientHeight-30),{n:16,size:30,spread:f.clientWidth,stagger:50,d:1200}),...['¡Felipe!','¡Capullo!','¡Queremos un hijo tuyo!'].map((w,i)=>word(w,P(f.clientWidth/2+(i-1)*40,60+i*50),{color:'#e5533d',size:i===2?20:24,d:900,delay:i*350,rot:(i-1)*6})));await all(...[0,1,2,3,4].map(i=>fly('💘',c.a,c.b,{d:600,size:24,arc:(i-2)*25,delay:i*80})));await tint(c.t,'hue-rotate(300deg) saturate(2)',700);},
  pataleta:async c=>{for(let i=0;i<3;i++){burst('🦶',c.b,{n:2,size:24,r:30,d:300});await lunge(c,{dist:30,d:220});}}
};
const PERHIT={votos:c=>burst(['🗳️','📄'],c.b,{n:3,size:20,r:40,d:350}),referendum:c=>{if(REFC){const b=REFC.querySelector('b');const v=Math.min(91,(parseInt(b.textContent)||0)+12+rnd(14));b.textContent=v+'%';REFC.animate([{transform:'scale(1.2)'},{transform:'none'}],{duration:200});}SND.sfx('blipbeep');return all(fly('📄',up(c.a,30),up(c.b,40),{d:320,size:22,arc:50,spin:120}),burst('🗳️',c.b,{n:3,size:20,r:36,d:350,delay:250}));},impresora:c=>{SND.sfx('brrt');return fly(`<div class="folio">${esc(FOLIOS[rnd(FOLIOS.length)])}</div>`,up(c.a,40),P(c.b.x+(Math.random()-.5)*30,c.b.y-10),{d:420,size:12,spin:(Math.random()<.5?-1:1)*200,arc:40,ease:'ease-in'});}};
const FXC={
  flotilla:async c=>{SND.sfx('horn');const dir=c.b.x>c.a.x?1:-1;seaOn();await all(press(c.a),pop('⛵',P(c.a.x+dir*58,c.a.y+26),{size:54,d:1500}),word('¡ZARPAMOS!',clampX(up(c.a,84)),{color:'#5bc0ff',size:28,d:1400}),rise('📢',c.a,{n:3,spread:90,size:20}));},
  jornada:async c=>{await pop('📜',up(c.a,60),{size:40,d:700});await pop('🏛️',P(c.a.x+44,c.a.y-40),{size:30,d:700});}
};
function crowd(){const c=$('#crowd');if(!c||RM)return;c.classList.remove('cheer');void c.offsetWidth;c.classList.add('cheer');}
async function legendIntro(s){
  SND.sfx('legend');preloadRetro();$('#stage').classList.add('spot');setTimeout(()=>$('#stage').classList.remove('spot'),3200*FXS());
  const el=$('#sp'+s),row=el.closest('.row');
  const reveal=()=>{if(!el.classList.contains('prelegend'))return;el.classList.remove('prelegend','in');void el.offsetWidth;el.classList.add('in');};
  row.style.zIndex='7';
  await fxRun(async c=>{
    setTimeout(()=>{reveal();SND.sfx('thud');},650*FXS());
    const bk=document.createElement('div');bk.className='fxflash';bk.style.background='#000';bk.style.opacity='0';$('#fx').appendChild(bk);
    await run(bk,[{opacity:0},{opacity:.92}],300,{ease:'linear'});bk.style.opacity='.92';
    const cd=document.createElement('div');cd.className='legcard';cd.innerHTML=`<small>¡APARECE UN LEGENDARIO!</small><b>${esc(active(s).name)}</b>`;cd.style.opacity='0';$('#fx').appendChild(cd);
    await all(zigzag(P(c.a.x-20,0),c.a,{d:500,w:6}),zigzag(P(c.a.x+30,0),c.a,{d:500,w:4,delay:150}),flashScr('#ffffff',300,100),run(cd,[{opacity:0,transform:'translate(-50%,-50%) scale(.4)'},{opacity:1,transform:'translate(-50%,-50%) scale(1.1)',offset:.15},{opacity:1,transform:'translate(-50%,-50%) scale(1)',offset:.85},{opacity:0,transform:'translate(-50%,-50%) scale(1)'}],2000,{ease:'ease-out'}),glow(c.s,'#ffd34d',2000),rise(['✨','⭐'],c.a,{n:10,size:20,spread:120,stagger:120}));
    await run(bk,[{opacity:.92},{opacity:0}],350,{ease:'linear'});
  },s);
  reveal();row.style.zIndex='';
}
async function fxMenas(c,bulo){
  const W=$('#field').clientWidth,cx=x=>Math.min(W-98,Math.max(98,x));
  const ang=Math.atan2(c.b.y-c.a.y,c.b.x-c.a.x)*180/Math.PI,mid=P(c.a.x+(c.b.x-c.a.x)*.45,c.a.y+(c.b.y-c.a.y)*.45);
  SND.sfx('whoosh');lunge(c,{dist:26,d:320});
  run(mk('👉',34),[{transform:T(c.a,.3,ang),opacity:1},{transform:T(mid,2.3,ang),opacity:1,offset:.3},{transform:T(mid,2.3,ang),opacity:1,offset:.8},{transform:T(mid,2.5,ang),opacity:0}],1100,{ease:'ease-out'});
  await sleep(380);
  const at=P(cx(c.b.x),c.b.y-14);
  const el=mk('<div class="cartel"><small>UN MENA COBRA</small><b>0 €</b><i>AL MES</i></div>',16);const num=el.querySelector('b');
  el.animate([{transform:T(P(at.x,at.y-200),1,-14),opacity:1},{transform:T(at,1.05,3),opacity:1,offset:.7},{transform:T(at,1,-2),opacity:1}],{duration:480*FXS(),easing:'ease-in',fill:'forwards'});
  await sleep(330);SND.sfx('thud');shake(260,5);await sleep(200);
  const fmt=n=>String(n).replace(/\B(?=(\d{3})+(?!\d))/g,'.')+' €';
  const setN=t=>{num.textContent=t;num.style.fontSize=Math.min(22,240/Math.max(6,t.length))+'px';};
  const seq=[4700,38912,612450,7304118,93000000,4700000000000];
  const steps=bulo?3:seq.length;
  for(let i=0;i<steps;i++){
    const len=String(seq[i]).length;
    for(let k=0;k<5;k++){setN(fmt(Math.floor(10**(len-1)*(1+Math.random()*8.9))));SND.sfx('blipbeep');await sleep(45);}
    setN(fmt(seq[i]));SND.sfx('coin');shake(200,2+i*1.6);
    el.animate([{transform:T(at,1.12,-2)},{transform:T(at,1,-2)}],{duration:200*FXS(),fill:'forwards'});
    await sleep(i===0?520:330);
  }
  if(!bulo){
    for(let k=0;k<6;k++){setN(fmt(Math.floor(Math.random()*9e15)));SND.sfx('blipbeep');await sleep(40);}
    setN('∞ €');SND.sfx('coins');SND.sfx('fanfare');flashScr('#7dff6a',360);shake(520,10);
    el.animate([{transform:T(at,1,-2)},{transform:T(at,1.25,4),offset:.3},{transform:T(at,1.15,-3)}],{duration:420*FXS(),fill:'forwards'});
    await all(rain(['💸','🪙','💶','💰'],c.b,{n:14,spread:170,size:26,h:200,stagger:45,d:800}),burst(['💸','🪙'],c.b,{n:8,r:85,size:24,d:800,delay:250}),word('¡JACKPOT!',P(at.x,at.y+58),{color:'#7dff6a',size:24,d:1100,delay:150}));
    flash(1-c.s);
    await el.animate([{opacity:1},{opacity:0}],{duration:250*FXS(),fill:'forwards'}).finished.catch(()=>{});
  }else{
    SND.sfx('static');num.classList.add('err');
    for(let k=0;k<7;k++){setN(['#&%@!? €','9̷9̴9̵.̸?? €','NaN €','4.7?0.##0 €','¿¿¿ €','█▓▒░ €','ERROR'][k]);el.animate([{transform:T(P(at.x+(Math.random()-.5)*10,at.y),1,-2+(Math.random()-.5)*8)}],{duration:60,fill:'forwards'});await sleep(70);}
    await sleep(180);
    SND.sfx('thud');shake(420,9);
    await run(mk('<span class="stamp" style="font-size:46px;padding:2px 16px;border-width:6px;background:#fffc">BULO</span>',46),[{transform:T(at,3.2,-16),opacity:0},{transform:T(at,1,-12),opacity:1,offset:.18},{transform:T(at,1.05,-12),opacity:1,offset:.3},{transform:T(at,1,-12),opacity:1,offset:.88},{transform:T(at,1,-12),opacity:0}],1100,{ease:'ease-in'});
    SND.sfx('sad');
    el.animate([{opacity:1},{opacity:0}],{duration:200*FXS(),fill:'forwards'});
    await all(...[0,1,2,3,4,5].map(i=>fly(i%2?'📄':'💸',P(at.x+(i-2.5)*22,at.y),c.a,{d:520,size:24,arc:30+i*8,spin:i%2?260:-260,delay:i*60,ease:'ease-in'})),
      (async()=>{await sleep(420);flash(c.s);await tint(c.s,'hue-rotate(-30deg) saturate(1.8) brightness(.9)',600);})());
  }
}
const FX_CONFUSED=async c=>{await all(orbit('💫',up(c.a,40),{r:30,size:20}),orbit('⭐',up(c.a,40),{r:30,size:18,phase:Math.PI}),sprA(c.s,[{transform:'none'},{transform:'rotate(-14deg)'},{transform:'rotate(14deg)'},{transform:'none'}],700),flashScr('#c79bff',300));};
async function fxCoin(c,heads){SND.sfx('coin');await run(mk('🪙',44),[{transform:T(up(c.a,30),1)+' scaleX(1)',opacity:1},{transform:T(up(c.a,110),1.2)+' scaleX(-1)',opacity:1,offset:.25},{transform:T(up(c.a,140),1.2)+' scaleX(1)',opacity:1,offset:.5},{transform:T(up(c.a,110),1.2)+' scaleX(-1)',opacity:1,offset:.75},{transform:T(up(c.a,70),1.3)+' scaleX(1)',opacity:1}],1100,{ease:'linear'});await word(heads?'¡CARA!':'¡CRUZ!',up(c.a,70),{color:heads?'#ecc659':'#e5533d',size:30,d:900});}
async function fxVote(c,vetoed){
  const v=document.createElement('div');v.className='vote';v.innerHTML='<b>Votación en el Congreso</b><div class="seats">'+'<i></i>'.repeat(27)+'</div>';$('#fx').appendChild(v);
  const seats=[...v.querySelectorAll('i')];const yes=vetoed?11:17;const order=shuffle(seats.map((_,i)=>i));
  for(let k=0;k<order.length;k++){seats[order[k]].className=k<yes?'y':'n';if(k%3===0)SND.sfx('blipbeep');await sleep(45);}
  SND.sfx(vetoed?'sad':'superE');
  await sleep(250);v.querySelector('b').textContent=vetoed?'TUMBADA':'APROBADA';v.querySelector('b').style.color=vetoed?'#e5533d':'#2f8f49';
  await sleep(700);v.remove();
}
async function fxSuspend(c){const el=mk('<span class="fxw" style="font-size:44px">1</span>',44);el.style.opacity='1';el.style.transform=T(up(c.b,60));for(let i=1;i<=8;i++){el.firstChild.textContent=i;SND.sfx('blipbeep');await sleep(110);}el.remove();SND.sfx('sad');await stamp('SUSPENDIDA',up(c.b,20));}
async function fxRun(fn,s,extra){
  if(!fn||RM||SPEED===0)return;
  const c={a:ctr(s),b:ctr(1-s),s,t:1-s,...(extra||{})};
  try{await fn(c);}catch(e){console.error(e);}
  $('#fx').innerHTML='';document.querySelectorAll('.fxsea').forEach(e=>e.remove());
}
const playFX=(id,s)=>{SND.move(id);const f=FX[id];return fxRun(Array.isArray(f)?f[rnd(f.length)]:f,s);};
const applaud=s=>{SND.sfx('applause');return fxRun(async c=>{await all(rise('👏',c.a,{n:6,size:22,spread:130,stagger:50,d:800}),word('¡OLÉ!',up(c.a,62),{size:24,d:700}));},s);};
const booed=s=>{SND.sfx('boo');return fxRun(async c=>{await all(burst('👎',c.a,{n:6,size:22,r:50}),word('¡BUUU!',up(c.a,60),{color:'#e5533d',size:26,d:700}));},s);};


