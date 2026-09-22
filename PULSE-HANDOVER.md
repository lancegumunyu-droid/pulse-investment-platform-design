# Pulse Support and Notifications Handover

## Completed

- Added a responsive Support widget to the authenticated Pulse shell.
- Users can choose an issue category, enter a subject and message, and attach a PNG, JPG, WEBP, or PDF screenshot up to 10 MB.
- Tickets are written to `support_tickets` and private screenshots use the `support-attachments` bucket plus `support_attachments` metadata.
- Activated the notification bell against the live `notifications` table using its existing `read` column.
- Added a responsive landing-page FAQ section.
- Added a transparent investor-voices section that is ready for approved real testimonials; no testimonials were fabricated because the phone text was not available in the repository.
- Added installable web-app metadata at `/manifest.webmanifest`, with generated Pulse icons for Add to Home Screen support.
- Preserved mobile safe-area spacing and horizontal overflow behavior.

## Supabase prerequisites

The following tables were confirmed in the live project:

- `announcements`
- `notifications`
- `support_attachments`
- `support_messages`
- `support_tickets`

The support SQL migration must be run successfully in Supabase before submitting tickets. The current user RLS policies protect user-owned tickets, messages, attachments, and notification reads.

## Remaining admin work

Admin-wide ticket inbox, staff replies, announcement broadcasting, and notification fan-out still require the project's authoritative admin authorization table/role column. Do not add broad `using (true)` policies. The next safe step is to inspect that live admin schema, then add narrowly scoped admin policies or server-side admin actions.

## Test commands

```bash
pnpm exec tsc --noEmit
pnpm run build
git diff --check
```

All three checks passed for this change. The build reports only the existing Next.js middleware deprecation warning and expected dynamic-cookie notices for public auth-aware routes.

## Real testimonials

Paste the approved testimonial text, display name/initials, and permission status into the landing content source before publishing the investor-voices section as real social proof.
