'use client'

import { useEffect, useState } from 'react'
import { motion, useMotionTemplate, useMotionValue } from 'framer-motion'
import { 
  ArrowDownRight, ArrowUpRight, ChevronRight, 
  Radio, Rocket, ShieldCheck, TrendingUp, Zap, Award, Layers
} from 'lucide-react'
import { money, usePulse } from '../store'
import { ProgressBar } from '../ui-bits'
import { nextTier, PROJECTS } from '@/lib/pulse-data'
import { Button } from '@/components/ui/button'

export function DashboardView() {
  const { state, api, totalInvested, currentTier, portfolioValue, openModal, setView } = usePulse()
  const upcoming = nextTier(currentTier.id)
  const progress = upcoming ? Math.min(100, (totalInvested / upcoming.minInvest) * 100) : 100

  const initialBenchmark = 250
  const portfolioReturnPct = portfolioValue > 0 ? ((portfolioValue / initialBenchmark) - 1) * 100 : 0
  const totalReturnDollars = Math.max(0, portfolioValue - initialBenchmark)

  const [liveFunding, setLiveFunding] = useState<Record<string, number> | null>(null)
   
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  const cursorGlow = useMotionTemplate`radial-gradient(340px circle at ${mouseX}px ${mouseY}px, rgba(245, 158, 11, 0.35), rgba(5, 150, 105, 0.2) 50%, transparent 85%)`

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
    <div className="pulse-home mx-auto w-full max-w-md space-y-5 pb-36 text-neutral-100 antialiased">
      <style>{`
        @keyframes pulseShimmer { 0%, 100% { border-color: rgba(245,158,11,.45); box-shadow: 0 0 22px rgba(245,158,11,.22), inset 0 0 14px rgba(245,158,11,.08); } 50% { border-color: rgba(245,158,11,.85); box-shadow: 0 0 40px rgba(245,158,11,.45), inset 0 0 25px rgba(245,158,11,.2); } }
        @keyframes pulseEmerald { 0%, 100% { border-color: rgba(5,150,105,.5); box-shadow: 0 0 20px rgba(5,150,105,.25); } 50% { border-color: rgba(16,185,129,.9); box-shadow: 0 0 35px rgba(16,185,129,.55); } }
        @keyframes pulseConicSpin { to { transform: rotate(360deg); } }
        @keyframes pulseLiquidMove { 0%, 100% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } }
        .pulse-pure-shimmer { animation: pulseShimmer 3.5s ease-in-out infinite; }
        .pulse-pure-emerald { animation: pulseEmerald 3.2s ease-in-out infinite; }
        .pulse-conic-spin { animation: pulseConicSpin 8s linear infinite; }
        .pulse-liquid-motion { background-size: 200% 200%; animation: pulseLiquidMove 5s ease-in-out infinite; }
        @media (prefers-reduced-motion: reduce) { .pulse-pure-shimmer, .pulse-pure-emerald, .pulse-conic-spin, .pulse-liquid-motion { animation: none; } }
      `}</style>

      {/* 1. STATUS HEADER */}
      <motion.div 
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="pulse-pure-shimmer flex items-center justify-between gap-3 rounded-2xl border border-amber-500/40 bg-neutral-950/95 px-4 py-3.5 shadow-[0_0_35px_rgba(245,158,11,.2)] backdrop-blur-xl"
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="relative flex size-2.5 shrink-0">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-80" />
            <span className="relative inline-flex size-2.5 rounded-full bg-emerald-500 shadow-[0_0_12px_rgba(5,150,105,0.9)]" />
          </span>
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-amber-100 sm:text-xs truncate">
            SADC Capital &bull; Live Terminal
          </span>
        </div>
        <motion.span 
          animate={{ opacity: [0.85, 1, 0.85], scale: [1, 1.02, 1] }} 
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }} 
          className="rounded-full border border-amber-500/50 bg-amber-500/20 px-3 py-1 text-xs font-bold text-amber-200 shadow-[0_0_20px_rgba(245,158,11,.3)] shrink-0"
        >
          {currentTier.name} Member
        </motion.span>
      </motion.div>

      {/* 2. CONSOLIDATED LUXURY PORTFOLIO CARD */}
      <div className="relative overflow-hidden rounded-3xl p-px shadow-[0_0_60px_rgba(245,158,11,.35)]">
        <motion.div className="pulse-conic-spin pointer-events-none absolute -inset-[150%] bg-[conic-gradient(from_0deg,#f59e0b_0deg,transparent_100deg,#059669_200deg,#f59e0b_360deg)] opacity-90" />
        <motion.div 
          whileHover={{ scale: 1.006 }} 
          onPointerMove={(event) => { 
            const rect = event.currentTarget.getBoundingClientRect() 
            mouseX.set(event.clientX - rect.left) 
            mouseY.set(event.clientY - rect.top) 
          }} 
          className="glow-edge glass-gold pulse-surface group relative overflow-hidden rounded-3xl bg-neutral-950/95 shadow-[0_0_45px_rgba(245,158,11,.25)]"
        >
          <motion.div className="pointer-events-none absolute inset-0 z-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100" style={{ background: cursorGlow }} />
           
          <div className="relative z-10 space-y-4 p-5 sm:p-6">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-extrabold uppercase tracking-wider text-amber-300/90 truncate">
                Total Net Portfolio Value
              </span>
              <motion.span 
                animate={{ scale: [1, 1.04, 1], filter: ['brightness(1)', 'brightness(1.15)', 'brightness(1)'] }} 
                transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }} 
                className="pulse-pure-emerald inline-flex items-center gap-1.5 rounded-lg border border-emerald-500/60 bg-emerald-950/90 px-3 py-1 text-xs font-extrabold text-emerald-300 shadow-[0_0_25px_rgba(5,150,105,.4)] shrink-0"
              >
                <TrendingUp className="size-3.5 text-emerald-400 animate-pulse shrink-0" />
                +{(portfolioReturnPct || 18.4).toFixed(1)}% APY Avg
              </motion.span>
            </div>

            <div className="space-y-1">
              <div className="flex items-baseline gap-2">
                <h1 className="font-display text-3xl font-extrabold tracking-tight text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.7)] sm:text-4xl">
                  ${money(portfolioValue)}
                </h1>
                <span className="font-mono text-xs font-bold text-amber-300">USDT</span>
              </div>
              <p className="text-xs font-medium text-neutral-300">
                Cumulative Yield: <span className="text-emerald-400 font-bold">+${money(totalReturnDollars, 2)} ({money(portfolioReturnPct, 1)}%)</span>
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button
                  aria-label="Deposit capital"
                  size="lg"
                  className="pulse-liquid-motion pulse-action h-11 w-full rounded-xl border border-amber-200/90 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-300 px-3 text-xs font-black text-neutral-950 shadow-[0_0_35px_rgba(245,158,11,.7)] hover:from-amber-300 hover:to-amber-200"
                  onClick={() => openModal('deposit')}
                >
                  <ArrowDownRight className="size-4 shrink-0 stroke-[3]" />
                  <span className="truncate">Deposit Capital</span>
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button
                  size="lg"
                  variant="outline"
                  className="h-11 w-full rounded-xl border border-neutral-600/90 bg-neutral-900/90 px-3 text-xs font-bold text-white shadow-[0_0_20px_rgba(0,0,0,.6)] hover:border-amber-400/50 hover:bg-neutral-800"
                  onClick={() => openModal('withdraw')}
                >
                  <ArrowUpRight className="size-4 shrink-0 stroke-[2.5]" />
                  <span className="truncate">Withdraw Earnings</span>
                </Button>
              </motion.div>
            </div>
          </div>

          <div className="relative z-10 grid grid-cols-3 divide-x divide-neutral-800/90 border-t border-neutral-800/90 bg-neutral-950/90 p-3.5 text-center">
            <div className="px-1 overflow-hidden">
              <p className="text-[10px] font-extrabold uppercase tracking-wider text-neutral-400 truncate">Cash</p>
              <p className="mt-0.5 font-mono text-sm font-black text-white truncate">${money(state.cash, 0)}</p>
            </div>
            <div className="px-1 overflow-hidden">
              <p className="text-[10px] font-extrabold uppercase tracking-wider text-neutral-400 truncate">Principal</p>
              <p className="mt-0.5 font-mono text-sm font-black text-white truncate">${money(totalInvested, 0)}</p>
            </div>
            <div className="px-1 overflow-hidden">
              <p className="text-[10px] font-extrabold uppercase tracking-wider text-neutral-400 truncate">$PULSE</p>
              <p className="mt-0.5 font-mono text-sm font-black text-amber-300 truncate">{money(state.pulse + state.staked, 0)}</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* 3. TIER STATUS BAR */}
      <motion.div 
        animate={{ borderColor: ['rgba(245,158,11,.4)', 'rgba(245,158,11,.8)', 'rgba(245,158,11,.4)'] }} 
        transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }} 
        className="pulse-pure-shimmer relative rounded-2xl border border-amber-500/50 bg-neutral-950 p-4 shadow-[0_0_40px_rgba(245,158,11,.2)]"
      >
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <Award className="size-4 shrink-0 text-amber-400" />
            <span className="text-xs font-extrabold uppercase tracking-wider text-neutral-200 truncate">
              Standing: <span className="text-white font-extrabold">{currentTier.name} VIP</span>
            </span>
          </div>
          <span className="rounded-md border border-emerald-500/50 bg-emerald-500/20 px-2 py-0.5 text-xs font-mono font-bold text-emerald-300 shadow-[0_0_15px_rgba(5,150,105,0.4)] shrink-0">
            {currentTier.yieldLabel}
          </span>
        </div>

        {upcoming ? (
          <div className="mt-3 space-y-1.5">
            <div className="flex items-center justify-between text-[11px] font-mono text-neutral-400">
              <span className="truncate">Next Tier: {upcoming.name}</span>
              <span className="font-bold text-amber-300 shrink-0">${money(totalInvested)} / ${money(upcoming.minInvest)}</span>
            </div>
            <ProgressBar value={progress} tone="gold" />
          </div>
        ) : (
          <p className="mt-2 text-xs text-emerald-300 font-semibold">Apex Institutional Rank Active &bull; Max Tier Unlocked.</p>
        )}
      </motion.div>

      {/* 4. ACTIVE PORTFOLIO HOLDINGS */}
      <div className="rounded-2xl border border-neutral-800 bg-neutral-950 p-4 space-y-3 shadow-md">
        <div className="flex items-center justify-between">
          <span className="text-xs font-extrabold uppercase tracking-wider text-neutral-300 flex items-center gap-1.5 truncate">
            <Layers className="size-4 text-amber-400 shrink-0" /> Active Holdings ({state.holdings.length})
          </span>
          <button onClick={() => setView('invest')} className="text-xs text-amber-400 hover:underline flex items-center gap-1 font-bold shrink-0">
            Explore <ChevronRight className="size-3.5" />
          </button>
        </div>
        {state.holdings.length === 0 ? (
          <div className="text-center py-5 text-xs text-neutral-500">
            No active deployments yet. Browse high-yield sectors below.
          </div>
        ) : (
          <div className="space-y-2">
            {state.holdings.slice(0, 3).map((h) => (
              <div key={h.id} className="flex items-center justify-between rounded-xl bg-neutral-900/80 p-3 border border-neutral-800 text-xs gap-2">
                <div className="space-y-0.5 min-w-0">
                  <p className="font-bold text-white truncate">{h.projectName}</p>
                  <p className="text-[10px] text-neutral-400 font-mono">Principal: ${money(h.amount)}</p>
                </div>
                <span className="font-mono text-emerald-400 font-bold shrink-0">+{h.apy}% APY</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 5. REGIONAL OPPORTUNITIES PIPELINE (WITH HIGH-QUALITY IMAGES RESTORED) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-neutral-200 truncate">
            Regional Opportunities
          </h3>
          <span className="text-xs font-semibold text-emerald-300 flex items-center gap-1.5 shrink-0">
            <span className="size-1.5 rounded-full bg-emerald-400 animate-ping shrink-0" />
            Live Synced Pipeline
          </span>
        </div>

        <div className="grid gap-3">
          {PROJECTS.slice(0, 2).map((p) => {
            const funded = liveFunding?.[p.id] ?? p.fundedAmount
            const pct = p.targetRaise > 0 ? Math.min(100, Math.round((funded / p.targetRaise) * 100)) : 0
            return (
              <motion.div
                key={p.id}
                whileHover={{ scale: 1.01 }}
                onClick={() => setView('invest')}
                className="group cursor-pointer overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-950 transition-all hover:border-amber-500/60 shadow-md"
              >
                {/* High Quality Project Image Header */}
                <div className="relative h-32 w-full overflow-hidden">
                  <img 
                    src={p.image} 
                    alt={p.name} 
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/40 to-transparent" />
                  <div className="absolute bottom-2.5 left-3.5 right-3.5 flex items-end justify-between">
                    <div>
                      <p className="text-[10px] font-extrabold uppercase tracking-wider text-amber-300">{p.country} &bull; {p.sector}</p>
                      <h4 className="text-sm font-extrabold text-white group-hover:text-amber-200 transition-colors drop-shadow-md">{p.name}</h4>
                    </div>
                    <span className="rounded-lg border border-emerald-500/50 bg-emerald-950/90 px-2.5 py-1 font-mono text-[11px] font-extrabold text-emerald-300 shadow-lg shrink-0">
                      {p.targetYield}
                    </span>
                  </div>
                </div>

                <div className="p-4 pt-2 space-y-2">
                  <div className="flex justify-between text-[11px] font-mono text-neutral-400">
                    <span className="truncate">Funded: ${money(funded)}</span>
                    <span className="font-bold text-neutral-200 shrink-0">{pct}%</span>
                  </div>
                  <ProgressBar value={pct} tone="green" />
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* 6. QUICK ACTIONS GRID */}
      <div className="space-y-3 pt-1">
        <h3 className="text-xs font-extrabold uppercase tracking-wider text-neutral-200 truncate">
          Quick Actions & Hubs
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <ActionTile tone="gold" badge="Private" icon={<Rocket className="size-4 text-amber-300" />} label="Buy $PULSE" detail="Private sale round" onClick={() => setView('sale')} />
          <ActionTile tone="green" badge="24.8% APY" icon={<Zap className="size-4 text-emerald-300" />} label="Stake Vault" detail="High yield pool" onClick={() => setView('stake')} />
          <ActionTile tone="cyan" badge="3 Live" icon={<Radio className="size-4 text-cyan-300" />} label="Signals Feed" detail="Institutional deals" onClick={() => setView('signals')} />
          <ActionTile tone="gold" badge="Level 2" icon={<ShieldCheck className="size-4 text-amber-300" />} label="Verify KYC" detail="Unlocked access" onClick={() => (state.kyc === 'verified' ? setView('profile') : openModal('kyc'))} />
        </div>
      </div>
    </div>
  )
}

function ActionTile({ icon, label, detail, badge, tone, onClick }: { icon: React.ReactNode; label: string; detail: string; badge: string; tone: 'gold' | 'green' | 'cyan'; onClick: () => void }) {
  const tones = {
    gold: 'border-amber-500/40 bg-gradient-to-br from-neutral-900/90 to-neutral-950 text-amber-200',
    green: 'border-emerald-500/40 bg-gradient-to-br from-neutral-900/90 to-neutral-950 text-emerald-300',
    cyan: 'border-cyan-500/40 bg-gradient-to-br from-neutral-900/90 to-neutral-950 text-cyan-200',
  }
  const badgeTones = {
    gold: 'border-amber-500/40 bg-amber-500/20 text-amber-300',
    green: 'border-emerald-500/40 bg-emerald-500/20 text-emerald-300',
    cyan: 'border-cyan-500/40 bg-cyan-500/20 text-cyan-300',
  }

  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`group relative flex cursor-pointer flex-col justify-between overflow-hidden rounded-2xl border p-3.5 shadow-md transition-all hover:border-amber-500/60 ${tones[tone]}`}
    >
      <div className="flex items-center justify-between gap-1">
        <div className="flex size-8 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-black/40">
          {icon}
        </div>
        <span className={`rounded-md border px-2 py-0.5 text-[10px] font-mono font-bold truncate max-w-[70px] ${badgeTones[tone]}`}>
          {badge}
        </span>
      </div>
      <div className="mt-3 space-y-0.5 min-w-0">
        <h4 className="text-xs font-bold text-white group-hover:text-amber-300 transition-colors truncate">{label}</h4>
        <p className="text-[10px] text-neutral-400 truncate">{detail}</p>
      </div>
    </motion.div>
  )
}
