// ---------------------------------------------------------------
// Reservation form: put the address of the booking form between the
// quotes, for example "https://example.com/book". It then opens inside
// the "Book your table" block on the home page and on reserve.html.
// Leave it empty to show "Online booking opens soon" and the phone number.
// ---------------------------------------------------------------
const RESERVATION_FORM_URL = "";

(function () {
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var still = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  // the page head sets "js" (it hides text until it is revealed) and waits for this script to say "ready";
  // if this script is late or broken, the head puts everything back on screen
  var root = document.documentElement;
  var fx = root.classList.contains('js');
  root.classList.add('ready');

  // Cairo time
  function cairo() {
    try {
      var p = new Intl.DateTimeFormat('en-GB', { timeZone: 'Africa/Cairo', year: 'numeric', month: '2-digit', day: '2-digit', hour: 'numeric', minute: 'numeric', hour12: false }).formatToParts(new Date());
      var g = function (t) { return p.filter(function (x) { return x.type === t; })[0].value; };
      var h = +g('hour') % 24, m = +g('minute');
      return { t: h * 60 + m };
    } catch (e) { var d = new Date(); return { t: d.getHours() * 60 + d.getMinutes() }; }
  }

  // open or closed line (opening and closing minutes after midnight are read from <body>; closing is the next day when smaller)
  var bd = document.body;
  var o = +bd.getAttribute('data-open'), x = +bd.getAttribute('data-close');
  if (bd.hasAttribute('data-open')) {
    var c = cairo();
    var isOpen = o < x ? (c.t >= o && c.t < x) : (c.t >= o || c.t < x);
    $$('.js-status').forEach(function (st) {
      st.textContent = isOpen ? bd.getAttribute('data-open-text') : bd.getAttribute('data-closed-text');
      st.classList.toggle('open', isOpen);
    });
  }

  // header: transparent over the first screen, solid after a short scroll
  var hdr = $('.hdr');
  var over = $('.hdr--over');
  if (over) {
    var solid = function () { over.classList.toggle('solid', window.scrollY > 40); };
    solid(); window.addEventListener('scroll', solid, { passive: true });
  }

  // drawer
  var burger = $('.burger'), mnav = $('#mnav');
  function setNav(on) {
    if (!burger || !mnav) return;
    mnav.classList.toggle('open', on);
    if (hdr) hdr.classList.toggle('menu-open', on);
    burger.setAttribute('aria-expanded', String(on));
    burger.setAttribute('aria-label', on ? 'Close menu' : 'Open menu');
    document.body.style.overflow = on ? 'hidden' : '';
  }
  if (burger && mnav) {
    burger.addEventListener('click', function () { setNav(!mnav.classList.contains('open')); });
    $$('#mnav a').forEach(function (a) { a.addEventListener('click', function () { setNav(false); }); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setNav(false); });
    window.addEventListener('resize', function () { if (window.innerWidth >= 960) setNav(false); });
  }

  // Arabic pop-up
  var toast = $('.toast'), tt;
  function say() {
    if (!toast) return;
    toast.classList.add('show'); clearTimeout(tt);
    tt = setTimeout(function () { toast.classList.remove('show'); }, 2800);
  }
  $$('.js-ar').forEach(function (b) { b.addEventListener('click', function () { setNav(false); say(); }); });

  // reservation slot: an address above, or a pasted embed inside [data-embed], switches the block to the form
  $$('[data-reservation]').forEach(function (slot) {
    var box = $('[data-embed]', slot);
    if (!box) return;
    if (RESERVATION_FORM_URL && !box.children.length) {
      var f = document.createElement('iframe');
      f.src = RESERVATION_FORM_URL;
      f.title = 'Book your table at Charlie’s';
      f.loading = 'lazy';
      f.setAttribute('allow', 'payment');
      f.setAttribute('referrerpolicy', 'strict-origin-when-cross-origin');
      box.appendChild(f);
    }
    if (box.children.length) slot.classList.add('has-form');
  });

  // reveal on scroll: text blocks and the kitchen tiles only, never the photos inside frames
  var rv = $$('.rv, .fd');
  if (rv.length) {
    if (!fx || !('IntersectionObserver' in window) || still) { rv.forEach(function (n) { n.classList.add('in'); }); }
    else {
      var io = new IntersectionObserver(function (es) {
        es.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
      }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
      rv.forEach(function (n) { io.observe(n); });
    }
  }

  // brass arch outlines: an SVG laid around the arch (outside the clipped photo), drawn once when it comes into view
  var NS = 'http://www.w3.org/2000/svg';
  function buildLn(host) {
    var offs = (host.getAttribute('data-ln') || '11,22').split(',').map(Number);
    var w = host.offsetWidth, h = host.offsetHeight;
    if (!w || !h) return;
    var big = offs[offs.length - 1];
    var svg = host._ln;
    if (!svg) {
      svg = document.createElementNS(NS, 'svg');
      svg.setAttribute('class', 'ln'); svg.setAttribute('aria-hidden', 'true'); svg.setAttribute('focusable', 'false');
      offs.forEach(function () { svg.appendChild(document.createElementNS(NS, 'path')); });
      host.appendChild(svg); host._ln = svg;
    }
    var W = w + 2 * big, H = h + big;
    svg.setAttribute('width', W); svg.setAttribute('height', H); svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
    svg.style.left = -big + 'px'; svg.style.top = -big + 'px';
    $$('path', svg).forEach(function (p, i) {
      var d = offs[i], x0 = big - d, x1 = x0 + w + 2 * d, r = (w + 2 * d) / 2, yc = big - d + r;
      p.setAttribute('d', 'M' + x0 + ' ' + H + 'L' + x0 + ' ' + yc + 'A' + r + ' ' + r + ' 0 0 1 ' + x1 + ' ' + yc + 'L' + x1 + ' ' + H);
      // length worked out by hand (two straight sides and a half circle) so no style is computed before it is set: the line starts undrawn, with nothing to transition from
      p.style.setProperty('--L', (2 * (H - yc) + Math.PI * r).toFixed(1));
    });
  }
  var hosts = fx ? $$('[data-ln]') : [];
  if (hosts.length) {
    var lio = (!still && 'IntersectionObserver' in window) ? new IntersectionObserver(function (es) {
      es.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('ln-on'); lio.unobserve(en.target); } });
    }, { threshold: 0.3 }) : null;
    hosts.forEach(function (host) {
      buildLn(host);
      if (lio) lio.observe(host); else host.classList.add('ln-on');
    });
    if ('ResizeObserver' in window) {
      var pending = false;
      var ro = new ResizeObserver(function () {
        if (pending) return; pending = true;
        requestAnimationFrame(function () { pending = false; hosts.forEach(buildLn); });
      });
      hosts.forEach(function (h) { ro.observe(h); });
    }
  }

  // deep links (menu.html#drinks, index.html#garden): place the target again once the fonts have settled the page height
  if (location.hash.length > 1 && document.fonts && document.fonts.ready) {
    var moved = false;
    ['wheel', 'touchstart', 'keydown', 'mousedown'].forEach(function (ev) { window.addEventListener(ev, function () { moved = true; }, { once: true, passive: true }); });
    document.fonts.ready.then(function () {
      setTimeout(function () {
        var t = document.getElementById(decodeURIComponent(location.hash.slice(1)));
        if (!t || moved) return;
        var d = document.documentElement;
        d.style.scrollBehavior = 'auto'; t.scrollIntoView(); d.style.scrollBehavior = '';
      }, 60);
    });
  }

  // menu page: a brass marker on the sticky row slides to the part of the menu in view
  var jrow = $('.mjump .row');
  if (jrow) {
    var mk = $('.mk', jrow), links = $$('a', jrow), groups = $$('.mgroup');
    var lock = false, lockTimer, shown = null;
    var place = function (a) {
      if (!a) { mk.style.opacity = 0; return; }
      var cs = getComputedStyle(a), pad = parseFloat(cs.paddingLeft) || 0, ls = parseFloat(cs.letterSpacing) || 0;
      var px = a.offsetLeft + pad, pw = a.offsetWidth - 2 * pad - ls;
      mk.style.transform = 'translateX(' + px.toFixed(1) + 'px) scaleX(' + (pw / 100).toFixed(4) + ')';
      mk.style.opacity = 1;
    };
    var mark = function (id) {
      var cur = null;
      links.forEach(function (a) {
        var on = a.getAttribute('href') === '#' + id;
        if (on) { a.setAttribute('aria-current', 'true'); cur = a; } else a.removeAttribute('aria-current');
      });
      place(cur);
      if (cur && id !== shown && jrow.scrollWidth > jrow.clientWidth) jrow.scrollTo({ left: cur.offsetLeft - jrow.clientWidth / 2 + cur.offsetWidth / 2, behavior: still ? 'auto' : 'smooth' });
      shown = id;
    };
    var cut = function () { return (hdr ? hdr.offsetHeight : 60) + 110; };
    var current = function () {
      var id = null;
      groups.forEach(function (g) { if (g.getBoundingClientRect().top < cut() + 3) id = g.id; });
      return id;
    };
    var sync = function () { if (!lock) mark(current()); };
    // a tap on the row: the marker goes straight to that part while the page scrolls there smoothly
    links.forEach(function (a) {
      a.addEventListener('click', function () {
        mark(a.getAttribute('href').slice(1));
        lock = true; clearTimeout(lockTimer);
        lockTimer = setTimeout(function () { lock = false; sync(); }, still ? 100 : 1500);
      });
    });
    // a thin band at the reading line: a section crossing it tells us the part has changed (no scroll listener)
    var band;
    var watch = function () {
      if (band) band.disconnect();
      if (!('IntersectionObserver' in window)) return;
      var top = cut(), vh = window.innerHeight;
      band = new IntersectionObserver(sync, { rootMargin: '-' + top + 'px 0px -' + Math.max(0, vh - top - 2) + 'px 0px', threshold: [0, 1] });
      groups.forEach(function (g) { band.observe(g); });
    };
    watch();
    var rt;
    window.addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(function () { watch(); shown = null; sync(); }, 150); });
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { shown = null; sync(); });
    sync();
  }
})();

