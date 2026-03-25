# Typography & Layout Audit - Vantix Bio

## Issues Found:

### 1. Inconsistent Max-Widths
- `.section-subtitle` CSS: 780px
- Protocol section subtitle inline: 800px
- About page sections: varying widths

### 2. Orphan/Widow Lines
- Long sentences breaking awkwardly on mobile
- Single words on last line of paragraphs

### 3. Inline Style Overrides
- Protocol section has inline styles conflicting with CSS classes
- Makes maintenance harder

### 4. Text Alignment Issues
- Some centered text too wide for centering to work well
- Left-aligned text in cards needs consistent padding

## Fixes to Apply:

### A. Standardize Max-Widths
```css
.section-title { max-width: 900px; margin-left: auto; margin-right: auto; }
.section-subtitle { max-width: 720px; } /* Narrower for better readability */
.hero-subtitle { max-width: 680px; } /* Hero needs slightly narrower */
```

### B. Add Widow/Orphan Prevention
```css
p, li { 
    orphans: 2; 
    widows: 2; 
}
```

### C. Better Line-Height for Readability
```css
.section-subtitle { line-height: 1.7; } /* Current: default */
p { line-height: 1.65; }
```

### D. Remove Inline Styles from Protocol Section
Move all inline styles to proper CSS classes

### E. Fix Hero Subtitle
Too long - breaks awkwardly. Consider shortening or using `<br>` strategically.

Current:
"Every compound independently verified through Janoshik chromatography. HPLC-DAD and LC-MS/MS dual analysis with immutable split-screen audit trails."

Better:
"Every compound independently verified through Janoshik chromatography.<br>HPLC-DAD and LC-MS/MS dual analysis with immutable split-screen audit trails."

Or shorter:
"Independent Janoshik verification with dual-method chromatography. HPLC-DAD and LC-MS/MS analysis with immutable audit trails."
