// ============================================
// VANTIX BIO - COMPLETE FEE & REFUND TRACKING
// Includes: Refunds, Payment Fees, Monthly Minimum Offset
// ============================================

// CONFIGURATION
const TELEGRAM_BOT_TOKEN = '8478171743:AAHc9H_QoXNsbaelWNwTrjHbWI_ZmDQY6L0';
const TELEGRAM_CHAT_ID = '513307658';
const FROM_EMAIL = 'vantixbio@gmail.com';
const COMPANY_NAME = 'Vantix Bio';

// FEE STRUCTURE
const FEES = {
  credit_card: {
    square: { rate: 0.038, fixed: 0.30 },      // 3.8% + $0.30
    gateway: { rate: 0.006, fixed: 0.10 },     // 0.6% + $0.10
    monthlyMinimum: 50                          // $50/month gateway minimum
  },
  zelle: {
    square: { rate: 0, fixed: 0 },
    gateway: { rate: 0, fixed: 0 },
    monthlyMinimum: 0
  },
  crypto: {
    square: { rate: 0.01, fixed: 0 },          // ~1% (estimate)
    gateway: { rate: 0, fixed: 0 },
    monthlyMinimum: 0
  }
};

// Get active spreadsheet
function getSheet(tabName) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  return ss.getSheetByName(tabName);
}

// ============================================
// ONE-TIME SETUP: Add All Tracking Columns
// Run this once to add refund + fee tracking
// ============================================
function setupCompleteTracking() {
  const ordersSheet = getSheet('Orders');
  
  // Check if columns already exist
  const headers = ordersSheet.getRange(1, 1, 1, ordersSheet.getLastColumn()).getValues()[0];
  if (headers.includes('Refund Status')) {
    Logger.log('Tracking columns already exist');
    return;
  }
  
  // Add headers starting at column S (19)
  const startCol = ordersSheet.getLastColumn() + 1;
  ordersSheet.getRange(1, startCol, 1, 10).setValues([[
    'Refund Status',      // S (19)
    'Refund Amount',      // T (20)
    'Refund Date',        // U (21)
    'Refund Reason',      // V (22)
    'Square Fee',         // W (23)
    'Gateway Fee',        // X (24)
    'Total Fees',         // Y (25)
    'Gateway Min Impact', // Z (26) - allocated monthly minimum
    'Net After Fees',     // AA (27)
    'Net Revenue'         // AB (28) - after fees AND refunds
  ]]);
  
  // Format headers
  ordersSheet.getRange(1, startCol, 1, 10)
    .setFontWeight('bold')
    .setBackground('#f3f4f6');
  
  // Set up data validation for Refund Status
  const refundStatusRule = SpreadsheetApp.newDataValidation()
    .requireValueInList(['None', 'Partial', 'Full'], true)
    .setAllowInvalid(false)
    .build();
  
  ordersSheet.getRange(2, startCol, 1000, 1).setDataValidation(refundStatusRule);
  
  // Fill existing rows with defaults and formulas
  const lastRow = ordersSheet.getLastRow();
  if (lastRow > 1) {
    for (let row = 2; row <= lastRow; row++) {
      const totalCol = 14; // Column N (Order Total)
      const paymentMethodCol = 15; // Column O (Payment Method)
      
      // S: Refund Status = "None"
      ordersSheet.getRange(row, startCol).setValue('None');
      
      // W: Square Fee formula
      const squareFeeFormula = `=IF(${getColumnLetter(paymentMethodCol)}${row}="credit_card", ${getColumnLetter(totalCol)}${row}*0.038+0.30, IF(${getColumnLetter(paymentMethodCol)}${row}="crypto", ${getColumnLetter(totalCol)}${row}*0.01, 0))`;
      ordersSheet.getRange(row, startCol + 4).setFormula(squareFeeFormula);
      
      // X: Gateway Fee formula  
      const gatewayFeeFormula = `=IF(${getColumnLetter(paymentMethodCol)}${row}="credit_card", ${getColumnLetter(totalCol)}${row}*0.006+0.10, 0)`;
      ordersSheet.getRange(row, startCol + 5).setFormula(gatewayFeeFormula);
      
      // Y: Total Fees = Square + Gateway
      const totalFeesFormula = `=${getColumnLetter(startCol + 4)}${row}+${getColumnLetter(startCol + 5)}${row}`;
      ordersSheet.getRange(row, startCol + 6).setFormula(totalFeesFormula);
      
      // Z: Gateway Min Impact (will be calculated monthly)
      ordersSheet.getRange(row, startCol + 7).setValue(0);
      
      // AA: Net After Fees = Total - Total Fees - Gateway Min Impact
      const netAfterFeesFormula = `=${getColumnLetter(totalCol)}${row}-${getColumnLetter(startCol + 6)}${row}-${getColumnLetter(startCol + 7)}${row}`;
      ordersSheet.getRange(row, startCol + 8).setFormula(netAfterFeesFormula);
      
      // AB: Net Revenue (after fees AND refunds)
      const refundStatusCol = startCol; // S
      const refundAmountCol = startCol + 1; // T
      const netAfterFeesCol = startCol + 8; // AA
      const netRevenueFormula = `=IF(${getColumnLetter(refundStatusCol)}${row}="Full", 0, IF(${getColumnLetter(refundStatusCol)}${row}="Partial", ${getColumnLetter(netAfterFeesCol)}${row}-${getColumnLetter(refundAmountCol)}${row}, ${getColumnLetter(netAfterFeesCol)}${row}))`;
      ordersSheet.getRange(row, startCol + 9).setFormula(netRevenueFormula);
    }
  }
  
  // Format currency columns
  ordersSheet.getRange(2, startCol + 1, 1000, 1).setNumberFormat('$#,##0.00'); // Refund Amount
  ordersSheet.getRange(2, startCol + 4, 1000, 6).setNumberFormat('$#,##0.00'); // Square Fee through Net Revenue
  
  // Format date column
  ordersSheet.getRange(2, startCol + 2, 1000, 1).setNumberFormat('yyyy-mm-dd'); // Refund Date
  
  // Add conditional formatting for refund status
  const fullRefundRule = SpreadsheetApp.newConditionalFormatRule()
    .whenTextEqualTo('Full')
    .setBackground('#fee2e2')
    .setRanges([ordersSheet.getRange(2, startCol, 1000, 1)])
    .build();
  
  const partialRefundRule = SpreadsheetApp.newConditionalFormatRule()
    .whenTextEqualTo('Partial')
    .setBackground('#fef3c7')
    .setRanges([ordersSheet.getRange(2, startCol, 1000, 1)])
    .build();
  
  const rules = ordersSheet.getConditionalFormatRules();
  rules.push(fullRefundRule);
  rules.push(partialRefundRule);
  ordersSheet.setConditionalFormatRules(rules);
  
  Logger.log('Complete tracking columns added successfully!');
}

