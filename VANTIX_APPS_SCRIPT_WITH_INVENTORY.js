// ============================================
// VANTIX BIO - APPS SCRIPT WITH INVENTORY TRACKING
// DEPLOYMENT INSTRUCTIONS:
// 1. Open Google Apps Script editor for your Vantix sheet
// 2. Replace ALL existing code with this file
// 3. Deploy as web app
// 4. Copy the webhook URL to your Cloudflare Worker
// ============================================

// CONFIGURATION
const TELEGRAM_BOT_TOKEN = '8478171743:AAHc9H_QoXNsbaelWNwTrjHbWI_ZmDQY6L0';
const TELEGRAM_CHAT_ID = '513307658';
const FROM_EMAIL = 'vantixbio@gmail.com';
const COMPANY_NAME = 'Vantix Bio';
const API_SECRET_KEY = 'vantix_live_2026_secure_key_abc123'; // Change this!

// Get sheet by name
function getSheet(tabName) {
  return SpreadsheetApp.getActiveSpreadsheet().getSheetByName(tabName);
}

// ============================================
// MAIN REQUEST HANDLER
// ============================================
function doPost(e) {
  try {
    const postData = e.postData;
    let data;
    
    if (postData && postData.contents) {
      try {
        data = JSON.parse(postData.contents);
      } catch (err) {
        data = e.parameter;
      }
    } else {
      data = e.parameter;
    }
    
    // Security check
    const providedKey = data.api_key || e.parameter.api_key;
    if (providedKey !== API_SECRET_KEY) {
      Logger.log('Unauthorized access attempt');
      return ContentService.createTextOutput(JSON.stringify({
        status: 'error',
        message: 'Unauthorized'
      })).setMimeType(ContentService.MimeType.JSON);
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
// ORDER PROCESSING WITH INVENTORY TRACKING
// ============================================
function handleNewOrder(data) {
  const ordersSheet = getSheet('Orders');
  
  if (!data.customer_name || !data.customer_email || !data.order_number || !data.total) {
    return ContentService.createTextOutput(JSON.stringify({
      status: 'error',
      message: 'Missing required fields'
    })).setMimeType(ContentService.MimeType.JSON);
  }
  
  // Check for duplicate orders
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
  
  // Add order to sheet
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
    '', // COGS (formula)
    parseFloat(data.shipping_actual) || 0,
    '', // CC Fees (formula)
    '', // Net Profit (formula)
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

// ============================================
// INVENTORY TRACKING SYSTEM
// ============================================
function updateInventory(productName, quantity) {
  const catalogSheet = getSheet('Catalog');
  
  if (!catalogSheet) {
    Logger.log('Catalog sheet not found');
    return;
  }
  
  const catalogData = catalogSheet.getDataRange().getValues();
  
  // Find product row (skip header)
  for (let i = 1; i < catalogData.length; i++) {
    const rowProductName = catalogData[i][1]; // Column B = Name
    
    if (rowProductName === productName) {
      const currentStock = parseInt(catalogData[i][5]) || 0; // Column F = Current Stock
      const newStock = currentStock - quantity;
      
      // Update Current Stock (Column F, row i+1)
      catalogSheet.getRange(i + 1, 6).setValue(newStock);
      
      Logger.log(`Inventory updated: ${productName} - ${currentStock} → ${newStock}`);
      
      // If stock hits 0 or below, update status to out_of_stock
      if (newStock <= 0) {
        catalogSheet.getRange(i + 1, 7).setValue('out_of_stock'); // Column G = Status
        sendLowStockAlert(productName, 0, true);
      }
      // Low stock warning (5 vials or less)
      else if (newStock <= 5) {
        sendLowStockAlert(productName, newStock, false);
      }
      
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
      `⚠️ Product is now unavailable on website.`;
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
      // Update payment status (Column T = index 19)
      ordersSheet.getRange(i + 1, 20).setValue(data.payment_status || 'Paid');
      
      // Send notifications if newly paid
      if (data.payment_status === 'Paid' && orders[i][19] !== 'Shipped') {
        const orderData = {
          order_number: orders[i][0],
          customer_name: orders[i][3],
          customer_email: orders[i][2],
          total: orders[i][14],
          payment_method: 'Credit Card',
          product_name: orders[i][9],
          quantity: orders[i][10]
        };
        sendTelegramNotification(orderData);
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
    new Date(),
    data.email,
    data.source || 'website',
    'active'
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
  const notificationsSheet = getSheet('Notifications');
  
  if (!data.email || !data.product) {
    return ContentService.createTextOutput(JSON.stringify({
      status: 'error',
      message: 'Missing email or product'
    })).setMimeType(ContentService.MimeType.JSON);
  }
  
  notificationsSheet.appendRow([
    new Date(),
    data.email,
    data.product,
    'pending',
    ''
  ]);
  
  return ContentService.createTextOutput(JSON.stringify({
    status: 'success',
    message: 'Added to waitlist'
  })).setMimeType(ContentService.MimeType.JSON);
}

// ============================================
// TELEGRAM NOTIFICATIONS
// ============================================
function sendTelegramNotification(data) {
  const message = `🔔 *New Vantix Order*\n\n` +
    `Order: #${data.order_number}\n` +
    `Customer: ${data.customer_name}\n` +
    `Email: ${data.customer_email}\n` +
    `Total: $${parseFloat(data.total).toFixed(2)}\n` +
    `Payment: ${data.payment_method}\n\n` +
    `Product: ${data.product_name || 'N/A'}\n` +
    `Quantity: ${data.quantity || 1}`;
  
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
  const subject = `Order Confirmation - #${data.order_number}`;
  const body = `Hi ${data.customer_name},\n\n` +
    `Thanks for your order!\n\n` +
    `Order Number: #${data.order_number}\n` +
    `Total: $${parseFloat(data.total).toFixed(2)}\n` +
    `Payment Method: ${data.payment_method}\n\n` +
    `Product: ${data.product_name || 'See order details'}\n` +
    `Quantity: ${data.quantity || 1}\n\n` +
    `We'll send tracking information once your order ships.\n\n` +
    `For research use only.\n\n` +
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
