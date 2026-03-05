/**
 * VANTIX BIO - PRODUCT DATA
 * Lightweight product catalog with SKU, pricing, and metadata
 * Last updated: March 5, 2026
 */

// Optional: Configure notify endpoint (leave undefined to use localStorage only)
const VX_NOTIFY_ENDPOINT = undefined; // Example: "https://api.vantixbio.com/notify"

// Phase 1: Active Products (Dual Tested, Available Now)
const vantixPhase1 = [
  {
    name: "Semaglutide 10mg",
    sku: "VX-SEMA-10",
    category: "glp",
    categoryLabel: "GLP Agonist",
    price: 38,
    bundleEligible: true,
    testingStatus: "dual",
    availability: "in_stock",
    description: "GLP-1 receptor agonist for metabolic research"
  },
  {
    name: "Tirzepatide 30mg",
    sku: "VX-TIRZ-30",
    category: "glp",
    categoryLabel: "GLP Agonist",
    price: 48,
    bundleEligible: true,
    testingStatus: "dual",
    availability: "in_stock",
    description: "Dual GLP-1/GIP receptor agonist"
  },
  {
    name: "Retatrutide 10mg",
    sku: "VX-RETA-10",
    category: "glp",
    categoryLabel: "GLP Agonist",
    price: 42,
    bundleEligible: true,
    testingStatus: "dual",
    availability: "in_stock",
    description: "Triple agonist GLP-1/GIP/Glucagon"
  },
  {
    name: "Retatrutide 20mg",
    sku: "VX-RETA-20",
    category: "glp",
    categoryLabel: "GLP Agonist",
    price: 58,
    bundleEligible: true,
    testingStatus: "dual",
    availability: "in_stock",
    description: "Triple agonist GLP-1/GIP/Glucagon"
  },
  {
    name: "BPC-157 5mg",
    sku: "VX-BPC-5",
    category: "repair",
    categoryLabel: "Tissue Repair",
    price: 30,
    bundleEligible: true,
    testingStatus: "dual",
    availability: "in_stock",
    description: "Body protection compound for tissue repair research"
  },
  {
    name: "TB-500 5mg",
    sku: "VX-TB500-5",
    category: "repair",
    categoryLabel: "Tissue Repair",
    price: 34,
    bundleEligible: true,
    testingStatus: "dual",
    availability: "in_stock",
    description: "Thymosin Beta-4 fragment for healing research"
  },
  {
    name: "CJC-1295 (no DAC) 5mg",
    sku: "VX-CJC-5",
    category: "gh",
    categoryLabel: "Growth Hormone",
    price: 30,
    bundleEligible: true,
    testingStatus: "dual",
    availability: "in_stock",
    description: "GHRH analog for growth hormone research"
  },
  {
    name: "Ipamorelin 5mg",
    sku: "VX-IPA-5",
    category: "gh",
    categoryLabel: "Growth Hormone",
    price: 24,
    bundleEligible: true,
    testingStatus: "dual",
    availability: "in_stock",
    description: "Selective growth hormone secretagogue"
  },
  {
    name: "Epithalon 50mg",
    sku: "VX-EPI-50",
    category: "longevity",
    categoryLabel: "Longevity",
    price: 38,
    bundleEligible: false,
    testingStatus: "dual",
    availability: "in_stock",
    description: "Tetrapeptide for longevity research"
  },
  {
    name: "Melanotan II 10mg",
    sku: "VX-MT2-10",
    category: "seasonal",
    categoryLabel: "Melanocortin",
    price: 28,
    bundleEligible: true,
    testingStatus: "dual",
    availability: "in_stock",
    description: "MC1R/MC4R agonist for pigmentation research"
  },
  {
    name: "BAC Water 30ml",
    sku: "VX-BAC-30",
    category: "supply",
    categoryLabel: "Supply",
    price: 8,
    bundleEligible: true,
    testingStatus: "none",
    availability: "in_stock",
    description: "Bacteriostatic water for reconstitution"
  }
];

