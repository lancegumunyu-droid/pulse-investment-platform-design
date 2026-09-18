'use client'

import { motion } from 'framer-motion'
import { House, Layers, Radio, Sparkles, User, Wallet, Zap } from 'lucide-react'
import { usePulse, type View } from './store'
import { cn } from '@/lib/utils'

const ITEMS: { view: View; label: string; icon: typeof House; badge?: string }[] = [
  { view: 'dashboard', label: 'Home', icon: House },
  { view: 'invest', label: 'Invest', icon: Layers },
  { view: 'sale', label: 'Sale', icon: Sparkles },
  { view: 'stake', label: 'Stake', icon: Zap },
  { view: 'signals', label: 'Signals', icon: Radio },
  { view: 'wallet', label: 'Wallet', icon: Wallet },
  { view: 'profile', label: 'Profile', icon: User },
]

export function BottomNav() {
  const view = usePulse((s) => s.view)
  const setView = usePulse((s) => s.setView)

  return (
    <motion.nav 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      aria-label="Syndicate Navigation"
      className="relative z-10 mt-2 w-full border-t border-amber-500/40 bg-zinc-950/95 pb-[env(safe-area-inset-bottom)] shadow-[0_-20px_60px_rgba(0,0,0,0.95)] backdrop-blur-2xl"
    >
      {/* Top Gold Shimmer Border Accent */}
      <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-amber-400 to-transparent pointer-events-none shadow-[0_0_20px_rgba(245,158,11,0.9)]" />

      <div className="mx-auto flex max-w-lg items-stretch justify-between px-2 py-2.5 relative">
        {ITEMS.map(({ view: v, label, icon: Icon, badge }) => {
          const active = view === v
          return (
            <motion.button
              key={v}
              whileTap={{ scale: 0.90 }}
              onClick={() => setView(v)}
              className={cn(
                'pulse-tab relative flex flex-1 flex-col items-center justify-center gap-1 rounded-2xl py-2 text-[10px] font-medium transition-colors select-none group',
                active ? 'text-amber-300 font-bold' : 'text-zinc-400 hover:text-white'
              )}
              aria-current={active ? 'page' : undefined}
            >
              {active && (
                <motion.div
                  layoutId="activeTabIndicator"
                  className="absolute inset-x-0.5 inset-y-1 rounded-2xl bg-gradient-to-b from-amber-400/25 via-amber-500/10 to-transparent border border-amber-400/60 shadow-[0_0_30px_rgba(245,158,11,0.4),inset_0_0_15px_rgba(245,158,11,0.15)] -z-10"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              <span className={cn('relative flex size-7 items-center justify-center rounded-xl transition-all duration-200', active ? 'text-amber-400 scale-110 drop-shadow-[0_0_15px_rgba(245,158,11,0.9)]' : 'group-hover:scale-105 group-hover:text-amber-200')}>
                <Icon className="size-[19px]" />
                {badge && <span className="absolute -top-0.5 -right-0.5 flex size-2 items-center justify-center rounded-full bg-amber-400 shadow-[0_0_10px_rgba(245,158,11,0.9)]" />}
              </span>
              <span className="tracking-tight text-[9px] uppercase font-bold leading-none">{label}</span>
            </motion.button>
          )
        })}
      </div>
    </motion.nav>
  )
}
