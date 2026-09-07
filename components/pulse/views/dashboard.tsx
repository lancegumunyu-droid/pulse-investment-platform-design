'use client'

import { useEffect, useState } from 'react'
import { motion, useMotionTemplate, useMotionValue } from 'framer-motion'
import { 
  ArrowDownRight, ArrowUpRight, Building2, ChevronRight, 
  Copy, Leaf, Pickaxe, Radio, Rocket, ShieldCheck, Sun, 
  TrendingUp, Zap, AlertCircle, Lock
} from 'lucide-react'
import { money, usePulse } from '../store'
import { ProgressBar, RiskNote } from '../ui-bits'
import { PROJECTS, nextTier, isProjectClosed, PROJECT_DEADLINES, type ProjectSector } from '@/lib/pulse-data'
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
  const cursorGlow = useMotionTemplate`radial-gradient(340px circle at ${mouseX}px ${mouseY}px, rgba(245, 158, 11, 0.28), rgba(16, 185, 129, 0.1) 50%, transparent 85%)`

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
    <div className="pulse-home mx-auto w-full max-w-md space-y-5 pb-20 text-neutral-100 antialiased">
      <style>{`
        @keyframes pulsePureGlow { 0%, 100% { opacity: .45; transform: scale(1); filter: brightness(1); } 50% { opacity: .95; transform: scale(1.035); filter: brightness(1.2); } }
        @keyframes pulseShimmer { 0%, 100% { border-color: rgba(245,158,11,.35); box-shadow: 0 0 16px rgba(245,158,11,.18), inset 0 0 12px rgba(245,158,11,.05); } 35% { border-color: rgba(16,185,129,.65); box-shadow: 0 0 30px rgba(16,185,129,.32), inset 0 0 18px rgba(16,185,129,.1); } 65% { border-color: rgba(245,158,11,.9); box-shadow: 0 0 42px rgba(245,158,11,.5), inset 0 0 28px rgba(245,158,11,.18); } }
        @keyframes pulseEmerald { 0%, 100% { border-color: rgba(16,185,129,.45); box-shadow: 0 0 16px rgba(16,185,129,.22); } 50% { border-color: rgba(16,185,129,.9); box-shadow: 0 0 34px rgba(16,185,129,.55); } }
        @keyframes pulseConicSpin { to { transform: rotate(360deg); } }
        @keyframes pulseLiquidMove { 0%, 100% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } }
        @keyframes pulseAmbientFloat { 0%, 100% { transform: translateY(0) rotate(0deg); } 50% { transform: translateY(-5px) rotate(1.5deg); } }
        .pulse-pure-glow { animation: pulsePureGlow 2.2s ease-in-out infinite; }
        .pulse-pure-shimmer { animation: pulseShimmer 3.2s ease-in-out infinite; }
        .pulse-pure-emerald { animation: pulseEmerald 3s ease-in-out infinite; }
        .pulse-conic-spin { animation: pulseConicSpin 7s linear infinite; }
        .pulse-liquid-motion { background-size: 200% 200%; animation: pulseLiquidMove 5s ease-in-out infinite; }
        .pulse-ambient-float { animation: pulseAmbientFloat 4.5s ease-in-out infinite; }
        @media (prefers-reduced-motion: reduce) { .pulse-pure-glow, .pulse-pure-shimmer, .pulse-pure-emerald, .pulse-conic-spin, .pulse-liquid-motion, .pulse-ambient-float { animation: none; } }
      `}</style>

      {/* 1. STATUS HEADER */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="pulse-pure-shimmer flex flex-col items-start justify-between gap-2 rounded-2xl border border-amber-500/35 bg-neutral-950/85 px-4 py-3.5 pb-4.5 shadow-[0_0_30px_rgba(245,158,11,.15)] backdrop-blur-xl sm:flex-row sm:items-center"
      >
        <div className="flex min-w-0 items-center gap-2.5">
          <span className="relative flex size-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-80" />
            <span className="relative inline-flex size-2.5 rounded-full bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.9)]" />
          </span>
          <span className="truncate text-[11px] font-bold uppercase tracking-wider text-neutral-200 sm:text-xs">
            SADC Capital Network &bull; Live Terminal
          </span>
        </div>
        <motion.span 
          animate={{ opacity: [0.8, 1, 0.8], scale: [1, 1.02, 1] }} 
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }} 
          className="rounded-full border border-amber-500/45 bg-amber-500/20 px-3 py-1 text-xs font-semibold text-amber-200 shadow-[0_0_22px_rgba(245,158,11,.25)]"
        >
          {currentTier.name} Member
        </motion.span>
      </motion.div>

      {/* 2. CONSOLIDATED PORTFOLIO CARD */}
      <div className="relative overflow-hidden rounded-3xl p-px shadow-[0_0_50px_rgba(245,158,11,.28)]">
        <motion.div className="pulse-conic-spin pointer-events-none absolute -inset-[150%] bg-[conic-gradient(from_0deg,#f59e0b_0deg,transparent_100deg,#10b981_200deg,#f59e0b_360deg)] opacity-90" />
        <motion.div 
          whileHover={{ scale: 1.008 }} 
          onPointerMove={(event) => { 
            const rect = event.currentTarget.getBoundingClientRect(); 
            mouseX.set(event.clientX - rect.left); 
            mouseY.set(event.clientY - rect.top); 
          }} 
          className="glow-edge glass-gold pulse-surface group relative overflow-hidden rounded-3xl shadow-[0_0_40px_rgba(245,158,11,.18)]"
        >
          <motion.div className="pointer-events-none absolute inset-0 z-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100" style={{ background: cursorGlow }} />
          <div className="pointer-events-none absolute -right-16 -top-16 size-48 rounded-full bg-amber-500/25 blur-3xl animate-pulse" />
          
          <div className="relative z-10 space-y-4 p-5 sm:p-6">
            <div className="flex min-w-0 items-start justify-between gap-3">
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-300">
                Total Net Portfolio Value
              </span>
              <motion.span 
                animate={{ scale: [1, 1.05, 1], filter: ['brightness(1)', 'brightness(1.15)', 'brightness(1)'] }} 
                transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }} 
                className="pulse-pure-emerald inline-flex max-w-[48%] shrink-0 items-center gap-1.5 rounded-lg border border-emerald-500/45 bg-emerald-950/80 px-2.5 py-1 text-[11px] font-extrabold leading-tight text-emerald-200 shadow-[0_0_22px_rgba(16,185,129,.35)] sm:max-w-none sm:px-3 sm:text-xs"
              >
                <TrendingUp className="size-4 text-emerald-300 animate-pulse" />
                +{(portfolioReturnPct || 18.4).toFixed(1)}% APY Avg
              </motion.span>
            </div>

            <div>
              <div className="flex items-baseline gap-2">
                <h1 className="font-display text-4xl font-extrabold tracking-tight text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.6)] sm:text-5xl">
                  ${money(portfolioValue)}
                </h1>
                <span className="font-mono text-xs font-bold text-amber-300">USDT</span>
              </div>
              <p className="mt-2 text-xs font-medium text-neutral-200">
                Cumulative Yield: <span className="text-emerald-300 font-bold">+${money(totalReturnDollars, 2)} ({money(portfolioReturnPct, 1)}%)</span>
              </p>
            </div>

            <div className="grid min-w-0 grid-cols-2 gap-3 pt-1">
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
                <Button
                  aria-label="Deposit capital"
                  size="lg"
                  className="pulse-liquid-motion pulse-action h-12 w-full min-w-0 rounded-2xl border border-amber-200/90 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-300 px-3 text-xs font-black text-neutral-950 shadow-[0_0_32px_rgba(245,158,11,.6)] transition-all hover:from-amber-300 hover:to-amber-200"
                  onClick={() => openModal('deposit')}
                >
                  <ArrowDownRight className="size-4 shrink-0 stroke-[3]" /><span className="truncate">Deposit Capital</span>
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
                <Button
                  size="lg"
                  variant="outline"
                  className="h-12 w-full min-w-0 rounded-2xl border border-neutral-600/90 bg-gradient-to-r from-neutral-800 to-neutral-900 px-3 text-xs font-bold text-white shadow-[0_0_22px_rgba(0,0,0,.7)] transition-all hover:border-neutral-400 hover:bg-neutral-800"
                  onClick={() => openModal('withdraw')}
                >
                  <ArrowUpRight className="size-4 shrink-0 stroke-[2.5]" /><span className="truncate">Withdraw Earnings</span>
                </Button>
              </motion.div>
            </div>
          </div>

          {/* Integrated Asset Breakdown Row */}
          <div className="relative z-10 grid grid-cols-3 gap-1 border-t border-neutral-800/90 bg-neutral-950/95 p-3.5 text-center backdrop-blur-md">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-300">Available Cash</p>
              <p className="mt-1 font-mono text-base font-extrabold text-white">${money(state.cash, 0)}</p>
            </div>
            <div className="border-x border-neutral-800/90">
              <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-300">Active Principal</p>
              <p className="mt-1 font-mono text-base font-extrabold text-white">${money(totalInvested, 0)}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-300">PULSE Tokens</p>
              <p className="mt-1 font-mono text-base font-extrabold text-amber-300 drop-shadow-[0_0_10px_rgba(245,158,11,0.5)]">{money(state.pulse + state.staked, 0)}</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* 3. TIER STATUS BAR */}
      <motion.div 
        animate={{ borderColor: ['rgba(245,158,11,.35)', 'rgba(245,158,11,.75)', 'rgba(245,158,11,.35)'] }} 
        transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }} 
        className="pulse-pure-shimmer glow-card relative overflow-hidden rounded-2xl border border-amber-500/45 bg-gradient-to-r from-neutral-900/95 via-amber-950/35 to-neutral-900/95 p-4.5 shadow-[0_0_35px_rgba(245,158,11,.2)] sm:p-5"
      >
        <div className="flex min-w-0 flex-col items-start justify-between gap-2.5 sm:flex-row sm:items-center">
          <div className="flex min-w-0 items-center gap-2.5">
            <div className="flex size-7 items-center justify-center rounded-lg bg-amber-500/25 text-amber-300 shadow-[0_0_14px_rgba(245,158,11,0.4)]">
              <Lock className="size-4" />
            </div>
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-200">
              Standing: <span className="text-white font-extrabold">{currentTier.name} VIP</span>
            </span>
          </div>
          <span className="rounded-md border border-emerald-500/35 bg-emerald-500/15 px-2 py-0.5 text-xs font-mono font-bold text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.25)]">{currentTier.yieldLabel}</span>
        </div>

        {upcoming ? (
          <div className="mt-3 space-y-2">
            <div className="flex justify-between text-xs text-neutral-200 font-medium">
              <span>Next Unlock: <strong className="text-amber-200">{upcoming.name}</strong></span>
              <span className="font-mono text-neutral-100 font-semibold">${money(totalInvested, 0)} / ${money(upcoming.minInvest, 0)}</span>
            </div>
            <ProgressBar value={progress} tone="gold" />
          </div>
        ) : (
          <p className="mt-2 text-xs text-emerald-300 font-semibold">Apex Institutional Rank Active &bull; Max Tier Unlocked.</p>
        )}
      </motion.div>

      {/* 4. ACTIVE DEPLOYED POSITIONS */}
      {state.holdings.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-neutral-200 px-1">
            Active Holdings ({state.holdings.length})
          </h3>
          <div className="space-y-3">
            {state.holdings.map((h) => {
              const project = PROJECTS.find((p) => p.id === h.projectId)
              const closed = isProjectClosed(h.projectId)
              const HoldingIcon = project ? sectorIcon[project.sector] : Sun

              return (
                <motion.div
                  key={h.id}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  whileHover={{ scale: 1.015, y: -2 }}
                  transition={{ duration: 0.35 }}
                  className="pulse-pure-shimmer glow-card pulse-tile flex min-w-0 flex-col items-stretch justify-between gap-3.5 rounded-2xl border border-neutral-800/90 bg-gradient-to-r from-neutral-900/95 via-neutral-800/85 to-neutral-900/95 p-4.5 shadow-[0_0_30px_rgba(0,0,0,.65)] sm:flex-row sm:items-center sm:p-5"
                >
                  <div className="flex min-w-0 items-center gap-3.5">
                    <div className="pulse-ambient-float flex size-11 shrink-0 items-center justify-center rounded-xl border border-amber-500/55 bg-amber-500/25 text-amber-200 shadow-[0_0_20px_rgba(245,158,11,.4)]">
                      <HoldingIcon className="size-5" />
                    </div>
                    <div className="min-w-0 space-y-1">
                      <p className="truncate text-sm font-bold text-white">{project?.name ?? 'SADC Venture Position'}</p>
                      <p className="text-xs text-neutral-200 font-mono">
                        <span className="text-amber-300 font-extrabold">${money(h.amount, 0)} USDT</span> &bull; <span className="text-emerald-300 font-semibold">{closed ? 'Matured' : 'Generating Yield'}</span>
                      </p>
                    </div>
                  </div>

                  <Button
                    size="sm"
                    variant="outline"
                    className="h-10 w-full border-neutral-600 bg-neutral-800/95 text-xs font-bold text-neutral-100 shadow-md hover:border-amber-500/60 hover:bg-neutral-800 hover:text-white sm:w-auto"
                    onClick={async () => {
                      const confirmed = window.confirm(`Close ${project?.name ?? 'this position'}? Final yield will be calculated by the server.`)
                      if (!confirmed) return
                      const res = await api.closeInvestment(h.id)
                      if (res.ok) {
                        toast({ title: 'Position Liquidated', description: 'Funds returned to cash balance.', variant: 'info' })
                      } else {
                        toast({ title: 'Liquidation Failed', description: res.error, variant: 'error' })
                      }
                    }}
                  >
                    Liquidate Position
                  </Button>
                </motion.div>
              )
            })}
          </div>
        </div>
      )}

      {/* 5. VENTURE OPPORTUNITIES */}
      <div className="space-y-3.5">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-neutral-200">
            Regional Opportunities
          </h3>
          <span className="text-xs font-semibold text-emerald-300 flex items-center gap-1.5">
            <span className="size-1.5 rounded-full bg-emerald-300 animate-ping" />
            Verified SADC Pipeline
          </span>
        </div>

        <div className="space-y-3.5">
          {PROJECTS.map((p) => {
            const Icon = sectorIcon[p.sector] || Building2
            const funded = liveFunding ? p.funded + (liveFunding[p.id] ?? 0) : p.funded
            const pct = Math.min(100, Math.round((funded / p.goal) * 100))

            return (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.15 }}
                whileHover={{ y: -4, scale: 1.015 }}
                transition={{ duration: 0.4 }}
                onPointerMove={(event) => { 
                  const rect = event.currentTarget.getBoundingClientRect(); 
                  mouseX.set(event.clientX - rect.left); 
                  mouseY.set(event.clientY - rect.top); 
                }}
                className="pulse-pure-shimmer group glow-card pulse-tile relative overflow-hidden rounded-3xl border border-neutral-800/90 bg-neutral-900/95 p-5 space-y-4 shadow-[0_0_35px_rgba(0,0,0,0.55)] transition-all"
              >
                <motion.div className="pointer-events-none absolute inset-0 z-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100" style={{ background: cursorGlow }} />
                
                {p.image && (
                  <div className="relative -mx-5 -mt-5 mb-4 h-36 overflow-hidden border-b border-white/10 bg-neutral-950">
                    <img src={p.image} alt={`${p.name} project`} className="h-full w-full object-cover object-center opacity-90 transition-transform duration-700 group-hover:scale-105" />
                    <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/30 to-transparent" />
                    <span className="absolute bottom-3 left-4 rounded-full border border-amber-300/45 bg-black/70 px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider text-amber-200 backdrop-blur-md shadow-[0_0_14px_rgba(245,158,11,0.35)]">Verified Project</span>
                  </div>
                )}

                <div className="relative z-10 space-y-3.5">
                  <div className="flex min-w-0 flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
                    <div className="flex min-w-0 items-center gap-3.5">
                      <div className="pulse-ambient-float flex size-11 shrink-0 items-center justify-center rounded-xl border border-amber-500/45 bg-amber-500/20 text-amber-200 shadow-[0_0_18px_rgba(245,158,11,.3)]">
                        <Icon className="size-5" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="truncate text-base font-bold text-white group-hover:text-amber-200 transition-colors">{p.name}</h4>
                        <p className="text-xs text-neutral-300">{p.country} &bull; {p.sector}</p>
                      </div>
                    </div>
                    <span className="rounded-lg border border-emerald-500/45 bg-emerald-500/20 px-3 py-1 font-mono text-xs font-extrabold text-emerald-200 shadow-[0_0_14px_rgba(16,185,129,0.3)]">
                      {p.targetYield}
                    </span>
                  </div>

                  <p className="text-xs text-neutral-200 leading-relaxed">{p.summary}</p>

                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-mono">
                      <span className="text-neutral-100 font-bold">{pct}% Allocated</span>
                      <span className="text-neutral-300">${money(funded, 0)} / ${money(p.goal, 0)}</span>
                    </div>
                    <ProgressBar value={pct} tone="green" />
                  </div>

                  <div className="flex flex-col items-stretch justify-between gap-3.5 border-t border-neutral-800/90 pt-4 sm:flex-row sm:items-center">
                    <span className="text-xs font-medium text-neutral-300">Risk Profile: <span className="text-neutral-100 font-semibold">{p.risk}</span></span>
                    <Button
                      size="sm"
                      className="pulse-action h-10 w-full min-w-0 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-300 px-4 text-xs font-black text-neutral-950 shadow-[0_0_26px_rgba(245,158,11,.5)] transition-all hover:from-amber-300 hover:to-amber-200 sm:w-auto"
                      onClick={() => openModal('invest', { projectId: p.id })}
                    >
                      Deploy Capital
                    </Button>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* 6. SHORTCUT GRID */}
      <div className="space-y-3">
        <h3 className="font-display px-1 text-lg font-bold tracking-tight text-white">
          Quick actions
        </h3>
        <div className="grid grid-cols-2 gap-3.5">
          <ActionTile tone="gold" badge="Private" icon={<Rocket className="size-4 text-amber-200 animate-pulse" />} label="Buy $PULSE" detail="Private sale round" onClick={() => setView('sale')} />
          <ActionTile tone="green" badge="24.8% APY" icon={<Zap className="size-4 text-emerald-200 animate-pulse" />} label="Stake Vault" detail="High yield pool" onClick={() => setView('stake')} />
          <ActionTile tone="cyan" badge="3 Live" icon={<Radio className="size-4 text-cyan-200 animate-pulse" />} label="Signals Feed" detail="Institutional deals" onClick={() => setView('signals')} />
          <ActionTile tone="gold" badge="Level 2" icon={<ShieldCheck className="size-4 text-amber-200" />} label="Verify KYC" detail="Unlocked access" onClick={() => (state.kyc === 'verified' ? setView('profile') : openModal('kyc'))} />
        </div>
      </div>

      {/* 7. REFERRAL SECTION */}
      <motion.div 
        whileHover={{ scale: 1.01 }}
        className="pulse-pure-shimmer glow-card flex min-w-0 flex-col items-stretch justify-between gap-3.5 rounded-2xl border border-amber-500/45 bg-gradient-to-r from-amber-950/35 via-neutral-900 to-neutral-900 p-4.5 shadow-[0_0_30px_rgba(245,158,11,.18)] sm:flex-row sm:items-center"
      >
        <div>
          <p className="text-[11px] font-extrabold uppercase tracking-wider text-neutral-200">Referral Access Pass</p>
          <p className="font-mono text-lg font-extrabold text-amber-300 mt-0.5 tracking-wider drop-shadow-[0_0_10px_rgba(245,158,11,0.4)]">{state.referralCode}</p>
        </div>
        <Button
          size="sm"
          variant="outline"
          className="w-full min-w-0 border-neutral-600 bg-neutral-800 text-xs font-bold text-neutral-100 shadow-md hover:border-amber-500/60 hover:bg-neutral-800 hover:text-white sm:w-auto"
          onClick={() => {
            navigator.clipboard?.writeText(state.referralCode)
            toast({ title: 'Code copied to clipboard', variant: 'info' })
          }}
        >
          <Copy className="size-3.5 mr-1.5" /> Copy Code
        </Button>
      </motion.div>

      <RiskNote />
    </div>
  )
}

