# Vantix Bio: project handoff (read this first in any new session)

Owner: Frabrizio Velazquez (spelled "Frabrizio"), sole operator. Brand is always written "Vantix Bio", never just "Vantix", in email and customer-facing copy. RUO (research use only) peptides; no efficacy/dosing claims. Sender: support@vantixbio.com. Footer address: PO Box 389, Santa Cruz, CA 95061.

## Working rules
- Confirm assumptions with the owner before writing to the database (he cancelled guessed writes before). Say plainly what was assumed.
- DDL (create/alter) via execute_sql has been cancelled before: write a SQL file in `supabase/`, give the owner the text to paste into the Supabase SQL editor, then do DML/verification yourself.
- Supabase project `vantix-orders` (id mxhtxcpqgjmgwnurxguv). `execute_sql` returns only the last statement's result.
- Git flow: branch, push, PR via `gh api repos/Frabrizio22/vantix-bio/pulls`, merge with `/pulls/N/merge -X PUT -f merge_method=squash`, then pull main and delete the local branch. End commits with the Co-Authored-By and Claude-Session lines.
- GitHub Pages serves the site and `/admin/`; changes can take up to ~10 min to show (Safari: shift-click reload). The sandbox cannot open vantixbio.com.

## Database (Supabase)
- Tables: orders (net_profit is a GENERATED column; payment_method only 'credit_card' or 'zelle'; channel 'retail'|'wholesale'), order_items (sku FK to products), products, email_log, email_exclusions, email_optouts, promo_codes, settings, kit_components, inventory_movements.
- Views: customer_segments (person keyed by phone/name, alias_emails, eligible = not opted out/excluded and not emailed in 14 days), email_performance and email_performance_by_flow (orders/revenue per email within 14 days; still counts wholesale orders, could be changed to retail only).
- Files: supabase/email_performance.sql (run), supabase/orders_channel.sql (run Oct 2).
- Costs per vial: Reta 9.35 (was 14.35 Jun to mid-Sep, 12.21 for Sep orders), MOTS-c 15.89, BPC-157 8.60, TB-500 9.88, GHK-Cu 13.50, NAD+ 16.11, CJC 8.29, Ipa 5.85, Tesa 13.11, Tirz 10.00, BAC water 2.50. Packaging 1.50 per order; label cost entered manually.

## Offline / wholesale orders (all logged as payment_method 'zelle', channel 'wholesale', order numbers VXOFF*)
Wholesale clients: Ryan Garrett, Darren Duso, Michael Murphy. 9 offline orders logged, $8,775 revenue.
- Murphy: VXOFF0729 ($500, old AOD, no COGS), VXOFF0907 ($500, 10 Reta).
- Ryan: VXOFF0607 ($1,100: 10 NAD+ $525, 19 Tesa $575; Tesa cost $9), VXOFF0702 ($1,625), VXOFF0806 ($525: 10 MOTS-c + 10 GHK-Cu, qty of GHK assumed), VXOFF0901 ($1,775, total COGS set to $625), VXOFF0906 ($1,400).
- Darren: VXOFF0605 ($1,000, 25 Reta, first order), VXOFF0909 ($350, 10 Reta; paid via PayPal, logged as Zelle).
- Hidden legacy products (inactive, price 0) exist for items not in the catalog: VX-AOD-OLD, VX-LEG-CAGRI, VX-LEG-MT2, VX-LEG-SERM, VX-LEG-BPCTB.
- Labels come from the owner's USPS history spreadsheets. Murphy also has website orders; his other labels were assumed to be website orders.

## Admin dashboard (admin/index.html, client-side from Supabase)
- Home and Analytics have an All / Retail / Wholesale toggle (also Customers tab); Home has Revenue by month, Month over month (best seller per month), average full month line, Top customers. Top "to ship / awaiting payment / review / low stock" boxes are intentionally unfiltered.

