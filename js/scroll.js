// ============================================================
//  Coreografía de scroll (la gramática de Club del Picante, con
//  la historia "de la idea a producción"):
//   0) APERTURA — la pantalla naranja es una chispa vista de cerca:
//                 se cierra sobre ella y queda la idea, sola
//   1) HERO     — la idea crece y se vuelve un globo de datos
//   2) FLUJO    — los datos caen y la pantalla se inunda: la fórmula
//   3) PROCESO  — de costado: idea → datos → app → producción,
//                 y la nube toma la forma de cada paso
//   4) TRAYECTORIA / STACK / PROYECTOS — la nube queda de fondo
//   5) RESULTADOS — vuelve a juntarse y de ella salen las cards
//   6) CONTACTO — forma mis iniciales
// ============================================================
import { t } from './i18n.js';

const gsap = window.gsap;
const ScrollTrigger = window.ScrollTrigger;
gsap.registerPlugin(ScrollTrigger);
ScrollTrigger.config({ ignoreMobileResize: true });

const reducedMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

// La línea de terminal de cada paso se escribe sola, con el cursor
// titilando al final. Es mono: cada "paso" del ancho es una letra.
function typeLog(log) {
  if (!log || log.dataset.typed) return;
  log.dataset.typed = '1';
  const wrap = document.createElement('span');
  wrap.className = 'type';
  while (log.firstChild) wrap.appendChild(log.firstChild);
  log.appendChild(wrap);
  const caret = document.createElement('span');
  caret.className = 'type-caret';
  caret.setAttribute('aria-hidden', 'true');
  log.appendChild(caret);
  const chars = wrap.textContent.length;
  gsap.fromTo(wrap, { width: 0 }, {
    width: wrap.scrollWidth, duration: chars * 0.035 + 0.2, ease: `steps(${chars})`, delay: 0.35, clearProps: 'width',
  });
}

