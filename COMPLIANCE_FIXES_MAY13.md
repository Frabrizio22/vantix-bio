# Compliance Fixes - May 13, 2026

## Status: IN PROGRESS

Working through comprehensive audit document with 24 priority issues.

## Completed (P0 - Kill-Shot Issues)

### ✅ P0 #1: Meta Descriptions - Clinical Trial Data
- **Fixed:** semaglutide.html, tirzepatide.html, retatrutide.html
- **Change:** Removed STEP-1, SELECT, SURMOUNT references and weight-loss percentages
- **New format:** "X reference standard, [residues] [type]. Lyophilized, ≥99% HPLC purity. Batch-specific Janoshik COA. Research use only."
- **Commit:** e1faec5

### ✅ P0 #2: Payment Method Inconsistencies  
- **Fixed:** faq.html, privacy.html
- **Change:** Removed Zelle/CashApp mentions, removed card processor claims
- **New wording:** "Bank transfer (ACH) and cryptocurrency via Coinbase Commerce"
- **Rationale:** Zelle TOS prohibits business use, CashApp prohibits pharma
- **Commit:** 8162830

## In Progress (P0 Remaining)

### ⏳ P0 #3: Efficacy Percentages in Product Pages
- **Scope:** All /products/*.html files
- **Action needed:** Remove "72%", "85%", "48%", "52%", "59%", "44%" and similar efficacy claims
- **Pattern:** Change from result statements to mechanism descriptions
  - Old: "Affects Achilles tendon repair by 72% through..."
  - New: "Investigated for VEGF expression and collagen fiber organization in rodent tendon models (Citation)."
  
### ⏳ P0 #4: Therapeutic Language
- **Scope:** All product pages + blog articles
- **Words to replace:** therapeutic(s), therapy, treatment, treat, cure, heal (when outcome verb), patient(s), clinical efficacy, real-world
- **Acceptable:** "investigated for", "studied in [model]", "characterized in", "research applications"

### ⏳ P0 #5: Footer Disclaimer Standardization
- **Current issue:** Mixed 18+/21+ age requirements, in-vitro vs in-vitro/in-vivo
- **Target:** Single standardized footer across ALL pages
- **New standard:**
  ```
  RESEARCH USE ONLY. All Vantix Bio products are analytical reference materials intended for in vitro laboratory research only. NOT for human or veterinary consumption, diagnostic use, or therapeutic application. These materials are not drugs and are not approved by the FDA. Purchasers must be 21 years of age or older and certify qualified-researcher status at point of purchase. © 2026 Vantix Bio LLC
  ```

### ⏳ P0 #6: Entity Name Consistency  
- **Issue:** privacy.html shows "PRC Labs LLC", footers show "Vantix Bio LLC"
- **Fix:** Ensure "Vantix Bio LLC" everywhere

## Pending (P1 - High Risk)

- #7: Blog articles - move pricing/CTAs to bottom
- #8: Product price consistency (single source of truth)
- #9: Remove "forensic" language → "analytical"
- #10: Rename "The Matrix" → "Verification Protocol"
- #11: Strengthen gate.html (add researcher certification checkbox)
- #12: Replace "Add to Cart" with "Join Waitlist" during pre-launch
- #13: Remove mechanism-of-action sections from product pages
- #14: JSON-LD audit (remove drug/medical schema)
- #15: Image alt-text audit
- #16: Remove "discreet packaging" language

## Pending (P2 - Polish)

- #17-24: Template cleanup, nav consistency, HTTPS enforcement, etc.

## Files Modified So Far

- products/semaglutide.html
- products/tirzepatide.html
- products/retatrutide.html
- faq.html
- privacy.html

## Next Steps

1. Continue P0 fixes (#3-6) - most critical
2. Create systematic replacement patterns for efficacy claims
3. Batch-process all product pages with standardized changes
4. Update blog articles
5. Move to P1 issues
