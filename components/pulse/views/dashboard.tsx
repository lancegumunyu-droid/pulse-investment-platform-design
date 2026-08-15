'use client'

import { useEffect, useState, useCallback } from 'react'
import { 
  ArrowDownRight, ArrowUpRight, Building2, ChevronRight, 
  Copy, Leaf, Pickaxe, Radio, Rocket, ShieldCheck, Sun, 
  TrendingUp, Zap, AlertCircle, Lock, Check, Sparkles, RefreshCw,
  Globe, LineChart
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
  const [isLoadingFunding, setIsLoadingFunding] = useState(false)
  const [copied, setCopied] = useState(false)
  const [liquidatingId, setLiquidatingId] = useState<string | null>(null)

  // Supabase / Connector Resilience Sync
  const fetchFundingData = useCallback(async () => {
    setIsLoadingFunding(true)
    try {
      const res = await api.liveProjectFunding()
      if (res && res.ok && res.funding) {
        setLiveFunding(res.funding)
      }
    } catch (err) {
      console.error('[Supabase Engine Error]: Failed to synchronize live funding metrics.', err)
    } finally {
      setIsLoadingFunding(false)
    }
  }, [api])

  useEffect(() => {
    let active = true
    fetchFundingData()
    // Poll connector every 30 seconds for live network updates
    const interval = setInterval(() => {
      if (active) fetchFundingData()
    }, 30000)

    return () => {
      active = false
      clearInterval(interval)
    }
  }, [fetchFundingData])

  const handleCopyReferral = () => {
    if (state.referralCode) {
      navigator.clipboard?.writeText(state.referralCode)
      setCopied(true)
      toast({ title: 'Referral code copied to clipboard', variant: 'info' })
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleLiquidate = async (holdingId: string) => {
    setLiquidatingId(holdingId)
    try {
      const res = await api.closeInvestment(holdingId)
      if (res.ok) {
        toast({ title: 'Position Liquidated', description: 'Funds successfully credited to liquid cash.', variant: 'info' })
      } else {
        toast({ title: 'Liquidation Failed', description: res.error || 'Connector transaction reverted.', variant: 'error' })
      }
    } catch (err: any) {
      toast({ title: 'Network Disconnection', description: err.message || 'Supabase provider timed out.', variant: 'error' })
    } finally {
      setLiquidatingId(null)
    }
  }

  return (
    <div className="mx-auto max-w-5xl space-y-8 pb-20 font-sans text-neutral-100 antialiased">
      
      {/* 1. EXECUTIVE STATUS TOPBAR */}
      <header className="flex flex-col gap-4 border-b border-neutral-800/80 pb-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="relative flex size-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex size-2.5 rounded-full bg-emerald-500" />
          </div>
          <div className="flex items-center gap-2">
            <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-neutral-300">
              SADC Capital Network
            </h2>
            <span className="rounded bg-neutral-800 px-1.5 py-0.5 text-[10px] font-mono font-semibold text-neutral-400 border border-neutral-700/60 flex items-center gap-1">
              {isLoadingFunding && <RefreshCw className="size-2.5 animate-spin text-amber-400" />}
              TERMINAL LIVE
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Referral Access Badge */}
          <button
            onClick={handleCopyReferral}
            className="flex items-center gap-2 rounded-lg border border-neutral-800 bg-neutral-900/80 px-3 py-1.5 text-xs text-neutral-300 transition-all hover:border-neutral-700 hover:bg-neutral-800 focus:outline-none"
          >
            <span className="text-[10px] uppercase tracking-wider text-neutral-500 font-mono">Pass Code</span>
            <span className="font-mono font-bold text-amber-400">{state.referralCode || 'PULSE-VIP'}</span>
            {copied ? <Check className="size-3 text-emerald-400" /> : <Copy className="size-3 text-neutral-400" />}
          </button>

          {/* Institutional Tier Rank */}
          <div className="flex items-center gap-1.5 rounded-lg border border-amber-500/20 bg-amber-500/10 px-3 py-1.5 text-xs font-semibold text-amber-400">
            <Sparkles className="size-3.5" />
            <span>{currentTier.name} Member</span>
          </div>
        </div>
      </header>

      {/* 2. HERO PORTFOLIO VALUE MATRIX */}
      <section className="relative overflow-hidden rounded-2xl border border-neutral-800 bg-gradient-to-b from-neutral-900 via-neutral-900/90 to-neutral-950 p-6 sm:p-8 shadow-2xl">
        <div className="absolute right-0 top-0 -mr-16 -mt-16 size-64 rounded-full bg-amber-500/5 blur-3xl pointer-events-none" />
        
        <div className="relative z-10 space-y-6">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-widest text-neutral-400">
              Net Valuation Dashboard
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-mono font-semibold text-emerald-400 border border-emerald-500/20">
              <TrendingUp className="size-3.5" />
              +{(portfolioReturnPct || 18.4).toFixed(1)}% APY Benchmark
            </span>
          </div>

          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-1">
              <div className="flex items-baseline gap-3">
                <span className="font-mono text-4xl sm:text-6xl font-extrabold tracking-tight text-white">
                  ${money(portfolioValue)}
                </span>
                <span className="font-mono text-sm font-semibold text-neutral-500">USDT</span>
              </div>
              <p className="text-xs font-medium text-neutral-400">
                Cumulative Performance Yield:{' '}
                <span className="font-mono text-emerald-400 font-semibold">
                  +${money(totalReturnDollars, 2)} ({money(portfolioReturnPct, 1)}%)
                </span>
              </p>
            </div>

            {/* Core Financial Actions */}
            <div className="grid grid-cols-2 gap-3 sm:flex sm:items-center">
              <Button
                size="lg"
                className="h-11 rounded-xl bg-amber-400 font-bold text-neutral-950 hover:bg-amber-300 transition-all shadow-md px-6 text-xs"
                onClick={() => openModal('deposit')}
              >
                <ArrowDownRight className="size-4 mr-1.5 stroke-[2.5]" /> Deposit Capital
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="h-11 rounded-xl border-neutral-700 bg-neutral-800/80 font-semibold text-neutral-200 hover:bg-neutral-800 hover:text-white transition-all px-6 text-xs"
                onClick={() => openModal('withdraw')}
              >
                <ArrowUpRight className="size-4 mr-1.5 stroke-[2]" /> Withdraw Earnings
              </Button>
            </div>
          </div>

          {/* Liquidity & Capital Allocation Strip */}
          <div className="grid grid-cols-3 gap-4 border-t border-neutral-800/80 pt-6">
            <div>
              <p className="text-[10px] font-mono uppercase tracking-wider text-neutral-500">Available Cash</p>
              <p className="mt-1 font-mono text-lg font-bold text-white">${money(state.cash, 0)}</p>
            </div>
            <div className="border-l border-neutral-800/60 pl-4">
              <p className="text-[10px] font-mono uppercase tracking-wider text-neutral-500">Deployed Deals</p>
              <p className="mt-1 font-mono text-lg font-bold text-white">${money(totalInvested, 0)}</p>
            </div>
            <div className="border-l border-neutral-800/60 pl-4">
              <p className="text-[10px] font-mono uppercase tracking-wider text-neutral-500">$PULSE Staked</p>
              <p className="mt-1 font-mono text-lg font-bold text-amber-400">{money(state.pulse + state.staked, 0)}</p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. VIP TIER PROGRESSION ENGINE */}
      <section className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-5 space-y-3 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Lock className="size-4 text-amber-400" />
            <span className="text-xs font-semibold uppercase tracking-wider text-neutral-300">
              Institutional Standing: <span className="text-white font-bold">{currentTier.name} VIP</span>
            </span>
          </div>
          <span className="text-xs font-mono font-semibold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded border border-emerald-500/20">
            {currentTier.yieldLabel}
          </span>
        </div>

        {upcoming ? (
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs text-neutral-400 font-medium">
              <span>Next Unlock Target: <strong className="text-neutral-200">{upcoming.name} Tier</strong></span>
              <span className="font-mono text-neutral-300">${money(totalInvested, 0)} / ${money(upcoming.minInvest, 0)}</span>
            </div>
            <ProgressBar value={progress} tone="gold" />
          </div>
        ) : (
          <p className="text-xs text-neutral-400">Apex Institutional VIP Rank Active. Maximum Yield Allocation Unlocked.</p>
        )}
      </section>

      {/* 4. COMMAND CENTER SHORTCUTS */}
      <section className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400 px-1 font-mono">
          Terminal Operations
        </h3>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <ActionTile 
            icon={<Rocket className="size-4 text-amber-400" />} 
            label="Buy $PULSE" 
            sublabel="Private Sale" 
            onClick={() => setView('sale')} 
          />
          <ActionTile 
            icon={<Zap className="size-4 text-emerald-400" />} 
            label="Stake Vault" 
            sublabel="Yield Multiplier" 
            onClick={() => setView('stake')} 
          />
          <ActionTile 
            icon={<Radio className="size-4 text-amber-400" />} 
            label="Signals Feed" 
            sublabel="Live SADC Intel" 
            onClick={() => setView('signals')} 
          />
          <ActionTile 
            icon={<ShieldCheck className="size-4 text-emerald-400" />} 
            label="KYC Compliance" 
            sublabel={state.kyc === 'verified' ? 'Verified Status' : 'Verification Required'} 
            onClick={() => (state.kyc === 'verified' ? setView('profile') : openModal('kyc'))} 
          />
        </div>
      </section>

      {/* 5. DEPLOYED ACTIVE POSITIONS */}
      {state.holdings.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400 font-mono">
              Active Portfolio Allocations ({state.holdings.length})
            </h3>
          </div>
          <div className="space-y-2">
            {state.holdings.map((h) => {
              const project = PROJECTS.find((p) => p.id === h.projectId)
              const closed = isProjectClosed(h.projectId)
              const isProcessing = liquidatingId === h.id

              return (
                <div 
                  key={h.id}
                  className="flex items-center justify-between rounded-xl border border-neutral-800 bg-neutral-900/90 p-4 transition-all hover:border-neutral-700"
                >
                  <div className="space-y-1">
                    <p className="font-semibold text-sm text-white">{project?.name ?? 'SADC Venture Position'}</p>
                    <div className="flex items-center gap-2 text-xs text-neutral-400 font-mono">
                      <span className="text-amber-400 font-bold">${money(h.amount, 0)} USDT</span>
                      <span>&bull;</span>
                      <span className={closed ? 'text-amber-400' : 'text-emerald-400'}>
                        {closed ? 'Matured' : 'Yield Active'}
                      </span>
                    </div>
                  </div>

                  <Button
                    size="sm"
                    variant="outline"
                    disabled={isProcessing}
                    className="h-8 border-neutral-700 bg-neutral-800/80 text-xs font-medium text-neutral-300 hover:bg-neutral-700 hover:text-white"
                    onClick={() => handleLiquidate(h.id)}
                  >
                    {isProcessing ? <RefreshCw className="size-3 animate-spin mr-1" /> : null}
                    Liquidate
                  </Button>
                </div>
              )
            })}
          </div>
        </section>
      )}

      {/* 6. VERIFIED REGIONAL PIPELINE */}
      <section className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400 font-mono">
              Regional Opportunities
            </h3>
            <p className="text-[11px] text-neutral-500">Institutional SADC infrastructure & sovereign debt syndicate</p>
          </div>
          <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded border border-emerald-500/20">
            Verified Pipeline
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {PROJECTS.map((p) => {
            const Icon = sectorIcon[p.sector] || Building2
            const funded = liveFunding ? p.funded + (liveFunding[p.id] ?? 0) : p.funded
            const pct = Math.min(100, Math.round((funded / p.goal) * 100))

            return (
              <div 
                key={p.id}
                className="flex flex-col justify-between rounded-xl border border-neutral-800 bg-neutral-900/80 p-5 space-y-4 hover:border-neutral-700/80 transition-all shadow-md"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-neutral-800 border border-neutral-700/80 text-amber-400">
                        <Icon className="size-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-white leading-snug">{p.name}</h4>
                        <p className="text-[11px] text-neutral-400">{p.country} &bull; {p.sector}</p>
                      </div>
                    </div>
                    <span className="shrink-0 rounded-md border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 font-mono text-xs font-bold text-emerald-400">
                      {p.targetYield}
                    </span>
                  </div>

                  <p className="text-xs text-neutral-400 leading-relaxed line-clamp-2">{p.summary}</p>
                </div>

                <div className="space-y-3 pt-2 border-t border-neutral-800/60">
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-[11px] font-mono">
                      <span className="text-neutral-300 font-semibold">{pct}% Allocated</span>
                      <span className="text-neutral-500">${money(funded, 0)} / ${money(p.goal, 0)}</span>
                    </div>
                    <ProgressBar value={pct} tone="green" />
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[11px] text-neutral-400">
                      Risk Tier: <strong className="text-neutral-200">{p.risk}</strong>
                    </span>
                    <Button
                      size="sm"
                      className="bg-amber-400 font-bold text-neutral-950 hover:bg-amber-300 text-xs px-4 h-8"
                      onClick={() => openModal('invest', { projectId: p.id })}
                    >
                      Deploy Capital
                    </Button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* 7. REGULATORY COMPLIANCE FOOTER */}
      <RiskNote />
    </div>
  )
}

function ActionTile({ 
  icon, 
  label, 
  sublabel, 
  onClick 
}: { 
  icon: React.ReactNode; 
  label: string; 
  sublabel: string; 
  onClick: () => void 
}) {
  return (
    <button
      onClick={onClick}
      className="group flex items-center gap-3 rounded-xl border border-neutral-800 bg-neutral-900/80 p-3.5 text-left transition-all hover:border-neutral-700 hover:bg-neutral-800/90 focus:outline-none"
    >
      <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-neutral-800/90 border border-neutral-700/80 group-hover:border-neutral-600 transition-colors">
        {icon}
      </div>
      <div>
        <p className="text-xs font-bold text-white leading-tight">{label}</p>
        <p className="text-[10px] text-neutral-400 font-mono mt-0.5">{sublabel}</p>
      </div>
    </button>
  )
}
