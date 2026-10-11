// ============================================================
//  Escena 3D: una nube de partículas de datos que cambia de forma.
//  Es el hilo del sitio, "de la idea a producción":
//    chispa (la idea) → globo de datos → flujo → barras (datos)
//    → celular con un chat (la aplicación) → pods (producción)
//    → polvo de fondo → globo chico → las iniciales FR.
//  Cada forma es un atributo de la geometría; el shader mezcla dos
//  formas con un retraso distinto por partícula, así el cambio se ve
//  orgánico y no como un fundido.
// ============================================================
import * as THREE from '../vendor/three.min.js';

const SHAPES = ['spark', 'globe', 'stream', 'bars', 'app', 'pods', 'dust', 'mono'];
// el recorrido: posición en la secuencia → forma (scroll.js anima state.seq)
export const SEQ = ['spark', 'globe', 'stream', 'spark', 'bars', 'app', 'pods', 'dust', 'globe', 'mono'];
const SHAPE_ID = Object.fromEntries(SHAPES.map((s, i) => [s, i]));

// colores (abajo → arriba), tamaño y opacidad de cada forma
const LOOK = {
  spark: { c0: '#ff6a2b', c1: '#ffe7c4', size: 1.2, alpha: 1 },
  globe: { c0: '#ff7a36', c1: '#56c9f2', size: 1, alpha: 0.95 },
  stream: { c0: '#2a8fd6', c1: '#a3e8ff', size: 1, alpha: 1 },
  bars: { c0: '#2b78d0', c1: '#ffb15c', size: 0.95, alpha: 0.95 },
  app: { c0: '#79d2ff', c1: '#f5f9ff', size: 0.85, alpha: 0.95 },
  pods: { c0: '#22c08a', c1: '#a8ffdd', size: 0.95, alpha: 0.95 },
  dust: { c0: '#3a5470', c1: '#7c90a8', size: 0.7, alpha: 0.42 },
  mono: { c0: '#ff7430', c1: '#ffd6ad', size: 0.95, alpha: 1 },
};

// ---------- azar con semilla (las formas salen siempre iguales) ----------
function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const gaussian = (r) => {
  const u = Math.max(1e-6, r());
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * r());
};
const unitVec = (r) => {
  const z = r() * 2 - 1, a = r() * Math.PI * 2, s = Math.sqrt(1 - z * z);
  return [Math.cos(a) * s, z, Math.sin(a) * s];
};
// elige un índice con probabilidad proporcional a su peso
const pickWeighted = (r, cum) => {
  const x = r() * cum[cum.length - 1];
  let i = 0;
  while (cum[i] < x) i++;
  return i;
};
const cumulative = (ws) => ws.reduce((acc, w, i) => (acc.push((acc[i - 1] || 0) + w), acc), []);

// punto al azar sobre el contorno de un rectángulo redondeado
function onRoundRect(r, cx, cy, w, h, rad) {
  const sw = w - 2 * rad, sh = h - 2 * rad, arc = (Math.PI / 2) * rad;
  const per = 2 * sw + 2 * sh + 4 * arc;
  let d = r() * per;
  const segs = [
    [sw, (t) => [cx - sw / 2 + t, cy + h / 2]],
    [arc, (t) => { const a = Math.PI / 2 - t / rad; return [cx + sw / 2 + Math.cos(a) * rad, cy + sh / 2 + Math.sin(a) * rad]; }],
    [sh, (t) => [cx + w / 2, cy + sh / 2 - t]],
    [arc, (t) => { const a = -t / rad; return [cx + sw / 2 + Math.cos(a) * rad, cy - sh / 2 + Math.sin(a) * rad]; }],
    [sw, (t) => [cx + sw / 2 - t, cy - h / 2]],
    [arc, (t) => { const a = -Math.PI / 2 - t / rad; return [cx - sw / 2 + Math.cos(a) * rad, cy - sh / 2 + Math.sin(a) * rad]; }],
    [sh, (t) => [cx - w / 2, cy - sh / 2 + t]],
    [arc, (t) => { const a = Math.PI - t / rad; return [cx - sw / 2 + Math.cos(a) * rad, cy + sh / 2 + Math.sin(a) * rad]; }],
  ];
  for (const [len, f] of segs) {
    if (d <= len) return f(d);
    d -= len;
  }
  return [cx, cy];
}
// punto al azar adentro de un rectángulo redondeado
function inRoundRect(r, cx, cy, w, h, rad) {
  for (let k = 0; k < 20; k++) {
    const x = (r() - 0.5) * w, y = (r() - 0.5) * h;
    const dx = Math.max(Math.abs(x) - (w / 2 - rad), 0), dy = Math.max(Math.abs(y) - (h / 2 - rad), 0);
    if (dx * dx + dy * dy <= rad * rad) return [cx + x, cy + y];
  }
  return [cx, cy];
}

