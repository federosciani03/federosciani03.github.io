// ============================================================
//  Idiomas. El español es el texto del HTML (se lee al arrancar);
//  acá está el inglés y los textos que solo usa el JavaScript.
// ============================================================

const EN = {
  'skip': 'Skip to how I work',
  'nav.home': 'Federico Rosciani — home',
  'nav.aria': 'Sections',
  'nav.process': 'Process',
  'nav.path': 'Career',
  'nav.stack': 'Stack',
  'nav.work': 'Work',
  'nav.contact': 'Contact',
  'nav.cv': 'CV',
  'nav.top': 'Back to top',
  'cv.href': 'assets/cv/CV-FedericoRosciani_EN.pdf',

  'intro.kicker': 'From idea to production',
  'intro.build': 'I build',
  'intro.langs': 'Language',
  'intro.ticker': 'AI agents ✦ LLMs ✦ RAG ✦ Azure OpenAI ✦ Python ✦ FastAPI ✦ Databricks ✦ SQL ✦ Entra ID ✦ Kubernetes ✦ ',
  'intro.rot': 'AI agents|data pipelines|LLM-powered apps|bots that serve customers|ideas that reach production',
  'cue.text': 'Scroll to begin',
  'cue.aria': 'Scroll to start the journey',
  'mp.sub': 'My job is making sure it doesn’t stay there.',

  'rw1': 'DATA',
  'hero.where': 'Buenos Aires',
  'hero.t1': 'From idea',
  'hero.t2': 'to production',
  'hero.lede': 'I’m Federico Rosciani, AI Engineer. I turn business ideas into applications powered by data and artificial intelligence, and I take them all the way to production.',
  'hero.note': 'Data · AI · Applications',
  'hero.cta1': 'See how I work',
  'hero.cta2': 'Download CV',

  'pour.word': 'Data starts flowing.',
  'inside.eyebrow': 'My formula',
  'r1.t': 'Data',
  'r1.d': 'The foundation: pipelines, SQL and Databricks so information is actually useful.',
  'r2.t': 'Artificial intelligence',
  'r2.d': 'Agents, LLMs and RAG on Azure OpenAI.',
  'r3.t': 'Applications',
  'r3.d': 'What people use: FastAPI, Azure and pods in production.',
  'b1': '35+ projects in parallel',
  'b2': 'From discovery to production',

  'hs.title': 'How I work: from idea to production',
  'hs.s1': 'Idea',
  'hs.s2': 'Data',
  'hs.s4': 'Production',
  'hs.w2': 'DATA',
  'p1.eyebrow': '01 — The idea',
  'p1.title': 'It all starts with a real problem.',
  'p1.body': 'I sit down with the business team to understand what they need before writing a single line of code. More than 35 projects started that way, with a conversation.',
  'p1.f1': 'projects in parallel',
  'p1.f2n': '1st',
  'p1.f2': 'step: listen',
  'p1.log': 'new-idea',
  'p2.eyebrow': '02 — The data',
  'p2.title': 'Data gives the idea structure.',
  'p2.body': 'I come from data engineering: pipelines in Databricks, Python and SQL Server, financial data modeling and the KPIs the business uses to decide. Without clean data, no AI is worth much.',
  'p2.f1': 'advanced',
  'p2.f2': 'pipelines in Databricks',
  'p2.log': 'data WHERE useful = true;',
  'p3.eyebrow': '03 — The application',
  'p3.title': 'The idea takes shape.',
  'p3.body': 'AI agents, LLMs and RAG on Azure OpenAI, with Python and FastAPI backends. Like the bank’s WhatsApp bot, where I build new features.',
  'p3.f1': 'agents and RAG',
  'p3.f2': 'Python and FastAPI',
  'p4.eyebrow': '04 — Production',
  'p4.title': 'And it reaches people.',
  'p4.body': 'I promote every release through each environment and leave it running in pods on Azure, with identity and access in Entra ID. Only then is it done.',
  'p4.f1': 'end to end',
  'p4.f2': 'pods and Entra ID',
  'p4.log': '0 restarts',

  'git.eyebrow': 'Career',
  'git.title': 'My commit history.',
  'git.branch': 'career',
  'git.head': 'HEAD → now',
  'c1.date': 'May 2026 — now',
  'c1.b1': 'I build AI applications end to end: local development, environment promotion and deployment to production pods on Azure.',
  'c1.b2': 'I create agents and LLM-based solutions that automate processes and reduce operating costs.',
  'c1.b3': 'I manage 35+ projects in parallel, from discovery with the business to production rollout.',
  'c1.b4': 'I help business stakeholders build their own AI applications.',
  'c1.b5': 'I build new features for the bank’s WhatsApp bot and manage identity and access in Entra ID.',
  'c2.role': 'Data Engineer',
  'c2.b1': 'Built, optimized and maintained data pipelines in Databricks, Python and SQL Server.',
  'c2.b2': 'Modeled financial and operational data and delivered metrics, KPIs and management indicators.',
  'c2.b3': 'Automated analytical processes to improve efficiency and data quality.',
  'c3.role': 'Web design & development',
  'c3.b1': 'Professional websites with HTML, CSS and JavaScript, focused on responsive design and user experience.',
  'c3.b2': 'Clients:',
  'c4.date': '2022 — in progress',
  'c4.title': 'B.Sc. in Information Technology Management',
  'c4.b1': '85% completed · GPA 7.73/10.',
  'c5.title': 'High school diploma in Economics and Administration',
  'c5.b1': 'Where my interest in numbers and business began. Languages: native Spanish, upper-intermediate English (B2).',

  'stack.eyebrow': 'Stack',
  'stack.title': 'What I use every day.',
  'stack.c1.n': '11 tools',
  'stack.c1.t': 'Artificial intelligence',
  'stack.c2.n': '9 tools',
  'stack.c2.t': 'Cloud & platform',
  'stack.c3.n': '11 tools',
  'stack.c3.t': 'Development',
  'stack.c4.n': '9 tools',
  'stack.c4.t': 'Data',
  'stack.c5.n': '7 tools',
  'stack.c5.t': 'Business & management',
  'sk.agents': 'AI agents',
  'sk.vector': 'Vector databases',
  'sk.eval': 'Model evaluation',
  'sk.envs': 'Environment management',
  'sk.arch': 'Application architecture',
  'sk.sql': 'Advanced SQL',
  'sk.model': 'Data modeling',
  'sk.excel': 'Advanced Excel',
  'sk.pm': 'Project management',
  'sk.req': 'Requirements gathering',
  'sk.docs': 'Technical documentation',

  'work.eyebrow': 'Freelance work',
  'work.title': 'Websites I designed and coded.',
  'work.cdp.alt': 'Home page of the Club del Picante website',
  'work.cdp.kind': 'Food brand · Online store',
  'work.cdp.text': 'The website of a Hot Honey brand: a 3D bottle that follows the scroll, a store with cart, accounts and Mercado Pago payments. This page grew out of that experience.',
  'work.visit': 'Visit site',
  'work.ab.kind': 'Psychology practice',
  'work.ab.text': 'Professional website for a child and adolescent clinical psychologist, offering in-person and online sessions.',

  'club.eyebrow': 'Results',
  'club.title': 'What’s already in production.',
  'club.l1': 'Today, at the bank',
  'cl1.t': 'Projects in parallel',
  'cl1.d': 'From discovery with the business to production rollout',
  'cl2.t': 'The bank’s WhatsApp bot',
  'cl2.d': 'New features for real customers',
  'cl3.t': 'Identity & access in Entra ID',
  'cl3.d': 'App Registrations, permissions and secure credentials',
  'cl4.t': 'Business stakeholders',
  'cl4.d': 'I help them build their own AI apps',
  'club.l2': 'And also',
  'cm1.t': 'Pipelines and KPIs in Databricks',
  'cm1.d': 'Financial and operational data for decision-making',
  'cm2.t': 'Websites shipped for clients',
  'cm3.t': 'Native Spanish · Upper-intermediate English',
  'cm3.d': 'Languages',

  'contact.eyebrow': 'Contact',
  'contact.title': 'Got an idea that needs to reach production?',
  'contact.body': 'If you’re building a team or have a project where data and AI need to work for real, write to me. I answer by email, LinkedIn or WhatsApp.',
  'contact.copy': 'Copy',
  'footer.made': 'Designed and coded in Buenos Aires, fueled by mate.',
  'footer.aria': 'Links',
  'footer.keys': 'Shortcuts: <kbd>L</kbd> language · <kbd>E</kbd> copy email',
  'footer.updated': 'updated',
  'sign.place': 'Buenos Aires',
  'hud.coords': '34°36′S · 58°22′W',
  'pin.coords': '34.6°S · 58.4°W',
  'pin.here': 'I’m here',
  'hs.nav': 'Process steps',

  // solo JavaScript
  'meta.title': 'Federico Rosciani · From idea to production',
  'lang.switch': 'Cambiar a español',
  'lang.done': 'English',
  'loader': 'Compiling ideas',
  'copied': 'Email copied',
  'copied.short': 'Copied ✓',
  'greet.morning': 'Good morning',
  'greet.afternoon': 'Good afternoon',
  'greet.night': 'Good evening',
  'cur.open': 'Open ↗',
  'cur.download': 'Download ↓',
  'cur.copy': 'Copy',
  'cur.mail': 'Write',
  'cur.drag': '↔ Spin',
  'cur.scroll': 'Scroll ↓',
  'cur.go': 'Go',
  'cur.visit': 'Visit ↗',
  'cur.sign': 'Sign',
  'hud.start': 'Start',
  'hud.formula': 'Formula',
  'hud.process': 'Process',
  'hud.path': 'Career',
  'hud.stack': 'Stack',
  'hud.work': 'Work',
  'hud.results': 'Results',
  'hud.contact': 'Contact',
  'tab.away': '↩ Come back · the idea is still here',
  'console.hi': 'Reading the code? I like that. Let’s talk:',
  'nudge.keep': 'Keep scrolling',
  'nudge.hero': 'Keep scrolling: the idea grows',
  'nudge.pour': 'Keep going: here comes how I work',
  'nudge.side': 'Keep scrolling: this part moves sideways',
  'nudge.more': 'Keep scrolling for more',
};

