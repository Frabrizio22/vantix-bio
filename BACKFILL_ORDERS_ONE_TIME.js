// ============================================
// VANTIX BIO - ONE-TIME BACKFILL SCRIPT
// Converts existing order rows to proper product ID format
// RUN ONCE, then delete this script
// ============================================

function backfillOrders() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const ordersSheet = ss.getSheetByName('Orders');
  
  if (!ordersSheet) {
    Logger.log('Orders sheet not found');
    return;
  }
  
  // Product name patterns to Product ID mapping
  const productMap = {
    'reta': 'reta-20mg',
    'retatrutide': 'reta-20mg',
    'tirz': 'tirz-30mg',
    'tirzepatide': 'tirz-30mg',
    'sema': 'sema-10mg',
    'semaglutide': 'sema-10mg',
    'bpc': 'bpc-10mg',
    'tb-500': 'tb-10mg',
    'tb500': 'tb-10mg',
    'ghk': 'ghk-100mg',
    'cjc': 'cjc-5mg',
    'ipa': 'ipa-5mg',
    'ipamorelin': 'ipa-5mg',
    'mots': 'mots-10mg',
    'nad': 'nad-1000mg',
    'tesa': 'tesa-10mg',
    'tesamorelin': 'tesa-10mg',
    'aod': 'aod-10mg'
  };
  
  // Get all data from Orders sheet
  const data = ordersSheet.getDataRange().getValues();
  const headers = data[0];
  
  // Find column indexes
  const productColIndex = headers.indexOf('Product');
  const qtyColIndex = headers.indexOf('Qty');
  
  if (productColIndex === -1 || qtyColIndex === -1) {
    Logger.log('Required columns not found');
    return;
  }
  
  Logger.log(`Processing ${data.length - 1} orders...`);
  
  // Process each row (skip header)
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    const productText = String(row[productColIndex]).toLowerCase();
    
    if (!productText || productText === '') continue;
    
    // Try to extract product ID from text
    let productId = null;
    let qty = parseInt(row[qtyColIndex]) || 1;
    
    // Check for each product pattern
    for (const [pattern, id] of Object.entries(productMap)) {
      if (productText.includes(pattern)) {
        productId = id;
        
        // Extract quantity from text if present (e.g., "3x Tirz" or "Tirz (x3)")
        const qtyMatch = productText.match(/(\d+)x|x(\d+)/);
        if (qtyMatch) {
          qty = parseInt(qtyMatch[1] || qtyMatch[2]);
        }
        
        break;
      }
    }
    
    // Update the row if we found a product ID
    if (productId) {
      ordersSheet.getRange(i + 1, productColIndex + 1).setValue(productId);
      ordersSheet.getRange(i + 1, qtyColIndex + 1).setValue(qty);
      Logger.log(`Row ${i + 1}: Updated "${productText}" → ${productId} (qty: ${qty})`);
    } else {
      Logger.log(`Row ${i + 1}: Could not parse "${productText}"`);
    }
  }
  
  Logger.log('Backfill complete!');
  Logger.log('Check the Orders tab - Product column should now show product IDs');
  Logger.log('Catalog inventory should auto-update via formulas');
}

// Instructions:
// 1. Copy this entire script
// 2. Open your Vantix Orders sheet
// 3. Extensions → Apps Script
// 4. Click the "+" next to Files → Script
// 5. Name it "Backfill" and paste this code
// 6. Save (Cmd+S)
// 7. Select "backfillOrders" from the function dropdown
// 8. Click Run (▶️)
// 9. Authorize if prompted
// 10. Check View → Logs to see results
// 11. Verify Orders tab product column is updated
// 12. Delete this script file after running once