// ---------- las formas ----------
function buildSpark(N, r) {
  const out = new Float32Array(N * 3);
  for (let i = 0; i < N; i++) {
    let v;
    if (r() < 0.6) {
      v = [gaussian(r) * 0.08, gaussian(r) * 0.08, gaussian(r) * 0.08]; // núcleo
    } else {
      const d = unitVec(r), rad = 0.13 + Math.pow(r(), 2.3) * 1.05; // halo que irradia
      v = [d[0] * rad, d[1] * rad, d[2] * rad];
    }
    out.set(v, i * 3);
  }
  return out;
}

function buildGlobe(N, r) {
  const out = new Float32Array(N * 3);
  const R = 1.22, M = Math.floor(N * 0.72), golden = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < M; i++) {
    const y = 1 - (2 * (i + 0.5)) / M, s = Math.sqrt(1 - y * y), th = golden * i;
    out.set([Math.cos(th) * s * R, y * R, Math.sin(th) * s * R], i * 3);
  }
  // dos órbitas de datos alrededor
  const rings = [[1.62, 0.42, 0.2], [1.88, -0.32, -0.35]];
  for (let i = M; i < N; i++) {
    const [rr, tx, tz] = rings[i % 2];
    const a = r() * Math.PI * 2;
    let x = Math.cos(a) * rr, y = gaussian(r) * 0.012, z = Math.sin(a) * rr;
    [y, z] = [y * Math.cos(tx) - z * Math.sin(tx), y * Math.sin(tx) + z * Math.cos(tx)];
    [x, y] = [x * Math.cos(tz) - y * Math.sin(tz), x * Math.sin(tz) + y * Math.cos(tz)];
    out.set([x, y, z], i * 3);
  }
  return out;
}

// el flujo: una bola arriba y un chorro que cae (la altura la anima el shader)
function buildStream(N, r) {
  const out = new Float32Array(N * 3);
  for (let i = 0; i < N; i++) {
    if (r() < 0.26) out.set([gaussian(r) * 0.3, 1.25 + gaussian(r) * 0.22, gaussian(r) * 0.3], i * 3);
    else out.set([gaussian(r) * 0.06, 0, gaussian(r) * 0.06], i * 3); // y < 0.9: cae
  }
  return out;
}

