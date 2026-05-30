// ============================================
// VANTIX BIO - PRODUCTION APPS SCRIPT WITH LOCKSERVICE
// P0 Fix: Race condition prevention + duplicate check first
// ============================================

// CONFIGURATION
const TELEGRAM_BOT_TOKEN = '8478171743:AAGmYaPtMFh5yHWI-UQmInSlLuYNEcGFbXo';
const TELEGRAM_CHAT_ID = '513307658';
const FROM_EMAIL = 'vantixbio@gmail.com';
const COMPANY_NAME = 'Vantix Bio';
const LOW_STOCK_THRESHOLD = 10;

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
// ORDER PROCESSING WITH LOCKSERVICE
// ============================================
function handleNewOrder(data) {
  // ACQUIRE LOCK IMMEDIATELY
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(30000); // Wait up to 30 seconds
  } catch (e) {
    Logger.log('Lock acquisition failed: ' + e);
    return ContentService.createTextOutput(JSON.stringify({
      status: 'error',
      message: 'System busy - please try again in a moment'
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
    
    // CHECK DUPLICATE FIRST (before any inventory logic)
    // Limit to last 1000 orders for performance
    const existingOrders = ordersSheet.getRange('A2:A1000').getValues();
    const isDuplicate = existingOrders.flat().includes(data.order_number);
    
    if (isDuplicate) {
      Logger.log('Duplicate order detected: ' + data.order_number);
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
      // Update Quantity Remaining (column J)
      batchesSheet.getRange(update.row, 10).setValue(update.newQuantity);
      
      // Update Status (column M) to Depleted if quantity is 0
      if (update.newQuantity === 0) {
        batchesSheet.getRange(update.row, 13).setValue('Depleted');
      }
      
      // Increment Vials Sold (column P) if it exists
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
// FIND ACTIVE BATCH FOR PRODUCT
// ============================================
function findActiveBatch(batchesSheet, productName) {
  const batches = batchesSheet.getDataRange().getValues();
  const normalizedSearch = productName.toLowerCase().trim();
  
  for (let i = 1; i < batches.length; i++) {
    const batchProduct = (batches[i][2] || '').toString().toLowerCase().trim();
    const status = (batches[i][12] || '').toString().toLowerCase();
    const quantityRemaining = parseInt(batches[i][9]) || 0;
    
    if (batchProduct.includes(normalizedSearch) || normalizedSearch.includes(batchProduct)) {
      if (status === 'active' && quantityRemaining > 0) {
        return {
          row: i + 1,
          batchId: batches[i][0],
          product: batches[i][2],
          costPerVial: parseFloat(batches[i][8]) || 0,
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
  
  const orders = ordersSheet.getDataRange().getValues();
  for (let i = 1; i < orders.length; i++) {
    if (orders[i][0] === data.order_number) {
      const oldStatus = orders[i][19];
      
      ordersSheet.getRange(i + 1, 20).setValue(data.payment_status || 'Paid');
      
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
