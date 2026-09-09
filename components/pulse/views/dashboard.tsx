'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ArrowDownRight, ArrowUpRight, ChevronRight, 
  Radio, Rocket, ShieldCheck, TrendingUp, Zap, Award, Layers, AlertCircle, X, CheckCircle2, Lock, ShieldAlert, ImageOff
} from 'lucide-react'
import { money, usePulse } from '../store'
import { ProgressBar } from '../ui-bits'
import { nextTier, type Project } from '@/lib/pulse-data'
import { Button } from '@/components/ui/button'

// 100% Reliable Image URLs with Fallback System
const FALLBACK_PROJECTS: Project[] = [
  {
    id: 'proj-1',
    name: 'Sandsloot Lithium & Tantalum Extraction Hub',
    sector: 'Critical Minerals',
    country: 'South Africa',
    targetYield: '22.5% APY',
    goal: 500000,
    funded: 385000,
    risk: 'Secured / Tier 1',
    summary: 'High-grade pegmatite mineral extraction facility located within the Northern Limb of the Bushveld Complex, fully backed by sovereign offtake agreements.',
    image: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?q=80&w=1000&auto=format&fit=crop'
  },
  {
    id: 'proj-2',
    name: 'Kalahari Green Hydrogen & Ammonia Corridor',
    sector: 'Clean Energy',
    country: 'Namibia',
    targetYield: '19.8% APY',
    goal: 1200000,
    funded: 940000,
    risk: 'Sovereign Guarantee',
    summary: 'Utility-scale green hydrogen production plant leveraging localized solar irradiance to supply regional heavy industry and European export markets.',
    image: 'https://images.unsplash.com/photo-1466611653911-95081537e5b7?q=80&w=1000&auto=format&fit=crop'
  },
  {
    id: 'proj-3',
    name: 'Copperbelt High-Voltage Grid Modernization',
    sector: 'Infrastructure',
    country: 'Zambia',
    targetYield: '24.0% APY',
    goal: 850000,
    funded: 620000,
    risk: 'Secured Asset',
    summary: 'Advanced transmission infrastructure upgrade ensuring uninterrupted high-voltage power distribution to major mining houses and industrial nodes.',
    image: 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?q=80&w=1000&auto=format&fit=crop'
  }
]

// Custom Error-Safe Image Component to eliminate 404 issues
function ProjectImage({ src, alt, className }: { src: string; alt: string; className?: string }) {
  const [hasError, setHasError] = useState(false)

  if (hasError) {
    return (
      <div className={`flex flex-col items-center justify-center bg-gradient-to-br from-amber-950/60 via-neutral-900 to-neutral-950 p-4 border-b border-amber-500/30 ${className}`}>
        <div className="rounded-full bg-amber-500/10 p-3 border border-amber-500/40 shadow-[0_0_15px_rgba(245,158,11,0.3)]">
          <Zap className="size-6 text-amber-400 animate-pulse" />
        </div>
        <span className="mt-2 text-[10px] font-black uppercase tracking-widest text-amber-300">
          SADC Sovereign Asset
        </span>
      </div>
    )
  }

  return (
    <img 
      src={src} 
      alt={alt} 
      className={className} 
      onError={() => setHasError(true)}
    />
  )
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.05
    }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { type: 'spring', stiffness: 350, damping: 25 }
  }
}

