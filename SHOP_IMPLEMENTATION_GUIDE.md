# SHOP.HTML IMPLEMENTATION GUIDE
**Complete templates ready for copy/paste**

---

## STEP 1: ADD SCRIPTS TO <head>

Add before closing `</head>` tag:

```html
<!-- Product Data -->
<script src="shop_products_data.js"></script>

<!-- Notify System -->
<script src="notify_system.js"></script>

<!-- Schema.org Product Markup -->
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Store",
  "name": "Vantix Bio",
  "description": "Forensic-grade research peptides with Janoshik verification",
  "url": "https://vantixbio.com"
}
</script>
```

---

## STEP 2: ADD EMAIL CAPTURE MODAL

Add before closing `</body>` tag:

```html
<!-- Email Capture Modal -->
<div id="notifyModal" class="notify-modal" style="display:none;">
  <div class="notify-modal-content">
    <span class="notify-modal-close" onclick="NotifySystem.closeModal()">&times;</span>
    <h3>Get Notified</h3>
    <p>Enter your email to be notified when <strong id="notifyProductName"></strong> launches.</p>
    
    <input 
      type="email" 
      id="notifyEmail" 
      placeholder="your@email.com"
      autocomplete="email"
    >
    
    <button id="notifySubmitBtn" onclick="NotifySystem.submit()">Notify Me</button>
    
    <p class="notify-privacy">We'll only email you when this product becomes available.</p>
    
    <div id="notifySuccess" class="notify-message notify-success" style="display:none;"></div>
    <div id="notifyError" class="notify-message notify-error" style="display:none;"></div>
  </div>
</div>
```

---

## STEP 3: ADD MODAL CSS

Add to `<style>` section:

```css
/* Email Capture Modal */
.notify-modal {
  display: none;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0,0,0,0.6);
  justify-content: center;
  align-items: center;
  z-index: 10000;
  backdrop-filter: blur(4px);
}

.notify-modal-content {
  background: white;
  padding: 36px;
  border-radius: 12px;
  max-width: 440px;
  width: 90%;
  position: relative;
  box-shadow: 0 20px 60px rgba(0,0,0,0.3);
}

.notify-modal-close {
  position: absolute;
  top: 16px;
  right: 20px;
  font-size: 28px;
  font-weight: 300;
  cursor: pointer;
  color: #94A3B8;
  line-height: 1;
  transition: color 0.2s;
}

.notify-modal-close:hover {
  color: #1A2B44;
}

.notify-modal-content h3 {
  margin: 0 0 12px 0;
  color: #1A2B44;
  font-size: 22px;
  font-weight: 700;
}

.notify-modal-content p {
  margin: 0 0 20px 0;
  color: #64748B;
  font-size: 15px;
  line-height: 1.6;
}

.notify-modal-content input {
  width: 100%;
  padding: 14px 16px;
  border: 1px solid #E2E8F0;
  border-radius: 8px;
  margin-bottom: 16px;
  font-size: 15px;
  font-family: inherit;
  transition: border-color 0.2s;
}

.notify-modal-content input:focus {
  outline: none;
  border-color: #2563EB;
}

.notify-modal-content button {
  width: 100%;
  background: #2563EB;
  color: white;
  border: none;
  padding: 14px;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
  font-family: inherit;
}

.notify-modal-content button:hover:not(:disabled) {
  background: #1D4ED8;
}

.notify-modal-content button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.notify-privacy {
  font-size: 12px !important;
  color: #94A3B8 !important;
  margin-top: 12px !important;
  margin-bottom: 0 !important;
  text-align: center;
}

.notify-message {
  margin-top: 16px;
  padding: 12px;
  border-radius: 8px;
  font-size: 14px;
  line-height: 1.5;
}

.notify-success {
  background: rgba(16,185,129,0.1);
  color: #059669;
  border: 1px solid rgba(16,185,129,0.2);
}

.notify-error {
  background: rgba(239,68,68,0.1);
  color: #DC2626;
  border: 1px solid rgba(239,68,68,0.2);
}

/* Coming Soon Badge */
.coming-soon-badge {
  position: absolute;
  top: 12px;
  right: 12px;
  background: #94A3B8;
  color: white;
  padding: 5px 12px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  z-index: 10;
}

.notify-btn {
  background: #64748B;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
  width: 100%;
}

.notify-btn:hover {
  background: #475569;
}

/* Stack Bundles */
.stack-section {
  margin: 60px 0;
  padding: 40px 0;
  background: linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%);
  border-radius: 16px;
}

.stack-section-header {
  text-align: center;
  margin-bottom: 40px;
}

.stack-section-title {
  font-size: 32px;
  font-weight: 700;
  color: #1A2B44;
  margin-bottom: 12px;
}

.stack-section-subtitle {
  font-size: 16px;
  color: #64748B;
}

.stack-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 24px;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
}

.stack-card {
  background: white;
  border: 2px solid #93C5FD;
  border-radius: 12px;
  padding: 28px;
  position: relative;
  transition: all 0.3s;
}

.stack-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 32px rgba(37,99,235,0.15);
  border-color: #2563EB;
}

.stack-badge {
  position: absolute;
  top: 16px;
  right: 16px;
  background: #10B981;
  color: white;
  padding: 6px 14px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 700;
}

.stack-name {
  font-size: 22px;
  color: #1A2B44;
  font-weight: 700;
  margin-bottom: 8px;
}

.stack-includes {
  font-size: 14px;
  color: #64748B;
  margin-bottom: 8px;
  line-height: 1.6;
}

.stack-description {
  font-size: 13px;
  color: #94A3B8;
  font-style: italic;
  margin-bottom: 20px;
}

.stack-pricing {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 20px;
}

.stack-original {
  font-size: 20px;
  color: #94A3B8;
  text-decoration: line-through;
  font-weight: 600;
}

.stack-price {
  font-size: 32px;
  color: #2563EB;
  font-weight: 800;
  font-family: 'IBM Plex Mono', Monaco, monospace;
}

.stack-savings {
  font-size: 14px;
  color: #10B981;
  font-weight: 600;
}

.stack-add-btn {
  width: 100%;
  background: #2563EB;
  color: white;
  border: none;
  padding: 14px;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.stack-add-btn:hover {
  background: #1D4ED8;
  transform: translateY(-1px);
}

/* Mobile Responsive */
@media (max-width: 768px) {
  .notify-modal-content {
    padding: 28px 24px;
  }
  
  .stack-grid {
    grid-template-columns: 1fr;
    padding: 0 16px;
  }
  
  .stack-card {
    padding: 24px 20px;
  }
  
  .stack-name {
    font-size: 20px;
  }
  
  .stack-price {
    font-size: 28px;
  }
}
```

