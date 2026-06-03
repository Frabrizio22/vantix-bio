# Category Update Summary
**Date:** May 31, 2026  
**Status:** ✅ COMPLETE

## New FDA-Compliant Category Structure

### 1. GLP-1 / GIP Agonists (3 products)
- Tirzepatide 30mg
- Retatrutide 20mg
- Semaglutide 10mg

### 2. Growth Hormone Peptides (5 products when fully stocked)
- CJC-1295 10mg
- Ipamorelin 5mg
- Tesamorelin 10mg
- AOD-9604 10mg
- HGH 191aa (future)

### 3. Specialty Compounds (6 products when fully stocked)
- BPC-157 10mg
- TB-500 10mg
- MOTS-C 10mg
- GHK-Cu 100mg
- NAD+ 1000mg
- Melanotan II 10mg (future)

## What Was Changed

### Code Updates
- ✅ `shop_products_data.js` - Updated all product categories
- ✅ `shop.html` - Updated filter buttons to 3 categories
- ✅ Committed to GitHub (commits: 7a695a8, defc777)

### Google Sheet Updates
- ✅ Catalog tab - All 10 products updated with new category names
- ✅ Category validation needs update in Apps Script

### Category Slug Mapping
```
glp1-gip        → "GLP-1 / GIP Agonists"
gh-peptides     → "Growth Hormone Peptides"
specialty       → "Specialty Compounds"
```

## Next Steps
1. Update Apps Script category dropdown validation
2. Add HGH 191aa when inventory arrives
3. Add Melanotan II to Phase 1 when ready

## Why These Categories?
- **FDA Compliant:** Descriptive but not claiming health benefits
- **Clear for customers:** Easy to understand and navigate
- **Scientifically accurate:** Based on mechanism/structure
- **Scalable:** Can add new products to existing categories
