'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ArrowDownRight, ArrowUpRight, Building2, ChevronRight, 
  Copy, Leaf, Pickaxe, Radio, Rocket, ShieldCheck, Sun, 
  TrendingUp, Zap, Sparkles, AlertCircle, Wallet, Layers,
  Globe, ArrowRight
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

// Sleek, minimal ease transition
const fadeVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.05,
      duration: 0.4,
      ease: [0.215, 0.61, 0.355, 1],
    },
  }),
}

export function DashboardView() {
  const { state, api, totalInvested, currentTier, portfolioValue, openModal, setView, toast } = usePulse()
  const upcoming = nextTier(currentTier.id)
  const progress = upcoming ? Math.min(100, (totalInvested / upcoming.minInvest) * 100) : 100

  // Performance calculation
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
    <div className="space-y-8 pb-16 font-sans text-neutral-100 antialiased selection:bg-amber-400/20 selection:text-amber-200">
      
      {/* 1. Header Bar */}
      <motion.div 
        custom={0} initial="hidden" animate="visible" variants={fadeVariants}
        className="flex items-center justify-between border-b border-white/[0.08] pb-4"
      >
        <div>
          <h2 className="text-xs font-semibold uppercase tracking-wider text-neutral-400">Portfolio Overview</h2>
          <p className="text-sm font-medium text-neutral-200 mt-0.5">Welcome back, Syndicate Investor</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-400/20 bg-amber-400/10 px-3 py-1 text-xs font-medium text-amber-300">
            <Sparkles className="size-3 text-amber-400" />
            {currentTier.name}
          </span>
        </div>
      </motion.div>

      {/* 2. Hero Portfolio Balance Vault */}
      <motion.div custom={1} initial="hidden" animate="visible" variants={fadeVariants}>
        <div className="relative overflow-hidden rounded-3xl border border-white/[0.12] bg-neutral-950 p-7 sm:p-9 shadow-2xl">
          {/* Subtle background gradient depth */}
          <div className="pointer-events-none absolute -right-24 -top-24 size-96 rounded-full bg-amber-500/[0.04] blur-3xl" />
          <div className="pointer-events-none absolute -left-24 -bottom-24 size-96 rounded-full bg-emerald-500/[0.03] blur-3xl" />

          <div className="relative z-10 space-y-6">
            
            {/* Main Balance Display */}
            <div className="space-y-2">
              <span className="text-xs font-medium uppercase tracking-widest text-neutral-400">Total Net Portfolio Value</span>
              <div className="flex items-baseline gap-3">
                <h1 className="font-sans text-4xl sm:text-6xl font-bold tracking-tight text-white">
                  ${money(portfolioValue)}
                </h1>
                <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">USD</span>
              </div>

              {/* Dynamic Return Indicator */}
              <div className="flex items-center gap-2 pt-1">
                <span className={cn(
                  "inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-semibold",
                  portfolioReturnPct >= 0 ? "bg-emerald-500/10 text-emerald-400" : "bg-rose-500/10 text-rose-400"
                )}>
                  {portfolioReturnPct >= 0 ? <TrendingUp className="size-3.5" /> : <ArrowDownRight className="size-3.5" />}
                  {portfolioReturnPct >= 0 ? '+' : ''}${money(totalReturnDollars, 2)} ({money(portfolioReturnPct, 1)}%)
                </span>
                <span className="text-xs text-neutral-400">Lifetime Yield Earned</span>
              </div>
            </div>

            {/* Clean 3-Column Asset Breakdown */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4">
                <p className="text-[11px] font-medium uppercase tracking-wider text-neutral-400">Available Cash</p>
                <p className="mt-1 text-xl font-semibold text-white tracking-tight">${money(state.cash, 0)}</p>
                <p className="mt-0.5 text-[11px] text-neutral-500">Liquid / Ready to deploy</p>
              </div>

              <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4">
                <p className="text-[11px] font-medium uppercase tracking-wider text-neutral-400">Deployed Principal</p>
                <p className="mt-1 text-xl font-semibold text-white tracking-tight">${money(totalInvested, 0)}</p>
                <p className="mt-0.5 text-[11px] text-neutral-500">Generating venture yield</p>
              </div>

              <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4">
                <p className="text-[11px] font-medium uppercase tracking-wider text-neutral-400">PULSE Tokens</p>
                <p className="mt-1 text-xl font-semibold text-amber-300 tracking-tight">{money(state.pulse + state.staked, 0)} <span className="text-xs font-normal text-neutral-400">PULSE</span></p>
                <p className="mt-0.5 text-[11px] text-neutral-500">{money(state.staked, 0)} Staked</p>
              </div>
            </div>

            {/* Primary Action Buttons */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <Button
                size="lg"
                className="h-12 rounded-xl bg-amber-400 font-semibold text-neutral-950 hover:bg-amber-300 transition-all shadow-md"
                onClick={() => openModal('deposit')}
              >
                <ArrowDownRight className="size-4 mr-2" /> Deposit Funds
              </Button>

              <Button
                size="lg"
                variant="outline"
                className="h-12 rounded-xl border-white/15 bg-white/[0.03] font-semibold text-white hover:bg-white/[0.08] transition-all"
                onClick={() => openModal('withdraw')}
              >
                <ArrowUpRight className="size-4 mr-2" /> Withdraw Yield
              </Button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* 3. Investor Tier Progress */}
      <motion.div custom={2} initial="hidden" animate="visible" variants={fadeVariants}>
        <div className="rounded-2xl border border-white/[0.08] bg-neutral-950/60 p-5 backdrop-blur-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-neutral-400 uppercase tracking-wider">Standing Tier</p>
              <p className="text-base font-semibold text-white mt-0.5">{currentTier.name}</p>
            </div>
            <Pill tone="green">{currentTier.yieldLabel}</Pill>
          </div>
          
          {upcoming ? (
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-medium">
                <span className="text-neutral-400">Progress to {upcoming.name}</span>
                <span className="text-amber-300">${money(totalInvested, 0)} / ${money(upcoming.minInvest, 0)}</span>
              </div>
              <ProgressBar value={progress} tone="gold" />
            </div>
          ) : (
            <p className="text-xs text-neutral-400">You hold peak institutional syndicate privileges.</p>
          )}

          <button
            onClick={() => setView('invest')}
            className="flex items-center justify-between w-full pt-2 text-xs font-medium text-amber-400 hover:text-amber-300 transition-colors group"
          >
            <span>Review investor tier perks & yield brackets</span>
            <ChevronRight className="size-4 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </motion.div>

      {/* 4. Active Holdings */}
      {state.holdings.length > 0 && (
        <motion.div custom={3} initial="hidden" animate="visible" variants={fadeVariants} className="space-y-3">
          <SectionTitle title="Active Deployed Positions" subtitle="Your live allocations earning yield across SADC infrastructure." />
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
                    <div className="rounded-2xl border border-white/[0.08] bg-neutral-950 p-5 space-y-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1">
                          <p className="font-semibold text-base text-white">{project?.name ?? 'Venture Holding'}</p>
                          <div className="flex items-center gap-2 text-xs text-neutral-400">
                            <span className="font-semibold text-amber-300">${money(h.amount, 0)} Principal</span>
                            {deadlineDate && (
                              <>
                                <span>&bull;</span>
                                <span>{closed ? 'Matured' : 'Closes'} {deadlineDate.toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}</span>
                              </>
                            )}
                          </div>
                        </div>
                        <Pill tone={closed ? 'muted' : 'gold'}>{closed ? 'Closed' : 'Active'}</Pill>
                      </div>

                      <div className="flex items-center justify-between border-t border-white/[0.06] pt-3 text-xs">
                        <span className="text-neutral-400 flex items-center gap-1">
                          <AlertCircle className="size-3.5 text-neutral-500" /> Liquidate early fee: $15
                        </span>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 border-white/10 bg-white/[0.02] text-xs font-medium text-neutral-300 hover:text-white"
                          onClick={async () => {
                            const res = await api.closeInvestment(h.id)
                            if (res.ok) {
                              toast({ title: 'Position Liquidated', description: '$15 fee applied, balance returned.', variant: 'info' })
                            } else {
                              toast({ title: 'Liquidation Failed', description: res.error, variant: 'error' })
                            }
                          }}
                        >
                          Close Position
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

      {/* 5. Live SADC Venture Pipeline */}
      <motion.div custom={4} initial="hidden" animate="visible" variants={fadeVariants} className="space-y-3">
        <SectionTitle title="Open Investment Opportunities" subtitle="Direct institutional-grade regional projects open for subscription." />
        
        <div className="space-y-3">
          {PROJECTS.map((p) => {
            const Icon = sectorIcon[p.sector] || Building2
            const funded = liveFunding ? p.funded + (liveFunding[p.id] ?? 0) : p.funded
            const pct = Math.min(100, Math.round((funded / p.goal) * 100))
            
            return (
              <div 
                key={p.id} 
                className="rounded-2xl border border-white/[0.08] bg-neutral-950 p-5 space-y-4 hover:border-white/20 transition-all"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3.5">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-white/[0.04] text-amber-300 border border-white/10">
                      <Icon className="size-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-base text-white">{p.name}</h3>
                      <p className="text-xs text-neutral-400 mt-0.5">{p.country} &bull; <span className="text-neutral-300">{p.sector}</span></p>
                    </div>
                  </div>
                  <Pill tone="green" className="font-semibold">{p.targetYield}</Pill>
                </div>

                <p className="text-xs text-neutral-400 leading-relaxed">{p.summary}</p>

                {/* Progress bar */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-neutral-300 font-medium">{pct}% Subscribed</span>
                    <span className="text-neutral-500">${money(funded, 0)} / ${money(p.goal, 0)}</span>
                  </div>
                  <ProgressBar value={pct} tone="green" />
                </div>

                {/* Card Footer */}
                <div className="flex items-center justify-between border-t border-white/[0.06] pt-3.5">
                  <Pill tone={p.risk === 'Higher' ? 'danger' : p.risk === 'Moderate' ? 'gold' : 'muted'}>
                    {p.risk} Risk
                  </Pill>
                  <Button
                    size="sm"
                    className="bg-amber-400 font-semibold text-neutral-950 hover:bg-amber-300 text-xs px-4"
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

      {/* 6. Executive Shortcuts */}
      <motion.div custom={5} initial="hidden" animate="visible" variants={fadeVariants} className="space-y-3">
        <SectionTitle title="Quick Command Actions" />
        <div className="grid grid-cols-2 gap-3">
          <CleanTile icon={<Rocket className="size-4 text-amber-300" />} title="Buy $PULSE" subtitle="Presale" onClick={() => setView('sale')} />
          <CleanTile icon={<Zap className="size-4 text-emerald-400" />} title="Stake Vault" subtitle="24.8% APY" onClick={() => setView('stake')} />
          <CleanTile icon={<Radio className="size-4 text-amber-300" />} title="Market Signals" subtitle="Live Feed" onClick={() => setView('signals')} />
          <CleanTile icon={<ShieldCheck className="size-4 text-emerald-400" />} title="Verify KYC" subtitle={state.kyc === 'verified' ? 'Verified' : 'Upgrade Limits'} onClick={() => (state.kyc === 'verified' ? setView('profile') : openModal('kyc'))} />
        </div>
      </motion.div>

      {/* 7. Syndicate Referral Card */}
      <motion.div custom={6} initial="hidden" animate="visible" variants={fadeVariants}>
        <div className="rounded-2xl border border-white/[0.08] bg-neutral-950 p-5 flex items-center justify-between gap-4">
          <div className="space-y-1">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400">Syndicate Referral Pass</p>
            <p className="font-mono text-xl font-bold text-white">{state.referralCode}</p>
            <p className="text-xs text-neutral-500">{state.referralCount} active partner referrals</p>
          </div>
          <button
            onClick={() => {
              navigator.clipboard?.writeText(state.referralCode)
              toast({ title: 'Referral Code Copied', variant: 'info' })
            }}
            className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-neutral-300 hover:text-white hover:bg-white/[0.08] transition-all"
            aria-label="Copy referral code"
          >
            <Copy className="size-4" />
          </button>
        </div>
      </motion.div>

      <RiskNote />
    </div>
  )
}

function CleanTile({
  icon,
  title,
  subtitle,
  onClick,
}: {
  icon: React.ReactNode
  title: string
  subtitle: string
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className="flex items-center justify-between rounded-2xl border border-white/[0.08] bg-neutral-950 p-4 text-left transition-all hover:border-white/20 hover:bg-neutral-900/60 group"
    >
      <div className="flex items-center gap-3">
        <div className="flex size-9 items-center justify-center rounded-xl bg-white/[0.04] border border-white/[0.06]">
          {icon}
        </div>
        <div>
          <p className="text-xs font-semibold text-white">{title}</p>
          <p className="text-[11px] text-neutral-400 mt-0.5">{subtitle}</p>
        </div>
      </div>
      <ChevronRight className="size-4 text-neutral-500 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
    </button>
  )
}
