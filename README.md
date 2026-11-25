# federosciani03.github.io

Portfolio personal de Federico Rosciani: AI Engineer · Data Engineer.

Sitio estático (HTML, CSS y JavaScript, sin paso de build), publicado con GitHub Pages
desde la rama `main`. No usa GitHub Actions.

Las animaciones de scroll usan GSAP + ScrollTrigger y Lenis (smooth scroll), copiados
en `assets/vendor/`. Todo lo animado vive bajo la clase `html.motion`: si el sistema
pide reducir movimiento, si falla el JavaScript o con `?motion=0`, el sitio se ve
completo y estático.

| Sección | Efecto |
|---|---|
| Portada | Red de puntos viva que sigue al cursor; al scrollear el nombre se abre, las etiquetas vuelan y la foto se abre en círculo |
| Showreel | Video de 24 s que crece hasta ocupar la pantalla (`assets/video/showreel.mp4`) |
| Carrera | La línea dev → qa → prod se dibuja y el contador sube a 35+ |
| Proyectos del banco | Ventana oscura con auroras; recorrido horizontal con diagramas que se dibujan y paquetes de datos que circulan |
| Y mucho más | Dos cintas de proyectos que se mueven solas |
| Personales y freelance | Videos en loop de los sitios en vivo, fotos flotando, promo de Hope Wines con sonido opcional |
| Stack | Palabras gigantes en movimiento continuo |
| Contacto | Un círculo verde crece hasta llenar la pantalla |

Los videos de los sitios se grabaron con Playwright recorriendo cada sitio público y se
comprimieron con ffmpeg (H.264, sin audio, ~0,5 MB cada uno).

## Dónde edito cada cosa

| Qué | Dónde |
|---|---|
| Textos en español | `index.html` (es el texto que se ve) |
| Textos en inglés | `index.html`, atributo `data-en` de cada elemento |
| Colores y tipografías | `assets/css/styles.css`, variables al principio |
| Idioma, animaciones | `assets/js/main.js` |
| CV descargables | `assets/cv/CV-FedericoRosciani-ES.pdf` y `-EN.pdf` |

Para agregar un proyecto, copiá un `<article class="card">` de la sección que
corresponda y cambiá los textos en los dos idiomas.

## Confidencialidad

Los proyectos del banco se describen de forma genérica: problema, tipo de solución,
tecnología e impacto. Nada de nombres de sistemas internos, URLs internas, datos de
clientes, credenciales, capturas ni cifras confidenciales.

## Verlo en local

```bash
npx serve .        # o cualquier servidor estático
```
