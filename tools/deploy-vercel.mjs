// Deploy a Vercel por API REST con el fetch nativo de Node.
// (El CLI oficial no anda en la red del banco: el proxy de inspección
// demora su pila HTTP hasta el timeout. fetch sí pasa.)
//
// Uso (desde la carpeta del proyecto):
//   node tools/deploy-vercel.mjs login    → flujo de dispositivo: confirmás una URL y guarda el token
//   node tools/deploy-vercel.mjs deploy   → sube el sitio tal cual (es estático, sin build) a producción
//
// El token se lee de VERCEL_TOKEN, o del archivo que diga VERCEL_TOKEN_FILE,
// o de .vercel-token.json (está en .gitignore: nunca se sube al repo).
import { readFileSync, writeFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';

const API = 'https://api.vercel.com';
const PROJECT = 'federicorosciani';
const TOKEN_FILE = path.resolve(process.env.VERCEL_TOKEN_FILE || '.vercel-token.json');
// lo que no es parte del sitio publicado
const SKIP = new Set(['.git', '.claude', '.playwright-mcp', 'node_modules', 'tools', '.vercel-token.json', '.gitignore', 'README.md']);
const CLIENT_ID = 'cl_HYyOPBNtFMfHhaUn9L4QPfTZz6TP47bp'; // client público del CLI de Vercel

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function token() {
  if (process.env.VERCEL_TOKEN) return process.env.VERCEL_TOKEN;
  if (!existsSync(TOKEN_FILE)) throw new Error('No hay token. Primero: node tools/deploy-vercel.mjs login');
  return JSON.parse(readFileSync(TOKEN_FILE, 'utf8')).token;
}

// Flujo OAuth de dispositivo: muestra una URL, la confirmás logueado en
// Vercel y acá llega el token. Nadie tipea contraseñas en la terminal.
async function login() {
  const res = await fetch(`${API}/login/oauth/device-authorization`, {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ client_id: CLIENT_ID, scope: 'openid offline_access' }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error('No se pudo iniciar el login: ' + JSON.stringify(data));
  console.log('\nAbrí esta URL donde estés logueado en Vercel:');
  console.log('   ' + (data.verification_uri_complete || data.verification_uri));
  console.log('   Código: ' + data.user_code + '\n');
  const t0 = Date.now();
  while (Date.now() - t0 < (data.expires_in ?? 300) * 1000) {
    await sleep((data.interval || 5) * 1000);
    const v = await fetch(`${API}/login/oauth/token`, {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: CLIENT_ID, device_code: data.device_code,
        grant_type: 'urn:ietf:params:oauth:grant-type:device_code',
      }),
    });
    const out = await v.json();
    if (v.ok && out.access_token) {
      writeFileSync(TOKEN_FILE, JSON.stringify({ token: out.access_token }, null, 2));
      console.log('Login OK. Token guardado en ' + path.basename(TOKEN_FILE) + ' (no lo compartas).');
      return;
    }
    if (out.error && out.error !== 'authorization_pending' && out.error !== 'slow_down') {
      throw new Error('Login rechazado: ' + JSON.stringify(out));
    }
  }
  throw new Error('Expiró el código sin confirmación. Corré el login de nuevo.');
}

function collect(dir, base = dir) {
  const out = [];
  for (const name of readdirSync(dir)) {
    if (dir === base && SKIP.has(name)) continue;
    const full = path.join(dir, name);
    if (statSync(full).isDirectory()) out.push(...collect(full, base));
    else out.push({ file: path.relative(base, full).split(path.sep).join('/'), data: readFileSync(full).toString('base64'), encoding: 'base64' });
  }
  return out;
}

async function deploy() {
  const auth = { authorization: `Bearer ${token()}` };
  const files = collect(path.resolve('.'));
  const mb = files.reduce((a, f) => a + f.data.length, 0) / 1024 / 1024;
  console.log(`Subiendo ${files.length} archivos (${mb.toFixed(1)} MB en base64)...`);
  const res = await fetch(`${API}/v13/deployments?skipAutoDetectionConfirmation=1`, {
    method: 'POST',
    headers: { ...auth, 'content-type': 'application/json' },
    body: JSON.stringify({
      name: PROJECT, files, target: 'production',
      projectSettings: { framework: null, buildCommand: null, outputDirectory: null, installCommand: null },
    }),
  });
  const dep = await res.json();
  if (!res.ok) throw new Error('Falló el deploy: ' + JSON.stringify(dep.error ?? dep));
  console.log('Deployment creado:', dep.id);

  const t0 = Date.now();
  let state = dep.readyState;
  while (state !== 'READY' && Date.now() - t0 < 4 * 60 * 1000) {
    await sleep(4000);
    const j = await (await fetch(`${API}/v13/deployments/${dep.id}`, { headers: auth })).json();
    state = j.readyState;
    console.log('  estado:', state);
    if (state === 'ERROR') throw new Error('El deployment terminó en ERROR: ' + JSON.stringify(j.errorMessage ?? ''));
  }
  if (state !== 'READY') throw new Error('Timeout esperando READY (el deploy puede seguir en curso).');

  const al = await fetch(`${API}/v9/projects/${PROJECT}/domains`, { headers: auth });
  const domains = al.ok ? (await al.json()).domains?.map((d) => d.name) : [];
  console.log('\nDEPLOY LISTO');
  console.log('   URL del deployment: https://' + dep.url);
  for (const d of domains || []) console.log('   Dominio del proyecto: https://' + d);
}

const [, , cmd] = process.argv;
try {
  if (cmd === 'login') await login();
  else if (cmd === 'deploy') await deploy();
  else console.log('Uso: node tools/deploy-vercel.mjs [login | deploy]');
} catch (e) {
  console.error('Error:', e.message);
  process.exit(1);
}
