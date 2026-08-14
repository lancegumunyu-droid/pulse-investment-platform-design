'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ArrowDownRight, ArrowUpRight, Building2, ChevronRight, 
  Copy, Leaf, Pickaxe, Radio, Rocket, ShieldCheck, Sun, 
  TrendingUp, Zap, Sparkles, AlertCircle, ShieldAlert,
  Wallet, Layers, Activity, Lock, Globe2
} from 'lucide-react'
import { money, usePulse } from '../store'
import { Glass, Pill, ProgressBar, RiskNote, SectionTitle } from '../ui-bits'
import { PROJECTS, nextTier, isProjectClosed, PROJECT_DEADLINES, type ProjectSector } from '@/lib/pulse-data'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const sectorIcon: Record<ProjectSector, typeof Sun> = {
  'Renewable Energy': Sun,
  'Mining Royalties': Pickaxe,
  Agriculture: Leaf,
  Infrastructure: Building2,
}

// Ultra-smooth Framer Motion Motion Config
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.04,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 18, scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.5,
      ease: [0.16, 1, 0.3, 1],
    },
  },
}

export function DashboardView() {
  const { state, api, totalInvested, currentTier, portfolioValue, openModal, setView, toast } = usePulse()
  const upcoming = nextTier(currentTier.id)
  const progress = upcoming ? Math.min(100, (totalInvested / upcoming.minInvest) * 100) : 100

  // Precision Performance Calculations
  const initialBenchmark = 250
  const portfolioReturnPct = portfolioValue > 0 ? ((portfolioValue / initialBenchmark) - 1) * 100 : 0
  const totalReturnDollars = Math.max(0, portfolioValue - initialBenchmark)

  const [liveFunding, setLiveFunding] = useState<Record<string, number> | null>(null)
  
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
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-7 pb-12 font-sans selection:bg-amber-500/30 selection:text-amber-200"
    >
      {/* Top Intelligence Status Strip */}
      <motion.div variants={itemVariants} className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <span className="relative flex size-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex size-2.5 rounded-full bg-emerald-500" />
          </span>
          <span className="font-mono text-[11px] font-semibold uppercase tracking-widest text-zinc-400">
            SADC Capital Network &bull; Live Terminal
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="rounded-full border border-amber-500/20 bg-amber-500/10 px-2.5 py-0.5 text-[10px] font-semibold text-amber-400">
            {currentTier.name} Member
          </span>
        </div>
      </motion.div>

      {/* Hero Financial Command Center */}
      <motion.div variants={itemVariants}>
        <div className="group relative overflow-hidden rounded-3xl border border-amber-500/30 bg-gradient-to-b from-zinc-900/90 via-black/95 to-black p-6 sm:p-8 shadow-[0_0_50px_-12px_rgba(232,163,23,0.15)] transition-all duration-500 hover:border-amber-500/50">
          
          {/* Futuristic Background Glow Halos */}
          <div className="pointer-events-none absolute -right-16 -top-16 size-64 rounded-full bg-amber-500/10 blur-[90px] transition-all group-hover:bg-amber-500/15" />
          <div className="pointer-events-none absolute -bottom-20 -left-20 size-72 rounded-full bg-emerald-500/10 blur-[100px]" />
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px] opacity-[0.03]" />

          <div className="relative z-10">
            {/* Header / Tier Badge */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-amber-400">
                <Sparkles className="size-4 animate-pulse text-amber-400" />
                <span>Total Net Portfolio Value</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400 backdrop-blur-md">
                  +{(portfolioReturnPct || 18.4).toFixed(1)}% APY Avg
                </span>
              </div>
            </div>

            {/* Balance Display */}
            <div className="mt-3 flex flex-wrap items-baseline gap-x-4 gap-y-1">
              <h1 className="font-mono text-4xl sm:text-6xl font-black tracking-tight text-white drop-shadow-md">
                ${money(portfolioValue)}
              </h1>
              <span className="font-mono text-sm font-semibold text-zinc-500">USDT Equiv.</span>
            </div>

            {/* Performance Indicators */}
            <div className="mt-3 flex items-center gap-3 text-xs sm:text-sm">
              <span className={cn(
                "inline-flex items-center gap-1.5 font-bold font-mono px-2 py-0.5 rounded-md",
                portfolioReturnPct >= 0 ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
              )}>
                {portfolioReturnPct >= 0 ? <TrendingUp className="size-4" /> : <ArrowDownRight className="size-4" />}
                {portfolioReturnPct >= 0 ? '+' : ''}${money(totalReturnDollars, 2)} ({money(portfolioReturnPct, 1)}%)
              </span>
              <span className="text-zinc-400 font-medium text-xs">Total cumulative yield earned</span>
            </div>

            {/* Asset Allocation Grid Mini-Terminal */}
            <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 gap-3">
              <MiniStatCard 
                icon={<Wallet className="size-4 text-amber-400" />} 
                label="Available Cash" 
                value={`$${money(state.cash, 0)}`} 
                sub="Liquid / Ready" 
              />
              <MiniStatCard 
                icon={<Activity className="size-4 text-emerald-400" />} 
                label="Active Principal" 
                value={`$${money(totalInvested, 0)}`} 
                sub="Deployed in Ventures" 
              />
              <MiniStatCard 
                icon={<Layers className="size-4 text-amber-400" />} 
                label="PULSE Vault" 
                value={`${money(state.pulse + state.staked, 0)}`} 
                sub={`${money(state.staked, 0)} Staked`}
                className="col-span-2 sm:col-span-1"
              />
            </div>

            {/* Command Action CTAs */}
            <div className="mt-6 grid grid-cols-2 gap-3">
              <motion.div whileTap={{ scale: 0.98 }}>
                <Button
                  size="lg"
                  className="h-13 w-full rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 font-bold text-black hover:brightness-110 shadow-[0_0_25px_rgba(232,163,23,0.35)] transition-all duration-300 border border-amber-300/40"
                  onClick={() => openModal('deposit')}
                >
                  <ArrowDownRight className="size-5 mr-1.5 stroke-[2.5]" /> Deposit Capital
                </Button>
              </motion.div>

              <motion.div whileTap={{ scale: 0.98 }}>
                <Button
                  size="lg"
                  variant="outline"
                  className="h-13 w-full rounded-2xl border-white/15 bg-zinc-900/80 font-semibold text-white hover:bg-white/[0.08] hover:border-white/30 backdrop-blur-xl transition-all duration-200"
                  onClick={() => openModal('withdraw')}
                >
                  <ArrowUpRight className="size-5 mr-1.5 stroke-[2]" /> Withdraw Yield
                </Button>
              </motion.div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Tier Progression Gauge */}
      <motion.div variants={itemVariants}>
        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-zinc-950/60 p-5 backdrop-blur-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
                <Lock className="size-5" />
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-wider font-semibold text-zinc-400">Institutional Tier</p>
                <p className="text-base font-bold text-white mt-0.5">{currentTier.name} VIP</p>
              </div>
            </div>
            <Pill tone="green" className="font-mono text-xs">{currentTier.yieldLabel}</Pill>
          </div>
          
          {upcoming ? (
            <div className="mt-5 space-y-2">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-zinc-400">Next Unlock: <span className="text-white">{upcoming.name}</span></span>
                <span className="font-mono text-amber-400">${money(totalInvested, 0)} / ${money(upcoming.minInvest, 0)}</span>
              </div>
              <ProgressBar value={progress} tone="gold" />
            </div>
          ) : (
            <p className="mt-4 text-xs text-zinc-400">You have unlocked Maximum Sovereign Tier privileges.</p>
          )}
          
          <button
            onClick={() => setView('invest')}
            className="mt-4 flex w-full items-center justify-between border-t border-white/5 pt-3.5 text-xs font-semibold text-amber-400 hover:text-amber-300 transition-colors group"
          >
            <span>Explore tier perks, fee waivers & private deal access</span> 
            <ChevronRight className="size-4 transition-transform group-hover:translate-x-1" />
          </button>
        </div>
      </motion.div>

      {/* Active Deployed Positions */}
      {state.holdings.length > 0 && (
        <motion.div variants={itemVariants} className="space-y-3">
          <SectionTitle 
            title="Active Capital Allocations" 
            subtitle="Real-time performance tracking for deployed SADC syndicate holdings." 
          />
          <div className="space-y-3">
            <AnimatePresence mode="popLayout">
              {state.holdings.map((h) => {
                const project = PROJECTS.find((p) => p.id === h.projectId)
                const closed = isProjectClosed(h.projectId)
                const deadlineDate = PROJECT_DEADLINES[h.projectId] ? new Date(PROJECT_DEADLINES[h.projectId]) : null

                return (
                  <motion.div
                    key={h.id}
                    layout
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                  >
                    <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-zinc-950/80 p-5 backdrop-blur-xl transition-all hover:border-amber-500/30">
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1">
                          <p className="font-bold text-base text-white tracking-tight">{project?.name ?? 'SADC Venture Position'}</p>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold text-amber-400">${money(h.amount, 0)} USDT</span>
                            <span className="text-zinc-600">&bull;</span>
                            {deadlineDate && (
                              <span className="text-xs text-zinc-400">
                                {closed ? 'Matured' : 'Closes'} {deadlineDate.toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}
                              </span>
                            )}
                          </div>
                        </div>
                        <Pill tone={closed ? 'muted' : 'gold'} className="font-mono text-xs">
                          {closed ? 'Matured' : 'Earning Yield'}
                        </Pill>
                      </div>

                      <div className="mt-4 flex items-center justify-between border-t border-white/5 pt-3">
                        <span className="text-[11px] text-zinc-500 flex items-center gap-1.5">
                          <AlertCircle className="size-3.5 text-zinc-400" /> Early exit fee: $15
                        </span>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 border-white/15 bg-white/[0.02] text-xs font-semibold text-zinc-300 hover:text-white hover:bg-white/10 hover:border-white/30"
                          onClick={async () => {
                            const res = await api.closeInvestment(h.id)
                            if (res.ok) {
                              toast({ title: 'Holding liquidated', description: '$15 fee applied, funds returned to cash.', variant: 'info' })
                            } else {
                              toast({ title: 'Liquidation failed', description: res.error, variant: 'error' })
                            }
                          }}
                        >
                          Liquidate Position
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </div>
        </motion.div>
      )}

      {/* Institutional SADC Deal Pipeline */}
      <motion.div variants={itemVariants} className="space-y-4">
        <SectionTitle 
          title="Featured Regional Opportunities" 
          subtitle="Direct sovereign & institutional venture opportunities verified by Pulse." 
        />
        
        <div className="space-y-4">
          {PROJECTS.map((p) => {
            const Icon = sectorIcon[p.sector] || Building2
            const funded = liveFunding ? p.funded + (liveFunding[p.id] ?? 0) : p.funded
            const pct = Math.min(100, Math.round((funded / p.goal) * 100))
            
            return (
              <div 
                key={p.id} 
                className="group relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-zinc-900/80 to-black/90 p-6 backdrop-blur-2xl transition-all duration-300 hover:border-amber-500/40 hover:shadow-[0_0_30px_rgba(232,163,23,0.1)]"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3.5">
                    <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20 shadow-inner group-hover:bg-amber-500/20 transition-colors">
                      <Icon className="size-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-white group-hover:text-amber-300 transition-colors">{p.name}</h3>
                      <p className="text-xs text-zinc-400 mt-0.5 flex items-center gap-1.5">
                        <Globe2 className="size-3.5 text-zinc-500" />
                        <span>{p.country}</span> &bull; <span className="text-zinc-200 font-medium">{p.sector}</span>
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="inline-block rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 font-mono text-xs font-bold text-emerald-400">
                      {p.targetYield}
                    </span>
                  </div>
                </div>

                <p className="mt-4 text-xs sm:text-sm leading-relaxed text-zinc-400 line-clamp-2">{p.summary}</p>
                
                {/* Funding Progress Meter */}
                <div className="mt-5 space-y-2">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-amber-400 font-bold">{pct}% Allocated</span>
                    <span className="text-zinc-400">${money(funded, 0)} / ${money(p.goal, 0)}</span>
                  </div>
                  <ProgressBar value={pct} tone="green" />
                </div>

                {/* Footer Row */}
                <div className="mt-5 flex items-center justify-between border-t border-white/5 pt-4">
                  <Pill tone={p.risk === 'Higher' ? 'danger' : p.risk === 'Moderate' ? 'gold' : 'muted'} className="text-[10px] uppercase font-bold">
                    {p.risk} Risk Profile
                  </Pill>
                  <Button
                    size="sm"
                    className="rounded-xl bg-amber-500 font-bold text-black hover:bg-amber-400 shadow-md shadow-amber-500/10 transition-all px-5 h-9"
                    onClick={() => openModal('invest', { projectId: p.id })}
                  >
                    Deploy Capital
                  </Button>
                </div>
              </div>
            )
          })}
        </div>
      </motion.div>

      {/* Command Action Matrix */}
      <motion.div variants={itemVariants} className="space-y-3">
        <SectionTitle title="Tactical Command Shortcuts" />
        <div className="grid grid-cols-2 gap-3">
          <ProActionTile
            icon={<Rocket className="size-5" />}
            tone="gold"
            title="Buy $PULSE"
            subtitle="Syndicate Presale"
            onClick={() => setView('sale')}
          />
          <ProActionTile
            icon={<Zap className="size-5" />}
            tone="green"
            title="Stake Tokens"
            subtitle="24.8% APY Vault"
            onClick={() => setView('stake')}
          />
          <ProActionTile
            icon={<Radio className="size-5" />}
            tone="gold"
            title="Market Signals"
            subtitle="Real-time Intel"
            onClick={() => setView('signals')}
          />
          <ProActionTile
            icon={<ShieldCheck className="size-5" />}
            tone="green"
            title="Verify KYC"
            subtitle={state.kyc === 'verified' ? 'Fully Cleared' : 'Increase Limits'}
            onClick={() => (state.kyc === 'verified' ? setView('profile') : openModal('kyc'))}
          />
        </div>
      </motion.div>

      {/* Syndicate Black Referral Pass */}
      <motion.div variants={itemVariants}>
        <div className="relative overflow-hidden rounded-3xl border border-white/15 bg-gradient-to-r from-zinc-950 via-zinc-900 to-zinc-950 p-6 shadow-2xl">
          <div className="pointer-events-none absolute right-0 top-0 size-48 bg-amber-500/10 blur-3xl" />
          <div className="flex items-center justify-between gap-4">
            <div className="space-y-1">
              <p className="text-[10px] font-bold uppercase tracking-widest text-amber-400">Syndicate Pass</p>
              <p className="font-mono text-2xl font-black text-white tracking-wider">{state.referralCode}</p>
              <p className="text-xs text-zinc-400">{state.referralCount} Referred Partners &bull; Unlock Yield Multipliers</p>
            </div>
            <button
              onClick={() => {
                navigator.clipboard?.writeText(state.referralCode)
                toast({ title: 'Referral code copied!', variant: 'info' })
              }}
              className="flex size-12 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-amber-400 hover:bg-amber-500 hover:text-black transition-all shadow-inner"
              aria-label="Copy referral code"
            >
              <Copy className="size-5" />
            </button>
          </div>
        </div>
      </motion.div>

      <motion.div variants={itemVariants}>
        <RiskNote />
      </motion.div>
    </motion.div>
  )
}

function MiniStatCard({ 
  icon, 
  label, 
  value, 
  sub, 
  className 
}: { 
  icon: React.ReactNode; 
  label: string; 
  value: string; 
  sub?: string;
  className?: string;
}) {
  return (
    <div className={cn("rounded-2xl border border-white/10 bg-black/40 p-3.5 backdrop-blur-md", className)}>
      <div className="flex items-center gap-1.5 text-zinc-400">
        {icon}
        <span className="text-[10px] font-bold uppercase tracking-wider">{label}</span>
      </div>
      <p className="mt-1.5 font-mono text-lg font-extrabold text-white tracking-tight">{value}</p>
      {sub && <p className="mt-0.5 text-[10px] font-medium text-zinc-500">{sub}</p>}
    </div>
  )
}

function ProActionTile({
  icon,
  title,
  subtitle,
  tone,
  onClick,
}: {
  icon: React.ReactNode
  title: string
  subtitle: string
  tone: 'gold' | 'green'
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className="group relative flex flex-col rounded-2xl border border-white/10 bg-zinc-950/60 p-4 text-left backdrop-blur-md transition-all duration-300 hover:border-amber-500/40 hover:bg-zinc-900/80"
    >
      <div className="flex items-center justify-between w-full">
        <span
          className={cn(
            'flex size-10 items-center justify-center rounded-xl border shadow-inner transition-transform group-hover:scale-110',
            tone === 'gold' 
              ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' 
              : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
          )}
        >
          {icon}
        </span>
        <ChevronRight className="size-4 text-zinc-600 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
      </div>
      <p className="mt-3.5 text-sm font-bold text-white tracking-tight">{title}</p>
      <p className="text-xs text-zinc-400 mt-0.5">{subtitle}</p>
    </button>
  )
}
