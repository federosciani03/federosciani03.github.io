/* Federico Rosciani — portfolio
   1. Language (ES in the HTML, EN in data-en attributes)
   2. Always-alive layer: hero network, cursor glow, tickers, floating photos, looping videos
   3. Scroll story with GSAP + ScrollTrigger + Lenis, only when html.motion is set.
      Every scroll scene lives inside one gsap.matchMedia() so it can be torn down and
      rebuilt on resize or language change. */
(function () {
  "use strict";

  var root = document.documentElement;
  var STORAGE_KEY = "fr-lang";
  var lang = "es";

  /* ------------------------------------------------------------------ */
  /* 1. Language                                                          */
  /* ------------------------------------------------------------------ */
  var metaDesc = document.querySelector('meta[name="description"]');
  var descriptions = { es: metaDesc.getAttribute("content"), en: metaDesc.getAttribute("data-en") };

  document.querySelectorAll("[data-en]").forEach(function (el) {
    if (el.tagName !== "META") el.dataset.es = el.textContent.trim();
  });

  // Statement words light up one by one: wrap each word, keep a readable copy for screen readers.
  function splitWords(el) {
    var text = el.textContent.trim();
    el.textContent = "";
    var sr = document.createElement("span");
    sr.className = "sr-only";
    sr.textContent = text;
    el.appendChild(sr);
    text.split(/\s+/).forEach(function (w, i) {
      if (i > 0) el.appendChild(document.createTextNode(" "));
      var s = document.createElement("span");
      s.className = /^(producci|production|Azure)/i.test(w) ? "w em" : "w";
      s.setAttribute("aria-hidden", "true");
      s.textContent = w;
      el.appendChild(s);
    });
  }

  function applyLang(l) {
    lang = l;
    document.querySelectorAll("[data-en]").forEach(function (el) {
      if (el.tagName === "META") return;
      el.textContent = l === "en" ? el.dataset.en : el.dataset.es;
    });
    document.querySelectorAll("[data-split]").forEach(splitWords);
    [["data-en-href", "href", "esHref", "enHref"], ["data-en-aria", "aria-label", "esAria", "enAria"], ["data-en-alt", "alt", "esAlt", "enAlt"]].forEach(function (a) {
      document.querySelectorAll("[" + a[0] + "]").forEach(function (el) {
        if (el.dataset[a[2]] === undefined) el.dataset[a[2]] = el.getAttribute(a[1]);
        el.setAttribute(a[1], l === "en" ? el.dataset[a[3]] : el.dataset[a[2]]);
      });
    });
    document.querySelectorAll(".lang button").forEach(function (b) {
      b.setAttribute("aria-pressed", String(b.dataset.lang === l));
    });
    var toggle = document.querySelector(".reel-toggle");
    if (toggle) toggle.textContent = reelLabel();
    root.setAttribute("lang", l);
    metaDesc.setAttribute("content", descriptions[l]);
    try { localStorage.setItem(STORAGE_KEY, l); } catch (e) { /* private mode */ }
  }

  var reelVideo = document.querySelector(".reel-video");
  function reelLabel() {
    var paused = reelVideo && reelVideo.paused;
    return lang === "en" ? (paused ? "Play" : "Pause") : (paused ? "Reproducir" : "Pausa");
  }

  var params = new URLSearchParams(window.location.search);
  var stored = null;
  try { stored = localStorage.getItem(STORAGE_KEY); } catch (e) { /* private mode */ }
  var initial = params.get("lang") || stored ||
    ((navigator.language || "es").toLowerCase().indexOf("es") === 0 ? "es" : "en");
  if (initial !== "es" && initial !== "en") initial = "es";
  applyLang(initial);

  var year = document.getElementById("year");
  if (year) year.textContent = String(new Date().getFullYear());

  var header = document.querySelector(".site-header");

  // Showreel play/pause button (works with or without motion).
  var reelToggle = document.querySelector(".reel-toggle");
  if (reelToggle && reelVideo) {
    reelToggle.addEventListener("click", function () {
      if (reelVideo.paused) { reelVideo.play(); reelVideo.dataset.userPaused = ""; }
      else { reelVideo.pause(); reelVideo.dataset.userPaused = "1"; }
    });
    ["play", "pause"].forEach(function (ev) {
      reelVideo.addEventListener(ev, function () {
        reelToggle.textContent = reelLabel();
        reelToggle.setAttribute("aria-pressed", String(reelVideo.paused));
      });
    });
  }

  // Hope Wines promo: muted by default, the button turns the sound on.
  var hopeVideo = document.querySelector(".hope-video");
  var soundBtn = document.querySelector(".sound-toggle");
  if (hopeVideo && soundBtn) {
    soundBtn.addEventListener("click", function () {
      hopeVideo.muted = !hopeVideo.muted;
      if (!hopeVideo.muted) { hopeVideo.currentTime = hopeVideo.currentTime || 0; var p = hopeVideo.play(); if (p && p.catch) p.catch(function () {}); }
      soundBtn.setAttribute("aria-pressed", String(!hopeVideo.muted));
      var on = !hopeVideo.muted;
      soundBtn.dataset.es = on ? "Silenciar" : "Activar sonido";
      soundBtn.dataset.en = on ? "Mute" : "Sound on";
      soundBtn.textContent = lang === "en" ? soundBtn.dataset.en : soundBtn.dataset.es;
    });
  }

  /* ------------------------------------------------------------------ */
  /* No motion: plain document                                            */
  /* ------------------------------------------------------------------ */
  var canAnimate = root.classList.contains("motion") && window.gsap && window.ScrollTrigger && window.Lenis;
  if (!canAnimate) {
    root.classList.remove("motion");
    window.__frReady = true;
    document.querySelectorAll("video").forEach(function (v) { v.controls = true; v.removeAttribute("loop"); });
    if (reelToggle) reelToggle.hidden = true;
    document.querySelectorAll(".lang button").forEach(function (b) {
      b.addEventListener("click", function () { applyLang(b.dataset.lang); });
    });
    window.addEventListener("scroll", function () { header.classList.toggle("is-solid", window.scrollY > 10); }, { passive: true });
    return;
  }

  /* ------------------------------------------------------------------ */
  /* 2. Always-alive layer                                                */
  /* ------------------------------------------------------------------ */
  var gsap = window.gsap;
  var ScrollTrigger = window.ScrollTrigger;
  gsap.registerPlugin(ScrollTrigger);
  ScrollTrigger.config({ ignoreMobileResize: true });
  window.__frReady = true;
  var fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  // Tickers: duplicate the content once so the CSS loop is seamless.
  document.querySelectorAll(".tiles-row, .mq-track").forEach(function (row) {
    Array.prototype.slice.call(row.children).forEach(function (child) {
      var clone = child.cloneNode(true);
      clone.setAttribute("aria-hidden", "true");
      clone.querySelectorAll("[data-en]").forEach(function (n) { n.dataset.clone = "1"; });
      row.appendChild(clone);
    });
  });
  // Clones carry data-en/data-es, so applyLang keeps them in sync automatically.

  // Videos only play while visible (saves battery and bandwidth).
  var vio = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      var v = en.target;
      if (en.isIntersecting) {
        if (v.preload === "none") v.preload = "auto";
        if (!v.dataset.userPaused) { var p = v.play(); if (p && p.catch) p.catch(function () { /* autoplay blocked */ }); }
      } else { v.pause(); }
    });
  }, { threshold: 0.25 });
  document.querySelectorAll("video.autoplay, .reel-video").forEach(function (v) { vio.observe(v); });

  // Cursor glow follows the mouse.
  var glow = document.querySelector(".cursor-glow");
  if (glow && fine) {
    var gx = gsap.quickTo(glow, "x", { duration: 0.6, ease: "power3" });
    var gy = gsap.quickTo(glow, "y", { duration: 0.6, ease: "power3" });
    window.addEventListener("pointermove", function (e) { gx(e.clientX); gy(e.clientY); }, { passive: true });
  }

  // Hero network: drifting nodes that link up and lean toward the cursor. Runs only while visible.
  (function heroNet() {
    var canvas = document.querySelector(".hero-net");
    if (!canvas) return;
    var ctx = canvas.getContext("2d");
    var w = 0, h = 0, dpr = 1, pts = [], mouse = { x: -9999, y: -9999 }, running = false;
    function size() {
      var r = canvas.getBoundingClientRect();
      dpr = Math.min(2, window.devicePixelRatio || 1);
      w = r.width; h = r.height;
      canvas.width = w * dpr; canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      var n = Math.round(Math.min(90, Math.max(32, (w * h) / 16000)));
      pts = [];
      for (var i = 0; i < n; i++) pts.push({ x: Math.random() * w, y: Math.random() * h, vx: (Math.random() - 0.5) * 0.35, vy: (Math.random() - 0.5) * 0.35, r: Math.random() * 1.8 + 1.2, hot: Math.random() < 0.12 });
    }
    function frame() {
      if (!running) return;
      ctx.clearRect(0, 0, w, h);
      var link = Math.min(170, w / 7);
      for (var i = 0; i < pts.length; i++) {
        var p = pts[i];
        var dxm = mouse.x - p.x, dym = mouse.y - p.y, dm = Math.hypot(dxm, dym);
        if (dm < 220) { p.vx += dxm / dm * 0.012; p.vy += dym / dm * 0.012; }
        p.vx *= 0.995; p.vy *= 0.995;
        p.x += p.vx; p.y += p.vy;
        if (p.x < -20) p.x = w + 20; if (p.x > w + 20) p.x = -20;
        if (p.y < -20) p.y = h + 20; if (p.y > h + 20) p.y = -20;
        for (var j = i + 1; j < pts.length; j++) {
          var q = pts[j], d = Math.hypot(p.x - q.x, p.y - q.y);
          if (d < link) {
            ctx.strokeStyle = "rgba(14,124,111," + (0.22 * (1 - d / link)).toFixed(3) + ")";
            ctx.lineWidth = 1;
            ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y); ctx.stroke();
          }
        }
        if (dm < 200) {
          ctx.strokeStyle = "rgba(34,184,165," + (0.35 * (1 - dm / 200)).toFixed(3) + ")";
          ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(mouse.x, mouse.y); ctx.stroke();
        }
        ctx.fillStyle = p.hot ? "rgba(14,124,111,.9)" : "rgba(14,124,111,.45)";
        ctx.beginPath(); ctx.arc(p.x, p.y, p.hot ? p.r + 1.2 : p.r, 0, Math.PI * 2); ctx.fill();
      }
    }
    size();
    window.addEventListener("resize", size);
    canvas.parentElement.addEventListener("pointermove", function (e) {
      var r = canvas.getBoundingClientRect(); mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top;
    });
    canvas.parentElement.addEventListener("pointerleave", function () { mouse.x = mouse.y = -9999; });
    new IntersectionObserver(function (en) {
      running = en[0].isIntersecting;
      if (running) gsap.ticker.add(frame); else gsap.ticker.remove(frame);
    }).observe(canvas);
  })();

  // Diagrams: a data packet travels along every drawn line, forever, once the diagram is live.
  var SVGNS = "http://www.w3.org/2000/svg";
  document.querySelectorAll(".panel-art svg, .shot-art svg").forEach(function (svg, si) {
    svg.querySelectorAll(".d-line:not(.dashed)").forEach(function (path, i) {
      if (!path.id) path.id = "dl-" + si + "-" + i;
      var c = document.createElementNS(SVGNS, "circle");
      c.setAttribute("r", svg.closest(".shot-art") ? "3.2" : "4.2");
      c.setAttribute("class", "d-packet");
      var am = document.createElementNS(SVGNS, "animateMotion");
      am.setAttribute("dur", (2.2 + (i % 3) * 0.6) + "s");
      am.setAttribute("repeatCount", "indefinite");
      am.setAttribute("begin", (-(i * 0.7)) + "s");
      var mp = document.createElementNS(SVGNS, "mpath");
      mp.setAttribute("href", "#" + path.id);
      am.appendChild(mp); c.appendChild(am); svg.appendChild(c);
    });
  });

  /* ------------------------------------------------------------------ */
  /* 3. Scroll story                                                      */
  /* ------------------------------------------------------------------ */
  var lenis = new window.Lenis({ lerp: 0.09, smoothWheel: true, wheelMultiplier: 0.95 });
  lenis.on("scroll", ScrollTrigger.update);
  gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
  gsap.ticker.lagSmoothing(0);

  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener("click", function (e) {
      var id = a.getAttribute("href");
      var target = id === "#top" ? 0 : document.querySelector(id);
      if (target === null) return;
      e.preventDefault();
      lenis.scrollTo(target, { duration: 1.4, easing: function (x) { return 1 - Math.pow(1 - x, 4); } });
      if (id !== "#top" && target.focus) { target.setAttribute("tabindex", "-1"); target.focus({ preventScroll: true }); }
    });
  });

  var dark = { work: false, contact: false };
  function paintHeader() { header.classList.toggle("is-dark", dark.work || dark.contact); }
  lenis.on("scroll", function (e) {
    var y = e.scroll;
    header.classList.toggle("is-solid", y > 10);
    header.classList.toggle("is-hidden", e.direction === 1 && y > window.innerHeight * 0.6);
  });

  function has(list) { return list && list.length > 0; }

  // Draws a diagram: nodes pop, lines draw, bars grow; then its packets start to flow.
  function diagramIn(scope, st) {
    var svg = scope.querySelector("svg");
    if (!svg) return gsap.timeline({ paused: true });
    var tl = st ? gsap.timeline({ scrollTrigger: Object.assign({ toggleActions: "play none none reverse" }, st) })
                : gsap.timeline({ paused: true });
    tl.eventCallback("onComplete", function () { svg.classList.add("live"); });
    tl.eventCallback("onReverseComplete", function () { svg.classList.remove("live"); });
    var pops = svg.querySelectorAll(".d-pop > *");
    var lines = svg.querySelectorAll(".d-line:not(.dashed), .d-check");
    var dashed = svg.querySelectorAll(".d-line.dashed, .d-ask");
    var grows = svg.querySelectorAll(".d-grow rect");
    var fills = svg.querySelectorAll(".d-fill rect:not(.d-pill), .d-bars rect");
    var pills = svg.querySelectorAll(".d-fill .d-pill");
    var dots = svg.querySelectorAll(".d-dot, .d-spark");
    if (has(pops)) tl.from(pops, { scale: 0, opacity: 0, duration: 0.55, ease: "back.out(2.2)", stagger: { each: 0.035, from: "random" } }, 0);
    if (has(dots)) tl.from(dots, { scale: 0, transformOrigin: "50% 50%", duration: 0.6, ease: "back.out(2.5)" }, 0.1);
    if (has(lines)) tl.fromTo(lines, { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 0.9, ease: "power2.inOut", stagger: 0.09 }, 0.15);
    if (has(dashed)) tl.from(dashed, { opacity: 0, duration: 0.5 }, 0.5);
    if (has(grows)) tl.from(grows, { scaleY: 0, duration: 0.75, ease: "power3.out", stagger: 0.06 }, 0.15);
    if (has(fills)) tl.from(fills, { scaleX: 0, duration: 0.7, ease: "power3.out", stagger: 0.08 }, 0.3);
    if (has(pills)) tl.from(pills, { opacity: 0, duration: 0.4, stagger: 0.08 }, 0.25);
    return tl;
  }

  function reveal(targets, st, vars) {
    var list = typeof targets === "string" ? document.querySelectorAll(targets) : targets;
    if (!has(list)) return;
    gsap.from(list, Object.assign({
      y: 48, opacity: 0, duration: 1, ease: "power3.out", stagger: 0.08,
      scrollTrigger: Object.assign({ start: "top 85%", toggleActions: "play none none reverse" }, st)
    }, vars || {}));
  }

  var mm;

  function build() {
    mm = gsap.matchMedia();
    mm.add({
      h: "(min-width: 900px)",
      narrow: "(max-width: 720px)",
      fine: "(hover: hover) and (pointer: fine)"
    }, function (ctx) {
      var c = ctx.conditions;

      gsap.to(".progress i", { scaleX: 1, ease: "none", scrollTrigger: { start: 0, end: "max", scrub: 0.3 } });

      [["#showreel", ".reel"], ["#proyectos", ".work, .side"], ["#stack", ".stack-sec, .timeline-sec"], ["#contacto", ".contact"]].forEach(function (pair) {
        var link = document.querySelector('.nav a[href="' + pair[0] + '"]');
        if (!link) return;
        document.querySelectorAll(pair[1]).forEach(function (sec) {
          ScrollTrigger.create({ trigger: sec, start: "top 55%", end: "bottom 55%",
            onToggle: function (self) { if (self.isActive) { document.querySelectorAll(".nav a").forEach(function (a) { a.classList.remove("is-active"); }); link.classList.add("is-active"); } else { link.classList.remove("is-active"); } } });
        });
      });

      /* ---------- HERO ---------- */
      var stage = document.querySelector(".hero-stage");
      var words = stage.querySelectorAll(".statement .w");
      gsap.set(".hero-about", { visibility: "visible" });
      gsap.from(".hero-intro", { y: 60, opacity: 0, duration: 1.3, ease: "expo.out", delay: 0.1 });
      gsap.from(".chips span", { scale: 0, opacity: 0, duration: 0.9, ease: "back.out(2)", stagger: { each: 0.06, from: "random" }, delay: 0.35 });
      gsap.to(".chips span", { y: function (i) { return i % 2 ? 10 : -10; }, duration: function () { return gsap.utils.random(2.4, 3.6); }, ease: "sine.inOut", yoyo: true, repeat: -1 });

      var heroTl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: { trigger: ".hero", start: "top top", end: c.narrow ? "+=160%" : "+=220%", pin: stage, scrub: 0.7, anticipatePin: 1, invalidateOnRefresh: true }
      });
      heroTl
        .to(".hn-1", { xPercent: -55, opacity: 0, duration: 0.42 }, 0)
        .to(".hn-2", { xPercent: 55, opacity: 0, duration: 0.42 }, 0)
        .to(".hero-kicker, .hero-role", { y: -50, opacity: 0, duration: 0.25 }, 0)
        .to(".scroll-hint", { opacity: 0, duration: 0.08 }, 0)
        .to(".hero-net", { scale: 1.25, opacity: 0.35, duration: 1 }, 0);
      stage.querySelectorAll(".chips li").forEach(function (li) {
        var depth = parseFloat(li.dataset.depth) || 1;
        heroTl.to(li, {
          x: function () { return (li.offsetLeft + li.offsetWidth / 2 - stage.offsetWidth / 2) * depth * 0.9; },
          y: function () { return (li.offsetTop + li.offsetHeight / 2 - stage.offsetHeight / 2) * depth * 0.9; },
          scale: 1 + depth * 0.7, opacity: 0, duration: 0.45
        }, 0);
      });
      heroTl
        // The statement rises into the space the name leaves.
        .fromTo(".hero-copy", { y: 80, scale: 0.94, opacity: 0 }, { y: 0, scale: 1, opacity: 1, duration: 0.22 }, 0.3);
      if (has(words)) heroTl.fromTo(words, { opacity: 0.12 }, { opacity: 1, duration: 0.06, stagger: 0.38 / words.length }, 0.44);
      heroTl.from(".hero-actions", { y: 30, opacity: 0, duration: 0.1 }, 0.86);

      /* ---------- SHOWREEL: the frame grows until it fills the screen ---------- */
      var frame = document.querySelector(".reel-frame");
      if (c.narrow) {
        // Phones: the video stays readable at full width; it just grows into place.
        gsap.fromTo(frame, { scale: 0.86, borderRadius: 28 }, { scale: 1, borderRadius: 16, ease: "none",
          scrollTrigger: { trigger: ".reel", start: "top 85%", end: "center 60%", scrub: 0.6 } });
        reveal(".reel-head > *", { trigger: ".reel" });
      } else {
        gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: { trigger: ".reel", start: "top top", end: "+=130%", pin: ".reel-stage", scrub: 0.7, anticipatePin: 1, invalidateOnRefresh: true }
        })
          .fromTo(frame, { scale: 0.62, borderRadius: 40 }, {
            scale: function () { return Math.max(window.innerWidth / frame.offsetWidth, window.innerHeight / frame.offsetHeight) * 1.001; },
            borderRadius: 0, duration: 0.7
          }, 0)
          .to(".reel-head", { y: -120, opacity: 0, duration: 0.35 }, 0)
          .to({}, { duration: 0.3 });
      }

      /* ---------- CAREER ---------- */
      var items = document.querySelectorAll(".track li");
      var counter = { v: 0 };
      var countEl = document.querySelector(".count-num");
      gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: { trigger: ".career", start: "top top", end: "+=150%", pin: true, scrub: 0.7, anticipatePin: 1 }
      })
        .from(".career .eyebrow, #career-title", { y: 70, opacity: 0, stagger: 0.04, duration: 0.18 }, 0)
        .fromTo(".track-line i", c.narrow ? { scaleY: 0 } : { scaleX: 0 }, c.narrow ? { scaleY: 1, duration: 0.6 } : { scaleX: 1, duration: 0.6 }, 0.14)
        .from(items[0], { y: 36, opacity: 0, duration: 0.1 }, 0.14)
        .from(items[1], { y: 36, opacity: 0, duration: 0.1 }, 0.44)
        .from(items[2], { y: 36, opacity: 0, duration: 0.1 }, 0.7)
        .from(".career-count", { y: 60, opacity: 0, duration: 0.12 }, 0.76)
        .fromTo(counter, { v: 0 }, { v: 35, duration: 0.2, onUpdate: function () { countEl.textContent = Math.round(counter.v); } }, 0.78)
        .fromTo(".career-bg", { xPercent: 5 }, { xPercent: -35, duration: 1 }, 0);

      /* ---------- WORK: dark window opens, projects ride horizontally ---------- */
      gsap.fromTo(".work-window",
        { clipPath: "inset(7% 9% 0% 9% round 64px)" },
        { clipPath: "inset(0% 0% 0% 0% round 36px)", ease: "none",
          scrollTrigger: { trigger: ".work", start: "top bottom", end: "top 10%", scrub: 0.5 } });
      reveal(".work-head > *", { trigger: ".work-head", start: "top 80%" });
      ScrollTrigger.create({ trigger: ".work-window", start: "top 40px", end: "bottom 40px",
        onToggle: function (self) { dark.work = self.isActive; paintHeader(); } });

      var hs = document.querySelector(".hscroll");
      var hTrack = hs.querySelector(".hscroll-track");

      var posters = gsap.utils.toArray(".poster");
      // Posters rise into place as the section arrives.
      if (!c.narrow) gsap.from(posters, { y: 140, rotate: function (i) { return i % 2 ? 3 : -3; }, opacity: 0, duration: 1.1, ease: "power3.out", stagger: 0.07,
        scrollTrigger: { trigger: hs, start: "top 85%", toggleActions: "play none none reverse" } });

      if (true) {
        // Horizontal ride driven by the vertical scroll: three to four posters in view on
        // wide screens; on phones one at a time, centered, so nobody has to swipe.
        hs.classList.add("is-h");
        var bar = hs.querySelector(".hscroll-bar i");
        var count = hs.querySelector(".hscroll-count b");
        hs.querySelector(".hs-total").textContent = String(posters.length);
        var dist = function () { return Math.max(0, hTrack.scrollWidth - window.innerWidth); };
        var seen = function () { return Math.max(1, posters.filter(function (p) { return p.getBoundingClientRect().right < window.innerWidth + 40; }).length); };
        var startSeen = seen();
        var htween = gsap.to(hTrack, {
          x: function () { return -dist(); }, ease: "none",
          scrollTrigger: {
            trigger: hs, start: "top top", end: function () { return "+=" + Math.max(window.innerHeight * 0.6, dist() * 1.1); },
            pin: true, scrub: 0.8, anticipatePin: 1, invalidateOnRefresh: true,
            onUpdate: function (self) {
              gsap.set(bar, { scaleX: self.progress });
              // From the scroll position, not the DOM: with scrub the track lags behind the last update.
              count.textContent = String(Math.min(posters.length, Math.round(startSeen + self.progress * (posters.length - startSeen))));
            }
          }
        });
        count.textContent = String(seen());
        posters.forEach(function (p) {
          diagramIn(p, { trigger: p, containerAnimation: htween, start: "left 95%" });
          var s = p.querySelector(".stage");
          ScrollTrigger.create({ trigger: p, containerAnimation: htween, start: "left 90%",
            onEnter: function () { s.classList.add("armed"); }, onLeaveBack: function () { s.classList.remove("armed"); } });
          gsap.fromTo(p.querySelector(".poster-art svg, .poster-video"), { xPercent: 6 }, { xPercent: -6, ease: "none",
            scrollTrigger: { trigger: p, containerAnimation: htween, start: "left right", end: "right left", scrub: true } });
          if (c.narrow) {
            // Coverflow: the poster in the middle is big and flat, its neighbours turn away.
            gsap.timeline({ scrollTrigger: { trigger: p, containerAnimation: htween, start: "left right", end: "right left", scrub: true } })
              .fromTo(p, { scale: 0.8, rotationY: 28, opacity: 0.45 }, { scale: 1, rotationY: 0, opacity: 1, ease: "power1.out", duration: 1 })
              .to(p, { scale: 0.8, rotationY: -28, opacity: 0.45, ease: "power1.in", duration: 1 });
          }
        });
      }

      // The ticker rows move on their own (CSS); here they only fade in.
      reveal(".also-title", { trigger: ".also" });
      reveal(".tiles", { trigger: ".tiles", start: "top 90%" }, { y: 60 });
      reveal(".managed-text", { trigger: ".managed", start: "top 85%" });
      document.querySelectorAll(".pills li").forEach(function (pill, i) {
        gsap.from(pill, {
          x: (i % 2 ? 1 : -1) * gsap.utils.random(80, 220), y: gsap.utils.random(30, 90),
          rotate: gsap.utils.random(-8, 8), opacity: 0, ease: "none",
          scrollTrigger: { trigger: ".pills", start: "top 100%", end: "top 60%", scrub: 0.8 }
        });
      });

      /* ---------- SIDE: video frames rise, photos float at their own depth ---------- */
      reveal(".side .section-head > *", { trigger: ".side .section-head" });
      document.querySelectorAll(".feature").forEach(function (f) {
        var frameEl = f.querySelector(".show-frame");
        var flip = f.classList.contains("is-flip");
        gsap.fromTo(frameEl, { scale: 0.84, y: 110, rotate: flip ? 3 : -3 }, { scale: 1, y: 0, rotate: 0, ease: "none",
          scrollTrigger: { trigger: f, start: "top bottom", end: "center 55%", scrub: 0.6 } });
        f.querySelectorAll(".floaty").forEach(function (img) {
          var s = parseFloat(img.dataset.speed) || 0;
          // Entrance once, then each photo drifts at its own depth.
          gsap.from(img, { scale: 0.6, opacity: 0, duration: 1, ease: "back.out(1.6)",
            scrollTrigger: { trigger: f, start: "top 75%", toggleActions: "play none none reverse" } });
          gsap.fromTo(img, { y: -s }, { y: s, ease: "none",
            scrollTrigger: { trigger: f, start: "top bottom", end: "bottom top", scrub: 0.5 } });
        });
        gsap.from(f.querySelector(".feature-text"), { x: c.narrow ? 0 : (flip ? -90 : 90), y: c.narrow ? 40 : 0, opacity: 0, ease: "none",
          scrollTrigger: { trigger: f, start: "top 85%", end: "center 60%", scrub: 0.6 } });
      });

      if (!c.narrow && window.innerWidth > 640) {
        document.querySelectorAll(".col").forEach(function (col) {
          var s = parseFloat(col.dataset.speed) || 0;
          gsap.fromTo(col, { y: -s }, { y: s, ease: "none",
            scrollTrigger: { trigger: ".cols", start: "top bottom", end: "bottom top", scrub: true } });
        });
      }
      reveal(".more-title", { trigger: ".minis" }, { y: 30 });
      document.querySelectorAll(".mini").forEach(function (m, i) {
        gsap.from(m, { y: 120, rotate: i % 2 ? 3 : -3, opacity: 0, ease: "none",
          scrollTrigger: { trigger: m, start: "top 100%", end: "top 60%", scrub: 0.6 } });
      });
      var shots = gsap.utils.toArray(".shot");
      if (window.innerWidth <= 640) {
        // Phones: the projects come as a deck; each scroll deals the next card over the last.
        var deck = document.querySelector(".cols");
        deck.classList.add("is-deck");
        var dealt = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: { trigger: deck, start: "top top", end: function () { return "+=" + (shots.length - 1) * window.innerHeight * 0.6; }, pin: true, scrub: 0.6, anticipatePin: 1, invalidateOnRefresh: true }
        });
        shots.forEach(function (s, i) {
          if (i === 0) return;
          dealt.fromTo(s, { yPercent: 125, rotate: i % 2 ? 8 : -8 }, { yPercent: 0, rotate: i % 2 ? -2 : 2, duration: 1, ease: "power2.out" })
            .to(shots[i - 1], { scale: 0.9, yPercent: -6, opacity: 0.35, duration: 1 }, "<");
        });
        shots.forEach(function (s) { diagramIn(s, { trigger: deck, start: "top 70%" }); });
        ctx.add(function () { return function () { deck.classList.remove("is-deck"); }; });
      } else {
        shots.forEach(function (shot) {
          reveal([shot], { trigger: shot, start: "top 92%" }, { y: 70 });
          diagramIn(shot, { trigger: shot, start: "top 80%" });
        });
      }

      var pupil = document.querySelector(".d-pupil");
      if (pupil && c.fine) {
        var px = gsap.quickTo(pupil, "x", { duration: 0.35, ease: "power3" });
        var py = gsap.quickTo(pupil, "y", { duration: 0.35, ease: "power3" });
        var onMove = function (e) {
          var r = pupil.ownerSVGElement.getBoundingClientRect();
          var cx = r.left + r.width * (120 / 240), cy = r.top + r.height * (100 / 130);
          var a = Math.atan2(e.clientY - cy, e.clientX - cx);
          var d = Math.min(1, Math.hypot(e.clientX - cx, e.clientY - cy) / 300);
          px(Math.cos(a) * 7 * d); py(Math.sin(a) * 5 * d);
        };
        window.addEventListener("pointermove", onMove, { passive: true });
        ctx.add(function () { return function () { window.removeEventListener("pointermove", onMove); }; });
      }

      /* ---------- STACK: words slide on their own and lean with the scroll ---------- */
      reveal(".stack-sec .section-head > *", { trigger: ".stack-sec" });
      document.querySelectorAll(".mq-row").forEach(function (row) {
        var dir = parseFloat(row.dataset.dir) || -1;
        gsap.fromTo(row, { xPercent: dir < 0 ? 6 : -6 }, { xPercent: dir < 0 ? -6 : 6, ease: "none",
          scrollTrigger: { trigger: ".marquee", start: "top bottom", end: "bottom top", scrub: 0.5 } });
      });

      /* ---------- TIMELINE ---------- */
      reveal(".timeline-sec .section-head > *", { trigger: ".timeline-sec" });
      gsap.fromTo(".timeline", { "--tl": 0 }, { "--tl": 1, ease: "none",
        scrollTrigger: { trigger: ".timeline", start: "top 70%", end: "bottom 70%", scrub: 0.4 } });
      document.querySelectorAll(".timeline > li").forEach(function (li) {
        reveal([li], { trigger: li, start: "top 88%" }, c.narrow ? { y: 40 } : { y: 0, x: 70 });
      });

      /* ---------- CONTACT ---------- */
      gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: ".contact", start: "top top", end: "+=110%", pin: ".contact-stage", scrub: 0.7, anticipatePin: 1,
          onUpdate: function (self) { dark.contact = self.progress > 0.3; paintHeader(); },
          onLeaveBack: function () { dark.contact = false; paintHeader(); }
        }
      })
        .fromTo(".contact-circle", { clipPath: "circle(0% at 50% 100%)" }, { clipPath: "circle(150% at 50% 100%)", duration: 0.55 }, 0)
        .from(".contact .eyebrow", { y: 30, opacity: 0, duration: 0.1 }, 0.38)
        .fromTo(".contact h2", { scale: 2.2, opacity: 0, y: 40 }, { scale: 1, opacity: 1, y: 0, duration: 0.36 }, 0.34)
        .from(".contact-lede", { y: 30, opacity: 0, duration: 0.14 }, 0.68)
        .from(".contact-actions", { y: 30, opacity: 0, duration: 0.12 }, 0.78)
        .from(".site-footer", { opacity: 0, duration: 0.1 }, 0.9);

      /* ---------- Magnetic buttons ---------- */
      if (c.fine) {
        document.querySelectorAll(".magnetic").forEach(function (b) {
          var xTo = gsap.quickTo(b, "x", { duration: 0.45, ease: "power3" });
          var yTo = gsap.quickTo(b, "y", { duration: 0.45, ease: "power3" });
          var move = function (e) {
            var r = b.getBoundingClientRect();
            xTo((e.clientX - r.left - r.width / 2) * 0.25);
            yTo((e.clientY - r.top - r.height / 2) * 0.35);
          };
          var leave = function () { xTo(0); yTo(0); };
          b.addEventListener("pointermove", move);
          b.addEventListener("pointerleave", leave);
          ctx.add(function () { return function () { b.removeEventListener("pointermove", move); b.removeEventListener("pointerleave", leave); gsap.set(b, { x: 0, y: 0 }); }; });
        });
      }

      return function () {
        hs.classList.remove("is-h");
        document.querySelectorAll(".stage.armed").forEach(function (s) { s.classList.remove("armed"); });
        document.querySelectorAll("svg.live").forEach(function (s) { s.classList.remove("live"); });
        dark.work = dark.contact = false; paintHeader();
      };
    });
  }

  build();

  document.querySelectorAll(".lang button").forEach(function (b) {
    b.addEventListener("click", function () {
      if (b.dataset.lang === lang) return;
      var y = window.scrollY;
      mm.revert();
      applyLang(b.dataset.lang);
      build();
      ScrollTrigger.refresh();
      lenis.scrollTo(y, { immediate: true, force: true });
    });
  });

  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { ScrollTrigger.refresh(); });
  window.addEventListener("load", function () { ScrollTrigger.refresh(); });
})();
