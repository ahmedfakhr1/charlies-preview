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

  // reveal on scroll, text only (content is visible by default; the js class on <html> hides it until it enters)
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

  // menu page: the sticky row marks the part of the menu that is on screen
  var jrow = $('.mjump .row');
  if (jrow) {
    var links = $$('a', jrow);
    var groups = $$('.mgroup');
    var tick = false;
    var spy = function () {
      tick = false;
      var cut = (hdr ? hdr.offsetHeight : 60) + 110, cur = null;
      groups.forEach(function (g) { if (g.getBoundingClientRect().top < cut) cur = g; });
      links.forEach(function (a) {
        var on = !!cur && a.getAttribute('href') === '#' + cur.id;
        if (on) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current');
        if (on && jrow.scrollWidth > jrow.clientWidth) jrow.scrollTo({ left: a.offsetLeft - jrow.clientWidth / 2 + a.offsetWidth / 2, behavior: 'auto' });
      });
    };
    window.addEventListener('scroll', function () { if (!tick) { tick = true; requestAnimationFrame(spy); } }, { passive: true });
    spy();
  }
})();