---

## STEP 4: PHASE 1 PRODUCT CARD TEMPLATE

Replace existing product cards section with this dynamic rendering:

```html
<!-- Phase 1 Products -->
<div class="products-section">
  <h2 class="section-heading">Research Peptides</h2>
  <p class="section-sub">All products dual-tested with Janoshik verification</p>
  
  <div class="product-grid" id="phase1Products">
    <!-- Products will be rendered here by JavaScript -->
  </div>
</div>

<script>
// Render Phase 1 products
document.addEventListener('DOMContentLoaded', function() {
  const container = document.getElementById('phase1Products');
  if (!container) return;
  
  vantixPhase1.forEach(product => {
    const card = document.createElement('div');
    card.className = 'product-card';
    card.dataset.category = product.category;
    card.dataset.sku = product.sku;
    
    // Schema.org product markup
    const schema = {
      "@context": "https://schema.org",
      "@type": "Product",
      "name": product.name,
      "brand": { "@type": "Brand", "name": "Vantix Bio" },
      "sku": product.sku,
      "offers": {
        "@type": "Offer",
        "price": product.price.toFixed(2),
        "priceCurrency": "USD",
        "availability": "https://schema.org/InStock"
      }
    };
    
    const colors = categoryColors[product.category] || categoryColors.supply;
    
    card.innerHTML = `
      <script type="application/ld+json">${JSON.stringify(schema)}<\/script>
      ${product.testingStatus === 'dual' ? '<div class="coa-badge">COA ✓</div>' : ''}
      <div class="category-badge" style="background:${colors.bg};color:${colors.text}">
        ${product.categoryLabel.toUpperCase()}
      </div>
      <h3 class="product-name">${product.name}</h3>
      <div class="product-price">$${product.price}</div>
      <div class="product-meta" style="font-size:11px;color:#94A3B8;margin-bottom:12px;">
        ${product.testingStatus === 'dual' ? 'Dual Tested • Janoshik Verified' : ''}
      </div>
      <button class="order-btn" onclick="addToCart('${product.name}', ${product.price}, '${product.sku}')">
        Add to Cart
      </button>
    `;
    
    container.appendChild(card);
  });
});
</script>
```

