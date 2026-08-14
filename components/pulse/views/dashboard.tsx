'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ArrowDownRight, ArrowUpRight, Building2, ChevronRight, 
  Copy, Leaf, Pickaxe, Radio, Rocket, ShieldCheck, Sun, 
  TrendingUp, Zap, Sparkles, AlertCircle, ShieldAlert,
  Wallet, Layers, Activity, Lock, Globe2, Eye, Flame, Radar
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

// Pro-Grade Physics Animations
const springConfig = { type: 'spring', stiffness: 380, damping: 28 }

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.07,
      delayChildren: 0.02,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 24, scale: 0.96 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: springConfig,
  },
}

export function DashboardView() {
  const { state, api, totalInvested, currentTier, portfolioValue, openModal, setView, toast } = usePulse()
  const upcoming = nextTier(currentTier.id)
  const progress = upcoming ? Math.min(100, (totalInvested / upcoming.minInvest) * 100) : 100

  // Precision Returns Engine
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
      className="space-y-8 pb-16 font-sans text-zinc-100 selection:bg-amber-400/30 selection:text-amber-200"
    >
      {/* HUD Telemetry Top Bar */}
      <motion.div variants={itemVariants} className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2.5">
          <div className="relative flex size-3 items-center justify-center">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex size-2 rounded-full bg-emerald-400 shadow-[0_0_12px_#34d399]" />
          </div>
          <span className="font-mono text-[11px] font-bold tracking-[0.2em] uppercase text-zinc-400 flex items-center gap-1.5">
            <Radar className="size-3.5 text-amber-400 animate-spin" style={{ animationDuration: '8s' }} />
            SADC NODE // ONLINE
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="rounded-full border border-amber-400/30 bg-amber-400/10 px-3 py-0.5 font-mono text-[10px] font-bold tracking-wider text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.2)]">
            {currentTier.name.toUpperCase()} VIP
          </span>
        </div>
      </motion.div>

      {/* HERO COMMAND VAULT CARD */}
      <motion.div variants={itemVariants}>
        <div className="group relative overflow-hidden rounded-[2.5rem] border border-amber-400/40 bg-gradient-to-b from-zinc-900/90 via-black/95 to-black p-7 sm:p-9 shadow-[0_0_60px_-15px_rgba(245,158,11,0.25)] transition-all duration-500 hover:border-amber-400 hover:shadow-[0_0_80px_-10px_rgba(245,158,11,0.35)]">
          
          {/* Ambient Cyber Neon Backlighting */}
          <div className="pointer-events-none absolute -right-20 -top-20 size-80 rounded-full bg-gradient-to-br from-amber-500/20 to-yellow-600/0 blur-[100px] transition-all group-hover:scale-125 duration-700" />
          <div className="pointer-events-none absolute -bottom-24 -left-24 size-80 rounded-full bg-emerald-500/15 blur-[120px]" />
          
          {/* Cyber Micro Grid Line Overlay */}
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:24px_24px]" />

          <div className="relative z-10">
            {/* Header / Badges */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="flex size-7 items-center justify-center rounded-xl bg-amber-400/10 border border-amber-400/30 text-amber-400 shadow-[0_0_10px_rgba(245,158,11,0.3)]">
                  <Sparkles className="size-4 animate-pulse" />
                </span>
                <span className="text-xs font-black uppercase tracking-[0.18em] text-amber-300/90">
                  Total Sovereign Net Worth
                </span>
              </div>
              
              <div className="flex items-center gap-1.5 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3.5 py-1 backdrop-blur-md shadow-[0_0_20px_rgba(52,211,153,0.15)]">
                <Flame className="size-3.5 text-emerald-400 animate-bounce" />
                <span className="font-mono text-xs font-extrabold text-emerald-400">
                  +{(portfolioReturnPct || 18.4).toFixed(1)}% APY
                </span>
              </div>
            </div>

            {/* Total Balance Hero Text */}
            <div className="mt-4 flex flex-wrap items-baseline gap-x-4 gap-y-1">
              <h1 className="font-mono text-5xl sm:text-7xl font-black tracking-tight text-white drop-shadow-[0_4px_24px_rgba(0,0,0,0.8)]">
                ${money(portfolioValue)}
              </h1>
              <span className="font-mono text-sm font-bold uppercase tracking-widest text-zinc-500">
                USDT Vault
              </span>
            </div>

            {/* Cumulative Performance Ticker */}
            <div className="mt-3 flex items-center gap-3 text-xs sm:text-sm">
              <span className={cn(
                "inline-flex items-center gap-1.5 rounded-lg font-mono text-xs font-black px-2.5 py-1 border backdrop-blur-sm shadow-md",
                portfolioReturnPct >= 0 
                  ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30 shadow-emerald-500/10" 
                  : "bg-rose-500/15 text-rose-300 border-rose-500/30 shadow-rose-500/10"
              )}>
                {portfolioReturnPct >= 0 ? <TrendingUp className="size-4" /> : <ArrowDownRight className="size-4" />}
                {portfolioReturnPct >= 0 ? '+' : ''}${money(totalReturnDollars, 2)} ({money(portfolioReturnPct, 1)}%)
              </span>
              <span className="text-zinc-400 font-medium text-xs">All-time yield generated</span>
            </div>

            {/* Asset Breakdown Holographic Pods */}
            <div className="mt-7 grid grid-cols-2 sm:grid-cols-3 gap-3.5">
              <HoloStatCard 
                icon={<Wallet className="size-4 text-amber-400" />} 
                label="Liquid Capital" 
                value={`$${money(state.cash, 0)}`} 
                sub="Available to Deploy" 
              />
              <HoloStatCard 
                icon={<Activity className="size-4 text-emerald-400" />} 
                label="Active Principal" 
                value={`$${money(totalInvested, 0)}`} 
                sub="Generating Yield" 
              />
              <HoloStatCard 
                icon={<Layers className="size-4 text-amber-400" />} 
                label="Pulse Vault" 
                value={`${money(state.pulse + state.staked, 0)}`} 
                sub={`${money(state.staked, 0)} Staked`}
                className="col-span-2 sm:col-span-1"
              />
            </div>

            {/* Main Action CTAs */}
            <div className="mt-7 grid grid-cols-2 gap-4">
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
                <Button
                  size="lg"
                  className="h-14 w-full rounded-2xl bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-500 font-extrabold text-black hover:brightness-110 shadow-[0_0_35px_rgba(245,158,11,0.4)] transition-all duration-300 border border-amber-200/50 text-sm tracking-wide uppercase"
                  onClick={() => openModal('deposit')}
                >
                  <ArrowDownRight className="size-5 mr-2 stroke-[3]" /> Deposit Capital
                </Button>
              </motion.div>

              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
                <Button
                  size="lg"
                  variant="outline"
                  className="h-14 w-full rounded-2xl border-white/20 bg-zinc-900/90 font-bold text-white hover:bg-white/10 hover:border-white/40 backdrop-blur-2xl transition-all duration-300 shadow-lg text-sm tracking-wide uppercase"
                  onClick={() => openModal('withdraw')}
                >
                  <ArrowUpRight className="size-5 mr-2 stroke-[2.5]" /> Withdraw Earnings
                </Button>
              </motion.div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* TIER STATUS GAUGE */}
      <motion.div variants={itemVariants}>
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-zinc-950/70 p-6 backdrop-blur-3xl shadow-xl hover:border-amber-400/30 transition-all">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3.5">
              <div className="flex size-11 items-center justify-center rounded-2xl bg-amber-400/10 border border-amber-400/25 text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.15)]">
                <Lock className="size-5" />
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-[0.2em] font-extrabold text-zinc-400">Institutional Standing</p>
                <p className="text-lg font-black text-white mt-0.5">{currentTier.name} Status</p>
              </div>
            </div>
            <Pill tone="green" className="font-mono text-xs px-3 py-1 font-bold">{currentTier.yieldLabel}</Pill>
          </div>
          
          {upcoming ? (
            <div className="mt-5 space-y-2">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-zinc-400">Next Unlock Level: <span className="text-amber-300">{upcoming.name}</span></span>
                <span className="font-mono text-amber-400">${money(totalInvested, 0)} / ${money(upcoming.minInvest, 0)}</span>
              </div>
              <ProgressBar value={progress} tone="gold" />
            </div>
          ) : (
            <p className="mt-4 text-xs font-medium text-zinc-400">You hold maximum institutional privilege across all SADC routes.</p>
          )}
          
          <button
            onClick={() => setView('invest')}
            className="mt-5 flex w-full items-center justify-between border-t border-white/10 pt-4 text-xs font-bold text-amber-400 hover:text-amber-300 transition-colors group"
          >
            <span>Review Sovereign Tier Multipliers & Private Syndicate Access</span> 
            <ChevronRight className="size-4 transition-transform group-hover:translate-x-1.5" />
          </button>
        </div>
      </motion.div>

      {/* ACTIVE POSITIONS SECTION */}
      {state.holdings.length > 0 && (
        <motion.div variants={itemVariants} className="space-y-4">
          <SectionTitle 
            title="Active Capital Allocations" 
            subtitle="Live tracking & telemetry for your active venture positions." 
          />
          <div className="space-y-3.5">
            <AnimatePresence mode="popLayout">
              {state.holdings.map((h) => {
                const project = PROJECTS.find((p) => p.id === h.projectId)
                const closed = isProjectClosed(h.projectId)
                const deadlineDate = PROJECT_DEADLINES[h.projectId] ? new Date(PROJECT_DEADLINES[h.projectId]) : null

                return (
                  <motion.div
                    key={h.id}
                    layout
                    initial={{ opacity: 0, scale: 0.97 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                  >
                    <div className="relative overflow-hidden rounded-2xl border border-white/15 bg-zinc-950/80 p-5 backdrop-blur-2xl transition-all hover:border-amber-400/40 shadow-lg">
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1">
                          <p className="font-extrabold text-base text-white tracking-tight">{project?.name ?? 'SADC Venture Position'}</p>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold text-amber-400">${money(h.amount, 0)} USDT Principal</span>
                            {deadlineDate && (
                              <>
                                <span className="text-zinc-600">&bull;</span>
                                <span className="text-xs font-medium text-zinc-400">
                                  {closed ? 'Matured' : 'Closes'} {deadlineDate.toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                        <Pill tone={closed ? 'muted' : 'gold'} className="font-mono text-xs px-3 py-1 font-bold">
                          {closed ? 'Closed' : 'Earning Yield'}
                        </Pill>
                      </div>

                      <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-3.5">
                        <span className="text-[11px] text-zinc-400 flex items-center gap-1.5 font-medium">
                          <AlertCircle className="size-3.5 text-amber-400" /> Early exit fee: $15
                        </span>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 border-white/20 bg-white/5 text-xs font-bold text-zinc-200 hover:text-white hover:bg-white/10"
                          onClick={async () => {
                            const res = await api.closeInvestment(h.id)
                            if (res.ok) {
                              toast({ title: 'Position Liquidated', description: '$15 fee applied, balance returned to cash.', variant: 'info' })
                            } else {
                              toast({ title: 'Liquidation Failed', description: res.error, variant: 'error' })
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

      {/* FEATURED SADC VENTURES PIPELINE */}
      <motion.div variants={itemVariants} className="space-y-4">
        <SectionTitle 
          title="Verified SADC Venture Radar" 
          subtitle="Institutional-grade regional projects open for private syndicate funding." 
        />
        
        <div className="space-y-4">
          {PROJECTS.map((p) => {
            const Icon = sectorIcon[p.sector] || Building2
            const funded = liveFunding ? p.funded + (liveFunding[p.id] ?? 0) : p.funded
            const pct = Math.min(100, Math.round((funded / p.goal) * 100))
            
            return (
              <motion.div 
                key={p.id}
                whileHover={{ y: -3 }}
                transition={springConfig}
                className="group relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-zinc-900/90 via-black/90 to-zinc-950 p-6 sm:p-7 backdrop-blur-2xl transition-all duration-300 hover:border-amber-400/50 hover:shadow-[0_10px_40px_-10px_rgba(245,158,11,0.2)]"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="flex size-13 shrink-0 items-center justify-center rounded-2xl bg-amber-400/10 text-amber-400 border border-amber-400/30 shadow-[0_0_15px_rgba(245,158,11,0.15)] group-hover:bg-amber-400/20 group-hover:scale-105 transition-all">
                      <Icon className="size-6" />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-lg text-white group-hover:text-amber-300 transition-colors tracking-tight">{p.name}</h3>
                      <p className="text-xs text-zinc-400 mt-0.5 flex items-center gap-1.5 font-medium">
                        <Globe2 className="size-3.5 text-amber-400" />
                        <span>{p.country}</span> &bull; <span className="text-zinc-200">{p.sector}</span>
                      </p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <span className="inline-block rounded-xl border border-emerald-400/30 bg-emerald-400/10 px-3.5 py-1.5 font-mono text-xs font-black text-emerald-400 shadow-[0_0_15px_rgba(52,211,153,0.15)]">
                      {p.targetYield} Yield
                    </span>
                  </div>
                </div>

                <p className="mt-4 text-xs sm:text-sm leading-relaxed text-zinc-400 font-normal">{p.summary}</p>
                
                {/* Funding Progress Bar */}
                <div className="mt-5 space-y-2">
                  <div className="flex justify-between text-xs font-mono font-bold">
                    <span className="text-amber-400">{pct}% Subscribed</span>
                    <span className="text-zinc-400">${money(funded, 0)} / ${money(p.goal, 0)}</span>
                  </div>
                  <ProgressBar value={pct} tone="green" />
                </div>

                {/* Footer Controls */}
                <div className="mt-5 flex items-center justify-between border-t border-white/10 pt-4">
                  <Pill tone={p.risk === 'Higher' ? 'danger' : p.risk === 'Moderate' ? 'gold' : 'muted'} className="text-[10px] uppercase font-bold tracking-wider">
                    {p.risk} Risk Profile
                  </Pill>
                  <Button
                    size="sm"
                    className="rounded-xl bg-amber-400 font-extrabold text-black hover:bg-amber-300 shadow-[0_0_20px_rgba(245,158,11,0.3)] transition-all px-5 h-9 uppercase tracking-wider text-xs"
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

      {/* TACTICAL COMMAND GRID */}
      <motion.div variants={itemVariants} className="space-y-4">
        <SectionTitle title="Tactical Command Grid" />
        <div className="grid grid-cols-2 gap-3.5">
          <CyberActionTile
            icon={<Rocket className="size-5" />}
            tone="gold"
            title="Buy $PULSE"
            subtitle="Private Presale Access"
            onClick={() => setView('sale')}
          />
          <CyberActionTile
            icon={<Zap className="size-5" />}
            tone="green"
            title="Stake Tokens"
            subtitle="24.8% APY Vault Yield"
            onClick={() => setView('stake')}
          />
          <CyberActionTile
            icon={<Radio className="size-5" />}
            tone="gold"
            title="Market Signals"
            subtitle="Live Institutional Feed"
            onClick={() => setView('signals')}
          />
          <CyberActionTile
            icon={<ShieldCheck className="size-5" />}
            tone="green"
            title="Verify KYC"
            subtitle={state.kyc === 'verified' ? 'Fully Cleared' : 'Unlock Institutional Limits'}
            onClick={() => (state.kyc === 'verified' ? setView('profile') : openModal('kyc'))}
          />
        </div>
      </motion.div>

      {/* SYNDICATE BLACK REFERRAL PASS */}
      <motion.div variants={itemVariants}>
        <div className="relative overflow-hidden rounded-3xl border border-amber-400/30 bg-gradient-to-r from-zinc-950 via-zinc-900 to-black p-6 shadow-2xl group hover:border-amber-400/60 transition-all duration-300">
          <div className="pointer-events-none absolute right-0 top-0 size-60 bg-amber-400/10 blur-3xl group-hover:bg-amber-400/20 transition-all" />
          <div className="flex items-center justify-between gap-4">
            <div className="space-y-1">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-400">Syndicate Pass Key</p>
              <p className="font-mono text-2xl font-black text-white tracking-widest">{state.referralCode}</p>
              <p className="text-xs text-zinc-400 font-medium">{state.referralCount} Referred Partners &bull; Multiplier Bonuses Active</p>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.92 }}
              onClick={() => {
                navigator.clipboard?.writeText(state.referralCode)
                toast({ title: 'Referral code copied to clipboard', variant: 'info' })
              }}
              className="flex size-13 shrink-0 items-center justify-center rounded-2xl border border-amber-400/30 bg-amber-400/10 text-amber-400 hover:bg-amber-400 hover:text-black transition-all shadow-[0_0_20px_rgba(245,158,11,0.2)]"
              aria-label="Copy referral code"
            >
              <Copy className="size-5 stroke-[2.5]" />
            </motion.button>
          </div>
        </div>
      </motion.div>

      <motion.div variants={itemVariants}>
        <RiskNote />
      </motion.div>
    </motion.div>
  )
}

function HoloStatCard({ 
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
    <div className={cn("relative overflow-hidden rounded-2xl border border-white/10 bg-black/60 p-4 backdrop-blur-md transition-all hover:border-amber-400/30 shadow-inner", className)}>
      <div className="flex items-center gap-2 text-zinc-400">
        {icon}
        <span className="text-[10px] font-extrabold uppercase tracking-wider text-zinc-400">{label}</span>
      </div>
      <p className="mt-2 font-mono text-xl font-black text-white tracking-tight">{value}</p>
      {sub && <p className="mt-0.5 text-[10px] font-bold text-zinc-500">{sub}</p>}
    </div>
  )
}

function CyberActionTile({
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
    <motion.button
      whileHover={{ y: -3, scale: 1.01 }}
      whileTap={{ scale: 0.97 }}
      transition={springConfig}
      onClick={onClick}
      className="group relative flex flex-col rounded-2xl border border-white/10 bg-zinc-950/70 p-4.5 text-left backdrop-blur-xl transition-all duration-300 hover:border-amber-400/40 hover:bg-zinc-900/90 shadow-lg"
    >
      <div className="flex items-center justify-between w-full">
        <span
          className={cn(
            'flex size-11 items-center justify-center rounded-xl border shadow-md transition-transform group-hover:scale-110',
            tone === 'gold' 
              ? 'bg-amber-400/10 border-amber-400/30 text-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.2)]' 
              : 'bg-emerald-400/10 border-emerald-400/30 text-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.2)]',
          )}
        >
          {icon}
        </span>
        <ChevronRight className="size-4 text-zinc-600 group-hover:text-white group-hover:translate-x-1 transition-all" />
      </div>
      <p className="mt-4 text-sm font-black text-white tracking-tight">{title}</p>
      <p className="text-xs text-zinc-400 mt-0.5 font-medium">{subtitle}</p>
    </motion.button>
  )
}
