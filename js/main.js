// Punto de entrada del sitio de Federico Rosciani
import { initI18n, onLangChange, t } from './i18n.js';
import { initScroll, playIntro } from './scroll.js';
import { initDetails } from './details.js';

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

// ============================================================
//  Pantalla de carga: la página no se muestra hasta que está todo
//  listo (tipografías, escena 3D, shader compilado). La barra y el
//  porcentaje avanzan con lo que va quedando listo; solos nunca
//  pasan del 90%.
// ============================================================
function createLoader() {
  const el = document.getElementById('loader');
  const fill = document.getElementById('ld-fill');
  const pct = document.getElementById('ld-pct');
  let p = 0.04;
  const paint = () => {
    if (fill) fill.style.transform = `scaleX(${p.toFixed(3)})`;
    if (pct) pct.textContent = `${Math.round(p * 100)}%`;
  };
  const set = (v) => { p = Math.max(p, Math.min(1, v)); paint(); };
  const creep = setInterval(() => set(p + (0.9 - p) * 0.035), 180);
  return {
    add(v) { set(Math.min(0.95, p + v)); },
    track(promise, weight) { return Promise.resolve(promise).catch(() => {}).then(() => this.add(weight)); },
    async done() {
      clearInterval(creep);
      set(1);
      await wait(320);
      document.documentElement.classList.remove('is-loading');
      el?.classList.add('gone');
      setTimeout(() => el?.remove(), 900);
    },
  };
}

async function boot() {
  const loader = createLoader();
  initI18n();
  document.getElementById('ld-text').textContent = t('loader');
  document.querySelectorAll('[data-year]').forEach((el) => { el.textContent = new Date().getFullYear(); });

  let scene = null;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!reduced) {
    try {
      const { DataScene } = await import('./scene.js');
      scene = new DataScene(document.getElementById('scene'));
      window.__scene = scene; // debug
    } catch (err) {
      console.warn('WebGL no disponible: la página sigue sin el 3D', err);
      document.body.classList.add('no-webgl');
    }
  }
  loader.add(0.2);

  initScroll(scene);
  // después de los pines (los microdetalles miden secciones)
  initDetails();
  window.__lenis?.stop(); // mientras carga no se scrollea (la página está tapada)
  loader.add(0.1);

  await Promise.race([
    Promise.all([
      loader.track(document.fonts.ready, 0.15),
      scene && loader.track(scene.ready.then(() => scene.warmup()), 0.35),
    ]),
    wait(12000), // con conexión muy lenta se muestra igual
  ]);

  window.scrollTo(0, 0);
  window.__lenis?.scrollTo(0, { immediate: true, force: true });
  await loader.done();
  window.__lenis?.start();
  window.ScrollTrigger?.refresh();
  playIntro();

  // al cambiar de idioma cambian los largos de los textos: recalcular
  onLangChange(() => requestAnimationFrame(() => window.ScrollTrigger?.refresh()));
}

boot();
