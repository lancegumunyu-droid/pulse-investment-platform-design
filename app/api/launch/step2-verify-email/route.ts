import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db/neon-client'
import { PulseEmailService } from '@/lib/email/pulse-email-service'

// Step 2: Email Verification
// POST /api/launch/step2-verify-email
// Verifies email token, marks email as verified, creates KYC approval queue

interface VerifyEmailRequest {
  token: string
}

export async function POST(request: NextRequest) {
  try {
    const body: VerifyEmailRequest = await request.json()
    const { token } = body

    if (!token) {
      return NextResponse.json({ error: 'Verification token required' }, { status: 400 })
    }

    // Find user with this token
    const users = await sql`
      SELECT id, email, full_name, verification_token_expires
      FROM users
      WHERE verification_token = ${token}
        AND verification_token_expires > NOW()
    `

    if (users.length === 0) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 })
    }

    const user = users[0]

    // Update user: mark email as verified
    await sql`
      UPDATE users
      SET 
        email_verified = true,
        email_verified_at = NOW(),
        verification_token = NULL,
        verification_token_expires = NULL
      WHERE id = ${user.id}
    `

    // Create KYC submission queue entry
    await sql`
      INSERT INTO approval_queues (entity_type, entity_id, user_id, status)
      VALUES ('kyc', ${user.id}, ${user.id}, 'pending')
    `

    // Create email verification log
    await sql`
      INSERT INTO email_verifications (user_id, email, token, verified_at)
      VALUES (${user.id}, ${user.email}, ${token}, NOW())
    `

    // Log security event
    await sql`
      INSERT INTO security_logs (user_id, event_type, description, severity)
      VALUES (${user.id}, 'email_verified', 'Email verification completed', 'info')
    `

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.full_name,
        emailVerified: true,
      },
      message: 'Email verified successfully. Your account is ready for KYC.',
    }, { status: 200 })
  } catch (error) {
    console.error('[PULSE API] Email verification error:', error)
    return NextResponse.json({ error: 'Verification failed' }, { status: 500 })
  }
}

// GET: Verify token validity (used for UI checks)
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const token = searchParams.get('token')

    if (!token) {
      return NextResponse.json({ error: 'Token required' }, { status: 400 })
    }

    const users = await sql`
      SELECT id, email, verification_token_expires
      FROM users
      WHERE verification_token = ${token}
        AND verification_token_expires > NOW()
    `

    return NextResponse.json({
      valid: users.length > 0,
      expiresAt: users.length > 0 ? users[0].verification_token_expires : null,
    }, { status: 200 })
  } catch (error) {
    console.error('[PULSE API] Token check error:', error)
    return NextResponse.json({ error: 'Check failed' }, { status: 500 })
  }
}
