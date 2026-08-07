'use client'

import { useEffect, useRef, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Activity, AlertCircle, Info } from 'lucide-react'
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
  const [error, setError] = useState<{ type: 'error' | 'warning' | 'success' | 'info'; message: string } | null>(null)
  const [loading, setLoading] = useState(false)
  const [emailCooldown, setEmailCooldown] = useState(0)

  // Single-flight guard on a ref, not state — state updates are async and
  // batched, so two fast taps on submit can both read isSubmitting as
  // false before either setState lands. A ref updates synchronously, so
  // this actually blocks the second call instead of just discouraging it.
  const inFlightRef = useRef(false)

  // Countdown for the email-service rate limit cooldown.
  useEffect(() => {
    if (emailCooldown <= 0) return
    const timer = setTimeout(() => setEmailCooldown((prev) => Math.max(0, prev - 1)), 1000)
    return () => clearTimeout(timer)
  }, [emailCooldown])

  // Prefill from a shared referral link (?ref=CODE), still editable.
  useEffect(() => {
    const fromUrl = searchParams.get('ref')
    if (fromUrl) setRefCode(fromUrl)
  }, [searchParams])

  // Live-validate the referral code as the user types, debounced.
  useEffect(() => {
    if (!isSignUp) return
    const code = refCode.trim()
    if (!code) {
      setRefStatus('idle')
      setRefError(null)
      return
    }
    setRefStatus('checking')
    const t = setTimeout(async () => {
      try {
        const res = await validateReferralCode(code)
        if (res.ok) {
          setRefStatus('valid')
          setRefError(null)
        } else {
          setRefStatus('invalid')
          setRefError(res.error)
        }
      } catch {
        setRefStatus('invalid')
        setRefError('Error validating code')
      }
    }, 500)
    return () => clearTimeout(t)
  }, [refCode, isSignUp])

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (inFlightRef.current) return
    if (emailCooldown > 0) return

    if (!email.trim()) {
      setError({ type: 'error', message: 'Please enter your email address' })
      return
    }
    if (!password) {
      setError({ type: 'error', message: 'Please enter a password (minimum 6 characters)' })
      return
    }
    if (isSignUp) {
      if (!fullName.trim()) {
        setError({ type: 'error', message: 'Please enter your full name' })
        return
      }
      if (refStatus !== 'valid') {
        setError({
          type: 'error',
          message: refStatus === 'invalid' && refError ? refError : 'Please enter a valid referral code from an existing Pulse member',
        })
        return
      }
    }

    setError(null)
    inFlightRef.current = true
    setLoading(true)

    const supabase = createClient()
    try {
      if (isSignUp) {
        const cleanEmail = email.trim().toLowerCase()
        const cleanName = fullName.trim()
        const cleanCode = refCode.trim()

        const { data, error: authError } = await supabase.auth.signUp({
          email: cleanEmail,
          password,
          options: {
            emailRedirectTo: process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ?? `${window.location.origin}/auth/callback`,
            data: { full_name: cleanName, ref_code: cleanCode },
          },
        })

        if (authError) {
          const errorLower = authError.message?.toLowerCase() || ''
          const errorCode = authError.status || 0
          const isEmailRateLimit =
            errorCode === 429 ||
            errorLower.includes('rate limit') ||
            errorLower.includes('email rate') ||
            errorLower.includes('too many requests') ||
            errorLower.includes('rate_limit_exceeded')

          if (isEmailRateLimit) {
            setError({
              type: 'warning',
              message: 'Too many signup attempts. Please wait 5 minutes before trying again — this is an email-service limit, not a problem with your account.',
            })
            setEmailCooldown(300)
          } else if (errorLower.includes('already registered') || errorLower.includes('already exists')) {
            setError({ type: 'error', message: 'This email is already registered. Please sign in instead.' })
          } else if (errorLower.includes('invalid email')) {
            setError({ type: 'error', message: 'Please enter a valid email address.' })
          } else if (errorLower.includes('password') && errorLower.includes('weak')) {
            setError({ type: 'error', message: 'Password is too weak. Use at least 6 characters with a mix of letters and numbers.' })
          } else if (errorLower.includes('network') || errorLower.includes('connection')) {
            setError({ type: 'error', message: 'Connection error. Please check your internet and try again.' })
          } else {
            setError({ type: 'error', message: authError.message || 'Failed to sign up. Please try again.' })
          }
          return
        }

        if (data?.user) {
          setError({ type: 'success', message: 'Account created! Check your email to confirm your address — check spam/promotions too.' })
          setTimeout(() => router.push('/auth/sign-up-success'), 2000)
        } else {
          setError({ type: 'success', message: 'Signup processing… redirecting shortly.' })
          setTimeout(() => router.push('/auth/sign-up-success'), 2000)
        }
      } else {
        const cleanEmail = email.trim().toLowerCase()
        const { data, error: authError } = await supabase.auth.signInWithPassword({ email: cleanEmail, password })

        if (authError) {
          const errorLower = authError.message?.toLowerCase() || ''
          const errorCode = authError.status || 0
          if (errorCode === 429 || errorLower.includes('rate limit')) {
            setError({ type: 'warning', message: 'Too many login attempts. Please wait 60 seconds and try again.' })
            setEmailCooldown(60)
          } else if (errorLower.includes('invalid') || errorLower.includes('credentials')) {
            setError({ type: 'error', message: 'Invalid email or password. Please check and try again.' })
          } else {
            setError({ type: 'error', message: authError.message || 'Failed to sign in. Please try again.' })
          }
          return
        }

        if (data?.user) {
          // Full page navigation, not router.push, so the session cookie
          // is definitely sent along with the request to /app.
          window.location.href = '/app'
        }
      }
    } catch (err) {
      setError({
        type: 'error',
        message: `${(err as Error).message || 'An unexpected error occurred.'} Please refresh and try again.`,
      })
    } finally {
      inFlightRef.current = false
      setLoading(false)
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

  const isFormDisabled = loading || emailCooldown > 0
  const isSubmitDisabled = loading || emailCooldown > 0 || (isSignUp && refStatus !== 'valid')

  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col justify-center px-5 py-10">
      {emailCooldown > 0 && (
        <div className="mb-4 rounded-xl border border-gold/30 bg-gold/10 p-4">
          <div className="flex items-start gap-3">
            <Info className="mt-0.5 size-5 shrink-0 text-gold" />
            <div className="text-sm">
              <p className="font-semibold text-gold">Email service rate limit</p>
              <p className="mt-1 text-xs text-muted-foreground">
                You can retry in <span className="font-mono font-semibold text-gold">{emailCooldown}s</span>. This protects our email service
                from abuse.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="mb-6 text-center">
        <span className="mx-auto mb-3 flex size-12 items-center justify-center rounded-2xl glass-gold">
          <Activity className="size-6 text-gold" />
        </span>
        <h1 className="text-xl font-semibold tracking-tight">{isSignUp ? 'Create your account' : 'Welcome back'}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {isSignUp ? 'Join Pulse — real African investment, transparently tracked.' : 'Sign in to continue growing.'}
        </p>
      </div>

      <form onSubmit={submit} className="space-y-3.5">
        {isSignUp && (
          <>
            <Field label="Full name">
              <input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                disabled={isFormDisabled}
                autoComplete="name"
                className="pulse-input"
                placeholder="Thabo Nkosi"
              />
            </Field>
            <Field label="Referral code">
              <input
                value={refCode}
                onChange={(e) => setRefCode(e.target.value)}
                required
                disabled={isFormDisabled}
                className="pulse-input"
                placeholder="e.g. PULSE-A1B2C3D4"
              />
            </Field>
            {refStatus === 'checking' && <p className="text-xs text-muted-foreground">Checking code…</p>}
            {refStatus === 'valid' && <p className="text-xs text-green">Valid — you&apos;ll be connected to this Pulse member</p>}
            {refStatus === 'invalid' && refError && <p className="text-xs text-destructive">{refError}</p>}
            {refStatus === 'idle' && (
              <p className="text-xs text-muted-foreground">Ask an existing, verified Pulse member for their code — required to create an account.</p>
            )}
          </>
        )}

        <Field label="Email">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={isFormDisabled}
            autoComplete="email"
            className="pulse-input"
            placeholder="you@example.com"
          />
        </Field>

        <Field label="Password">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={isFormDisabled}
            autoComplete={isSignUp ? 'new-password' : 'current-password'}
            className="pulse-input"
            placeholder="••••••••"
          />
        </Field>

        {!isSignUp && (
          <div className="text-right">
            <a href="/auth/forgot-password" className="text-xs font-medium text-gold">
              Forgot password?
            </a>
          </div>
        )}

        {error && (
          <div
            className={`rounded-xl border p-3 text-xs leading-relaxed ${
              error.type === 'success'
                ? 'border-green/30 bg-green/10 text-green'
                : error.type === 'warning'
                  ? 'border-gold/30 bg-gold/10 text-gold'
                  : 'border-destructive/30 bg-destructive/10 text-destructive'
            }`}
          >
            {error.message}
          </div>
        )}

        <Button
          type="submit"
          size="lg"
          disabled={isSubmitDisabled}
          className="mt-5 h-12 w-full bg-gold text-base font-semibold text-primary-foreground hover:bg-gold/90"
        >
          {loading ? <Activity className="size-4 animate-spin" /> : isSignUp ? 'Create account' : 'Sign in'}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        {isSignUp ? (
          <>
            Already have an account?{' '}
            <a href="/auth/login" className="font-semibold text-gold">
              Sign in
            </a>
          </>
        ) : (
          <>
            Don&apos;t have an account?{' '}
            <a href="/auth/sign-up" className="font-semibold text-gold">
              Sign up
            </a>
          </>
        )}
      </p>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-muted-foreground">{label}</span>
      {children}
    </label>
  )
            }
