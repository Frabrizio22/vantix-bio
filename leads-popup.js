/* Vantix Bio: homepage signup popup. 15% off the first order for an email address.
 * Runs on the browsing pages (home, shop, product, about, FAQ, shipping, kits, explainers), never on checkout or order pages.
 * Shows once per visitor: after 15 seconds of browsing in total (the clock carries across pages in the visit), or when a desktop visitor moves to leave (after 8 seconds).
 * Needs supabase/email_leads.sql (capture_lead function and the WELCOME15 promo code).
 * Not shown to people who already signed up, or who closed it in the last 30 days. */
(function () {
  'use strict';

  var SB_URL = 'https://mxhtxcpqgjmgwnurxguv.supabase.co';
  var SB_KEY = 'sb_publishable_S1BVqOpFWobGC2XiJV-E2w_BvJkkIkv';
  var CODE = 'WELCOME15';
  var DELAY_MS = 15000;
  var EXIT_MIN_MS = 8000;
  var QUIET_DAYS = 30;
  var CONSENT = 'By signing up you agree to receive marketing emails from Vantix Bio. Unsubscribe anytime.';

  function get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function set(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }

  if (get('vxLeadDone')) return;
  // The big popup stays off for people who are already on the list or already shopping: email and
  // creator-link visitors, anyone with items in their cart, and anyone who closed it in the last 30 days.
  var popupOff = false, closedRecently = false;
  try {
    var q = new URLSearchParams(location.search), m = (q.get('utm_medium') || '').toLowerCase();
    if (m === 'outreach' || m === 'retention' || q.get('code') || q.get('ref')) popupOff = true;
  } catch (e) {}
  try {
    var cart = JSON.parse(get('vantixCart') || '[]');
    if (cart && cart.length) popupOff = true;
  } catch (e) {}
  var closedAt = parseInt(get('vxLeadClosed') || '0', 10);
  if (closedAt && Date.now() - closedAt < QUIET_DAYS * 86400000) { popupOff = true; closedRecently = true; }

  var shown = false, root, lastFocus, tab, via = 'popup', cssDone = false;

  function css() {
    if (cssDone) return; cssDone = true;
    var s = document.createElement('style');
    s.textContent =
      '.vxp{position:fixed;inset:0;z-index:400;display:none;align-items:center;justify-content:center;padding:20px;background:rgba(10,22,40,.58);-webkit-backdrop-filter:blur(4px);backdrop-filter:blur(4px);opacity:0;transition:opacity .35s ease}' +
      '.vxp.on{display:flex}.vxp.in{opacity:1}.vxp.in .vxp-box{transform:none;opacity:1}' +
      '.vxp-box{position:relative;width:100%;max-width:420px;background:var(--bg,#FAFAF7);color:var(--text,#0F1B2D);border-radius:18px;padding:48px 36px 30px;box-shadow:0 28px 70px rgba(10,22,40,.38);font-family:"Geist",system-ui,sans-serif;text-align:center;transform:translateY(14px);opacity:0;transition:transform .5s cubic-bezier(.16,1,.3,1),opacity .4s ease}' +
      '.vxp-x{position:absolute;top:8px;right:8px;width:44px;height:44px;background:none;border:none;cursor:pointer;color:inherit;opacity:.62;font-size:24px;line-height:1;transition:opacity .25s}' +
      '.vxp-x:hover{opacity:1}' +
      '.vxp-k{font-family:"JetBrains Mono",monospace;font-size:10.5px;letter-spacing:.2em;text-transform:uppercase;color:var(--accent,#3973B0);margin:0 0 22px}' +
      '.vxp h3{font-family:"Fraunces",serif;font-size:34px;font-weight:300;line-height:1.12;letter-spacing:-.01em;margin:0 0 18px}' +
      '.vxp h3 .vxp-big{display:block;font-size:68px;line-height:1;letter-spacing:-.03em;margin-bottom:6px}' +
      '.vxp h3 .vxp-big span{font-size:.5em;letter-spacing:0;margin-left:.08em;font-style:italic}' +
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
      '.vxp p.vxp-fine{font-size:12.5px;line-height:1.6;color:rgba(15,27,45,.58);margin:20px 0 0;text-align:center}' +
      '.vxp p.vxp-ruo{font-family:"JetBrains Mono",monospace;font-size:10px;letter-spacing:.14em;text-transform:uppercase;color:rgba(15,27,45,.5);margin:14px 0 0}' +
      '.vxp-fine a{color:inherit;text-decoration:underline;text-underline-offset:2px}' +
      '.vxp p.vxp-err{color:#B3261E;font-size:13px;min-height:0;margin:0;text-align:center}' +
      '.vxp-hp{position:absolute;left:-9999px;width:1px;height:1px;opacity:0}' +
      '.vxp-code{font-family:"JetBrains Mono",monospace;font-size:24px;letter-spacing:.14em;text-align:center;border:1px dashed var(--accent,#3973B0);border-radius:12px;padding:18px 14px;margin:0 0 18px;background:#fff;color:var(--navy,#0F1B2D)}' +
      '.vxp button.vxp-copy{display:block;width:100%;margin:0 0 14px;padding:13px 24px;background:transparent;color:var(--navy,#0F1B2D);border:1.5px solid var(--hairline,#D9D2BF);border-radius:24px;font-size:14px;font-weight:600;letter-spacing:.03em;cursor:pointer;font-family:inherit;transition:all .25s ease}' +
      '.vxp button.vxp-copy:hover{border-color:var(--navy,#0F1B2D)}' +
      '.vxp-ok a.vxp-go{display:block;text-align:center;text-decoration:none;padding:15px 24px;background:var(--navy,#0F1B2D);color:#fff;border-radius:24px;font-size:14px;font-weight:600;letter-spacing:.03em;transition:background .35s cubic-bezier(.16,1,.3,1)}' +
      '.vxp-ok a.vxp-go:hover{background:var(--accent,#3973B0)}' +
      '@media(max-width:480px){.vxp-box{padding:40px 24px 22px}.vxp h3{font-size:28px}.vxp h3 .vxp-big{font-size:58px}}' +
      '.vxp-tab{position:fixed;left:16px;bottom:16px;z-index:350;display:none;padding:11px 18px;background:var(--navy,#0F1B2D);color:#fff;border:none;border-radius:24px;font-family:"Geist",system-ui,sans-serif;font-size:13px;font-weight:600;letter-spacing:.03em;cursor:pointer;box-shadow:0 6px 20px rgba(10,22,40,.28);transition:background .35s cubic-bezier(.16,1,.3,1)}' +
      '.vxp-tab.on{display:block}.vxp-tab:hover{background:var(--accent,#3973B0)}' +
      '.vxp-foot{max-width:520px;margin:0 auto 24px;padding:0 0 24px;border-bottom:1px solid rgba(255,255,255,.14);text-align:center;font-family:"Geist",system-ui,sans-serif;color:#E8EEF5}' +
      '.vxp-foot .vxp-k{color:rgba(232,238,245,.6);margin:0 0 10px}' +
      '.vxp-foot h4{font-family:"Fraunces",serif;font-weight:300;font-size:22px;line-height:1.25;margin:0 0 16px;color:#fff}' +
      '.vxp-foot form{display:flex;gap:8px;text-align:left}' +
      '.vxp-foot input[type=email]{flex:1;min-width:0;padding:12px 16px;border:1px solid rgba(255,255,255,.28);border-radius:24px;background:transparent;color:#fff;font-size:16px;font-family:inherit}' +
      '.vxp-foot input[type=email]::placeholder{color:rgba(232,238,245,.5)}' +
      '.vxp-foot input[type=email]:focus{outline:none;border-color:#fff}' +
      '.vxp-foot button{padding:12px 22px;border:none;border-radius:24px;background:#fff;color:#0B2545;font-size:14px;font-weight:600;cursor:pointer;font-family:inherit;white-space:nowrap}' +
      '.vxp-foot button:disabled{opacity:.6;cursor:default}' +
      '.vxp-foot p.vxp-fine{font-size:11.5px;line-height:1.6;color:rgba(232,238,245,.6);margin:12px 0 0}' +
      '.vxp-foot p.vxp-err{color:#FFB4AB;margin:8px 0 0;font-size:13px;line-height:1.4}' +
      '.vxp-foot .vxp-code{background:transparent;border-color:rgba(255,255,255,.4);color:#fff;font-size:20px;padding:12px;margin:0 0 10px}' +
      '@media(max-width:480px){.vxp-foot form{flex-direction:column}.vxp-tab{left:12px;bottom:12px}}' +
      '@media(prefers-reduced-motion:reduce){.vxp,.vxp-box{transition:none}}';
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
          '<h3 id="vxpT"><span class="vxp-big">15<span>%</span></span>off <em>your first order.</em></h3>' +
          '<hr class="vxp-rule">' +
          '<p>Independently tested batch reports,<br>restock notices and new arrivals.<br>Your code appears the moment you sign up.</p>' +
          '<form novalidate>' +
            '<input type="email" id="vxpE" autocomplete="email" inputmode="email" placeholder="Your email address" aria-label="Email address" required>' +
            '<input type="text" class="vxp-hp" name="website" tabindex="-1" autocomplete="off" aria-hidden="true">' +
            '<p class="vxp-err" id="vxpM" role="alert"></p>' +
            '<button type="submit" class="vxp-go">Get my 15% off</button>' +
          '</form>' +
          '<p class="vxp-fine">' + CONSENT + ' <a href="/privacy.html">Privacy Policy</a></p>' +
          '<p class="vxp-ruo">For laboratory research use only</p>' +
        '</div>' +
        '<div id="vxpOk" class="vxp-ok" style="display:none">' +
          '<p class="vxp-k">Your welcome code</p>' +
          '<h3>You&rsquo;re on <em>the list.</em></h3>' +
          '<hr class="vxp-rule">' +
          '<div class="vxp-code">' + CODE + '</div>' +
          '<p>Your 15% welcome discount is ready.<br>Saved on this device and applied at checkout.</p>' +
          '<button type="button" class="vxp-copy">Copy code</button>' +
          '<a class="vxp-go" href="/shop.html">Browse the catalog</a>' +
          '<p class="vxp-ruo">For laboratory research use only</p>' +
        '</div>' +
      '</div>';
    document.body.appendChild(root);

    root.querySelector('.vxp-x').addEventListener('click', close);
    root.addEventListener('click', function (e) { if (e.target === root) close(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && root.classList.contains('on')) close(); });
    root.querySelector('form').addEventListener('submit', submit);
    var cp = root.querySelector('.vxp-copy');
    cp.addEventListener('click', function () {
      var done = function () { cp.textContent = 'Copied'; setTimeout(function () { cp.textContent = 'Copy code'; }, 2000); };
      try { navigator.clipboard.writeText(CODE).then(done, function () { cp.textContent = CODE; }); } catch (e) { cp.textContent = CODE; }
    });
    // Keep keyboard focus inside the dialog while it is open.
    root.addEventListener('keydown', function (e) {
      if (e.key !== 'Tab') return;
      var f = Array.prototype.filter.call(root.querySelectorAll('button,a[href],input[type=email]'), function (n) { return n.offsetParent !== null && !n.disabled; });
      if (!f.length) return;
      var first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    });
  }

  // The age gate and the menu take priority; the clock only runs while neither is open.
  function blocked() {
    var gate = document.getElementById('ageGate'), menu = document.getElementById('menuOverlay');
    return !!((gate && gate.classList.contains('active')) || (menu && menu.classList.contains('active')));
  }

  function show(how) {
    if (shown || blocked()) return;
    via = how || 'popup';
    if (tab) tab.classList.remove('on');
    shown = true;
    lastFocus = document.activeElement;
    if (!root) build();
    root.classList.add('on');
    requestAnimationFrame(function () { requestAnimationFrame(function () { root.classList.add('in'); }); });
    // Phones: do not pop the keyboard over the offer before it has been read.
    var inp = root.querySelector('#vxpE');
    var touch = window.matchMedia && window.matchMedia('(pointer:coarse)').matches;
    if (inp && !touch) setTimeout(function () { inp.focus(); }, 350);
    else root.querySelector('.vxp-box').setAttribute('tabindex', '-1');
    try { (window.dataLayer = window.dataLayer || []).push({ event: 'signup_popup_shown' }); } catch (e) {}
  }

  function close() {
    root.classList.remove('in'); root.classList.remove('on');
    if (!get('vxLeadDone')) { set('vxLeadClosed', String(Date.now())); popupOff = true; shown = false; showTab(); }
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
    capture(val, via === 'tab' ? 'popup-tab' : 'popup', function () {
      onSuccess();
      root.querySelector('#vxpForm').style.display = 'none';
      root.querySelector('#vxpOk').style.display = 'block';
      var c2 = root.querySelector('.vxp-copy'); if (c2) c2.focus();
    }, function () {
      btn.disabled = false; btn.textContent = 'Get my 15% off';
      msg.textContent = 'Something went wrong. Please try again, or email support@vantixbio.com.';
    });
  }

  function capture(email, source, ok, fail) {
    fetch(SB_URL + '/rest/v1/rpc/capture_lead', {
      method: 'POST',
      headers: { apikey: SB_KEY, Authorization: 'Bearer ' + SB_KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify({ p_email: email, p_source: source, p_consent: CONSENT, p_page: location.pathname })
    }).then(function (r) {
      if (!r.ok) throw new Error('bad');
      ok();
    }).catch(fail);
  }

  function onSuccess() {
    set('vxLeadDone', '1');
    set('vxLeadCode', CODE);
    shown = true;                                  // no more popups this visit
    try { if (!sessionStorage.getItem('vantixPromoCode')) sessionStorage.setItem('vantixPromoCode', CODE); } catch (e) {}
    try { (window.dataLayer = window.dataLayer || []).push({ event: 'email_signup', signup_source: via }); } catch (e) {}
    if (tab) tab.classList.remove('on');
    var ft = document.querySelector('.vxp-foot');
    if (ft) ft.innerHTML = '<p class="vxp-k">You&rsquo;re on the list</p><div class="vxp-code">' + CODE + '</div><p class="vxp-fine">Your 15% welcome discount is saved on this device and applied at checkout.</p>';
  }

  // Quiet ways back in for someone who closed the popup and changed their mind.
  function showTab() {
    if (get('vxLeadDone')) return;
    css();
    if (!tab) {
      tab = document.createElement('button');
      tab.type = 'button';
      tab.className = 'vxp-tab';
      tab.textContent = '15% off';
      tab.setAttribute('aria-label', 'Get 15% off your first order');
      tab.addEventListener('click', function () { lastFocus = tab; show('tab'); });
      document.body.appendChild(tab);
    }
    tab.classList.add('on');
  }

  function initFooter() {
    var fs = document.querySelectorAll('footer');
    var ft = fs.length ? fs[fs.length - 1] : null;
    if (!ft || ft.querySelector('.vxp-foot')) return;
    css();
    var box = document.createElement('div');
    box.className = 'vxp-foot';
    box.innerHTML =
      '<p class="vxp-k">The Vantix Bio list</p>' +
      '<h4>Batch reports and restock notices.<br>15% off your first order.</h4>' +
      '<form novalidate>' +
        '<input type="email" autocomplete="email" inputmode="email" placeholder="Your email address" aria-label="Email address" required>' +
        '<input type="text" class="vxp-hp" name="website" tabindex="-1" autocomplete="off" aria-hidden="true">' +
        '<button type="submit">Join the list</button>' +
      '</form>' +
      '<p class="vxp-err" role="alert"></p>' +
      '<p class="vxp-fine">' + CONSENT + ' <a href="/privacy.html" style="color:inherit;text-decoration:underline">Privacy Policy</a></p>';
    ft.insertBefore(box, ft.firstChild);
    var form = box.querySelector('form'), em = form.querySelector('input[type=email]'), err = box.querySelector('.vxp-err'), btn = form.querySelector('button');
    form.addEventListener('submit', function (ev) {
      ev.preventDefault();
      err.textContent = '';
      if (form.querySelector('input[name=website]').value) return;
      var val = (em.value || '').trim();
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(val)) { err.textContent = 'Please enter a valid email address.'; em.focus(); return; }
      btn.disabled = true; btn.textContent = 'One moment…';
      via = 'footer';
      capture(val, 'footer', onSuccess, function () {
        btn.disabled = false; btn.textContent = 'Join the list';
        err.textContent = 'Something went wrong. Please try again, or email support@vantixbio.com.';
      });
    });
  }

  // The clock counts visible browsing time across pages in this visit and restarts whenever the age gate or menu closes.
  var visibleMs = 0, wasBlocked = false;
  try { visibleMs = parseInt(sessionStorage.getItem('vxLeadMs') || '0', 10) || 0; } catch (e) {}
  var timer = popupOff ? null : setInterval(function () {
    if (shown) { clearInterval(timer); return; }
    if (blocked()) { visibleMs = 0; wasBlocked = true; }
    else if (!document.hidden) { visibleMs += 1000; }
    try { sessionStorage.setItem('vxLeadMs', String(visibleMs)); } catch (e) {}
    if (visibleMs >= DELAY_MS) show();
  }, 1000);
  document.addEventListener('mouseout', function (e) {
    if (!popupOff && !e.relatedTarget && e.clientY <= 0 && visibleMs >= EXIT_MIN_MS) show();
  });

  initFooter();
  if (closedRecently) showTab();
})();
