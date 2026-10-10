-- Welcome flow for homepage-popup signups: day 3 and day 7 emails.
-- Additive only (one table, one view). Run after supabase/email_leads.sql.
-- Day 0 comes from lead_welcome_due. This view lists who is due the next step.
--   welcome-d3: welcome-d0 was logged 3+ days ago
--   welcome-d7: welcome-d3 was logged 4+ days ago
-- Anyone who orders, opts out or is excluded drops out. The daily job logs each queued email in email_log.

-- Templates the daily job queues from (the HTML is loaded from email/build.py, so the emails go out exactly as designed).
create table if not exists public.email_templates (
  flow       text primary key,
  subject    text not null,
  html_body  text not null,
  text_body  text not null,
  updated_at timestamptz not null default now()
);
alter table public.email_templates enable row level security;
drop policy if exists "admins read email_templates" on public.email_templates;
create policy "admins read email_templates" on public.email_templates
  for select to authenticated using (public.is_admin());

create or replace view public.lead_nurture_due with (security_invoker = true) as
with live as (
  select l.email, l.signup_at
  from public.email_leads l
  where l.signup_at > now() - interval '30 days'
    and not exists (select 1 from public.orders o where lower(trim(o.customer_email)) = l.email)
    and not exists (select 1 from public.email_optouts x where lower(x.email) = l.email)
    and not exists (select 1 from public.email_exclusions x where lower(x.email) = l.email)
)
select v.email, 'welcome-d3'::text as flow, v.signup_at
from live v
where (select max(g.sent_at) from public.email_log g where lower(g.email) = v.email and g.flow = 'welcome-d0') <= now() - interval '3 days'
  and not exists (select 1 from public.email_log g where lower(g.email) = v.email and g.flow = 'welcome-d3')
union all
select v.email, 'welcome-d7'::text, v.signup_at
from live v
where (select max(g.sent_at) from public.email_log g where lower(g.email) = v.email and g.flow = 'welcome-d3') <= now() - interval '4 days'
  and not exists (select 1 from public.email_log g where lower(g.email) = v.email and g.flow = 'welcome-d7');
