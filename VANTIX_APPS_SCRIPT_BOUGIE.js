// ============================================
// VANTIX BIO - BOUGIE ORDER SYSTEM
// Paste into Apps Script → Save → Run formatOrdersSheet()
// ============================================

const TELEGRAM_BOT_TOKEN = '8478171743:AAHc9H_QoXNsbaelWNwTrjHbWI_ZmDQY6L0';
const TELEGRAM_CHAT_ID = '513307658';
const FROM_EMAIL = 'vantixbio@gmail.com';
const COMPANY_NAME = 'Vantix Bio';
const API_SECRET_KEY = 'vantix_live_2026_secure_key_abc123';

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
      try { data = JSON.parse(postData.contents); } catch (err) { data = e.parameter; }
    } else { data = e.parameter; }
    
    const providedKey = data.api_key || e.parameter.api_key;
    if (providedKey !== API_SECRET_KEY) {
      Logger.log('Unauthorized access attempt');
      return ContentService.createTextOutput(JSON.stringify({ status: 'error', message: 'Unauthorized' })).setMimeType(ContentService.MimeType.JSON);
    }
    
    const action = data.action || 'order';
    if (action === 'order') return handleNewOrder(data);
    else if (action === 'payment_callback') return handlePaymentCallback(data);
    else if (action === 'newsletter') return handleNewsletter(data);
    else if (action === 'notify') return handleNotification(data);
    
    return ContentService.createTextOutput(JSON.stringify({ status: 'error', message: 'Unknown action' })).setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    Logger.log('Error in doPost: ' + error);
    return ContentService.createTextOutput(JSON.stringify({ status: 'error', message: error.toString() })).setMimeType(ContentService.MimeType.JSON);
  }
}

// ============================================
// ORDER PROCESSING
// ============================================
function handleNewOrder(data) {
  const ordersSheet = getSheet('Orders');
  
  if (!data.customer_name || !data.customer_email || !data.order_number || !data.total) {
    return ContentService.createTextOutput(JSON.stringify({ status: 'error', message: 'Missing required fields' })).setMimeType(ContentService.MimeType.JSON);
  }
  
  // Duplicate check
  const existingOrders = ordersSheet.getRange('A:A').getValues();
  for (let i = 1; i < existingOrders.length; i++) {
    if (existingOrders[i][0] === data.order_number) {
      return ContentService.createTextOutput(JSON.stringify({ status: 'duplicate', message: 'Order already processed' })).setMimeType(ContentService.MimeType.JSON);
    }
  }
  
  const quantity = parseInt(data.quantity) || 1;
  
  // Find actual next empty row (skip formatted-but-empty rows)
  const colA = ordersSheet.getRange('A1:A' + ordersSheet.getMaxRows()).getValues();
  let row = 2; // start after header
  for (let i = 1; i < colA.length; i++) {
    if (colA[i][0] === '' || colA[i][0] === null) {
      row = i + 1;
      break;
    }
    row = i + 2;
  }
  
  const rowData = [
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
    data.discount_code || '',
    parseFloat(data.discount) || 0,
    parseFloat(data.shipping) || 0,
    parseFloat(data.total) || 0,
    '', // COGS (manual)
    '', // CC Fees (formula)
    '', // Net Profit (formula)
    data.status || 'Pending',
    '', // Shipped
    '', // Tracking
    ''  // Batch #
  ];
  ordersSheet.getRange(row, 1, 1, 24).setValues([rowData]);
  
  // CC Fees formula: credit_card = Total * 4.4% + $0.40
  ordersSheet.getRange(row, 19).setFormula('=IF(L' + row + '="credit_card", Q' + row + '*0.044 + 0.40, 0)');
  // Net Profit: Total - COGS - CC Fees
  ordersSheet.getRange(row, 20).setFormula('=IF(R' + row + '<>"", Q' + row + ' - R' + row + ' - S' + row + ', "")');
  
  // Apply row formatting
  formatNewRow(ordersSheet, row);
  
  // Update inventory
  updateInventory(data.product_name, quantity);
  
  // Send notifications for zelle
  if (data.payment_method === 'zelle' || data.payment_status === 'Paid') {
    sendTelegramNotification(data);
    sendCustomerConfirmation(data);
  }
  
  return ContentService.createTextOutput(JSON.stringify({ status: 'success', message: 'Order processed' })).setMimeType(ContentService.MimeType.JSON);
}

