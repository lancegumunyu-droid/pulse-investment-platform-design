'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Activity, Loader2 } from 'lucide-react'
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
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  // Prefill from a shared referral link (?ref=CODE), but still editable —
  // someone can also just type in a code a friend told them verbally.
  useEffect(() => {
    const fromUrl = searchParams.get('ref')
    if (fromUrl) setRefCode(fromUrl)
  }, [searchParams])

  // Live-validate as they type, debounced, so they find out before
  // submitting whether the code is real and belongs to a verified user —
  // required at signup now, per the mandatory-referral rule.
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
      const res = await validateReferralCode(code)
      if (res.ok) {
        setRefStatus('valid')
        setRefError(null)
      } else {
        setRefStatus('invalid')
        setRefError(res.error)
      }
    }, 500)
    return () => clearTimeout(t)
  }, [refCode, isSignUp])

  // NOTE: removed the client-side "if session exists, redirect to /app"
  // check that used to live here. It read the session via the browser
  // client (localStorage/cookies), which can disagree with what the
  // server-side middleware sees on a custom domain — the client would
  // say "logged in, go to /app," middleware would say "not logged in,
  // go to /auth/login," and those two disagreeing checks is exactly
  // what produced the infinite redirect loop. Middleware alone is now
  // the single source of truth for redirecting authenticated users
  // away from /auth pages.

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const supabase = createClient()
    try {
      if (isSignUp) {
        // Referral is now mandatory: block here with a clear message
        // rather than letting it fail deep in a database exception.
        // This mirrors what handle_new_user() enforces server-side —
        // this check is just for a fast, friendly error message.
        if (refStatus !== 'valid') {
          setError(refError ?? 'A valid referral code from a verified Pulse user is required to sign up')
          setLoading(false)
          return
        }
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo:
              process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ?? `${window.location.origin}/auth/callback`,
            data: { full_name: fullName, ref_code: refCode.trim() },
          },
        })
        if (error) throw error
        router.push('/auth/sign-up-success')
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        // CHANGED: was router.push('/app') + router.refresh(). A client-side
        // navigation can outrun the auth cookie actually being readable by
        // the server on the next request — a full navigation guarantees
        // the browser sends the fresh cookie and middleware sees a real,
        // settled session instead of racing against it.
        window.location.href = '/app'
        return
      }
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  if (!isSupabaseConfigured()) {
    return (
      <div className="mx-auto flex min-h-dvh max-w-md flex-col justify-center px-5 py-10 text-center">
        <div className="glass rounded-3xl p-8">
          <span className="mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl glass-gold">
            <Activity className="size-7 text-gold" />
          </span>
          <h1 className="text-lg font-semibold">Supabase not configured</h1>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground text-pretty">
            Add <code className="rounded bg-white/[0.08] px-1.5 py-0.5 font-mono text-xs">NEXT_PUBLIC_SUPABASE_URL</code> and{' '}
            <code className="rounded bg-white/[0.08] px-1.5 py-0.5 font-mono text-xs">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> in{' '}
            <strong>Settings → Vars</strong> to enable authentication.
          </p>
        </div>
      </div>
    )
  }

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
              />
            </Field>
            <Field label="Referral code">
              <input
                value={refCode}
                onChange={(e) => setRefCode(e.target.value)}
                required
                className="pulse-input"
                placeholder="e.g. PULSE-A1B2C3D4"
              />
            </Field>
            {refStatus === 'checking' && (
              <p className="mt-1 text-xs text-muted-foreground">Checking code…</p>
            )}
            {refStatus === 'valid' && (
              <p className="mt-1 text-xs text-green">Valid — you'll be connected to this Pulse member</p>
            )}
            {refStatus === 'invalid' && refError && (
              <p className="mt-1 text-xs text-destructive">{refError}</p>
            )}
            {refStatus === 'idle' && (
              <p className="mt-1 text-xs text-muted-foreground">
                Ask an existing, verified Pulse member for their code — required to create an account.
              </p>
            )}
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
          />
        </Field>

        {!isSignUp && (
          <div className="mt-2 text-right">
            <Link href="/auth/forgot-password" className="text-xs font-medium text-gold">
              Forgot password?
            </Link>
          </div>
        )}

        {error ? (
          <p className="mt-3 rounded-xl border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive">
            {error}
          </p>
        ) : null}

        <Button
          type="submit"
          size="lg"
          disabled={loading || (isSignUp && refStatus !== 'valid')}
          className="mt-5 h-12 w-full bg-gold text-base font-semibold text-primary-foreground hover:bg-gold/90"
        >
          {loading ? <Loader2 className="size-4 animate-spin" /> : isSignUp ? 'Create account' : 'Sign in'}
        </Button>
      </form>

      <p className="mt-5 text-center text-sm text-muted-foreground">
        {isSignUp ? 'Already have an account?' : 'New to Pulse?'}{' '}
        <Link href={isSignUp ? '/auth/login' : '/auth/sign-up'} className="font-semibold text-gold">
          {isSignUp ? 'Sign in' : 'Create an account'}
        </Link>
      </p>

      <p className="mt-6 text-center text-[11px] leading-relaxed text-muted-foreground text-pretty">
        Disclaimer: Investing involves substantial risk and is not suitable for every investor. The information
        provided on this platform is for educational and informational purposes only. There are no guarantees of
        profit nor of avoiding losses when investing. Each individual's results depend on their unique
        circumstances and numerous other factors. Any past performance, hypothetical or otherwise, is not
        indicative of future results. You should fully understand the risks and seek advice from a qualified
        financial advisor before investing.
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
