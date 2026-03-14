# Vantix Bio - Implementation TODO

## When First Inventory Arrives

### Visual Trust Elements (kits.html + shop.html)
**Source:** OpenAI feedback Mar 13, 2026

Add to Research Kits page when you have real batches:

1. **Mini COA preview** - Thumbnail of actual Janoshik COA
2. **Chromatogram thumbnail** - Visual proof of testing (HPLC peak)
3. **Batch Verification badge** - "Latest Batch: VX-SEMA-2026-001" with QR code link

**Where to add:**
- Kit cards: Small COA thumbnail below product list
- Shop product cards: "View Latest COA" link with chromatogram icon
- Verify page: Showcase latest batch results prominently

**Implementation:**
- Store COA PDFs in `/verify/coas/` directory
- Generate thumbnails (first page of PDF)
- Link to full verify page for each batch

**Priority:** MEDIUM (nice-to-have, strengthens scientific credibility)

---

## Other Pending Items

### Payment Integration
- [ ] Wait for Bankful backend fix (Cody investigating)
- [ ] Test ACH + Square CC once live
- [ ] Recover Customer #2 order ($226.99)

### Label System
- [ ] Order Brother VC-500W printer (~$200)
- [ ] Order CZ-1001 labels (wait for first inventory to confirm vial size)
- [ ] Design batch ID label template
- [ ] Design bundle ID label template

### Content
- [ ] Add 6 missing blog articles to blog/index.html
- [ ] Resume SEO publishing schedule (Mon/Tue/Wed/Thu)

---

**Last Updated:** March 13, 2026
