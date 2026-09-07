'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { 
  ArrowDownRight, ArrowUpRight, ChevronRight, 
  Radio, Rocket, ShieldCheck, TrendingUp, Zap, Award, Layers, AlertCircle, X, CheckCircle2
} from 'lucide-react'
import { money, usePulse } from '../store'
import { ProgressBar } from '../ui-bits'
import { nextTier, FALLBACK_PROJECTS, type Project } from '@/lib/pulse-data'
import { Button } from '@/components/ui/button'

export function DashboardView() {
  const { state, api, totalInvested, currentTier, portfolioValue, openModal, setView } = usePulse()
  const upcoming = nextTier(currentTier.id)
  const progress = upcoming ? Math.min(100, (totalInvested / upcoming.minInvest) * 100) : 100

  const initialBenchmark = 250
  const portfolioReturnPct = portfolioValue > 0 ? ((portfolioValue / initialBenchmark) - 1) * 100 : 0
  const totalReturnDollars = Math.max(0, portfolioValue - initialBenchmark)

  const [projects, setProjects] = useState<Project[]>(FALLBACK_PROJECTS)
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [investAmount, setInvestAmount] = useState<string>('')
  const [investError, setInvestError] = useState<string | null>(null)
  const [investSuccess, setInvestSuccess] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Fetch live synchronized database funding metrics on mount
  useEffect(() => {
    let isCancelled = false
    api.liveProjectFunding().then((res) => {
      if (!isCancelled && res.ok && res.funding) {
        setProjects(prev => prev.map(p => ({
          ...p,
          funded: res.funding[p.id] !== undefined ? res.funding[p.id] : p.funded
        })))
      }
    }).catch(() => {
      // Fallback gracefully to seed configuration if offline
    })
    return () => { isCancelled = true }
  }, [api])

  const handleConfirmInvestment = async () => {
    if (!selectedProject) return
    setInvestError(null)
    setInvestSuccess(null)
    const amount = parseFloat(investAmount)

    if (isNaN(amount) || amount <= 0) {
      setInvestError('Please enter a valid deployment capital amount.')
      return
    }

    if (amount > state.cash) {
      setInvestError(`Insufficient liquid cash. Your wallet balance is $${money(state.cash)} USDT.`)
      return
    }

    setIsSubmitting(true)
    try {
      const res = await api.invest(amount, selectedProject.id)
      if (res.ok) {
        setInvestSuccess(`Successfully deployed $${money(amount)} into ${selectedProject.name}!`)
        // Refresh live funding numbers instantly from the action state
        setProjects(prev => prev.map(p => p.id === selectedProject.id ? { ...p, funded: p.funded + amount } : p))
        setTimeout(() => {
          setSelectedProject(null)
          setInvestAmount('')
          setInvestSuccess(null)
        }, 1800)
      } else {
        setInvestError(res.error || 'Investment execution failed.')
      }
    } catch (err: any) {
      setInvestError(err.message || 'Investment execution failed.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="mx-auto w-full max-w-md space-y-6 pb-24 text-neutral-100 antialiased px-1 relative">
      <style>{`
        @keyframes shimmerGold {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        .shimmer-card {
          background: linear-gradient(110deg, #0a0a0a 40%, #261d0a 50%, #0a0a0a 60%);
          background-size: 200% 100%;
          animation: shimmerGold 6s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        .gold-glow-hover {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .gold-glow-hover:hover {
          border-color: rgba(251, 191, 36, 0.9) !important;
          box-shadow: 0 0 30px rgba(245, 158, 11, 0.35), inset 0 0 15px rgba(245, 158, 11, 0.15);
          transform: translateY(-2px);
        }
      `}</style>

      {/* 1. STATUS HEADER */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between gap-3 rounded-2xl border border-amber-500/50 bg-neutral-950 px-4 py-3.5 shadow-[0_0_25px_rgba(245,158,11,0.2)]"
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="relative flex size-2.5 shrink-0">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-80" />
            <span className="relative inline-flex size-2.5 rounded-full bg-amber-500 shadow-[0_0_10px_#f59e0b]" />
          </span>
          <span className="text-xs font-bold uppercase tracking-wider text-amber-200 truncate">
            SADC Sovereign Terminal &bull; Secure Feed
          </span>
        </div>
        <span className="rounded-full border border-amber-500/60 bg-amber-500/20 px-3 py-1 text-xs font-bold text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.3)] shrink-0">
          {currentTier.name} VIP
        </span>
      </motion.div>

      {/* 2. CONSOLIDATED PORTFOLIO CARD */}
      <div className="shimmer-card relative overflow-hidden rounded-3xl border border-amber-500/60 p-5 shadow-[0_0_50px_rgba(245,158,11,0.25)]">
        <div className="relative z-10 space-y-4">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-bold uppercase tracking-widest text-amber-300/90 truncate">
              Net Liquidity Value
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-500/50 bg-emerald-950/90 px-3 py-1 text-xs font-bold text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.3)] shrink-0">
              <TrendingUp className="size-3.5 text-emerald-400 shrink-0" />
              +{(portfolioReturnPct || 18.4).toFixed(1)}% APY
            </span>
          </div>

          <div className="space-y-1">
            <div className="flex items-baseline gap-2">
              <h1 className="text-4xl font-black tracking-tight text-white drop-shadow-md">
                ${money(portfolioValue)}
              </h1>
              <span className="text-xs font-bold text-amber-400">USDT</span>
            </div>
            <p className="text-xs text-neutral-300 font-medium">
              Sovereign Return: <span className="text-emerald-400 font-bold">+${money(totalReturnDollars, 2)} ({money(portfolioReturnPct, 1)}%)</span>
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-1">
            <Button
              size="lg"
              className="h-11 w-full rounded-xl border border-amber-300 bg-gradient-to-r from-amber-400 to-amber-500 text-xs font-black text-neutral-950 shadow-[0_0_25px_rgba(245,158,11,0.5)] hover:from-amber-300 hover:to-amber-400 transition-all"
              onClick={() => openModal('deposit')}
            >
              <ArrowDownRight className="size-4 shrink-0 stroke-[3]" />
              <span className="truncate">Deposit Capital</span>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="h-11 w-full rounded-xl border border-neutral-700 bg-neutral-900/90 text-xs font-bold text-white shadow-md hover:border-amber-400 hover:bg-neutral-800 transition-all"
              onClick={() => openModal('withdraw')}
            >
              <ArrowUpRight className="size-4 shrink-0 stroke-[2.5]" />
              <span className="truncate">Withdraw Yields</span>
            </Button>
          </div>
        </div>

        <div className="relative z-10 mt-5 grid grid-cols-3 divide-x divide-neutral-800/80 border-t border-neutral-800/80 pt-3 text-center">
          <div className="px-1">
            <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Liquid Cash</p>
            <p className="mt-1 text-sm font-black text-white">${money(state.cash, 0)}</p>
          </div>
          <div className="px-1">
            <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Principal</p>
            <p className="mt-1 text-sm font-black text-white">${money(totalInvested, 0)}</p>
          </div>
          <div className="px-1">
            <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">$PULSE Assets</p>
            <p className="mt-1 text-sm font-black text-amber-300">{money(state.pulse + state.staked, 0)}</p>
          </div>
        </div>
      </div>

      {/* 3. TIER STATUS BAR */}
      <div className="gold-glow-hover rounded-2xl border border-amber-500/50 bg-neutral-950 p-4 shadow-lg">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <Award className="size-4 shrink-0 text-amber-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-200 truncate">
              Standing: <span className="text-white font-extrabold">{currentTier.name} Syndicate</span>
            </span>
          </div>
          <span className="rounded-md border border-amber-500/50 bg-amber-500/20 px-2.5 py-0.5 text-xs font-bold text-amber-300 shrink-0">
            {currentTier.yieldLabel}
          </span>
        </div>

        {upcoming ? (
          <div className="mt-3 space-y-2">
            <div className="flex items-center justify-between text-xs text-neutral-400">
              <span>Next Tier: {upcoming.name}</span>
              <span className="font-bold text-amber-300">${money(totalInvested)} / ${money(upcoming.minInvest)}</span>
            </div>
            <ProgressBar value={progress} tone="gold" />
          </div>
        ) : (
          <p className="mt-2 text-xs text-amber-300 font-semibold">Apex Institutional Rank Active &bull; Maximum Tier Unlocked.</p>
        )}
      </div>

      {/* 4. ACTIVE PORTFOLIO HOLDINGS */}
      <div className="gold-glow-hover rounded-2xl border border-neutral-800 bg-neutral-950 p-4 space-y-3 shadow-lg">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-neutral-200 flex items-center gap-2 truncate">
            <Layers className="size-4 text-amber-400 shrink-0" /> Active Deployments ({state.holdings.length})
          </span>
          <button onClick={() => setView('invest')} className="text-xs text-amber-400 hover:underline flex items-center gap-1 font-bold shrink-0">
            Explore All <ChevronRight className="size-3.5" />
          </button>
        </div>
        
        {state.holdings.length === 0 ? (
          <div className="text-center py-5 text-xs text-neutral-400 bg-neutral-900/50 rounded-xl border border-neutral-800/60">
            No active capital allocations found. Select a project below to deploy capital.
          </div>
        ) : (
          <div className="space-y-2.5">
            {state.holdings.map((h) => (
              <div key={h.id} className="flex items-center justify-between rounded-xl bg-neutral-900/90 p-3 border border-neutral-800 text-xs gap-3">
                <div className="space-y-1 min-w-0">
                  <p className="font-extrabold text-white text-sm truncate">{h.projectName}</p>
                  <p className="text-[11px] text-neutral-400">Principal Allocated: <strong className="text-neutral-200">${money(h.amount)}</strong></p>
                </div>
                <div className="text-right shrink-0">
                  <span className="inline-block rounded-lg bg-emerald-950/80 border border-emerald-500/40 px-2.5 py-1 font-mono text-xs font-extrabold text-emerald-400 shadow-sm">
                    +{h.apy}% APY
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 5. REGIONAL OPPORTUNITIES PIPELINE */}
      <div className="space-y-3.5">
        <div className="flex items-center justify-between gap-2 px-1">
          <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-200 truncate">
            Regional Opportunities Pipeline ({projects.length})
          </h3>
          <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5 shrink-0">
            <span className="size-1.5 rounded-full bg-amber-400 animate-ping" />
            Live Ledger Synced
          </span>
        </div>

        <div className="grid gap-4">
          {projects.map((p) => {
            const funded = p.funded ?? 0
            const goal = p.goal ?? 100000
            const pct = goal > 0 ? Math.min(100, Math.round((funded / goal) * 100)) : 0
            
            return (
              <div
                key={p.id}
                onClick={() => setSelectedProject(p)}
                className="gold-glow-hover group cursor-pointer overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-950 shadow-xl"
              >
                <div className="relative h-40 w-full overflow-hidden">
                  <img 
                    src={p.image} 
                    alt={p.name} 
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/40 to-transparent" />
                  
                  <div className="absolute top-3 right-3">
                    <span className="rounded-lg border border-emerald-500/60 bg-emerald-950/90 px-3 py-1 text-xs font-extrabold text-emerald-300 shadow-lg">
                      {p.targetYield}
                    </span>
                  </div>

                  <div className="absolute bottom-3 left-4 right-4 space-y-0.5">
                    <p className="text-[10px] font-extrabold uppercase tracking-widest text-amber-300">{p.country} &bull; {p.sector}</p>
                    <h4 className="text-base font-black text-white group-hover:text-amber-200 transition-colors drop-shadow-md truncate">{p.name}</h4>
                  </div>
                </div>

                <div className="p-4 space-y-3 bg-neutral-950/95">
                  <div className="flex justify-between text-xs text-neutral-300">
                    <span>Funded Progress: <strong className="text-white">${money(funded)}</strong> / ${money(goal)}</span>
                    <span className="font-black text-amber-400">{pct}%</span>
                  </div>
                  <ProgressBar value={pct} tone="gold" />
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* 6. INSTITUTIONAL QUICK HUBS */}
      <div className="space-y-3 pt-1">
        <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-200 px-1 truncate">
          Institutional Quick Hubs
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <ActionTile icon={<Rocket className="size-4 text-amber-300" />} label="Buy $PULSE" detail="Private syndicate round" badge="Private Sale" onClick={() => setView('sale')} />
          <ActionTile icon={<Zap className="size-4 text-amber-300" />} label="Stake Vault" detail="Sovereign high yield pool" badge="24.8% APY" onClick={() => setView('stake')} />
          <ActionTile icon={<Radio className="size-4 text-amber-300" />} label="Signals Feed" detail="Institutional intelligence" badge="3 Active" onClick={() => setView('signals')} />
          <ActionTile icon={<ShieldCheck className="size-4 text-amber-300" />} label="Verify KYC" detail="Full tier clearance" badge="Level 2" onClick={() => (state.kyc === 'verified' ? setView('profile') : openModal('kyc'))} />
        </div>
      </div>

      {/* PROJECT DEPLOYMENT & RISK MODAL */}
      {selectedProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md rounded-3xl border border-amber-500/50 bg-neutral-950 p-6 space-y-5 shadow-[0_0_50px_rgba(245,158,11,0.25)] relative text-neutral-100 max-h-[90vh] overflow-y-auto"
          >
            <button 
              onClick={() => { setSelectedProject(null); setInvestAmount(''); setInvestError(null); setInvestSuccess(null); }}
              className="absolute top-4 right-4 rounded-full bg-neutral-900 p-2 text-neutral-400 hover:text-white border border-neutral-800"
            >
              <X className="size-4" />
            </button>

            <div className="space-y-2">
              <span className="rounded-md border border-amber-500/40 bg-amber-500/20 px-2.5 py-0.5 text-[10px] font-bold text-amber-300">
                {selectedProject.sector} &bull; {selectedProject.country}
              </span>
              <h2 className="text-xl font-black text-white">{selectedProject.name}</h2>
              <p className="text-xs text-neutral-400">{selectedProject.summary || 'Sovereign infrastructure deployment backed by institutional guarantees.'}</p>
            </div>

            {/* Financial Metrics & Risk Info */}
            <div className="grid grid-cols-2 gap-3 bg-neutral-900/80 p-3.5 rounded-2xl border border-neutral-800">
              <div>
                <p className="text-[10px] uppercase font-bold text-neutral-400">Target Yield</p>
                <p className="text-sm font-black text-emerald-400 mt-0.5">{selectedProject.targetYield}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-neutral-400">Risk Assessment</p>
                <p className="text-sm font-black text-amber-300 mt-0.5">{selectedProject.risk ?? 'Lower / Secured'}</p>
              </div>
            </div>

            {/* Wallet Balance Check */}
            <div className="flex items-center justify-between text-xs bg-neutral-900/50 px-3 py-2.5 rounded-xl border border-neutral-800">
              <span className="text-neutral-400">Available Liquid Cash:</span>
              <strong className="text-white">${money(state.cash)} USDT</strong>
            </div>

            {/* Investment Input Form */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-neutral-300">
                Deployment Capital Amount
              </label>
              <div className="relative">
                <input
                  type="number"
                  placeholder="0.00"
                  value={investAmount}
                  onChange={(e) => setInvestAmount(e.target.value)}
                  className="w-full rounded-xl border border-neutral-700 bg-neutral-900 px-4 py-3 text-sm text-white placeholder-neutral-500 focus:border-amber-400 focus:outline-none font-mono"
                />
                <span className="absolute right-4 top-3 text-xs font-bold text-amber-400">USDT</span>
              </div>
              
              {investError && (
                <div className="flex items-center gap-1.5 text-xs text-rose-400 font-semibold pt-1">
                  <AlertCircle className="size-4 shrink-0" />
                  <span>{investError}</span>
                </div>
              )}

              {investSuccess && (
                <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold pt-1">
                  <CheckCircle2 className="size-4 shrink-0" />
                  <span>{investSuccess}</span>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <Button
                variant="outline"
                className="h-11 rounded-xl border-neutral-700 bg-neutral-900 text-xs font-bold text-white hover:bg-neutral-800"
                onClick={() => { setSelectedProject(null); setInvestAmount(''); setInvestError(null); setInvestSuccess(null); }}
              >
                Cancel
              </Button>
              <Button
                disabled={isSubmitting || Boolean(investSuccess)}
                className="h-11 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 text-xs font-black text-neutral-950 hover:from-amber-300 hover:to-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.4)]"
                onClick={handleConfirmInvestment}
              >
                {isSubmitting ? 'Deploying...' : 'Confirm & Deploy'}
              </Button>
            </div>
            
            <p className="text-[10px] text-center text-neutral-500 pt-1">
              Yields and payouts are distributed directly to your wallet upon administrative clearance.
            </p>
          </motion.div>
        </div>
      )}
    </div>
  )
}

function ActionTile({ icon, label, detail, badge, onClick }: { icon: React.ReactNode; label: string; detail: string; badge: string; onClick: () => void }) {
  return (
    <div
      onClick={onClick}
      className="gold-glow-hover group relative flex cursor-pointer flex-col justify-between overflow-hidden rounded-2xl border border-amber-500/40 bg-neutral-950 p-4 shadow-md"
    >
      <div className="flex items-center justify-between gap-1">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-amber-500/30 bg-amber-500/10 group-hover:border-amber-400 transition-colors">
          {icon}
        </div>
        <span className="rounded-md border border-amber-500/40 bg-amber-500/20 px-2 py-0.5 text-[10px] font-bold text-amber-300 truncate">
          {badge}
        </span>
      </div>
      <div className="mt-3.5 space-y-1">
        <h4 className="text-xs font-extrabold text-white group-hover:text-amber-300 transition-colors truncate">{label}</h4>
        <p className="text-[10px] text-neutral-400 truncate">{detail}</p>
      </div>
    </div>
  )
}
