import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import type { EmailOtpType } from '@supabase/supabase-js'

/**
 * Email verification callback handler.
 * 
 * Called when user clicks email verification link with:
 *   ?token_hash=<hash>&type=email&redirect_to=/auth/email-confirmed
 * 
 * Exchange: token_hash + type → OTP verification → session
 * Match Supabase email template: {{ .SiteURL }}/auth/callback?token_hash={{ .TokenHash }}&type=email&redirect_to=/auth/email-confirmed
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type') as EmailOtpType | null
  const redirectTo = searchParams.get('redirect_to') ?? '/auth/email-confirmed'

  // Verify required parameters
  if (!token_hash || !type) {
    return NextResponse.redirect(`${origin}/auth/error?message=Missing token parameters`)
  }

  try {
    const supabase = await createClient()
    
    // Verify the OTP token
    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash,
    })

    if (error) {
      return NextResponse.redirect(
        `${origin}/auth/error?message=${encodeURIComponent(error.message)}`
      )
    }

    // Mark email as confirmed in profiles table
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          email_confirmed: true,
          approval_status: 'pending_admin_approval',
        })
        .eq('id', user.id)

      if (updateError) {
        // Non-fatal: user email is verified even if profile update fails
      }
    }

    return NextResponse.redirect(`${origin}${redirectTo}`)
  } catch (err) {
    return NextResponse.redirect(
      `${origin}/auth/error?message=${encodeURIComponent((err as Error).message)}`
    )
  }
}
