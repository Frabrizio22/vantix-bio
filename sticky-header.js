/* Sticky header for inner pages: same behavior as the home page. Slides away on scroll down, returns on scroll up, always visible at the top. Fixed (not sticky) because these pages set overflow-x:hidden on html/body, which breaks position:sticky. */
(function () {
  var nav = document.querySelector('nav.header-nav');
  if (!nav || document.getElementById('siteHeader')) return;
  var wrap = nav.parentElement;
  if (!wrap || wrap === document.body) return;
  var bg = getComputedStyle(document.body).backgroundColor;
  if (!bg || bg === 'rgba(0, 0, 0, 0)' || bg === 'transparent') bg = '#FAFAF7';
  var st = document.createElement('style');
  st.textContent = '.vx-hdr-space{display:block}.vx-hdr{position:fixed;top:0;left:0;right:0;z-index:100;background:' + bg + ';transition:transform .3s ease,box-shadow .2s ease}.vx-hdr.is-hidden{transform:translateY(-100%)}.vx-hdr.is-stuck{box-shadow:0 2px 12px rgba(15,27,45,.10)}@media(prefers-reduced-motion:reduce){.vx-hdr{transition:none}}';
  document.head.appendChild(st);
  var space = document.createElement('div'), hdr = document.createElement('header');
  space.className = 'vx-hdr-space'; hdr.className = 'vx-hdr'; hdr.id = 'siteHeader';
  wrap.parentNode.insertBefore(space, wrap);
  hdr.appendChild(wrap); space.appendChild(hdr);
  var size = function () { space.style.height = hdr.offsetHeight + 'px'; };
  size(); window.addEventListener('resize', size); window.addEventListener('load', size);
  var menu = document.getElementById('menuOverlay'), last = Math.max(0, window.pageYOffset), ticking = false;
  var update = function () {
    var y = Math.max(0, window.pageYOffset), d = y - last;
    hdr.classList.toggle('is-stuck', y > 8);
    if ((menu && menu.classList.contains('active')) || y <= 8) { hdr.classList.remove('is-hidden'); last = y; }
    else if (Math.abs(d) > 6) { hdr.classList.toggle('is-hidden', d > 0 && y > hdr.offsetHeight); last = y; }
    ticking = false;
  };
  window.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
})();
