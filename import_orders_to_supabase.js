#!/usr/bin/env node

// Import Vantix orders from Google Sheets to Supabase
// Usage: node import_orders_to_supabase.js

const { createClient } = require('@supabase/supabase-js');
const { execSync } = require('child_process');

// Supabase config
const SUPABASE_URL = 'https://jbnarypjwtfjbscoqfgh.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpibmFyeXBqd3RmamJzY29xZmdoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4ODgyMTczOCwiZXhwIjoyMTA0Mzk3NzM4fQ.vcOv7F7Ti_59lR2yKSdLwUXWP5iBcDJVFzIVGBlhk0s';

// Google Sheet ID
const SHEET_ID = '1n1YnFDUHyufWPXLAFOxz6RNkPGLr6gajG8JVc00cxTs';

// SKU mapping (parse product names to SKUs)
const SKU_MAP = {
  'tirzepatide': 'VX-TIRZ-30',
  'tirz': 'VX-TIRZ-30',
  'retatrutide': 'VX-RETA-20',
  'reta': 'VX-RETA-20',
  'semaglutide': 'VX-SEMA-10',
  'sema': 'VX-SEMA-10',
  'bpc-157': 'VX-BPC-10',
  'bpc': 'VX-BPC-10',
  'tb-500': 'VX-TB-10',
  'tb': 'VX-TB-10',
  'ghk-cu': 'VX-GHK-100',
  'ghk': 'VX-GHK-100',
  'cjc-1295': 'VX-CJC-10',
  'cjc': 'VX-CJC-10',
  'ipamorelin': 'VX-IPA-5',
  'ipa': 'VX-IPA-5',
  'tesamorelin': 'VX-TESA-10',
  'tesa': 'VX-TESA-10',
  'mots-c': 'VX-MOTS-10',
  'mots': 'VX-MOTS-10',
  'nad+': 'VX-NAD-1000',
  'nad': 'VX-NAD-1000',
  'bac water': 'VX-BAC-30'
};

// Product prices (for items that don't have explicit prices)
const PRICES = {
  'VX-TIRZ-30': 59,
  'VX-RETA-20': 67,
  'VX-SEMA-10': 42,
  'VX-BPC-10': 30,
  'VX-TB-10': 38,
  'VX-GHK-100': 34,
  'VX-CJC-10': 42,
  'VX-IPA-5': 30,
  'VX-TESA-10': 52,
  'VX-MOTS-10': 32,
  'VX-NAD-1000': 67,
  'VX-BAC-30': 12
};

// Parse product string into items array
function parseProducts(productStr) {
  if (!productStr) return [];
  
  const items = [];
  
  // Split by comma or newline
  const parts = productStr.split(/[,\n]+/).map(p => p.trim()).filter(Boolean);
  
  for (const part of parts) {
    // Extract quantity if present (e.g., "5x Reta 20mg" or "1x Reta 20mg ($68)")
    const qtyMatch = part.match(/(\d+)x?\s+/i);
    const qty = qtyMatch ? parseInt(qtyMatch[1]) : 1;
    
    // Extract price if present (e.g., "($68)")
    const priceMatch = part.match(/\(\$?([\d.]+)\)/);
    
    // Clean product name
    let name = part
      .replace(/^\d+x?\s+/i, '')  // Remove qty prefix
      .replace(/\(\$?[\d.]+\)/, '')  // Remove price
      .replace(/\d+mg/i, '$& ')  // Add space after dosage
      .trim();
    
    // Map to SKU
    let sku = null;
    const nameLower = name.toLowerCase();
    for (const [key, value] of Object.entries(SKU_MAP)) {
      if (nameLower.includes(key)) {
        sku = value;
        break;
      }
    }
    
    // Get price
    let price = priceMatch ? parseFloat(priceMatch[1]) : (sku ? PRICES[sku] : 0);
    
    // If price seems wrong (per-item when qty > 1), divide by qty
    if (qty > 1 && price > 100) {
      price = price / qty;
    }
    
    items.push({
      sku: sku || 'UNKNOWN',
      name: name,
      qty: qty,
      price: price
    });
  }
  
  return items;
}

