// ============================================
// VANTIX BIO - COMPLETE APPS SCRIPT
// Order Processing + Analytics API + Automation
// ============================================

// CONFIGURATION
const TELEGRAM_BOT_TOKEN = '8478171743:AAHc9H_QoXNsbaelWNwTrjHbWI_ZmDQY6L0';
const TELEGRAM_CHAT_ID = '513307658';
const FROM_EMAIL = 'vantixbio@gmail.com';
const COMPANY_NAME = 'Vantix Bio';

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
    data.notes || ''
  ]);
  
  // Log individual products
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
  
  // Send notifications (only for confirmed orders)
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
  
  // Find order row
  const orders = ordersSheet.getDataRange().getValues();
  for (let i = 1; i < orders.length; i++) {
    if (orders[i][2] === data.order_number) { // Column C (order_number in system)
      // Update payment status (Column P)
      ordersSheet.getRange(i + 1, 16).setValue(data.payment_status || 'Paid');
      
      // Send notifications if newly paid
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
    `Order: ${data.order_number}\n` +
    `Customer: ${data.customer_name}\n` +
    `Email: ${data.customer_email}\n` +
    `Total: $${parseFloat(data.total).toFixed(2)}\n` +
    `Payment: ${data.payment_method}\n\n` +
    `Items:\n${data.items_detail || 'N/A'}`;
  
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
  const products = productsSheet.getDataRange().getValues();
  
  // Filter by month if specified
  const month = params.month; // Format: YYYY-MM
  
  let totalRevenue = 0;
  let totalOrders = 0;
  const paymentMethods = {};
  const productCounts = {};
  const dailyRevenue = {};
  
  // Process orders (skip header row)
  for (let i = 1; i < orders.length; i++) {
    const orderDate = new Date(orders[i][1]);
    const orderMonth = Utilities.formatDate(orderDate, Session.getScriptTimeZone(), 'yyyy-MM');
    
    // Skip if filtering by month and doesn't match
    if (month && orderMonth !== month) continue;
    
    const total = parseFloat(orders[i][13]) || 0;
    const paymentMethod = orders[i][14] || 'Unknown';
    const dateKey = Utilities.formatDate(orderDate, Session.getScriptTimeZone(), 'yyyy-MM-dd');
    
    totalRevenue += total;
    totalOrders++;
    
    // Payment method breakdown
    paymentMethods[paymentMethod] = (paymentMethods[paymentMethod] || 0) + total;
    
    // Daily revenue
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
  
  // Calculate today vs yesterday
  const today = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd');
  const yesterday = Utilities.formatDate(new Date(Date.now() - 86400000), Session.getScriptTimeZone(), 'yyyy-MM-dd');
  const todayRevenue = dailyRevenue[today] || 0;
  const yesterdayRevenue = dailyRevenue[yesterday] || 0;
  
  // Calculate last 7 days
  const last7Days = {};
  const prev7Days = {};
  for (let i = 0; i < 7; i++) {
    const date = new Date(Date.now() - i * 86400000);
    const dateKey = Utilities.formatDate(date, Session.getScriptTimeZone(), 'yyyy-MM-dd');
    last7Days[dateKey] = dailyRevenue[dateKey] || 0;
    
    const prevDate = new Date(Date.now() - (i + 7) * 86400000);
    const prevDateKey = Utilities.formatDate(prevDate, Session.getScriptTimeZone(), 'yyyy-MM-dd');
    prev7Days[prevDateKey] = dailyRevenue[prevDateKey] || 0;
  }
  
  const last7DaysRevenue = Object.values(last7Days).reduce((a, b) => a + b, 0);
  const prev7DaysRevenue = Object.values(prev7Days).reduce((a, b) => a + b, 0);
  
  const response = {
    totalRevenue: totalRevenue,
    totalOrders: totalOrders,
    avgOrderValue: totalOrders > 0 ? totalRevenue / totalOrders : 0,
    paymentMethods: paymentMethods,
    topProducts: productCounts,
    dailyRevenue: dailyRevenue,
    today: {
      revenue: todayRevenue,
      vsYesterday: yesterdayRevenue > 0 ? ((todayRevenue - yesterdayRevenue) / yesterdayRevenue * 100) : 0
    },
    last7Days: {
      revenue: last7DaysRevenue,
      vsPrev7Days: prev7DaysRevenue > 0 ? ((last7DaysRevenue - prev7DaysRevenue) / prev7DaysRevenue * 100) : 0
    }
  };
  
  return ContentService.createTextOutput(JSON.stringify(response))
    .setMimeType(ContentService.MimeType.JSON);
}
