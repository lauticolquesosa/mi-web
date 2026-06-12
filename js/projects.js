/* ============================================================
   LCS — projects.js
   Case-study data + full-screen modal.
   Loaded only on the Proyectos page; site.js calls
   window.__lcsProjects(ctx) during boot.
   ============================================================ */
(function () {
  'use strict';

  const PROJECTS = {
    p1: {
      year: '2025', img: 'hero-lavaca', tools: ['Figma', 'HTML / CSS', 'JavaScript'],
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
      year: '2025', img: 'hero-brunetti', tools: ['Figma', 'HTML / CSS', 'JavaScript'],
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
      year: '2026', img: 'hero-donasalta', tools: ['Figma', 'Adobe XD'],
      es: { cat: 'UX/UI Design', title: 'Doña Salta — en proceso', role: 'UX/UI Designer', client: 'Por confirmar',
        problem: 'Espacio reservado para el case study de UX/UI en curso. Aquí irá el desafío real: contexto, usuarios y la métrica que define el éxito.',
        goal: 'Documentar investigación, arquitectura de información y prototipo de alta fidelidad con foco en una tarea clave del usuario.',
        steps: [['01','Descubrir','Entrevistas y análisis de competencia'],['02','Definir','Personas y mapa de empatía'],['03','Diseñar','Flujos y prototipo de alta fidelidad'],['04','Entregar','Testing con usuarios y handoff']],
        result: 'En proceso — los flujos, pantallas y el prototipo interactivo se sumarán al cerrar el proyecto.',
        learn: 'Se completará con los aprendizajes reales del testing.' },
      en: { cat: 'UX/UI Design', title: 'Doña Salta — in progress', role: 'UX/UI Designer', client: 'To be confirmed',
        problem: 'Space reserved for the ongoing UX/UI case study. The real challenge will go here: context, users and the metric that defines success.',
        goal: 'Document research, information architecture and a high-fidelity prototype focused on a key user task.',
        steps: [['01','Discover','Interviews and competitive analysis'],['02','Define','Personas and empathy map'],['03','Design','Flows and high-fidelity prototype'],['04','Deliver','User testing and handoff']],
        result: 'In progress — flows, screens and the interactive prototype will be added once the project wraps.',
        learn: 'To be completed with the real learnings from testing.' }
    },
    p4: {
      year: '2026', img: 'hero-zur', tools: ['Figma', 'Adobe XD'],
      es: { cat: 'UX/UI Design', title: 'Espacio Zur — en proceso', role: 'UX/UI Designer', client: 'Por confirmar',
        problem: 'Espacio reservado para el case study de UX/UI en curso. Aquí irá el desafío real: contexto, usuarios y la métrica que define el éxito.',
        goal: 'Documentar investigación, arquitectura de información y prototipo de alta fidelidad con foco en una tarea clave del usuario.',
        steps: [['01','Descubrir','Entrevistas y análisis de competencia'],['02','Definir','Personas y mapa de empatía'],['03','Diseñar','Flujos y prototipo de alta fidelidad'],['04','Entregar','Testing con usuarios y handoff']],
        result: 'En proceso — los flujos, pantallas y el prototipo interactivo se sumarán al cerrar el proyecto.',
        learn: 'Se completará con los aprendizajes reales del testing.' },
      en: { cat: 'UX/UI Design', title: 'Espacio Zur — in progress', role: 'UX/UI Designer', client: 'To be confirmed',
        problem: 'Space reserved for the ongoing UX/UI case study. The real challenge will go here: context, users and the metric that defines success.',
        goal: 'Document research, information architecture and a high-fidelity prototype focused on a key user task.',
        steps: [['01','Discover','Interviews and competitive analysis'],['02','Define','Personas and empathy map'],['03','Design','Flows and high-fidelity prototype'],['04','Deliver','User testing and handoff']],
        result: 'In progress — flows, screens and the interactive prototype will be added once the project wraps.',
        learn: 'To be completed with the real learnings from testing.' }
    },
    p5: {
      year: '2026', img: 'hero-jockey', tools: ['Figma', 'Adobe XD'],
      es: { cat: 'UX/UI Design', title: 'Jockey Club Salta — en proceso', role: 'UX/UI Designer', client: 'Por confirmar',
        problem: 'Espacio reservado para el case study de UX/UI en curso. Aquí irá el desafío real: contexto, usuarios y la métrica que define el éxito.',
        goal: 'Documentar investigación, arquitectura de información y prototipo de alta fidelidad con foco en una tarea clave del usuario.',
        steps: [['01','Descubrir','Entrevistas y análisis de competencia'],['02','Definir','Personas y mapa de empatía'],['03','Diseñar','Flujos y prototipo de alta fidelidad'],['04','Entregar','Testing con usuarios y handoff']],
        result: 'En proceso — los flujos, pantallas y el prototipo interactivo se sumarán al cerrar el proyecto.',
        learn: 'Se completará con los aprendizajes reales del testing.' },
      en: { cat: 'UX/UI Design', title: 'Jockey Club Salta — in progress', role: 'UX/UI Designer', client: 'To be confirmed',
        problem: 'Space reserved for the ongoing UX/UI case study. The real challenge will go here: context, users and the metric that defines success.',
        goal: 'Document research, information architecture and a high-fidelity prototype focused on a key user task.',
        steps: [['01','Discover','Interviews and competitive analysis'],['02','Define','Personas and empathy map'],['03','Design','Flows and high-fidelity prototype'],['04','Deliver','User testing and handoff']],
        result: 'In progress — flows, screens and the interactive prototype will be added once the project wraps.',
        learn: 'To be completed with the real learnings from testing.' }
    },
    p6: {
      year: '2026', img: 'hero-ipv', tools: ['Figma', 'Adobe XD'],
      es: { cat: 'UX/UI Design', title: 'IPV — en proceso', role: 'UX/UI Designer', client: 'Por confirmar',
        problem: 'Espacio reservado para el case study de UX/UI en curso. Aquí irá el desafío real: contexto, usuarios y la métrica que define el éxito.',
        goal: 'Documentar investigación, arquitectura de información y prototipo de alta fidelidad con foco en una tarea clave del usuario.',
        steps: [['01','Descubrir','Entrevistas y análisis de competencia'],['02','Definir','Personas y mapa de empatía'],['03','Diseñar','Flujos y prototipo de alta fidelidad'],['04','Entregar','Testing con usuarios y handoff']],
        result: 'En proceso — los flujos, pantallas y el prototipo interactivo se sumarán al cerrar el proyecto.',
        learn: 'Se completará con los aprendizajes reales del testing.' },
      en: { cat: 'UX/UI Design', title: 'IPV — in progress', role: 'UX/UI Designer', client: 'To be confirmed',
        problem: 'Space reserved for the ongoing UX/UI case study. The real challenge will go here: context, users and the metric that defines success.',
        goal: 'Document research, information architecture and a high-fidelity prototype focused on a key user task.',
        steps: [['01','Discover','Interviews and competitive analysis'],['02','Define','Personas and empathy map'],['03','Design','Flows and high-fidelity prototype'],['04','Deliver','User testing and handoff']],
        result: 'In progress — flows, screens and the interactive prototype will be added once the project wraps.',
        learn: 'To be completed with the real learnings from testing.' }
    }
  };

  const L = {
    es: { role: 'Rol', year: 'Año', client: 'Cliente', tools: 'Herramientas', problem: 'Problema / Desafío', goal: 'Objetivo', process: 'Proceso', result: 'Resultado', learn: 'Aprendizajes clave', stack: 'Stack' },
    en: { role: 'Role', year: 'Year', client: 'Client', tools: 'Tools', problem: 'Problem / Challenge', goal: 'Goal', process: 'Process', result: 'Result', learn: 'Key takeaways', stack: 'Stack' }
  };

  function buildModalShell() {
    if (document.getElementById('modal')) return;
    document.body.insertAdjacentHTML('beforeend', `
      <div class="modal" id="modal" aria-hidden="true" role="dialog" aria-modal="true" aria-label="Case study">
        <div class="modal__scrim"></div>
        <div class="modal__panel" data-lenis-prevent>
          <button class="modal__close" aria-label="Cerrar">
            <span data-es="Cerrar" data-en="Close">Cerrar</span>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M18 6 6 18M6 6l12 12"/></svg>
          </button>
          <div class="modal__body"></div>
        </div>
      </div>`);
  }

  window.__lcsProjects = function init(ctx) {
    const { $, $$, getLenis } = ctx;
    if (!$('[data-project]')) return; // only on Proyectos page

    buildModalShell();
    const m = $('#modal');
    const panel = $('.modal__body', m);
    let key = null;

    function render(k) {
      const base = PROJECTS[k]; if (!base) return;
      const lang = window.__lcsLang === 'en' ? 'en' : 'es';
      const p = base[lang] || base.es, T = L[lang] || L.es;
      panel.innerHTML = `
        <div class="cs-hero"><img src="assets/${base.img}.jpg" alt="${p.title}" onerror="this.style.display='none'"></div>
        <div class="cs-inner">
          <div class="cs-cat">${p.cat}</div>
          <h2 class="cs-title">${p.title}</h2>
          <div class="cs-meta">
            <div class="cs-meta__cell"><div class="k">${T.role}</div><div class="v">${p.role}</div></div>
            <div class="cs-meta__cell"><div class="k">${T.year}</div><div class="v">${base.year}</div></div>
            <div class="cs-meta__cell"><div class="k">${T.client}</div><div class="v">${p.client}</div></div>
            <div class="cs-meta__cell"><div class="k">${T.tools}</div><div class="v">${base.tools.join(' · ')}</div></div>
          </div>
          <div class="cs-body">
            <div>
              <div class="cs-block"><h4>${T.problem}</h4><p>${p.problem}</p></div>
              <div class="cs-block"><h4>${T.goal}</h4><p>${p.goal}</p></div>
            </div>
            <div>
              <div class="cs-block"><h4>${T.result}</h4><p>${p.result}</p></div>
              <div class="cs-block"><h4>${T.learn}</h4><p>${p.learn}</p></div>
            </div>
          </div>
          <div class="cs-block"><h4>${T.process}</h4>
            <div class="cs-steps">${p.steps.map(s => `<div class="cs-step"><b>${s[0]} ${s[1]}</b><span>${s[2]}</span></div>`).join('')}</div>
          </div>
          <div class="cs-block"><h4>${T.stack}</h4>
            <div class="cs-stack">${base.tools.map(t => `<span class="cs-tag">${t}</span>`).join('')}</div>
          </div>
        </div>`;
    }

    function open(k) {
      if (!PROJECTS[k]) return;
      key = k; render(k);
      m.classList.add('open'); m.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
      const lenis = getLenis(); if (lenis) lenis.stop();
    }
    function close() {
      m.classList.remove('open'); m.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = ''; key = null;
      const lenis = getLenis(); if (lenis) lenis.start();
    }

    window.__modalRerender = () => { if (key && m.classList.contains('open')) render(key); };
    $$('[data-project]').forEach(c => c.addEventListener('click', () => open(c.getAttribute('data-project'))));
    $('.modal__scrim', m).addEventListener('click', close);
    $('.modal__close', m).addEventListener('click', close);
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && m.classList.contains('open')) close(); });
  };
})();
