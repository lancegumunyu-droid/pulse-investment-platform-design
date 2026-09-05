'use client'

import React, { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { Snapshot } from '@/lib/pulse/types'
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

// High-end screen transition configuration
const viewVariants = {
  initial: {
    opacity: 0,
    y: 12,
  },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.28,
      ease: [0.22, 1, 0.36, 1], // Luxury cubic-bezier curve
    },
  },
  exit: {
    opacity: 0,
    y: -8,
    transition: {
      duration: 0.16,
      ease: 'easeIn',
    },
  },
}

// View Component Mapping
const VIEW_COMPONENTS: Record<string, React.ComponentType> = {
  dashboard: DashboardView,
  invest: InvestView,
  sale: SaleView,
  stake: StakeView,
  signals: SignalsView,
  wallet: WalletView,
  profile: ProfileView,
  admin: AdminView,
}

function Screen() {
  const { view } = usePulse()

  // Reset scroll to top on view changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [view])

  const ActiveView = VIEW_COMPONENTS[view] || DashboardView

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={view}
        variants={viewVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        className="pulse-view w-full"
      >
        <ActiveView />
      </motion.div>
    </AnimatePresence>
  )
}

export function PulseApp({ initial }: { initial: Snapshot }) {
  return (
    <PulseProvider initial={initial}>
      <div className="pulse-app relative mx-auto flex min-h-screen min-h-[100dvh] max-w-md flex-col bg-[#050505] text-[#f4f4f5] selection:bg-[#e8a317]/30 selection:text-[#f0d9a8] shadow-2xl border-x border-white/[0.04]">
        {/* Ambient Glow Atmosphere */}
        <div className="pointer-events-none fixed inset-0 z-0 flex justify-center overflow-hidden">
          <div className="h-[350px] w-full max-w-md bg-radial from-[#e8a317]/10 via-transparent to-transparent blur-3xl opacity-60" />
        </div>

        {/* Floating Top Bar */}
        <header className="relative z-20 pt-safe">
          <TopBar />
        </header>

        {/* Animated Screen Content Area */}
        <main className="pulse-screen relative z-10 flex-1 px-4 pt-4 pb-40">
          <Screen />
        </main>

        {/* Bottom Navigation & Overlays */}
        <footer className="relative z-30 pb-safe">
          <BottomNav />
        </footer>

        <Modals />
        <Toaster />
      </div>
    </PulseProvider>
  )
}
