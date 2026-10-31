/* Vantix Bio analytics layer. Loaded early in <head> on every page.
 *  1. Forwards selected dataLayer events to GA4 (gtag) with their ecommerce data.
 *     GTM keeps reading the same dataLayer events for Meta; purchase is NEVER forwarded
 *     (GA4 purchase comes from the checkout worker only after payment is confirmed).
 *  2. Adds view_item / add_to_cart on product pages, cta/verify/contact clicks, lead forms.
 *  3. Saves first-touch source (localStorage) so checkout can store it on the order.
 * No names, emails or other personal data are ever sent from here. */
(function () {
  'use strict';
  var dl = (window.dataLayer = window.dataLayer || []);
  function gt() { if (typeof window.gtag === 'function') { try { window.gtag.apply(null, arguments); } catch (e) {} } }

  // ---------- 1. dataLayer -> GA4 forwarder ----------
  var FORWARD = {
    add_to_cart: 'add_to_cart', remove_from_cart: 'remove_from_cart', view_item: 'view_item',
    view_item_list: 'view_item_list', begin_checkout: 'begin_checkout', add_payment_info: 'add_payment_info',
    apply_promo: 'apply_promo', place_order_clicked: 'place_order_clicked', signup_popup_shown: 'signup_popup_shown',
    email_signup: 'generate_lead', verify_lookup: 'verify_lookup', cta_click: 'cta_click',
    generate_lead: 'generate_lead', checkout_error: 'checkout_error'
  };
  // GA4 item names must match the catalog (and the server-side purchase) so item reports line up. Keyed by SKU = item_id.
  var ITEM_NAMES = {"VX-CJC-5":"CJC-1295 (no DAC) 5mg","VX-IPA-5":"Ipa 5mg","VX-TB-10":"TB-500 10mg","VX-BAC-10":"VX-BW 10mL","VX-BPC-10":"BPC-157 10mg","VX-KIT-GH":"CJC-1295 + Ipamorelin Bundle (5mg + 5mg)","VX-GHK-100":"GHK-Cu 100mg","VX-MOTS-10":"MOTS-C 10mg","VX-RETA-20":"VX-3R 20mg","VX-SEMA-10":"VX-1S 10mg","VX-TESA-10":"Tesa 10mg","VX-TIRZ-30":"VX-2T 30mg","VX-W-TB-10":"TB-500 10mg 10-Vial Kit","VX-KIT-MITO":"NAD+ + MOTS-C Bundle (1000mg + 10mg)","VX-NAD-1000":"NAD+ 1000mg","VX-W-BPC-10":"BPC-157 10mg 10-Vial Kit","VX-W-GHK-100":"GHK-Cu 100mg 10-Vial Kit","VX-W-MOTS-10":"MOTS-c 10mg 10-Vial Kit","VX-W-RETA-20":"VX-3R 20mg 10-Vial Kit","VX-W-TESA-10":"Tesamorelin 10mg 10-Vial Kit","VX-W-TIRZ-30":"VX-2T 30mg 10-Vial Kit","VX-KIT-REPAIR":"BPC-157 + TB-500 Bundle (10mg + 10mg)","VX-W-NAD-1000":"NAD+ 1000mg 10-Vial Kit","VX-KIT-NEXTGEN":"VX-2T + VX-3R Bundle (30mg + 20mg)"};
  function normItems(items) {
    if (!Array.isArray(items)) return items;
    return items.map(function (it) {
      if (!it || typeof it !== 'object') return it;
      var c = {}; for (var k in it) c[k] = it[k];
      if (c.item_id && ITEM_NAMES[c.item_id]) c.item_name = ITEM_NAMES[c.item_id];
      return c;
    });
  }
  var SKIP = { event: 1, gtm: 1, ecommerce: 1, 'gtm.uniqueEventId': 1 };
  function forward(obj) {
    try {
      if (!obj || typeof obj !== 'object' || Array.isArray(obj) || typeof obj.length === 'number' || !obj.event) return;
      var name = FORWARD[obj.event];
      if (!name || obj.__vxFwd) return;
      var p = {};
      var ec = obj.ecommerce;
      if (ec && typeof ec === 'object') { for (var k in ec) p[k] = ec[k]; }
      for (var key in obj) { if (!SKIP[key] && key.indexOf('gtm.') !== 0) p[key] = obj[key]; }
      if (p.items) p.items = normItems(p.items);
      if (obj.event === 'email_signup') { p.lead_type = 'email_signup'; p.method = obj.signup_source || 'unknown'; delete p.signup_source; }
      gt('event', name, p);
    } catch (e) {}
  }
  var origPush = dl.push;
  dl.push = function () {
    for (var i = 0; i < arguments.length; i++) forward(arguments[i]);
    return origPush.apply(dl, arguments);
  };
  // Exposed for pages that want to push an event (goes to dataLayer, so GTM and GA both see it).
  window.vxTrack = function (event, params) { var o = { event: event }; for (var k in (params || {})) o[k] = params[k]; dl.push(o); };

  // ---------- 2. First-touch / last-touch source ----------
  var LS = null; try { LS = window.localStorage; } catch (e) {}
  function lsGet(k) { try { return LS && LS.getItem(k); } catch (e) { return null; } }
  function lsSet(k, v) { try { LS && LS.setItem(k, v); } catch (e) {} }
  function inAppBrowser() {
    var ua = navigator.userAgent || '';
    if (/musical_ly|BytedanceWebview|TikTok|trill/i.test(ua)) return 'tiktok';
    if (/Instagram/i.test(ua)) return 'instagram';
    if (/FBAN|FBAV|FB_IAB/i.test(ua)) return 'facebook';
    if (/Snapchat/i.test(ua)) return 'snapchat';
    if (/Pinterest/i.test(ua)) return 'pinterest';
    if (/Twitter|X-iOS/i.test(ua)) return 'x';
    return '';
  }
  function touch() {
    var q = new URLSearchParams(location.search), t = { ts: Date.now(), landing: location.pathname };
    ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'code', 'ref'].forEach(function (k) { var v = q.get(k); if (v) t[k] = String(v).slice(0, 80); });
    ['gclid', 'fbclid', 'ttclid'].forEach(function (k) { if (q.get(k)) t[k] = 1; });
    var ra = ''; try { if (document.referrer) { var u = new URL(document.referrer); if (u.hostname !== location.hostname) ra = u.hostname.replace(/^www\./, ''); } } catch (e) {}
    if (ra) t.referrer = ra;
    var ia = inAppBrowser(); if (ia) t.in_app = ia;
    return t;
  }
  var hasSignal = function (t) { return !!(t.utm_source || t.utm_medium || t.utm_campaign || t.code || t.ref || t.referrer || t.gclid || t.fbclid || t.ttclid || t.in_app); };
  try {
    var cur = touch();
    var first = lsGet('vxFirstTouch'), firstObj = null;
    try { firstObj = first ? JSON.parse(first) : null; } catch (e) {}
    var stale = firstObj && (Date.now() - (firstObj.ts || 0) > 90 * 864e5);
    if (!firstObj || stale) { lsSet('vxFirstTouch', JSON.stringify(cur)); firstObj = cur; }
    else if (!hasSignal(firstObj) && hasSignal(cur)) { lsSet('vxFirstTouch', JSON.stringify(cur)); firstObj = cur; }   // upgrade an empty "direct" first touch
    if (hasSignal(cur)) { try { sessionStorage.setItem('vxLastTouch', JSON.stringify(cur)); } catch (e) {} }
    var ia = inAppBrowser();
    if (ia) gt('set', 'user_properties', { in_app_browser: ia });
  } catch (e) {}
  window.vxTouches = function () {
    var f = null, l = null;
    try { f = JSON.parse(lsGet('vxFirstTouch') || 'null'); } catch (e) {}
    try { l = JSON.parse(sessionStorage.getItem('vxLastTouch') || 'null'); } catch (e) {}
    return { first: f, last: l };
  };

  // ---------- 3. Page behaviours (need the DOM) ----------
  function onReady(fn) { if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fn); else fn(); }
  onReady(function () {
    var path = location.pathname;

    // Product pages: view_item + add_to_cart (these pages have their own addToCart() that leaves the page at once)
    if (/\/products\/[^/]+\.html$/.test(path)) {
      var src = '', m;
      var scripts = document.getElementsByTagName('script');
      for (var i = 0; i < scripts.length; i++) { if (!scripts[i].src) src += scripts[i].textContent; }
      m = /sku\s*:\s*'([^']+)'\s*,\s*name\s*:\s*'([^']+)'\s*,\s*price\s*:\s*([\d.]+)/.exec(src);
      if (m) {
        var item = { item_id: m[1], item_name: m[2], price: parseFloat(m[3]), quantity: 1 };
        window.vxTrack('view_item', { ecommerce: { currency: 'USD', value: item.price, items: [item] } });
        var orig = window.addToCart;
        if (typeof orig === 'function') {
          window.addToCart = function () {
            window.vxTrack('add_to_cart', { ecommerce: { currency: 'USD', value: item.price, items: [item] } });
            return orig.apply(this, arguments);
          };
        }
      }
    }

    // Click tracking (delegated): blog -> shop, verify, wholesale, contact email
    document.addEventListener('click', function (e) {
      try {
        var a = e.target && e.target.closest ? e.target.closest('a[href]') : null;
        if (!a) return;
        var href = a.getAttribute('href') || '';
        var where = /^\/blog\//.test(path) ? 'blog' : (path === '/' || /index\.html$/.test(path)) ? 'home' : path.replace(/^\/|\.html$/g, '') || 'home';
        var kind = '';
        if (/^mailto:/i.test(href)) kind = 'contact_email';
        else if (/(^|\/)wholesale(\.html)?(\?|#|$)/.test(href)) kind = 'wholesale';
        else if (/(^|\/)verify(\.html)?(\?|#|$)/.test(href)) kind = 'verify';
        else if (/(^|\/)(shop|kits)(\.html)?(\?|#|$)/.test(href) || /products\//.test(href)) kind = (where === 'blog') ? 'blog_to_shop' : 'shop';
        if (!kind || (kind === 'shop' && where !== 'blog' && where !== 'verify')) return;   // plain nav inside the shop area adds noise
        window.vxTrack('cta_click', { cta_type: kind, cta_location: where, link_url: href.slice(0, 100) });
      } catch (err) {}
    }, true);

    // Lead forms that post to formsubmit.co (wholesale / contact). No field values are sent.
    document.addEventListener('submit', function (e) {
      try {
        var f = e.target;
        if (f && f.action && /formsubmit\.co/.test(f.action)) {
          var lt = /wholesale/.test(path) ? 'wholesale_inquiry' : /contact/.test(path) ? 'contact' : 'form';
          var o = { lead_type: lt };
          var vol = f.querySelector('[name="volume"]'); if (vol && vol.value) o.est_monthly_volume = vol.value;
          var bt = f.querySelector('[name="business_type"]'); if (bt && bt.value) o.business_type = bt.value;
          window.vxTrack('generate_lead', o);
        }
      } catch (err) {}
    }, true);
  });
})();
