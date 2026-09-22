'use client'

import { Volume2, VolumeX } from 'lucide-react'
import { usePulse } from './store'

export function SoundControls() {
  const { soundEnabled, setSoundEnabled, playSound } = usePulse()

  return (
    <div className="fixed bottom-[calc(5.25rem+env(safe-area-inset-bottom))] right-3 z-40 flex items-center gap-1 rounded-full border border-white/10 bg-zinc-950/90 p-1 shadow-2xl backdrop-blur-xl sm:bottom-5 sm:right-5">
      <button
        type="button"
        aria-label={soundEnabled ? 'Mute Pulse sounds' : 'Enable Pulse sounds'}
        aria-pressed={soundEnabled}
        onClick={() => setSoundEnabled(!soundEnabled)}
        className="flex size-9 items-center justify-center rounded-full text-amber-300 transition hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
      >
        {soundEnabled ? <Volume2 className="size-4" /> : <VolumeX className="size-4 text-zinc-500" />}
      </button>
    </div>
  )
}
