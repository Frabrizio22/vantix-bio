# Daily email job (draft-only)

Runs weekdays 8:07 AM Pacific as a scheduled task. It never sends. It writes each email to the Supabase `email_queue` table; the Apps Script `email/queue_to_drafts.gs` turns each row into a Gmail draft in support@vantixbio.com (clean links, within 10 minutes) for Frabrizio to review. Do not use the Gmail connector create_draft: it rewrites links into Google redirect pages. The job records each queued email in `email_log` so the 14-day cap and "do not repeat" rules hold.

Needs: `supabase/email_queue.sql`, `supabase/email_automation.sql` applied (tables `email_log`, `email_exclusions`, view `customer_segments`) and `supabase/email_optouts.sql`.

## Who enters flows
Only customers whose latest order is on or after 2026-10-03 (new orders from now on). Earlier customers are handled by one-time campaigns.

## Flows
| Flow | Rule | Subject |
|---|---|---|
| post-purchase | order shipped 3 to 4 days ago, has tracking, no prior post-purchase log for that order number | Your order, verified |
| reorder-d28 | segment = reorder_d28 and eligible | Checking in from Vantix Bio |
| nudge-d42 | segment = nudge_d42 and eligible | A note on shipping |
| winback-d75 | segment = winback_d75 and eligible and orders = 1 | What is new at Vantix Bio |
| welcome-d0 | (queued from the stored template when present) in view `lead_welcome_due` (homepage popup signup in the last 3 days, never ordered, not opted out or excluded, no welcome logged). Exempt from the 14-day cap. Skipped quietly if `supabase/email_leads.sql` has not been run | Welcome to Vantix Bio |
| welcome-d2 | in view `lead_nurture_due`: welcome-d0 logged 2+ days ago, no order, not opted out or excluded. Queued from the stored template. Exempt from the 14-day cap | See the testing behind every batch |
| welcome-d5 | in view `lead_nurture_due`: welcome-d2 logged 3+ days ago, same rules. Near plain-text personal note from Frabrizio | A quick note from Frabrizio |

No discount codes in any flow (the welcome flow names WELCOME15 only). Never name products or prices in subject lines. Shipping wording: "typically ships within one business day".

## Rules
- Skip anyone not `eligible` in `customer_segments` (opted out, excluded, bad batch, or emailed in the last 14 days). post-purchase is exempt from the 14-day cap only.
- Max 10 drafts per run. If more are due, draft the oldest first and note the rest.
- Every draft ends with the RUO line, the PO Box address and an unsubscribe link `https://vantixbio.com/unsubscribe.html#e=<email>`.
- Links to the shop and verify pages carry `?utm_source=email&utm_medium=retention&utm_campaign=<flow>`.

## Welcome flow templates (popup signups)
Three emails built by `email/build.py` (welcome-d0 designed, welcome-d2 designed-light, welcome-d5 near plain text) and stored in table `public.email_templates` (created by `supabase/email_welcome_flow.sql`; loaded from `supabase/email_welcome_templates.sql`, which build.py regenerates). The job queues them with one SQL statement that fills `{{email}}`; it never rewrites the copy. After editing a template: run `python3 email/build.py`, then reload the generated SQL into `email_templates`. The job runs weekdays only, so a weekend signup gets welcome-d0 on Monday.

Original hand-written welcome-d0 (used only if no template row exists):
Greeting is "Hello," (the popup collects no name). Thank them for signing up; their code is WELCOME15 (bold) for 15% off the first order; every lot has published testing results, scan the QR code or enter a batch number on the verification page (utm_campaign=welcome-d0); orders typically ship within one business day and ship free over $150; link 'Visit the shop' (utm_campaign=welcome-d0); signed 'Frabrizio / Vantix Bio'. Same footer and unsubscribe link as every flow. Purity, testing and handling only: no effect, dosing or product-use language.
