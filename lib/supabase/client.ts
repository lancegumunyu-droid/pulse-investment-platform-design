import { createBrowserClient } from '@supabase/ssr'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

export function isSupabaseConfigured() {
  const configured = !!(SUPABASE_URL && SUPABASE_ANON_KEY)
  console.log('[v0] Supabase config check:', {
    url: SUPABASE_URL ? 'SET' : 'MISSING',
    key: SUPABASE_ANON_KEY ? 'SET' : 'MISSING',
    configured,
  })
  return configured
}

export function createClient() {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.error('[v0] Supabase configuration error:', {
      url: SUPABASE_URL ? 'present' : 'MISSING',
      key: SUPABASE_ANON_KEY ? 'present' : 'MISSING',
    })
    throw new Error(
      'Supabase is not configured. Ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set.',
    )
  }
  return createBrowserClient(SUPABASE_URL, SUPABASE_ANON_KEY)
}
