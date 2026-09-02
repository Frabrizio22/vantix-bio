// shop_products_data.js - Vantix Bio Product Catalog
// Version 5.0 - HOLY GRAIL - Auto-sync inventory from Google Sheets

// ============================================
// AUTO-INVENTORY SYSTEM
// ============================================

// Global inventory data (loaded from inventory.json)
let INVENTORY_DATA = {};
let INVENTORY_LOADED = false;

// Load inventory from GitHub (auto-updated by Apps Script)
async function loadInventory() {
  try {
    const response = await fetch('/inventory.json?t=' + Date.now());
    if (response.ok) {
      INVENTORY_DATA = await response.json();
      INVENTORY_LOADED = true;
      console.log('✅ Inventory loaded:', INVENTORY_DATA);
      
      // Refresh product displays if they're already rendered
      if (typeof refreshProductGrid === 'function') {
        refreshProductGrid();
      }
    } else {
      console.warn('⚠️ Could not load inventory.json, using default inStock values');
    }
  } catch (error) {
    console.warn('⚠️ Inventory fetch failed:', error);
  }
}

// Call immediately on page load
loadInventory();

// Helper: Get stock status for a SKU
function getStockStatus(sku) {
  if (!INVENTORY_LOADED || !INVENTORY_DATA[sku]) {
    return null; // Use default inStock value from product data
  }
  
  return {
    inStock: INVENTORY_DATA[sku].inStock,
    stock: INVENTORY_DATA[sku].stock || 0
  };
}

// ============================================
// PRODUCT DATA
// ============================================

