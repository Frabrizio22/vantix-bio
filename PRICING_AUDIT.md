# Vantix Pricing Audit - May 31, 2026

## Pricing Discrepancies Found

### ❌ GHK-Cu 100mg
- **shop_products_data.js**: $34 ✓ (correct)
- **ghk-cu.html**: **$42** ❌ (WRONG - needs update)

### ❌ NAD+ 1000mg  
- **shop_products_data.js**: $68 ✓ (correct)
- **nad-1000mg.html**: **$72** ❌ (WRONG - needs update)

### ✅ Retatrutide 20mg
- **shop_products_data.js**: $68 ✓
- **retatrutide.html**: $68 ✓ (correct)

## Action Required

Fix these product pages:
1. `products/ghk-cu.html` → Change $42 to $34
2. `products/nad-1000mg.html` → Change $72 to $68

## Full Price List (from shop_products_data.js - SOURCE OF TRUTH)

### GLP-1 / GIP Agonists
- Tirzepatide 30mg: $62
- Retatrutide 20mg: $68
- Semaglutide 10mg: $42

### Growth Hormone Peptides
- CJC-1295 10mg: $42
- Ipamorelin 5mg: $30
- Tesamorelin 10mg: $52
- AOD-9604 10mg: $52

### Specialty Compounds
- BPC-157 10mg: $30
- TB-500 10mg: $38
- GHK-Cu 100mg: $34
- MOTS-C 10mg: $32
- NAD+ 1000mg: $68
- Melanotan II 10mg: $28

### Research Kits
- BPC-157 + TB-500: $58 (save $10)
- CJC-1295 + Ipamorelin: $62 (save $10)
- Tirzepatide + Retatrutide: $115 (save $15)
- NAD+ + MOTS-C: $90 (save $10)