// Format each new row with alternating colors
function formatNewRow(sheet, row) {
  const range = sheet.getRange(row, 1, 1, 24);
  if (row % 2 === 0) {
    range.setBackground('#f8f9fa');
  }
  // Currency format
  sheet.getRange(row, 13).setNumberFormat('$#,##0.00'); // Subtotal
  sheet.getRange(row, 15).setNumberFormat('$#,##0.00'); // Discount
  sheet.getRange(row, 16).setNumberFormat('$#,##0.00'); // Shipping
  sheet.getRange(row, 17).setNumberFormat('$#,##0.00'); // Total
  sheet.getRange(row, 18).setNumberFormat('$#,##0.00'); // COGS
  sheet.getRange(row, 19).setNumberFormat('$#,##0.00'); // CC Fees
  sheet.getRange(row, 20).setNumberFormat('$#,##0.00'); // Net Profit
}

// ============================================
// INVENTORY TRACKING
// ============================================
function updateInventory(productName, quantity) {
  const catalogSheet = getSheet('Catalog');
  if (!catalogSheet) { Logger.log('Catalog sheet not found'); return; }
  
  const catalogData = catalogSheet.getDataRange().getValues();
  for (let i = 1; i < catalogData.length; i++) {
    if (catalogData[i][1] === productName) {
      const currentStock = parseInt(catalogData[i][5]) || 0;
      const newStock = currentStock - quantity;
      catalogSheet.getRange(i + 1, 6).setValue(newStock);
      
      if (newStock <= 0) {
        catalogSheet.getRange(i + 1, 7).setValue('out_of_stock');
        sendLowStockAlert(productName, 0, true);
      } else if (newStock <= 5) {
        sendLowStockAlert(productName, newStock, false);
      }
      return;
    }
  }
}

function sendLowStockAlert(productName, stockLevel, isOutOfStock) {
  const message = isOutOfStock 
    ? '🚨 *OUT OF STOCK*\n\n' + productName + '\nStock: 0 vials'
    : '⚠️ *LOW STOCK*\n\n' + productName + '\nStock: ' + stockLevel + ' vials';
  
  try {
    UrlFetchApp.fetch('https://api.telegram.org/bot' + TELEGRAM_BOT_TOKEN + '/sendMessage', {
      method: 'post', contentType: 'application/json',
      payload: JSON.stringify({chat_id: TELEGRAM_CHAT_ID, text: message, parse_mode: 'Markdown'}),
      muteHttpExceptions: true
    });
  } catch (e) { Logger.log('Telegram error: ' + e); }
}

// ============================================
// PAYMENT CALLBACK
// ============================================
function handlePaymentCallback(data) {
  const ordersSheet = getSheet('Orders');
  if (!data.order_number) {
    return ContentService.createTextOutput(JSON.stringify({ status: 'error', message: 'Missing order_number' })).setMimeType(ContentService.MimeType.JSON);
  }
  
  const orders = ordersSheet.getDataRange().getValues();
  for (let i = 1; i < orders.length; i++) {
    if (orders[i][0] === data.order_number) {
      ordersSheet.getRange(i + 1, 21).setValue(data.payment_status || 'Paid');
      
      if (data.payment_status === 'Paid' && orders[i][20] !== 'Shipped') {
        const orderData = {
          order_number: orders[i][0],
          customer_name: orders[i][3],
          customer_email: orders[i][2],
          total: orders[i][16],
          payment_method: 'Credit Card',
          product_name: orders[i][9],
          quantity: orders[i][10]
        };
        sendTelegramNotification(orderData);
        sendCustomerConfirmation(orderData);
      }
      return ContentService.createTextOutput(JSON.stringify({ status: 'success', message: 'Updated' })).setMimeType(ContentService.MimeType.JSON);
    }
  }
  return ContentService.createTextOutput(JSON.stringify({ status: 'error', message: 'Order not found' })).setMimeType(ContentService.MimeType.JSON);
}

// ============================================
// NEWSLETTER
// ============================================
function handleNewsletter(data) {
  const sheet = getSheet('Newsletter');
  if (!data.email) return ContentService.createTextOutput(JSON.stringify({ status: 'error', message: 'Missing email' })).setMimeType(ContentService.MimeType.JSON);
  
  const emails = sheet.getRange('A:A').getValues();
  for (let i = 1; i < emails.length; i++) {
    if (emails[i][0] === data.email) return ContentService.createTextOutput(JSON.stringify({ status: 'duplicate', message: 'Already subscribed' })).setMimeType(ContentService.MimeType.JSON);
  }
  
  sheet.appendRow([new Date(), data.email, data.source || 'website', 'active']);
  return ContentService.createTextOutput(JSON.stringify({ status: 'success', message: 'Subscribed' })).setMimeType(ContentService.MimeType.JSON);
}

