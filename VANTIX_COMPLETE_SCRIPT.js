// ============================================
// VANTIX BIO - COMPLETE APPS SCRIPT
// Handles: Orders (doPost) + Dashboard Data (doGet)
// Last Updated: June 24, 2026
// ============================================

// CONFIGURATION
const TELEGRAM_BOT_TOKEN = '8478171743:AAFrXkufgw1kRM0PIQxaXOLpYb3jpjDQxvA';
const TELEGRAM_CHAT_ID = '513307658';
const FROM_EMAIL = 'vantixbio@gmail.com';
const COMPANY_NAME = 'Vantix Bio';
const API_SECRET_KEY = 'vantix_live_2026_secure_key_abc123';
const DASHBOARD_PASSWORD = 'VantixDash2026';

// Get sheet by name
function getSheet(tabName) {
  return SpreadsheetApp.getActiveSpreadsheet().getSheetByName(tabName);
}

// ============================================
// DASHBOARD DATA HANDLER (doGet)
// ============================================
function doGet(e) {
  const inputPassword = (e && e.parameter && e.parameter.password) || '';
  
  if (inputPassword !== DASHBOARD_PASSWORD) {
    return ContentService.createTextOutput(JSON.stringify({
      error: 'Unauthorized',
      message: 'Invalid password'
    })).setMimeType(ContentService.MimeType.JSON);
  }

  const ss = SpreadsheetApp.openById('1n1YnFDUHyufWPXLAFOxz6RNkPGLr6gajG8JVc00cxTs');
  const ordersSheet = ss.getSheetByName('Orders');
  
  const ordersData = ordersSheet.getDataRange().getValues();
  const orders = ordersData.slice(1).filter(function(row) { return row[0]; });
  
  // Current column structure (A-Y)
  const COL_ORDER_NUM = 0;   // A
  const COL_DATE = 1;        // B
  const COL_EMAIL = 2;       // C
  const COL_NAME = 3;        // D
  const COL_PRODUCT = 9;     // J
  const COL_QTY = 10;        // K
  const COL_PAYMENT = 11;    // L
  const COL_SUBTOTAL = 12;   // M
  const COL_DISCOUNT = 14;   // O
  const COL_SHIPPING = 15;   // P
  const COL_TOTAL = 16;      // Q
  const COL_COGS = 17;       // R
  const COL_CC_FEES = 18;    // S
  const COL_NET_PROFIT = 20; // U
  const COL_STATUS = 21;     // V
  
  function isCompleted(status) {
    var s = String(status).toLowerCase();
    return s === 'paid' || s === 'shipped' || s === 'delivered' || s === 'completed';
  }
  
  var totalRevenue = 0, totalOrders = 0, totalCOGS = 0, totalCCFees = 0, totalNetProfit = 0;
  var totalDiscount = 0, totalShipping = 0;
  var paymentBreakdown = { credit_card: 0, zelle: 0 };
  var paymentCounts = { credit_card: 0, zelle: 0 };
  var productSales = {};
  
  orders.forEach(function(row) {
    var status = row[COL_STATUS];
    if (!isCompleted(status)) return;
    
    var total = parseFloat(row[COL_TOTAL]) || 0;
    var cogs = parseFloat(row[COL_COGS]) || 0;
    var ccFees = parseFloat(row[COL_CC_FEES]) || 0;
    var netProfit = parseFloat(row[COL_NET_PROFIT]) || 0;
    var discount = parseFloat(row[COL_DISCOUNT]) || 0;
    var shipping = parseFloat(row[COL_SHIPPING]) || 0;
    var payment = String(row[COL_PAYMENT]).toLowerCase();
    var qty = parseInt(row[COL_QTY]) || 0;
    var product = String(row[COL_PRODUCT]);
    
    totalRevenue += total;
    totalOrders++;
    totalCOGS += cogs;
    totalCCFees += ccFees;
    totalNetProfit += netProfit;
    totalDiscount += discount;
    totalShipping += shipping;
    
    if (payment.indexOf('zelle') !== -1) {
      paymentBreakdown.zelle += total;
      paymentCounts.zelle++;
    } else {
      paymentBreakdown.credit_card += total;
      paymentCounts.credit_card++;
    }
    
    if (!productSales[product]) {
      productSales[product] = { units: 0, revenue: 0 };
    }
    productSales[product].units += qty;
    productSales[product].revenue += total;
  });
  
  var topProducts = Object.keys(productSales).map(function(name) {
    return {
      name: name,
      units: productSales[name].units,
      revenue: productSales[name].revenue
    };
  }).sort(function(a, b) { return b.revenue - a.revenue; }).slice(0, 10);
  
  var response = {
    revenue: {
      total: totalRevenue,
      cogs: totalCOGS,
      ccFees: totalCCFees,
      shipping: totalShipping,
      discount: totalDiscount,
      netProfit: totalNetProfit
    },
    orders: {
      total: totalOrders,
      avgValue: totalOrders > 0 ? totalRevenue / totalOrders : 0
    },
    payment: {
      breakdown: paymentBreakdown,
      counts: paymentCounts
    },
    topProducts: topProducts
  };
  
  return ContentService.createTextOutput(JSON.stringify(response))
    .setMimeType(ContentService.MimeType.JSON);
}

