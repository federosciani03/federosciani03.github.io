// ============================================================
//  Microdetalles: lo que no se ve a primera vista pero se siente.
//  Cursor propio con etiquetas, botones magnéticos, textos que se
//  decodifican como datos, el nombre que reacciona al mouse,
//  contadores, focos de luz en las tarjetas, HUD con la sección,
//  saludo según la hora de Buenos Aires, atajos de teclado y algún
//  guiño escondido. Con "reducir movimiento" se apaga lo animado.
// ============================================================
import { t, getLang, onLangChange, applyLang } from './i18n.js';

const gsap = window.gsap;
const ScrollTrigger = window.ScrollTrigger;
const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const root = document.documentElement;
const EMAIL = 'federosciani03@gmail.com';

// ---------- texto que se decodifica (glifos al azar → texto real) ----------
const GLYPHS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789<>/_+=#%';
const running = new Set();
export function scramble(el, duration = 0.65) {
  if (reduced || !el || el.children.length) return; // solo hojas de texto
  const final = el._final && el._scr ? el._final : el.textContent;
  el._final = final;
  el._scr?.kill();
  const thresholds = [...final].map((_, i) => i / final.length * 0.7 + Math.random() * 0.3);
  const o = { p: 0 };
  el._scr = gsap.to(o, {
    p: 1, duration, ease: 'none',
    onUpdate: () => {
      let out = '';
      for (let i = 0; i < final.length; i++) {
        const ch = final[i];
        out += ch === ' ' || o.p >= thresholds[i] ? ch : GLYPHS[(Math.random() * GLYPHS.length) | 0];
      }
      el.textContent = out;
    },
    onComplete: () => { el.textContent = final; el._scr = null; running.delete(el); },
  });
  running.add(el);
}
// al cambiar de idioma, ningún texto viejo pisa al nuevo
onLangChange(() => { running.forEach((el) => { el._scr?.kill(); el._scr = null; }); running.clear(); });

// ---------- flechas de los links: se envuelven para poder moverlas ----------
function wrapArrows() {
  document.querySelectorAll('.btn, .workrow-cta, .cv-links a, .commit-body a, .footer-links a').forEach((el) => {
    const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach((n) => {
      const m = n.nodeValue.match(/[↗↓]/);
      if (!m) return;
      const arrow = n.splitText(m.index);
      arrow.splitText(1);
      const span = document.createElement('span');
      span.className = 'arr';
      span.setAttribute('aria-hidden', 'true');
      span.textContent = arrow.nodeValue;
      arrow.replaceWith(span);
    });
  });
}

// ---------- el nombre de la portada: letras sueltas que reaccionan al mouse ----------
function initName() {
  const brand = document.querySelector('.intro-brand');
  if (!brand) return;
  brand.setAttribute('aria-label', brand.textContent.replace(/\s+/g, ' ').trim());
  brand.querySelectorAll('.intro-line').forEach((line) => {
    const txt = line.textContent;
    line.textContent = '';
    [...txt].forEach((ch) => {
      const s = document.createElement('span');
      s.className = 'ch';
      s.setAttribute('aria-hidden', 'true');
      s.textContent = ch;
      line.appendChild(s);
    });
  });
  if (!fine || reduced) return;
  // cerca del cursor las letras se elevan y se inclinan apenas, como si lo
  // esquivaran (solo transformaciones: el espaciado no se toca)
  const chars = [...brand.querySelectorAll('.ch')];
  const st = chars.map(() => ({ y: 0, r: 0 }));
  const setY = chars.map((c) => gsap.quickSetter(c, 'y', 'px'));
  const setR = chars.map((c) => gsap.quickSetter(c, 'rotation', 'deg'));
  let centers = [];
  let mx = -9999, my = -9999, ready = false;
  const measure = () => {
    centers = chars.map((c) => { const r = c.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; });
  };
  addEventListener('pointermove', (e) => { mx = e.clientX; my = e.clientY; }, { passive: true });
  addEventListener('resize', measure);
  setTimeout(() => { measure(); ready = true; }, 2600); // después de la entrada de las letras
  gsap.ticker.add(() => {
    if (!ready || window.scrollY > innerHeight * 0.4) return; // solo en la primera pantalla
    const size = chars[0].offsetHeight;
    for (let i = 0; i < chars.length; i++) {
      const dx = centers[i][0] - mx;
      const d = Math.hypot(dx, centers[i][1] - my);
      const k = Math.max(0, 1 - d / 230);
      const e = k * k * (3 - 2 * k);
      const s = st[i];
      s.y += (-e * size * 0.075 - s.y) * 0.12;
      s.r += (Math.max(-1, Math.min(1, dx / 160)) * 2.2 * e - s.r) * 0.12;
      if (Math.abs(s.y) > 0.05 || Math.abs(s.r) > 0.02 || s.on) {
        setY[i](s.y);
        setR[i](s.r);
        s.on = Math.abs(s.y) > 0.05 || Math.abs(s.r) > 0.02; // un cuadro más para volver a 0 exacto
      }
    }
  });
}

