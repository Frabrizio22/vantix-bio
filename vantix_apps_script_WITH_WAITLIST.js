// Vantix Bio Apps Script - Order Processing + Waitlist Handler
// Deploy as Web App: Execute as Me, Anyone can access
// Webhook URL: https://script.google.com/macros/s/AKfycbxGd-TzTIFXou9Cp7iOpq0qHKLDcTZsDqx9sjMuiNYaeD_kGTGcF7HYK57xfPZ_aM_A4w/exec

const SHEET_ID = '1n1YnFDUHyufWPXLAFOxz6RNkPGLr6gajG8JVc00cxTs'; // Vantix Google Sheet
const TELEGRAM_BOT_TOKEN = '8478171743:AAHc9H_QoXNsbaelWNwTrjHbWI_ZmDQY6L0';
const TELEGRAM_CHAT_ID = '513307658'; // Frabrizio

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    
    // ═══════════════════════════════════════════════════════════
    // WAITLIST HANDLER (Homepage + Product Pages)
    // ═══════════════════════════════════════════════════════════
    if (data.source && data.source.includes('waitlist')) {
      const ss = SpreadsheetApp.openById(SHEET_ID);
      let sheet = ss.getSheetByName('Waitlist');
      
      // Create Waitlist sheet if doesn't exist
      if (!sheet) {
        sheet = ss.insertSheet('Waitlist');
        sheet.appendRow(['Timestamp', 'Email', 'Source', 'Product', 'IP', 'User Agent']);
        sheet.getRange('A1:F1').setFontWeight('bold').setBackground('#0B2545').setFontColor('#FFFFFF');
      }
      
      // Extract product from source (e.g., "product_waitlist_tirz" -> "Tirzepatide")
      let product = 'General';
      if (data.source !== 'homepage_waitlist') {
        const productCode = data.source.replace('product_waitlist_', '');
        const productMap = {
          'tirz': 'Tirzepatide 30mg',
          'reta': 'Retatrutide 20mg',
          'sema': 'Semaglutide 10mg',
          'bpc': 'BPC-157 10mg',
          'tb500': 'TB-500 10mg',
          'ghk': 'GHK-Cu 100mg',
          'cjc': 'CJC-1295 10mg',
          'ipa': 'Ipamorelin 5mg',
          'mots': 'MOTS-c 10mg',
          'nad': 'NAD+ 1000mg',
          'tesa': 'Tesamorelin 10mg',
          'aod': 'AOD-9604 10mg'
        };
        product = productMap[productCode] || productCode.toUpperCase();
      }
      
      // Log to sheet
      sheet.appendRow([
        new Date(),
        data.email,
        data.source,
        product,
        data.ip || '',
        data.userAgent || ''
      ]);
      
      // Telegram notification
      const emoji = data.source === 'homepage_waitlist' ? '🔔' : '🧬';
      const telegramMsg = `${emoji} NEW WAITLIST SIGNUP\n\n` +
                         `Email: ${data.email}\n` +
                         `Product: ${product}\n` +
                         `Source: ${data.source}\n` +
                         `Time: ${new Date().toLocaleString('en-US', {timeZone: 'America/Los_Angeles'})} PST`;
      
      UrlFetchApp.fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
        method: 'post',
        contentType: 'application/json',
        payload: JSON.stringify({
          chat_id: TELEGRAM_CHAT_ID,
          text: telegramMsg
        })
      });
      
      return ContentService.createTextOutput(JSON.stringify({
        success: true,
        message: 'Added to waitlist'
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    // ═══════════════════════════════════════════════════════════
    // ORDER HANDLER (Existing Vantix checkout flow)
    // ═══════════════════════════════════════════════════════════
    if (data.orderId) {
      const ss = SpreadsheetApp.openById(SHEET_ID);
      let sheet = ss.getSheetByName('Orders');
      
      if (!sheet) {
        sheet = ss.insertSheet('Orders');
        sheet.appendRow(['Timestamp', 'Order ID', 'Email', 'Total', 'Payment Method', 'Status', 'Items', 'Address']);
        sheet.getRange('A1:H1').setFontWeight('bold').setBackground('#0B2545').setFontColor('#FFFFFF');
      }
      
      sheet.appendRow([
        new Date(),
        data.orderId,
        data.email,
        data.total,
        data.paymentMethod || 'Unknown',
        data.status || 'Pending',
        JSON.stringify(data.items),
        data.shippingAddress || ''
      ]);
      
      // Telegram notification for orders
      const orderMsg = `💳 NEW ORDER\n\n` +
                      `Order ID: ${data.orderId}\n` +
                      `Email: ${data.email}\n` +
                      `Total: ${data.total}\n` +
                      `Payment: ${data.paymentMethod || 'Unknown'}\n` +
                      `Items: ${data.items?.length || 0}`;
      
      UrlFetchApp.fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
        method: 'post',
        contentType: 'application/json',
        payload: JSON.stringify({
          chat_id: TELEGRAM_CHAT_ID,
          text: orderMsg
        })
      });
      
      return ContentService.createTextOutput(JSON.stringify({
        success: true,
        message: 'Order recorded'
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    // Unknown request type
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: 'Invalid request'
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    Logger.log('Error: ' + error.toString());
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({
    status: 'Vantix Bio webhook active',
    timestamp: new Date().toISOString()
  })).setMimeType(ContentService.MimeType.JSON);
}
