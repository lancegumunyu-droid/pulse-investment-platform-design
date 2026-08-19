'use client'

import { BadgeCheck, Info, TriangleAlert, X } from 'lucide-react'
import { usePulse } from './store'
import { cn } from '@/lib/utils'

export function Toaster() {
  const { toasts, dismissToast } = usePulse()

  if (!toasts.length) return null

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-20 z-[60] mx-auto flex max-w-md flex-col items-center gap-2 px-4 sm:bottom-6 sm:right-6 sm:left-auto sm:mx-0 sm:items-end">
      {toasts.map((t) => {
        const Icon =
          t.variant === 'success'
            ? BadgeCheck
            : t.variant === 'error'
              ? TriangleAlert
              : Info

        return (
          <div
            key={t.id}
            className={cn(
              'animate-toast-in pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-2xl p-3.5 shadow-2xl backdrop-blur-xl transition-all',
              'glass border border-white/10 bg-background/95',
              t.variant === 'success' && 'border-green/30',
              t.variant === 'error' && 'border-destructive/30',
              t.variant === 'info' && 'border-gold/30',
            )}
          >
            <div
              className={cn(
                'flex size-8 shrink-0 items-center justify-center rounded-xl',
                t.variant === 'success' && 'bg-green-soft text-green',
                t.variant === 'error' && 'bg-destructive/15 text-destructive',
                t.variant === 'info' && 'bg-gold-soft text-gold',
              )}
            >
              <Icon className="size-4" />
            </div>

            <div className="min-w-0 flex-1 pt-0.5">
              <p className="text-sm font-semibold text-foreground">{t.title}</p>
              {t.description ? (
                <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                  {t.description}
                </p>
              ) : null}
            </div>

            <button
              onClick={() => dismissToast(t.id)}
              className="rounded-full p-1 text-muted-foreground transition-colors hover:bg-white/10 hover:text-foreground"
              aria-label="Dismiss notification"
            >
              <X className="size-4" />
            </button>
          </div>
        )
      })}
    </div>
  )
}
