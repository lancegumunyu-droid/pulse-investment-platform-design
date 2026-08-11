'use client'

import { useEffect, useRef, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
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
  const [error, setError] = useState<{ type: 'error' | 'warning' | 'success'; message: string } | null>(null)
  const [loading, setLoading] = useState(false)
  const [emailCooldown, setEmailCooldown] = useState(0)

  const inFlightRef = useRef(false)

  useEffect(() => {
    if (emailCooldown <= 0) return
    const timer = setTimeout(() => setEmailCooldown((prev) => Math.max(0, prev - 1)), 1000)
    return () => clearTimeout(timer)
  }, [emailCooldown])

  useEffect(() => {
    const fromUrl = searchParams.get('ref')
    if (fromUrl) setRefCode(fromUrl)
  }, [searchParams])

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
      } catch (err) {
        setRefStatus('invalid')
        setRefError((err as Error).message || 'Error validating code')
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
            emailRedirectTo: `${window.location.origin}/auth/callback`,
            data: { full_name: cleanName, ref_code: cleanCode },
          },
        })

        if (authError) {
          const errorLower = authError.message?.toLowerCase() || ''
          const errorCode = authError.status || 0
          const isEmailRateLimit =
            errorCode === 429 ||
            errorLower.includes('rate limit') ||
            errorLower.includes('too many requests') ||
            errorLower.includes('rate_limit_exceeded')

          if (isEmailRateLimit) {
            setError({
              type: 'warning',
              message: 'Too many signup attempts. Please wait 5 minutes before trying again — this is a Supabase email service limit, not an error with your account.',
            })
            setEmailCooldown(300)
          } else if (errorLower.includes('already registered') || errorLower.includes('already exists')) {
            setError({ type: 'error', message: 'This email is already registered. Please sign in instead.' })
          } else if (errorLower.includes('invalid email')) {
            setError({ type: 'error', message: 'Please enter a valid email address.' })
          } else if (errorLower.includes('password') && errorLower.includes('weak')) {
            setError({ type: 'error', message: 'Password is too weak. Use at least 6 characters with a mix of letters and numbers.' })
          } else {
            setError({ type: 'error', message: authError.message || 'Failed to sign up. Please try again.' })
          }
          return
        }

        if (data?.user) {
          setError({ type: 'success', message: 'Account created! Check your email to confirm your address — check spam/promotions too.' })
          setTimeout(() => router.push('/auth/sign-up-success'), 1500)
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
          window.location.href = '/app'
          return
        }
      }
    } catch (err) {
      setError({ type: 'error', message: (err as Error).message || 'An unexpected error occurred. Please refresh and try again.' })
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

  const isFormDisabled = loading || emailCooldown > 0 || (isSignUp && refStatus !== 'valid')

  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col justify-center px-5 py-10">
      {emailCooldown > 0 && (
        <div className="mb-4 rounded-xl border border-gold/30 bg-gold/10 p-4">
          <div className="flex items-start gap-3">
            <Info className="mt-0.5 size-5 shrink-0 text-gold" />
            <div className="text-sm">
              <p className="font-semibold text-gold">Email service rate limit</p>
              <p className="mt-1 text-xs text-muted-foreground">
                You can retry in <span className="font-mono font-semibold text-gold">{emailCooldown}s</span>. This protects our email service from abuse.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="mb-8 flex flex-col items-center text-center">
        <span className="mb-4 flex size-14 items-center justify-center rounded-2xl glass-gold">
          <Activity className="size-7 text-gold" />
        </span>
        <h1 className="text-2xl font-semibold tracking-tight">
          {isSignUp ? 'Create your Pulse account' : 'Welcome back'}
        </h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          {isSignUp ? 'Invest in real African projects. Grow responsibly.' : 'Sign in to your Pulse account'}
        </p>
      </div>

      <form onSubmit={submit} className="glass rounded-3xl p-5">
        {isSignUp && (
          <label className="block">
            <span className="mb-1.5 block text-xs font-medium text-muted-foreground">Full name</span>
            <input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              className="pulse-input"
              placeholder="Your full name"
            />
          </label>
        )}

        {isSignUp && (
          <label className="mt-4 block">
            <span className="mb-1.5 block text-xs font-medium text-muted-foreground">Referral code</span>
            <input
              value={refCode}
              onChange={(e) => setRefCode(e.target.value)}
              required
              className="pulse-input"
              placeholder="PULSE-XXXXXXXX"
            />
            {refStatus === 'checking' && <p className="mt-1.5 text-xs text-muted-foreground">Checking…</p>}
            {refStatus === 'valid' && <p className="mt-1.5 text-xs text-green">Valid — you&apos;ll be connected to this Pulse member</p>}
            {refStatus === 'invalid' && refError && <p className="mt-1.5 text-xs text-destructive">{refError}</p>}
          </label>
        )}

        <label className="mt-4 block">
          <span className="mb-1.5 block text-xs font-medium text-muted-foreground">Email</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            className="pulse-input"
            placeholder="you@example.com"
          />
        </label>

        <label className="mt-4 block">
          <span className="mb-1.5 block text-xs font-medium text-muted-foreground">Password</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            autoComplete={isSignUp ? 'new-password' : 'current-password'}
            className="pulse-input"
            placeholder="••••••••"
          />
        </label>

        {!isSignUp && (
          <div className="mt-2 text-right">
            <Link href="/auth/forgot-password" className="text-xs font-medium text-gold">
              Forgot password?
            </Link>
          </div>
        )}

        {error ? (
          <p
            className={
              error.type === 'success'
                ? 'mt-3 rounded-xl border border-green/30 bg-green/10 px-3 py-2 text-xs text-green'
                : error.type === 'warning'
                  ? 'mt-3 rounded-xl border border-gold/30 bg-gold/10 px-3 py-2 text-xs text-gold'
                  : 'mt-3 rounded-xl border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive'
            }
          >
            {error.message}
          </p>
        ) : null}

        <Button
          type="submit"
          size="lg"
          disabled={isFormDisabled}
          className="mt-5 h-12 w-full bg-gold text-base font-semibold text-primary-foreground hover:bg-gold/90"
        >
          {loading ? <Activity className="size-4 animate-spin" /> : isSignUp ? 'Create account' : 'Sign in'}
        </Button>
      </form>

      <p className="mt-5 text-center text-sm text-muted-foreground">
        {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
        <Link href={isSignUp ? '/auth/login' : '/auth/sign-up'} className="font-semibold text-gold">
          {isSignUp ? 'Sign in' : 'Create one'}
        </Link>
      </p>
    </div>
  )
}
