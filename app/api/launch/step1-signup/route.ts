import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db/neon-client'
import { PulseEmailService } from '@/lib/email/pulse-email-service'

// Step 1: User Signup
// POST /api/launch/step1-signup
// Creates user account, generates verification token, sends email

interface SignupRequest {
  email: string
  password: string
  fullName: string
  referralCode?: string
}

export async function POST(request: NextRequest) {
  try {
    const body: SignupRequest = await request.json()
    const { email, password, fullName, referralCode } = body

    // Validation
    if (!email || !password || !fullName) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    if (password.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 })
    }

    // Check if email already exists
    const existingUser = await sql`SELECT id FROM users WHERE email = ${email}`
    if (existingUser.length > 0) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 409 })
    }

    // Hash password
    const crypto = require('crypto')
    const passwordHash = crypto.createHash('sha256').update(password).digest('hex')

    // Generate referral code
    const referralCode_ = `PULSE${Math.random().toString(36).substring(2, 8).toUpperCase()}`

    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString('hex')
    const verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

    // Create user
    const result = await sql`
      INSERT INTO users (
        email, 
        password_hash, 
        full_name,
        referral_code,
        verification_token,
        verification_token_expires
      ) VALUES (
        ${email},
        ${passwordHash},
        ${fullName},
        ${referralCode_},
        ${verificationToken},
        ${verificationTokenExpires}
      )
      RETURNING id, email, full_name, referral_code
    `

    if (!result || result.length === 0) {
      return NextResponse.json({ error: 'Failed to create user' }, { status: 500 })
    }

    const user = result[0]

    // Create wallet with $35 welcome bonus
    await sql`
      INSERT INTO wallets (user_id, welcome_bonus, currency)
      VALUES (${user.id}, 35.00, 'USDT')
    `

    // Create verification email
    const verificationLink = `${process.env.NEXT_PUBLIC_APP_URL || 'https://pulse-invest.vercel.app'}/auth/verify?token=${verificationToken}`

    const emailSent = await PulseEmailService.sendVerificationEmail(
      email,
      fullName,
      verificationLink
    )

    // Handle referral if provided
    if (referralCode) {
      const referrer = await sql`SELECT id FROM users WHERE referral_code = ${referralCode}`
      if (referrer.length > 0) {
        await sql`
          INSERT INTO referrals (referrer_id, referred_user_id, referral_code, status)
          VALUES (${referrer[0].id}, ${user.id}, ${referralCode}, 'pending')
        `
      }
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.full_name,
        referralCode: user.referral_code,
      },
      message: 'Signup successful. Verification email sent.',
      emailSent,
    }, { status: 201 })
  } catch (error) {
    console.error('[PULSE API] Signup error:', error)
    return NextResponse.json({ error: 'Signup failed' }, { status: 500 })
  }
}
