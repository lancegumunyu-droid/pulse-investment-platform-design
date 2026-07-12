import nodemailer from 'nodemailer'

// PULSE Email Service - Universal Email System
// All emails are branded as PULSE only
// No external integration names visible to users

interface EmailTemplate {
  subject: string
  html: string
  text: string
}

const PULSE_BRANDING = {
  companyName: 'PULSE',
  supportEmail: 'support@pulse.com',
  noreplyEmail: 'noreply@pulse.com',
  brandColor: '#f59e0b', // Gold
  logoUrl: 'https://pulse-invest.com/logo.png',
  websiteUrl: 'https://pulse-invest.com',
}

// Email transporter using AgentMail backend (hidden from users)
const transporter = nodemailer.createTransport({
  host: process.env.AGENTMAIL_SMTP_HOST || 'smtp.agentmail.com',
  port: parseInt(process.env.AGENTMAIL_SMTP_PORT || '587'),
  secure: process.env.AGENTMAIL_SMTP_SECURE === 'true',
  auth: {
    user: process.env.AGENTMAIL_SMTP_USER || process.env.AGENTMAIL_API_KEY,
    pass: process.env.AGENTMAIL_SMTP_PASSWORD || process.env.AGENTMAIL_API_KEY,
  },
})

// Email Templates - All PULSE Branded

