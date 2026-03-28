# Launch Email Capture - Google Apps Script Update

## What This Does
Captures email addresses from "Notify at Launch" buttons → saves to Google Sheet + sends you Telegram notifications.

---

## Instructions

### Step 1: Open Your Google Apps Script
1. Go to: https://script.google.com
2. Open your existing project: **"PRC Order System"** (the one handling orders)
3. You should see the `doPost(e)` function

### Step 2: Add Launch Email Sheet Tab
1. Open your **"PRC Orders"** Google Sheet
2. Add a new sheet tab called: **"Launch Emails"**
3. In row 1, add headers:
   - A1: `Timestamp`
   - B1: `Email`
   - C1: `Product`
   - D1: `Status`

### Step 3: Update the Google Apps Script Code

Find the `doPost(e)` function and add the launch_notify handler.

**Add this code INSIDE the `doPost(e)` function, after the order handling:**

```javascript
  // Handle launch email notifications
  if (data.action === 'launch_notify') {
    try {
      var ss = SpreadsheetApp.openById('YOUR_SHEET_ID_HERE'); // Same sheet as orders
      var launchSheet = ss.getSheetByName('Launch Emails');
      
      // Create sheet if it doesn't exist
      if (!launchSheet) {
        launchSheet = ss.insertSheet('Launch Emails');
        launchSheet.appendRow(['Timestamp', 'Email', 'Product', 'Status']);
      }
      
      // Add email to sheet
      launchSheet.appendRow([
        data.timestamp,
        data.email,
        data.product,
        'Pending'
      ]);
      
      // Send Telegram notification
      var telegramMessage = '🔔 *LAUNCH EMAIL CAPTURED*\\n\\n' +
                           '📧 Email: `' + data.email + '`\\n' +
                           '🧬 Product: ' + data.product + '\\n' +
                           '📅 Launch: April 13, 2026';
      
      var telegramPayload = {
        chat_id: 'YOUR_TELEGRAM_CHAT_ID',
        text: telegramMessage,
        parse_mode: 'Markdown'
      };
      
      UrlFetchApp.fetch('https://api.telegram.org/botYOUR_BOT_TOKEN/sendMessage', {
        method: 'post',
        contentType: 'application/json',
        payload: JSON.stringify(telegramPayload)
      });
      
      return ContentService.createTextOutput(JSON.stringify({success: true}));
      
    } catch (error) {
      Logger.log('Launch notify error: ' + error.toString());
      return ContentService.createTextOutput(JSON.stringify({success: false, error: error.toString()}));
    }
  }
```

### Step 4: Find Your IDs

**Google Sheet ID:**
- Open your "PRC Orders" sheet
- Look at the URL: `https://docs.google.com/spreadsheets/d/SHEET_ID_HERE/edit`
- Copy the SHEET_ID_HERE part
- Replace `YOUR_SHEET_ID_HERE` in the code

**Telegram Bot Token & Chat ID:**
- These are the SAME values you used for order notifications
- Check your existing script — look for the Telegram section
- Copy the `bot token` and `chat_id` values
- Replace in the new code

### Step 5: Save & Deploy
1. Click **Save** (disk icon)
2. Click **Deploy** → **Manage deployments**
3. Click **Edit** (pencil icon)
4. Click **Deploy**

---

## Testing

1. Go to vantixbio.com/shop.html
2. Click any "Notify at Launch" button
3. Enter a test email
4. Check:
   - ✅ Google Sheet "Launch Emails" tab has the entry
   - ✅ You got a Telegram notification

---

## What You'll See

**Google Sheet Format:**
| Timestamp | Email | Product | Status |
|-----------|-------|---------|--------|
| 2026-03-27T18:20:00Z | test@example.com | BPC-157 10mg | Pending |

**Telegram Message:**
```
🔔 LAUNCH EMAIL CAPTURED

📧 Email: test@example.com
🧬 Product: BPC-157 10mg
📅 Launch: April 13, 2026
```

---

## Need Help?

If you get stuck, send me a screenshot of your Google Apps Script and I'll help debug.