// ---------- cursor propio ----------
function initCursor() {
  if (!fine || reduced) return;
  const cur = document.querySelector('.cursor');
  if (!cur) return;
  root.classList.add('has-cursor');
  const dot = cur.querySelector('.cursor-dot');
  const ring = cur.querySelector('.cursor-ring');
  const label = cur.querySelector('.cursor-label');
  const dx = gsap.quickSetter(dot, 'x', 'px');
  const dy = gsap.quickSetter(dot, 'y', 'px');
  const rx = gsap.quickTo(ring, 'x', { duration: 0.38, ease: 'power3' });
  const ry = gsap.quickTo(ring, 'y', { duration: 0.38, ease: 'power3' });
  addEventListener('pointermove', (e) => {
    if (e.pointerType !== 'mouse') return;
    dx(e.clientX); dy(e.clientY); rx(e.clientX); ry(e.clientY);
    cur.classList.add('is-on');
  }, { passive: true });
  root.addEventListener('mouseleave', () => cur.classList.remove('is-on'));
  addEventListener('pointerdown', () => cur.classList.add('is-down'));
  addEventListener('pointerup', () => cur.classList.remove('is-down'));

  // qué hay debajo: el aro crece y dice qué pasa al tocar
  let current = null;
  const decide = (target) => {
    const el = target?.closest?.('[data-cursor], a, button, .chips li');
    if (el === current) return;
    current = el;
    let mode = '';
    let key = '';
    if (el) {
      const dc = el.dataset.cursor;
      if (dc === 'none') mode = '';
      else if (dc) { mode = 'label'; key = 'cur.' + dc; }
      else if (el.matches('[data-copy]')) { mode = 'label'; key = 'cur.copy'; }
      else if (el.matches('a[download]')) { mode = 'label'; key = 'cur.download'; }
      else if (el.matches('a[target="_blank"]')) { mode = 'label'; key = 'cur.open'; }
      else if (el.matches('a[href^="mailto:"]')) { mode = 'label'; key = 'cur.mail'; }
      else mode = 'hover';
    }
    cur.classList.toggle('is-hover', mode === 'hover');
    cur.classList.toggle('has-label', mode === 'label');
    cur.dataset.mode = el?.dataset.cursor || '';
    label.textContent = key ? t(key) : '';
  };
  document.addEventListener('pointerover', (e) => decide(e.target));
  onLangChange(() => { const c = current; current = null; decide(c); });
}

// ---------- botones magnéticos ----------
function initMagnetic() {
  if (!fine || reduced) return;
  document.querySelectorAll('.btn, .lang-btn, .to-top, .brand, .hs-step').forEach((el) => {
    const strength = el.classList.contains('hs-step') ? 0.18 : 0.3;
    const xTo = gsap.quickTo(el, 'x', { duration: 0.5, ease: 'power3' });
    const yTo = gsap.quickTo(el, 'y', { duration: 0.5, ease: 'power3' });
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      xTo((e.clientX - (r.left + r.width / 2)) * strength);
      yTo((e.clientY - (r.top + r.height / 2)) * strength * 1.2);
    });
    el.addEventListener('pointerleave', () => {
      gsap.to(el, { x: 0, y: 0, duration: 0.8, ease: 'elastic.out(1, 0.45)', overwrite: true });
    });
  });
}

