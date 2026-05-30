// ============================================
// P0 FIX #1: BANKFUL SIGNATURE VERIFICATION
// Add to worker.js handleBankfulCallback()
// ============================================

async function handleBankfulCallback(request, corsHeaders) {
  const url = new URL(request.url);
  const params = Object.fromEntries(url.searchParams);
  
  // Extract signature
  const receivedSignature = params.Signature;
  delete params.Signature;
  
  // Verify signature
  const expectedSignature = await generateHmacSignature(params, BANKFUL_PASSWORD);
  
  if (receivedSignature !== expectedSignature) {
    console.error('Invalid Bankful signature', { received: receivedSignature, expected: expectedSignature });
    return new Response('Invalid signature', { status: 403, headers: corsHeaders });
  }
  
  const orderNumber = params.OrderNumber;
  const status = params.Status;
  
  if (!orderNumber) {
    return new Response('Missing OrderNumber', { status: 400, headers: corsHeaders });
  }
  
  // Update order status in Google Sheets
  const callbackData = {
    action: 'payment_callback',
    order_number: orderNumber,
    payment_status: status === 'Approved' ? 'Paid' : 'Failed'
  };
  
  await fetch(GOOGLE_SHEET_WEBHOOK_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(callbackData)
  });
  
  return Response.redirect('https://vantixbio.com/thank-you.html', 302);
}