// ============================================
// ORDER HANDLER (doPost)
// ============================================
function doPost(e) {
  try {
    var postData = e.postData;
    var data;
    
    if (postData && postData.contents) {
      try {
        data = JSON.parse(postData.contents);
      } catch (err) {
        data = e.parameter;
      }
    } else {
      data = e.parameter;
    }
    
    var providedKey = data.api_key || e.parameter.api_key;
    if (providedKey !== API_SECRET_KEY) {
      Logger.log('Unauthorized access attempt');
      return ContentService.createTextOutput(JSON.stringify({
        status: 'error',
        message: 'Unauthorized'
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    var action = data.action || 'order';
    
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

function handleOrder(data) {
  var ordersSheet = getSheet('Orders');
  if (!ordersSheet) {
    throw new Error('Orders sheet not found');
  }
  
  var timestamp = new Date();
  var orderNumber = data.order_number || generateOrderId();
  var items = data.items || [];
  
  var productText = items.map(function(item) {
    return item.name + ' (x' + item.quantity + ')';
  }).join(', ');
  
  var totalQty = items.reduce(function(sum, item) {
    return sum + parseInt(item.quantity || 0);
  }, 0);
  
  var subtotal = parseFloat(data.subtotal || 0);
  var discount = parseFloat(data.discount || 0);
  var shipping = parseFloat(data.shipping || 0);
  var total = parseFloat(data.total || 0);
  var cogs = parseFloat(data.cogs || 0);
  
  var paymentMethod = data.payment_method || 'credit_card';
  var ccFees = 0;
  if (paymentMethod.toLowerCase().indexOf('credit') !== -1) {
    ccFees = total * 0.044 + 0.40;
  }
  
  ordersSheet.appendRow([
    orderNumber,
    timestamp,
    data.customer_email || '',
    data.customer_name || '',
    data.phone || '',
    data.address || '',
    data.city || '',
    data.state || '',
    data.zip || '',
    productText,
    totalQty,
    paymentMethod,
    subtotal.toFixed(2),
    data.discount_code || '',
    discount.toFixed(2),
    shipping.toFixed(2),
    total.toFixed(2),
    cogs.toFixed(2),
    ccFees.toFixed(2),
    '',
    '',
    'Pending',
    '',
    '',
    ''
  ]);
  
  var lastRow = ordersSheet.getLastRow();
  var netProfitFormula = '=Q' + lastRow + '-R' + lastRow + '-S' + lastRow + '-IFERROR(T' + lastRow + ',0)';
  ordersSheet.getRange('U' + lastRow).setFormula(netProfitFormula);
  
  updateInventory(items);
  sendOrderNotification(orderNumber, data);
  sendConfirmationEmail(data, orderNumber);
  
  return ContentService.createTextOutput(JSON.stringify({
    status: 'success',
    message: 'Order logged',
    order_number: orderNumber
  })).setMimeType(ContentService.MimeType.JSON);
}

function updateInventory(items) {
  var catalogSheet = getSheet('Catalog');
  if (!catalogSheet) {
    Logger.log('Warning: Catalog sheet not found');
    return;
  }
  
  var productMap = {
    'Tirzepatide 30mg': 'tirz-30mg',
    'Tirz 30mg': 'tirz-30mg',
    'Retatrutide 20mg': 'reta-20mg',
    'Reta 20mg': 'reta-20mg',
    'Semaglutide 10mg': 'sema-10mg',
    'Sema 10mg': 'sema-10mg',
    'BPC-157 10mg': 'bpc-10mg',
    'BPC 10mg': 'bpc-10mg',
    'TB-500 10mg': 'tb-10mg',
    'TB 10mg': 'tb-10mg',
    'GHK-Cu 100mg': 'ghk-100mg',
    'GHK 100mg': 'ghk-100mg',
    'CJC-1295': 'cjc-5mg',
    'CJC': 'cjc-5mg',
    'Ipamorelin': 'ipa-5mg',
    'Ipa': 'ipa-5mg',
    'MOTS-c 10mg': 'mots-10mg',
    'MOTS-C 10mg': 'mots-10mg',
    'MOTS 10mg': 'mots-10mg',
    'NAD+ 1000mg': 'nad-1000mg',
    'NAD+ 1g': 'nad-1000mg',
    'Tesamorelin': 'tesa-10mg',
    'Tesa': 'tesa-10mg',
    'AOD-9604': 'aod-10mg',
    'AOD': 'aod-10mg'
  };
  
  var catalogData = catalogSheet.getDataRange().getValues();
  
  items.forEach(function(item) {
    var itemName = item.name || '';
    var quantity = parseInt(item.quantity) || 1;
    
    var productId = null;
    for (var key in productMap) {
      if (itemName.indexOf(key) !== -1) {
        productId = productMap[key];
        break;
      }
    }
    
    if (!productId) {
      Logger.log('Warning: Could not map product: ' + itemName);
      return;
    }
    
    for (var i = 1; i < catalogData.length; i++) {
      if (catalogData[i][0] === productId) {
        var currentStock = parseInt(catalogData[i][5]) || 0;
        var newStock = Math.max(0, currentStock - quantity);
        
        catalogSheet.getRange(i + 1, 6).setValue(newStock);
        
        Logger.log('Updated ' + productId + ': ' + currentStock + ' -> ' + newStock);
        
        if (newStock <= 10 && newStock > 0) {
          sendTelegram('⚠️ LOW STOCK: ' + itemName + '\nRemaining: ' + newStock + ' vials');
        } else if (newStock === 0) {
          sendTelegram('🚨 OUT OF STOCK: ' + itemName);
        }
        
        break;
      }
    }
  });
}

function handleWaitlist(data) {
  var waitlistSheet = getSheet('Waitlist');
  if (!waitlistSheet) {
    throw new Error('Waitlist sheet not found');
  }
  
  waitlistSheet.appendRow([
    new Date(),
    data.email || '',
    data.product || '',
    data.sku || ''
  ]);
  
  sendTelegram('🔔 Waitlist Signup\nEmail: ' + (data.email || '') + '\nProduct: ' + (data.product || ''));
  
  return ContentService.createTextOutput(JSON.stringify({
    status: 'success',
    message: 'Added to waitlist'
  })).setMimeType(ContentService.MimeType.JSON);
}

function handleEmailCapture(data) {
  var newsletterSheet = getSheet('Newsletter');
  if (!newsletterSheet) {
    throw new Error('Newsletter sheet not found');
  }
  
  newsletterSheet.appendRow([
    new Date(),
    data.email || '',
    data.source || 'website'
  ]);
  
  sendTelegram('📧 Email Signup\nEmail: ' + (data.email || '') + '\nSource: ' + (data.source || 'website'));
  
  return ContentService.createTextOutput(JSON.stringify({
    status: 'success',
    message: 'Email captured'
  })).setMimeType(ContentService.MimeType.JSON);
}

function sendOrderNotification(orderNumber, data) {
  try {
    var items = data.items || [];
    var itemList = items.map(function(item) {
      return item.quantity + 'x ' + item.name + ' ($' + item.price + ')';
    }).join('\n');
    
    var message = '🛒 NEW ORDER: ' + orderNumber + '\n\n' +
      '👤 ' + (data.customer_name || '') + '\n' +
      '📧 ' + (data.customer_email || '') + '\n' +
      '📱 ' + (data.phone || 'N/A') + '\n\n' +
      '📦 ITEMS:\n' + itemList + '\n\n' +
      '💰 Total: $' + (data.total || '0') + '\n' +
      '💳 Payment: ' + (data.payment_method || '');
    
    sendTelegram(message);
  } catch (error) {
    Logger.log('Telegram error: ' + error.toString());
  }
}

function sendTelegram(message) {
  var url = 'https://api.telegram.org/bot' + TELEGRAM_BOT_TOKEN + '/sendMessage';
  var payload = {
    chat_id: TELEGRAM_CHAT_ID,
    text: message
  };
  
  var options = {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  };
  
  UrlFetchApp.fetch(url, options);
}

function sendConfirmationEmail(data, orderNumber) {
  try {
    var items = data.items || [];
    var itemRows = items.map(function(item) {
      return '<tr><td>' + item.quantity + 'x ' + item.name + '</td><td>$' + (item.price * item.quantity).toFixed(2) + '</td></tr>';
    }).join('');
    
    var subject = 'Order Confirmation - ' + orderNumber;
    var htmlBody = '<h2>Thank you for your order!</h2>' +
      '<p>Order #: <strong>' + orderNumber + '</strong></p>' +
      '<table border="1" cellpadding="5">' +
      '<tr><th>Item</th><th>Price</th></tr>' +
      itemRows +
      '<tr><td><strong>Total</strong></td><td><strong>$' + (data.total || 0) + '</strong></td></tr>' +
      '</table>' +
      '<p>We will send you tracking once your order ships.</p>' +
      '<p>Questions? Reply to this email.</p>' +
      '<p>- Vantix Bio Team</p>';
    
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

function generateOrderId() {
  var prefix = 'VX';
  var chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  var result = prefix;
  for (var i = 0; i < 5; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}
