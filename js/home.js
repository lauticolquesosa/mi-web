/* ============================================================
   LCS — home.js
   Home-only interactions:
   · seamless infinite marquees (ticker, capabilities, work)
   · magnetic buttons
   · manifesto word-fill on scroll
   · interactive process progress line
   Loaded before site.js; site.js calls window.__lcsOnLang()
   on every language apply (incl. the initial one).
   ============================================================ */
(function () {
  'use strict';

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $  = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const hasGsap = () => typeof window.gsap !== 'undefined' && typeof window.ScrollTrigger !== 'undefined';

  /* ---------- 1 · Seamless marquees (duplicate the track once) ---------- */
  function marquees() {
    $$('[data-marquee]').forEach(track => {
      if (track.dataset.cloned) return;
      track.dataset.cloned = '1';
      [...track.children].forEach(node => {
        const clone = node.cloneNode(true);
        clone.setAttribute('aria-hidden', 'true');
        track.appendChild(clone);
      });
    });
  }

  /* ---------- 2 · Magnetic buttons ---------- */
  function magnetic() {
    if (window.matchMedia('(pointer: coarse)').matches) return;
    const strength = 0.28;
    $$('[data-magnetic]').forEach(el => {
      el.addEventListener('mousemove', e => {
        const r = el.getBoundingClientRect();
        const x = (e.clientX - (r.left + r.width / 2)) * strength;
        const y = (e.clientY - (r.top + r.height / 2)) * strength;
        el.style.transform = `translate(${x}px, ${y}px)`;
      });
      el.addEventListener('mouseleave', () => { el.style.transform = ''; });
    });
  }

  /* ---------- 3 · Manifesto word-fill (rebuilds per language) ---------- */
  let manifestoST = null;
  function wrapWords(host) {
    const frag = document.createDocumentFragment();
    [...host.childNodes].forEach(node => {
      if (node.nodeType === 3) {                       // text node → split into words
        node.textContent.split(/(\s+)/).forEach(tok => {
          if (!tok) return;
          if (/^\s+$/.test(tok)) { frag.appendChild(document.createTextNode(tok)); return; }
          const sp = document.createElement('span');
          sp.className = 'word';
          sp.textContent = tok;
          frag.appendChild(sp);
        });
      } else if (node.nodeType === 1) {                // element (em) → one fill unit
        node.classList.add('word');
        frag.appendChild(node);
      }
    });
    host.innerHTML = '';
    host.appendChild(frag);
  }
  function manifesto() {
    const host = $('[data-manifesto]');
    if (!host) return;
    wrapWords(host);
    if (manifestoST) { manifestoST.kill(); manifestoST = null; }
    if (reduced || !hasGsap()) return;                 // no-JS / reduced → words stay full
    const words = $$('.word', host);
    gsap.set(words, { opacity: 0.18 });
    const tween = gsap.to(words, {
      opacity: 1, ease: 'none', stagger: { each: 0.4 },
      scrollTrigger: { trigger: host, start: 'top 80%', end: 'bottom 62%', scrub: true }
    });
    manifestoST = tween.scrollTrigger;
  }

  /* ---------- 4 · Interactive process line (one-time) ---------- */
  let flowReady = false;
  function flow() {
    if (flowReady) return;
    const bar = $('[data-flow-progress]');
    if (!bar) return;
    flowReady = true;
    if (reduced || !hasGsap()) { bar.style.transform = 'scaleX(1)'; return; }
    gsap.fromTo(bar, { scaleX: 0 }, {
      scaleX: 1, ease: 'none',
      scrollTrigger: { trigger: '.flow', start: 'top 72%', end: 'bottom 72%', scrub: true }
    });
  }

  /* ---------- Language hook (fired by site.js i18n, incl. first run) ---------- */
  window.__lcsOnLang = function () {
    manifesto();   // re-wrap after i18n swapped the text
    flow();
    if (!reduced && hasGsap()) ScrollTrigger.refresh();
  };

  document.addEventListener('DOMContentLoaded', () => {
    marquees();
    magnetic();
    // manifesto() + flow() are kicked off by __lcsOnLang during site.js i18n().
    // Fallback if i18n never runs (e.g. site.js failed to load):
    setTimeout(() => { if (!window.__lcsLang) { manifesto(); flow(); } }, 0);
  });
})();
