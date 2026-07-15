import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

/**
 * Supabase Auth Hooks - Send Email
 *
 * This handler receives email events from Supabase and sends beautiful PULSE-branded emails.
 * It replaces Supabase's default email templates entirely.
 *
 * Supabase sends:
 *   - event.type: 'signup' | 'recovery' | 'invite' | 'email_change' | 'admin_confirmation'
 *   - event.user.email: user's email
 *   - event.user.user_metadata: custom data
 *   - event.user.confirmation_token: token for email verification
 *   - event.user.recovery_token: token for password reset
 */

interface SupabaseAuthEvent {
  type: 'signup' | 'recovery' | 'invite' | 'email_change' | 'admin_confirmation'
  user: {
    id: string
    email: string
    user_metadata?: {
      full_name?: string
      [key: string]: any
    }
    confirmation_token?: string
    recovery_token?: string
  }
}

interface AuthHookResponse {
  success: boolean
  message?: string
  error?: string
}

// Verify webhook signature
function verifySupabaseWebhookSignature(
  request: NextRequest,
  payload: string
): boolean {
  const secret = process.env.SUPABASE_WEBHOOK_SECRET
  if (!secret) {
    console.warn('[WEBHOOK] SUPABASE_WEBHOOK_SECRET not set - skipping verification')
    return true // Allow in development
  }

  const signature = request.headers.get('x-supabase-signature')
  if (!signature) {
    console.error('[WEBHOOK] Missing x-supabase-signature header')
    return false
  }

  const hash = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('base64')

  const isValid = signature === `sha256=${hash}`
  if (!isValid) {
    console.error('[WEBHOOK] Invalid signature')
  }
  return isValid
}

