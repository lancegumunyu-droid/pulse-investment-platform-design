'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { MailCheck, Sparkles, AlertCircle, ArrowRight, ShieldCheck, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function SignUpSuccessPage() {
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
            <MailCheck className="relative size-8 text-amber-400" />
          </motion.div>
        </div>
      }
    >
      <SignUpSuccessInner />
    </Suspense>
  )
}

function SignUpSuccessInner() {
  const searchParams = useSearchParams()
  const [email, setEmail] = useState<string | null>(null)
  const [resendCooldown, setResendCooldown] = useState(0)
  const [isResending, setIsResending] = useState(false)
  const [resendMessage, setResendMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Extract and save email securely from query params or storage
  useEffect(() => {
    const paramEmail = searchParams.get('email')
    if (paramEmail) {
      setEmail(paramEmail)
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('signup_email', paramEmail)
      }
    } else if (typeof window !== 'undefined') {
      const storedEmail = sessionStorage.getItem('signup_email')
      if (storedEmail) setEmail(storedEmail)
    }
  }, [searchParams])

  // Countdown for resend cooldown
  useEffect(() => {
    if (resendCooldown <= 0) return
    const timer = setTimeout(() => setResendCooldown((prev) => Math.max(0, prev - 1)), 1000)
    return () => clearTimeout(timer)
  }, [resendCooldown])

  const handleResendEmail = async () => {
    if (isResending || resendCooldown > 0) return

    if (!email) {
      setResendMessage({
        type: 'error',
        text: 'Email address not found. Please try signing up again.',
      })
      return
    }

    setIsResending(true)
    setResendMessage(null)

    try {
      const supabase = createClient()
      const origin = typeof window !== 'undefined' ? window.location.origin : ''
      
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
        options: {
          emailRedirectTo: `${origin}/auth/callback`,
        },
      })

      if (error) {
        const errorLower = error.message?.toLowerCase() || ''
        if (error.status === 429 || errorLower.includes('rate limit')) {
          setResendMessage({
            type: 'error',
            text: 'Rate limit active. Please wait before requesting another confirmation email.',
          })
          setResendCooldown(60)
        } else {
          setResendMessage({
            type: 'error',
            text: error.message || 'Failed to resend confirmation email.',
          })
        }
        return
      }

      setResendMessage({
        type: 'success',
        text: 'Confirmation link re-dispatched. Please inspect your inbox and spam folder.',
      })
      setResendCooldown(60)
    } catch (err) {
      setResendMessage({
        type: 'error',
        text: (err as Error).message || 'An unexpected error occurred during dispatch.',
      })
    } finally {
      setIsResending(false)
    }
  }

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center bg-[#050505] overflow-hidden px-4 py-12 selection:bg-amber-500/30 selection:text-amber-200">
      {/* Background Atmosphere */}
      <div className="pointer-events-none absolute -top-48 -left-48 size-[500px] rounded-full bg-amber-500/[0.08] blur-[140px] animate-pulse" />
      <div className="pointer-events-none absolute -bottom-48 -right-48 size-[500px] rounded-full bg-emerald-500/[0.06] blur-[140px] animate-pulse" style={{ animationDuration: '4s' }} />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:3rem_3rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md relative z-10"
      >
        <div className="relative rounded-[32px] border border-white/[0.08] bg-zinc-950/80 backdrop-blur-3xl p-8 sm:p-10 shadow-[0_25px_70px_rgba(0,0,0,0.9)] overflow-hidden">
          
          {/* Top Shimmer Line */}
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-amber-400 to-transparent shadow-[0_0_20px_rgba(245,158,11,0.6)]" />

          {/* Ambient Radial Highlight */}
          <div
            className="pointer-events-none absolute inset-x-0 -top-24 h-56 opacity-70"
            style={{
              background: 'radial-gradient(16rem 16rem at 50% 0%, rgba(245,158,11,0.25), transparent 65%)',
            }}
          />

          <div className="relative text-center">
            <div className="relative mx-auto mb-6 flex size-16 items-center justify-center rounded-2xl bg-gradient-to-b from-amber-400/20 to-zinc-900 border border-amber-500/40 text-amber-400 shadow-inner shadow-amber-500/30">
              <span className="absolute inset-0 animate-ping rounded-2xl bg-amber-400/10" />
              <MailCheck className="relative size-8" />
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-white font-sans">
              You&apos;re almost in
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-zinc-400 text-pretty">
              We&apos;ve sent a secure Pulse verification link to <span className="font-mono font-medium text-amber-300">{email || 'your inbox'}</span>. Look for an email from <span className="font-medium text-foreground">support@pulseinvest.uk</span>, then tap the link to access your Pulse portfolio.
            </p>

            <div className="mt-6 flex items-center justify-center gap-2 rounded-xl border border-amber-500/20 bg-amber-500/5 px-4 py-3 text-xs text-zinc-300">
              <Sparkles className="size-4 shrink-0 text-amber-400" />
              <span>Check your spam or junk folder if it doesn&apos;t arrive within a minute.</span>
            </div>

            <AnimatePresence>
              {resendMessage && (
                <motion.div
                  initial={{ opacity: 0, height: 0, y: -5 }}
                  animate={{ opacity: 1, height: 'auto', y: 0 }}
                  exit={{ opacity: 0, height: 0, y: -5 }}
                  className={`mt-4 flex items-start gap-3 rounded-xl px-4 py-3 text-xs font-medium ${
                    resendMessage.type === 'error'
                      ? 'border border-rose-500/30 bg-rose-500/10 text-rose-300'
                      : 'border border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
                  }`}
                >
                  <AlertCircle className="size-4 shrink-0 mt-0.5" />
                  <span className="text-left">{resendMessage.text}</span>
                </motion.div>
              )}
            </AnimatePresence>

            <motion.div whileTap={{ scale: isResending || resendCooldown > 0 ? 1 : 0.98 }} className="mt-4">
              <button
                onClick={handleResendEmail}
                disabled={isResending || resendCooldown > 0}
                className="w-full rounded-xl border border-amber-500/30 bg-white/[0.03] px-4 py-3 text-xs font-semibold text-amber-400 transition-all hover:bg-amber-500/10 hover:border-amber-500/50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isResending ? (
                  <>
                    <Loader2 className="size-3.5 animate-spin text-amber-400" /> Re-dispatching handshake...
                  </>
                ) : resendCooldown > 0 ? (
                  <span>Resend available in {resendCooldown}s</span>
                ) : (
                  'Resend confirmation email'
                )}
              </button>
            </motion.div>

            <motion.div whileTap={{ scale: 0.98 }} className="mt-3">
              <Link
                href="/auth/login"
                className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 font-semibold text-zinc-950 shadow-[0_0_25px_rgba(245,158,11,0.3)] hover:shadow-[0_0_35px_rgba(245,158,11,0.5)] transition-all group"
              >
                Back to sign in
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </motion.div>
          </div>
        </div>

        <p className="mt-8 text-center text-[11px] leading-relaxed text-zinc-500 text-pretty font-mono">
          <ShieldCheck className="inline-block size-3.5 text-emerald-400 mr-1 -mt-0.5" />
          By verifying, you agree to our Terms of Service. Qualified private placement access requires full identity clearance.
        </p>
      </motion.div>
    </div>
  )
}
