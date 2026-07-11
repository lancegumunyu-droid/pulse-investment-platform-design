import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/auth/email-confirmed'

  console.log('[v0] Email confirmation callback initiated')

  if (code) {
    try {
      const supabase = await createClient()
      console.log('[v0] Exchanging code for session...')
      const { error, data } = await supabase.auth.exchangeCodeForSession(code)
      
      if (error) {
        console.error('[v0] Code exchange error:', error.message)
        return NextResponse.redirect(`${origin}/auth/error?message=${encodeURIComponent(error.message)}`)
      }

      if (!data.user) {
        console.error('[v0] No user data returned from code exchange')
        return NextResponse.redirect(`${origin}/auth/error?message=No user data`)
      }

      // Mark email as confirmed in profiles table
      console.log('[v0] Marking email as confirmed for user:', data.user.id)
      const { error: updateError } = await supabase.from('profiles').update({
        email_confirmed: true,
        approval_status: 'pending_admin_approval',
      }).eq('id', data.user.id)

      if (updateError) {
        console.warn('[v0] Profile update warning (non-fatal):', updateError.message)
        // Don't fail if profile update fails - user email is still confirmed
      }

      console.log('[v0] Email confirmation successful for user:', data.user.id)
      return NextResponse.redirect(`${origin}${next}`)
    } catch (err) {
      console.error('[v0] Callback error:', (err as Error).message)
      return NextResponse.redirect(`${origin}/auth/error?message=${encodeURIComponent((err as Error).message)}`)
    }
  } else {
    console.log('[v0] No code provided to callback')
  }

  return NextResponse.redirect(`${origin}/auth/error?message=Invalid confirmation link`)
}
