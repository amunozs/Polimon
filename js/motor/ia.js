'use strict';
/* =====================================================================
   IA DEL RIVAL: cómo elige ataque y a quién saca.
   Hay dos rivales y se elige en config.js → rival:
   - 'facil': ataca al azar (sin hacer tonterías evidentes), nunca cambia
     de polímon por gusto y, si le eliminan uno, saca otro al azar.
   - 'listo': el rival de siempre, que calcula daños y cambia cuando le conviene.
   ===================================================================== */

function aiChoose(){return CONFIG.rival==='listo'?aiChooseListo():aiChooseFacil();}
function aiReplace(){return CONFIG.rival==='listo'?aiReplaceListo():aiReplaceFacil();}

// ¿Este ataque sería una tontería evidente? (no afecta al rival o cura con la vida llena)
function absurdo(me,foe,mv){
  if(mv.cat!=='X')return eff(mv.type,foe.types)===0;
  const k=mv.eff&&mv.eff.kind;
  const llena=me.hp>=me.max;
  if(k==='heal'||k==='peugeot')return llena;
  if(k==='rescate')return llena&&!B.teams[1].some(m=>m.hp<=0);
  return false;
}
function aiChooseFacil(){
  const me=active(1),foe=active(0);
  if(isAway(me))return{type:'move',away:true};
  if(me.vol.vase>0)return{type:'move',vase:true};
  if(me.vol.charging)return{type:'move',forced:true};
  const usable=me.moves.map((x,i)=>({...x,i})).filter(x=>x.pp>0);
  if(!usable.length)return{type:'move',struggle:true};
  const sensatos=usable.filter(x=>!absurdo(me,foe,MOVES[x.id]));
  const lista=sensatos.length?sensatos:usable;
  return{type:'move',idx:lista[rnd(lista.length)].i};
}
function aiReplaceFacil(){
  const vivos=B.teams[1].map((m,i)=>({m,i})).filter(x=>x.m.hp>0);
  return vivos[rnd(vivos.length)].i;
}

