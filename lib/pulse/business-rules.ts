import 'server-only'
import type { Snapshot, KycStatus } from './types'

/**
 * PULSE Investment Platform - Business Rules Engine
 * 
 * Governs user access, welcome bonus, deposits, withdrawals, and compliance
 */

// User status - determines what actions they can perform
export type UserStatus = 'new' | 'kyc_pending' | 'kyc_approved' | 'kyc_rejected' | 'blocked'

export interface UserAccessRules {
  canViewDashboard: boolean
  canViewWelcomeBonus: boolean
  canWithdrawBonus: boolean
  canDeposit: boolean
  canWithdraw: boolean
  canInvest: boolean
  canAccessFloat: boolean
  requiresKyc: boolean
  userStatus: UserStatus
  blockedReason?: string
}

// Welcome bonus configuration
export const WELCOME_BONUS = {
  amount: 35, // 35 USDT equivalent
  currency: 'USDT',
  isWithdrawable: false, // Must deposit first to unlock
  expiryDays: 30,
  message: 'Your welcome bonus of $35 USDT is credited! You can only withdraw it after making your first deposit.',
}

// Admin approval requirements
export const ADMIN_APPROVAL_REQUIRED = {
  depositsRequireApproval: true, // All deposits need admin approval after KYC
  withdrawalsRequireApproval: true, // All withdrawals need admin approval after KYC
  kycApprovalRequired: true, // KYC requires admin approval
  investmentApprovalRequired: false, // Investments do NOT require approval
  message: 'Your request has been submitted to our admin team for approval. This typically takes 1-2 business hours.',
}

// Tier configurations - determines deposit/withdrawal limits
export const TIER_CONFIG = {
  tier1: {
    name: 'Starter',
    minDeposit: 100,
    maxDeposit: 5000,
    monthlyWithdrawalLimit: 5000,
    investmentAllowed: true,
    floatAccessAllowed: false,
  },
  tier2: {
    name: 'Professional',
    minDeposit: 5001,
    maxDeposit: 50000,
    monthlyWithdrawalLimit: 25000,
    investmentAllowed: true,
    floatAccessAllowed: true,
  },
  tier3: {
    name: 'Platinum',
    minDeposit: 50001,
    maxDeposit: 250000,
    monthlyWithdrawalLimit: 100000,
    investmentAllowed: true,
    floatAccessAllowed: true,
  },
}

/**
 * Determine user access level based on their profile
 */
export function getUserAccessRules(snapshot: Snapshot | null): UserAccessRules {
  if (!snapshot) {
    return {
      canViewDashboard: false,
      canViewWelcomeBonus: false,
      canWithdrawBonus: false,
      canDeposit: false,
      canWithdraw: false,
      canInvest: false,
      canAccessFloat: false,
      requiresKyc: true,
      userStatus: 'new',
      blockedReason: 'Please sign up and verify your email',
    }
  }

  // Determine user status
  let userStatus: UserStatus = 'new'
  let blockedReason: string | undefined

  if (snapshot.kyc === 'rejected') {
    userStatus = 'kyc_rejected'
    blockedReason = 'Your KYC verification was rejected. Please contact support.'
  } else if (snapshot.kyc === 'pending') {
    userStatus = 'kyc_pending'
  } else if (snapshot.kyc === 'verified') {
    userStatus = 'kyc_approved'
  }

  // Block if any sanctions/compliance flags
  if (snapshot.email?.includes('test@spam')) {
    userStatus = 'blocked'
    blockedReason = 'Your account has been suspended for compliance reasons'
  }

  const rules: UserAccessRules = {
    canViewDashboard: true,
    canViewWelcomeBonus: true,
    canWithdrawBonus: false, // Welcome bonus is locked until first deposit
    canDeposit: userStatus === 'kyc_approved',
    canWithdraw: userStatus === 'kyc_approved' && snapshot.cash > 0,
    canInvest: userStatus === 'kyc_approved' && snapshot.cash > WELCOME_BONUS.amount,
    canAccessFloat: userStatus === 'kyc_approved' && snapshot.tier >= 2,
    requiresKyc: userStatus !== 'kyc_approved',
    userStatus,
    blockedReason,
  }

  return rules
}

/**
 * Validate deposit request
 */
export function validateDeposit(
  snapshot: Snapshot,
  amount: number,
): { valid: boolean; error?: string } {
  const rules = getUserAccessRules(snapshot)

  if (!rules.canDeposit) {
    return { valid: false, error: 'You must complete KYC verification before depositing' }
  }

  if (amount <= 0) {
    return { valid: false, error: 'Deposit amount must be greater than 0' }
  }

  // Check tier limits
  const tierKey = `tier${snapshot.tier}` as keyof typeof TIER_CONFIG
  const tierLimits = TIER_CONFIG[tierKey]

  if (amount < tierLimits.minDeposit) {
    return {
      valid: false,
      error: `Minimum deposit for ${tierLimits.name} tier is $${tierLimits.minDeposit}`,
    }
  }

  if (amount > tierLimits.maxDeposit) {
    return {
      valid: false,
      error: `Maximum deposit for ${tierLimits.name} tier is $${tierLimits.maxDeposit}. Please upgrade your tier.`,
    }
  }

  return { valid: true }
}

/**
 * Validate withdrawal request
 */
