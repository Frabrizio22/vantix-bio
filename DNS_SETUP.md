# Vantix Bio - DNS Setup Instructions

## Domain: vantixbio.com

### Step 1: Enable GitHub Pages
1. Go to https://github.com/Frabrizio22/vantix-bio/settings/pages
2. Source: **Deploy from a branch**
3. Branch: **main** / **/ (root)**
4. Click **Save**

### Step 2: Configure DNS (at your domain registrar)

Add these DNS records:

**A Records** (for apex domain vantixbio.com):
```
Type: A
Name: @
Value: 185.199.108.153

Type: A
Name: @
Value: 185.199.109.153

Type: A
Name: @
Value: 185.199.110.153

Type: A
Name: @
Value: 185.199.111.153
```

**CNAME Record** (for www.vantixbio.com):
```
Type: CNAME
Name: www
Value: frabrizio22.github.io
```

### Step 3: Wait
- DNS propagation: 10-60 minutes
- GitHub Pages build: 2-5 minutes after DNS resolves
- Site will be live at **vantixbio.com** once both complete

### Verify
- Check https://vantixbio.com
- Check https://www.vantixbio.com
- Both should show the Vantix Bio homepage

---

**Current Status:**
- ✅ GitHub repo created
- ✅ Site code pushed
- ✅ Homepage built (boutique clinical design)
- ✅ React Verify portal built
- ✅ Full product catalog ported
- ⏳ GitHub Pages (you need to enable)
- ⏳ DNS configuration (you need to configure)
