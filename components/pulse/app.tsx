'use client'

import React from 'react'
import type { Snapshot } from '@/lib/pulse/types'
import { PulseProvider, usePulse } from './store'
import { TopBar } from './top-bar'
import { BottomNav } from './bottom-nav'
import { Modals } from './modals'
import { Toaster } from './toaster'
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

function ViewSwitcher() {
  const view = usePulse((s) => s.view)
  const isAdmin = usePulse((s) => s.state.isAdmin)
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
      <div className="min-h-dvh bg-black">
        <TopBar />
        <main className="mx-auto max-w-4xl px-4 pb-28 pt-6">
          <ViewSwitcher />
        </main>
        <BottomNav />
        <Modals />
        <Toaster />
      </div>
    </PulseProvider>
  )
}