// ============================================
// MONTHLY MINIMUM ALLOCATION
// Run at end of each month to allocate $50 minimum
// ============================================
function allocateMonthlyMinimum(year, month) {
  const ordersSheet = getSheet('Orders');
  const orders = ordersSheet.getDataRange().getValues();
  
  // Filter CC orders for this month
  const ccOrders = [];
  let totalGatewayFees = 0;
  
  for (let i = 1; i < orders.length; i++) {
    const orderDate = new Date(orders[i][1]); // Column B
    const orderYear = orderDate.getFullYear();
    const orderMonth = orderDate.getMonth() + 1;
    const paymentMethod = orders[i][14]; // Column O
    
    if (orderYear === year && orderMonth === month && paymentMethod === 'credit_card') {
      const gatewayFee = parseFloat(orders[i][23]) || 0; // Column X (gateway fee)
      totalGatewayFees += gatewayFee;
      ccOrders.push({ row: i + 1, gatewayFee: gatewayFee });
    }
  }
  
  // Calculate shortfall
  const monthlyMinimum = 50;
  const shortfall = Math.max(0, monthlyMinimum - totalGatewayFees);
  
  if (shortfall > 0 && ccOrders.length > 0) {
    // Allocate shortfall proportionally based on gateway fees
    ccOrders.forEach(order => {
      const proportion = order.gatewayFee / totalGatewayFees;
      const allocatedShortfall = shortfall * proportion;
      ordersSheet.getRange(order.row, 26).setValue(allocatedShortfall); // Column Z
    });
    
    Logger.log(`Allocated $${shortfall.toFixed(2)} monthly minimum across ${ccOrders.length} orders`);
    
    // Send Telegram notification
    const message = `📊 *Monthly Minimum Allocated*\n\n` +
      `Month: ${year}-${String(month).padStart(2, '0')}\n` +
      `Gateway Fees: $${totalGatewayFees.toFixed(2)}\n` +
      `Monthly Minimum: $${monthlyMinimum}\n` +
      `Shortfall: $${shortfall.toFixed(2)}\n` +
      `Orders: ${ccOrders.length}`;
    
    sendTelegramMessage(message);
  } else {
    Logger.log(`No shortfall for ${year}-${month}. Gateway fees: $${totalGatewayFees.toFixed(2)}`);
  }
  
  return {
    totalGatewayFees: totalGatewayFees,
    shortfall: shortfall,
    ordersAffected: ccOrders.length
  };
}