// gráfico de barras 3D: crece de izquierda a derecha
function buildBars(N, r) {
  const out = new Float32Array(N * 3);
  const cols = 6, rows = 3, s = 0.34, pitch = 0.54, base = -1.35;
  const bars = [];
  const hr = rng(42);
  for (let c = 0; c < cols; c++) {
    for (let w = 0; w < rows; w++) {
      bars.push({
        x: (c - (cols - 1) / 2) * pitch, z: (w - (rows - 1) / 2) * pitch,
        h: 0.35 + c * 0.37 + hr() * 0.38 - w * 0.12,
      });
    }
  }
  const cum = cumulative(bars.map((b) => b.h + 0.4));
  for (let i = 0; i < N; i++) {
    let p;
    if (r() < 0.1) {
      // grilla del piso
      const along = (r() - 0.5) * cols * pitch, k = Math.floor(r() * (rows + 1)) - rows / 2;
      p = r() < 0.5 ? [along, base, k * pitch] : [(Math.floor(r() * (cols + 1)) - cols / 2) * pitch, base, (r() - 0.5) * rows * pitch];
    } else {
      const b = bars[pickWeighted(r, cum)];
      const x0 = b.x - s / 2, z0 = b.z - s / 2, top = base + b.h;
      if (r() < 0.5) {
        // aristas: el dibujo de la barra
        const e = Math.floor(r() * 12), t = r();
        const xs = [x0, x0 + s], zs = [z0, z0 + s];
        if (e < 4) p = [xs[e & 1], base + t * b.h, zs[e >> 1]];
        else if (e < 8) p = [x0 + t * s, (e & 1) ? top : base, zs[(e >> 1) & 1]];
        else p = [xs[e & 1], (e >> 1) & 1 ? top : base, z0 + t * s];
      } else {
        // caras (la de arriba con más densidad: brilla)
        const f = r();
        if (f < 0.3) p = [x0 + r() * s, top, z0 + r() * s];
        else if (f < 0.65) p = [x0 + r() * s, base + r() * b.h, r() < 0.5 ? z0 : z0 + s];
        else p = [r() < 0.5 ? x0 : x0 + s, base + r() * b.h, z0 + r() * s];
      }
    }
    out.set(p, i * 3);
  }
  return out;
}

// un celular con un chat (la aplicación)
function buildApp(N, r) {
  const out = new Float32Array(N * 3);
  const W = 1.85, H = 3.6, inner = W / 2 - 0.13;
  const bubbles = [
    [-1, 1.02, 1.15, 0.34], [1, 0.56, 0.95, 0.3], [-1, 0.02, 1.3, 0.5],
    [1, -0.52, 1.05, 0.34], [-1, -1.0, 0.62, 0.28],
  ].map(([side, y, w, h]) => ({ x: side * (inner - w / 2), y, w, h }));
  const bCum = cumulative(bubbles.map((b) => b.w * b.h));
  const parts = cumulative([0.24, 0.07, 0.55, 0.1, 0.04]);
  for (let i = 0; i < N; i++) {
    let p;
    const k = pickWeighted(r, parts);
    if (k === 0) p = onRoundRect(r, 0, 0, W, H, 0.26); // marco
    else if (k === 1) {
      // barra de arriba con el avatar
      p = r() < 0.35 ? inRoundRect(r, -0.6, 1.42, 0.2, 0.2, 0.1) : [-0.38 + r() * 0.7, 1.42 + (r() - 0.5) * 0.06];
    } else if (k === 2) {
      const b = bubbles[pickWeighted(r, bCum)];
      p = inRoundRect(r, b.x, b.y, b.w, b.h, 0.12); // burbujas
    } else if (k === 3) {
      p = r() < 0.75 ? onRoundRect(r, -0.14, -1.5, 1.3, 0.26, 0.13) : inRoundRect(r, 0.68, -1.5, 0.24, 0.24, 0.12); // escribir + enviar
    } else {
      p = inRoundRect(r, 0, 1.66, 0.4, 0.07, 0.035); // parlante
    }
    out.set([p[0], p[1], (r() - 0.5) * 0.04], i * 3);
  }
  return out;
}

