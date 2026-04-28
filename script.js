// ============================================
//  TAREK EL JARAB — PORTFOLIO SCRIPTS
// ============================================

// ---- T-ASSEMBLY LOADING SCREEN (index.html only) ----
(function () {
  const loader  = document.getElementById('loader');
  if (!loader) return;

  const svg     = document.getElementById('ld-svg');
  const pctEl   = document.getElementById('ld-pct');
  const enterEl = document.getElementById('ld-enter');
  const site    = document.getElementById('site-content');

  const G  = '#39ff6a';
  const DG = 'rgba(57,255,106,0.12)';

  const CX = 200, TY = 140;
  const BW = 200, BH = 36, SW = 44, SH = 160;
  const BX = CX - BW / 2, SX = CX - SW / 2, SY = TY + BH;

  function ns(tag) {
    return document.createElementNS('http://www.w3.org/2000/svg', tag);
  }

  let els = [];
  let ready = false;

  function buildSVG() {
    svg.innerHTML = '';
    els = [];

    [[BX, TY, BW, BH],[SX, SY, SW, SH],[SX + SW + 10, SY + SH - 36, 18, 18]].forEach(([x,y,w,h]) => {
      const r = ns('rect');
      r.setAttribute('x', x); r.setAttribute('y', y);
      r.setAttribute('width', w); r.setAttribute('height', h);
      r.setAttribute('fill', 'none');
      r.setAttribute('stroke', DG);
      r.setAttribute('stroke-width', '1');
      svg.appendChild(r);
    });

    const pieces = [];
    for (let i = 0; i < 6; i++) {
      const pw = BW / 6;
      pieces.push({ x: BX + i * pw, y: TY, w: pw - 2, h: BH - 2 });
    }
    for (let i = 0; i < 5; i++) {
      const ph = SH / 5;
      pieces.push({ x: SX, y: SY + i * ph, w: SW - 2, h: ph - 2 });
    }
    pieces.push({ x: SX + SW + 10, y: SY + SH - 36, w: 16, h: 16, isDot: true });

    pieces.forEach((p) => {
      const angle = Math.random() * 2 * Math.PI;
      const dist  = 160 + Math.random() * 140;
      const ox = Math.cos(angle) * dist;
      const oy = Math.sin(angle) * dist;
      const g = ns('g');
      const r = ns('rect');
      r.setAttribute('x', p.x); r.setAttribute('y', p.y);
      r.setAttribute('width', p.w); r.setAttribute('height', p.h);
      r.setAttribute('fill', DG); r.setAttribute('stroke', DG);
      r.setAttribute('stroke-width', '0.5');
      g.setAttribute('transform', `translate(${ox},${oy})`);
      g.setAttribute('opacity', '0');
      g.appendChild(r);
      svg.appendChild(g);
      els.push({ g, r, ox, oy, isDot: !!p.isDot, lit: false });
    });
  }

  function flyIn(el, delay, onDone) {
    const STEPS = 26;
    let t = 0;
    el.g.setAttribute('opacity', '1');
    function tick() {
      t++;
      const ease = 1 - Math.pow(1 - t / STEPS, 3);
      el.g.setAttribute('transform',
        `translate(${(el.ox * (1 - ease)).toFixed(2)},${(el.oy * (1 - ease)).toFixed(2)})`);
      if (t >= STEPS) {
        el.g.setAttribute('transform', 'translate(0,0)');
        el.r.setAttribute('fill', G); el.r.setAttribute('stroke', G);
        el.r.setAttribute('opacity', '0.88');
        el.lit = true;
        if (onDone) onDone();
      } else { setTimeout(tick, 16); }
    }
    setTimeout(tick, delay);
  }

  function flashAll() {
    els.forEach(el => {
      if (!el.lit) return;
      el.r.setAttribute('fill', '#ffffff');
      setTimeout(() => el.r.setAttribute('fill', G), 130);
    });
  }

  function run() {
    ready = false;
    enterEl.style.opacity = '0';
    pctEl.textContent = '0%';
    buildSVG();

    const order = els.map((_, i) => i);
    const dotIdx = order.findIndex(i => els[i].isDot);
    order.splice(dotIdx, 1);
    for (let i = order.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [order[i], order[j]] = [order[j], order[i]];
    }
    order.push(dotIdx);

    let done = 0;
    const total = els.length;
    order.forEach((elIdx, seq) => {
      flyIn(els[elIdx], seq * 175 + Math.random() * 55, () => {
        done++;
        pctEl.textContent = Math.round((done / total) * 100) + '%';
        if (done === total) {
          flashAll();
          setTimeout(() => {
            ready = true;
            enterEl.style.opacity = '1';
            enterEl.style.animation = 'ldBlink 1.5s ease-in-out infinite';
          }, 300);
        }
      });
    });
  }

  function doTransition() {
    loader.style.transition = 'opacity 0.35s ease';
    loader.style.opacity = '0';
    setTimeout(() => {
      loader.style.display = 'none';
      site.style.display = 'block';
      handleNavScroll();
    }, 380);
  }

  loader.addEventListener('click', () => { if (ready) doTransition(); });

  const style = document.createElement('style');
  style.textContent = '@keyframes ldBlink { 0%,100%{opacity:0.3} 50%{opacity:0.08} }';
  document.head.appendChild(style);

  run();
})();


// ---- NAV SCROLL EFFECT ----
function handleNavScroll() {
  const nav = document.querySelector('.nav');
  if (!nav) return;
  const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 40);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

if (!document.getElementById('loader')) handleNavScroll();
