export function getAuthErrorMessage(error: { message?: string; status?: number; code?: string } | null) {
  if (!error) return null
  const message = error.message?.toLowerCase() ?? ''
  if (error.status === 429 || error.code === 'over_email_send_rate_limit' || message.includes('rate limit')) {
    return 'Email delivery is temporarily busy. Please wait a few minutes and try again; your details were not lost.'
  }
  if (message.includes('email not confirmed') || message.includes('not confirmed')) {
    return 'Please confirm your email address before signing in.'
  }
  if (message.includes('invalid login credentials') || message.includes('already registered')) {
    return 'Please check your email and password, or use the sign-in option for an existing account.'
  }
  if (message.includes('password')) return 'Use a stronger password with at least 6 characters.'
  return 'We could not complete that request. Please try again.'
}
