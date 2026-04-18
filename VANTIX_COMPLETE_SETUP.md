# VANTIX BIO - COMPLETE SYSTEM SETUP GUIDE

**Everything you need to run a $20k/month peptide business.**

This guide walks through deploying all infrastructure in ~30 minutes.

---

## PART 1: GOOGLE SHEET SETUP (5 minutes)

### Step 1: Create New Sheet

1. Go to: https://sheets.google.com
2. Make sure you're logged into **vantixbio@gmail.com**
3. Click **+ Blank spreadsheet**
4. Rename to: **Vantix Bio - Orders & Analytics**

### Step 2: Create Tabs

Create 4 tabs (bottom left, click **+**):

1. **Orders** (rename "Sheet1")
2. **Products** (click + to add)
3. **Newsletter** (click + to add)
4. **Notifications** (click + to add)

### Step 3: Set Up Headers

#### ORDERS TAB (Tab 1)
Row 1 headers (columns A-M):
```
Order Number | Date | Customer Name | Email | Address | City | State | Zip | Phone | Items Detail | Subtotal | Discount | Shipping | Total | Payment Method | Payment Status | Tracking | Notes
```

#### PRODUCTS TAB (Tab 2)
Row 1 headers (columns A-G):
```
Order Number | Date | Product Name | SKU | Quantity | Unit Price | Total Price
```

#### NEWSLETTER TAB (Tab 3)
Row 1 headers (columns A-C):
```
Email | Date Subscribed | Source
```

#### NOTIFICATIONS TAB (Tab 4)
Row 1 headers (columns A-D):
```
Email | Product | Date Subscribed | Notified?
```

### Step 4: Add Formulas (Orders Tab Only)

**Cell A2** (auto-increment order numbers):
```
=IF(B2="","",IF(A1="Order Number",1,A1+1))
```

**Drag this down to row 1000** (so new orders auto-number)

### Step 5: Copy Sheet URL

Copy the full URL from your browser. Looks like:
```
https://docs.google.com/spreadsheets/d/[LONG_ID]/edit
```

You'll need this ID for Apps Script deployment.

---

## PART 2: APPS SCRIPT DEPLOYMENT (10 minutes)

### Step 1: Open Apps Script Editor

1. In your Google Sheet, click **Extensions** → **Apps Script**
2. Delete any default code in the editor
3. You'll paste the complete script next

### Step 2: Get Complete Script

The complete Apps Script is in: `vantix_apps_script_COMPLETE.js`

**Paste the entire file** into the Apps Script editor.

### Step 3: Set Environment Variables

At the top of the script, update these values:

```javascript
// Telegram Configuration
const TELEGRAM_BOT_TOKEN = '8478171743:AAHc9H_QoXNsbaelWNwTrjHbWI_ZmDQY6L0';
const TELEGRAM_CHAT_ID = '513307658'; // Your DM

// Email Configuration  
const FROM_EMAIL = 'vantixbio@gmail.com';
const COMPANY_NAME = 'Vantix Bio';
```

### Step 4: Deploy as Web App

1. Click **Deploy** → **New deployment**
2. Click gear icon ⚙️ → Select **Web app**
3. Description: "Vantix Order Processing & Analytics API"
4. Execute as: **Me**
5. Who has access: **Anyone**
6. Click **Deploy**
7. **Copy the Web App URL** (looks like: `https://script.google.com/macros/s/[ID]/exec`)

### Step 5: Save Deployment URL

Save this URL — you'll need it for:
- Cloudflare Worker setup
- Analytics dashboard

---

## PART 3: CLOUDFLARE WORKER DEPLOYMENT (10 minutes)

### Step 1: Create New Worker

1. Log into Cloudflare dashboard
2. Go to **Workers & Pages**
3. Click **Create application**
4. Click **Create Worker**
5. Name: `vantix-checkout`
6. Click **Deploy**

### Step 2: Edit Worker Code

1. Click **Edit code**
2. Delete default code
3. Paste code from: `vantix_worker_COMPLETE.js`

### Step 3: Set Environment Variables

1. Click **Settings** tab
2. Click **Variables**
3. Add these variables:

```
TELEGRAM_BOT_TOKEN = 8478171743:AAHc9H_QoXNsbaelWNwTrjHbWI_ZmDQY6L0
TELEGRAM_CHAT_ID = 513307658
GOOGLE_SHEET_WEBHOOK_URL = [YOUR APPS SCRIPT URL FROM STEP 2]
BANKFUL_USERNAME = [Your Bankful username]
BANKFUL_PASSWORD = [Your Bankful password]
```

4. Click **Save**

### Step 4: Deploy Worker

1. Click **Deploy**
2. Copy the Worker URL (looks like: `https://vantix-checkout.vantixbio.workers.dev`)

### Step 5: Update checkout.html

In `/vantix/checkout.html`, update the Worker URL (line ~1450):

```javascript
const WORKER_URL = 'https://vantix-checkout.vantixbio.workers.dev';
```

Commit and push to GitHub.

---

## PART 4: ANALYTICS DASHBOARD DEPLOYMENT (5 minutes)

### Step 1: Create Dashboard API Script

1. Back in Google Sheets, click **Extensions** → **Apps Script**
2. Click **+** next to Files
3. Name new file: `dashboard_api`
4. Paste code from: `vantix_dashboard_api_COMPLETE.js`
5. Click **Deploy** → **New deployment**
6. Type: **Web app**
7. Execute as: **Me**
8. Who has access: **Anyone**
9. Copy the deployment URL

### Step 2: Deploy Dashboard HTML

Dashboard is in: `vantix_dashboard_COMPLETE.html`

1. Update line 450 with your dashboard API URL:
```javascript
const API_URL = '[YOUR DASHBOARD API URL]';
```

2. Upload to GitHub Pages or host separately
3. Access at: `vantixbio.com/dashboard.html`

---

## PART 5: EXPENSE TRACKING SYSTEM (OPTIONAL)

See: `EXPENSE_TRACKING_SETUP.md` for complete guide.

Creates:
- Per-order profit tracking
- COGS allocation
- Testing cost amortization  
- Tax-ready reports

---

## PART 6: VERIFICATION & TESTING

### Test Order Flow

1. Go to vantixbio.com/checkout.html
2. Add a product to cart
3. Fill in customer info (use your email)
4. Select **Zelle** payment
5. Enter code: **FOUNDER**
6. Place order

**Verify:**
- ✅ Telegram notification received
- ✅ Order appears in Sheet (Orders tab)
- ✅ Products logged (Products tab)
- ✅ Confirmation email received
- ✅ Dashboard shows the order

### Test Analytics

1. Open dashboard.html
2. Should see:
   - Total revenue
   - Order count
   - Top products
   - Payment breakdown

---

## DEPLOYMENT COMPLETE ✅

You now have:
- ✅ Order processing system
- ✅ Payment tracking (Bankful + Zelle)
- ✅ Customer notifications
- ✅ Real-time analytics
- ✅ Newsletter/waitlist management
- ✅ Telegram alerts

**Optional Add-ons:**
- Expense tracking system
- Inventory management
- Financial reporting
- Combined PRC + Vantix view

---

## SUPPORT FILES

All code files are in `/workspace/vantix/`:
- `vantix_apps_script_COMPLETE.js`
- `vantix_worker_COMPLETE.js`
- `vantix_dashboard_api_COMPLETE.js`
- `vantix_dashboard_COMPLETE.html`
- `EXPENSE_TRACKING_SETUP.md`
- `FINANCIAL_REPORTING_SETUP.md`

**Estimated total deployment time: 30 minutes**
