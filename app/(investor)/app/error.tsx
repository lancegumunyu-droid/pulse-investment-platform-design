'use client'

import { useEffect } from 'react'

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[v0] Portfolio route error', error)
  }, [error])

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6 py-12 text-foreground">
      <section className="w-full max-w-lg space-y-5 rounded-2xl border border-border bg-card p-6 shadow-xl">
        <div className="space-y-2">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">Live account sync</p>
          <h1 className="text-2xl font-semibold text-balance">We couldn&apos;t load your portfolio</h1>
          <p className="text-sm leading-6 text-muted-foreground">
            Your data was not replaced with demo values. Refresh to retry the authenticated Supabase query.
          </p>
        </div>
        <div role="alert" className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 font-mono text-xs leading-5 text-destructive">
          {error.message}
        </div>
        <button
          type="button"
          onClick={reset}
          className="inline-flex min-h-11 items-center justify-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          Retry live sync
        </button>
      </section>
    </main>
  )
}
