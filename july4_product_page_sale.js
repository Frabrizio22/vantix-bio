// July 4th Sale - Product Page Price Updater
// Add this script before </body> on all product pages
(function(){
  const now = new Date();
  const saleStart = new Date('2026-07-01T00:00:00-07:00');
  const saleEnd = new Date('2026-07-05T23:59:59-07:00');
  const isSaleActive = (now >= saleStart && now <= saleEnd);
  
  if(!isSaleActive) return;
  
  // Find the price element
  const priceEl = document.querySelector('.price');
  if(!priceEl) return;
  
  // Extract current price
  const priceText = priceEl.textContent.trim();
  const currentPrice = parseFloat(priceText.replace('$',''));
  if(isNaN(currentPrice)) return;
  
  // Calculate sale price (20% off)
  const salePrice = Math.round(currentPrice * 0.8);
  
  // Update price display with sale styling
  priceEl.innerHTML = `
    <div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap">
      <span style="font-size:40px">$${salePrice}</span>
      <span style="text-decoration:line-through;opacity:0.5;font-size:28px">$${currentPrice}</span>
      <span style="background:#DC2626;color:#fff;font-size:13px;font-weight:700;padding:6px 14px;border-radius:16px;letter-spacing:0.05em">20% OFF</span>
    </div>
  `;
  
  // Update "Add to Cart" button
  const cartBtn = document.querySelector('button.btn[onclick*="addToCart"]');
  if(cartBtn){
    const btnText = cartBtn.textContent;
    cartBtn.textContent = btnText.replace(/\$\d+/, '$' + salePrice);
  }
  
  // Update product object price in window scope
  if(window.product && window.product.price){
    window.product.price = salePrice;
  }
})();
