/* Mouse-reactive green particle field for the hero — vanilla canvas, 60fps.
   Lighter and more performant than Three.js for a 2D field (per the brief's
   "performance / sin dependencias innecesarias" rule). */
(function () {
  const canvas = document.getElementById('particles');
  if (!canvas) return;
  const ctx = canvas.getContext('2d', { alpha: true });

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let W = 0, H = 0, DPR = Math.min(window.devicePixelRatio || 1, 2);
  let particles = [];
  const mouse = { x: -9999, y: -9999, active: false };

  function accent() {
    const c = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim();
    return c || '#119066';
  }
  let COLOR = accent();

  function count() {
    const area = W * H;
    return Math.max(28, Math.min(110, Math.round(area / 16000)));
  }

  function resize() {
    const r = canvas.getBoundingClientRect();
    W = r.width; H = r.height;
    canvas.width = W * DPR; canvas.height = H * DPR;
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    build();
  }

  function build() {
    const n = count();
    particles = new Array(n).fill(0).map(() => ({
      x: Math.random() * W,
      y: Math.random() * H,
      vx: (Math.random() - 0.5) * 0.22,
      vy: (Math.random() - 0.5) * 0.22,
      r: Math.random() * 1.7 + 0.5,
      a: Math.random() * 0.5 + 0.18
    }));
  }

  function hexToRgb(hex) {
    let h = hex.replace('#', '');
    if (h.length === 3) h = h.split('').map(c => c + c).join('');
    const num = parseInt(h, 16);
    return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
  }

  let rgb = hexToRgb(COLOR);
  const LINK = 128;

  function frame() {
    ctx.clearRect(0, 0, W, H);
    const [cr, cg, cb] = rgb;

    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      p.x += p.vx; p.y += p.vy;

      // mouse repulsion / attraction
      if (mouse.active) {
        const dx = p.x - mouse.x, dy = p.y - mouse.y;
        const d2 = dx * dx + dy * dy;
        if (d2 < 150 * 150 && d2 > 0.01) {
          const d = Math.sqrt(d2);
          const f = (150 - d) / 150 * 0.9;
          p.x += (dx / d) * f;
          p.y += (dy / d) * f;
        }
      }

      if (p.x < 0) p.x = W; if (p.x > W) p.x = 0;
      if (p.y < 0) p.y = H; if (p.y > H) p.y = 0;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${cr},${cg},${cb},${p.a})`;
      ctx.fill();

      // links
      for (let j = i + 1; j < particles.length; j++) {
        const q = particles[j];
        const dx = p.x - q.x, dy = p.y - q.y;
        const d2 = dx * dx + dy * dy;
        if (d2 < LINK * LINK) {
          const o = (1 - Math.sqrt(d2) / LINK) * 0.22;
          ctx.strokeStyle = `rgba(${cr},${cg},${cb},${o})`;
          ctx.lineWidth = 0.6;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y); ctx.stroke();
        }
      }
    }
    raf = requestAnimationFrame(frame);
  }

  let raf = null;
  window.addEventListener('mousemove', (e) => {
    const r = canvas.getBoundingClientRect();
    mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top; mouse.active = true;
  });
  window.addEventListener('mouseout', () => { mouse.active = false; });
  window.addEventListener('resize', resize);

  // Allow Tweaks to recolor live
  window.__particlesRecolor = function () { COLOR = accent(); rgb = hexToRgb(COLOR); };

  resize();
  if (!reduced) { raf = requestAnimationFrame(frame); }
  else {
    // static single paint for reduced motion
    const [cr, cg, cb] = rgb;
    particles.forEach(p => { ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI*2); ctx.fillStyle = `rgba(${cr},${cg},${cb},${p.a})`; ctx.fill(); });
  }
})();
