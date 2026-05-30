# Deploy Vantix Production Apps Script

## What This Script Does

**Automatic Order Processing:**
1. ✅ Receives order from Cloudflare Worker
2. ✅ Validates inventory availability
3. ✅ Finds active batch for each product
4. ✅ Calculates COGS from batch cost per vial
5. ✅ Deducts quantity from batch inventory
6. ✅ Marks batches as "Depleted" when qty = 0
7. ✅ Calculates CC fees (5% for credit cards, 0% for Zelle)
8. ✅ Calculates Net Profit = Total - COGS - Shipping - Fees
9. ✅ Writes complete order with profit to Orders sheet
10. ✅ Sends Telegram notification with profit and low stock alerts
11. ✅ Sends customer confirmation email
12. ✅ Alerts when batch drops below 10 vials

## Deployment Steps

1. **Open Google Apps Script**
   - Go to: https://docs.google.com/spreadsheets/d/1n1YnFDUHyufWPXLAFOxz6RNkPGLr6gajG8JVc00cxTs/edit
   - Click Extensions → Apps Script

2. **Replace Code**
   - Delete ALL existing code
   - Copy entire contents of `vantix_apps_script_PRODUCTION.js`
   - Paste into Code.gs

3. **Save**
   - Click 💾 Save
   - Name it: "Vantix Production Handler"

4. **Deploy as Web App**
   - Click Deploy → New deployment
   - Type: Web app
   - Execute as: Me
   - Who has access: Anyone
   - Click Deploy
   - Copy the web app URL

5. **Update Cloudflare Worker**
   - The webhook URL should still be: https://script.google.com/macros/s/AKfycbxGd-TzTIFXou9Cp7iOpq0qHKLDcTZsDqx9sjMuiNYaeD_kGTGcF7HYK57xfPZ_aM_A4w/exec
   - If it changed, update the Vantix Cloudflare Worker env var: GOOGLE_SHEET_WEBHOOK_URL

6. **Test Order Flow**
   - Place a test order
   - Verify:
     - ✅ Order appears in Orders sheet with COGS and Profit filled
     - ✅ Batch inventory decreased
     - ✅ Telegram notification shows profit
     - ✅ Customer email sent

## Before Going Live

### 1. Add Missing Batches
You need to create batches for products not in the sheet:
- Tirzepatide (current batch depleted, need new one)
- MOTS-c 10mg (missing entirely)
- NAD+ 1000mg (missing entirely)
- Ipamorelin 5mg (missing)
- Tesamorelin 10mg (missing)
- AOD-9604 10mg (missing)

**How to add a batch:**
1. Go to Batches tab
2. Add new row with:
   - Batch ID (e.g., "MOTS-B1")
   - Date Received
   - Product (exact name from shop.html)
   - Supplier (e.g., "Dora")
   - Box Cost (total cost for box of 10)
   - Vials per Box (usually 10)
   - Cost per Vial (box cost ÷ 10)
   - Testing Cost (Janoshik cost)
   - Total Cost per Vial (cost per vial + testing/10)
   - Quantity Remaining (how many vials you have)
   - COA Link
   - Status ("Active")

### 2. Update Current Inventory
Update Column J (Quantity Remaining) for existing batches:
- RETA-B2 (row 4): **95**
- TIRZ-B1 (row 2): Create new batch OR mark active and set **78**
- GHK-B1 (row 8): **49**
- Add MOTS-B1: **49**
- Add NAD-B1: **48**

### 3. Product Name Matching
The script matches product names flexibly. Make sure Batches sheet Column C matches shop.html product names:
- "Retatrutide 20mg"
- "Tirzepatide 30mg"
- "GHK-Cu 100mg"
- "MOTS-c 10mg"
- "NAD+ 1000mg"

## Key Features

**Smart Inventory:**
- Finds first active batch with stock
- Handles multiple batches per product (uses oldest first)
- Won't accept order if no stock

**Low Stock Alerts:**
- ⚠️ Warning when batch < 10 vials
- 🔴 Alert when batch depleted

**Accurate Profit:**
- Uses actual batch COGS
- Includes testing cost per vial
- 5% CC fees only for credit cards
- Zero fees for Zelle/Bitcoin

**Error Handling:**
- Rejects duplicates
- Validates inventory before accepting
- Returns error if insufficient stock

## Testing Checklist

Before launch, test:
- [ ] Order with 1 item (Reta)
- [ ] Order with multiple items (Reta + GHK)
- [ ] Order that would deplete a batch
- [ ] Order with insufficient stock (should reject)
- [ ] Zelle order (0% fees)
- [ ] Credit card order (5% fees)
- [ ] Verify Telegram shows profit
- [ ] Verify Orders sheet has COGS + Profit
- [ ] Verify Batch inventory decreased
- [ ] Verify Status changes to "Depleted" at 0

## Rollback

If issues, revert to old script:
```
vantix_apps_script_COMPLETE.js
```

But that version does NOT track inventory or profit.
