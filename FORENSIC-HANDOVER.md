# Pulse forensic handover

## Scope
This handover records the repair completed after the failed Vercel deployment from commit `7d5b192`.

## Deployment blocker repaired
- `components/pulse/project-rail.tsx` and `components/pulse/rotating-projects.tsx` imported `PULSE_PROJECTS` and `PulseProject`.
- `lib/pulse-data.ts` only exported `PROJECTS` and `Project`, so Turbopack failed with `Export PULSE_PROJECTS doesn't exist`.
- Added a typed canonical `PULSE_PROJECTS` projection from `PROJECTS`, preserving the existing project IDs, amounts, targets, risk labels, summaries, and local image paths.
- This is an idempotent code-only repair; it does not write, delete, or transform database rows.

## Data safety status
- No production database mutation was performed during this repair.
- No user balances, cards, referrals, Pulse IDs, or transaction records were overwritten.
- The canonical live Supabase schema must remain the source of truth for user and financial data. Static project data is only a display fallback and must not be used for transaction authorization.
- Before any production backfill, run duplicate/orphan checks against the actual live column names and review the generated report. Never backfill by email alone; use the authenticated user UUID and unique constraints.

## Turnstile
- Login and sign-up use the supplied site key through `@marsidev/react-turnstile`.
- The token is passed to Supabase Auth for sign-up and password login.
- The deployed environment must have the matching Turnstile secret configured and Cloudflare hostname rules must include the deployed Vercel hostname and production domain. A visible `Troubleshoot` frame indicates a Cloudflare hostname/secret/widget configuration issue, not a Supabase data migration.

## Verification required before publishing
1. `pnpm install --frozen-lockfile`
2. `pnpm exec tsc --noEmit`
3. `pnpm run build`
4. Browser-check `/auth/login`, `/auth/sign-up`, `/app`, and admin routes with a real authenticated account.
5. Confirm Supabase RLS and service-role boundaries before enabling any data repair migration.
6. Publish only after the Vercel build is green.

## Outstanding forensic work
A full two-month reconciliation of Pulse IDs, referral links, cards, wallets, holdings, and transactions requires the exact live Supabase schema and a read-only report query. No guessed repair should be applied from this branch. Any approved repair should be delivered as a reviewed, idempotent migration with a before/after count report and rollback plan.