// ---------- foco de luz que sigue al mouse en las tarjetas ----------
function initSpotlight() {
  const cards = document.querySelectorAll('.hs .panel, .stack-card, .club-row, .feature-media');
  cards.forEach((c) => c.classList.add('spot'));
  if (!fine) return;
  document.addEventListener('pointermove', (e) => {
    const c = e.target.closest?.('.spot');
    if (!c) return;
    const r = c.getBoundingClientRect();
    c.style.setProperty('--mx', `${(e.clientX - r.left).toFixed(0)}px`);
    c.style.setProperty('--my', `${(e.clientY - r.top).toFixed(0)}px`);
  }, { passive: true });
}

// ---------- números que cuentan al aparecer ----------
function initCounters() {
  if (reduced) return;
  const targets = document.querySelectorAll('.fact-num, .stack-count, .recipe-badges span:first-child');
  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (!en.isIntersecting) return;
      io.unobserve(en.target);
      const to = +en.target.dataset.to;
      const o = { v: 0 };
      gsap.to(o, {
        v: to, duration: 1.3 + Math.min(to, 40) * 0.01, ease: 'power3.out', delay: 0.15,
        onUpdate: () => { en.target.textContent = String(Math.round(o.v)); },
      });
    });
  }, { threshold: 0.8 });
  targets.forEach((el) => {
    const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    const n = walker.nextNode();
    if (!n) return;
    const m = n.nodeValue.match(/\d+/);
    // solo si arranca con el número ("35+", "11 …") o con un + ("+35"): "E2E" no cuenta
    if (!m || !(m.index === 0 || (m.index === 1 && n.nodeValue[0] === '+'))) return;
    const num = n.splitText(m.index);
    num.splitText(m[0].length);
    const span = document.createElement('span');
    span.className = 'count';
    span.dataset.to = m[0];
    span.textContent = '0';
    num.replaceWith(span);
    io.observe(span);
  });
}

// ---------- títulos chicos que se decodifican al entrar ----------
function initEyebrows() {
  if (reduced) return;
  document.querySelectorAll('.gitlog-head .eyebrow, .usos-head .eyebrow, .proyectos-head .eyebrow, .feature-body .eyebrow, .contact-content .eyebrow, .gitlog-cmd').forEach((el) => {
    const leaf = el.children.length ? null : el;
    if (!leaf) return;
    ScrollTrigger.create({ trigger: el, start: 'top 90%', once: true, onEnter: () => scramble(leaf, 0.9) });
  });
  // hover: el menú y el mail se decodifican
  document.querySelectorAll('.nav-links a, .footer-links a, .contact-email').forEach((el) => {
    el.addEventListener('mouseenter', () => scramble(el, 0.5));
  });
}

// ---------- tono por sección + HUD + marcas en la barra de progreso ----------
function initSections() {
  const hudIdx = document.querySelector('.hud-idx');
  const hudName = document.querySelector('.hud-name');
  const secs = [...document.querySelectorAll('[data-hud]')];
  let active = null;
  const show = (el) => {
    if (!el || el === active) return;
    active = el;
    root.dataset.tone = el.dataset.tone || 'spark';
    if (hudIdx.textContent !== el.dataset.hud) {
      hudIdx.textContent = el.dataset.hud;
      hudName.textContent = t(el.dataset.hudKey);
      scramble(hudName, 0.5);
    }
  };
  // la sección activa es la última cuyo comienzo ya pasó. (Con endTrigger,
  // el final de la sección fijada no contaba el alto del pin.)
  const starts = secs.map((el) => ({ el, st: ScrollTrigger.create({ trigger: el, start: 'top center' }) }));
  const pick = (y) => {
    let cur = starts[0];
    for (const s of starts) if (y >= s.st.start) cur = s;
    show(cur.el);
  };
  ScrollTrigger.create({ start: 0, end: 'max', onUpdate: (self) => pick(self.scroll()) });
  ScrollTrigger.addEventListener('refresh', () => pick(window.scrollY));
  show(secs[0]);
  onLangChange(() => { if (active) hudName.textContent = t(active.dataset.hudKey); });

  // marcas de cada sección sobre la barra de progreso de la derecha
  const drip = document.querySelector('.drip');
  const ticks = secs.filter((el, i) => i === 0 || el.dataset.hud !== secs[i - 1].dataset.hud).map((el) => {
    const tick = document.createElement('span');
    tick.className = 'drip-tick';
    drip.appendChild(tick);
    return { el, tick };
  });
  // se mide después de cada refresh: para entonces ya están los espacios de los pines
  const place = () => {
    const max = document.documentElement.scrollHeight - innerHeight;
    const y0 = window.__lenis ? window.__lenis.scroll : window.scrollY;
    ticks.forEach(({ el, tick }) => {
      const top = (el.parentElement.classList.contains('pin-spacer') ? el.parentElement : el).getBoundingClientRect().top + y0;
      tick.style.top = `${Math.max(0, Math.min(100, (top / max) * 100)).toFixed(2)}%`;
    });
  };
  ScrollTrigger.addEventListener('refresh', place);
  place();
}

