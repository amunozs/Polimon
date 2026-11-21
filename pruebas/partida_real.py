# Juega 4 combates completos a velocidad real (con animaciones) y muestra errores si los hay.
# Uso: python3 pruebas/partida_real.py
import asyncio, pathlib
JUEGO=(pathlib.Path(__file__).resolve().parent.parent/'index.html').as_uri()
from playwright.async_api import async_playwright
JS="""async()=>{
  MODE='fast';
  const swap=()=>{B.teams.reverse();B.act.reverse();B.sides.reverse();};
  getPlayerAction=function(){swap(); const a=aiChoose(); swap(); return Promise.resolve(a);};
  askSwitch=function(){swap(); const i=aiReplace(); swap(); return Promise.resolve(i);};
  return await new Promise(res=>{finish=w=>res(w);const ids=shuffle(POL.filter(p=>!p.legend).map(p=>p.id));startBattle(ids.slice(0,3));B.teams[1]=ids.slice(3,6).map(id=>makeMon(id,1));setSprite(1);renderPlates();});
}"""
async def one(b,errs,i):
    pg=await b.new_page(viewport={'width':390,'height':760})
    pg.on('pageerror',lambda e:errs.append(str(e)))
    pg.on('console',lambda m:errs.append('console: '+m.text) if m.type=='error' else None)
    await pg.goto(JUEGO)
    try: r=await asyncio.wait_for(pg.evaluate(JS),timeout=400)
    except Exception as e: r='timeout '+str(e)[:60]
    return r
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(); errs=[]
        rs=await asyncio.gather(*[one(b,errs,i) for i in range(4)])
        print(rs, errs[:5]); await b.close()
asyncio.run(main())
