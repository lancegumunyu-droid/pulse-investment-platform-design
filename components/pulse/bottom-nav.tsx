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
    <>
      {/* ================= MOBILE BOTTOM DOCK ================= */}
      <motion.nav 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        aria-label="Syndicate Mobile Navigation"
        className="fixed inset-x-0 bottom-0 z-50 border-t border-amber-500/30 bg-zinc-950/95 backdrop-blur-2xl shadow-[0_-16px_50px_rgba(0,0,0,0.95)] md:hidden"
      >
        <div className="absolute top-0 inset-x-0 h-[1.5px] bg-gradient-to-r from-transparent via-amber-400 to-transparent pointer-events-none shadow-[0_0_15px_rgba(245,158,11,0.8)]" />

        <div className="mx-auto flex max-w-lg items-stretch justify-between px-2 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2.5 relative">
          {ITEMS.map(({ view: v, label, icon: Icon, badge }) => {
            const active = view === v
            return (
              <motion.button
                key={v}
                whileTap={{ scale: 0.90 }}
                onClick={() => setView(v)}
                className={cn(
                  'pulse-tab relative flex flex-1 flex-col items-center gap-1 rounded-2xl py-2 text-[10px] font-medium transition-colors select-none group',
                  active ? 'text-amber-300 font-bold' : 'text-zinc-400 hover:text-white'
                )}
                aria-current={active ? 'page' : undefined}
              >
                {active && (
                  <motion.div
                    layoutId="mobileActiveTabIndicator"
                    className="absolute inset-x-0.5 top-0 bottom-0 rounded-2xl bg-gradient-to-b from-amber-400/20 via-amber-500/10 to-transparent border border-amber-400/50 shadow-[0_0_25px_rgba(245,158,11,0.3),inset_0_0_12px_rgba(245,158,11,0.1)] -z-10"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
                <span className={cn('relative flex size-7 items-center justify-center rounded-xl transition-all duration-200', active ? 'text-amber-400 scale-110 drop-shadow-[0_0_12px_rgba(245,158,11,0.8)]' : 'group-hover:scale-105 group-hover:text-amber-200')}>
                  <Icon className="size-[19px]" />
                  {badge && <span className="absolute -top-0.5 -right-0.5 flex size-2 items-center justify-center rounded-full bg-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.9)]" />}
                </span>
                <span className="tracking-tight text-[9px] uppercase font-bold">{label}</span>
              </motion.button>
            )
          })}
        </div>
      </motion.nav>

      {/* ================= DESKTOP FLOATING SIDEBAR / DOCK ================= */}
      <motion.aside 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        aria-label="Syndicate Desktop Navigation"
        className="hidden md:flex fixed left-6 top-1/2 -translate-y-1/2 z-50 flex-col gap-2 p-2.5 rounded-3xl border border-amber-500/30 bg-zinc-950/90 backdrop-blur-2xl shadow-[0_0_40px_rgba(0,0,0,0.9)]"
      >
        <div className="absolute inset-y-0 left-0 w-[1.5px] bg-gradient-to-b from-transparent via-amber-400 to-transparent pointer-events-none shadow-[0_0_15px_rgba(245,158,11,0.8)]" />

        {ITEMS.map(({ view: v, label, icon: Icon, badge }) => {
          const active = view === v
          return (
            <motion.button
              key={v}
              whileHover={{ scale: 1.05, x: 2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setView(v)}
              className={cn(
                'group relative flex items-center gap-3 px-3.5 py-3 rounded-2xl text-xs font-semibold transition-all select-none',
                active ? 'text-amber-300 font-bold' : 'text-zinc-400 hover:text-white hover:bg-neutral-900/60'
              )}
              aria-current={active ? 'page' : undefined}
            >
              {active && (
                <motion.div
                  layoutId="desktopActiveTabIndicator"
                  className="absolute inset-0 rounded-2xl bg-gradient-to-r from-amber-400/20 via-amber-500/10 to-transparent border border-amber-400/50 shadow-[0_0_25px_rgba(245,158,11,0.3),inset_0_0_12px_rgba(245,158,11,0.1)] -z-10"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              <span className={cn('relative flex size-5 items-center justify-center transition-all', active ? 'text-amber-400 drop-shadow-[0_0_10px_rgba(245,158,11,0.8)]' : 'group-hover:text-amber-200')}>
                <Icon className="size-5" />
                {badge && <span className="absolute -top-1 -right-1 flex size-2 items-center justify-center rounded-full bg-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.9)]" />}
              </span>
              <span className="tracking-wide text-xs uppercase font-bold pr-2">{label}</span>
            </motion.button>
          )
        })}
      </motion.aside>
    </>
  )
}
