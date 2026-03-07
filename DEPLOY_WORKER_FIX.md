# DEPLOY CLOUDFLARE WORKER FIX

**Status:** 🔴 CRITICAL — Worker CORS blocking all Vantix orders  
**Impact:** No Telegram notifications, no Google Sheet logging, no emails  
**Time to fix:** <5 minutes

---

## What Broke

Cloudflare Worker only allowed `prcpeptides.com` in CORS whitelist. Vantix orders from `vantixbio.com` were blocked → silent failure → no notifications, no emails, no Sheet logging.

---

## What I Fixed

### Frontend (✅ Already Deployed to GitHub Pages)
- Added error logging to `notifyOrder()` (Worker calls)
- Added error logging to `sendOrderConfirmationEmails()` (FormSubmit.co)
- Console now shows `[WORKER]` and `[EMAIL]` logs for debugging
- Failed requests log to localStorage

### Backend (⚠️ NEEDS DEPLOYMENT)
- Updated `cloudflare-worker/worker.js` CORS whitelist
- Added `vantixbio.com` origins

---

## Deployment Steps

### 1. Deploy Updated Worker

```bash
cd /Users/frabrizio/.openclaw/workspace/cloudflare-worker
wrangler deploy
```

**Expected output:**
```
Total Upload: XX KiB / gzip: XX KiB
Uploaded prc-checkout (X.XX sec)
Published prc-checkout (X.XX sec)
  https://prc-checkout.prcpeptides.workers.dev
```

If you get an error about missing `wrangler.toml`, create it:

```bash
cat > wrangler.toml << 'EOF'
name = "prc-checkout"
main = "worker.js"
compatibility_date = "2024-01-01"

[vars]
COINBASE_API_KEY = "eebc936a-18a8-4286-aa5d-dca4ba6a9464"
EOF
```

Then run `wrangler deploy` again.

---

### 2. Test Full Order Flow

**Go to:** https://vantixbio.com/shop.html

1. Add any product to cart
2. Open browser Console (F12 → Console tab)
3. Complete checkout with test info:
   - Name: Test User
   - Email: your real email (to verify customer confirmation)
   - Address: 123 Test St, Santa Cruz, CA 95060
   - Payment: Zelle (simpler for testing)
4. Watch Console for logs:
   ```
   [WORKER] Notification + Sheet logging: SUCCESS
   [EMAIL] Customer confirmation: SUCCESS
   [EMAIL] Admin notification: SUCCESS
   ```

---

### 3. Verify All Systems Working

Check these 4 places:

#### ✅ Browser Console
- Should see 3 SUCCESS logs (Worker + 2 emails)
- Should see NO errors or CORS blocks

#### ✅ Telegram
- You should receive instant order notification
- Format: "🛒 NEW ORDER: VX-XXXXX" with full details

#### ✅ Google Sheet
- Open: https://docs.google.com/spreadsheets
- Find: "PRC Orders" spreadsheet
- Check: New order row in "Orders" tab

#### ✅ Email Inboxes
- **Your test email:** "Order Confirmation - VX-XXXXX"
- **support@vantixbio.com:** "NEW ORDER: VX-XXXXX"

---

## If Something Still Fails

### Check Browser Network Tab (F12 → Network)

**Filter:** `prc-checkout`

**Before fix (BROKEN):**
```
POST /order
Status: (failed) CORS error
```

**After fix (WORKING):**
```
POST /order
Status: 200
Response: {"success":true}
```

### Check localStorage Failures

In Console, run:
```javascript
localStorage.getItem('vx_worker_fail')
localStorage.getItem('vx_email_fail_customer')
localStorage.getItem('vx_email_fail_admin')
```

If any return data → that system failed.

---

## Still Not Working?

### Issue: Worker deploy fails with "not authenticated"

**Fix:**
```bash
wrangler login
# Opens browser for Cloudflare auth
```

### Issue: FormSubmit.co emails not arriving

**Cause:** support@vantixbio.com needs verification

**Fix:**
1. Check support@vantixbio.com inbox for FormSubmit.co verification email
2. Click verification link
3. Test again

### Issue: Google Sheet not updating

**Possible causes:**
- Apps Script webhook stopped responding
- Script needs redeployment
- Sheet permissions changed

**Quick test:**
```bash
curl -X POST https://script.google.com/macros/s/AKfycbzw7r3qHQR3rPiYlCEWl-eFmzlIUKdYLNOPzbKM--pD6k6WZNVAEct95d8ks2NyXZLp_g/exec \
  -H "Content-Type: application/json" \
  -d '{"order_number":"TEST-12345","customer_name":"Test","customer_email":"test@test.com","items":[{"name":"Test Product","quantity":1,"price":50}],"subtotal":50,"total":50}'
```

If this fails → Apps Script needs attention.

---

## After Everything Works

### Clean Up Test Orders

1. **Google Sheet:** Delete test order rows
2. **Telegram:** Delete test notifications
3. **localStorage:** Clear test failures:
   ```javascript
   localStorage.removeItem('vx_worker_fail');
   localStorage.removeItem('vx_email_fail_customer');
   localStorage.removeItem('vx_email_fail_admin');
   ```

---

## Files Changed

### Deployed to GitHub Pages (automatic)
- `vantix/checkout.html` — error logging added
- `vantix/ORDER_SYSTEM_AUDIT.md` — full root cause analysis

### Needs Manual Deploy
- `cloudflare-worker/worker.js` — CORS fix

---

## Summary

**Root cause:** CORS blocking  
**Fix:** Add vantixbio.com to Worker whitelist  
**Deploy:** `wrangler deploy` (5 minutes)  
**Test:** Place order, check Console + Telegram + Sheet + Email  

Everything should work after Worker deployment. The frontend fixes are already live.

---

**Commit:** `5aa6b45` — "Fix order notification regression: CORS + error logging"
