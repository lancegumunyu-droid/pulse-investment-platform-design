/**
 * Email Service Integration
 * AgentMail for sending transactional emails
 * Manages verification, notifications, and marketing emails
 */

import { INTEGRATION_CONFIG } from '@/lib/pulse/integrations-config'

export interface EmailOptions {
  to: string
  subject: string
  html: string
  text?: string
  from?: string
  replyTo?: string
}

export interface EmailResponse {
  success: boolean
  messageId?: string
  error?: string
  timestamp: string
}

// AgentMail client
export class EmailClient {
  private apiKey: string
  private apiUrl = 'https://api.agentmail.io/v1/send'

  constructor() {
    this.apiKey = INTEGRATION_CONFIG.email.keys.apiKey || ''
  }

  async isConfigured(): Promise<boolean> {
    return INTEGRATION_CONFIG.email.isConfigured
  }

  async sendEmail(options: EmailOptions): Promise<EmailResponse> {
    try {
      if (!this.apiKey) {
        return {
          success: false,
          error: 'Email service not configured - AGENTMAIL_API_KEY missing',
          timestamp: new Date().toISOString(),
        }
      }

      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          to: options.to,
          from: options.from || 'noreply@pulseinvestme.com',
          subject: options.subject,
          html: options.html,
          text: options.text || '',
          replyTo: options.replyTo,
        }),
      })

      if (!response.ok) {
        const error = await response.text()
        return {
          success: false,
          error: `Email send failed: ${error}`,
          timestamp: new Date().toISOString(),
        }
      }

      const data = await response.json()

      return {
        success: true,
        messageId: data.messageId || data.id,
        timestamp: new Date().toISOString(),
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown email error',
        timestamp: new Date().toISOString(),
      }
    }
  }

  // Email templates
  async sendVerificationEmail(email: string, verificationLink: string): Promise<EmailResponse> {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Verify Your Email</h2>
        <p>Click the button below to verify your email and activate your PULSE account:</p>
        <a href="${verificationLink}" style="display: inline-block; padding: 12px 24px; background-color: #f59e0b; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0;">
          Verify Email
        </a>
        <p>Or copy and paste this link:</p>
        <p><code>${verificationLink}</code></p>
        <p>This link expires in 24 hours.</p>
      </div>
    `

    return this.sendEmail({
      to: email,
      subject: 'Verify Your PULSE Account',
      html,
      text: `Verify your email by visiting: ${verificationLink}`,
    })
  }

  async sendWelcomeBonusEmail(email: string, bonusAmount: number = 35): Promise<EmailResponse> {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Welcome to PULSE!</h2>
        <p>Your account has been approved! 🎉</p>
        <p>You've received a <strong>$${bonusAmount} USDT welcome bonus</strong>.</p>
        <p>To unlock your bonus, make your first deposit today.</p>
        <a href="https://pulseinvestme.com/app" style="display: inline-block; padding: 12px 24px; background-color: #f59e0b; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0;">
          Make Your First Deposit
        </a>
      </div>
    `

    return this.sendEmail({
      to: email,
      subject: `Welcome to PULSE - $${bonusAmount} Bonus Waiting`,
      html,
    })
  }

  async sendReferralEmail(email: string, referralLink: string, referrerName: string): Promise<EmailResponse> {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Join PULSE Through ${referrerName}'s Referral</h2>
        <p>${referrerName} invited you to join PULSE and earn money on real African projects!</p>
        <p>Get <strong>$35 USDT welcome bonus</strong> when you sign up through this link:</p>
        <a href="${referralLink}" style="display: inline-block; padding: 12px 24px; background-color: #f59e0b; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0;">
          Sign Up with Referral
        </a>
        <p>PULSE Investment Platform - Invest in Real African Projects. Grow Responsibly.</p>
      </div>
    `

    return this.sendEmail({
      to: email,
      subject: `Join PULSE - Earn with ${referrerName}`,
      html,
    })
  }

  async sendKycApprovedEmail(email: string, bonusAmount: number = 35): Promise<EmailResponse> {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>KYC Approved! ✓</h2>
        <p>Great news! Your KYC verification has been approved.</p>
        <p>You now have access to:</p>
        <ul>
          <li>$${bonusAmount} USDT welcome bonus</li>
          <li>Full investment platform</li>
          <li>Deposit and withdraw funds</li>
          <li>Access to float</li>
        </ul>
        <a href="https://pulseinvestme.com/app" style="display: inline-block; padding: 12px 24px; background-color: #f59e0b; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0;">
          Go to Dashboard
        </a>
      </div>
    `

    return this.sendEmail({
      to: email,
      subject: 'KYC Approved - Welcome to PULSE',
      html,
    })
  }

  async sendDepositRequestEmail(email: string, amount: number, currency: string = 'USDT'): Promise<EmailResponse> {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Deposit Request Received</h2>
        <p>Your deposit request has been received and is pending admin approval.</p>
        <p><strong>Amount:</strong> $${amount} ${currency}</p>
        <p>You will receive an email once your deposit has been approved and credited.</p>
        <p>Expected time: 1-2 business hours</p>
      </div>
    `

    return this.sendEmail({
      to: email,
      subject: `Deposit Request - $${amount} ${currency}`,
      html,
    })
  }
}

// Singleton instance
let emailClientInstance: EmailClient | null = null

export function getEmailClient(): EmailClient {
  if (!emailClientInstance) {
    emailClientInstance = new EmailClient()
  }
  return emailClientInstance
}

// Email service status
export async function getEmailServiceStatus() {
  const client = getEmailClient()
  const configured = await client.isConfigured()

  return {
    service: 'AgentMail',
    provider: 'agentmail',
    configured,
    apiKey: INTEGRATION_CONFIG.email.keys.apiKey ? 'configured' : 'missing',
    timestamp: new Date().toISOString(),
  }
}
