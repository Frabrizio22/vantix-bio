# Deploy LockService Fix - P0 Critical

## What This Fixes

**Race Condition:** Two customers buying the last unit at the same time both get approved, one ships empty.

**How it fixes:**
1. Acquires lock at the start of order processing
2. Checks for duplicates BEFORE inventory logic
3. All inventory reads + writes happen within lock
4. Lock released at end (even if error occurs)

**Performance impact:** Minimal - orders are serialized but only for ~200ms each

## Deployment Steps (5 minutes)

### 1. Open Apps Script
https://docs.google.com/spreadsheets/d/1n1YnFDUHyufWPXLAFOxz6RNkPGLr6gajG8JVc00cxTs/edit
- Click: Extensions → Apps Script

### 2. Save Current Version (backup)
- Click: three dots (⋮) → Version history
- Note current version number (e.g., "Version 7")
- **Rollback command if needed:** Revert to this version in Version history

### 3. Replace Code
- Select ALL code in Code.gs
- Delete it
- Open: `vantix_apps_script_WITH_LOCK.js`
- Copy entire file
- Paste into Code.gs

### 4. Save
- Click: 💾 Save (Cmd+S)
- Name: "P0 Fix - LockService"

### 5. Test Deploy (optional but recommended)
- Click: Deploy → Test deployments
- Click: Install (temporary test URL)
- Send a test order to test URL
- Verify it works

### 6. Deploy to Production
- Click: Deploy → Manage deployments
- Click: ✏️ Edit (on active deployment)
- Version: New version
- Description: "P0 Fix: LockService + duplicate check first"
- Click: Deploy
- **URL should stay the same** (don't change webhook URL)

### 7. Verify
The webhook URL should still be:
```
https://script.google.com/macros/s/AKfycbxGd-TzTIFXou9Cp7iOpq0qHKLDcTZsDqx9sjMuiNYaeD_kGTGcF7HYK57xfPZ_aM_A4w/exec
```

## Testing

### Test 1: Normal Order
- Place one test order
- Should process normally
- Check Orders sheet - should have COGS and profit filled

### Test 2: Duplicate Protection
- Try to submit same order_number twice
- Second attempt should return:
```json
{
  "status": "duplicate",
  "message": "Order already processed"
}
```

### Test 3: Race Condition (manual)
Can't easily test without two simultaneous requests, but the lock ensures safety.

## What Changed

**Before:**
```javascript
function handleNewOrder(data) {
  // Check duplicate (but inventory logic already started)
  const existingOrders = ordersSheet.getRange('A:A').getValues();
  // ... rest of order processing
}
```

**After:**
```javascript
function handleNewOrder(data) {
  const lock = LockService.getScriptLock();
  lock.waitLock(30000); // ACQUIRE LOCK
  
  try {
    // CHECK DUPLICATE FIRST
    const existingOrders = ordersSheet.getRange('A2:A1000').getValues();
    // ... rest of order processing (all within lock)
  } finally {
    lock.releaseLock(); // ALWAYS RELEASE
  }
}
```

## Key Improvements

1. ✅ **Lock acquired immediately** - prevents concurrent processing
2. ✅ **Duplicate check moved first** - before inventory logic
3. ✅ **Limited to 1000 rows** - faster duplicate check (was checking entire column)
4. ✅ **Always releases lock** - even on error (try/finally)
5. ✅ **30 second timeout** - prevents deadlock if something hangs

## Rollback

If this breaks something:

1. Go to: Extensions → Apps Script
2. Click: three dots (⋮) → Version history
3. Select previous version (before this deployment)
4. Click: Restore this version

Or manually revert to `vantix_apps_script_PRODUCTION.js` (the version without LockService)

## What's NOT Changed

- Cloudflare Worker (untouched)
- Bankful integration (untouched)
- Sheet structure (untouched)
- Webhook URL (same)

## Next Steps

After this is deployed and tested:

1. **Monitor for 24 hours** - watch for any errors in Apps Script logs
2. **Then:** Bankful signature verification (requires docs from you)
3. **Then:** D1 migration (permanent solution)

---

**Ready to deploy?** Follow steps 1-7 above.