---

## STEP 5: PHASE 2 "COMING SOON" CARDS

Add after Phase 1 section:

```html
<!-- Phase 2 Coming Soon -->
<div class="products-section" style="margin-top:80px;">
  <h2 class="section-heading">Coming Soon</h2>
  <p class="section-sub">Be the first to know when these products launch</p>
  
  <div class="product-grid" id="phase2Products">
    <!-- Products will be rendered here by JavaScript -->
  </div>
</div>

<script>
// Render Phase 2 products
document.addEventListener('DOMContentLoaded', function() {
  const container = document.getElementById('phase2Products');
  if (!container) return;
  
  vantixPhase2.forEach(product => {
    const card = document.createElement('div');
    card.className = 'product-card';
    card.style.opacity = '0.92';
    card.dataset.product = product.name;
    card.dataset.sku = product.sku;
    card.dataset.category = product.category;
    
    const colors = categoryColors[product.category] || categoryColors.supply;
    
    card.innerHTML = `
      <div class="coming-soon-badge">Coming Soon</div>
      <div class="category-badge" style="background:${colors.bg};color:${colors.text}">
        ${product.categoryLabel.toUpperCase()}
      </div>
      <h3 class="product-name">${product.name}</h3>
      <p class="product-description" style="font-size:13px;color:#64748B;margin-bottom:16px;line-height:1.5;">
        ${product.description}
      </p>
      <button 
        class="notify-btn" 
        onclick="NotifySystem.openModal('${product.name}', '${product.sku}', '${product.category}')">
        Notify Me When Available
      </button>
    `;
    
    container.appendChild(card);
  });
});
</script>
```

---

## STEP 6: STACK BUNDLES SECTION

Add after Phase 2 section:

```html
<!-- Stack Bundles -->
<div class="stack-section">
  <div class="stack-section-header">
    <h2 class="stack-section-title">Research Stacks</h2>
    <p class="stack-section-subtitle">Pre-configured protocols with volume savings</p>
  </div>
  
  <div class="stack-grid" id="stacksGrid">
    <!-- Stacks will be rendered here by JavaScript -->
  </div>
</div>

<script>
// Render stack bundles
document.addEventListener('DOMContentLoaded', function() {
  const container = document.getElementById('stacksGrid');
  if (!container) return;
  
  vantixStacks.forEach(stack => {
    const card = document.createElement('div');
    card.className = 'stack-card';
    card.dataset.sku = stack.sku;
    
    card.innerHTML = `
      <div class="stack-badge">Save $${stack.savings}</div>
      <h3 class="stack-name">${stack.name}</h3>
      <div class="stack-includes">${stack.productNames.join(' + ')}</div>
      <div class="stack-description">${stack.description}</div>
      <div class="stack-pricing">
        <span class="stack-original">$${stack.originalPrice}</span>
        <span class="stack-price">$${stack.price}</span>
      </div>
      <button 
        class="stack-add-btn" 
        onclick="addStackToCart('${stack.name}', ${JSON.stringify(stack.productNames)}, ${stack.price}, '${stack.sku}')">
        Add Stack to Cart
      </button>
    `;
    
    container.appendChild(card);
  });
});
</script>
```

---

## STEP 7: UPDATE CART FUNCTIONS

Add these enhanced cart functions:

```javascript
// Add individual product to cart
function addToCart(productName, price, sku) {
  let cart = JSON.parse(localStorage.getItem('vxCart') || '[]');
  
  const existing = cart.find(item => item.sku === sku);
  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({ 
      name: productName, 
      price: price,
      sku: sku,
      quantity: 1,
      type: 'single'
    });
  }
  
  localStorage.setItem('vxCart', JSON.stringify(cart));
  updateCartUI();
  showAddedToast(productName);
}

// Add stack to cart
function addStackToCart(stackName, productNames, price, sku) {
  let cart = JSON.parse(localStorage.getItem('vxCart') || '[]');
  
  cart.push({ 
    name: stackName, 
    price: price,
    sku: sku,
    quantity: 1,
    type: 'stack',
    products: productNames
  });
  
  localStorage.setItem('vxCart', JSON.stringify(cart));
  updateCartUI();
  showAddedToast(stackName);
}
```

