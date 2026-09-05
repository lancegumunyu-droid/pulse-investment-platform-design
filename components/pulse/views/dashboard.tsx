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
  const cursorGlow = useMotionTemplate`radial-gradient(280px circle at ${mouseX}px ${mouseY}px, rgba(245, 158, 11, 0.16), transparent 78%)`

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
        @keyframes pulsePureGlow { 0%, 100% { opacity: .4; transform: scale(1); } 50% { opacity: .85; transform: scale(1.03); } }
        @keyframes pulseShimmer { 0%, 100% { border-color: rgba(245,158,11,.25); box-shadow: 0 0 10px rgba(245,158,11,.1); } 50% { border-color: rgba(245,158,11,.7); box-shadow: 0 0 25px rgba(245,158,11,.35); } }
        @keyframes pulseEmerald { 0%, 100% { border-color: rgba(16,185,129,.3); box-shadow: 0 0 10px rgba(16,185,129,.15); } 50% { border-color: rgba(16,185,129,.7); box-shadow: 0 0 22px rgba(16,185,129,.35); } }
        @keyframes pulseConicSpin { to { transform: rotate(360deg); } }
        .pulse-pure-glow { animation: pulsePureGlow 2.5s ease-in-out infinite; }
        .pulse-pure-shimmer { animation: pulseShimmer 3.5s ease-in-out infinite; }
        .pulse-pure-emerald { animation: pulseEmerald 3.5s ease-in-out infinite; }
        .pulse-conic-spin { animation: pulseConicSpin 8s linear infinite; }
        @media (prefers-reduced-motion: reduce) { .pulse-pure-glow, .pulse-pure-shimmer, .pulse-pure-emerald, .pulse-conic-spin { animation: none; } }
      `}</style>
      {/* 1. STATUS HEADER */}
      <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
        <div className="flex items-center gap-2.5">
          <span className="relative flex size-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
          </span>
          <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
            SADC Capital Network &bull; Live Terminal
          </span>
        </div>
        <motion.span animate={{ opacity: [0.78, 1, 0.78] }} transition={{ duration: 2, repeat: Infinity }} className="rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-medium text-amber-400 shadow-[0_0_16px_rgba(245,158,11,.1)]">
          {currentTier.name} Member
        </motion.span>
      </div>

      {/* 2. CONSOLIDATED PORTFOLIO CARD */}
      <div className="relative overflow-hidden rounded-2xl p-px shadow-[0_0_35px_rgba(245,158,11,.15)]">
        <motion.div className="pulse-conic-spin pointer-events-none absolute -inset-[150%] bg-[conic-gradient(from_0deg,#f59e0b_0deg,transparent_120deg,#10b981_240deg,#f59e0b_360deg)] opacity-70" />
        <motion.div whileHover={{ scale: 1.005 }} onPointerMove={(event) => { const rect = event.currentTarget.getBoundingClientRect(); mouseX.set(event.clientX - rect.left); mouseY.set(event.clientY - rect.top) }} className="glow-edge glass-gold pulse-surface group relative overflow-hidden rounded-2xl shadow-[0_0_25px_rgba(245,158,11,.08)]">
          <motion.div className="pointer-events-none absolute inset-0 z-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100" style={{ background: cursorGlow }} />
          <div className="pointer-events-none absolute -right-12 -top-12 size-40 rounded-full bg-amber-500/15 blur-3xl" />
          <div className="relative z-10 space-y-4 p-4 sm:p-5">
          <div className="flex min-w-0 items-start justify-between gap-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
              Total Net Portfolio Value
            </span>
            <motion.span animate={{ scale: [1, 1.03, 1] }} transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }} className="pulse-pure-emerald inline-flex max-w-[48%] shrink-0 items-center gap-1 rounded-md border border-emerald-500/30 bg-emerald-950/60 px-2 py-1 text-[10px] font-extrabold leading-tight text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,.22)] sm:max-w-none sm:gap-1.5 sm:px-2.5 sm:text-xs">
              <TrendingUp className="size-3.5" />
              +{(portfolioReturnPct || 18.4).toFixed(1)}% APY Avg
            </motion.span>
          </div>

          <div>
            <div className="flex items-baseline gap-2">
              <h1 className="font-display text-4xl font-bold tracking-tight text-white sm:text-5xl">
                ${money(portfolioValue)}
              </h1>
              <span className="font-mono text-xs font-semibold text-neutral-500">USDT</span>
            </div>
            <p className="mt-2 text-xs font-medium text-neutral-400">
              Cumulative Yield: <span className="text-emerald-400 font-semibold">+${money(totalReturnDollars, 2)} ({money(portfolioReturnPct, 1)}%)</span>
            </p>
          </div>

          <div className="grid min-w-0 grid-cols-2 gap-2.5 pt-1">
            <motion.div whileTap={{ scale: 0.97 }}>
            <Button
              aria-label="Deposit capital"

              size="lg"
              className="pulse-action h-11 w-full min-w-0 rounded-xl border border-amber-200/60 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-300 px-2 text-xs font-black text-neutral-950 shadow-[0_0_20px_rgba(245,158,11,.38)] transition-colors hover:from-amber-300 hover:to-amber-200 sm:px-3"
              onClick={() => openModal('deposit')}
            >
              <ArrowDownRight className="size-3.5 shrink-0 stroke-[2.5]" /><span className="truncate">Deposit Capital</span>
            </Button>
            </motion.div>
            <motion.div whileTap={{ scale: 0.97 }}>
            <Button
              size="lg"
              variant="outline"
              className="h-11 w-full min-w-0 rounded-xl border border-neutral-700/90 bg-gradient-to-r from-neutral-800 to-neutral-900 px-2 text-xs font-bold text-white shadow-[0_0_15px_rgba(0,0,0,.45)] transition-colors hover:border-neutral-500 hover:bg-neutral-800 sm:px-3"
              onClick={() => openModal('withdraw')}
            >
              <ArrowUpRight className="size-3.5 shrink-0 stroke-[2]" /><span className="truncate">Withdraw Earnings</span>
            </Button>
            </motion.div>
          </div>
        </div>

        {/* Integrated Asset Breakdown Row */}
        <div className="relative z-10 grid grid-cols-3 gap-1 border-t border-neutral-800/80 bg-neutral-950/85 p-3 text-center">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-neutral-500">Available Cash</p>
            <p className="mt-1 font-mono text-base font-bold text-white">${money(state.cash, 0)}</p>
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-neutral-500">Active Principal</p>
            <p className="mt-1 font-mono text-base font-bold text-white">${money(totalInvested, 0)}</p>
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-neutral-500">PULSE Tokens</p>
            <p className="mt-1 font-mono text-base font-bold text-amber-400">{money(state.pulse + state.staked, 0)}</p>
          </div>
        </div>
        </motion.div>
      </div>

      {/* 3. TIER STATUS BAR */}
      <motion.div animate={{ borderColor: ['rgba(245,158,11,.2)', 'rgba(245,158,11,.5)', 'rgba(245,158,11,.2)'] }} transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }} className="pulse-pure-shimmer glow-card relative overflow-hidden rounded-2xl border border-amber-500/30 bg-gradient-to-r from-neutral-900/90 via-amber-950/20 to-neutral-900/90 p-4 shadow-[0_0_25px_rgba(245,158,11,.12)] sm:p-5">
        <div className="flex min-w-0 flex-col items-start justify-between gap-2 sm:flex-row sm:items-center">
          <div className="flex min-w-0 items-center gap-2">
            <Lock className="size-4 text-amber-400" />
            <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
              Standing: <span className="text-white font-bold">{currentTier.name} VIP</span>
            </span>
          </div>
          <span className="text-xs font-mono font-semibold text-emerald-400">{currentTier.yieldLabel}</span>
        </div>

        {upcoming ? (
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs text-neutral-400 font-medium">
              <span>Next Unlock: {upcoming.name}</span>
              <span className="font-mono text-neutral-300">${money(totalInvested, 0)} / ${money(upcoming.minInvest, 0)}</span>
            </div>
            <ProgressBar value={progress} tone="gold" />
          </div>
        ) : (
          <p className="text-xs text-neutral-400">Apex Institutional Rank Active.</p>
        )}
        </motion.div>

      {/* 4. ACTIVE DEPLOYED POSITIONS */}
      {state.holdings.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400 px-1">
            Active Holdings ({state.holdings.length})
          </h3>
          <div className="space-y-2.5">
            {state.holdings.map((h) => {
              const project = PROJECTS.find((p) => p.id === h.projectId)
              const closed = isProjectClosed(h.projectId)

              return (
                <motion.div
                  key={h.id}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  whileHover={{ scale: 1.01 }}
                  transition={{ duration: 0.4 }}
                  className="pulse-pure-shimmer glow-card pulse-tile flex min-w-0 flex-col items-stretch justify-between gap-3 rounded-2xl border border-neutral-800 bg-gradient-to-r from-neutral-900/95 via-neutral-800/70 to-neutral-900/95 p-4 shadow-[0_0_20px_rgba(0,0,0,.5)] transition-colors sm:flex-row sm:items-center sm:p-5"
                >
                  <div className="min-w-0 space-y-0.5">
                    <p className="truncate text-sm font-semibold text-white">{project?.name ?? 'SADC Venture Position'}</p>
                    <p className="text-xs text-neutral-400 font-mono">
                      <span className="text-amber-400 font-bold">${money(h.amount, 0)} USDT</span> &bull; {closed ? 'Matured' : 'Generating Yield'}
                    </p>
                  </div>

                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 border-neutral-700 bg-neutral-800 text-xs font-medium text-neutral-200 hover:text-white"
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
                    Liquidate
                  </Button>
                </motion.div>
              )
            })}
          </div>
        </div>
      )}

      {/* 5. VENTURE OPPORTUNITIES */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400">
            Regional Opportunities
          </h3>
          <span className="text-xs text-neutral-500">Verified SADC Pipeline</span>
        </div>

        <div className="space-y-3">
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
                whileHover={{ y: -3, scale: 1.01 }}
                transition={{ duration: 0.45 }}
                className="pulse-pure-shimmer group glow-card pulse-tile relative overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900/90 p-5 space-y-4 transition-colors"
              >
                {p.image && (
                  <div className="relative -mx-5 -mt-5 mb-4 h-32 overflow-hidden border-b border-white/10 bg-neutral-950">
                    <img src={p.image} alt={`${p.name} project`} className="h-full w-full object-cover object-center opacity-90 transition-transform duration-500 group-hover:scale-105" />
                    <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/20 to-transparent" />
                    <span className="absolute bottom-3 left-4 rounded-full border border-amber-300/30 bg-black/50 px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider text-amber-200 backdrop-blur-sm">Verified project</span>
                  </div>
                )}
                <div className="relative">
                <div className="flex min-w-0 flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-neutral-800 border border-neutral-700 text-amber-400">
                      <Icon className="size-5" />
                    </div>
                    <div>
                      <h4 className="truncate text-base font-bold text-white">{p.name}</h4>
                      <p className="text-xs text-neutral-400">{p.country} &bull; {p.sector}</p>
                    </div>
                  </div>
                  <span className="rounded-md border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 font-mono text-xs font-bold text-emerald-400">
                    {p.targetYield}
                  </span>
                </div>

                <p className="text-xs text-neutral-400 leading-relaxed">{p.summary}</p>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-neutral-300 font-semibold">{pct}% Allocated</span>
                    <span className="text-neutral-500">${money(funded, 0)} / ${money(p.goal, 0)}</span>
                  </div>
                  <ProgressBar value={pct} tone="green" />
                </div>

                <div className="flex items-center justify-between border-t border-neutral-800/80 pt-3.5">
                  <span className="text-xs text-neutral-400 font-medium">Risk Profile: <span className="text-neutral-200">{p.risk}</span></span>
                  <Button
                    size="sm"
                    className="pulse-action w-full min-w-0 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-300 px-3 text-xs font-bold text-neutral-950 shadow-[0_0_18px_rgba(245,158,11,.35)] hover:bg-amber-300 sm:w-auto sm:px-4"
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
        <div className="grid grid-cols-2 gap-3">
          <ActionTile tone="gold" badge="Private" icon={<Rocket className="size-4 text-amber-300" />} label="Buy $PULSE" detail="Private sale round" onClick={() => setView('sale')} />
          <ActionTile tone="green" badge="24.8% APY" icon={<Zap className="size-4 text-emerald-300" />} label="Stake Vault" detail="High yield pool" onClick={() => setView('stake')} />
          <ActionTile tone="cyan" badge="3 Live" icon={<Radio className="size-4 text-cyan-300" />} label="Signals Feed" detail="Institutional deals" onClick={() => setView('signals')} />
          <ActionTile tone="gold" badge="Level 2" icon={<ShieldCheck className="size-4 text-amber-300" />} label="Verify KYC" detail="Unlocked access" onClick={() => (state.kyc === 'verified' ? setView('profile') : openModal('kyc'))} />
        </div>
      </div>

      {/* 7. REFERRAL SECTION */}
      <div className="pulse-pure-shimmer glow-card flex min-w-0 flex-col items-stretch justify-between gap-3 rounded-2xl border border-amber-500/25 bg-gradient-to-r from-amber-950/25 via-neutral-900 to-neutral-900 p-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Referral Access Pass</p>
          <p className="font-mono text-lg font-bold text-white mt-0.5">{state.referralCode}</p>
        </div>
        <Button
          size="sm"
          variant="outline"
          className="w-full min-w-0 border-neutral-700 bg-neutral-800 text-xs font-semibold text-neutral-200 hover:text-white sm:w-auto"
          onClick={() => {
            navigator.clipboard?.writeText(state.referralCode)
            toast({ title: 'Code copied to clipboard', variant: 'info' })
          }}
        >
          <Copy className="size-3.5 mr-1.5" /> Copy Code
        </Button>
      </div>

      <RiskNote />
    </div>
  )
}

function ActionTile({ icon, label, detail, badge, tone, onClick }: { icon: React.ReactNode; label: string; detail: string; badge: string; tone: 'gold' | 'green' | 'cyan'; onClick: () => void }) {
  const tones = {
    gold: 'border-amber-500/30 from-amber-950/35 via-neutral-900/90 to-neutral-900/90 text-amber-300',
    green: 'border-emerald-500/30 from-emerald-950/40 via-neutral-900/90 to-neutral-900/90 text-emerald-300',
    cyan: 'border-cyan-500/30 from-cyan-950/35 via-neutral-900/90 to-neutral-900/90 text-cyan-300',
  }
  const badgeTones = {
    gold: 'border-amber-500/30 bg-amber-500/10 text-amber-300',
    green: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300',
    cyan: 'border-cyan-500/30 bg-cyan-500/10 text-cyan-300',
  }

  return (
    <button
      onClick={onClick}
      className={`pulse-pure-shimmer quick-action-tile pulse-tile group relative flex min-h-32 flex-col items-start justify-between gap-5 overflow-hidden rounded-3xl border bg-gradient-to-br p-4 text-left shadow-xl transition duration-300 hover:-translate-y-0.5 ${tones[tone]}`}
    >
      <div className="absolute -right-5 -top-5 size-20 rounded-full bg-current opacity-10 blur-2xl transition-opacity group-hover:opacity-20" />
      <div className="flex w-full items-start justify-between gap-2">
        <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl border border-current/30 bg-current/10 shadow-[0_0_18px_rgba(245,158,11,.16)] transition-transform duration-300 group-hover:scale-105">
          {icon}
        </div>
        <span className={`rounded-full border px-2 py-0.5 text-[9px] font-black uppercase tracking-wide ${badgeTones[tone]}`}>{badge}</span>
      </div>
      <div className="space-y-1"><span className="block font-display text-sm font-bold text-white transition-colors group-hover:text-current">{label}</span><span className="block text-xs text-neutral-400">{detail}</span></div>
    </button>
  )
}
