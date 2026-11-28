'use strict';
/* =====================================================================
   SONIDO: música y efectos sintetizados al estilo 8 bits (no usa ficheros de audio).
   ===================================================================== */

function updateMusic(){if(!B||B.over)return;const m=active(0);if(m.p.legend&&m.hp>0)SND.music(m.pana?'legend82':'legend');else SND.music('battle');}
const SND=(()=>{
  let ctx=null,master,mus,fx,nbuf=null,on=true,song=null,timer=null,step=0,nextT=0;
  try{on=localStorage.getItem(KEY('sonido'))!=='off';}catch(_){}
  const NOTE=n=>{if(!n||n==='.'||n==='-')return 0;const m=n.match(/^([A-G])(#?)(\d)$/);const k={C:-9,D:-7,E:-5,F:-4,G:-2,A:0,B:2}[m[1]]+(m[2]?1:0)+(+m[3]-4)*12;return 440*Math.pow(2,k/12);};
  const ok=()=>ctx&&on&&SPEED!==0;
  function init(){
    const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return;
    if(!ctx){try{ctx=new AC();}catch(_){return;}master=ctx.createGain();master.gain.value=on?1:0;master.connect(ctx.destination);
      mus=ctx.createGain();mus.gain.value=.085;mus.connect(master);fx=ctx.createGain();fx.gain.value=.3;fx.connect(master);
      nbuf=ctx.createBuffer(1,ctx.sampleRate,ctx.sampleRate);const d=nbuf.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;}
    if(ctx.state==='suspended')ctx.resume().catch(()=>{});
  }
  function tone({f=440,f2=0,d=.12,type='square',v=.5,t=0,dest,att=.004,vib=0,vibD=.04}){
    if(!ctx)return;const t0=ctx.currentTime+t,o=ctx.createOscillator(),g=ctx.createGain();o.type=type;o.frequency.setValueAtTime(f,t0);
    if(f2)o.frequency.exponentialRampToValueAtTime(Math.max(30,f2),t0+d);
    if(vib){const l=ctx.createOscillator(),lg=ctx.createGain();l.frequency.value=vib;lg.gain.value=f*vibD;l.connect(lg);lg.connect(o.frequency);l.start(t0);l.stop(t0+d+.05);}
    g.gain.setValueAtTime(0,t0);g.gain.linearRampToValueAtTime(v,t0+att);g.gain.exponentialRampToValueAtTime(.0008,t0+d);
    o.connect(g);g.connect(dest||fx);o.start(t0);o.stop(t0+d+.03);
  }
  function noise({d=.2,v=.5,t=0,f=1200,f2=0,q=1,type='bandpass',att=.004}){
    if(!ctx)return;const t0=ctx.currentTime+t,src=ctx.createBufferSource(),fl=ctx.createBiquadFilter(),g=ctx.createGain();src.buffer=nbuf;src.loop=true;
    fl.type=type;fl.frequency.setValueAtTime(f,t0);if(f2)fl.frequency.exponentialRampToValueAtTime(f2,t0+d);fl.Q.value=q;
    g.gain.setValueAtTime(0,t0);g.gain.linearRampToValueAtTime(v,t0+att);g.gain.exponentialRampToValueAtTime(.0008,t0+d);
    src.connect(fl);fl.connect(g);g.connect(fx);src.start(t0);src.stop(t0+d+.03);
  }
  const arp=(ns,{d=.07,type='square',v=.35,gap=.06}={})=>ns.forEach((n,i)=>tone({f:NOTE(n),d,type,v,t:i*gap}));
  const SFX={
    blip:()=>tone({f:880,d:.05,v:.25}),
    hitP:()=>{noise({d:.14,v:.8,f:600,f2:120,type:'lowpass'});tone({f:180,f2:60,d:.12,v:.5});},
    hitS:()=>{tone({f:1400,f2:180,d:.18,type:'sawtooth',v:.35});noise({d:.1,v:.3,f:3000});},
    superE:()=>arp(['C6','G6'],{d:.08,v:.3,gap:.07}),
    weak:()=>tone({f:220,f2:150,d:.18,type:'triangle',v:.5}),
    crit:()=>arp(['E6','B6','E7'],{d:.06,v:.25,gap:.04}),
    heal:()=>arp(['C5','E5','G5','C6','E6'],{d:.1,type:'triangle',v:.4,gap:.07}),
    up:()=>arp(['C5','D5','E5','G5'],{d:.07,v:.25,gap:.05}),
    down:()=>arp(['G5','E5','D5','C5'],{d:.07,v:.25,gap:.05}),
    faint:()=>{tone({f:700,f2:70,d:.8,v:.4});noise({d:.5,v:.2,f:400,f2:80,type:'lowpass',t:.2});},
    whoosh:()=>noise({d:.35,v:.45,f:400,f2:2400,q:2}),
    jet:()=>{noise({d:.9,v:.5,f:300,f2:3000,q:3});tone({f:120,f2:400,d:.9,type:'sawtooth',v:.2});},
    engine:()=>{tone({f:55,f2:110,d:.9,type:'sawtooth',v:.35,vib:28,vibD:.15});noise({d:.9,v:.25,f:200,type:'lowpass'});},
    slap:()=>{noise({d:.08,v:1,f:2500,q:.6});noise({d:.1,v:.6,f:900,t:.02});},
    thud:()=>{tone({f:120,f2:40,d:.3,type:'sine',v:.9});noise({d:.15,v:.5,f:300,type:'lowpass'});},
    rain:()=>noise({d:1.4,v:.35,f:5000,type:'highpass',att:.3}),
    pop:()=>tone({f:500,f2:1200,d:.08,type:'sine',v:.5}),
    pops:()=>{for(let i=0;i<8;i++)tone({f:400+i*80,f2:1200,d:.06,type:'sine',v:.35,t:i*.07});},
    applause:()=>{for(let i=0;i<14;i++)noise({d:.05,v:.5,f:1800+Math.random()*1500,q:1.5,t:i*.05+Math.random()*.03});},
    boo:()=>{tone({f:180,f2:120,d:.7,type:'sawtooth',v:.25,vib:6});tone({f:150,f2:100,d:.7,type:'sawtooth',v:.2,vib:5,t:.05});},
    coin:()=>{tone({f:988,d:.08,v:.35});tone({f:1319,d:.35,v:.35,t:.08});},
    coins:()=>{for(let i=0;i<10;i++)tone({f:1200+Math.random()*900,d:.12,v:.22,t:i*.06});},
    blipbeep:()=>tone({f:1200,d:.04,v:.2}),
    printer:()=>{for(let i=0;i<5;i++)noise({d:.05,v:.4,f:3000,t:i*.06});},
    wobble:()=>tone({f:500,d:.7,type:'triangle',v:.35,vib:7,vibD:.25}),
    flatline:()=>{tone({f:880,d:.09,type:'square',v:.14});tone({f:880,d:.09,type:'square',v:.14,t:.45});tone({f:880,d:1.1,type:'square',v:.14,t:.9});},
    beat:()=>{tone({f:70,f2:40,d:.16,type:'sine',v:.9});tone({f:62,f2:36,d:.2,type:'sine',v:.8,t:.2});tone({f:1320,d:.08,type:'square',v:.12});},
    cricket:()=>{for(let r=0;r<2;r++)for(let i=0;i<3;i++)tone({f:4300,d:.035,type:'sine',v:.18,t:r*.45+i*.065});},
    trombone:()=>{[247,233,220].forEach((f,i)=>tone({f,d:.34,type:'sawtooth',v:.2,t:i*.36,att:.03}));tone({f:208,f2:196,d:1.0,type:'sawtooth',v:.2,t:1.08,att:.03,vib:5,vibD:.02});},
    laugh:()=>{for(let k=0;k<3;k++)for(let i=0;i<6;i++){const t=k*.07+i*.15+Math.random()*.03;noise({d:.09,v:.35,f:800+k*350+Math.random()*200,q:4,t});tone({f:260+k*70+Math.random()*30,f2:200+k*60,d:.09,type:'sawtooth',v:.07,t});}},
    ooh:()=>{[196,247,294,349].forEach((f,i)=>tone({f,f2:f*.8,d:1.1,type:'sawtooth',v:.09,att:.25,t:i*.02,vib:5,vibD:.015}));},
    pow:()=>{noise({d:.45,v:1,f:900,f2:70,type:'lowpass'});tone({f:140,f2:40,d:.4,type:'square',v:.5});},
    hooves:()=>{for(let i=0;i<10;i++)[0,.07,.12].forEach(o=>noise({d:.045,v:.7,f:500,type:'lowpass',t:i*.24+o}));},
    news:()=>{arp(['A5','E6','A6'],{d:.22,type:'sine',v:.3,gap:.13});tone({f:110,d:.6,type:'triangle',v:.3});},
    twinkle:()=>arp(['E7','B7','E7'],{d:.12,type:'sine',v:.22,gap:.08}),
    yawn:()=>tone({f:420,f2:180,d:.9,type:'triangle',v:.3,vib:4,vibD:.05,att:.15}),
    flip:()=>{for(let i=0;i<9;i++)tone({f:i%2?900:1200,d:.04,v:.15,t:i*.13});},
    ding:()=>{tone({f:2637,d:.8,type:'sine',v:.3});tone({f:3951,d:.6,type:'sine',v:.15,t:.05});},
    brrt:()=>{noise({d:.35,v:.5,f:2200,q:2});for(let i=0;i<8;i++)tone({f:180,d:.03,type:'square',v:.15,t:i*.04});},
    hic:()=>{tone({f:520,f2:980,d:.11,type:'triangle',v:.4});noise({d:.05,v:.25,f:1500,q:3});},
    organillo:()=>arp(['G5','E5','G5','C6','B5','A5','G5','E5','F5','D5'],{d:.13,type:'square',v:.16,gap:.12}),
    glug:()=>{for(let i=0;i<4;i++)tone({f:300-i*30,f2:180,d:.08,type:'sine',v:.4,t:i*.11});},
    roll:()=>{let t=0,iv=.13;while(t<5.1){noise({d:.05,v:Math.min(.55,.08+t*.09),f:1800,q:1.2,t});t+=iv;iv=Math.max(.028,iv*.965);}},
    // Inspirado en los acordes del estribillo de Els Segadors (Mi menor): Mim – Sol – Lam – Si7 – Re – Mim
    segadors:()=>{const N={E3:164.8,G3:196,A3:220,B3:246.9,D4:293.7,E4:329.6,Fs4:370,G4:392,A4:440,B4:493.9,C5:523.3,D5:587.3,E5:659.3,Ds5:622.3};
      const bar=[['E3',['E4','G4','B4']],['G3',['D5','B4','G4']],['A3',['C5','E5','A4']],['B3',['B4','Ds5','Fs4']],['D4',['D5','A4','Fs4']],['E3',['E5','B4','G4']]];
      let t=0;for(const[b,ch]of bar){tone({f:N[b],d:.5,type:'triangle',v:.35,t});ch.forEach((n,i)=>tone({f:N[n],d:.16,type:'square',v:.11,t:t+i*.17}));t+=.52;}
      tone({f:N.E4,d:.6,type:'square',v:.16,t});tone({f:N.E3,d:.6,type:'triangle',v:.35,t});},
    horn:()=>{tone({f:98,d:1.1,type:'sawtooth',v:.32,att:.06});tone({f:147,d:1.1,type:'square',v:.12,att:.06});tone({f:98,d:.9,type:'sawtooth',v:.32,att:.06,t:1.25});tone({f:147,d:.9,type:'square',v:.12,att:.06,t:1.25});},
    siren:()=>{for(let i=0;i<4;i++){tone({f:960,d:.22,type:'square',v:.14,t:i*.44});tone({f:770,d:.22,type:'square',v:.14,t:i*.44+.22});}},
    screech:()=>{noise({d:.6,v:.45,f:2600,f2:1600,q:6});tone({f:1900,f2:1300,d:.55,type:'sawtooth',v:.08});},
    fanfare:()=>arp(['C5','E5','G5','C6','G5','C6'],{d:.14,v:.35,gap:.11}),
    sad:()=>{tone({f:392,f2:370,d:.3,type:'sawtooth',v:.25});tone({f:370,f2:349,d:.3,type:'sawtooth',v:.25,t:.32});tone({f:349,f2:262,d:.8,type:'sawtooth',v:.25,t:.64,vib:6});},
    cluck:()=>{for(let i=0;i<3;i++)tone({f:700,f2:500,d:.07,v:.3,t:i*.11});},
    whistle:()=>tone({f:2600,d:.45,type:'sine',v:.35,vib:30,vibD:.03}),
    chant:()=>{arp(['A4','C5','A4','C5','E5'],{d:.13,v:.3,gap:.13});for(let i=0;i<10;i++)noise({d:.05,v:.35,f:1800+Math.random()*1500,q:1.5,t:.2+i*.06});},
    chime:()=>arp(['E5','G#5','B5'],{d:.4,type:'sine',v:.3,gap:.12}),
    megaphone:()=>{tone({f:300,d:.5,type:'square',v:.25,vib:60,vibD:.02});noise({d:.5,v:.15,f:1500,q:3});},
    prrt:()=>tone({f:90,f2:60,d:.35,type:'sawtooth',v:.35,vib:35,vibD:.3}),
    door:()=>{noise({d:.08,v:.6,f:500});tone({f:200,f2:120,d:.12,v:.3,t:.05});},
    build:()=>{for(let i=0;i<4;i++)noise({d:.07,v:.5,f:700,t:i*.12});},
    fire:()=>noise({d:.6,v:.5,f:800,f2:2500,q:.7}),
    fireworks:()=>{noise({d:.5,v:.4,f:3000,f2:300,q:.5});arp(['G6','E6','C7'],{d:.08,v:.2,gap:.08});},
    drill:()=>tone({f:160,d:.7,type:'sawtooth',v:.25,vib:45,vibD:.2}),
    static:()=>noise({d:.6,v:.4,f:4000,type:'highpass'}),
    lock:()=>{tone({f:1800,d:.04,v:.35});tone({f:1200,d:.06,v:.35,t:.08});},
    camera:()=>{noise({d:.05,v:.7,f:4000});tone({f:3000,d:.15,type:'sine',v:.2,t:.05});},
    tweet:()=>{tone({f:2200,f2:3400,d:.08,type:'sine',v:.35});tone({f:2400,f2:3600,d:.08,type:'sine',v:.35,t:.12});},
    zap:()=>tone({f:1800,f2:300,d:.25,type:'square',v:.3,vib:40,vibD:.2}),
    ice:()=>arp(['E7','B6','G6'],{d:.08,type:'triangle',v:.3,gap:.05}),
    gong:()=>{tone({f:110,d:1.2,type:'sine',v:.6});tone({f:165,d:1,type:'sine',v:.3});},
    start:()=>{['C5','E5','G5','C6'].forEach(n=>tone({f:NOTE(n),d:.6,type:'square',v:.22}));tone({f:NOTE('C3'),d:.6,type:'triangle',v:.5});},
    tvon:()=>{noise({d:.06,v:.8,f:2000});tone({f:15000,d:.5,type:'sine',v:.05});},
    legend:()=>{noise({d:.5,v:.9,f:3000,f2:200,q:.4});tone({f:73,d:2,type:'sawtooth',v:.4});tone({f:110,d:2,type:'square',v:.15,t:.1});['D4','A4','D5','F#5','A5'].forEach((n,i)=>tone({f:NOTE(n),d:.5,type:'square',v:.18,t:.4+i*.1}));}
  };
  const CRY={
    sanchez:()=>{tone({f:620,f2:330,d:.1,v:.45});noise({d:.08,v:.3,f:800});tone({f:640,f2:340,d:.12,v:.45,t:.18});noise({d:.08,v:.3,f:800,t:.18});},
    feijoo:()=>{tone({f:420,f2:380,d:.18,type:'triangle',v:.55});tone({f:420,f2:360,d:.32,type:'triangle',v:.55,t:.26});},
    ayuso:()=>tone({f:520,f2:880,d:.45,type:'sawtooth',v:.3,vib:7,vibD:.06}),
    almeida:()=>{const n=[700,950,1050,780];n.forEach((f,i)=>tone({f,f2:f*(i===3?.7:1.05),d:i===3?.4:.13,type:'square',v:.3,t:i*.13}));},
    abascal:()=>tone({f:950,f2:420,d:.75,type:'sawtooth',v:.3,vib:22,vibD:.07}),
    iglesias:()=>{noise({d:.12,v:.5,f:500,type:'lowpass'});tone({f:220,f2:160,d:.15,v:.35,t:.06});noise({d:.12,v:.5,f:500,type:'lowpass',t:.22});},
    yolanda:()=>{for(let i=0;i<6;i++)tone({f:i%2?1150:900,d:.07,type:'triangle',v:.35,t:i*.07});},
    puigdemont:()=>{for(let i=0;i<3;i++)tone({f:1500,f2:1900,d:.06,v:.3,t:i*.09});},
    rufian:()=>{tone({f:2000,f2:3000,d:.1,type:'sine',v:.4});tone({f:2100,f2:3200,d:.12,type:'sine',v:.4,t:.14});},
    rajoy:()=>tone({f:130,f2:85,d:.6,type:'sawtooth',v:.4,vib:9,vibD:.12}),
    felipe:()=>{tone({f:150,f2:130,d:.35,type:'sawtooth',v:.35});tone({f:300,d:.08,v:.25,t:.42});tone({f:330,d:.08,v:.25,t:.52});tone({f:300,d:.12,v:.25,t:.62});},
    colau:()=>{tone({f:320,f2:150,d:.2,type:'sine',v:.5,vib:12});tone({f:300,f2:140,d:.25,type:'sine',v:.5,vib:12,t:.22});}
  };
  const MOVE={falcon:'jet',barco:'engine',peugeot:'engine',peugeotBack:'engine',zasca:'slap',tezanazo:'thud',lluvia:'rain',cana:'pop',publico:'applause',fruta:'pops',
    referendum:'thud',impresora:'printer',alcalde:'wobble',dondedije:'wobble',m360:'wobble',rescate:'coins',independencia:'fanfare',derechita:'cluck',huelga:'whistle',
    calderon:'chant',parlem:'chime',flotilla:'horn',desahucios:'megaphone',caganer:'prrt',maletero:'door',chalet:'build',purga:'gong',comunismo:'fire',verbena:'fireworks',
    obras:'drill',cambio:'whoosh',otan:'door',isidoro:'whoosh',rosa:'thud',giratoria:'door',ave:'jet',votos:'printer',hijo:'chant',plasma:'static',vecino:'zap',derogar:'zap',nisino:'zap',chiringuitos:'lock',captura:'camera',tuit3am:'tweet',escucha:'chime',sonrisa:'heal',
    asaltar:'whoosh',casta:'whoosh',jornada:'fanfare',lucha:'thud',alquiler:'lock',bocata:'pop',mitinmadrid:'fire',caballo:'thud',pataleta:'thud'};
  // Música: corcheas; melodía y bajo originales
  const SONGS={
    battle:{s:.15,mel:'A4 . C5 E5 D5 . C5 B4 A4 . E4 . A4 B4 C5 . D5 . F5 . E5 D5 C5 . B4 . G4 . B4 C5 D5 . E5 . D5 C5 B4 . A4 B4 C5 . B4 A4 G#4 . E4 . A4 C5 E5 A5 G#5 . E5 . A5 . . . E5 . D5 .',
      bass:'A2 A2 D3 G2 C3 E2 A2 E2',lead:'square',bas:'triangle'},
    legend:{s:.14,mel:'D5 . . A4 D5 . E5 F#5 G5 . F#5 . E5 . D5 . B4 . . G4 B4 . C#5 D5 E5 . D5 . C#5 . A4 . D5 . . A4 D5 . E5 F#5 A5 . G5 . F#5 . E5 . F#5 . E5 . D5 . C#5 . D5 . . . A4 . . .',bass:'D3 G2 G2 A2 D3 B2 A2 D3',lead:'square',bas:'triangle'},
    legend82:{s:.115,mel:'D5 . . A4 D5 . E5 F#5 G5 . F#5 . E5 . D5 . B4 . . G4 B4 . C#5 D5 E5 . D5 . C#5 . A4 . D5 . . A4 D5 . E5 F#5 A5 . G5 . F#5 . E5 . F#5 . E5 . D5 . C#5 . D5 . . . A5 . . .',bass:'D3 G2 G2 A2 D3 B2 A2 D3',lead:'sawtooth',bas:'square'},
    title:{s:.17,mel:'C5 . E5 G5 . E5 C5 . D5 . F5 A5 . F5 D5 . E5 G5 C6 . B5 . G5 . A5 . G5 . F5 . D5 . E5 . C5 . D5 . G4 . C5 . E5 . G5 . E5 . F5 . A5 . G5 . F5 . E5 . D5 . C5 . . .',
      bass:'C3 G2 C3 F2 C3 C3 F2 G2',lead:'triangle',bas:'triangle'}
  };
  function schedule(){
    if(!ctx||!song)return;const S=SONGS[song],mel=S.mel.split(' '),bass=S.bass.split(' ');
    while(nextT<ctx.currentTime+.2){
      const i=step%mel.length,bar=Math.floor(i/8)%bass.length,n=mel[i];
      if(on){
        if(n!=='.'){let len=1;while(mel[(i+len)%mel.length]==='.'&&len<4)len++;tone({f:NOTE(n),d:S.s*len*.95,type:S.lead,v:.5,t:nextT-ctx.currentTime,dest:mus});}
        const r=NOTE(bass[bar]);const pat=[1,0,2,1,1,0,2,1][i%8];if(pat)tone({f:r*pat,d:S.s*.9,type:S.bas,v:.7,t:nextT-ctx.currentTime,dest:mus});
        if(i%4===2)noise({d:.04,v:.12,f:6000,type:'highpass',t:nextT-ctx.currentTime});
      }
      nextT+=S.s;step++;
    }
  }
  function music(name){
    if(!ctx)return;if(song===name)return;song=name;step=0;nextT=ctx.currentTime+.08;
    clearInterval(timer);timer=name?setInterval(schedule,40):null;
  }
  function jingle(won){music(null);if(!ok())return;
    if(won)['C5','E5','G5','C6','.','G5','C6'].forEach((n,i)=>n!=='.'&&tone({f:NOTE(n),d:i>4?.5:.14,type:'square',v:.4,t:i*.13}));
    else['G4','F4','E4','D4','C4'].forEach((n,i)=>tone({f:NOTE(n),d:i===4?.9:.3,type:'triangle',v:.5,t:i*.3}));
  }
  return{
    init,music,jingle,
    sfx:n=>{if(ok()&&SFX[n])try{SFX[n]();}catch(_){}if(SPEED!==0&&(n==='applause'||n==='boo'||n==='laugh'||n==='ooh'||n==='chant'))try{crowd();}catch(_){}} ,
    cry:id=>{if(ok()&&CRY[id])try{CRY[id]();}catch(_){}} ,
    move:id=>{if(ok()&&MOVE[id]&&SFX[MOVE[id]])try{SFX[MOVE[id]]();}catch(_){}} ,
    hit:(phys,e,crit)=>{if(!ok())return;SFX[phys?'hitP':'hitS']();if(crit)SFX.crit();if(e>1)setTimeout(SFX.superE,120);else if(e<1)setTimeout(SFX.weak,80);},
    get on(){return on;},
    toggle(){on=!on;try{localStorage.setItem(KEY('sonido'),on?'on':'off');}catch(_){}if(master)master.gain.value=on?1:0;return on;}
  };
})();
function syncSoundBtns(){document.querySelectorAll('.sndbtn').forEach(b=>{b.textContent=SND.on?'🔊':'🔇';b.setAttribute('aria-label',SND.on?'Silenciar sonido':'Activar sonido');});}
