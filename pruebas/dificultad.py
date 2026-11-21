# Mide cuánto gana un jugador «humano» (al azar, por potencia o mirando la eficacia) contra la IA.
# Uso: python3 pruebas/dificultad.py [combates_por_página]
import asyncio, sys, pathlib
JUEGO=(pathlib.Path(__file__).resolve().parent.parent/'index.html').as_uri()
from playwright.async_api import async_playwright
N=int(sys.argv[1]) if len(sys.argv)>1 else 150
JS="""async([GAMES,MODEP])=>{
  SPEED=0;
  const pickMove=()=>{
    const me=active(0),foe=active(1);
    if(isAway(me))return{type:'move',away:true};
    if(me.vol.vase>0)return{type:'move',vase:true};
    if(me.vol.charging)return{type:'move',forced:true};
    const u=me.moves.map((x,i)=>({...x,i})).filter(x=>x.pp>0);
    if(!u.length)return{type:'move',struggle:true};
    let pick;
    if(MODEP==='random'){pick=u[rnd(u.length)].i;}
    else if(MODEP==='power'){ // pulsa el ataque con más potencia (sin mirar tipos), a veces uno de estado
      if(Math.random()<.25){pick=u[rnd(u.length)].i;}else{let b=-1;for(const x of u){const mv=MOVES[x.id];const p=(mv.power||0)*(me.types.includes(mv.type)?1.5:1);if(p>b){b=p;pick=x.i;}}}
    } else { // 'hint': mira la etiqueta de eficacia y elige el que más daño hace
      let b=-1;for(const x of u){const mv=MOVES[x.id];if(mv.cat==='X')continue;const d=estDmg(me,foe,x.id);if(d>b){b=d;pick=x.i;}}
      if(pick===undefined)pick=u[0].i;
    }
    return {type:'move',idx:pick};
  };
  getPlayerAction=()=>Promise.resolve(pickMove());
  askSwitch=()=>{const a=B.teams[0].map((m,i)=>({m,i})).filter(x=>x.m.hp>0&&x.i!==B.act[0]);return Promise.resolve(a[rnd(a.length)].i);};
  let w=0,n=0,fin;finish=function(won){fin(won);};
  for(let g=0;g<GAMES;g++){
    const ids=shuffle(POL.filter(p=>!p.legend).map(p=>p.id));let to;
    const res=await new Promise(res=>{fin=res;to=setTimeout(()=>res('stuck'),5000);startBattle(ids.slice(0,3));B.teams[1]=ids.slice(3,6).map(id=>makeMon(id,1));});
    clearTimeout(to);if(res==='stuck'){ABORT=true;if(skipFn)skipFn();await new Promise(r=>setTimeout(r,30));continue;}
    await new Promise(r=>setTimeout(r,0));n++;if(res)w++;
  }
  return [w,n];
}"""
async def one(b,errs,mode):
    pg=await b.new_page();pg.on('pageerror',lambda e:errs.append(str(e)))
    await pg.goto(JUEGO)
    return await pg.evaluate(JS,[N,mode])
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch();errs=[]
        for mode in ['random','power','hint']:
            rs=await asyncio.gather(*[one(b,errs,mode) for _ in range(3)])
            w=sum(r[0] for r in rs);n=sum(r[1] for r in rs)
            print(mode,f"{100*w/n:.1f}% ({n})")
        print(errs[:3]);await b.close()
asyncio.run(main())
