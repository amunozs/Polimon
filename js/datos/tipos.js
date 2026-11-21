'use strict';
/* =====================================================================
   TIPOS: nombre, emoji y color de cada tipo, y la tabla de eficacias.
   CHART[atacante][defensor] = multiplicador (2 súper eficaz, .5 poco eficaz, 0 no afecta).
   Lo que no aparece en la tabla vale ×1.
   ===================================================================== */

const TYPES = {
  res: {n:'Resistencia',e:'🛡️',c:'#a7b1c4'},
  gal: {n:'Gallego',e:'🌫️',c:'#ecc659'},
  cas: {n:'Castizo',e:'🍺',c:'#f08457'},
  epi: {n:'Épico',e:'🐎',c:'#c99766'},
  asa: {n:'Asamblea',e:'✊',c:'#7dbb62'},
  tui: {n:'Tuit',e:'🐦',c:'#67a9f2'},
  hem: {n:'Hemeroteca',e:'📜',c:'#97d8e3'},
  fug: {n:'Fuga',e:'🚗',c:'#ad9ff3'},
  mit: {n:'Mitin',e:'🗣️',c:'#c3bcb1'}
};

const CHART = {
  res: {cas:.5,tui:.5,gal:.5,res:.5,hem:2},
  gal: {tui:2,fug:2,gal:.5,asa:.5,epi:0},
  cas: {asa:2,res:2,hem:2,cas:.5,tui:.5},
  epi: {cas:2,gal:2,res:2,asa:.5,fug:0},
  asa: {tui:2,epi:2,cas:.5,asa:.5,fug:.5,res:.5},
  tui: {cas:2,epi:2,tui:.5,asa:.5},
  hem: {asa:2,epi:2,fug:2,cas:.5,tui:.5,hem:.5,res:.5},
  fug: {asa:2,gal:.5,res:.5},
  mit: {res:.5}
};

const SN={atk:'Ataque',def:'Defensa',spa:'Ataque Esp.',spd:'Defensa Esp.',spe:'Velocidad'};

const ART={atk:'el',def:'la',spa:'el',spd:'la',spe:'la'};

const STLBL={par:['EN BLANCO','#c99a1a'],brn:['QUEMADO','#d2492f'],slp:['SIESTA','#6c6577'],frz:['DE PIEDRA','#3e9fb3']};
