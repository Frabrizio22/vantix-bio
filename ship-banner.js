/* Slim shipping notice under the header on browsing pages. Closable for the session. Update LINE1/LINE2 here to change it everywhere. */
(function () {
  var LINE1 = 'Ships next business day';
  var LINE2 = 'Free shipping on orders over $150';
  // Black Friday 2026: shows from Nov 25 until Dec 1, 2026 00:00 PST (08:00 UTC), then the normal shipping line returns on its own.
  var PROMO_START = Date.UTC(2026, 10, 25, 0, 0, 0);
  var PROMO_END = Date.UTC(2026, 11, 1, 8, 0, 0);
  var promo = Date.now() >= PROMO_START && Date.now() < PROMO_END;
  var KEY = promo ? 'vxBfBannerClosed26' : 'vxShipBannerClosed';
  try { if (sessionStorage.getItem(KEY)) return; } catch (e) {}
  function build() {
    if (document.getElementById('vxShipBanner')) return;
    var anchor = document.querySelector('.vx-hdr-space') || document.getElementById('hdrSpace');
    if (!anchor) {
      var nav = document.querySelector('nav.header-nav');
      anchor = nav && nav.parentElement && nav.parentElement !== document.body ? nav.parentElement : nav;
    }
    if (!anchor || !anchor.parentNode) return;
    var st = document.createElement('style');
    st.textContent = '#vxShipBanner{position:relative;background:#0F1B2D;color:#FAFAF7;font:13px/1.4 -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;text-align:center;padding:9px 44px 9px 16px;display:flex;flex-direction:column;align-items:center;row-gap:1px}#vxShipBanner a{white-space:nowrap}#vxShipBanner a{color:#FAFAF7;text-decoration:underline;text-underline-offset:2px;opacity:.85}@media(max-width:420px){#vxShipBanner{font-size:12.5px;padding-left:12px;padding-right:38px}}#vxShipBanner button{position:absolute;right:6px;top:50%;transform:translateY(-50%);background:none;border:0;color:#FAFAF7;font-size:20px;line-height:1;width:32px;height:32px;cursor:pointer;opacity:.8}#vxShipBanner button:hover,#vxShipBanner button:focus-visible{opacity:1}' +
      '#vxShipBanner.vx-bf{padding:11px 44px 11px 16px;row-gap:5px;border-bottom:2px solid #3973B0;text-decoration:none}#vxShipBanner.vx-bf a.vx-bf-main{text-decoration:none;opacity:1;color:#FAFAF7;display:flex;flex-wrap:wrap;justify-content:center;align-items:center;column-gap:12px;row-gap:6px;white-space:normal}' +
      '#vxShipBanner .vx-bf-tag{font:500 10.5px/1 "JetBrains Mono",Menlo,Consolas,monospace;letter-spacing:.22em;text-transform:uppercase;color:#8FB4DE}' +
      '#vxShipBanner .vx-bf-text{font:300 17px/1.2 Fraunces,Georgia,"Times New Roman",serif;letter-spacing:-.005em}' +
      '#vxShipBanner .vx-bf-code{font:500 12px/1 "JetBrains Mono",Menlo,Consolas,monospace;letter-spacing:.14em;border:1px solid rgba(250,250,247,.45);border-radius:2px;padding:5px 8px 4px}' +
      '#vxShipBanner .vx-bf-sub{font:11px/1.4 "JetBrains Mono",Menlo,Consolas,monospace;letter-spacing:.06em;color:#9FB0C6}' +
      '@media(max-width:480px){#vxShipBanner.vx-bf{padding:10px 36px 10px 12px}#vxShipBanner .vx-bf-text{font-size:16px}#vxShipBanner .vx-bf-sub{font-size:10.5px;letter-spacing:.04em}}';
    document.head.appendChild(st);
    var bar = document.createElement('div');
    bar.id = 'vxShipBanner'; bar.setAttribute('role', 'region'); bar.setAttribute('aria-label', 'Shipping');
    var s1;
    if (promo) {
      bar.classList.add('vx-bf');
      s1 = document.createElement('a'); s1.className = 'vx-bf-main';
      s1.href = '/shop.html?code=BF25&utm_source=site&utm_medium=banner&utm_campaign=bf-2026';
      var t = document.createElement('span'); t.className = 'vx-bf-tag'; t.textContent = 'Black Friday';
      var m = document.createElement('span'); m.className = 'vx-bf-text'; m.textContent = '25% off your first order';
      var cd = document.createElement('span'); cd.className = 'vx-bf-code'; cd.textContent = 'BF25';
      s1.appendChild(t); s1.appendChild(m); s1.appendChild(cd);
    } else { s1 = document.createElement('span'); s1.textContent = LINE1; }
    var s2 = document.createElement('span'); s2.textContent = promo ? 'Ends Nov 30, 11:59 PM PST' : LINE2; if (promo) s2.className = 'vx-bf-sub';
    var b = document.createElement('button'); b.type = 'button'; b.setAttribute('aria-label', promo ? 'Close Black Friday notice' : 'Close shipping notice'); b.innerHTML = '&times;';
    b.onclick = function () { bar.remove(); try { sessionStorage.setItem(KEY, '1'); } catch (e) {} };
    bar.appendChild(s1); bar.appendChild(s2); bar.appendChild(b);
    anchor.parentNode.insertBefore(bar, anchor.nextSibling);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function () { setTimeout(build, 0); });
  else setTimeout(build, 0);
})();