// el cluster: pods conectados (producción)
function buildPods(N, r) {
  const out = new Float32Array(N * 3);
  const cols = 4, rows = 3, s = 0.5, pitch = 0.8;
  const pods = [];
  for (let c = 0; c < cols; c++) for (let w = 0; w < rows; w++) pods.push([(c - (cols - 1) / 2) * pitch, (w - (rows - 1) / 2) * pitch]);
  for (let i = 0; i < N; i++) {
    let p;
    if (r() < 0.12) {
      // la red que los conecta
      const [x, y] = pods[Math.floor(r() * pods.length)];
      p = r() < 0.5 ? [x + s / 2 + r() * (pitch - s), y, 0] : [x, y + s / 2 + r() * (pitch - s), 0];
      if (p[0] > (cols - 1) / 2 * pitch + 0.01 || p[1] > (rows - 1) / 2 * pitch + 0.01) p = [x, y, 0];
    } else {
      const [cx, cy] = pods[Math.floor(r() * pods.length)];
      const x0 = cx - s / 2, y0 = cy - s / 2, z0 = -s / 2, t = r();
      if (r() < 0.7) {
        const e = Math.floor(r() * 12);
        const xs = [x0, x0 + s], ys = [y0, y0 + s], zs = [z0, z0 + s];
        if (e < 4) p = [x0 + t * s, ys[e & 1], zs[e >> 1]];
        else if (e < 8) p = [xs[e & 1], y0 + t * s, zs[(e >> 1) & 1]];
        else p = [xs[e & 1], ys[(e >> 1) & 1], z0 + t * s];
      } else {
        p = [x0 + r() * s, y0 + r() * s, r() < 0.5 ? z0 : z0 + s];
      }
    }
    out.set(p, i * 3);
  }
  return out;
}

function buildDust(N, r) {
  const out = new Float32Array(N * 3);
  for (let i = 0; i < N; i++) out.set([(r() - 0.5) * 15, (r() - 0.5) * 9, -7 + r() * 8], i * 3);
  return out;
}

// las iniciales, muestreadas de un texto dibujado en un canvas
function buildMono(N, r, text = 'FR') {
  const c = document.createElement('canvas');
  c.width = 640;
  c.height = 320;
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#fff';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = '800 270px "Bricolage Grotesque", system-ui, sans-serif';
  ctx.fillText(text, 320, 170);
  const data = ctx.getImageData(0, 0, c.width, c.height).data;
  const px = [];
  let minX = 1e9, maxX = -1e9, minY = 1e9, maxY = -1e9;
  for (let y = 0; y < c.height; y += 2) {
    for (let x = 0; x < c.width; x += 2) {
      if (data[(y * c.width + x) * 4 + 3] > 140) {
        px.push(x, y);
        minX = Math.min(minX, x); maxX = Math.max(maxX, x); minY = Math.min(minY, y); maxY = Math.max(maxY, y);
      }
    }
  }
  const out = new Float32Array(N * 3);
  if (!px.length) return buildSpark(N, r);
  const scale = 3.4 / (maxX - minX), cx = (minX + maxX) / 2, cy = (minY + maxY) / 2;
  for (let i = 0; i < N; i++) {
    const k = Math.floor(r() * (px.length / 2)) * 2;
    out.set([(px[k] + r() * 2 - cx) * scale, -(px[k + 1] + r() * 2 - cy) * scale, gaussian(r) * 0.07], i * 3);
  }
  return out;
}

