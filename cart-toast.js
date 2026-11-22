/* Small "Added to cart" pop-up with a View Cart button. Used on product pages and the bundles page so shoppers can keep browsing
   instead of being sent straight to checkout. Shows ~4 seconds, tap anywhere on it (except View Cart) to close. No product names on purpose. */
(function () {
  window.vxCartToast = function (message) {
    try {
      if (!document.getElementById('vxCartToastCss')) {
        var st = document.createElement('style'); st.id = 'vxCartToastCss';
        st.textContent = '.vx-cart-toast{position:fixed;left:50%;bottom:-120px;transform:translateX(-50%);background:#fff;border:1px solid #D9D2BF;border-radius:12px;padding:14px 18px;box-shadow:0 8px 24px rgba(0,0,0,.15);z-index:9999;transition:bottom .3s ease;width:max-content;max-width:min(92vw,440px);cursor:pointer}.vx-cart-toast.show{bottom:24px}.vx-cart-toast .c{display:flex;align-items:center;gap:12px;font:500 14px -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Arial,sans-serif;color:#0F1B2D}.vx-cart-toast svg{width:20px;height:20px;color:#7BA88F;flex-shrink:0}.vx-cart-toast a{background:#0F1B2D;color:#fff;border-radius:16px;padding:7px 14px;font-size:12px;font-weight:600;text-decoration:none;white-space:nowrap}';
        document.head.appendChild(st);
      }
      var old = document.querySelector('.vx-cart-toast'); if (old) old.remove();
      var t = document.createElement('div'); t.className = 'vx-cart-toast'; t.setAttribute('role', 'status');
      t.innerHTML = '<div class="c"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"/></svg><span></span><a href="/checkout.html">View Cart</a></div>';
      t.querySelector('span').textContent = message || 'Added to cart';
      var gone = false;
      function close() { if (gone) return; gone = true; t.classList.remove('show'); setTimeout(function () { t.remove(); }, 300); }
      t.addEventListener('click', function (e) { if (!e.target.closest('a')) close(); });
      document.body.appendChild(t);
      setTimeout(function () { t.classList.add('show'); }, 10);
      setTimeout(close, 4000);
    } catch (e) { window.location.href = '/checkout.html'; }
  };
})();
