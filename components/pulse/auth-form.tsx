'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Activity, Loader2, AlertCircle, CheckCircle2, Clock } from 'lucide-react'
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client'
import { validateReferralCode } from '@/app/actions/pulse'
import { Button } from '@/components/ui/button'

export function AuthForm({ mode }: { mode: 'login' | 'sign-up' }) {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-dvh items-center justify-center bg-background">
          <Activity className="size-6 animate-spin text-gold" />
        </div>
      }
    >
      <AuthFormInner mode={mode} />
    </Suspense>
  )
}

function AuthFormInner({ mode }: { mode: 'login' | 'sign-up' }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const isSignUp = mode === 'sign-up'
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [refCode, setRefCode] = useState('')
  const [refStatus, setRefStatus] = useState<'idle' | 'checking' | 'valid' | 'invalid'>('idle')
  const [refError, setRefError] = useState<string | null>(null)
  const [error, setError] = useState<{ type: 'error' | 'warning' | 'success'; message: string } | null>(null)
  const [loading, setLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [rateLimitCooldown, setRateLimitCooldown] = useState(0)
  const [debugLog, setDebugLog] = useState<string[]>([])

  // Add debug log
  const log = (msg: string) => {
    const timestamp = new Date().toLocaleTimeString()
    setDebugLog((prev) => [...prev.slice(-5), `[${timestamp}] ${msg}`])
    console.log(msg)
  }

  // Countdown timer for rate limit cooldown
  useEffect(() => {
    if (rateLimitCooldown <= 0) return
    const timer = setTimeout(() => setRateLimitCooldown((prev) => Math.max(0, prev - 1)), 1000)
    return () => clearTimeout(timer)
  }, [rateLimitCooldown])

  // Prefill from a shared referral link (?ref=CODE)
  useEffect(() => {
    const fromUrl = searchParams.get('ref')
    if (fromUrl) {
      setRefCode(fromUrl)
      log(`✓ Referral code prefilled: ${fromUrl}`)
    }
  }, [searchParams])

  // Live-validate referral code
  useEffect(() => {
    if (!isSignUp) return
    const code = refCode.trim()
    if (!code) {
      setRefStatus('idle')
      setRefError(null)
      return
    }
    setRefStatus('checking')
    log(`→ Validating referral code: ${code}`)
    const t = setTimeout(async () => {
      try {
        const res = await validateReferralCode(code)
        if (res.ok) {
          setRefStatus('valid')
          setRefError(null)
          log(`✓ Referral code valid: ${code}`)
        } else {
          setRefStatus('invalid')
          setRefError(res.error)
          log(`✗ Referral code invalid: ${res.error}`)
        }
      } catch (err) {
        log(`✗ Validation error: ${(err as Error).message}`)
        setRefStatus('invalid')
        setRefError('Error validating code')
      }
    }, 500)
    return () => clearTimeout(t)
  }, [refCode, isSignUp])

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    log('→ Form submission started')

    // ===== CRITICAL FIX #1: Prevent duplicate requests =====
    if (isSubmitting) {
      log('✗ Submission already in progress (BLOCKED)')
      return
    }

    // ===== CRITICAL FIX #2: Check rate limit cooldown =====
    if (rateLimitCooldown > 0) {
      log(`✗ Rate limit active: ${rateLimitCooldown}s remaining (BLOCKED)`)
      return
    }

    // ===== CRITICAL FIX #3: Validate ALL fields before API call =====
    if (!email.trim()) {
      setError({ type: 'error', message: 'Please enter your email address' })
      log('✗ Email is empty')
      return
    }

    if (!password) {
      setError({ type: 'error', message: 'Please enter a password (minimum 6 characters)' })
      log('✗ Password is empty')
      return
    }

    if (isSignUp) {
      if (!fullName.trim()) {
        setError({ type: 'error', message: 'Please enter your full name' })
        log('✗ Full name is empty')
        return
      }

      if (refStatus !== 'valid') {
        const message = refStatus === 'invalid' && refError ? refError : 'Please enter a valid referral code from an existing Pulse member'
        setError({ type: 'error', message })
        log(`✗ Invalid referral code: ${message}`)
        return
      }
    }

    setError(null)
    setLoading(true)
    setIsSubmitting(true)
    log('→ API request starting...')

    const supabase = createClient()
    try {
      if (isSignUp) {
        const cleanEmail = email.trim().toLowerCase()
        const cleanName = fullName.trim()
        const cleanCode = refCode.trim()

        log(`→ Creating account: ${cleanEmail}`)
        const { data, error: authError } = await supabase.auth.signUp({
          email: cleanEmail,
          password,
          options: {
            emailRedirectTo: process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ?? `${window.location.origin}/auth/callback`,
            data: { full_name: cleanName, ref_code: cleanCode },
          },
        })

        if (authError) {
          log(`✗ Auth error: ${authError.message} (code: ${authError.status})`)

          // ===== CRITICAL FIX #4: Detect all error types =====
          const errorLower = authError.message?.toLowerCase() || ''
          const errorCode = authError.status || 0

          if (
            errorCode === 429 ||
            errorLower.includes('429') ||
            errorLower.includes('rate limit') ||
            errorLower.includes('too many requests') ||
            errorLower.includes('please try again')
          ) {
            log('→ Rate limit detected, activating 120s cooldown')
            setError({
              type: 'warning',
              message: '⏳ Too many signup attempts. Please wait 2 minutes before trying again. If the issue persists, wait 5 minutes.',
            })
            setRateLimitCooldown(120)
          } else if (errorLower.includes('already registered') || errorLower.includes('already exists')) {
            log('✗ Email already registered')
            setError({
              type: 'error',
              message: '📧 This email is already registered. Please sign in instead.',
            })
          } else if (errorLower.includes('invalid email')) {
            log('✗ Invalid email format')
            setError({
              type: 'error',
              message: '✉️ Please enter a valid email address.',
            })
          } else if (errorLower.includes('password') && errorLower.includes('weak')) {
            log('✗ Weak password')
            setError({
              type: 'error',
              message: '🔐 Password is too weak. Use at least 6 characters with mix of letters and numbers.',
            })
          } else if (errorLower.includes('network') || errorLower.includes('connection')) {
            log('✗ Network error')
            setError({
              type: 'error',
              message: '🌐 Connection error. Please check your internet and try again.',
            })
          } else {
            log(`✗ Unknown error: ${authError.message}`)
            setError({
              type: 'error',
              message: `❌ ${authError.message || 'Failed to sign up. Please try again.'} If this continues, contact support.`,
            })
          }

          setLoading(false)
          setIsSubmitting(false)
          return
        }

        if (data?.user) {
          log(`✓ Account created successfully: ${data.user.id}`)
          setError({
            type: 'success',
            message: '✓ Account created! Check your email to confirm your address.',
          })
          // Wait 1 second for success message to be visible, then redirect
          setTimeout(() => {
            router.push('/auth/sign-up-success')
          }, 1000)
          return
        } else {
          log('✗ No user returned from signup')
          setError({
            type: 'warning',
            message: '⏳ Signup processing... Redirecting shortly.',
          })
          setTimeout(() => {
            router.push('/auth/sign-up-success')
          }, 2000)
        }
      } else {
        // ===== LOGIN FLOW =====
        const cleanEmail = email.trim().toLowerCase()
        log(`→ Signing in: ${cleanEmail}`)

        const { data, error: authError } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password,
        })

        if (authError) {
          log(`✗ Login error: ${authError.message}`)
          const errorLower = authError.message?.toLowerCase() || ''

          if (errorLower.includes('invalid') || errorLower.includes('credentials')) {
            setError({
              type: 'error',
              message: '🔐 Invalid email or password. Please check and try again.',
            })
          } else if (errorLower.includes('rate limit') || errorLower.includes('429')) {
            setError({
              type: 'warning',
              message: '⏳ Too many login attempts. Please wait a minute and try again.',
            })
            setRateLimitCooldown(60)
          } else {
            setError({
              type: 'error',
              message: authError.message || 'Failed to sign in. Please try again.',
            })
          }
          setLoading(false)
          setIsSubmitting(false)
          return
        }

        if (data?.user) {
          log(`✓ Login successful: ${data.user.id}`)
          log('→ Redirecting to /app')
          // Full page navigation to ensure session cookie is sent
          window.location.href = '/app'
          return
        }
      }
    } catch (err) {
      const errorMessage = (err as Error).message
      log(`✗ Caught exception: ${errorMessage}`)
      setError({
        type: 'error',
        message: `⚠️ ${errorMessage || 'An unexpected error occurred. Please refresh and try again.'}`,
      })
    } finally {
      setLoading(false)
      setIsSubmitting(false)
    }
  }

  if (!isSupabaseConfigured()) {
    return (
      <div className="mx-auto flex min-h-dvh max-w-md flex-col justify-center px-5 py-10 text-center">
        <div className="glass rounded-3xl p-8">
          <span className="mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl glass-gold">
            <AlertCircle className="size-7 text-gold" />
          </span>
          <h1 className="text-lg font-semibold">Configuration Required</h1>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground text-pretty">
            Supabase is not configured. Add{' '}
            <code className="rounded bg-white/[0.08] px-1.5 py-0.5 font-mono text-xs">NEXT_PUBLIC_SUPABASE_URL</code> and{' '}
            <code className="rounded bg-white/[0.08] px-1.5 py-0.5 font-mono text-xs">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> to your environment
            variables.
          </p>
        </div>
      </div>
    )
  }

  const isFormDisabled = isSubmitting || rateLimitCooldown > 0 || loading
  const isSubmitDisabled =
    loading || isSubmitting || rateLimitCooldown > 0 || (isSignUp && refStatus !== 'valid')

  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col justify-center px-5 py-10">
      <div className="mb-8 flex flex-col items-center text-center">
        <span className="mb-4 flex size-14 items-center justify-center rounded-2xl glass-gold">
          <Activity className="size-7 text-gold" />
        </span>
        <h1 className="text-2xl font-semibold tracking-tight">
          {isSignUp ? 'Create your Pulse account' : 'Welcome back'}
        </h1>
        <p className="mt-1.5 text-sm text-muted-foreground text-pretty">
          {isSignUp
            ? 'Invest in real African projects. Grow responsibly.'
            : 'Sign in to access your Pulse portfolio.'}
        </p>
      </div>

      <form onSubmit={submit} className="glass rounded-3xl p-5">
        {isSignUp ? (
          <>
            <Field label="Full name">
              <input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                autoComplete="name"
                className="pulse-input"
                placeholder="Thabo Nkosi"
                disabled={isFormDisabled}
              />
            </Field>
            <Field label="Referral code">
              <input
                value={refCode}
                onChange={(e) => setRefCode(e.target.value)}
                required
                className="pulse-input"
                placeholder="e.g. PULSE-A1B2C3D4"
                disabled={isFormDisabled}
              />
            </Field>
            <div className="mt-2 mb-3">
              {refStatus === 'checking' && (
                <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <Activity className="size-3 animate-spin" /> Validating code...
                </p>
              )}
              {refStatus === 'valid' && (
                <p className="text-xs text-green flex items-center gap-1.5">
                  <CheckCircle2 className="size-3" /> Valid referral code
                </p>
              )}
              {refStatus === 'invalid' && refError && (
                <p className="text-xs text-destructive flex items-center gap-1.5">
                  <AlertCircle className="size-3" /> {refError}
                </p>
              )}
              {refStatus === 'idle' && refCode === '' && (
                <p className="text-xs text-muted-foreground">Ask an existing verified member for their code</p>
              )}
            </div>
          </>
        ) : null}
        <Field label="Email">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            className="pulse-input"
            placeholder="you@example.com"
            disabled={isFormDisabled}
          />
        </Field>
        <Field label="Password">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            autoComplete={isSignUp ? 'new-password' : 'current-password'}
            className="pulse-input"
            placeholder="••••••••"
            disabled={isFormDisabled}
          />
        </Field>

        {!isSignUp && (
          <div className="mt-2 text-right">
            <Link href="/auth/forgot-password" className="text-xs font-medium text-gold">
              Forgot password?
            </Link>
          </div>
        )}

        {error && (
          <div
            className={`mt-3 rounded-xl border px-3 py-2 text-xs flex items-start gap-2 ${
              error.type === 'error'
                ? 'border-destructive/30 bg-destructive/10 text-destructive'
                : error.type === 'success'
                  ? 'border-green/30 bg-green/10 text-green'
                  : 'border-gold/30 bg-gold/10 text-gold'
            }`}
          >
            {error.type === 'error' && <AlertCircle className="size-4 flex-shrink-0 mt-0.5" />}
            {error.type === 'warning' && <Clock className="size-4 flex-shrink-0 mt-0.5" />}
            {error.type === 'success' && <CheckCircle2 className="size-4 flex-shrink-0 mt-0.5" />}
            <span>{error.message}</span>
          </div>
        )}

        <Button
          type="submit"
          size="lg"
          disabled={isSubmitDisabled}
          className="mt-5 h-12 w-full bg-gold text-base font-semibold text-primary-foreground hover:bg-gold/90 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <Loader2 className="size-4 animate-spin mr-2" /> Processing...
            </>
          ) : rateLimitCooldown > 0 ? (
            <>
              <Clock className="size-4 mr-2" /> Wait {rateLimitCooldown}s
            </>
          ) : isSignUp ? (
            'Create account'
          ) : (
            'Sign in'
          )}
        </Button>
      </form>

      <p className="mt-5 text-center text-sm text-muted-foreground">
        {isSignUp ? 'Already have an account?' : 'New to Pulse?'}{' '}
        <Link href={isSignUp ? '/auth/login' : '/auth/sign-up'} className="font-semibold text-gold">
          {isSignUp ? 'Sign in' : 'Create an account'}
        </Link>
      </p>

      {/* Debug log (only in dev) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-8 p-3 rounded-lg bg-white/[0.05] border border-white/[0.08]">
          <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-wide mb-2">Debug Log</p>
          <div className="space-y-1 max-h-40 overflow-y-auto">
            {debugLog.map((log, i) => (
              <p key={i} className="text-[10px] font-mono text-muted-foreground">
                {log}
              </p>
            ))}
          </div>
        </div>
      )}

      <p className="mt-6 text-center text-[11px] leading-relaxed text-muted-foreground text-pretty">
        Disclaimer: Investing involves substantial risk. Capital is at risk. See our Risk Disclaimer for details.
      </p>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="mb-3 block">
      <span className="mb-1.5 block text-xs font-medium text-muted-foreground">{label}</span>
      {children}
    </label>
  )
}