## Email program
- Oct 6 launch: the 8:30 AM scheduled send did not send anything, so the owner and Claude sent manually. 24 emails went out Oct 6 (12 first batch with wrapped links, then 8 first-time/former-PRC and 4 repeat with clean links): first-time and former PRC got code VB10 (10% off, valid through Oct 16, bold in the copy); the 4 repeat buyers (Parker, Nick, Vicki, Julie) also got VB10 plus a short P.S. asking what products they would like. Matt Melton was held back (ordered Oct 6). All logged in email_log flow 'launch-2026-10'. VB10 has no expiry in the DB: deactivate it manually Oct 16 (promo_codes). Links carry utm_source=email&utm_medium=outreach&utm_campaign=oct6-first|repeat|prc; unsubscribe link https://vantixbio.com/unsubscribe.html#e={email}. Verification wording: scan the QR or enter a batch number on the verification page to see the data, the PDF, and a link to the original third-party lab report.
- Ryan and Darren were not in the 25; Darren got a manual follow-up Oct 2.
- Templates are built by email/build.py (10 HTML files incl. reorder variants 2b portal angle, 2c plain check-in; 6-batch-report only when a new lot is published).
- Gmail connector link wrapping (found Oct 6): any draft saved or email sent through the Gmail connector gets every link rewritten to google.com/url?q=... and recipients see a "Redirect Notice" page. HTML, plain text and direct send all do it. Apps Script (GmailApp) does not, which is why shipped/payment emails are clean. Fix (LIVE since Oct 6, tested): Claude writes emails to the Supabase email_queue table (columns to_email, subject, html_body, text_body, flow, note; unique on to_email+flow+note) and the Apps Script project "Vantix Email Queue" (email/queue_to_drafts.gs, 10-minute timer, service key in Script properties) turns each row into a Gmail draft in support@ with clean links, skipping opt-outs/exclusions; owner reviews, then Claude sends the draft with Gmail send_message(draftId) (sending an Apps Script draft keeps links clean). Never create drafts through the Gmail connector. The daily draft job (trig_0152QX8BxrwYhJWVXbZ3GK3F) now writes to email_queue. The first 12 launch emails sent Oct 6 (Hickey, Johnston, Maruri, Patricia, Abrams, Andrea, Clay, Agbo, Collins, Forehand, Catz, Sandie) carry wrapped links. Never commit scripts that contain customer emails (the repo is public via GitHub Pages).
- Homepage signup popup (built Oct 9; leads-popup.js on index.html): 15% off first order via code WELCOME15 (whole order; row created by supabase/email_leads.sql; also listed in checkout.html promoCodes and wholeOrderCodes). Shows after 15s of browsing across the site or on desktop exit, once per visitor (localStorage vxLeadDone / vxLeadClosed 30 days), waits for the age gate and menu. Email goes to email_leads via the capture_lead RPC (anon can call it; admin read only; opted-out emails are ignored). WELCOME15 is new-customers-only: promo_codes.new_customers_only plus trigger orders_new_customer_code (before insert on orders) refuse it when the same email or phone already has a paid order (error invalid_discount_code:first_order_only; the worker shows 'first orders only' once the updated worker is pasted into Cloudflare, otherwise 'not valid'). VB10 is not restricted. Welcome email (welcome-d0) is queued by the daily job from view lead_welcome_due. Abandoned-cart capture at checkout is NOT built yet; it raises a California privacy question (saving an email before Place Order), so get the lawyer review first.
- Strategy playbook doc: https://claude.ai/code/artifact/5b20ae13-99a7-4160-87cd-e5c0f7651601
- Compliance: FDA warning letters treat marketing intent, not an RUO label, as what defines a drug. CAN-SPAM, CA B&P 17529.5. Brevo and beehiiv ban this category; Postmark, Resend, Mailchimp, Klaviyo restrict pharma; SES/Mailgun/MailerLite unknown (ask in writing at ~200 contacts). Stay on Gmail/Workspace under 2,000/day for now; keep complaints under 0.1%.

## Decisions
- Google Analytics: no connector in the directory; Supermetrics is paid and a third party; Google's official MCP is local only. Decision: export GA4 CSVs (funnel, traffic by campaign) next week. GA4 cannot see abandoned carts before "Place Order" (no email); a server-side capture at checkout would, but check compliance first.
- Wholesale is kept in totals but tagged so retail metrics stay honest.

- GA4 purchase tracking (Oct 3): card buyers return to thank-you.html (url_complete and url_pending); declined/cancelled go back to checkout.html; Zelle goes to order-received.html. Page-side `purchase` events can miss people who never return and count unpaid Zelle/pending orders, so the Worker now sends the GA4 `purchase` server-side (Measurement Protocol) from afterPaid, once per order (orders.ga_purchase_sent_at), using the GA client/session ids checkout.html sends (orders.ga_client_id/ga_session_id). Worker source is in worker/vantix-checkout.js (deployed by pasting into Cloudflare). Needs secret GA4_API_SECRET and supabase/orders_ga4.sql. Check a payload with POST /admin/resend-ga {order_number, debug:true}. Phase 2 after verifying numbers: stop the page-side GA purchase (GTM tag on the `purchase` dataLayer event) and add `paybybankful.com` to GA4 unwanted referrals.

## Shipping and delivery times
- Shipped emails go out when the owner enters a tracking number (dashboard ship action / sheet). Labels are bought on usps.com Click-N-Ship (no order integration). Decision Oct 3: owner keeps entering tracking numbers by hand and will send the Click-N-Ship history export (xlsx) about monthly; no daily import, no label-software change for now.
- To compute delivery times from a history export: take the last 22 digits of "Label / Tracking Number", look each up at https://tools.usps.com/go/TrackConfirmAction?tLabels=<up to 30 comma-separated> using the built-in browser (needs request_access for tools.usps.com; the sandbox itself gets 403), read "Latest Update" delivery dates, match labels to paid orders by name + state + nearest earlier order date, then report calendar and business days (skip weekends and US holidays).
- Result Oct 3 (72 retail orders, Jun-Sep 2026): order to delivery averages 5.9 calendar days (median 6), 4.1 business days (median 4); order to ship 1.2 days, ship to delivered 4.6 days; 86% delivered within 7 days; Ground Advantage and Priority were the same. Delivery dates are not stored in the database.
- USPS says direct shippers with their own Mailer ID get no-cost Tracking API access (third-party providers pay); not pursued.

## To do
1. Owner: send a test email to mail-tester.com to check SPF/DKIM/DMARC.
2. Tue Oct 6 8:30 AM PT: send runs automatically. Calendar reminders Oct 12, 13, 16.
3. Oct 12-13: review results (email_performance_by_flow), complaints under 0.1%, unsubscribes, held-back buyers.
4. Oct 16: VB10 expires; test a card checkout at Bankful and close the page to see whether abandoned card carts leave any trace.
5. After Oct 20: second wave to remaining PRC buyers, no discount; per-flow performance when window_closed.
6. Optional: exclude wholesale from email_performance; daily draft job (draft-only, starts Mon Oct 5); offline-buyer reorder flow; lawyer review of the site for FDA triggers; Ryan's open data questions: none outstanding.
