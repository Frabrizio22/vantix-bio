# Polish Fixes - Priority Order

## 1. HIGH PRIORITY: Spacing & Layout

### Fix A: Protocol-Optimized Section Inline Styles
**Location:** index.html line ~950
**Issue:** Inline `padding: 56px 32px` and other inline styles
**Solution:** Create `.section-highlight` class

### Fix B: Section Padding Consistency
**Issue:** Different padding values across breakpoints
**Solution:** Standardize to: 64px desktop, 48px tablet, 32px mobile

### Fix C: Section Separator Gaps
**Issue:** Inconsistent use of `.section-separator`
**Solution:** Ensure all major sections have 64px gap

## 2. HIGH PRIORITY: Button Styling

### Fix D: CTA Button Hover States
**Issue:** Need consistent hover effects
**Solution:** Add transform + shadow on all buttons

### Fix E: Button Color Consistency
**Issue:** Verify all primary buttons use #2563EB
**Solution:** Audit and fix any off-brand blues

## 3. MEDIUM PRIORITY: Mobile Polish

### Fix F: Shop Product Grid
**Issue:** Check card sizing on mobile
**Solution:** Ensure responsive grid doesn't break

### Fix G: Hero Mobile Spacing
**Issue:** Hero might be too cramped on small screens
**Solution:** Adjust padding for 375px width

## 4. MEDIUM PRIORITY: Typography

### Fix H: Remove Inline Font Sizes
**Issue:** Protocol section h2 has inline `font-size: 36px`
**Solution:** Use `.section-title-large` class instead

## 5. LOW PRIORITY: Footer

### Fix I: Footer Link Hover States
**Issue:** Ensure smooth color transitions
**Solution:** Add transition: color 0.2s

## 6. LOW PRIORITY: Product Cards

### Fix J: Uniform Card Heights
**Issue:** Shop cards might have inconsistent heights
**Solution:** Use flexbox to equalize

