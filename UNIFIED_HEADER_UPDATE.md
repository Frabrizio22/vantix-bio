# Unified Header Implementation Plan

## What Needs to Be Added

### CSS (add after .nav-links styles):
```css
.nav-item{position:relative}
.nav-dropdown{position:absolute;top:100%;left:0;background:#fff;border:1px solid var(--hairline);border-radius:8px;padding:8px 0;min-width:180px;opacity:0;pointer-events:none;transform:translateY(-8px);transition:all .2s;box-shadow:0 4px 12px rgba(0,0,0,.08);z-index:100}
.nav-item:hover .nav-dropdown{opacity:1;pointer-events:auto;transform:translateY(0)}
.nav-dropdown a{display:block;padding:10px 16px;color:var(--text);text-decoration:none;font-size:14px;transition:background .2s}
.nav-dropdown a:hover{background:var(--bg)}
.nav-dropdown a::after{display:none}
.catalog-link{display:flex;align-items:center;gap:4px;cursor:pointer}
.catalog-link svg{width:14px;height:14px;transition:transform .2s}
.nav-item:hover .catalog-link svg{transform:rotate(180deg)}
```

### HTML Structure for All Pages:
```html
<nav class="header-nav">
  <div style="display:flex;align-items:center;gap:8px;flex:1;min-width:0">
    <button class="icon-btn" id="menuBtn" aria-label="Menu">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"/></svg>
    </button>
    <a href="/" class="logo">
      <img src="logo-header.svg" alt="Vantix Bio" style="height:32px">
    </a>
  </div>
  <div class="nav-links">
    <div class="nav-item">
      <div class="catalog-link">
        <span>Catalog</span>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m19 9-7 7-7-7"/></svg>
      </div>
      <div class="nav-dropdown">
        <a href="shop.html">Single Vials</a>
        <a href="kits.html">Research Kits</a>
      </div>
    </div>
    <a href="verify.html">Verify</a>
    <a href="blog/">Research</a>
    <a href="about.html">About</a>
  </div>
  <div class="header-icons">
    <button class="icon-btn" id="searchBtn" aria-label="Search">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
    </button>
    <button class="icon-btn" id="cartBtn" aria-label="Cart" title="Available Mid-May 2026" style="position:relative">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z"/></svg>
    </button>
    <button class="btn btn-dark" id="waitlistBtn">Join Waitlist</button>
  </div>
</nav>
```

## Pages to Update:
1. index.html - Add dropdown CSS, update nav HTML
2. shop.html - Add full nav with dropdown
3. verify.html - Add full nav with dropdown
4. kits.html - Add full nav (if exists)
5. about.html - Add full nav (if exists)

## JavaScript Required:
- menuBtn needs to open mobile menu
- searchBtn needs to trigger search
- cartBtn alert for pre-launch
- waitlistBtn opens waitlist modal
