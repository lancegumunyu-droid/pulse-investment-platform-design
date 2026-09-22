'use client'

import { useEffect, useRef, useState, Suspense, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Activity, AlertCircle, Info, CheckCircle2, XCircle, Sparkles, ShieldCheck, ArrowRight, Lock, Mail, User, Loader2 } from 'lucide-react'
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client'
import { validateReferralCode } from '@/app/actions/pulse'
import { Button } from '@/components/ui/button'
import { Turnstile } from '@marsidev/react-turnstile'

export function AuthForm({ mode }: { mode: 'login' | 'sign-up' }) {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#050505]">
          <motion.div
            animate={{ rotate: 360, scale: [1, 1.2, 1] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
            className="relative"
          >
            <div className="absolute -inset-4 rounded-full bg-amber-500/20 blur-xl" />
            <Activity className="relative size-8 text-amber-400" />
          </motion.div>
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
  const [consent, setConsent] = useState(false)
  const [captchaToken, setCaptchaToken] = useState<string | null>(null)
  const [captchaLoading, setCaptchaLoading] = useState(true)
  const turnstileSiteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY

  const inFlightRef = useRef(false)

  // Rate-limit countdown handler
  useEffect(() => {
    if (emailCooldown <= 0) return
    const timer = setTimeout(() => setEmailCooldown((prev) => Math.max(0, prev - 1)), 1000)
    return () => clearTimeout(timer)
  }, [emailCooldown])

  // Initialize referral code from URL search params
  useEffect(() => {
    const fromUrl = searchParams.get('ref')
    if (fromUrl) {
      setRefCode(fromUrl.toUpperCase())
    } else if (isSignUp) {
      setRefCode('')
      setRefStatus('idle')
    } else {
      setRefStatus('valid')
    }
  }, [searchParams, isSignUp])

  const verifyCode = useCallback(async (code: string) => {
    const raw = code.trim().toUpperCase()
    const clean = /^[A-F0-9]{10}$/.test(raw) ? `PULSE-${raw}` : raw
    if (!clean) {
      setRefStatus('idle')
      setRefError(null)
      return
    }
    setRefStatus('checking')
    try {
      const res = await validateReferralCode(clean)
      if (res?.ok) {
        setRefStatus('valid')
        setRefError(null)
      } else {
        setRefStatus('invalid')
        setRefError(res?.error || 'Invalid referral code')
      }
    } catch (err) {
      setRefStatus('invalid')
      setRefError((err as Error).message || 'Error validating code')
    }
  }, [])

  // Debounced referral validation
  useEffect(() => {
    if (!isSignUp) {
      setRefStatus('valid')
      return
    }
    const code = refCode.trim()
    if (!code) {
      setRefStatus('idle')
      setRefError(null)
      return
    }
    const t = setTimeout(() => {
      verifyCode(code)
    }, 400)
    return () => clearTimeout(t)
  }, [refCode, isSignUp, verifyCode])

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (inFlightRef.current || emailCooldown > 0) return

    if (!email.trim()) {
      setError({ type: 'error', message: 'Please enter your email address.' })
      return
    }
    if (!password) {
      setError({ type: 'error', message: 'Please enter a password (minimum 6 characters).' })
      return
    }
    if (!captchaToken) {
      setError({ type: 'error', message: 'Please complete the security check before continuing.' })
      return
    }
    if (isSignUp) {
      if (!fullName.trim()) {
        setError({ type: 'error', message: 'Please enter your full legal name.' })
        return
      }
      if (refStatus !== 'valid') {
        setError({
          type: 'error',
          message: refStatus === 'invalid' && refError ? refError : 'A valid Pulse referral code is required to join.',
        })
        return
      }
      if (!consent) {
        setError({ type: 'error', message: 'Please accept the data consent notice before creating your account.' })
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
        const rawCode = refCode.trim().toUpperCase()
        const cleanCode = /^[A-F0-9]{10}$/.test(rawCode) ? `PULSE-${rawCode}` : rawCode

        const origin = typeof window !== 'undefined' ? window.location.origin : ''
        const { data, error: authError } = await supabase.auth.signUp({
          email: cleanEmail,
          password,
            options: {
              emailRedirectTo: `${origin}/auth/callback`,
              captchaToken,
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
              message: 'Too many signup attempts. Please wait 120 seconds before retrying.',
            })
            setEmailCooldown(120)
          } else if (errorLower.includes('already registered') || errorLower.includes('already exists')) {
            setError({ type: 'error', message: 'This email is already registered. Please sign in instead.' })
          } else if (errorLower.includes('invalid email')) {
            setError({ type: 'error', message: 'Please enter a valid email address.' })
          } else if (errorLower.includes('password') && errorLower.includes('weak')) {
            setError({ type: 'error', message: 'Password is too weak. Use at least 6 characters.' })
          } else {
            setError({ type: 'error', message: authError.message || 'Failed to sign up. Please try again.' })
          }
          return
        }

        if (data?.user) {
          setError({ type: 'success', message: 'Account initialized! Redirecting to secure success terminal...' })
          setTimeout(() => {
            router.replace(`/auth/sign-up-success?email=${encodeURIComponent(cleanEmail)}`)
          }, 800)
        }
      } else {
        const cleanEmail = email.trim().toLowerCase()
        const { data, error: authError } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password,
          options: { captchaToken },
        })

        if (authError) {
          const errorLower = authError.message?.toLowerCase() || ''
          const errorCode = authError.status || 0
          if (errorCode === 429 || errorLower.includes('rate limit')) {
            setError({ type: 'warning', message: 'Too many login attempts. Please wait 60 seconds.' })
            setEmailCooldown(60)
          } else if (errorLower.includes('invalid') || errorLower.includes('credentials')) {
            setError({ type: 'error', message: 'Invalid credentials. Please verify your access details.' })
          } else {
            setError({ type: 'error', message: authError.message || 'Failed to authenticate.' })
          }
          return
        }

        if (data?.user) {
          setError({ type: 'success', message: 'Authentication successful. Entering dashboard...' })
          setTimeout(() => {
            router.replace('/app')
          }, 600)
          return
        }
      }
    } catch (err) {
      setError({ type: 'error', message: (err as Error).message || 'An unexpected connection error occurred.' })
    } finally {
      inFlightRef.current = false
      setLoading(false)
    }
  }

  if (!isSupabaseConfigured()) {
    return (
      <div className="relative min-h-screen w-full flex items-center justify-center bg-[#050505] overflow-hidden px-4">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-amber-950/20 via-[#050505] to-[#050505]" />
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative z-10 w-full max-w-md rounded-[28px] p-8 border border-amber-500/20 bg-zinc-950/80 backdrop-blur-2xl shadow-2xl text-center"
        >
          <span className="mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 shadow-inner">
            <AlertCircle className="size-7" />
          </span>
          <h1 className="text-xl font-bold tracking-tight text-white">Configuration Required</h1>
          <p className="mt-3 text-sm leading-relaxed text-zinc-400">
            Supabase connection keys are missing. Add your environment variables to initialize the terminal.
          </p>
        </motion.div>
      </div>
    )
  }

  const isFormDisabled = loading || emailCooldown > 0

  return (
    <div className="relative min-h-[100svh] w-full flex items-start justify-center bg-[#050505] overflow-hidden px-3 py-6 selection:bg-amber-500/30 selection:text-amber-200 sm:items-center sm:px-4 sm:py-12">
      {/* Immersive Background Atmosphere */}
      <div className="pointer-events-none absolute -top-48 -left-48 size-[500px] rounded-full bg-amber-500/[0.08] blur-[140px] animate-pulse" />
      <div className="pointer-events-none absolute -bottom-48 -right-48 size-[500px] rounded-full bg-emerald-500/[0.06] blur-[140px] animate-pulse" style={{ animationDuration: '4s' }} />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:3rem_3rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md relative z-10"
      >
        <div className="relative rounded-[24px] border border-white/[0.08] bg-zinc-950/80 p-5 shadow-[0_20px_55px_rgba(0,0,0,0.9)] backdrop-blur-3xl overflow-hidden group sm:rounded-[32px] sm:p-10">
          
          {/* Top Shimmer Border Line */}
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-amber-400 to-transparent shadow-[0_0_20px_rgba(245,158,11,0.6)]" />

          {/* Rate Limit Alert Banner */}
          <AnimatePresence>
            {emailCooldown > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -10, height: 0 }}
                animate={{ opacity: 1, y: 0, height: 'auto' }}
                exit={{ opacity: 0, y: -10, height: 0 }}
                className="mb-6 rounded-2xl border border-amber-500/40 bg-amber-500/10 p-4 backdrop-blur-md overflow-hidden"
              >
                <div className="flex items-start gap-3">
                  <Info className="mt-0.5 size-5 shrink-0 text-amber-400" />
                  <div className="text-sm">
                    <p className="font-semibold text-amber-300">Security Rate Limit Active</p>
                    <p className="mt-1 text-xs text-zinc-400">
                      Retry available in <span className="font-mono font-bold text-amber-400">{emailCooldown}s</span>.
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Header Branding */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="flex flex-col items-center text-center mb-5 sm:mb-8"
          >
            <div className="relative mb-3 sm:mb-4">
              <div className="absolute -inset-3 rounded-2xl bg-amber-500/20 blur-xl animate-pulse" />
              <div className="relative flex size-12 items-center justify-center rounded-xl sm:size-16 sm:rounded-2xl bg-gradient-to-b from-amber-400/20 to-zinc-900 border border-amber-500/40 text-amber-400 shadow-inner shadow-amber-500/30">
                <Sparkles className="size-7" />
              </div>
            </div>
            <h1 className="text-xl font-bold tracking-tight text-white font-sans sm:text-2xl">
              {isSignUp ? 'Initialize Syndicate Access' : 'Authenticate Terminal'}
            </h1>
            <p className="mt-1.5 text-xs text-zinc-400 tracking-wide">
              {isSignUp ? 'SADC Institutional Private Wealth Network' : 'Welcome back, executive operator'}
            </p>
          </motion.div>

          {/* Form Content */}
          <form
            onSubmit={submit}
            className="space-y-4"
          >
            <AnimatePresence mode="popLayout">
              {isSignUp && (
                <>
                  <motion.div
                    initial={{ opacity: 0, height: 0, y: -10 }}
                    animate={{ opacity: 1, height: 'auto', y: 0 }}
                    exit={{ opacity: 0, height: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <label className="block">
                      <span className="mb-1.5 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
                        <User className="size-3 text-amber-400" /> Full Legal Name
                      </span>
                      <input
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        required
                        disabled={isFormDisabled}
                        className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-3.5 py-2.5 text-sm text-white placeholder:text-zinc-600 sm:px-4 sm:py-3 focus:border-amber-400/60 focus:bg-white/[0.06] focus:outline-none focus:ring-2 focus:ring-amber-400/20 transition-all shadow-inner disabled:opacity-50"
                        placeholder="e.g. Tendai Moyo"
                      />
                    </label>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, height: 0, y: -10 }}
                    animate={{ opacity: 1, height: 'auto', y: 0 }}
                    exit={{ opacity: 0, height: 0, y: -10 }}
                    transition={{ duration: 0.3, delay: 0.05 }}
                    className="overflow-hidden"
                  >
                    <label className="block">
                      <span className="mb-1.5 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
                        <Sparkles className="size-3 text-amber-400" /> Syndicate Referral Code
                      </span>
                      <div className="relative">
                        <input
                          value={refCode}
                          onChange={(e) => setRefCode(e.target.value.toUpperCase())}
                          required
                          disabled={isFormDisabled}
                          className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm font-mono text-white placeholder:text-zinc-600 focus:border-amber-400/60 focus:bg-white/[0.06] focus:outline-none focus:ring-2 focus:ring-amber-400/20 transition-all shadow-inner pr-10 uppercase tracking-widest disabled:opacity-50"
                          placeholder="PULSE-XXXXXXXX"
                        />
                        <div className="absolute right-3.5 top-1/2 -translate-y-1/2 flex items-center">
                          {refStatus === 'checking' && <Loader2 className="size-4 animate-spin text-zinc-400" />}
                          {refStatus === 'valid' && <CheckCircle2 className="size-4 text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.5)]" />}
                          {refStatus === 'invalid' && <XCircle className="size-4 text-rose-500" />}
                        </div>
                      </div>
                      <AnimatePresence mode="wait">
                        {refStatus === 'checking' && (
                          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mt-1.5 text-xs text-zinc-400">Verifying syndicate clearance…</motion.p>
                        )}
                        {refStatus === 'valid' && (
                          <motion.p initial={{ opacity: 0, y: -2 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mt-1.5 text-xs text-emerald-400 font-medium flex items-center gap-1">
                            ✓ Verified clearance — linked to host member
                          </motion.p>
                        )}
                        {refStatus === 'invalid' && refError && (
                          <motion.p initial={{ opacity: 0, y: -2 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mt-1.5 text-xs text-rose-400 font-medium">
                            {refError}
                          </motion.p>
                        )}
                      </AnimatePresence>
                    </label>
                  </motion.div>
                </>
              )}
            </AnimatePresence>

            <div>
              <label className="block">
                <span className="mb-1.5 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
                  <Mail className="size-3 text-amber-400" /> Secure Email
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isFormDisabled}
                  autoComplete="email"
                  className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-3.5 py-2.5 text-sm text-white placeholder:text-zinc-600 sm:px-4 sm:py-3 focus:border-amber-400/60 focus:bg-white/[0.06] focus:outline-none focus:ring-2 focus:ring-amber-400/20 transition-all shadow-inner disabled:opacity-50"
                  placeholder="name@institution.com"
                />
              </label>
            </div>

            <div>
              <label className="block">
                <span className="mb-1.5 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
                  <Lock className="size-3 text-amber-400" /> Password / Passkey
                </span>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isFormDisabled}
                  minLength={6}
                  autoComplete={isSignUp ? 'new-password' : 'current-password'}
                  className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-3.5 py-2.5 text-sm text-white placeholder:text-zinc-600 sm:px-4 sm:py-3 focus:border-amber-400/60 focus:bg-white/[0.06] focus:outline-none focus:ring-2 focus:ring-amber-400/20 transition-all shadow-inner disabled:opacity-50"
                  placeholder="••••••••••••"
                />
              </label>
            </div>

            <div className="overflow-hidden rounded-2xl border border-amber-500/15 bg-black/20 p-2.5 sm:p-4">
              <div className="mb-3 flex items-center justify-between gap-3">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">Security verification</p>
                <ShieldCheck className="size-4 shrink-0 text-amber-400/80" aria-hidden="true" />
              </div>
              {turnstileSiteKey ? (
                <div className="flex min-h-[58px] w-full items-center justify-center overflow-hidden rounded-xl bg-white/[0.02] py-0.5 sm:min-h-[70px] sm:py-1">
                  {captchaLoading && (
                    <p className="pointer-events-none absolute z-0 text-xs text-zinc-500" role="status">Loading security check…</p>
                  )}
                  <div className="relative z-10 flex min-h-[60px] w-full min-w-0 items-center justify-center [&>div]:mx-auto [&_iframe]:max-w-full">
                    <Turnstile
                    siteKey={turnstileSiteKey}
                    options={{ theme: 'dark', size: 'flexible', appearance: 'always', execution: 'render', retry: 'auto', refreshExpired: 'auto' }}
                    onLoad={() => setCaptchaLoading(false)}
                    onSuccess={(token) => {
                      setCaptchaLoading(false)
                      setCaptchaToken(token)
                      setError(null)
                    }}
                    onExpire={() => {
                      setCaptchaLoading(false)
                      setCaptchaToken(null)
                      setError({ type: 'warning', message: 'Security verification expired. Please complete it again.' })
                    }}
                    onError={() => {
                      setCaptchaLoading(false)
                      setCaptchaToken(null)
                      setError({ type: 'error', message: 'Security verification could not load. Check the Turnstile site key and allowed domain.' })
                    }}
                    />
                  </div>
                </div>
              ) : (
                <div className="flex min-h-[70px] items-center gap-3 rounded-xl border border-rose-500/20 bg-rose-500/[0.06] px-3 py-3 text-xs leading-relaxed text-rose-200">
                  <AlertCircle className="size-4 shrink-0 text-rose-300" aria-hidden="true" />
                  <p>Security verification is unavailable for this deployment. Add the Turnstile site key to enable sign-in.</p>
                </div>
              )}
            </div>

            {isSignUp && (
              <label className="flex items-start gap-2.5 rounded-xl border border-white/10 bg-white/[0.02] p-2.5 text-[11px] leading-relaxed text-zinc-400 sm:gap-3 sm:p-3">
                <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} disabled={isFormDisabled} className="mt-0.5 accent-amber-500" />
                <span>I confirm that I have read and accept the <Link href="/legal/data-consent" className="text-amber-400 underline">Data Consent Notice</Link>, <Link href="/legal/terms" className="text-amber-400 underline">Terms of Use</Link>, and <Link href="/legal/risk-disclaimer" className="text-amber-400 underline">Risk Disclaimer</Link>.</span>
              </label>
            )}

            {!isSignUp && (
              <div className="flex justify-end pt-1">
                <Link href="/auth/forgot-password" className="text-xs font-medium text-amber-400 hover:text-amber-300 transition-colors">
                  Forgot secure credentials?
                </Link>
              </div>
            )}

            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0, y: -5 }}
                  animate={{ opacity: 1, height: 'auto', y: 0 }}
                  exit={{ opacity: 0, height: 0, y: -5 }}
                  className={
                    error.type === 'success'
                      ? 'rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-xs text-emerald-300 font-medium overflow-hidden'
                      : error.type === 'warning'
                        ? 'rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-xs text-amber-300 font-medium overflow-hidden'
                        : 'rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-xs text-rose-300 font-medium overflow-hidden'
                  }
                >
                  {error.message}
                </motion.div>
              )}
            </AnimatePresence>

            <motion.div whileTap={{ scale: isFormDisabled ? 1 : 0.98 }} className="pt-2">
              <Button
                type="submit"
                variant="gold"
                size="lg"
                disabled={isFormDisabled}
                className="h-12 w-full font-semibold shadow-[0_0_25px_rgba(245,158,11,0.3)] hover:shadow-[0_0_35px_rgba(245,158,11,0.5)] rounded-xl transition-all duration-200 flex items-center justify-center gap-2 group disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="size-4 animate-spin text-zinc-950" /> Establishing Secure Handshake...
                  </span>
                ) : emailCooldown > 0 ? (
                  <span>Wait {emailCooldown}s before retrying</span>
                ) : (
                  <>
                    {isSignUp ? 'Request Syndicate Access' : 'Access Terminal'}
                    <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                  </>
                )}
              </Button>
            </motion.div>
          </form>

          {/* Switch Mode Footer Link */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mt-6 text-center"
          >
            <Link
              href={isSignUp ? '/auth/login' : '/auth/sign-up'}
              className="text-xs text-zinc-400 hover:text-amber-400 transition-colors font-medium inline-flex items-center gap-1.5 group"
            >
              {isSignUp ? 'Already hold institutional membership? ' : "Don't have clearance yet? "}
              <span className="text-amber-400 underline decoration-amber-400/40 underline-offset-4 group-hover:decoration-amber-400">
                {isSignUp ? 'Sign In' : 'Request Membership'}
              </span>
            </Link>
          </motion.div>

          {/* Security Footnote */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.25 }}
            className="mt-8 pt-4 border-t border-white/5 flex items-center justify-center gap-2 text-[11px] text-zinc-500 font-mono tracking-tight"
          >
            <ShieldCheck className="size-4 text-emerald-400" /> End-to-End Encrypted SADC Wealth Gateway
          </motion.div>
        </div>
      </motion.div>
    </div>
  )
}
