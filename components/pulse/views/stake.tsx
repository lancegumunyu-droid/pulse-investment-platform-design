'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Zap, Vote, CheckCircle2, AlertCircle, TrendingUp, Sparkles } from 'lucide-react'
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

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.03 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] },
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
      {/* Header Section */}
      <motion.div variants={itemVariants} className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative p-2.5 rounded-2xl bg-gradient-to-br from-amber-500/20 to-amber-500/5 border border-amber-500/30 text-amber-400 shrink-0 shadow-[0_0_20px_rgba(245,158,11,0.2)]">
            <Zap className="size-5 fill-amber-400/30 animate-pulse" />
          </div>
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

      {/* APY & Staked Hero Card */}
      <motion.div variants={itemVariants}>
        <div 
          onPointerMove={handlePointerMove}
          style={{
            background: `radial-gradient(220px circle at ${mousePos.x}px ${mousePos.y}px, rgba(245, 158, 11, 0.12), transparent 80%), linear-gradient(135deg, #18140c 0%, #0d0c08 100%)`
          }}
          className="relative overflow-hidden rounded-2xl border border-amber-500/30 p-4 shadow-[0_0_25px_rgba(245,158,11,0.1)] transition-all duration-300 hover:border-amber-500/50"
        >
          {/* Animated Shimmer Sweep */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-400/10 to-transparent -translate-x-full animate-[shimmer_3.5s_infinite]" />

          <div className="flex justify-between items-start relative z-10">
            <div>
              <div className="flex items-center gap-1">
                <span className="text-[9px] font-black uppercase tracking-widest text-amber-400/90 font-mono">
                  CURRENT APY
                </span>
                <Sparkles className="size-3 text-amber-400 animate-spin" style={{ animationDuration: '6s' }} />
              </div>
              <div className="text-2xl sm:text-3xl font-black font-mono text-amber-400 tracking-tight mt-0.5 drop-shadow-[0_0_12px_rgba(245,158,11,0.4)]">
                24.8%
              </div>
            </div>
            <div className="text-right">
              <span className="text-[9px] font-black uppercase tracking-widest text-zinc-400 font-mono">
                STAKED
              </span>
              <div className="text-lg sm:text-xl font-bold font-mono text-white mt-0.5">
                3,300
              </div>
              <span className="text-[10px] font-mono font-bold text-emerald-400 flex items-center justify-end gap-0.5">
                <TrendingUp className="size-3" /> ≈ $65.47/yr rewards
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stake / Unstake Form Box */}
      <motion.div variants={itemVariants}>
        <div className="relative rounded-2xl border border-white/10 bg-[#111111]/90 backdrop-blur-md p-4 shadow-2xl space-y-3.5">
          
          {/* Animated Tab Switcher */}
          <div className="relative grid grid-cols-2 gap-1 p-1 rounded-xl bg-black/60 border border-white/10">
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

            {/* Sliding Glow Indicator */}
            <AnimatePresence>
              <motion.div
                layoutId="activeTabGlow"
                className="absolute inset-y-1 rounded-lg bg-gradient-to-r from-amber-400 to-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.4)]"
                style={{
                  left: activeTab === 'stake' ? '0.25rem' : 'calc(50% + 0.125rem)',
                  width: 'calc(50% - 0.375rem)'
                }}
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />
            </AnimatePresence>
          </div>

          <form onSubmit={handleStakeSubmit} className="space-y-3">
            <div>
              <div className="flex justify-between text-[11px] font-semibold text-zinc-400 mb-1.5">
                <span>Amount (PULSE)</span>
                <button
                  type="button"
                  onClick={() => setStakeAmount('45171')}
                  className="text-amber-400 hover:text-amber-300 font-mono text-[10px] font-black uppercase tracking-wider bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20 transition-all hover:bg-amber-500/20"
                >
                  Max 45,171
                </button>
              </div>
              <div className="relative">
                <input
                  type="number"
                  placeholder="0"
                  value={stakeAmount}
                  onChange={(e) => setStakeAmount(e.target.value)}
                  className="w-full bg-black/70 border border-white/10 text-white placeholder:text-zinc-600 focus:border-amber-400 focus:ring-1 focus:ring-amber-400/50 focus:outline-none h-12 text-base rounded-xl font-mono px-3.5 transition-all"
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={isSubmitting || !stakeAmount || Number(stakeAmount) <= 0}
              className="w-full h-12 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-400 hover:brightness-110 text-black font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-[0_0_20px_rgba(245,158,11,0.2)] active:scale-[0.99] flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <div className="size-4 border-2 border-black/20 border-t-black rounded-full animate-spin" />
              ) : (
                <>
                  <Zap className="size-4 fill-black" />
                  <span>{activeTab === 'stake' ? 'Stake PULSE' : 'Unstake PULSE'}</span>
                </>
              )}
            </Button>
          </form>
        </div>
      </motion.div>

      {/* Governance Proposals Section */}
      <motion.div variants={itemVariants} className="space-y-3 pt-1">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 shrink-0 shadow-[0_0_12px_rgba(245,158,11,0.15)]">
            <Vote className="size-4" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-white leading-tight">Governance</h3>
            <p className="text-[11px] text-zinc-400">Staked holders shape the platform.</p>
          </div>
        </div>

        {/* Animated Proposal Cards */}
        <div className="space-y-3">
          {GOVERNANCE_PROPOSALS.map((prop) => {
            const hasVoted = votedProposals[prop.id]
            return (
              <motion.div
                key={prop.id}
                whileHover={{ y: -2 }}
                className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-[#141414] to-[#0a0a0a] p-4 shadow-xl space-y-3 transition-all duration-300 hover:border-amber-500/30"
              >
                {/* Ambient Shimmer Light Header */}
                <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-amber-400/40 to-transparent -translate-x-full animate-[shimmer_4s_infinite]" />

                <div className="flex items-start justify-between gap-2">
                  <h4 className="text-xs font-bold text-white leading-snug pr-2">{prop.title}</h4>
                  <span
                    className={`text-[9px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full border shrink-0 ${
                      prop.status === 'Active'
                        ? 'bg-amber-500/10 text-amber-300 border-amber-500/30 shadow-[0_0_10px_rgba(245,158,11,0.15)]'
                        : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 shadow-[0_0_10px_rgba(16,185,129,0.15)]'
                    }`}
                  >
                    {prop.status}
                  </span>
                </div>

                {/* Progress Visualizer */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-[10px] font-mono font-bold">
                    <span className="text-emerald-400">For {prop.forPct}%</span>
                    <span className="text-zinc-400">Against {prop.againstPct}%</span>
                  </div>
                  <div className="h-2 w-full bg-black/70 rounded-full overflow-hidden border border-white/5 flex p-0.5">
                    <div
                      className="bg-gradient-to-r from-emerald-500 to-emerald-400 h-full rounded-full transition-all duration-700 shadow-[0_0_8px_rgba(16,185,129,0.4)]"
                      style={{ width: `${prop.forPct}%` }}
                    />
                    <div
                      className="bg-zinc-700 h-full rounded-full transition-all duration-700 ml-0.5"
                      style={{ width: `${prop.againstPct}%` }}
                    />
                  </div>
                </div>

                {/* Interactive Voting Actions */}
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => handleVote(prop.id, 'for')}
                    className={`py-2 px-3 rounded-xl border text-xs font-black transition-all duration-200 flex items-center justify-center gap-1.5 ${
                      hasVoted === 'for'
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-[0_0_12px_rgba(16,185,129,0.2)]'
                        : 'bg-black/50 text-zinc-300 border-white/10 hover:bg-white/5 hover:border-white/20'
                    }`}
                  >
                    {hasVoted === 'for' ? (
                      <CheckCircle2 className="size-3.5 text-emerald-400" />
                    ) : null}
                    <span>Vote for</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleVote(prop.id, 'against')}
                    className={`py-2 px-3 rounded-xl border text-xs font-black transition-all duration-200 flex items-center justify-center gap-1.5 ${
                      hasVoted === 'against'
                        ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 shadow-[0_0_12px_rgba(244,63,94,0.2)]'
                        : 'bg-black/50 text-zinc-300 border-white/10 hover:bg-white/5 hover:border-white/20'
                    }`}
                  >
                    {hasVoted === 'against' ? (
                      <AlertCircle className="size-3.5 text-rose-400" />
                    ) : null}
                    <span>Against</span>
                  </button>
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
        
