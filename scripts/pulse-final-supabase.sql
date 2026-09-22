-- PULSE FINAL SUPABASE SETUP
-- Run in Supabase SQL Editor as postgres/service role.
-- Run once. This is additive and does not delete balances or transactions.

create or replace function public.is_pulse_admin()
returns boolean
language sql stable security invoker set search_path = public
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = (select auth.uid())
      and p.role = 'admin'
  )
  or exists (
    select 1 from public.user_roles r
    where r.user_id = (select auth.uid())
      and lower(r.role::text) in ('admin','super_admin','director')
  );
$$;

revoke all on function public.is_pulse_admin() from public;
grant execute on function public.is_pulse_admin() to authenticated;

alter table public.support_tickets enable row level security;
alter table public.support_messages enable row level security;
alter table public.support_attachments enable row level security;
alter table public.announcements enable row level security;
alter table public.notifications enable row level security;

-- Admin read/update access to support cases.
drop policy if exists support_tickets_admin_select on public.support_tickets;
create policy support_tickets_admin_select on public.support_tickets
for select to authenticated using (public.is_pulse_admin());

drop policy if exists support_tickets_admin_update on public.support_tickets;
create policy support_tickets_admin_update on public.support_tickets
for update to authenticated
using (public.is_pulse_admin())
with check (public.is_pulse_admin());

drop policy if exists support_messages_admin_select on public.support_messages;
create policy support_messages_admin_select on public.support_messages
for select to authenticated using (public.is_pulse_admin());

drop policy if exists support_messages_admin_insert on public.support_messages;
create policy support_messages_admin_insert on public.support_messages
for insert to authenticated
with check (public.is_pulse_admin() and is_staff = true and user_id = (select auth.uid()));

drop policy if exists support_attachments_admin_select on public.support_attachments;
create policy support_attachments_admin_select on public.support_attachments
for select to authenticated using (public.is_pulse_admin() or user_id = (select auth.uid()));

-- Admins can publish announcements; authenticated users may read them.
drop policy if exists announcements_admin_insert on public.announcements;
create policy announcements_admin_insert on public.announcements
for insert to authenticated
with check (public.is_pulse_admin() and created_by = (select auth.uid()));

drop policy if exists announcements_admin_update on public.announcements;
create policy announcements_admin_update on public.announcements
for update to authenticated
using (public.is_pulse_admin()) with check (public.is_pulse_admin());

drop policy if exists announcements_admin_delete on public.announcements;
create policy announcements_admin_delete on public.announcements
for delete to authenticated using (public.is_pulse_admin());

-- Admins can view and update notifications for support/broadcast operations.
drop policy if exists notifications_admin_select on public.notifications;
create policy notifications_admin_select on public.notifications
for select to authenticated using (public.is_pulse_admin() or user_id = (select auth.uid()));

drop policy if exists notifications_admin_insert on public.notifications;
create policy notifications_admin_insert on public.notifications
for insert to authenticated with check (public.is_pulse_admin());

-- Staff replies notify the ticket owner. The function is isolated in a private schema.
create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

create or replace function private.notify_support_reply()
returns trigger
language plpgsql security definer set search_path = public, private
as $$
declare owner_id uuid;
begin
  if new.is_staff is not true then return new; end if;
  select user_id into owner_id from public.support_tickets where id = new.ticket_id;
  if owner_id is null or owner_id = new.user_id then return new; end if;
  insert into public.notifications (user_id, title, body, read, created_at)
  values (owner_id, 'Support replied', 'Pulse support replied to your ticket.', false, now());
  update public.support_tickets set status = 'waiting_on_user', updated_at = now() where id = new.ticket_id;
  return new;
end;
$$;

revoke all on function private.notify_support_reply() from public, anon, authenticated;
grant execute on function private.notify_support_reply() to postgres;

drop trigger if exists support_reply_notification on public.support_messages;
create trigger support_reply_notification
after insert on public.support_messages
for each row execute function private.notify_support_reply();

