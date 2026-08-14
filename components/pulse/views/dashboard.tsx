'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ArrowDownRight, ArrowUpRight, Building2, ChevronRight, 
  Copy, Leaf, Pickaxe, Radio, Rocket, ShieldCheck, Sun, 
  TrendingUp, Zap, Sparkles, AlertCircle, Wallet, Layers,
  Activity, Lock, ArrowRight, Shield
} from 'lucide-react'
import { money, usePulse } from '../store'
import { Pill, ProgressBar, RiskNote, SectionTitle } from '../ui-bits'
import { PROJECTS, nextTier, isProjectClosed, PROJECT_DEADLINES, type ProjectSector } from '@/lib/pulse-data'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const sectorIcon: Record<ProjectSector, typeof Sun> = {
  'Renewable Energy': Sun,
  'Mining Royalties': Pickaxe,
  Agriculture: Leaf,
  Infrastructure: Building2,
}

// Ultra-Fluid Liquid Motion Physics
const liquidSpring = { type: 'spring', stiffness: 260, damping: 24 }

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.02,
    },
  },
}

const liquidItem = {
  hidden: { opacity: 0, y: 20, scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: liquidSpring,
  },
}

export function DashboardView() {
  const { state, api, totalInvested, currentTier, portfolioValue, openModal, setView, toast } = usePulse()
  const upcoming = nextTier(currentTier.id)
  const progress = upcoming ? Math.min(100, (totalInvested / upcoming.minInvest) * 100) : 100

  // Yield Performance Stats
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
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="space-y-8 pb-16 font-sans text-neutral-100 antialiased selection:bg-amber-400/20 selection:text-amber-200"
    >
      {/* HUD Bar */}
      <motion.div variants={liquidItem} className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2.5">
          <span className="relative flex size-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex size-2.5 rounded-full bg-emerald-400 shadow-[0_0_10px_#34d399]" />
          </span>
          <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.15em] text-neutral-400">
            SADC Terminal &bull; Active Route
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-400/30 bg-gradient-to-r from-amber-500/10 to-amber-400/20 px-3 py-1 text-xs font-semibold text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.15)] backdrop-blur-xl">
            <Sparkles className="size-3 text-amber-400 animate-pulse" />
            {currentTier.name} Member
          </span>
        </div>
      </motion.div>

      {/* HERO LIQUID GOLD VAULT CARD */}
      <motion.div variants={liquidItem}>
        <div className="group relative overflow-hidden rounded-[2.2rem] border border-white/15 bg-gradient-to-b from-neutral-900/90 via-black/95 to-neutral-950 p-7 sm:p-9 shadow-[0_20px_50px_rgba(0,0,0,0.8)] backdrop-blur-2xl transition-all duration-500 hover:border-amber-400/40">
          
          {/* Liquid Gloss Light Flares */}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/[0.07] via-transparent to-black/40" />
          <div className="pointer-events-none absolute -right-20 -top-20 size-80 rounded-full bg-gradient-to-br from-amber-500/15 via-yellow-500/5 to-transparent blur-3xl group-hover:scale-110 transition-transform duration-700" />
          <div className="pointer-events-none absolute -left-20 -bottom-20 size-80 rounded-full bg-emerald-500/10 blur-3xl" />

          <div className="relative z-10 space-y-6">
            {/* Header / Sub-badge */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-[0.18em] text-amber-300/90">
                Total Portfolio Valuation
              </span>
              <div className="flex items-center gap-1.5 rounded-full border border-emerald-400/25 bg-emerald-400/10 px-3 py-1 font-mono text-xs font-semibold text-emerald-400 shadow-[0_0_15px_rgba(52,211,153,0.1)]">
                +{(portfolioReturnPct || 18.4).toFixed(1)}% APY Avg
              </div>
            </div>

            {/* Total Balance Hero Text */}
            <div className="space-y-1">
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <h1 className="font-sans text-5xl sm:text-7xl font-extrabold tracking-tight text-white drop-shadow-[0_4px_16px_rgba(0,0,0,0.5)]">
                  ${money(portfolioValue)}
                </h1>
                <span className="font-mono text-xs font-bold uppercase tracking-widest text-neutral-500">USDT</span>
              </div>

              {/* Yield return ticker */}
              <div className="flex items-center gap-2 pt-1">
                <span className={cn(
                  "inline-flex items-center gap-1 rounded-md px-2.5 py-0.5 font-mono text-xs font-bold backdrop-blur-md shadow-sm",
                  portfolioReturnPct >= 0 
                    ? "bg-emerald-400/10 text-emerald-400 border border-emerald-400/20" 
                    : "bg-rose-400/10 text-rose-400 border border-rose-400/20"
                )}>
                  {portfolioReturnPct >= 0 ? <TrendingUp className="size-3.5" /> : <ArrowDownRight className="size-3.5" />}
                  {portfolioReturnPct >= 0 ? '+' : ''}${money(totalReturnDollars, 2)} ({money(portfolioReturnPct, 1)}%)
                </span>
                <span className="text-xs font-medium text-neutral-400">Total Yield Generated</span>
              </div>
            </div>

            {/* Asset Breakdown Pods */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-1">
              <GlossPod 
                icon={<Wallet className="size-4 text-amber-400" />}
                label="Available Cash"
                value={`$${money(state.cash, 0)}`}
                sub="Liquid Capital"
              />
              <GlossPod 
                icon={<Activity className="size-4 text-emerald-400" />}
                label="Active Principal"
                value={`$${money(totalInvested, 0)}`}
                sub="Deployed in Deals"
              />
              <GlossPod 
                icon={<Layers className="size-4 text-amber-400" />}
                label="Pulse Vault"
                value={`${money(state.pulse + state.staked, 0)}`}
                sub={`${money(state.staked, 0)} Staked`}
              />
            </div>

            {/* Action Buttons with Gloss Finish */}
            <div className="grid grid-cols-2 gap-3.5 pt-1">
              <motion.div whileHover={{ y: -2, scale: 1.01 }} whileTap={{ scale: 0.98 }} transition={liquidSpring}>
                <Button
                  size="lg"
                  className="h-13 w-full rounded-2xl bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 font-bold text-neutral-950 hover:brightness-110 shadow-[0_0_25px_rgba(245,158,11,0.3)] border border-amber-200/40 transition-all text-sm uppercase tracking-wider"
                  onClick={() => openModal('deposit')}
                >
                  <ArrowDownRight className="size-4 mr-2 stroke-[2.5]" /> Deposit Capital
                </Button>
              </motion.div>

              <motion.div whileHover={{ y: -2, scale: 1.01 }} whileTap={{ scale: 0.98 }} transition={liquidSpring}>
                <Button
                  size="lg"
                  variant="outline"
                  className="h-13 w-full rounded-2xl border-white/20 bg-gradient-to-b from-white/10 to-white/[0.02] font-semibold text-white hover:bg-white/15 backdrop-blur-2xl transition-all text-sm uppercase tracking-wider shadow-lg"
                  onClick={() => openModal('withdraw')}
                >
                  <ArrowUpRight className="size-4 mr-2 stroke-[2.5]" /> Withdraw Earnings
                </Button>
              </motion.div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* TIER PROGRESSION PANEL */}
      <motion.div variants={liquidItem}>
        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-neutral-900/80 to-black/80 p-5 backdrop-blur-xl shadow-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-xl bg-amber-400/10 border border-amber-400/20 text-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.15)]">
                <Lock className="size-4" />
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-[0.18em] font-bold text-neutral-400">Institutional Rank</p>
                <p className="text-base font-bold text-white mt-0.5">{currentTier.name} Status</p>
              </div>
            </div>
            <Pill tone="green" className="font-mono text-xs">{currentTier.yieldLabel}</Pill>
          </div>
          
          {upcoming ? (
            <div className="mt-4 space-y-2">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-neutral-400">Next Level: <span className="text-amber-300">{upcoming.name}</span></span>
                <span className="font-mono text-amber-400">${money(totalInvested, 0)} / ${money(upcoming.minInvest, 0)}</span>
              </div>
              <ProgressBar value={progress} tone="gold" />
            </div>
          ) : (
            <p className="mt-3 text-xs text-neutral-400">You hold apex sovereign tier status.</p>
          )}

          <button
            onClick={() => setView('invest')}
            className="mt-4 flex w-full items-center justify-between border-t border-white/10 pt-3.5 text-xs font-semibold text-amber-400 hover:text-amber-300 transition-colors group"
          >
            <span>Review yield brackets & institutional syndicate privileges</span>
            <ChevronRight className="size-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </motion.div>

      {/* ACTIVE HOLDINGS */}
      {state.holdings.length > 0 && (
        <motion.div variants={liquidItem} className="space-y-3">
          <SectionTitle 
            title="Active Deployed Positions" 
            subtitle="Live investments earning real-time yield across SADC infrastructure." 
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
                    <div className="rounded-2xl border border-white/10 bg-gradient-to-b from-neutral-900/90 to-black/90 p-5 backdrop-blur-xl space-y-4 hover:border-amber-400/30 transition-all shadow-lg">
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1">
                          <p className="font-bold text-base text-white">{project?.name ?? 'Venture Holding'}</p>
                          <div className="flex items-center gap-2 text-xs">
                            <span className="font-mono font-bold text-amber-400">${money(h.amount, 0)} Principal</span>
                            {deadlineDate && (
                              <>
                                <span className="text-neutral-600">&bull;</span>
                                <span className="text-neutral-400">
                                  {closed ? 'Matured' : 'Closes'} {deadlineDate.toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                        <Pill tone={closed ? 'muted' : 'gold'} className="font-mono text-xs">
                          {closed ? 'Closed' : 'Earning Yield'}
                        </Pill>
                      </div>

                      <div className="flex items-center justify-between border-t border-white/10 pt-3.5 text-xs">
                        <span className="text-neutral-400 flex items-center gap-1.5 font-medium">
                          <AlertCircle className="size-3.5 text-amber-400" /> Liquidate early fee: $15
                        </span>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 border-white/15 bg-white/5 text-xs font-semibold text-neutral-200 hover:text-white hover:bg-white/10"
                          onClick={async () => {
                            const res = await api.closeInvestment(h.id)
                            if (res.ok) {
                              toast({ title: 'Position Liquidated', description: '$15 fee applied, funds returned.', variant: 'info' })
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

      {/* OPEN VENTURES PIPELINE */}
      <motion.div variants={liquidItem} className="space-y-4">
        <SectionTitle 
          title="SADC Venture Pipeline" 
          subtitle="Direct institutional regional projects open for syndicate subscription." 
        />
        
        <div className="space-y-4">
          {PROJECTS.map((p) => {
            const Icon = sectorIcon[p.sector] || Building2
            const funded = liveFunding ? p.funded + (liveFunding[p.id] ?? 0) : p.funded
            const pct = Math.min(100, Math.round((funded / p.goal) * 100))
            
            return (
              <motion.div 
                key={p.id} 
                whileHover={{ y: -2 }}
                transition={liquidSpring}
                className="group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-neutral-900/80 via-black/90 to-neutral-950 p-6 backdrop-blur-xl shadow-xl transition-all hover:border-amber-400/40 hover:shadow-[0_10px_30px_rgba(0,0,0,0.5)]"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3.5">
                    <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-amber-400/10 border border-amber-400/20 text-amber-400 shadow-inner group-hover:scale-105 transition-transform">
                      <Icon className="size-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-base text-white group-hover:text-amber-300 transition-colors">{p.name}</h3>
                      <p className="text-xs text-neutral-400 mt-0.5">{p.country} &bull; <span className="text-neutral-200 font-medium">{p.sector}</span></p>
                    </div>
                  </div>
                  <Pill tone="green" className="font-mono text-xs font-bold px-3 py-1">{p.targetYield}</Pill>
                </div>

                <p className="mt-3.5 text-xs sm:text-sm text-neutral-400 leading-relaxed">{p.summary}</p>

                {/* Progress Bar */}
                <div className="mt-4 space-y-1.5">
                  <div className="flex justify-between text-xs font-mono font-semibold">
                    <span className="text-amber-400">{pct}% Subscribed</span>
                    <span className="text-neutral-400">${money(funded, 0)} / ${money(p.goal, 0)}</span>
                  </div>
                  <ProgressBar value={pct} tone="green" />
                </div>

                {/* Card Footer */}
                <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-3.5">
                  <Pill tone={p.risk === 'Higher' ? 'danger' : p.risk === 'Moderate' ? 'gold' : 'muted'} className="text-[10px] uppercase font-bold">
                    {p.risk} Risk Profile
                  </Pill>
                  <Button
                    size="sm"
                    className="rounded-xl bg-amber-400 font-bold text-neutral-950 hover:bg-amber-300 text-xs px-4 h-9 shadow-md transition-all"
                    onClick={() => openModal('invest', { projectId: p.id })}
                  >
                    Deploy Capital
                  </Button>
                </div>
              </motion.div>
            )
          })}
        </div>
      </motion.div>

      {/* QUICK COMMAND TILE GRID */}
      <motion.div variants={liquidItem} className="space-y-3">
        <SectionTitle title="Command Actions" />
        <div className="grid grid-cols-2 gap-3.5">
          <GlossTile icon={<Rocket className="size-4 text-amber-400" />} title="Buy $PULSE" subtitle="Presale" onClick={() => setView('sale')} />
          <GlossTile icon={<Zap className="size-4 text-emerald-400" />} title="Stake Tokens" subtitle="24.8% APY Vault" onClick={() => setView('stake')} />
          <GlossTile icon={<Radio className="size-4 text-amber-400" />} title="Market Signals" subtitle="Live Feed" onClick={() => setView('signals')} />
          <GlossTile icon={<ShieldCheck className="size-4 text-emerald-400" />} title="Verify KYC" subtitle={state.kyc === 'verified' ? 'Verified' : 'Upgrade Limits'} onClick={() => (state.kyc === 'verified' ? setView('profile') : openModal('kyc'))} />
        </div>
      </motion.div>

      {/* SYNDICATE REFERRAL CARD */}
      <motion.div variants={liquidItem}>
        <div className="relative overflow-hidden rounded-2xl border border-white/15 bg-gradient-to-r from-neutral-950 via-neutral-900 to-black p-5 shadow-2xl flex items-center justify-between gap-4">
          <div className="space-y-1">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-amber-400">Syndicate Pass Key</p>
            <p className="font-mono text-2xl font-black text-white tracking-wider">{state.referralCode}</p>
            <p className="text-xs text-neutral-400 font-medium">{state.referralCount} Referred Active Investors</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              navigator.clipboard?.writeText(state.referralCode)
              toast({ title: 'Referral code copied to clipboard', variant: 'info' })
            }}
            className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-amber-400 hover:bg-amber-400 hover:text-neutral-950 transition-all shadow-inner"
            aria-label="Copy referral code"
          >
            <Copy className="size-4" />
          </motion.button>
        </div>
      </motion.div>

      <RiskNote />
    </motion.div>
  )
}

function GlossPod({ 
  icon, 
  label, 
  value, 
  sub 
}: { 
  icon: React.ReactNode; 
  label: string; 
  value: string; 
  sub?: string;
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.05] to-black/40 p-4 backdrop-blur-md shadow-inner">
      <div className="flex items-center gap-1.5 text-neutral-400">
        {icon}
        <span className="text-[10px] font-bold uppercase tracking-wider">{label}</span>
      </div>
      <p className="mt-1.5 font-mono text-xl font-bold text-white tracking-tight">{value}</p>
      {sub && <p className="mt-0.5 text-[10px] text-neutral-400 font-medium">{sub}</p>}
    </div>
  )
}

function GlossTile({
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
    <motion.button
      whileHover={{ y: -2, scale: 1.01 }}
      whileTap={{ scale: 0.97 }}
      transition={liquidSpring}
      onClick={onClick}
      className="flex items-center justify-between rounded-2xl border border-white/10 bg-gradient-to-b from-neutral-900/80 to-black/80 p-4 text-left backdrop-blur-xl transition-all hover:border-amber-400/30 shadow-lg group"
    >
      <div className="flex items-center gap-3">
        <div className="flex size-10 items-center justify-center rounded-xl bg-white/5 border border-white/10 shadow-inner">
          {icon}
        </div>
        <div>
          <p className="text-xs font-bold text-white tracking-tight">{title}</p>
          <p className="text-[11px] text-neutral-400 mt-0.5">{subtitle}</p>
        </div>
      </div>
      <ChevronRight className="size-4 text-neutral-500 group-hover:text-amber-300 group-hover:translate-x-0.5 transition-all" />
    </motion.button>
  )
}
