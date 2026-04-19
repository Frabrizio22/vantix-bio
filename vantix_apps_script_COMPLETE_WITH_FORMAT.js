// ============================================
// VANTIX BIO - SECURED APPS SCRIPT
// Order Processing + Analytics API + Automation
// With API Key Authentication
// ============================================

// CONFIGURATION
const TELEGRAM_BOT_TOKEN = '8478171743:AAHc9H_QoXNsbaelWNwTrjHbWI_ZmDQY6L0';
const TELEGRAM_CHAT_ID = '513307658';
const FROM_EMAIL = 'vantixbio@gmail.com';
const COMPANY_NAME = 'Vantix Bio';

// 🔒 SECURITY: Change this to a random secret key
// Generate at: https://www.random.org/strings/?num=1&len=32&digits=on&upperalpha=on&loweralpha=on
const API_SECRET_KEY = 'vantix_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
// ⚠️ IMPORTANT: Copy this key and save it in Cloudflare Worker environment variables
// After first deployment, replace the Math.random() above with your actual static key

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
        data = params; // Fallback to form parameters
      }
    } else {
      data = params;
    }
    
    // 🔒 SECURITY CHECK: Validate API key
    const providedKey = data.api_key || params.api_key;
    if (providedKey !== API_SECRET_KEY) {
      Logger.log('Unauthorized access attempt - invalid API key');
      return ContentService.createTextOutput(JSON.stringify({
        status: 'error',
        message: 'Unauthorized'
      })).setMimeType(ContentService.MimeType.JSON);
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
// ORDER PROCESSING
// ============================================
function handleNewOrder(data) {
  const ordersSheet = getSheet('Orders');
  const productsSheet = getSheet('Products');
  
  // Validate required fields
  if (!data.customer_name || !data.customer_email || !data.order_number || !data.total) {
    return ContentService.createTextOutput(JSON.stringify({
      status: 'error',
      message: 'Missing required fields'
    })).setMimeType(ContentService.MimeType.JSON);
  }
  
  // Check if order already exists
  const existingOrders = ordersSheet.getRange('C:C').getValues();
  for (let i = 1; i < existingOrders.length; i++) {
    if (existingOrders[i][0] === data.order_number) {
      Logger.log('Duplicate order: ' + data.order_number);
      return ContentService.createTextOutput(JSON.stringify({
        status: 'duplicate',
        message: 'Order already processed'
      })).setMimeType(ContentService.MimeType.JSON);
    }
  }
  
  // Add to Orders sheet
  ordersSheet.appendRow([
    '', // Auto-increment order number (formula handles this)
    new Date(),
    data.customer_email || '',
    data.customer_name || '',
    data.phone || '',
    data.address || '',
    data.city || '',
    data.state || '',
    data.zip || '',
    data.product_name || '',
    parseInt(data.quantity) || 1,
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
    if (orders[i][0] === data.order_number) { // Column A (Order #)
      // Update payment status (Column T)
      ordersSheet.getRange(i + 1, 20).setValue(data.payment_status || 'Paid');
      
      // Send notifications if newly paid
      if (data.payment_status === 'Paid' && orders[i][19] !== 'Shipped') {
        const orderData = {
          order_number: orders[i][0],
          customer_name: orders[i][3],
          customer_email: orders[i][2],
          total: orders[i][14],
          payment_method: 'Credit Card',
          product_name: orders[i][9]
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

// ============================================
// ANALYTICS API (GET REQUESTS)
// ============================================
function doGet(e) {
  const params = e.parameter;
  
  // 🔒 SECURITY CHECK: Validate API key for GET requests too
  const providedKey = params.api_key;
  if (providedKey !== API_SECRET_KEY) {
    Logger.log('Unauthorized GET attempt - invalid API key');
    return ContentService.createTextOutput(JSON.stringify({
      status: 'error',
      message: 'Unauthorized'
    })).setMimeType(ContentService.MimeType.JSON);
  }
  
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
  const orders = ordersSheet.getDataRange().getValues();
  
  // Filter by month if specified
  const month = params.month; // Format: YYYY-MM
  
  let totalRevenue = 0;
  let totalOrders = 0;
  let totalProfit = 0;
  const paymentMethods = {};
  const productCounts = {};
  const dailyRevenue = {};
  
  // Process orders (skip header row)
  for (let i = 2; i < orders.length; i++) {
    if (!orders[i][1]) continue; // Skip empty rows
    
    const orderDate = new Date(orders[i][1]);
    const orderMonth = Utilities.formatDate(orderDate, Session.getScriptTimeZone(), 'yyyy-MM');
    
    // Skip if filtering by month and doesn't match
    if (month && orderMonth !== month) continue;
    
    const total = parseFloat(orders[i][14]) || 0;
    const profit = parseFloat(orders[i][18]) || 0;
    const paymentMethod = orders[i][11] || 'Unknown';
    const dateKey = Utilities.formatDate(orderDate, Session.getScriptTimeZone(), 'yyyy-MM-dd');
    
    totalRevenue += total;
    totalProfit += profit;
    totalOrders++;
    
    // Payment method breakdown
    paymentMethods[paymentMethod] = (paymentMethods[paymentMethod] || 0) + total;
    
    // Daily revenue
    dailyRevenue[dateKey] = (dailyRevenue[dateKey] || 0) + total;
    
    // Product counts
    const productName = orders[i][9];
    const quantity = parseInt(orders[i][10]) || 0;
    productCounts[productName] = (productCounts[productName] || 0) + quantity;
  }
  
  const response = {
    totalRevenue: totalRevenue,
    totalOrders: totalOrders,
    totalProfit: totalProfit,
    avgOrderValue: totalOrders > 0 ? totalRevenue / totalOrders : 0,
    profitMargin: totalRevenue > 0 ? (totalProfit / totalRevenue * 100) : 0,
    paymentMethods: paymentMethods,
    topProducts: productCounts,
    dailyRevenue: dailyRevenue
  };
  
  return ContentService.createTextOutput(JSON.stringify(response))
    .setMimeType(ContentService.MimeType.JSON);
}
// ADD THIS TO YOUR APPS SCRIPT
// Run this ONCE after deploying to format the entire sheet

function formatVantixSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // Format Orders Tab
  formatOrdersTab(ss);
  
  // Format Products Tab
  formatProductsTab(ss);
  
  // Format Batches Tab
  formatBatchesTab(ss);
  
  // Format Expenses Tab
  formatExpensesTab(ss);
  
  // Format Newsletter Tab
  formatNewsletterTab(ss);
  
  // Format Notifications Tab
  formatNotificationsTab(ss);
  
  // Format Dashboard Tab
  formatDashboardTab(ss);
  
  Logger.log('✅ All formatting complete!');
}

function formatOrdersTab(ss) {
  const sheet = ss.getSheetByName('Orders');
  if (!sheet) return;
  
  // Freeze header row
  sheet.setFrozenRows(1);
  
  // Format header row (black background, white text, bold)
  const headerRange = sheet.getRange('A1:W1');
  headerRange.setBackground('#000000');
  headerRange.setFontColor('#FFFFFF');
  headerRange.setFontWeight('bold');
  
  // Format currency columns
  sheet.getRange('M:M').setNumberFormat('$#,##0.00'); // Subtotal
  sheet.getRange('N:N').setNumberFormat('$#,##0.00'); // Shipping (Cust)
  sheet.getRange('O:O').setNumberFormat('$#,##0.00'); // Total
  sheet.getRange('P:P').setNumberFormat('$#,##0.00'); // COGS
  sheet.getRange('Q:Q').setNumberFormat('$#,##0.00'); // Actual Ship Cost
  sheet.getRange('R:R').setNumberFormat('$#,##0.00'); // CC Fees
  sheet.getRange('S:S').setNumberFormat('$#,##0.00'); // Net Profit
  
  // Format timestamp
  sheet.getRange('B:B').setNumberFormat('M/d/yyyy h:mm');
  
  // Add data validation - Payment Method
  const paymentRule = SpreadsheetApp.newDataValidation()
    .requireValueInList(['Zelle', 'Credit Card', 'Bitcoin'], true)
    .setAllowInvalid(false)
    .build();
  sheet.getRange('L:L').setDataValidation(paymentRule);
  
  // Add data validation - Status
  const statusRule = SpreadsheetApp.newDataValidation()
    .requireValueInList(['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'], true)
    .setAllowInvalid(false)
    .build();
  sheet.getRange('T:T').setDataValidation(statusRule);
  
  // Conditional formatting for Status
  const statusRules = [
    SpreadsheetApp.newConditionalFormatRule()
      .whenTextEqualTo('Shipped')
      .setBackground('#d9ead3')
      .setRanges([sheet.getRange('T:T')])
      .build(),
    SpreadsheetApp.newConditionalFormatRule()
      .whenTextEqualTo('Delivered')
      .setBackground('#b6d7a8')
      .setRanges([sheet.getRange('T:T')])
      .build(),
    SpreadsheetApp.newConditionalFormatRule()
      .whenTextEqualTo('Pending')
      .setBackground('#fff2cc')
      .setRanges([sheet.getRange('T:T')])
      .build(),
    SpreadsheetApp.newConditionalFormatRule()
      .whenTextEqualTo('Processing')
      .setBackground('#cfe2f3')
      .setRanges([sheet.getRange('T:T')])
      .build(),
    SpreadsheetApp.newConditionalFormatRule()
      .whenTextEqualTo('Cancelled')
      .setBackground('#f4cccc')
      .setRanges([sheet.getRange('T:T')])
      .build()
  ];
  sheet.setConditionalFormatRules(statusRules);
}

function formatProductsTab(ss) {
  const sheet = ss.getSheetByName('Products');
  if (!sheet) return;
  
  sheet.setFrozenRows(1);
  
  // Header formatting
  const headerRange = sheet.getRange('A1:O1');
  headerRange.setBackground('#000000');
  headerRange.setFontColor('#FFFFFF');
  headerRange.setFontWeight('bold');
  
  // Currency formatting
  sheet.getRange('C:C').setNumberFormat('$#,##0.00'); // Price
  sheet.getRange('D:D').setNumberFormat('$#,##0.00'); // Batch Cost
  sheet.getRange('L:L').setNumberFormat('$#,##0.00'); // Profit/Unit
  sheet.getRange('N:N').setNumberFormat('$#,##0.00'); // Revenue
  
  // Percentage formatting
  sheet.getRange('K:K').setNumberFormat('0.00%'); // Margin %
  
  // Status dropdown
  const statusRule = SpreadsheetApp.newDataValidation()
    .requireValueInList(['in_stock', 'out_of_stock', 'pre_order'], true)
    .setAllowInvalid(false)
    .build();
  sheet.getRange('G:G').setDataValidation(statusRule);
  
  // Category dropdown
  const categoryRule = SpreadsheetApp.newDataValidation()
    .requireValueInList(['GLP-1', 'Recovery', 'Growth Hormone', 'Longevity', 'Fat Loss'], true)
    .setAllowInvalid(false)
    .build();
  sheet.getRange('H:H').setDataValidation(categoryRule);
  
  // Conditional formatting for Status
  const statusRules = [
    SpreadsheetApp.newConditionalFormatRule()
      .whenTextEqualTo('in_stock')
      .setBackground('#d9ead3')
      .setRanges([sheet.getRange('G:G')])
      .build(),
    SpreadsheetApp.newConditionalFormatRule()
      .whenTextEqualTo('out_of_stock')
      .setBackground('#f4cccc')
      .setRanges([sheet.getRange('G:G')])
      .build(),
    SpreadsheetApp.newConditionalFormatRule()
      .whenTextEqualTo('pre_order')
      .setBackground('#fff2cc')
      .setRanges([sheet.getRange('G:G')])
      .build()
  ];
  sheet.setConditionalFormatRules(statusRules);
}

function formatBatchesTab(ss) {
  const sheet = ss.getSheetByName('Batches');
  if (!sheet) return;
  
  sheet.setFrozenRows(1);
  
  const headerRange = sheet.getRange('A1:M1');
  headerRange.setBackground('#000000');
  headerRange.setFontColor('#FFFFFF');
  headerRange.setFontWeight('bold');
  
  // Currency formatting
  sheet.getRange('E:I').setNumberFormat('$#,##0.00');
  
  // Date formatting
  sheet.getRange('B:B').setNumberFormat('M/d/yyyy');
  
  // Supplier dropdown
  const supplierRule = SpreadsheetApp.newDataValidation()
    .requireValueInList(['Dora', 'Bane', 'Other'], true)
    .setAllowInvalid(false)
    .build();
  sheet.getRange('D:D').setDataValidation(supplierRule);
  
  // Status dropdown
  const statusRule = SpreadsheetApp.newDataValidation()
    .requireValueInList(['Active', 'Depleted', 'Testing'], true)
    .setAllowInvalid(false)
    .build();
  sheet.getRange('M:M').setDataValidation(statusRule);
}

function formatExpensesTab(ss) {
  const sheet = ss.getSheetByName('Expenses');
  if (!sheet) return;
  
  sheet.setFrozenRows(1);
  
  const headerRange = sheet.getRange('A1:I1');
  headerRange.setBackground('#000000');
  headerRange.setFontColor('#FFFFFF');
  headerRange.setFontWeight('bold');
  
  // Currency formatting
  sheet.getRange('E:E').setNumberFormat('$#,##0.00');
  
  // Date formatting
  sheet.getRange('A:A').setNumberFormat('M/d/yyyy');
  
  // Category dropdown
  const categoryRule = SpreadsheetApp.newDataValidation()
    .requireValueInList(['Product Purchase', 'Testing', 'Packaging', 'Shipping', 'Marketing', 'Profit Split', 'Other'], true)
    .setAllowInvalid(false)
    .build();
  sheet.getRange('B:B').setDataValidation(categoryRule);
  
  // Payment Method dropdown
  const paymentRule = SpreadsheetApp.newDataValidation()
    .requireValueInList(['Wire Transfer', 'Credit Card', 'PayPal', 'Zelle', 'Cash'], true)
    .setAllowInvalid(false)
    .build();
  sheet.getRange('G:G').setDataValidation(paymentRule);
}

function formatNewsletterTab(ss) {
  const sheet = ss.getSheetByName('Newsletter');
  if (!sheet) return;
  
  sheet.setFrozenRows(1);
  
  const headerRange = sheet.getRange('A1:D1');
  headerRange.setBackground('#000000');
  headerRange.setFontColor('#FFFFFF');
  headerRange.setFontWeight('bold');
  
  sheet.getRange('A:A').setNumberFormat('M/d/yyyy h:mm');
}

function formatNotificationsTab(ss) {
  const sheet = ss.getSheetByName('Notifications');
  if (!sheet) return;
  
  sheet.setFrozenRows(1);
  
  const headerRange = sheet.getRange('A1:E1');
  headerRange.setBackground('#000000');
  headerRange.setFontColor('#FFFFFF');
  headerRange.setFontWeight('bold');
  
  sheet.getRange('A:A').setNumberFormat('M/d/yyyy h:mm');
  sheet.getRange('E:E').setNumberFormat('M/d/yyyy h:mm');
  
  // Status dropdown
  const statusRule = SpreadsheetApp.newDataValidation()
    .requireValueInList(['pending', 'sent', 'delivered', 'failed'], true)
    .setAllowInvalid(false)
    .build();
  sheet.getRange('D:D').setDataValidation(statusRule);
}

function formatDashboardTab(ss) {
  const sheet = ss.getSheetByName('Dashboard');
  if (!sheet) return;
  
  sheet.setFrozenRows(1);
  
  const headerRange = sheet.getRange('A1:B1');
  headerRange.setBackground('#000000');
  headerRange.setFontColor('#FFFFFF');
  headerRange.setFontWeight('bold');
  headerRange.setFontSize(14);
}
