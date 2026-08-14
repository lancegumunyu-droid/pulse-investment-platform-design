'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowDownRight, ArrowUpRight, Building2, ChevronRight, Copy, Leaf, Pickaxe, Radio, Rocket, ShieldCheck, Sun, TrendingUp, Zap } from 'lucide-react'
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

// Stagger animation container config
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0.22, 1, 0.36, 1],
    },
  },
}

export function DashboardView() {
  const { state, api, totalInvested, currentTier, portfolioValue, openModal, setView, toast } = usePulse()
  const upcoming = nextTier(currentTier.id)
  const progress = upcoming ? Math.min(100, (totalInvested / upcoming.minInvest) * 100) : 100

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
      className="space-y-5"
    >
      {/* Portfolio Total Hero Card */}
      <motion.div variants={itemVariants}>
        <Glass gold className="relative overflow-hidden border border-gold/20 bg-black/40 backdrop-blur-xl p-5 shadow-2xl">
          <div className="pointer-events-none absolute -right-10 -top-10 size-40 rounded-full bg-gold/10 blur-2xl" />
          
          <p className="text-xs font-medium uppercase tracking-wide text-gold">Total portfolio value</p>
          <p className="mt-1 font-mono text-4xl font-semibold tracking-tight text-white">${money(portfolioValue)}</p>
          <div className="mt-1 flex items-center gap-1.5 text-sm text-green">
            <TrendingUp className="size-4" />
            <span className="font-medium">+{money((portfolioValue / 250 - 1) * 100, 1)}%</span>
            <span className="text-muted-foreground">since you joined</span>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3">
            <MiniStat label="Cash" value={`$${money(state.cash, 0)}`} />
            <MiniStat label="Invested" value={`$${money(totalInvested, 0)}`} />
          </div>

          <div className="mt-3 rounded-2xl border border-gold/15 bg-white/[0.03] p-3.5 backdrop-blur-md">
            <div className="flex items-center justify-between">
              <p className="text-[10px] uppercase tracking-wide text-muted-foreground">PULSE token</p>
              <p className="font-mono text-lg font-semibold text-gold">{money(state.pulse + state.staked, 0)}</p>
            </div>
            <div className="mt-2 flex items-center gap-4 text-xs text-muted-foreground">
              <span>{money(state.pulse, 0)} liquid</span>
              <span className="h-3 w-px bg-white/10" />
              <span className="text-gold/90">{money(state.staked, 0)} staked</span>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3">
            <motion.div whileTap={{ scale: 0.98 }}>
              <Button
                size="lg"
                className="h-11 w-full bg-gold font-semibold text-primary-foreground hover:bg-gold/90 shadow-lg shadow-gold/15 transition-all"
                onClick={() => openModal('deposit')}
              >
                <ArrowDownRight className="size-4 mr-1" /> Deposit
              </Button>
            </motion.div>

            <motion.div whileTap={{ scale: 0.98 }}>
              <Button
                size="lg"
                variant="outline"
                className="h-11 w-full border-white/12 bg-white/[0.03] font-semibold text-white hover:bg-white/[0.08] transition-all"
                onClick={() => openModal('withdraw')}
              >
                <ArrowUpRight className="size-4 mr-1" /> Withdraw
              </Button>
            </motion.div>
          </div>
        </Glass>
      </motion.div>

      {/* Tier Progress Card */}
      <motion.div variants={itemVariants}>
        <Glass className="border border-white/10 bg-black/40 backdrop-blur-xl p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Current tier</p>
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
            <p className="mt-3 text-sm text-muted-foreground">You&apos;ve reached the highest tier. Thank you for building with Pulse.</p>
          )}
          <motion.button
            whileHover={{ x: 2 }}
            onClick={() => setView('invest')}
            className="mt-4 flex w-full items-center justify-between text-sm font-medium text-gold hover:underline"
          >
            View all tiers <ChevronRight className="size-4" />
          </motion.button>
        </Glass>
      </motion.div>

      {/* Active Holdings */}
      {state.holdings.length > 0 && (
        <motion.div variants={itemVariants}>
          <SectionTitle title="My investments" subtitle="Your active holdings. Closing early applies a $15 fee." />
          <div className="space-y-3 mt-2">
            <AnimatePresence>
              {state.holdings.map((h) => {
                const project = PROJECTS.find((p) => p.id === h.projectId)
                const closed = isProjectClosed(h.projectId)
                return (
                  <motion.div
                    key={h.id}
                    layout
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                  >
                    <Glass gold={!closed} className="glow-edge shimmer-sweep p-4 border border-white/10 bg-black/40">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold leading-tight text-white">{project?.name ?? 'Project'}</p>
                          <p className="text-xs text-muted-foreground">${money(h.amount, 0)} invested</p>
                          {PROJECT_DEADLINES[h.projectId] && (
                            <p className="mt-0.5 text-[11px] text-muted-foreground">
                              {closed ? 'Closed' : 'Closes'} {new Date(PROJECT_DEADLINES[h.projectId]).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}
                            </p>
                          )}
                        </div>
                        <Pill tone={closed ? 'muted' : 'gold'}>{closed ? 'Closed' : 'Open'}</Pill>
                      </div>
                      <motion.div whileTap={{ scale: 0.98 }}>
                        <Button
                          size="sm"
                          variant="outline"
                          className="mt-3 w-full border-white/12 bg-white/[0.03] text-xs font-medium text-muted-foreground hover:text-white transition-all"
                          onClick={async () => {
                            const res = await api.closeInvestment(h.id)
                            if (res.ok) toast({ title: 'Investment closed', description: '$15 fee applied, remainder refunded to cash.', variant: 'info' })
                            else toast({ title: 'Could not close investment', description: res.error, variant: 'error' })
                          }}
                        >
                          Close early ($15 fee)
                        </Button>
                      </motion.div>
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
        <SectionTitle title="Live projects" subtitle="Real SADC ventures you can hold shares in." />
        <div className="space-y-3 mt-2">
          {PROJECTS.map((p) => {
            const Icon = sectorIcon[p.sector]
            const funded = liveFunding ? p.funded + (liveFunding[p.id] ?? 0) : p.funded
            const pct = Math.min(100, Math.round((funded / p.goal) * 100))
            return (
              <Glass key={p.id} className="glow-edge shimmer-sweep p-4 border border-white/10 bg-black/40 backdrop-blur-xl">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <span className="flex size-10 items-center justify-center rounded-xl bg-gold/10 text-gold border border-gold/20">
                      <Icon className="size-5" />
                    </span>
                    <div>
                      <p className="font-semibold leading-tight text-white">{p.name}</p>
                      <p className="text-xs text-muted-foreground">{p.country} · {p.sector}</p>
                    </div>
                  </div>
                  <Pill tone="green">{p.targetYield}</Pill>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{p.summary}</p>
                <div className="mt-3">
                  <div className="mb-1.5 flex justify-between text-xs text-muted-foreground">
                    <span className="text-gold font-medium">{pct}% funded</span>
                    <span className="font-mono">${money(funded, 0)} / ${money(p.goal, 0)}</span>
                  </div>
                  <ProgressBar value={pct} tone="green" />
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <Pill tone={p.risk === 'Higher' ? 'danger' : p.risk === 'Moderate' ? 'gold' : 'muted'}>
                    {p.risk} risk
                  </Pill>
                  <motion.div whileTap={{ scale: 0.95 }}>
                    <Button
                      size="sm"
                      className="bg-gold font-semibold text-primary-foreground hover:bg-gold/90 shadow-md shadow-gold/10 transition-all"
                      onClick={() => openModal('invest', { projectId: p.id })}
                    >
                      Invest
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
        <div className="grid grid-cols-2 gap-3 mt-2">
          <QuickActionTile
            icon={<Rocket className="size-5" />}
            tone="gold"
            title="Buy $PULSE"
            subtitle="Private sale"
            onClick={() => setView('sale')}
          />
          <QuickActionTile
            icon={<Zap className="size-5" />}
            tone="green"
            title="Stake"
            subtitle="24.8% APY"
            onClick={() => setView('stake')}
          />
          <QuickActionTile
            icon={<Radio className="size-5" />}
            tone="gold"
            title="Signals"
            subtitle="Live deals"
            onClick={() => setView('signals')}
          />
          <QuickActionTile
            icon={<ShieldCheck className="size-5" />}
            tone="green"
            title="Verify KYC"
            subtitle={state.kyc === 'verified' ? 'Verified' : 'Get access'}
            onClick={() => (state.kyc === 'verified' ? setView('profile') : openModal('kyc'))}
          />
        </div>
      </motion.div>

      {/* Referral Banner */}
      <motion.div variants={itemVariants}>
        <Glass className="p-4 border border-white/10 bg-black/40 backdrop-blur-xl">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Your referral code</p>
          <div className="mt-1.5 flex items-center justify-between gap-3">
            <div>
              <p className="font-mono text-lg font-semibold text-gold tracking-wider">{state.referralCode}</p>
              <p className="text-xs text-muted-foreground">{state.referralCount} referrals · Unlock higher tiers</p>
            </div>
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => {
                navigator.clipboard?.writeText(state.referralCode)
                toast({ title: 'Referral code copied', variant: 'info' })
              }}
              className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.05] text-muted-foreground transition-all hover:bg-gold/20 hover:text-gold"
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
      whileHover={{ y: -2, backgroundColor: 'rgba(255, 255, 255, 0.06)' }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className="flex flex-col rounded-2xl border border-white/10 bg-black/30 backdrop-blur-md p-4 text-left transition-all"
    >
      <div className="flex items-center justify-between w-full">
        <span
          className={cn(
            'flex size-9 items-center justify-center rounded-xl border',
            tone === 'gold' 
              ? 'bg-gold/10 border-gold/20 text-gold' 
              : 'bg-green/10 border-green/20 text-green',
          )}
        >
          {icon}
        </span>
        <ChevronRight className="size-4 text-muted-foreground" />
      </div>
      <p className="mt-3 text-sm font-semibold text-white">{title}</p>
      <p className="text-xs text-muted-foreground">{subtitle}</p>
    </motion.button>
  )
}

function MiniStat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-3 backdrop-blur-sm">
      <p className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-1 font-mono text-sm font-semibold text-white">{value}</p>
      {sub && <p className="mt-0.5 font-mono text-[10px] text-muted-foreground">{sub}</p>}
    </div>
  )
}
