'use strict';
/* =====================================================================
   MOTOR DE COMBATE: estadísticas, daño, turnos, estados, cambios y KO.
   ===================================================================== */

const ABORTERR=new Error('abort');
let ABORT=false, skipFn=null, SPEED=1;
const MODES={normal:{lbl:'⏩ Normal',type:26,read:1},fast:{lbl:'⏩⏩ Rápido',type:10,read:.5},tap:{lbl:'👆 A mi ritmo',type:26,read:0}};
let MODE='normal';try{const m=localStorage.getItem(KEY('ritmo'));if(MODES[m])MODE=m;}catch(_){}
let B=null;
function makeMon(id,side){const p=POLBY[id];const st=calcStats(p.base);
  return{p,side,name:p.short,types:p.types.slice(),max:st.hp,hp:st.hp,st,moves:p.moves.map(m=>({id:m,pp:MOVES[m].pp})),status:null,slp:0,stages:{atk:0,def:0,spa:0,spd:0,spe:0},vol:{},fainted:false};}
const active=s=>B.teams[s][B.act[s]];
const label=m=>m.side===1?`${m.name} (rival)`:m.name;
const isAway=m=>m.vol.away!==undefined;
function mult(s){return s>=0?(2+s)/2:2/(2-s);}
function stat(m,k,critMode){let s=m.stages[k];if(critMode==='atk'&&s<0)s=0;if(critMode==='def'&&s>0)s=0;let v=m.st[k]*mult(s);if(k==='spe'&&m.status==='par')v*=.5;return v;}
function hurt(m,d){if(d>0&&m.hp>0&&m.hp-d<=0&&m.p.ability==='robustez'&&!m.resisted){m.hp=1;m.resisted=true;m.resistPending=true;return;}m.hp=Math.max(0,m.hp-d);}
function heal(m,d){m.hp=Math.min(m.max,m.hp+d);}
function cancelCharge(u){if(u.vol.charging)u.vol.charging=null;}
function calcDamage(u,t,mv,crit,rand){
  let power=mv.power;
  if(mv.eruption)power=Math.max(1,Math.floor(mv.power*u.hp/u.max));
  const pin=PINCH[u.p.ability];if(pin&&pin===mv.type&&u.hp<=u.max/3)power*=1.5;
  if(u.vol&&u.vol.drunk)power*=1.3;
  const phys=mv.cat==='P';
  const A=mv.foul?stat(t,'atk',crit?'atk':null):stat(u,phys?'atk':'spa',crit?'atk':null),D=stat(t,phys?'def':'spd',crit?'def':null);
  let d=Math.floor(Math.floor(Math.floor(2*LV/5+2)*power*A/D)/50)+2;
  if(B&&B.field.w==='rain'){if(mv.type==='tui')d=Math.floor(d*1.3);else if(mv.type==='cas')d=Math.floor(d*.5);}
  if(B&&B.field.w==='sun'){if(mv.type==='cas')d=Math.floor(d*1.3);else if(mv.type==='tui')d=Math.floor(d*.5);}
  if(crit)d=Math.floor(d*1.5);
  d=Math.floor(d*rand);
  if(mv.type&&u.types.includes(mv.type))d=Math.floor(d*1.5);
  d=Math.floor(d*eff(mv.type,t.types));
  if(phys&&u.status==='brn')d=Math.floor(d*.5);
  if(u!==t&&RIV[rivKey(u.p.id,t.p.id)])d=Math.floor(d*1.2);
  if(mv.vsPP&&PP_IDS.has(t.p.id))d=d*2;
  if(u!==t&&B&&B.sides[u.side]&&B.sides[u.side].publico>0&&u.p.id==='abascal')d=Math.floor(d*1.3);
  if(u.pana&&u!==t)d=Math.floor(d*1.5);
  return Math.max(1,d);
}
function accuracyOK(s,mv){
  const tt=active(1-s);if(tt&&tt.vol.isidoro>0&&Math.random()<.5)return false;
  if(!mv.acc)return true;
  if(B.field.w==='rain'&&mv.type==='gal')return true;
  let acc=mv.acc;if(B.sides[1-s].publico>0)acc-=10;
  return Math.random()*100<acc;
}