// Helper function to convert column number to letter
function getColumnLetter(column) {
  let temp, letter = '';
  while (column > 0) {
    temp = (column - 1) % 26;
    letter = String.fromCharCode(temp + 65) + letter;
    column = (column - temp - 1) / 26;
  }
  return letter;
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
    } else if (action === 'log_refund') {
      return handleRefund(data);
    } else if (action === 'allocate_monthly_minimum') {
      return handleMonthlyMinimumAllocation(data);
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
// MONTHLY MINIMUM ALLOCATION HANDLER
// ============================================
function handleMonthlyMinimumAllocation(data) {
  const year = parseInt(data.year) || new Date().getFullYear();
  const month = parseInt(data.month) || new Date().getMonth() + 1;
  
  const result = allocateMonthlyMinimum(year, month);
  
  return ContentService.createTextOutput(JSON.stringify({
    status: 'success',
    ...result
  })).setMimeType(ContentService.MimeType.JSON);
}

// ============================================
// REFUND HANDLER
// ============================================
function handleRefund(data) {
  const ordersSheet = getSheet('Orders');
  
  if (!data.order_number) {
    return ContentService.createTextOutput(JSON.stringify({
      status: 'error',
      message: 'Missing order_number'
    })).setMimeType(ContentService.MimeType.JSON);
  }
  
  const orders = ordersSheet.getDataRange().getValues();
  let orderRow = -1;
  let orderData = null;
  
  for (let i = 1; i < orders.length; i++) {
    if (orders[i][2] == data.order_number) {
      orderRow = i + 1;
      orderData = orders[i];
      break;
    }
  }
  
  if (orderRow === -1) {
    return ContentService.createTextOutput(JSON.stringify({
      status: 'error',
      message: 'Order not found'
    })).setMimeType(ContentService.MimeType.JSON);
  }
  
  // Update refund columns (S, T, U, V = 19, 20, 21, 22)
  ordersSheet.getRange(orderRow, 19).setValue(data.refund_type || 'Partial');
  ordersSheet.getRange(orderRow, 20).setValue(parseFloat(data.refund_amount) || 0);
  ordersSheet.getRange(orderRow, 21).setValue(new Date());
  ordersSheet.getRange(orderRow, 22).setValue(data.reason || '');
  
  // Send notification
  const customerName = orderData[2];
  const orderTotal = orderData[13];
  const refundType = data.refund_type || 'Partial';
  const refundAmount = parseFloat(data.refund_amount) || 0;
  
  const message = `💸 *Refund Processed*\n\n` +
    `Order: ${data.order_number}\n` +
    `Customer: ${customerName}\n` +
    `Order Total: $${parseFloat(orderTotal).toFixed(2)}\n` +
    `Refund Type: ${refundType}\n` +
    `Refund Amount: $${refundAmount.toFixed(2)}\n` +
    `Reason: ${data.reason || 'Not specified'}`;
  
  sendTelegramMessage(message);
  
  return ContentService.createTextOutput(JSON.stringify({
    status: 'success',
    message: 'Refund logged successfully'
  })).setMimeType(ContentService.MimeType.JSON);
}

// ============================================
// ORDER PROCESSING
// ============================================
function handleNewOrder(data) {
  const ordersSheet = getSheet('Orders');
  const productsSheet = getSheet('Products');
  
  if (!data.customer_name || !data.customer_email || !data.order_number || !data.total) {
    return ContentService.createTextOutput(JSON.stringify({
      status: 'error',
      message: 'Missing required fields'
    })).setMimeType(ContentService.MimeType.JSON);
  }
  
  // Check duplicates
  const existingOrders = ordersSheet.getRange('C:C').getValues();
  for (let i = 1; i < existingOrders.length; i++) {
    if (existingOrders[i][0] === data.order_number) {
      return ContentService.createTextOutput(JSON.stringify({
        status: 'duplicate',
        message: 'Order already processed'
      })).setMimeType(ContentService.MimeType.JSON);
    }
  }
  
  // Add to Orders sheet (columns A-AB: 28 total)
  ordersSheet.appendRow([
    '',
    new Date(),
    data.customer_name || '',
    data.customer_email || '',
    data.address || '',
    data.city || '',
    data.state || '',
    data.zip || '',
    data.phone || '',
    data.items_detail || '',
    parseFloat(data.subtotal) || 0,
    parseFloat(data.discount) || 0,
    parseFloat(data.shipping) || 0,
    parseFloat(data.total) || 0,
    data.payment_method || '',
    data.payment_status || 'Pending',
    data.tracking || '',
    data.notes || '',
    'None',  // Refund Status
    '',      // Refund Amount
    '',      // Refund Date
    '',      // Refund Reason
    '',      // Square Fee (formula)
    '',      // Gateway Fee (formula)
    '',      // Total Fees (formula)
    0,       // Gateway Min Impact
    '',      // Net After Fees (formula)
    ''       // Net Revenue (formula)
  ]);
  
  // Log products
  if (data.items && productsSheet) {
    try {
      const items = JSON.parse(data.items);
      items.forEach(item => {
        productsSheet.appendRow([
          data.order_number,
          new Date(),
          item.name || '',
          item.sku || '',
          parseInt(item.quantity) || 1,
          parseFloat(item.price) || 0,
          parseFloat(item.price) * parseInt(item.quantity)
        ]);
      });
    } catch (e) {
      Logger.log('Error parsing items: ' + e);
    }
  }
  
  // Send notifications
  if (data.payment_method === 'zelle' || data.payment_status === 'Paid') {
    sendTelegramNotification(data);
    sendCustomerConfirmation(data);
  }
  
  return ContentService.createTextOutput(JSON.stringify({
    status: 'success',
    message: 'Order processed'
  })).setMimeType(ContentService.MimeType.JSON);
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
    if (orders[i][2] === data.order_number) {
      ordersSheet.getRange(i + 1, 16).setValue(data.payment_status || 'Paid');
      
      if (data.payment_status === 'Paid' && orders[i][15] !== 'Paid') {
        const orderData = {
          order_number: orders[i][2],
          customer_name: orders[i][2],
          customer_email: orders[i][3],
          total: orders[i][13],
          payment_method: 'credit_card',
          items_detail: orders[i][9]
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
  const notificationsSheet = getSheet('Notifications');
  
  if (!data.email || !data.product) {
    return ContentService.createTextOutput(JSON.stringify({
      status: 'error',
      message: 'Missing email or product'
    })).setMimeType(ContentService.MimeType.JSON);
  }
  
  notificationsSheet.appendRow([
    data.email,
    data.product,
    new Date(),
    'No'
  ]);
  
  const message = `📬 *New Waitlist Signup*\n\n` +
    `Email: ${data.email}\n` +
    `Product: ${data.product}\n` +
    `Source: ${data.source || 'Unknown'}`;
  
  sendTelegramMessage(message);
  
  return ContentService.createTextOutput(JSON.stringify({
    status: 'success',
    message: 'Added to waitlist'
  })).setMimeType(ContentService.MimeType.JSON);
}

// ============================================
// TELEGRAM NOTIFICATIONS
// ============================================
function sendTelegramMessage(message) {
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

function sendTelegramNotification(data) {
  const message = `🔔 *New Vantix Order*\n\n` +
    `Order: ${data.order_number}\n` +
    `Customer: ${data.customer_name}\n` +
    `Email: ${data.customer_email}\n` +
    `Total: $${parseFloat(data.total).toFixed(2)}\n` +
    `Payment: ${data.payment_method}\n\n` +
    `Items:\n${data.items_detail || 'N/A'}`;
  
  sendTelegramMessage(message);
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

// ============================================
// ANALYTICS API (GET REQUESTS)
// ============================================
function doGet(e) {
  const params = e.parameter;
  const action = params.action || 'dashboard';
  
  if (action === 'dashboard') {
    return getDashboardData(params);
  }
  
  return ContentService.createTextOutput(JSON.stringify({
    status: 'error',
    message: 'Unknown action'
  })).setMimeType(ContentService.MimeType.JSON);
}

function getDashboardData(params) {
  const ordersSheet = getSheet('Orders');
  const productsSheet = getSheet('Products');
  
  const orders = ordersSheet.getDataRange().getValues();
  const products = productsSheet ? productsSheet.getDataRange().getValues() : [];
  
  const month = params.month;
  
  let grossRevenue = 0;
  let totalOrders = 0;
  let totalRefunds = 0;
  let totalSquareFees = 0;
  let totalGatewayFees = 0;
  let totalGatewayMinImpact = 0;
  let netRevenue = 0;
  
  const paymentMethods = {};
  const productCounts = {};
  const dailyRevenue = {};
  const refundStats = { full: 0, partial: 0, none: 0 };
  
  // Process orders
  for (let i = 1; i < orders.length; i++) {
    const orderDate = new Date(orders[i][1]);
    const orderMonth = Utilities.formatDate(orderDate, Session.getScriptTimeZone(), 'yyyy-MM');
    
    if (month && orderMonth !== month) continue;
    
    const total = parseFloat(orders[i][13]) || 0;
    const paymentMethod = orders[i][14] || 'Unknown';
    const dateKey = Utilities.formatDate(orderDate, Session.getScriptTimeZone(), 'yyyy-MM-dd');
    const refundStatus = orders[i][18] || 'None';
    const refundAmount = parseFloat(orders[i][19]) || 0;
    const squareFee = parseFloat(orders[i][22]) || 0;
    const gatewayFee = parseFloat(orders[i][23]) || 0;
    const gatewayMinImpact = parseFloat(orders[i][25]) || 0;
    const orderNetRevenue = parseFloat(orders[i][27]) || 0;
    
    grossRevenue += total;
    totalOrders++;
    totalSquareFees += squareFee;
    totalGatewayFees += gatewayFee;
    totalGatewayMinImpact += gatewayMinImpact;
    netRevenue += orderNetRevenue;
    
    if (refundStatus === 'Full') {
      totalRefunds += total;
      refundStats.full++;
    } else if (refundStatus === 'Partial') {
      totalRefunds += refundAmount;
      refundStats.partial++;
    } else {
      refundStats.none++;
    }
    
    paymentMethods[paymentMethod] = (paymentMethods[paymentMethod] || 0) + total;
    dailyRevenue[dateKey] = (dailyRevenue[dateKey] || 0) + total;
  }
  
  // Process products
  for (let i = 1; i < products.length; i++) {
    const orderDate = new Date(products[i][1]);
    const orderMonth = Utilities.formatDate(orderDate, Session.getScriptTimeZone(), 'yyyy-MM');
    
    if (month && orderMonth !== month) continue;
    
    const productName = products[i][2];
    const quantity = parseInt(products[i][4]) || 0;
    
    productCounts[productName] = (productCounts[productName] || 0) + quantity;
  }
  
  const totalFees = totalSquareFees + totalGatewayFees + totalGatewayMinImpact;
  
  const response = {
    grossRevenue: grossRevenue,
    fees: {
      square: totalSquareFees,
      gateway: totalGatewayFees,
      gatewayMinimum: totalGatewayMinImpact,
      total: totalFees
    },
    totalRefunds: totalRefunds,
    netRevenue: netRevenue,
    totalOrders: totalOrders,
    avgOrderValue: totalOrders > 0 ? grossRevenue / totalOrders : 0,
    refundRate: totalOrders > 0 ? ((refundStats.full + refundStats.partial) / totalOrders * 100) : 0,
    refundStats: refundStats,
    paymentMethods: paymentMethods,
    topProducts: productCounts,
    dailyRevenue: dailyRevenue
  };
  
  return ContentService.createTextOutput(JSON.stringify(response))
    .setMimeType(ContentService.MimeType.JSON);
}
