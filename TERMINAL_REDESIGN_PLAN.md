# Terminal Redesign Implementation Plan

## Design Direction
Linear + Bloomberg Terminal + Lab Instrument UI aesthetic

## Core Visual System
- **Background**: #050812 with animated 60px grid (0.12 opacity, pulsing)
- **Accent**: blue-400 (#60a5fa) used sparingly
- **Fonts**:
  - Instrument Serif (headlines)
  - Geist (UI text)
  - JetBrains Mono (data/labels)
- **Motion**: floatIn animations, mouse spotlight, scanning line, live charts

## Files Created
1. `/vantix/design-system.css` - Complete design tokens + components
2. `/vantix/components/status-bar.html` - Top status bar with countdown + coords

## Implementation Phases

### Phase 1: Homepage Hero (PRIORITY)
- [ ] Replace hero section with terminal aesthetic
- [ ] Add mouse-follow radial spotlight
- [ ] Implement floatIn animations (staggered 200ms)
- [ ] Add scanning line animation
- [ ] Embed live verification widget (not separate page)

### Phase 2: Components Rebuild
- [ ] Feature cards → corner brackets + hairline dividers (no boxes)
- [ ] Bundle cards → editorial layout, strikethrough pricing
- [ ] FAQ → hairline-divided list, thin chevrons
- [ ] Footer → add lat/long + system status

### Phase 3: Global Elements
- [ ] Status bar on all pages (countdown + coordinates)
- [ ] Monospace metadata labels everywhere
- [ ] At least one animated element per section
- [ ] Replace static SVGs with live animated charts

### Phase 4: Verification Portal Widget
- [ ] Build interactive widget for homepage
- [ ] Default batch ID: VX-RETA20-001
- [ ] Real-time COA readout display
- [ ] Terminal-style data presentation

## Scope Warning
This is a **complete visual overhaul** requiring:
- 10-15 hours of development time
- Testing across all pages
- Mobile responsive implementation
- Risk of breaking existing functionality

## Recommendation
1. Build single **proof-of-concept homepage** first
2. Review with Frabrizio before full rollout
3. Consider launching May 1 with current design, then v2.0 later

## Next Steps
1. Confirm: Full redesign now OR proof-of-concept?
2. If POC: I'll build `/vantix/index-terminal.html` for review
3. If full: Start with homepage, then systematic component replacement

---

**Question for Frabrizio:**
- Do you want terminal aesthetic **before May 1 launch** (risky)?
- Or **post-launch as v2.0** (safer)?
- Or just **hero section + key pages** (middle ground)?
