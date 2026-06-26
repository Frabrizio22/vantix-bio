# Vantix Apps Script Comparison Analysis
## June 25, 2026

## Script Timeline (Files on Disk)

| File | Date | doGet | payment_confirmed | Auth for waitlist | Column Structure |
|------|------|-------|-------------------|-------------------|------------------|
| VANTIX_APPS_SCRIPT_DEPLOY.js | Jun 19 | ❌ | ❌ | Required | OLD (A=Timestamp, B=OrderID, G=Items...) |
| VANTIX_APPS_SCRIPT_WORKING.js | Jun 24 | ❌ | ❌ | Required | NEW A-Y |
| VANTIX_APPS_SCRIPT_FINAL.js | Jun 24 | ❌ | ❌ | Required | NEW A-Y |
| VANTIX_COMPLETE_SCRIPT.js | Jun 24 | ✅ | ❌ | Required | NEW A-Y |
| **VANTIX_DASHBOARD_FIXED.js** | Jun 25 | ✅ | ✅ | Skipped | NEW A-Y |

**The old working script** (pasted in messages #37202-37208, June 15) is NOT on disk. Per memory notes from June 15, it:
- Had payment callback handling (confirmed working)
- Had no parse_mode on Telegram (Markdown removed)
- Had the OLD column structure (pre-June 24 restructure)

## Column Structure Change (June 24 Restructure)

### OLD Structure (DEPLOY.js / likely June 15 production):
```
A=Timestamp, B=OrderID, C=Email, D=Name, E=Phone, F=Address, G=Items,
H=Subtotal, I=Discount, J=Shipping, K=Total, L=Payment, M=Status, N=Promo, O=Notes
```
**Field names**: `data.orderId`, `data.name`, `data.email`

### NEW Structure (A-Y, all June 24+ scripts):
```
A=Order#, B=Timestamp, C=Email, D=Name, E=Phone, F=Address, G=City, H=State, I=Zip,
J=Product, K=Qty, L=Payment, M=Subtotal, N=Discount Code, O=Discount, P=Shipping,
Q=Total, R=COGS, S=CC Fees, T=Ship Cost Actual, U=Net Profit, V=Status,
W=Shipped, X=Tracking, Y=Batch#
```
**Field names**: `data.order_number`, `data.customer_name`, `data.customer_email`

## Bugs Found in VANTIX_DASHBOARD_FIXED.js

### Bug #1: CRITICAL — Waitlist auth mismatch with older script versions
The Worker sends waitlist requests WITHOUT `api_key`. DASHBOARD_FIXED correctly skips auth for waitlist.
BUT: If someone deployed COMPLETE_SCRIPT.js or FINAL.js instead (which require auth for ALL actions), waitlist would silently fail.
**DASHBOARD_FIXED is actually correct here.**

### Bug #2: CRITICAL — No `payment_confirmed` handler in the "production" scripts
ALL the June 24 scripts EXCEPT DASHBOARD_FIXED are missing the `payment_confirmed` handler.
If any of those were deployed, Bankful callbacks would return "Unknown action" and:
- Orders stay "Pending" forever
- No confirmation email for credit card customers
- No status update in spreadsheet

**DASHBOARD_FIXED fixes this. If "old working" = June 15 script (which had callbacks), and someone deployed FINAL.js or COMPLETE_SCRIPT.js (which don't), THAT broke Bankful.**

### Bug #3: MODERATE — `parseItems` missing price in confirmation emails
In `handlePaymentConfirmation`, items are parsed from sheet text like "Tirz 30mg (x2)".
`parseItems` returns `{name, quantity}` — no `price` field.
`sendConfirmationEmail` uses `item.price * item.quantity` → results in `$NaN` in emails.

### Bug #4: LOW — Confirmation email only for Zelle in new script
OLD scripts sent confirmation email for ALL orders immediately.
DASHBOARD_FIXED only sends for Zelle; CC customers wait for payment callback.
If callback fails, CC customer never gets email.

### Bug #5: LOW — Status validation dropdown inconsistency
`handleOrder` sets dropdown validation: `['Pending', 'Paid', 'Shipped', 'Delivered']`
`doGet` `isCompleted` also checks for `'completed'` which isn't in the dropdown.

## Root Cause Assessment

**Most likely scenario**: The June 24 restructure produced multiple script files. One of the intermediate versions (FINAL.js or COMPLETE_SCRIPT.js) was deployed instead of DASHBOARD_FIXED.js, breaking:
1. Bankful payment callbacks (no `payment_confirmed` handler)
2. Waitlist signups (auth required but no api_key sent)

**DASHBOARD_FIXED.js is actually the most correct version**, with only Bug #3 (email $NaN) needing a fix.

## Recommendation

Deploy a corrected version of DASHBOARD_FIXED.js with:
1. Fix `parseItems` to handle price lookup for confirmation emails
2. Keep the `payment_confirmed` handler (essential for Bankful)
3. Keep auth bypass for waitlist/email_capture (Worker doesn't send api_key for these)
4. Keep the doGet dashboard
5. Add "Completed" to status dropdown validation

---

## Worker Comparison: OLD vs NEW

### OLD Working Worker (`vantix_worker_READY_TO_DEPLOY.js`)
**Bankful approach:** Simple URL parameters
```
Gateway: 70777
Username: vantixbio@gmail.com
Password: Vantixbio@140
Amount, OrderNumber, Email, ReturnURL, CallbackURL
```
- Returns full redirect URL: `hpp_url: "https://api.paybybankful.com/...?Gateway=70777&Username=..."`
- Client does `window.location.href = hpp_url`
- Callback: GET request with URL params (`?OrderNumber=VX123&Status=Approved`)
- Callback action to Apps Script: `payment_callback`
- No api_key sent to Apps Script
- Uses `addEventListener('fetch', ...)` syntax

### NEW Broken Worker (`vantix_worker_COMPLETE.js`)
**Bankful approach:** Complex HMAC-SHA256 signed POST
```
transaction_type, amount, request_currency, cust_email, cust_fname, cust_lname,
cust_phone, bill_addr, bill_addr_city, bill_addr_state, bill_addr_zip,
bill_addr_country, xtl_order_id, cart_name, req_username, signature
```
- Returns `hpp_url` + `hpp_params` separately → client builds hidden form and POSTs
- **NO Gateway parameter!** ← Critical missing piece
- **Callback handler only accepts POST** ← Bankful sends GET
- Callback action: `payment_confirmed`
- Sends api_key, COGS to Apps Script
- Uses `export default { async fetch }` syntax

### What Broke (4 issues):

1. **No Gateway ID** — Bankful doesn't know which merchant account to charge
2. **HMAC signature unnecessary** — HPP doesn't require it, and if the signature
   is wrong (likely), Bankful rejects the entire request
3. **Callback only POST** — Bankful sends GET callbacks to CallbackURL.
   The new Worker only handles POST at `/bankful-callback`, so callbacks
   are never received → orders stay Pending forever
4. **Callback path mismatch** — Old: `/callback`, New: `/bankful-callback`

### Checkout.html Compatibility:
The current checkout.html expects `hpp_url` + `hpp_params` and creates a hidden
form POST. The corrected Worker returns simple params in `hpp_params` format so
checkout.html works WITHOUT changes.

## Files Created

| File | Purpose |
|------|---------|  
| `SCRIPT_COMPARISON_ANALYSIS.md` | This analysis |
| `VANTIX_PRODUCTION_CORRECTED.js` | Corrected Apps Script (deploy to Google) |
| `VANTIX_WORKER_CORRECTED.js` | Corrected Worker (deploy to Cloudflare) |

## Deployment Steps

1. **Apps Script**: Paste `VANTIX_PRODUCTION_CORRECTED.js` into Apps Script editor → Save
2. **Worker**: Deploy `VANTIX_WORKER_CORRECTED.js` to Cloudflare
3. **Worker env vars** (set in Cloudflare dashboard):
   - `GOOGLE_SHEET_WEBHOOK_URL` = Apps Script web app URL
   - `BANKFUL_GATEWAY` = `73922`
   - `BANKFUL_USERNAME` = (Bankful username)
   - `BANKFUL_PASSWORD` = (new Bankful password — old one was exposed)
   - `TELEGRAM_BOT_TOKEN` = `8478171743:AAFrXkufgw1kRM0PIQxaXOLpYb3jpjDQxvA`
   - `TELEGRAM_CHAT_ID` = `513307658`
   - `API_SECRET_KEY` = `vantix_live_2026_secure_key_abc123`
4. **Test**: Place a $0.01 test order with credit card, verify callback completes
