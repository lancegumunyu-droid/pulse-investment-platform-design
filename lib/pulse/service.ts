import { createClient } from '@supabase/supabase-js'

/**
 * Service-role client. Bypasses RLS — use ONLY in server actions / route
 * handlers, and ALWAYS scope every query by a userId derived from the
 * verified session.
 *
 * This file does NOT import 'server-only'. That package throws by design
 * when pulled into a client graph. components/pulse/auth-form.tsx is a
 * client component that imports validateReferralCode from
 * app/actions/pulse.ts, and that action reaches this file through
 * data-access.ts — so a server-only guard here previously poisoned the
 * client bundle and made Turbopack report "module has no exports at all"
 * for pulse.ts and everything importing PulseApp.
 *
 * Server-side confinement is enforced two ways instead:
 *  1. The throw below, if this is ever reached from a browser context.
 *  2. SUPABASE_SECRET_KEY / SUPABASE_SERVICE_ROLE_KEY are not NEXT_PUBLIC_
 *     variables and are not listed in next.config.mjs's env map, so they
 *     are undefined in any browser bundle regardless.
 */
export function serviceClient() {
  if (typeof window !== 'undefined') {
    throw new Error('serviceClient() must never be called in the browser.')
  }

  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''

  // Support both standard service role keys and newer secret key definitions
  const key = process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY ?? ''

  if (!url || !key) {
    throw new Error('Supabase administrative credentials are not configured on this server environment.')
  }

  return createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  })
}
