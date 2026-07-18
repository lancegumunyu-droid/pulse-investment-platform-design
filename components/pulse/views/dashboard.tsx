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

  return (
    <div className="space-y-5">
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
            className="h-11 w-full bg-gold font-semibold text-primary-foreground hover:bg-gold/90"
            onClick={() => openModal('deposit')}
          >
            <ArrowDownRight className="size-4" /> Deposit
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="h-11 w-full border-white/12 bg-white/[0.03] font-semibold"
            onClick={() => openModal('withdraw')}
          >
            <ArrowUpRight className="size-4" /> Withdraw
          </Button>
        </div>
      </Glass>

      <Glass className="animate-rise">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Current tier</p>
            <p className="mt-0.5 text-lg font-semibold">{currentTier.name}</p>
          </div>
          <Pill tone="green">{currentTier.yieldLabel}</Pill>
        </div>
        {upcoming ? (
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
          View all tiers <ChevronRight className="size-4" />
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