// ---------- saludo y hora de Buenos Aires (los dos puntos titilan) ----------
function initClock() {
  const hh = document.querySelector('#clock .hh');
  const mm = document.querySelector('#clock .mm');
  const greet = document.getElementById('greet');
  if (!hh) return;
  const fmt = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'America/Argentina/Buenos_Aires', hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
  });
  const paint = () => {
    const parts = fmt.formatToParts(new Date());
    const h = parts.find((p) => p.type === 'hour').value;
    const m = parts.find((p) => p.type === 'minute').value;
    hh.textContent = h;
    mm.textContent = m;
    const n = +h;
    greet.textContent = t(n < 6 ? 'greet.night' : n < 12 ? 'greet.morning' : n < 20 ? 'greet.afternoon' : 'greet.night');
  };
  paint();
  setInterval(paint, 10000);
  onLangChange(paint);
}

// ---------- copiar el mail: el botón confirma ----------
let toastTimer;
function toast(msg) {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.hidden = false;
  el.classList.remove('is-out');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    el.classList.add('is-out');
    setTimeout(() => { el.hidden = true; }, 300);
  }, 1800);
}
async function copyEmail(btn) {
  let ok = true;
  try { await navigator.clipboard.writeText(EMAIL); } catch { ok = false; }
  if (!btn) { toast(ok ? t('copied') : EMAIL); return; }
  if (!ok) { toast(EMAIL); return; }
  btn.classList.add('is-done');
  btn.textContent = t('copied.short');
  clearTimeout(btn._t);
  btn._t = setTimeout(() => { btn.classList.remove('is-done'); btn.textContent = t('contact.copy'); }, 1800);
}
function initCopy() {
  document.querySelectorAll('[data-copy]').forEach((btn) => btn.addEventListener('click', () => copyEmail(btn)));
}

// ---------- atajos de teclado ----------
function initShortcuts() {
  addEventListener('keydown', (e) => {
    if (e.metaKey || e.ctrlKey || e.altKey || e.repeat) return;
    if (e.target instanceof HTMLElement && e.target.closest('input, textarea, [contenteditable]')) return;
    const k = e.key.toLowerCase();
    if (k === 'l') {
      applyLang(getLang() === 'es' ? 'en' : 'es');
      toast(t('lang.done'));
    } else if (k === 'e') {
      copyEmail(null);
    }
  });
}

// ---------- el idioma cambia con un guiño ----------
function initLangFlair() {
  onLangChange(() => {
    if (reduced) return;
    requestAnimationFrame(() => {
      document.querySelectorAll('.nav-links a, .lang-btn').forEach((el) => scramble(el, 0.45));
    });
  });
}

