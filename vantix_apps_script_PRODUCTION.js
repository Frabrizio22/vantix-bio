// ============================================
// VANTIX BIO - PRODUCTION APPS SCRIPT
// Complete Order Processing + Inventory + Profit Tracking
// ============================================

// CONFIGURATION
const TELEGRAM_BOT_TOKEN = '8478171743:AAGmYaPtMFh5yHWI-UQmInSlLuYNEcGFbXo';
const TELEGRAM_CHAT_ID = '513307658';
const FROM_EMAIL = 'vantixbio@gmail.com';
const COMPANY_NAME = 'Vantix Bio';
const LOW_STOCK_THRESHOLD = 10; // Alert when batch < 10 vials

// Get active spreadsheet
function getSheet(tabName) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  return ss.getSheetByName(tabName);
}

// ============================================
// MAIN REQUEST HANDLER
// ============================================
function doPost(e) {
  try {
    const params = e.parameter;
    const postData = e.postData;
    
    // Handle JSON POST
    let data;
    if (postData && postData.contents) {
      try {
        data = JSON.parse(postData.contents);
      } catch (err) {
        data = params;
      }
    } else {
      data = params;
    }
    
    const action = data.action || 'order';
    
    // Route to appropriate handler
    if (action === 'order') {
      return handleNewOrder(data);
    } else if (action === 'payment_callback') {
      return handlePaymentCallback(data);
    } else if (action === 'newsletter') {
      return handleNewsletter(data);
    } else if (action === 'notify') {
      return handleNotification(data);
    }
    
    return ContentService.createTextOutput(JSON.stringify({
      status: 'error',
      message: 'Unknown action'
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    Logger.log('Error in doPost: ' + error);
    return ContentService.createTextOutput(JSON.stringify({
      status: 'error',
      message: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// ============================================
// ORDER PROCESSING WITH INVENTORY
// ============================================
function handleNewOrder(data) {
  const ordersSheet = getSheet('Orders');
  const batchesSheet = getSheet('Batches');
  
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
  
  // Calculate COGS and deduct inventory
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
      product: productName
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
    data.order_number,                    // A: Order #
    new Date(),                           // B: Timestamp
    data.customer_email || '',            // C: Email
    data.customer_name || '',             // D: Name
    data.phone || '',                     // E: Phone
    data.address || '',                   // F: Address
    data.city || '',                      // G: City
    data.state || '',                     // H: State
    data.zip || '',                       // I: Zip
    data.items_detail || '',              // J: Product
    items.reduce((sum, i) => sum + (parseInt(i.quantity) || 1), 0), // K: Qty
    data.payment_method || '',            // L: Payment
    parseFloat(data.subtotal) || 0,       // M: Subtotal
    parseFloat(data.shipping) || 0,       // N: Shipping (Cost)
    total,                                // O: Total
    totalCOGS,                            // P: COGS
    actualShipCost,                       // Q: Actual Ship Cost
    ccFees,                               // R: CC Fees (5%)
    netProfit,                            // S: Net Profit
    data.payment_status || 'Pending',     // T: Status
    '',                                   // U: Shipped
    '',                                   // V: Tracking
    batchUpdates.map(u => u.batchId).join(', ') // W: Batch #
  ]);
  
  // Update batch inventory
  for (const update of batchUpdates) {
    // Update Quantity Remaining (column J)
    batchesSheet.getRange(update.row, 10).setValue(update.newQuantity);
    
    // Update Status (column M) to Depleted if quantity is 0
    if (update.newQuantity === 0) {
      batchesSheet.getRange(update.row, 13).setValue('Depleted');
    }
    
    // Increment Vials Sold (column P) if it exists
    const currentSold = batchesSheet.getRange(update.row, 16).getValue() || 0;
    const quantitySold = batchUpdates.find(u => u.row === update.row) ? 
      (items.find(i => i.name === update.product)?.quantity || 1) : 0;
    batchesSheet.getRange(update.row, 16).setValue(currentSold + quantitySold);
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
}

// ============================================
// FIND ACTIVE BATCH FOR PRODUCT
// ============================================
function findActiveBatch(batchesSheet, productName) {
  const batches = batchesSheet.getDataRange().getValues();
  
  // Normalize product name for matching
  const normalizedSearch = productName.toLowerCase().trim();
  
  for (let i = 1; i < batches.length; i++) {
    const batchProduct = (batches[i][2] || '').toString().toLowerCase().trim(); // Column C
    const status = (batches[i][12] || '').toString().toLowerCase(); // Column M
    const quantityRemaining = parseInt(batches[i][9]) || 0; // Column J
    
    // Match product name and check if active and has stock
    if (batchProduct.includes(normalizedSearch) || normalizedSearch.includes(batchProduct)) {
      if (status === 'active' && quantityRemaining > 0) {
        return {
          row: i + 1,
          batchId: batches[i][0], // Column A
          product: batches[i][2], // Column C
          costPerVial: parseFloat(batches[i][8]) || 0, // Column I (Total Cost per Vial)
          quantityRemaining: quantityRemaining
        };
      }
    }
  }
  
  return null;
}

// ============================================
// PAYMENT CALLBACK HANDLER
// ============================================
function handlePaymentCallback(data) {
  const ordersSheet = getSheet('Orders');
  
  if (!data.order_number) {
    return ContentService.createTextOutput(JSON.stringify({
      status: 'error',
      message: 'Missing order_number'
    })).setMimeType(ContentService.MimeType.JSON);
  }
  
  // Find order row
  const orders = ordersSheet.getDataRange().getValues();
  for (let i = 1; i < orders.length; i++) {
    if (orders[i][0] === data.order_number) { // Column A (order_number)
      const oldStatus = orders[i][19]; // Column T
      
      // Update payment status (Column T)
      ordersSheet.getRange(i + 1, 20).setValue(data.payment_status || 'Paid');
      
      // Send notifications if newly paid
      if (data.payment_status === 'Paid' && oldStatus !== 'Paid') {
        const orderData = {
          order_number: orders[i][0],
          customer_name: orders[i][3],
          customer_email: orders[i][2],
          total: orders[i][14],
          payment_method: 'credit_card',
          items_detail: orders[i][9]
        };
        const cogs = orders[i][15];
        const profit = orders[i][18];
        
        sendTelegramNotification(orderData, cogs, profit, []);
        sendCustomerConfirmation(orderData);
      }
      
      return ContentService.createTextOutput(JSON.stringify({
        status: 'success',
        message: 'Payment status updated'
      })).setMimeType(ContentService.MimeType.JSON);
    }
  }
  
  return ContentService.createTextOutput(JSON.stringify({
    status: 'error',
    message: 'Order not found'
  })).setMimeType(ContentService.MimeType.JSON);
}

// ============================================
// NEWSLETTER SIGNUP
// ============================================
function handleNewsletter(data) {
  const newsletterSheet = getSheet('Newsletter');
  
  if (!data.email) {
    return ContentService.createTextOutput(JSON.stringify({
      status: 'error',
      message: 'Missing email'
    })).setMimeType(ContentService.MimeType.JSON);
  }
  
  // Check for duplicates
  const emails = newsletterSheet.getRange('A:A').getValues();
  for (let i = 1; i < emails.length; i++) {
    if (emails[i][0] === data.email) {
      return ContentService.createTextOutput(JSON.stringify({
        status: 'duplicate',
        message: 'Already subscribed'
      })).setMimeType(ContentService.MimeType.JSON);
    }
  }
  
  newsletterSheet.appendRow([
    data.email,
    new Date(),
    data.source || 'website'
  ]);
  
  return ContentService.createTextOutput(JSON.stringify({
    status: 'success',
    message: 'Subscribed'
  })).setMimeType(ContentService.MimeType.JSON);
}

// ============================================
// PRODUCT NOTIFICATION (WAITLIST)
// ============================================
function handleNotification(data) {
  const waitlistSheet = getSheet('Waitlist');
  
  if (!data.email || !data.product) {
    return ContentService.createTextOutput(JSON.stringify({
      status: 'error',
      message: 'Missing email or product'
    })).setMimeType(ContentService.MimeType.JSON);
  }
  
  waitlistSheet.appendRow([
    new Date(),
    data.email,
    data.source || 'product_waitlist',
    data.product
  ]);
  
  // Send Telegram notification
  try {
    const message = `📬 *New Waitlist Signup*\n\n` +
      `Email: ${data.email}\n` +
      `Product: ${data.product}\n` +
      `Source: ${data.source || 'Unknown'}\n` +
      `Time: ${new Date().toLocaleString('en-US', { timeZone: 'America/Los_Angeles' })}`;
    
    sendToTelegram(message);
  } catch (err) {
    Logger.log('Telegram notification failed: ' + err);
  }
  
  return ContentService.createTextOutput(JSON.stringify({
    status: 'success',
    message: 'Added to waitlist'
  })).setMimeType(ContentService.MimeType.JSON);
}

// ============================================
// TELEGRAM NOTIFICATIONS
// ============================================
function sendTelegramNotification(data, cogs, profit, alerts) {
  let message = `🔔 *New Vantix Order*\n\n` +
    `Order: ${data.order_number}\n` +
    `Customer: ${data.customer_name}\n` +
    `Email: ${data.customer_email}\n` +
    `Total: $${parseFloat(data.total).toFixed(2)}\n` +
    `COGS: $${cogs.toFixed(2)}\n` +
    `*Net Profit: $${profit.toFixed(2)}*\n` +
    `Payment: ${data.payment_method}\n\n` +
    `Items:\n${data.items_detail || 'N/A'}`;
  
  // Add stock alerts
  if (alerts && alerts.length > 0) {
    message += '\n\n' + alerts.join('\n');
  }
  
  sendToTelegram(message);
}

function sendToTelegram(message) {
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
// CUSTOMER CONFIRMATION EMAIL
// ============================================
function sendCustomerConfirmation(data) {
  const subject = `Order Confirmation - ${data.order_number}`;
  const body = `Hi ${data.customer_name},\n\n` +
    `Thanks for your order!\n\n` +
    `Order Number: ${data.order_number}\n` +
    `Total: $${parseFloat(data.total).toFixed(2)}\n` +
    `Payment Method: ${data.payment_method}\n\n` +
    `Items:\n${data.items_detail || 'See your order details'}\n\n` +
    `We'll send tracking information once your order ships.\n\n` +
    `Thanks,\n${COMPANY_NAME}`;
  
  try {
    MailApp.sendEmail({
      to: data.customer_email,
      subject: subject,
      body: body,
      name: COMPANY_NAME
    });
  } catch (e) {
    Logger.log('Email error: ' + e);
  }
}
