# MOBILE-FIRST UI AUDIT — EXECUTION PLAN

## Target Widths
- 375px (iPhone SE, 12 Mini, 13 Mini)
- 390px (iPhone 14, 15 standard)
- 414px (iPhone 14 Pro Max, 15 Plus)
- 480px (small tablets)
- 768px (tablets)

## Specifications

### 1. HEADER (All Pages)
- Logo: 40px height
- Header: ~64px total height
- Hamburger: right-aligned
- Cart: right-aligned with hamburger
- Vertically centered

### 2. SPACING
- Section padding: 48-64px vertical
- Card padding: 20-24px
- Element gaps: 12-16px

### 3. TYPOGRAPHY
- H1: 36px
- H2: 30px
- H3: 24px
- Body: 16-17px
- Meta: 14px
- Tighter line-height

### 4. VERIFICATION PORTAL
- Compact container
- Tight input-to-button spacing
- Slim CTA (full width)
- Placeholder fits mobile
- Bundle ID text closer

### 5. VERIFICATION CARDS
- Reduced padding
- Tight title/badge/meta spacing
- Smaller button height
- Full-width buttons

### 6. BLOG
- Reduced hero height
- Wrapping filter chips
- Tight blog cards

### 7. CHROMATOGRAM
- Reduced padding
- Smaller chart container
- Less whitespace below

### 8. QA CHECKS
- No horizontal scroll
- No overflow
- Touch-friendly buttons
- Test at all breakpoints

## Pages to Fix
1. index.html
2. shop.html
3. verify.html
4. the-matrix.html
5. Blog pages (if exist)
6. checkout.html (careful - payment flow)

## Order of Execution
1. Create mobile-specific breakpoints
2. Fix header standardization
3. Apply spacing system
4. Apply typography scale
5. Fix specific components (verification, cards, etc.)
6. QA at all breakpoints
7. Confirm desktop unchanged
