'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Activity, Loader2, MailCheck } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sent, setSent] = useState(false)
  const [rateLimitCooldown, setRateLimitCooldown] = useState(0)

  // Handle rate limit countdown ticker
  useEffect(() => {
    if (rateLimitCooldown <= 0) return
    const timer = setInterval(() => {
      setRateLimitCooldown((prev) => Math.max(0, prev - 1))
    }, 1000)
    return () => clearInterval(timer)
  }, [rateLimitCooldown])

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (loading || rateLimitCooldown > 0) return

    setError(null)
    setLoading(true)

    const cleanEmail = email.trim().toLowerCase()
    const supabase = createClient()

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(cleanEmail, {
      redirectTo: `${window.location.origin}/auth/update-password`,
    })

    setLoading(false)

    if (resetError) {
      if (resetError.status === 429 || resetError.message?.toLowerCase().includes('rate limit')) {
        setError('Too many requests. Please wait a moment before trying again.')
        setRateLimitCooldown(60) // 60-second cooldown
      } else {
        setError(resetError.message)
      }
      return
    }

    setSent(true)
  }

  if (sent) {
    return (
      <div className="mx-auto flex min-h-dvh max-w-md flex-col justify-center px-5 py-10 text-center">
        <div className="glass-gold rounded-3xl border border-gold/30 bg-background/95 p-8 shadow-2xl backdrop-blur-xl">
          <span className="mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl border border-gold/30 bg-gold-soft text-gold shadow-sm">
            <MailCheck className="size-7" />
          </span>
          <h1 className="text-xl font-bold tracking-tight text-foreground">Check your inbox</h1>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground text-pretty">
            We&apos;ve sent a password reset link to <span className="font-medium text-foreground">{email}</span>.
            Open it on this device to set a new password.
          </p>
          <Button asChild variant="gold" size="lg" className="mt-6 w-full">
            <Link href="/auth/login">Back to sign in</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col justify-center px-5 py-10">
      <div className="mb-8 flex flex-col items-center text-center">
        <span className="mb-4 flex size-14 items-center justify-center rounded-2xl border border-gold/30 bg-gold-soft text-gold shadow-sm">
          <Activity className="size-7" />
        </span>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Reset your password</h1>
        <p className="mt-1.5 text-sm text-muted-foreground">Enter your email and we&apos;ll send you a reset link.</p>
      </div>

      <form onSubmit={submit} className="glass rounded-3xl border border-white/10 bg-background/95 p-6 shadow-2xl backdrop-blur-xl">
        <label className="block">
          <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">Email</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading || rateLimitCooldown > 0}
            autoComplete="email"
            className="pulse-input disabled:opacity-50"
            placeholder="you@example.com"
          />
        </label>

        {error ? (
          <p className="mt-3 rounded-xl border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive">
            {error}
          </p>
        ) : null}

        <Button
          type="submit"
          variant="gold"
          size="lg"
          disabled={loading || rateLimitCooldown > 0}
          className="mt-5 w-full text-base font-bold"
        >
          {loading ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Sending...
            </>
          ) : rateLimitCooldown > 0 ? (
            `Wait ${rateLimitCooldown}s before retrying`
          ) : (
            'Send reset link'
          )}
        </Button>
      </form>

      <p className="mt-5 text-center text-sm text-muted-foreground">
        <Link href="/auth/login" className="font-semibold text-gold transition-colors hover:underline">
          Back to sign in
        </Link>
      </p>
    </div>
  )
}
