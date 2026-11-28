# Polimón

Juego de combates por turnos, al estilo de los RPG de criaturas, con políticos españoles en clave de humor. Edición generales 29-N.

- **Jugar (producción):** https://amunozs.github.io/Polimon/
- **Preproducción (pruebas):** https://amunozs.github.io/Polimon/pre/

Parodia sin afiliación política. Todo es humor.

---

## Abrirlo en tu ordenador

No hace falta instalar nada: haz **doble clic en `index.html`** y se abre en el navegador.

## Estructura

```
index.html              estructura de la página (pantallas y botones)
config.js               ajustes generales: versión, rival fácil o listo, botón de café, plataforma
css/
  base.css              colores, tipografía, pantalla de selección
  combate.css           plató, personajes, barras, mensajes, bocadillos, efectos
  pantallas.css         inicio, legendarios, desbloqueo, fichas y final
js/
  datos/                ← lo que más se toca
    tipos.js            tipos y tabla de eficacias
    personajes.js       personajes, habilidades, frases de entrada y KO
    ataques.js          ataques (nombre, tipo, potencia, descripción, frase…)
    piques.js           diálogos entre rivales
    textos.js           titulares, onomatopeyas, folios, tuits…
  utilidades.js         funciones pequeñas comunes
  motor/
    combate.js          daño, turnos, estados, cambios, KO
    especiales.js       borrachera de Isabel, Resistencia de Sanxe, Chaqueta de pana, Culpar a los menas
    ia.js               cómo juega la máquina (rival fácil y rival listo)
  presentacion/
    sonido.js           música y efectos (sintetizados, sin ficheros de audio)
    animaciones.js      piezas de animación y FX de cada ataque
    interfaz.js         mensajes, bocadillos, barras y botones del combate
    pantallas.js        inicio, selección, fichas, flujo del combate y final
  inicio.js             conecta los botones y arranca (se carga el último)
img/                    personajes (<id>.webp, 320×320 con fondo transparente)
img/retro/              fotos del montaje de 1982 y logo del plató del PSOE
pruebas/                simulaciones automáticas (ver abajo)
```

Los ficheros se cargan en ese orden desde `index.html`. Todos comparten las mismas variables globales (es JavaScript «de toda la vida», sin módulos ni compilación), así que una función de un fichero se puede usar desde otro.

## Cambios habituales

**Cambiar una frase de entrada o de KO:** `js/datos/personajes.js`, busca el personaje y cambia `entry` o `ko`.

**Cambiar el nombre, la potencia o la frase de un ataque:** `js/datos/ataques.js`, busca su clave (por ejemplo `zasca:`).

**Añadir o cambiar un pique:** `js/datos/piques.js`. La clave son los dos ids en orden alfabético separados por `|`, por ejemplo `'iglesias|sanchez'`.

**Cambiar la imagen de un personaje:** sustituye `img/<id>.webp` y cambia `version` en `config.js` para que los móviles no se queden con la antigua.

### Añadir un personaje nuevo

1. Imagen en `img/<id>.webp` (cuadrada, fondo transparente).
2. Su ficha en `POL` dentro de `js/datos/personajes.js` (copia otra y cambia los datos). Si tiene una habilidad nueva, añádela a `ABIL` en el mismo fichero.
3. Sus ataques en `js/datos/ataques.js`. Las mecánicas que ya existen (`drain`, `multi`, `recoil`, `eff`…) se reutilizan copiando un ataque parecido.
4. Opcional:
   - animación propia en `FX` dentro de `js/presentacion/animaciones.js` (misma clave que el ataque; si no tiene, el ataque funciona igual sin animación);
   - grito en `CRY` y sonido del ataque en `MOVE` dentro de `js/presentacion/sonido.js`;
   - piques en `js/datos/piques.js`.
5. Prueba con `pruebas/equilibrio.py` que no queda ni muy fuerte ni muy flojo (lo normal: entre el 43% y el 60%).

**Cambiar la dificultad:** `config.js` → `rival`. Con `'facil'` la máquina ataca al azar (descarta los ataques que no afectan y curarse con la vida llena), nunca cambia de polímon por gusto y, si le eliminan uno, saca otro al azar. Con `'listo'` vuelve el rival que calcula daños y cambia cuando le conviene.

## Entornos

| Rama   | Dirección                                   | Uso |
|--------|---------------------------------------------|-----|
| `pre`  | https://amunozs.github.io/Polimon/pre/       | probar cambios (sale una etiqueta **PRE** naranja) |
| `main` | https://amunozs.github.io/Polimon/           | la que se comparte |

- Cada push a una de las dos ramas publica la web automáticamente (`.github/workflows/publicar.yml`).
- Requisito (una vez): *Settings → Pages → Source → GitHub Actions*.
- En preproducción las partidas guardadas (desbloqueos, sonido, ritmo) van aparte de las de producción.
- Para pasar a producción: fusionar `pre` en `main`.

## Pruebas automáticas

Necesitan Python y Playwright (`pip install playwright && playwright install chromium`).

- `python3 pruebas/equilibrio.py` — miles de combates IA contra IA; muestra el % de victorias de cada personaje.
- `python3 pruebas/partida_real.py` — 4 combates completos a velocidad real, con animaciones; avisa de errores.
- `python3 pruebas/dificultad.py` — cuánto gana un jugador humano típico contra la máquina.

## Estadísticas

El juego puede contar visitas y partidas de forma anónima con [GoatCounter](https://www.goatcounter.com/) (sin cookies ni datos personales). Se configura en `config.js` → `analitica` y solo cuenta en producción (`amunozs.github.io`). Eventos que se registran:

- `evento/partida-empezada`, `evento/victoria`, `evento/derrota`
- `evento/personaje/<id>` por cada personaje elegido
- `evento/felipe-desbloqueado`

## Pendiente para Android

- Las fuentes se cargan de Google Fonts; para que la app funcione sin conexión habrá que incluirlas en el proyecto.
- El botón de «Invítame a un café» está preparado en `config.js` (`cafe`), apagado por ahora. Revisar las normas de pagos de Google Play antes de activarlo en la app (`plataforma: 'android'`).

## Material de terceros

Las fotos de `img/retro/` y el logo del PSOE se usan en tono de parodia. Si algún titular de derechos lo pide, se retiran sin más.
