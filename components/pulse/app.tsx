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

// High-end screen transition configuration with micro-spring dynamics
const viewVariants = {
  initial: {
    opacity: 0,
    y: 10,
    scale: 0.992,
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
    y: -6,
    scale: 0.996,
    transition: {
      duration: 0.18,
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

  // Reset scroll to top smoothly on view changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
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
        className="pulse-view w-full flex flex-col flex-1"
      >
        <ActiveView />
      </motion.div>
    </AnimatePresence>
  )
}

export function PulseApp({ initial }: { initial: Snapshot }) {
  return (
    <PulseProvider initial={initial}>
      <div className="pulse-app relative w-full min-h-screen min-h-[100dvh] flex flex-col bg-[#050505] text-zinc-100 selection:bg-amber-500/30 selection:text-amber-200 antialiased overflow-x-clip">
        
        {/* Immersive Multi-Layer Ambient Lighting Atmosphere */}
        <div className="pointer-events-none fixed inset-0 z-0 flex justify-center overflow-hidden">
          {/* Primary Top Gold Core Gradient */}
          <div className="absolute top-0 h-[450px] w-full max-w-7xl bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-500/[0.08] via-amber-600/[0.02] to-transparent blur-[120px] opacity-70" />
          {/* Secondary Bottom Ambient Balancer */}
          <div className="absolute bottom-[-10%] h-[300px] w-[600px] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-amber-500/[0.04] via-transparent to-transparent blur-[100px] opacity-50" />
        </div>

        {/* Global Wrapper constraining content on large desktop displays while preserving native fluid width on mobile */}
        <div className="relative z-10 flex flex-col flex-1 w-full max-w-7xl mx-auto shadow-2xl bg-[#050505]/40 backdrop-blur-[2px]">
          
          {/* Floating Sticky Top Bar */}
          <header className="sticky top-0 z-40 w-full pt-safe backdrop-blur-xl bg-[#050505]/80 border-b border-white/[0.06]">
            <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <TopBar />
            </div>
          </header>

          {/* Animated Screen Content Area with Responsive Desktop Max-W & Padding */}
          <main className="pulse-screen relative z-10 flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-40">
            <Screen />
          </main>

          {/* Bottom Navigation & Overlays */}
          <footer className="fixed bottom-0 left-0 right-0 z-40 pb-safe pointer-events-none">
            <div className="w-full max-w-lg mx-auto px-4 pointer-events-auto">
              <BottomNav />
            </div>
          </footer>

        </div>

        <Modals />
        <Toaster />
      </div>
    </PulseProvider>
  )
}
