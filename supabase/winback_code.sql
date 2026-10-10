-- WINBACK15: 15% off the whole order, for returning customers only, once, within a personal 7-day window.
-- Paste into the Supabase SQL editor (DDL).

alter table public.promo_codes add column if not exists returning_customers_only boolean not null default false;

create table if not exists public.winback_offers (
  email text primary key,
  code text not null default 'WINBACK15',
  issued_at timestamptz not null default now(),
  expires_at timestamptz not null
);
alter table public.winback_offers enable row level security;  -- no policies: service role / security definer only

create or replace function public.enforce_new_customer_code()
returns trigger language plpgsql security definer set search_path to 'public' as $$
declare
  v_digits text := regexp_replace(coalesce(new.phone, ''), '\D', '', 'g');
begin
  if new.discount_code is null then
    return new;
  end if;
  -- new-customer codes (WELCOME15): refuse if a paid order already exists
  if exists (select 1 from public.promo_codes c where c.code = new.discount_code and c.new_customers_only) then
    if exists (
      select 1 from public.orders o
      where o.id <> new.id
        and o.payment_status in ('paid', 'completed', 'succeeded')
        and (lower(btrim(o.customer_email)) = lower(btrim(new.customer_email))
             or (length(v_digits) >= 10 and regexp_replace(coalesce(o.phone, ''), '\D', '', 'g') = v_digits))
    ) then
      raise exception 'invalid_discount_code:first_order_only';
    end if;
  end if;
  -- returning-customer codes (WINBACK15): need an unexpired offer for this email, and one use only
  if exists (select 1 from public.promo_codes c where c.code = new.discount_code and c.returning_customers_only) then
    if not exists (
      select 1 from public.winback_offers w
      where lower(w.email) = lower(btrim(new.customer_email)) and w.code = new.discount_code and w.expires_at > now()
    ) then
      raise exception 'invalid_discount_code:offer_expired_or_not_eligible';
    end if;
    if exists (
      select 1 from public.orders o
      where o.id <> new.id and o.discount_code = new.discount_code
        and (lower(btrim(o.customer_email)) = lower(btrim(new.customer_email))
             or (length(v_digits) >= 10 and regexp_replace(coalesce(o.phone, ''), '\D', '', 'g') = v_digits))
        and o.payment_status in ('paid', 'completed', 'succeeded')
    ) then
      raise exception 'invalid_discount_code:already_used';
    end if;
  end if;
  return new;
end;
$$;

insert into public.promo_codes (code, pct, applies_to, sku_match, free_shipping, active, influencer, commission_pct, note, team, new_customers_only, returning_customers_only)
values ('WINBACK15', 0.15, 'all', null, false, true, null, 0, 'Winback email: 15% off whole order, returning customers with an offer in winback_offers, once, 7-day window', false, false, true)
on conflict (code) do update set returning_customers_only = true, pct = 0.15;
