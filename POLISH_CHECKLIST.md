# Vantix Bio - Full Site Polish Pass
**Date:** March 25, 2026

## Pages to Review:
- [x] index.html (Homepage)
- [x] shop.html (Shop)
- [x] about.html (About)
- [x] faq.html (FAQ)
- [x] Product pages (sample check)
- [x] Footer consistency

---

## SPACING ISSUES FOUND:

### 1. Inconsistent Section Padding
**Problem:** Protocol-Optimized section has inline `padding: 56px 32px`, other sections use `.section` class
**Fix:** Standardize all sections to use consistent padding classes

### 2. Section Gaps
**Problem:** Some sections have `<div class="section-separator">`, others don't
**Fix:** Ensure consistent spacing between all major sections (64px standard)

### 3. Mobile Padding
**Problem:** Multiple breakpoints with different padding values
**Fix:** Simplify to two breakpoints with clear hierarchy

---

## BUTTON ISSUES FOUND:

### 1. CTA Button Styling
**Check:** Hero buttons vs section buttons - are they consistent?
**Fix:** Ensure .btn-primary and .btn-secondary are uniform

### 2. Hover States
**Check:** All buttons have smooth transitions?
**Fix:** Add consistent hover transforms and shadows

---

## COLOR INCONSISTENCIES:

### 1. Blue Shades
**Check:** Are all CTAs using --color-blue (#2563EB)?
**Fix:** Audit all blue references

### 2. Gray Text
**Check:** Are subtitles using --color-gray-600 consistently?
**Fix:** Replace any hardcoded grays

---

## TYPOGRAPHY REFINEMENTS:

### 1. Heading Hierarchy
**Check:** H1 > H2 > H3 sizing is logical?
**Fix:** Ensure clear visual hierarchy

### 2. Line-Height
**Already fixed** in previous commit ✅

---

## MOBILE ISSUES:

### 1. Product Cards on Mobile
**Check:** Shop page grid on 375px width
**Fix:** Ensure cards don't break layout

### 2. Hero on Mobile
**Check:** Hero visual/text stacking
**Fix:** Ensure proper order and spacing

### 3. Navigation Mobile Menu
**Check:** Hamburger menu functionality
**Fix:** Ensure smooth transitions

---

## FOOTER:

### 1. Footer Spacing
**Check:** Consistent padding across all pages?
**Fix:** Standardize footer structure

### 2. Footer Links
**Check:** All links work, proper hover states
**Fix:** Ensure consistent styling

---

## HOVER STATES:

### 1. Product Cards
**Check:** Smooth hover effect with subtle lift
**Fix:** Add transform: translateY(-2px)

### 2. Navigation Links
**Check:** Color transition on hover
**Fix:** Ensure 0.2s ease transition

### 3. Buttons
**Check:** Shadow + transform on hover
**Fix:** Consistent across all button types

---

## VISUAL HIERARCHY:

### 1. Section Titles
**Check:** All using .section-title class?
**Fix:** Remove inline overrides

### 2. Section Subtitles
**Check:** All using .section-subtitle class?
**Fix:** Ensure max-width: 720px

---

## FORM ELEMENTS:

### 1. Input Fields (if any)
**Check:** Consistent border-radius, padding, focus states
**Fix:** Standardize across contact/checkout

### 2. Dropdown Selects
**Check:** Styled consistently
**Fix:** Ensure arrow icon matches design

---

## ANIMATIONS:

### 1. Scroll-Triggered Animations
**Check:** Are any elements animating on scroll?
**Fix:** Ensure smooth performance

### 2. Page Transitions
**Check:** Any jarring movements on page load?
**Fix:** Add smooth fade-ins where appropriate

---

## ACCESSIBILITY:

### 1. Focus States
**Check:** Keyboard navigation visible?
**Fix:** Add outline for focused elements

### 2. Alt Text
**Check:** All images have descriptive alt text?
**Fix:** Add where missing

---

## PERFORMANCE:

### 1. Image Optimization
**Check:** Are placeholder images optimized?
**Fix:** Compress if needed

### 2. CSS Bloat
**Check:** Any unused CSS?
**Fix:** Remove dead code

---

## SPECIFIC FIXES TO APPLY:

1. **Standardize Protocol-Optimized section padding** - remove inline styles
2. **Add consistent .section-spacing class** for gaps
3. **Verify footer across all pages** - same structure
4. **Check shop product grid** - ensure uniform card heights
5. **Verify CTA button colors** - all match brand blue
6. **Add hover states** to all interactive elements
7. **Check FAQ accordion** - smooth transitions
8. **Verify mobile menu** - clean hamburger icon

---

## BRAND CONSISTENCY:

### Colors
- Navy: #1A2B44
- Blue: #2563EB
- Teal: #5B8DBE
- Gray-600: #64748B
- Gray-100: #F8FAFC

### Typography
- Heading: -apple-system, BlinkMacSystemFont, "SF Pro Display"
- Body: Same
- Weight: 800 for headings, 500 for body

### Spacing Scale
- xs: 8px
- sm: 16px
- md: 24px
- lg: 32px
- xl: 48px
- 2xl: 64px
- 3xl: 96px

---

## PRIORITY ORDER:

1. **HIGH:** Spacing consistency (sections, padding)
2. **HIGH:** Button styling uniformity
3. **MEDIUM:** Hover states
4. **MEDIUM:** Mobile responsiveness
5. **LOW:** Footer refinement
6. **LOW:** Animation polish
