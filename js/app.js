// ---------------------------------------------------------------
// Reservation form: put the address of the booking form between the
// quotes, for example "https://example.com/book". It then opens inside
// the "Book your table" block on the home page and on reserve.html.
// Leave it empty to show the WhatsApp and Call buttons instead.
// ---------------------------------------------------------------
const RESERVATION_FORM_URL = "";

(function () {
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var still = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

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

  // header: transparent over the photo, solid after a short scroll
  var hdr = $('.hdr');
  var over = $('.hdr--over');
  if (over) {
    var solid = function () { over.classList.toggle('solid', window.scrollY > 40); };
    solid(); window.addEventListener('scroll', solid, { passive: true });
  }

  // opening fade finished: drop the animation so nothing stays composited
  var hero = $('.hero');
  if (hero) {
    var settle = function () { hero.classList.add('settled'); };
    var lastPn = $$('.pn', hero).pop();
    if (lastPn && !still) { lastPn.addEventListener('animationend', function () { setTimeout(settle, 50); }); setTimeout(settle, 5200); } else settle();
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

  // reveal on scroll (content is visible by default; the js class on <html> hides it until it enters)
  var rv = $$('.rv');
  if (rv.length) {
    if (!('IntersectionObserver' in window) || still) { rv.forEach(function (n) { n.classList.add('in'); }); }
    else {
      var io = new IntersectionObserver(function (es) {
        es.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
      }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
      rv.forEach(function (n) { io.observe(n); });
    }
  }

  // menus section: slow crossfade between photos
  var slides = $$('.menus .bg img'), dots = $$('.pager button');
  if (slides.length > 1) {
    var cur = 0, timer = null;
    var show = function (i) {
      cur = (i + slides.length) % slides.length;
      slides.forEach(function (s, k) { s.classList.toggle('on', k === cur); });
      dots.forEach(function (d, k) { d.setAttribute('aria-current', String(k === cur)); });
    };
    var stop = function () { if (timer) { clearInterval(timer); timer = null; } };
    var go = function () { stop(); if (!still && !document.hidden) timer = setInterval(function () { show(cur + 1); }, 6500); };
    dots.forEach(function (d, k) { d.addEventListener('click', function () { show(k); go(); }); });
    show(0);
    var sec = $('.menus');
    if ('IntersectionObserver' in window && sec) {
      new IntersectionObserver(function (es) { if (es[0].isIntersecting) go(); else stop(); }, { threshold: 0.2 }).observe(sec);
    } else go();
    document.addEventListener('visibilitychange', function () { if (document.hidden) stop(); else if (sec && sec.getBoundingClientRect().top < innerHeight) go(); });
  }

  // menu page: four menus switch on one page; a sticky row jumps between the sections of the open menu
  var panels = $$('.mpanel');
  if (panels.length) {
    var tabs = $$('.mtabs a');
    var jump = $('.subnav');
    var jrow = $('.subnav .row');
    var openPanel = function (p) {
      panels.forEach(function (q) { q.classList.toggle('on', q === p); });
      tabs.forEach(function (t) { var on = t.getAttribute('href') === '#' + p.id; if (on) t.setAttribute('aria-current', 'true'); else t.removeAttribute('aria-current'); });
      var secs = $$('.msec', p);
      jrow.innerHTML = '';
      if (secs.length > 1) {
        secs.forEach(function (s) {
          var a = document.createElement('a');
          a.href = '#' + s.id; a.textContent = $('h2', s).textContent;
          jrow.appendChild(a);
        });
        jump.hidden = false;
      } else { jump.hidden = true; }
    };
    var spyOn = function (id) {
      $$('a', jrow).forEach(function (a) { if (a.getAttribute('href') === '#' + id) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current'); });
    };
    var route = function (first) {
      var id = decodeURIComponent((location.hash || '').slice(1));
      var el = id ? document.getElementById(id) : null;
      var p = el ? (el.classList.contains('mpanel') ? el : el.closest('.mpanel')) : null;
      if (!p) { if (first) openPanel(panels[0]); return; }
      var wasOpen = p.classList.contains('on');
      openPanel(p);
      if (el === p) {
        // show the menu words and the start of the list, not just the list
        var toMenus = function () {
          var top = $('.mask').getBoundingClientRect().top + window.scrollY - (hdr ? hdr.offsetHeight : 60) - 16;
          window.scrollTo({ top: Math.max(0, top), behavior: 'auto' });
        };
        toMenus();
        if (first && document.readyState !== 'complete') window.addEventListener('load', function () { setTimeout(toMenus, 30); });
      } else if (!wasOpen) {
        el.scrollIntoView({ block: 'start', behavior: 'auto' });
      }
    };
    window.addEventListener('hashchange', function () { route(false); });
    tabs.forEach(function (t) {
      t.addEventListener('click', function (e) {
        e.preventDefault();
        var p = document.getElementById(t.getAttribute('href').slice(1));
        if (history.replaceState) history.replaceState(null, '', t.getAttribute('href')); else location.hash = t.getAttribute('href');
        openPanel(p);
      });
    });
    route(true);
    // which section of the open menu is on screen
    var tick = false;
    window.addEventListener('scroll', function () {
      if (tick) return; tick = true;
      requestAnimationFrame(function () {
        tick = false;
        var p = $('.mpanel.on'); if (!p) return;
        var cut = (hdr ? hdr.offsetHeight : 60) + 90, cur2 = null;
        $$('.msec', p).forEach(function (s) { if (s.getBoundingClientRect().top < cut) cur2 = s; });
        if (cur2) {
          spyOn(cur2.id);
          var a = $('a[aria-current="true"]', jrow);
          if (a && jrow.scrollWidth > jrow.clientWidth) jrow.scrollTo({ left: a.offsetLeft - jrow.clientWidth / 2 + a.offsetWidth / 2, behavior: 'auto' });
        } else { $$('a', jrow).forEach(function (a) { a.removeAttribute('aria-current'); }); if (jrow.scrollLeft) jrow.scrollTo({ left: 0, behavior: 'auto' }); }
      });
    }, { passive: true });
  }
})();