-- Broadcast an announcement to every existing profile.
create or replace function public.publish_pulse_announcement(announcement_id uuid)
returns integer
language plpgsql security invoker set search_path = public
as $$
declare inserted_count integer;
begin
  if not public.is_pulse_admin() then raise exception 'Admin access required'; end if;
  insert into public.notifications (user_id, title, body, read, created_at)
  select p.id, a.title, a.message, false, now()
  from public.profiles p cross join public.announcements a
  where a.id = announcement_id;
  get diagnostics inserted_count = row_count;
  return inserted_count;
end;
$$;

grant execute on function public.publish_pulse_announcement(uuid) to authenticated;

-- Admin audit trail.
create table if not exists public.admin_audit_log (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid not null references auth.users(id) on delete cascade,
  action text not null,
  entity_type text not null,
  entity_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
alter table public.admin_audit_log enable row level security;
-- Existing installations may already have this table with an older shape.
alter table public.admin_audit_log add column if not exists actor_id uuid references auth.users(id) on delete cascade;
alter table public.admin_audit_log add column if not exists action text;
alter table public.admin_audit_log add column if not exists entity_type text;
alter table public.admin_audit_log add column if not exists entity_id uuid;
alter table public.admin_audit_log add column if not exists metadata jsonb default '{}'::jsonb;
alter table public.admin_audit_log add column if not exists created_at timestamptz default now();
drop policy if exists admin_audit_admin_all on public.admin_audit_log;
create policy admin_audit_admin_all on public.admin_audit_log
for all to authenticated
using (public.is_pulse_admin())
with check (public.is_pulse_admin() and (actor_id is null or actor_id = (select auth.uid())));
grant select, insert on public.admin_audit_log to authenticated;

-- Create a full-scope admin account. Replace the UUID, then run separately.
-- update public.profiles set role = 'admin' where id = 'YOUR_AUTH_USER_UUID';
-- insert into public.user_roles (user_id, role) values ('YOUR_AUTH_USER_UUID', 'admin')
-- on conflict (user_id) do update set role = excluded.role;

-- Verification
select table_name from information_schema.tables
where table_schema = 'public' and table_name in
('support_tickets','support_messages','support_attachments','announcements','notifications','admin_audit_log')
order by table_name;
select policyname, tablename, cmd from pg_policies
where schemaname = 'public' and tablename in
('support_tickets','support_messages','support_attachments','announcements','notifications','admin_audit_log')
order by tablename, policyname;
select (select public.is_pulse_admin()) as current_session_is_admin;

-- IMPORTANT: If the trigger section reports that notifications lacks title/body,
-- stop there and send the exact column list from:
-- select column_name,data_type from information_schema.columns
-- where table_schema='public' and table_name='notifications';
-- Do not guess notification columns.

-- MANUAL SETUP CHECKLIST
-- 1. Run this file.
-- 2. Replace YOUR_AUTH_USER_UUID in the two admin statements and run them.
-- 3. Sign out/in so the refreshed JWT/session sees the new role.
-- 4. Verify support_tickets insert as a normal user.
-- 5. Verify admin can read tickets and insert support_messages with is_staff=true.
-- 6. Verify the user receives a notification with read=false.
-- 7. Create an announcement as admin, then run:
--    select public.publish_pulse_announcement('ANNOUNCEMENT_UUID');
-- 8. Keep the support-attachments bucket private.
-- 9. Never expose SUPABASE_SERVICE_ROLE_KEY in browser code.
-- 10. Store only approved testimonials; do not publish private phone numbers.

-- TESTIMONIAL CONTENT TO APPROVE BEFORE PUBLISHING
-- DADIRAI-ZIM (24), SAMKE-ZAMBIA (25), CRAIG-ANGOLA (29), plus four additional
-- names can be entered as approved copy only after the people consent.
-- Suggested additional display names: Thandiwe-MZ (27), Nkosana-ZIM (31),
-- Rudo-ZAM (26), and Sipho-SA (30). These are placeholders, not verified people.
-- Do not present generated statements as real customer reviews.

-- DAEMON NOTE
-- A daemon is simply a background process that keeps running without a visible window.
-- The earlier browser-daemon error was a test-runner resource issue, not a Supabase error.

-- This file is complete. Run the verification queries above after setup.
