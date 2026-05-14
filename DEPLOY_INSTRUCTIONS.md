# Vantix Checkout Deployment Instructions

## Problem
Orders aren't logging correctly to Google Sheets. Missing order numbers, discount codes, referral tracking, and Products tab data.

## Solution
Update both the Cloudflare Worker AND Google Apps Script with the fixed versions.

---

## Part 1: Update Google Apps Script

1. **Open your sheet:**
   https://docs.google.com/spreadsheets/d/1n1YnFDUHyufWPXLAFOxz6RNkPGLr6gajG8JVc00cxTs/edit

2. **Go to Apps Script:**
   Extensions → Apps Script

3. **Replace ALL code:**
   - Select all (Cmd+A)
   - Delete
   - Open: `/Users/frabrizio/.openclaw/workspace/vantix/vantix_apps_script_WORKING.js`
   - Copy everything
   - Paste into Apps Script editor

4. **Deploy:**
   - Click "Deploy" button (top right)
   - Click "New deployment"
   - Description: "Fixed order logging with all fields"
   - Click "Deploy"

---

## Part 2: Update Cloudflare Worker

1. **Go to Cloudflare:**
   https://dash.cloudflare.com

2. **Find your worker:**
   Workers & Pages → vantix-checkout.prcpeptides

3. **Edit:**
   - Click "Edit code"
   - Select all (Cmd+A)
   - Delete
   - Open: `/Users/frabrizio/.openclaw/workspace/vantix/vantix_worker_READY_TO_DEPLOY.js`
   - Copy everything
   - Paste into worker editor

4. **Save & Deploy:**
   - Click "Save and Deploy"

---

## Part 3: Test

1. Go to: https://vantixbio.com/test-checkout-flow.html
2. Click "Simulate Add to Cart"
3. Go to: https://vantixbio.com/checkout.html
4. Fill out form
5. Select Zelle
6. Submit order

**Check:**
- ✅ Order appears in Orders sheet with VX###### order number
- ✅ Discount code column populated (if you used a promo)
- ✅ Products sheet has individual line items
- ✅ Telegram notification received
- ✅ Customer gets confirmation email

---

## What Was Fixed

**Orders Sheet:**
- Added order_number column (was missing)
- Added discount_code column
- Added referral_source column
- Fixed column order to match sheet structure

**Products Sheet:**
- Now logs individual line items from cart
- Each product gets its own row with order number

**Worker:**
- Formats items array as JSON string for Products sheet
- Formats items_detail as readable string for Orders sheet
- Sends both formats to Apps Script
