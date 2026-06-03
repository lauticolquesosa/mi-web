/* ============================================================
   LCS Portfolio — interaction layer
   Lean vanilla (+ optional Lenis). No heavy deps → 60fps.
   ============================================================ */
(function () {
  'use strict';
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
    if (title && !reduced) typeTitle(title);
  }

  function typeTitle(title) {
    const live = $('.tw-live', title);
    if (!live) return;
    title.classList.add('tw-active');
    // [text, isAccent] segments per line
    const LINES = [
      [['Diseño web que', false]],
      [['se ', false], ['siente.', true]],
      [['UX que funciona.', false]]
    ];
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
      if (i >= steps.length) { setTimeout(() => title.classList.add('tw-done'), 900); return; }
      const s = steps[i++];
      let delay;
      if (s.br) { live.insertBefore(document.createElement('br'), caret); holder = null; delay = 210; }
      else { put(s.ch, s.accent); delay = s.ch === ' ' ? 32 : 34 + Math.random() * 26; }
      setTimeout(tick, delay);
    }
    setTimeout(tick, 260);
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
    if (lenis) lenis.scrollTo(el, { offset: -10 });
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
        document.body.classList.remove('menu-open');
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
    burger.addEventListener('click', () => document.body.classList.toggle('menu-open'));
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
    if (reduced) return;
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
  const PROJECTS = {
    p1: {
      cat: 'Diseño Web + UX/UI', title: 'La Vaca — Restaurante',
      role: 'Diseñador Web · UX/UI', year: '2025', client: 'La Vaca · Salta',
      tools: ['Figma', 'HTML / CSS', 'JavaScript'],
      problem: 'La Vaca, una propuesta gastronómica de Salta, no tenía una web que estuviera a la altura de su carta ni de su experiencia en salón. El cliente potencial llegaba desde redes y no encontraba menú, ubicación ni una forma directa de reservar.',
      goal: 'Construir una presencia web con identidad propia que transmita la calidad del lugar y convierta la visita en una reserva por WhatsApp, sin fricción.',
      steps: [['01','Descubrir','Research del público local y de turismo gastronómico'],['02','Definir','Foco en menú, ambiente y reserva por WhatsApp'],['03','Diseñar','Wireframes mobile-first → alta fidelidad en Figma'],['04','Entregar','Desarrollo responsive, optimización de carga y CTA']],
      result: 'Sitio en vivo, responsive y con estética cálida y regional. Menú claro, galería del salón y CTA de reserva por WhatsApp presente en todo el scroll.',
      learn: 'En gastronomía, la foto y la cercanía al botón de reserva mandan: cuanto más corto el camino a WhatsApp, mayor la conversión.'
    },
    p2: {
      cat: 'Diseño Web', title: 'Frigorífico Brunetti',
      role: 'Diseñador Web · UX/UI', year: '2025', client: 'Frigorífico Brunetti · Salta',
      tools: ['Figma', 'HTML / CSS', 'JavaScript'],
      problem: 'Frigorífico Brunetti, empresa de la industria alimentaria de Salta, necesitaba una web institucional que comunicara seriedad, trazabilidad y escala a clientes mayoristas, distinguiéndose de la competencia regional.',
      goal: 'Posicionar a la empresa como referente confiable del rubro y generar contacto comercial directo con compradores y distribuidores.',
      steps: [['01','Descubrir','Análisis del rubro y de la audiencia B2B'],['02','Definir','Mensaje central: calidad, trazabilidad y capacidad'],['03','Diseñar','Identidad sobria y estructura institucional en Figma'],['04','Entregar','Desarrollo responsive y vías de contacto comercial']],
      result: 'Sitio institucional en vivo, sobrio y profesional, con secciones de productos, procesos y contacto comercial directo, optimizado para mobile y desktop.',
      learn: 'En B2B alimentario, la confianza se diseña: la consistencia visual y la claridad de la información pesan más que cualquier efecto.'
    },
    p3: {
      cat: 'UX/UI Design', title: 'Proyecto UX — en proceso',
      role: 'UX/UI Designer', year: '2026', client: 'Por confirmar',
      tools: ['Figma', 'Adobe XD'],
      problem: 'Espacio reservado para el case study de UX/UI en curso. Aquí irá el desafío real: contexto, usuarios y la métrica que define el éxito.',
      goal: 'Documentar investigación, arquitectura de información y prototipo de alta fidelidad con foco en una tarea clave del usuario.',
      steps: [['01','Descubrir','Entrevistas y análisis de competencia'],['02','Definir','Personas y mapa de empatía'],['03','Diseñar','Flujos y prototipo de alta fidelidad'],['04','Entregar','Testing con usuarios y handoff']],
      result: 'En proceso — los flujos, pantallas y el prototipo interactivo se sumarán al cerrar el proyecto.',
      learn: 'Se completará con los aprendizajes reales del testing.'
    }
  };

  function modal() {
    const m = $('#modal');
    if (!m) return;
    const panel = $('.modal__body', m);
    function render(p) {
      panel.innerHTML = `
        <div class="modal__cat">${p.cat}</div>
        <h3 class="modal__title">${p.title}</h3>
        <div class="modal__hero">
          <div class="pcard__ph"><span>mockup / prototipo</span></div>
        </div>
        <div class="modal__meta">
          <div class="cell"><div class="k">Rol</div><div class="v">${p.role}</div></div>
          <div class="cell"><div class="k">Año</div><div class="v">${p.year}</div></div>
          <div class="cell"><div class="k">Cliente</div><div class="v">${p.client}</div></div>
          <div class="cell"><div class="k">Herramientas</div><div class="v">${p.tools.join(' · ')}</div></div>
        </div>
        <div class="modal__block"><h4>Problema / Desafío</h4><p>${p.problem}</p></div>
        <div class="modal__block"><h4>Objetivo</h4><p>${p.goal}</p></div>
        <div class="modal__block"><h4>Proceso</h4>
          <div class="modal__steps">${p.steps.map(s => `<div class="st"><b>${s[0]} ${s[1]}</b><span>${s[2]}</span></div>`).join('')}</div>
        </div>
        <div class="modal__block"><h4>Resultado</h4><p>${p.result}</p></div>
        <div class="modal__block"><h4>Aprendizajes clave</h4><p>${p.learn}</p></div>
        <div class="modal__block"><h4>Stack</h4><div class="modal__tools">${p.tools.map(t => `<span class="t">${t}</span>`).join('')}</div></div>
      `;
    }
    function open(key) {
      const p = PROJECTS[key]; if (!p) return;
      render(p);
      m.classList.add('open');
      m.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
      if (lenis) lenis.stop();
    }
    function close() {
      m.classList.remove('open');
      m.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
      if (lenis) lenis.start();
    }
    $$('[data-project]').forEach(c => c.addEventListener('click', () => open(c.getAttribute('data-project'))));
    $('.modal__scrim', m).addEventListener('click', close);
    $('.modal__close', m).addEventListener('click', close);
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && m.classList.contains('open')) close(); });
  }

  /* ---------- Boot ---------- */
  document.addEventListener('DOMContentLoaded', () => {
    smoothScroll(); anchors(); reveals(); navbar(); mobileMenu();
    cursor(); magnetic(); parallax(); easterEgg(); modal();
    preloader();
    setTimeout(startHero, 2600); // hard fallback — never leave the hero hidden
    window.__lcsBoot = true;
  });
})();
