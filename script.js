// ============================================
//  TAREK EL JARAB — PORTFOLIO SCRIPTS
// ============================================

// ---- LOADING SCREEN (index.html only) ----
(function () {
  const loader = document.getElementById('loader');
  if (!loader) return;

  const logo  = document.getElementById('ld-logo');
  const bar   = document.getElementById('ld-bar');
  const lbl   = document.getElementById('ld-lbl');
  const enter = document.getElementById('ld-enter');
  const flash = document.getElementById('ld-flash');
  const site  = document.getElementById('site-content');

  let ready = false;
  let clicked = false;

  // Animate logo + label in
  setTimeout(() => {
    logo.classList.add('visible');
    lbl.classList.add('visible');
  }, 300);

  // Progress bar steps
  let pct = 0;
  const steps = [
    { target: 28,  intervalMs: 90  },
    { target: 55,  intervalMs: 65  },
    { target: 74,  intervalMs: 85  },
    { target: 91,  intervalMs: 55  },
    { target: 100, intervalMs: 35  },
  ];

  function runStep(i) {
    if (i >= steps.length) {
      ready = true;
      enter.classList.add('visible');
      if (clicked) doTransition();
      return;
    }
    const s = steps[i];
    const inc = (s.target - pct) / 14;
    let t = 0;
    const iv = setInterval(() => {
      pct = Math.min(pct + inc, s.target);
      bar.style.width = pct + '%';
      t++;
      if (t >= 14) { clearInterval(iv); runStep(i + 1); }
    }, s.intervalMs);
  }

  setTimeout(() => runStep(0), 600);

  // Click to enter
  function doTransition() {
    flash.style.opacity = '0.18';
    setTimeout(() => { flash.style.opacity = '0'; }, 80);

    setTimeout(() => {
      loader.classList.add('hidden');
      site.style.display = 'block';
      // Trigger nav scroll class on page reveal
      handleNavScroll();
    }, 420);
  }

  loader.addEventListener('click', () => {
    if (ready) {
      doTransition();
    } else {
      clicked = true;
    }
  });
})();


// ---- NAV SCROLL EFFECT (all pages) ----
function handleNavScroll() {
  const nav = document.querySelector('.nav');
  if (!nav) return;
  const onScroll = () => {
    nav.classList.toggle('scrolled', window.scrollY > 40);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

// Run nav scroll on non-index pages immediately
if (!document.getElementById('loader')) {
  handleNavScroll();
}
