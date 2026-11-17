// Scroll reveal
(function () {
  var els = document.querySelectorAll('.reveal');
  if (!('IntersectionObserver' in window)) { els.forEach(function (e) { e.classList.add('in'); }); return; }
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  els.forEach(function (e) { io.observe(e); });
})();

// Project filters (Work page)
(function () {
  var bar = document.querySelector('.filters');
  if (!bar) return;
  var cards = document.querySelectorAll('.games .card');
  bar.addEventListener('click', function (ev) {
    var btn = ev.target.closest('button');
    if (!btn) return;
    bar.querySelectorAll('button').forEach(function (b) { b.classList.toggle('on', b === btn); });
    var f = btn.dataset.filter;
    cards.forEach(function (c) {
      c.classList.toggle('hidden', f !== 'all' && (c.dataset.tags || '').split(' ').indexOf(f) === -1);
    });
  });
})();
