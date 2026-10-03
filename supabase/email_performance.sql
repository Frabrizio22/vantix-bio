-- Orders and revenue per email sent, so each send can be judged on money, not opens.
-- Attribution: a paid order by the same person (any email address they use) within 14 days after the send.
-- Test orders (notes containing "test" or codes TEST/TEST1) are ignored.
-- Run once in the Supabase SQL editor (project vantix-orders). Safe to re-run.

drop view if exists public.email_performance_by_flow;
drop view if exists public.email_performance;

create view public.email_performance with (security_invoker = true) as
select l.id, l.email, l.flow, l.subject, l.sent_at,
       count(o.id) as orders_14d,
       coalesce(round(sum(o.total)::numeric, 2), 0) as revenue_14d,
       bool_or(coalesce(o.discount_code, '') <> '') as used_code
from public.email_log l
left join public.customer_segments s on lower(l.email) = any (s.alias_emails)
left join public.orders o
  on lower(trim(o.customer_email)) = any (s.alias_emails)
 and o.created_at > l.sent_at and o.created_at <= l.sent_at + interval '14 days'
 and o.payment_status in ('paid','completed','succeeded')
 and coalesce(o.notes, '') !~* 'test'
 and coalesce(o.discount_code, '') not in ('TEST','TEST1')
group by l.id, l.email, l.flow, l.subject, l.sent_at;

create view public.email_performance_by_flow with (security_invoker = true) as
select flow, subject, count(*) as sent, count(*) filter (where orders_14d > 0) as people_who_ordered,
       sum(orders_14d) as orders, sum(revenue_14d) as revenue,
       round(sum(revenue_14d) / nullif(count(*), 0), 2) as revenue_per_recipient,
       bool_and(sent_at < now() - interval '14 days') as window_closed
from public.email_performance
group by flow, subject
order by min(sent_at) desc;
