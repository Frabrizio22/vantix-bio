// verify-popup.js - opens the batch verification page in a popup instead of navigating away.
// Any link to verify.html with ?product= / ?batch= / ?id= opens in a popup window on the current page.
// Plain "Verify" nav links (no batch), new-tab clicks and modified clicks (ctrl/cmd/shift) behave as normal links.
// The popup is an iframe of verify.html?...&embed=1 (embed mode hides the site header and footer).
(function () {
  if (window.__vxVerifyPopup) return;
  window.__vxVerifyPopup = true;

  var overlay, frame, closeBtn, fullLink, lastFocus, loading;

  function css() {
    var st = document.createElement('style');
    st.textContent =
      '.vxvp{position:fixed;inset:0;z-index:2147483000;display:none;align-items:center;justify-content:center;background:rgba(15,27,45,.55);-webkit-backdrop-filter:blur(3px);backdrop-filter:blur(3px)}' +
      '.vxvp.on{display:flex;animation:vxvpf .18s ease-out}' +
      '.vxvp-box{position:relative;width:min(560px,94vw);height:min(86vh,880px);background:#FAFAF7;border-radius:20px;overflow:hidden;box-shadow:0 30px 80px rgba(15,27,45,.35);display:flex;flex-direction:column;animation:vxvpu .22s ease-out}' +
      '.vxvp-bar{flex:none;display:flex;align-items:center;justify-content:space-between;padding:12px 14px 12px 20px;border-bottom:1px solid #D9D2BF;background:#FAFAF7;font:500 12px/1 "JetBrains Mono",ui-monospace,monospace;letter-spacing:.06em;text-transform:uppercase;color:#0F1B2D}' +
      '.vxvp-bar a{color:#3973B0;text-decoration:none;margin-right:6px}' +
      '.vxvp-x{appearance:none;border:0;background:#0F1B2D;color:#FAFAF7;width:34px;height:34px;border-radius:50%;font-size:20px;line-height:1;cursor:pointer;display:flex;align-items:center;justify-content:center}' +
      '.vxvp-x:focus-visible,.vxvp-bar a:focus-visible{outline:2px solid #3973B0;outline-offset:2px}' +
      '.vxvp iframe{flex:1;width:100%;border:0;background:#FAFAF7}' +
      '.vxvp-load{position:absolute;left:0;right:0;top:58px;bottom:0;display:flex;align-items:center;justify-content:center;background:#FAFAF7;font:500 12px "JetBrains Mono",ui-monospace,monospace;letter-spacing:.08em;text-transform:uppercase;color:#0F1B2D;transition:opacity .2s}' +
      'body.vxvp-lock{overflow:hidden}' +
      '@media(max-width:640px){.vxvp-box{width:100vw;height:100vh;height:100dvh;border-radius:0}.vxvp{align-items:stretch}}' +
      '@keyframes vxvpf{from{opacity:0}to{opacity:1}}@keyframes vxvpu{from{transform:translateY(16px);opacity:0}to{transform:none;opacity:1}}' +
      '@media(prefers-reduced-motion:reduce){.vxvp.on,.vxvp-box{animation:none}}';
    document.head.appendChild(st);
  }

  function build() {
    if (overlay) return;
    css();
    overlay = document.createElement('div');
    overlay.className = 'vxvp';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-label', 'Batch verification');
    overlay.innerHTML =
      '<div class="vxvp-box"><div class="vxvp-bar"><span>Batch verification</span><span style="display:flex;align-items:center"><a href="/verify.html" target="_blank" rel="noopener" id="vxvpFull">Open full page</a>' +
      '<button type="button" class="vxvp-x" aria-label="Close">&times;</button></span></div>' +
      '<div class="vxvp-load">Loading</div><iframe title="Batch verification results"></iframe></div>';
    document.body.appendChild(overlay);
    frame = overlay.querySelector('iframe');
    closeBtn = overlay.querySelector('.vxvp-x');
    fullLink = overlay.querySelector('#vxvpFull');
    loading = overlay.querySelector('.vxvp-load');
    closeBtn.addEventListener('click', close);
    overlay.addEventListener('click', function (e) { if (e.target === overlay) close(); });
    frame.addEventListener('load', function () { loading.style.opacity = '0'; setTimeout(function () { loading.style.display = 'none'; }, 220); });
  }

  function open(url) {
    build();
    var embed = new URL(url.href);
    embed.searchParams.set('embed', '1');
    var full = new URL(url.href);
    full.searchParams.delete('embed');
    lastFocus = document.activeElement;
    loading.style.display = 'flex'; loading.style.opacity = '1';
    frame.src = embed.pathname + embed.search;
    fullLink.href = full.pathname + full.search;
    overlay.classList.add('on');
    document.body.classList.add('vxvp-lock');
    closeBtn.focus();
    try { window.vxTrack && window.vxTrack('verify_popup_open', { page: location.pathname.slice(0, 60) }); } catch (e) {}
  }

  function close() {
    if (!overlay) return;
    overlay.classList.remove('on');
    document.body.classList.remove('vxvp-lock');
    frame.removeAttribute('src');
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && overlay && overlay.classList.contains('on')) close();
  });

  document.addEventListener('click', function (e) {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    var a = e.target.closest && e.target.closest('a[href]');
    if (!a || (a.target && a.target !== '_self')) return;
    var u;
    try { u = new URL(a.href, location.href); } catch (err) { return; }
    if (u.origin !== location.origin || !/\/verify\.html$/.test(u.pathname)) return;
    if (!(u.searchParams.get('product') || u.searchParams.get('batch') || u.searchParams.get('id'))) return;
    if (/[?&]embed=1/.test(location.search)) return;
    e.preventDefault();
    open(u);
  }, true); // capture phase: some links (shop cards) stop click propagation
})();
