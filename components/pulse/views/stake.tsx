'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Zap, Vote, CheckCircle2, AlertCircle, TrendingUp, Sparkles, ArrowRight, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { RiskNote } from '../ui-bits'

interface GovernanceProposal {
  id: string
  title: string
  status: 'Active' | 'Passing' | 'Closed'
  forPct: number
  againstPct: number
}

const GOVERNANCE_PROPOSALS: GovernanceProposal[] = [
  {
    id: 'gov-1',
    title: 'Add Namibian green hydrogen project to the platform',
    status: 'Active',
    forPct: 72,
    againstPct: 28,
  },
  {
    id: 'gov-2',
    title: 'Lower minimum entry for the Starter tier to $50',
    status: 'Active',
    forPct: 58,
    againstPct: 42,
  },
  {
    id: 'gov-3',
    title: 'Allocate 5% of fees to a community reserve',
    status: 'Passing',
    forPct: 81,
    againstPct: 19,
  },
]

// Home Dashboard Motion Stagger Physics
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.04,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 24,
    },
  },
}

export function StakeView() {
  const [activeTab, setActiveTab] = useState<'stake' | 'unstake'>('stake')
  const [stakeAmount, setStakeAmount] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [votedProposals, setVotedProposals] = useState<Record<string, 'for' | 'against'>>({})
  const [mousePos, setMousePos] = useState({ x: 150, y: 50 })

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top })
  }

  const handleStakeSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!stakeAmount || Number(stakeAmount) <= 0) return

    setIsSubmitting(true)
    setTimeout(() => {
      setIsSubmitting(false)
      setStakeAmount('')
    }, 1200)
  }

  const handleVote = (proposalId: string, choice: 'for' | 'against') => {
    setVotedProposals((prev) => ({ ...prev, [proposalId]: choice }))
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-4 max-w-md mx-auto pb-28 pt-1 px-1.5 text-zinc-100 font-sans selection:bg-amber-500/30"
    >
      {/* Header Section with Neon Glow Icon */}
      <motion.div variants={itemVariants} className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <motion.div 
            whileHover={{ scale: 1.08, rotate: 5 }}
            whileTap={{ scale: 0.95 }}
            className="relative p-2.5 rounded-2xl bg-gradient-to-br from-amber-500/20 via-amber-500/10 to-transparent border border-amber-500/40 text-amber-400 shrink-0 shadow-[0_0_25px_rgba(245,158,11,0.25)]"
          >
            <Zap className="size-5 fill-amber-400/30 animate-pulse" />
          </motion.div>
          <div>
            <h2 className="text-base font-extrabold text-white leading-tight tracking-wide flex items-center gap-1.5">
              Stake & earn
            </h2>
            <p className="text-[11px] text-zinc-400 leading-normal">
              Stake $PULSE to earn rewards and vote on platform decisions.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Hero APY & Staked Banner with Spotlight Motion */}
      <motion.div variants={itemVariants}>
        <motion.div
          whileHover={{ scale: 1.01 }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          onPointerMove={handlePointerMove}
          style={{
            background: `radial-gradient(240px circle at ${mousePos.x}px ${mousePos.y}px, rgba(245, 158, 11, 0.16), transparent 80%), linear-gradient(135deg, #1c170d 0%, #0a0a08 100%)`
          }}
          className="relative overflow-hidden rounded-2xl border border-amber-500/35 p-4 shadow-[0_0_30px_rgba(245,158,11,0.12)] transition-colors duration-300 hover:border-amber-500/60"
        >
          {/* Animated Ambient Shimmer Sweep */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-400/10 to-transparent -translate-x-full animate-[shimmer_3.5s_infinite]" />

          <div className="flex justify-between items-start relative z-10">
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[9px] font-black uppercase tracking-widest text-amber-400/90 font-mono">
                  CURRENT APY
                </span>
                <Sparkles className="size-3 text-amber-400 animate-spin" style={{ animationDuration: '6s' }} />
              </div>
              <motion.div 
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 300, damping: 15 }}
                className="text-3xl font-black font-mono text-amber-400 tracking-tight mt-0.5 drop-shadow-[0_0_15px_rgba(245,158,11,0.45)]"
              >
                24.8%
              </motion.div>
            </div>
            <div className="text-right">
              <span className="text-[9px] font-black uppercase tracking-widest text-zinc-400 font-mono">
                STAKED
              </span>
              <div className="text-xl font-bold font-mono text-white mt-0.5">
                3,300
              </div>
              <span className="text-[10px] font-mono font-bold text-emerald-400 flex items-center justify-end gap-1">
                <TrendingUp className="size-3" /> ≈ $65.47/yr rewards
              </span>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Stake / Unstake Interactive Box with Animated Spring Tabs */}
      <motion.div variants={itemVariants}>
        <div className="relative rounded-2xl border border-white/10 bg-[#111111]/90 backdrop-blur-md p-4 shadow-2xl space-y-3.5">
          
          {/* Interactive Spring Pill Tabs */}
          <div className="relative grid grid-cols-2 gap-1 p-1.5 rounded-xl bg-black/70 border border-white/10">
            <button
              type="button"
              onClick={() => setActiveTab('stake')}
              className={`relative z-10 py-2 text-xs font-black uppercase tracking-wider transition-colors duration-200 ${
                activeTab === 'stake' ? 'text-black' : 'text-zinc-400 hover:text-white'
              }`}
            >
              Stake
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('unstake')}
              className={`relative z-10 py-2 text-xs font-black uppercase tracking-wider transition-colors duration-200 ${
                activeTab === 'unstake' ? 'text-black' : 'text-zinc-400 hover:text-white'
              }`}
            >
              Unstake
            </button>

            {/* Sliding Pill Background with Layout Animation */}
            <AnimatePresence>
              <motion.div
                layoutId="activeTabPill"
                className="absolute inset-y-1.5 rounded-lg bg-gradient-to-r from-amber-400 via-amber-400 to-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.5)]"
                style={{
                  left: activeTab === 'stake' ? '0.375rem' : 'calc(50% + 0.1875rem)',
                  width: 'calc(50% - 0.5625rem)'
                }}
                transition={{ type: 'spring', stiffness: 500, damping: 32 }}
              />
            </AnimatePresence>
          </div>

          <form onSubmit={handleStakeSubmit} className="space-y-3">
            <div>
              <div className="flex justify-between text-[11px] font-semibold text-zinc-400 mb-1.5">
                <span>Amount (PULSE)</span>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="button"
                  onClick={() => setStakeAmount('45171')}
                  className="text-amber-400 hover:text-amber-300 font-mono text-[10px] font-black uppercase tracking-wider bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/25 transition-all hover:bg-amber-500/20"
                >
                  Max 45,171
                </motion.button>
              </div>
              <div className="relative">
                <input
                  type="number"
                  placeholder="0"
                  value={stakeAmount}
                  onChange={(e) => setStakeAmount(e.target.value)}
                  className="w-full bg-black/80 border border-white/10 text-white placeholder:text-zinc-600 focus:border-amber-400 focus:ring-1 focus:ring-amber-400/50 focus:outline-none h-12 text-base rounded-xl font-mono px-3.5 transition-all shadow-inner"
                />
              </div>
            </div>

            <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}>
              <Button
                type="submit"
                disabled={isSubmitting || !stakeAmount || Number(stakeAmount) <= 0}
                className="w-full h-12 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-400 hover:brightness-110 text-black font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-[0_0_25px_rgba(245,158,11,0.25)] flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <div className="size-4 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                ) : (
                  <>
                    <Zap className="size-4 fill-black" />
                    <span>{activeTab === 'stake' ? 'Stake PULSE' : 'Unstake PULSE'}</span>
                    <ArrowRight className="size-4" />
                  </>
                )}
              </Button>
            </motion.div>
          </form>
        </div>
      </motion.div>

      {/* Governance Section */}
      <motion.div variants={itemVariants} className="space-y-3 pt-1">
        <div className="flex items-center gap-2.5">
          <motion.div 
            whileHover={{ scale: 1.1 }}
            className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 shrink-0 shadow-[0_0_15px_rgba(245,158,11,0.15)]"
          >
            <Vote className="size-4" />
          </motion.div>
          <div>
            <h3 className="text-sm font-extrabold text-white leading-tight">Governance</h3>
            <p className="text-[11px] text-zinc-400">Staked holders shape the platform.</p>
          </div>
        </div>

        {/* Governance Proposal Cards with Spring Hover Physics */}
        <div className="space-y-3">
          {GOVERNANCE_PROPOSALS.map((prop) => {
            const hasVoted = votedProposals[prop.id]
            return (
              <motion.div
                key={prop.id}
                whileHover={{ y: -3, scale: 1.01 }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-[#141414] to-[#0a0a0a] p-4 shadow-xl space-y-3 transition-colors duration-300 hover:border-amber-500/40"
              >
                {/* Header Shimmer Bar */}
                <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-amber-400/40 to-transparent -translate-x-full animate-[shimmer_4s_infinite]" />

                <div className="flex items-start justify-between gap-2">
                  <h4 className="text-xs font-bold text-white leading-snug pr-2">{prop.title}</h4>
                  <span
                    className={`text-[9px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full border shrink-0 ${
                      prop.status === 'Active'
                        ? 'bg-amber-500/10 text-amber-300 border-amber-500/30 shadow-[0_0_12px_rgba(245,158,11,0.15)]'
                        : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 shadow-[0_0_12px_rgba(16,185,129,0.15)]'
                    }`}
                  >
                    {prop.status}
                  </span>
                </div>

                {/* Animated Dynamic Progress Indicator */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-[10px] font-mono font-bold">
                    <span className="text-emerald-400">For {prop.forPct}%</span>
                    <span className="text-zinc-400">Against {prop.againstPct}%</span>
                  </div>
                  <div className="h-2 w-full bg-black/70 rounded-full overflow-hidden border border-white/5 flex p-0.5">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${prop.forPct}%` }}
                      transition={{ duration: 1, ease: 'easeOut' }}
                      className="bg-gradient-to-r from-emerald-500 to-emerald-400 h-full rounded-full shadow-[0_0_10px_rgba(16,185,129,0.5)]"
                    />
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${prop.againstPct}%` }}
                      transition={{ duration: 1, ease: 'easeOut', delay: 0.1 }}
                      className="bg-zinc-700 h-full rounded-full ml-0.5"
                    />
                  </div>
                </div>

                {/* Interactive Motion Voting Buttons */}
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.96 }}
                    type="button"
                    onClick={() => handleVote(prop.id, 'for')}
                    className={`py-2 px-3 rounded-xl border text-xs font-black transition-all duration-200 flex items-center justify-center gap-1.5 ${
                      hasVoted === 'for'
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.25)]'
                        : 'bg-black/50 text-zinc-300 border-white/10 hover:bg-white/5 hover:border-white/20'
                    }`}
                  >
                    {hasVoted === 'for' && <CheckCircle2 className="size-3.5 text-emerald-400" />}
                    <span>Vote for</span>
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.96 }}
                    type="button"
                    onClick={() => handleVote(prop.id, 'against')}
                    className={`py-2 px-3 rounded-xl border text-xs font-black transition-all duration-200 flex items-center justify-center gap-1.5 ${
                      hasVoted === 'against'
                        ? 'bg-rose-500/20 text-rose-300 border-rose-500/50 shadow-[0_0_15px_rgba(244,63,94,0.25)]'
                        : 'bg-black/50 text-zinc-300 border-white/10 hover:bg-white/5 hover:border-white/20'
                    }`}
                  >
                    {hasVoted === 'against' && <AlertCircle className="size-3.5 text-rose-400" />}
                    <span>Against</span>
                  </motion.button>
                </div>
              </motion.div>
            )
          })}
        </div>
      </motion.div>

      {/* Risk Disclaimer */}
      <motion.div variants={itemVariants}>
        <RiskNote />
      </motion.div>
    </motion.div>
  )
                  }
    
