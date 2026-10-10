-- Homepage signup popup: email list + the 15% first-order code.
-- Additive only. Run once in the Supabase SQL editor (project vantix-orders).
-- Anyone can call capture_lead() (the popup does); only admins can read the list.

-- 1) The list.
create table if not exists public.email_leads (
  email        text primary key,                       -- lower-cased
  source       text not null default 'popup',          -- where they signed up
  signup_at    timestamptz not null default now(),
  consent_text text,                                   -- the wording they saw when they signed up
  page         text                                    -- page path the popup was on
);

alter table public.email_leads enable row level security;

drop policy if exists "admins read email_leads" on public.email_leads;
create policy "admins read email_leads" on public.email_leads
  for select to authenticated using (public.is_admin());

-- 2) The only way the public site can add to it.
create or replace function public.capture_lead(p_email text, p_source text default 'popup', p_consent text default null, p_page text default null)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  e text := lower(trim(coalesce(p_email, '')));
begin
  if length(e) < 5 or length(e) > 254 or e !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' then
    raise exception 'invalid email';
  end if;
  -- Anyone who unsubscribed stays unsubscribed.
  if exists (select 1 from public.email_optouts x where lower(x.email) = e) then
    return;
  end if;
  insert into public.email_leads (email, source, consent_text, page)
  values (e, left(coalesce(p_source, 'popup'), 40), left(p_consent, 400), left(p_page, 200))
  on conflict (email) do nothing;
end;
$$;

revoke all on function public.capture_lead(text, text, text, text) from public;
grant execute on function public.capture_lead(text, text, text, text) to anon, authenticated;

-- 3) Who is due a welcome email: signed up in the last 3 days, never ordered,
--    not opted out or excluded, and no welcome email logged yet.
create or replace view public.lead_welcome_due with (security_invoker = true) as
select l.email, l.signup_at
from public.email_leads l
where l.signup_at > now() - interval '3 days'
  and not exists (select 1 from public.orders o where lower(trim(o.customer_email)) = l.email)
  and not exists (select 1 from public.email_optouts x where lower(x.email) = l.email)
  and not exists (select 1 from public.email_exclusions x where lower(x.email) = l.email)
  and not exists (select 1 from public.email_log g where lower(g.email) = l.email and g.flow = 'welcome-d0');

-- 4) The code the popup hands out: 15% off the whole order.
insert into public.promo_codes (code, pct, applies_to, sku_match, free_shipping, active, influencer, commission_pct, note, team)
values ('WELCOME15', 0.15, 'all', null, false, true, null, 0, 'Homepage signup popup: 15% off first order, whole order', false)
on conflict (code) do nothing;