// ============================================
// WAITLIST
// ============================================
function handleNotification(data) {
  const sheet = getSheet('Notifications');
  if (!data.email || !data.product) return ContentService.createTextOutput(JSON.stringify({ status: 'error', message: 'Missing fields' })).setMimeType(ContentService.MimeType.JSON);
  
  sheet.appendRow([new Date(), data.email, data.product, 'pending', '']);
  return ContentService.createTextOutput(JSON.stringify({ status: 'success', message: 'Added to waitlist' })).setMimeType(ContentService.MimeType.JSON);
}

// ============================================
// TELEGRAM
// ============================================
function sendTelegramNotification(data) {
  const message = '🔔 *New Vantix Order*\n\n' +
    'Order: #' + data.order_number + '\n' +
    'Customer: ' + data.customer_name + '\n' +
    'Email: ' + data.customer_email + '\n' +
    'Total: $' + parseFloat(data.total).toFixed(2) + '\n' +
    'Payment: ' + data.payment_method + '\n\n' +
    'Product: ' + (data.product_name || 'N/A') + '\n' +
    'Quantity: ' + (data.quantity || 1);
  
  try {
    UrlFetchApp.fetch('https://api.telegram.org/bot' + TELEGRAM_BOT_TOKEN + '/sendMessage', {
      method: 'post', contentType: 'application/json',
      payload: JSON.stringify({chat_id: TELEGRAM_CHAT_ID, text: message, parse_mode: 'Markdown'}),
      muteHttpExceptions: true
    });
  } catch (e) { Logger.log('Telegram error: ' + e); }
}

// ============================================
// EMAIL CONFIRMATIONS
// ============================================
function sendCustomerConfirmation(data) {
  const subject = 'Order Confirmation - #' + data.order_number;
  let body;
  
  if (data.payment_method === 'zelle') {
    body = 'Hi ' + data.customer_name + ',\n\n' +
      'Thanks for your order! Here\'s what you need to complete payment:\n\n' +
      '━━━━━━━━━━━━━━━━━━━━━━\n' +
      'ZELLE PAYMENT DETAILS\n' +
      '━━━━━━━━━━━━━━━━━━━━━━\n\n' +
      'Send to: vantixbio@gmail.com\n' +
      'Name: Michael Velazquez\n' +
      'Amount: $' + parseFloat(data.total).toFixed(2) + '\n' +
      'Order #: ' + data.order_number + '\n\n' +
      '⚠️ IMPORTANT: Include your order number (' + data.order_number + ') in the Zelle note so we can match your payment.\n\n' +
      '━━━━━━━━━━━━━━━━━━━━━━\n' +
      'ORDER DETAILS\n' +
      '━━━━━━━━━━━━━━━━━━━━━━\n\n' +
      'Product: ' + (data.product_name || 'See order details') + '\n' +
      'Quantity: ' + (data.quantity || 1) + '\n' +
      'Total: $' + parseFloat(data.total).toFixed(2) + '\n\n' +
      'Once we confirm your Zelle payment, we\'ll ship your order and send tracking information.\n\n' +
      'Questions? Just reply to this email.\n\n' +
      'For research use only.\n\n' +
      'Thanks,\nFrabrizio\nVantix Bio';
  } else {
    body = 'Hi ' + data.customer_name + ',\n\n' +
      'Thanks for your order!\n\n' +
      'Order Number: #' + data.order_number + '\n' +
      'Total: $' + parseFloat(data.total).toFixed(2) + '\n' +
      'Payment: Credit Card\n\n' +
      'Product: ' + (data.product_name || 'See order details') + '\n' +
      'Quantity: ' + (data.quantity || 1) + '\n\n' +
      'We\'ll send tracking information once your order ships.\n\n' +
      'For research use only.\n\n' +
      'Thanks,\nVantix Bio';
  }
  
  try {
    MailApp.sendEmail({ to: data.customer_email, subject: subject, body: body, name: COMPANY_NAME });
    Logger.log('✅ Email sent to: ' + data.customer_email);
  } catch (e) {
    Logger.log('❌ Email error: ' + e.message);
    const alertMsg = '⚠️ Email failed for order #' + data.order_number + '\nError: ' + e.message;
    try {
      UrlFetchApp.fetch('https://api.telegram.org/bot' + TELEGRAM_BOT_TOKEN + '/sendMessage', {
        method: 'post', contentType: 'application/json',
        payload: JSON.stringify({chat_id: TELEGRAM_CHAT_ID, text: alertMsg}),
        muteHttpExceptions: true
      });
    } catch (err) {}
  }
}

