'use client'

import React from 'react'
import { ShieldCheck } from 'lucide-react'
import type { Snapshot } from '@/lib/pulse/types'
import { PulseProvider, usePulse } from './store'
import { TopBar } from './top-bar'
import { BottomNav } from './bottom-nav'
import { Modals } from './modals'
import { Toaster } from './toaster'
import { SupportWidget } from './support-widget'
import { RiskNote } from './ui-bits'
import { DashboardView } from './views/dashboard'
import { InvestView } from './views/invest'
import { WalletView } from './views/wallet'
import { SaleView } from './views/sale'
import { StakeView } from './views/stake'
import { SignalsView } from './views/signals'
import { ProfileView } from './views/profile'
import { AdminView } from './views/admin'

interface PulseAppProps {
  initial: Snapshot
}

function VerificationRequiredView() {
  const { setView, openModal } = usePulse()
  return (
    <section className="pulse-glass-card mx-auto flex max-w-xl flex-col items-center gap-4 p-8 text-center">
      <ShieldCheck className="size-10 text-amber-300" />
      <h1 className="text-xl font-semibold">Identity verification required</h1>
      <p className="text-sm leading-6 text-muted-foreground">Complete verification to unlock investing, staking, sale, signals, and wallet features.</p>
      <div className="flex gap-3">
        <button className="pulse-action rounded-xl bg-amber-400 px-4 py-2 text-sm font-semibold text-black" onClick={() => openModal('kyc')}>Verify identity</button>
        <button className="rounded-xl border border-white/10 px-4 py-2 text-sm" onClick={() => setView('profile')}>View profile</button>
      </div>
    </section>
  )
}

function ViewSwitcher() {
  const view = usePulse((s) => s.view)
  const kyc = usePulse((s) => s.state.kyc)
  const isAdmin = usePulse((s) => s.state.isAdmin)
  const restricted = ['invest', 'sale', 'stake', 'signals', 'wallet'].includes(view)
  if (restricted && kyc !== 'verified') return <VerificationRequiredView />
  switch (view) {
    case 'dashboard':
      return <DashboardView />
    case 'invest':
      return <InvestView />
    case 'wallet':
      return <WalletView />
    case 'sale':
      return <SaleView />
    case 'stake':
      return <StakeView />
    case 'signals':
      return <SignalsView />
    case 'profile':
      return <ProfileView />
    case 'admin':
      return isAdmin ? <AdminView /> : <DashboardView />
    default:
      return <DashboardView />
  }
}

export function PulseApp({ initial }: PulseAppProps) {
  return (
    <PulseProvider initial={initial}>
      <div className="pulse-app min-h-dvh bg-black">
        <TopBar />
        <main className="mx-auto w-full max-w-4xl px-3 pb-[calc(7.5rem+env(safe-area-inset-bottom))] pt-4 sm:px-4 sm:pb-[calc(9rem+env(safe-area-inset-bottom))] sm:pt-6">
          <ViewSwitcher />
          <div className="mx-auto mt-3 w-full max-w-3xl border-t border-amber-500/15 pt-3">
            <RiskNote className="w-full rounded-xl bg-amber-400/[0.03] shadow-none" />
          </div>
        </main>
        <BottomNav />
        <Modals />
        <SupportWidget />
        <Toaster />
      </div>
    </PulseProvider>
  )
}