export class DataScene {
  constructor(canvas) {
    this.canvas = canvas;
    this.renderer = new THREE.WebGLRenderer({
      canvas, alpha: true, antialias: false, powerPreference: 'high-performance',
    });
    this.dpr = Math.min(window.devicePixelRatio, window.innerWidth < 768 ? 2 : 1.75);
    this.renderer.setPixelRatio(this.dpr);
    this.perf = { n: 0, acc: 0, last: 0 };

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(35, 1, 0.1, 80);
    this.camera.position.set(0, 0, 7.4);

    this.t0 = performance.now(); // reloj propio (THREE.Clock está deprecado)
    this.pointer = { x: 0, y: 0 };
    this.spin = { dragging: false, lastX: 0, v: 0, offset: 0 };
    this.spinAngle = 0;
    this.state = {
      // valores que anima el scroll (scroll.js)
      seq: 0, posX: 0, posY: 0, scale: 1, rotY: 0, tilt: 0,
      spin: 0.3, alpha: 1, glow: 0.6, pulse: 0,
    };
    this.colors = Object.fromEntries(
      Object.entries(LOOK).map(([k, v]) => [k, [new THREE.Color(v.c0), new THREE.Color(v.c1)]])
    );
    // el cursor aparta las partículas (solo con mouse)
    this.fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
    this.mouse = { x: 9, y: 9 };
    this.repel = 0;
    this.repelTarget = 0;
    // pin de Buenos Aires sobre el globo (34,6°S · 58,4°O)
    this.pinEl = document.getElementById('pin');
    const lat = (-34.6 * Math.PI) / 180, lon = (-58.4 * Math.PI) / 180;
    this.pinLocal = new THREE.Vector3(Math.cos(lat) * Math.cos(lon), Math.sin(lat), -Math.cos(lat) * Math.sin(lon)).multiplyScalar(1.24);
    this._v = new THREE.Vector3();
    this._n = new THREE.Vector3();
    this._c = new THREE.Vector3();

    this.#backglow();
    this.#cloud();
    this.#events();
    // lista = las iniciales ya se muestrearon con la tipografía real
    this.ready = document.fonts.load('800 100px "Bricolage Grotesque"')
      .catch(() => {})
      .then(() => {
        const attr = this.geo.getAttribute('aMono');
        attr.array.set(buildMono(this.N, rng(9)));
        attr.needsUpdate = true;
      });
    this.resize();
    this.renderer.setAnimationLoop(() => this.#tick());
  }

  // halo detrás de la nube (lo tiñe la forma actual)
  #backglow() {
    const c = document.createElement('canvas');
    c.width = c.height = 512;
    const ctx = c.getContext('2d');
    const g = ctx.createRadialGradient(256, 256, 10, 256, 256, 256);
    g.addColorStop(0, 'rgba(255,255,255,0.9)');
    g.addColorStop(0.3, 'rgba(255,255,255,0.32)');
    g.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 512, 512);
    const tex = new THREE.CanvasTexture(c);
    this.glowMat = new THREE.MeshBasicMaterial({
      map: tex, transparent: true, opacity: 0.3, blending: THREE.AdditiveBlending, depthWrite: false,
    });
    this.glow = new THREE.Mesh(new THREE.PlaneGeometry(6, 6), this.glowMat);
    this.glow.position.z = -2.5;
    this.scene.add(this.glow);
  }

  #cloud() {
    const N = window.innerWidth < 768 ? 5200 : 9000;
    this.N = N;
    const geo = new THREE.BufferGeometry();
    const r = rng(7);
    const shapes = {
      spark: buildSpark(N, r), globe: buildGlobe(N, r), stream: buildStream(N, r), bars: buildBars(N, r),
      app: buildApp(N, r), pods: buildPods(N, r), dust: buildDust(N, r), mono: buildSpark(N, r),
    };
    geo.setAttribute('position', new THREE.BufferAttribute(shapes.globe.slice(), 3));
    const cap = (s) => 'a' + s[0].toUpperCase() + s.slice(1);
    for (const s of SHAPES) geo.setAttribute(cap(s), new THREE.BufferAttribute(shapes[s], 3));
    const rand = new Float32Array(N * 2);
    for (let i = 0; i < N; i++) { rand[i * 2] = r(); rand[i * 2 + 1] = r(); }
    geo.setAttribute('aRand', new THREE.BufferAttribute(rand, 2));
    this.geo = geo;

    this.mat = new THREE.ShaderMaterial({
      uniforms: {
        uA: { value: 0 }, uB: { value: 1 }, uMix: { value: 0 }, uTime: { value: 0 },
        uPx: { value: this.dpr }, uSize: { value: 3 }, uOpacity: { value: 1 }, uPulse: { value: 0 },
        uCA0: { value: new THREE.Color() }, uCA1: { value: new THREE.Color() },
        uCB0: { value: new THREE.Color() }, uCB1: { value: new THREE.Color() },
        uMouse: { value: new THREE.Vector2(9, 9) }, uRepel: { value: 0 }, uAspect: { value: 1 },
      },
      vertexShader: /* glsl */ `
        attribute vec3 aSpark; attribute vec3 aGlobe; attribute vec3 aStream; attribute vec3 aBars;
        attribute vec3 aApp; attribute vec3 aPods; attribute vec3 aDust; attribute vec3 aMono;
        attribute vec2 aRand;
        uniform float uA; uniform float uB; uniform float uMix; uniform float uTime;
        uniform float uPx; uniform float uSize; uniform float uPulse;
        uniform vec3 uCA0; uniform vec3 uCA1; uniform vec3 uCB0; uniform vec3 uCB1;
        uniform vec2 uMouse; uniform float uRepel; uniform float uAspect;
        varying vec3 vColor; varying float vTw;

        vec3 shapePos(float id) {
          if (id < 0.5) return aSpark;
          if (id < 1.5) return aGlobe;
          if (id < 2.5) {
            // el chorro cae en loop y se abre apenas al bajar
            vec3 s = aStream;
            if (s.y < 0.9) {
              s.y = 0.9 - fract(aRand.x * 3.7 + uTime * 0.32) * 5.8;
              s.xz *= 1.0 + (0.9 - s.y) * 0.16;
            }
            return s;
          }
          if (id < 3.5) return aBars;
          if (id < 4.5) return aApp;
          if (id < 5.5) return aPods;
          if (id < 6.5) return aDust;
          return aMono;
        }

        void main() {
          // cada partícula arranca su viaje con un retraso distinto
          float m = clamp((uMix - aRand.x * 0.35) / 0.65, 0.0, 1.0);
          m = m * m * (3.0 - 2.0 * m);
          vec3 a = shapePos(uA);
          vec3 b = shapePos(uB);
          vec3 p = mix(a, b, m);
          // en el medio del viaje se abren: no van en línea recta
          vec3 dir = normalize(vec3(aRand.y - 0.5, aRand.x - 0.5, fract(aRand.x * 7.13) - 0.5) + 0.0001);
          p += dir * sin(m * 3.14159) * (0.6 + aRand.y * 0.9);
          // respiración y pulso
          p += vec3(sin(uTime * 0.7 + aRand.x * 40.0), cos(uTime * 0.6 + aRand.y * 31.0), sin(uTime * 0.5 + aRand.x * 23.0)) * 0.016;
          p *= 1.0 + uPulse * 0.06 * sin(uTime * 2.6);
          vec4 mv = modelViewMatrix * vec4(p, 1.0);
          // el cursor las aparta (medido en pantalla: igual a cualquier profundidad)
          vec4 clip = projectionMatrix * mv;
          vec2 diff = (clip.xy / clip.w - uMouse) * vec2(uAspect, 1.0);
          float push = smoothstep(0.36, 0.0, length(diff)) * uRepel;
          mv.xy += normalize(diff + 0.00001) * push * 0.075 * -mv.z;
          gl_Position = projectionMatrix * mv;
          gl_PointSize = uSize * (0.55 + aRand.y * 1.1) * uPx * (6.0 / -mv.z) * (1.0 + push * 0.6);
          float g = clamp(p.y * 0.26 + 0.5, 0.0, 1.0);
          vColor = mix(mix(uCA0, uCA1, g), mix(uCB0, uCB1, g), m);
          // titileo: cada partícula a su ritmo, y algún destello suelto
          vTw = 0.72 + 0.28 * sin(uTime * (1.4 + aRand.y * 3.6) + aRand.x * 80.0)
              + step(0.992, fract(aRand.x * 13.7 + uTime * 0.05)) * 1.6
              + push * 0.5;
        }`,
      fragmentShader: /* glsl */ `
        uniform float uOpacity;
        varying vec3 vColor; varying float vTw;
        void main() {
          float d = length(gl_PointCoord - 0.5);
          if (d > 0.5) discard;
          float a = smoothstep(0.5, 0.05, d);
          gl_FragColor = vec4(vColor * a * vTw, a * uOpacity);
        }`,
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    });
    this.points = new THREE.Points(geo, this.mat);
    this.points.frustumCulled = false;
    this.group = new THREE.Group();
    this.group.add(this.points);
    this.scene.add(this.group);
  }

  // precalentado: compila el shader detrás de la pantalla de carga
  async warmup() {
    try {
      if (this.renderer.compileAsync) await this.renderer.compileAsync(this.scene, this.camera);
      this.renderer.render(this.scene, this.camera);
    } catch { /* se compila en el primer cuadro */ }
  }

  // tamaño visible del mundo en el plano z = 0
  viewSize() {
    const cam = this.camera;
    const h = 2 * Math.tan((cam.fov * Math.PI) / 360) * cam.position.z;
    return { w: h * cam.aspect, h };
  }

  #tick() {
    const t = (performance.now() - this.t0) / 1000;
    const dt = Math.min(0.05, t - (this._t ?? t));
    this._t = t;
    const s = this.state;

    // qué dos formas se están mezclando
    const seq = Math.min(Math.max(s.seq, 0), SEQ.length - 1);
    const i0 = Math.floor(seq), i1 = Math.min(SEQ.length - 1, i0 + 1), m = seq - i0;
    const a = SEQ[i0], b = SEQ[i1];
    const u = this.mat.uniforms;
    u.uA.value = SHAPE_ID[a];
    u.uB.value = SHAPE_ID[b];
    u.uMix.value = m;
    u.uTime.value = t;
    u.uPulse.value = s.pulse;
    u.uCA0.value.copy(this.colors[a][0]); u.uCA1.value.copy(this.colors[a][1]);
    u.uCB0.value.copy(this.colors[b][0]); u.uCB1.value.copy(this.colors[b][1]);
    const k = m * m * (3 - 2 * m);
    u.uSize.value = 3.1 * (LOOK[a].size + (LOOK[b].size - LOOK[a].size) * k);
    u.uOpacity.value = (LOOK[a].alpha + (LOOK[b].alpha - LOOK[a].alpha) * k) * s.alpha;

    // giro: en las formas que tienen que mirar a cámara se realinea solo
    this.spinAngle += dt * s.spin;
    if (s.spin < 0.03) {
      const whole = Math.round(this.spinAngle / (Math.PI * 2)) * Math.PI * 2;
      this.spinAngle += (whole - this.spinAngle) * 0.06;
    }
    if (!this.spin.dragging) {
      this.spin.offset += this.spin.v;
      this.spin.v *= 0.94;
      if (s.spin < 0.03) this.spin.offset *= 0.95;
    }
    const damp = Math.min(1, 1.2 / Math.max(s.scale, 0.01));
    this.group.position.set(s.posX, s.posY + Math.sin(t * 0.9) * 0.04 * damp, 0);
    this.group.scale.setScalar(s.scale);
    this.group.rotation.y = s.rotY + this.spinAngle + this.spin.offset + this.pointer.x * 0.2 * damp;
    this.group.rotation.x = s.tilt + this.pointer.y * 0.08 * damp;

    // el halo sigue a la nube y toma su color
    this.glow.position.set(s.posX, s.posY, -2.5);
    this.glow.scale.setScalar(Math.max(0.4, s.scale) * 1.1);
    this.glowMat.color.copy(this.colors[a][0]).lerp(this.colors[b][0], k);
    this.glowMat.opacity = s.glow * 0.32 * s.alpha;

    // el cursor: entra suave y se suelta suave
    this.repel += (this.repelTarget - this.repel) * 0.08;
    u.uMouse.value.set(this.mouse.x, this.mouse.y);
    u.uRepel.value = this.repel;
    u.uAspect.value = this.camera.aspect;

    this.#updatePin(i0, i1, k, s);

    const alpha = s.alpha;
    if (this._lastAlpha !== alpha) {
      this.canvas.style.opacity = Math.min(1, alpha * 1.5);
      this._lastAlpha = alpha;
    }
    if (alpha < 0.01) return;
    this.renderer.render(this.scene, this.camera);
    this.#adaptQuality();
  }

  // El pin de Buenos Aires: se proyecta el punto del globo a la pantalla y
  // se muestra solo cuando el globo del hero está armado y ese lado mira a cámara.
  #updatePin(i0, i1, k, s) {
    if (!this.pinEl) return;
    const w = i0 === 1 ? 1 - k : i1 === 1 ? k : 0;
    let op = 0;
    if (w > 0.7 && s.alpha > 0.5) {
      this.group.updateMatrixWorld();
      const p = this._v.copy(this.pinLocal).applyMatrix4(this.group.matrixWorld);
      const n = this._n.copy(p).sub(this.group.position).normalize();
      const facing = n.dot(this._c.copy(this.camera.position).sub(p).normalize());
      p.project(this.camera);
      const x = (p.x * 0.5 + 0.5) * this.vw;
      const y = (0.5 - p.y * 0.5) * this.vh;
      op = Math.min(1, (w - 0.7) / 0.3) * Math.max(0, Math.min(1, (facing - 0.12) / 0.3));
      if (op > 0.01) {
        this.pinEl.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`;
        const left = x > this.vw * 0.7; // cerca del borde: la etiqueta va del otro lado
        if (left !== this._pinLeft) { this.pinEl.classList.toggle('is-left', left); this._pinLeft = left; }
      }
    }
    if (Math.abs(op - (this._pinOp ?? -1)) > 0.01) {
      this.pinEl.style.opacity = op.toFixed(2);
      this._pinOp = op;
    }
  }

  // si el equipo no llega a ~52 fps, baja la resolución de a poco
  #adaptQuality() {
    const now = performance.now();
    const p = this.perf;
    const dt = p.last ? now - p.last : 16;
    p.last = now;
    if (dt > 200 || document.hidden) return;
    p.acc += dt;
    if (++p.n < 60) return;
    const avg = p.acc / p.n;
    p.n = 0;
    p.acc = 0;
    if (avg > 19 && this.dpr > 1) {
      this.dpr = Math.max(1, this.dpr - 0.25);
      this.renderer.setPixelRatio(this.dpr);
      this.mat.uniforms.uPx.value = this.dpr;
      this.resize();
    }
  }

  #events() {
    window.addEventListener('resize', () => this.resize());
    if (matchMedia('(pointer: fine)').matches) {
      window.addEventListener('pointermove', (e) => {
        this.pointer.x = (e.clientX / window.innerWidth - 0.5) * 2;
        this.pointer.y = (e.clientY / window.innerHeight - 0.5) * 2;
        if (e.pointerType === 'mouse' && this.fine) {
          this.mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
          this.mouse.y = 1 - (e.clientY / window.innerHeight) * 2;
          this.repelTarget = 1;
        }
      }, { passive: true });
      document.documentElement.addEventListener('mouseleave', () => { this.repelTarget = 0; });
    }
    // girar la nube arrastrando (el scroll vertical sigue andando)
    const interactive = 'button, a, input, textarea, label, .nav, .card, .club-row, .commit';
    window.addEventListener('pointerdown', (e) => {
      if (e.target instanceof Element && e.target.closest(interactive)) return;
      this.spin.dragging = true;
      this.spin.lastX = e.clientX;
      this.spin.v = 0;
    });
    window.addEventListener('pointermove', (e) => {
      if (!this.spin.dragging) return;
      const dx = e.clientX - this.spin.lastX;
      this.spin.lastX = e.clientX;
      this.spin.offset += dx * 0.007;
      this.spin.v = dx * 0.007;
    });
    const end = () => (this.spin.dragging = false);
    window.addEventListener('pointerup', end);
    window.addEventListener('pointercancel', end);
  }

  resize() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    this.vw = w;
    this.vh = h;
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    this.camera.position.z = w < 768 ? 8.6 : 7.4;
    this.camera.updateProjectionMatrix();
  }
}
