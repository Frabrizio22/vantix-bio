#!/usr/bin/env python3
"""
Update all COA links site-wide to new verify.html URL structure.
- Shop cards: Add "Janoshik COA: View" link under purity specs
- Product pages: Update "View Most Recent COA" -> verify.html?product=<slug>#latest
- Product pages: Update "Verify a Batch Number" -> verify.html?product=<slug>#verify
- Product pages: Update "COA Available — View" -> verify.html?product=<slug>#latest
"""

import os
import re
from pathlib import Path

# Phase 1 products with slugs
PHASE1_PRODUCTS = [
    {'name': 'Semaglutide 10mg', 'slug': 'semaglutide-10mg', 'sku': 'VX-SEMA-10'},
    {'name': 'Tirzepatide 30mg', 'slug': 'tirzepatide-30mg', 'sku': 'VX-TIRZ-30'},
    {'name': 'Retatrutide 10mg', 'slug': 'retatrutide-10mg', 'sku': 'VX-RETA-10'},
    {'name': 'Retatrutide 20mg', 'slug': 'retatrutide-20mg', 'sku': 'VX-RETA-20'},
    {'name': 'BPC-157 5mg', 'slug': 'bpc157-5mg', 'sku': 'VX-BPC-5'},
    {'name': 'TB-500 5mg', 'slug': 'tb500-5mg', 'sku': 'VX-TB-5'},
    {'name': 'CJC-1295 5mg', 'slug': 'cjc1295-5mg', 'sku': 'VX-CJC-5'},
    {'name': 'Ipamorelin 5mg', 'slug': 'ipamorelin-5mg', 'sku': 'VX-IPA-5'},
    {'name': 'Epithalon 50mg', 'slug': 'epithalon-50mg', 'sku': 'VX-EPI-50'},
    {'name': 'Melanotan II 10mg', 'slug': 'melanotan-ii-10mg', 'sku': 'VX-MT2-10'}
]

def update_product_pages():
    """Update COA button links in all product HTML files."""
    products_dir = Path('products')
    if not products_dir.exists():
        print("❌ products/ directory not found")
        return
    
    count = 0
    for product_file in products_dir.glob('*.html'):
        # Extract slug from filename
        slug = product_file.stem
        
        with open(product_file, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original_content = content
        
        # Update primary button: "View Most Recent COA"
        content = re.sub(
            r'<a\s+href="[^"]*verify\.html[^"]*"\s+class="btn-verify-primary">View Most Recent COA</a>',
            f'<a href="../verify.html?product={slug}#latest" class="btn-verify-primary">View Most Recent COA</a>',
            content
        )
        
        # Update secondary button: "Verify a Batch Number"
        content = re.sub(
            r'<a\s+href="[^"]*verify\.html[^"]*"\s+class="btn-verify-secondary">Verify a Batch Number</a>',
            f'<a href="../verify.html?product={slug}#verify" class="btn-verify-secondary">Verify a Batch Number</a>',
            content
        )
        
        # Update badge link: "COA Available — View"
        content = re.sub(
            r'<a\s+href="[^"]*verify\.html[^"]*"[^>]*class="badge-coa-link"[^>]*>COA Available — View</a>',
            f'<a href="../verify.html?product={slug}#latest" class="badge-coa-link" title="View Certificate of Analysis">COA Available — View</a>',
            content
        )
        
        if content != original_content:
            with open(product_file, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f"✅ Updated: {product_file.name}")
            count += 1
    
    print(f"\n📊 Updated {count} product pages")

def update_shop_html():
    """Add COA links to shop.html product cards (in JS)."""
    shop_file = Path('shop.html')
    if not shop_file.exists():
        print("❌ shop.html not found")
        return
    
    with open(shop_file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Find the renderProducts function and add COA link after purity display
    # Look for the section where purity is displayed
    pattern = r'(html \+= `<div class="product-purity">\$\{p\.purity\}% Pure</div>`;)'
    replacement = r'''\1
                
                // COA link for Phase 1 products (dual tested)
                if (p.dualTested) {
                    html += `<div class="product-coa-link"><a href="verify.html?product=${p.slug}#latest" style="color: #00B4D8; font-size: 11px; font-weight: 600; text-decoration: none;">Janoshik COA: View →</a></div>`;
                }'''
    
    content = re.sub(pattern, replacement, content, flags=re.MULTILINE)
    
    with open(shop_file, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print("✅ Updated: shop.html (added COA links to product cards)")

def main():
    print("🔧 Updating COA links site-wide...\n")
    
    # Change to vantix directory
    os.chdir(Path(__file__).parent)
    
    update_product_pages()
    print()
    update_shop_html()
    
    print("\n✨ Done! All COA links updated.")
    print("\nNext steps:")
    print("1. Review changes in shop.html")
    print("2. Test verify.html?product=semaglutide-10mg#latest")
    print("3. Test verify.html?product=semaglutide-10mg#verify")
    print("4. Commit and push to deploy")

if __name__ == '__main__':
    main()
