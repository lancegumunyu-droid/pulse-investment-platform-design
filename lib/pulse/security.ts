import 'server-only'
import crypto from 'crypto'

/**
 * PULSE Security & Compliance System
 * - Protects against fraud, money laundering, and unauthorized access
 */

// Encryption for sensitive data
export function encryptSensitive(data: string, key: string): string {
  try {
    const iv = crypto.randomBytes(16)
    const cipher = crypto.createCipheriv(
      'aes-256-gcm',
      Buffer.from(key.padEnd(32, '\0').slice(0, 32)),
      iv,
    )

    let encrypted = cipher.update(data, 'utf8', 'hex')
    encrypted += cipher.final('hex')
    const authTag = cipher.getAuthTag()

    return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`
  } catch (error) {
    console.error('[Security] Encryption failed:', error)
    throw new Error('Encryption failed')
  }
}

export function decryptSensitive(encrypted: string, key: string): string {
  try {
    const [ivHex, authTagHex, encryptedHex] = encrypted.split(':')
    const iv = Buffer.from(ivHex, 'hex')
    const authTag = Buffer.from(authTagHex, 'hex')

    const decipher = crypto.createDecipheriv(
      'aes-256-gcm',
      Buffer.from(key.padEnd(32, '\0').slice(0, 32)),
      iv,
    )
    decipher.setAuthTag(authTag)

    let decrypted = decipher.update(encryptedHex, 'hex', 'utf8')
    decrypted += decipher.final('utf8')

    return decrypted
  } catch (error) {
    console.error('[Security] Decryption failed:', error)
    throw new Error('Decryption failed')
  }
}

// PII Masking for display
export function maskEmail(email: string): string {
  const [local, domain] = email.split('@')
  const masked = local.slice(0, 2) + '*'.repeat(Math.max(0, local.length - 4)) + local.slice(-2)
  return `${masked}@${domain}`
}

export function maskPhoneNumber(phone: string): string {
  const digits = phone.replace(/\D/g, '')
  return `****${digits.slice(-4)}`
}

export function maskIdNumber(id: string): string {
  return `****${id.slice(-4)}`
}

// Rate limiting
export interface RateLimitKey {
  userId?: string
  email?: string
  ip?: string
}

export const RATE_LIMITS = {
  LOGIN_ATTEMPTS: { max: 5, windowMs: 15 * 60 * 1000 }, // 5 attempts per 15 min
  KYC_SUBMISSION: { max: 3, windowMs: 60 * 60 * 1000 }, // 3 per hour
  DEPOSIT_REQUESTS: { max: 10, windowMs: 24 * 60 * 60 * 1000 }, // 10 per day
  WITHDRAWAL_REQUESTS: { max: 5, windowMs: 24 * 60 * 60 * 1000 }, // 5 per day
  REFERRAL_SHARES: { max: 20, windowMs: 24 * 60 * 60 * 1000 }, // 20 per day
  API_CALLS: { max: 100, windowMs: 60 * 1000 }, // 100 per minute
}

// Security hardening against duplication and attacks
export const SECURITY_HARDENING = {
  // Prevent account duplication
  emailVerificationRequired: true,
  duplicateEmailCheck: true,
  duplicatePhoneCheck: true,
  duplicateIdCheck: true,
  
  // Prevent unauthorized access
  sessionTimeout: 30 * 60 * 1000, // 30 minutes
  ipChangeDetection: true,
  deviceFingerprintRequired: true,
  twoFactorAuthSupport: true,
  
  // Prevent API exploitation
  requestSignatureRequired: true,
  apiRateLimitingEnabled: true,
  csrfTokenRequired: true,
  xssProtection: true,
  sqlInjectionProtection: true,
  
  // Protect against scraping/duplication
  contentProtection: true,
  robotsCheckEnabled: true,
  honeypotFieldsEnabled: true,
  behaviorAnalyticsEnabled: true,
  
  // Data protection
  encryptionRequired: true,
  piiMaskingRequired: true,
  auditLoggingRequired: true,
  dataRetentionDays: 90, // Delete old logs after 90 days
}
  PASSWORD_RESET: { max: 3, windowMs: 60 * 60 * 1000 }, // 3 per hour
  API_CALLS: { max: 100, windowMs: 60 * 1000 }, // 100 per minute
}

// Fraud detection scoring
export interface FraudScore {
  score: number // 0-100
  level: 'low' | 'medium' | 'high' | 'critical'
  flags: string[]
  shouldBlock: boolean
  requiresManualReview: boolean
}

export function calculateFraudScore(factors: {
  newAccount: boolean
  newLocation: boolean
  unusualAmount: boolean
  rapidActivity: boolean
  failedLogin: boolean
  unverifiedEmail: boolean
  noKyc: boolean
  suspiciousPattern: boolean
}): FraudScore {
  let score = 0
  const flags: string[] = []

  if (factors.newAccount) {
    score += 15
    flags.push('New account created')
  }
  if (factors.newLocation) {
    score += 20
    flags.push('Access from new location')
  }
  if (factors.unusualAmount) {
    score += 25
    flags.push('Unusual transaction amount')
  }
  if (factors.rapidActivity) {
    score += 30
    flags.push('Rapid multiple transactions')
  }
  if (factors.failedLogin) {
    score += 20
    flags.push('Multiple failed login attempts')
  }
  if (factors.unverifiedEmail) {
    score += 15
    flags.push('Email not verified')
  }
  if (factors.noKyc) {
    score += 20
    flags.push('KYC not completed')
  }
  if (factors.suspiciousPattern) {
    score += 25
    flags.push('Suspicious activity pattern detected')
  }

  const level: 'low' | 'medium' | 'high' | 'critical' =
    score < 25 ? 'low' : score < 50 ? 'medium' : score < 75 ? 'high' : 'critical'

  return {
    score: Math.min(score, 100),
    level,
    flags,
    shouldBlock: score >= 75,
    requiresManualReview: score >= 50,
  }
}

// AML (Anti-Money Laundering) checks
export interface AmlCheckResult {
  passed: boolean
  reason?: string
  requiresManualReview: boolean
}

export function performAmlCheck(
  amount: number,
  frequency: number,
  pattern: 'structured' | 'normal' | 'unusual',
): AmlCheckResult {
  // Structuring detection (breaking up large amounts to avoid detection)
  if (pattern === 'structured' && amount < 10000 && frequency > 5) {
    return {
      passed: false,
      reason: 'Suspicious transaction structuring pattern detected',
      requiresManualReview: true,
    }
  }

  // Large transaction threshold
  if (amount >= 10000) {
    return {
      passed: true,
      reason: 'Large transaction flagged for manual review',
      requiresManualReview: true,
    }
  }

  return { passed: true, requiresManualReview: false }
}

// KYC/AML Compliance rules
export const KYC_RULES = {
  MINIMUM_AGE: 18,
  DOCUMENT_TYPES: ['passport', 'national_id', 'drivers_license'],
  REQUIRED_DOCUMENTS: 2, // Min documents to submit
  EXPIRY_CHECK: true,
  MANUAL_REVIEW_REQUIRED_COUNTRIES: [
    // High-risk jurisdictions
    'IR', // Iran
    'KP', // North Korea
    'SY', // Syria
    'CU', // Cuba
  ],
}

export interface KycComplianceResult {
  compliant: boolean
  issues: string[]
  requiresEscalation: boolean
}

export function checkKycCompliance(
  country: string,
  age: number,
  documentExpiry?: Date,
): KycComplianceResult {
  const issues: string[] = []

  if (age < KYC_RULES.MINIMUM_AGE) {
    issues.push(`Must be at least ${KYC_RULES.MINIMUM_AGE} years old`)
  }

  if (KYC_RULES.MANUAL_REVIEW_REQUIRED_COUNTRIES.includes(country.toUpperCase())) {
    issues.push('Country requires manual review (high-risk jurisdiction)')
  }

  if (KYC_RULES.EXPIRY_CHECK && documentExpiry && documentExpiry < new Date()) {
    issues.push('Document has expired')
  }

  const requiresEscalation =
    KYC_RULES.MANUAL_REVIEW_REQUIRED_COUNTRIES.includes(country.toUpperCase()) || age < 25

  return {
    compliant: issues.length === 0,
    issues,
    requiresEscalation,
  }
}

// Audit logging
export interface AuditLog {
  userId: string
  action: string
  resource: string
  changes?: Record<string, unknown>
  ipAddress?: string
  userAgent?: string
  timestamp: Date
  severity: 'info' | 'warning' | 'error' | 'critical'
}

export function logAuditEvent(log: Omit<AuditLog, 'timestamp'>): void {
  const auditLog: AuditLog = {
    ...log,
    timestamp: new Date(),
  }

  // Log to database
  console.log('[Audit]', JSON.stringify(auditLog))
}

// Session security
export interface SessionSecurityChecks {
  ipChanged: boolean
  deviceChanged: boolean
  geoChanged: boolean
  unusualTime: boolean
  requiresMfa: boolean
}

export function checkSessionSecurity(current: {
  ip?: string
  deviceId?: string
  country?: string
  timestamp: Date
}, previous?: {
  ip?: string
  deviceId?: string
  country?: string
  timestamp: Date
}): SessionSecurityChecks {
  if (!previous) {
    return {
      ipChanged: false,
      deviceChanged: false,
      geoChanged: false,
      unusualTime: false,
      requiresMfa: false,
    }
  }

  const hourDiff = (current.timestamp.getTime() - previous.timestamp.getTime()) / (1000 * 60 * 60)

  return {
    ipChanged: current.ip !== previous.ip,
    deviceChanged: current.deviceId !== previous.deviceId,
    geoChanged: current.country !== previous.country,
    unusualTime: hourDiff < 0.5, // Same IP/device within 30 minutes
    requiresMfa: current.ip !== previous.ip || current.country !== previous.country,
  }
}

// OWASP Security Headers
export const SECURITY_HEADERS = {
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy':
    'camera=(), microphone=(), geolocation=(), payment=(self "https://pulse.app")',
  'Content-Security-Policy':
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'",
}

// Input validation
export const VALIDATION_RULES = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE: /^\+?[\d\s\-()]{10,}$/,
  STRONG_PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
  FULL_NAME: /^[a-zA-Z\s\-']{2,100}$/,
  URL: /^https?:\/\/.+\..+/,
}

export function validateInput(
  value: string,
  type: keyof typeof VALIDATION_RULES,
): { valid: boolean; error?: string } {
  const rule = VALIDATION_RULES[type]

  if (!rule.test(value)) {
    const messages: Record<string, string> = {
      EMAIL: 'Invalid email format',
      PHONE: 'Invalid phone number format',
      STRONG_PASSWORD: 'Password must include uppercase, lowercase, number, and special character',
      FULL_NAME: 'Full name must be 2-100 characters',
      URL: 'Invalid URL format',
    }

    return { valid: false, error: messages[type] }
  }

  return { valid: true }
}
