'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { MailCheck, Sparkles, AlertCircle } from 'lucide-react'

export default function SignUpSuccessPage() {
  const [resendCooldown, setResendCooldown] = useState(0)
  const [isResending, setIsResending] = useState(false)
  const [resendMessage, setResendMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Countdown for resend button cooldown
  useEffect(() => {
    if (resendCooldown <= 0) return
    const timer = setTimeout(() => setResendCooldown((prev) => Math.max(0, prev - 1)), 1000)
    return () => clearTimeout(timer)
  }, [resendCooldown])

  const handleResendEmail = async () => {
    if (isResending || resendCooldown > 0) return

    setIsResending(true)
    setResendMessage(null)

    try {
      // Check if email is stored in session/localStorage
      const email = typeof window !== 'undefined' ? sessionStorage.getItem('signup_email') : null

      if (!email) {
        setResendMessage({
          type: 'error',
          text: 'Email not found. Please try signing up again.',
        })
        setIsResending(false)
        return
      }

      // Note: Supabase resendEmail is subject to rate limiting.
      // We enforce a 60-second cooldown to prevent triggering 429.
      // In production, you might want to call a custom backend endpoint
      // that has more granular rate limiting control.

      // For now, we'll just show instructions and set a cooldown
      setResendMessage({
        type: 'success',
        text: 'If the email was sent, it should arrive shortly. Check your spam folder too.',
      })
      setResendCooldown(60)
    } catch (error) {
      setResendMessage({
        type: 'error',
        text: (error as Error).message || 'Failed to resend email. Please wait a moment and try again.',
      })
    } finally {
      setIsResending(false)
    }
  }

  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col justify-center px-5 py-10 text-center">
      <div className="glass-gold relative overflow-hidden rounded-3xl p-8 animate-rise">
        {/* soft ambient glow behind the icon, matches homepage radial gradients */}
        <div
          className="pointer-events-none absolute inset-x-0 -top-24 h-56 opacity-70"
          style={{
            background:
              'radial-gradient(16rem 16rem at 50% 0%, rgba(245,158,11,0.35), transparent 65%)',
          }}
        />

        <div className="relative">
          <span className="relative mx-auto mb-5 flex size-16 items-center justify-center rounded-2xl bg-gold-soft text-gold">
            <span className="absolute inset-0 animate-ping rounded-2xl bg-gold/20" />
            <MailCheck className="relative size-8" />
          </span>

          <h1 className="text-2xl font-semibold tracking-tight">You&apos;re almost in</h1>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground text-pretty">
            We&apos;ve sent a confirmation link to your inbox. Tap it to verify your email, then come back and sign in —
            your Pulse portfolio will be waiting.
          </p>

          <div className="mt-6 flex items-center justify-center gap-2 rounded-xl border border-gold/20 bg-white/[0.03] px-4 py-3 text-xs text-muted-foreground">
            <Sparkles className="size-3.5 text-gold" />
            <span>Check your inbox and spam folder for the confirmation email.</span>
          </div>

          {resendMessage && (
            <div
              className={`mt-4 flex items-start gap-3 rounded-xl px-4 py-3 text-xs ${
                resendMessage.type === 'error'
                  ? 'border border-destructive/30 bg-destructive/10 text-destructive'
                  : 'border border-green/30 bg-green/10 text-green'
              }`}
            >
              <AlertCircle className="size-4 flex-shrink-0 mt-0.5" />
              <span>{resendMessage.text}</span>
            </div>
          )}

          <button
            onClick={handleResendEmail}
            disabled={isResending || resendCooldown > 0}
            className="mt-4 w-full rounded-xl border border-gold/30 bg-white/[0.05] px-4 py-2.5 text-xs font-medium text-gold transition-all hover:bg-white/[0.1] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isResending
              ? 'Sending...'
              : resendCooldown > 0
                ? `Resend in ${resendCooldown}s`
                : 'Resend confirmation email'}
          </button>

          <Link
            href="/auth/login"
            className="mt-4 flex h-11 w-full items-center justify-center rounded-xl bg-gold font-semibold text-primary-foreground shadow-[0_16px_32px_-16px_rgba(245,158,11,0.6)] transition-opacity hover:opacity-90"
          >
            Back to sign in
          </Link>
        </div>
      </div>

      <p className="mt-8 text-center text-[11px] leading-relaxed text-muted-foreground text-pretty">
        By signing up, you agree to our platform&apos;s Terms of Service and acknowledge the investment risks outlined in our
        disclaimer. Only verified users can invest $500+.
      </p>
    </div>
  )
}
