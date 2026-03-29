# Vantix Bio - Batch 001 Summary
**First Production Batch - March 2026**

---

## 📦 Batch IDs Generated (10 Products)

| # | Product | Batch ID | Supplier | Cost/Box |
|---|---------|----------|----------|----------|
| 1 | BPC-157 10mg | **VX-BPC10-001** | Dora | $64 |
| 2 | TB-500 10mg | **VX-TB10-001** | Dora | $124 |
| 3 | CJC-1295 5mg | **VX-CJC5-001** | Bane | $65 |
| 4 | Ipamorelin 5mg | **VX-IPA5-001** | Dora | $24 |
| 5 | MOTS-C 10mg | **VX-MOTS10-001** | Dora | $50 |
| 6 | NAD+ 1000mg | **VX-NAD1K-001** | Bane | $130 |
| 7 | GHK-Cu 100mg | **VX-GHK100-001** | Bane | $40 |
| 8 | Semaglutide 10mg | **VX-SEMA10-001** | Dora | $54 |
| 9 | Tirzepatide 30mg | **VX-TIRZ30-001** | Bane | $125 |
| 10 | Retatrutide 20mg | **VX-RETA20-001** | Bane | $175 |

**Total Product Cost: $851**
**Total Testing Cost: $2,250** (10 products × $225)
**Total Launch Investment: $3,101**

---

## 🔢 Batch ID Format Explanation

**Format: VX-[PRODUCT][DOSE]-[BATCH]**

- **VX** = Vantix prefix
- **PRODUCT** = Abbreviated product name (BPC, TB, CJC, etc.)
- **DOSE** = Dosage amount (10, 5, 1K, etc.)
  - **Note:** NAD+ uses "1K" for 1000mg (industry standard shorthand)
- **BATCH** = Sequential batch number (001, 002, 003...)

**Examples:**
- VX-BPC10-001 = Vantix BPC-157 10mg, Batch #1
- VX-NAD1K-001 = Vantix NAD+ 1000mg, Batch #1
- VX-TIRZ30-002 = Vantix Tirzepatide 30mg, Batch #2 (future reorder)

---

## 📱 QR Code Generation

### How to Use:
1. **Open:** `batch_qr_generator.html` in any web browser
2. **View:** All 10 QR codes are displayed with product names and batch IDs
3. **Download:** 
   - Click individual "Download PNG" buttons for each product
   - OR click "Download All" to get all 10 QR codes at once (500ms delay between each)
4. **Print Size:** **4-5cm × 4-5cm (1.6-2 inches)** - ideal for easy scanning
   - **Minimum:** 2.5cm × 2.5cm (harder to scan reliably)
   - **Recommended:** 4cm × 4cm (comfortable scanning at angles)

### QR Code Links:
Each QR code links to: `https://vantixbio.com/verify.html?batch=[BATCH_ID]`

**Example:**
- Scan VX-BPC10-001 QR code
- Opens: `https://vantixbio.com/verify.html?batch=VX-BPC10-001`
- Portal auto-fills batch ID and displays COA when uploaded

---

## 📋 Tracking Spreadsheet

**File:** `batch_001_tracking.csv`

**Columns:**
- Batch ID
- Product Name
- Dosage
- Manufacturing Date
- Supplier (Dora or Bane)
- Cost Per Box
- Testing Lab (fill in after lab selection)
- Testing Cost
- COA Status (Pending → Received → Uploaded)
- COA Upload Date
- Notes

**How to Use:**
1. Open in Excel/Google Sheets
2. Update "Manufacturing Date" when products ship from supplier
3. Fill in "Testing Lab" after lab decision
4. Update "COA Status" as testing progresses:
   - **Pending** → Products ordered
   - **Shipped to Lab** → Products in transit
   - **Testing** → Lab received products
   - **COA Received** → Results back from lab
   - **Uploaded** → COA added to verify.html portal
5. Add notes as needed (e.g., "Reordered 2nd batch", "Testing delayed", etc.)

---

