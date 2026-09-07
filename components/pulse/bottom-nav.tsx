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
  const { view, setView } = usePulse()

  return (
    <motion.nav 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      aria-label="Syndicate Navigation"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-amber-500/20 bg-zinc-950/85 backdrop-blur-2xl shadow-[0_-12px_40px_rgba(0,0,0,0.85)]"
    >
      {/* Top Shimmer Border Accent */}
      <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-amber-400/50 to-transparent pointer-events-none" />

      <div className="mx-auto flex max-w-lg items-stretch justify-between px-2 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2.5 relative">
        {ITEMS.map(({ view: v, label, icon: Icon, badge }) => {
          const active = view === v
          return (
            <motion.button
              key={v}
              whileTap={{ scale: 0.90 }}
              onClick={() => setView(v)}
              className={cn(
                'pulse-tab relative flex flex-1 flex-col items-center gap-1 rounded-2xl py-1.5 text-[10px] font-medium transition-colors select-none group',
                active ? 'text-amber-400 font-semibold' : 'text-zinc-400 hover:text-white'
              )}
              aria-current={active ? 'page' : undefined}
            >
              {active && (
                <motion.div
                  layoutId="activeTabIndicator"
                  className="absolute inset-x-0.5 top-0 bottom-0 rounded-2xl bg-gradient-to-b from-amber-400/25 via-amber-500/10 to-transparent border border-amber-400/40 shadow-[0_0_24px_rgba(245,158,11,0.25),inset_0_0_12px_rgba(245,158,11,0.08)] -z-10"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}

              <span
                className={cn(
                  'relative flex size-7 items-center justify-center rounded-xl transition-all duration-200',
                  active ? 'text-amber-400 scale-110 drop-shadow-[0_0_10px_rgba(245,158,11,0.6)]' : 'group-hover:scale-105'
                )}
              >
                <Icon className="size-[18px]" />
                {badge && (
                  <span className="absolute -top-0.5 -right-0.5 flex size-2 items-center justify-center rounded-full bg-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.9)]" />
                )}
              </span>

              <span className="tracking-tight text-[9px] font-semibold uppercase">{label}</span>
            </motion.button>
          )
        })}
      </div>
    </motion.nav>
  )
}
