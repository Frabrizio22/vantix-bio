# Vantix Cloudflare Worker - Deployment Guide

## Step 1: Log into Cloudflare

1. Go to: https://dash.cloudflare.com
2. Log in with your account
3. Go to **Workers & Pages** (left sidebar)

## Step 2: Create New Worker

1. Click **Create Application**
2. Click **Create Worker**
3. Name it: `vantix-checkout`
4. Click **Deploy**
5. Click **Edit Code**

## Step 3: Paste Worker Code

1. Delete ALL the default code in the editor
2. Open this file: `/Users/frabrizio/.openclaw/workspace/vantix/vantix_worker_READY_TO_DEPLOY.js`
3. Copy ALL the code (Cmd+A, Cmd+C)
4. Paste into Cloudflare editor (Cmd+V)
5. Click **Save and Deploy**

## Step 4: Set Environment Variables

1. Go back to Worker overview page
2. Click **Settings** tab
3. Scroll to **Environment Variables**
4. Click **Add variable** for each of these:

### Required Variables:

**GOOGLE_SHEET_WEBHOOK_URL**
```
https://script.google.com/macros/s/AKfycbxGd-TzTIFXou9Cp7iOpq0qHKLDcTZsDqx9sjMuiNYaeD_kGTGcF7HYK57xfPZ_aM_A4w/exec
```

**BANKFUL_USERNAME**
```
(Your Bankful username from PRC)
```

**BANKFUL_PASSWORD**
```
(Your Bankful password from PRC)
```

**BANKFUL_GATEWAY**
```
70777
```

**TELEGRAM_BOT_TOKEN**
```
8478171743:AAHc9H_QoXNsbaelWNwTrjHbWI_ZmDQY6L0
```

**TELEGRAM_CHAT_ID**
```
513307658
```

5. Click **Save** after adding all variables

## Step 5: Get Worker URL

Your worker will be at:
```
https://vantix-checkout.vantixbio.workers.dev
```

Or a similar URL provided by Cloudflare.

## Step 6: Update Website

In your vantixbio.com checkout code, update the endpoint to:
```javascript
const CHECKOUT_API = 'https://vantix-checkout.vantixbio.workers.dev';
```

## Step 7: Test

1. Place a test Zelle order on vantixbio.com
2. Check:
   - ✅ Order appears in Vantix Google Sheet
   - ✅ You get Telegram notification
   - ✅ Customer gets confirmation email

---

## Troubleshooting

**Worker fails to deploy:**
- Make sure you deleted ALL default code before pasting
- Check for syntax errors in the code editor

**Orders not appearing in sheet:**
- Verify GOOGLE_SHEET_WEBHOOK_URL is correct
- Check Worker logs (Workers → vantix-checkout → Logs)

**No Telegram notifications:**
- Verify TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID are correct
- Test by sending a message to the bot first

**Credit card payments fail:**
- Verify BANKFUL credentials are correct
- Check that Gateway 70777 is active

---

**After successful test:**
✅ Your Vantix checkout is LIVE!