## 🏷️ Label Workflow

### Step 1: Generate QR Codes
- Open `batch_qr_generator.html`
- Download all 10 QR codes as PNG files

### Step 2: Update Your Canva Label Template
- Import QR code PNGs into Canva
- Replace placeholder QR code with correct batch ID QR
- Update batch ID text to match (e.g., "BATCH: VX-TIRZ30-001")
- **Ensure QR code is 4-5cm × 4-5cm** on final print
- Repeat for all 10 products

### Step 3: Print Labels
- Export each label from Canva as PNG/PDF
- Print on adhesive label paper (recommended size: match your box dimensions)
- QR code should be **4-5cm × 4-5cm** for easy scanning

### Step 4: Apply to Product Boxes
- Affix labels to each 10-vial box
- Ensure QR code is visible and not obscured

---

## 🧪 Testing Workflow

### Step 1: Order Products from Suppliers
**Dora Order (5 products):**
- BPC-157 10mg × 1 box = $64
- TB-500 10mg × 1 box = $124
- Ipamorelin 5mg × 1 box = $24
- MOTS-C 10mg × 1 box = $50
- Semaglutide 10mg × 1 box = $54
- **Dora Subtotal: $316**

**Bane Order (5 products):**
- CJC-1295 5mg × 1 box = $65
- NAD+ 1000mg × 1 box = $130
- GHK-Cu 100mg × 1 box = $40
- Tirzepatide 30mg × 1 box = $125
- Retatrutide 20mg × 1 box = $175
- **Bane Subtotal: $535**

**Total Product Cost: $851**

### Step 2: Receive Products
- Inspect packaging for damage
- Verify product names and dosages match order
- Take 1 vial from each box for testing
- Apply batch ID labels to remaining 9-vial boxes

### Step 3: Ship to Testing Lab
- Package 10 test vials securely (dry ice if needed)
- Include batch ID list and testing panel request:
  - **Purity Testing** (HPLC-DAD)
  - **Identity Verification** (LC-MS/MS)
  - **Endotoxin Testing** (LAL method)
- Ship to lab (TBD: Freedom Analytical or competitor at $225/product)

### Step 4: Receive COAs (7-10 days)
- Download COA PDFs from lab
- Rename files to match batch IDs (e.g., `VX-BPC10-001_COA.pdf`)
- Store in `/vantix/coas/` directory

### Step 5: Upload to Verification Portal
- Update `verify.html` database with batch IDs
- Upload COA PDFs and chromatogram images
- Test each QR code to ensure it loads correct COA
- Mark "COA Status" as "Uploaded" in tracking spreadsheet

---

## 💰 Financial Summary

### Investment Breakdown:
| Item | Cost |
|------|------|
| Dora Products (5) | $316 |
| Bane Products (5) | $535 |
| ISO Testing (10 × $225) | $2,250 |
| **Total Launch Cost** | **$3,101** |

### Savings vs 11 Products:
- Dropped Epithalon ($155 + $225 testing = $380 saved)

### Revenue Potential (First Batch):
Each box = 9 saleable vials (1 used for testing)

| Product | Retail Price | 9 Vials Revenue | Net Profit (After Testing) |
|---------|--------------|-----------------|----------------------------|
| BPC-157 10mg | $38 | $342 | $53 (18% margin) |
| TB-500 10mg | $38 | $342 | -$7 (needs price increase) |
| CJC-1295 5mg | $36 | $324 | $34 (12% margin) |
| Ipamorelin 5mg | $36 | $324 | $75 (30% margin) |
| MOTS-C 10mg | $32 | $288 | $13 (5% margin) |
| NAD+ 1000mg | $72 | $648 | $293 (82% margin) 🔥 |
| GHK-Cu 100mg | $42 | $378 | $113 (43% margin) |
| Semaglutide 10mg | $47 | $423 | $144 (51% margin) |
| Tirzepatide 30mg | $72 | $648 | $298 (85% margin) 🔥 |
| Retatrutide 20mg | $78 | $702 | $327 (87% margin) 🔥 |
| **TOTAL** | | **$4,419** | **$1,343** |

