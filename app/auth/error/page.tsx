'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { AlertCircle, ArrowRight, ShieldAlert, RefreshCw, Mail } from 'lucide-react'

export default function ErrorPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#050505]">
          <motion.div
            animate={{ rotate: 360, scale: [1, 1.2, 1] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
            className="relative"
          >
            <div className="absolute -inset-4 rounded-full bg-rose-500/20 blur-xl" />
            <AlertCircle className="relative size-8 text-rose-500" />
          </motion.div>
        </div>
      }
    >
      <ErrorPageInner />
    </Suspense>
  )
}

function ErrorPageInner() {
  const searchParams = useSearchParams()
  const errorDescription = searchParams.get('error_description') || searchParams.get('message')

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center bg-[#050505] overflow-hidden px-4 py-12 selection:bg-rose-500/30 selection:text-rose-200">
      {/* Immersive Background Atmosphere */}
      <div className="pointer-events-none absolute -top-48 -left-48 size-[500px] rounded-full bg-rose-500/[0.06] blur-[140px] animate-pulse" />
      <div className="pointer-events-none absolute -bottom-48 -right-48 size-[500px] rounded-full bg-amber-500/[0.05] blur-[140px] animate-pulse" style={{ animationDuration: '4s' }} />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:3rem_3rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md relative z-10"
      >
        <div className="relative rounded-[32px] border border-white/[0.08] bg-zinc-950/80 backdrop-blur-3xl p-8 sm:p-10 shadow-[0_25px_70px_rgba(0,0,0,0.9)] overflow-hidden">
          
          {/* Top Shimmer Line (Rose/Amber Warning Gradient) */}
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-rose-500 to-transparent shadow-[0_0_20px_rgba(244,63,94,0.6)]" />

          {/* Icon Header */}
          <div className="relative text-center">
            <div className="relative mx-auto mb-6 flex size-16 items-center justify-center rounded-2xl bg-gradient-to-b from-rose-500/20 to-zinc-900 border border-rose-500/40 text-rose-400 shadow-inner shadow-rose-500/30">
              <span className="absolute inset-0 animate-ping rounded-2xl bg-rose-500/10" />
              <AlertCircle className="relative size-8" />
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-white font-sans">
              Authentication Interrupted
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-zinc-400 text-pretty">
              {errorDescription ? (
                <span className="font-mono text-rose-300 block bg-rose-500/10 border border-rose-500/20 rounded-xl p-3 text-xs">
                  {errorDescription}
                </span>
              ) : (
                "An unexpected variance occurred during your security handshake. This typically stems from one of the following factors:"
              )}
            </p>

            {/* Structured Breakdown List */}
            {!errorDescription && (
              <ul className="mt-5 space-y-2.5 text-left text-xs text-zinc-300 bg-white/[0.02] border border-white/5 rounded-2xl p-4">
                <li className="flex items-start gap-2">
                  <span className="text-rose-400 font-bold">✕</span> 
                  <span><strong className="text-white">Expired Handshake Link:</strong> Verification tokens expire automatically after 24 hours.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-rose-400 font-bold">✕</span> 
                  <span><strong className="text-white">Double-Tap Collision:</strong> The secure link may have already been consumed or used twice.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-rose-400 font-bold">✕</span> 
                  <span><strong className="text-white">Network Anomaly:</strong> A brief gateway dropout terminated the cryptographic session.</span>
                </li>
              </ul>
            )}

            {/* Action Buttons */}
            <div className="mt-6 space-y-3">
              <motion.div whileTap={{ scale: 0.98 }}>
                <Link
                  href="/auth/sign-up"
                  className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 font-semibold text-zinc-950 shadow-[0_0_25px_rgba(245,158,11,0.3)] hover:shadow-[0_0_35px_rgba(245,158,11,0.5)] transition-all group"
                >
                  <RefreshCw className="size-4" />
                  Try signing up again
                  <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </motion.div>

              <motion.div whileTap={{ scale: 0.98 }}>
                <Link
                  href="/auth/login"
                  className="flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-6 py-3 text-xs font-medium text-zinc-300 hover:bg-white/[0.06] hover:text-white transition-all"
                >
                  Go to sign in terminal
                </Link>
              </motion.div>
            </div>

            {/* Support Footnote */}
            <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-center gap-1.5 text-[11px] text-zinc-500">
              <Mail className="size-3.5 text-amber-400" />
              <span>Escalations: <a href="mailto:support@pulse.africa" className="text-amber-400 hover:underline">support@pulse.africa</a></span>
            </div>
          </div>
        </div>

        {/* Bottom Security Badge */}
        <p className="mt-8 text-center text-[11px] leading-relaxed text-zinc-500 text-pretty font-mono">
          <ShieldAlert className="inline-block size-3.5 text-rose-400 mr-1 -mt-0.5" />
          Secure Gateway Protocol v2.4 — All token errors are logged for audit compliance.
        </p>
      </motion.div>
    </div>
  )
}
