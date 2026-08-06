/**
 * PULSE Platform - Email Configuration
 * Company email settings and SendGrid integration
 */

// Company Email Configuration
export const COMPANY_EMAIL = 'support@pulse-invest.app'
export const COMPANY_NAME = 'PULSE'
export const PLATFORM_NAME = 'PULSE Investment Platform'

export const EMAIL_CONFIG = {
  // Main company email
  support: 'support@pulse-invest.app',

  // Admin notifications
  admin: 'admin@pulse-invest.app',

  // Payment processing
  payments: 'payments@pulse-invest.app',

  // No-reply email (for automated notifications)
  noreply: 'noreply@pulse-invest.app',

  // Platform URLs
  platformUrl: process.env.NEXT_PUBLIC_APP_URL || 'https://pulse-invest.vercel.app',
  adminDashboardUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'https://pulse-invest.vercel.app'}/admin`,
  dashboardUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'https://pulse-invest.vercel.app'}/app`,
}

/**
 * SendGrid Email Configuration
 * Configure via environment variables:
 * - SENDGRID_API_KEY: Your SendGrid API key
 * - SENDGRID_FROM_EMAIL: Sender email address (verify in SendGrid)
 * - SENDGRID_FROM_NAME: Sender display name
 */
export const SENDGRID_CONFIG = {
  apiKey: process.env.SENDGRID_API_KEY,
  fromEmail: process.env.SENDGRID_FROM_EMAIL || COMPANY_EMAIL,
  fromName: process.env.SENDGRID_FROM_NAME || COMPANY_NAME,
}

/**
 * Email template IDs for SendGrid (if using dynamic templates)
 * These should be created in SendGrid dashboard
 */
export const SENDGRID_TEMPLATE_IDS = {
  // Admin notifications
  signalClosed: process.env.SENDGRID_TEMPLATE_SIGNAL_CLOSED,
  paymentPending: process.env.SENDGRID_TEMPLATE_PAYMENT_PENDING,
  paymentApproved: process.env.SENDGRID_TEMPLATE_PAYMENT_APPROVED,

  // Investor notifications
  investorCreditApproved: process.env.SENDGRID_TEMPLATE_INVESTOR_CREDIT,
  withdrawalProcessed: process.env.SENDGRID_TEMPLATE_WITHDRAWAL,
  signalCreated: process.env.SENDGRID_TEMPLATE_SIGNAL_CREATED,

  // User notifications
  welcomeEmail: process.env.SENDGRID_TEMPLATE_WELCOME,
  kycVerified: process.env.SENDGRID_TEMPLATE_KYC_VERIFIED,
  passwordReset: process.env.SENDGRID_TEMPLATE_PASSWORD_RESET,
}

/**
 * Email sender profiles for different notification types
 */
export const EMAIL_SENDERS = {
  support: {
    email: COMPANY_EMAIL,
    name: 'PULSE Support',
  },
  admin: {
    email: EMAIL_CONFIG.admin,
    name: 'PULSE Admin System',
  },
  payments: {
    email: EMAIL_CONFIG.payments,
    name: 'PULSE Payments',
  },
  noreply: {
    email: EMAIL_CONFIG.noreply,
    name: PLATFORM_NAME,
  },
}

/**
 * Email recipient templates
 */
export const EMAIL_RECIPIENTS = {
  // Default admin email (override via env)
  admin: process.env.ADMIN_EMAIL || 'admin@pulse-invest.app',

  // Support team (for customer inquiries)
  support: EMAIL_CONFIG.support,

  // Payments team (for payment notifications)
  payments: EMAIL_CONFIG.payments,
}

/**
 * Verify SendGrid configuration is set up
 */
