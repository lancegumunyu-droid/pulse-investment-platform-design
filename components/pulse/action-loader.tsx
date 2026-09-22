'use client'

import { Loader2 } from 'lucide-react'
import { usePulse } from './store'

export function ActionLoader() {
  const busy = usePulse((state) => state.busy)
  if (!busy) return null

  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-[70] h-1 overflow-hidden bg-amber-950/40" role="status" aria-live="polite" aria-label="Pulse action in progress">
      <div className="h-full w-1/3 animate-[pulse-loader_1.1s_ease-in-out_infinite] rounded-full bg-amber-300 shadow-[0_0_18px_rgba(245,158,11,0.95)]" />
      <span className="sr-only">Processing your request</span>
    </div>
  )
}

export function ActionLoaderInline() {
  const busy = usePulse((state) => state.busy)
  if (!busy) return null
  return <Loader2 className="size-4 animate-spin" aria-label="Processing" />
}
