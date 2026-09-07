'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
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
  const [mounted, setMounted] = useState(false)
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [isVisible, setIsVisible] = useState(false)
  const [isStandalone, setIsStandalone] = useState(false)
  const [isIos, setIsIos] = useState(false)
  const [showIosGuide, setShowIosGuide] = useState(false)

  useEffect(() => {
    setMounted(true)

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

  if (!mounted || isStandalone || (!installPrompt && !isIos)) {
    return null
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 15, scale: 0.95 }}
          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          className="fixed bottom-20 right-4 z-50 max-w-sm sm:bottom-6 sm:right-6 font-sans"
        >
          <div className="relative flex flex-col gap-3 rounded-2xl border border-amber-500/30 bg-zinc-950/95 p-4 shadow-[0_20px_50px_rgba(0,0,0,0.9)] backdrop-blur-2xl">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-amber-400/30 bg-amber-400/10 text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.15)]">
                  <Download className="size-5" />
                </span>
                <div>
                  <h4 className="text-sm font-semibold text-white font-display">Install Pulse App</h4>
                  <p className="mt-0.5 text-xs text-zinc-300 font-sans">
                    Get real-time investment updates and fast access to SADC projects.
                  </p>
                </div>
              </div>
              <button
                onClick={handleDismiss}
                className="rounded-full p-1 text-zinc-400 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/50"
                aria-label="Close"
              >
                <X className="size-4" />
              </button>
            </div>

            {/* iOS Step-by-step instructions tooltip */}
            <AnimatePresence>
              {isIos && showIosGuide && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="mt-1 space-y-1.5 rounded-xl border border-white/10 bg-white/[0.04] p-3 text-xs text-zinc-300 font-sans">
                    <div className="flex items-center gap-2 font-medium text-white">
                      <Share className="size-4 text-amber-400" />
                      <span>Tap Share in Safari menu</span>
                    </div>
                    <p>
                      Then scroll down and select <span className="font-semibold text-white">&quot;Add to Home Screen&quot;</span>.
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex items-center justify-end gap-2 pt-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDismiss}
                className="h-8 text-xs text-zinc-400 hover:bg-white/[0.04] hover:text-white"
              >
                Not now
              </Button>
              <Button
                size="sm"
                onClick={handleInstallClick}
                className={cn(
                  'h-8 bg-amber-400 px-3.5 text-xs font-semibold text-zinc-950 shadow-[0_0_15px_rgba(245,158,11,0.3)] hover:bg-amber-300 hover:shadow-[0_0_20px_rgba(245,158,11,0.5)] transition-all'
                )}
              >
                {isIos ? (showIosGuide ? 'Hide instructions' : 'How to install') : 'Install'}
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