export function validateWithdrawal(
  snapshot: Snapshot,
  amount: number,
  monthlyWithdrawn: number,
): { valid: boolean; error?: string } {
  const rules = getUserAccessRules(snapshot)

  if (!rules.canWithdraw) {
    return { valid: false, error: 'You must complete KYC verification before withdrawing' }
  }

  if (amount <= 0) {
    return { valid: false, error: 'Withdrawal amount must be greater than 0' }
  }

  // Check welcome bonus lock
  const totalBalance = snapshot.cash
  const welcomeBonusIncluded = totalBalance === WELCOME_BONUS.amount

  if (welcomeBonusIncluded && !rules.canWithdrawBonus) {
    return {
      valid: false,
      error: `Your balance includes a ${WELCOME_BONUS.amount} USDT welcome bonus that cannot be withdrawn until you make a deposit. Please deposit funds first.`,
    }
  }

  if (amount > snapshot.cash) {
    return {
      valid: false,
      error: `Insufficient balance. You have $${snapshot.cash} available to withdraw.`,
    }
  }

  // Check tier monthly limit
  const tierKey = `tier${snapshot.tier}` as keyof typeof TIER_CONFIG
  const tierLimits = TIER_CONFIG[tierKey]
  const totalMonthlyWithdrawal = monthlyWithdrawn + amount

  if (totalMonthlyWithdrawal > tierLimits.monthlyWithdrawalLimit) {
    const remaining = tierLimits.monthlyWithdrawalLimit - monthlyWithdrawn
    return {
      valid: false,
      error: `Monthly withdrawal limit exceeded. You have $${remaining} remaining this month.`,
    }
  }

  return { valid: true }
}

/**
 * Validate investment request
 */
export function validateInvestment(
  snapshot: Snapshot,
  amount: number,
): { valid: boolean; error?: string } {
  const rules = getUserAccessRules(snapshot)

  if (!rules.canInvest) {
    return {
      valid: false,
      error: 'You must complete KYC and deposit funds before investing',
    }
  }

  // Must have deposited more than welcome bonus
  if (snapshot.cash <= WELCOME_BONUS.amount) {
    return {
      valid: false,
      error: `Please deposit more than $${WELCOME_BONUS.amount} to unlock investing features`,
    }
  }

  if (amount <= 0) {
    return { valid: false, error: 'Investment amount must be greater than 0' }
  }

  if (amount > snapshot.cash) {
    return { valid: false, error: 'Insufficient balance for this investment' }
  }

  return { valid: true }
}

/**
 * Get user messaging for UI
 */
export function getUserMessaging(snapshot: Snapshot | null): {
  title: string
  subtitle: string
  actionRequired: string | null
  urgencyLevel: 'critical' | 'high' | 'normal' | 'info'
} {
  if (!snapshot) {
    return {
      title: 'Welcome to PULSE',
      subtitle: 'Start investing in African projects',
      actionRequired: 'Please sign up to continue',
      urgencyLevel: 'critical',
    }
  }

  const rules = getUserAccessRules(snapshot)

  if (rules.userStatus === 'new' || rules.requiresKyc) {
    return {
      title: 'Complete Your KYC',
      subtitle: `You've received a $${WELCOME_BONUS.amount} welcome bonus!`,
      actionRequired: 'Submit your KYC documents to unlock investing',
      urgencyLevel: 'high',
    }
  }

  if (rules.userStatus === 'kyc_pending') {
    return {
      title: 'KYC Under Review',
      subtitle: 'Your documents are being verified',
      actionRequired: null,
      urgencyLevel: 'info',
    }
  }

  if (rules.userStatus === 'kyc_rejected') {
    return {
      title: 'KYC Verification Failed',
      subtitle: 'Your documents did not meet our requirements',
      actionRequired: 'Contact support@pulse.app for assistance',
      urgencyLevel: 'critical',
    }
  }

  if (rules.userStatus === 'kyc_approved' && snapshot.cash === WELCOME_BONUS.amount) {
    return {
      title: 'Make Your First Deposit',
      subtitle: `Unlock your $${WELCOME_BONUS.amount} welcome bonus with a deposit`,
      actionRequired: 'Click "Deposit" to get started',
      urgencyLevel: 'high',
    }
  }

  return {
    title: 'Welcome Back',
    subtitle: 'Your PULSE portfolio',
    actionRequired: null,
    urgencyLevel: 'normal',
  }
}

/**
 * Compliance check - screen for fraud/sanctions
 */
export function complianceCheck(email: string, fullName: string | null): { passed: boolean; reason?: string } {
  // Blocklist check
  const blocklist = [
    'test@spam.com',
    'fake@test.com',
    'sanctioned-country-ip',
  ]

  if (blocklist.some((b) => email.toLowerCase().includes(b))) {
    return { passed: false, reason: 'Account does not meet compliance requirements' }
  }

  // Name validation
  if (fullName && fullName.length < 2) {
    return { passed: false, reason: 'Please provide your full name' }
  }

  return { passed: true }
}

/**
 * Lock/unlock access based on fraud detection
 */
export interface FraudFlag {
  reason: string
  severity: 'low' | 'medium' | 'high'
  requiresReview: boolean
}

export function detectFraud(
  snapshot: Snapshot,
  activity: { amount: number; type: string; frequency: number },
): FraudFlag | null {
  // Unusual activity patterns
  if (activity.frequency > 10 && activity.type === 'withdrawal') {
    return {
      reason: 'Unusual withdrawal frequency detected',
      severity: 'high',
      requiresReview: true,
    }
  }

  // Rapid deposit/withdrawal
  if (activity.amount > snapshot.cash * 10) {
    return {
      reason: 'Transaction amount exceeds normal user pattern',
      severity: 'medium',
      requiresReview: true,
    }
  }

  return null
}
