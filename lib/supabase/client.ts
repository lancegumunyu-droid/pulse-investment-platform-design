import { createBrowserClient } from '@supabase/ssr'

// These are injected at build time via next.config.mjs env mapping.
// They resolve to empty strings in cold dev-server starts before the
// Supabase integration env vars are available — createBrowserClient
// is guarded below so it never throws in that case.
const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || ''
const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  process.env.SUPABASE_PUBLISHABLE_KEY || ''

export function isSupabaseConfigured() {
  return !!SUPABASE_URL && !!SUPABASE_ANON_KEY
}

export function createClient() {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new Error(
      'Supabase is not configured. Go to Settings → Vars in your v0 project ' +
      'and confirm NEXT_PUBLIC_SUPABASE_URL plus a Supabase publishable or anon key are set.',
    )
  }
  return createBrowserClient(SUPABASE_URL, SUPABASE_ANON_KEY)
}
