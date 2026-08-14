'use client'

import { useEffect, useState } from 'react'
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
    <div className="mx-auto max-w-4xl space-y-6 pb-16 font-sans text-neutral-100 antialiased">
      
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
        <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-medium text-amber-400">
          {currentTier.name} Member
        </span>
      </div>

      {/* 2. CONSOLIDATED PORTFOLIO CARD */}
      <div className="overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900 shadow-xl">
        <div className="p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
              Total Net Portfolio Value
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-md bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-400 border border-emerald-500/20">
              <TrendingUp className="size-3.5" />
              +{(portfolioReturnPct || 18.4).toFixed(1)}% APY Avg
            </span>
          </div>

          <div>
            <div className="flex items-baseline gap-2">
              <h1 className="font-mono text-4xl sm:text-5xl font-bold tracking-tight text-white">
                ${money(portfolioValue)}
              </h1>
              <span className="font-mono text-xs font-semibold text-neutral-500">USDT</span>
            </div>
            <p className="mt-2 text-xs font-medium text-neutral-400">
              Cumulative Yield: <span className="text-emerald-400 font-semibold">+${money(totalReturnDollars, 2)} ({money(portfolioReturnPct, 1)}%)</span>
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <Button
              size="lg"
              className="h-11 rounded-xl bg-amber-400 font-bold text-neutral-950 hover:bg-amber-300 transition-colors shadow-sm"
              onClick={() => openModal('deposit')}
            >
              <ArrowDownRight className="size-4 mr-2 stroke-[2.5]" /> Deposit Capital
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="h-11 rounded-xl border-neutral-700 bg-neutral-800/80 font-semibold text-white hover:bg-neutral-800 transition-colors"
              onClick={() => openModal('withdraw')}
            >
              <ArrowUpRight className="size-4 mr-2 stroke-[2]" /> Withdraw Earnings
            </Button>
          </div>
        </div>

        {/* Integrated Asset Breakdown Row */}
        <div className="grid grid-cols-3 divide-x divide-neutral-800 border-t border-neutral-800 bg-neutral-950/80 p-4 text-center">
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
      </div>

      {/* 3. TIER STATUS BAR */}
      <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
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
      </div>

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
                <div 
                  key={h.id}
                  className="flex items-center justify-between rounded-xl border border-neutral-800 bg-neutral-900 p-4 transition-colors hover:border-neutral-700"
                >
                  <div className="space-y-0.5">
                    <p className="font-semibold text-sm text-white">{project?.name ?? 'SADC Venture Position'}</p>
                    <p className="text-xs text-neutral-400 font-mono">
                      <span className="text-amber-400 font-bold">${money(h.amount, 0)} USDT</span> &bull; {closed ? 'Matured' : 'Generating Yield'}
                    </p>
                  </div>

                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 border-neutral-700 bg-neutral-800 text-xs font-medium text-neutral-200 hover:text-white"
                    onClick={async () => {
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
                </div>
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
              <div 
                key={p.id}
                className="rounded-xl border border-neutral-800 bg-neutral-900 p-5 space-y-4 hover:border-neutral-700 transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-neutral-800 border border-neutral-700 text-amber-400">
                      <Icon className="size-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-base text-white">{p.name}</h4>
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
                    className="bg-amber-400 font-bold text-neutral-950 hover:bg-amber-300 text-xs px-4"
                    onClick={() => openModal('invest', { projectId: p.id })}
                  >
                    Deploy Capital
                  </Button>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* 6. SHORTCUT GRID */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400 px-1">
          Quick Actions
        </h3>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <ActionTile icon={<Rocket className="size-4 text-amber-400" />} label="Buy $PULSE" onClick={() => setView('sale')} />
          <ActionTile icon={<Zap className="size-4 text-emerald-400" />} label="Stake Vault" onClick={() => setView('stake')} />
          <ActionTile icon={<Radio className="size-4 text-amber-400" />} label="Signals Feed" onClick={() => setView('signals')} />
          <ActionTile icon={<ShieldCheck className="size-4 text-emerald-400" />} label="Verify KYC" onClick={() => (state.kyc === 'verified' ? setView('profile') : openModal('kyc'))} />
        </div>
      </div>

      {/* 7. REFERRAL SECTION */}
      <div className="flex items-center justify-between rounded-xl border border-neutral-800 bg-neutral-900 p-4">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Referral Access Pass</p>
          <p className="font-mono text-lg font-bold text-white mt-0.5">{state.referralCode}</p>
        </div>
        <Button
          size="sm"
          variant="outline"
          className="border-neutral-700 bg-neutral-800 text-xs font-semibold text-neutral-200 hover:text-white"
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

function ActionTile({ icon, label, onClick }: { icon: React.ReactNode; label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-3 rounded-xl border border-neutral-800 bg-neutral-900 p-3 text-left transition-colors hover:border-neutral-700 hover:bg-neutral-800/80"
    >
      <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-neutral-800 border border-neutral-700">
        {icon}
      </div>
      <span className="text-xs font-bold text-white">{label}</span>
    </button>
  )
}
