# Federico Rosciani — sitio personal

Una sola página con scrollytelling, con la misma gramática que la web de
Club del Picante, contando **"de la idea a producción"**. El hilo es una
**nube de ~9.000 partículas de datos** (Three.js) que queda fija y cambia de
forma con el scroll.

Recorrido:

1. **Apertura** — la pantalla naranja es una chispa vista de cerca: se cierra
   sobre ella y queda la idea, sola. *"Todo empieza con una idea."*
2. **Hero** — la chispa explota y se vuelve un globo de datos: *"De la idea a producción"*.
3. **Flujo** — los datos caen en un chorro y la pantalla se inunda: *"Datos + IA + Apps."*
4. **Proceso** (de costado) — Idea → Datos → App → Producción. La nube toma la
   forma de cada paso: chispa, gráfico de barras, un celular con un chat y un
   cluster de pods.
5. **Trayectoria** — la carrera como un `git log` de commits.
6. **Stack y proyectos** — la nube queda de fondo, como polvo.
7. **Resultados** — se vuelve a juntar y de ella salen las cards.
8. **Contacto** — la nube forma las iniciales **FR**, y cierra la firma.

### Microdetalles (`js/details.js`)

- **Portada:** firma a mano sobre el nombre, terminal que rota frases, selector
  ES/EN, cinta de herramientas, anillos que laten desde el centro, luz que sigue
  al mouse, y letras del nombre que se elevan cuando el mouse pasa cerca.
- **Cursor propio** que dice qué pasa al tocar ("Abrir ↗", "Descargar", "↔ Girá"…)
  y toma el color de la sección.
- **Partículas** que se apartan del cursor y titilan; **pin de Buenos Aires** sobre el globo.
- **Botones magnéticos**, textos que se decodifican, números que cuentan,
  terminales que se tipean solas, foco de luz en las tarjetas.
- **HUD** con coordenadas y sección (`01/08`), marcas de sección en la barra de
  progreso, botón para volver arriba con anillo de avance.
- Pasos del proceso clickeables con porcentaje; `git log` con un paquete que
  viaja por la línea; marquee que acelera con el scroll.
- Vista previa flotante del sitio de Agustina; captura de Club del Picante en un
  marco de navegador.
- Saludo según la hora de Buenos Aires, firma con la fecha del día, atajos de
  teclado (**L** idioma, **E** copiar mail), título de la pestaña si te vas, y un
  mensaje en la consola para quien mire el código.

Con *reducir movimiento* todo lo animado se apaga y el contenido queda completo.

Es un sitio **estático**: HTML, CSS y JavaScript sin paso de build. Three.js,
GSAP y Lenis están copiados en `vendor/`. Las tipografías vienen de Google
Fonts: Bricolage Grotesque (títulos), Geist (texto), Geist Mono (datos) y
Mrs Saint Delafield (la firma).

## Dónde edito cada cosa

| Qué | Dónde |
|---|---|
| Textos en español | `index.html` (es el texto que se ve) |
| Textos en inglés | `js/i18n.js` → objeto `EN` (mismas claves que los `data-i18n` del HTML) |
| La frase "Todo empieza con una idea" | `index.html`, está en los dos idiomas (`.l-es` y `.l-en`) |
| Colores y tipografías | `css/main.css`, variables al principio |
| Las formas de la nube y sus colores | `js/scene.js` → `build*()` y `LOOK` |
| Qué forma toma en cada tramo y dónde | `js/scroll.js` → las poses (`HERO_END`, `LAT`, `MONO`…) |
| Las iniciales del final | `js/scene.js` → `buildMono(N, r, 'FR')` |
| Frases de la terminal de la portada | `js/i18n.js` → `intro.rot` (separadas por `|`, en los dos idiomas) |
| Cursor, HUD, atajos y demás microdetalles | `js/details.js` |
| CV descargables | `assets/cv/CV-FedericoRosciani_ES.pdf` y `_EN.pdf` |
| Imagen al compartir el link (LinkedIn, WhatsApp) | `assets/img/og.jpg` (1200×630) |

Si cambiás el CV, reemplazá los PDF en `assets/cv/` con el mismo nombre.

## Verlo en tu compu

Con Node instalado, desde la carpeta del proyecto:

```bash
node tools/serve.js . 5180
```

y abrí http://localhost:5180. (Abrir el `index.html` con doble clic no
alcanza: los módulos de JavaScript necesitan un servidor.)

## Dónde está publicado

| Dónde | Dirección | Cómo se actualiza |
|---|---|---|
| **Vercel (principal)** | **https://federicorosciani.vercel.app** | `node tools/deploy-vercel.mjs deploy` |
| GitHub Pages (espejo) | https://federosciani03.github.io | `git push` a `main` (repo `federosciani03/federosciani03.github.io`) |

La dirección principal es la de Vercel: es la que usan la vista previa al
compartir el link y los buscadores (`canonical` en `index.html`). Ponela en tu CV.

Para publicar un cambio en los dos lados:

```bash
git add -A && git commit -m "Actualizo el sitio" && git push
node tools/deploy-vercel.mjs deploy
```

El deploy a Vercel va por la API REST (el CLI oficial no anda en la red del
banco). El token vive en `.vercel-token.json`, que está en `.gitignore` y no se
publica. Si vence: `node tools/deploy-vercel.mjs login` y confirmás el código
en Vercel. No hace falta ningún GitHub Actions.

## Antes de publicar, revisá

- **LinkedIn**: el link usa `linkedin.com/in/frosciani` (el de tu portfolio
  anterior). Tu CV dice `linkedin.com/in/FedericoRoscianiPF`. Dejá el que
  sea el correcto en `index.html` (aparece 3 veces) y en el bloque JSON-LD.
- Los CV y el botón de WhatsApp dejan tu **teléfono público**.

## Accesibilidad y respaldo

- Con *reducir movimiento* activado en el sistema, o sin WebGL, la página se
  muestra en columna, completa y sin animaciones.
- En celular la nube va arriba y el contenido abajo; el scroll es el nativo.
