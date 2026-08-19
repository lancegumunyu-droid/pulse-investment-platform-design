import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export const runtime = 'nodejs'

export async function GET(request: Request) {
  const authorization = request.headers.get('authorization')
  const expected = process.env.CRON_SECRET

  if (!expected || authorization !== `Bearer ${expected}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabaseUrl = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    return NextResponse.json({ error: 'Supabase server configuration is incomplete' }, { status: 503 })
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })

  const { data, error } = await supabase.rpc('process_mature_investments')

  if (error) {
    console.error('[v0] Auto-close processing failed:', error.message)
    return NextResponse.json({ error: 'Auto-close processing failed' }, { status: 500 })
  }

  return NextResponse.json({ ok: true, enabled: true, ...((data as { processed?: number }) ?? {}) })
}
