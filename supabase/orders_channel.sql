-- Adds a sales channel to orders so wholesale clients can be separated from retail.
-- Run once in the Supabase SQL editor (project vantix-orders). Safe to re-run.

alter table public.orders
  add column if not exists channel text not null default 'retail';

alter table public.orders drop constraint if exists orders_channel_check;
alter table public.orders
  add constraint orders_channel_check check (channel in ('retail', 'wholesale'));

-- Wholesale clients: Ryan Garrett, Darren Duso, Michael Murphy (every order they have placed)
update public.orders set channel = 'wholesale'
where lower(trim(customer_email)) in (
  'foreverchangedfitness25@gmail.com',
  'darren.duso@yahoo.com',
  'mwmurphy89@gmail.com',
  'm.w.murphy89@gmail.com'
);

-- check
select channel, count(*) as orders, round(sum(total), 2) as revenue
from public.orders
where payment_status = 'paid'
group by channel;
