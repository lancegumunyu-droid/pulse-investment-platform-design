'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ArrowDownRight, ArrowUpRight, Building2, ChevronRight, 
  Copy, Leaf, Pickaxe, Radio, Rocket, ShieldCheck, Sun, 
  TrendingUp, Zap, Sparkles, AlertCircle 
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

// Enhanced Stagger Animation Config
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.02,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 14 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.45,
      ease: [0.16, 1, 0.3, 1],
    },
  },
}

export function DashboardView() {
  const { state, api, totalInvested, currentTier, portfolioValue, openModal, setView, toast } = usePulse()
  const upcoming = nextTier(currentTier.id)
  const progress = upcoming ? Math.min(100, (totalInvested / upcoming.minInvest) * 100) : 100

  // Calculate dynamic performance metrics
  const initialBenchmark = 250
  const portfolioReturnPct = portfolioValue > 0 ? ((portfolioValue / initialBenchmark) - 1) * 100 : 0

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
      className="space-y-6 pb-8"
    >
      {/* Portfolio Total Hero Card */}
      <motion.div variants={itemVariants}>
        <Glass gold className="relative overflow-hidden border border-gold/30 bg-gradient-to-b from-neutral-900/90 to-black/80 backdrop-blur-2xl p-6 shadow-2xl">
          <div className="pointer-events-none absolute -right-12 -top-12 size-48 rounded-full bg-gold/15 blur-3xl" />
          <div className="pointer-events-none absolute -left-12 -bottom-12 size-48 rounded-full bg-emerald-500/10 blur-3xl" />
          
          <div className="relative z-10">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-gold">
                <Sparkles className="size-3.5" /> Total portfolio value
              </span>
              <Pill tone="gold" className="font-mono text-[11px]">{currentTier.name}</Pill>
            </div>
            
            <div className="mt-2 flex items-baseline gap-3">
              <h1 className="font-mono text-4xl sm:text-5xl font-bold tracking-tight text-white">
                ${money(portfolioValue)}
              </h1>
            </div>

            <div className="mt-2 flex items-center gap-2 text-xs sm:text-sm">
              <span className={cn(
                "inline-flex items-center gap-1 font-semibold",
                portfolioReturn >= 0 ? "text-emerald-400" : "text-rose-400"
              )}>
                {portfolioReturnPct >= 0 ? <TrendingUp className="size-4" /> : <ArrowDownRight className="size-4" />}
                {portfolioReturnPct >= 0 ? '+' : ''}{money(portfolioReturnPct, 1)}%
              </span>
              <span className="text-muted-foreground">Cumulative return since inception</span>
            </div>

            {/* Core Breakdown Mini-Stats Grid */}
            <div className="mt-5 grid grid-cols-2 gap-3">
              <MiniStat label="Available Cash" value={`$${money(state.cash, 0)}`} sub="Ready to deploy" />
              <MiniStat label="Active Principal" value={`$${money(totalInvested, 0)}`} sub="Earning yield" />
            </div>

            {/* Token Asset Pod */}
            <div className="mt-3.5 flex items-center justify-between rounded-2xl border border-gold/20 bg-white/[0.02] p-4 backdrop-blur-md">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Pulse Token Allocation</p>
                <p className="mt-0.5 font-mono text-xl font-bold text-gold">{money(state.pulse + state.staked, 0)} <span className="text-xs font-normal text-muted-foreground">PULSE</span></p>
              </div>
              <div className="text-right">
                <div className="inline-flex items-center gap-2 text-xs text-muted-foreground bg-white/[0.04] px-2.5 py-1 rounded-full border border-white/5">
                  <span className="text-white font-medium">{money(state.pulse, 0)} liquid</span>
                  <span className="h-2 w-px bg-white/10" />
                  <span className="text-gold font-medium">{money(state.staked, 0)} staked</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-5 grid grid-cols-2 gap-3">
              <motion.div whileTap={{ scale: 0.98 }}>
                <Button
                  size="lg"
                  className="h-12 w-full bg-gold font-semibold text-primary-foreground hover:bg-gold/90 shadow-lg shadow-gold/20 transition-all duration-200"
                  onClick={() => openModal('deposit')}
                >
                  <ArrowDownRight className="size-4 mr-1.5" /> Deposit Funds
                </Button>
              </motion.div>

              <motion.div whileTap={{ scale: 0.98 }}>
                <Button
                  size="lg"
                  variant="outline"
                  className="h-12 w-full border-white/15 bg-white/[0.03] font-semibold text-white hover:bg-white/[0.08] hover:border-white/30 transition-all duration-200"
                  onClick={() => openModal('withdraw')}
                >
                  <ArrowUpRight className="size-4 mr-1.5" /> Withdraw
                </Button>
              </motion.div>
            </div>
          </div>
        </Glass>
      </motion.div>

      {/* Tier Progress Card */}
      <motion.div variants={itemVariants}>
        <Glass className="border border-white/10 bg-black/40 backdrop-blur-xl p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Investor Tier Status</p>
              <p className="mt-0.5 text-lg font-semibold text-white">{currentTier.name}</p>
            </div>
            <Pill tone="green">{currentTier.yieldLabel}</Pill>
          </div>
          
          {upcoming ? (
            <div className="mt-4">
              <div className="mb-1.5 flex justify-between text-xs text-muted-foreground">
                <span>Progress to {upcoming.name}</span>
                <span className="font-mono text-gold">${money(totalInvested, 0)} / ${money(upcoming.minInvest, 0)}</span>
              </div>
              <ProgressBar value={progress} tone="gold" />
            </div>
          ) : (
            <p className="mt-3 text-sm text-muted-foreground">You have attained the highest institutional tier. Thank you for building with Pulse.</p>
          )}
          
          <motion.button
            whileHover={{ x: 2 }}
            onClick={() => setView('invest')}
            className="mt-4 flex w-full items-center justify-between text-sm font-medium text-gold hover:text-gold/80 transition-colors"
          >
            <span>Review all investor tiers & benefits</span> 
            <ChevronRight className="size-4" />
          </motion.button>
        </Glass>
      </motion.div>

      {/* Active Holdings */}
      {state.holdings.length > 0 && (
        <motion.div variants={itemVariants}>
          <SectionTitle title="Active portfolio allocations" subtitle="Your live deployed holdings. Early termination incurs a $15 administrative fee." />
          <div className="space-y-3 mt-3">
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
                    <Glass gold={!closed} className="glow-edge shimmer-sweep p-4.5 border border-white/10 bg-black/40">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-semibold text-base text-white">{project?.name ?? 'Venture Holding'}</p>
                          <div className="mt-1 flex items-center gap-2">
                            <span className="font-mono text-xs text-gold font-medium">${money(h.amount, 0)} principal</span>
                            {deadlineDate && (
                              <>
                                <span className="size-1 rounded-full bg-white/20" />
                                <span className="text-xs text-muted-foreground">
                                  {closed ? 'Matured' : 'Closes'} {deadlineDate.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                        <Pill tone={closed ? 'muted' : 'gold'}>{closed ? 'Closed' : 'Active'}</Pill>
                      </div>

                      <div className="mt-4 flex items-center justify-between pt-3 border-t border-white/5">
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <AlertCircle className="size-3.5" /> Early exit fee: $15
                        </span>
                        <motion.div whileTap={{ scale: 0.97 }}>
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-white/12 bg-white/[0.03] text-xs font-medium text-muted-foreground hover:text-white hover:border-white/20 transition-all"
                            onClick={async () => {
                              const res = await api.closeInvestment(h.id)
                              if (res.ok) {
                                toast({ title: 'Holding liquidated', description: '$15 fee applied, balance returned to available cash.', variant: 'info' })
                              } else {
                                toast({ title: 'Liquidation failed', description: res.error, variant: 'error' })
                              }
                            }}
                          >
                            Close position
                          </Button>
                        </motion.div>
                      </div>
                    </Glass>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </div>
        </motion.div>
      )}

      {/* Live Projects Feed */}
      <motion.div variants={itemVariants}>
        <SectionTitle title="Live SADC opportunities" subtitle="Institutional-grade regional ventures available for capital deployment." />
        <div className="space-y-3.5 mt-3">
          {PROJECTS.map((p) => {
            const Icon = sectorIcon[p.sector] || Building2
            const funded = liveFunding ? p.funded + (liveFunding[p.id] ?? 0) : p.funded
            const pct = Math.min(100, Math.round((funded / p.goal) * 100))
            
            return (
              <Glass key={p.id} className="glow-edge shimmer-sweep p-5 border border-white/10 bg-black/40 backdrop-blur-xl">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3.5">
                    <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-gold/10 text-gold border border-gold/20 shadow-inner">
                      <Icon className="size-5" />
                    </span>
                    <div>
                      <p className="font-semibold text-base text-white">{p.name}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{p.country} &bull; <span className="text-white/80">{p.sector}</span></p>
                    </div>
                  </div>
                  <Pill tone="green" className="font-mono">{p.targetYield}</Pill>
                </div>

                <p className="mt-3.5 text-sm leading-relaxed text-muted-foreground">{p.summary}</p>
                
                <div className="mt-4">
                  <div className="mb-1.5 flex justify-between text-xs">
                    <span className="text-gold font-medium">{pct}% funded</span>
                    <span className="font-mono text-muted-foreground">${money(funded, 0)} / ${money(p.goal, 0)}</span>
                  </div>
                  <ProgressBar value={pct} tone="green" />
                </div>

                <div className="mt-4 pt-3.5 flex items-center justify-between border-t border-white/5">
                  <Pill tone={p.risk === 'Higher' ? 'danger' : p.risk === 'Moderate' ? 'gold' : 'muted'}>
                    {p.risk} Risk Profile
                  </Pill>
                  <motion.div whileTap={{ scale: 0.95 }}>
                    <Button
                      size="sm"
                      className="bg-gold font-semibold text-primary-foreground hover:bg-gold/90 shadow-md shadow-gold/15 transition-all px-4"
                      onClick={() => openModal('invest', { projectId: p.id })}
                    >
                      Deploy Capital
                    </Button>
                  </motion.div>
                </div>
              </Glass>
            )
          })}
        </div>
      </motion.div>

      {/* Quick Action Tiles Grid */}
      <motion.div variants={itemVariants}>
        <SectionTitle title="Quick actions" />
        <div className="grid grid-cols-2 gap-3 mt-3">
          <QuickActionTile
            icon={<Rocket className="size-5" />}
            tone="gold"
            title="Buy $PULSE"
            subtitle="Private syndicate sale"
            onClick={() => setView('sale')}
          />
          <QuickActionTile
            icon={<Zap className="size-5" />}
            tone="green"
            title="Stake Tokens"
            subtitle="24.8% APY yield"
            onClick={() => setView('stake')}
          />
          <QuickActionTile
            icon={<Radio className="size-5" />}
            tone="gold"
            title="Market Signals"
            subtitle="Live intelligence feed"
            onClick={() => setView('signals')}
          />
          <QuickActionTile
            icon={<ShieldCheck className="size-5" />}
            tone="green"
            title="Verify KYC"
            subtitle={state.kyc === 'verified' ? 'Fully verified' : 'Unlock full limits'}
            onClick={() => (state.kyc === 'verified' ? setView('profile') : openModal('kyc'))}
          />
        </div>
      </motion.div>

      {/* Referral Banner */}
      <motion.div variants={itemVariants}>
        <Glass className="p-5 border border-white/10 bg-black/40 backdrop-blur-xl">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium">Syndicate Referral Code</p>
              <p className="mt-1 font-mono text-xl font-bold text-gold tracking-wider">{state.referralCode}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{state.referralCount} active referrals &bull; Accelerate tier bonuses</p>
            </div>
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => {
                navigator.clipboard?.writeText(state.referralCode)
                toast({ title: 'Referral code copied to clipboard', variant: 'info' })
              }}
              className="flex size-11 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.05] text-muted-foreground transition-all hover:bg-gold/20 hover:text-gold hover:border-gold/30 shadow-inner"
              aria-label="Copy referral code"
            >
              <Copy className="size-4" />
            </motion.button>
          </div>
        </Glass>
      </motion.div>

      <motion.div variants={itemVariants}>
        <RiskNote />
      </motion.div>
    </motion.div>
  )
}

function QuickActionTile({
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
      whileHover={{ y: -2, backgroundColor: 'rgba(255, 255, 255, 0.05)', borderColor: 'rgba(255, 255, 255, 0.15)' }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className="flex flex-col rounded-2xl border border-white/10 bg-black/30 backdrop-blur-md p-4 text-left transition-all group"
    >
      <div className="flex items-center justify-between w-full">
        <span
          className={cn(
            'flex size-10 items-center justify-center rounded-xl border shadow-inner transition-transform group-hover:scale-105',
            tone === 'gold' 
              ? 'bg-gold/10 border-gold/20 text-gold' 
              : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
          )}
        >
          {icon}
        </span>
        <ChevronRight className="size-4 text-muted-foreground group-hover:text-white transition-colors" />
      </div>
      <p className="mt-3.5 text-sm font-semibold text-white tracking-tight">{title}</p>
      <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>
    </motion.button>
  )
}

function MiniStat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-3.5 backdrop-blur-sm">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="mt-1 font-mono text-base font-bold text-white tracking-tight">{value}</p>
      {sub && <p className="mt-0.5 font-mono text-[10px] text-muted-foreground/80">{sub}</p>}
    </div>
  )
}
