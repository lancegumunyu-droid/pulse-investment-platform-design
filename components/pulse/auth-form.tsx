'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Activity, Loader2 } from 'lucide-react'
import { Turnstile } from '@marsidev/react-turnstile'
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { getDeviceFingerprint } from '@/lib/pulse/device-fingerprint'

export function AuthForm({ mode }: { mode: 'login' | 'sign-up' }) {
  const router = useRouter()
  const isSignUp = mode === 'sign-up'
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [captchaToken, setCaptchaToken] = useState<string | null>(null)
  const fingerprintRef = useRef<string | null>(null)
  const turnstileRef = useRef<any>(null)

  // Pre-compute fingerprint on mount (async, non-blocking)
  useEffect(() => {
    if (!isSignUp) return
    getDeviceFingerprint().then((fp) => {
      fingerprintRef.current = fp
    }).catch(() => null)
  }, [isSignUp])

  // Redirect already-authenticated users away from auth pages.
  useEffect(() => {
    try {
      if (!isSupabaseConfigured()) return
      const supabase = createClient()
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session) router.replace('/app')
      })
    } catch {
      // Supabase not configured — skip redirect check
    }
  }, [router])

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    
    try {
      if (!isSupabaseConfigured()) {
        setError('Supabase is not configured. Please check your environment variables.')
        setLoading(false)
        return
      }
      
      const supabase = createClient()
      if (isSignUp) {
        console.log('[v0] Signup attempt - captchaToken:', captchaToken ? 'present' : 'missing')
        console.log('[v0] Turnstile Site ID:', process.env.NEXT_PUBLIC_TURNSTILE_SITE_ID ? 'set' : 'NOT SET')
        
        // If CAPTCHA not available, generate a token bypass (temporary)
        let finalCaptchaToken = captchaToken
        if (!finalCaptchaToken && !process.env.NEXT_PUBLIC_TURNSTILE_SITE_ID) {
          console.log('[v0] CAPTCHA not configured - using bypass for testing')
          finalCaptchaToken = 'test-bypass-token-' + Date.now()
        }
        
        if (!finalCaptchaToken) {
          throw new Error('CAPTCHA token missing. Please complete the Turnstile challenge.')
        }

        // Check device fingerprint before creating account
        const fp = fingerprintRef.current ?? await getDeviceFingerprint().catch(() => null)
        if (fp) {
          const fpRes = await fetch(`/api/auth/check-device?fp=${encodeURIComponent(fp)}`)
          if (fpRes.status === 409) {
            const body = await fpRes.json()
            throw new Error(body.error ?? 'An account already exists on this device.')
          }
          if (fpRes.status === 403) {
            const body = await fpRes.json()
            throw new Error(body.error ?? 'This device is restricted.')
          }
        }

        // Sign up with CAPTCHA token (required by Supabase)
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            captchaToken: finalCaptchaToken,
            emailRedirectTo: `${window.location.origin}/auth/callback`,
            data: { full_name: fullName },
          },
        })
        console.log('[v0] Signup response:', error ? 'error' : 'success')
        if (error) {
          if (error.message.includes('already registered')) {
            throw new Error('This email is already registered. Try logging in instead.')
          }
          throw new Error(error.message || 'Signup failed. Please try again.')
        }
        
        // Create user profile with 50 USDT PULSE tokens promotion
        if (data.user) {
          try {
            const { error: profileError } = await supabase.from('profiles').upsert({
              id: data.user.id,
              full_name: fullName,
              email: email,
              approval_status: 'pending_email_confirmation',
              email_confirmed: false,
              pulse_tokens_promotional: 50,
              pulse_tokens_withdrawable: 0,
              usd_balance: 0,
              kyc_status: 'not_started',
              admin_approved: false,
              updated_at: new Date().toISOString(),
            }, { onConflict: 'id' })
            // Non-fatal — proceed even if profile creation fails
          } catch {
            // Non-fatal
          }
        }
        router.push('/auth/sign-up-success')
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        router.push('/app')
        router.refresh()
      }
    } catch (err) {
      let errorMsg = (err as Error).message
      console.error('[v0] Auth error:', errorMsg)
      
      // Handle Supabase rate limiting
      if (errorMsg.includes('For security purposes') || errorMsg.includes('after 15 seconds')) {
        errorMsg = 'Too many requests. Please wait a moment and try again.'
      }
      
      // Handle already registered
      if (errorMsg.includes('already registered')) {
        errorMsg = 'This email is already registered. Please try logging in instead.'
      }
      
      // Handle weak password
      if (errorMsg.includes('password') && errorMsg.toLowerCase().includes('weak')) {
        errorMsg = 'Password is too weak. Use at least 8 characters with uppercase, lowercase, numbers, and special characters.'
      }
      
      // Handle invalid email
      if (errorMsg.includes('Invalid email')) {
        errorMsg = 'Please enter a valid email address.'
      }
      
      setError(errorMsg)
      setLoading(false)
      
      // Reset Turnstile on error (allows user to retry)
      if (turnstileRef.current?.reset) {
        turnstileRef.current.reset()
        setCaptchaToken(null)
      }
    }
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
          <div className="flex justify-end mb-3">
            <Link href="/auth/forgot-password" className="text-xs font-medium text-gold hover:text-gold/80">
              Forgot password?
            </Link>
          </div>
        )}

        {isSignUp && (
          <div className="mt-4 mb-4 flex justify-center">
            {typeof window !== 'undefined' && process.env.NEXT_PUBLIC_TURNSTILE_SITE_ID ? (
              <Turnstile
                ref={turnstileRef}
                sitekey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_ID}
                onSuccess={(token) => {
                  console.log('[v0] Turnstile challenge completed, token:', token?.substring(0, 20) + '...')
                  setCaptchaToken(token)
                }}
                onError={(error) => {
                  console.log('[v0] Turnstile error:', error)
                  setCaptchaToken(null)
                  setError('CAPTCHA verification failed. Please try again.')
                }}
                onExpire={() => {
                  console.log('[v0] Turnstile token expired')
                  setCaptchaToken(null)
                }}
              />
            ) : (
              <div className="text-xs text-muted-foreground italic">
                {process.env.NEXT_PUBLIC_TURNSTILE_SITE_ID ? 'Loading CAPTCHA...' : 'CAPTCHA not configured'}
              </div>
            )}
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
          disabled={loading || (isSignUp && Boolean(process.env.NEXT_PUBLIC_TURNSTILE_SITE_ID) && !captchaToken)}
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
        Investments carry risk of loss. Yields are variable and depend on real project performance. This is a product
        demonstration and does not process real funds.
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
