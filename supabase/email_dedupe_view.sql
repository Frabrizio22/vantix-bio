-- Replaces the customer_segments view so one person with several email addresses counts once.
-- A person = same 10-digit phone number (or same name if no phone). The email used is the one on their most recent order.
-- An opt-out, exclusion or recent send on ANY of their addresses applies to the whole person.
-- Run once in the Supabase SQL editor (project vantix-orders). Safe to re-run.

drop view if exists public.customer_segments;
create view public.customer_segments with (security_invoker = true) as
with o as (
  select lower(trim(customer_email)) as email, id, created_at, total, discount_code, state,
         initcap(split_part(trim(customer_name), ' ', 1)) as first_name,
         coalesce(nullif(right(regexp_replace(coalesce(phone, ''), '\D', '', 'g'), 10), ''), lower(trim(customer_name))) as pkey
  from public.orders
  where customer_email like '%@%'
    and (payment_status in ('paid','completed','succeeded') or payment_status is null)
),
items as (
  select oi.order_id,
         bool_and(oi.sku ilike 'VX-RETA%' or oi.name ilike 'VX-3R%') as all_reta,
         string_agg(distinct oi.name, '; ') as products
  from public.order_items oi group by oi.order_id
),
agg as (
  select o.pkey,
         (array_agg(o.email order by o.created_at desc))[1] as email,
         array_agg(distinct o.email) as alias_emails,
         (array_agg(o.first_name order by o.created_at desc))[1] as first_name,
         count(*) as orders,
         min(o.created_at) as first_order_at,
         max(o.created_at) as last_order_at,
         round(sum(o.total)::numeric, 2) as total_spend,
         round(avg(o.total)::numeric, 2) as avg_order,
         bool_or(coalesce(o.discount_code, '') <> '') as used_code,
         (array_agg(o.state order by o.created_at desc))[1] as state,
         (array_agg(i.products order by o.created_at desc))[1] as last_products,
         bool_or(o.created_at >= '2026-06-21' and o.created_at < '2026-07-17' and coalesce(i.all_reta, false)) as reta_in_window
  from o left join items i on i.order_id = o.id
  group by o.pkey
),
flags as (
  select a.*,
         exists (select 1 from public.email_optouts x where lower(x.email) = any (a.alias_emails)) as opted_out,
         exists (select 1 from public.email_exclusions x where lower(x.email) = any (a.alias_emails)) as excluded,
         (select max(l.sent_at) from public.email_log l where lower(l.email) = any (a.alias_emails)) as last_emailed_at
  from agg a
)
select f.email, f.first_name, f.orders, f.orders > 1 as is_repeat,
       f.first_order_at, f.last_order_at,
       floor(extract(epoch from (now() - f.last_order_at)) / 86400)::int as days_since_last,
       f.total_spend, f.avg_order, f.used_code, f.state, f.last_products,
       (f.reta_in_window and f.orders = 1) as bad_batch,
       f.opted_out, f.excluded, f.last_emailed_at,
       case when f.last_emailed_at is null then null
            else floor(extract(epoch from (now() - f.last_emailed_at)) / 86400)::int end as days_since_emailed,
       case
         when now() - f.last_order_at < interval '28 days' then 'recent'
         when now() - f.last_order_at < interval '42 days' then 'reorder_d28'
         when now() - f.last_order_at < interval '75 days' then 'nudge_d42'
         else 'winback_d75'
       end as segment,
       not (f.opted_out or f.excluded or (f.reta_in_window and f.orders = 1)
            or (f.last_emailed_at is not null and f.last_emailed_at > now() - interval '14 days')) as eligible,
       f.alias_emails
from flags f;
