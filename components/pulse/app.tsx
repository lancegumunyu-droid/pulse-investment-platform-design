'use client'

import { PulseProvider, usePulse } from './store'
import { TopBar } from './top-bar'
import { BottomNav } from './bottom-nav'
import { Toaster } from './toaster'
import { Modals } from './modals'
import { DashboardView } from './views/dashboard'
import { InvestView } from './views/invest'
import { SaleView } from './views/sale'
import { StakeView } from './views/stake'
import { SignalsView } from './views/signals'
import { WalletView } from './views/wallet'
import { ProfileView } from './views/profile'
import { AdminView } from './views/admin'

function Screen() {
  const { view } = usePulse()
  return (
    <div key={view} className="animate-rise">
      {view === 'dashboard' && <DashboardView />}
      {view === 'invest' && <InvestView />}
      {view === 'sale' && <SaleView />}
      {view === 'stake' && <StakeView />}
      {view === 'signals' && <SignalsView />}
      {view === 'wallet' && <WalletView />}
      {view === 'profile' && <ProfileView />}
      {view === 'admin' && <AdminView />}
    </div>
  )
}

export function PulseApp() {
  return (
    <PulseProvider>
      <div className="mx-auto flex min-h-screen max-w-md flex-col">
        <TopBar />
        <main className="flex-1 px-4 pb-28 pt-5">
          <Screen />
        </main>
        <BottomNav />
        <Modals />
        <Toaster />
      </div>
    </PulseProvider>
  )
}
