import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const hasSupabaseConfig = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      (process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
  )

  if (!hasSupabaseConfig) {
    return NextResponse.json({ authorized: false, reason: 'unconfigured' }, { status: 503 })
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return NextResponse.json({ authorized: false }, { status: 401 })

  const { data: rawProfile, error } = await supabase
    .from('profiles')
    .select('role, admin_approved, admin_scope')
    .eq('id', user.id)
    .maybeSingle()
  const profile = rawProfile as { role: string | null; admin_approved: boolean | null; admin_scope: string | null } | null

  if (error || profile?.role !== 'admin' || profile.admin_approved !== true) {
    return NextResponse.json({ authorized: false }, { status: 403 })
  }

  return NextResponse.json({ authorized: true, scope: profile.admin_scope ?? 'operations' })
}

export const runtime = 'nodejs'