const VX_PRODUCTS = {
    phase1: [
        // METABOLIC SIGNALING - GLP-1, GIP & glucagon pathway peptides
        {
            sku: 'VX-TIRZ-30',
            name: 'Tirzepatide 30mg', 
            cartName: 'Tirz 30mg',
            shortName: 'Tirzepatide',
            slug: 'tirzepatide',
            category: 'glp1-gip',
            categoryLabel: 'GLP-1 / GIP Agonists',
            dosage: '30mg',
            purity: '>99%',
            price: 59,
            cogs: 17.38,
            image: 'images/products/tirzepatide-30mg.jpg',
            url: 'products/tirzepatide.html',
            inStock: true,  // Default fallback
            dualTested: true,
            // Dynamic stock getter
            get stock() {
                const status = getStockStatus(this.sku);
                return status ? status.stock : null;
            },
            get isInStock() {
                const status = getStockStatus(this.sku);
                return status !== null ? status.inStock : this.inStock;
            }
        },
        {
            sku: 'VX-RETA-20',
            name: 'Retatrutide 20mg', 
            cartName: 'Reta 20mg',
            shortName: 'Reta 20mg',
            slug: 'retatrutide',
            category: 'glp1-gip',
            categoryLabel: 'GLP-1 / GIP Agonists',
            dosage: '20mg',
            purity: '>99%',
            price: 67,
            cogs: 19.98,
            image: 'images/products/retatrutide-20mg.jpg',
            url: 'products/retatrutide.html',
            inStock: false,
            dualTested: true,
            get stock() {
                const status = getStockStatus(this.sku);
                return status ? status.stock : null;
            },
            get isInStock() {
                const status = getStockStatus(this.sku);
                return status !== null ? status.inStock : this.inStock;
            }
        },
        {
            sku: 'VX-SEMA-10',
            name: 'Semaglutide 10mg', 
            cartName: 'Sema 10mg',
            shortName: 'Semaglutide',
            slug: 'semaglutide',
            category: 'glp1-gip',
            categoryLabel: 'GLP-1 / GIP Agonists',
            dosage: '10mg',
            purity: '>99%',
            price: 42,
            cogs: 13.87,
            image: 'images/products/semaglutide-10mg.jpg',
            url: 'products/semaglutide.html',
            inStock: false,
            dualTested: true,
            get stock() {
                const status = getStockStatus(this.sku);
                return status ? status.stock : null;
            },
            get isInStock() {
                const status = getStockStatus(this.sku);
                return status !== null ? status.inStock : this.inStock;
            }
        },

        // TISSUE REPAIR - Growth factor & ECM signaling peptides
        {
            sku: 'VX-BPC-10',
            name: 'BPC-157 10mg', 
            cartName: 'BPC-157 10mg',
            shortName: 'BPC-157',
            slug: 'bpc-157',
            category: 'tissue-repair',
            categoryLabel: 'Tissue Repair Research',
            dosage: '10mg',
            purity: '>99%',
            price: 30,
            cogs: 15.50,
            image: 'images/products/bpc-157-10mg.jpg',
            url: 'products/bpc-157.html',
            inStock: false,
            dualTested: true,
            get stock() {
                const status = getStockStatus(this.sku);
                return status ? status.stock : null;
            },
            get isInStock() {
                const status = getStockStatus(this.sku);
                return status !== null ? status.inStock : this.inStock;
            }
        },
        {
            sku: 'VX-TB-10',
            name: 'TB-500 10mg', 
            cartName: 'TB-500 10mg',
            shortName: 'TB-500',
            slug: 'tb-500',
            category: 'tissue-repair',
            categoryLabel: 'Tissue Repair Research',
            dosage: '10mg',
            purity: '>99%',
            price: 38,
            cogs: 21.24,
            image: 'images/products/tb-500-10mg.jpg',
            url: 'products/tb-500.html',
            inStock: false,
            dualTested: true,
            get stock() {
                const status = getStockStatus(this.sku);
                return status ? status.stock : null;
            },
            get isInStock() {
                const status = getStockStatus(this.sku);
                return status !== null ? status.inStock : this.inStock;
            }
        },
        {
            sku: 'VX-GHK-100',
            name: 'GHK-Cu 100mg', 
            cartName: 'GHK-Cu 100mg',
            shortName: 'GHK-Cu',
            slug: 'ghk-cu',
            category: 'tissue-repair',
            categoryLabel: 'Tissue Repair Research',
            dosage: '100mg',
            purity: '>99%',
            price: 34,
            cogs: 10.30,
            image: 'images/products/ghk-cu-100mg.jpg',
            url: 'products/ghk-cu.html',
            inStock: true,
            dualTested: true,
            get stock() {
                const status = getStockStatus(this.sku);
                return status ? status.stock : null;
            },
            get isInStock() {
                const status = getStockStatus(this.sku);
                return status !== null ? status.inStock : this.inStock;
            }
        },

        // GH AXIS - Growth hormone secretagogues & modulators
        {
            sku: 'VX-CJC-10',
            name: 'CJC-1295 10mg', 
            cartName: 'CJC-1295 10mg',
            shortName: 'CJC-1295',
            slug: 'cjc-1295',
            category: 'gh-peptides',
            categoryLabel: 'GH Axis Research',
            dosage: '10mg',
            purity: '>99%',
            price: 42,
            cogs: 22.53,
            image: 'images/products/cjc-1295-10mg.jpg',
            url: 'products/cjc-1295.html',
            inStock: false,
            dualTested: true,
            get stock() {
                const status = getStockStatus(this.sku);
                return status ? status.stock : null;
            },
            get isInStock() {
                const status = getStockStatus(this.sku);
                return status !== null ? status.inStock : this.inStock;
            }
        },
        {
            sku: 'VX-IPA-5',
            name: 'Ipamorelin 5mg', 
            cartName: 'Ipa 5mg',
            shortName: 'Ipamorelin',
            slug: 'ipamorelin',
            category: 'gh-peptides',
            categoryLabel: 'GH Axis Research',
            dosage: '5mg',
            purity: '>99%',
            price: 30,
            cogs: 9.93,
            image: 'images/products/ipamorelin-10mg.jpg',
            url: 'products/ipamorelin.html',
            inStock: false,
            dualTested: true,
            get stock() {
                const status = getStockStatus(this.sku);
                return status ? status.stock : null;
            },
            get isInStock() {
                const status = getStockStatus(this.sku);
                return status !== null ? status.inStock : this.inStock;
            }
        },
        {
            sku: 'VX-TESA-10',
            name: 'Tesamorelin 10mg', 
            cartName: 'Tesa 10mg',
            shortName: 'Tesamorelin',
            slug: 'tesamorelin',
            category: 'gh-peptides',
            categoryLabel: 'GH Axis Research',
            dosage: '10mg',
            purity: '>99%',
            price: 52,
            cogs: 20.03,
            image: 'images/products/coming-soon.svg',
            url: 'products/tesamorelin.html',
            inStock: false,
            dualTested: false,
            get stock() {
                const status = getStockStatus(this.sku);
                return status ? status.stock : null;
            },
            get isInStock() {
                const status = getStockStatus(this.sku);
                return status !== null ? status.inStock : this.inStock;
            }
        },

        // METABOLIC - Mitochondrial & cellular energy peptides
        {
            sku: 'VX-MOTS-10',
            name: 'MOTS-c 10mg', 
            cartName: 'MOTS-C 10mg',
            shortName: 'MOTS-c',
            slug: 'mots-c',
            category: 'metabolic',
            categoryLabel: 'Metabolic Signaling',
            dosage: '10mg',
            purity: '>99%',
            price: 32,
            cogs: 16.65,
            image: 'images/products/mots-c-10mg.jpg',
            url: 'products/mots-c.html',
            inStock: true,
            dualTested: true,
            get stock() {
                const status = getStockStatus(this.sku);
                return status ? status.stock : null;
            },
            get isInStock() {
                const status = getStockStatus(this.sku);
                return status !== null ? status.inStock : this.inStock;
            }
        },
        {
            sku: 'VX-NAD-1000',
            name: 'NAD+ 1000mg', 
            cartName: 'NAD+ 1000mg',
            shortName: 'NAD+',
            slug: 'nad-1000mg',
            category: 'metabolic',
            categoryLabel: 'Metabolic Signaling',
            dosage: '1000mg',
            purity: '>99%',
            price: 67,
            cogs: 12.00,
            image: 'images/products/nad-1000mg.jpg',
            url: 'products/nad-1000mg.html',
            inStock: true,
            dualTested: false,
            get stock() {
                const status = getStockStatus(this.sku);
                return status ? status.stock : null;
            },
            get isInStock() {
                const status = getStockStatus(this.sku);
                return status !== null ? status.inStock : this.inStock;
            }
        },

        // SUPPLIES - Bacteriostatic water
        {
            sku: 'VX-BAC-30',
            name: 'Bacteriostatic Water 30mL', 
            cartName: 'BAC Water 30mL',
            shortName: 'BAC Water',
            slug: 'bac-water',
            category: 'supplies',
            categoryLabel: 'Research Supplies',
            dosage: '30mL',
            purity: 'USP',
            price: 12,
            cogs: 3.50,
            image: 'images/products/bac-water-30ml.jpg',
            url: '#',
            inStock: true,
            dualTested: false,
            get stock() {
                const status = getStockStatus(this.sku);
                return status ? status.stock : null;
            },
            get isInStock() {
                const status = getStockStatus(this.sku);
                return status !== null ? status.inStock : this.inStock;
            }
        }
    ],

    // Research Kits remain unchanged
    kits: [
        {
            id: 'tissue-repair',
            name: 'Tissue Repair Research Pair',
            shortName: 'BPC-157 + TB-500',
            description: 'VEGFR2 + G-actin pathway investigation',
            clinicalNote: 'BPC-157 (VEGFR2) + TB-500 (actin dynamics) for dual-pathway tissue repair research',
            products: ['VX-BPC-10', 'VX-TB-10'],
            regularPrice: 68,
            stackPrice: 62,
            discount: 8.8,
            savings: 6,
            category: 'tissue-repair'
        },
        {
            id: 'gh-axis',
            name: 'GH Axis Research Pair',
            shortName: 'CJC-1295 + Ipamorelin',
            description: 'GHRH + ghrelin receptor pathway synergy',
            clinicalNote: 'CJC-1295 (GHRH agonist) + Ipamorelin (ghrelin receptor agonist) for GH axis modulation research',
            products: ['VX-CJC-10', 'VX-IPA-5'],
            regularPrice: 72,
            stackPrice: 66,
            discount: 8.3,
            savings: 6,
            category: 'gh-peptides'
        },
        {
            id: 'next-gen',
            name: 'Tirzepatide + Retatrutide Research Pair',
            shortName: 'Tirzepatide + Retatrutide',
            description: 'Dual vs. triple incretin receptor activation comparison',
            clinicalNote: 'Tirzepatide (GLP-1/GIP) + Retatrutide (GLP-1/GIP/Glucagon) for metabolic pathway investigation',
            products: ['VX-TIRZ-30', 'VX-RETA-20'],
            regularPrice: 126,
            stackPrice: 112,
            discount: 11.1,
            savings: 14,
            category: 'glp1'
        },
        {
            id: 'mitochondrial-kit',
            name: 'NAD+ + MOTS-C Research Pair',
            shortName: 'NAD+ + MOTS-C',
            description: 'Mitochondrial bioenergetics & NAD+ metabolism research',
            clinicalNote: 'NAD+ + MOTS-C combination for ATP production and insulin sensitivity research',
            products: ['VX-NAD-1000', 'VX-MOTS-10'],
            regularPrice: 99,
            stackPrice: 89,
            discount: 10.1,
            savings: 10,
            category: 'metabolic'
        },
        {
            id: 'multi-system',
            name: 'Multi-System Research Kit',
            shortName: 'GHK-Cu + BPC-157 + NAD+',
            description: 'Tissue repair + mitochondrial function investigation',
            clinicalNote: 'GHK-Cu (collagen synthesis) + BPC-157 (VEGFR2) + NAD+ (mitochondrial function)',
            products: ['VX-GHK-100', 'VX-BPC-10', 'VX-NAD-1000'],
            regularPrice: 131,
            stackPrice: 118,
            discount: 9.9,
            savings: 13,
            category: 'combo'
        }
    ]
};

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { VX_PRODUCTS, INVENTORY_DATA, loadInventory, getStockStatus };
}