---

## VALIDATION CHECKLIST

Before deploying, verify:

### ✅ Product Data
- [ ] All 11 Phase 1 products have SKU, category, price
- [ ] All 5 Phase 2 products have SKU, category, description
- [ ] All 6 stacks have correct pricing and product lists

### ✅ Email Capture
- [ ] Modal opens correctly on "Notify Me" button click
- [ ] Product name populates in modal
- [ ] Email validation works (try invalid email)
- [ ] Duplicate prevention works (try same email twice)
- [ ] Success message displays correctly
- [ ] Modal closes on ESC key
- [ ] Modal closes when clicking outside
- [ ] Data stored in localStorage correctly

### ✅ Mobile Layout
- [ ] Product cards display in 2-column grid on phone
- [ ] "Coming Soon" badge doesn't overlap text
- [ ] Modal displays correctly on mobile width
- [ ] Stack cards stack to 1-column on mobile
- [ ] All buttons are full-width on mobile
- [ ] No horizontal overflow

### ✅ Schema Markup
- [ ] Each product has embedded JSON-LD schema
- [ ] Price, availability, brand included
- [ ] SKU included in schema

### ✅ Browser Console
- [ ] No JavaScript errors in console
- [ ] localStorage writes successful
- [ ] Network request skipped message (if endpoint not configured)

---

## TESTING CHECKLIST

### Test Flow 1: Add Phase 1 Product
1. Click "Add to Cart" on Semaglutide
2. Verify cart count updates
3. Open cart drawer
4. Verify product appears with correct price
5. Verify SKU stored in cart data

### Test Flow 2: Email Capture
1. Click "Notify Me" on NAD+ 1000mg
2. Verify modal opens with "NAD+ 1000mg" in text
3. Enter invalid email → verify error message
4. Enter valid email → verify success message
5. Open browser localStorage → verify entry saved
6. Try same email again → verify duplicate error

### Test Flow 3: Add Stack
1. Click "Add Stack to Cart" on Repair Stack
2. Verify cart updates
3. Open cart drawer
4. Verify stack shows both products
5. Verify $54 price (not $64)

### Test Flow 4: Mobile Responsive
1. Open DevTools → switch to iPhone width (375px)
2. Verify product grid shows 2 columns
3. Verify "Coming Soon" badge visible
4. Click "Notify Me" → verify modal fits screen
5. Verify all buttons full-width

---

## DEPLOYMENT STEPS

1. **Backup current shop.html:**
   ```bash
   cp shop.html shop_backup_$(date +%Y%m%d).html
   ```

2. **Add new files:**
   - Upload `shop_products_data.js`
   - Upload `notify_system.js`

3. **Update shop.html:**
   - Add scripts to `<head>`
   - Add modal HTML before `</body>`
   - Add modal CSS to `<style>`
   - Replace product sections with dynamic templates

4. **Test locally first** (if possible)

5. **Deploy to GitHub:**
   ```bash
   git add shop.html shop_products_data.js notify_system.js
   git commit -m "Shop pricing implementation: Phase 1/2 products, stacks, email capture"
   git push
   ```

6. **Verify live:**
   - Test on desktop
   - Test on mobile
   - Test email capture
   - Check browser console for errors

---

## TROUBLESHOOTING

**Modal doesn't open:**
- Check console for errors
- Verify `notify_system.js` loaded
- Verify `NotifySystem` is defined globally

**Products don't render:**
- Check console for errors
- Verify `shop_products_data.js` loaded
- Verify `vantixPhase1` array exists

**Cart doesn't update:**
- Check localStorage in DevTools
- Verify cart key is `vxCart`
- Check `addToCart` function defined

**Mobile overflow:**
- Add `overflow-x: hidden` to `body` and `html`
- Check product card max-width
- Verify grid uses `minmax()` for responsive

---

**READY TO IMPLEMENT**

All templates are copy/paste ready. Follow steps in order for clean implementation.

---

**END OF IMPLEMENTATION GUIDE**