function estDmg(u,t,id){
  const mv=MOVES[id];if(!mv||mv.cat==='X')return 0;
  if(eff(mv.type,t.types)===0)return 0;
  let d=calcDamage(u,t,mv,false,.925);
  if(mv.multi)d*=mv.multi===2?4.5:3.1;
  if(mv.coin)d=d*.5-(t.max/4)*.5;
  if(mv.veto)d*=1-mv.veto;
  if(mv.bulo)d*=1-mv.bulo;
  if(mv.suspend)d*=1-mv.suspend;
  if(t.vol.sub>0&&!mv.sound)d=Math.min(d,t.vol.sub)*.7;
  return Math.max(0,d*(mv.acc?mv.acc/100:1));
}
function bestPct(u,t){let b=0;for(const x of u.moves)if(x.pp>0)b=Math.max(b,estDmg(u,t,x.id));return b/t.max;}
function aiChooseListo(){
  const me=active(1),foe=active(0);
  if(isAway(me))return{type:'move',away:true};
  if(me.vol.vase>0)return{type:'move',vase:true};
  if(me.vol.charging)return{type:'move',forced:true};
  const usable=me.moves.map((x,i)=>({...x,i})).filter(x=>x.pp>0);
  if(!usable.length)return{type:'move',struggle:true};
  const hpF=me.hp/me.max;
  const bench=B.teams[1].map((m,i)=>({m,i})).filter(x=>x.i!==B.act[1]&&x.m.hp>0);
  if(bench.length&&!me.vol.sub&&!(B.sides[1].obras>0)){
    const here=bestPct(me,foe)-.8*bestPct(foe,me);let best=null,bs=here;
    for(const c of bench){const sc=bestPct(c.m,foe)-.8*bestPct(foe,c.m)-.1-(B.sides[1].caganer?.125:0);if(sc>bs+.35){best=c;bs=sc;}}
    if(best&&Math.random()<.5)return{type:'switch',idx:best.i};
  }
  let pick=usable[0].i,top=-1;
  const threat=bestPct(foe,me);
  const foeAway=isAway(foe);
  const foeBench=B.teams[0].filter((m,i)=>i!==B.act[0]&&m.hp>0).length;
  for(const x of usable){
    const mv=MOVES[x.id];let sc=0;
    if(mv.cat!=='X'){
      let d=foeAway?0:estDmg(me,foe,x.id);if(mv.charge&&!(mv.charge==='law'&&B.field.w==='sun'))d*=.6;
      sc=Math.min(d,foe.hp)/foe.max*100;
      if(d>=foe.hp)sc+=50;if(mv.prio>0&&d>=foe.hp)sc+=30;
      if(mv.recoil)sc-=8;if(mv.drain&&hpF<.7)sc+=10;if(mv.selfBoost)sc-=6;if(mv.purge)sc-=6;if(mv.legend)sc=200;
    }else{
      const k=mv.eff.kind;
      if(k==='heal')sc=hpF<.5?70*(1-hpF)+20:(mv.eff.charm&&foe.st.atk>=foe.st.spa&&foe.stages.atk>-2?18:1);
      else if(k==='boost'){const key=Object.keys(mv.eff.boosts)[0];sc=(hpF>.6&&me.stages[key]<2&&threat<.45)?32:2;}
      else if(k==='protect')sc=me.vol.protectCount?0:6+((foe.vol.seed||foe.status==='brn'||B.sides[0].obras)?12:0);
      else if(k==='sub')sc=(!me.vol.sub&&hpF>.55)?22:0;
      else if(k==='peugeot')sc=hpF<.45?58:0;
      else if(k==='retype'){const lt=me.vol.lastHitType||foe.types[0];sc=eff(lt,me.types)>=1?26:3;}
      else if(k==='otan')sc=(!me.vol.otanCount&&threat>.25)?24:0;
      else if(k==='isidoro')sc=me.vol.isidoro>0?0:30;
      else if(k==='swaphp')sc=foeAway?0:Math.max(0,(foe.hp/foe.max-hpF)*130);
      else if(k==='cap')sc=(!me.vol.cap&&threat>.3)?30:2;
      else if(k==='parlem')sc=(foeAway||foe.vol.parlem||me.vol.parlemCount)?0:24;
      else if(k==='rescate')sc=B.sides[1].rescate?0:(B.teams[1].some(m=>m.hp<=0)?72:(hpF<.45?50:0));
      else if(k==='weather')sc=B.field.w===mv.eff.w?0:24;
      else if(k==='obras')sc=B.sides[0].obras>0||foeAway?0:26;
      else if(k==='caganer')sc=B.sides[0].caganer||foeBench===0?0:28;
      else if(k==='publico')sc=B.sides[1].publico>0?0:30;
      else if(foeAway)sc=0;
      else if(k==='par')sc=(foe.status||foe.vol.sub||immuneTo(foe,'par')||eff('gal',foe.types)===0)?0:30;
      else if(k==='brn')sc=(foe.status||foe.vol.sub||immuneTo(foe,'brn'))?0:(foe.st.atk>foe.st.spa?38:20);
      else if(k==='confuse')sc=(foe.vol.confuse||foe.vol.sub)?0:24;
      else if(k==='seed')sc=(foe.vol.seed||foe.vol.sub||foe.types.includes('asa'))?0:28;
      else if(k==='copycat'){const lm=B.lastMove;sc=(lm&&!NOCOPY.has(lm))?(MOVES[lm].cat==='X'?10:Math.min(estDmg(me,foe,lm),foe.hp)/foe.max*100):0;}
    }
    sc*=.8+Math.random()*.4;
    if(sc>top){top=sc;pick=x.i;}
  }
  return{type:'move',idx:pick};
}
function aiReplaceListo(){
  const foe=active(0);let best=-1,bs=-1e9;
  B.teams[1].forEach((m,i)=>{if(m.hp<=0)return;const sc=bestPct(m,foe)-.7*bestPct(foe,m)+Math.random()*.1;if(sc>bs){bs=sc;best=i;}});
  return best;
}

