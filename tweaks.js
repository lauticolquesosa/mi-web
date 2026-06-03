/* ============================================================
   LCS — vanilla Tweaks panel (host-protocol compatible)
   ============================================================ */
(function () {
  'use strict';
  const LS = 'lcs_tweaks_v1';
  const DEFAULTS = {
    accent: '#119066',
    cursor: true,
    particles: true,
    avail: true
  };
  let state = Object.assign({}, DEFAULTS);
  try { Object.assign(state, JSON.parse(localStorage.getItem(LS) || '{}')); } catch (e) {}

  const ACCENTS = [
    ['#119066', 'LCS'],
    ['#16B07E', 'Vivo'],
    ['#0C6E4C', 'Bosque'],
    ['#1FC98C', 'Neón']
  ];

  /* ---------- apply ---------- */
  function apply() {
    document.documentElement.style.setProperty('--accent', state.accent);
    if (window.__particlesRecolor) window.__particlesRecolor();
    document.body.classList.toggle('no-cursor-fx', !state.cursor);
    const canvas = document.getElementById('particles');
    if (canvas) canvas.style.display = state.particles ? '' : 'none';
    document.querySelectorAll('[data-avail]').forEach(el => { el.style.display = state.avail ? '' : 'none'; });
    try { localStorage.setItem(LS, JSON.stringify(state)); } catch (e) {}
    try { window.parent.postMessage({ type: '__edit_mode_set_keys', edits: state }, '*'); } catch (e) {}
  }

  /* ---------- build panel ---------- */
  const panel = document.createElement('div');
  panel.className = 'twk';
  panel.style.display = 'none';
  panel.innerHTML = `
    <div class="twk__hd" data-drag>
      <b>Tweaks</b>
      <button class="twk__x" aria-label="Cerrar">✕</button>
    </div>
    <div class="twk__body">
      <div class="twk__sect">Acento quirúrgico</div>
      <div class="twk__sw" data-accent></div>

      <div class="twk__sect">Interacción</div>
      <label class="twk__row"><span>Cursor personalizado</span><input type="checkbox" data-k="cursor"></label>
      <label class="twk__row"><span>Partículas del hero</span><input type="checkbox" data-k="particles"></label>
      <label class="twk__row"><span>Indicador disponible</span><input type="checkbox" data-k="avail"></label>

      <div class="twk__sect">Marca</div>
      <button class="twk__btn" data-eyes>Encender ojos del jaguar</button>
    </div>`;
  document.body.appendChild(panel);

  // swatches
  const sw = panel.querySelector('[data-accent]');
  ACCENTS.forEach(([hex, name]) => {
    const b = document.createElement('button');
    b.className = 'twk__chip';
    b.style.setProperty('--c', hex);
    b.title = name;
    b.dataset.hex = hex;
    b.innerHTML = `<i></i><em>${name}</em>`;
    sw.appendChild(b);
  });
  function syncChips() {
    sw.querySelectorAll('.twk__chip').forEach(c => c.classList.toggle('on', c.dataset.hex === state.accent));
  }
  sw.addEventListener('click', e => {
    const c = e.target.closest('.twk__chip'); if (!c) return;
    state.accent = c.dataset.hex; syncChips(); apply();
  });

  // toggles
  panel.querySelectorAll('input[data-k]').forEach(inp => {
    inp.checked = !!state[inp.dataset.k];
    inp.addEventListener('change', () => { state[inp.dataset.k] = inp.checked; apply(); });
  });

  // eyes button
  panel.querySelector('[data-eyes]').addEventListener('click', () => {
    const glow = document.querySelector('.eye-glow');
    if (glow) { glow.classList.add('lit'); setTimeout(() => glow.classList.remove('lit'), 2000); }
  });

  // close
  panel.querySelector('.twk__x').addEventListener('click', () => {
    panel.style.display = 'none';
    try { window.parent.postMessage({ type: '__edit_mode_dismissed' }, '*'); } catch (e) {}
  });

  // drag
  (function () {
    const hd = panel.querySelector('[data-drag]');
    let sx, sy, ox, oy, drag = false;
    hd.addEventListener('mousedown', e => {
      drag = true; sx = e.clientX; sy = e.clientY;
      const r = panel.getBoundingClientRect(); ox = r.left; oy = r.top;
      panel.style.right = 'auto'; panel.style.bottom = 'auto';
      panel.style.left = ox + 'px'; panel.style.top = oy + 'px';
      e.preventDefault();
    });
    window.addEventListener('mousemove', e => {
      if (!drag) return;
      panel.style.left = (ox + e.clientX - sx) + 'px';
      panel.style.top = (oy + e.clientY - sy) + 'px';
    });
    window.addEventListener('mouseup', () => { drag = false; });
  })();

  /* ---------- host protocol ---------- */
  window.addEventListener('message', e => {
    const t = e && e.data && e.data.type;
    if (t === '__activate_edit_mode') { panel.style.display = 'flex'; syncChips(); }
    else if (t === '__deactivate_edit_mode') panel.style.display = 'none';
  });
  try { window.parent.postMessage({ type: '__edit_mode_available' }, '*'); } catch (e) {}

  syncChips();
  apply();
})();
