'use client'

import { motion } from 'framer-motion'
import { House, Layers, Radio, Sparkles, User, Wallet, Zap } from 'lucide-react'
import { usePulse, type View } from './store'
import { cn } from '@/lib/utils'

const ITEMS: { view: View; label: string; icon: typeof House }[] = [
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
      className="fixed inset-x-0 bottom-0 z-50 border-t border-white/10 bg-[#050505]/85 backdrop-blur-xl shadow-[0_-10px_30px_rgba(0,0,0,0.5)]"
    >
      <div className="mx-auto flex max-w-md items-stretch justify-between px-1.5 pb-[max(0.4rem,env(safe-area-inset-bottom))] pt-1.5 relative">
        {ITEMS.map(({ view: v, label, icon: Icon }) => {
          const active = view === v
          return (
            <motion.button
              key={v}
              whileTap={{ scale: 0.92 }}
              onClick={() => setView(v)}
              className={cn(
                'relative flex flex-1 flex-col items-center gap-1 rounded-xl py-1.5 text-[10px] font-medium transition-colors group',
                active ? 'text-gold' : 'text-muted-foreground hover:text-white',
              )}
              aria-current={active ? 'page' : undefined}
            >
              {active && (
                <motion.div
                  layoutId="activeTabIndicator"
                  className="absolute inset-x-1 top-1 bottom-1 rounded-xl bg-gold/10 border border-gold/20 shadow-inner shadow-gold/10 -z-10"
                  transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                />
              )}
              
              <span
                className={cn(
                  'flex size-8 items-center justify-center rounded-xl transition-all',
                  active ? 'text-gold scale-105' : 'group-hover:scale-105'
                )}
              >
                <Icon className="size-[18px]" />
              </span>
              <span className="tracking-tight">{label}</span>
            </motion.button>
          )
        })}
      </div>
    </motion.nav>
  )
}