**First batch margin: 30% (after one-time testing costs)**
**Subsequent batches: 70-87% margin** (no testing required)

---

## 📏 QR Code Size Guidelines

### Recommended Sizes:
- **Ideal:** 4-5cm × 4-5cm (1.6-2 inches) - easy scanning from any angle
- **Minimum:** 2.5cm × 2.5cm (1 inch) - barely scannable, not recommended
- **Maximum:** No limit, but 5cm is sufficient

### Why Size Matters:
- **Too small:** Hard to scan, customers frustrated
- **Too large:** Wastes label space, looks unprofessional
- **Just right (4-5cm):** Scans instantly, looks professional, fits well on boxes

### Testing Your QR Codes:
1. Print one QR code at 4cm × 4cm
2. Test with multiple phones (iPhone, Android)
3. Try scanning from different angles and distances
4. If scans reliably → print all labels
5. If doesn't scan → increase size to 5cm

---

## 📌 Next Steps

### Immediate (This Week):
1. ✅ **Batch IDs generated** - 10 products confirmed
2. ✅ **QR codes ready** - Open `batch_qr_generator.html` to download
3. ✅ **Tracking spreadsheet created** - `batch_001_tracking.csv`
4. ⏳ **Update Canva labels** - Replace QR codes and batch IDs, ensure 4-5cm size
5. ⏳ **Tell Fiverr** - Update 3D renders with correct batch IDs (see list above)
6. ⏳ **Finalize testing lab** - Negotiate pricing or find $225 competitor
7. ⏳ **Order products** - Place orders with Dora ($316) and Bane ($535)

### After Products Arrive (Week 2-3):
1. Inspect products
2. Apply batch ID labels to boxes
3. Pull 1 vial from each box for testing
4. Ship 10 test vials to lab
5. Update tracking spreadsheet with dates

### After COAs Arrive (Week 3-4):
1. Download and rename COA PDFs
2. Upload to verification portal
3. Test all QR codes
4. Launch Vantix site with "View COA" functionality
5. Execute launch marketing (ad campaign, Reddit, email)

---

## 🗂️ Files Created

1. **batch_qr_generator.html** - Interactive QR code generator (open in browser)
2. **batch_001_tracking.csv** - Batch tracking spreadsheet (open in Excel/Sheets)
3. **BATCH_001_SUMMARY.md** - This document (reference guide)

---

## 🔐 Batch ID Management

### When to Create New Batch IDs:
- **Reordering same product** → Increment batch number (e.g., VX-BPC10-002)
- **Different dosage** → New product code (e.g., VX-BPC5-001 for BPC-157 5mg)
- **Different supplier** → Same batch number series (don't restart at 001)

### Best Practices:
- **Never reuse batch IDs** - Each production run gets unique number
- **Track manufacturing dates** - Critical for shelf life and stability
- **Log supplier** - Important for quality control and reordering
- **Document any issues** - Use "Notes" column in tracking spreadsheet
- **Test every batch** - Even if same supplier, each batch gets tested

---

## 📝 Fiverr Update Message

Send this to your Fiverr designer:

> Hi! Before final delivery, please update batch IDs on all 10 product renders:
> 
> 1. BPC-157 → VX-BPC10-001
> 2. TB-500 → VX-TB10-001
> 3. CJC-1295 → VX-CJC5-001
> 4. Ipamorelin → VX-IPA5-001
> 5. MOTS-C → VX-MOTS10-001
> 6. NAD+ → VX-NAD1K-001
> 7. GHK-Cu → VX-GHK100-001
> 8. Semaglutide → VX-SEMA10-001
> 9. Tirzepatide → VX-TIRZ30-001
> 10. Retatrutide → VX-RETA20-001
> 
> Also, please confirm Tirzepatide dosage shows **30mg** (not 10mg).
> 
> Thanks!

---

**Questions?** Update this document as you refine the process. This is your batch management system—make it work for you.
