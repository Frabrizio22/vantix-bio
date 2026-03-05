# VANTIX BIO - PRICING IMPLEMENTATION COMPLETE
**Date:** March 5, 2026  
**Status:** ✅ APPROVED - Ready for Shop Updates

---

## FINAL APPROVED PRICING

### **Phase 1 Products (All Dual Tested - Visible on Shop)**

| # | Product | COGS | **Retail** | Margin | Category |
|---|---------|------|------------|--------|----------|
| 1 | Semaglutide 10mg | $9.10 | **$38** | 76% | GLP |
| 2 | Tirzepatide 30mg | $13.40 | **$48** | 72% | GLP |
| 3 | Retatrutide 10mg | $11.40 | **$42** | 73% | GLP |
| 4 | Retatrutide 20mg | $14.50 | **$58** | 75% | GLP |
| 5 | BPC-157 5mg | $9.10 | **$30** | 70% | Repair |
| 6 | TB-500 5mg | $11.40 | **$34** | 67% | Repair |
| 7 | CJC-1295 (no DAC) 5mg | $12.10 | **$30** | 60% | GH |
| 8 | Ipamorelin 5mg | $8.40 | **$24** | 65% | GH |
| 9 | Epithalon 50mg | $11.50 | **$38** | 70% | Longevity |
| 10 | Melanotan II 10mg | $9.50 | **$28** | 70% | Seasonal |
| 11 | BAC Water 30ml | $5.00 | **$8** | 38% | Supply |

**Average Margin: 69%** ✅

---

### **Stack Bundles (Adjusted Per Frabrizio's Feedback)**

| Stack | Products | Singles | Discount | **Bundle** | Margin |
|-------|----------|---------|----------|------------|--------|
| **Traditional Stacks (15% off):** ||||||
| Repair Stack | BPC-157 + TB-500 | $64 | 15% | **$54** | 66% |
| GH Stack | CJC-1295 + Ipamorelin | $54 | 15% | **$46** | 56% |
| **GLP Combos (10% off):** ||||||
| GLP Power | Reta 10 + Tirz 30 | $90 | 10% | **$81** | 69% |
| Beginner GLP | Sema + BAC | $46 | 10% | **$41** | 67% |
| Advanced GLP | Reta 20 + Sema | $96 | 10% | **$86** | 73% |
| **3-Product (12% off):** ||||||
| Summer Lean | MT-2 + CJC + Ipa | $82 | 12% | **$72** | 59% |

---

### **Phase 2 Products (Coming Soon - Email Capture)**

| Product | Target Price | Status |
|---------|--------------|--------|
| NAD+ 1000mg | $34 | Coming Soon |
| Semax 10mg | $28 | Coming Soon |
| Selank 10mg | $28 | Coming Soon |
| Thymosin Alpha-1 5mg | $38 | Coming Soon |
| AOD-9604 2mg | $30 | Coming Soon |

**Display:** "Notify Me When Available" button → Email capture modal

---

### **Phase 3 Products (Hidden - Not Displayed)**

- GHK-Cu 100mg
- Tesamorelin 10mg
- Cagrilintide 5mg
- Sermorelin 5mg
- Additional specialty peptides

---

## SHOP.HTML IMPLEMENTATION STRUCTURE

### **Product Card Template (Phase 1):**

```html
<div class="product-card" data-category="glp">
    <div class="coa-badge">COA ✓</div>
    <div class="category-badge category-glp">GLP AGONIST</div>
    <h3 class="product-name">Semaglutide 10mg</h3>
    <div class="product-price">$38</div>
    <div class="product-meta">Dual Tested • Janoshik Verified</div>
    <button class="order-btn" onclick="addToCart('Semaglutide 10mg', 38)">Add to Cart</button>
</div>
```

### **Coming Soon Card Template (Phase 2):**

```html
<div class="product-card coming-soon" data-category="longevity">
    <div class="coming-soon-badge">Coming Soon</div>
    <div class="category-badge category-longevity">LONGEVITY</div>
    <h3 class="product-name">NAD+ 1000mg</h3>
    <p class="product-description">Nicotinamide adenine dinucleotide for cellular energy.</p>
    <button class="notify-btn" onclick="showNotifyModal('NAD+ 1000mg')">Notify Me</button>
</div>
```

### **Stack Bundle Card:**

```html
<div class="stack-card">
    <div class="stack-badge">Save 15%</div>
    <h3 class="stack-name">Repair Stack</h3>
    <div class="stack-includes">BPC-157 5mg + TB-500 5mg</div>
    <div class="stack-pricing">
        <span class="stack-original">$64</span>
        <span class="stack-price">$54</span>
    </div>
    <button class="order-btn" onclick="addStackToCart('Repair Stack', ['BPC-157 5mg', 'TB-500 5mg'], 54)">Add Stack to Cart</button>
</div>
```

---

## EMAIL CAPTURE MODAL (LIGHTWEIGHT)

