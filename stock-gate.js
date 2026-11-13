// stock-gate.js - makes product pages follow live stock.
// Out of stock: no Add to Cart, "Out of stock" label, dimmed photo, and a Notify me form (same RPC as the shop page).
// Needs /shop_products_data.js loaded first (it fetches the live in-stock flags).
(function () {
  if (typeof VX_PRODUCTS === 'undefined') return;
  var CONSENT = "We'll email you once when it's back in stock.";
  var file = location.pathname.split('/').pop();
  var product = (VX_PRODUCTS.phase1 || []).filter(function (p) { return p.url === 'products/' + file; })[0];
  var cta = document.querySelector('.cta');
  if (!product || !cta) return;
  var original = cta.innerHTML;
  var hadAddToCart = /onclick="addToCart\(\)"/.test(original);

  var css = document.createElement('style');
  css.textContent =
    '.vx-oos-pill{display:inline-block;font:600 10px "JetBrains Mono",monospace;letter-spacing:.12em;text-transform:uppercase;background:#0F1B2D;color:#FAFAF7;padding:5px 10px;border-radius:999px}' +
    '.vx-oos-img{opacity:.4;filter:grayscale(.85)}' +
    '.vx-oos-form{display:flex;flex-direction:column;gap:8px;max-width:400px;margin:0 auto}' +
    '.vx-oos-title{font:600 11px "JetBrains Mono",monospace;letter-spacing:.12em;text-transform:uppercase;text-align:center;color:rgba(10,22,40,.6)}' +
    '.vx-oos-row{display:flex;gap:8px}' +
    '.vx-oos-row input{flex:1;min-width:0;padding:13px 14px;font-size:15px;border:1px solid #D9D2BF;border-radius:24px;background:#fff;color:inherit}' +
    '.vx-oos-row button{flex:none;padding:13px 20px;border:none;border-radius:24px;background:#0F1B2D;color:#fff;font-size:14px;font-weight:600;cursor:pointer}' +
    '.vx-oos-note{font-size:11px;line-height:1.4;color:rgba(10,22,40,.55);text-align:center}';
  document.head.appendChild(css);

  function blockedAdd() { return false; }

  function render(oos) {
    var img = document.querySelector('.product-image');
    var meta = document.querySelector('.meta');
    var pill = document.getElementById('vx-oos-pill');
    if (img) img.classList.toggle('vx-oos-img', oos);
    if (oos) {
      if (!pill && meta) {
        pill = document.createElement('span'); pill.id = 'vx-oos-pill'; pill.className = 'vx-oos-pill'; pill.textContent = 'Out of stock';
        meta.appendChild(pill);
      }
      window.addToCart = blockedAdd;
      cta.innerHTML = '<form class="vx-oos-form"><div class="vx-oos-title">Out of stock</div>' +
        '<div class="vx-oos-row"><input type="email" required autocomplete="email" inputmode="email" placeholder="Your email" aria-label="Email for restock notice">' +
        '<button type="submit">Notify me</button></div><div class="vx-oos-note">' + CONSENT + '</div></form>';
      var form = cta.querySelector('form');
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        var email = form.querySelector('input').value.trim();
        var btn = form.querySelector('button'); btn.disabled = true; btn.textContent = 'Saving...';
        fetch(VX_SB_URL + '/rest/v1/rpc/request_restock_notify', {
          method: 'POST',
          headers: { apikey: VX_SB_KEY, Authorization: 'Bearer ' + VX_SB_KEY, 'Content-Type': 'application/json' },
          body: JSON.stringify({ p_sku: product.sku, p_email: email, p_consent: CONSENT })
        }).then(function (r) {
          if (!r.ok) throw new Error('bad');
          cta.innerHTML = '<div class="vx-oos-form"><div class="vx-oos-title">You\'re on the list! We\'ll email you as soon as ' + product.shortName + ' is back in stock.</div></div>';
          if (window.dataLayer) window.dataLayer.push({ event: 'generate_lead', lead_source: 'notify_me', sku: product.sku });
        }).catch(function () {
          btn.disabled = false; btn.textContent = 'Notify me';
          form.querySelector('.vx-oos-note').textContent = 'Something went wrong. Check the email and try again.';
        });
      });
    } else {
      if (pill) pill.remove();
      if (hadAddToCart) { cta.innerHTML = original; }
      else {
        cta.innerHTML = '<button class="btn" id="vx-add">Add to Cart — $' + product.price + '</button>';
        document.getElementById('vx-add').onclick = function () {
          var cart = JSON.parse(localStorage.getItem('vantixCart') || '[]');
          var ex = cart.filter(function (i) { return i.sku === product.sku; })[0];
          if (ex) ex.quantity += 1; else cart.push({ sku: product.sku, name: product.cartName || product.name, price: product.price, quantity: 1 });
          localStorage.setItem('vantixCart', JSON.stringify(cart));
          window.location.href = '../checkout.html';
        };
      }
    }
  }

  var last = null;
  function apply() {
    var oos = !product.isInStock;
    if (oos === last) return;
    last = oos; render(oos);
  }
  window.refreshProductGrid = apply;
  apply();
})();
