'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Activity, Loader2 } from 'lucide-react'
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'

export function AuthForm({ mode }: { mode: 'login' | 'sign-up' }) {
  const router = useRouter()
  const isSignUp = mode === 'sign-up'
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  // Redirect already-authenticated users away from auth pages.
  useEffect(() => {
    try {
      if (!isSupabaseConfigured()) return
      const supabase = createClient()
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session) router.replace('/app')
      })
    } catch (err) {
      console.log('[v0] Supabase check skipped - not configured')
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
        console.log('[v0] Attempting signup for:', email)
        console.log('[v0] Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
            data: { full_name: fullName },
          },
        })
        if (error) {
          console.error('[v0] Signup error:', error.code, error.message)
          // Common errors that shouldn't stop signup
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
            if (profileError) {
              console.warn('[v0] Profile creation warning:', profileError.message)
              // Don't throw - proceed with signup even if profile creation fails
            } else {
              console.log('[v0] Profile created with 50 USDT PULSE promotional tokens')
            }
          } catch (err) {
            console.warn('[v0] Profile creation error (non-fatal):', (err as Error).message)
            // Don't throw - user signup is still successful
          }
        }
        
        console.log('[v0] Signup successful, confirmation email sent')
        router.push('/auth/sign-up-success')
      } else {
        console.log('[v0] Attempting login for:', email)
        const { data, error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) {
          console.error('[v0] Login error:', error.message)
  
          throw error
        }
        console.log('[v0] Login successful')
        router.push('/app')
        router.refresh()
      }
    } catch (err) {
      const errorMsg = (err as Error).message
      console.error('[v0] Auth error:', errorMsg)
      setError(errorMsg)
      setLoading(false)
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

        {error ? (
          <p className="mt-3 rounded-xl border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive">
            {error}
          </p>
        ) : null}

        <Button
          type="submit"
          size="lg"
          disabled={loading}
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