### **HTML Structure:**

```html
<div id="notifyModal" class="modal" style="display:none;">
    <div class="modal-content">
        <span class="modal-close" onclick="closeNotifyModal()">&times;</span>
        <h3>Get Notified</h3>
        <p>Enter your email to be notified when <strong id="notifyProductName"></strong> launches.</p>
        <input type="email" id="notifyEmail" placeholder="your@email.com">
        <button onclick="submitNotify()">Notify Me</button>
        <div id="notifySuccess" style="display:none;">✅ You'll be first to know!</div>
    </div>
</div>
```

### **JavaScript (Vanilla - No Dependencies):**

```javascript
function showNotifyModal(productName) {
    document.getElementById('notifyProductName').textContent = productName;
    document.getElementById('notifyModal').style.display = 'flex';
}

function closeNotifyModal() {
    document.getElementById('notifyModal').style.display = 'none';
}

function submitNotify() {
    const email = document.getElementById('notifyEmail').value;
    const product = document.getElementById('notifyProductName').textContent;
    
    // Simple validation
    if (!email || !email.includes('@')) {
        alert('Please enter a valid email');
        return;
    }
    
    // Store locally (replace with backend later)
    const waitlist = JSON.parse(localStorage.getItem('vantixWaitlist') || '[]');
    waitlist.push({ email, product, date: new Date().toISOString() });
    localStorage.setItem('vantixWaitlist', JSON.stringify(waitlist));
    
    // Show success
    document.getElementById('notifySuccess').style.display = 'block';
    setTimeout(() => {
        closeNotifyModal();
        document.getElementById('notifySuccess').style.display = 'none';
        document.getElementById('notifyEmail').value = '';
    }, 2000);
}
```

---

## CART INTEGRATION (SIMPLE)

### **Add to Cart Function:**

```javascript
function addToCart(productName, price) {
    let cart = JSON.parse(localStorage.getItem('vxCart') || '[]');
    
    // Check if product exists
    const existing = cart.find(item => item.name === productName);
    if (existing) {
        existing.quantity += 1;
    } else {
        cart.push({ name: productName, price: price, quantity: 1 });
    }
    
    localStorage.setItem('vxCart', JSON.stringify(cart));
    updateCartUI();
    showAddedToast(productName);
}

function addStackToCart(stackName, products, price) {
    let cart = JSON.parse(localStorage.getItem('vxCart') || '[]');
    
    // Add stack as bundle
    cart.push({ 
        name: stackName, 
        price: price, 
        quantity: 1,
        isStack: true,
        products: products
    });
    
    localStorage.setItem('vxCart', JSON.stringify(cart));
    updateCartUI();
    showAddedToast(stackName);
}
```

---

## CSS ADDITIONS (LIGHTWEIGHT)

### **Coming Soon Badge:**

```css
.coming-soon {
    opacity: 0.85;
    position: relative;
}

.coming-soon-badge {
    position: absolute;
    top: 12px;
    right: 12px;
    background: #94A3B8;
    color: white;
    padding: 4px 12px;
    border-radius: 6px;
    font-size: 11px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.notify-btn {
    background: #64748B;
    color: white;
    border: none;
    padding: 12px 24px;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.2s;
}

.notify-btn:hover {
    background: #475569;
}
```

### **Stack Card Styling:**

```css
.stack-card {
    background: linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%);
    border: 2px solid #93C5FD;
    border-radius: 12px;
    padding: 24px;
    margin-bottom: 20px;
    position: relative;
}

.stack-badge {
    position: absolute;
    top: 12px;
    right: 12px;
    background: #10B981;
    color: white;
    padding: 4px 12px;
    border-radius: 6px;
    font-size: 12px;
    font-weight: 700;
}

.stack-name {
    font-size: 20px;
    color: #1A2B44;
    font-weight: 700;
    margin-bottom: 8px;
}

.stack-includes {
    font-size: 14px;
    color: #64748B;
    margin-bottom: 16px;
}

.stack-pricing {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 16px;
}

.stack-original {
    font-size: 18px;
    color: #94A3B8;
    text-decoration: line-through;
}

.stack-price {
    font-size: 28px;
    color: #2563EB;
    font-weight: 800;
    font-family: 'IBM Plex Mono', Monaco, monospace;
}
```

### **Modal Styling:**

```css
.modal {
    display: none;
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0,0,0,0.5);
    justify-content: center;
    align-items: center;
    z-index: 1000;
}

.modal-content {
    background: white;
    padding: 32px;
    border-radius: 12px;
    max-width: 400px;
    width: 90%;
    position: relative;
}

.modal-close {
    position: absolute;
    top: 16px;
    right: 16px;
    font-size: 24px;
    cursor: pointer;
    color: #94A3B8;
}

.modal-close:hover {
    color: #1A2B44;
}

.modal-content h3 {
    margin-bottom: 12px;
    color: #1A2B44;
}

.modal-content input {
    width: 100%;
    padding: 12px;
    border: 1px solid #E2E8F0;
    border-radius: 8px;
    margin: 16px 0;
    font-size: 15px;
}

.modal-content button {
    width: 100%;
    background: #2563EB;
    color: white;
    border: none;
    padding: 14px;
    border-radius: 8px;
    font-size: 15px;
    font-weight: 600;
    cursor: pointer;
}

.modal-content button:hover {
    background: #1D4ED8;
}
```

