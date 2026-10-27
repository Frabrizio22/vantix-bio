/* Slim shipping notice under the header on browsing pages. Closable for the session. Update LINE1/LINE2 here to change it everywhere. */
(function () {
  var LINE1 = 'Ships next business day + 2-3 day delivery';
  var LINE2 = 'Free shipping on orders over $150';
  // Halloween promo: replaces LINE1 until Nov 2, 2026 00:00 PST (08:00 UTC), then the normal shipping line returns on its own.
  var PROMO_END = Date.UTC(2026, 10, 2, 8, 0, 0);
  var promo = Date.now() < PROMO_END;
  var KEY = promo ? 'vxPromoBannerClosed' : 'vxShipBannerClosed';
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
    st.textContent = '#vxShipBanner{position:relative;background:#0F1B2D;color:#FAFAF7;font:13px/1.4 -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;text-align:center;padding:9px 44px 9px 16px;display:flex;flex-direction:column;align-items:center;row-gap:1px}#vxShipBanner a{white-space:nowrap}#vxShipBanner a{color:#FAFAF7;text-decoration:underline;text-underline-offset:2px;opacity:.85}@media(max-width:420px){#vxShipBanner{font-size:12.5px;padding-left:12px;padding-right:38px}}#vxShipBanner button{position:absolute;right:6px;top:50%;transform:translateY(-50%);background:none;border:0;color:#FAFAF7;font-size:20px;line-height:1;width:32px;height:32px;cursor:pointer;opacity:.8}#vxShipBanner button:hover,#vxShipBanner button:focus-visible{opacity:1}';
    document.head.appendChild(st);
    var bar = document.createElement('div');
    bar.id = 'vxShipBanner'; bar.setAttribute('role', 'region'); bar.setAttribute('aria-label', 'Shipping');
    var s1;
    if (promo) {
      s1 = document.createElement('a'); s1.href = '/shop.html?code=SPOOKY25&utm_source=site&utm_medium=banner&utm_campaign=spooky-2026';
      s1.style.fontWeight = '600'; s1.style.opacity = '1';
      s1.appendChild(document.createTextNode('\uD83C\uDF83 Halloween weekend: 25% off with code '));
      var code = document.createElement('span'); code.textContent = 'SPOOKY25'; code.style.color = '#E39A4A'; code.style.letterSpacing = '.06em'; s1.appendChild(code);
    } else { s1 = document.createElement('span'); s1.textContent = LINE1; }
    var s2 = document.createElement('span'); s2.textContent = LINE2;
    var b = document.createElement('button'); b.type = 'button'; b.setAttribute('aria-label', 'Close shipping notice'); b.innerHTML = '&times;';
    b.onclick = function () { bar.remove(); try { sessionStorage.setItem(KEY, '1'); } catch (e) {} };
    if (promo) bar.style.borderBottom = '3px solid #E39A4A';
    bar.appendChild(s1); bar.appendChild(s2); bar.appendChild(b);
    anchor.parentNode.insertBefore(bar, anchor.nextSibling);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function () { setTimeout(build, 0); });
  else setTimeout(build, 0);
})();
