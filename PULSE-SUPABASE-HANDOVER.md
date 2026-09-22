# PULSE Supabase Handover

**Project:** Pulse Investment Platform
**Purpose:** Complete Supabase setup, security, admin access, project controls, announcements, notifications, support, and verification handover.

> This document contains setup instructions and SQL. It does not contain passwords, service-role keys, or private credentials.

## 1. Required access

You need:

- Supabase project Owner or database owner access.
- Access to **SQL Editor**.
- Access to **Authentication → Users**.
- Access to **Authentication → URL Configuration**.
- Access to **Storage → Buckets**.
- The deployed Vercel project environment variables.

Never paste `SUPABASE_SERVICE_ROLE_KEY` into browser code, Git, screenshots, or public documentation. Only server-side code may use it.

## 2. Vercel environment variables

Set these in Vercel project settings for Development, Preview, and Production as appropriate:

```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_PUBLISHABLE_OR_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY=YOUR_SERVICE_ROLE_KEY
```

Use the current Supabase publishable key where available. The service-role key must remain server-only and must never use the `NEXT_PUBLIC_` prefix.

After changing variables, redeploy and sign out/in so the browser receives a fresh session.

## 3. Supabase Auth configuration

In **Authentication → URL Configuration**:

- Site URL: your real production URL, for example `https://pulseinvest.uk`.
- Add the production callback URL:
  `https://pulseinvest.uk/auth/callback`
- Add the exact Vercel preview callback URL when testing previews:
  `https://YOUR-VERCEL-DOMAIN/auth/callback`
- Do not add broad wildcard origins unless required for a controlled preview workflow.

In **Authentication → Providers**:

- Enable Email provider.
- Confirm email behavior matches the product requirement.
- If email confirmation is enabled, users must confirm before accessing protected areas.
- Configure SMTP for production email delivery; the default mail service is rate-limited.

## 4. Turnstile / Cloudflare verification

The login form uses Cloudflare Turnstile. Configure:

- `NEXT_PUBLIC_TURNSTILE_SITE_KEY` in Vercel.
- The matching Turnstile secret on the server if server-side verification is enabled.
- The exact production host and the exact Vercel preview host in the Turnstile widget allowed domains.

If the widget displays “Unable to connect to website”:

1. Test without ad/privacy extensions.
2. Test another network or an incognito window.
3. Confirm `challenges.cloudflare.com` is not blocked.
4. Confirm the site key belongs to the same Turnstile widget as the configured domain.
5. Redeploy after changing the Vercel variable.

Do not bypass Turnstile in production.

## 5. Run the SQL scripts in this order

Run the scripts in **Supabase SQL Editor** as a project owner/database owner:

1. `scripts/migrate.sql` — core profiles, accounts, ledger, holdings, KYC, staking, governance, and base RLS.
2. `scripts/pulse-admin.sql` — admin and operational tables/functions from this branch.
3. `scripts/pulse-final-supabase.sql` — support, announcements, notification policies, admin audit, and broadcast helpers.

Run each script separately. If a statement fails, stop and save the exact error before continuing. Do not guess column names or silently skip failed statements.

## 6. Admin identity setup

1. Create the admin user in **Authentication → Users**.
2. Copy the user UUID.
3. Replace `YOUR_AUTH_USER_UUID` in the admin statements below.
4. Run the statements.
5. Sign out and sign back in.

```sql
update public.profiles
set role = 'admin', updated_at = now()
where id = 'YOUR_AUTH_USER_UUID';

insert into public.user_roles (user_id, role)
values ('YOUR_AUTH_USER_UUID', 'admin')
on conflict (user_id) do update set role = excluded.role;
```

If `public.user_roles` does not exist, inspect the actual admin schema first:

```sql
select table_name
from information_schema.tables
where table_schema = 'public'
order by table_name;

select table_name, column_name, data_type
from information_schema.columns
where table_schema = 'public'
  and table_name in ('profiles', 'user_roles', 'admin_allowlist')
order by table_name, ordinal_position;
```

Do not create a second authorization system without checking the existing one. Authorization must use a server-controlled role/app-metadata source, never editable user metadata.