// ---------- volver arriba, con el avance en el anillo ----------
function initToTop() {
  const btn = document.querySelector('.to-top');
  if (!btn) return;
  const ring = btn.querySelector('.ring');
  const C = 2 * Math.PI * 20;
  ring.style.strokeDasharray = `${C}`;
  ScrollTrigger.create({
    start: 0, end: () => document.documentElement.scrollHeight - innerHeight,
    onUpdate: (self) => {
      ring.style.strokeDashoffset = `${(C * (1 - self.progress)).toFixed(1)}`;
      btn.classList.toggle('is-on', self.scroll() > innerHeight * 2.5);
    },
  });
  btn.addEventListener('click', () => {
    if (window.__lenis) window.__lenis.scrollTo(0, { duration: 2.4 });
    else window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' });
  });
}

// ---------- la firma: fecha de hoy y se reescribe al pasarle el mouse ----------
function initSignature() {
  const sign = document.querySelector('.signature');
  const date = document.getElementById('sign-date');
  const paint = () => {
    date.textContent = new Intl.DateTimeFormat(getLang() === 'en' ? 'en-US' : 'es-AR', { month: 'long', year: 'numeric' }).format(new Date());
  };
  paint();
  onLangChange(paint);
  if (!sign || reduced || !fine) return;
  let busy = false;
  sign.addEventListener('mouseenter', () => {
    if (busy) return;
    busy = true;
    gsap.fromTo(sign, { clipPath: 'inset(-20% 100% -20% 0)' }, {
      clipPath: 'inset(-20% 0% -20% 0)', duration: 1.4, ease: 'power2.inOut', onComplete: () => { busy = false; },
    });
  });
}

// ---------- última actualización (la fecha del archivo publicado) ----------
function initUpdated() {
  const el = document.getElementById('updated');
  if (!el) return;
  const d = new Date(document.lastModified);
  const paint = () => {
    el.textContent = new Intl.DateTimeFormat(getLang() === 'en' ? 'en-US' : 'es-AR', { month: 'short', year: 'numeric' }).format(isNaN(d) ? new Date() : d);
  };
  paint();
  onLangChange(paint);
}

// ---------- vista previa flotante del sitio de Agustina ----------
function initPreview() {
  const row = document.querySelector('.workrow');
  const img = row?.querySelector('.workrow-preview');
  if (!img || !fine || reduced) return;
  // al body: la fila tiene transform (su animación de entrada) y eso
  // convertiría al position: fixed en relativo a la fila
  document.body.appendChild(img);
  const xTo = gsap.quickTo(img, 'x', { duration: 0.6, ease: 'power3' });
  const yTo = gsap.quickTo(img, 'y', { duration: 0.6, ease: 'power3' });
  const rTo = gsap.quickTo(img, 'rotation', { duration: 0.8, ease: 'power3' });
  let lastX = 0;
  row.addEventListener('pointermove', (e) => {
    xTo(e.clientX + 24);
    yTo(e.clientY - 120);
    rTo(Math.max(-8, Math.min(8, (e.clientX - lastX) * 0.6)));
    lastX = e.clientX;
  });
  row.addEventListener('pointerenter', (e) => {
    gsap.set(img, { x: e.clientX + 24, y: e.clientY - 120 });
    lastX = e.clientX;
    img.classList.add('is-on');
  });
  row.addEventListener('pointerleave', () => img.classList.remove('is-on'));
}

// ---------- las imágenes aparecen suave cuando cargan ----------
function initImages() {
  document.querySelectorAll('.feature-media img').forEach((img) => {
    img.classList.add('fade-img');
    const done = () => img.classList.add('is-loaded');
    if (img.complete && img.naturalWidth) done();
    else img.addEventListener('load', done, { once: true });
  });
}

// ---------- marquee del stack: acelera y se inclina con el scroll ----------
function initMarquee() {
  if (reduced) return;
  const inner = document.querySelector('.marquee-inner');
  if (!inner) return;
  inner.style.animation = 'none';
  let x = 0, vel = 0, dir = -1, skew = 0, visible = false;
  ScrollTrigger.create({
    trigger: '.marquee', start: 'top bottom', end: 'bottom top',
    onToggle: (self) => { visible = self.isActive; },
    onUpdate: (self) => { vel = self.getVelocity(); dir = self.direction === 1 ? -1 : 1; },
  });
  gsap.ticker.add((time, dt) => {
    if (!visible) return;
    const half = inner.scrollWidth / 2;
    const speed = 38 + Math.min(Math.abs(vel) * 0.08, 520);
    x += dir * speed * (dt / 1000);
    if (x <= -half) x += half;
    if (x > 0) x -= half;
    vel *= 0.92;
    skew += (Math.max(-9, Math.min(9, -vel * 0.0045)) - skew) * 0.12;
    inner.style.transform = `translate3d(${x.toFixed(1)}px,0,0) skewX(${skew.toFixed(2)}deg)`;
  });
}

