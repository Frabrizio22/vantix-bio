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
  // Skip people who are already on the list or already shopping: email and creator-link visitors,
  // and anyone with items in their cart.
  try {
    var q = new URLSearchParams(location.search), m = (q.get('utm_medium') || '').toLowerCase();
    if (m === 'outreach' || m === 'retention' || q.get('code') || q.get('ref')) return;
  } catch (e) {}
  try {
    var cart = JSON.parse(get('vantixCart') || '[]');
    if (cart && cart.length) return;
  } catch (e) {}
  var closedAt = parseInt(get('vxLeadClosed') || '0', 10);
  if (closedAt && Date.now() - closedAt < QUIET_DAYS * 86400000) return;

  var shown = false, root, lastFocus;

  function css() {
    var s = document.createElement('style');
    s.textContent =
      '.vxp{position:fixed;inset:0;z-index:400;display:none;align-items:center;justify-content:center;padding:20px;background:rgba(10,22,40,.72);-webkit-backdrop-filter:blur(3px);backdrop-filter:blur(3px)}' +
      '.vxp.on{display:flex}' +
      '.vxp-box{position:relative;width:100%;max-width:420px;background:var(--bg,#FAFAF7);color:var(--text,#0F1B2D);border-radius:18px;padding:48px 36px 30px;box-shadow:0 28px 70px rgba(10,22,40,.38);font-family:"Geist",system-ui,sans-serif;text-align:center}' +
      '.vxp-x{position:absolute;top:8px;right:8px;width:44px;height:44px;background:none;border:none;cursor:pointer;color:inherit;opacity:.45;font-size:24px;line-height:1;transition:opacity .25s}' +
      '.vxp-x:hover{opacity:1}' +
      '.vxp-k{font-family:"JetBrains Mono",monospace;font-size:10.5px;letter-spacing:.2em;text-transform:uppercase;color:var(--accent,#3973B0);margin:0 0 22px}' +
      '.vxp h3{font-family:"Fraunces",serif;font-size:34px;font-weight:300;line-height:1.12;letter-spacing:-.01em;margin:0 0 18px}' +
      '.vxp h3 em{font-style:italic;font-weight:300}' +
      '.vxp-rule{width:36px;height:1px;background:var(--hairline,#D9D2BF);margin:0 auto 18px;border:0}' +
      '.vxp p{margin:0 0 26px;line-height:1.65;color:rgba(15,27,45,.68);font-size:14.5px}' +
      '.vxp form{display:flex;flex-direction:column;gap:12px;text-align:left}' +
      '.vxp input[type=email]{padding:15px 18px;border:1px solid var(--hairline,#D9D2BF);border-radius:24px;font-size:16px;font-family:inherit;background:#fff;color:inherit;text-align:center;transition:border-color .25s}' +
      '.vxp input[type=email]::placeholder{color:rgba(15,27,45,.38)}' +
      '.vxp input[type=email]:focus{outline:none;border-color:var(--accent,#3973B0)}' +
      '.vxp button.vxp-go{padding:15px 24px;background:var(--navy,#0F1B2D);color:#fff;border:none;border-radius:24px;font-size:14px;font-weight:600;letter-spacing:.03em;cursor:pointer;font-family:inherit;box-shadow:0 2px 8px rgba(15,27,45,.08);transition:background .35s cubic-bezier(.16,1,.3,1)}' +
      '.vxp button.vxp-go:hover{background:var(--accent,#3973B0)}' +
      '.vxp button.vxp-go:disabled{opacity:.6;cursor:default}' +
      '.vxp p.vxp-fine{font-size:11.5px;line-height:1.6;color:rgba(15,27,45,.5);margin:20px 0 0;text-align:center}' +
      '.vxp p.vxp-ruo{font-family:"JetBrains Mono",monospace;font-size:9.5px;letter-spacing:.14em;text-transform:uppercase;color:rgba(15,27,45,.4);margin:14px 0 0}' +
      '.vxp-fine a{color:inherit;text-decoration:underline;text-underline-offset:2px}' +
      '.vxp p.vxp-err{color:#B3261E;font-size:13px;min-height:0;margin:0;text-align:center}' +
      '.vxp-hp{position:absolute;left:-9999px;width:1px;height:1px;opacity:0}' +
      '.vxp-code{font-family:"JetBrains Mono",monospace;font-size:24px;letter-spacing:.14em;text-align:center;border:1px dashed var(--accent,#3973B0);border-radius:12px;padding:18px 14px;margin:0 0 18px;background:#fff;color:var(--navy,#0F1B2D)}' +
      '.vxp-ok a.vxp-go{display:block;text-align:center;text-decoration:none;padding:15px 24px;background:var(--navy,#0F1B2D);color:#fff;border-radius:24px;font-size:14px;font-weight:600;letter-spacing:.03em;transition:background .35s cubic-bezier(.16,1,.3,1)}' +
      '.vxp-ok a.vxp-go:hover{background:var(--accent,#3973B0)}' +
      '@media(max-width:480px){.vxp-box{padding:42px 24px 24px}.vxp h3{font-size:30px}}';
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
          '<p class="vxp-k">The Vantix Bio list</p>' +
          '<h3 id="vxpT">15% off<br><em>your first order.</em></h3>' +
          '<hr class="vxp-rule">' +
          '<p>Join for new batch reports and<br>restock notices. Your code appears<br>the moment you sign up.</p>' +
          '<form novalidate>' +
            '<input type="email" id="vxpE" autocomplete="email" inputmode="email" placeholder="Your email address" aria-label="Email address" required>' +
            '<input type="text" class="vxp-hp" name="website" tabindex="-1" autocomplete="off" aria-hidden="true">' +
            '<p class="vxp-err" id="vxpM" role="alert"></p>' +
            '<button type="submit" class="vxp-go">Reveal my code</button>' +
          '</form>' +
          '<p class="vxp-fine">' + CONSENT + '<br>See our <a href="privacy.html">Privacy Policy</a>.</p>' +
          '<p class="vxp-ruo">For laboratory research use only</p>' +
        '</div>' +
        '<div id="vxpOk" class="vxp-ok" style="display:none">' +
          '<p class="vxp-k">Welcome to the list</p>' +
          '<h3>Your <em>code.</em></h3>' +
          '<hr class="vxp-rule">' +
          '<div class="vxp-code">' + CODE + '</div>' +
          '<p>Enter it at checkout.<br>Valid on first orders only.</p>' +
          '<a class="vxp-go" href="shop.html">Browse the catalog</a>' +
          '<p class="vxp-ruo">For laboratory research use only</p>' +
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
      btn.disabled = false; btn.textContent = 'Reveal my code';
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
