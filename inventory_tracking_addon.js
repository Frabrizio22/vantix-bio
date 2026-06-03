// ============================================
// INVENTORY TRACKING SYSTEM
// Add this to vantix_apps_script_COMPLETE_WITH_FORMAT.js
// ============================================

// Call this function after successfully adding an order
function updateInventory(productName, quantity) {
  const catalogSheet = getSheet('Catalog');
  
  if (!catalogSheet) {
    Logger.log('Catalog sheet not found');
    return;
  }
  
  // Get all catalog data
  const catalogData = catalogSheet.getDataRange().getValues();
  
  // Find the product row (skip header row)
  for (let i = 1; i < catalogData.length; i++) {
    const rowProductName = catalogData[i][1]; // Column B = Name
    
    if (rowProductName === productName) {
      const currentStock = parseInt(catalogData[i][5]) || 0; // Column F = Current Stock
      const newStock = currentStock - quantity;
      
      // Update Current Stock (Column F)
      catalogSheet.getRange(i + 1, 6).setValue(newStock);
      
      // If stock hits 0 or below, update status to out_of_stock (Column G)
      if (newStock <= 0) {
        catalogSheet.getRange(i + 1, 7).setValue('out_of_stock');
        
        // Send out-of-stock alert
        sendLowStockAlert(productName, 0, true);
      }
      // Low stock warning (below 5 vials)
      else if (newStock <= 5 && newStock > 0) {
        sendLowStockAlert(productName, newStock, false);
      }
      
      Logger.log(`Inventory updated: ${productName} - ${currentStock} → ${newStock}`);
      return;
    }
  }
  
  Logger.log(`Product not found in Catalog: ${productName}`);
}

// Send low stock or out-of-stock alerts
function sendLowStockAlert(productName, stockLevel, isOutOfStock) {
  let message;
  
  if (isOutOfStock) {
    message = `🚨 *OUT OF STOCK ALERT*\n\n` +
      `Product: ${productName}\n` +
      `Current Stock: 0 vials\n\n` +
      `⚠️ This product is now unavailable on the website.`;
  } else {
    message = `⚠️ *LOW STOCK WARNING*\n\n` +
      `Product: ${productName}\n` +
      `Current Stock: ${stockLevel} vials\n\n` +
      `Consider reordering soon.`;
  }
  
  const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
  const payload = {
    chat_id: TELEGRAM_CHAT_ID,
    text: message,
    parse_mode: 'Markdown'
  };
  
  try {
    UrlFetchApp.fetch(url, {
      method: 'post',
      contentType: 'application/json',
      payload: JSON.stringify(payload),
      muteHttpExceptions: true
    });
  } catch (e) {
    Logger.log('Telegram error: ' + e);
  }
}

// ============================================
// MODIFIED handleNewOrder FUNCTION
// Replace the existing handleNewOrder with this version
// ============================================
function handleNewOrder(data) {
  const ordersSheet = getSheet('Orders');
  
  // Validate required fields
  if (!data.customer_name || !data.customer_email || !data.order_number || !data.total) {
    return ContentService.createTextOutput(JSON.stringify({
      status: 'error',
      message: 'Missing required fields'
    })).setMimeType(ContentService.MimeType.JSON);
  }
  
  // Check if order already exists
  const existingOrders = ordersSheet.getRange('A:A').getValues();
  for (let i = 1; i < existingOrders.length; i++) {
    if (existingOrders[i][0] === data.order_number) {
      Logger.log('Duplicate order: ' + data.order_number);
      return ContentService.createTextOutput(JSON.stringify({
        status: 'duplicate',
        message: 'Order already processed'
      })).setMimeType(ContentService.MimeType.JSON);
    }
  }
  
  const quantity = parseInt(data.quantity) || 1;
  
  // Add to Orders sheet
  ordersSheet.appendRow([
    data.order_number || '', 
    new Date(),
    data.customer_email || '',
    data.customer_name || '',
    data.phone || '',
    data.address || '',
    data.city || '',
    data.state || '',
    data.zip || '',
    data.product_name || '',
    quantity,
    data.payment_method || '',
    parseFloat(data.subtotal) || 0,
    parseFloat(data.shipping_customer) || 0,
    parseFloat(data.total) || 0,
    '', // COGS - formula auto-calculates
    parseFloat(data.shipping_actual) || 0,
    '', // CC Fees - formula auto-calculates
    '', // Net Profit - formula auto-calculates
    data.status || 'Pending',
    data.shipped_date || '',
    data.tracking || '',
    data.batch_number || ''
  ]);
  
  // 🆕 UPDATE INVENTORY
  updateInventory(data.product_name, quantity);
  
  // Send notifications (only for confirmed orders)
  if (data.payment_method === 'Zelle' || data.payment_status === 'Paid') {
    sendTelegramNotification(data);
    sendCustomerConfirmation(data);
  }
  
  return ContentService.createTextOutput(JSON.stringify({
    status: 'success',
    message: 'Order processed'
  })).setMimeType(ContentService.MimeType.JSON);
}
