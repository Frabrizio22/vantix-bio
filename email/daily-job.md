# Daily email job (draft-only)

Runs weekdays 8:07 AM Pacific as a scheduled task. It never sends. It creates Gmail drafts in support@vantixbio.com for Frabrizio to review, and records each draft in `email_log` so the 14-day cap and "do not repeat" rules hold.

Needs: `supabase/email_automation.sql` applied (tables `email_log`, `email_exclusions`, view `customer_segments`) and `supabase/email_optouts.sql`.

## Who enters flows
Only customers whose latest order is on or after 2026-10-03 (new orders from now on). Earlier customers are handled by one-time campaigns.

## Flows
| Flow | Rule | Subject |
|---|---|---|
| post-purchase | order shipped 3 to 4 days ago, has tracking, no prior post-purchase log for that order number | Your order, verified |
| reorder-d28 | segment = reorder_d28 and eligible | Checking in from Vantix Bio |
| nudge-d42 | segment = nudge_d42 and eligible | A note on shipping |
| winback-d75 | segment = winback_d75 and eligible and orders = 1 | What is new at Vantix Bio |

No discount codes in any flow. Never name products or prices in subject lines. Shipping wording: "typically ships within one business day".

## Rules
- Skip anyone not `eligible` in `customer_segments` (opted out, excluded, bad batch, or emailed in the last 14 days). post-purchase is exempt from the 14-day cap only.
- Max 10 drafts per run. If more are due, draft the oldest first and note the rest.
- Every draft ends with the RUO line, the PO Box address and an unsubscribe link `https://vantixbio.com/unsubscribe.html#e=<email>`.
- Links to the shop and verify pages carry `?utm_source=email&utm_medium=retention&utm_campaign=<flow>`.
