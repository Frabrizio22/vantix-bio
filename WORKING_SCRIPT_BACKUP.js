// ============================================
// VANTIX BIO - PRODUCTION APPS SCRIPT
// Order Processing + Inventory + Waitlist + Notifications + Dashboard API
// UPDATED: June 15, 2026 - No OAuth, password-only dashboard
// ============================================

// CONFIGURATION
var TELEGRAM_BOT_TOKEN = '8478171743:AAGmYaPtMFh5yHWI-UQmInSlLuYNEcGFbXo';
var TELEGRAM_CHAT_ID = '513307658';
var FROM_EMAIL = 'vantixbio@gmail.com';
var COMPANY_NAME = 'Vantix Bio';
var LOW_STOCK_THRESHOLD = 10;
var DASH_PASSWORD = 'vantix2026';

function getSheet(tabName) {
 var ss = SpreadsheetApp.getActiveSpreadsheet();
 return ss.getSheetByName(tabName);
}

// ============================================
// DASHBOARD API (GET) - Returns all data
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
// MAIN REQUEST HANDLER (POST)
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
 return ContentService.createTextOutput(JSON.stringify({status: 'error', message: 'Unknown action'})).setMimeType(ContentService.MimeType.JSON);
 } catch (error) {
 Logger.log('Error in doPost: ' + error);
 return ContentService.createTextOutput(JSON.stringify({status: 'error', message: error.toString()})).setMimeType(ContentService.MimeType.JSON);
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
 // Parse sheet name from range like "Expenses!A:G"
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

// ============================================
// ORDER PROCESSING WITH INVENTORY
// ============================================
function handleNewOrder(data) {
 var ordersSheet = getSheet('Orders');
 var batchesSheet = getSheet('Batches');
 if (!data.customer_name || !data.customer_email || !data.order_number || !data.total) {
 return ContentService.createTextOutput(JSON.stringify({status: 'error', message: 'Missing required fields'})).setMimeType(ContentService.MimeType.JSON);
 }
 var existingOrders = ordersSheet.getRange('A:A').getValues();
 for (var i = 1; i < existingOrders.length; i++) {
 if (existingOrders[i][0] === data.order_number) {
 return ContentService.createTextOutput(JSON.stringify({status: 'duplicate', message: 'Order already processed'})).setMimeType(ContentService.MimeType.JSON);
 }
 }
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
 var totalCOGS = 0;
 var batchUpdates = [];
 var lowStockAlerts = [];
 var batchIds = [];
 if (batchesSheet && productLines.length > 0) {
 for (var p = 0; p < productLines.length; p++) {
 var productName = productLines[p].name;
 var quantity = productLines[p].quantity;
 var batch = findActiveBatch(batchesSheet, productName);
 if (!batch) { Logger.log('No active batch found for: ' + productName); continue; }
 var itemCOGS = batch.costPerVial * quantity;
 totalCOGS += itemCOGS;
 batchIds.push(batch.batchId);
 if (batch.quantityRemaining < quantity) {
 lowStockAlerts.push('OVERSOLD: ' + productName + ' - Ordered ' + quantity + ', Available ' + batch.quantityRemaining);
 }
 var newQuantity = Math.max(0, batch.quantityRemaining - quantity);
 batchUpdates.push({row: batch.row, newQuantity: newQuantity, batchId: batch.batchId, product: productName, quantitySold: quantity});
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
 data.order_number || '', new Date(), data.customer_email || '', data.customer_name || '', data.phone || '',
 data.address || '', data.city || '', data.state || '', data.zip || '',
 data.items_detail || data.product_name || '', qty, data.payment_method || '',
 parseFloat(data.subtotal) || 0, data.discount_code || '', parseFloat(data.discount) || 0, shipping, total,
 totalCOGS || '', ccFees, totalCOGS > 0 ? netProfit : '', data.payment_status || 'Pending', '', '', batchIds.join(', ')
 ]);
 for (var b = 0; b < batchUpdates.length; b++) {
 var update = batchUpdates[b];
 batchesSheet.getRange(update.row, 10).setValue(update.newQuantity);
 if (update.newQuantity === 0) { batchesSheet.getRange(update.row, 13).setValue('Depleted'); }
 var currentSold = batchesSheet.getRange(update.row, 16).getValue() || 0;
 batchesSheet.getRange(update.row, 16).setValue(currentSold + update.quantitySold);
 }
 var tgMsg = '\uD83D\uDD14 New Vantix Order\n\nOrder: ' + data.order_number + '\nCustomer: ' + data.customer_name + '\nEmail: ' + data.customer_email + '\nTotal: $' + parseFloat(data.total).toFixed(2) + '\nPayment: ' + (data.payment_method || 'N/A') + '\n';
 if (totalCOGS > 0) { tgMsg += 'COGS: $' + totalCOGS.toFixed(2) + '\nNet Profit: $' + netProfit.toFixed(2) + '\n'; }
 tgMsg += '\nItems:\n' + (data.items_detail || data.product_name || 'N/A');
 if (lowStockAlerts.length > 0) { tgMsg += '\n\n' + lowStockAlerts.join('\n'); }
 sendToTelegram(tgMsg);
 var pmLower = (data.payment_method || '').toLowerCase();
 if (pmLower === 'zelle') { sendCustomerConfirmation(data); }
 SpreadsheetApp.flush();
 return ContentService.createTextOutput(JSON.stringify({status: 'success', message: 'Order processed', cogs: totalCOGS, profit: netProfit})).setMimeType(ContentService.MimeType.JSON);
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
 return {row: i + 1, batchId: batches[i][0], product: batches[i][2], costPerVial: parseFloat(batches[i][8]) || 0, quantityRemaining: quantityRemaining};
 }
 }
 }
 return null;
}

