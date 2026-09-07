'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { BadgeCheck, Info, TriangleAlert, X } from 'lucide-react'
import { usePulse } from './store'
import { cn } from '@/lib/utils'

export function Toaster() {
  const [mounted, setMounted] = useState(false)
  const { toasts, dismissToast } = usePulse()

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-20 z-[70] mx-auto flex max-w-md flex-col items-center gap-2 px-4 sm:bottom-6 sm:right-6 sm:left-auto sm:mx-0 sm:items-end font-sans">
      <AnimatePresence mode="popLayout">
        {toasts.map((t) => {
          const Icon =
            t.variant === 'success'
              ? BadgeCheck
              : t.variant === 'error'
              ? TriangleAlert
              : Info

          return (
            <motion.div
              key={t.id}
              layout
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className={cn(
                'pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-2xl p-3.5 shadow-[0_20px_50px_rgba(0,0,0,0.9)] backdrop-blur-2xl transition-all transform-gpu',
                'border bg-zinc-950/95',
                t.variant === 'success' && 'border-emerald-500/30 shadow-[0_0_20px_rgba(16,185,129,0.15)]',
                t.variant === 'error' && 'border-rose-500/30 shadow-[0_0_20px_rgba(244,63,94,0.15)]',
                t.variant === 'info' && 'border-amber-500/30 shadow-[0_0_20px_rgba(245,158,11,0.15)]'
              )}
            >
              <div
                className={cn(
                  'flex size-8 shrink-0 items-center justify-center rounded-xl border',
                  t.variant === 'success' && 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.2)]',
                  t.variant === 'error' && 'border-rose-500/30 bg-rose-500/10 text-rose-400 shadow-[0_0_10px_rgba(244,63,94,0.2)]',
                  t.variant === 'info' && 'border-amber-500/30 bg-amber-400/10 text-amber-400 shadow-[0_0_10px_rgba(245,158,11,0.2)]'
                )}
              >
                <Icon className="size-4" />
              </div>

              <div className="min-w-0 flex-1 pt-0.5">
                <p className="text-sm font-semibold text-white font-display">{t.title}</p>
                {t.description ? (
                  <p className="mt-0.5 text-xs leading-relaxed text-zinc-300 font-sans">
                    {t.description}
                  </p>
                ) : null}
              </div>

              <button
                onClick={() => dismissToast(t.id)}
                className="rounded-full p-1 text-zinc-400 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/50"
                aria-label="Dismiss notification"
              >
                <X className="size-4" />
              </button>
            </motion.div>
          )
        })}
      </AnimatePresence>
    </div>
  )
}