// La intro entra apenas se va la pantalla de carga
export function playIntro() {
  // las letras del nombre entran de a una (details.js ya las separó)
  const letters = document.querySelectorAll('.intro-brand .ch');
  gsap.timeline({ delay: 0.1 })
    .fromTo('.intro-top', { y: -14, opacity: 0 }, { y: 0, opacity: 1, duration: 0.9, ease: 'power3.out' }, 0)
    .fromTo('.intro-kicker', { y: 16, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out' }, 0)
    .fromTo(letters.length ? letters : '.intro-line',
      { yPercent: 70, rotate: 6, opacity: 0 },
      { yPercent: 0, rotate: 0, opacity: 1, duration: 1, stagger: 0.035, ease: 'power4.out' }, 0.1)
    // la firma se escribe encima del nombre, como un autógrafo
    .fromTo('.intro-sign', { clipPath: 'inset(-30% 100% -30% 0)' }, { clipPath: 'inset(-30% 0% -30% 0)', duration: 1.5, ease: 'power2.inOut' }, 0.95)
    .fromTo('.intro-type', { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.7, ease: 'power2.out' }, 0.75)
    .fromTo('.intro-ticker', { yPercent: 100 }, { yPercent: 0, duration: 0.9, ease: 'power3.out' }, 0.6)
    .fromTo('.scroll-cue', { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.7, ease: 'power2.out' }, 1.1)
    .call(() => {
      // hasta el primer scroll, el nombre da un saltito cada tanto: "bajá"
      const intro = document.getElementById('intro');
      if (window.scrollY > 20 || !intro) return;
      intro.classList.add('hint-hop');
      const stop = () => {
        if (window.scrollY > 20) { intro.classList.remove('hint-hop'); removeEventListener('scroll', stop); }
      };
      addEventListener('scroll', stop, { passive: true });
    }, null, 2.3);

  // tocar "Deslizá" hace el recorrido solo hasta el hero
  document.getElementById('scroll-cue')?.addEventListener('click', () => {
    const hero = document.getElementById('hero');
    const target = hero.offsetTop + hero.offsetHeight - innerHeight;
    const inOut = (x) => (x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2);
    if (window.__lenis) window.__lenis.scrollTo(target, { duration: 6, easing: inOut });
    else window.scrollTo({ top: target, behavior: 'smooth' });
  });
}

export function initScroll(scene) {
  const reduced = reducedMotion();

  // ----- scroll suave (rueda; en touch queda el nativo) -----
  if (!reduced && window.Lenis) {
    const lenis = new window.Lenis({ smoothWheel: true, lerp: 0.09 });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time) => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);
    // los pines cambian el alto de la página: Lenis tiene que enterarse
    // (si no, los links del menú no llegan al final)
    ScrollTrigger.addEventListener('refresh', () => lenis.resize());
    window.__lenis = lenis;
  }

  // ----- progreso -----
  const fill = document.querySelector('.drip-fill');
  const drop = document.querySelector('.drip-drop');
  ScrollTrigger.create({
    start: 0,
    end: () => document.documentElement.scrollHeight - innerHeight,
    onUpdate: (self) => {
      fill.style.transform = `scaleY(${self.progress.toFixed(4)})`;
      drop.style.transform = `translateY(calc(${(self.progress * 100).toFixed(3)}vh - 4px))`;
    },
  });

  // ----- la línea del git log se llena con el scroll -----
  const commitsWrap = document.querySelector('.commits-wrap');
  ScrollTrigger.create({
    trigger: commitsWrap, start: 'top 70%', end: 'bottom 70%',
    onUpdate: (self) => commitsWrap.style.setProperty('--p', self.progress.toFixed(4)),
  });

  if (!reduced) {
    // ----- reveals de las secciones verticales -----
    gsap.utils.toArray('.gitlog-head, .usos-head, .stack-card, .proyectos-head, .feature, .workrow').forEach((el) => {
      gsap.from(el, { y: 46, opacity: 0, duration: 0.9, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 86%' } });
    });
    gsap.utils.toArray('.commit').forEach((el) => {
      gsap.from(el, { x: -26, opacity: 0, duration: 0.8, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 85%' } });
    });
    // parallax de las cards del stack (cada una a su velocidad)
    gsap.utils.toArray('.stack-card').forEach((card) => {
      const speed = parseFloat(card.dataset.speed || 1);
      gsap.to(card, {
        y: (1 - speed) * 110, ease: 'none',
        scrollTrigger: { trigger: '.stack-grid', start: 'top bottom', end: 'bottom top', scrub: true },
      });
    });
    gsap.fromTo('.feature-media img', { yPercent: -4 }, {
      yPercent: 4, ease: 'none',
      scrollTrigger: { trigger: '.feature-media', start: 'top bottom', end: 'bottom top', scrub: true },
    });
    // la firma se escribe de izquierda a derecha
    gsap.fromTo('.signature', { clipPath: 'inset(-20% 100% -20% 0)' }, {
      clipPath: 'inset(-20% 0% -20% 0)', duration: 1.8, ease: 'power2.inOut',
      scrollTrigger: { trigger: '.signature', start: 'top 92%' },
    });
  }

  // links internos: sin #hash en la URL y cayendo en el momento justo de cada tramo
  const anchorY = {};
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a || e.defaultPrevented) return;
    const id = a.getAttribute('href').slice(1);
    const el = id && document.getElementById(id);
    if (!el) return;
    e.preventDefault();
    const y = anchorY[id] ? anchorY[id]() : el.getBoundingClientRect().top + window.scrollY;
    const duration = Math.min(2.4, 0.9 + Math.abs(y - window.scrollY) / 6000);
    if (window.__lenis) window.__lenis.scrollTo(y, { duration });
    else window.scrollTo({ top: y, behavior: reduced ? 'auto' : 'smooth' });
  });

  // sección activa en la barra. Se crea DESPUÉS de los pines: ScrollTrigger
  // calcula en orden de creación y así ya cuenta el alto que agregan.
  const navActive = () => {
    const links = [...document.querySelectorAll('.nav-links a')];
    let last = null;
    const mark = (id) => {
      if (id === last) return;
      last = id;
      links.forEach((l) => l.setAttribute('aria-current', String(l.getAttribute('href') === '#' + id)));
    };
    // la activa es la última sección cuyo comienzo ya pasó ("club" no tiene
    // link: apaga el menú). Con endTrigger, el pin descuadraba los finales.
    const starts = ['proceso', 'trayectoria', 'stack', 'proyectos', 'club', 'contacto']
      .map((id) => document.getElementById(id))
      .filter(Boolean)
      .map((el) => ({ id: el.id, st: ScrollTrigger.create({ trigger: el, start: 'top center' }) }));
    const pick = (y) => {
      let cur = '';
      for (const s of starts) if (y >= s.st.start) cur = s.id;
      mark(cur === 'club' ? '' : cur);
    };
    ScrollTrigger.create({ start: 0, end: 'max', onUpdate: (self) => pick(self.scroll()) });
  };

  if (reduced || !scene) {
    // sin coreografía: el CSS deja todo en columna y legible
    document.documentElement.classList.add('no-motion');
    navActive();
    return;
  }

  const s = scene.state;
  const wide = innerWidth >= 900;
  // las poses de la nube dependen del ancho: si la ventana cruza el corte
  // celular/compu (girar una tablet, agrandar la ventana), se rearma todo
  let resizeTimer;
  addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => { if ((innerWidth >= 900) !== wide) location.reload(); }, 450);
  });

  // la barra se esconde durante la apertura y aparece al bajar
  const nav = document.querySelector('.nav');
  gsap.set(nav, { autoAlpha: 0, y: -12 });
  ScrollTrigger.create({
    start: 40,
    onEnter: () => gsap.to(nav, { autoAlpha: 1, y: 0, duration: 0.5, ease: 'power2.out' }),
    onLeaveBack: () => gsap.to(nav, { autoAlpha: 0, y: -12, duration: 0.35 }),
  });

  // la lluvia de números de la inundación (solo corre mientras se ve)
  const flood = document.getElementById('flood');
  const digits = flood.querySelector('.flood-digits');
  const cols = innerWidth < 700 ? 9 : 18;
  for (let i = 0; i < cols; i++) {
    const span = document.createElement('span');
    let txt = '';
    for (let k = 0; k < 70; k++) txt += Math.random() < 0.82 ? String(Math.floor(Math.random() * 10)) : '.';
    span.textContent = txt + txt;
    span.style.animationDuration = `${9 + Math.random() * 12}s`;
    digits.appendChild(span);
  }
  // mientras se ve, algunos dígitos cambian solos: datos vivos
  let flicker = null;
  const mutate = () => {
    const cols2 = digits.children;
    for (let k = 0; k < 7; k++) {
      const el = cols2[Math.floor(Math.random() * cols2.length)];
      const s2 = el.textContent;
      const i = Math.floor(Math.random() * (s2.length / 2));
      const ch = String(Math.floor(Math.random() * 10));
      // se cambia en las dos mitades: el loop sigue sin salto
      const half = s2.length / 2;
      el.textContent = s2.slice(0, i) + ch + s2.slice(i + 1, i + half) + ch + s2.slice(i + half + 1);
    }
  };
  ScrollTrigger.create({
    trigger: '#zoom', start: 'top 75%', end: 'bottom bottom',
    onToggle: (self) => {
      flood.classList.toggle('is-on', self.isActive);
      clearInterval(flicker);
      if (self.isActive) flicker = setInterval(mutate, 130);
    },
  });

  // ---------- Poses y tramos ----------
  // Cada tramo anima su PROPIA copia del estado y un resolver copia a la
  // escena la del tramo activo: bajando o subiendo rápido nadie pisa a nadie.
  const BASE = { seq: 0, posX: 0, posY: 0, scale: 1, rotY: 0, tilt: 0, spin: 0.3, alpha: 1, glow: 0.6, pulse: 0 };
  const pose = (over) => ({ ...BASE, ...over });
  const pick = (desk, mob) => pose(wide ? desk : mob);

  const BRAND = pose({ seq: 0, scale: 1, spin: 0.4, pulse: 1, glow: 0.9 });
  const HERO_END = pick(
    { seq: 1, posX: 2.3, posY: 0, scale: 0.95, spin: 0.22, glow: 0.55 },
    { seq: 1, posX: 0, posY: -1.35, scale: 0.72, spin: 0.22, glow: 0.55 });
  const POUR = pick(
    { seq: 2, posX: 0, posY: 0.9, scale: 1, spin: 0.5, glow: 0.35 },
    { seq: 2, posX: 0, posY: 1.2, scale: 0.9, spin: 0.5, glow: 0.35 });
  // el proceso: la nube va del lado contrario de cada tarjeta
  const LAT = [
    pick({ seq: 3, posX: -2.6, posY: 0, scale: 1.5, spin: 0.4, pulse: 1, glow: 0.8 },
      { seq: 3, posX: 0, posY: 1.55, scale: 1.1, spin: 0.4, pulse: 1, glow: 0.8 }),
    pick({ seq: 4, posX: 2.2, posY: 0.1, scale: 0.8, rotY: -0.42, tilt: 0.2, spin: 0, glow: 0.4 },
      { seq: 4, posX: 0, posY: 1.3, scale: 0.58, rotY: -0.45, tilt: 0.22, spin: 0, glow: 0.4 }),
    pick({ seq: 5, posX: -2.6, posY: 0, scale: 0.8, rotY: 0.28, spin: 0, glow: 0.45 },
      { seq: 5, posX: 0, posY: 1.2, scale: 0.48, rotY: 0.2, spin: 0, glow: 0.45 }),
    pick({ seq: 6, posX: 2.3, posY: 0, scale: 0.9, rotY: -0.45, tilt: 0.18, spin: 0, glow: 0.5 },
      { seq: 6, posX: 0, posY: 1.35, scale: 0.62, rotY: -0.45, tilt: 0.18, spin: 0, glow: 0.5 }),
  ];
  const DUST = pose({ seq: 7, spin: 0.02, alpha: 0.7, glow: 0 });
  const CLUB_SMALL = pick(
    { seq: 8, posY: 1.68, scale: 0.24, spin: 0.35, glow: 0.5 },
    { seq: 8, posY: 2.0, scale: 0.24, spin: 0.35, glow: 0.5 });
  const MONO = pick(
    { seq: 9, posX: 2.2, posY: 0.05, scale: 0.8, spin: 0, glow: 0.6 },
    { seq: 9, posX: 0, posY: 1.6, scale: 0.62, spin: 0, glow: 0.6 });
  const values = (p) => { const { ...rest } = p; return rest; };

  const brandP = { ...BRAND };
  const heroP = { ...BRAND };
  const pourP = { ...HERO_END };
  const latP = { ...LAT[0] };
  const exitP = { ...LAT[3] };
  const clubP = { ...DUST };
  const endP = { ...CLUB_SMALL };

  // ---------- 0) APERTURA: el naranja era la chispa ----------
  gsap.set('#mp1 .mp-word, #mp1 .mp-sub', { opacity: 0 });
  // mientras la primera pantalla es naranja, el cursor y el HUD van en tinta
  const root = document.documentElement;
  root.dataset.flat = '1';
  const brandTl = gsap.timeline({
    scrollTrigger: {
      trigger: '#marca', start: 'top top', end: 'bottom bottom', scrub: 0.5, invalidateOnRefresh: true,
      onUpdate: (self) => { const f = self.progress < 0.27 ? '1' : '0'; if (root.dataset.flat !== f) root.dataset.flat = f; },
    },
  })
    // el naranja se cierra sobre la chispa: era una idea vista de muy cerca
    .fromTo('.bd-spark', { clipPath: 'circle(150% at 50% 50%)' }, { clipPath: 'circle(0.8% at 50% 50%)', duration: 0.3, ease: 'power2.in' }, 0.02)
    .to('.bd-spark', { autoAlpha: 0, duration: 0.03, ease: 'none' }, 0.31)
    // el nombre se va con el primer scroll
    .to('#marca-intro', { autoAlpha: 0, y: -30, duration: 0.07, ease: 'power1.in' }, 0.01)
    // la chispa crece apenas mientras se lee la frase
    .to(brandP, { scale: 1.25, duration: 0.5, ease: 'none' }, 0.3)
    .fromTo('#mp1 .mp-word', { opacity: 0, y: 30 }, { opacity: 1, y: 0, stagger: 0.03, duration: 0.08, ease: 'power2.out' }, 0.36)
    .fromTo('#mp1 .mp-sub', { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.07, ease: 'power2.out' }, 0.5)
    .to('#mp1', { opacity: 0, y: -24, duration: 0.07, ease: 'power1.in' }, 0.84)
    // antes de explotar, junta energía
    .to(brandP, { glow: 1.4, duration: 0.1, ease: 'power1.in' }, 0.86)
    .to({}, { duration: 0 }, 1); // dura exactamente 1: posiciones = fracciones del scroll

  // ---------- 1) HERO: la idea se vuelve datos ----------
  gsap.set('.hero-copy', { opacity: 0, y: 44 });
  gsap.set('.reveal-word', { yPercent: -50 });
  // cada renglón del título sube desde una máscara
  document.querySelectorAll('.hero .display .line').forEach((line) => {
    const inner = document.createElement('span');
    inner.className = 'line-in';
    while (line.firstChild) inner.appendChild(line.firstChild);
    line.appendChild(inner);
  });
  const heroTl = gsap.timeline({
    scrollTrigger: { trigger: '#hero', start: 'top top', end: 'bottom bottom', scrub: 0.4, invalidateOnRefresh: true },
  })
    .fromTo(heroP, { ...values(BRAND), scale: 1.25, glow: 1.4 }, { ...values(HERO_END), ease: 'power2.inOut', duration: 0.7 }, 0)
    .fromTo('#rw1', { opacity: 0, xPercent: -58 }, { opacity: 1, xPercent: -50, duration: 0.1, ease: 'none' }, 0.1)
    .to('#rw1', { opacity: 0, xPercent: -42, duration: 0.1, ease: 'none' }, 0.28)
    .fromTo('#rw2', { opacity: 0, xPercent: -42 }, { opacity: 1, xPercent: -50, duration: 0.1, ease: 'none' }, 0.34)
    .to('#rw2', { opacity: 0, xPercent: -58, duration: 0.1, ease: 'none' }, 0.52)
    .to('.hero-copy', { opacity: 1, y: 0, duration: 0.22, ease: 'power2.out' }, 0.6)
    .fromTo('.hero .line-in', { yPercent: 118 }, { yPercent: 0, stagger: 0.05, duration: 0.18, ease: 'power3.out' }, 0.6)
    .to({}, { duration: 0 }, 1);

  // ---------- 2) FLUJO: los datos caen y la pantalla se inunda ----------
  const pourTl = gsap.timeline({
    scrollTrigger: { trigger: '#zoom', start: 'top 75%', end: 'bottom bottom', scrub: 0.5, invalidateOnRefresh: true },
  })
    .to(pourP, { ...values(POUR), ease: 'power1.inOut', duration: 0.26 }, 0)
    .fromTo('#pour-word', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.08, ease: 'none' }, 0.1)
    .to('#pour-word', { opacity: 0, y: -14, duration: 0.07, ease: 'none' }, 0.32)
    .set('#flood', { visibility: 'visible', willChange: 'transform' }, 0.36)
    .fromTo('#flood', { yPercent: 100 }, { yPercent: 0, duration: 0.2, ease: 'power1.out' }, 0.36)
    .fromTo('#inside', { opacity: 0, y: 70 }, { opacity: 1, y: 0, duration: 0.1, ease: 'power2.out' }, 0.48)
    .fromTo('.recipe-item', { opacity: 0, y: 34, scale: 0.9 }, { opacity: 1, y: 0, scale: 1, stagger: 0.04, duration: 0.06, ease: 'back.out(1.6)' }, 0.52)
    .fromTo('.recipe-badges span', { opacity: 0, y: 12 }, { opacity: 1, y: 0, stagger: 0.02, duration: 0.04, ease: 'power2.out' }, 0.62)
    // bajo la inundación (no se ve) los datos vuelven a ser una idea, a la izquierda
    .to(pourP, { ...values(LAT[0]), ease: 'power2.inOut', duration: 0.16 }, 0.6)
    .to('#inside', { opacity: 0, y: -40, duration: 0.08, ease: 'none' }, 0.8)
    .to('#flood', { yPercent: 108, duration: 0.14, ease: 'power1.in' }, 0.84)
    .set('#flood', { visibility: 'hidden', willChange: 'auto' }, 0.99)
    .to({}, { duration: 0 }, 1);

  // ---------- 3) PROCESO: de costado ----------
  const track = document.getElementById('hs-track');
  const dist = () => track.scrollWidth - innerWidth;
  const hold = () => innerHeight * 0.8; // pausa con "Producción" quieto en pantalla
  const pinST = ScrollTrigger.create({
    trigger: '#proceso', start: 'top top', end: () => '+=' + (dist() + hold()),
    pin: true, anticipatePin: 1, invalidateOnRefresh: true,
  });
  anchorY.proceso = () => pinST.start;

  const hsSteps = document.querySelectorAll('#hs-progress .hs-step');
  const hsFill = document.querySelector('#hs-progress .hs-fill');
  const hsPct = document.querySelector('#hs-progress .hs-pct');
  let hsOn = -1;
  let hsPctLast = -1;
  const paintHs = (p) => {
    hsFill.style.transform = `scaleX(${p.toFixed(4)})`;
    const pct = Math.round(p * 100);
    if (pct !== hsPctLast) { hsPct.textContent = `${String(pct).padStart(3, '0')}%`; hsPctLast = pct; }
    const on = p < 0.17 ? 0 : p < 0.5 ? 1 : p < 0.83 ? 2 : 3;
    if (on === hsOn) return;
    hsOn = on;
    root.dataset.step = String(on); // el tono del cursor y del HUD sigue al paso
    hsSteps.forEach((el, i) => {
      el.classList.toggle('on', i === on);
      if (i === on) el.setAttribute('aria-current', 'step'); else el.removeAttribute('aria-current');
    });
  };
  const hTween = gsap.to(track, {
    x: () => -dist(),
    ease: 'none',
    scrollTrigger: {
      trigger: '#proceso', start: 'top top', end: () => '+=' + dist(), scrub: 0.6, invalidateOnRefresh: true,
      onUpdate: (self) => paintHs(self.progress),
    },
  });
  // los pasos de arriba se pueden tocar: llevan a cada panel
  hsSteps.forEach((btn, i) => {
    btn.addEventListener('click', () => {
      const st = hTween.scrollTrigger;
      const y = st.start + (st.end - st.start) * (i / (hsSteps.length - 1));
      if (window.__lenis) window.__lenis.scrollTo(y, { duration: 1.3 });
      else window.scrollTo({ top: y, behavior: 'smooth' });
    });
  });
  gsap.utils.toArray('.hs-panel').forEach((panel, i) => {
    const log = panel.querySelector('.hs-log');
    const scrollTrigger = i === 0
      ? { trigger: '#proceso', start: 'top 85%' }
      : { trigger: panel, containerAnimation: hTween, start: 'left 72%' };
    gsap.from(panel.querySelectorAll('.hs-card, .hs-word'), {
      y: 60, opacity: 0, stagger: 0.07, duration: 0.55, ease: 'power2.out',
      scrollTrigger: { ...scrollTrigger, onEnter: () => typeLog(log) },
    });
  });
  // la nube toma la forma de cada paso, del lado contrario de la tarjeta
  const latTl = gsap.timeline({
    scrollTrigger: { trigger: '#proceso', start: 'top top', end: () => '+=' + dist(), scrub: 0.6, invalidateOnRefresh: true },
  })
    .to(latP, { ...values(LAT[1]), ease: 'power1.inOut', duration: 0.24 }, 0.07)
    .to(latP, { ...values(LAT[2]), ease: 'power1.inOut', duration: 0.24 }, 0.4)
    .to(latP, { ...values(LAT[3]), ease: 'power1.inOut', duration: 0.24 }, 0.73)
    .to({}, { duration: 0 }, 1);

  // ---------- 4) la nube queda de fondo ----------
  const exitTl = gsap.timeline({
    scrollTrigger: { trigger: '#trayectoria', start: 'top bottom', end: 'top 30%', scrub: 0.6 },
  }).to(exitP, { ...values(DUST), ease: 'power1.inOut' }, 0);

  // ---------- 5) RESULTADOS: se vuelve a juntar y salen las cards ----------
  const stage = document.querySelector('.club-stage');
  const fromCloud = (axis) => (i, el) => {
    let x = el.offsetWidth / 2, y = el.offsetHeight / 2, n = el;
    while (n && n !== stage) { x += n.offsetLeft; y += n.offsetTop; n = n.offsetParent; }
    return axis === 'x' ? stage.offsetWidth / 2 - x : stage.offsetHeight * 0.14 - y;
  };
  const burst = { autoAlpha: 0, scale: 0.25, rotation: (i) => (i - 1) * 8, x: fromCloud('x'), y: fromCloud('y') };
  const land = { autoAlpha: 1, scale: 1, rotation: 0, x: 0, y: 0, stagger: 0.03, duration: 0.08, ease: 'back.out(1.3)' };
  const clubTl = gsap.timeline({
    scrollTrigger: { trigger: '#club', start: 'top bottom', end: 'bottom bottom', scrub: 0.5, invalidateOnRefresh: true },
  })
    .to(clubP, { ...values(CLUB_SMALL), ease: 'power2.inOut', duration: 0.3 }, 0.1)
    .fromTo('#club-intro', { autoAlpha: 0, y: 30 }, { autoAlpha: 1, y: 0, duration: 0.07, ease: 'power2.out' }, 0.42)
    .fromTo('#club-results .club-label', { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.04 }, 0.48)
    .fromTo('#club-results .club-row', burst, land, 0.5)
    .to('#club-results', { autoAlpha: 0, x: -50, duration: 0.05, ease: 'power2.in' }, 0.76)
    .fromTo('#club-more .club-label', { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.04 }, 0.79)
    .fromTo('#club-more .club-row', burst, land, 0.8)
    .to({}, { duration: 0 }, 1);
  anchorY.club = () => { const st = clubTl.scrollTrigger; return st.start + (st.end - st.start) * 0.72; };

  // ---------- 6) CONTACTO: mis iniciales ----------
  const endTl = gsap.timeline({
    scrollTrigger: { trigger: '#contacto', start: 'top bottom', end: 'top 15%', scrub: 0.6 },
  }).to(endP, { ...values(MONO), ease: 'power2.inOut' }, 0);

  // ---------- resolver: la escena usa la pose del tramo activo ----------
  const segments = [
    { st: brandTl.scrollTrigger, p: brandP },
    { st: heroTl.scrollTrigger, p: heroP },
    { st: pourTl.scrollTrigger, p: pourP },
    { st: latTl.scrollTrigger, p: latP },
    { st: exitTl.scrollTrigger, p: exitP },
    { st: clubTl.scrollTrigger, p: clubP },
    { st: endTl.scrollTrigger, p: endP },
  ];
  const KEYS = Object.keys(BASE);
  const resolve = () => {
    const y = window.__lenis ? window.__lenis.scroll : window.scrollY;
    let active = segments[0];
    for (const seg of segments) if (y >= seg.st.start) active = seg;
    for (const k of KEYS) s[k] = active.p[k];
  };
  gsap.ticker.add(resolve);

  // ---------- guía para scrollear ----------
  const nudge = document.getElementById('scroll-nudge');
  const nudgeText = nudge.querySelector('.nudge-text');
  const zones = [
    { from: () => pinST.end - hold(), to: () => pinST.end, text: 'nudge.more' },
    { from: () => hTween.scrollTrigger.start, to: () => hTween.scrollTrigger.end, text: 'nudge.side', side: true },
    { from: () => clubTl.scrollTrigger.start + 40, to: () => clubTl.scrollTrigger.end - 40, text: 'nudge.keep' },
    { from: () => pourTl.scrollTrigger.start, to: () => pourTl.scrollTrigger.end, text: 'nudge.pour' },
    { from: () => heroTl.scrollTrigger.start, to: () => heroTl.scrollTrigger.end, text: 'nudge.hero' },
    { from: () => 80, to: () => brandTl.scrollTrigger.end, text: 'nudge.keep' },
  ];
  let lastMove = performance.now();
  let shown = false;
  let times = 0;
  const hideNudge = () => {
    lastMove = performance.now();
    if (shown) { nudge.classList.remove('on'); shown = false; }
  };
  window.__lenis?.on('scroll', hideNudge);
  addEventListener('scroll', hideNudge, { passive: true });
  for (const ev of ['pointerdown', 'keydown', 'touchstart', 'wheel']) addEventListener(ev, hideNudge, { passive: true });
  setInterval(() => {
    if (shown || document.hidden) return;
    if (performance.now() - lastMove < (times < 3 ? 1600 : 4500)) return;
    const y = window.scrollY;
    const z = zones.find((zz) => y >= zz.from() && y <= zz.to());
    if (!z) return;
    nudgeText.textContent = t(z.text);
    nudge.classList.toggle('side', !!z.side);
    nudge.classList.add('on');
    shown = true;
    times++;
  }, 500);

  navActive();
  ScrollTrigger.refresh();
  resolve();
}
