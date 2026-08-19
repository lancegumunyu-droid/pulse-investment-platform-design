'use client'

import { motion } from 'framer-motion'
import { BadgeCheck, ShieldAlert, ShieldCheck } from 'lucide-react'
import { money, usePulse } from './store'
import { Heartbeat, Pill } from './ui-bits'
import { NotificationBell } from './notification-bell'

export function TopBar() {
  const { state, portfolioValue, openModal, setView } = usePulse()

  const hasPendingActivity = state.txns.some((t) => t.status === 'pending')

  return (
    <motion.header
      initial={{ opacity: 0, y: -15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="sticky top-0 z-40 border-b border-white/10 bg-background/80 backdrop-blur-xl shadow-lg shadow-black/40"
    >
      <div className="mx-auto flex max-w-md items-center justify-between px-4 py-3 sm:max-w-xl md:max-w-2xl lg:max-w-4xl">
        <motion.button
          whileTap={{ scale: 0.96 }}
          onClick={() => setView('dashboard')}
          className="group flex items-center gap-2.5 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/50 rounded-xl p-0.5"
          aria-label="Pulse Dashboard Home"
        >
          <Heartbeat active={hasPendingActivity} size={36} />
          <span>
            <span className="block text-base font-semibold leading-none tracking-tight text-foreground transition-colors group-hover:text-gold">
              Pulse
            </span>
            <span className="mt-1 block text-[10px] leading-none text-muted-foreground">
              Grow responsibly
            </span>
          </span>
        </motion.button>

        <div className="flex items-center gap-2.5">
          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={() => setView('wallet')}
            className="rounded-xl border border-white/5 bg-white/[0.03] px-2.5 py-1 text-right transition-all hover:border-gold/30 hover:bg-white/[0.06] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/50"
            aria-label="View wallet portfolio"
          >
            <p className="text-[9px] font-medium uppercase tracking-wider text-muted-foreground">
              Portfolio
            </p>
            <p className="font-mono text-sm font-semibold leading-tight text-foreground">
              ${money(portfolioValue)}
            </p>
          </motion.button>

          <NotificationBell />

          {state.kyc === 'verified' ? (
            <motion.span
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="flex size-9 items-center justify-center rounded-xl border border-green/30 bg-green-soft text-green shadow-sm"
              title="KYC Verified"
              aria-label="KYC verified"
            >
              <BadgeCheck className="size-5" />
            </motion.span>
          ) : (
            <motion.button
              whileTap={{ scale: 0.92 }}
              onClick={() => openModal('kyc')}
              className="flex size-9 items-center justify-center rounded-xl border border-gold/30 bg-gold-soft text-gold shadow-md shadow-gold/10 transition-all hover:bg-gold/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/50"
              title="Verify Identity"
              aria-label="Complete verification"
            >
              {state.kyc === 'rejected' ? (
                <ShieldAlert className="size-5 text-destructive" />
              ) : (
                <ShieldCheck className="size-5" />
              )}
            </motion.button>
          )}
        </div>
      </div>

      {state.kyc !== 'verified' && (
        <motion.button
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          onClick={() => openModal('kyc')}
          className="block w-full border-t border-gold/20 bg-gold/10 px-4 py-1.5 text-center text-[11px] font-medium text-gold backdrop-blur-md transition-colors hover:bg-gold/15 focus-visible:outline-none"
        >
          <Pill tone={state.kyc === 'rejected' ? 'danger' : 'gold'}>
            {state.kyc === 'pending'
              ? 'Verification under review'
              : state.kyc === 'rejected'
                ? 'Verification rejected — Tap to re-submit'
                : 'Verify your identity to unlock full access'}
          </Pill>
        </motion.button>
      )}
    </motion.header>
  )
}
