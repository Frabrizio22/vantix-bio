# Blog Header Standardization

All blog articles should use this header structure (matching batch-level-testing.html):

## Standard Header HTML:

```html
<div class="status-bar">
  <div class="status-inner">
    <span class="pulse"></span>
    <span>JANOSHIK VERIFIED — LIVE</span>
  </div>
</div>

<header class="header">
  <div class="header-content">
    <a href="../index.html" class="logo-link">
      <img src="../logo-header.svg" alt="Vantix Bio" class="header-logo">
    </a>
    <nav class="nav">
      <a href="../shop.html">Products</a>
      <a href="index.html">Research</a>
      <a href="../verify.html">Verify</a>
    </nav>
  </div>
</header>
```

## Required CSS (already in batch-level-testing.html):

```css
.status-bar{background:var(--navy);padding:8px 0;position:sticky;top:0;z-index:100;border-bottom:1px solid rgba(26,41,66,.5)}
.status-inner{font-family:'JetBrains Mono',monospace;font-size:11px;text-transform:uppercase;letter-spacing:.12em;color:var(--bg);display:flex;justify-content:center;align-items:center;gap:8px}
.pulse{width:6px;height:6px;border-radius:50%;background:#7BA88F;animation:pulse 2s infinite}
@keyframes pulse{0%{box-shadow:0 0 0 0 rgba(123,168,143,0.7)}70%{box-shadow:0 0 0 6px rgba(123,168,143,0)}100%{box-shadow:0 0 0 0 rgba(123,168,143,0)}}
.header{background:rgba(250,250,247,.98);backdrop-filter:blur(10px);border-bottom:1px solid var(--hairline);position:sticky;top:37px;z-index:99}
.header-content{max-width:1400px;margin:0 auto;padding:12px 32px;display:flex;align-items:center;justify-content:space-between;gap:16px}
@media(min-width:768px){.header-content{padding:16px 48px}}
.logo-link{display:flex;align-items:center;text-decoration:none}
.header-logo{height:32px}
.nav{display:flex;gap:24px;align-items:center}
.nav a{color:var(--text);text-decoration:none;font-size:15px;font-weight:500;transition:opacity .3s}
.nav a:hover{opacity:.6}
@media(max-width:720px){.nav{gap:16px}.nav a{font-size:14px}}
```

## Articles to update:

- [x] batch-level-testing.html (✅ already done - template)
- [ ] bpc-157-10mg-pillar.html
- [ ] endotoxin-testing.html
- [ ] how-to-verify-janoshik-coa.html
- [ ] batch-testing-why-every-batch-matters.html
- [ ] batch-level-coa-verification.html
