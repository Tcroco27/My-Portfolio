(function () {
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  /* ---------- Scroll reveal ---------- */
  var els = document.querySelectorAll('.reveal');
  if (!('IntersectionObserver' in window)) {
    els.forEach(function (e) { e.classList.add('in'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    els.forEach(function (e) { io.observe(e); });
  }

  /* ---------- 8. Scroll progress bar ---------- */
  var bar = document.createElement('div');
  bar.id = 'progress';
  document.body.appendChild(bar);
  var ticking = false;
  function updateBar() {
    var h = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.transform = 'scaleX(' + (h > 0 ? Math.min(window.scrollY / h, 1) : 0) + ')';
    ticking = false;
  }
  window.addEventListener('scroll', function () {
    if (!ticking) { requestAnimationFrame(updateBar); ticking = true; }
  }, { passive: true });
  updateBar();

  /* ---------- 9. Page transitions ---------- */
  var fade = document.getElementById('fade');
  if (fade && !reduce) {
    document.addEventListener('click', function (ev) {
      var a = ev.target.closest('a');
      if (!a || ev.defaultPrevented || ev.button !== 0 || ev.metaKey || ev.ctrlKey || ev.shiftKey || ev.altKey) return;
      var href = a.getAttribute('href') || '';
      if (a.target === '_blank' || a.hasAttribute('download') || !/^[\w-]+\.html(#.*)?$/.test(href)) return;
      ev.preventDefault();
      fade.classList.add('leaving');
      setTimeout(function () { window.location.href = href; }, 260);
    });
    window.addEventListener('pageshow', function (e) { if (e.persisted) fade.classList.remove('leaving'); });
  }

  /* ---------- 3. Letter-by-letter name + 2. flicker ---------- */
  var h1 = document.querySelector('.hero h1');
  if (h1 && !reduce) {
    var i = 0;
    var split = function (node) {
      Array.prototype.slice.call(node.childNodes).forEach(function (n) {
        if (n.nodeType === 3) {
          var frag = document.createDocumentFragment();
          n.textContent.split('').forEach(function (c) {
            var s = document.createElement('span');
            if (c === ' ') { s.className = 'sp'; s.innerHTML = '&nbsp;'; }
            else { s.className = 'ch'; s.textContent = c; s.style.setProperty('--d', (0.15 + i * 0.055).toFixed(3) + 's'); i++; }
            frag.appendChild(s);
          });
          node.replaceChild(frag, n);
        } else if (n.nodeType === 1) { split(n); }
      });
    };
    h1.setAttribute('aria-label', h1.textContent.replace(/\s+/g, ' ').trim());
    split(h1);
    var red = h1.querySelector('.red');
    if (red) red.classList.add('flick');
  }

  /* ---------- 1. Flashlight ---------- */
  var hero = document.querySelector('.hero');
  var light = document.querySelector('.flashlight');
  if (hero && light && !reduce) {
    var tx = 0.7, ty = 0.4, cx = tx, cy = ty, userMoved = false, t0 = performance.now();
    if (finePointer) {
      hero.addEventListener('mousemove', function (e) {
        var r = hero.getBoundingClientRect();
        tx = (e.clientX - r.left) / r.width; ty = (e.clientY - r.top) / r.height; userMoved = true;
      });
      hero.addEventListener('mouseleave', function () { userMoved = false; });
    }
    var heroVisible = true;
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (en) { heroVisible = en[0].isIntersecting; }).observe(hero);
    }
    (function loop(now) {
      if (heroVisible) {
        if (!userMoved) { // idle drift, like someone sweeping a torch
          var t = (now - t0) / 1000;
          tx = 0.62 + Math.sin(t * 0.45) * 0.25 + Math.sin(t * 1.3) * 0.04;
          ty = 0.42 + Math.sin(t * 0.7 + 1) * 0.16;
        }
        cx += (tx - cx) * 0.12; cy += (ty - cy) * 0.12;
        light.style.setProperty('--mx', (cx * 100).toFixed(2) + '%');
        light.style.setProperty('--my', (cy * 100).toFixed(2) + '%');
      }
      requestAnimationFrame(loop);
    })(t0);
  }

  /* ---------- 4. Card tilt + glare ---------- */
  if (finePointer && !reduce) {
    document.querySelectorAll('.games .card').forEach(function (card) {
      var g = document.createElement('span');
      g.className = 'glare';
      card.appendChild(g);
      card.addEventListener('mousemove', function (e) {
        var r = card.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
        card.classList.add('tilting'); card.classList.remove('untilt');
        card.style.transform = 'rotateX(' + ((0.5 - py) * 7).toFixed(2) + 'deg) rotateY(' + ((px - 0.5) * 9).toFixed(2) + 'deg) translateZ(0)';
        card.style.setProperty('--gx', (px * 100) + '%');
        card.style.setProperty('--gy', (py * 100) + '%');
      });
      card.addEventListener('mouseleave', function () {
        card.classList.remove('tilting'); card.classList.add('untilt');
        card.style.transform = '';
      });
    });
  }

  /* ---------- 5. Count-up stats ---------- */
  var nums = document.querySelectorAll('[data-count]');
  if (nums.length && 'IntersectionObserver' in window && !reduce) {
    var cio = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        cio.unobserve(en.target);
        var el = en.target, to = +el.dataset.count, from = +(el.dataset.from || 0);
        var pad = el.dataset.pad ? +el.dataset.pad : 0, start = null, dur = 1400;
        (function step(ts) {
          if (!start) start = ts;
          var p = Math.min((ts - start) / dur, 1), e = 1 - Math.pow(1 - p, 3);
          var v = String(Math.round(from + (to - from) * e));
          while (v.length < pad) v = '0' + v;
          el.textContent = v;
          if (p < 1) requestAnimationFrame(step);
        })(performance.now());
      });
    }, { threshold: 0.6 });
    nums.forEach(function (n) {
      var v = String(+(n.dataset.from || 0));
      while (n.dataset.pad && v.length < +n.dataset.pad) v = '0' + v;
      n.textContent = v;
      cio.observe(n);
    });
  }


  /* ---------- Custom crosshair cursor ---------- */
  if (finePointer && !reduce) {
    var root = document.documentElement;
    var dot = document.createElement('div'), ring = document.createElement('div');
    dot.className = 'cur-dot'; ring.className = 'cur-ring';
    document.body.appendChild(ring); document.body.appendChild(dot);
    root.classList.add('has-cursor');
    var mx = -100, my = -100, rx = mx, ry = my;
    document.addEventListener('mousemove', function (e) {
      mx = e.clientX; my = e.clientY;
      dot.style.transform = 'translate(' + mx + 'px,' + my + 'px)';
      root.classList.add('cursor-on');
      var hit = e.target.closest && e.target.closest('a, button, .card, .channel');
      root.classList.toggle('cursor-hover', !!hit);
    }, { passive: true });
    document.addEventListener('mouseleave', function () { root.classList.remove('cursor-on'); });
    document.addEventListener('mousedown', function () { root.classList.add('cursor-down'); });
    document.addEventListener('mouseup', function () { root.classList.remove('cursor-down'); });
    (function follow() {
      rx += (mx - rx) * 0.2; ry += (my - ry) * 0.2;
      ring.style.transform = 'translate(' + rx.toFixed(1) + 'px,' + ry.toFixed(1) + 'px)';
      requestAnimationFrame(follow);
    })();
  }

  /* ---------- Work page filters ---------- */
  var fbar = document.querySelector('.filters');
  if (fbar) {
    var cards = document.querySelectorAll('.games .card');
    fbar.addEventListener('click', function (ev) {
      var btn = ev.target.closest('button');
      if (!btn) return;
      fbar.querySelectorAll('button').forEach(function (b) { b.classList.toggle('on', b === btn); });
      var f = btn.dataset.filter;
      cards.forEach(function (c) {
        c.classList.toggle('hidden', f !== 'all' && (c.dataset.tags || '').split(' ').indexOf(f) === -1);
      });
    });
  }
})();
