// shop_products_data.js - Vantix Bio Product Catalog
// Version 4.0 - March 27, 2026 - Updated category system

const VX_PRODUCTS = {
    // PHASE 1 - In Stock, ISO-17025 Verified
    phase1: [
        // METABOLIC SIGNALING - GLP-1, GIP & glucagon pathway peptides
        {
            sku: 'VX-TIRZ-30',
            name: 'Tirzepatide 30mg',
            shortName: 'Tirzepatide',
            slug: 'tirzepatide',
            category: 'metabolic',
            categoryLabel: 'METABOLIC',
            dosage: '30mg',
            purity: '>99%',
            price: 68,
            cogs: 17.38,
            image: 'images/tirzepatide.jpg',
            url: 'products/tirzepatide.html',
            inStock: true,
            dualTested: true
        },
        {
            sku: 'VX-RETA-20',
            name: 'Retatrutide 20mg',
            shortName: 'Retatrutide',
            slug: 'retatrutide',
            category: 'metabolic',
            categoryLabel: 'METABOLIC',
            dosage: '20mg',
            purity: '>99%',
            price: 68,
            cogs: 19.98,
            image: 'images/retatrutide.jpg',
            url: 'products/retatrutide.html',
            inStock: true,
            dualTested: true
        },
        {
            sku: 'VX-SEMA-10',
            name: 'Semaglutide 10mg',
            shortName: 'Semaglutide',
            slug: 'semaglutide',
            category: 'metabolic',
            categoryLabel: 'METABOLIC',
            dosage: '10mg',
            purity: '>99%',
            price: 42,
            cogs: 12.98,
            image: 'images/semaglutide.jpg',
            url: 'products/semaglutide.html',
            inStock: true,
            dualTested: true
        },
        
        // BIOREGENERATIVE SIGNALING - Cellular signaling, matrix interaction, tissue-level pathways
        {
            sku: 'VX-BPC-10',
            name: 'BPC-157 10mg',
            shortName: 'BPC-157',
            slug: 'bpc-157',
            category: 'regen',
            categoryLabel: 'REGEN',
            dosage: '10mg',
            purity: '>99%',
            price: 30,
            cogs: 11.03,
            image: 'images/bpc-157.jpg',
            url: 'products/bpc-157.html',
            inStock: true,
            dualTested: true
        },
        {
            sku: 'VX-TB-10',
            name: 'TB-500 10mg',
            shortName: 'TB-500',
            slug: 'tb-500',
            category: 'regen',
            categoryLabel: 'REGEN',
            dosage: '10mg',
            purity: '>99%',
            price: 38,
            cogs: 17.93,
            image: 'images/tb-500.jpg',
            url: 'products/tb-500.html',
            inStock: true,
            dualTested: true
        },
        {
            sku: 'VX-GHK-100',
            name: 'GHK-Cu 100mg',
            shortName: 'GHK-Cu',
            slug: 'ghk-cu',
            category: 'regen',
            categoryLabel: 'REGEN',
            dosage: '100mg',
            purity: '>99%',
            price: 34,
            cogs: 11.16,
            image: 'images/ghk-cu.jpg',
            url: 'products/ghk-cu.html',
            inStock: true,
            dualTested: true
        },
        
        // SOMATOTROPIC SIGNALING (GH AXIS) - Growth hormone axis & secretagogue research
        {
            sku: 'VX-CJC-10',
            name: 'CJC-1295 (No DAC) 10mg',
            shortName: 'CJC-1295 (No DAC)',
            slug: 'cjc-1295',
            category: 'gh-axis',
            categoryLabel: 'GH AXIS',
            dosage: '10mg',
            purity: '>99%',
            price: 42,
            cogs: 19.53,
            image: 'images/cjc-1295.jpg',
            url: 'products/cjc-1295.html',
            inStock: true,
            dualTested: true
        },
        {
            sku: 'VX-IPA-5',
            name: 'Ipamorelin 5mg',
            shortName: 'Ipamorelin',
            slug: 'ipamorelin',
            category: 'gh-axis',
            categoryLabel: 'GH AXIS',
            dosage: '5mg',
            purity: '>99%',
            price: 30,
            cogs: 9.93,
            image: 'images/ipamorelin.jpg',
            url: 'products/ipamorelin.html',
            inStock: true,
            dualTested: true
        },
        {
            sku: 'VX-TESA-10',
            name: 'Tesamorelin 10mg',
            shortName: 'Tesamorelin',
            slug: 'tesamorelin',
            category: 'gh-axis',
            categoryLabel: 'GH AXIS',
            dosage: '10mg',
            purity: '>99%',
            price: 52,
            cogs: 20.03,
            image: 'images/tesamorelin.jpg',
            url: 'products/tesamorelin.html',
            inStock: true,
            dualTested: true
        },
        {
            sku: 'VX-AOD-10',
            name: 'AOD-9604 10mg',
            shortName: 'AOD-9604',
            slug: 'aod-9604',
            category: 'gh-axis',
            categoryLabel: 'GH AXIS',
            dosage: '10mg',
            purity: '>99%',
            price: 52,
            cogs: 21.03,
            image: 'images/aod-9604.jpg',
            url: 'products/aod-9604.html',
            inStock: false,
            dualTested: true
        },
        
        // MITOCHONDRIAL & CELLULAR RESEARCH - Cellular energy, mitochondrial signaling, metabolic regulation
        {
            sku: 'VX-MOTS-10',
            name: 'MOTS-C 10mg',
            shortName: 'MOTS-C',
            slug: 'mots-c',
            category: 'mito',
            categoryLabel: 'MITO',
            dosage: '10mg',
            purity: '>99%',
            price: 32,
            cogs: 16.01,
            image: 'images/mots-c.jpg',
            url: 'products/mots-c.html',
            inStock: true,
            dualTested: true
        },
        {
            sku: 'VX-NAD-1000',
            name: 'NAD+ 1000mg',
            shortName: 'NAD+',
            slug: 'nad-plus',
            category: 'mito',
            categoryLabel: 'MITO',
            dosage: '1000mg',
            purity: '>99%',
            price: 68,
            cogs: 18.16,
            image: 'images/nad.jpg',
            url: 'products/nad-plus.html',
            inStock: true,
            dualTested: true
        }
    ],
    
    // PHASE 2 - Coming Soon (Future expansion)
    phase2: [
        {
            sku: 'VX-MT2-10',
            name: 'Melanotan II 10mg',
            shortName: 'Melanotan II',
            slug: 'melanotan-2',
            category: 'cosmetic',
            categoryLabel: 'Cosmetic',
            dosage: '10mg',
            purity: '>99%',
            price: 28,
            cogs: 9.50,
            image: 'images/melanotan-2.jpg',
            url: 'products/melanotan-2.html',
            inStock: false,
            comingSoon: true,
            dualTested: false
        }
    ],
    
    // RESEARCH STACKS - Clinical-grade protocol bundles
    stacks: [
        {
            id: 'tissue-repair-kit',
            name: 'BPC-157 + TB-500 Research Pair',
            shortName: 'BPC-157 + TB-500',
            description: 'Cytoprotective & actin-regulatory pathway investigation',
            clinicalNote: 'BPC-157 + TB-500 combination for systemic repair research',
            products: ['VX-BPC-10', 'VX-TB-10'],
            regularPrice: 68,
            stackPrice: 58,
            discount: 14.7,
            savings: 10,
            category: 'tissue-repair'
        },
        {
            id: 'gh-axis-kit',
            name: 'CJC-1295 + Ipamorelin Research Pair',
            shortName: 'CJC-1295 + Ipamorelin',
            description: 'GHRH & ghrelin receptor pharmacology studies',
            clinicalNote: 'CJC-1295 (No DAC) + Ipamorelin synergistic pairing for pulsatile GH release research',
            products: ['VX-CJC-10', 'VX-IPA-5'],
            regularPrice: 72,
            stackPrice: 62,
            discount: 13.9,
            savings: 10,
            category: 'growth-hormone'
        },
        {
            id: 'next-gen-agonist-kit',
            name: 'Tirzepatide + Retatrutide Research Pair',
            shortName: 'Tirzepatide + Retatrutide',
            description: 'Multi-receptor incretin agonist comparative studies',
            clinicalNote: 'Tirzepatide (GLP-1/GIP) + Retatrutide (GLP-1/GIP/Glucagon) for metabolic pathway investigation',
            products: ['VX-TIRZ-30', 'VX-RETA-20'],
            regularPrice: 136,
            stackPrice: 121,
            discount: 11.0,
            savings: 15,
            category: 'glp1'
        },
        {
            id: 'mitochondrial-kit',
            name: 'NAD+ + MOTS-C Research Pair',
            shortName: 'NAD+ + MOTS-C',
            description: 'Mitochondrial bioenergetics & NAD+ metabolism research',
            clinicalNote: 'NAD+ + MOTS-C combination for ATP production and insulin sensitivity research',
            products: ['VX-NAD-1000', 'VX-MOTS-10'],
            regularPrice: 100,
            stackPrice: 90,
            discount: 10.0,
            savings: 10,
            category: 'longevity'
        }
    ]
};

// Helper function to get product by SKU
function getProductBySKU(sku) {
    const allProducts = [...VX_PRODUCTS.phase1, ...VX_PRODUCTS.phase2];
    return allProducts.find(p => p.sku === sku);
}

// Helper function to get stack/kit details
function getKitById(id) {
    return VX_PRODUCTS.stacks.find(k => k.id === id);
}