// HMAC signature generation (same as Bankful)
async function generateHmacSignature(params, password) {
  const sortedKeys = Object.keys(params).sort();
  const signatureString = sortedKeys.map(key => `${key}=${params[key]}`).join('&');
  
  const encoder = new TextEncoder();
  const data = encoder.encode(signatureString);
  const keyData = encoder.encode(password);
  
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  
  const signature = await crypto.subtle.sign('HMAC', cryptoKey, data);
  const hashArray = Array.from(new Uint8Array(signature));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// ============================================
// P0 FIX #2: LOCKSERVICE + DUPLICATE CHECK FIRST
// Replace entire handleNewOrder() in Apps Script
// ============================================

function handleNewOrder(data) {
  // ACQUIRE LOCK IMMEDIATELY
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(30000); // Wait up to 30 seconds
  } catch (e) {
    return ContentService.createTextOutput(JSON.stringify({
      status: 'error',
      message: 'System busy, please try again'
    })).setMimeType(ContentService.MimeType.JSON);
  }
  
  try {
    const ordersSheet = getSheet('Orders');
    const batchesSheet = getSheet('Batches');
    
    // Validate required fields
    if (!data.customer_name || !data.customer_email || !data.order_number || !data.total) {
      return ContentService.createTextOutput(JSON.stringify({
        status: 'error',
        message: 'Missing required fields'
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    // CHECK DUPLICATE FIRST (before any other logic)
    const existingOrders = ordersSheet.getRange('A2:A1000').getValues(); // Last 1000 orders
    const isDuplicate = existingOrders.flat().includes(data.order_number);
    
    if (isDuplicate) {
      Logger.log('Duplicate order: ' + data.order_number);
      return ContentService.createTextOutput(JSON.stringify({
        status: 'duplicate',
        message: 'Order already processed'
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    // Parse order items
    let items = [];
    try {
      items = JSON.parse(data.items);
    } catch (e) {
      Logger.log('Error parsing items: ' + e);
      return ContentService.createTextOutput(JSON.stringify({
        status: 'error',
        message: 'Invalid items format'
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    // Calculate COGS and deduct inventory (all within lock)
    let totalCOGS = 0;
    const batchUpdates = [];
    const lowStockAlerts = [];
    
    for (const item of items) {
      const productName = item.name;
      const quantity = parseInt(item.quantity) || 1;
      
      // Find active batch for this product
      const batch = findActiveBatch(batchesSheet, productName);
      
      if (!batch) {
        Logger.log('No active batch found for: ' + productName);
        return ContentService.createTextOutput(JSON.stringify({
          status: 'error',
          message: 'No inventory available for: ' + productName
        })).setMimeType(ContentService.MimeType.JSON);
      }
      
      // Check if enough stock
      if (batch.quantityRemaining < quantity) {
        return ContentService.createTextOutput(JSON.stringify({
          status: 'error',
          message: `Insufficient stock for ${productName}. Available: ${batch.quantityRemaining}, Requested: ${quantity}`
        })).setMimeType(ContentService.MimeType.JSON);
      }
      
      // Calculate COGS for this item
      const itemCOGS = batch.costPerVial * quantity;
      totalCOGS += itemCOGS;
      
      // Prepare batch update
      const newQuantity = batch.quantityRemaining - quantity;
      batchUpdates.push({
        row: batch.row,
        newQuantity: newQuantity,
        batchId: batch.batchId,
        product: productName,
        quantity: quantity
      });
      
      // Check for low stock
      if (newQuantity <= LOW_STOCK_THRESHOLD && newQuantity > 0) {
        lowStockAlerts.push(`⚠️ LOW STOCK: ${productName} (${batch.batchId}) - ${newQuantity} vials remaining`);
      } else if (newQuantity === 0) {
        lowStockAlerts.push(`🔴 DEPLETED: ${productName} (${batch.batchId}) - Out of stock`);
      }
    }
    
    // Calculate fees and profit
    const total = parseFloat(data.total) || 0;
    const actualShipCost = parseFloat(data.actual_ship_cost) || 0;
    const ccFees = (data.payment_method && data.payment_method.toLowerCase().includes('credit')) 
      ? (total * 0.05) 
      : 0;
    const netProfit = total - totalCOGS - actualShipCost - ccFees;
    
    // Write order to sheet
    ordersSheet.appendRow([
      data.order_number,
      new Date(),
      data.customer_email || '',
      data.customer_name || '',
      data.phone || '',
      data.address || '',
      data.city || '',
      data.state || '',
      data.zip || '',
      data.items_detail || '',
      items.reduce((sum, i) => sum + (parseInt(i.quantity) || 1), 0),
      data.payment_method || '',
      parseFloat(data.subtotal) || 0,
      parseFloat(data.shipping) || 0,
      total,
      totalCOGS,
      actualShipCost,
      ccFees,
      netProfit,
      data.payment_status || 'Pending',
      '',
      '',
      batchUpdates.map(u => u.batchId).join(', ')
    ]);
    
    // Update batch inventory (still within lock)
    for (const update of batchUpdates) {
      batchesSheet.getRange(update.row, 10).setValue(update.newQuantity);
      
      if (update.newQuantity === 0) {
        batchesSheet.getRange(update.row, 13).setValue('Depleted');
      }
      
      const currentSold = batchesSheet.getRange(update.row, 16).getValue() || 0;
      batchesSheet.getRange(update.row, 16).setValue(currentSold + update.quantity);
    }
    
    // Send notifications
    if (data.payment_method === 'zelle' || data.payment_status === 'Paid') {
      sendTelegramNotification(data, totalCOGS, netProfit, lowStockAlerts);
      sendCustomerConfirmation(data);
    }
    
    return ContentService.createTextOutput(JSON.stringify({
      status: 'success',
      message: 'Order processed',
      cogs: totalCOGS,
      profit: netProfit
    })).setMimeType(ContentService.MimeType.JSON);
    
  } finally {
    // ALWAYS RELEASE LOCK
    lock.releaseLock();
  }
}

// ============================================
// P0 FIX #3: CHECK SHEET WRITE RESPONSE
// Add to worker.js handleBankfulPayment() and handleZelleOrder()
// ============================================

async function handleBankfulPayment(data, corsHeaders) {
  // ... existing order data prep ...
  
  // Log to Google Sheets WITH ERROR CHECKING
  const sheetResponse = await fetch(GOOGLE_SHEET_WEBHOOK_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(orderData)
  });
  
  if (!sheetResponse.ok) {
    // FAIL LOUD - don't proceed to payment if we can't log order
    console.error('Sheet write failed:', await sheetResponse.text());
    return new Response(JSON.stringify({
      status: 'error',
      message: 'System error - please try again or contact support'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
  
  // Only proceed to Bankful if Sheet write succeeded
  const bankfulUrl = 'https://api.paybybankful.com/front-calls/go-in/hosted-page-pay';
  // ... rest of Bankful redirect ...
}