// ---------- índice en cada tarjeta del proceso ----------
function initPanelIndex() {
  const panels = document.querySelectorAll('.hs .panel');
  panels.forEach((p, i) => {
    const s = document.createElement('span');
    s.className = 'panel-idx';
    s.setAttribute('aria-hidden', 'true');
    s.innerHTML = `${String(i + 1).padStart(2, '0')}<span>/${String(panels.length).padStart(2, '0')}</span>`;
    p.appendChild(s);
  });
}

// ---------- portada: la terminal que rota frases ----------
function initRotator() {
  const el = document.getElementById('intro-rot');
  if (!el) return;
  let timer = null;
  const start = () => {
    clearTimeout(timer);
    const list = t('intro.rot').split('|');
    if (reduced) { el.textContent = list[0]; return; }
    let i = 0, n = list[0].length, deleting = false;
    el.textContent = list[0];
    const tick = () => {
      const word = list[i];
      if (!deleting) {
        n++;
        el.textContent = word.slice(0, n);
        if (n >= word.length) { deleting = true; timer = setTimeout(tick, 2100); return; }
        timer = setTimeout(tick, 55 + Math.random() * 55); // tipeo humano: ritmo irregular
      } else {
        n--;
        el.textContent = word.slice(0, Math.max(0, n));
        if (n <= 0) { deleting = false; i = (i + 1) % list.length; timer = setTimeout(tick, 320); return; }
        timer = setTimeout(tick, 28);
      }
    };
    deleting = true;
    timer = setTimeout(tick, 3200); // la primera se queda un rato
  };
  start();
  onLangChange(start);
}

// ---------- portada: ES / EN a mano desde el primer segundo ----------
function initIntroLang() {
  document.querySelectorAll('[data-set-lang]').forEach((b) => {
    b.addEventListener('click', () => { if (b.dataset.setLang !== getLang()) applyLang(b.dataset.setLang); });
  });
}

// ---------- portada: una luz cálida sigue al mouse sobre el naranja ----------
function initSparkLight() {
  const bd = document.querySelector('.bd-spark');
  if (!bd || !fine || reduced) return;
  addEventListener('pointermove', (e) => {
    if (root.dataset.flat !== '1') return;
    bd.style.setProperty('--lx', `${e.clientX}px`);
    bd.style.setProperty('--ly', `${e.clientY}px`);
    bd.style.setProperty('--lo', '1');
  }, { passive: true });
  root.addEventListener('mouseleave', () => bd.style.setProperty('--lo', '0'));
}

// ---------- si te vas de la pestaña ----------
function initTabTitle() {
  document.addEventListener('visibilitychange', () => {
    document.title = document.hidden ? t('tab.away') : t('meta.title');
  });
}

// ---------- para quien abra la consola ----------
function consoleHello() {
  const big = 'font: 800 22px system-ui; color: #ff6a2b;';
  const txt = 'font: 13px ui-monospace, monospace; color: #9d9a92;';
  console.log(`%cFR%c\n${t('console.hi')}\n→ ${EMAIL}`, big, txt);
}

export function initDetails() {
  wrapArrows();
  initName();
  initRotator();
  initIntroLang();
  initSparkLight();
  initPanelIndex();
  initSpotlight();
  initCopy();
  initClock();
  initSignature();
  initUpdated();
  initImages();
  initTabTitle();
  initShortcuts();
  initSections();
  initToTop();
  initCursor();
  initMagnetic();
  initCounters();
  initEyebrows();
  initLangFlair();
  initPreview();
  initMarquee();
  consoleHello();
}
