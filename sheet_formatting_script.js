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
