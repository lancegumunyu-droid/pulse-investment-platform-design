'use client'

import { useEffect, useState } from 'react'
import { Download, Share, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

const DISMISS_KEY = 'pulse_pwa_prompt_dismissed'
const DISMISS_DURATION_MS = 7 * 24 * 60 * 60 * 1000 // Re-prompt after 7 days

export function PWAInstaller() {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [isVisible, setIsVisible] = useState(false)
  const [isStandalone, setIsStandalone] = useState(false)
  const [isIos, setIsIos] = useState(false)
  const [showIosGuide, setShowIosGuide] = useState(false)

  useEffect(() => {
    // Detect if app is already running in standalone mode (installed PWA)
    const checkStandalone = () => {
      const isStandaloneMode =
        window.matchMedia('(display-mode: standalone)').matches ||
        (navigator as unknown as { standalone?: boolean }).standalone === true
      setIsStandalone(isStandaloneMode)
    }

    checkStandalone()

    // Detect iOS browser (Safari / Chrome on iOS don't support beforeinstallprompt)
    const ua = window.navigator.userAgent
    const isIosDevice = /iPhone|iPad|iPod/.test(ua) && !(window as unknown as { MSStream?: unknown }).MSStream
    setIsIos(isIosDevice)

    // Check if user recently dismissed the prompt
    const dismissedAt = localStorage.getItem(DISMISS_KEY)
    const isDismissed = dismissedAt && Date.now() - Number(dismissedAt) < DISMISS_DURATION_MS

    // Register Service Worker in production
    if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
      navigator.serviceWorker
        .register('/sw.js')
        .catch(() => {
          // SW registration failures handled silently
        })
    }

    // Handle standard PWA prompt for Android / Chrome / Edge
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setInstallPrompt(e as BeforeInstallPromptEvent)
      if (!isStandalone && !isDismissed) {
        setIsVisible(true)
      }
    }

    const handleAppInstalled = () => {
      setIsVisible(false)
      setInstallPrompt(null)
      setIsStandalone(true)
      localStorage.removeItem(DISMISS_KEY)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)

    // On iOS Safari, if not standalone and not recently dismissed, show prompt
    if (isIosDevice && !isStandalone && !isDismissed) {
      const timer = setTimeout(() => setIsVisible(true), 3000)
      return () => clearTimeout(timer)
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [isStandalone])

  const handleInstallClick = async () => {
    if (isIos) {
      setShowIosGuide((v) => !v)
      return
    }

    if (!installPrompt) return

    await installPrompt.prompt()
    const { outcome } = await installPrompt.userChoice

    if (outcome === 'accepted') {
      setIsVisible(false)
      setInstallPrompt(null)
    }
  }

  const handleDismiss = () => {
    setIsVisible(false)
    localStorage.setItem(DISMISS_KEY, String(Date.now()))
  }

  if (isStandalone || !isVisible || (!installPrompt && !isIos)) {
    return null
  }

  return (
    <div className="fixed bottom-20 right-4 z-50 max-w-sm animate-toast-in sm:bottom-6 sm:right-6">
      <div className="glass relative flex flex-col gap-3 rounded-2xl border border-gold/30 bg-background/95 p-4 shadow-2xl backdrop-blur-xl">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-gold-soft text-gold">
              <Download className="size-5" />
            </span>
            <div>
              <h4 className="text-sm font-semibold text-foreground">Install Pulse App</h4>
              <p className="text-xs text-muted-foreground">
                Get real-time investment updates and fast access to SADC projects.
              </p>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="rounded-full p-1 text-muted-foreground transition-colors hover:bg-white/10 hover:text-foreground"
            aria-label="Close"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* iOS Step-by-step instructions tooltip */}
        {isIos && showIosGuide && (
          <div className="mt-1 space-y-1.5 rounded-xl border border-white/10 bg-white/[0.04] p-3 text-xs text-muted-foreground">
            <div className="flex items-center gap-2 font-medium text-foreground">
              <Share className="size-4 text-gold" />
              <span>Tap Share in Safari menu</span>
            </div>
            <p>Then scroll down and select <span className="font-semibold text-foreground">"Add to Home Screen"</span>.</p>
          </div>
        )}

        <div className="flex items-center justify-end gap-2 pt-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDismiss}
            className="h-8 text-xs text-muted-foreground hover:text-foreground"
          >
            Not now
          </Button>
          <Button
            size="sm"
            onClick={handleInstallClick}
            className={cn('h-8 bg-gold px-3.5 text-xs font-semibold text-primary-foreground hover:bg-gold/90')}
          >
            {isIos ? (showIosGuide ? 'Hide instructions' : 'How to install') : 'Install'}
          </Button>
        </div>
      </div>
    </div>
  )
}