// Phase 2: Coming Soon Products (Email Capture)
const vantixPhase2 = [
  {
    name: "NAD+ 1000mg",
    sku: "VX-NAD-1000",
    category: "longevity",
    categoryLabel: "Longevity",
    price: 34,
    availability: "coming_soon",
    description: "Nicotinamide adenine dinucleotide for cellular energy"
  },
  {
    name: "Semax 10mg",
    sku: "VX-SEMAX-10",
    category: "cognitive",
    categoryLabel: "Cognitive",
    price: 28,
    availability: "coming_soon",
    description: "Neuropeptide for cognitive enhancement research"
  },
  {
    name: "Selank 10mg",
    sku: "VX-SELANK-10",
    category: "cognitive",
    categoryLabel: "Cognitive",
    price: 28,
    availability: "coming_soon",
    description: "Anxiolytic peptide for neurological research"
  },
  {
    name: "Thymosin Alpha-1 5mg",
    sku: "VX-TA1-5",
    category: "immune",
    categoryLabel: "Immune Support",
    price: 38,
    availability: "coming_soon",
    description: "Immune modulation research compound"
  },
  {
    name: "AOD-9604 2mg",
    sku: "VX-AOD-2",
    category: "metabolic",
    categoryLabel: "Metabolic",
    price: 30,
    availability: "coming_soon",
    description: "Fat metabolism research peptide"
  }
];

// Stack Bundles
const vantixStacks = [
  {
    name: "Repair Stack",
    sku: "VX-STACK-REPAIR",
    products: ["VX-BPC-5", "VX-TB500-5"],
    productNames: ["BPC-157 5mg", "TB-500 5mg"],
    price: 54,
    originalPrice: 64,
    savings: 10,
    discount: "15%",
    description: "Tissue repair research pair",
    category: "repair"
  },
  {
    name: "GH Stack",
    sku: "VX-STACK-GH",
    products: ["VX-CJC-5", "VX-IPA-5"],
    productNames: ["CJC-1295 (no DAC) 5mg", "Ipamorelin 5mg"],
    price: 46,
    originalPrice: 54,
    savings: 8,
    discount: "15%",
    description: "Growth hormone secretagogue protocol",
    category: "gh"
  },
  {
    name: "GLP Power",
    sku: "VX-STACK-GLP-POWER",
    products: ["VX-RETA-10", "VX-TIRZ-30"],
    productNames: ["Retatrutide 10mg", "Tirzepatide 30mg"],
    price: 81,
    originalPrice: 90,
    savings: 9,
    discount: "10%",
    description: "Triple + dual agonist combination",
    category: "glp"
  },
  {
    name: "Beginner GLP",
    sku: "VX-STACK-GLP-BEGIN",
    products: ["VX-SEMA-10", "VX-BAC-30"],
    productNames: ["Semaglutide 10mg", "BAC Water 30ml"],
    price: 41,
    originalPrice: 46,
    savings: 5,
    discount: "10%",
    description: "GLP-1 starter with reconstitution water",
    category: "glp"
  },
  {
    name: "Advanced GLP",
    sku: "VX-STACK-GLP-ADV",
    products: ["VX-RETA-20", "VX-SEMA-10"],
    productNames: ["Retatrutide 20mg", "Semaglutide 10mg"],
    price: 86,
    originalPrice: 96,
    savings: 10,
    discount: "10%",
    description: "Advanced triple agonist protocol",
    category: "glp"
  },
  {
    name: "Summer Lean",
    sku: "VX-STACK-SUMMER",
    products: ["VX-MT2-10", "VX-CJC-5", "VX-IPA-5"],
    productNames: ["Melanotan II 10mg", "CJC-1295 (no DAC) 5mg", "Ipamorelin 5mg"],
    price: 72,
    originalPrice: 82,
    savings: 10,
    discount: "12%",
    description: "Seasonal research compound trio",
    category: "seasonal"
  }
];

// Category color mapping
const categoryColors = {
  glp: { bg: "rgba(37,99,235,0.1)", text: "#2563EB" },
  repair: { bg: "rgba(5,150,105,0.1)", text: "#059669" },
  gh: { bg: "rgba(234,88,12,0.1)", text: "#EA580C" },
  longevity: { bg: "rgba(180,83,9,0.1)", text: "#B45309" },
  seasonal: { bg: "rgba(219,39,119,0.1)", text: "#DB2777" },
  cognitive: { bg: "rgba(8,145,178,0.1)", text: "#0891B2" },
  immune: { bg: "rgba(124,58,237,0.1)", text: "#7C3AED" },
  metabolic: { bg: "rgba(220,38,38,0.1)", text: "#DC2626" },
  supply: { bg: "rgba(71,85,105,0.1)", text: "#475569" }
};

// Helper: Get product by SKU
function getProductBySKU(sku) {
  return [...vantixPhase1, ...vantixPhase2].find(p => p.sku === sku);
}

// Helper: Get stack by SKU
function getStackBySKU(sku) {
  return vantixStacks.find(s => s.sku === sku);
}
