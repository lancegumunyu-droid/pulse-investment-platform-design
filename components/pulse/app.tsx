'use client'

import React from 'react'
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
    y: 14,
    scale: 0.985,
  },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.32,
      ease: [0.22, 1, 0.36, 1], // Luxury cubic-bezier curve
    },
  },
  exit: {
    opacity: 0,
    y: -10,
    scale: 0.985,
    transition: {
      duration: 0.18,
      ease: 'easeIn',
    },
  },
}

function Screen() {
  const { view } = usePulse()

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={view}
        variants={viewVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        className="w-full"
      >
        {view === 'dashboard' && <DashboardView />}
        {view === 'invest' && <InvestView />}
        {view === 'sale' && <SaleView />}
        {view === 'stake' && <StakeView />}
        {view === 'signals' && <SignalsView />}
        {view === 'wallet' && <WalletView />}
        {view === 'profile' && <ProfileView />}
        {view === 'admin' && <AdminView />}
      </motion.div>
    </AnimatePresence>
  )
}

export function PulseApp({ initial }: { initial: Snapshot }) {
  return (
    <PulseProvider initial={initial}>
      <div className="relative mx-auto flex min-h-screen max-w-md flex-col bg-[#050505] text-[#f4f4f5] selection:bg-[#e8a317]/30 selection:text-[#f0d9a8] shadow-2xl">
        {/* Ambient Glow Atmosphere */}
        <div className="pointer-events-none fixed inset-0 z-0 flex justify-center overflow-hidden">
          <div className="h-[350px] w-full max-w-md bg-radial from-[#e8a317]/10 via-transparent to-transparent blur-3xl opacity-60" />
        </div>

        {/* Floating Top Bar */}
        <div className="relative z-20">
          <TopBar />
        </div>

        {/* Animated Screen Content Area */}
        <main className="relative z-10 flex-1 px-4 pb-28 pt-5">
          <Screen />
        </main>

        {/* Bottom Navigation & Overlays */}
        <div className="relative z-30">
          <BottomNav />
        </div>
        
        <Modals />
        <Toaster />
      </div>
    </PulseProvider>
  )
}