export function DashboardView() {
  const state = usePulse((s) => s.state)
  const api = usePulse((s) => s.api)
  const totalInvested = usePulse((s) => s.totalInvested)
  const currentTier = usePulse((s) => s.currentTier)
  const portfolioValue = usePulse((s) => s.portfolioValue)
  const openModal = usePulse((s) => s.openModal)
  const setView = usePulse((s) => s.setView)
  
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

  useEffect(() => {
    let isCancelled = false
    api.liveProjectFunding().then((res) => {
      if (!isCancelled && res.ok && res.funding) {
        setProjects(prev => prev.map(p => ({
          ...p,
          funded: res.funding[p.id] !== undefined ? res.funding[p.id] : p.funded
        })))
      }
    }).catch(() => {})
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
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="mx-auto w-full max-w-md space-y-5 pb-28 text-neutral-100 antialiased px-2 sm:px-3 relative overflow-hidden"
    >
      <style>{`
        @keyframes shimmerGold {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        @keyframes borderPulse {
          0%, 100% { 
            border-color: rgba(245, 158, 11, 0.7); 
            box-shadow: 0 0 25px rgba(245, 158, 11, 0.35), inset 0 0 15px rgba(245, 158, 11, 0.15); 
          }
          50% { 
            border-color: rgba(251, 191, 36, 1); 
            box-shadow: 0 0 45px rgba(245, 158, 11, 0.65), inset 0 0 25px rgba(245, 158, 11, 0.3); 
          }
        }
        .shimmer-card {
          background: linear-gradient(115deg, #09090b 15%, #3b2306 50%, #09090b 85%);
          background-size: 200% 100%;
          animation: shimmerGold 5s ease-in-out infinite;
          box-shadow: 0 0 45px rgba(245, 158, 11, 0.3), inset 0 0 20px rgba(245, 158, 11, 0.15);
        }
        .live-border-pulse {
          animation: borderPulse 3s ease-in-out infinite;
        }
        .gold-glow-card {
          box-shadow: 0 4px 20px rgba(245, 158, 11, 0.15);
          transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.25s ease, box-shadow 0.25s ease;
        }
        .gold-glow-card:hover {
          border-color: rgba(251, 191, 36, 0.9) !important;
          box-shadow: 0 12px 40px -5px rgba(245, 158, 11, 0.45), inset 0 0 20px rgba(245, 158, 11, 0.2);
        }
        .custom-modal-scroll::-webkit-scrollbar {
          width: 5px;
        }
        .custom-modal-scroll::-webkit-scrollbar-track {
          background: rgba(15, 15, 18, 0.8);
        }
        .custom-modal-scroll::-webkit-scrollbar-thumb {
          background: rgba(245, 158, 11, 0.6);
          border-radius: 4px;
        }
      `}</style>

      {/* 1. STATUS HEADER */}
      <motion.div 
        variants={itemVariants}
        className="live-border-pulse flex items-center justify-between gap-2.5 rounded-2xl border border-amber-500/70 bg-neutral-950/95 px-3.5 py-3 shadow-[0_0_25px_rgba(245,158,11,0.25)] backdrop-blur-md"
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="relative flex size-3 shrink-0">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-80" />
            <span className="relative inline-flex size-3 rounded-full bg-amber-500 shadow-[0_0_12px_#f59e0b]" />
          </span>
          <span className="text-[11px] font-black uppercase tracking-widest text-amber-200 truncate drop-shadow">
            SADC Sovereign Terminal &bull; Live Feed
          </span>
        </div>
        <span className="rounded-full border border-amber-400 bg-amber-500/25 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.4)] shrink-0">
          {currentTier.name} VIP
        </span>
      </motion.div>

      {/* 2. CONSOLIDATED PORTFOLIO CARD */}
      <motion.div 
        variants={itemVariants}
        whileHover={{ y: -2 }}
        transition={{ duration: 0.2 }}
        className="shimmer-card relative overflow-hidden rounded-3xl border border-amber-400/80 p-5 shadow-[0_0_55px_rgba(245,158,11,0.35)]"
      >
        <div className="relative z-10 space-y-4">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] font-black uppercase tracking-widest text-amber-300 drop-shadow truncate">
              Net Liquidity Value
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-400/60 bg-emerald-950/95 px-3 py-1 text-[11px] font-black text-emerald-300 shadow-[0_0_20px_rgba(16,185,129,0.35)] shrink-0">
              <TrendingUp className="size-3.5 text-emerald-400 shrink-0" />
              +{portfolioReturnPct.toFixed(1)}% APY
            </span>
          </div>

          <div className="space-y-1">
            <div className="flex items-baseline gap-2">
              <h1 className="text-4xl font-black tracking-tight text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]">
                ${money(portfolioValue)}
              </h1>
              <span className="text-xs font-black text-amber-400 tracking-wider">USDT</span>
            </div>
            <p className="text-xs text-neutral-200 font-bold truncate">
              Sovereign Yield Return: <span className="text-emerald-400 font-extrabold">+${money(totalReturnDollars, 2)} ({portfolioReturnPct.toFixed(1)}%)</span>
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-1">
            <Button
              size="lg"
              className="h-11 w-full rounded-xl border border-amber-300 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 text-xs font-black text-neutral-950 shadow-[0_0_25px_rgba(245,158,11,0.5)] hover:brightness-110 active:scale-[0.98] transition-all"
              onClick={() => openModal('deposit')}
            >
              <ArrowDownRight className="size-4 shrink-0 stroke-[3]" />
              <span className="truncate">Deposit Capital</span>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="h-11 w-full rounded-xl border border-neutral-700 bg-neutral-900/95 text-xs font-bold text-white shadow-lg hover:border-amber-400 hover:bg-neutral-800 active:scale-[0.98] transition-all"
              onClick={() => openModal('withdraw')}
            >
              <ArrowUpRight className="size-4 shrink-0 stroke-[2.5]" />
              <span className="truncate">Withdraw Yields</span>
            </Button>
          </div>
        </div>

        <div className="relative z-10 mt-5 grid grid-cols-3 divide-x divide-neutral-800/80 border-t border-neutral-800/80 pt-3 text-center">
          <div className="px-1 min-w-0">
            <p className="text-[10px] font-extrabold uppercase tracking-wider text-neutral-400 truncate">Liquid Cash</p>
            <p className="mt-0.5 text-xs sm:text-sm font-black text-white truncate">${money(state.cash, 0)}</p>
          </div>
          <div className="px-1 min-w-0">
            <p className="text-[10px] font-extrabold uppercase tracking-wider text-neutral-400 truncate">Principal</p>
            <p className="mt-0.5 text-xs sm:text-sm font-black text-white truncate">${money(totalInvested, 0)}</p>
          </div>
          <div className="px-1 min-w-0">
            <p className="text-[10px] font-extrabold uppercase tracking-wider text-neutral-400 truncate">$PULSE Assets</p>
            <p className="mt-0.5 text-xs sm:text-sm font-black text-amber-300 truncate">${money(state.pulse + state.staked, 0)}</p>
          </div>
        </div>
      </motion.div>

      {/* 3. TIER STATUS BAR */}
      <motion.div 
        variants={itemVariants}
        className="gold-glow-card rounded-2xl border border-amber-500/50 bg-neutral-950 p-4 shadow-lg backdrop-blur-sm"
      >
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <Award className="size-4 shrink-0 text-amber-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-200 truncate">
              Standing: <span className="text-amber-300 font-extrabold">{currentTier.name} Syndicate</span>
            </span>
          </div>
          <span className="rounded-md border border-amber-500/60 bg-amber-500/25 px-2.5 py-0.5 text-[11px] font-black text-amber-300 shrink-0 shadow-[0_0_10px_rgba(245,158,11,0.3)]">
            {currentTier.yieldLabel}
          </span>
        </div>

        {upcoming ? (
          <div className="mt-3 space-y-2">
            <div className="flex items-center justify-between text-xs text-neutral-300">
              <span className="truncate font-semibold">Next Tier: {upcoming.name}</span>
              <span className="font-extrabold text-amber-300 shrink-0">${money(totalInvested)} / ${money(upcoming.minInvest)}</span>
            </div>
            <ProgressBar value={progress} tone="gold" />
          </div>
        ) : (
          <p className="mt-2 text-xs text-amber-300 font-bold truncate">Apex Institutional Rank Active &bull; Maximum Tier Unlocked.</p>
        )}
      </motion.div>

      {/* 4. ACTIVE PORTFOLIO HOLDINGS */}
      <motion.div 
        variants={itemVariants}
        className="gold-glow-card rounded-2xl border border-neutral-800 bg-neutral-950 p-4 space-y-3 shadow-lg"
      >
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-extrabold uppercase tracking-wider text-neutral-200 flex items-center gap-2 truncate">
            <Layers className="size-4 text-amber-400 shrink-0" /> Active Deployments ({state.holdings.length})
          </span>
          <button 
            onClick={() => setView('invest')} 
            className="text-xs text-amber-400 hover:text-amber-300 hover:underline flex items-center gap-0.5 font-bold shrink-0 transition-colors"
          >
            Explore All <ChevronRight className="size-3.5" />
          </button>
        </div>
        
        {state.holdings.length === 0 ? (
          <div className="text-center py-5 px-3 text-xs text-neutral-300 bg-neutral-900/60 rounded-xl border border-neutral-800/80 leading-relaxed font-medium">
            No active capital allocations found. Select a project below to deploy capital.
          </div>
        ) : (
          <div className="space-y-2.5">
            {state.holdings.map((h) => (
              <motion.div 
                key={h.id} 
                whileHover={{ scale: 1.01 }}
                className="flex items-center justify-between rounded-xl bg-neutral-900/90 p-3 border border-neutral-800 text-xs gap-3 shadow-md"
              >
                <div className="space-y-1 min-w-0">
                  <p className="font-extrabold text-white text-sm truncate">{h.projectName}</p>
                  <p className="text-[11px] text-neutral-300 truncate font-medium">
                    Principal Allocated: <strong className="text-amber-200 font-extrabold">${money(h.amount)}</strong>
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <span className="inline-block rounded-lg bg-emerald-950/90 border border-emerald-500/60 px-2.5 py-1 font-mono text-xs font-extrabold text-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.25)]">
                    +{h.apy}% APY
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      {/* 5. REGIONAL OPPORTUNITIES PIPELINE (ERROR-SAFE IMAGES) */}
      <motion.div variants={itemVariants} className="space-y-3 pt-1">
        <div className="flex items-center justify-between gap-2 px-1">
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-neutral-200 truncate">
            Regional Opportunities Pipeline ({projects.length})
          </h3>
          <span className="text-[11px] font-bold text-amber-300 flex items-center gap-1.5 shrink-0">
            <span className="size-2 rounded-full bg-amber-400 animate-ping" />
            Live Ledger Synced
          </span>
        </div>

        <div className="grid gap-4">
          {projects.map((p) => {
            const funded = p.funded ?? 0
            const goal = p.goal ?? 100000
            const pct = goal > 0 ? Math.min(100, Math.round((funded / goal) * 100)) : 0
            
            return (
              <motion.div
                key={p.id}
                whileHover={{ y: -3 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => setSelectedProject(p)}
                className="gold-glow-card group cursor-pointer overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-950 shadow-xl"
              >
                <div className="relative h-44 w-full overflow-hidden bg-neutral-900">
                  <ProjectImage 
                    src={p.image} 
                    alt={p.name} 
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/40 to-transparent" />
                  
                  <div className="absolute top-3 right-3">
                    <span className="rounded-xl border border-emerald-400/80 bg-emerald-950/95 px-3 py-1 text-xs font-black text-emerald-300 shadow-[0_0_20px_rgba(16,185,129,0.4)] backdrop-blur-md">
                      {p.targetYield}
                    </span>
                  </div>

                  <div className="absolute bottom-3 left-4 right-4 space-y-0.5">
                    <p className="text-[10px] font-black uppercase tracking-widest text-amber-300 drop-shadow truncate">
                      {p.country} &bull; {p.sector}
                    </p>
                    <h4 className="text-base font-black text-white group-hover:text-amber-200 transition-colors drop-shadow-md truncate">
                      {p.name}
                    </h4>
                  </div>
                </div>

                <div className="p-4 space-y-3 bg-neutral-950">
                  <div className="flex justify-between text-xs text-neutral-200 min-w-0 font-medium">
                    <span className="truncate">Funded Progress: <strong className="text-white font-extrabold">${money(funded)}</strong> / ${money(goal)}</span>
                    <span className="font-black text-amber-400 shrink-0 ml-2">{pct}%</span>
                  </div>
                  <ProgressBar value={pct} tone="gold" />
                </div>
              </motion.div>
            )
          })}
        </div>
      </motion.div>

      {/* 6. INSTITUTIONAL QUICK HUBS */}
      <motion.div variants={itemVariants} className="space-y-3 pt-1">
        <h3 className="text-xs font-extrabold uppercase tracking-wider text-neutral-200 px-1 truncate">
          Institutional Quick Hubs
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <ActionTile 
            icon={<Rocket className="size-4 text-amber-300" />} 
            label="Buy $PULSE" 
            detail="Private syndicate round" 
            badge="Private Sale" 
            onClick={() => setView('sale')} 
          />
          <ActionTile 
            icon={<Zap className="size-4 text-amber-300" />} 
            label="Stake Vault" 
            detail="Sovereign high yield pool" 
            badge="24.8% APY" 
            onClick={() => setView('stake')} 
          />
          <ActionTile 
            icon={<Radio className="size-4 text-amber-300" />} 
            label="Signals Feed" 
            detail="Institutional intelligence" 
            badge="3 Active" 
            onClick={() => setView('signals')} 
          />
          <ActionTile 
            icon={<ShieldCheck className="size-4 text-amber-300" />} 
            label="Verify KYC" 
            detail="Full tier clearance" 
            badge="Level 2" 
            onClick={() => (state.kyc === 'verified' ? setView('profile') : openModal('kyc'))} 
          />
        </div>
      </motion.div>

      {/* 7. HIGH-CONTRAST READABLE DISCLAIMER & SECURITY COMPLIANCE FOOTER */}
      <motion.div 
        variants={itemVariants} 
        className="mt-6 rounded-2xl border border-amber-500/50 bg-neutral-900/95 p-4 space-y-3 text-neutral-200 text-xs leading-relaxed shadow-[0_0_25px_rgba(245,158,11,0.2)]"
      >
        <div className="flex items-center justify-between border-b border-neutral-800 pb-2.5 gap-2">
          <div className="flex items-center gap-2 text-amber-300 font-extrabold uppercase tracking-wider text-xs truncate">
            <Lock className="size-4 shrink-0 text-amber-400" />
            <span>Sovereign Security & Risk Disclosure</span>
          </div>
          <ShieldAlert className="size-4 text-amber-400 shrink-0" />
        </div>
        
        <p className="font-medium text-neutral-200 text-xs sm:text-sm leading-relaxed">
          Capital allocated to SADC sovereign infrastructure and critical mineral pipelines is subject to institutional clearing protocols and sovereign performance guarantees. Returns specified represent target APY baselines and are non-binding.
        </p>

        <div className="flex flex-wrap items-center justify-between gap-2 pt-1.5 border-t border-neutral-800/80 text-[11px] text-amber-200/90 font-mono font-bold">
          <span className="truncate">Protocol Version: 2.4.0-SADC</span>
          <span className="truncate flex items-center gap-1">
            <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Encrypted 256-bit SSL
          </span>
        </div>
      </motion.div>

      {/* PROJECT DEPLOYMENT MODAL */}
      <AnimatePresence>
        {selectedProject && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ type: 'spring', stiffness: 350, damping: 28 }}
              className="custom-modal-scroll w-full max-w-md rounded-3xl border border-amber-400 bg-neutral-950 p-5 sm:p-6 space-y-4 shadow-[0_0_75px_rgba(245,158,11,0.45)] relative text-neutral-100 max-h-[85vh] overflow-y-auto"
            >
              <button 
                onClick={() => { setSelectedProject(null); setInvestAmount(''); setInvestError(null); setInvestSuccess(null); }}
                className="absolute top-4 right-4 rounded-full bg-neutral-900 p-2 text-neutral-400 hover:text-white border border-neutral-800 transition-colors"
              >
                <X className="size-4" />
              </button>

              <div className="space-y-1.5 pr-6">
                <span className="inline-block rounded-md border border-amber-400 bg-amber-500/20 px-2.5 py-0.5 text-[10px] font-black text-amber-300 uppercase tracking-wider">
                  {selectedProject.sector} &bull; {selectedProject.country}
                </span>
                <h2 className="text-lg font-black text-white leading-tight break-words">{selectedProject.name}</h2>
                <p className="text-xs text-neutral-300 leading-relaxed font-medium">
                  {selectedProject.summary || 'Sovereign infrastructure deployment backed by institutional guarantees.'}
                </p>
              </div>

              {/* Financial Metrics & Risk Info */}
              <div className="grid grid-cols-2 gap-3 bg-neutral-900 p-3.5 rounded-2xl border border-neutral-800">
                <div className="min-w-0">
                  <p className="text-[10px] uppercase font-extrabold tracking-wider text-neutral-400 truncate">Target Yield</p>
                  <p className="text-base font-black text-emerald-400 mt-0.5 truncate">{selectedProject.targetYield}</p>
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] uppercase font-extrabold tracking-wider text-neutral-400 truncate">Risk Assessment</p>
                  <p className="text-base font-black text-amber-300 mt-0.5 truncate">{selectedProject.risk ?? 'Lower / Secured'}</p>
                </div>
              </div>

              {/* Wallet Balance Check */}
              <div className="flex items-center justify-between text-xs bg-neutral-900/80 px-3.5 py-2.5 rounded-xl border border-neutral-800 gap-2">
                <span className="text-neutral-300 font-medium truncate">Available Liquid Cash:</span>
                <strong className="text-white font-black shrink-0">${money(state.cash)} USDT</strong>
              </div>

              {/* Investment Input Form */}
              <div className="space-y-2">
                <label className="text-xs font-extrabold uppercase tracking-wider text-neutral-200 block">
                  Deployment Capital Amount
                </label>
                <div className="relative">
                  <input
                    type="number"
                    placeholder="0.00"
                    value={investAmount}
                    onChange={(e) => setInvestAmount(e.target.value)}
                    className="w-full rounded-xl border border-neutral-700 bg-neutral-900 px-4 py-3 text-sm text-white placeholder-neutral-500 focus:border-amber-400 focus:ring-1 focus:ring-amber-400 focus:outline-none font-mono font-bold"
                  />
                  <span className="absolute right-4 top-3 text-xs font-black text-amber-400 pointer-events-none">USDT</span>
                </div>
                
                {investError && (
                  <div className="flex items-center gap-1.5 text-xs text-rose-400 font-bold pt-1 break-words">
                    <AlertCircle className="size-4 shrink-0" />
                    <span>{investError}</span>
                  </div>
                )}

                {investSuccess && (
                  <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-bold pt-1 break-words">
                    <CheckCircle2 className="size-4 shrink-0" />
                    <span>{investSuccess}</span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <Button
                  variant="outline"
                  className="h-11 rounded-xl border-neutral-700 bg-neutral-900 text-xs font-bold text-white hover:bg-neutral-800 transition-all"
                  onClick={() => { setSelectedProject(null); setInvestAmount(''); setInvestError(null); setInvestSuccess(null); }}
                >
                  Cancel
                </Button>
                <Button
                  disabled={isSubmitting || Boolean(investSuccess)}
                  className="h-11 rounded-xl bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 text-xs font-black text-neutral-950 hover:brightness-110 shadow-[0_0_25px_rgba(245,158,11,0.5)] transition-all"
                  onClick={handleConfirmInvestment}
                >
                  {isSubmitting ? 'Deploying...' : 'Confirm & Deploy'}
                </Button>
              </div>
                
              <p className="text-[11px] text-center text-neutral-400 font-medium pt-1 leading-normal">
                Yields and payouts are distributed directly to your wallet upon administrative clearance.
              </p>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

function ActionTile({ icon, label, detail, badge, onClick }: { icon: React.ReactNode; label: string; detail: string; badge: string; onClick: () => void }) {
  return (
    <motion.div
      whileHover={{ y: -3, scale: 1.01 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="gold-glow-card group relative flex cursor-pointer flex-col justify-between overflow-hidden rounded-2xl border border-amber-500/40 bg-neutral-950 p-3.5 shadow-md min-w-0"
    >
      <div className="flex items-center justify-between gap-1">
        <div className="flex size-8 shrink-0 items-center justify-center rounded-xl border border-amber-500/40 bg-amber-500/15 group-hover:border-amber-400 transition-colors">
          {icon}
        </div>
        <span className="rounded-md border border-amber-500/50 bg-amber-500/25 px-1.5 py-0.5 text-[9px] sm:text-[10px] font-black text-amber-300 truncate shadow-sm">
          {badge}
        </span>
      </div>
      <div className="mt-3 space-y-0.5 min-w-0">
        <h4 className="text-xs font-black text-white group-hover:text-amber-300 transition-colors truncate">{label}</h4>
        <p className="text-[10px] text-neutral-300 font-medium truncate">{detail}</p>
      </div>
    </motion.div>
  )
}
