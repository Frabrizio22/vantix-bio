/* Slim shipping notice under the header on browsing pages. Closable for the session. Update TEXT here to change it everywhere. */
(function () {
  var TEXT = 'Every order ships USPS Priority Mail. Free shipping on orders of $150 or more.';
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
    st.textContent = '#vxShipBanner{position:relative;background:#0F1B2D;color:#FAFAF7;font:13px/1.4 -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;text-align:center;padding:9px 40px 9px 16px}#vxShipBanner a{color:#FAFAF7;text-decoration:underline;text-underline-offset:2px;margin-left:6px;white-space:nowrap}#vxShipBanner button{position:absolute;right:6px;top:50%;transform:translateY(-50%);background:none;border:0;color:#FAFAF7;font-size:20px;line-height:1;width:32px;height:32px;cursor:pointer;opacity:.8}#vxShipBanner button:hover,#vxShipBanner button:focus-visible{opacity:1}';
    document.head.appendChild(st);
    var bar = document.createElement('div');
    bar.id = 'vxShipBanner'; bar.setAttribute('role', 'region'); bar.setAttribute('aria-label', 'Shipping');
    var span = document.createElement('span'); span.textContent = TEXT;
    var a = document.createElement('a'); a.href = '/shipping.html'; a.textContent = 'Shipping details';
    var b = document.createElement('button'); b.type = 'button'; b.setAttribute('aria-label', 'Close shipping notice'); b.innerHTML = '&times;';
    b.onclick = function () { bar.remove(); try { sessionStorage.setItem(KEY, '1'); } catch (e) {} };
    bar.appendChild(span); bar.appendChild(a); bar.appendChild(b);
    anchor.parentNode.insertBefore(bar, anchor.nextSibling);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function () { setTimeout(build, 0); });
  else setTimeout(build, 0);
})();
