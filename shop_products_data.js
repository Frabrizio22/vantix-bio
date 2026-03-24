// shop_products_data.js - Vantix Bio Product Catalog
// Version 3.0 - March 24, 2026 - Finalized 10-product lineup + 6 research kits

const VX_PRODUCTS = {
    // PHASE 1 - In Stock, ISO-Accredited Testing
    phase1: [
        {
            sku: 'VX-SEMA-10',
            name: 'Semaglutide 10mg',
            shortName: 'Semaglutide',
            slug: 'semaglutide',
            category: 'glp1',
            categoryLabel: 'GLP-1 Agonist',
            dosage: '10mg',
            purity: '≥98%',
            price: 47,
            cogs: 9.10,
            image: 'images/semaglutide.jpg',
            url: 'products/semaglutide.html',
            inStock: true,
            dualTested: true
        },
        {
            sku: 'VX-TIRZ-30',
            name: 'Tirzepatide 30mg',
            shortName: 'Tirzepatide',
            slug: 'tirzepatide',
            category: 'glp1',
            categoryLabel: 'GLP-1/GIP Dual Agonist',
            dosage: '30mg',
            purity: '≥98%',
            price: 72,
            cogs: 13.40,
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
            category: 'glp1',
            categoryLabel: 'GLP-1/GIP/Glucagon Triple Agonist',
            dosage: '20mg',
            purity: '≥98%',
            price: 78,
            cogs: 14.50,
            image: 'images/retatrutide.jpg',
            url: 'products/retatrutide.html',
            inStock: true,
            dualTested: true
        },
        {
            sku: 'VX-BPC-10',
            name: 'BPC-157 10mg',
            shortName: 'BPC-157',
            slug: 'bpc-157',
            category: 'tissue-repair',
            categoryLabel: 'Tissue Repair',
            dosage: '10mg',
            purity: '≥98%',
            price: 32,
            cogs: 9.10,
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
            category: 'tissue-repair',
            categoryLabel: 'Tissue Repair',
            dosage: '10mg',
            purity: '≥98%',
            price: 35,
            cogs: 11.40,
            image: 'images/tb-500.jpg',
            url: 'products/tb-500.html',
            inStock: true,
            dualTested: true
        },
        {
            sku: 'VX-CJC-10',
            name: 'CJC-1295 (No DAC) 10mg',
            shortName: 'CJC-1295',
            slug: 'cjc-1295',
            category: 'growth-hormone',
            categoryLabel: 'Growth Hormone',
            dosage: '10mg',
            purity: '≥98%',
            price: 35,
            cogs: 12.10,
            image: 'images/cjc-1295.jpg',
            url: 'products/cjc-1295.html',
            inStock: true,
            dualTested: true
        },
        {
            sku: 'VX-IPA-10',
            name: 'Ipamorelin 10mg',
            shortName: 'Ipamorelin',
            slug: 'ipamorelin',
            category: 'growth-hormone',
            categoryLabel: 'Growth Hormone',
            dosage: '10mg',
            purity: '≥98%',
            price: 30,
            cogs: 8.40,
            image: 'images/ipamorelin.jpg',
            url: 'products/ipamorelin.html',
            inStock: true,
            dualTested: true
        },
        {
            sku: 'VX-MOTS-10',
            name: 'MOTS-C 10mg',
            shortName: 'MOTS-C',
            slug: 'mots-c',
            category: 'metabolic',
            categoryLabel: 'Metabolic',
            dosage: '10mg',
            purity: '≥98%',
            price: 32,
            cogs: 9.00,
            image: 'images/mots-c.jpg',
            url: 'products/mots-c.html',
            inStock: true,
            dualTested: true
        },
        {
            sku: 'VX-NAD-1000',
            name: 'NAD+ 1000mg',
            shortName: 'NAD+',
            slug: 'nad',
            category: 'longevity',
            categoryLabel: 'Longevity',
            dosage: '1000mg',
            purity: '≥98%',
            price: 72,
            cogs: 16.00,
            image: 'images/nad.jpg',
            url: 'products/nad.html',
            inStock: true,
            dualTested: true
        },
        {
            sku: 'VX-GHK-100',
            name: 'GHK-Cu 100mg',
            shortName: 'GHK-Cu',
            slug: 'ghk-cu',
            category: 'cosmetic',
            categoryLabel: 'Cosmetic',
            dosage: '100mg',
            purity: '≥98%',
            price: 32,
            cogs: 10.00,
            image: 'images/ghk-cu.jpg',
            url: 'products/ghk-cu.html',
            inStock: true,
            dualTested: true
        },
        {
            sku: 'VX-BAC-30',
            name: 'Bacteriostatic Water 30ml',
            shortName: 'BAC Water',
            slug: 'bac-water',
            category: 'supplies',
            categoryLabel: 'Supplies',
            volume: '30ml',
            type: 'Bacteriostatic Water',
            price: 8,
            cogs: 5.00,
            image: 'images/bac-water.jpg',
            url: 'products/bac-water.html',
            inStock: true,
            dualTested: false
        }
    ],
    
    // PHASE 2 - Coming Soon (Future expansion)
    phase2: [],
    
    // RESEARCH STACKS - Clinical-grade protocol bundles
    stacks: [
        {
            id: 'tissue-repair-kit',
            name: 'Tissue Repair Research Kit',
            shortName: 'Tissue Repair',
            description: 'Designed for coordinated investigation of angiogenesis and tissue regeneration pathways',
            clinicalNote: 'BPC-157 + TB-500 combination for systemic repair research',
            products: ['VX-BPC-10', 'VX-TB-10'],
            regularPrice: 67,
            kitPrice: 55,
            discount: 17.9,
            savings: 12,
            category: 'tissue-repair'
        },
        {
            id: 'gh-axis-kit',
            name: 'GH Axis Research Kit',
            shortName: 'GH Axis',
            description: 'Formulated for coordinated investigation of GHRH and ghrelin receptor pathways',
            clinicalNote: 'CJC-1295 (No DAC) + Ipamorelin synergistic pairing for pulsatile GH release research',
            products: ['VX-CJC-10', 'VX-IPA-10'],
            regularPrice: 65,
            kitPrice: 58,
            discount: 10.8,
            savings: 7,
            category: 'growth-hormone'
        },
        {
            id: 'next-gen-agonist-kit',
            name: 'Next-Generation Agonist Research Kit',
            shortName: 'Next-Gen Agonist',
            description: 'Formulated for comparative research across multi-receptor agonist activity',
            clinicalNote: 'Tirzepatide (GLP-1/GIP) + Retatrutide (GLP-1/GIP/Glucagon) for metabolic pathway investigation',
            products: ['VX-TIRZ-30', 'VX-RETA-20'],
            regularPrice: 150,
            kitPrice: 135,
            discount: 10.0,
            savings: 15,
            category: 'glp1'
        },
        {
            id: 'mitochondrial-kit',
            name: 'Mitochondrial Function Research Kit',
            shortName: 'Mitochondrial Function',
            description: 'Designed for investigation of mitochondrial bioenergetics and metabolic signaling',
            clinicalNote: 'NAD+ + MOTS-C combination for ATP production and insulin sensitivity research',
            products: ['VX-NAD-1000', 'VX-MOTS-10'],
            regularPrice: 104,
            kitPrice: 92,
            discount: 11.5,
            savings: 12,
            category: 'longevity'
        },
        {
            id: 'multi-system-kit',
            name: 'Multi-System Research Kit',
            shortName: 'Multi-System',
            description: 'Formulated for comprehensive investigation of tissue remodeling and cellular repair mechanisms',
            clinicalNote: 'GHK-Cu + BPC-157 + NAD+ for full-spectrum rejuvenation research',
            products: ['VX-GHK-100', 'VX-BPC-10', 'VX-NAD-1000'],
            regularPrice: 136,
            kitPrice: 118,
            discount: 13.2,
            savings: 18,
            category: 'cosmetic'
        },
        {
            id: 'glp1-agonist-kit',
            name: 'GLP-1 Agonist Research Kit',
            shortName: 'GLP-1 Agonist',
            description: 'Designed for foundational GLP-1 receptor pathway investigation',
            clinicalNote: 'Semaglutide + Bacteriostatic Water for standardized research protocols',
            products: ['VX-SEMA-10', 'VX-BAC-30'],
            regularPrice: 55,
            kitPrice: 50,
            discount: 9.1,
            savings: 5,
            category: 'glp1'
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
