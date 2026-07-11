import { createClient } from '@/lib/supabase/server'

export class SecurityValidator {
  /**
   * Validate user session and permissions
   */
  static async validateUserSession(userId: string) {
    const supabase = await createClient()
    
    const { data, error } = await supabase
      .from('profiles')
      .select('id, email, email_confirmed, approval_status, kyc_status, role')
      .eq('id', userId)
      .single()

    if (error || !data) {
      throw new Error('Invalid user session')
    }

    return {
      isEmailConfirmed: data.email_confirmed,
      isApproved: data.approval_status === 'approved',
      isKycVerified: data.kyc_status === 'verified',
      role: data.role,
    }
  }

  /**
   * Validate transaction amount limits
   */
  static validateTransactionAmount(amount: number, maxLimit: number) {
    if (amount <= 0) {
      throw new Error('Amount must be greater than 0')
    }

    if (amount > maxLimit) {
      throw new Error(`Amount exceeds maximum limit of ${maxLimit}`)
    }

    // Check for suspicious amounts
    if (amount > 1000000) {
      console.warn('[Security] Large transaction detected:', amount)
    }

    return true
  }

  /**
   * Validate email format
   */
  static validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  /**
   * Validate password strength
   */
  static validatePasswordStrength(password: string): {
    isStrong: boolean
    score: number
    feedback: string[]
  } {
    const feedback: string[] = []
    let score = 0

    if (password.length >= 8) score++
    else feedback.push('Password should be at least 8 characters')

    if (password.length >= 12) score++

    if (/[A-Z]/.test(password)) score++
    else feedback.push('Include uppercase letters')

    if (/[a-z]/.test(password)) score++
    else feedback.push('Include lowercase letters')

    if (/[0-9]/.test(password)) score++
    else feedback.push('Include numbers')

    if (/[!@#$%^&*]/.test(password)) score++
    else feedback.push('Include special characters')

    return {
      isStrong: score >= 4,
      score: Math.min(score, 6),
      feedback,
    }
  }

  /**
   * Rate limit checker
   */
  static async checkRateLimit(userId: string, action: string, limit: number = 10, windowMs: number = 60000) {
    const supabase = await createClient()
    const now = new Date()
    const windowStart = new Date(now.getTime() - windowMs)

    const { data, error } = await supabase
      .from('rate_limit_log')
      .select('id')
      .eq('user_id', userId)
      .eq('action', action)
      .gte('created_at', windowStart.toISOString())

    if (error) {
      console.error('[Security] Rate limit check error:', error)
      return true // Allow on error
    }

    const count = data?.length || 0
    if (count >= limit) {
      throw new Error(`Rate limit exceeded for ${action}`)
    }

    return true
  }

  /**
   * Sanitize user input
   */
  static sanitizeInput(input: string): string {
    return input
      .trim()
      .slice(0, 1000) // Limit length
      .replace(/[<>]/g, '') // Remove HTML-like chars
  }
}

/**
 * Create audit log entry
 */
export async function createAuditLog(
  userId: string,
  action: string,
  details: Record<string, any>,
  status: 'success' | 'failure' = 'success'
) {
  const supabase = await createClient()

  await supabase.from('audit_logs').insert({
    user_id: userId,
    action,
    details: JSON.stringify(details),
    status,
    ip_address: null, // Would be set from request
    user_agent: null, // Would be set from request
    created_at: new Date().toISOString(),
  })
}

/**
 * Encrypt sensitive data
 */
export function encryptSensitiveData(data: string, key: string): string {
  // In production, use a proper encryption library like libsodium or tweetnacl
  // This is a placeholder implementation
  return Buffer.from(data).toString('base64')
}

/**
 * Decrypt sensitive data
 */
export function decryptSensitiveData(encrypted: string, key: string): string {
  // In production, use a proper decryption library
  // This is a placeholder implementation
  return Buffer.from(encrypted, 'base64').toString('utf-8')
}