function handlePaymentCallback(data) {
 var ordersSheet = getSheet('Orders');
 if (!data.order_number) { return ContentService.createTextOutput(JSON.stringify({status: 'error', message: 'Missing order_number'})).setMimeType(ContentService.MimeType.JSON); }
 var orders = ordersSheet.getDataRange().getValues();
 for (var i = 1; i < orders.length; i++) {
 if (String(orders[i][0]).trim() === String(data.order_number).trim()) {
 var oldStatus = orders[i][20];
 ordersSheet.getRange(i + 1, 21).setValue(data.payment_status || 'Paid');
 if (data.payment_status === 'Paid' && oldStatus !== 'Paid') {
 var orderData = {order_number: orders[i][0], customer_name: orders[i][3], customer_email: orders[i][2], total: orders[i][16], payment_method: 'credit_card', items_detail: orders[i][9]};
 sendCustomerConfirmation(orderData);
 sendToTelegram('\uD83D\uDCB3 Payment Confirmed\n\nOrder: ' + orders[i][0] + '\nCustomer: ' + orders[i][3] + '\nTotal: $' + parseFloat(orders[i][16]).toFixed(2) + '\nItems: ' + orders[i][9]);
 }
 SpreadsheetApp.flush();
 return ContentService.createTextOutput(JSON.stringify({status: 'success', message: 'Payment status updated'})).setMimeType(ContentService.MimeType.JSON);
 }
 }
 return ContentService.createTextOutput(JSON.stringify({status: 'error', message: 'Order not found: ' + data.order_number})).setMimeType(ContentService.MimeType.JSON);
}

function handleNewsletter(data) {
 var newsletterSheet = getSheet('Newsletter');
 if (!data.email) { return ContentService.createTextOutput(JSON.stringify({status: 'error', message: 'Missing email'})).setMimeType(ContentService.MimeType.JSON); }
 newsletterSheet.appendRow([data.email, new Date(), data.source || 'website']);
 SpreadsheetApp.flush();
 return ContentService.createTextOutput(JSON.stringify({status: 'success', message: 'Subscribed'})).setMimeType(ContentService.MimeType.JSON);
}

