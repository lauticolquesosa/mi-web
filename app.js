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

  /* ---------- Hero title word-by-word ---------- */
  let heroStarted = false;
  function startHero() {
    if (heroStarted) return;
    heroStarted = true;
    window.__heroStarted = true;
    const hero = $('.hero');
    if (!hero) return;
    $$('.word', hero).forEach((w, i) => {
      w.style.transitionDelay = (0.05 + i * 0.07) + 's';
      w.classList.remove('pre');
    });
    $$('[data-hero-fade]', hero).forEach((el, i) => {
      el.style.transitionDelay = (0.5 + i * 0.1) + 's';
      el.classList.remove('pre');
    });
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

  /* ---------- Magnetic project cards + parallax jaguar ---------- */
  function magnetic() {
    if (reduced || window.matchMedia('(pointer: coarse)').matches) return;
    $$('.proj-card').forEach(card => {
      card.addEventListener('mousemove', e => {
        const r = card.getBoundingClientRect();
        const x = (e.clientX - r.left - r.width / 2) / r.width;
        const y = (e.clientY - r.top - r.height / 2) / r.height;
        card.style.transform = `translate(${x * 10}px, ${y * 10}px)`;
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
      cat: 'Diseño Web + UX', title: 'Doña Salta — Landing Page',
      role: 'Diseñador Web · UX/UI', year: '2025', client: 'Restaurante Doña Salta',
      tools: ['Figma', 'HTML / CSS', 'JavaScript'],
      problem: 'Uno de los restaurantes más reputados de Salta no tenía presencia web funcional. El turista que buscaba dónde comer no encontraba información clara ni una forma directa de reservar — perdía la reserva frente a competidores con mejor presencia digital.',
      goal: 'Convertir al turista que busca dónde comer en una reserva real por WhatsApp, con una estética cálida que represente la cocina regional salteña.',
      steps: [['01','Descubrir','Research de turistas y hábitos de búsqueda local'],['02','Definir','Foco en conversión a reserva por WhatsApp'],['03','Diseñar','Wireframes mobile-first → alta fidelidad en Figma'],['04','Entregar','Desarrollo, optimización de carga y CTA']],
      result: 'Landing funcional y responsive, con una estética cálida de Salta regional orientada a la conversión. CTA de reserva por WhatsApp presente en cada scroll, jerarquía clara de menú y ubicación.',
      learn: 'En turismo gastronómico, la fricción mata la reserva: cuanto más corto el camino a WhatsApp, mayor la conversión. El tono visual regional generó confianza inmediata.'
    },
    p2: {
      cat: 'UX/UI Design + Diseño Web', title: 'Proyecto UX — en curso',
      role: 'UX/UI Designer', year: '2026', client: 'Por confirmar',
      tools: ['Figma', 'Adobe XD'],
      problem: 'Espacio reservado para el próximo case study de UX/UI. Aquí irá el desafío real: contexto, usuarios y la métrica que define el éxito.',
      goal: 'Documentar investigación, arquitectura de información y prototipo de alta fidelidad con foco en una tarea clave del usuario.',
      steps: [['01','Descubrir','Entrevistas y análisis de competencia'],['02','Definir','Personas y mapa de empatía'],['03','Diseñar','Flujos y prototipo de alta fidelidad'],['04','Entregar','Testing con usuarios y handoff']],
      result: 'Placeholder — el resultado visual (flujos, pantallas y prototipo interactivo) se sumará al cerrar el proyecto.',
      learn: 'Se completará con los aprendizajes reales del testing.'
    },
    p3: {
      cat: 'Diseño Web', title: 'Proyecto Web — en curso',
      role: 'Diseñador Web', year: '2026', client: 'Por confirmar',
      tools: ['Figma', 'HTML / CSS', 'JavaScript'],
      problem: 'Espacio reservado para el próximo proyecto de diseño y desarrollo web. Aquí irá el problema de negocio y la audiencia objetivo.',
      goal: 'Diseñar y desarrollar un sitio con alto criterio estético, responsive y optimizado.',
      steps: [['01','Descubrir','Objetivos de negocio y audiencia'],['02','Definir','Estructura y mensaje central'],['03','Diseñar','Diseño de alta fidelidad'],['04','Entregar','Desarrollo y performance']],
      result: 'Placeholder — mockups y prototipo se sumarán al cerrar el proyecto.',
      learn: 'Se completará con los aprendizajes del desarrollo.'
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
          <div class="proj-card__ph" style="position:relative;height:100%"><span>mockup / prototipo</span></div>
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