## 7. Core security rules

All exposed public tables must have RLS enabled. RLS controls rows; grants control whether the Data API can access a table at all.

Use these rules:

- User-owned rows must include an ownership predicate such as `(select auth.uid()) = user_id`.
- Admin policies must call `public.is_pulse_admin()` or the project’s authoritative admin function.
- `UPDATE` policies need both `USING` and `WITH CHECK`.
- Do not use `auth.role() = 'authenticated'` for authorization.
- Do not use `using (true)` for admin access.
- Never authorize from `raw_user_meta_data` or editable `user_metadata`.
- Keep security-definer functions out of exposed schemas unless absolutely necessary.
- Revoke public execution on privileged functions.
- Keep support attachments in a private Storage bucket.

## 8. Admin project management requirements

The admin Projects view must query all project records, not only records whose status is `open`.

The UI should provide filters for:

- All
- Open
- Closing soon
- Closed
- Archived

Closed projects must remain visible and controllable. Admin actions should include:

- View project details.
- Set or update closing/opening schedule.
- Close project.
- Reopen project when policy allows.
- Archive project.
- Process component yield.
- Review the audit log.

Every state-changing action must be server-side, validate the actor as admin, write an audit record, and return a clear success/error result.

Recommended project status values:

```text
open | closing | closed | archived
```

If the existing project table uses different names, preserve the current schema and map the UI labels to the existing values rather than creating duplicate project tables.

## 9. Announcements

The admin panel should expose a dedicated **Announcements** section. It should support:

- Draft, scheduled, published, and archived states.
- Title and message.
- Audience selection.
- Preview before publishing.
- Publish now or schedule.
- Edit drafts and scheduled notices.
- Archive published notices.
- Notification fan-out to existing profiles.
- Audit entry for create, edit, publish, and archive actions.

The existing helper is:

```sql
select public.publish_pulse_announcement('ANNOUNCEMENT_UUID');
```

Only an authenticated admin may execute it. Verify the notification table columns before using it:

```sql
select column_name, data_type
from information_schema.columns
where table_schema = 'public'
  and table_name = 'notifications'
order by ordinal_position;
```

If the notification schema does not have `title`, `body`, `read`, and `created_at`, stop and adapt the function to the actual schema. Do not guess.

## 10. Notifications and support

The final SQL adds admin access for:

- Reading and updating support tickets.
- Reading support messages.
- Inserting staff replies.
- Reading user attachments where permitted.
- Creating and managing announcements.
- Creating notifications for approved admin broadcasts.
- Recording admin actions.

The support reply trigger notifies the ticket owner and changes the ticket status to `waiting_on_user`.

Test with a normal user and an admin separately. A user must never be able to read another user’s tickets, messages, balances, KYC, or notifications.

## 11. Sound and notification behavior

Browser audio is blocked until a user gesture. The app must initialize audio only after a click/tap, expose a visible sound preference, and avoid autoplay on page load.

Recommended behavior:

- Sound preference defaults to off or respects the browser setting.
- A visible sound toggle exists in the authenticated shell/admin shell.
- A “Test sound” action confirms that audio is available.
- Critical admin events may play a short, non-looping alert only when sound is enabled.
- Every sound event also has a visual notification so sound is never the only signal.
- Respect `prefers-reduced-motion` and do not use excessive repeated alerts.

This behavior is client-side and does not require a Supabase table unless the preference must sync across devices. If synced, add a user preference field/table protected by `user_id` RLS.

## 12. Storage setup

Create a private bucket named:

```text
support-attachments
```

Do not make the bucket public. Storage upsert requires `INSERT`, `SELECT`, and `UPDATE` policies. Prefer signed URLs from a server action for staff/user access.

Confirm bucket status:

```sql
select id, name, public
from storage.buckets
where id = 'support-attachments' or name = 'support-attachments';
```

## 13. Verification queries

Run after all setup scripts:

```sql
select table_name
from information_schema.tables
where table_schema = 'public'
  and table_name in (
    'profiles', 'accounts', 'transactions', 'holdings',
    'staking_positions', 'kyc_submissions', 'governance_votes',
    'admin_allowlist', 'support_tickets', 'support_messages',
    'support_attachments', 'announcements', 'notifications',
    'admin_audit_log'
  )
order by table_name;

select schemaname, tablename, policyname, permissive, roles, cmd
from pg_policies
where schemaname = 'public'
order by tablename, policyname;

select table_name, row_security
from information_schema.tables
where table_schema = 'public'
order by table_name;

select (select public.is_pulse_admin()) as current_session_is_admin;
```

`current_session_is_admin` is only meaningful while authenticated as the admin user. Run it from the authenticated application/session or use the admin UI to verify access.

## 14. Functional test checklist

### Normal user

- Sign up.
- Confirm email if required.
- Sign in through Turnstile.
- Read only their own profile/account/holdings/transactions.
- Submit a support ticket.
- Read their own notifications.
- Cannot read admin audit rows.
- Cannot read another user’s data.
- Cannot publish announcements.
- Cannot change project status.

### Admin

- Sign in with the admin account.
- Open Admin → Projects.
- Confirm all projects appear, including closed projects.
- Filter Open, Closing, Closed, and Archived.
- Update a schedule and verify an audit row.
- Close/reopen/archive only according to policy.
- Open Admin → Announcements.
- Save a draft, preview it, publish it, and verify notification fan-out.
- Reply to a support ticket and verify the owner notification.
- Confirm sound toggle and test sound work after a click.

## 15. Audit and monitoring

After schema changes:

- Review Supabase Database Advisors.
- Review Auth logs for failed login/verification events.
- Review Postgres logs for policy/function errors.
- Confirm no service-role key appears in client bundles.
- Confirm Vercel deployment variables exist in the intended environments.
- Confirm all SQL scripts and lockfiles are committed.

## 16. Safe recovery procedure

If a SQL statement fails:

1. Copy the full error message.
2. Identify the exact statement that failed.
3. Inspect the relevant table/function schema.
4. Do not rerun unrelated destructive SQL.
5. Do not drop tables, policies, users, balances, or transactions to make a script pass.
6. Create a small corrective migration after the schema is understood.
7. Re-run verification queries.

Never delete financial records to repair a UI or RLS issue.

## 17. Deployment handover

After SQL and environment variables are complete:

```bash
pnpm exec tsc --noEmit
pnpm run build
git diff --check
```

Then deploy through the connected Vercel project. Test the deployed URL, not only the local preview. Confirm the exact production domain is included in Supabase Auth and Turnstile configuration.

## 18. Important warnings

- Do not publish fabricated testimonials or private phone numbers.
- Do not store credentials in Markdown, Git, screenshots, or chat.
- Do not use client-side-only checks for admin authorization.
- Do not expose service-role credentials.
- Do not assume a successful SQL editor message means the application can access a table; verify grants, RLS, and the live app flow.
- Do not hide closed projects from admins; closed is an operational state, not deletion.

## 19. Source files in this repository

- `scripts/migrate.sql` — core schema and base RLS.
- `scripts/pulse-admin.sql` — admin/operational SQL.
- `scripts/pulse-final-supabase.sql` — support, announcements, notifications, and audit SQL.
- `lib/supabase/client.ts` — browser client.
- `lib/supabase/server.ts` — server client.
- `lib/supabase/proxy.ts` — session/proxy handling.
- `app/auth/callback/route.ts` — auth callback.
- `app/setup/supabase/page.tsx` — setup preview route.

## Completion sign-off

- [ ] Environment variables configured.
- [ ] Auth URLs configured.
- [ ] Turnstile domains and keys configured.
- [ ] Core SQL completed.
- [ ] Admin authorization verified.
- [ ] RLS policies reviewed.
- [ ] Storage bucket private.
- [ ] Project filters show closed records.
- [ ] Announcements tested.
- [ ] Notifications tested.
- [ ] Sound toggle/tested after user gesture.
- [ ] Typecheck/build/diff checks passed.
- [ ] Production deployment tested.

**End of handover.**

Copy the Markdown from the preview route, or download the repository file `PULSE-SUPABASE-HANDOVER.md`.
