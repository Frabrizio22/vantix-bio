-- Email opt-outs for marketing emails. Additive only: new table + one function.
-- Anyone can call opt_out_email(); only admins can read the list.

create table if not exists public.email_optouts (
  email        text primary key,
  opted_out_at timestamptz not null default now(),
  source       text not null default 'unsubscribe_page'
);

alter table public.email_optouts enable row level security;

drop policy if exists "admins read optouts" on public.email_optouts;
create policy "admins read optouts" on public.email_optouts
  for select to authenticated using (public.is_admin());

create or replace function public.opt_out_email(p_email text)
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
  insert into public.email_optouts (email) values (e) on conflict (email) do nothing;
end;
$$;

revoke all on function public.opt_out_email(text) from public;
grant execute on function public.opt_out_email(text) to anon, authenticated;
