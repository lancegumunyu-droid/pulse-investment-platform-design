'use client'

import { motion } from 'framer-motion'
import { BadgeCheck, ShieldCheck } from 'lucide-react'
import { money, usePulse } from './store'
import { Heartbeat, Pill } from './ui-bits'
import { NotificationBell } from './notification-bell'

export function TopBar() {
  const { state, portfolioValue, openModal, setView } = usePulse()
  
  // The brand mark IS the living heartbeat — beats steady when idle,
  // faster whenever any transaction is actually pending.
  const hasPendingActivity = state.txns.some((t) => t.status === 'pending')

  return (
    <motion.header 
      initial={{ opacity: 0, y: -15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="sticky top-0 z-40 border-b border-white/10 bg-[#050505]/80 backdrop-blur-xl shadow-lg shadow-black/40"
    >
      <div className="mx-auto flex max-w-md items-center justify-between px-4 py-3">
        <motion.button 
          whileTap={{ scale: 0.96 }}
          onClick={() => setView('dashboard')} 
          className="flex items-center gap-2.5 text-left group"
        >
          <Heartbeat active={hasPendingActivity} size={36} />
          <span>
            <span className="block text-base font-semibold leading-none tracking-tight text-white group-hover:text-gold transition-colors">Pulse</span>
            <span className="mt-1 block text-[10px] leading-none text-muted-foreground">Grow responsibly</span>
          </span>
        </motion.button>

        <div className="flex items-center gap-2.5">
          <motion.button 
            whileTap={{ scale: 0.96 }}
            onClick={() => setView('wallet')} 
            className="text-right px-2 py-1 rounded-xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.05] transition-all" 
            aria-label="View wallet"
          >
            <p className="text-[9px] uppercase tracking-wider text-muted-foreground">Portfolio</p>
            <p className="font-mono text-sm font-semibold leading-tight text-white">${money(portfolioValue)}</p>
          </motion.button>

          <NotificationBell />

          {state.kyc === 'verified' ? (
            <motion.span 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="flex size-9 items-center justify-center rounded-xl bg-green/10 text-green border border-green/20" 
              aria-label="KYC verified"
            >
              <BadgeCheck className="size-5" />
            </motion.span>
          ) : (
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => openModal('kyc')}
              className="flex size-9 items-center justify-center rounded-xl bg-gold/15 text-gold border border-gold/30 hover:bg-gold/25 transition-all shadow-md shadow-gold/10"
              aria-label="Complete verification"
            >
              <ShieldCheck className="size-5" />
            </motion.button>
          )}
        </div>
      </div>

      {state.kyc !== 'verified' ? (
        <motion.button
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          onClick={() => openModal('kyc')}
          className="block w-full border-t border-gold/20 bg-gold/10 px-4 py-2 text-center text-[11px] font-medium text-gold backdrop-blur-md transition-colors hover:bg-gold/15"
        >
          <Pill tone="gold">
            {state.kyc === 'pending' ? 'Verification under review' : 'Verify your identity to unlock full access'}
          </Pill>
        </motion.button>
      ) : null}
    </motion.header>
  )
}