function handleNotification(data) {
 var waitlistSheet = getSheet('Waitlist');
 if (!data.email) { return ContentService.createTextOutput(JSON.stringify({status: 'error', message: 'Missing email'})).setMimeType(ContentService.MimeType.JSON); }
 var productOrInterests = data.product || data.interests || 'General';
 waitlistSheet.appendRow([new Date(), data.email, data.source || 'waitlist', productOrInterests]);
 sendToTelegram('\uD83D\uDCEC Waitlist Signup\n\nEmail: ' + data.email + '\nProduct: ' + productOrInterests + '\nSource: ' + (data.source || 'Unknown'));
 SpreadsheetApp.flush();
 return ContentService.createTextOutput(JSON.stringify({status: 'success', message: 'Added to waitlist'})).setMimeType(ContentService.MimeType.JSON);
}

function sendToTelegram(message) {
 var url = 'https://api.telegram.org/bot' + TELEGRAM_BOT_TOKEN + '/sendMessage';
 try {
 UrlFetchApp.fetch(url, {method: 'post', contentType: 'application/json', payload: JSON.stringify({chat_id: TELEGRAM_CHAT_ID, text: message}), muteHttpExceptions: true});
 } catch (e) { Logger.log('Telegram error: ' + e); }
}

function sendCustomerConfirmation(data) {
 var pmLower = (data.payment_method || '').toLowerCase();
 var isZelle = (pmLower === 'zelle');
 var total = parseFloat(data.total).toFixed(2);
 var firstName = data.customer_name.split(' ')[0];
 var subtotal = parseFloat(data.subtotal || data.total).toFixed(2);
 var discount = parseFloat(data.discount || 0).toFixed(2);
 var shipping = parseFloat(data.shipping_customer || 0).toFixed(2);

 var itemsHtml = '';
 if (data.items_detail) {
 var items = data.items_detail.split('\n');
 for (var i = 0; i < items.length; i++) {
 if (!items[i]) continue;
 var match = items[i].match(/^(\d+)x\s+(.+?)\s+\(\$([0-9.]+)\)$/);
 if (match) {
 var q = match[1]; var n = match[2]; var pr = match[3];
 var lt = (parseFloat(pr) * parseInt(q)).toFixed(2);
 itemsHtml += '<table style="width:100%;border-bottom:1px solid #f0f0f0;padding:12px 0;"><tr>';
 itemsHtml += '<td style="vertical-align:top;"><div style="font-size:15px;font-weight:500;color:#0F1B2D;margin-bottom:2px;">' + n + '</div>';
 itemsHtml += '<div style="font-size:13px;color:#999;">Qty ' + q + ' x $' + pr + '</div></td>';
 itemsHtml += '<td style="text-align:right;vertical-align:top;white-space:nowrap;padding-left:16px;">';
 itemsHtml += '<div style="font-size:15px;font-weight:600;color:#0F1B2D;">$' + lt + '</div></td>';
 itemsHtml += '</tr></table>';
 }
 }
 }

 var h = '<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head><body style="margin:0;padding:0;background:#f5f5f5;font-family:Arial,Helvetica,sans-serif;">';
 h += '<div style="max-width:600px;margin:0 auto;background:#ffffff;">';
 h += '<div style="background:#0F1B2D;padding:24px;text-align:center;"><div style="font-size:20px;font-weight:600;color:#ffffff;letter-spacing:1px;">VANTIX BIO</div><div style="color:rgba(255,255,255,0.5);font-size:11px;margin-top:4px;">ORDER CONFIRMED</div></div>';
 h += '<div style="padding:32px 24px 24px;"><h1 style="font-size:22px;font-weight:600;color:#0F1B2D;margin:0 0 12px;">Hi ' + firstName + ', your order is confirmed.</h1>';
 if (isZelle) {
 h += '<p style="font-size:15px;color:#555;line-height:1.6;margin:0 0 20px;">We are waiting for your Zelle payment. Once received, your order will ship and we will send tracking.</p>';
 h += '<div style="background:#fff8e1;border-left:4px solid #f59e0b;padding:16px;margin-bottom:24px;border-radius:4px;"><div style="font-weight:600;color:#92400e;margin-bottom:8px;">Awaiting Zelle Payment</div><div style="font-size:14px;color:#78350f;line-height:1.5;">Send <strong>$' + total + '</strong> to <strong>619-587-1812</strong></div><div style="font-size:14px;color:#78350f;line-height:1.5;">Include <strong>#' + data.order_number + '</strong> in the note.</div></div>';
 } else {
 h += '<p style="font-size:15px;color:#555;line-height:1.6;margin:0 0 20px;">We have received your payment and your order is queued for fulfillment. We will send tracking as soon as it ships.</p>';
 h += '<div style="background:#f0f8f5;border-left:4px solid #7BA88F;padding:16px;margin-bottom:24px;border-radius:4px;"><div style="font-weight:600;color:#2D5F4E;margin-bottom:4px;">Payment confirmed</div><div style="font-size:14px;color:#2D5F4E;">Ships within 1-2 business days. Tracking sent to this email.</div></div>';
 }
 h += '</div>';
 h += '<div style="padding:0 24px 24px;"><div style="font-size:11px;color:#999;text-transform:uppercase;letter-spacing:1px;margin-bottom:8px;">ORDER NUMBER</div><div style="font-size:18px;font-weight:600;color:#0F1B2D;margin-bottom:24px;">#' + data.order_number + '</div>';
 h += itemsHtml;
 h += '<div style="padding:16px 0 0;border-top:2px solid #f0f0f0;margin-top:16px;">';
 h += '<table style="width:100%;padding:8px 0;"><tr><td style="font-size:14px;color:#555;">Subtotal</td><td style="text-align:right;font-size:14px;color:#555;">$' + subtotal + '</td></tr></table>';
 if (parseFloat(discount) > 0) { h += '<table style="width:100%;padding:8px 0;"><tr><td style="font-size:14px;color:#7BA88F;">Discount</td><td style="text-align:right;font-size:14px;color:#7BA88F;">-$' + discount + '</td></tr></table>'; }
 h += '<table style="width:100%;padding:8px 0;"><tr><td style="font-size:14px;color:#555;">Shipping</td><td style="text-align:right;font-size:14px;color:#555;">' + (parseFloat(shipping) > 0 ? '$' + shipping : 'FREE') + '</td></tr></table>';
 h += '<table style="width:100%;padding:16px 0 0;border-top:1px solid #e0e0e0;margin-top:8px;"><tr><td style="font-size:20px;font-weight:600;color:#0F1B2D;">Total</td><td style="text-align:right;font-size:20px;font-weight:600;color:#0F1B2D;">$' + total + '</td></tr></table>';
 h += '</div>';
 h += '<div style="margin-top:32px;padding-top:24px;border-top:1px solid #f0f0f0;font-size:14px;color:#718096;line-height:1.6;">Questions about your order? Just reply to this email or visit <a href="https://vantixbio.com" style="color:#3973B0;text-decoration:none;">vantixbio.com</a></div></div>';
 h += '<div style="background:#f8f8f8;padding:24px;text-align:center;font-size:12px;color:#999;line-height:1.6;"><div style="margin-bottom:8px;">For research use only. Not for human or veterinary use.</div><div style="font-weight:600;color:#666;">Vantix Bio</div></div>';
 h += '</div></body></html>';

 var plain = 'Hi ' + firstName + ',\n\nYour order is confirmed.\n\nOrder Number: #' + data.order_number + '\nTotal: $' + total + '\n\n';
 if (data.items_detail) { plain += 'Items:\n' + data.items_detail + '\n\n'; }
 if (isZelle) { plain += 'PAYMENT: Send $' + total + ' via Zelle to 619-587-1812\nInclude #' + data.order_number + ' in the note.\n\n'; }
 else { plain += 'Payment received. Ships within 1-2 business days.\n\n'; }
 plain += 'Questions? Reply to this email.\n\nVantix Bio\nvantixbio.com';

 try {
 MailApp.sendEmail({to: data.customer_email, bcc: 'vantixbio@gmail.com', subject: 'Order Confirmed #' + data.order_number + ' - Vantix Bio', htmlBody: h, body: plain, name: 'Vantix Bio'});
 } catch (e) { Logger.log('Email error: ' + e); }
}
