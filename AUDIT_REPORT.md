# VANTIX BIO SITE AUDIT
## Critical Issues Found

### 1. BRANDING INCONSISTENCY
**blog/index.html header:**
- Line 349: Still shows "PRC PEPTIDES" instead of "VANTIX BIO"

**Status:** CRITICAL - user-facing brand confusion

---

### 2. LOGO SIZE ISSUES
**All pages (index.html, shop.html, the-matrix.html, verify.html):**
- Header logo: 140px height (TOO LARGE for sticky header)
- Creates awkward proportions
- Logo visually dominates instead of establishing authority

**Recommended:** 60-80px for primary logo, scale appropriately

---

### 3. VERIFY PAGE HIERARCHY DISASTER
**verify.html structure (buildHTML function, line 303):**
```
Current flow:
1. Title (tiny, weak)
2. Latest COAs Section (product cards) ← WRONG PRIORITY
3. 8-Step Protocol
4. Verification Input (#verify) ← BURIED AT BOTTOM
```

**Problem:** User must scroll past product cards to actually VERIFY anything. The main tool is hidden.

**Required:** Reverse hierarchy - verification input FIRST, above fold.

---

### 4. THE-MATRIX.HTML EMPTY SPACE
**the-matrix.html (line 94):**
```css
.hero { 
    padding: 100px 32px 60px;  ← TOO MUCH TOP PADDING
}
```

**Problem:** Combined with 140px header logo + sticky header creates massive dead space at top.

**Fix:** Reduce hero padding to 40-50px top.

---

### 5. NAVIGATION DROPDOWN BEHAVIOR
**index.html, the-matrix.html (lines 74-87):**
```css
.nav-dropdown-menu { 
    transform: translateY(-8px);  ← Creates gap that breaks hover
}
```

**Status:** PARTIALLY FIXED in index.html (commit 911d90e), needs propagation to all pages.

---

### 6. INCONSISTENT DESIGN SYSTEMS
**Across all pages:**

| Element | index.html | shop.html | verify.html | blog/index.html | the-matrix.html |
|---------|-----------|-----------|-------------|----------------|----------------|
| Logo size | 140px | varies | 70px | small text | 140px |
| Header style | sticky blur | different | centered | minimal | sticky blur |
| Button style | rounded | sharp | primary | generic | rounded |
| Card style | shadow | border | minimal | blog-style | shadow |
| Typography | Inter | mixed | Inter+Mono | system | Inter |

**No unified design system exists.**

---

### 7. TYPOGRAPHY HIERARCHY WEAK
**blog/index.html:**
- Card titles: 1.1rem (too small)
- Meta text: 0.7rem (tiny, hard to read)
- No clear headline scales across pages

**the-matrix.html:**
- Step cards lack visual weight
- Protocol steps feel template-like

---

### 8. MOBILE EXPERIENCE GAPS
**Issues found:**
- Logo at 140px breaks mobile header completely
- Nav dropdowns on mobile: new hamburger menu added but not tested across all pages
- Verify page: input section still below cards on mobile = terrible UX
- Blog cards: spacing okay but hierarchy weak

---

### 9. FOOTER INCONSISTENCY
**Different footer structures:**
- index.html: 4-column footer
- shop.html: similar but different links
- blog/index.html: minimal footer
- verify.html: NO footer
- the-matrix.html: NO footer

---

### 10. SPACING + RHYTHM CHAOS
**Section padding varies wildly:**
- index.html hero: 75px
- shop.html: different
- the-matrix.html: 100px (too much)
- verify.html: minimal
- blog: 1.5rem

**No consistent vertical rhythm.**

---

## FILES REQUIRING CHANGES

### Critical Priority:
1. `blog/index.html` - Fix PRC branding
2. `verify.html` - Restructure entire page hierarchy
3. `the-matrix.html` - Fix empty space + strengthen visuals
4. `index.html` - Logo sizing + strengthen header

### High Priority:
5. `shop.html` - Align with new design system
6. All blog articles (15 files) - Header consistency
7. Create shared CSS design system

### Medium Priority:
8. Mobile responsive pass across all pages
9. Footer standardization
10. Typography scale system

---

## DESIGN SYSTEM NEEDED

### Brand Standards:
- Logo: 60px default, 50px compact header
- Primary color: #2563EB (current)
- Accent: #00B4D8 (verification/trust)
- Typography: Inter (primary), JetBrains Mono (code/technical)

### Component Standards:
- Cards: 12px border-radius, subtle shadow
- Buttons: 10px border-radius, clear hierarchy
- Inputs: 8px border-radius, clean borders
- Section padding: 60px desktop, 40px mobile

### Spacing Scale:
- 4px, 8px, 12px, 16px, 24px, 32px, 48px, 60px, 80px

---

## NEXT STEPS
1. Create unified header component
2. Fix blog branding immediately
3. Restructure verify.html (move input to top)
4. Strengthen the-matrix.html
5. Build consistent design system
6. Mobile QA pass
7. Deploy + test
