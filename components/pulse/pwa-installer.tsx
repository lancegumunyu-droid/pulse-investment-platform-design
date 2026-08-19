'use client'

import { useEffect, useState } from 'react'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export function PWAInstaller() {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [isVisible, setIsVisible] = useState(false)
  const [isStandalone, setIsStandalone] = useState(false)

  useEffect(() => {
    // Detect standalone mode (App already installed)
    const checkStandalone = () => {
      const isStandaloneMode =
        window.matchMedia('(display-mode: standalone)').matches ||
        (navigator as unknown as { standalone?: boolean }).standalone === true
      setIsStandalone(isStandaloneMode)
    }

    checkStandalone()

    // Register Service Worker in production
    if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
      navigator.serviceWorker
        .register('/sw.js')
        .catch(() => {
          // SW registration failures handled silently
        })
    }

    // Capture native install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setInstallPrompt(e as BeforeInstallPromptEvent)
      if (!window.matchMedia('(display-mode: standalone)').matches) {
        setIsVisible(true)
      }
    }

    const handleAppInstalled = () => {
      setIsVisible(false)
      setInstallPrompt(null)
      setIsStandalone(true)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [])

  const handleInstallClick = async () => {
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
  }

  if (isStandalone || !isVisible || !installPrompt) {
    return null
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-sm animate-toast-in">
      <div className="glass-gold relative flex flex-col gap-3 rounded-2xl p-4 shadow-2xl backdrop-blur-xl border border-[#e8a317]/30 bg-zinc-950/90">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#e8a317]/10 text-[#e8a317] border border-[#e8a317]/30">
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                />
              </svg>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-zinc-100">Install Pulse App</h4>
              <p className="text-xs text-zinc-400">
                Get real-time investment updates and fast access to SADC projects.
              </p>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="text-zinc-400 hover:text-zinc-200 transition-colors p-1"
            aria-label="Close"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex items-center justify-end gap-2 pt-1">
          <button
            onClick={handleDismiss}
            className="rounded-lg px-3 py-1.5 text-xs font-medium text-zinc-400 hover:text-zinc-100 transition-colors"
          >
            Not now
          </button>
          <button
            onClick={handleInstallClick}
            className="rounded-lg bg-[#e8a317] px-3.5 py-1.5 text-xs font-semibold text-black hover:bg-[#e8a317]/90 transition-colors shadow-md"
          >
            Install
          </button>
        </div>
      </div>
    </div>
  )
}
