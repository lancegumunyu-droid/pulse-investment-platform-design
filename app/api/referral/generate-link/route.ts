import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST() {
  try {
    const supabase = await createClient()
    
    // Get current user
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    // Check if user already has a referral code
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('referral_code')
      .eq('id', user.id)
      .single()

    if (profileError) {
      console.error('[v0] Profile fetch error:', profileError)
      return NextResponse.json(
        { error: 'User profile not found' },
        { status: 404 }
      )
    }

    let referralCode = profile?.referral_code

    // Generate new referral code if doesn't exist
    if (!referralCode) {
      referralCode = `PULSE${Math.random().toString(36).substring(2, 8).toUpperCase()}`
      
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ referral_code: referralCode })
        .eq('id', user.id)

      if (updateError) {
        console.error('[v0] Referral code update error:', updateError)
        return NextResponse.json(
          { error: 'Failed to generate referral code' },
          { status: 500 }
        )
      }
    }

    // Build referral link
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://pulse-investment-platform-design-lancegumunyu-droids-projects.vercel.app'
    const referralLink = `${baseUrl}/auth/sign-up?ref=${referralCode}`

    console.log('[v0] Referral link generated:', referralCode)

    return NextResponse.json({
      referralLink,
      referralCode,
      success: true,
    })
  } catch (error) {
    console.error('[v0] Referral generation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
