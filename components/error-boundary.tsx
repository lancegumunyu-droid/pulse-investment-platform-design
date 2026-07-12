'use client'

import { useEffect } from 'react'
import { AlertCircle, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[v0] Error boundary caught:', error)
  }, [error])

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-md space-y-6 text-center">
        <div className="flex justify-center">
          <div className="rounded-full bg-red-500/20 p-4">
            <AlertCircle className="w-8 h-8 text-red-400" />
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold">Something went wrong</h1>
          <p className="text-muted-foreground text-sm">
            An unexpected error occurred. Our team has been notified.
          </p>
        </div>

        {process.env.NODE_ENV === 'development' && error.message && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-left">
            <p className="text-xs font-mono text-red-400">{error.message}</p>
          </div>
        )}

        <Button onClick={() => reset()} className="w-full bg-gold hover:bg-gold/90">
          <RefreshCw className="w-4 h-4 mr-2" />
          Try again
        </Button>

        <div className="flex gap-2 text-xs text-muted-foreground">
          <a href="/" className="hover:text-foreground">
            Home
          </a>
          <span>•</span>
          <a href="/contact" className="hover:text-foreground">
            Support
          </a>
        </div>
      </div>
    </div>
  )
}
