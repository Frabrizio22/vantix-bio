// shop_products_data.js - Vantix Bio Product Catalog
// Version 1.0 - March 5, 2026

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
            slug: 'tirzepatide',
            category: 'glp1',
            categoryLabel: 'GLP-1 Agonist',
            dosage: '30mg',
            purity: '≥98%',
            price: 48,
            cogs: 13.40,
            image: 'images/tirzepatide.jpg',
            url: 'products/tirzepatide.html',
            inStock: true,
            dualTested: true
        },
        {
            sku: 'VX-RETA-10',
            name: 'Retatrutide 10mg',
            shortName: 'Retatrutide',
            slug: 'retatrutide',
            category: 'glp1',
            categoryLabel: 'GLP-1 Agonist',
            dosage: '10mg',
            purity: '≥98%',
            price: 42,
            cogs: 11.40,
            image: 'images/retatrutide.jpg',
            url: 'products/retatrutide-10.html',
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
            categoryLabel: 'Tissue Repair',
            dosage: '5mg',
            purity: '≥98%',
            price: 30,
            cogs: 9.10,
            image: 'images/bpc-157.jpg',
            url: 'products/bpc-157.html',
            inStock: true,
            dualTested: true
        },
        {
            sku: 'VX-TB-5',
            name: 'TB-500 5mg',
            shortName: 'TB-500',
            slug: 'tb500',
            category: 'tissue-repair',
            categoryLabel: 'Tissue Repair',
            dosage: '5mg',
            purity: '≥98%',
            price: 34,
            cogs: 11.40,
            image: 'images/tb-500.jpg',
            url: 'products/tb-500.html',
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
            inStock: true,
            dualTested: true
        },
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
            inStock: true,
            dualTested: true
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
            inStock: true,
            dualTested: true
        },
        {
            sku: 'VX-BAC-30',
            name: 'BAC Water 30ml',
            shortName: 'BAC Water',
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
            sku: 'VX-NAD-1000',
            name: 'NAD+ 1000mg',
            shortName: 'NAD+',
            slug: 'nad',
            category: 'longevity',
            categoryLabel: 'Longevity',
            dosage: '1000mg',
            purity: '≥98%',
            price: 34,
            image: 'images/nad.jpg',
            url: 'products/nad-1000mg.html',
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
    
    // STACKS / BUNDLES
    stacks: [
        {
            id: 'repair-stack',
            name: 'Repair Stack',
            description: 'Accelerated tissue regeneration',
            products: ['VX-BPC-5', 'VX-TB-5'],
            regularPrice: 64,
            stackPrice: 54,
            discount: 15,
            savings: 10
        },
        {
            id: 'gh-stack',
            name: 'GH Stack',
            description: 'Growth hormone optimization',
            products: ['VX-CJC-5', 'VX-IPA-5'],
            regularPrice: 54,
            stackPrice: 46,
            discount: 15,
            savings: 8
        },
        {
            id: 'glp-power',
            name: 'GLP Power Stack',
            description: 'Advanced metabolic support',
            products: ['VX-RETA-10', 'VX-TIRZ-30'],
            regularPrice: 90,
            stackPrice: 81,
            discount: 10,
            savings: 9
        },
        {
            id: 'beginner-glp',
            name: 'Beginner GLP Stack',
            description: 'Start your GLP journey',
            products: ['VX-SEMA-10', 'VX-BAC-30'],
            regularPrice: 46,
            stackPrice: 41,
            discount: 11,
            savings: 5
        },
        {
            id: 'advanced-glp',
            name: 'Advanced GLP Stack',
            description: 'Maximum metabolic efficiency',
            products: ['VX-RETA-20', 'VX-SEMA-10'],
            regularPrice: 96,
            stackPrice: 86,
            discount: 10,
            savings: 10
        },
        {
            id: 'summer-lean',
            name: 'Summer Lean Stack',
            description: 'Comprehensive body recomposition',
            products: ['VX-MT2-10', 'VX-CJC-5', 'VX-IPA-5'],
            regularPrice: 82,
            stackPrice: 72,
            discount: 12,
            savings: 10
        }
    ]
};

// Helper function to get product by SKU
function getProductBySKU(sku) {
    const allProducts = [...VX_PRODUCTS.phase1, ...VX_PRODUCTS.phase2];
    return allProducts.find(p => p.sku === sku);
}

// Helper function to get stack details
function getStackById(id) {
    return VX_PRODUCTS.stacks.find(s => s.id === id);
}
