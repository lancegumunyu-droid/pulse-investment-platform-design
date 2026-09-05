-- Pulse admin and signals hardening
-- Run in Supabase SQL Editor as postgres/service role.
-- This script is additive and does not seed balances or expose secrets.

create table if not exists public.signals (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  summary text not null default '',
  status text not null default 'draft' check (status in ('draft','published','closed','resolved')),
  resolution_note text,
  project_id text,
  created_by uuid references auth.users(id),
  resolved_by uuid references auth.users(id),
  published_at timestamptz,
  resolved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.admin_audit_log (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid not null references auth.users(id),
  action text not null,
  entity_type text not null,
  entity_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists signals_status_idx on public.signals(status);
create index if not exists signals_created_at_idx on public.signals(created_at desc);
create index if not exists admin_audit_actor_idx on public.admin_audit_log(actor_id, created_at desc);

alter table public.signals enable row level security;
alter table public.admin_audit_log enable row level security;

create or replace function public.is_pulse_admin()
returns boolean
language sql
stable
security invoker
set search_path = public
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = (select auth.uid()) and p.role = 'admin'
  );
$$;

revoke all on function public.is_pulse_admin() from public;
grant execute on function public.is_pulse_admin() to authenticated;

drop policy if exists "published signals are readable" on public.signals;
create policy "published signals are readable"
on public.signals for select
to authenticated
using (status in ('published','closed','resolved') or public.is_pulse_admin());

drop policy if exists "admins manage signals" on public.signals;
create policy "admins manage signals"
on public.signals for all
to authenticated
using (public.is_pulse_admin())
with check (public.is_pulse_admin());

drop policy if exists "admins read audit log" on public.admin_audit_log;
create policy "admins read audit log"
on public.admin_audit_log for select
to authenticated
using (public.is_pulse_admin());

drop policy if exists "admins write audit log" on public.admin_audit_log;
create policy "admins write audit log"
on public.admin_audit_log for insert
to authenticated
with check (public.is_pulse_admin() and actor_id = (select auth.uid()));

revoke all on public.signals from anon;
revoke all on public.admin_audit_log from anon;
grant select on public.signals to authenticated;
grant select, insert on public.admin_audit_log to authenticated;

-- Verification queries
select tablename, policyname, cmd from pg_policies
where schemaname = 'public' and tablename in ('signals','admin_audit_log')
order by tablename, policyname;

select current_user, (select public.is_pulse_admin()) as is_pulse_admin;
select count(*) as signal_count from public.signals;

-- To grant admin access to one account, run explicitly with that user's UUID:
-- update public.profiles set role = 'admin', admin_scope = 'full' where id = 'USER_UUID_HERE';
-- Never trust client metadata or expose SUPABASE_SERVICE_ROLE_KEY.
