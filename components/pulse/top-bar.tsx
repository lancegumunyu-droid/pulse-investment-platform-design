'use client'
import { BadgeCheck, ShieldCheck } from 'lucide-react'
import { money, usePulse } from './store'
import { Heartbeat, Pill } from './ui-bits'
import { NotificationBell } from './notification-bell'
export function TopBar() {
  const { state, portfolioValue, openModal, setView } = usePulse()
  // The brand mark IS the living heartbeat now — beats steady when idle,
  // faster whenever any transaction is actually pending. This is the
  // literal "pulses when online / during transactions" brand moment,
  // and it's visible on every tab since it lives in the persistent header.
  const hasPendingActivity = state.txns.some((t) => t.status === 'pending')

  return (
    <header className="sticky top-0 z-40 border-b border-white/8 bg-background/70 backdrop-blur-xl">
      <div className="mx-auto flex max-w-md items-center justify-between px-4 py-3">
        <button onClick={() => setView('dashboard')} className="flex items-center gap-2.5">
          <Heartbeat active={hasPendingActivity} size={36} />
          <span className="text-left">
            <span className="block text-base font-semibold leading-none tracking-tight">Pulse</span>
            <span className="mt-0.5 block text-[10px] leading-none text-muted-foreground">Grow responsibly</span>
          </span>
        </button>
        <div className="flex items-center gap-2">
          <div className="text-right">
            <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Portfolio</p>
            <p className="font-mono text-sm font-semibold leading-none">${money(portfolioValue)}</p>
          </div>
          <NotificationBell />
          {state.kyc === 'verified' ? (
            <span className="flex size-9 items-center justify-center rounded-xl bg-green-soft text-green" aria-label="KYC verified">
              <BadgeCheck className="size-5" />
            </span>
          ) : (
            <button
              onClick={() => openModal('kyc')}
              className="flex size-9 items-center justify-center rounded-xl bg-gold-soft text-gold"
              aria-label="Complete verification"
            >
              <ShieldCheck className="size-5" />
            </button>
          )}
        </div>
      </div>
      {state.kyc !== 'verified' ? (
        <button
          onClick={() => openModal('kyc')}
          className="block w-full border-t border-white/8 bg-gold-soft/40 px-4 py-1.5 text-center text-[11px] font-medium text-gold"
        >
          <Pill tone="gold">
            {state.kyc === 'pending' ? 'Verification under review' : 'Verify your identity to unlock full access'}
          </Pill>
        </button>
      ) : null}
    </header>
  )
}