// textos que no están en el HTML (español)
const ES_JS = {
  'meta.title': 'Federico Rosciani · De la idea a producción',
  'lang.switch': 'Switch to English',
  'lang.done': 'Español',
  'intro.rot': 'agentes de IA|pipelines de datos|aplicaciones con LLMs|bots que atienden clientes|ideas que llegan a producción',
  'loader': 'Compilando ideas',
  'copied': 'Mail copiado',
  'copied.short': '¡Copiado! ✓',
  'greet.morning': 'Buen día',
  'greet.afternoon': 'Buenas tardes',
  'greet.night': 'Buenas noches',
  'cur.open': 'Abrir ↗',
  'cur.download': 'Descargar ↓',
  'cur.copy': 'Copiar',
  'cur.mail': 'Escribir',
  'cur.drag': '↔ Girá',
  'cur.scroll': 'Bajá ↓',
  'cur.go': 'Ir',
  'cur.visit': 'Visitar ↗',
  'cur.sign': 'Firmar',
  'hud.start': 'Inicio',
  'hud.formula': 'Fórmula',
  'hud.process': 'Proceso',
  'hud.path': 'Trayectoria',
  'hud.stack': 'Stack',
  'hud.work': 'Proyectos',
  'hud.results': 'Resultados',
  'hud.contact': 'Contacto',
  'tab.away': '↩ Volvé · la idea sigue acá',
  'console.hi': '¿Mirando el código? Me gusta. Escribime y lo charlamos:',
  'nudge.keep': 'Seguí deslizando',
  'nudge.hero': 'Seguí: la idea crece',
  'nudge.pour': 'Seguí: ahora viene cómo trabajo',
  'nudge.side': 'Seguí bajando: esta parte va de costado',
  'nudge.more': 'Seguí bajando para ver más',
};

