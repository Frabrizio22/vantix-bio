// shop_products_data.js - Vantix Bio Product Catalog
// Version 2.0 - March 19, 2026 - Revised Phase 1/2 based on market demand

const VX_PRODUCTS = {
    // PHASE 1 - In Stock, Dual Tested
    phase1: [
        {
            sku: 'VX-SEMA-10',
            name: 'Semaglutide 10mg',
            shortName: 'Semaglutide',
            slug: 'semaglutide',
            slug: 'semaglutide',
            category: 'glp1',
            categoryLabel: 'GLP-1 Agonist',
            dosage: '10mg',
            purity: '≥98%',
            price: 38,
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
            slug: 'tirzepatide-30mg',
            category: 'glp1',
            categoryLabel: 'GLP-1 Agonist',
            dosage: '30mg',
            purity: '≥98%',
            price: 48,
            cogs: 13.40,
            image: 'images/tirzepatide.jpg',
            url: 'products/tirzepatide-30mg.html',
            inStock: false,
            dualTested: true
        },
        {
            sku: 'VX-CAGRI-5',
            name: 'Cagrilintide 5mg',
            shortName: 'Cagrilintide',
            slug: 'cagrilintide',
            category: 'glp1',
            categoryLabel: 'GLP-1 Agonist',
            dosage: '5mg',
            purity: '≥98%',
            price: 38,
            cogs: 11.00,
            image: 'images/cagrilintide.jpg',
            url: 'products/cagrilintide.html',
            inStock: true,
            dualTested: true
        },
        {
            sku: 'VX-RETA-20',
            name: 'Retatrutide 20mg',
            shortName: 'Retatrutide',
            slug: 'retatrutide',
            category: 'glp1',
            categoryLabel: 'GLP-1 Agonist',
            dosage: '20mg',
            purity: '≥98%',
            price: 58,
            cogs: 14.50,
            image: 'images/retatrutide.jpg',
            url: 'products/retatrutide-20.html',
            inStock: true,
            dualTested: true
        },
        {
            sku: 'VX-BPC-5',
            name: 'BPC-157 5mg',
            shortName: 'BPC-157',
            slug: 'bpc157',
            category: 'tissue-repair',
            categoryLabel: 'Regenerative Research',
            dosage: '5mg',
            purity: '≥98%',
            price: 30,
            cogs: 9.10,
            image: 'images/bpc-157.jpg',
            url: 'products/bpc-157-tb-500.html',
            inStock: true,
            dualTested: true
        },
        {
            sku: 'VX-TB-5',
            name: 'TB-500 5mg',
            shortName: 'TB-500',
            slug: 'tb500',
            category: 'tissue-repair',
            categoryLabel: 'Regenerative Research',
            dosage: '5mg',
            purity: '≥98%',
            price: 34,
            cogs: 11.40,
            image: 'images/tb-500.jpg',
            url: 'products/bpc-157-tb-500.html',
            inStock: true,
            dualTested: true
        },
        {
            sku: 'VX-CJC-5',
            name: 'CJC-1295 5mg',
            shortName: 'CJC-1295',
            slug: 'cjc1295',
            category: 'growth-hormone',
            categoryLabel: 'Growth Hormone',
            dosage: '5mg',
            purity: '≥98%',
            price: 30,
            cogs: 12.10,
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
            category: 'growth-hormone',
            categoryLabel: 'Growth Hormone',
            dosage: '5mg',
            purity: '≥98%',
            price: 24,
            cogs: 8.40,
            image: 'images/ipamorelin.jpg',
            url: 'products/ipamorelin.html',
            inStock: false,
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
            price: 34,
            cogs: 10.50,
            image: 'images/nad.jpg',
            url: 'products/nad-1000mg.html',
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
            price: 48,
            cogs: 14.00,
            image: 'images/ghk-cu.jpg',
            url: 'products/ghk-cu.html',
            inStock: true,
            dualTested: true
        },
        {
            sku: 'VX-BAC-30',
            name: 'Bacteriostatic Water — 30 ml',
            shortName: 'Bacteriostatic Water',
            slug: 'bacwater',
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
    
    // PHASE 2 - Coming Soon (Email Capture)
    phase2: [
        {
            sku: 'VX-EPI-50',
            name: 'Epithalon 50mg',
            shortName: 'Epithalon',
            slug: 'epithalon',
            category: 'longevity',
            categoryLabel: 'Longevity',
            dosage: '50mg',
            purity: '≥98%',
            price: 38,
            cogs: 11.50,
            image: 'images/epithalon.jpg',
            url: 'products/epithalon.html',
            inStock: false,
            comingSoon: true
        },
        {
            sku: 'VX-MT2-10',
            name: 'Melanotan II 10mg',
            shortName: 'Melanotan II',
            slug: 'melanotan',
            category: 'cosmetic',
            categoryLabel: 'Cosmetic',
            dosage: '10mg',
            purity: '≥98%',
            price: 28,
            cogs: 9.50,
            image: 'images/melanotan-2.jpg',
            url: 'products/melanotan-2.html',
            inStock: false,
            comingSoon: true
        },
        {
            sku: 'VX-SEMAX-10',
            name: 'Semax 10mg',
            shortName: 'Semax',
            slug: 'semax',
            category: 'cognitive',
            categoryLabel: 'Cognitive',
            dosage: '10mg',
            purity: '≥98%',
            price: 28,
            image: 'images/semax.jpg',
            url: 'products/semax.html',
            inStock: false,
            comingSoon: true
        },
        {
            sku: 'VX-SELANK-10',
            name: 'Selank 10mg',
            shortName: 'Selank',
            slug: 'selank',
            category: 'cognitive',
            categoryLabel: 'Cognitive',
            dosage: '10mg',
            purity: '≥98%',
            price: 28,
            image: 'images/selank.jpg',
            url: 'products/selank-10mg.html',
            inStock: false,
            comingSoon: true
        },
        {
            sku: 'VX-TA1-5',
            name: 'Thymosin Alpha-1 5mg',
            shortName: 'Thymosin Alpha-1',
            slug: 'thymalin',
            category: 'immune',
            categoryLabel: 'Immune Support',
            dosage: '5mg',
            purity: '≥98%',
            price: 38,
            image: 'images/thymosin-alpha-1.jpg',
            url: 'products/thymosin-alpha-1.html',
            inStock: false,
            comingSoon: true
        },
        {
            sku: 'VX-AOD-2',
            name: 'AOD-9604 2mg',
            shortName: 'AOD-9604',
            slug: 'aod9604',
            category: 'metabolic',
            categoryLabel: 'Metabolic',
            dosage: '2mg',
            purity: '≥98%',
            price: 30,
            image: 'images/aod-9604.jpg',
            url: 'products/aod-9604.html',
            inStock: false,
            comingSoon: true
        }
    ],
    
    // RESEARCH KITS - Commonly paired peptides in research protocols
    kits: [
        {
            id: 'regenerative-kit',
            name: 'Regenerative Research Kit',
            shortName: 'Regenerative',
            description: 'BPC-157 + TB-500 combination frequently studied together in connective tissue research',
            products: ['VX-BPC-5', 'VX-TB-5'],
            regularPrice: 64,
            kitPrice: 56,
            discount: 12.5,
            savings: 8,
            category: 'tissue-repair'
        },
        {
            id: 'gh-secretagogue-kit',
            name: 'GH Secretagogue Kit',
            shortName: 'GH Secretagogue',
            description: 'CJC-1295 + Ipamorelin synergistic pairing for growth hormone signaling research',
            products: ['VX-CJC-5', 'VX-IPA-5'],
            regularPrice: 54,
            kitPrice: 46,
            discount: 14.8,
            savings: 8,
            category: 'growth-hormone'
        },
        {
            id: 'glp-starter-kit',
            name: 'GLP-1 Starter Kit',
            shortName: 'GLP Starter',
            description: 'Semaglutide + Bacteriostatic Water for GLP-1 receptor research protocols',
            products: ['VX-SEMA-10', 'VX-BAC-30'],
            regularPrice: 46,
            kitPrice: 42,
            discount: 8.7,
            savings: 4,
            category: 'glp1'
        },
        {
            id: 'ultimate-recovery-kit',
            name: 'Ultimate Recovery Kit',
            shortName: 'Ultimate Recovery',
            description: 'BPC-157 + TB-500 + CJC-1295 + Ipamorelin — comprehensive tissue repair and growth hormone protocol',
            products: ['VX-BPC-5', 'VX-TB-5', 'VX-CJC-5', 'VX-IPA-5'],
            regularPrice: 118,
            kitPrice: 98,
            discount: 16.9,
            savings: 20,
            category: 'tissue-repair'
        },
        {
            id: 'nad-cellular-kit',
            name: 'NAD+ Cellular Protocol',
            shortName: 'NAD+ Cellular',
            description: 'NAD+ + BPC-157 for cellular energy and tissue research protocols',
            products: ['VX-NAD-1000', 'VX-BPC-5'],
            regularPrice: 64,
            kitPrice: 56,
            discount: 12.5,
            savings: 8,
            category: 'longevity'
        },
        {
            id: 'advanced-cellular-kit',
            name: 'Advanced Cellular Research Kit',
            shortName: 'Advanced Cellular',
            description: 'GHK-Cu + NAD+ for peptide-copper complex and NAD+ pathway investigation',
            products: ['VX-GHK-100', 'VX-NAD-1000'],
            regularPrice: 82,
            kitPrice: 72,
            discount: 12.2,
            savings: 10,
            category: 'cosmetic'
        }
    ]
};

// Helper function to get product by SKU
function getProductBySKU(sku) {
    const allProducts = [...VX_PRODUCTS.phase1, ...VX_PRODUCTS.phase2];
    return allProducts.find(p => p.sku === sku);
}

// Helper function to get kit details
function getKitById(id) {
    return VX_PRODUCTS.kits.find(k => k.id === id);
}
