# Simula muchos combates IA contra IA y muestra el % de victorias de cada personaje.
# Uso: python3 pruebas/equilibrio.py [combates_por_página]
import asyncio, pathlib, json, sys
JUEGO=(pathlib.Path(__file__).resolve().parent.parent/'index.html').as_uri()
from playwright.async_api import async_playwright
N=int(sys.argv[1]) if len(sys.argv)>1 else 300
JS="""async(GAMES)=>{
  SPEED=0; CONFIG.rival='listo'; // el equilibrio se mide con el rival que calcula
  const swap=()=>{B.teams.reverse();B.act.reverse();B.sides.reverse();};
  getPlayerAction=function(){swap(); const a=aiChoose(); swap(); return Promise.resolve(a);};
  askSwitch=function(){swap(); const i=aiReplace(); swap(); return Promise.resolve(i);};
  const stats={}; POL.forEach(p=>stats[p.id]={w:0,n:0}); let stuck=0; let fin;
  finish=function(won){fin(won);};
  for(let g=0; g<GAMES; g++){
    const ids=shuffle(POL.filter(p=>!p.legend).map(p=>p.id)); let to;
    const res=await new Promise(res=>{fin=res; to=setTimeout(()=>res('stuck'),5000); startBattle(ids.slice(0,3)); B.teams[1]=ids.slice(3,6).map(id=>makeMon(id,1));});
    clearTimeout(to);
    if(res==='stuck'){stuck++;ABORT=true;if(skipFn)skipFn();await new Promise(r=>setTimeout(r,30));continue;}
    await new Promise(r=>setTimeout(r,0));
    ids.slice(0,3).forEach(id=>{stats[id].n++; if(res) stats[id].w++;});
    ids.slice(3,6).forEach(id=>{stats[id].n++; if(!res) stats[id].w++;});
  }
  return {stats,stuck};
}"""
async def one(b,errs):
    pg=await b.new_page()
    pg.on('pageerror',lambda e:errs.append(str(e)))
    await pg.goto(JUEGO)
    return await pg.evaluate(JS,N)
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(); errs=[]
        rs=await asyncio.gather(*[one(b,errs) for _ in range(4)])
        tot={}; st=0
        for r in rs:
            st+=r['stuck']
            for k,v in r['stats'].items():
                t=tot.setdefault(k,[0,0]); t[0]+=v['w']; t[1]+=v['n']
        print('stuck',st,'errs',errs[:3])
        for k,(w,n) in sorted([x for x in tot.items() if x[1][1]],key=lambda x:-x[1][0]/x[1][1]): print(f"{k:11s} {100*w/n:5.1f}% ({n})")
        await b.close()
asyncio.run(main())
