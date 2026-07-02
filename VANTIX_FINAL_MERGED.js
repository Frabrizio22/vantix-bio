// ============================================
// VANTIX BIO - COMPLETE APPS SCRIPT (MERGED)
// Orders + Inventory + Dashboard + Payment Confirmations + Waitlist
// Last Updated: June 26, 2026
// Column Structure: A-Y
// ============================================

// CONFIGURATION
const TELEGRAM_BOT_TOKEN = '8478171743:AAFrXkufgw1kRM0PIQxaXOLpYb3jpjDQxvA';
const TELEGRAM_CHAT_ID = '513307658';
const FROM_EMAIL = 'vantixbio@gmail.com';
const COMPANY_NAME = 'Vantix Bio';
const LOW_STOCK_THRESHOLD = 10;
const DASH_PASSWORD = 'vantix2026';

function getSheet(tabName) {
  return SpreadsheetApp.getActiveSpreadsheet().getSheetByName(tabName);
}

// ============================================
// DASHBOARD DATA HANDLER (doGet)
// ============================================
function doGet(e) {
  var password = (e && e.parameter && e.parameter.password) || '';
  if (password !== DASH_PASSWORD) {
    return ContentService.createTextOutput(JSON.stringify({error: 'Unauthorized'})).setMimeType(ContentService.MimeType.JSON);
  }
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var ordersSheet = ss.getSheetByName('Orders');
    var batchesSheet = ss.getSheetByName('Batches');
    var expensesSheet = ss.getSheetByName('Expenses');

    var ordersArray = [];
    if (ordersSheet) {
      var od = ordersSheet.getDataRange().getValues();
      for (var i = 1; i < od.length; i++) {
        if (!od[i][0]) continue;
        ordersArray.push(od[i]);
      }
    }

    var batchesArray = [];
    if (batchesSheet) {
      var bd = batchesSheet.getDataRange().getValues();
      for (var i = 1; i < bd.length; i++) {
        if (!bd[i][0]) continue;
        batchesArray.push(bd[i]);
      }
    }

    var expensesArray = [];
    if (expensesSheet) {
      var ed = expensesSheet.getDataRange().getValues();
      for (var i = 1; i < ed.length; i++) {
        if (!ed[i][0]) continue;
        expensesArray.push(ed[i]);
      }
    }

    return ContentService.createTextOutput(JSON.stringify({
      success: true, orders: ordersArray, batches: batchesArray, expenses: expensesArray, timestamp: new Date().toISOString()
    })).setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({error: 'Server error', message: error.toString()})).setMimeType(ContentService.MimeType.JSON);
  }
}

