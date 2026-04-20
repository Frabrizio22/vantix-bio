// ============================================
// VANTIX BIO - SIMPLIFIED FOR DEBUGGING
// ============================================

const TELEGRAM_BOT_TOKEN = '8478171743:AAHc9H_QoXNsbaelWNwTrjHbWI_ZmDQY6L0';
const TELEGRAM_CHAT_ID = '513307658';

function getSheet(tabName) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  return ss.getSheetByName(tabName);
}

function doPost(e) {
  Logger.log('doPost called');
  
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
    
    Logger.log('Action: ' + data.action);
    
    if (data.action === 'notify') {
      return handleNotification(data);
    }
    
    return ContentService.createTextOutput(JSON.stringify({
      status: 'error',
      message: 'Unknown action'
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    Logger.log('doPost error: ' + error);
    return ContentService.createTextOutput(JSON.stringify({
      status: 'error',
      message: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function handleNotification(data) {
  Logger.log('handleNotification START');
  Logger.log('Email: ' + data.email);
  Logger.log('Product: ' + data.product);
  
  const notificationsSheet = getSheet('Notifications');
  
  if (!data.email || !data.product) {
    Logger.log('Missing email or product');
    return ContentService.createTextOutput(JSON.stringify({
      status: 'error',
      message: 'Missing email or product'
    })).setMimeType(ContentService.MimeType.JSON);
  }
  
  // Write to sheet
  Logger.log('Writing to sheet...');
  notificationsSheet.appendRow([
    data.email,
    data.product,
    new Date(),
    'No'
  ]);
  Logger.log('Sheet write complete');
  
  // Send Telegram - NO TRY/CATCH
  Logger.log('Preparing Telegram message...');
  
  const message = '📬 *New Waitlist Signup*\n\nEmail: ' + data.email + '\nProduct: ' + data.product + '\nSource: ' + (data.source || 'Unknown') + '\nTime: ' + new Date().toLocaleString('en-US', { timeZone: 'America/Los_Angeles' });
  
  Logger.log('Message text: ' + message);
  
  const url = 'https://api.telegram.org/bot' + TELEGRAM_BOT_TOKEN + '/sendMessage';
  
  Logger.log('Telegram URL: ' + url);
  
  const payload = {
    chat_id: TELEGRAM_CHAT_ID,
    text: message
  };
  
  Logger.log('Payload: ' + JSON.stringify(payload));
  
  Logger.log('Calling UrlFetchApp.fetch...');
  
  const response = UrlFetchApp.fetch(url, {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify(payload)
  });
  
  Logger.log('Telegram response code: ' + response.getResponseCode());
  Logger.log('Telegram response: ' + response.getContentText());
  
  return ContentService.createTextOutput(JSON.stringify({
    status: 'success',
    message: 'Added to waitlist'
  })).setMimeType(ContentService.MimeType.JSON);
}
