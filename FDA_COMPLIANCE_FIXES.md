# FDA Compliance Fixes - Execution Log

## Phase 1: Critical Removals (High Enforcement Risk)

### 1. Remove GLP-1 Comparison Article
- [ ] Delete or archive tirzepatide-vs-retatrutide-vs-semaglutide articles
- [ ] Remove any "Choose X if" buying guides
- [ ] Remove weight loss percentage comparisons

### 2. Bacteriostatic Water References
Files to fix:
- products/retatrutide.html
- products/nad-1000mg.html
- products/bpc-157.html
- products/semaglutide.html
- products/tb-500.html
- products/ghk-cu.html
- products/tirzepatide.html
- products/mots-c.html
- products/ipamorelin.html

Replace: "bacteriostatic water" → "appropriate research diluent" or "sterile water for laboratory use"

### 3. Remove "Free Laboratory Solvent Kit"
- [ ] Check shop.html
- [ ] Check homepage
- [ ] Remove bundled solvent references

### 4. Remove "Discreet, Unmarked Packaging"
- [ ] Check shop.html "What to Expect" section
- [ ] Replace with "Professional packaging" or remove entirely

### 5. Zelle Discount Language
- [ ] Keep Zelle as payment option
- [ ] Remove 5% discount incentive
- [ ] Don't highlight Zelle over other methods

### 6. Fix Terms of Service Entity Name
- [ ] Find "PRC LABS LLC"
- [ ] Replace with "Vantix Bio LLC"
- [ ] Check all legal pages (terms, privacy, disclaimer)

## Phase 2: High-Priority Content Fixes

### 7. "Complete Research Cycles" Language
Pages to audit:
- about.html
- product pages
- Any "28 days at 250mcg" math

Replace with: "Vial sizes designed for extended research protocols"

### 8. "Clinical-Grade" → "Research-Grade"
Global find/replace:
- "clinical-grade" → "research-grade"
- "forensic-grade" → "analytical-grade"

### 9. Fix Pricing Inconsistencies
Check:
- Homepage kit prices
- Shop page kit prices
- Kits page prices
- Ensure all match

### 10. Product Page Benefit Language
Example fixes:
- "accelerates tissue repair" → "modulates VEGF expression in tissue culture"
- "enhances healing" → "affects collagen synthesis pathways"
- Remove "In plain terms:" sections that frame benefits

## Phase 3: Research Applications Reframing

### 11. Remove Disease Indication Language
Replace:
- "Achilles tendon healing" → "collagen synthesis in connective tissue models"
- "muscle tear recovery" → "myocyte proliferation studies"
- "gastric ulcer healing" → "gastric epithelial cell research"
- "bone-tendon interface repair" → "osteoblast-fibroblast interaction studies"

### 12. Endotoxin Testing Prominence
- Move from hero selling point
- List in technical specifications
- Don't lead marketing with it

### 13. Remove "True Cost" Shopping Math
- Delete consumer price comparison sections
- Keep purity verification information
- Frame as analytical reference standards

## Research Content Updates (2024-2026)

### Compounds Needing Citation Updates:
1. Retatrutide - SURMOUNT trials (2023-2024)
2. Tirzepatide - SURPASS/SURMOUNT data
3. Semaglutide - SELECT CV outcomes (2023)
4. BPC-157 - Any new mechanistic studies
5. TB-500/Thymosin β4 - Recent tissue engineering
6. NAD+ - Longevity research updates
7. MOTS-c - Mitochondrial function studies

### Citation Verification Protocol:
For each study cited:
1. Verify PMID exists in PubMed
2. Check publication date
3. Confirm author names match
4. Verify study conclusions match claims
5. Add 2024-2026 studies where available
6. Remove any potentially hallucinated references

## Execution Checklist
- [ ] Phase 1 complete (critical fixes)
- [ ] Phase 2 complete (content compliance)
- [ ] Phase 3 complete (research reframing)
- [ ] Citation audit complete
- [ ] Test all pages load
- [ ] Deploy to production
- [ ] Archive old versions
