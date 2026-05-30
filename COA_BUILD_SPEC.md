# COA System Build Spec — To Build When COAs Arrive

## Current Status (May 29, 2026)

### ✅ Already Built
- **Verification portal** (`verify.html`) - fully functional
- **Shop page** (`shop.html`) - layout exists
- **COA storage** (`/coa/`) - directory exists with Reta PDFs
- **Batch format** - VX-{PRODUCT}-{NUM} established

### ❌ To Build When COAs Ready

#### 1. Current-COA Library Page (`/coa.html`)

**Purpose:** 
- Public, Reddit-linkable page showing current batch for each active SKU
- Updates when new batches arrive (old batches roll off)
- No historical archive - only what's currently in stock
- **Distinct from verify.html:** This is "browse all current testing", verify is "verify your specific batch"

**URL:** `/coa.html`  
**Nav label:** "Lab Results" (legible to everyone, not jargon)

**Layout:**
```
Table/Grid showing:
- Product Name
- Batch Number
- Purity %
- Endotoxin Result
- Test Date
- View Purity/Identity COA (PDF)
- View Endotoxin COA (PDF)
- Verify on Janoshik link
```

**Navigation Integration:**
- Add "Lab Results" to both mobile and desktop nav (NOT "COAs" - too jargony)
- URL is `/coa.html` (SEO-friendly, industry standard)
- Nav text and URL don't need to match - different jobs
- Desktop: In main nav bar
- Mobile: In hamburger menu
- Should fit existing nav style (Fraunces serif headings, Geist body, JetBrains Mono for data)

---

#### 2. Product Page COA Buttons (`shop.html`)

**Add to each product card:**
- "View COA" button (or "View Purity COA" + "View ID COA" separate buttons)
- Links to current batch PDFs in `/coa/`
- Only show when COAs exist for that product

**Example:**
```html
<div class="product-cta">
  <button class="btn-waitlist">Join Waitlist</button>
  <a href="/coa/VX-RETA20-001-purity.pdf" class="coa-link" target="_blank">
    View Purity COA →
  </a>
  <a href="/coa/VX-RETA20-001-endotoxin.pdf" class="coa-link" target="_blank">
    View Endotoxin COA →
  </a>
</div>
```

---

## Critical Notes

### COA Structure Per Product
Each batch has **2 PDFs**:
1. **Purity + Identity COA** - HPLC + LC-MS/MS results (e.g., `VX-RETA20-001-purity.pdf` or `VX-RETA20-001.pdf`)
2. **Endotoxin COA** - LAL assay results (e.g., `VX-RETA20-001-endotoxin.pdf`)

### Batch ID Format
- **Sequential is fine** - VX-RETA20-001, VX-RETA20-002, etc.
- Transparency > security theater
- Customers should be able to look up old batches

### GLP-1 Products on Library Page
- **Include Tirzepatide, Retatrutide, Semaglutide**
- Don't hide them - footprint is same as product pages
- Full transparency

### Current Batch Data Storage
Update shop.html product objects with:
```javascript
{
  name: "Retatrutide 20mg",
  currentBatch: "VX-RETA20-001",
  purity: "99.78%",
  endotoxin: "1.164 EU/vial",
  testDate: "May 18, 2026",
  coaPurityPdf: "/coa/VX-RETA20-001-purity.pdf",
  coaEndotoxinPdf: "/coa/VX-RETA20-001-endotoxin.pdf",
  janoshikPurityUrl: "https://janoshik.com/verify/?key=8LU6I66JMMVN",
  janoshikEndotoxinUrl: "https://janoshik.com/verify/?key=Y1G67KF7GTUH"
}
```

---

## Build Priority When COAs Arrive

**Phase 1 (June 1 launch prep):**
1. Upload all COA PDFs to `/coa/`
2. Update verify.html batch data with all products
3. Add "View COA" buttons to shop.html product cards
4. Build `/coa.html` library page
5. Add "Lab Results" link to navigation (mobile + desktop)
6. Ensure copy distinction: /coa.html = "see our current testing", /verify.html = "verify your batch"

**Phase 2 (post-launch):**
- Optional: Embed HPLC chromatograms in verify.html
- Optional: Batch comparison tool

---

## Design Consistency

**All COA-related pages should use:**
- **Fonts:** Fraunces (serif headers), Geist (body), JetBrains Mono (data/batch IDs)
- **Colors:** --navy (#143054), --accent (#3973B0), --hairline (#E5E5E0)
- **Layout:** Match verify.html aesthetic
- **Batch IDs:** Always in JetBrains Mono, uppercase
- **Purity values:** JetBrains Mono, bold, navy color

---

## Files to Update When Building

1. `/Users/frabrizio/.openclaw/workspace/vantix/shop.html` - Add COA buttons
2. `/Users/frabrizio/.openclaw/workspace/vantix/coa.html` - Create library page
3. `/Users/frabrizio/.openclaw/workspace/vantix/index.html` - Add "Lab Results" nav link
4. `/Users/frabrizio/.openclaw/workspace/vantix/verify.html` - Update batch data for all products (already has structure)

---

**Status:** Spec saved. Ready to build when Janoshik COAs arrive (target: June 1, 2026).