async function boost(m,b,src,abil){
  for(const[k,v]of Object.entries(b)){
    const cur=m.stages[k],nv=Math.max(-6,Math.min(6,cur+v));
    if(nv===cur){await say(`${ART[k]==='el'?'El':'La'} ${SN[k]} de ${label(m)} no puede ${v>0?'subir':'bajar'} más.`);continue;}
    m.stages[k]=nv;SND.sfx(v>0?'up':'down');const amt=Math.abs(nv-cur);const pre=abil?abil+': ':'';
    await say(`${pre}${v>0?(amt>1?'¡Sube mucho':'Sube'):(amt>1?'¡Baja mucho':'Baja')} ${ART[k]} ${SN[k]} de ${label(m)}${amt>1?'!':'.'}`);
    if(v<0&&src&&src!==m&&m.p.ability==='competitivo'&&m.hp>0)await boost(m,{spa:2},null,'Abucheo de Vicálvaro');
  }
}
function immuneTo(t,st){return(st==='par'&&t.types.includes('gal'))||(st==='brn'&&t.types.includes('cas'))||(st==='frz'&&t.types.includes('hem'));}
async function inflict(t,st){
  if(t.status||immuneTo(t,st))return false;
  t.status=st;SND.sfx(st==='par'?'zap':st==='brn'?'fire':'ice');
  if(st==='par')await say(`${label(t)} se queda en blanco. Puede que no reaccione.`);
  if(st==='brn')await say(`${label(t)} se ha quemado.`);
  if(st==='frz')await say(`${label(t)} se queda de piedra.`);
  return true;
}
async function confuse(t){if(t.vol.confuse)return false;if(t.vol.drunk){await say(`A ${label(t)} le da todo igual: ya va mareada de serie.`);return false;}SND.sfx('wobble');t.vol.confuse=2+rnd(4);if(t===active(t.side))fxRun(c=>all(orbit('⭐',up(c.a,46),{r:30,d:1300,turns:2}),orbit('⭐',up(c.a,46),{r:30,d:1300,turns:2,phase:Math.PI*2/3}),orbit('⭐',up(c.a,46),{r:30,d:1300,turns:2,phase:Math.PI*4/3})),t.side);await say(`${label(t)} se hace un lío.`,t.side===0?'Cuidado: tus botones ya no dicen la verdad.':null);return true;}
async function stepAside(m){
  if(m.p.ability==='regeneracion'&&!m.stepped&&m.hp>0&&m.hp<=m.max/2){m.stepped=true;heal(m,Math.floor(m.max/3));renderPlates();await say(`Paso al lado: ${label(m)} se aparta un momento y recupera PS.`);}
}

