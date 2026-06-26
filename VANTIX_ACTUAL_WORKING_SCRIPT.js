// ============================================
// VANTIX BIO - APPS SCRIPT WITH PROPER INVENTORY TRACKING
// UPDATED: June 24, 2026 - Corrected column positions (Ship Cost Actual added)
// ============================================

// CONFIGURATION
const TELEGRAM_BOT_TOKEN = '8478171743:AAFrXkufgw1kRM0PIQxaXOLpYb3jpjDQxvA';
const TELEGRAM_CHAT_ID = '513307658';
const FROM_EMAIL = 'vantixbio@gmail.com';
const COMPANY_NAME = 'Vantix Bio';
const API_SECRET_KEY = 'vantix_live_2026_secure_key_abc123';

// SKU to Product ID mapping for inventory tracking
const SKU_TO_PRODUCT_ID = {
  'VX-TIRZ-30': 'tirz-30mg',
  'VX-RETA-20': 'reta-20mg',
  'VX-SEMA-10': 'sema-10mg',
  'VX-BPC-10': 'bpc-10mg',
  'VX-TB-10': 'tb-10mg',
  'VX-GHK-100': 'ghk-100mg',
  'VX-CJC-10': 'cjc-5mg',
  'VX-IPA-5': 'ipa-5mg',
  'VX-MOTS-10': 'mots-10mg',
  'VX-NAD-1000': 'nad-1000mg',
  'VX-TESA-10': 'tesa-10mg',
  'VX-AOD-10': 'aod-10mg'
};

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
      return handleOrder(data);
    } else if (action === 'waitlist') {
      return handleWaitlist(data);
    } else if (action === 'email_capture') {
      return handleEmailCapture(data);
    } else {
      return ContentService.createTextOutput(JSON.stringify({
        status: 'error',
        message: 'Unknown action'
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
  } catch (error) {
    Logger.log('Error in doPost: ' + error.toString());
    return ContentService.createTextOutput(JSON.stringify({
      status: 'error',
      message: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// ============================================
// ORDER HANDLER - LOGS EACH ITEM AS SEPARATE ROW
// ============================================
function handleOrder(data) {
  const ordersSheet = getSheet('Orders');
  if (!ordersSheet) {
    throw new Error('Orders sheet not found');
  }
  
  const timestamp = new Date();
  const orderNumber = data.order_number || data.orderId || generateOrderId();
  const items = data.items || [];
  
  // Calculate per-item costs
  const subtotal = parseFloat(data.subtotal) || 0;
  const discount = parseFloat(data.discount) || 0;
  const shipping = parseFloat(data.shipping) || 0;
  const total = parseFloat(data.total) || 0;
  
  // Split shipping and discount proportionally across items
  const totalQty = items.reduce((sum, item) => sum + parseInt(item.quantity), 0);
  
  // Log each item as a separate row
  items.forEach((item, index) => {
    const qty = parseInt(item.quantity);
    const itemPrice = parseFloat(item.price);
    const itemSubtotal = itemPrice * qty;
    
    // Proportional discount and shipping
    const itemDiscount = totalQty > 0 ? (discount * qty / totalQty) : 0;
    const itemShipping = (index === 0) ? shipping : 0; // Only apply shipping to first item
    const itemTotal = itemSubtotal - itemDiscount + itemShipping;
    
    // Calculate COGS
    const itemCogs = parseFloat(item.cogs || 0) * qty;
    
    // Calculate CC fees (4.4% + $0.40)
    const paymentMethod = data.payment_method || 'credit_card';
    const itemCCFees = (paymentMethod === 'credit_card') ? 
      (itemTotal * 0.044 + (index === 0 ? 0.40 : 0)) : 0;
    
    // Product ID for inventory tracking
    const productId = SKU_TO_PRODUCT_ID[item.sku] || item.sku;
    
    // UPDATED COLUMN ORDER (Ship Cost Actual added in column T)
    ordersSheet.appendRow([
      orderNumber,                  // A: Order #
      timestamp,                    // B: Timestamp
      data.customer_email || '',    // C: Email
      data.customer_name || '',     // D: Name
      data.phone || '',             // E: Phone
      data.address || '',           // F: Address
      data.city || '',              // G: City
      data.state || '',             // H: State
      data.zip || '',               // I: Zip
      productId,                    // J: Product ID (for inventory matching)
      qty,                          // K: Qty
      paymentMethod,                // L: Payment
      itemSubtotal.toFixed(2),      // M: Subtotal
      data.discount_code || '',     // N: Discount Code
      itemDiscount.toFixed(2),      // O: Discount
      itemShipping.toFixed(2),      // P: Shipping
      itemTotal.toFixed(2),         // Q: Total
      itemCogs.toFixed(2),          // R: COGS
      itemCCFees.toFixed(2),        // S: CC Fees (4.4%)
      '',                           // T: Ship Cost Actual (manual entry)
      '=Q' + (ordersSheet.getLastRow()+1) + '-R' + (ordersSheet.getLastRow()+1) + '-S' + (ordersSheet.getLastRow()+1) + '-T' + (ordersSheet.getLastRow()+1), // U: Net Profit (formula)
      'Pending',                    // V: Status
      '',                           // W: Shipped
      '',                           // X: Tracking
      ''                            // Y: Batch #
    ]);
  });
  
  // Send Telegram notification (one per order, not per item)
  sendTelegramNotification(orderNumber, data);
  
  // Send confirmation email
  sendConfirmationEmail(data);
  
  return ContentService.createTextOutput(JSON.stringify({
    status: 'success',
    message: 'Order logged',
    order_number: orderNumber
  })).setMimeType(ContentService.MimeType.JSON);
}

// ============================================
// WAITLIST HANDLER
// ============================================
function handleWaitlist(data) {
  const waitlistSheet = getSheet('Waitlist');
  if (!waitlistSheet) {
    throw new Error('Waitlist sheet not found');
  }
  
  waitlistSheet.appendRow([
    new Date(),
    data.email || '',
    data.product || '',
    data.sku || ''
  ]);
  
  return ContentService.createTextOutput(JSON.stringify({
    status: 'success',
    message: 'Added to waitlist'
  })).setMimeType(ContentService.MimeType.JSON);
}

// ============================================
// EMAIL CAPTURE HANDLER
// ============================================
function handleEmailCapture(data) {
  const newsletterSheet = getSheet('Newsletter');
  if (!newsletterSheet) {
    throw new Error('Newsletter sheet not found');
  }
  
  newsletterSheet.appendRow([
    new Date(),
    data.email || '',
    data.source || 'website'
  ]);
  
  // Send Telegram notification
  const message = `📧 New Email Signup\nEmail: ${data.email}\nSource: ${data.source || 'website'}`;
  sendTelegram(message);
  
  return ContentService.createTextOutput(JSON.stringify({
    status: 'success',
    message: 'Email captured'
  })).setMimeType(ContentService.MimeType.JSON);
}

// ============================================
// HELPER FUNCTIONS
// ============================================
function generateOrderId() {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substr(2, 5);
  return `VX-${timestamp}-${random}`.toUpperCase();
}

function sendTelegramNotification(orderNumber, data) {
  try {
    const items = data.items || [];
    const itemList = items.map(item => 
      `${item.quantity}x ${item.name} ($${item.price})`
    ).join('\n');
    
    const message = `🛒 NEW ORDER: ${orderNumber}\n\n` +
      `👤 ${data.customer_name}\n` +
      `📧 ${data.customer_email}\n` +
      `📱 ${data.phone || 'N/A'}\n\n` +
      `📦 ITEMS:\n${itemList}\n\n` +
      `💰 Total: $${data.total}\n` +
      `💳 Payment: ${data.payment_method}`;
    
    sendTelegram(message);
  } catch (error) {
    Logger.log('Telegram error: ' + error.toString());
  }
}

function sendTelegram(message) {
  const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
  const payload = {
    chat_id: TELEGRAM_CHAT_ID,
    text: message,
    parse_mode: 'HTML'
  };
  
  const options = {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  };
  
  UrlFetchApp.fetch(url, options);
}

function sendConfirmationEmail(data) {
  try {
    const items = data.items || [];
    const itemRows = items.map(item => 
      `<tr><td>${item.quantity}x ${item.name}</td><td>$${(item.price * item.quantity).toFixed(2)}</td></tr>`
    ).join('');
    
    const subject = `Order Confirmation - ${data.order_number}`;
    const htmlBody = 
      `<h2>Thank you for your order!</h2>` +
      `<p>Order #: <strong>${data.order_number}</strong></p>` +
      `<table border="1" cellpadding="5">` +
      `<tr><th>Item</th><th>Price</th></tr>` +
      `${itemRows}` +
      `<tr><td><strong>Total</strong></td><td><strong>$${data.total}</strong></td></tr>` +
      `</table>` +
      `<p>We'll send you tracking once your order ships.</p>` +
      `<p>Questions? Reply to this email.</p>` +
      `<p>- Vantix Bio Team</p>`;
    
    MailApp.sendEmail({
      to: data.customer_email,
      subject: subject,
      htmlBody: htmlBody,
      name: COMPANY_NAME
    });
  } catch (error) {
    Logger.log('Email error: ' + error.toString());
  }
}
