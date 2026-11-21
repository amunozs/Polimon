'use strict';
/* =====================================================================
   PERSONAJES Y HABILIDADES.
   Cada personaje (POL) tiene:
     id       identificador interno (también el nombre de su imagen: img/<id>.webp)
     name     nombre que se ve en el juego (short: versión corta, normalmente igual)
     types    uno o dos tipos (ver tipos.js)
     base     estadísticas base [Vida, Ataque, Defensa, Ataque Esp., Defensa Esp., Velocidad]
     ability  id de su habilidad (ver ABIL justo debajo)
     moves    ids de sus cuatro ataques (ver ataques.js)
     entry    frase al entrar en combate · ko: frase al caer
     legend   1 si es legendario (se desbloquea)
   ===================================================================== */

const ABIL = {
  robustez: {
    n: 'Manual de Resistencia',
    d: 'La primera vez que va a caer, se queda con 1 PS. Venga de donde venga el golpe.'
  },
  estatica: {n:'Niebla gallega',d:'30% de dejar en blanco (paralizar) a quien le ataque cuerpo a cuerpo.'},
  marllamas: {n:'Sin complejos',d:'Con 1/3 de PS o menos, sus ataques Castizo hacen +50%.'},
  competitivo: {
    n: 'Abucheo de Vicálvaro',
    d: 'Si le bajan una estadística o le abuchean, se crece: sube su Ataque Esp.'
  },
  aguante: {n:'Aguante',d:'Cada golpe que recibe le sube la Defensa.'},
  espesura: {n:'Asalto final',d:'Con 1/3 de PS o menos, sus ataques Asamblea hacen +50%.'},
  regeneracion: {
    n: 'Paso al lado',
    d: 'La primera vez que baja de la mitad de PS, se aparta un momento y recupera 1/3.'
  },
  intimidacion: {n:'Llegada triunfal',d:'Al entrar en combate, baja el Ataque del rival.'},
  torrente: {n:'18 meses',d:'Cuando parece que se va, se crece: con 1/3 de PS o menos, Tuit +50%.'},
  presion: {n:'Presión',d:'El rival gasta 2 PP por ataque intentando entenderle.'},
  jarron: {
    n: 'Jarrón chino',
    d: 'La primera vez que iba a caer, se convierte en jarrón chino: 2 turnos sin atacar aguantando los golpes, y vuelve con un 30% de vida.'
  },
  sindicalismo: {
    n: 'Sindicalismo',
    d: 'Quien la ataque cuerpo a cuerpo se topa con un piquete y pierde 1/8 de sus PS.'
  }
};

const PINCH={marllamas:'cas',espesura:'asa',torrente:'tui'};

const PP_IDS=new Set(['feijoo','ayuso','almeida','rajoy']);

