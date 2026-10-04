-- GA4 server-side purchase tracking: columns on orders.
-- Paste into the Supabase SQL editor and run once. Safe to re-run.
--
-- ga_client_id / ga_session_id: sent by checkout.html with the order, so the Worker can attach
--   the server-side purchase to the visitor's original GA4 session (keeps traffic source).
-- ga_purchase_sent_at: set by the Worker after the purchase is sent, so an order is never sent twice.

alter table public.orders
  add column if not exists ga_client_id text,
  add column if not exists ga_session_id text,
  add column if not exists ga_purchase_sent_at timestamptz;
