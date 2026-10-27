/* Slim shipping notice under the header on browsing pages. Closable for the session. Update LINE1/LINE2 here to change it everywhere. */
(function () {
  var LINE1 = 'Every order ships USPS Priority Mail';
  var LINE2 = 'Free shipping at $150+';
  var KEY = 'vxShipBannerClosed';
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
    st.textContent = '#vxShipBanner{position:relative;background:#0F1B2D;color:#FAFAF7;font:13px/1.4 -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;text-align:center;padding:9px 44px 9px 16px;display:flex;flex-wrap:wrap;justify-content:center;align-items:center;column-gap:10px;row-gap:1px}#vxShipBanner span,#vxShipBanner a{white-space:nowrap}#vxShipBanner a{color:#FAFAF7;text-decoration:underline;text-underline-offset:2px;opacity:.85}@media(min-width:640px){#vxShipBanner span+span::before{content:"\\00b7";margin-right:10px;opacity:.6}}#vxShipBanner button{position:absolute;right:6px;top:50%;transform:translateY(-50%);background:none;border:0;color:#FAFAF7;font-size:20px;line-height:1;width:32px;height:32px;cursor:pointer;opacity:.8}#vxShipBanner button:hover,#vxShipBanner button:focus-visible{opacity:1}';
    document.head.appendChild(st);
    var bar = document.createElement('div');
    bar.id = 'vxShipBanner'; bar.setAttribute('role', 'region'); bar.setAttribute('aria-label', 'Shipping');
    var s1 = document.createElement('span'); s1.textContent = LINE1; var s2 = document.createElement('span'); s2.textContent = LINE2;
    var a = document.createElement('a'); a.href = '/shipping.html'; a.textContent = 'Shipping details';
    var b = document.createElement('button'); b.type = 'button'; b.setAttribute('aria-label', 'Close shipping notice'); b.innerHTML = '&times;';
    b.onclick = function () { bar.remove(); try { sessionStorage.setItem(KEY, '1'); } catch (e) {} };
    bar.appendChild(s1); bar.appendChild(s2); bar.appendChild(a); bar.appendChild(b);
    anchor.parentNode.insertBefore(bar, anchor.nextSibling);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function () { setTimeout(build, 0); });
  else setTimeout(build, 0);
})();
