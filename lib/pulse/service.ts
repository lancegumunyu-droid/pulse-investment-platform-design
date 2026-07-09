import 'server-only'
import { createClient } from '@supabase/supabase-js'

// Service-role client. Bypasses RLS — use ONLY in server actions / route handlers,
// and ALWAYS scope every query by a userId derived from the verified session.
export function serviceClient() {
  const url =
    process.env.SUPABASE_URL ??
    process.env.NEXT_PUBLIC_SUPABASE_URL ??
    ''
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? ''
  if (!url || !key) {
    throw new Error('Supabase service credentials are not configured.')
  }
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}
