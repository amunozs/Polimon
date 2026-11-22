'use strict';
/* =====================================================================
   CONFIGURACIÓN GENERAL DE POLIMÓN
   Ajustes que cambian el comportamiento sin tocar el resto del código.
   ===================================================================== */
const CONFIG = {
  // Cámbiala al publicar imágenes nuevas: obliga a los móviles a descargarlas otra vez.
  version: '2026-11-21',

  // Botón de «Invítame a un café» (preparado, todavía no se muestra)
  cafe: {
    activo: false,
    texto: '☕ Invítame a un café',
    url: ''
  },

  // Estadísticas anónimas con GoatCounter (sin cookies ni datos personales).
  // codigo: el nombre de tu cuenta (https://<codigo>.goatcounter.com). Solo cuenta en el dominio indicado,
  // así que preproducción y las pruebas en tu ordenador no ensucian los datos.
  analitica: {
    activo: false,
    codigo: '',
    dominio: 'amunozs.github.io'
  },

  // 'web' o 'android'. Sirve para ocultar cosas según dónde se publique
  // (por ejemplo, enlaces de pago, que Google Play regula de forma estricta).
  plataforma: 'web'
};

// Entorno: se detecta solo. 'pre' si la dirección contiene /pre/; 'prod' en el resto.
const ENTORNO = /\/pre(\/|$)/.test(location.pathname) ? 'pre' : 'prod';

// Clave de guardado: en preproducción las partidas (desbloqueos, sonido, ritmo) van aparte.
const KEY = k => (ENTORNO === 'pre' ? 'polimon-pre-' : 'polimon-') + k;

// ¿Se mandan estadísticas desde aquí? Solo en producción y en el dominio público.
const ANALITICA_ON = CONFIG.analitica.activo && !!CONFIG.analitica.codigo && ENTORNO === 'prod' && location.hostname === CONFIG.analitica.dominio;