// Parse currency string to number
function parseCurrency(str) {
  if (!str) return 0;
  return parseFloat(str.toString().replace(/[$,]/g, '')) || 0;
}

// Main import function
async function importOrders() {
  console.log('🚀 Starting Vantix orders import...\n');
  
  // Initialize Supabase client
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
  
  // Pull orders from Google Sheets using gog CLI
  console.log('📊 Fetching orders from Google Sheets...');
  const cmd = `gog sheets get ${SHEET_ID} 'Orders!A2:V1000' --json`;
  const output = execSync(cmd, { encoding: 'utf-8' });
  
  const data = JSON.parse(output);
  const rows = data.values || [];
  console.log(`✅ Found ${rows.length} orders\n`);
  
  let imported = 0;
  let skipped = 0;
  let errors = 0;
  
  for (const cols of rows) {
    try {
      // Parse array of values
      
      if (cols.length < 10) {
        console.log(`⚠️  Skipping incomplete row`);
        skipped++;
        continue;
      }
      
      const orderNumber = cols[0];
      const timestamp = cols[1];
      const email = cols[2];
      const name = cols[3];
      const phone = cols[4];
      const address = cols[5];
      const city = cols[6];
      const state = cols[7];
      const zip = cols[8];
      const productStr = cols[9];
      const qty = parseInt(cols[10]) || 1;
      const paymentMethod = cols[11];
      const subtotal = parseCurrency(cols[12]);
      const discountCode = cols[13];
      const discount = parseCurrency(cols[14]);
      const shipping = parseCurrency(cols[15]);
      const total = parseCurrency(cols[16]);
      const cogs = parseCurrency(cols[17]);
      const ccFees = parseCurrency(cols[18]);
      const netProfit = parseCurrency(cols[19]);
      const status = cols[20] || 'paid';
      
      // Parse products into items array
      const items = parseProducts(productStr);
      
      if (items.length === 0) {
        console.log(`⚠️  ${orderNumber}: No valid products parsed from "${productStr}"`);
        skipped++;
        continue;
      }
      
      // Build items_detail string
      const itemsDetail = items.map(item => 
        `${item.qty}x ${item.name} ($${item.price.toFixed(2)})`
      ).join(', ');
      
      // Insert into Supabase
      const { data, error } = await supabase
        .from('orders')
        .insert({
          order_number: orderNumber,
          customer_email: email,
          customer_name: name,
          customer_phone: phone,
          shipping_address: address,
          shipping_city: city,
          shipping_state: state,
          shipping_zip: zip,
          items: items,
          items_detail: itemsDetail,
          subtotal: subtotal,
          discount_code: discountCode || null,
          discount: discount,
          shipping: shipping,
          total: total,
          cogs: cogs || null,
          cc_fees: ccFees || null,
          ship_cost_actual: shipping > 0 ? 7.50 : 0,  // Assume $7.50 actual cost
          payment_method: paymentMethod || 'credit_card',
          status: status === 'Refunded' ? 'refunded' : 'paid',
          created_at: new Date(timestamp).toISOString()
        });
      
      if (error) {
        if (error.code === '23505') {
          // Duplicate order number
          console.log(`⏭️  ${orderNumber}: Already exists (skipping)`);
          skipped++;
        } else {
          console.error(`❌ ${orderNumber}: ${error.message}`);
          errors++;
        }
      } else {
        console.log(`✅ ${orderNumber}: Imported (${items.length} items, $${total.toFixed(2)})`);
        imported++;
      }
      
    } catch (err) {
      console.error(`❌ Error parsing row: ${err.message}`);
      errors++;
    }
  }
  
  console.log(`\n📊 Import Summary:`);
  console.log(`   ✅ Imported: ${imported}`);
  console.log(`   ⏭️  Skipped:  ${skipped}`);
  console.log(`   ❌ Errors:   ${errors}`);
  console.log(`   📦 Total:    ${rows.length}`);
}

// Run import
importOrders().catch(console.error);
