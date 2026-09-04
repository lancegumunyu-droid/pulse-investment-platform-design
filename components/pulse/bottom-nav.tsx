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
      className="fixed inset-x-0 bottom-0 z-50 border-t border-gold/25 bg-background/90 backdrop-blur-2xl shadow-[0_-10px_35px_rgba(0,0,0,0.8)]"
    >
      <div className="mx-auto flex max-w-md items-stretch justify-between px-1.5 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2 relative">
        {ITEMS.map(({ view: v, label, icon: Icon, badge }) => {
          const active = view === v
          return (
            <motion.button
              key={v}
              whileTap={{ scale: 0.92 }}
              onClick={() => setView(v)}
              className={cn(
                'pulse-tab relative flex flex-1 flex-col items-center gap-1 rounded-xl py-1 text-[10px] font-medium transition-all select-none group',
                active ? 'text-gold pulse-tab-active' : 'text-muted-foreground hover:text-foreground'
              )}
              aria-current={active ? 'page' : undefined}
            >
              {active && (
                <motion.div
                  layoutId="activeTabIndicator"
                  className="absolute inset-x-0.5 top-0 bottom-0 rounded-xl bg-gradient-to-b from-amber-500/15 to-amber-500/5 border border-amber-500/30 shadow-[0_0_15px_rgba(245,158,11,0.15)] -z-10"
                  transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                />
              )}

              <span
                className={cn(
                  'relative flex size-7 items-center justify-center rounded-xl transition-all duration-200',
                  active ? 'text-amber-400 scale-110' : 'group-hover:scale-105'
                )}
              >
                <Icon className="size-[17px]" />
                {badge && (
                  <span className="absolute -top-0.5 -right-0.5 flex size-2 items-center justify-center rounded-full bg-amber-400 shadow-[0_0_6px_rgba(245,158,11,0.8)]" />
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