---

## PRODUCT DATA (JavaScript Object)

```javascript
const vantixProducts = {
    phase1: [
        { name: "Semaglutide 10mg", price: 38, category: "glp", coa: true },
        { name: "Tirzepatide 30mg", price: 48, category: "glp", coa: true },
        { name: "Retatrutide 10mg", price: 42, category: "glp", coa: true },
        { name: "Retatrutide 20mg", price: 58, category: "glp", coa: true },
        { name: "BPC-157 5mg", price: 30, category: "repair", coa: true },
        { name: "TB-500 5mg", price: 34, category: "repair", coa: true },
        { name: "CJC-1295 (no DAC) 5mg", price: 30, category: "gh", coa: true },
        { name: "Ipamorelin 5mg", price: 24, category: "gh", coa: true },
        { name: "Epithalon 50mg", price: 38, category: "longevity", coa: true },
        { name: "Melanotan II 10mg", price: 28, category: "seasonal", coa: true },
        { name: "BAC Water 30ml", price: 8, category: "supply", coa: false }
    ],
    phase2: [
        { name: "NAD+ 1000mg", price: 34, category: "longevity", desc: "Nicotinamide adenine dinucleotide for cellular energy." },
        { name: "Semax 10mg", price: 28, category: "cognitive", desc: "Neuropeptide for cognitive enhancement research." },
        { name: "Selank 10mg", price: 28, category: "cognitive", desc: "Anxiolytic peptide for neurological research." },
        { name: "Thymosin Alpha-1 5mg", price: 38, category: "immune", desc: "Immune modulation research compound." },
        { name: "AOD-9604 2mg", price: 30, category: "metabolic", desc: "Fat metabolism research peptide." }
    ],
    stacks: [
        { name: "Repair Stack", products: ["BPC-157 5mg", "TB-500 5mg"], price: 54, original: 64, discount: "15%" },
        { name: "GH Stack", products: ["CJC-1295 (no DAC) 5mg", "Ipamorelin 5mg"], price: 46, original: 54, discount: "15%" },
        { name: "GLP Power", products: ["Retatrutide 10mg", "Tirzepatide 30mg"], price: 81, original: 90, discount: "10%" },
        { name: "Beginner GLP", products: ["Semaglutide 10mg", "BAC Water 30ml"], price: 41, original: 46, discount: "10%" },
        { name: "Advanced GLP", products: ["Retatrutide 20mg", "Semaglutide 10mg"], price: 86, original: 96, discount: "10%" },
        { name: "Summer Lean", products: ["Melanotan II 10mg", "CJC-1295 (no DAC) 5mg", "Ipamorelin 5mg"], price: 72, original: 82, discount: "12%" }
    ]
};
```

---

## IMPLEMENTATION CHECKLIST

### **Immediate (Today):**
- [ ] Add product data object to shop.html
- [ ] Update existing product cards with Phase 1 pricing
- [ ] Add Phase 2 "Coming Soon" cards
- [ ] Implement email capture modal (localStorage for now)
- [ ] Add stack bundle section

### **Near-Term (This Week):**
- [ ] Create individual product pages with dual testing badge
- [ ] Add batch testing display (VX Bundle ID mockup)
- [ ] Write SEO product descriptions
- [ ] Test cart flow with bundles
- [ ] Mobile QA on all product cards

### **Future:**
- [ ] Backend for email waitlist (replace localStorage)
- [ ] Actual COA integration via VX Bundle ID
- [ ] Product page optimization
- [ ] A/B test stack positioning

---

## NOTES

### **Keeping It Simple:**
- ✅ Vanilla JavaScript (no React, Vue, etc.)
- ✅ localStorage for cart (no database yet)
- ✅ Modal for email capture (no Mailchimp API yet)
- ✅ Static product data (can move to JSON file later)
- ✅ Minimal CSS additions (reuses existing styles)

### **Why This Approach:**
- Fast to implement
- No API dependencies
- Easy to modify
- Low token usage
- Progressive enhancement path

### **Migration Path:**
1. **Now:** localStorage → **Later:** Backend API
2. **Now:** Hardcoded product data → **Later:** CMS or JSON
3. **Now:** Modal email capture → **Later:** Mailchimp/ConvertKit
4. **Now:** Static stacks → **Later:** Dynamic cart bundles

---

**READY TO IMPLEMENT?**

Confirm and I'll update shop.html with Phase 1 pricing + Phase 2 coming soon + stacks.

---

**END OF IMPLEMENTATION DOCUMENT**