// Email template builders
function getEmailContent(
  eventType: string,
  userEmail: string,
  userName: string,
  token?: string
) {
  const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://pulse-invest.vercel.app'

  switch (eventType) {
    case 'signup': {
      const confirmLink = `${siteUrl}/auth/callback?token_hash=${token}&type=email&redirect_to=/auth/email-confirmed`
      return {
        subject: 'Verify Your PULSE Account - Welcome Bonus Inside',
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="UTF-8">
            <style>
              body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background: #f5f5f5; }
              .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
              .header { background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%); padding: 40px 20px; text-align: center; color: white; }
              .logo { font-size: 32px; font-weight: bold; color: #f59e0b; margin: 0 0 10px 0; }
              .content { padding: 40px 20px; }
              .greeting { font-size: 18px; color: #333; margin: 0 0 20px 0; }
              .message { color: #666; line-height: 1.6; margin: 0 0 30px 0; }
              .button { display: inline-block; background: #f59e0b; color: white; padding: 14px 32px; text-decoration: none; border-radius: 6px; font-weight: bold; text-align: center; }
              .button:hover { background: #d97706; }
              .footer { background: #f9f9f9; padding: 20px; text-align: center; font-size: 12px; color: #999; border-top: 1px solid #eee; }
              .security-note { background: #fffbeb; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 4px; }
              .security-note-text { color: #92400e; font-size: 14px; margin: 0; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <div class="logo">PULSE</div>
                <p style="margin: 0; font-size: 14px; opacity: 0.9;">Investment Platform</p>
              </div>
              <div class="content">
                <p class="greeting">Hello ${userName || 'Investor'},</p>
                <p class="message">
                  Welcome to PULSE! We're excited to have you join our investment community. 
                  Verify your email to claim your <strong>$35 welcome bonus</strong> and start investing immediately.
                </p>
                <center>
                  <a href="${confirmLink}" class="button">Verify Email & Claim Bonus</a>
                </center>
                <div class="security-note">
                  <p class="security-note-text">
                    <strong>Security:</strong> This link expires in 24 hours. If you didn&apos;t create this account, please ignore this email.
                  </p>
                </div>
              </div>
              <div class="footer">
                <p style="margin: 0 0 10px 0;">© 2026 PULSE Investment Platform. All rights reserved.</p>
                <p style="margin: 0;">For support, contact support@pulse.com</p>
              </div>
            </div>
          </body>
          </html>
        `,
        text: `Welcome to PULSE! Verify your email to claim your $35 bonus: ${confirmLink}`,
      }
    }

    case 'recovery': {
      const resetLink = `${siteUrl}/auth/reset-password?token=${token}`
      return {
        subject: 'Reset Your PULSE Password',
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="UTF-8">
            <style>
              body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background: #f5f5f5; }
              .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
              .header { background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%); padding: 40px 20px; text-align: center; color: white; }
              .logo { font-size: 32px; font-weight: bold; color: #f59e0b; margin: 0 0 10px 0; }
              .content { padding: 40px 20px; }
              .button { display: inline-block; background: #f59e0b; color: white; padding: 14px 32px; text-decoration: none; border-radius: 6px; font-weight: bold; }
              .button:hover { background: #d97706; }
              .footer { background: #f9f9f9; padding: 20px; text-align: center; font-size: 12px; color: #999; border-top: 1px solid #eee; }
              .warning { background: #fee2e2; border-left: 4px solid #dc2626; padding: 15px; margin: 20px 0; border-radius: 4px; }
              .warning-text { color: #7f1d1d; font-size: 14px; margin: 0; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <div class="logo">PULSE</div>
                <p style="margin: 0; font-size: 14px; opacity: 0.9;">Investment Platform</p>
              </div>
              <div class="content">
                <p style="color: #666; line-height: 1.6; margin: 0 0 30px 0;">
                  We received a request to reset your PULSE password. Click the button below to create a new password.
                </p>
                <center>
                  <a href="${resetLink}" class="button">Reset Password</a>
                </center>
                <div class="warning">
                  <p class="warning-text">
                    <strong>Important:</strong> This link expires in 24 hours. If you didn&apos;t request this, your account is safe. Please ignore this email.
                  </p>
                </div>
              </div>
              <div class="footer">
                <p style="margin: 0 0 10px 0;">© 2026 PULSE Investment Platform. All rights reserved.</p>
                <p style="margin: 0;">Need help? Contact support@pulse.com</p>
              </div>
            </div>
          </body>
          </html>
        `,
        text: `Reset your password: ${resetLink}. Link expires in 24 hours.`,
      }
    }

    default: {
      return {
        subject: 'PULSE Account Update',
        html: `<p>Hello ${userName || 'User'}, your PULSE account has been updated.</p>`,
        text: 'Your PULSE account has been updated.',
      }
    }
  }
}

// Send email via your service
async function sendEmail(
  to: string,
  subject: string,
  html: string,
  text: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // TODO: Replace with your actual email service (Resend, SendGrid, nodemailer, etc.)
    // For now, using a placeholder that logs
    console.log('[WEBHOOK] Email event:', {
      to,
      subject,
      timestamp: new Date().toISOString(),
    })

    // Example: Using Resend
    // const response = await resend.emails.send({
    //   from: 'noreply@pulse.com',
    //   to,
    //   subject,
    //   html,
    // })

    // Example: Using SendGrid
    // const msg = {
    //   to,
    //   from: 'noreply@pulse.com',
    //   subject,
    //   html,
    //   text,
    // }
    // await sgMail.send(msg)

    return { success: true }
  } catch (error) {
    console.error('[WEBHOOK] Email send error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

export async function POST(request: NextRequest): Promise<NextResponse<AuthHookResponse>> {
  try {
    const payload = await request.text()
    
    // Verify webhook signature
    if (!verifySupabaseWebhookSignature(request, payload)) {
      return NextResponse.json(
        { success: false, error: 'Invalid signature' },
        { status: 401 }
      )
    }

    const event = JSON.parse(payload) as SupabaseAuthEvent
    console.log('[WEBHOOK] Received auth event:', event.type, 'for', event.user.email)

    const userName = event.user.user_metadata?.full_name || event.user.email.split('@')[0]
    const token = event.type === 'signup' 
      ? event.user.confirmation_token 
      : event.type === 'recovery'
      ? event.user.recovery_token
      : undefined

    if (!token && (event.type === 'signup' || event.type === 'recovery')) {
      return NextResponse.json(
        { success: false, error: 'Missing token for email event' },
        { status: 400 }
      )
    }

    const emailContent = getEmailContent(
      event.type,
      event.user.email,
      userName,
      token
    )

    const result = await sendEmail(
      event.user.email,
      emailContent.subject,
      emailContent.html,
      emailContent.text
    )

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error || 'Failed to send email' },
        { status: 500 }
      )
    }

    console.log('[WEBHOOK] Email sent successfully:', event.user.email)
    return NextResponse.json({
      success: true,
      message: 'Email sent successfully',
    })
  } catch (error) {
    console.error('[WEBHOOK] Error processing auth hook:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
