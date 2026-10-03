-- Email automation support. Additive only: 2 tables + 1 view. Admin-read only.
-- Run once in the Supabase SQL editor (project vantix-orders).

-- 1) Every marketing email sent, so frequency caps come from our own data.
create table if not exists public.email_log (
  id      bigint generated always as identity primary key,
  email   text not null,
  flow    text not null,              -- e.g. 'launch-2026-10', 'reorder-d28', 'nudge-d42'
  subject text,
  sent_at timestamptz not null default now(),
  note    text
);
create index if not exists email_log_email_idx on public.email_log (lower(email), sent_at desc);
alter table public.email_log enable row level security;
drop policy if exists "admins read email_log" on public.email_log;
create policy "admins read email_log" on public.email_log for select to authenticated using (public.is_admin());

-- 2) People who should never get marketing email (manual list).
create table if not exists public.email_exclusions (
  email  text primary key,
  reason text,
  added_at timestamptz not null default now()
);
alter table public.email_exclusions enable row level security;
drop policy if exists "admins read exclusions" on public.email_exclusions;
create policy "admins read exclusions" on public.email_exclusions for select to authenticated using (public.is_admin());
insert into public.email_exclusions (email, reason) values
  ('navyas5150@gmail.com', 'San Diego area, owner request'),
  ('alyssamarinagarcia@yahoo.com', 'San Diego area, owner request')
on conflict (email) do nothing;

-- 3) One row per customer with what we need to target and to enforce the rules.
create or replace view public.customer_segments with (security_invoker = true) as
with o as (
  select lower(trim(customer_email)) as email, id, created_at, total, discount_code, state,
         initcap(split_part(trim(customer_name), ' ', 1)) as first_name
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
  select o.email,
         max(o.first_name) as first_name,
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
  group by o.email
),
sent as (select lower(email) as email, max(sent_at) as last_emailed_at from public.email_log group by 1)
select a.email, a.first_name, a.orders, a.orders > 1 as is_repeat,
       a.first_order_at, a.last_order_at,
       floor(extract(epoch from (now() - a.last_order_at)) / 86400)::int as days_since_last,
       a.total_spend, a.avg_order, a.used_code, a.state, a.last_products,
       (a.reta_in_window and a.orders = 1) as bad_batch,
       exists (select 1 from public.email_optouts x where lower(x.email) = a.email) as opted_out,
       exists (select 1 from public.email_exclusions x where lower(x.email) = a.email) as excluded,
       s.last_emailed_at,
       case when s.last_emailed_at is null then null
            else floor(extract(epoch from (now() - s.last_emailed_at)) / 86400)::int end as days_since_emailed,
       case
         when now() - a.last_order_at < interval '28 days' then 'recent'
         when now() - a.last_order_at < interval '42 days' then 'reorder_d28'
         when now() - a.last_order_at < interval '75 days' then 'nudge_d42'
         else 'winback_d75'
       end as segment,
       not (exists (select 1 from public.email_optouts x where lower(x.email) = a.email)
         or exists (select 1 from public.email_exclusions x where lower(x.email) = a.email)
         or (a.reta_in_window and a.orders = 1)
         or (s.last_emailed_at is not null and s.last_emailed_at > now() - interval '14 days')) as eligible
from agg a left join sent s on s.email = a.email;
