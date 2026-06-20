# Father's Day Sale Email Instructions

## Email Details
- **Subject:** Father's Day Sale — 15% Off Ends Monday
- **From:** vantixbio@gmail.com
- **Template:** fathers_day_email_READY.html
- **Recipients:** ~40 PRC customers + Vantix customer list

## How to Send

### Method 1: Gmail Web (BCC Method)

1. Open Gmail → Compose
2. **To:** vantixbio@gmail.com (yourself)
3. **BCC:** Add all customer emails (paste from spreadsheet)
4. **Subject:** Father's Day Sale — 15% Off Ends Monday
5. Click **<>** (Show original HTML) or use Insert → HTML
6. Copy/paste the entire contents of `fathers_day_email_READY.html`
7. Send test to yourself first → verify it looks good
8. If good, send to BCC list

**BCC limits:**
- Gmail allows ~500 BCC recipients per day
- For 40 customers, you're well under the limit

### Method 2: Using `gog` CLI (Recommended for larger lists)

```bash
# Save customer emails to a file (one per line)
cat > ~/customer_emails.txt << EOF
customer1@example.com
customer2@example.com
customer3@example.com
EOF

# Send email via gog
gog gmail send \
  --from vantixbio@gmail.com \
  --bcc-file ~/customer_emails.txt \
  --subject "Father's Day Sale — 15% Off Ends Monday" \
  --html fathers_day_email_READY.html
```

### Method 3: Google Sheets + Apps Script (For tracking)

If you want to track opens/clicks:

1. Add customer emails to a Google Sheet
2. Use Apps Script to send via Gmail API with tracking pixels
3. (This requires more setup — stick with BCC if you just want to send quickly)

## Customer List Sources

### PRC Customers (~40 emails)
- Google Sheet: `1Edd7FoYFMPaGPidLqqe--iDPzkgdc5PZE_3jRgdb0SE` → Orders tab
- Filter: Customers who ordered in last 6 months
- Export emails to CSV

### Vantix Customers
- Google Sheet: `1n1YnFDUHyufWPXLAFOxz6RNkPGLr6gajG8JVc00cxTs` → Orders tab
- Export emails (if any orders exist)

### Waitlist
- Google Sheet: `1n1YnFDUHyufWPXLAFOxz6RNkPGLr6gajG8JVc00cxTs` → Waitlist tab
- Export emails (they signed up for updates)

## Best Time to Send

**Saturday morning 9-11 AM PST** (today or tomorrow)
- Gives people the weekend to order
- Monday deadline creates urgency

## After Sending

1. Monitor for replies/questions
2. Check orders with code FATHERS in checkout
3. Track conversion rate: (orders with FATHERS) / (emails sent)

## Expected Results

- **Open rate:** 25-35% (industry average for ecommerce)
- **Click rate:** 5-10%
- **Conversion:** 2-5% of recipients place orders

With ~40 customers:
- ~12-14 opens expected
- ~2-4 clicks to shop
- ~1-2 orders (hopefully more with 15% + Zelle stacking)

## Notes

- Don't spam — send once, maybe one reminder Monday morning if needed
- Make sure FATHERS code is active in checkout.html (already done)
- Remove banner after Monday night