export function validateEmailConfig(): { isValid: boolean; errors: string[] } {
  const errors: string[] = []

  if (!SENDGRID_CONFIG.apiKey) {
    errors.push('SENDGRID_API_KEY environment variable is not set')
  }

  if (!SENDGRID_CONFIG.fromEmail) {
    errors.push('SENDGRID_FROM_EMAIL environment variable is not set')
  }

  if (!EMAIL_CONFIG.platformUrl) {
    errors.push('NEXT_PUBLIC_APP_URL environment variable is not set')
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

/**
 * Log email configuration status (for debugging)
 */
export function logEmailConfig(): void {
  console.log('[PULSE Email Config]')
  console.log(`  Company Email: ${COMPANY_EMAIL}`)
  console.log(`  Support Email: ${EMAIL_CONFIG.support}`)
  console.log(`  Platform URL: ${EMAIL_CONFIG.platformUrl}`)
  console.log(`  Admin Dashboard: ${EMAIL_CONFIG.adminDashboardUrl}`)
  console.log(`  SendGrid Configured: ${SENDGRID_CONFIG.apiKey ? 'Yes' : 'No'}`)

  const validation = validateEmailConfig()
  if (!validation.isValid) {
    console.warn('[PULSE Email Config] Issues detected:')
    validation.errors.forEach((error) => console.warn(`  - ${error}`))
  }
}

/**
 * Email notification types for audit logging
 */
export const EMAIL_NOTIFICATION_TYPES = {
  // Admin notifications
  SIGNAL_CLOSED: 'signal_closed',
  PAYMENT_PENDING_APPROVAL: 'payment_pending_approval',
  PAYMENT_APPROVED: 'payment_approved',
  WITHDRAWAL_REQUESTED: 'withdrawal_requested',

  // Investor notifications
  INVESTOR_CREDIT_APPROVED: 'investor_credit_approved',
  WITHDRAWAL_PROCESSED: 'withdrawal_processed',
  SIGNAL_CREATED: 'signal_created',
  SIGNAL_URGENCY_ALERT: 'signal_urgency_alert',

  // User notifications
  WELCOME_EMAIL: 'welcome_email',
  KYC_VERIFIED: 'kyc_verified',
  PASSWORD_RESET: 'password_reset',
  ACCOUNT_DEACTIVATED: 'account_deactivated',

  // System notifications
  SYSTEM_ALERT: 'system_alert',
  ERROR_REPORT: 'error_report',
}

/**
 * Get email template ID or subject line for a notification type
 */
export function getEmailTemplate(notificationType: string): { subject: string; templateId?: string } {
  const templates: Record<string, { subject: string; templateId?: string }> = {
    [EMAIL_NOTIFICATION_TYPES.SIGNAL_CLOSED]: {
      subject: 'PULSE: Signal Closed - Credits Pending Approval',
      templateId: SENDGRID_TEMPLATE_IDS.signalClosed,
    },
    [EMAIL_NOTIFICATION_TYPES.PAYMENT_PENDING_APPROVAL]: {
      subject: 'PULSE: Withdrawal Pending Your Approval',
      templateId: SENDGRID_TEMPLATE_IDS.paymentPending,
    },
    [EMAIL_NOTIFICATION_TYPES.PAYMENT_APPROVED]: {
      subject: 'PULSE: Payment Approved & Processed',
      templateId: SENDGRID_TEMPLATE_IDS.paymentApproved,
    },
    [EMAIL_NOTIFICATION_TYPES.INVESTOR_CREDIT_APPROVED]: {
      subject: 'PULSE: Your Investment Returns Have Been Credited',
      templateId: SENDGRID_TEMPLATE_IDS.investorCreditApproved,
    },
    [EMAIL_NOTIFICATION_TYPES.WITHDRAWAL_PROCESSED]: {
      subject: 'PULSE: Withdrawal to Your Bank Account Processed',
      templateId: SENDGRID_TEMPLATE_IDS.withdrawalProcessed,
    },
    [EMAIL_NOTIFICATION_TYPES.WELCOME_EMAIL]: {
      subject: 'Welcome to PULSE - Get Started with Your Investment Journey',
      templateId: SENDGRID_TEMPLATE_IDS.welcomeEmail,
    },
    [EMAIL_NOTIFICATION_TYPES.KYC_VERIFIED]: {
      subject: 'PULSE: Your Identity Verification is Complete',
      templateId: SENDGRID_TEMPLATE_IDS.kycVerified,
    },
  }

  return (
    templates[notificationType] || {
      subject: 'PULSE Platform Notification',
    }
  )
}