function actionPrio(s,a){const m=active(s);if(a.type!=='move')return 99;if(a.forced||a.struggle||a.away||a.vase)return 0;return MOVES[m.moves[a.idx].id]?.prio||0;}
async function runTurn(acts){
  const myB=B;const dead=()=>B!==myB||B.over;
  B.acted=new Set();
  for(const s of [0,1])if(acts[s].type==='switch'){await doSwitch(s,acts[s].idx,false);B.acted.add(s);await faintCheck();if(dead())return;}
  const movers=[0,1].filter(s=>acts[s].type==='move');
  const pr={};movers.forEach(s=>pr[s]=actionPrio(s,acts[s]));
  movers.sort((a,b)=>{if(pr[a]!==pr[b])return pr[b]-pr[a];const sa=stat(active(a),'spe'),sb=stat(active(b),'spe');if(sa!==sb)return sb-sa;return Math.random()-.5;});
  const start=[active(0),active(1)];
  for(const s of movers){
    if(dead())return;const u=active(s);if(u.hp<=0||u!==start[s])continue;
    await useMove(s,acts[s]);B.acted.add(s);
    await faintCheck();if(dead())return;
  }
  if(dead())return;
  await endTurn();
  await faintCheck();if(dead())return;
  await replaceFainted();
}
async function useMove(s,a){
  const u=active(s),t=active(1-s);let id;
  if(a.away){await say(`${label(u)} sigue de gira por España.`,'🚗 Ni rastro de él en el plató.');return;}
  if(a.vase||u.vol.vase>0){await say(`${label(u)} sigue siendo un jarrón chino.`,'Nadie sabe dónde ponerlo.');return;}
  if(u.vol.parlem){delete u.vol.parlem;cancelCharge(u);await say(`${label(u)} se sienta a dialogar y no ataca.`,'Parlem. 🏳️');return;}
  if(a.forced)id=u.vol.charging;
  else if(a.struggle)id='pataleta';
  else{const slot=u.moves[a.idx];id=slot.id;slot.pp=Math.max(0,slot.pp-(t.hp>0&&t.p.ability==='presion'?2:1));}
  if(u.status==='frz'){if(Math.random()<.2){u.status=null;await say(`${label(u)} reacciona por fin.`);}else{cancelCharge(u);await say(`${label(u)} sigue de piedra.`);return;}}
  if(u.status==='slp'){if(u.slp>0){u.slp--;cancelCharge(u);await say(`${label(u)} sigue de siesta. Zzz…`);return;}u.status=null;await say(`¡${label(u)} se despierta de la siesta!`);}
  if(u.vol.flinch){cancelCharge(u);await say(`${label(u)} se arruga y no responde.`);return;}
  if(u.vol.confuse){u.vol.confuse--;
    if(u.vol.confuse<=0){delete u.vol.confuse;await say(`${label(u)} sale del lío.`);}
    else{await say(`${label(u)} tiene un lío tremendo…`);
      if(Math.random()<1/3){cancelCharge(u);await fxRun(FX_CONFUSED,s);const d=calcDamage(u,u,{power:40,cat:'P',type:null},false,.85+Math.random()*.15);hurt(u,d);flash(s);await say('¡Se lía y se hace daño a sí mismo!',null,{tilt:true});return;}}}
  if(u.status==='par'&&Math.random()<.25){cancelCharge(u);await say(`${label(u)} se queda en blanco y no reacciona.`);return;}
  if(u.vol.drunk&&!a.forced&&!a.struggle){if(await drunkAct(s,a))return;}
  await execMove(s,id,!!a.forced);
}
async function execMove(s,id,forced){
  const u=active(s);let mv=MOVES[id];
  if(mv.proces){const ph=u.proces||0;mv={...mv,power:[50,80,140][ph],name:`Procés · fase ${ph+1}: ${['Consulta','Declaración','¡Independencia!'][ph]}`};}
  let firstCharge=mv.charge&&!forced;
  if(firstCharge&&mv.charge==='law'&&B.field.w==='sun')firstCharge=false;
  await say(`${label(u)} usa ${mv.name}.`,firstCharge?null:(u.vol.drunk&&mv.quip?slur(mv.quip,true)+' ¡Hic!':mv.quip),u.p.id==='rufian'?{tweet:true}:null);
  if(B.sides[s].publico>0&&u.p.id==='abascal'&&mv.cat!=='X')await applaud(s);
  if(B.sides[1-s].publico>0){await booed(s);if(u.p.ability==='competitivo'&&u.stages.spa<6){u.stages.spa++;await say('Abucheo de Vicálvaro: ¡los pitos le crecen!','Sube su Ataque Esp.');}}
  if(mv.eff&&mv.eff.kind==='copycat'){
    const lm=B.lastMove;
    if(!lm||NOCOPY.has(lm)){await playFX('m360',s);await say('¡Pero no hay nada que copiar!');return;}
    await playFX('m360',s);
    id=lm;mv=MOVES[id];await say(`Copia ${mv.name} y le pone otro nombre.`);
    firstCharge=mv.charge&&!(mv.charge==='law'&&B.field.w==='sun');
  }
  if(id!=='pataleta')B.lastMove=id;
  if(!(mv.eff&&mv.eff.kind==='protect'))u.vol.protectCount=0;
  if(!(mv.eff&&mv.eff.kind==='parlem'))u.vol.parlemCount=0;
  if(!(mv.eff&&mv.eff.kind==='otan'))u.vol.otanCount=0;
  if(mv.legend)await transformPana(s);
  if(firstCharge){u.vol.charging=id;await fxRun(FXC[id],s);await say(`${label(u)} ${mv.chargeMsg}`);return;}
  if(forced)u.vol.charging=null;
  if(mv.charge==='law'&&!forced&&B.field.w==='sun')await say('Con las terrazas abiertas, se vota sin esperar.');
  if(mv.cat==='X')return statusMove(s,mv,id);
  if(mv.proces){await attack(s,mv,id);if(B.over)return;u.proces=((u.proces||0)+1)%3;renderPlates();if(!u.proces&&u.hp>0)await say('…y vuelta a empezar.','🔁 El procés nunca se acaba.');return;}
  return attack(s,mv,id);
}
async function attack(s,mv,id){
  const u=active(s),t=active(1-s);
  if(t.hp<=0){await say('¡Pero no hay nadie enfrente!');return;}
  if(mv.breaks){const br=[];if(t.vol.protect){delete t.vol.protect;br.push('la protección');}if(t.vol.sub>0){delete t.vol.sub;br.push('el chalet');}if(t.vol.otan){t.vol.otan=false;delete t.vol.otanHit;br.push('el escudo de la OTAN');}if(br.length){renderPlates();SND.sfx('slap');await say(`¡La falç siega ${br.join(' y ')} de ${label(t)}!`);}}
  if(t.vol.protect){await say(`¡${label(t)} se ha protegido!`);return;}
  if(isAway(t)){await say(`¡${label(t)} está de gira! No hay nadie a quien atacar.`);return;}
  if(t.vol.vase>0){SND.sfx('lock');await say('El jarrón chino aguanta el golpe.','Tiene mucho valor, pero nadie sabe dónde ponerlo.');return;}
  if(!accuracyOK(s,mv)){await fxRun(fxMiss,s);await say('¡El argumento no ha llegado!');return;}
  const e=eff(mv.type,t.types);
  if(e===0){await say(`No le afecta a ${label(t)}. Ni se inmuta.`);return;}
  if(mv.coin){
    const heads=Math.random()<.5;await fxRun(c=>fxCoin(c,heads),s);
    if(!heads){heal(t,Math.floor(t.max/4));await say('¡Cruz! Al final le da la razón al rival.',`${label(t)} recupera PS.`);return;}
    await say('¡Cara! Esta vez sí que sí.');
  }
  if(mv.bulo){
    const isB=Math.random()<mv.bulo;await fxRun(c=>fxMenas(c,isB),s);
    if(isB){const d=Math.max(1,Math.floor(calcDamage(u,t,mv,false,.925)/4));hurt(u,d);flash(s);renderPlates();await say(`¡BULO! A ${label(u)} le rebota el cartel y pierde ${d} PS.`,'¡El chaval del cartel era una foto de banco de imágenes!');return;}
  }
  if(mv.veto){
    const vetoed=Math.random()<mv.veto;await fxRun(c=>fxVote(c,vetoed),s);
    if(vetoed){await say('¡El Congreso la tumba!','Habrá que volver a registrarla.');return;}
  }
  await playFX(id,s);
  const n=mv.multi===2?3+rnd(4):mv.multi?(r=>r<.35?2:r<.7?3:r<.85?4:5)(Math.random()):1;
  let total=0,hitSub=false,anyCrit=false,landed=0,capped=false,vaseNow=false,escaped=false;
  for(let i=0;i<n;i++){
    if(t.hp<=0)break;
    const crit=(id==='fruta'&&t.p.id==='sanchez')||u.vol.isidoro>0||Math.random()<1/24||(mv.highCrit&&Math.random()<1/4);
    let dmg=calcDamage(u,t,mv,crit,.85+Math.random()*.15);
    if(mv.multi&&PERHIT[id])fxRun(PERHIT[id],s);
    if(t.vol.sub>0&&!mv.sound){
      hitSub=true;SND.sfx('build');const d=Math.min(dmg,t.vol.sub);t.vol.sub-=d;total+=d;flash(1-s);
      if(t.vol.sub<=0){delete t.vol.sub;renderPlates();await say(`¡Se derrumba el chalet de ${label(t)}!`);}
    }else{
      if(t.vol.cap>0&&dmg>Math.floor(t.max/4)){dmg=Math.floor(t.max/4);capped=true;}
      if(t.p.ability==='jarron'&&!t.vased&&dmg>=t.hp){dmg=t.hp-1;vaseNow=true;}
      if(t.p.ability==='maletero'&&!t.trunkUsed&&dmg>=t.hp&&t.hp>0){t.trunkUsed=true;if(B.teams[1-s].some(m=>m!==t&&m.hp>0)){escaped=true;break;}await fxRun(c=>fxTrunk(c,false),1-s);await say('Llega el coche… ¡pero el maletero está lleno de urnas!',`${t.name} se ha quedado sin maletero.`);}
      SND.hit(mv.cat==='P',eff(mv.type,t.types),crit);
      const d=Math.min(dmg,t.hp);hurt(t,d);total+=d;u.dealtTot=(u.dealtTot||0)+d;t.vol.lastHitType=mv.type;
      if(t.vol.otan)t.vol.otanHit=(t.vol.otanHit||0)+d;
      if(t.hp<=0)B.lastKO={by:u,victim:t,move:mv.name};flash(1-s);if(!mv.multi&&t.hp>0)hitReact(1-s,mv,d>=t.max*.3);
      if(vaseNow||t.resistPending)break;
    }
    if(crit)anyCrit=true;landed++;renderPlates();
    if(mv.multi)await pause(330);
  }
  if(escaped){await trunkEscape(1-s);return;}
  if(!mv.multi)await pause(650);
  if(hitSub&&!mv.multi&&t.vol.sub>0)await say('¡El chalet recibe el golpe!');
  if(mv.multi)await say(id==='votos'?`¡${landed} lluvias de papeletas! ¡${(landed*1700000).toLocaleString('es-ES')} votos!`:`¡${landed} ${id==='impresora'?'folios':'urnas'} seguidos!`);
  if(REFC){const b=REFC.querySelector('b');b.textContent='92%';SND.sfx('applause');const r=REFC;REFC=null;setTimeout(()=>r.remove(),1600);}
  if(anyCrit&&!hitSub){SND.sfx('ooh');const ch=chyron();await say('¡Golpe crítico! Esto abre el telediario.');unchyron(ch);}
  if(!hitSub){if(e>1){await fxRun(fxSuper,s);await say('¡Es súper eficaz! El argumento ha calado.');}else if(e<1){await fxRun(fxWeak,s);await say('No es muy eficaz… nadie lo ha retuiteado.');}}
  if(id==='segadors'&&t.p.id==='abascal'&&t.hp>0)await say(`💬 ${label(t)}`,null,{bub:{s:1-s,m:t,line:'¡A por ellos!'}});
  if(vaseNow){t.vased=true;t.vol={vase:2};t.stages={atk:0,def:0,spa:0,spd:0,spe:0};SND.sfx('gong');await fxRun(c=>all(pop('🏺',c.b,{size:90,d:1100}),word('JARRÓN CHINO',up(c.b,70),{size:24,d:1200})),s);renderPlates();await say(`¡${label(t)} se convierte en un jarrón chino!`,'Tiene mucho valor, pero nadie sabe dónde ponerlo. Aguantará los golpes un par de turnos.');return;}
  if(capped){await fxRun(c=>stamp('¡TOPE!',c.b),s);await say('¡TOPE! No se le puede cobrar más.',`Limitar alquileres protege a ${label(t)}.`);}
  await resistCheck();
  if(!hitSub)await stepAside(t);
  if(!hitSub&&t.hp>0){
    if(mv.type==='cas'&&t.status==='frz'){t.status=null;await say(`${label(t)} reacciona por fin.`);}
    if(mv.sec&&Math.random()<mv.sec.chance)await inflict(t,mv.sec.status);
    if(mv.secVol&&Math.random()<mv.secVol.confuse)await confuse(t);
    if(mv.flinch&&!B.acted.has(1-s)&&Math.random()<mv.flinch)t.vol.flinch=true;
    if(mv.secTarget&&Math.random()<mv.secTarget.chance)await boost(t,{def:mv.secTarget.def},u);
    if(t.p.ability==='aguante')await boost(t,{def:1},null,'Aguante');
    if(mv.contact&&t.p.ability==='sindicalismo'&&u.hp>0&&!hitSub){const d=Math.max(1,Math.floor(u.max/8));hurt(u,d);SND.sfx('whistle');await fxRun(c=>burst('✊',c.a,{n:5,size:22,r:40}),s);flash(s);await say(`Sindicalismo: ${label(u)} se topa con un piquete.`,`Pierde ${d} PS.`);}
    if(mv.contact&&t.p.ability==='estatica'&&!u.status&&!u.types.includes('gal')&&Math.random()<.3){u.status='par';await say(`Niebla gallega: ${label(u)} se queda en blanco.`);}
  }
  if(t.vol.otan&&t.vol.otanHit>0&&t.hp>0&&u.hp>0){const r=Math.max(1,Math.floor(t.vol.otanHit*2*(t.pana?1.5:1)));t.vol.otan=false;SND.sfx('superE');await fxRun(c=>all(word('¡AHORA SÍ!',up(c.a,60),{color:'#e5533d',size:32}),beam(c.a,c.b,{color:'#ff4a3d',w:18,d:600}),shake(500,10)),t.side);hurt(u,r);flash(s);await say('¡AHORA SÍ!',`${label(t)} devuelve el doble: ${label(u)} pierde ${r} PS.`);}
  if(mv.suspend&&total>0&&t.hp>0&&!hitSub){await fxRun(fxSuspend,s);heal(t,Math.floor(total*mv.suspend));await say('¡Suspendida a los 8 segundos!',`${label(t)} recupera parte de los PS.`);}
  if(mv.drain&&total>0&&u.hp>0&&u.hp<u.max){heal(u,Math.max(1,Math.floor(total*mv.drain)));await say(`${label(u)} recupera energía.`);}
  if(mv.recoil&&total>0){hurt(u,Math.max(1,Math.floor(total*mv.recoil)));flash(s);await say(`${label(u)} también se lleva un golpe.`);}
  if(mv.recoilMax){hurt(u,Math.max(1,Math.floor(u.max*mv.recoilMax)));flash(s);await say(`${label(u)} se hace daño pataleando.`);}
  if(mv.purge){const bench=B.teams[s].filter((m,i)=>i!==B.act[s]&&m.hp>1);if(bench.length){const v=bench[rnd(bench.length)];const d=Math.min(v.hp-1,Math.max(1,Math.floor(v.max/5)));hurt(v,d);await say(`La purga alcanza a ${v.name}, de su propio banquillo.`,`Pierde ${d} PS.`);}}
  if(mv.splash){const bench=B.teams[1-s].filter((m,i)=>i!==B.act[1-s]&&m.hp>1);if(bench.length){bench.forEach(m=>hurt(m,Math.min(m.hp-1,Math.max(1,Math.floor(m.max/8)))));renderPlates();await say('¡El AVE también arrolla al banquillo rival!',bench.map(m=>m.name).join(' y ')+' pierden PS.');}}
  if(mv.selfBoost&&u.hp>0)await boost(u,mv.selfBoost,u);
}
function bestResist(atkType,cur){
  let best=[],bv=9;
  for(const k of Object.keys(TYPES)){if(k==='mit'||cur.length===1&&cur[0]===k)continue;const v=(CHART[atkType]||{})[k]??1;if(v<bv){bv=v;best=[k];}else if(v===bv)best.push(k);}
  return best[rnd(best.length)];
}
async function statusMove(s,mv,id){
  const u=active(s),t=active(1-s),k=mv.eff.kind;
  if(mv.target==='self'){
    if(k==='heal'){if(u.hp>=u.max&&!mv.eff.charm){await say('¡Pero ya tiene todos los PS!');return;}await playFX(id,s);SND.sfx('heal');heal(u,Math.floor(u.max*mv.eff.frac));await say(`${label(u)} recupera PS.`);if(mv.eff.charm&&t.hp>0&&!isAway(t)&&!(t.vol.sub>0))await boost(t,{atk:-1},u);return;}
    if(k==='boost'){await playFX(id,s);await boost(u,mv.eff.boosts,u);return;}
    if(k==='protect'){const ch=Math.pow(1/3,u.vol.protectCount||0);if(Math.random()<ch){u.vol.protect=true;u.vol.protectCount=(u.vol.protectCount||0)+1;await playFX(id,s);await say(`${label(u)} se esconde en el maletero. Nadie le encuentra.`);}else{u.vol.protectCount=0;await say('¡Pero esta vez le han pillado! Ha fallado.');}return;}
    if(k==='sub'){const c=Math.floor(u.max/4);if(u.vol.sub>0){await say('¡Ya está atrincherado en el chalet!');return;}if(u.hp<=c){await say('¡No le quedan fuerzas ni para el chalet!');return;}await playFX(id,s);hurt(u,c);u.vol.sub=c;renderPlates();await say(`${label(u)} se encierra en su chalet.`,'El chalet recibirá los golpes hasta derrumbarse.');return;}
    if(k==='peugeot'){B.animating=true;await playFX('peugeot',s);B.animating=false;u.vol.away=1;$('#sp'+s).classList.add('gone');renderPlates();await say(`${label(u)} se va de gira por España en su Peugeot.`,'Volverá en dos turnos.');return;}
    if(k==='retype'){
      const atkT=u.vol.lastHitType||(t.hp>0?t.types[0]:'mit');const nt=bestResist(atkT||'mit',u.types);
      await playFX(id,s);u.types=[nt];renderPlates();
      await say(`¡${label(u)} ahora es tipo ${TYPES[nt].e} ${TYPES[nt].n}!`,atkT?`Justo lo que resiste ${TYPES[atkT].n}. Donde dije digo, digo Diego.`:null);return;}
    if(k==='rescate'){
      if(B.sides[s].rescate){await say('¡Ya no le quedan rescates!');return;}
      B.sides[s].rescate=true;await playFX(id,s);
      const dead=B.teams[s].filter(m=>m.hp<=0);
      if(dead.length){const r=dead[0];r.hp=Math.floor(r.max/3);r.fainted=false;r.status=null;r.vol={};renderPlates();await say(`¡${r.name} vuelve a estar disponible con un tercio de los PS!`,'Línea de crédito en condiciones muy favorables.');}
      else{if(u.hp>=u.max){await say('No hay nadie a quien rescatar… y él está perfecto.');return;}heal(u,Math.floor(u.max/2));await say(`No hay nadie a quien rescatar, así que ${label(u)} se rescata a sí mismo.`,'Recupera la mitad de los PS.');}
      return;}
    if(k==='cap'){if(u.vol.cap>0){await say('¡Ya tiene los alquileres limitados!');return;}await playFX(id,s);u.vol.cap=3;renderPlates();await say(`${label(u)} limita los alquileres.`,'Durante 3 turnos, ningún golpe le quitará más de 1/4 de su vida.');return;}
    if(k==='otan'){const ch=Math.pow(.5,u.vol.otanCount||0);u.vol.otanCount=(u.vol.otanCount||0)+1;if(Math.random()>=ch){await say('¡Pero esta vez no le sale! Ha fallado.');return;}await playFX(id,s);u.vol.otan=true;u.vol.otanHit=0;renderPlates();await say(`${label(u)} se pone en guardia.`,'De entrada, no… Si le golpean, devolverá el doble.');return;}
    if(k==='isidoro'){if(u.vol.isidoro>0){await say('¡Ya está en la clandestinidad!');return;}await playFX(id,s);u.vol.isidoro=3;renderPlates();await say(`${label(u)} pasa a la clandestinidad como «Isidoro».`,'3 turnos: le fallan la mitad de los ataques y los suyos son siempre críticos.');return;}
    if(k==='copycat')return;
    return;
  }
  if(mv.target==='field'){
    if(k==='weather'){
      if(B.field.w===mv.eff.w){if(u.p.id==='ayuso'&&mv.eff.w==='sun'){await say('Las terrazas ya están abiertas… así que pide otra.');await addCana(u,s);return;}await say('¡Pero ya está así!');return;}
      const prev=B.field.w;await playFX(id,s);B.field.w=mv.eff.w;B.field.turns=5;renderPlates();
      if(prev)await say(prev==='rain'?'Se acaba la lluvia…':'Se recogen las terrazas…');
      await say(mv.eff.w==='rain'?'¡Empieza a llover sobre el plató!':'¡Se abren las terrazas!',mv.eff.w==='rain'?'Lo Gallego no falla, lo Tuit pega más y lo Castizo menos.':'Lo Castizo pega más y lo Tuit menos.');if(u.p.id==='ayuso'&&mv.eff.w==='sun')await addCana(u,s);return;}
    if(k==='obras'){if(B.sides[1-s].obras>0){await say('¡Pero esa calle ya está cortada!');return;}await playFX(id,s);B.sides[1-s].obras=3;renderPlates();await say(`¡Obras en el lado de ${label(t)}!`,'Durante 3 turnos no puede cambiar de político y pierde vida en el atasco.');return;}
    if(k==='caganer'){if(B.sides[1-s].caganer){await say('¡Ya hay un caganer ahí!');return;}await playFX(id,s);B.sides[1-s].caganer=true;renderPlates();await say(`¡Hay un caganer en el lado de ${t.side===0?'tu equipo':'el rival'}!`,'Cada político que entre perderá vida al pisarlo.');return;}
    if(k==='publico'){if(B.sides[s].publico>0){await say('¡Su público ya está aplaudiendo!');return;}await playFX(id,s);B.sides[s].publico=5;renderPlates();await say(`¡Llega el público de ${label(u)}!`,'Le aplaudirán todo y abuchearán al rival.');return;}
    return;
  }
  if(t.hp<=0){await say('¡Pero no hay nadie enfrente!');return;}
  if(t.vol.protect){await say(`¡${label(t)} se ha protegido!`);return;}
  if(isAway(t)){await say(`¡${label(t)} está de gira! No se entera de nada.`);return;}
  if(t.vol.vase>0){await say('Es un jarrón chino: ni se inmuta.');return;}
  if(!accuracyOK(s,mv)){await say('¡El argumento no ha llegado!');return;}
  if(t.vol.sub>0){await say(`¡El chalet de ${label(t)} lo bloquea!`);return;}
  if(k==='swaphp')SND.sfx('whoosh');
  await playFX(id,s);
  if(k==='par'||k==='brn'){
    if(mv.type==='gal'&&eff('gal',t.types)===0){await say(`No le afecta a ${label(t)}. Ni se inmuta.`);return;}
    if(immuneTo(t,k)){await say(`No le afecta a ${label(t)}.`);return;}
    if(t.status){await say(`${label(t)} ya tiene bastante encima.`);return;}
    await inflict(t,k);return;
  }
  if(k==='swaphp'){const fu=u.hp/u.max,ft=t.hp/t.max;u.hp=Math.max(1,Math.round(ft*u.max));t.hp=Math.max(1,Math.round(fu*t.max));renderPlates();await say('¡Por el cambio! Se intercambian la vida.',`${label(u)} queda al ${Math.round(ft*100)}% y ${label(t)} al ${Math.round(fu*100)}%.`);return;}
  if(k==='parlem'){const ch=Math.pow(.5,u.vol.parlemCount||0);u.vol.parlemCount=(u.vol.parlemCount||0)+1;if(t.vol.parlem||Math.random()>=ch){await say('¡Pero el rival no quiere hablar! Ha fallado.');return;}t.vol.parlem=true;renderPlates();await say(`${label(t)} acepta sentarse a dialogar.`,'Perderá su próximo turno.');return;}
  if(k==='confuse'){if(!(await confuse(t)))await say(`${label(t)} ya está en pleno lío.`);return;}
  if(k==='seed'){if(t.types.includes('asa')){await say(`No le afecta a ${label(t)}. Ya vive en asamblea.`);return;}if(t.vol.seed){await say('¡Pero ya le están escuchando!');return;}t.vol.seed=true;await say(`${label(t)} entra en un proceso de escucha sin fin.`);return;}
}
async function endTurn(){
  for(const s of [0,1]){
    const m=active(s),o=active(1-s);if(m.hp<=0)continue;
    if(m.vol.vase>0){m.vol.vase--;if(!m.vol.vase){delete m.vol.vase;m.hp=Math.max(m.hp,Math.floor(m.max*.3));SND.sfx('heal');await fxRun(c=>all(burst(['🏺','✨'],c.a,{n:8,size:26}),word('¡HA VUELTO!',up(c.a,62),{size:24})),s);renderPlates();await say(`¡El jarrón chino se rompe y vuelve ${label(m)}!`,'Con un 30% de vida y las ideas intactas.');}continue;}
    if(isAway(m)){
      if(m.vol.away>0)m.vol.away--;
      else{delete m.vol.away;B.animating=true;await fxRun(FX.peugeotBack,s);B.animating=false;$('#sp'+s).classList.remove('gone');heal(m,Math.floor(m.max*.6));SND.sfx('heal');await say(`¡${label(m)} vuelve de la gira por España!`,'Recupera el 60% de los PS.');}
      continue;
    }
    if(m.status==='brn'){hurt(m,Math.max(1,Math.floor(m.max/16)));flash(s);await say(`${label(m)} se resiente de la quemadura.`);await stepAside(m);}
    if(m.hp>0&&m.vol.seed&&o.hp>0&&!isAway(o)){const d=Math.min(m.hp,Math.max(1,Math.floor(m.max/8)));hurt(m,d);heal(o,d);flash(s);await say(`${label(m)} pierde energía escuchando.`,`${label(o)} se la queda.`);await stepAside(m);}
    if(m.hp>0&&B.sides[s].obras>0){const d=Math.max(1,Math.floor(m.max/8));hurt(m,d);flash(s);await say(`${label(m)} sigue atrapado en el atasco de las obras.`);await stepAside(m);}
    if(m.hp>0&&B.field.w==='sun'&&m.p.id==='ayuso'){if(m.hp<m.max){heal(m,Math.max(1,Math.floor(m.max/16)));await say(`${label(m)} se toma algo en la terraza.`,'Recupera un poco de PS.');}await addCana(m,s);}
    if(m.hp>0&&m.vol.drunk){const pp=dkPhase(m);m.vol.drunk--;if(m.vol.drunk){renderPlates();SND.sfx('glug');await fxRun(c=>all(pop('🥃',up(c.a,64),{size:36,d:900}),word('¡HIC!',up(c.a,100),{color:'#ffd36b',size:20,d:800})),s);await say(`¡${m.name} pasa de ${DKPH[pp]} a ${DKPH[dkPhase(m)].toUpperCase()}!`,dkPhase(m)===3?'🍺🍺🍺 Ya no sabe ni dónde está.':'🍺🍺 Cada vez la lía más.');}
      if(!m.vol.drunk){delete m.vol.drunk;renderPlates();m.status='slp';m.slp=1+rnd(2);SND.sfx('sad');await fxRun(c=>all(pop('🤕',up(c.a,64),{size:40,d:1100}),word('RESACA',up(c.a,100),{color:'#c3bcb1',size:20,d:1100})),s);renderPlates();await say(`A ${label(m)} se le pasa la fiesta… ¡y llega la resaca!`,'🤕 Se echa una siesta.');}}
  }
  for(const s of [0,1]){
    const sd=B.sides[s];
    if(sd.obras>0){sd.obras--;if(!sd.obras){renderPlates();await say(`Terminan las obras en el lado de ${s===0?'tu equipo':'el rival'}.`);}}
    if(sd.publico>0){sd.publico--;if(!sd.publico){renderPlates();await say('El público de Santi se vuelve en los autobuses.');}}
  }
  if(B.field.w){B.field.turns--;if(B.field.turns<=0){const w=B.field.w;B.field.w=null;renderPlates();await say(w==='rain'?'Deja de llover en el plató.':'Se recogen las terrazas.');}}
  for(const s of [0,1]){const m=active(s);m.vol.otan=false;if(m.vol.isidoro>0){m.vol.isidoro--;if(!m.vol.isidoro){renderPlates();await say(`${label(m)} sale de la clandestinidad.`);}}}
  for(const s of [0,1]){const m=active(s);m.vol.protect=false;m.vol.flinch=false;if(m.vol.cap>0){m.vol.cap--;if(!m.vol.cap){renderPlates();await say(`Se acaba el tope de alquileres de ${label(m)}.`);}}}
  renderPlates();
}
async function faintCheck(){
  await resistCheck();
  for(const s of [1,0]){const m=active(s);if(m.hp<=0&&!m.fainted){m.fainted=true;m.status=null;m.vol={};m.types=m.p.types.slice();if(m.p.id==='abascal')B.sides[s].publico=0;if(s===0&&m.p.legend)SND.music('battle');await say(`¡${label(m)} se queda sin argumentos!`,null,{bub:{s,m,line:m.p.ko}});await koFly(s);}}
  if(B.teams[1].every(m=>m.hp<=0)){B.over=true;finish(true);return;}
  if(B.teams[0].every(m=>m.hp<=0)){B.over=true;finish(false);return;}
}
async function replaceFainted(){
  while(!B.over&&active(1).hp<=0){await doSwitch(1,aiReplace(),true);await faintCheck();}
  while(!B.over&&active(0).hp<=0){const idx=await askSwitch(true);await doSwitch(0,idx,true);await faintCheck();}
}
function resetVol(m){m.vol={};m.stages={atk:0,def:0,spa:0,spd:0,spe:0};m.types=m.p.types.slice();}
async function doSwitch(s,idx,afterFaint){
  const old=active(s);
  if(!afterFaint&&old.hp>0){
    spriteOut(s);SND.sfx('whoosh');
    await say(s===0?`¡Vuelve, ${old.name}!`:`El rival retira a ${old.name}.`);
  }
  if(old.p.id==='abascal')B.sides[s].publico=0;
  resetVol(old);
  B.act[s]=idx;const n=active(s);resetVol(n);setSprite(s);SND.cry(n.p.id);if(n.p.legend)await legendIntro(s);updateMusic();
  await say(s===0?`¡Adelante, ${n.name}!`:`El rival saca a ${n.name}.`,null,{bub:{s,m:n,line:n.p.entry}});
  if(B.sides[s].caganer){const d=Math.max(1,Math.floor(n.max/8));hurt(n,d);flash(s);await say(`¡${label(n)} pisa el caganer!`,`Pierde ${d} PS.`);}
  if(n.hp>0){await onEntry(s);await checkRivalry();}
}
async function checkRivalry(){
  const a=active(0),b=active(1);if(a.hp<=0||b.hp<=0)return;
  const k=rivKey(a.p.id,b.p.id),r=RIV[k];if(!r||B.rivSeen.has(k))return;
  B.rivSeen.add(k);
  clearBubbles();
  for(const[id,line]of r){const m=a.p.id===id?a:b;await say(`💬 ${label(m)}`,null,{bub:{s:m===a?0:1,m,line,keep:1}});}
  await say('¡Hay pique!',k==='ayuso|sanchez'?'Los dos pegan un 20% más, y «Me gusta la fruta» siempre es crítico contra Perro Sanxe.':'En esta rivalidad, los dos pegan un 20% más.');
  clearBubbles();
}
async function onEntry(s){
  const n=active(s),o=active(1-s);
  if(n.p.ability==='intimidacion'&&o.hp>0&&!isAway(o)){await say(`Llegada triunfal de ${label(n)}.`);await boost(o,{atk:-1},n);}
}

