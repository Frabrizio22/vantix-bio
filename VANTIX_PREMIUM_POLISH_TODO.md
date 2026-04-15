# Vantix Premium Polish - Pre-Launch Checklist

> **WHEN TO DO THIS:** After Janoshik COAs arrive, before flipping site live
> **ESTIMATED TIME:** 2-3 hours total
> **IMPACT:** Takes site from 7.5/10 → 8.5-9/10 premium feel

---

## 🎯 HIGH IMPACT (Do First)

### 1. Fix Orange Pre-Launch Bar (5 min) ⚡
**Problem:** Orange = discount/urgency/Shopify. Brand = clinical/precision.

**Fix:**
- Change background: `#FF6B35` → `#1A2B44` (dark navy)
- OR remove entirely and replace with subtle outline banner
- Text color: white
- Remove "🧬" emoji (too casual)

**Where:** 
- `index.html` - pre-launch banner div
- `shop.html` - pre-launch banner div

---

### 2. Rebuild Hero Section (1 hour) 🔥
**Problem:** Chromatogram is your moat but feels like a card, not a centerpiece.

**New Structure:**
```
┌─────────────────────────────────────────┐
│  Left (50%)          Right (50%)        │
│                                         │
│  Forensic-Grade      [BIG CHROMATOGRAM]│
│  Research Peptides   (not in card)     │
│                                         │
│  Every batch         Under it:         │
│  verified with       "99.2% purity     │
│  HPLC + LC-MS +      Batch VX-BPC10-001│
│  Endotoxin testing   Verified 2026-04" │
│                                         │
│  [View Verification] [Browse Catalog]  │
└─────────────────────────────────────────┘
```

**Specific changes:**
- Chromatogram: Remove card wrapper, make 2x larger
- Add live batch data below chromatogram (from actual COA)
- Headline: Increase font-weight to 800, size to 48px
- Subtext: Reduce to 16px, increase line-height
- CTAs: Side-by-side, not stacked

---

### 3. Typography Hierarchy (30 min) 📐
**Problem:** Everything same weight = nothing stands out.

**Fix:**
- **Headlines (h1):** 800 weight, 48px, -0.03em letter-spacing
- **Section titles (h2):** 700 weight, 32px, -0.02em letter-spacing  
- **Body text:** 500 weight, 16px, 1.6 line-height
- **Reduce spacing between elements:** 80% of current gaps
- **Increase contrast:** Section titles darker (#0A1628 vs #1A2B44)

**Where:**
- Global CSS in `<style>` blocks
- Apply consistently across index.html, shop.html, product pages

---

## 💎 MEDIUM IMPACT (Do Second)

### 4. Reduce Grey Card Overload (30 min)
**Problem:** Every section = rounded grey card = soft SaaS feel.

**Fix:**
- Keep cards ONLY for: Products, Key proof sections
- Remove cards from: FAQ, Trust indicators, Text blocks
- Add full-width sections with dark backgrounds for contrast
- Mix in hard-edge sections (0px border-radius)

**Example:**
```css
/* Keep soft for products */
.product-card { border-radius: 12px; }

/* Make sharp for data/verification */
.verification-block { 
  border-radius: 0; 
  border-left: 4px solid #2563EB; 
}
```

---

### 5. Enlarge Verification Visuals (20 min)
**Problem:** LC-MS graph, endotoxin data = tiny cards.

**Fix:**
- Verification section: Make full-screen width
- Chromatograms: 2x current size
- Split-screen comparison: Actually split screen (50/50)
- Remove padding/margins around data visuals

---

### 6. Upgrade CTA Buttons (15 min)
**Problem:** Buttons blend in, don't create urgency.

**Fix:**
- Primary CTA: Larger (16px → 18px), bolder (600 → 700)
- Add subtle animation on hover (scale: 1.02, shadow increase)
- Use blue gradient on primary: `linear-gradient(135deg, #2563EB, #1E40AF)`
- Secondary CTA: Outline style, not filled

---

## 🧪 NICE-TO-HAVE (Do If Time)

### 7. Interactive Verification Demo (1 hour)
**Instead of:** Empty "Enter Batch ID" field

**Do:**
- Pre-fill with example: `VX-BPC10-001`
- Button: "View Example Report"
- Opens modal with: Split-screen COA, chromatogram, purity data
- Builds trust before they even have a batch

**Tech:**
- Create sample COA HTML
- Modal trigger on button click
- Show real data format (just example batch)

---

### 8. Add Micro-Animations (30 min)
**Subtle polish:**
- Product cards: Hover = slight lift + shadow increase
- Chromatogram: Fade-in on scroll into view
- Trust badges: Stagger fade-in (0.1s delay between each)
- Verification blocks: Slide-in from left on scroll

**Use:** Intersection Observer API or simple CSS transitions

---

### 9. Mobile Hero Optimization (20 min)
**Problem:** Two-column hero doesn't work on mobile.

**Fix:**
- Stack: Headline → Chromatogram → CTAs
- Chromatogram: Smaller but still prominent
- Keep data below chromatogram
- CTAs: Full-width, stacked

---

## 📋 LAUNCH DAY CHECKLIST (After All Above)

- [ ] Upload real Janoshik PDFs to `/coa/`
- [ ] Update all spec lines with actual purity %
- [ ] Wire COA links to real PDFs (not placeholders)
- [ ] Change "Join Waitlist" → "Add to Cart" across all products
- [ ] Update hero chromatogram with real batch data
- [ ] Remove pre-launch banner entirely
- [ ] Enable Vantix checkout Worker
- [ ] Test verification portal with real batch IDs
- [ ] Send email to 7 waitlist subscribers
- [ ] Post to Reddit: "First vendor with forensically secured COA portal"

---

## 🎨 Design Philosophy (Keep This in Mind)

**Vantix Brand Feel:**
- Clinical / Precision / Evidence-driven
- NOT: Soft / SaaS / Friendly
- Think: Lab equipment site, not health blog

**Visual Language:**
- Sharp edges > rounded corners (for data sections)
- High contrast > soft gradients (for hierarchy)
- Data-forward > marketing copy (show, don't tell)
- Monospace fonts for batch IDs / data (adds precision feel)

**Color Psychology:**
- Dark navy = authority, precision
- Blue = trust, science
- White space = clarity
- Orange/Yellow = AVOID (urgency/discount)

---

## 💰 When NOT to Do This

**Skip if:**
- Revenue < $5k/month (focus on traction, not polish)
- No COAs yet (you can't leverage verification)
- Traffic < 100 users/day (not enough data to optimize)

**Do when:**
- COAs in hand + ready to launch
- Revenue stable at $8-10k/month
- Converting visitors but want to increase AOV/trust

---

## 📂 Files to Edit

1. `index.html` - Hero, pre-launch banner, typography
2. `shop.html` - Same as index
3. Global CSS - Typography system, card styles
4. `/coa/*.pdf` - Upload real Janoshik reports
5. `verify.html` - Wire to real batch IDs

---

**SAVED FOR LAUNCH DAY. Come back to this file when COAs arrive.**