const POL = [
  {
    id: 'sanchez',
    name: 'Perro Sanxe',
    short: 'Perro Sanxe',
    types: ['res','fug'],
    base: [98,87,105,53,85,67],
    ability: 'robustez',
    moves: ['peugeot','dondedije','tezanazo','falcon'],
    entry: '«Aquí sigo.»',
    ko: '«Me tomo cinco días para pensarlo.»'
  },

  {
    id: 'feijoo',
    name: 'Núñez Fariñas',
    short: 'Núñez Fariñas',
    types: ['gal'],
    base: [90,75,85,115,90,55],
    ability: 'estatica',
    moves: ['nisino','derogar','lluvia','barco'],
    entry: '«Depende de cómo se mire.»',
    ko: '«Técnicamente, he ganado.»'
  },

  {
    id: 'ayuso',
    name: 'Isabel Libertad',
    short: 'Isabel Libertad',
    types: ['cas'],
    base: [73,76,75,81,100,100],
    ability: 'marllamas',
    moves: ['comunismo','fruta','cana','bocata'],
    entry: '«¡Libertad!»',
    ko: '«Me voy de cañas. Libremente.»'
  },

  {
    id: 'almeida',
    name: 'Carapolla',
    short: 'Carapolla',
    types: ['cas'],
    base: [86,68,72,109,66,106],
    ability: 'competitivo',
    moves: ['obras','m360','calderon','verbena'],
    entry: '«Partido a partido.»',
    ko: '«Partido a partido… y este lo hemos perdido.»'
  },

  {
    id: 'abascal',
    name: 'Santi Reconquista',
    short: 'Santi Reconquista',
    types: ['epi'],
    base: [100,125,100,55,85,35],
    ability: 'aguante',
    moves: ['caballo','publico','derechita','menas'],
    entry: '«¡Por España!»',
    ko: '«¡Culpa de los moros!»'
  },

  {
    id: 'iglesias',
    name: 'Pablo Ex-Coletas',
    short: 'Pablo Ex-Coletas',
    types: ['asa'],
    base: [70,85,65,105,85,120],
    ability: 'espesura',
    moves: ['asaltar','casta','chalet','purga'],
    entry: 'Viene a asaltar los cielos.',
    ko: '«Me corto la coleta. Otra vez.»'
  },

  {
    id: 'yolanda',
    name: 'Yoli Sonrisas',
    short: 'Yoli Sonrisas',
    types: ['asa'],
    base: [80,82,100,83,100,80],
    ability: 'regeneracion',
    moves: ['escucha','sonrisa','jornada','huelga'],
    entry: 'Viene a escuchar.',
    ko: '«Doy un paso al lado.» Sonriendo, eso sí.'
  },

  {
    id: 'puigdemont',
    name: 'Puchi Procés',
    short: 'Puchi Procés',
    types: ['fug'],
    base: [85,120,70,50,60,100],
    ability: 'intimidacion',
    moves: ['maletero','referendum','segadors','independencia'],
    entry: 'Ha vuelto… de momento.',
    ko: '«Me voy… otra vez.»'
  },

  {
    id: 'rufian',
    name: 'Rufi Impresoras',
    short: 'Rufi Impresoras',
    types: ['tui'],
    base: [85,105,100,79,83,78],
    ability: 'torrente',
    moves: ['zasca','tuit3am','impresora','captura'],
    entry: '«Los derechos no obligan, son las derechas las que obligan.»',
    ko: '«¡Pero si yo solo venía para dieciocho meses!»'
  },

  {
    id: 'rajoy',
    name: 'Mariano Viva el Vino',
    short: 'Mariano Viva el Vino',
    types: ['gal','fug'],
    base: [50,65,107,105,107,86],
    ability: 'presion',
    moves: ['alcalde','vecino','plasma','rescate'],
    entry: '«Somos sentimientos y tenemos seres humanos.»',
    ko: '«Me voy al bar.»'
  },

  {
    id: 'felipe',
    name: 'Felipe GALzález',
    short: 'Felipe GALzález',
    legend: 1,
    types: ['asa','epi'],
    base: [100,100,100,100,100,100],
    ability: 'jarron',
    moves: ['cambio','otan','giratoria','pana'],
    entry: '«Por el cambio.»',
    ko: '«Me voy a Gas Natural.»'
  },

  {
    id: 'colau',
    name: 'Ada Okupau',
    short: 'Ada Okupau',
    types: ['asa','res'],
    base: [74,94,131,54,116,20],
    ability: 'sindicalismo',
    moves: ['desahucios','lucha','alquiler','parlem'],
    entry: '«Esta casa ahora es mía.»',
    ko: '«¡Esto es un desahucio!»'
  }
];

const POLBY=Object.fromEntries(POL.map(p=>[p.id,p]));

const LV=50;

const F82=['rosa','ave','votos','hijo'];

let UNL={felipe:false};try{UNL.felipe=localStorage.getItem(KEY('legend-felipe'))==='1';}catch(_){}

const isLocked=p=>p.legend&&!UNL[p.id];

