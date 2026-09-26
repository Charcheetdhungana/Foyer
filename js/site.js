/* ============================================================
   Foyer — shared page behaviour
   Header shadow, the phone menus (public header and portal
   sidebar) and a header that knows whether you are logged in.
   Load after db.js.
   ============================================================ */
(function () {

  /* ---------- public header ---------- */
  var header = document.getElementById('siteHeader');
  if (header) {
    window.addEventListener('scroll', function () {
      header.classList.toggle('scrolled', window.scrollY > 10);
    });

    var toggle = header.querySelector('.nav-toggle');
    if (toggle) {
      toggle.addEventListener('click', function () {
        var open = header.classList.toggle('open');
        toggle.setAttribute('aria-expanded', open);
        toggle.textContent = open ? 'Close' : 'Menu';
      });
      header.querySelectorAll('.site-nav a').forEach(function (a) {
        a.addEventListener('click', function () {
          header.classList.remove('open');
          toggle.setAttribute('aria-expanded', 'false');
          toggle.textContent = 'Menu';
        });
      });
    }

    /* Swap "Log in / Sign up" for "My account / Log out" when signed in. */
    var navLogin = document.getElementById('navLogin');
    var navCta = document.getElementById('navCta');
    if (window.Foyer && navLogin && navCta) {
      Foyer.ready.then(function () {
        var user = Foyer.currentUser();
        if (!user) return;
        navLogin.innerHTML = '<a href="#" id="navOut">Log out</a>';
        navCta.innerHTML = '<a class="nav-cta" href="' + Foyer.homeFor(user) + '">My account</a>';
        document.getElementById('navOut').addEventListener('click', function (e) {
          e.preventDefault();
          Foyer.logout();
          location.reload();
        });
      });
    }
  }

  /* ---------- portal sidebar on phones ---------- */
  var side = document.querySelector('.side');
  var menuBtn = side && side.querySelector('.menu-btn');
  if (menuBtn) {
    menuBtn.addEventListener('click', function () {
      var open = side.classList.toggle('open');
      menuBtn.setAttribute('aria-expanded', open);
      menuBtn.textContent = open ? 'Close' : 'Menu';
    });
    side.addEventListener('click', function (e) {
      if (e.target.closest('.nav, a') && side.classList.contains('open')) {
        side.classList.remove('open');
        menuBtn.setAttribute('aria-expanded', 'false');
        menuBtn.textContent = 'Menu';
      }
    });
  }

  /* ---------- footer year ---------- */
  document.querySelectorAll('[data-year]').forEach(function (el) { el.textContent = new Date().getFullYear(); });
})();
