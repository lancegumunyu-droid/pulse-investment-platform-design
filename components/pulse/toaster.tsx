'use client'

import { BadgeCheck, Info, TriangleAlert, X } from 'lucide-react'
import { usePulse } from './store'
import { cn } from '@/lib/utils'

export function Toaster() {
  const { toasts, dismissToast } = usePulse()

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-24 z-[60] mx-auto flex max-w-md flex-col items-center gap-2 px-4">
      {toasts.map((t) => {
        const Icon = t.variant === 'success' ? BadgeCheck : t.variant === 'error' ? TriangleAlert : Info
        return (
          <div
            key={t.id}
            className="animate-toast-in pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-2xl glass p-3.5"
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
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold">{t.title}</p>
              {t.description ? (
                <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{t.description}</p>
              ) : null}
            </div>
            <button
              onClick={() => dismissToast(t.id)}
              className="text-muted-foreground transition-colors hover:text-foreground"
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