function ActionTile({ icon, label, detail, badge, tone, onClick }: { icon: React.ReactNode; label: string; detail: string; badge: string; tone: 'gold' | 'green' | 'cyan'; onClick: () => void }) {
  const tones = {
    gold: 'border-amber-500/45 from-amber-950/50 via-neutral-900/95 to-neutral-900/95 text-amber-200',
    green: 'border-emerald-500/45 from-emerald-950/50 via-neutral-900/95 to-neutral-900/95 text-emerald-200',
    cyan: 'border-cyan-500/45 from-cyan-950/50 via-neutral-900/95 to-neutral-900/95 text-cyan-200',
  }
  const badgeTones = {
    gold: 'border-amber-500/45 bg-amber-500/20 text-amber-200 shadow-[0_0_12px_rgba(245,158,11,0.25)]',
    green: 'border-emerald-500/45 bg-emerald-500/20 text-emerald-200 shadow-[0_0_12px_rgba(16,185,129,0.25)]',
    cyan: 'border-cyan-500/45 bg-cyan-500/20 text-cyan-200 shadow-[0_0_12px_rgba(6,182,212,0.25)]',
  }

  return (
    <motion.button
      whileHover={{ y: -4, scale: 1.02 }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className={`pulse-pure-shimmer quick-action-tile pulse-tile group relative flex min-h-36 flex-col items-start justify-between gap-5 overflow-hidden rounded-3xl border bg-gradient-to-br p-4.5 text-left shadow-xl transition-all duration-300 ${tones[tone]}`}
    >
      <div className="absolute -right-6 -top-6 size-24 rounded-full bg-current opacity-20 blur-2xl transition-all duration-500 group-hover:opacity-35 group-hover:scale-125" />
      <div className="flex w-full items-start justify-between gap-2">
        <div className="pulse-ambient-float flex size-12 shrink-0 items-center justify-center rounded-2xl border border-current/45 bg-current/20 shadow-[0_0_22px_rgba(245,158,11,.25)] transition-transform duration-300 group-hover:scale-110">
          {icon}
        </div>
        <span className={`rounded-full border px-2.5 py-1 text-[10px] font-black uppercase tracking-wider ${badgeTones[tone]}`}>{badge}</span>
      </div>
      <div className="space-y-1">
        <span className="block font-display text-sm font-extrabold text-white transition-colors group-hover:text-amber-200">{label}</span>
        <span className="block text-xs text-neutral-300 font-medium">{detail}</span>
      </div>
    </motion.button>
  )
}
