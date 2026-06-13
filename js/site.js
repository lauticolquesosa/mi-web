/* ============================================================
   LCS — site.js
   Shared engine for every page:
   chrome injection · menu · cursor · progress · nav theme
   smooth scroll (Lenis) · scroll reveals (GSAP) · i18n ES|EN
   ============================================================ */
(function () {
  'use strict';

  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $  = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];

  const PAGE = document.body.dataset.page || 'home';

  /* ---------- Navigation model (single source of truth) ---------- */
  const NAV = [
    { key: 'home',      href: '/',           num: '01', es: 'Inicio',    en: 'Home' },
    { key: 'sobre',     href: 'sobre',       num: '02', es: 'Sobre mí',  en: 'About' },
    { key: 'servicios', href: 'servicios',   num: '03', es: 'Servicios', en: 'Services' },
    { key: 'proceso',   href: 'proceso',     num: '04', es: 'Proceso',   en: 'Process' },
    { key: 'proyectos', href: 'proyectos',   num: '05', es: 'Proyectos', en: 'Work' },
    { key: 'inversion', href: 'inversion',   num: '06', es: 'Inversión', en: 'Investment' },
    { key: 'contacto',  href: 'contacto',    num: '07', es: 'Contacto',  en: 'Contact' },
  ];
  const SOCIAL = {
    instagram: 'https://instagram.com/lauticolquesosa',
    whatsapp:  'https://wa.me/543874834041',
    email:     'mailto:lauticolquesosa@gmail.com',
    phone:     'tel:+543874834041',
  };

  /* ---------- Chrome injection (one source for all pages) ---------- */
  function chrome() {
    const current = (k) => (k === PAGE ? ' aria-current="page"' : '');

    const menuLinks = NAV
      .map(n => `<li><a href="${n.href}"${current(n.key)}><i>${n.num}</i><span data-es="${n.es}" data-en="${n.en}">${n.es}</span></a></li>`)
      .join('');

    const footerNav = NAV
      .map(n => `<li><a href="${n.href}"${current(n.key)} data-es="${n.es}" data-en="${n.en}">${n.es}</a></li>`)
      .join('');

    const html = `
      <div id="progress" aria-hidden="true"></div>
      <div class="cursor-dot" aria-hidden="true"></div>

      <button class="burger" aria-label="Menú" aria-expanded="false"><span></span><span></span></button>

      <div class="lang-toggle" role="group" aria-label="Idioma / Language">
        <button class="lang-btn active" type="button" data-lang="es">ES</button>
        <span class="lang-sep" aria-hidden="true">/</span>
        <button class="lang-btn" type="button" data-lang="en">EN</button>
      </div>

      <a class="corner-logo" href="/" aria-label="LCS — Inicio"><img src="assets/logo-isotipo-white.png" alt="LCS" /></a>

      <nav class="menu" aria-hidden="true">
        <ul class="menu__links">${menuLinks}</ul>
        <div class="menu__foot">
          <a href="${SOCIAL.instagram}" target="_blank" rel="noopener">Instagram</a>
          <a href="${SOCIAL.whatsapp}" target="_blank" rel="noopener">WhatsApp</a>
          <a href="${SOCIAL.email}">Email</a>
        </div>
      </nav>`;

    const mount = $('#chrome') || document.body;
    if (mount === document.body) mount.insertAdjacentHTML('afterbegin', html);
    else mount.innerHTML = html;
  }

  function footer() {
    const mount = $('#site-footer');
    if (!mount) return;
    const links = NAV
      .map(n => `<li><a href="${n.href}" data-es="${n.es}" data-en="${n.en}">${n.es}</a></li>`)
      .join('');
    mount.outerHTML = `
      <footer class="site-footer" data-nav="dark">
        <div class="shell">
          <div class="site-footer__top">
            <div class="site-footer__brand">
              <a href="/" class="site-footer__logo" aria-label="LCS — Inicio"><img src="assets/Logo%20header.png" alt="LCS — Lautaro Colque Sosa" /></a>
              <p data-es="Diseño web y UX/UI con identidad propia. Del concepto al sitio en vivo, desde Salta para todos lados."
                 data-en="Web &amp; UX/UI design with its own identity. From concept to live site, from Salta to everywhere.">Diseño web y UX/UI con identidad propia. Del concepto al sitio en vivo, desde Salta para todos lados.</p>
            </div>
            <nav class="site-footer__col" aria-label="Footer">
              <h4 data-es="Navegación" data-en="Navigation">Navegación</h4>
              <ul>${links}</ul>
            </nav>
            <div class="site-footer__col">
              <h4 data-es="Contacto" data-en="Contact">Contacto</h4>
              <ul>
                <li><a href="${SOCIAL.email}">lauticolquesosa@gmail.com</a></li>
                <li><a href="${SOCIAL.phone}">+54 387 483 4041</a></li>
                <li><a href="${SOCIAL.instagram}" target="_blank" rel="noopener">Instagram</a></li>
                <li><a href="${SOCIAL.whatsapp}" target="_blank" rel="noopener">WhatsApp</a></li>
              </ul>
            </div>
          </div>
          <div class="site-footer__bottom">
            <span data-es="© 2026 Lautaro Colque Sosa — LCS · Diseño Web &amp; UX/UI"
                  data-en="© 2026 Lautaro Colque Sosa — LCS · Web Design &amp; UX/UI">© 2026 Lautaro Colque Sosa — LCS · Diseño Web &amp; UX/UI</span>
            <a href="#top" class="ico-up" data-es="Volver arriba" data-en="Back to top">Volver arriba</a>
          </div>
        </div>
      </footer>`;
  }

  /* ---------- Scroll: native (most fluid — runs on the compositor) ---------- */
  // No smooth-scroll hijacking. ScrollTrigger drives parallax/reveals off the
  // browser's native scroll, which stays 1:1 with input and buttery at 60fps.
  const lenis = null; // kept null so existing guards (menu/modal) are no-ops
  const hasGsap = typeof window.gsap !== 'undefined' && typeof window.ScrollTrigger !== 'undefined';
  if (hasGsap) {
    gsap.registerPlugin(ScrollTrigger);
    gsap.ticker.lagSmoothing(0);
  }

  function scrollToEl(target) {
    const el = typeof target === 'string' ? $(target) : target;
    if (!el) return;
    el.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' });
  }

  /* ---------- Progress bar + nav theme (rAF-throttled) ---------- */
  let progress, themed = [], scrollTicking = false, lastLight = null, lastAccent = null;
  function readScroll() {
    scrollTicking = false;
    const max = document.documentElement.scrollHeight - innerHeight || 1;
    if (progress) progress.style.transform = 'scaleX(' + Math.min(1, Math.max(0, scrollY / max)) + ')';
    let theme = 'dark';
    for (let i = 0; i < themed.length; i++) {
      const r = themed[i].el.getBoundingClientRect();
      if (r.top <= 72 && r.bottom > 72) theme = themed[i].nav;
    }
    const light  = theme === 'light';
    const accent = theme === 'accent';
    if (light !== lastLight) {
      lastLight = light;
      document.body.classList.toggle('nav-light', light);
    }
    if (accent !== lastAccent) {
      lastAccent = accent;
      document.body.classList.toggle('nav-accent', accent);
    }
  }
  function onScroll() {
    if (scrollTicking) return;            // coalesce multiple events into one frame
    scrollTicking = true;
    requestAnimationFrame(readScroll);
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

    // In-page anchors scroll smoothly; cross-page links navigate normally.
    $$('a[href^="#"]').forEach(a => a.addEventListener('click', e => {
      const id = a.getAttribute('href');
      if (id.length < 2 || !$(id)) return;
      e.preventDefault();
      if (document.body.classList.contains('menu-open')) setOpen(false);
      scrollToEl(id);
    }));
    document.addEventListener('keydown', e => { if (e.key === 'Escape') setOpen(false); });
  }

  /* ---------- Scroll reveals (GSAP + ScrollTrigger) ---------- */
  function animations() {
    if (!hasGsap || reduced) { document.documentElement.classList.remove('js'); return; }

    $$('[data-reveal-title]').forEach(h => {
      const lines = $$('.ln > span', h);
      gsap.set(lines, { yPercent: 110 });
      if (h.getBoundingClientRect().top < window.innerHeight) {
        gsap.to(lines, { yPercent: 0, duration: 0.9, ease: 'power3.out', stagger: 0.13, delay: 0.2 });
      } else {
        gsap.to(lines, { yPercent: 0, duration: 0.8, ease: 'power3.out', stagger: 0.12,
          scrollTrigger: { trigger: h, start: 'top 84%' } });
      }
    });

    $$('[data-reveal-text]').forEach(el => {
      gsap.to(el, { clipPath: 'inset(0 0 -4% 0)', duration: 1, ease: 'power2.inOut',
        scrollTrigger: { trigger: el, start: 'top 88%' } });
    });

    $$('[data-stagger]').forEach(c => {
      gsap.to($$(':scope > *', c), { autoAlpha: 1, y: 0, duration: 0.7, ease: 'power3.out', stagger: 0.1,
        scrollTrigger: { trigger: c, start: 'top 82%' } });
    });

    $$('[data-fade-scale]').forEach(el => {
      gsap.to(el, { autoAlpha: 1, scale: 1, duration: 0.9, ease: 'power2.out',
        scrollTrigger: { trigger: el, start: 'top 80%' } });
    });

    $$('[data-parallax]').forEach(img => {
      const host = img.closest('[data-parallax-host]') || img.parentElement;
      gsap.fromTo(img, { yPercent: -8 }, { yPercent: 10, ease: 'none',
        scrollTrigger: { trigger: host, start: 'top bottom', end: 'bottom top', scrub: true } });
    });

    window.addEventListener('load', () => ScrollTrigger.refresh());
  }

  /* ---------- Bilingual ES | EN ---------- */
  function i18n() {
    const KEY = 'lcs-lang';
    const META = {
      es: { title: document.title, desc: $('meta[name="description"]')?.content || '' },
      en: { title: document.body.dataset.titleEn || document.title, desc: document.body.dataset.descEn || '' },
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
      $$('[data-ph-es]').forEach(el => {
        const v = lang === 'en' ? el.getAttribute('data-ph-en') : el.getAttribute('data-ph-es');
        if (v != null) el.setAttribute('placeholder', v);
      });
      $$('.lang-btn').forEach(b => b.classList.toggle('active', b.dataset.lang === lang));
      if (META[lang].title) document.title = META[lang].title;
      const md = $('meta[name="description"]');
      if (md && META[lang].desc) md.setAttribute('content', META[lang].desc);
      if (window.__lcsOnLang) window.__lcsOnLang(lang);
      if (window.__modalRerender) window.__modalRerender();
      if (hasGsap && !reduced) ScrollTrigger.refresh();
    }
    window.setLang = apply;
    $$('.lang-btn').forEach(b => b.addEventListener('click', () => apply(b.dataset.lang)));
    apply(lang);
  }

  /* ---------- Custom cursor ---------- */
  function cursor() {
    if (window.matchMedia('(pointer: coarse)').matches) return;
    const dot = $('.cursor-dot');
    if (!dot) return;
    window.addEventListener('mousemove', e => {
      dot.style.transform = `translate(${e.clientX}px,${e.clientY}px) translate(-50%,-50%)`;
    });
    const hov = 'a, button, [data-project], .card-hover, input, label, textarea, .lang-btn, .corner-logo';
    document.addEventListener('mouseover', e => { if (e.target.closest(hov)) dot.classList.add('is-hover'); });
    document.addEventListener('mouseout',  e => { if (e.target.closest(hov)) dot.classList.remove('is-hover'); });
    document.addEventListener('mousedown', () => dot.classList.add('is-down'));
    document.addEventListener('mouseup',   () => dot.classList.remove('is-down'));
  }

  /* ---------- Boot ---------- */
  document.addEventListener('DOMContentLoaded', () => {
    chrome();
    footer();

    progress = $('#progress');
    themed = $$('[data-nav]').map(el => ({ el, nav: el.getAttribute('data-nav') || 'dark' }));

    menu();
    if (window.__lcsProjects) window.__lcsProjects({ $, $$, getLenis: () => lenis });
    i18n();
    animations();
    cursor();

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('load', onScroll);
  });
})();
