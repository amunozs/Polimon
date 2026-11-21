'use strict';
/* =====================================================================
   PIQUES: diálogo cuando se encuentran dos rivales (y +20% de daño entre ellos).
   Clave: los dos ids en orden alfabético separados por |. Cada línea: [quién habla, frase].
   ===================================================================== */

const RIV = {
  'felipe|sanchez': [
    ['felipe','«Este no es mi PSOE.»'],
    ['sanchez','«Usted es un jarrón chino.»']
  ],

  'felipe|iglesias': [
    ['iglesias','«¡Casta!»'],
    ['felipe','«Yo ya era casta cuando tú ibas en pañales.»']
  ],

  'felipe|rajoy': [
    ['rajoy','«Es muy difícil todo esto.»'],
    ['felipe','«Para ti, Mariano. Para ti.»']
  ],

  'felipe|puigdemont': [
    ['puigdemont','«¡Referéndum!»'],
    ['felipe','«De entrada, no.»']
  ],

  'almeida|colau': [
    ['almeida','«Alcaldesa, ¿y esos macetones?»'],
    ['colau','«Mejor que tus obras.»']
  ],

  'ayuso|colau': [
    ['ayuso','«En Madrid hay libertad.»'],
    ['colau','«Y alquileres de 1.500 euros.»']
  ],

  'abascal|colau': [
    ['abascal','«¡Fuera okupas!»'],
    ['colau','«Y tú, fuera de mi barrio.»']
  ],

  'colau|puigdemont': [
    ['colau','«Ni DUI ni 155.»'],
    ['puigdemont','«Equidistante.»']
  ],

  'abascal|feijoo': [
    ['abascal','«Derechita cobarde.»'],
    ['feijoo','«Depende.»']
  ],

  'abascal|iglesias': [
    ['abascal','«¡Vete a Venezuela!»'],
    ['iglesias','«¡Y tú, al caballo!»']
  ],

  'abascal|puigdemont': [
    ['abascal','«¡A prisión!»'],
    ['puigdemont','«Primero tendrás que encontrarme.»']
  ],

  'ayuso|feijoo': [
    ['feijoo','«Isabel, que el candidato soy yo.»'],
    ['ayuso','«De momento.»']
  ],

  'almeida|ayuso': [
    ['almeida','«Presidenta…»'],
    ['ayuso','«Alcalde.»']
  ],

  'ayuso|sanchez': [
    ['ayuso','«Me gusta la fruta.»'],
    ['sanchez','«Y a mí el Falcon.»']
  ],

  'feijoo|rajoy': [
    ['feijoo','«Mariano, ¿esto cómo iba?»'],
    ['rajoy','«Es muy difícil todo esto.»']
  ],

  'feijoo|sanchez': [
    ['feijoo','«Gané las elecciones.»'],
    ['sanchez','«Y yo gobierno.»']
  ],

  'iglesias|sanchez': [
    ['sanchez','«No dormiría tranquilo con usted en el Gobierno.»'],
    ['iglesias','«Y aun así me hiciste vicepresidente.»'],
    ['iglesias','«No te pongas nervioso, Pedro.»']
  ],

  'iglesias|yolanda': [
    ['iglesias','«Te elegí yo, Yolanda.»'],
    ['yolanda','«Y yo te escuché. Un poco.»']
  ],

  'puigdemont|sanchez': [
    ['puigdemont','«Amnistía primero.»'],
    ['sanchez','«Hagamos de la necesidad virtud.»']
  ],

  'puigdemont|rufian': [
    ['rufian','«155 monedas de plata.»'],
    ['puigdemont','«Eso fue en 2017.»']
  ],

  'rajoy|sanchez': [
    ['rajoy','«Me echó con una moción de censura.»'],
    ['sanchez','«Usted estaba en el restaurante.»']
  ]
};

const rivKey=(a,b)=>[a,b].sort().join('|');