const templates = {
  emailVerification: (userName: string, verificationLink: string): EmailTemplate => ({
    subject: 'Verify Your PULSE Account - Action Required',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background: #f5f5f5; }
          .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
          .header { background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%); padding: 40px 20px; text-align: center; color: white; }
          .logo { font-size: 32px; font-weight: bold; color: ${PULSE_BRANDING.brandColor}; margin: 0 0 10px 0; }
          .content { padding: 40px 20px; }
          .greeting { font-size: 18px; color: #333; margin: 0 0 20px 0; }
          .message { color: #666; line-height: 1.6; margin: 0 0 30px 0; }
          .button { display: inline-block; background: ${PULSE_BRANDING.brandColor}; color: white; padding: 14px 32px; text-decoration: none; border-radius: 6px; font-weight: bold; }
          .button:hover { background: #d97706; }
          .footer { background: #f9f9f9; padding: 20px; text-align: center; font-size: 12px; color: #999; border-top: 1px solid #eee; }
          .security-note { background: #fffbeb; border-left: 4px solid ${PULSE_BRANDING.brandColor}; padding: 15px; margin: 20px 0; border-radius: 4px; }
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
            <p class="greeting">Hello ${userName},</p>
            <p class="message">
              Welcome to PULSE! We're excited to have you join our investment community. 
              To complete your registration and unlock your $35 welcome bonus, please verify your email address by clicking the button below.
            </p>
            <center>
              <a href="${verificationLink}" class="button">Verify Email Address</a>
            </center>
            <div class="security-note">
              <p class="security-note-text">
                <strong>Security Tip:</strong> This link will expire in 24 hours. If you didn't create this account, please ignore this email.
              </p>
            </div>
            <p class="message" style="font-size: 14px; color: #999;">
              Or copy and paste this link in your browser:<br/>
              <code style="background: #f0f0f0; padding: 8px 12px; border-radius: 4px; display: block; margin-top: 10px; word-break: break-all; font-size: 12px;">
                ${verificationLink}
              </code>
            </p>
          </div>
          <div class="footer">
            <p style="margin: 0 0 10px 0;">© 2026 PULSE Investment Platform. All rights reserved.</p>
            <p style="margin: 0;">For questions, contact us at ${PULSE_BRANDING.supportEmail}</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `Hello ${userName},\n\nWelcome to PULSE! Verify your email: ${verificationLink}\n\nThis link expires in 24 hours.\n\nPULSE Investment Platform`,
  }),

  welcomeBonus: (userName: string, bonusAmount: number): EmailTemplate => ({
    subject: 'Congratulations! Your $35 Welcome Bonus is Ready',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background: #f5f5f5; }
          .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
          .header { background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%); padding: 40px 20px; text-align: center; color: white; }
          .logo { font-size: 32px; font-weight: bold; color: ${PULSE_BRANDING.brandColor}; margin: 0 0 10px 0; }
          .content { padding: 40px 20px; }
          .bonus-box { background: linear-gradient(135deg, ${PULSE_BRANDING.brandColor}20 0%, ${PULSE_BRANDING.brandColor}10 100%); border: 2px solid ${PULSE_BRANDING.brandColor}; border-radius: 8px; padding: 30px; text-align: center; margin: 20px 0; }
          .bonus-amount { font-size: 48px; font-weight: bold; color: ${PULSE_BRANDING.brandColor}; margin: 0; }
          .bonus-label { font-size: 16px; color: #666; margin: 10px 0 0 0; }
          .button { display: inline-block; background: ${PULSE_BRANDING.brandColor}; color: white; padding: 14px 32px; text-decoration: none; border-radius: 6px; font-weight: bold; margin-top: 20px; }
          .footer { background: #f9f9f9; padding: 20px; text-align: center; font-size: 12px; color: #999; border-top: 1px solid #eee; }
          .content-text { color: #666; line-height: 1.6; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">PULSE</div>
            <p style="margin: 0; font-size: 14px; opacity: 0.9;">Investment Platform</p>
          </div>
          <div class="content">
            <p class="content-text">Hi ${userName},</p>
            <p class="content-text">Your KYC verification is complete! Your welcome bonus is now active in your PULSE account.</p>
            <div class="bonus-box">
              <p class="bonus-amount">$${bonusAmount}</p>
              <p class="bonus-label">Welcome Bonus Credited</p>
            </div>
            <p class="content-text">
              Your $${bonusAmount} welcome bonus can be used after you make your first deposit. 
              Start investing today and watch your wealth grow!
            </p>
            <center>
              <a href="${PULSE_BRANDING.websiteUrl}/app" class="button">Go to Dashboard</a>
            </center>
          </div>
          <div class="footer">
            <p style="margin: 0 0 10px 0;">© 2026 PULSE Investment Platform. All rights reserved.</p>
            <p style="margin: 0;">Questions? Email us at ${PULSE_BRANDING.supportEmail}</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `Hi ${userName},\n\nYour $${bonusAmount} welcome bonus is now active!\n\nStart investing at ${PULSE_BRANDING.websiteUrl}\n\nPULSE Investment Platform`,
  }),

  kycApproved: (userName: string): EmailTemplate => ({
    subject: 'Your KYC Verification is Complete - Account Approved',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background: #f5f5f5; }
          .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
          .header { background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%); padding: 40px 20px; text-align: center; color: white; }
          .logo { font-size: 32px; font-weight: bold; color: ${PULSE_BRANDING.brandColor}; margin: 0 0 10px 0; }
          .content { padding: 40px 20px; }
          .checkmark { font-size: 48px; margin: 0 0 20px 0; }
          .content-text { color: #666; line-height: 1.6; }
          .button { display: inline-block; background: ${PULSE_BRANDING.brandColor}; color: white; padding: 14px 32px; text-decoration: none; border-radius: 6px; font-weight: bold; margin-top: 20px; }
          .footer { background: #f9f9f9; padding: 20px; text-align: center; font-size: 12px; color: #999; border-top: 1px solid #eee; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">PULSE</div>
            <p style="margin: 0; font-size: 14px; opacity: 0.9;">Investment Platform</p>
          </div>
          <div class="content">
            <div style="text-align: center; color: #22c55e;">
              <p class="checkmark">✓</p>
            </div>
            <p class="content-text" style="text-align: center; font-size: 18px; font-weight: bold; color: #333;">Account Verification Approved</p>
            <p class="content-text">
              Great news! Your KYC verification has been approved by our team. Your PULSE account is now fully activated.
            </p>
            <p class="content-text">
              You can now:
            </p>
            <ul style="color: #666; line-height: 1.8;">
              <li>Deposit funds into your account</li>
              <li>Access all investment opportunities</li>
              <li>Withdraw your earnings anytime</li>
              <li>Refer friends and earn bonuses</li>
            </ul>
            <center>
              <a href="${PULSE_BRANDING.websiteUrl}/app" class="button">Access Your Account</a>
            </center>
          </div>
          <div class="footer">
            <p style="margin: 0 0 10px 0;">© 2026 PULSE Investment Platform. All rights reserved.</p>
            <p style="margin: 0;">For support, contact ${PULSE_BRANDING.supportEmail}</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `Hi ${userName},\n\nYour KYC verification is approved! Your account is fully activated.\n\nStart investing: ${PULSE_BRANDING.websiteUrl}\n\nPULSE Investment Platform`,
  }),

  depositRequest: (userName: string, amount: number): EmailTemplate => ({
    subject: 'Deposit Request Received - Under Review',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background: #f5f5f5; }
          .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
          .header { background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%); padding: 40px 20px; text-align: center; color: white; }
          .logo { font-size: 32px; font-weight: bold; color: ${PULSE_BRANDING.brandColor}; margin: 0 0 10px 0; }
          .content { padding: 40px 20px; }
          .amount-box { background: #f0f0f0; border-left: 4px solid ${PULSE_BRANDING.brandColor}; padding: 15px; border-radius: 4px; margin: 20px 0; }
          .amount { font-size: 24px; font-weight: bold; color: ${PULSE_BRANDING.brandColor}; }
          .content-text { color: #666; line-height: 1.6; }
          .footer { background: #f9f9f9; padding: 20px; text-align: center; font-size: 12px; color: #999; border-top: 1px solid #eee; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">PULSE</div>
            <p style="margin: 0; font-size: 14px; opacity: 0.9;">Investment Platform</p>
          </div>
          <div class="content">
            <p class="content-text">Hi ${userName},</p>
            <p class="content-text">We've received your deposit request and it's currently under review by our team.</p>
            <div class="amount-box">
              <p style="margin: 0 0 5px 0; color: #999; font-size: 12px;">Deposit Amount</p>
              <p class="amount">$${amount}</p>
            </div>
            <p class="content-text" style="font-size: 14px; color: #999;">
              Status: Under Review (typically approved within 1-2 hours)<br/>
              We'll notify you as soon as your deposit is approved.
            </p>
          </div>
          <div class="footer">
            <p style="margin: 0 0 10px 0;">© 2026 PULSE Investment Platform. All rights reserved.</p>
            <p style="margin: 0;">Questions? Email ${PULSE_BRANDING.supportEmail}</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `Hi ${userName},\n\nDeposit of $${amount} received and under review.\n\nTypically approved within 1-2 hours.\n\nPULSE Investment Platform`,
  }),

  depositApproved: (userName: string, amount: number): EmailTemplate => ({
    subject: 'Deposit Approved - Funds Credited',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background: #f5f5f5; }
          .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
          .header { background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%); padding: 40px 20px; text-align: center; color: white; }
          .logo { font-size: 32px; font-weight: bold; color: ${PULSE_BRANDING.brandColor}; margin: 0 0 10px 0; }
          .content { padding: 40px 20px; }
          .success-box { background: linear-gradient(135deg, #22c55e20 0%, #22c55e10 100%); border: 2px solid #22c55e; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0; }
          .amount { font-size: 32px; font-weight: bold; color: #22c55e; }
          .content-text { color: #666; line-height: 1.6; }
          .button { display: inline-block; background: ${PULSE_BRANDING.brandColor}; color: white; padding: 14px 32px; text-decoration: none; border-radius: 6px; font-weight: bold; margin-top: 20px; }
          .footer { background: #f9f9f9; padding: 20px; text-align: center; font-size: 12px; color: #999; border-top: 1px solid #eee; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">PULSE</div>
            <p style="margin: 0; font-size: 14px; opacity: 0.9;">Investment Platform</p>
          </div>
          <div class="content">
            <p class="content-text">Hi ${userName},</p>
            <p class="content-text">Your deposit has been approved and credited to your account!</p>
            <div class="success-box">
              <p class="amount">+$${amount}</p>
            </div>
            <p class="content-text">
              You can now start investing or use your funds to explore our investment opportunities.
            </p>
            <center>
              <a href="${PULSE_BRANDING.websiteUrl}/app/invest" class="button">Start Investing</a>
            </center>
          </div>
          <div class="footer">
            <p style="margin: 0 0 10px 0;">© 2026 PULSE Investment Platform. All rights reserved.</p>
            <p style="margin: 0;">Need help? Contact ${PULSE_BRANDING.supportEmail}</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `Hi ${userName},\n\nDeposit of $${amount} approved!\n\nFunds are now in your account. Start investing: ${PULSE_BRANDING.websiteUrl}\n\nPULSE Investment Platform`,
  }),

  referralInvitation: (referrerName: string, referralLink: string, bonusAmount: number): EmailTemplate => ({
    subject: 'Your Friend Invited You to PULSE - Get $35 Welcome Bonus',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background: #f5f5f5; }
          .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
          .header { background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%); padding: 40px 20px; text-align: center; color: white; }
          .logo { font-size: 32px; font-weight: bold; color: ${PULSE_BRANDING.brandColor}; margin: 0 0 10px 0; }
          .content { padding: 40px 20px; }
          .bonus-box { background: linear-gradient(135deg, ${PULSE_BRANDING.brandColor}20 0%, ${PULSE_BRANDING.brandColor}10 100%); border: 2px solid ${PULSE_BRANDING.brandColor}; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0; }
          .bonus-amount { font-size: 36px; font-weight: bold; color: ${PULSE_BRANDING.brandColor}; }
          .button { display: inline-block; background: ${PULSE_BRANDING.brandColor}; color: white; padding: 14px 32px; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 20px 0; }
          .content-text { color: #666; line-height: 1.6; }
          .footer { background: #f9f9f9; padding: 20px; text-align: center; font-size: 12px; color: #999; border-top: 1px solid #eee; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">PULSE</div>
            <p style="margin: 0; font-size: 14px; opacity: 0.9;">Investment Platform</p>
          </div>
          <div class="content">
            <p class="content-text" style="font-size: 18px; font-weight: bold;">Your Friend Invited You!</p>
            <p class="content-text">
              ${referrerName} has invited you to join PULSE, Africa's most trusted investment platform.
            </p>
            <div class="bonus-box">
              <p style="margin: 0 0 10px 0; color: #999;">Sign Up Bonus</p>
              <p class="bonus-amount">$${bonusAmount}</p>
              <p style="margin: 10px 0 0 0; color: #666; font-size: 14px;">Welcome Bonus</p>
            </div>
            <center>
              <a href="${referralLink}" class="button">Join PULSE Now</a>
            </center>
            <p class="content-text" style="font-size: 14px; color: #999; text-align: center;">
              Get started in 3 minutes and start earning returns on your investments.
            </p>
          </div>
          <div class="footer">
            <p style="margin: 0 0 10px 0;">© 2026 PULSE Investment Platform. All rights reserved.</p>
            <p style="margin: 0;">Questions? Email ${PULSE_BRANDING.supportEmail}</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `Hi,\n\n${referrerName} invited you to PULSE!\n\nGet $${bonusAmount} welcome bonus:\n${referralLink}\n\nStart earning today!\n\nPULSE Investment Platform`,
  }),
}

// PULSE Email Service
export class PulseEmailService {
  static async sendVerificationEmail(email: string, userName: string, verificationLink: string): Promise<boolean> {
    try {
      const template = templates.emailVerification(userName, verificationLink)
      await transporter.sendMail({
        from: PULSE_BRANDING.noreplyEmail,
        to: email,
        subject: template.subject,
        html: template.html,
        text: template.text,
        replyTo: PULSE_BRANDING.supportEmail,
      })

      // Log email
      await logEmail(email, 'verification', template.subject, 'sent')
      return true
    } catch (error) {
      console.error('[PULSE Email] Verification email failed:', error)
      await logEmail(email, 'verification', templates.emailVerification(userName, '').subject, 'failed')
      return false
    }
  }

  static async sendWelcomeBonusEmail(email: string, userName: string, bonusAmount: number): Promise<boolean> {
    try {
      const template = templates.welcomeBonus(userName, bonusAmount)
      await transporter.sendMail({
        from: PULSE_BRANDING.noreplyEmail,
        to: email,
        subject: template.subject,
        html: template.html,
        text: template.text,
        replyTo: PULSE_BRANDING.supportEmail,
      })

      await logEmail(email, 'welcome', template.subject, 'sent')
      return true
    } catch (error) {
      console.error('[PULSE Email] Welcome email failed:', error)
      await logEmail(email, 'welcome', templates.welcomeBonus(userName, 0).subject, 'failed')
      return false
    }
  }

  static async sendKYCApprovedEmail(email: string, userName: string): Promise<boolean> {
    try {
      const template = templates.kycApproved(userName)
      await transporter.sendMail({
        from: PULSE_BRANDING.noreplyEmail,
        to: email,
        subject: template.subject,
        html: template.html,
        text: template.text,
        replyTo: PULSE_BRANDING.supportEmail,
      })

      await logEmail(email, 'kyc_approved', template.subject, 'sent')
      return true
    } catch (error) {
      console.error('[PULSE Email] KYC approved email failed:', error)
      await logEmail(email, 'kyc_approved', templates.kycApproved(userName).subject, 'failed')
      return false
    }
  }

  static async sendDepositRequestEmail(email: string, userName: string, amount: number): Promise<boolean> {
    try {
      const template = templates.depositRequest(userName, amount)
      await transporter.sendMail({
        from: PULSE_BRANDING.noreplyEmail,
        to: email,
        subject: template.subject,
        html: template.html,
        text: template.text,
        replyTo: PULSE_BRANDING.supportEmail,
      })

      await logEmail(email, 'deposit_request', template.subject, 'sent')
      return true
    } catch (error) {
      console.error('[PULSE Email] Deposit request email failed:', error)
      await logEmail(email, 'deposit_request', templates.depositRequest(userName, 0).subject, 'failed')
      return false
    }
  }

  static async sendDepositApprovedEmail(email: string, userName: string, amount: number): Promise<boolean> {
    try {
      const template = templates.depositApproved(userName, amount)
      await transporter.sendMail({
        from: PULSE_BRANDING.noreplyEmail,
        to: email,
        subject: template.subject,
        html: template.html,
        text: template.text,
        replyTo: PULSE_BRANDING.supportEmail,
      })

      await logEmail(email, 'deposit_approved', template.subject, 'sent')
      return true
    } catch (error) {
      console.error('[PULSE Email] Deposit approved email failed:', error)
      await logEmail(email, 'deposit_approved', templates.depositApproved(userName, 0).subject, 'failed')
      return false
    }
  }

  static async sendReferralInvitationEmail(email: string, referrerName: string, referralLink: string): Promise<boolean> {
    try {
      const template = templates.referralInvitation(referrerName, referralLink, 35)
      await transporter.sendMail({
        from: PULSE_BRANDING.noreplyEmail,
        to: email,
        subject: template.subject,
        html: template.html,
        text: template.text,
        replyTo: PULSE_BRANDING.supportEmail,
      })

      await logEmail(email, 'referral_invitation', template.subject, 'sent')
      return true
    } catch (error) {
      console.error('[PULSE Email] Referral invitation email failed:', error)
      await logEmail(email, 'referral_invitation', templates.referralInvitation(referrerName, '', 0).subject, 'failed')
      return false
    }
  }
}

// Helper function to log emails (stub - implement with your database)
async function logEmail(email: string, emailType: string, subject: string, status: string) {
  try {
    // TODO: Implement database logging
    console.log(`[PULSE Email Log] ${emailType} to ${email}: ${status}`)
  } catch (error) {
    console.error('[PULSE Email] Logging failed:', error)
  }
}
