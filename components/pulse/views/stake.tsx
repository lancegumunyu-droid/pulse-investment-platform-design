'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Zap, Vote, CheckCircle2, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
    transition: { staggerChildren: 0.06, delayChildren: 0.02 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] },
  },
}

export function StakeView() {
  const [activeTab, setActiveTab] = useState<'stake' | 'unstake'>('stake')
  const [stakeAmount, setStakeAmount] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [votedProposals, setVotedProposals] = useState<Record<string, 'for' | 'against'>>({})

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
      <motion.div variants={itemVariants} className="flex items-center gap-3">
        <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 shrink-0">
          <Zap className="size-5 fill-amber-400/20" />
        </div>
        <div>
          <h2 className="text-base font-bold text-white leading-tight tracking-tight">Stake & earn</h2>
          <p className="text-[11px] text-zinc-400 leading-normal">
            Stake $PULSE to earn rewards and vote on platform decisions.
          </p>
        </div>
      </motion.div>

      {/* Hero APY & Staked Banner with Shimmer Effect */}
      <motion.div variants={itemVariants}>
        <div className="relative overflow-hidden rounded-2xl border border-amber-500/25 bg-gradient-to-b from-[#18150e] to-[#0a0a08] p-4 shadow-xl">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-400/5 to-transparent -translate-x-full animate-[shimmer_3s_infinite]" />
          
          <div className="flex justify-between items-start relative z-10">
            <div>
              <span className="text-[9px] font-black uppercase tracking-widest text-amber-400/90 font-sans">
                CURRENT APY
              </span>
              <div className="text-2xl sm:text-3xl font-extrabold font-mono text-amber-400 tracking-tight mt-0.5">
                24.8%
              </div>
            </div>
            <div className="text-right">
              <span className="text-[9px] font-black uppercase tracking-widest text-zinc-400 font-sans">
                STAKED
              </span>
              <div className="text-lg sm:text-xl font-bold font-mono text-white mt-0.5">
                3,300
              </div>
              <span className="text-[10px] font-mono font-medium text-emerald-400">
                ≈ $65.47/yr rewards
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stake / Unstake Form Box */}
      <motion.div variants={itemVariants}>
        <div className="rounded-2xl border border-white/10 bg-[#111111] p-4 shadow-xl space-y-3.5">
          <div className="grid grid-cols-2 gap-1 p-1 rounded-xl bg-black/50 border border-white/5">
            <button
              type="button"
              onClick={() => setActiveTab('stake')}
              className={`py-1.5 text-xs font-bold rounded-lg transition-all duration-200 ${
                activeTab === 'stake'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Stake
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('unstake')}
              className={`py-1.5 text-xs font-bold rounded-lg transition-all duration-200 ${
                activeTab === 'unstake'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Unstake
            </button>
          </div>

          <form onSubmit={handleStakeSubmit} className="space-y-3">
            <div>
              <div className="flex justify-between text-[11px] font-semibold text-zinc-400 mb-1">
                <span>Amount (PULSE)</span>
                <span className="text-amber-400/90 font-mono">Max 45,171</span>
              </div>
              <div className="relative">
                <Input
                  type="number"
                  placeholder="0"
                  value={stakeAmount}
                  onChange={(e) => setStakeAmount(e.target.value)}
                  className="bg-black/60 border-white/10 text-white placeholder:text-zinc-600 focus:border-amber-400/80 h-11 text-sm rounded-xl font-mono pr-14"
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={isSubmitting || !stakeAmount || Number(stakeAmount) <= 0}
              className="w-full h-11 bg-amber-400 hover:bg-amber-300 text-black font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md shadow-amber-500/10"
            >
              {isSubmitting ? (
                <div className="size-4 border-2 border-black/20 border-t-black rounded-full animate-spin" />
              ) : (
                <span>{activeTab === 'stake' ? 'Stake PULSE' : 'Unstake PULSE'}</span>
              )}
            </Button>
          </form>
        </div>
      </motion.div>

      {/* Governance Section */}
      <motion.div variants={itemVariants} className="space-y-2.5">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 shrink-0">
            <Vote className="size-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white leading-tight">Governance</h3>
            <p className="text-[11px] text-zinc-400">Staked holders shape the platform.</p>
          </div>
        </div>

        {/* Shimmering Governance Proposal Cards */}
        <div className="space-y-2.5">
          {GOVERNANCE_PROPOSALS.map((prop) => {
            const hasVoted = votedProposals[prop.id]
            return (
              <div
                key={prop.id}
                className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-[#141414] to-[#0a0a0a] p-3.5 shadow-lg space-y-2.5 transition-all duration-300 hover:border-amber-500/30"
              >
                <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-amber-400/40 to-transparent -translate-x-full animate-[shimmer_4s_infinite]" />

                <div className="flex items-start justify-between gap-2">
                  <h4 className="text-xs font-semibold text-white leading-snug pr-2">{prop.title}</h4>
                  <span
                    className={`text-[9px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full border shrink-0 ${
                      prop.status === 'Active'
                        ? 'bg-amber-500/10 text-amber-300 border-amber-500/20'
                        : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                    }`}
                  >
                    {prop.status}
                  </span>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] font-mono font-semibold">
                    <span className="text-emerald-400">For {prop.forPct}%</span>
                    <span className="text-zinc-400">Against {prop.againstPct}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-black/60 rounded-full overflow-hidden border border-white/5 flex">
                    <div
                      className="bg-emerald-500 h-full transition-all duration-500"
                      style={{ width: `${prop.forPct}%` }}
                    />
                    <div
                      className="bg-zinc-700 h-full transition-all duration-500"
                      style={{ width: `${prop.againstPct}%` }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-0.5">
                  <button
                    type="button"
                    onClick={() => handleVote(prop.id, 'for')}
                    className={`py-1.5 px-2 rounded-xl border text-xs font-semibold transition-all flex items-center justify-center gap-1 ${
                      hasVoted === 'for'
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                        : 'bg-black/40 text-zinc-300 border-white/10 hover:bg-white/5'
                    }`}
                  >
                    {hasVoted === 'for' && <CheckCircle2 className="size-3 text-emerald-400" />}
                    <span>Vote for</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleVote(prop.id, 'against')}
                    className={`py-1.5 px-2 rounded-xl border text-xs font-semibold transition-all flex items-center justify-center gap-1 ${
                      hasVoted === 'against'
                        ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                        : 'bg-black/40 text-zinc-300 border-white/10 hover:bg-white/5'
                    }`}
                  >
                    {hasVoted === 'against' && <AlertCircle className="size-3 text-rose-400" />}
                    <span>Against</span>
                  </button>
                </div>
              </div>
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
              
