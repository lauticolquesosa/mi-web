/* ============================================================
   LCS Portfolio — interaction layer
   Lean vanilla (+ optional Lenis). No heavy deps → 60fps.
   ============================================================ */
(function () {
  'use strict';
  // Always land on the hero on (re)load — never restore the previous scroll.
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $  = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];

  /* ---------- Preloader ---------- */
  function killPreloader(pl) {
    pl.classList.add('done');
    pl.style.opacity = '0';
    pl.style.pointerEvents = 'none';
    setTimeout(() => { if (pl && pl.parentNode) pl.remove(); }, 800);
  }
  function preloader() {
    const pl = $('#preloader');
    if (!pl) return startHero();
    const seen = sessionStorage.getItem('lcs_seen');
    const bar = $('.pl-bar', pl);
    if (seen) {
      killPreloader(pl);
      startHero();
      return;
    }
    if (bar) requestAnimationFrame(() => { bar.style.transition = 'width 1.5s cubic-bezier(.16,1,.3,1)'; bar.style.width = '100%'; });
    const wait = reduced ? 400 : 1500;
    setTimeout(() => {
      killPreloader(pl);
      sessionStorage.setItem('lcs_seen', '1');
      startHero();
    }, wait);
  }

  /* ---------- Hero title typewriter ---------- */
  let heroStarted = false;
  function startHero() {
    if (heroStarted) return;
    heroStarted = true;
    window.__heroStarted = true;
    const hero = $('.hero');
    if (!hero) return;
    $$('[data-hero-fade]', hero).forEach((el, i) => {
      el.style.transitionDelay = (0.18 + i * 0.12) + 's';
      el.classList.remove('pre');
    });
    const title = $('.hero__title[data-tw]', hero);
    if (title && !reduced) typeTitle(title, window.__lcsLang || 'es');
  }

  // [text, isAccent] segments per line, per language
  const HERO_LINES = {
    es: [
      [['Diseño web que', false]],
      [['se ', false], ['siente.', true]],
      [['UX que funciona.', false]]
    ],
    en: [
      [['Web design', false]],
      [["that's ", false], ['felt.', true]],
      [['UX that works.', false]]
    ]
  };
  let twTimer = null;

  function typeTitle(title, lang) {
    const live = $('.tw-live', title);
    if (!live) return;
    if (twTimer) { clearTimeout(twTimer); twTimer = null; }
    live.innerHTML = '';
    title.classList.remove('tw-done');
    title.classList.add('tw-active');
    const LINES = HERO_LINES[lang] || HERO_LINES.es;
    const steps = [];
    LINES.forEach((line, li) => {
      line.forEach(([text, accent]) => { for (const ch of text) steps.push({ ch, accent }); });
      if (li < LINES.length - 1) steps.push({ br: true });
    });
    const caret = document.createElement('span');
    caret.className = 'caret';
    live.appendChild(caret);
    let i = 0, holder = null;
    function put(ch, accent) {
      const tag = accent ? 'em' : 'span';
      if (!holder || holder.tagName.toLowerCase() !== tag) {
        holder = document.createElement(tag);
        live.insertBefore(holder, caret);
      }
      holder.textContent += ch;
    }
    function tick() {
      if (i >= steps.length) { twTimer = setTimeout(() => title.classList.add('tw-done'), 900); return; }
      const s = steps[i++];
      let delay;
      if (s.br) { live.insertBefore(document.createElement('br'), caret); holder = null; delay = 210; }
      else { put(s.ch, s.accent); delay = s.ch === ' ' ? 32 : 34 + Math.random() * 26; }
      twTimer = setTimeout(tick, delay);
    }
    twTimer = setTimeout(tick, 260);
  }

  // Instant (no animation) title swap — used when toggling language after the
  // initial type-on has already played.
  function renderTitleInstant(title, lang) {
    const live = $('.tw-live', title);
    if (!live) return;
    if (twTimer) { clearTimeout(twTimer); twTimer = null; }
    const LINES = HERO_LINES[lang] || HERO_LINES.es;
    let html = '';
    LINES.forEach((line, li) => {
      line.forEach(([text, accent]) => {
        const safe = String(text).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        html += accent ? '<em>' + safe + '</em>' : safe;
      });
      if (li < LINES.length - 1) html += '<br>';
    });
    live.innerHTML = html;
    title.classList.add('tw-active', 'tw-done');
  }

  /* ---------- Smooth scroll (Lenis if present) ---------- */
  let lenis = null;
  function smoothScroll() {
    if (lenis || reduced || typeof window.Lenis === 'undefined') return;
    try {
      lenis = new window.Lenis({ duration: 1.15, easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)), smoothWheel: true });
      function raf(t) { if (lenis) lenis.raf(t); requestAnimationFrame(raf); }
      requestAnimationFrame(raf);
    } catch (e) { lenis = null; }
  }
  // Called by Lenis' async onload (script may resolve after boot)
  window.__initSmoothScroll = smoothScroll;
  function scrollTo(target) {
    const el = typeof target === 'string' ? $(target) : target;
    if (!el) return;
    if (lenis) lenis.scrollTo(el, { offset: -88 });
    else el.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' });
  }

  /* ---------- Anchor links ---------- */
  function anchors() {
    $$('a[href^="#"]').forEach(a => {
      a.addEventListener('click', e => {
        const id = a.getAttribute('href');
        if (id.length < 2) return;
        const el = $(id);
        if (!el) return;
        e.preventDefault();
        if (document.body.classList.contains('menu-open')) {
          document.body.classList.remove('menu-open');
          document.body.style.overflow = '';
          if (lenis) lenis.start();
        }
        scrollTo(el);
      });
    });
  }

  /* ---------- Reveal on scroll ---------- */
  function reveals() {
    const els = $$('.reveal');
    if (reduced || !('IntersectionObserver' in window)) return; // base state is visible
    els.forEach(e => e.classList.add('pre')); // hide, then reveal in view
    const io = new IntersectionObserver((entries) => {
      entries.forEach(en => { if (en.isIntersecting) { en.target.classList.remove('pre'); io.unobserve(en.target); } });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    els.forEach(e => io.observe(e));
    // safety net — never leave anything hidden
    setTimeout(() => els.forEach(e => e.classList.remove('pre')), 7000);
  }

  /* ---------- Smart navbar (hide/show + theme-aware) ---------- */
  function navbar() {
    const nav = $('.nav');
    if (!nav) return;
    const themed = $$('[data-navtheme]');
    let last = 0;
    const updateTheme = () => {
      const probe = 30; // just below the top edge where the bar sits
      let theme = 'dark';
      for (const s of themed) {
        const r = s.getBoundingClientRect();
        if (r.top <= probe && r.bottom > probe) { theme = s.getAttribute('data-navtheme'); break; }
      }
      nav.classList.toggle('nav--light', theme === 'light');
    };
    const onScroll = () => {
      const y = window.scrollY;
      nav.classList.toggle('scrolled', y > 40);
      if (y > last && y > 300 && !document.body.classList.contains('menu-open')) nav.classList.add('hidden');
      else nav.classList.remove('hidden');
      last = y;
      updateTheme();
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ---------- Mobile menu ---------- */
  function mobileMenu() {
    const burger = $('.nav__burger');
    if (!burger) return;
    burger.addEventListener('click', () => {
      const open = document.body.classList.toggle('menu-open');
      document.body.style.overflow = open ? 'hidden' : '';
      if (lenis) { open ? lenis.stop() : lenis.start(); }
    });
  }

  /* ---------- Custom cursor + button rings ---------- */
  function cursor() {
    if (window.matchMedia('(pointer: coarse)').matches) return;
    const dot = $('.cursor-dot'), ring = $('.cursor-ring');
    if (!dot || !ring) return;
    let mx = innerWidth / 2, my = innerHeight / 2, rx = mx, ry = my;
    let onButton = false;
    
    window.addEventListener('mousemove', e => {
      mx = e.clientX; my = e.clientY;
      dot.style.transform = `translate(${mx}px, ${my}px) translate(-50%,-50%)`;
    });
    
    function loop() {
      rx += (mx - rx) * 0.18; ry += (my - ry) * 0.18;
      ring.style.transform = `translate(${rx}px, ${ry}px) translate(-50%,-50%)`;
      requestAnimationFrame(loop);
    }
    loop();
    
    const hov = 'a, button, .proj-card, .svc-item, input, .nav__burger, [data-hover]';
    document.addEventListener('mouseover', e => {
      const t = e.target.closest(hov);
      if (t) {
        ring.classList.add('is-hover');
        if (t.tagName === 'BUTTON' || t.classList.contains('btn')) {
          ring.style.borderColor = '#fff';
          ring.style.boxShadow = '0 0 20px rgba(255,255,255,0.5)';
          ring.classList.add('is-button');
          onButton = true;
        } else {
          ring.style.borderColor = '';
          ring.style.boxShadow = '';
          ring.classList.remove('is-button');
          onButton = false;
        }
      }
    });
    
    document.addEventListener('mouseout', e => {
      const t = e.target.closest(hov);
      if (t) {
        ring.classList.remove('is-hover');
        ring.style.borderColor = '';
        ring.style.boxShadow = '';
        ring.classList.remove('is-button');
        onButton = false;
      }
    });
    
    document.addEventListener('mousedown', () => ring.classList.add('is-down'));
    document.addEventListener('mouseup', () => ring.classList.remove('is-down'));
  }

  /* ---------- Interactive 3D tilt on project cards + parallax jaguar ---------- */
  function magnetic() {
    if (reduced || window.matchMedia('(pointer: coarse)').matches) return;
    $$('.pcard').forEach(card => {
      const shot = card.querySelector('.pcard__shot');
      card.addEventListener('mousemove', e => {
        const r = card.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width;   // 0..1
        const py = (e.clientY - r.top) / r.height;    // 0..1
        const rx = (0.5 - py) * 6;                    // tilt up/down
        const ry = (px - 0.5) * 8;                    // tilt left/right
        card.style.transform = `perspective(950px) rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg) translateY(-6px)`;
        if (shot) { shot.style.setProperty('--mx', (px * 100).toFixed(1) + '%'); shot.style.setProperty('--my', (py * 100).toFixed(1) + '%'); }
      });
      card.addEventListener('mouseleave', () => { card.style.transform = ''; });
    });
  }

  function parallax() {
    if (reduced || window.matchMedia('(max-width: 640px)').matches) return;
    const jag = $('.hero__jaguar img');
    const hero = $('.hero');
    if (!jag || !hero) return;
    let mx = 0, my = 0, sx = 0, sy = 0;
    hero.addEventListener('mousemove', e => {
      const r = hero.getBoundingClientRect();
      mx = ((e.clientX - r.left) / r.width - 0.5) * 18;
      my = ((e.clientY - r.top) / r.height - 0.5) * 18;
    });
    let scrollY = 0;
    window.addEventListener('scroll', () => { scrollY = window.scrollY; }, { passive: true });
    function loop() {
      sx += (mx - sx) * 0.06; sy += (my - sy) * 0.06;
      jag.style.transform = `translateY(calc(-50% + ${sy - scrollY * 0.12}px)) translateX(${sx}px)`;
      requestAnimationFrame(loop);
    }
    loop();
  }

  /* ---------- Easter egg: 5 clicks on logo → eyes glow ---------- */
  function easterEgg() {
    const logo = $('.nav__logo');
    const glow = $('.eye-glow');
    if (!logo || !glow) return;
    let n = 0, t = null;
    logo.addEventListener('click', e => {
      if (logo.getAttribute('href') === '#inicio') e.preventDefault();
      n++;
      clearTimeout(t); t = setTimeout(() => { n = 0; }, 1200);
      if (n >= 5) {
        n = 0;
        glow.classList.add('lit');
        setTimeout(() => glow.classList.remove('lit'), 2000);
      }
    });
  }

  /* ---------- Case-study modal ---------- */
  // shared (year/tools) + per-language case-study content
  const PROJECTS = {
    p1: {
      year: '2025', tools: ['Figma', 'HTML / CSS', 'JavaScript'],
      es: {
        cat: 'Diseño Web + UX/UI', title: 'La Vaca — Restaurante', role: 'Diseñador Web · UX/UI', client: 'La Vaca · Salta',
        problem: 'La Vaca, una propuesta gastronómica de Salta, no tenía una web que estuviera a la altura de su carta ni de su experiencia en salón. El cliente potencial llegaba desde redes y no encontraba menú, ubicación ni una forma directa de reservar.',
        goal: 'Construir una presencia web con identidad propia que transmita la calidad del lugar y convierta la visita en una reserva por WhatsApp, sin fricción.',
        steps: [['01','Descubrir','Research del público local y de turismo gastronómico'],['02','Definir','Foco en menú, ambiente y reserva por WhatsApp'],['03','Diseñar','Wireframes mobile-first → alta fidelidad en Figma'],['04','Entregar','Desarrollo responsive, optimización de carga y CTA']],
        result: 'Sitio en vivo, responsive y con estética cálida y regional. Menú claro, galería del salón y CTA de reserva por WhatsApp presente en todo el scroll.',
        learn: 'En gastronomía, la foto y la cercanía al botón de reserva mandan: cuanto más corto el camino a WhatsApp, mayor la conversión.'
      },
      en: {
        cat: 'Web Design + UX/UI', title: 'La Vaca — Restaurant', role: 'Web Designer · UX/UI', client: 'La Vaca · Salta',
        problem: 'La Vaca, a Salta dining spot, had no website that matched its menu or its in-room experience. Potential guests arrived from social media and found no menu, location, or a direct way to book.',
        goal: 'Build a web presence with its own identity that conveys the quality of the place and turns the visit into a WhatsApp booking, friction-free.',
        steps: [['01','Discover','Research on the local audience and food tourism'],['02','Define','Focus on menu, atmosphere and WhatsApp booking'],['03','Design','Mobile-first wireframes → high fidelity in Figma'],['04','Deliver','Responsive build, load optimization and CTA']],
        result: 'Live, responsive site with a warm, regional aesthetic. Clear menu, room gallery and a WhatsApp booking CTA present throughout the scroll.',
        learn: 'In hospitality, photos and proximity to the booking button rule: the shorter the path to WhatsApp, the higher the conversion.'
      }
    },
    p2: {
      year: '2025', tools: ['Figma', 'HTML / CSS', 'JavaScript'],
      es: {
        cat: 'Diseño Web', title: 'Frigorífico Brunetti', role: 'Diseñador Web · UX/UI', client: 'Frigorífico Brunetti · Salta',
        problem: 'Frigorífico Brunetti, empresa de la industria alimentaria de Salta, necesitaba una web institucional que comunicara seriedad, trazabilidad y escala a clientes mayoristas, distinguiéndose de la competencia regional.',
        goal: 'Posicionar a la empresa como referente confiable del rubro y generar contacto comercial directo con compradores y distribuidores.',
        steps: [['01','Descubrir','Análisis del rubro y de la audiencia B2B'],['02','Definir','Mensaje central: calidad, trazabilidad y capacidad'],['03','Diseñar','Identidad sobria y estructura institucional en Figma'],['04','Entregar','Desarrollo responsive y vías de contacto comercial']],
        result: 'Sitio institucional en vivo, sobrio y profesional, con secciones de productos, procesos y contacto comercial directo, optimizado para mobile y desktop.',
        learn: 'En B2B alimentario, la confianza se diseña: la consistencia visual y la claridad de la información pesan más que cualquier efecto.'
      },
      en: {
        cat: 'Web Design', title: 'Frigorífico Brunetti', role: 'Web Designer · UX/UI', client: 'Frigorífico Brunetti · Salta',
        problem: 'Frigorífico Brunetti, a Salta food-industry company, needed a corporate site that conveyed credibility, traceability and scale to wholesale clients, standing apart from regional competitors.',
        goal: 'Position the company as a trusted reference in its sector and open direct commercial contact with buyers and distributors.',
        steps: [['01','Discover','Sector analysis and B2B audience'],['02','Define','Core message: quality, traceability and capacity'],['03','Design','Sober identity and corporate structure in Figma'],['04','Deliver','Responsive build and commercial contact channels']],
        result: 'Live corporate site, sober and professional, with product, process and direct commercial-contact sections, optimized for mobile and desktop.',
        learn: 'In B2B food, trust is designed: visual consistency and clear information matter more than any effect.'
      }
    },
    p3: {
      year: '2026', tools: ['Figma', 'Adobe XD'],
      es: {
        cat: 'UX/UI Design', title: 'Proyecto UX — en proceso', role: 'UX/UI Designer', client: 'Por confirmar',
        problem: 'Espacio reservado para el case study de UX/UI en curso. Aquí irá el desafío real: contexto, usuarios y la métrica que define el éxito.',
        goal: 'Documentar investigación, arquitectura de información y prototipo de alta fidelidad con foco en una tarea clave del usuario.',
        steps: [['01','Descubrir','Entrevistas y análisis de competencia'],['02','Definir','Personas y mapa de empatía'],['03','Diseñar','Flujos y prototipo de alta fidelidad'],['04','Entregar','Testing con usuarios y handoff']],
        result: 'En proceso — los flujos, pantallas y el prototipo interactivo se sumarán al cerrar el proyecto.',
        learn: 'Se completará con los aprendizajes reales del testing.'
      },
      en: {
        cat: 'UX/UI Design', title: 'UX Project — in progress', role: 'UX/UI Designer', client: 'To be confirmed',
        problem: 'Space reserved for the ongoing UX/UI case study. The real challenge will go here: context, users and the metric that defines success.',
        goal: 'Document research, information architecture and a high-fidelity prototype focused on a key user task.',
        steps: [['01','Discover','Interviews and competitive analysis'],['02','Define','Personas and empathy map'],['03','Design','Flows and high-fidelity prototype'],['04','Deliver','User testing and handoff']],
        result: 'In progress — flows, screens and the interactive prototype will be added once the project wraps.',
        learn: 'To be completed with the real learnings from testing.'
      }
    }
  };

  // modal UI labels per language
  const MODAL_L = {
    es: { role: 'Rol', year: 'Año', client: 'Cliente', tools: 'Herramientas', problem: 'Problema / Desafío', goal: 'Objetivo', process: 'Proceso', result: 'Resultado', learn: 'Aprendizajes clave', stack: 'Stack', mock: 'mockup / prototipo' },
    en: { role: 'Role', year: 'Year', client: 'Client', tools: 'Tools', problem: 'Problem / Challenge', goal: 'Goal', process: 'Process', result: 'Result', learn: 'Key takeaways', stack: 'Stack', mock: 'mockup / prototype' }
  };

  function modal() {
    const m = $('#modal');
    if (!m) return;
    const panel = $('.modal__body', m);
    let currentKey = null;
    function render(key) {
      const base = PROJECTS[key]; if (!base) return;
      const lang = (window.__lcsLang === 'en') ? 'en' : 'es';
      const p = base[lang] || base.es;
      const L = MODAL_L[lang] || MODAL_L.es;
      panel.innerHTML = `
        <div class="modal__cat">${p.cat}</div>
        <h3 class="modal__title">${p.title}</h3>
        <div class="modal__hero">
          <div class="pcard__ph"><span>${L.mock}</span></div>
        </div>
        <div class="modal__meta">
          <div class="cell"><div class="k">${L.role}</div><div class="v">${p.role}</div></div>
          <div class="cell"><div class="k">${L.year}</div><div class="v">${base.year}</div></div>
          <div class="cell"><div class="k">${L.client}</div><div class="v">${p.client}</div></div>
          <div class="cell"><div class="k">${L.tools}</div><div class="v">${base.tools.join(' · ')}</div></div>
        </div>
        <div class="modal__block"><h4>${L.problem}</h4><p>${p.problem}</p></div>
        <div class="modal__block"><h4>${L.goal}</h4><p>${p.goal}</p></div>
        <div class="modal__block"><h4>${L.process}</h4>
          <div class="modal__steps">${p.steps.map(s => `<div class="st"><b>${s[0]} ${s[1]}</b><span>${s[2]}</span></div>`).join('')}</div>
        </div>
        <div class="modal__block"><h4>${L.result}</h4><p>${p.result}</p></div>
        <div class="modal__block"><h4>${L.learn}</h4><p>${p.learn}</p></div>
        <div class="modal__block"><h4>${L.stack}</h4><div class="modal__tools">${base.tools.map(t => `<span class="t">${t}</span>`).join('')}</div></div>
      `;
    }
    function open(key) {
      if (!PROJECTS[key]) return;
      currentKey = key;
      render(key);
      m.classList.add('open');
      m.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
      if (lenis) lenis.stop();
    }
    function close() {
      m.classList.remove('open');
      m.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
      currentKey = null;
      if (lenis) lenis.start();
    }
    // let the language toggle re-render an open modal
    window.__modalRerender = () => { if (currentKey && m.classList.contains('open')) render(currentKey); };
    $$('[data-project]').forEach(c => c.addEventListener('click', () => open(c.getAttribute('data-project'))));
    $('.modal__scrim', m).addEventListener('click', close);
    $('.modal__close', m).addEventListener('click', close);
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && m.classList.contains('open')) close(); });
  }

  /* ---------- Scroll FX: progress bar + mobile hero parallax ---------- */
  function scrollFx() {
    const bar = $('#scrollbar');
    const mobile = window.matchMedia('(max-width: 640px)').matches;
    const jag = (mobile && !reduced) ? $('.hero__jaguar') : null;
    let y = window.scrollY || 0, ticking = false;
    function update() {
      const max = (document.documentElement.scrollHeight - window.innerHeight) || 1;
      if (bar) bar.style.transform = 'scaleX(' + Math.max(0, Math.min(1, y / max)) + ')';
      if (jag) {
        const p = Math.min(1, y / (window.innerHeight || 1));   // progress over the first screen
        jag.style.transform = 'translate3d(0,' + (y * 0.14).toFixed(1) + 'px,0) scale(' + (1 + p * 0.05).toFixed(3) + ')';
        jag.style.opacity = (0.6 * (1 - p * 0.8)).toFixed(3);
      }
      ticking = false;
    }
    window.addEventListener('scroll', () => {
      y = window.scrollY || 0;
      if (!ticking) { ticking = true; requestAnimationFrame(update); }
    }, { passive: true });
    window.addEventListener('resize', update, { passive: true });
    update();
  }

  /* ---------- Motion layer: magnetic buttons + scroll-into-view life ---------- */
  function motion() {
    document.documentElement.classList.add('js-motion');
    const fine = window.matchMedia('(pointer: fine)').matches;

    // Magnetic buttons (desktop only) — pull a few px toward the cursor
    if (!reduced && fine) {
      $$('.btn').forEach(btn => {
        btn.addEventListener('mousemove', e => {
          const r = btn.getBoundingClientRect();
          const mx = e.clientX - r.left - r.width / 2;
          const my = e.clientY - r.top - r.height / 2;
          btn.style.transform = `translate(${(mx * 0.16).toFixed(1)}px, ${(my * 0.28 - 3).toFixed(1)}px)`;
        });
        btn.addEventListener('mouseleave', () => { btn.style.transform = ''; });
      });
    }

    // "seen" once-in-view → shine on cards, draw-in on process/services.
    // Drives the mobile motion (no hover there) and the staggered tag pop.
    const targets = $$('.pcard, .proc-step, .svc-item');
    if (!('IntersectionObserver' in window)) { targets.forEach(el => el.classList.add('seen')); return; }
    const io = new IntersectionObserver((entries) => {
      entries.forEach(en => { if (en.isIntersecting) { en.target.classList.add('seen'); io.unobserve(en.target); } });
    }, { threshold: 0.32 });
    targets.forEach(el => io.observe(el));
    // safety net — never leave tags hidden if something stalls
    setTimeout(() => targets.forEach(el => el.classList.add('seen')), 6500);
  }

  /* ---------- Bilingual ES | EN ---------- */
  function i18n() {
    const KEY = 'lcs-lang';
    const META = {
      es: {
        title: 'LCS — Diseño Web & UX/UI · Lautaro Colque Sosa',
        desc: 'Lautaro Colque Sosa — Diseñador UX/UI & Web en Salta, Argentina. Diseño web que se siente, UX que funciona.',
        aria: 'Diseño web que se siente. UX que funciona.'
      },
      en: {
        title: 'LCS — Web Design & UX/UI · Lautaro Colque Sosa',
        desc: 'Lautaro Colque Sosa — UX/UI & Web Designer in Salta, Argentina. Web design that feels, UX that works.',
        aria: "Web design that's felt. UX that works."
      }
    };
    let lang = localStorage.getItem(KEY);
    if (lang !== 'es' && lang !== 'en') lang = 'es';

    function heroLangSwap(l) {
      const t = $('.hero__title[data-tw]');
      if (!t || reduced) return;          // reduced motion → the translated ghost is what shows
      if (!window.__heroStarted) return;  // not typed yet → the initial type-on will use this lang
      renderTitleInstant(t, l);
    }

    function applyAll(next) {
      lang = (next === 'en') ? 'en' : 'es';
      window.__lcsLang = lang;
      try { localStorage.setItem(KEY, lang); } catch (e) {}
      document.documentElement.lang = lang;
      // swap every translatable node — innerHTML keeps the <em>/<br>/<span> encoded in the attr
      $$('[data-es]').forEach(el => {
        const v = lang === 'en' ? el.getAttribute('data-en') : el.getAttribute('data-es');
        if (v != null && el.innerHTML !== v) el.innerHTML = v;
      });
      // active state on both toggles (desktop nav + mobile menu)
      $$('.lang-btn').forEach(b => b.classList.toggle('active', b.dataset.lang === lang));
      // document-level meta
      const m = META[lang];
      document.title = m.title;
      const md = document.querySelector('meta[name="description"]');
      if (md) md.setAttribute('content', m.desc);
      const h1 = $('.hero__title');
      if (h1) h1.setAttribute('aria-label', m.aria);
      // animated hero title + any open case-study modal
      heroLangSwap(lang);
      if (window.__modalRerender) window.__modalRerender();
    }

    window.setLang = applyAll;
    $$('.lang-btn').forEach(b => b.addEventListener('click', () => applyAll(b.dataset.lang)));
    applyAll(lang);
  }

  /* ---------- Force top (hero) on every load, regardless of section ---------- */
  function toTop() {
    if (location.hash) history.replaceState(null, '', location.pathname + location.search);
    window.scrollTo(0, 0);
    if (lenis) lenis.scrollTo(0, { immediate: true });
  }

  /* ---------- Boot ---------- */
  document.addEventListener('DOMContentLoaded', () => {
    smoothScroll(); anchors(); reveals(); navbar(); mobileMenu();
    cursor(); magnetic(); parallax(); easterEgg(); modal(); scrollFx();
    i18n(); motion();
    toTop();
    preloader();
    setTimeout(startHero, 2600); // hard fallback — never leave the hero hidden
    window.__lcsBoot = true;
  });
  // Run again after full load (images/Lenis settle) so nothing nudges us down.
  window.addEventListener('load', toTop);
})();
