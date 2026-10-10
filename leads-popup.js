/* Vantix Bio: homepage signup popup. 15% off the first order for an email address.
 * Shows once per visitor: after 20 seconds, or when a desktop visitor moves to leave (after 8 seconds).
 * Needs supabase/email_leads.sql (capture_lead function and the WELCOME15 promo code).
 * Not shown to people who already signed up, or who closed it in the last 30 days. */
(function () {
  'use strict';

  var SB_URL = 'https://mxhtxcpqgjmgwnurxguv.supabase.co';
  var SB_KEY = 'sb_publishable_S1BVqOpFWobGC2XiJV-E2w_BvJkkIkv';
  var CODE = 'WELCOME15';
  var DELAY_MS = 20000;
  var EXIT_MIN_MS = 8000;
  var QUIET_DAYS = 30;
  var CONSENT = 'By signing up you agree to receive marketing emails from Vantix Bio. Unsubscribe anytime.';

  function get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function set(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }

  if (get('vxLeadDone')) return;
  var closedAt = parseInt(get('vxLeadClosed') || '0', 10);
  if (closedAt && Date.now() - closedAt < QUIET_DAYS * 86400000) return;

  var shown = false, root, lastFocus;

  function css() {
    var s = document.createElement('style');
    s.textContent =
      '.vxp{position:fixed;inset:0;z-index:400;display:none;align-items:center;justify-content:center;padding:20px;background:rgba(10,22,40,.72)}' +
      '.vxp.on{display:flex}' +
      '.vxp-box{position:relative;width:100%;max-width:440px;background:var(--bg,#FAFAF7);color:var(--text,#0F1B2D);border-radius:16px;padding:40px 32px 28px;box-shadow:0 24px 60px rgba(10,22,40,.35);font-family:"Geist",system-ui,sans-serif}' +
      '.vxp-x{position:absolute;top:10px;right:10px;width:44px;height:44px;background:none;border:none;cursor:pointer;color:inherit;opacity:.6;font-size:26px;line-height:1}' +
      '.vxp-x:hover{opacity:1}' +
      '.vxp-k{font-family:"JetBrains Mono",monospace;font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:var(--accent,#3973B0);margin:0 0 10px}' +
      '.vxp h3{font-family:"Fraunces",serif;font-size:30px;font-weight:300;line-height:1.15;margin:0 0 12px}' +
      '.vxp p{margin:0 0 20px;line-height:1.55;color:rgba(10,22,40,.72);font-size:15px}' +
      '.vxp form{display:flex;flex-direction:column;gap:12px}' +
      '.vxp input[type=email]{padding:14px 16px;border:1px solid var(--hairline,#D9D2BF);border-radius:10px;font-size:16px;font-family:inherit;background:#fff;color:inherit}' +
      '.vxp input[type=email]:focus{outline:none;border-color:var(--accent,#3973B0)}' +
      '.vxp button.vxp-go{padding:14px 24px;background:var(--navy,#0F1B2D);color:#fff;border:none;border-radius:10px;font-size:15px;font-weight:600;cursor:pointer;font-family:inherit}' +
      '.vxp button.vxp-go:hover{background:var(--accent,#3973B0)}' +
      '.vxp button.vxp-go:disabled{opacity:.6;cursor:default}' +
      '.vxp p.vxp-fine{font-size:12px;line-height:1.5;color:rgba(10,22,40,.55);margin:14px 0 0}' +
      '.vxp-fine a{color:inherit}' +
      '.vxp p.vxp-err{color:#B3261E;font-size:13px;min-height:0;margin:0}' +
      '.vxp-hp{position:absolute;left:-9999px;width:1px;height:1px;opacity:0}' +
      '.vxp-code{font-family:"JetBrains Mono",monospace;font-size:22px;letter-spacing:.08em;text-align:center;border:1px dashed var(--accent,#3973B0);border-radius:10px;padding:14px;margin:0 0 16px;background:#fff}' +
      '.vxp-ok a.vxp-go{display:block;text-align:center;text-decoration:none;padding:14px 24px;background:var(--navy,#0F1B2D);color:#fff;border-radius:10px;font-size:15px;font-weight:600}' +
      '@media(max-width:480px){.vxp-box{padding:36px 22px 22px}.vxp h3{font-size:26px}}';
    document.head.appendChild(s);
  }

  function build() {
    css();
    root = document.createElement('div');
    root.className = 'vxp';
    root.setAttribute('role', 'dialog');
    root.setAttribute('aria-modal', 'true');
    root.setAttribute('aria-labelledby', 'vxpT');
    root.innerHTML =
      '<div class="vxp-box">' +
        '<button type="button" class="vxp-x" aria-label="Close">&times;</button>' +
        '<div id="vxpForm">' +
          '<p class="vxp-k">Vantix Bio</p>' +
          '<h3 id="vxpT">15% off your first order</h3>' +
          '<p>Join our email list for batch testing updates and offers. Enter your email and your code appears right away.</p>' +
          '<form novalidate>' +
            '<input type="email" id="vxpE" autocomplete="email" inputmode="email" placeholder="you@example.com" aria-label="Email address" required>' +
            '<input type="text" class="vxp-hp" name="website" tabindex="-1" autocomplete="off" aria-hidden="true">' +
            '<p class="vxp-err" id="vxpM" role="alert"></p>' +
            '<button type="submit" class="vxp-go">Get my 15% off</button>' +
          '</form>' +
          '<p class="vxp-fine">' + CONSENT + ' <a href="privacy.html">Privacy</a>. For laboratory research use only.</p>' +
        '</div>' +
        '<div id="vxpOk" class="vxp-ok" style="display:none">' +
          '<p class="vxp-k">You are on the list</p>' +
          '<h3>Your code</h3>' +
          '<div class="vxp-code">' + CODE + '</div>' +
          '<p>Enter it at checkout for 15% off your order.</p>' +
          '<a class="vxp-go" href="shop.html">Shop the catalog</a>' +
        '</div>' +
      '</div>';
    document.body.appendChild(root);

    root.querySelector('.vxp-x').addEventListener('click', close);
    root.addEventListener('click', function (e) { if (e.target === root) close(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && root.classList.contains('on')) close(); });
    root.querySelector('form').addEventListener('submit', submit);
  }

  // The age gate and the menu take priority; the clock only runs while neither is open.
  function blocked() {
    var gate = document.getElementById('ageGate'), menu = document.getElementById('menuOverlay');
    return !!((gate && gate.classList.contains('active')) || (menu && menu.classList.contains('active')));
  }

  function show() {
    if (shown || blocked()) return;
    shown = true;
    lastFocus = document.activeElement;
    if (!root) build();
    root.classList.add('on');
    var inp = root.querySelector('#vxpE');
    if (inp) setTimeout(function () { inp.focus(); }, 50);
    try { (window.dataLayer = window.dataLayer || []).push({ event: 'signup_popup_shown' }); } catch (e) {}
  }

  function close() {
    root.classList.remove('on');
    if (!get('vxLeadDone')) set('vxLeadClosed', String(Date.now()));
    if (lastFocus && lastFocus.focus) { try { lastFocus.focus(); } catch (e) {} }
  }

  function submit(ev) {
    ev.preventDefault();
    var f = ev.target, em = f.querySelector('#vxpE'), msg = f.querySelector('#vxpM'), btn = f.querySelector('.vxp-go');
    var val = (em.value || '').trim();
    msg.textContent = '';
    if (f.querySelector('input[name=website]').value) return;            // bots fill the hidden field
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(val)) { msg.textContent = 'Please enter a valid email address.'; em.focus(); return; }
    btn.disabled = true; btn.textContent = 'One moment…';
    fetch(SB_URL + '/rest/v1/rpc/capture_lead', {
      method: 'POST',
      headers: { apikey: SB_KEY, Authorization: 'Bearer ' + SB_KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify({ p_email: val, p_source: 'popup', p_consent: CONSENT, p_page: location.pathname })
    }).then(function (r) {
      if (!r.ok) throw new Error('bad');
      set('vxLeadDone', '1');
      try { if (!sessionStorage.getItem('vantixPromoCode')) sessionStorage.setItem('vantixPromoCode', CODE); } catch (e) {}
      try { (window.dataLayer = window.dataLayer || []).push({ event: 'email_signup', signup_source: 'popup' }); } catch (e) {}
      root.querySelector('#vxpForm').style.display = 'none';
      root.querySelector('#vxpOk').style.display = 'block';
    }).catch(function () {
      btn.disabled = false; btn.textContent = 'Get my 15% off';
      msg.textContent = 'Something went wrong. Please try again, or email support@vantixbio.com.';
    });
  }

  var visibleMs = 0;
  var timer = setInterval(function () {
    if (shown) { clearInterval(timer); return; }
    if (!blocked()) visibleMs += 1000;
    if (visibleMs >= DELAY_MS) show();
  }, 1000);
  document.addEventListener('mouseout', function (e) {
    if (!e.relatedTarget && e.clientY <= 0 && visibleMs >= EXIT_MIN_MS) show();
  });
})();