const ES = { ...ES_JS };
let lang = document.documentElement.lang === 'en' ? 'en' : 'es';
const listeners = [];

export const getLang = () => lang;
export const t = (key) => (lang === 'en' ? EN[key] : ES[key]) ?? ES[key] ?? EN[key] ?? '';
export const onLangChange = (fn) => listeners.push(fn);

// Lee del HTML el texto original en español (una sola vez)
function captureSpanish() {
  document.querySelectorAll('[data-i18n]').forEach((el) => { ES[el.dataset.i18n] ??= el.textContent; });
  document.querySelectorAll('[data-i18n-html]').forEach((el) => { ES[el.dataset.i18nHtml] ??= el.innerHTML; });
  document.querySelectorAll('[data-i18n-href]').forEach((el) => { ES[el.dataset.i18nHref] ??= el.getAttribute('href'); });
  document.querySelectorAll('[data-i18n-attr]').forEach((el) => {
    el.dataset.i18nAttr.split(';').forEach((pair) => {
      const [attr, key] = pair.split(':');
      ES[key] ??= el.getAttribute(attr) ?? '';
    });
  });
}

export function applyLang(next) {
  lang = next === 'en' ? 'en' : 'es';
  document.documentElement.lang = lang;
  document.querySelectorAll('[data-i18n]').forEach((el) => { const v = t(el.dataset.i18n); if (v) el.textContent = v; });
  document.querySelectorAll('[data-i18n-html]').forEach((el) => { const v = t(el.dataset.i18nHtml); if (v) el.innerHTML = v; });
  document.querySelectorAll('[data-i18n-href]').forEach((el) => { const v = t(el.dataset.i18nHref); if (v) el.setAttribute('href', v); });
  document.querySelectorAll('[data-i18n-attr]').forEach((el) => {
    el.dataset.i18nAttr.split(';').forEach((pair) => {
      const [attr, key] = pair.split(':');
      const v = t(key);
      if (v) el.setAttribute(attr, v);
    });
  });
  document.querySelectorAll('[data-lang-toggle]').forEach((b) => {
    b.textContent = lang === 'es' ? 'EN' : 'ES';
    b.setAttribute('aria-label', t('lang.switch'));
  });
  document.title = t('meta.title');
  try { localStorage.setItem('fr-lang', lang); } catch { /* modo privado */ }
  listeners.forEach((fn) => fn(lang));
}

export function initI18n() {
  // el HTML viene en español: se captura antes de cualquier cambio
  const wanted = lang;
  lang = 'es';
  captureSpanish();
  applyLang(wanted);
  document.querySelectorAll('[data-lang-toggle]').forEach((b) => {
    b.addEventListener('click', () => applyLang(lang === 'es' ? 'en' : 'es'));
  });
}
