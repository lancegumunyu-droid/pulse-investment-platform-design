'use client'

import { PulseProvider, usePulse } from './store'
import { TopBar } from './top-bar'
import { BottomNav } from './bottom-nav'
import { Toaster } from './toaster'
import { Modals } from './modals'
import { HomeView } from './views/home'
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
      {view === 'home' && <HomeView />}
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
        <footer className="flex flex-wrap justify-center gap-x-4 gap-y-2 px-4 pb-5 text-center text-xs text-muted-foreground">
          <a
            href="https://www.iubenda.com/privacy-policy/92520629"
            className="iubenda-black iubenda-noiframe iubenda-embed underline-offset-4 hover:text-foreground hover:underline"
            title="Privacy Policy"
          >
            Privacy Policy
          </a>
          <a
            href="https://www.iubenda.com/privacy-policy/92520629/cookie-policy"
            className="iubenda-black iubenda-noiframe iubenda-embed underline-offset-4 hover:text-foreground hover:underline"
            title="Cookie Policy"
          >
            Cookie Policy
          </a>
          <a href="/notice-at-collection" className="underline-offset-4 hover:text-foreground hover:underline">
            Notice at Collection
          </a>
        </footer>
        <BottomNav />
        <Modals />
        <Toaster />
      </div>
    </PulseProvider>
  )
}
