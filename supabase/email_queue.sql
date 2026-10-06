-- Email queue: Claude writes emails here; an Apps Script turns each row into a Gmail draft
-- with clean links (the Gmail connector rewrites links into google.com/url redirect URLs).
-- Run this in the Supabase SQL editor.

create table if not exists public.email_queue (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),
  to_email    text not null,
  subject     text not null,
  html_body   text not null,
  text_body   text,
  flow        text not null,              -- e.g. 'launch-2026-10', 'post-purchase', 'reorder_d28'
  note        text not null default '',   -- e.g. order number for post-purchase
  status      text not null default 'pending' check (status in ('pending','drafted','skipped','error')),
  drafted_at  timestamptz,
  detail      text,
  unique (to_email, flow, note)
);

create index if not exists email_queue_pending_idx on public.email_queue (status, created_at);

-- Only the service role (Apps Script, Claude) can touch it; the public site cannot.
alter table public.email_queue enable row level security;