// ============================================
// 💎 BOUGIE FORMAT - RUN ONCE: formatOrdersSheet()
// ============================================
function formatOrdersSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('Orders');
  if (!sheet) { Logger.log('Orders sheet not found'); return; }
  
  // ── FREEZE & BASICS ──
  sheet.setFrozenRows(1);
  sheet.setFrozenColumns(1);
  
  // ── HEADER: Dark navy gradient look ──
  const header = sheet.getRange('A1:X1');
  header.setBackground('#0f172a');
  header.setFontColor('#e2e8f0');
  header.setFontWeight('bold');
  header.setFontSize(9);
  header.setFontFamily('Inter');
  header.setHorizontalAlignment('center');
  header.setVerticalAlignment('middle');
  header.setWrap(false);
  sheet.setRowHeight(1, 36);
  
  // ── COLUMN WIDTHS (tight & clean) ──
  const widths = [105, 135, 195, 145, 110, 170, 95, 45, 65, 155, 38, 85, 78, 105, 70, 68, 75, 70, 85, 88, 85, 95, 135, 105];
  widths.forEach((w, i) => sheet.setColumnWidth(i + 1, w));
  
  // ── NUMBER FORMATS ──
  sheet.getRange('B2:B1000').setNumberFormat('M/d/yy h:mm');
  sheet.getRange('M2:M1000').setNumberFormat('$#,##0.00');
  sheet.getRange('O2:O1000').setNumberFormat('$#,##0.00');
  sheet.getRange('P2:P1000').setNumberFormat('$#,##0.00');
  sheet.getRange('Q2:Q1000').setNumberFormat('$#,##0.00');
  sheet.getRange('R2:R1000').setNumberFormat('$#,##0.00');
  sheet.getRange('S2:S1000').setNumberFormat('$#,##0.00');
  sheet.getRange('T2:T1000').setNumberFormat('$#,##0.00');
  sheet.getRange('V2:V1000').setNumberFormat('M/d/yyyy');
  
  // ── DATA FONT ──
  sheet.getRange('A2:X1000').setFontFamily('Inter');
  sheet.getRange('A2:X1000').setFontSize(9);
  sheet.getRange('A2:A1000').setFontFamily('JetBrains Mono');
  sheet.getRange('A2:A1000').setFontSize(8);
  sheet.getRange('W2:W1000').setFontFamily('JetBrains Mono');
  sheet.getRange('W2:W1000').setFontSize(8);
  
  // ── STATUS DROPDOWN ──
  const statusRule = SpreadsheetApp.newDataValidation()
    .requireValueInList(['Pending', 'Paid', 'Shipped', 'Delivered', 'Cancelled', 'Refunded'], true)
    .setAllowInvalid(false).build();
  sheet.getRange('U2:U1000').setDataValidation(statusRule);
  
  // ── PAYMENT DROPDOWN ──
  const payRule = SpreadsheetApp.newDataValidation()
    .requireValueInList(['zelle', 'credit_card', 'crypto'], true)
    .setAllowInvalid(true).build();
  sheet.getRange('L2:L1000').setDataValidation(payRule);
  
  // ── CONDITIONAL FORMATTING ──
  const rules = [];
  
  // Status colors
  const statusColors = {
    'Pending':   { bg: '#fef3c7', fg: '#92400e' },
    'Paid':      { bg: '#d1fae5', fg: '#065f46' },
    'Shipped':   { bg: '#dbeafe', fg: '#1e40af' },
    'Delivered': { bg: '#a7f3d0', fg: '#064e3b' },
    'Cancelled': { bg: '#fecaca', fg: '#991b1b' },
    'Refunded':  { bg: '#e5e7eb', fg: '#374151' }
  };
  
  Object.keys(statusColors).forEach(status => {
    rules.push(SpreadsheetApp.newConditionalFormatRule()
      .whenTextEqualTo(status)
      .setBackground(statusColors[status].bg)
      .setFontColor(statusColors[status].fg)
      .setBold(true)
      .setRanges([sheet.getRange('U2:U1000')])
      .build());
  });
  
  // Payment method colors
  rules.push(SpreadsheetApp.newConditionalFormatRule()
    .whenTextEqualTo('zelle')
    .setBackground('#ede9fe').setFontColor('#5b21b6')
    .setRanges([sheet.getRange('L2:L1000')])
    .build());
  rules.push(SpreadsheetApp.newConditionalFormatRule()
    .whenTextEqualTo('credit_card')
    .setBackground('#e0f2fe').setFontColor('#0369a1')
    .setRanges([sheet.getRange('L2:L1000')])
    .build());
  
  // Profit: green if positive, red if negative
  rules.push(SpreadsheetApp.newConditionalFormatRule()
    .whenNumberGreaterThan(0)
    .setFontColor('#059669').setBold(true)
    .setRanges([sheet.getRange('T2:T1000')])
    .build());
  rules.push(SpreadsheetApp.newConditionalFormatRule()
    .whenNumberLessThan(0)
    .setFontColor('#dc2626').setBold(true)
    .setRanges([sheet.getRange('T2:T1000')])
    .build());
  
  // Total column bold
  rules.push(SpreadsheetApp.newConditionalFormatRule()
    .whenNumberGreaterThanOrEqualTo(0)
    .setBold(true)
    .setRanges([sheet.getRange('Q2:Q1000')])
    .build());
  
  // Discount code highlight
  rules.push(SpreadsheetApp.newConditionalFormatRule()
    .whenTextContains('LAUNCH')
    .setBackground('#fdf4ff').setFontColor('#86198f')
    .setRanges([sheet.getRange('N2:N1000')])
    .build());
  rules.push(SpreadsheetApp.newConditionalFormatRule()
    .whenTextContains('FOUNDER')
    .setBackground('#fff7ed').setFontColor('#c2410c')
    .setRanges([sheet.getRange('N2:N1000')])
    .build());
  
  sheet.setConditionalFormatRules(rules);
  
  // ── ALTERNATING ROWS ── (handled per-row in formatNewRow to avoid getLastRow() issues)
  
  // ── SECTION DIVIDERS (thin borders) ──
  // Customer info | Product | Financials | Status
  const borderCols = [9, 12, 20]; // After Zip, After Payment, After Net Profit
  borderCols.forEach(col => {
    sheet.getRange(1, col, 200, 1).setBorder(null, null, null, true, null, null, '#cbd5e1', SpreadsheetApp.BorderStyle.SOLID);
  });
  
  // ── 💎 DASHBOARD (Column Z-AA) ──
  // Dashboard header
  sheet.getRange('Z1:AA1').merge();
  sheet.getRange('Z1').setValue('💎 VANTIX DASHBOARD');
  sheet.getRange('Z1:AA1').setBackground('#0f172a');
  sheet.getRange('Z1').setFontColor('#60a5fa');
  sheet.getRange('Z1').setFontWeight('bold');
  sheet.getRange('Z1').setFontSize(11);
  sheet.getRange('Z1').setFontFamily('Inter');
  sheet.getRange('Z1').setHorizontalAlignment('center');
  
  // Revenue section
  sheet.getRange('Z2').setValue('💰 REVENUE');
  sheet.getRange('Z2:AA2').setBackground('#1e293b');
  sheet.getRange('Z2').setFontColor('#94a3b8');
  sheet.getRange('Z2').setFontWeight('bold');
  sheet.getRange('Z2').setFontSize(8);
  
  const dashData = [
    ['Total Revenue',      '=SUM(Q2:Q)'],
    ['Total Orders',       '=COUNTA(A2:A)'],
    ['Avg Order Value',    '=IF(AA4>0, AA3/AA4, 0)'],
    ['', ''],
    ['📊 COSTS',           ''],
    ['Total COGS',         '=SUM(R2:R)'],
    ['CC Fees Paid',       '=SUM(S2:S)'],
    ['Discounts Given',    '=SUM(O2:O)'],
    ['', ''],
    ['🏆 PROFIT',          ''],
    ['Net Profit',         '=SUM(T2:T)'],
    ['Profit Margin',      '=IF(AA3>0, AA13/AA3*100, 0)'],
    ['', ''],
    ['📦 STATUS',          ''],
    ['Pending',            '=COUNTIF(U2:U, "Pending")'],
    ['Paid',               '=COUNTIF(U2:U, "Paid")'],
    ['Shipped',            '=COUNTIF(U2:U, "Shipped")'],
    ['Delivered',          '=COUNTIF(U2:U, "Delivered")'],
    ['', ''],
    ['💳 PAYMENT MIX',     ''],
    ['Zelle Orders',       '=COUNTIF(L2:L, "zelle")'],
    ['CC Orders',          '=COUNTIF(L2:L, "credit_card")'],
    ['Zelle Revenue',      '=SUMIF(L2:L, "zelle", Q2:Q)'],
    ['CC Revenue',         '=SUMIF(L2:L, "credit_card", Q2:Q)'],
    ['', ''],
    ['🏷️ PROMO CODES',     ''],
    ['LAUNCH15 Uses',      '=COUNTIF(N2:N, "LAUNCH15")'],
    ['FOUNDER10 Uses',     '=COUNTIF(N2:N, "FOUNDER10")'],
    ['Total Promo Revenue','=SUMIF(N2:N, "<>", Q2:Q)'],
    ['', ''],
    ['🔥 TOP PRODUCTS',    ''],
    ['#1 Product',         '=IF(COUNTA(J2:J)>0, INDEX(J2:J, MATCH(MAX(COUNTIF(J2:J, J2:J)), COUNTIF(J2:J, J2:J), 0)), "N/A")']
  ];
  
  for (let i = 0; i < dashData.length; i++) {
    const r = i + 3;
    sheet.getRange('Z' + r).setValue(dashData[i][0]);
    if (dashData[i][1] && dashData[i][1].startsWith('=')) {
      sheet.getRange('AA' + r).setFormula(dashData[i][1]);
    } else if (dashData[i][1]) {
      sheet.getRange('AA' + r).setValue(dashData[i][1]);
    }
  }
  
  // Dashboard formatting
  sheet.setColumnWidth(26, 140); // Z
  sheet.setColumnWidth(27, 110); // AA
  
  const dashRange = sheet.getRange('Z2:AA35');
  dashRange.setFontFamily('Inter');
  dashRange.setFontSize(9);
  
  // Section headers
  const sectionRows = [2, 7, 12, 16, 22, 28, 33];
  sectionRows.forEach(sr => {
    const r = sr + 1;
    sheet.getRange('Z' + r + ':AA' + r).setBackground('#1e293b');
    sheet.getRange('Z' + r).setFontColor('#94a3b8');
    sheet.getRange('Z' + r).setFontWeight('bold');
    sheet.getRange('Z' + r).setFontSize(8);
  });
  
  // Labels bold
  sheet.getRange('Z3:Z35').setFontWeight('bold');
  sheet.getRange('Z3:Z35').setFontColor('#475569');
  
  // Currency format for dashboard values
  const currencyRows = [3, 5, 8, 9, 10, 13, 25, 26, 31];
  currencyRows.forEach(cr => {
    sheet.getRange('AA' + (cr + 2)).setNumberFormat('$#,##0.00');
  });
  
  // Percentage format
  sheet.getRange('AA14').setNumberFormat('#,##0.0"%"');
  
  // Profit highlight
  sheet.getRange('AA13').setFontSize(14);
  sheet.getRange('AA13').setFontWeight('bold');
  sheet.getRange('Z13').setFontSize(11);
  
  // Revenue highlight  
  sheet.getRange('AA3').setFontSize(12);
  sheet.getRange('AA3').setFontWeight('bold');
  
  // Dashboard border
  sheet.getRange('Z1:AA35').setBorder(true, true, true, true, null, null, '#334155', SpreadsheetApp.BorderStyle.SOLID_MEDIUM);
  
  Logger.log('✅ BOUGIE formatting complete! 💎');
}

// ============================================
// FORMAT CATALOG SHEET
// ============================================
function formatCatalogSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('Catalog');
  if (!sheet) return;
  
  sheet.setFrozenRows(1);
  const headerRange = sheet.getRange('A1:H1');
  headerRange.setBackground('#0f172a');
  headerRange.setFontColor('#e2e8f0');
  headerRange.setFontWeight('bold');
  
  sheet.getRange('C:C').setNumberFormat('$#,##0.00');
  sheet.getRange('D:D').setNumberFormat('$#,##0.00');
  
  const statusRule = SpreadsheetApp.newDataValidation()
    .requireValueInList(['in_stock', 'out_of_stock', 'pre_order'], true)
    .setAllowInvalid(false).build();
  sheet.getRange('G:G').setDataValidation(statusRule);
  
  const categoryRule = SpreadsheetApp.newDataValidation()
    .requireValueInList(['GLP-1 / GIP Agonists', 'Growth Hormone Peptides', 'Specialty Compounds'], true)
    .setAllowInvalid(false).build();
  sheet.getRange('H:H').setDataValidation(categoryRule);
  
  Logger.log('✅ Catalog formatted');
}
