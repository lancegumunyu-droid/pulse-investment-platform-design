import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/app'

  if (code) {
    try {
      const supabase = await createClient()
      const { error, data } = await supabase.auth.exchangeCodeForSession(code)
      if (!error && data.user) {
        // Mark email as confirmed in profiles table
        await supabase.from('profiles').update({
          email_confirmed: true,
          approval_status: 'pending_admin_approval',
        }).eq('id', data.user.id)
        
        console.log('[v0] Email confirmation successful for user:', data.user.id)
        return NextResponse.redirect(`${origin}${next}`)
      } else {
        console.error('[v0] Email confirmation failed:', error?.message)
      }
    } catch (err) {
      console.error('[v0] Callback error:', (err as Error).message)
    }
  } else {
    console.log('[v0] No code provided to callback')
  }

  return NextResponse.redirect(`${origin}/auth/error`)
}
