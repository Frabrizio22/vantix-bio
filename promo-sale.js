/* Halloween sale (SPOOKY25): shows 25% off prices and lets checkout auto-apply the code.
   Ends Nov 2, 2026 00:00 PST (08:00 UTC) on its own. 10-vial kits are never discounted. */
(function(){
  var END = Date.UTC(2026, 10, 2, 8, 0, 0);
  var PCT = 0.25;
  var sale = { active: Date.now() < END, pct: PCT, code: 'SPOOKY25' };
  sale.price = function(p){ return Math.round(p * (1 - PCT) * 100) / 100; };
  sale.fmt = function(n){ return '$' + (Math.round(n) === n ? n : n.toFixed(2)); };
  sale.html = function(p){
    if (!sale.active) return '$' + p;
    return '<s style="opacity:.55;font-weight:400;margin-right:8px">$' + p + '</s><span style="color:#B8651B">' + sale.fmt(sale.price(p)) + '</span>';
  };
  window.vxSale = sale;
  if (!sale.active) return;
  // Single-product pages: decorate the main price.
  function decorate(){
    var el = document.querySelector('.price');
    if (el && !el.dataset.sale) {
      var m = /^\$(\d+(?:\.\d+)?)$/.exec(el.textContent.trim());
      if (m) { el.dataset.sale = '1'; el.innerHTML = sale.html(parseFloat(m[1])); }
    }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', decorate); else decorate();
})();
