(function () {
  'use strict';
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $  = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];

  /* ---------- Smooth scroll (Lenis) + GSAP wiring ---------- */
  let lenis = null;
  const hasGsap = typeof window.gsap !== 'undefined' && typeof window.ScrollTrigger !== 'undefined';
  if (hasGsap) gsap.registerPlugin(ScrollTrigger);

  function smoothScroll() {
    if (reduced || typeof window.Lenis === 'undefined') return;
    lenis = new Lenis({ lerp: 0.1, smoothWheel: true });
    if (hasGsap) {
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add((t) => lenis.raf(t * 1000));
      gsap.ticker.lagSmoothing(0);
    } else {
      const raf = (t) => { lenis.raf(t); requestAnimationFrame(raf); };
      requestAnimationFrame(raf);
    }
    lenis.on('scroll', onScroll);
  }

  function scrollToEl(target) {
    const el = typeof target === 'string' ? $(target) : target;
    if (!el) return;
    if (lenis) lenis.scrollTo(el, { offset: 0 });
    else el.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' });
  }

  /* ---------- Progress bar + nav theme ---------- */
  const progress = $('#progress');
  const panels = $$('.panel');
  function onScroll() {
    const max = document.documentElement.scrollHeight - innerHeight || 1;
    if (progress) progress.style.transform = 'scaleX(' + Math.min(1, Math.max(0, scrollY / max)) + ')';
    let theme = 'dark';
    for (const p of panels) {
      const r = p.getBoundingClientRect();
      if (r.top <= 72 && r.bottom > 72) theme = p.getAttribute('data-nav') || 'dark';
    }
    document.body.classList.toggle('nav-light', theme === 'light');
  }

  /* ---------- Menu ---------- */
  function menu() {
    const burger = $('.burger');
    if (!burger) return;
    const setOpen = (open) => {
      document.body.classList.toggle('menu-open', open);
      burger.setAttribute('aria-expanded', String(open));
      document.body.style.overflow = open ? 'hidden' : '';
      if (lenis) open ? lenis.stop() : lenis.start();
    };
    burger.addEventListener('click', () => setOpen(!document.body.classList.contains('menu-open')));
    $$('a[href^="#"]').forEach(a => a.addEventListener('click', e => {
      const id = a.getAttribute('href');
      if (id.length < 2 || !$(id)) return;
      e.preventDefault();
      if (document.body.classList.contains('menu-open')) setOpen(false);
      scrollToEl(id);
    }));
    document.addEventListener('keydown', e => { if (e.key === 'Escape') setOpen(false); });
  }

  /* ---------- Scroll animations (GSAP + ScrollTrigger) ---------- */
  function animations() {
    if (!hasGsap || reduced) { document.documentElement.classList.remove('js'); return; }

    $$('[data-reveal-title]').forEach(h => {
      const lines = $$('.ln > span', h);
      gsap.set(lines, { yPercent: 110 });
      if (h.getBoundingClientRect().top < window.innerHeight) {
        gsap.to(lines, { yPercent: 0, duration: 0.9, ease: 'power3.out', stagger: 0.13, delay: 0.25 });
      } else {
        gsap.to(lines, {
          yPercent: 0, duration: 0.8, ease: 'power3.out', stagger: 0.12,
          scrollTrigger: { trigger: h, start: 'top 84%' }
        });
      }
    });

    $$('[data-reveal-text]').forEach(el => {
      gsap.to(el, {
        clipPath: 'inset(0 0 -4% 0)', duration: 1, ease: 'power2.inOut',
        scrollTrigger: { trigger: el, start: 'top 88%' }
      });
    });

    $$('[data-stagger]').forEach(c => {
      gsap.to($$(':scope > *', c), {
        autoAlpha: 1, y: 0, duration: 0.7, ease: 'power3.out', stagger: 0.12,
        scrollTrigger: { trigger: c, start: 'top 82%' }
      });
    });

    $$('[data-fade-scale]').forEach(el => {
      gsap.to(el, {
        autoAlpha: 1, scale: 1, duration: 0.9, ease: 'power2.out',
        scrollTrigger: { trigger: el, start: 'top 80%' }
      });
    });

    $$('[data-parallax]').forEach(img => {
      const panel = img.closest('.panel');
      gsap.fromTo(img, { yPercent: -8 }, {
        yPercent: 10, ease: 'none',
        scrollTrigger: { trigger: panel, start: 'top bottom', end: 'bottom top', scrub: true }
      });
    });

    window.addEventListener('load', () => ScrollTrigger.refresh());
  }

  /* ---------- Bilingual ES | EN ---------- */
  function i18n() {
    const KEY = 'lcs-lang';
    const META = {
      es: { title: 'LCS — Diseño Web & UX/UI · Lautaro Colque Sosa', desc: 'Lautaro Colque Sosa — Diseñador UX/UI & Web en Salta, Argentina. Diseño web que se siente, UX que funciona.' },
      en: { title: 'LCS — Web Design & UX/UI · Lautaro Colque Sosa', desc: 'Lautaro Colque Sosa — UX/UI & Web Designer in Salta, Argentina. Web design that feels, UX that works.' }
    };
    let lang = localStorage.getItem(KEY);
    if (lang !== 'es' && lang !== 'en') lang = 'es';
    function apply(next) {
      lang = next === 'en' ? 'en' : 'es';
      window.__lcsLang = lang;
      try { localStorage.setItem(KEY, lang); } catch (e) {}
      document.documentElement.lang = lang;
      $$('[data-es]').forEach(el => {
        const v = lang === 'en' ? el.getAttribute('data-en') : el.getAttribute('data-es');
        if (v != null && el.innerHTML !== v) el.innerHTML = v;
      });
      $$('.lang-btn').forEach(b => b.classList.toggle('active', b.dataset.lang === lang));
      document.title = META[lang].title;
      const md = $('meta[name="description"]');
      if (md) md.setAttribute('content', META[lang].desc);
      if (window.__modalRerender) window.__modalRerender();
      if (hasGsap && !reduced) ScrollTrigger.refresh();
    }
    window.setLang = apply;
    $$('.lang-btn').forEach(b => b.addEventListener('click', () => apply(b.dataset.lang)));
    apply(lang);
  }

  /* ---------- Case-study modal ---------- */
  const PROJECTS = {
    p1: {
      year: '2025', tools: ['Figma', 'HTML / CSS', 'JavaScript'],
      es: { cat: 'Diseño Web + UX/UI', title: 'La Vaca — Restaurante', role: 'Diseñador Web · UX/UI', client: 'La Vaca · Salta',
        problem: 'La Vaca, una propuesta gastronómica de Salta, no tenía una web que estuviera a la altura de su carta ni de su experiencia en salón. El cliente potencial llegaba desde redes y no encontraba menú, ubicación ni una forma directa de reservar.',
        goal: 'Construir una presencia web con identidad propia que transmita la calidad del lugar y convierta la visita en una reserva por WhatsApp, sin fricción.',
        steps: [['01','Descubrir','Research del público local y de turismo gastronómico'],['02','Definir','Foco en menú, ambiente y reserva por WhatsApp'],['03','Diseñar','Wireframes mobile-first → alta fidelidad en Figma'],['04','Entregar','Desarrollo responsive, optimización de carga y CTA']],
        result: 'Sitio en vivo, responsive y con estética cálida y regional. Menú claro, galería del salón y CTA de reserva por WhatsApp presente en todo el scroll.',
        learn: 'En gastronomía, la foto y la cercanía al botón de reserva mandan: cuanto más corto el camino a WhatsApp, mayor la conversión.' },
      en: { cat: 'Web Design + UX/UI', title: 'La Vaca — Restaurant', role: 'Web Designer · UX/UI', client: 'La Vaca · Salta',
        problem: 'La Vaca, a Salta dining spot, had no website that matched its menu or its in-room experience. Potential guests arrived from social media and found no menu, location, or a direct way to book.',
        goal: 'Build a web presence with its own identity that conveys the quality of the place and turns the visit into a WhatsApp booking, friction-free.',
        steps: [['01','Discover','Research on the local audience and food tourism'],['02','Define','Focus on menu, atmosphere and WhatsApp booking'],['03','Design','Mobile-first wireframes → high fidelity in Figma'],['04','Deliver','Responsive build, load optimization and CTA']],
        result: 'Live, responsive site with a warm, regional aesthetic. Clear menu, room gallery and a WhatsApp booking CTA present throughout the scroll.',
        learn: 'In hospitality, photos and proximity to the booking button rule: the shorter the path to WhatsApp, the higher the conversion.' }
    },
    p2: {
      year: '2025', tools: ['Figma', 'HTML / CSS', 'JavaScript'],
      es: { cat: 'Diseño Web', title: 'Frigorífico Brunetti', role: 'Diseñador Web · UX/UI', client: 'Frigorífico Brunetti · Salta',
        problem: 'Frigorífico Brunetti, empresa de la industria alimentaria de Salta, necesitaba una web institucional que comunicara seriedad, trazabilidad y escala a clientes mayoristas, distinguiéndose de la competencia regional.',
        goal: 'Posicionar a la empresa como referente confiable del rubro y generar contacto comercial directo con compradores y distribuidores.',
        steps: [['01','Descubrir','Análisis del rubro y de la audiencia B2B'],['02','Definir','Mensaje central: calidad, trazabilidad y capacidad'],['03','Diseñar','Identidad sobria y estructura institucional en Figma'],['04','Entregar','Desarrollo responsive y vías de contacto comercial']],
        result: 'Sitio institucional en vivo, sobrio y profesional, con secciones de productos, procesos y contacto comercial directo, optimizado para mobile y desktop.',
        learn: 'En B2B alimentario, la confianza se diseña: la consistencia visual y la claridad de la información pesan más que cualquier efecto.' },
      en: { cat: 'Web Design', title: 'Frigorífico Brunetti', role: 'Web Designer · UX/UI', client: 'Frigorífico Brunetti · Salta',
        problem: 'Frigorífico Brunetti, a Salta food-industry company, needed a corporate site that conveyed credibility, traceability and scale to wholesale clients, standing apart from regional competitors.',
        goal: 'Position the company as a trusted reference in its sector and open direct commercial contact with buyers and distributors.',
        steps: [['01','Discover','Sector analysis and B2B audience'],['02','Define','Core message: quality, traceability and capacity'],['03','Design','Sober identity and corporate structure in Figma'],['04','Deliver','Responsive build and commercial contact channels']],
        result: 'Live corporate site, sober and professional, with product, process and direct commercial-contact sections, optimized for mobile and desktop.',
        learn: 'In B2B food, trust is designed: visual consistency and clear information matter more than any effect.' }
    },
    p3: {
      year: '2026', tools: ['Figma', 'Adobe XD'],
      es: { cat: 'UX/UI Design', title: 'Proyecto UX — en proceso', role: 'UX/UI Designer', client: 'Por confirmar',
        problem: 'Espacio reservado para el case study de UX/UI en curso. Aquí irá el desafío real: contexto, usuarios y la métrica que define el éxito.',
        goal: 'Documentar investigación, arquitectura de información y prototipo de alta fidelidad con foco en una tarea clave del usuario.',
        steps: [['01','Descubrir','Entrevistas y análisis de competencia'],['02','Definir','Personas y mapa de empatía'],['03','Diseñar','Flujos y prototipo de alta fidelidad'],['04','Entregar','Testing con usuarios y handoff']],
        result: 'En proceso — los flujos, pantallas y el prototipo interactivo se sumarán al cerrar el proyecto.',
        learn: 'Se completará con los aprendizajes reales del testing.' },
      en: { cat: 'UX/UI Design', title: 'UX Project — in progress', role: 'UX/UI Designer', client: 'To be confirmed',
        problem: 'Space reserved for the ongoing UX/UI case study. The real challenge will go here: context, users and the metric that defines success.',
        goal: 'Document research, information architecture and a high-fidelity prototype focused on a key user task.',
        steps: [['01','Discover','Interviews and competitive analysis'],['02','Define','Personas and empathy map'],['03','Design','Flows and high-fidelity prototype'],['04','Deliver','User testing and handoff']],
        result: 'In progress — flows, screens and the interactive prototype will be added once the project wraps.',
        learn: 'To be completed with the real learnings from testing.' }
    }
  };
  const MODAL_L = {
    es: { role: 'Rol', year: 'Año', client: 'Cliente', tools: 'Herramientas', problem: 'Problema / Desafío', goal: 'Objetivo', process: 'Proceso', result: 'Resultado', learn: 'Aprendizajes clave', stack: 'Stack', mock: 'mockup / prototipo' },
    en: { role: 'Role', year: 'Year', client: 'Client', tools: 'Tools', problem: 'Problem / Challenge', goal: 'Goal', process: 'Process', result: 'Result', learn: 'Key takeaways', stack: 'Stack', mock: 'mockup / prototype' }
  };

  function modal() {
    const m = $('#modal');
    if (!m) return;
    const panel = $('.modal__body', m);
    let key = null;
    function render(k) {
      const base = PROJECTS[k]; if (!base) return;
      const lang = window.__lcsLang === 'en' ? 'en' : 'es';
      const p = base[lang] || base.es, L = MODAL_L[lang] || MODAL_L.es;
      panel.innerHTML = `
        <div class="modal__cat">${p.cat}</div>
        <h3 class="modal__title">${p.title}</h3>
        <div class="modal__hero"><span>${L.mock}</span></div>
        <div class="modal__meta">
          <div class="cell"><div class="k">${L.role}</div><div class="v">${p.role}</div></div>
          <div class="cell"><div class="k">${L.year}</div><div class="v">${base.year}</div></div>
          <div class="cell"><div class="k">${L.client}</div><div class="v">${p.client}</div></div>
          <div class="cell"><div class="k">${L.tools}</div><div class="v">${base.tools.join(' · ')}</div></div>
        </div>
        <div class="modal__block"><h4>${L.problem}</h4><p>${p.problem}</p></div>
        <div class="modal__block"><h4>${L.goal}</h4><p>${p.goal}</p></div>
        <div class="modal__block"><h4>${L.process}</h4><div class="modal__steps">${p.steps.map(s => `<div class="st"><b>${s[0]} ${s[1]}</b><span>${s[2]}</span></div>`).join('')}</div></div>
        <div class="modal__block"><h4>${L.result}</h4><p>${p.result}</p></div>
        <div class="modal__block"><h4>${L.learn}</h4><p>${p.learn}</p></div>
        <div class="modal__block"><h4>${L.stack}</h4><div class="modal__tools">${base.tools.map(t => `<span class="t">${t}</span>`).join('')}</div></div>`;
    }
    function open(k) { if (!PROJECTS[k]) return; key = k; render(k); m.classList.add('open'); m.setAttribute('aria-hidden', 'false'); document.body.style.overflow = 'hidden'; if (lenis) lenis.stop(); }
    function close() { m.classList.remove('open'); m.setAttribute('aria-hidden', 'true'); document.body.style.overflow = ''; key = null; if (lenis) lenis.start(); }
    window.__modalRerender = () => { if (key && m.classList.contains('open')) render(key); };
    $$('[data-project]').forEach(c => c.addEventListener('click', () => open(c.getAttribute('data-project'))));
    $('.modal__scrim', m).addEventListener('click', close);
    $('.modal__close', m).addEventListener('click', close);
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && m.classList.contains('open')) close(); });
  }

  /* ---------- Boot ---------- */
  document.addEventListener('DOMContentLoaded', () => {
    smoothScroll(); menu(); modal(); i18n(); animations();
    if (location.hash) history.replaceState(null, '', location.pathname);
    scrollTo(0, 0); if (lenis) lenis.scrollTo(0, { immediate: true });
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('load', () => { scrollTo(0, 0); if (lenis) lenis.scrollTo(0, { immediate: true }); });
  });
})();