/* top bar: clear at the top of the page, slips away on the way down, returns as dark glass on the way up */
(function () {
  var h = document.querySelector('.hdr'); if (!h) return;
  var last = window.scrollY, busy = false;
  var run = function () {
    busy = false;
    var y = window.scrollY, open = h.classList.contains('menu-open') || document.querySelector('#drawer.is-open');
    h.classList.toggle('is-glass', y > 40);
    if (open || y < 120) h.classList.remove('is-away');
    else if (y > last + 6) h.classList.add('is-away');
    else if (y < last - 6) h.classList.remove('is-away');
    last = y;
  };
  window.addEventListener('scroll', function () { if (!busy) { busy = true; requestAnimationFrame(run); } }, { passive: true });
  h.addEventListener('focusin', function () { h.classList.remove('is-away'); });
  run();
})();

/* top bar glass takes the colour of what is under it: light glass over the paper sections */
(function () {
  var h = document.querySelector('.hdr'), light = [].slice.call(document.querySelectorAll('.garden'));
  if (!h || !light.length) return;
  var busy = false;
  var run = function () {
    busy = false;
    var y = h.getBoundingClientRect().bottom - 8, on = false;
    light.forEach(function (s) { var r = s.getBoundingClientRect(); if (r.top <= y && r.bottom >= y) on = true; });
    h.classList.toggle('on-light', on);
  };
  window.addEventListener('scroll', function () { if (!busy) { busy = true; requestAnimationFrame(run); } }, { passive: true });
  window.addEventListener('resize', run);
  run();
})();
