'use client'

import { ArrowDownRight, ArrowUpRight, Building2, ChevronRight, Leaf, Pickaxe, Sun, TrendingUp } from 'lucide-react'
import { money, usePulse } from '../store'
import { Glass, Pill, ProgressBar, RiskNote, SectionTitle } from '../ui-bits'
import { PROJECTS, nextTier, type ProjectSector } from '@/lib/pulse-data'
import { Button } from '@/components/ui/button'

const sectorIcon: Record<ProjectSector, typeof Sun> = {
  'Renewable Energy': Sun,
  'Mining Royalties': Pickaxe,
  Agriculture: Leaf,
  Infrastructure: Building2,
}

export function DashboardView() {
  const { state, totalInvested, currentTier, portfolioValue, openModal, setView } = usePulse()
  const upcoming = nextTier(currentTier.id)
  const progress = upcoming ? Math.min(100, (totalInvested / upcoming.minInvest) * 100) : 100
  const kycVerified = state.kyc === 'verified'
  const kycNotStarted = state.kyc === 'none'

  return (
    <div className="space-y-5">
      {/* Show approval status banner if pending */}
      {kycNotStarted && (
        <div className="rounded-xl border border-yellow-500/30 bg-yellow-500/10 p-4">
          <p className="text-sm font-semibold text-yellow-500">Complete verification to unlock deposits & tiers</p>
          <p className="mt-1 text-xs text-yellow-500/80">You can view all features but deposits require KYC approval</p>
        </div>
      )}
      
      <Glass gold className="animate-rise">
        <p className="text-xs font-medium uppercase tracking-wide text-gold">Total portfolio value</p>
        <p className="mt-1 font-mono text-4xl font-semibold tracking-tight">${money(portfolioValue)}</p>
        <div className="mt-1 flex items-center gap-1.5 text-sm text-green">
          <TrendingUp className="size-4" />
          <span className="font-medium">+{money((portfolioValue / 250 - 1) * 100, 1)}%</span>
          <span className="text-muted-foreground">since you joined</span>
        </div>

        <div className="mt-5 grid grid-cols-3 gap-3">
          <MiniStat label="Cash" value={`$${money(state.cash, 0)}`} />
          <MiniStat label="Invested" value={`$${money(totalInvested, 0)}`} />
          <MiniStat label="PULSE" value={money(state.pulse + state.staked, 0)} />
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <Button
            size="lg"
            disabled={!kycVerified}
            className="h-11 w-full bg-gold font-semibold text-primary-foreground hover:bg-gold/90 disabled:opacity-50"
            onClick={() => kycVerified ? openModal('deposit') : openModal('kyc')}
            title={kycVerified ? undefined : 'Complete KYC to deposit'}
          >
            <ArrowDownRight className="size-4" /> {kycVerified ? 'Deposit' : 'Locked'}
          </Button>
          <Button
            size="lg"
            disabled={!kycVerified || state.cash === 0}
            variant="outline"
            className="h-11 w-full border-white/12 bg-white/[0.03] font-semibold disabled:opacity-50"
            onClick={() => kycVerified ? openModal('withdraw') : openModal('kyc')}
            title={kycVerified ? undefined : 'Complete KYC to withdraw'}
          >
            <ArrowUpRight className="size-4" /> {kycVerified ? 'Withdraw' : 'Locked'}
          </Button>
        </div>
      </Glass>

      <Glass className="animate-rise">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Current tier</p>
            <p className="mt-0.5 text-lg font-semibold">{kycVerified ? currentTier.name : 'Starter (Locked)'}</p>
          </div>
          <Pill tone={kycVerified ? "green" : "muted"}>{kycVerified ? currentTier.yieldLabel : 'KYC Required'}</Pill>
        </div>
        {!kycVerified ? (
          <div className="mt-4 rounded-lg border border-yellow-500/30 bg-yellow-500/10 p-3">
            <p className="text-xs text-yellow-500">Tier system is locked until you complete KYC verification</p>
          </div>
        ) : upcoming ? (
          <div className="mt-4">
            <div className="mb-1.5 flex justify-between text-xs text-muted-foreground">
              <span>Progress to {upcoming.name}</span>
              <span>${money(totalInvested, 0)} / ${money(upcoming.minInvest, 0)}</span>
            </div>
            <ProgressBar value={progress} tone="gold" />
          </div>
        ) : (
          <p className="mt-3 text-sm text-muted-foreground">You&apos;ve reached the highest tier. Thank you for building with Pulse.</p>
        )}
        <button
          onClick={() => setView('invest')}
          className="mt-4 flex w-full items-center justify-between text-sm font-medium text-gold"
        >
          {kycVerified ? 'View all tiers' : 'View tiers (read-only)'} <ChevronRight className="size-4" />
        </button>
      </Glass>

      <div>
        <SectionTitle title="Live projects" subtitle="Real SADC ventures you can hold shares in." />
        <div className="space-y-3">
          {PROJECTS.map((p) => {
            const Icon = sectorIcon[p.sector]
            const pct = Math.round((p.funded / p.goal) * 100)
            return (
              <Glass key={p.id} className="animate-rise">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <span className="flex size-10 items-center justify-center rounded-xl bg-gold-soft text-gold">
                      <Icon className="size-5" />
                    </span>
                    <div>
                      <p className="font-semibold leading-tight">{p.name}</p>
                      <p className="text-xs text-muted-foreground">{p.country} · {p.sector}</p>
                    </div>
                  </div>
                  <Pill tone="green">{p.targetYield}</Pill>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{p.summary}</p>
                <div className="mt-3">
                  <div className="mb-1.5 flex justify-between text-xs text-muted-foreground">
                    <span>{pct}% funded</span>
                    <span>${money(p.funded, 0)} / ${money(p.goal, 0)}</span>
                  </div>
                  <ProgressBar value={pct} tone="green" />
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <Pill tone={p.risk === 'Higher' ? 'danger' : p.risk === 'Moderate' ? 'gold' : 'muted'}>
                    {p.risk} risk
                  </Pill>
                  <Button
                    size="sm"
                    className="bg-gold font-semibold text-primary-foreground hover:bg-gold/90"
                    onClick={() => openModal('invest', { projectId: p.id })}
                  >
                    Invest
                  </Button>
                </div>
              </Glass>
            )
          })}
        </div>
      </div>

      <RiskNote />
    </div>
  )
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-white/[0.03] p-3">
      <p className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-1 font-mono text-sm font-semibold">{value}</p>
    </div>
  )
}
