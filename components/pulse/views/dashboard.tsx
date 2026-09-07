'use client'

import { useEffect, useState } from 'react'
import { motion, useMotionTemplate, useMotionValue } from 'framer-motion'
import { 
  ArrowDownRight, ArrowUpRight, Building2, ChevronRight, 
  Copy, Leaf, Pickaxe, Radio, Rocket, ShieldCheck, Sun, 
  TrendingUp, Zap, Lock, RefreshCw, Award
} from 'lucide-react'
import { money, usePulse } from '../store'
import { ProgressBar, RiskNote } from '../ui-bits'
import { PROJECTS, nextTier, isProjectClosed, type ProjectSector } from '@/lib/pulse-data'
import { Button } from '@/components/ui/button'

const sectorIcon: Record<ProjectSector, typeof Sun> = {
  'Renewable Energy': Sun,
  'Mining Royalties': Pickaxe,
  Agriculture: Leaf,
  Infrastructure: Building2,
}

export function DashboardView() {
  const { state, api, totalInvested, currentTier, portfolioValue, openModal, setView, toast } = usePulse()
  const upcoming = nextTier(currentTier.id)
  const progress = upcoming ? Math.min(100, (totalInvested / upcoming.minInvest) * 100) : 100

  const initialBenchmark = 250
  const portfolioReturnPct = portfolioValue > 0 ? ((portfolioValue / initialBenchmark) - 1) * 100 : 0
  const totalReturnDollars = Math.max(0, portfolioValue - initialBenchmark)

  const [liveFunding, setLiveFunding] = useState<Record<string, number> | null>(null)
  
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  const cursorGlow = useMotionTemplate`radial-gradient(380px circle at ${mouseX}px ${mouseY}px, rgba(245, 158, 11, 0.38), rgba(16, 185, 129, 0.22) 50%, transparent 85%)`

  useEffect(() => {
    let cancelled = false
    api.liveProjectFunding().then((res) => {
      if (!cancelled && res.ok) setLiveFunding(res.funding)
    })
    return () => {
      cancelled = true
    }
  }, [api])

  return (
    <div className="pulse-home mx-auto w-full max-w-md space-y-6 pb-24 text-neutral-100 antialiased">
      <style>{`
        @keyframes pulsePureGlow { 0%, 100% { opacity: .5; transform: scale(1); filter: brightness(1); } 50% { opacity: 1; transform: scale(1.04); filter: brightness(1.25); } }
        @keyframes pulseShimmer { 0%, 100% { border-color: rgba(245,158,11,.5); box-shadow: 0 0 25px rgba(245,158,11,.25), inset 0 0 16px rgba(245,158,11,.1); } 35% { border-color: rgba(16,185,129,.7); box-shadow: 0 0 35px rgba(16,185,129,.35), inset 0 0 20px rgba(16,185,129,.12); } 65% { border-color: rgba(245,158,11,.9); box-shadow: 0 0 45px rgba(245,158,11,.5), inset 0 0 28px rgba(245,158,11,.18); } }
        @keyframes pulseEmeraldRich { 0%, 100% { border-color: rgba(16,185,129,.6); box-shadow: 0 0 22px rgba(16,185,129,.32); } 50% { border-color: rgba(52,211,153,.95); box-shadow: 0 0 40px rgba(52,211,153,.6); } }
        @keyframes pulseConicSpin { to { transform: rotate(360deg); } }
        @keyframes pulseLiquidMove { 0%, 100% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } }
        .pulse-pure-shimmer { animation: pulseShimmer 3.4s ease-in-out infinite; }
        .pulse-pure-emerald-rich { animation: pulseEmeraldRich 3.2s ease-in-out infinite; }
        .pulse-conic-spin { animation: pulseConicSpin 8s linear infinite; }
        .pulse-liquid-motion { background-size: 200% 200%; animation: pulseLiquidMove 5s ease-in-out infinite; }
        @media (prefers-reduced-motion: reduce) { .pulse-pure-shimmer, .pulse-pure-emerald-rich, .pulse-conic-spin, .pulse-liquid-motion { animation: none; } }
      `}</style>

      {/* 1. STATUS HEADER */}
      <motion.div 
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        className="pulse-pure-shimmer flex flex-col items-start justify-between gap-2.5 rounded-2xl border border-amber-500/40 bg-neutral-950/95 px-4.5 py-4 shadow-[0_0_40px_rgba(245,158,11,.2)] backdrop-blur-2xl sm:flex-row sm:items-center"
      >
        <div className="flex min-w-0 items-center gap-3">
          <span className="relative flex size-3">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-90" />
            <span className="relative inline-flex size-3 rounded-full bg-emerald-500 shadow-[0_0_16px_rgba(16,185,129,1)]" />
          </span>
          <span className="truncate text-xs font-black uppercase tracking-wider text-neutral-100">
            SADC Capital Network &bull; Institutional Hub
          </span>
        </div>
        <motion.span 
          animate={{ opacity: [0.85, 1, 0.85], scale: [1, 1.03, 1] }} 
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }} 
          className="rounded-full border border-amber-500/60 bg-amber-500/20 px-3.5 py-1 text-xs font-bold text-amber-200 shadow-[0_0_26px_rgba(245,158,11,.35)]"
        >
          {currentTier.name} Member
        </motion.span>
      </motion.div>

      {/* 2. CONSOLIDATED PORTFOLIO CARD */}
      <div className="relative overflow-hidden rounded-3xl p-px shadow-[0_0_65px_rgba(245,158,11,.35)]">
        <motion.div className="pulse-conic-spin pointer-events-none absolute -inset-[150%] bg-[conic-gradient(from_0deg,#f59e0b_0deg,transparent_120deg,#10b981_220deg,#f59e0b_360deg)] opacity-95" />
        <motion.div 
          whileHover={{ scale: 1.008 }} 
          onPointerMove={(event) => { 
            const rect = event.currentTarget.getBoundingClientRect() 
            mouseX.set(event.clientX - rect.left) 
            mouseY.set(event.clientY - rect.top) 
          }} 
          className="glow-edge glass-gold pulse-surface group relative overflow-hidden rounded-3xl bg-neutral-950/95 shadow-[0_0_50px_rgba(245,158,11,.25)]"
        >
          <motion.div className="pointer-events-none absolute inset-0 z-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100" style={{ background: cursorGlow }} />
          <div className="pointer-events-none absolute -right-20 -top-20 size-56 rounded-full bg-amber-500/25 blur-3xl animate-pulse" />
          
          <div className="relative z-10 space-y-4 p-5 sm:p-6">
            <div className="flex min-w-0 items-start justify-between gap-3">
              <span className="text-xs font-extrabold uppercase tracking-wider text-neutral-300">
                Total Net Portfolio Value
              </span>
              <motion.span 
                animate={{ scale: [1, 1.05, 1], filter: ['brightness(1)', 'brightness(1.2)', 'brightness(1)'] }} 
                transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }} 
                className="pulse-pure-emerald-rich inline-flex max-w-[48%] shrink-0 items-center gap-1.5 rounded-lg border border-emerald-500/70 bg-emerald-950/95 px-3 py-1 text-[11px] font-black leading-tight text-emerald-300 shadow-[0_0_28px_rgba(16,185,129,.5)] sm:max-w-none sm:text-xs"
              >
                <TrendingUp className="size-4 text-emerald-400 animate-pulse" />
                +{(portfolioReturnPct || 18.4).toFixed(1)}% APY Avg
              </motion.span>
            </div>

            <div>
              <div className="flex items-baseline gap-2">
                <h1 className="font-display text-4xl font-black tracking-tight text-white drop-shadow-[0_2px_14px_rgba(0,0,0,0.8)] sm:text-5xl">
                  ${money(portfolioValue)}
                </h1>
                <span className="font-mono text-xs font-bold text-amber-300">USDT</span>
              </div>
              <p className="mt-2 text-xs font-medium text-neutral-200">
                Cumulative Yield: <span className="text-emerald-400 font-extrabold drop-shadow-[0_0_10px_rgba(16,185,129,0.5)]">+${money(totalReturnDollars, 2)} ({money(portfolioReturnPct, 1)}%)</span>
              </p>
            </div>

            <div className="grid min-w-0 grid-cols-2 gap-3.5 pt-1">
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
                <Button
                  aria-label="Deposit capital"
                  size="lg"
                  className="pulse-liquid-motion pulse-action h-12 w-full min-w-0 rounded-2xl border border-amber-200/90 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-300 px-3 text-xs font-black text-neutral-950 shadow-[0_0_40px_rgba(245,158,11,.7)] transition-all hover:from-amber-300 hover:to-amber-200"
                  onClick={() => openModal('deposit')}
                >
                  <ArrowDownRight className="size-4 shrink-0 stroke-[3]" /><span className="truncate">Deposit Capital</span>
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
                <Button
                  size="lg"
                  variant="outline"
                  className="h-12 w-full min-w-0 rounded-2xl border border-neutral-600/90 bg-gradient-to-r from-neutral-800 to-neutral-900 px-3 text-xs font-bold text-white shadow-[0_0_25px_rgba(0,0,0,.75)] transition-all hover:border-neutral-400 hover:bg-neutral-800"
                  onClick={() => openModal('withdraw')}
                >
                  <ArrowUpRight className="size-4 shrink-0 stroke-[2.5]" /><span className="truncate">Withdraw Earnings</span>
                </Button>
              </motion.div>
            </div>
          </div>

          {/* Integrated Asset Breakdown Row */}
          <div className="relative z-10 grid grid-cols-3 gap-1 border-t border-neutral-800/90 bg-neutral-950 p-4 text-center backdrop-blur-md">
            <div>
              <p className="text-[10px] font-black uppercase tracking-wider text-neutral-400">Available Cash</p>
              <p className="mt-1 font-mono text-base font-black text-white">${money(state.cash, 0)}</p>
            </div>
            <div className="border-x border-neutral-800/90">
              <p className="text-[10px] font-black uppercase tracking-wider text-neutral-400">Active Principal</p>
              <p className="mt-1 font-mono text-base font-black text-white">${money(totalInvested, 0)}</p>
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-wider text-neutral-400">PULSE Tokens</p>
              <p className="mt-1 font-mono text-base font-black text-amber-300 drop-shadow-[0_0_12px_rgba(245,158,11,0.6)]">{money(state.pulse + state.staked, 0)}</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* 3. TIER PROGRESSION CARD (Restored Missing Info) */}
      <div className="rounded-2xl border border-neutral-800 bg-neutral-950 p-4.5 space-y-3">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-1.5">
            <Award className="size-4 text-amber-400" /> Tier Status: {currentTier.name}
          </span>
          {upcoming ? (
            <span className="text-amber-300 font-mono font-medium">Next: {upcoming.name}</span>
          ) : (
            <span className="text-emerald-400 font-bold">Max Tier Reached</span>
          )}
        </div>
        <ProgressBar value={progress} />
        {upcoming && (
          <p className="text-[11px] text-neutral-400 text-right font-mono">
            ${money(Math.max(0, upcoming.minInvest - totalInvested))} more to upgrade tier
          p</p>
        )}
      </div>

      {/* 4. QUICK ACTIVE HOLDINGS PREVIEW */}
      <div className="rounded-2xl border border-neutral-800 bg-neutral-950 p-4.5 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-neutral-300">Active Portfolios ({state.holdings.length})</span>
          <button onClick={() => setView('invest')} className="text-xs text-amber-400 hover:underline flex items-center gap-1 font-semibold">
            View All <ChevronRight className="size-3.5" />
          </button>
        </div>
        {state.holdings.length === 0 ? (
          <div className="text-center py-6 text-xs text-neutral-500">
            No active project deployments yet. Explore sectors to start earning yields.
          </div>
        ) : (
          <div className="space-y-2">
            {state.holdings.slice(0, 2).map((h) => (
              <div key={h.id} className="flex items-center justify-between rounded-xl bg-neutral-900/80 p-3 border border-neutral-800 text-xs">
                <div>
                  <p className="font-bold text-white">{h.projectName}</p>
                  <p className="text-[10px] text-neutral-400 font-mono">Principal: ${money(h.amount)}</p>
                </div>
                <span className="font-mono text-emerald-400 font-bold">+{h.apy}% APY</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