// ============================================
// ORDER HANDLER (doPost)
// ============================================
function doPost(e) {
  try {
    var params = e.parameter;
    var postData = e.postData;
    var data;
    if (postData && postData.contents) {
      try {
        data = JSON.parse(postData.contents);
      } catch (err) {
        data = params;
      }
    } else {
      data = params;
    }
    var action = data.action || 'order';

    // Dashboard write operations
    if (action === 'dashboard_write') {
      return handleDashboardWrite(data);
    }

    if (action === 'order') {
      return handleNewOrder(data);
    } else if (action === 'payment_callback') {
      return handlePaymentCallback(data);
    } else if (action === 'newsletter') {
      return handleNewsletter(data);
    } else if (action === 'notify' || action === 'waitlist') {
      return handleNotification(data);
    }
    
    return ContentService.createTextOutput(JSON.stringify({
      status: 'error',
      message: 'Unknown action: ' + action
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    Logger.log('Error in doPost: ' + error.toString());
    return ContentService.createTextOutput(JSON.stringify({
      status: 'error',
      message: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// ============================================
// DASHBOARD WRITE HANDLER
// ============================================
function handleDashboardWrite(data) {
  if (data.password !== DASH_PASSWORD) {
    return ContentService.createTextOutput(JSON.stringify({error: 'Unauthorized'})).setMimeType(ContentService.MimeType.JSON);
  }
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var operation = data.operation;
    var range = data.range;
    var values = data.values;

    if (operation === 'update') {
      var sheet = ss.getRange(range);
      sheet.setValues(values);
    } else if (operation === 'append') {
      var sheetName = range.split('!')[0];
      var targetSheet = ss.getSheetByName(sheetName);
      if (targetSheet && values && values.length > 0) {
        targetSheet.appendRow(values[0]);
      }
    }

    SpreadsheetApp.flush();
    return ContentService.createTextOutput(JSON.stringify({success: true})).setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    Logger.log('Dashboard write error: ' + error);
    return ContentService.createTextOutput(JSON.stringify({error: 'Write failed', message: error.toString()})).setMimeType(ContentService.MimeType.JSON);
  }
}

function handleNewOrder(data) {
  var ordersSheet = getSheet('Orders');
  var batchesSheet = getSheet('Batches');
  
  if (!data.customer_name || !data.customer_email || !data.order_number || !data.total) {
    return ContentService.createTextOutput(JSON.stringify({
      status: 'error',
      message: 'Missing required fields'
    })).setMimeType(ContentService.MimeType.JSON);
  }
  
  // Check for duplicate orders
  var existingOrders = ordersSheet.getRange('A:A').getValues();
  for (var i = 1; i < existingOrders.length; i++) {
    if (existingOrders[i][0] === data.order_number) {
      return ContentService.createTextOutput(JSON.stringify({
        status: 'duplicate',
        message: 'Order already processed'
      })).setMimeType(ContentService.MimeType.JSON);
    }
  }
  
  // Parse product lines
  var productLines = [];
  var itemsText = data.items_detail || data.product_name || '';
  if (itemsText) {
    var lines = itemsText.split('\n');
    for (var j = 0; j < lines.length; j++) {
      var line = lines[j].trim();
      if (!line) continue;
      var match = line.match(/^(\d+)x\s+(.+?)(?:\s*\(.*\))?$/);
      if (match) {
        productLines.push({name: match[2].trim(), quantity: parseInt(match[1]) || 1});
      } else {
        var names = line.split(',');
        for (var k = 0; k < names.length; k++) {
          var n = names[k].trim();
          if (n) productLines.push({name: n, quantity: 1});
        }
      }
    }
  }
  
  // Inventory processing
  var totalCOGS = 0;
  var batchUpdates = [];
  var lowStockAlerts = [];
  var batchIds = [];
  
  if (batchesSheet && productLines.length > 0) {
    for (var p = 0; p < productLines.length; p++) {
      var productName = productLines[p].name;
      var quantity = productLines[p].quantity;
      var batch = findActiveBatch(batchesSheet, productName);
      
      if (!batch) {
        Logger.log('No active batch found for: ' + productName);
        continue;
      }
      
      var itemCOGS = batch.costPerVial * quantity;
      totalCOGS += itemCOGS;
      batchIds.push(batch.batchId);
      
      if (batch.quantityRemaining < quantity) {
        lowStockAlerts.push('OVERSOLD: ' + productName + ' - Ordered ' + quantity + ', Available ' + batch.quantityRemaining);
      }
      
      var newQuantity = Math.max(0, batch.quantityRemaining - quantity);
      batchUpdates.push({
        row: batch.row,
        newQuantity: newQuantity,
        batchId: batch.batchId,
        product: productName,
        quantitySold: quantity
      });
      
      if (newQuantity <= LOW_STOCK_THRESHOLD && newQuantity > 0) {
        lowStockAlerts.push('LOW STOCK: ' + productName + ' (' + batch.batchId + ') - ' + newQuantity + ' vials remaining');
      } else if (newQuantity === 0) {
        lowStockAlerts.push('DEPLETED: ' + productName + ' (' + batch.batchId + ') - Out of stock');
      }
    }
  }
  
  var total = parseFloat(data.total) || 0;
  var pm = (data.payment_method || '').toLowerCase();
  var ccFees = (pm === 'credit_card' || pm === 'credit card' || pm.indexOf('credit') >= 0) ? ((total * 0.044) + 0.40) : 0;
  var shipping = parseFloat(data.shipping_customer || data.shipping) || 0;
  var netProfit = total - totalCOGS - ccFees;
  var qty = parseInt(data.quantity) || productLines.reduce(function(sum, item) { return sum + item.quantity; }, 0) || 1;
  
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
    data.items_detail || data.product_name || '',
    qty,
    data.payment_method || '',
    parseFloat(data.subtotal) || 0,
    data.discount_code || '',
    parseFloat(data.discount) || 0,
    shipping,
    total,
    totalCOGS || '',
    ccFees,
    totalCOGS > 0 ? netProfit : '',
    data.payment_status || 'Pending',
    '',
    '',
    batchIds.join(', ')
  ]);
  
  // Update inventory
  for (var b = 0; b < batchUpdates.length; b++) {
    var update = batchUpdates[b];
    batchesSheet.getRange(update.row, 10).setValue(update.newQuantity);
    if (update.newQuantity === 0) {
      batchesSheet.getRange(update.row, 13).setValue('Depleted');
    }
    var currentSold = batchesSheet.getRange(update.row, 16).getValue() || 0;
    batchesSheet.getRange(update.row, 16).setValue(currentSold + update.quantitySold);
  }
  
  // Send Telegram notification
  var tgMsg = '🔔 New Vantix Order\n\nOrder: ' + data.order_number + '\nCustomer: ' + data.customer_name + '\nEmail: ' + data.customer_email + '\nTotal: $' + parseFloat(data.total).toFixed(2) + '\nPayment: ' + (data.payment_method || 'N/A') + '\n';
  if (totalCOGS > 0) {
    tgMsg += 'COGS: $' + totalCOGS.toFixed(2) + '\nNet Profit: $' + netProfit.toFixed(2) + '\n';
  }
  tgMsg += '\nItems:\n' + (data.items_detail || data.product_name || 'N/A');
  if (lowStockAlerts.length > 0) {
    tgMsg += '\n\n' + lowStockAlerts.join('\n');
  }
  sendToTelegram(tgMsg);
  
  // Send confirmation email for Zelle immediately
  var pmLower = (data.payment_method || '').toLowerCase();
  if (pmLower === 'zelle') {
    sendCustomerConfirmation(data);
  }
  
  SpreadsheetApp.flush();
  return ContentService.createTextOutput(JSON.stringify({
    status: 'success',
    message: 'Order processed',
    cogs: totalCOGS,
    profit: netProfit
  })).setMimeType(ContentService.MimeType.JSON);
}

function findActiveBatch(batchesSheet, productName) {
  var batches = batchesSheet.getDataRange().getValues();
  var normalizedSearch = productName.toLowerCase().trim();
  
  for (var i = 1; i < batches.length; i++) {
    var batchProduct = (batches[i][2] || '').toString().toLowerCase().trim();
    var status = (batches[i][12] || '').toString().toLowerCase();
    var quantityRemaining = parseInt(batches[i][9]) || 0;
    
    if (batchProduct.indexOf(normalizedSearch) >= 0 || normalizedSearch.indexOf(batchProduct) >= 0) {
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

function handlePaymentCallback(data) {
  var ordersSheet = getSheet('Orders');
  if (!data.order_number) {
    return ContentService.createTextOutput(JSON.stringify({
      status: 'error',
      message: 'Missing order_number'
    })).setMimeType(ContentService.MimeType.JSON);
  }
  
  var orders = ordersSheet.getDataRange().getValues();
  for (var i = 1; i < orders.length; i++) {
    if (String(orders[i][0]).trim() === String(data.order_number).trim()) {
      var oldStatus = orders[i][20];
      ordersSheet.getRange(i + 1, 21).setValue(data.payment_status || 'Paid');
      
      // Send confirmation email and Telegram notification if newly paid
      if (data.payment_status === 'Paid' && oldStatus !== 'Paid') {
        var orderData = {
          order_number: orders[i][0],
          customer_name: orders[i][3],
          customer_email: orders[i][2],
          total: orders[i][16],
          payment_method: 'credit_card',
          items_detail: orders[i][9]
        };
        
        sendCustomerConfirmation(orderData);
        sendToTelegram('💳 Payment Confirmed\n\nOrder: ' + orders[i][0] + '\nCustomer: ' + orders[i][3] + '\nTotal: $' + parseFloat(orders[i][16]).toFixed(2) + '\nItems: ' + orders[i][9]);
      }
      
      SpreadsheetApp.flush();
      return ContentService.createTextOutput(JSON.stringify({
        status: 'success',
        message: 'Payment status updated'
      })).setMimeType(ContentService.MimeType.JSON);
    }
  }
  
  return ContentService.createTextOutput(JSON.stringify({
    status: 'error',
    message: 'Order not found: ' + data.order_number
  })).setMimeType(ContentService.MimeType.JSON);
}

function handleNewsletter(data) {
  var newsletterSheet = getSheet('Newsletter');
  if (!data.email) {
    return ContentService.createTextOutput(JSON.stringify({
      status: 'error',
      message: 'Missing email'
    })).setMimeType(ContentService.MimeType.JSON);
  }
  
  newsletterSheet.appendRow([data.email, new Date(), data.source || 'website']);
  SpreadsheetApp.flush();
  
  return ContentService.createTextOutput(JSON.stringify({
    status: 'success',
    message: 'Subscribed'
  })).setMimeType(ContentService.MimeType.JSON);
}

function handleNotification(data) {
  var waitlistSheet = getSheet('Waitlist');
  if (!data.email) {
    return ContentService.createTextOutput(JSON.stringify({
      status: 'error',
      message: 'Missing email'
    })).setMimeType(ContentService.MimeType.JSON);
  }
  
  var productOrInterests = data.product || data.interests || 'General';
  waitlistSheet.appendRow([new Date(), data.email, data.source || 'waitlist', productOrInterests]);
  
  // Send Telegram notification
  sendToTelegram('📧 Waitlist Signup\n\nEmail: ' + data.email + '\nProduct: ' + productOrInterests + '\nSource: ' + (data.source || 'Unknown'));
  
  SpreadsheetApp.flush();
  return ContentService.createTextOutput(JSON.stringify({
    status: 'success',
    message: 'Added to waitlist'
  })).setMimeType(ContentService.MimeType.JSON);
}

function sendToTelegram(message) {
  var url = 'https://api.telegram.org/bot' + TELEGRAM_BOT_TOKEN + '/sendMessage';
  try {
    UrlFetchApp.fetch(url, {
      method: 'post',
      contentType: 'application/json',
      payload: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text: message
      }),
      muteHttpExceptions: true
    });
  } catch (e) {
    Logger.log('Telegram error: ' + e);
  }
}

function sendCustomerConfirmation(data) {
  var pmLower = (data.payment_method || '').toLowerCase();
  var isZelle = (pmLower === 'zelle');
  var total = parseFloat(data.total).toFixed(2);
  var firstName = data.customer_name.split(' ')[0];
  var subtotal = parseFloat(data.subtotal || data.total).toFixed(2);
  var discount = parseFloat(data.discount || 0).toFixed(2);
  var shipping = parseFloat(data.shipping_customer || data.shipping || 0).toFixed(2);

  // Build item rows
  var itemsHtml = '';
  if (data.items_detail) {
    var items = data.items_detail.split('\n');
    for (var i = 0; i < items.length; i++) {
      if (!items[i]) continue;
      var match = items[i].match(/^(\d+)x\s+(.+?)\s+\(\$([0-9.]+)\)$/);
      if (match) {
        var q = match[1];
        var n = match[2];
        var pr = match[3];
        var lt = (parseFloat(pr) * parseInt(q)).toFixed(2);
        itemsHtml += '<tr style="border-bottom:1px solid #f0f0f0">';
        itemsHtml += '<td style="padding:12px 0;vertical-align:top">';
        itemsHtml += '<div style="font-size:14px;font-weight:500;color:#0F1B2D;margin-bottom:2px">' + n + '</div>';
        itemsHtml += '<div style="font-size:13px;color:#9CA3AF">Qty ' + q + ' × $' + pr + '</div>';
        itemsHtml += '</td>';
        itemsHtml += '<td style="text-align:right;padding:12px 0;vertical-align:top">';
        itemsHtml += '<div style="font-size:14px;font-weight:600;color:#0F1B2D">$' + lt + '</div>';
        itemsHtml += '</td>';
        itemsHtml += '</tr>';
      }
    }
  }

  var subject = 'Order Confirmed #' + data.order_number + ' - Vantix Bio';
  
  var htmlBody = '<!DOCTYPE html>' +
    '<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>' +
    '<body style="margin:0;padding:0;background:#f5f5f5;font-family:-apple-system,BlinkMacSystemFont,\'Segoe UI\',Roboto,sans-serif">' +
    '<div style="max-width:600px;margin:0 auto;background:#ffffff">' +
    
    // Header
    '<div style="background:#0F1B2D;padding:28px 24px;text-align:center">' +
    '<div style="font-size:22px;font-weight:600;color:#ffffff;letter-spacing:2px">VANTIX BIO</div>' +
    '<div style="color:rgba(255,255,255,0.5);font-size:11px;margin-top:6px;letter-spacing:1px">RESEARCH PEPTIDES</div>' +
    '</div>' +
    
    // Main content
    '<div style="padding:32px 24px">' +
    '<h1 style="font-size:24px;font-weight:600;color:#0F1B2D;margin:0 0 8px">Order Confirmed</h1>' +
    '<p style="font-size:15px;color:#6B7280;line-height:1.5;margin:0 0 28px">Thank you, ' + firstName + '.</p>' +
    
    // Order number
    '<div style="background:#F9FAFB;border-left:3px solid #3973B0;padding:16px 20px;margin-bottom:24px;border-radius:4px">' +
    '<div style="font-size:11px;color:#6B7280;text-transform:uppercase;letter-spacing:1px;margin-bottom:4px">Order Number</div>' +
    '<div style="font-size:18px;font-weight:600;color:#0F1B2D">#' + data.order_number + '</div>' +
    '</div>' +
    
    // Payment status
    (isZelle ? 
      '<div style="background:#FEF3C7;border-left:3px solid #F59E0B;padding:16px 20px;margin-bottom:24px;border-radius:4px">' +
      '<div style="font-weight:600;color:#92400E;margin-bottom:6px;font-size:14px">⏳ Awaiting Payment</div>' +
      '<div style="font-size:14px;color:#78350F;line-height:1.5">' +
      'Send <strong>$' + total + '</strong> to <strong>619-587-1812</strong><br>' +
      'Include <strong>#' + data.order_number + '</strong> in note' +
      '</div></div>' :
      '<div style="background:#ECFDF5;border-left:3px solid #10B981;padding:16px 20px;margin-bottom:24px;border-radius:4px">' +
      '<div style="font-weight:600;color:#065F46;font-size:14px">✓ Payment Confirmed</div>' +
      '</div>'
    ) +
    
    // Items
    '<div style="margin-bottom:24px">' +
    '<div style="font-size:11px;color:#6B7280;text-transform:uppercase;letter-spacing:1px;margin-bottom:12px">Items</div>' +
    '<table style="width:100%;border-collapse:collapse">' + itemsHtml + '</table>' +
    '</div>' +
    
    // Totals
    '<div style="border-top:2px solid #E5E7EB;padding-top:16px;margin-bottom:24px">' +
    '<table style="width:100%;margin-bottom:8px"><tr>' +
    '<td style="font-size:14px;color:#6B7280;padding:4px 0">Subtotal</td>' +
    '<td style="text-align:right;font-size:14px;color:#6B7280;padding:4px 0">$' + subtotal + '</td>' +
    '</tr></table>' +
    (parseFloat(discount) > 0 ? 
      '<table style="width:100%;margin-bottom:8px"><tr>' +
      '<td style="font-size:14px;color:#10B981;padding:4px 0">Discount</td>' +
      '<td style="text-align:right;font-size:14px;color:#10B981;padding:4px 0">-$' + discount + '</td>' +
      '</tr></table>' : '') +
    '<table style="width:100%;margin-bottom:12px"><tr>' +
    '<td style="font-size:14px;color:#6B7280;padding:4px 0">Shipping</td>' +
    '<td style="text-align:right;font-size:14px;color:#6B7280;padding:4px 0">' + (parseFloat(shipping) > 0 ? '$' + shipping : 'FREE') + '</td>' +
    '</tr></table>' +
    '<table style="width:100%;border-top:1px solid #E5E7EB;padding-top:12px"><tr>' +
    '<td style="font-size:17px;font-weight:600;color:#0F1B2D">Total</td>' +
    '<td style="text-align:right;font-size:17px;font-weight:600;color:#0F1B2D">$' + total + '</td>' +
    '</tr></table>' +
    '</div>' +
    
    // Next steps
    '<div style="background:#F9FAFB;padding:20px;border-radius:6px;margin-bottom:24px">' +
    '<div style="font-weight:600;color:#0F1B2D;margin-bottom:10px;font-size:14px">What happens next?</div>' +
    '<div style="font-size:14px;color:#6B7280;line-height:1.6">' +
    (isZelle ? 
      '1. Send payment via Zelle<br>' +
      '2. Tracking within 24 hours<br>' +
      '3. Delivery in 2-5 business days' :
      '1. Tracking within 24 hours<br>' +
      '2. Delivery in 2-5 business days'
    ) +
    '</div></div>' +
    
    // Footer CTA
    '<div style="text-align:center;margin-bottom:24px">' +
    '<a href="mailto:' + FROM_EMAIL + '" style="display:inline-block;background:#3973B0;color:#ffffff;padding:12px 28px;border-radius:6px;text-decoration:none;font-weight:500;font-size:14px">Contact Support</a>' +
    '</div>' +
    
    '</div>' +
    
    // Footer
    '<div style="background:#F9FAFB;padding:24px;text-align:center;border-top:1px solid #E5E7EB">' +
    '<div style="font-size:12px;color:#6B7280;line-height:1.5;margin-bottom:10px">' +
    'For research use only. Not for human or veterinary use.' +
    '</div>' +
    '<div style="font-size:11px;color:#9CA3AF">' +
    '<a href="https://vantixbio.com" style="color:#9CA3AF;text-decoration:none;margin:0 6px">vantixbio.com</a> | ' +
    '<a href="mailto:' + FROM_EMAIL + '" style="color:#9CA3AF;text-decoration:none;margin:0 6px">' + FROM_EMAIL + '</a>' +
    '</div>' +
    '</div>' +
    
    '</div></body></html>';

  var plain = 'Hi ' + firstName + ',\n\nYour order is confirmed.\n\nOrder Number: #' + data.order_number + '\nTotal: $' + total + '\n\n';
  if (data.items_detail) { plain += 'Items:\n' + data.items_detail + '\n\n'; }
  if (isZelle) {
    plain += 'PAYMENT: Send $' + total + ' via Zelle to 619-587-1812\nInclude #' + data.order_number + ' in the note.\n\n';
  } else {
    plain += 'Payment received. Ships within 1-2 business days.\n\n';
  }
  plain += 'Questions? Reply to this email.\n\nVantix Bio\nvantixbio.com';

  try {
    MailApp.sendEmail({
      to: data.customer_email,
      bcc: 'vantixbio@gmail.com',
      subject: subject,
      htmlBody: htmlBody,
      body: plain,
      name: 'Vantix Bio'
    });
  } catch (e) {
    Logger.log('Email error: ' + e);
  }
}
