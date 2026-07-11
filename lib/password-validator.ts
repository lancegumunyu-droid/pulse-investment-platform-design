'use client'

/**
 * Client-side password strength validation
 * Used in forms for real-time feedback
 */
export function validatePasswordStrength(password: string): {
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
