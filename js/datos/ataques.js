'use strict';
/* =====================================================================
   ATAQUES.
   Campos habituales:
     name   nombre visible            type  tipo (ver tipos.js)
     cat    P físico · S especial · X estado (no hace daño)
     power  potencia                  acc   precisión (%)
     pp     usos por combate          desc  descripción de la ficha
     quip   frase al usarlo
   El resto de campos (eff, drain, multi, recoil…) activan mecánicas del motor (motor/combate.js).
   Las animaciones de cada ataque están en presentacion/animaciones.js (objeto FX, misma clave).
   ===================================================================== */

const MOVES = {
  peugeot: {
    name: 'Gira en Peugeot',
    type: 'res',
    cat: 'X',
    pp: 5,
    target: 'self',
    eff: {kind:'peugeot'},
    desc: 'Se va de gira dos turnos: nadie le puede atacar y vuelve con el 60% de los PS recuperado.',
    quip: 'Arranca el Peugeot y se va a recorrer España.'
  },

  dondedije: {
    name: 'Donde dije digo',
    type: 'res',
    cat: 'X',
    pp: 10,
    target: 'self',
    eff: {kind:'retype'},
    desc: 'Cambia su tipo por uno que resista el último ataque que ha recibido.',
    quip: 'Cambia de opinión… y de tipo.'
  },

  tezanazo: {
    name: 'Tezanazo',
    type: 'res',
    cat: 'P',
    power: 80,
    acc: 100,
    pp: 15,
    secVol: {confuse:.2},
    desc: '20% de liar al rival.',
    quip: 'Le cae encima una encuesta del CIS.'
  },

  falcon: {
    name: 'Vuelo en Falcon',
    type: 'fug',
    cat: 'P',
    power: 120,
    acc: 100,
    pp: 15,
    contact: 1,
    recoil: .3333333333333333,
    desc: 'Se hace 1/3 del daño que causa.',
    quip: 'Despega en el Falcon… rumbo a un concierto.'
  },

  nisino: {
    name: 'Ni sí ni no',
    type: 'gal',
    cat: 'S',
    power: 110,
    acc: 100,
    pp: 10,
    coin: 1,
    desc: 'Moneda al aire: cara, golpe fuerte; cruz, le cura al rival.',
    quip: '¿Cara o cruz? Depende.'
  },

  derogar: {
    name: 'Derogar el sanchismo',
    type: 'gal',
    cat: 'S',
    power: 90,
    acc: 100,
    pp: 15,
    sec: {status:'par',chance:.1},
    desc: '10% de dejar en blanco.',
    quip: 'Promete derogarlo todo.'
  },

  gestion: {
    name: 'Gestión',
    type: 'gal',
    cat: 'X',
    pp: 10,
    eff: {kind:'gestion'},
    desc: 'Elige qué gestionar: Sanidad (le quita 1/4 de la vida al rival), Educación (le baja mucho el Ataque Esp.) o Pensiones (le baja mucho el Ataque).',
    quip: '«Esto es gestión.»'
  },

  lluvia: {
    name: 'Siempre llueve en Galicia',
    type: 'gal',
    cat: 'X',
    pp: 5,
    target: 'field',
    eff: {kind:'weather',w:'rain'},
    desc: 'Lluvia 5 turnos: los ataques Gallego no fallan, los Tuit pegan más y los Castizo menos.',
    quip: 'Se nubla todo el plató.'
  },

  barco: {
    name: 'Paseo en barco',
    type: 'tui',
    cat: 'S',
    power: 90,
    acc: 100,
    pp: 10,
    desc: 'Golpe fuerte.',
    quip: 'Una lancha cruza a toda velocidad.'
  },

  comunismo: {
    name: 'Comunismo o libertad',
    type: 'cas',
    cat: 'S',
    power: 80,
    acc: 100,
    pp: 15,
    sec: {status:'brn',chance:.1},
    desc: '10% de quemar.',
    quip: '«¡Comunismo o libertad!»'
  },

  fruta: {
    name: 'Me gusta la fruta',
    type: 'cas',
    cat: 'S',
    power: 110,
    eruption: 1,
    acc: 100,
    pp: 5,
    desc: 'Hasta 110 de potencia; menos cuantos menos PS le queden. Siempre crítico contra Perro Sanxe.',
    quip: '«Me gusta la fruta.»'
  },

  cana: {
    name: 'La libertad es una caña',
    type: 'cas',
    cat: 'X',
    pp: 5,
    target: 'field',
    eff: {kind:'weather',w:'sun'},
    desc: 'Terrazas 5 turnos: lo Castizo pega más, lo Tuit menos, e Isabel se cura un poco cada turno.',
    quip: 'Se abren las terrazas.'
  },

  bocata: {
    name: 'Culpar al Gobierno central',
    type: 'epi',
    cat: 'S',
    power: 60,
    acc: 100,
    pp: 10,
    drain: .5,
    desc: 'Le echa la culpa a Moncloa y se cura con la mitad del daño.',
    quip: '¡Esto es culpa del Gobierno de Sánchez!'
  },

  obras: {
    name: 'Obras en Madrid',
    type: 'mit',
    cat: 'X',
    pp: 10,
    target: 'field',
    eff: {kind:'obras'},
    desc: 'Conos en el lado rival 3 turnos: no puede cambiar de político y pierde 1/8 de PS cada turno.',
    quip: 'Corta la calle por obras.'
  },

  m360: {
    name: 'Madrid 360',
    type: 'mit',
    cat: 'X',
    pp: 20,
    target: 'self',
    eff: {kind:'copycat'},
    desc: 'Se disfraza del rival y repite el último ataque usado en el combate.',
    quip: 'Copia la idea y le cambia el nombre.'
  },

  calderon: {
    name: 'Cántico del Calderón',
    type: 'mit',
    cat: 'S',
    power: 90,
    acc: 100,
    pp: 10,
    sound: 1,
    desc: 'Atraviesa a los dobles, como el chalet.',
    quip: 'Se arranca con el himno del Atleti.'
  },

  verbena: {
    name: 'Verbena de San Isidro',
    type: 'cas',
    cat: 'S',
    power: 85,
    acc: 100,
    pp: 15,
    sec: {status:'brn',chance:.1},
    desc: '10% de quemar.',
    quip: 'Chotis, rosquillas y fuego.'
  },

  caballo: {
    name: 'Carga a caballo',
    type: 'epi',
    cat: 'P',
    power: 95,
    acc: 100,
    pp: 10,
    contact: 1,
    desc: 'Embestida al galope, muy potente.',
    quip: 'Carga al galope.'
  },

  publico: {
    name: 'Llevar su propio público',
    type: 'epi',
    cat: 'X',
    pp: 5,
    target: 'field',
    eff: {kind:'publico'},
    desc: '5 turnos (o hasta que se retire): le aplauden, sus ataques +30%, y al rival le abuchean (10% más de fallar).',
    quip: 'Llegan los autobuses con su público.'
  },

  derechita: {
    name: 'Derechita cobarde',
    type: 'res',
    cat: 'P',
    power: 80,
    acc: 100,
    pp: 15,
    contact: 1,
    vsPP: 1,
    desc: 'Hace el doble de daño a los del PP.',
    quip: '«¡Derechita cobarde!»'
  },

  menas: {
    name: 'Culpar a los menas',
    type: 'mit',
    cat: 'P',
    power: 110,
    acc: 100,
    pp: 10,
    bulo: .35,
    desc: 'Golpe muy fuerte… pero el 35% de las veces es un BULO: falla y le rebota una cuarta parte del daño.',
    quip: '«¡La culpa es de los menas!»'
  },

  chiringuitos: {
    name: '¡Cerrar chiringuitos!',
    type: 'hem',
    cat: 'P',
    power: 65,
    acc: 95,
    pp: 15,
    contact: 1,
    sec: {status:'frz',chance:.1},
    flinch: .1,
    desc: '10% de dejar de piedra y 10% de arrugar.',
    quip: 'Promete cerrarlos todos… menos el suyo.'
  },

  asaltar: {
    name: 'Asaltar los cielos',
    type: 'asa',
    cat: 'S',
    power: 130,
    acc: 90,
    pp: 5,
    selfBoost: {spa:-2},
    desc: 'Muy potente, pero luego −2 Ataque Esp.',
    quip: '¡Al asalto de los cielos!'
  },

  casta: {
    name: 'La casta',
    type: 'asa',
    cat: 'S',
    power: 75,
    acc: 100,
    pp: 10,
    drain: .5,
    desc: 'Recupera la mitad del daño que causa.',
    quip: 'Señala a la casta desde el chalet.'
  },

  chalet: {
    name: 'Chalet en Galapagar',
    type: 'asa',
    cat: 'X',
    pp: 10,
    target: 'self',
    eff: {kind:'sub'},
    desc: 'Gasta 1/4 de PS: un chalet ocupa su sitio y recibe los golpes hasta derrumbarse.',
    quip: 'Se atrinchera en el chalet.'
  },

  purga: {
    name: 'Purga en Vistalegre',
    type: 'epi',
    cat: 'P',
    power: 120,
    acc: 100,
    pp: 10,
    purge: 1,
    desc: 'Golpe muy fuerte, pero un compañero de su banquillo pierde 1/5 de sus PS.',
    quip: 'Ajusta cuentas con los suyos en Vistalegre.'
  },

  escucha: {
    name: 'Proceso de escucha',
    type: 'asa',
    cat: 'X',
    acc: 90,
    pp: 10,
    eff: {kind:'seed'},
    desc: 'Le roba 1/8 de PS al rival cada turno.',
    quip: 'Abre un proceso de escucha.'
  },

  sonrisa: {
    name: 'Sonrisa radiante',
    type: 'asa',
    cat: 'X',
    pp: 5,
    target: 'self',
    eff: {kind:'heal',frac:.5,charm:1},
    desc: 'Recupera el 50% de los PS y baja el Ataque del rival: no hay quien le pegue a esa sonrisa.',
    quip: 'Sonríe. Mucho.'
  },

  jornada: {
    name: 'Jornada de 37,5 horas',
    type: 'asa',
    cat: 'S',
    power: 170,
    acc: 100,
    pp: 10,
    charge: 'law',
    veto: .25,
    chargeMsg: 'registra la ley. Se vota en el próximo turno…',
    desc: 'Un turno para registrarla y al siguiente, golpe muy fuerte. 25% de que la tumbe el Congreso. Con terrazas, sale sin esperar.',
    quip: '¡Votación en el Congreso!'
  },

  huelga: {
    name: 'Huelga general',
    type: 'epi',
    cat: 'P',
    power: 100,
    acc: 100,
    pp: 10,
    desc: 'Ataque fuerte sin efectos extra.',
    quip: 'Convoca huelga general.'
  },

  maletero: {
    name: 'Maletero',
    type: 'fug',
    cat: 'X',
    pp: 10,
    prio: 4,
    target: 'self',
    eff: {kind:'protect'},
    desc: 'Bloquea el ataque de este turno. Usado seguido suele fallar.',
    quip: 'Se mete en un maletero.'
  },

  referendum: {
    name: 'Referéndum ilegal',
    type: 'fug',
    cat: 'P',
    power: 25,
    acc: 100,
    pp: 15,
    multi: 1,
    desc: 'Llueven urnas: golpea de 2 a 5 veces.',
    quip: 'Saca las urnas.'
  },

  proces: {
    name: 'Procés',
    type: 'fug',
    cat: 'P',
    power: 65,
    acc: 100,
    pp: 15,
    sec: {status:'slp',chance:.3,msg:'¡El procés es tan largo que {t} se ha quedado roque!'},
    desc: 'Golpe normal con un 30% de que el rival se duerma de aburrimiento.',
    quip: '«Esto va para largo…»'
  },

  segadors: {
    name: 'Els Segadors',
    type: 'epi',
    cat: 'P',
    power: 85,
    acc: 100,
    pp: 10,
    highCrit: 1,
    breaks: 1,
    desc: '¡Bon cop de falç! Golpe con muchos críticos que siega las protecciones del rival (protección, chalet y escudo de la OTAN).',
    quip: '«Bon cop de falç!»'
  },

  caganer: {
    name: 'Caganer',
    type: 'mit',
    cat: 'X',
    pp: 5,
    target: 'field',
    eff: {kind:'caganer'},
    desc: 'Deja un caganer en el lado rival: cada político que entre pierde 1/8 de PS al pisarlo.',
    quip: 'Deja un caganer de regalo.'
  },

  independencia: {
    name: 'Independencia de 8 segundos',
    type: 'mit',
    cat: 'P',
    power: 120,
    acc: 100,
    pp: 10,
    contact: 1,
    suspend: .25,
    desc: 'Golpe enorme, pero a los 8 segundos se suspende: el rival recupera 1/4 del daño.',
    quip: 'Declara la independencia…'
  },

  zasca: {
    name: 'Zasca',
    type: 'tui',
    cat: 'P',
    power: 85,
    acc: 100,
    pp: 10,
    contact: 1,
    secTarget: {def:-1,chance:.2},
    desc: '20% de bajar la Defensa del rival.',
    quip: '¡Zasca!'
  },

  tuit3am: {
    name: 'Tuit de las 3 a.m.',
    type: 'tui',
    cat: 'P',
    power: 40,
    acc: 100,
    pp: 20,
    prio: 1,
    contact: 1,
    desc: 'Siempre ataca primero.',
    quip: 'Tuitea de madrugada.'
  },

  impresora: {
    name: 'Impresora en el Congreso',
    type: 'tui',
    cat: 'P',
    power: 25,
    acc: 100,
    pp: 15,
    multi: 1,
    desc: 'Dispara de 2 a 5 folios.',
    quip: 'Saca la impresora en el hemiciclo.'
  },

  captura: {
    name: 'Captura de pantalla',
    type: 'hem',
    cat: 'P',
    power: 75,
    acc: 100,
    pp: 15,
    contact: 1,
    sec: {status:'frz',chance:.1},
    desc: '10% de dejar de piedra.',
    quip: 'Rescata un tuit de 2015.'
  },

  alcalde: {
    name: 'Es el alcalde…',
    type: 'gal',
    cat: 'X',
    acc: 75,
    pp: 10,
    eff: {kind:'confuse'},
    desc: 'Lía al rival: puede pegarse a sí mismo. Si el liado eres tú, tus botones se desordenan.',
    quip: '«…el que quiere que sean los vecinos el alcalde.»'
  },

  vecino: {
    name: 'Cuanto peor, mejor',
    type: 'gal',
    cat: 'S',
    power: 65,
    acc: 100,
    pp: 15,
    sec: {status:'par',chance:.1},
    desc: '10% de dejar en blanco.',
    quip: '«…para todos, y cuanto peor para todos, mejor.»'
  },

  plasma: {
    name: 'Comparecencia en plasma',
    type: 'fug',
    cat: 'S',
    power: 75,
    acc: 90,
    pp: 15,
    flinch: .1,
    desc: '10% de que el rival se arrugue.',
    quip: 'Comparece en una pantalla.'
  },

  rescate: {
    name: 'Rescate bancario',
    type: 'gal',
    cat: 'X',
    pp: 1,
    target: 'self',
    eff: {kind:'rescate'},
    desc: 'Resucita a un compañero derrotado con 1/3 de los PS (una vez). Si no hay ninguno, se cura el 50%.',
    quip: '«No es un rescate, es una línea de crédito.»'
  },

  desahucios: {
    name: 'Stop Desahucios',
    type: 'asa',
    cat: 'P',
    power: 120,
    acc: 85,
    pp: 10,
    contact: 1,
    desc: 'Pancarta gigante: golpe muy fuerte, pero puede fallar.',
    quip: 'Despliega la pancarta de Stop Desahucios.'
  },

  lucha: {
    name: 'Lucha obrera',
    type: 'res',
    cat: 'P',
    power: 95,
    acc: 100,
    pp: 15,
    contact: 1,
    foul: 1,
    desc: 'Usa la fuerza del rival contra él: el daño se calcula con el Ataque del rival.',
    quip: '¡La fuerza del patrón, contra el patrón!'
  },

  alquiler: {
    name: 'Limitar alquileres',
    type: 'asa',
    cat: 'X',
    pp: 10,
    target: 'self',
    eff: {kind:'cap'},
    desc: 'Durante 3 turnos, ningún golpe le quita más de 1/4 de su vida de una vez.',
    quip: 'Pone un tope a lo que le pueden cobrar.'
  },

  flotilla: {
    name: 'Flotilla a Gaza',
    type: 'mit',
    cat: 'P',
    power: 140,
    acc: 100,
    pp: 5,
    charge: 'mar',
    intercept: .3,
    chargeMsg: 'zarpa desde Barcelona con toda la prensa en el puerto. Llega en el próximo turno…',
    desc: 'Un turno para zarpar y al siguiente llega con toda la flotilla: golpe muy fuerte. 30% de que la intercepten: no hace daño, pero vuelve como una heroína y le sube mucho el Ataque.',
    quip: '¡Tierra a la vista… y cámaras también!'
  },

  parlem: {
    name: 'Parlem',
    type: 'mit',
    cat: 'X',
    acc: 100,
    pp: 10,
    eff: {kind:'parlem'},
    desc: 'El rival se sienta a dialogar y pierde su siguiente turno. Seguido, puede fallar.',
    quip: '«Parlem.» Saca la bandera blanca.'
  },

  cambio: {
    name: 'Por el cambio',
    type: 'mit',
    cat: 'X',
    acc: 100,
    pp: 5,
    eff: {kind:'swaphp'},
    desc: 'Intercambia su porcentaje de vida con el del rival.',
    quip: '«Por el cambio.»'
  },

  otan: {
    name: 'OTAN, de entrada no',
    type: 'res',
    cat: 'X',
    pp: 10,
    prio: 4,
    target: 'self',
    eff: {kind:'otan'},
    desc: 'Se pone en guardia: si le golpean este turno, devuelve el doble del daño. Seguido puede fallar.',
    quip: '«De entrada, no.»'
  },

  isidoro: {
    name: 'Isidoro',
    type: 'fug',
    cat: 'X',
    pp: 5,
    target: 'self',
    eff: {kind:'isidoro'},
    desc: '3 turnos en la clandestinidad: los ataques contra él fallan la mitad de las veces y los suyos son siempre críticos.',
    quip: 'Gabardina, gafas de sol… y a la clandestinidad.'
  },

  pana: {
    name: 'Chaqueta de pana',
    type: 'asa',
    cat: 'P',
    power: 100,
    acc: null,
    pp: 1,
    legend: 1,
    desc: 'ATAQUE LEGENDARIO (1 vez). Vuelve el Felipe del 82: se cura entero, lanza una onda expansiva, pega un 50% más el resto del combate y cambia sus cuatro ataques.',
    quip: '¡Vuelve el Felipe del 82!'
  },

  rosa: {
    name: 'Puño y rosa',
    type: 'asa',
    cat: 'P',
    power: 110,
    acc: 100,
    pp: 10,
    contact: 1,
    desc: 'Forma del 82: el puño y la rosa, golpe muy fuerte.',
    quip: '¡El puño y la rosa!'
  },

  giratoria: {
    name: 'Puerta giratoria',
    type: 'res',
    cat: 'P',
    power: 80,
    acc: 100,
    pp: 10,
    contact: 1,
    drain: .5,
    desc: 'Le quita vida al rival y se queda la mitad: cobra dietas.',
    quip: 'Entra por la puerta giratoria… y sale de consejero.'
  },

  ave: {
    name: 'AVE Madrid-Sevilla',
    type: 'epi',
    cat: 'P',
    power: 95,
    acc: 100,
    pp: 5,
    splash: 1,
    desc: 'Forma del 82: un tren de alta velocidad arrolla al rival y a todo su banquillo (1/8 de PS a cada uno).',
    quip: '¡Viajeros al tren! Madrid-Sevilla, sin paradas.'
  },

  votos: {
    name: 'Diez millones de votos',
    type: 'mit',
    cat: 'P',
    power: 22,
    acc: 100,
    pp: 10,
    multi: 2,
    desc: 'Forma del 82: llueven papeletas, de 3 a 6 golpes.',
    quip: '¡Más de diez millones de votos!'
  },

  hijo: {
    name: '¡Queremos un hijo tuyo!',
    type: 'asa',
    cat: 'S',
    power: 85,
    acc: 100,
    pp: 10,
    secVol: {confuse:.3},
    desc: 'Forma del 82: la multitud corea el cántico más famoso de 1982. 30% de liar al rival.',
    quip: '«¡Felipe, capullo, queremos un hijo tuyo!»'
  },

  pataleta: {
    name: 'Pataleta',
    type: null,
    cat: 'P',
    power: 50,
    acc: null,
    pp: 1,
    contact: 1,
    recoilMax: .25,
    desc: '',
    quip: 'Se ha quedado sin argumentos y patalea.'
  }
};

const NOCOPY=new Set(['m360','pataleta','rescate','pana','cambio']);
