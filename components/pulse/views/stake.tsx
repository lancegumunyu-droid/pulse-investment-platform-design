import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Zap, Vote, CheckCircle2, AlertCircle, TrendingUp, ArrowRight, Loader2 } from 'lucide-react'
import { money, usePulse } from '../store'
import { TOKEN } from '@/lib/pulse-data'

const STAKE_APY = TOKEN.stakingApy ?? 24.8

interface GovernanceProposal {
  id: string
  title: string
  status: 'Active' | 'Passing' | 'Closed'
  forPct: number
  againstPct: number
}

const GOVERNANCE_PROPOSALS: GovernanceProposal[] = [
  { id: 'gov-1', title: 'Add Namibian green hydrogen project to the platform', status: 'Active', forPct: 72, againstPct: 28 },
  { id: 'gov-2', title: 'Lower minimum entry for the Starter tier to $50', status: 'Active', forPct: 58, againstPct: 42 },
  { id: 'gov-3', title: 'Allocate 5% of fees to a community reserve', status: 'Passing', forPct: 81, againstPct: 19 },
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.04 } },
}
const itemVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.98 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } },
}

function useMouseGlow<T extends HTMLElement>() {
  const ref = React.useRef<T | null>(null)
  const onMove = (e: React.PointerEvent<T>) => {
    const el = ref.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    el.style.setProperty('--mx', `${e.clientX - rect.left}px`)
    el.style.setProperty('--my', `${e.clientY - rect.top}px`)
  }
  const onLeave = () => {
    const el = ref.current
    if (!el) return
    el.style.removeProperty('--mx')
    el.style.removeProperty('--my')
  }
  return { ref, onMove, onLeave }
}

export function StakeView() {
  // FIX — this entire view was fake. APY, the staked figure (3,300) and the
  // Max button (45,171) were hardcoded literals, and handleStakeSubmit ran a
  // setTimeout then cleared the input. api.stake() was never called, so
  // nothing was ever staked and no transaction was ever written. Everything
  // below now reads state and calls the real server actions.
  const { state, api, busy, toast, currentTier } = usePulse()
  const [activeTab, setActiveTab] = useState<'stake' | 'unstake'>('stake')
  const [amount, setAmount] = useState('')
  const [votedProposals, setVotedProposals] = useState<Record<string, 'for' | 'against'>>({})
  const [votingId, setVotingId] = useState<string | null>(null)

  const heroGlow = useMouseGlow<HTMLDivElement>()

  const isStaking = activeTab === 'stake'
  const available = isStaking ? state.pulse : state.staked
  const amountNum = Number(amount) || 0
  const exceeds = amountNum > available
  const annualReward = (state.staked * STAKE_APY) / 100
  const projectedReward = (amountNum * STAKE_APY) / 100

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!amountNum || amountNum <= 0 || exceeds) return

    const res = isStaking ? await api.stake(amountNum) : await api.unstake(amountNum)

    if (res.ok) {
      toast({
        title: isStaking ? 'PULSE staked' : 'PULSE unstaked',
        description: `${amountNum.toLocaleString()} PULSE ${isStaking ? 'moved into the vault' : 'returned to your liquid balance'}.`,
        variant: 'success',
      })
      setAmount('')
    } else {
      toast({ title: isStaking ? 'Stake failed' : 'Unstake failed', description: res.error, variant: 'error' })
    }
  }

  const handleVote = async (proposalId: string, choice: 'for' | 'against') => {
    if (state.staked <= 0) {
      toast({ title: 'Stake PULSE to vote', description: 'Governance weight comes from your staked balance.', variant: 'error' })
      return
    }
    setVotingId(proposalId)
    const res = await api.vote(proposalId, choice)
    setVotingId(null)
    if (res.ok) {
      setVotedProposals((prev) => ({ ...prev, [proposalId]: choice }))
      toast({ title: 'Vote recorded', variant: 'success' })
    } else {
      toast({ title: 'Could not record vote', description: res.error, variant: 'error' })
    }
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="pulse-executive-shell mx-auto w-full max-w-[480px] space-y-4 pb-24 text-amber-100 antialiased lg:max-w-3xl"
    >
      {/* HEADER */}
      <motion.div variants={itemVariants} className="pulse-glass-card pulse-static flex items-center gap-3 p-4">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-amber-500/30 bg-amber-500/10">
          <Zap className="h-4 w-4 text-amber-400" />
        </span>
        <div>
          <h2 className="text-lg font-bold text-white">Stake &amp; Earn</h2>
          <p className="pulse-label mt-0.5 normal-case tracking-normal text-zinc-400">
            Stake $PULSE to earn rewards and vote on platform decisions.
          </p>
        </div>
      </motion.div>

      {/* HERO — live APY and real staked balance */}
      <motion.div variants={itemVariants}>
        <div
          ref={heroGlow.ref}
          onPointerMove={heroGlow.onMove}
          onPointerLeave={heroGlow.onLeave}
          className="pulse-hero-premium pulse-hero-violet pulse-glow-track"
        >
          <div className="relative z-[3] flex items-start justify-between gap-4 p-6 md:p-8">
            <div>
              <span className="pulse-label">Current APY</span>
              <div className="pulse-value-xl mt-2 text-amber-400">{STAKE_APY}%</div>
              <p className="pulse-label mt-1.5 normal-case tracking-normal text-zinc-400">
                Variable — not a guaranteed rate
              </p>
            </div>
            <div className="text-right">
              <span className="pulse-label">Staked</span>
              <div className="pulse-value-md mt-2 text-xl">{money(state.staked, 0)}</div>
              <span className="mt-1 flex items-center justify-end gap-1 pulse-value-accent text-xs text-emerald-400">
                <TrendingUp className="h-3 w-3" /> ~${money(annualReward)}/yr
              </span>
            </div>
          </div>

          <div className="pulse-hero-telemetry relative z-[3] grid grid-cols-3 px-6 py-4 text-center md:px-8">
            <div>
              <span className="pulse-label block">Liquid</span>
              <div className="pulse-value-sm mt-1">{money(state.pulse, 0)}</div>
            </div>
            <div>
              <span className="pulse-label block">Staked</span>
              <div className="pulse-value-accent mt-1">{money(state.staked, 0)}</div>
            </div>
            <div>
              <span className="pulse-label block">Tier</span>
              <div className="pulse-value-sm mt-1">{currentTier.name}</div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* STAKE / UNSTAKE */}
      <motion.div variants={itemVariants} className="pulse-glass-card pulse-static space-y-4 p-5">
        <div className="grid grid-cols-2 gap-1.5 rounded-xl border border-white/10 bg-black/50 p-1.5">
          {(['stake', 'unstake'] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => {
                setActiveTab(tab)
                setAmount('')
              }}
              className={`rounded-lg py-2 text-xs font-semibold uppercase tracking-wide transition-all ${
                activeTab === tab
                  ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-black shadow-[0_0_20px_rgba(245,158,11,0.45)]'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <span className="pulse-label">Amount (PULSE)</span>
              <button
                type="button"
                onClick={() => setAmount(available > 0 ? String(Math.floor(available)) : '')}
                className="rounded-md border border-amber-500/25 bg-amber-500/10 px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wide text-amber-400 transition hover:bg-amber-500/20"
              >
                Max {money(available, 0)}
              </button>
            </div>
            <input
              type="number"
              inputMode="decimal"
              placeholder="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="pulse-input h-12 text-base"
            />
            {exceeds && (
              <p className="pulse-label mt-1.5 normal-case tracking-normal text-rose-400">
                Amount exceeds your {isStaking ? 'liquid' : 'staked'} balance of {money(available, 0)} PULSE.
              </p>
            )}
          </div>

          {amountNum > 0 && !exceeds && isStaking && (
            <div className="flex items-center justify-between rounded-xl border border-white/10 bg-black/30 px-3.5 py-2.5">
              <span className="pulse-label normal-case tracking-normal text-zinc-400">Projected annual reward</span>
              <span className="pulse-value-accent">~${money(projectedReward)}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={busy || !amountNum || amountNum <= 0 || exceeds}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-400 via-amber-500 to-amber-400 text-xs font-semibold uppercase tracking-wide text-black shadow-[0_0_25px_rgba(245,158,11,0.35)] transition hover:brightness-110 disabled:opacity-50"
          >
            {busy ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <Zap className="h-4 w-4" />
                <span>{isStaking ? 'Stake PULSE' : 'Unstake PULSE'}</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>
      </motion.div>

      {/* GOVERNANCE */}
      <motion.div variants={itemVariants} className="pulse-glass-card pulse-static overflow-hidden">
        <div className="pulse-vault-header">
          <div>
            <p className="pulse-value-md flex items-center gap-1.5">
              <Vote className="h-4 w-4 text-amber-400" /> Governance
            </p>
            <p className="pulse-label mt-0.5 normal-case tracking-normal text-zinc-400">
              Staked holders shape the platform.
            </p>
          </div>
          <span className={state.staked > 0 ? 'pulse-chip pulse-chip-green' : 'pulse-chip pulse-chip-muted'}>
            {state.staked > 0 ? `${money(state.staked, 0)} weight` : 'No weight'}
          </span>
        </div>

        <div className="divide-y divide-white/[0.06]">
          {GOVERNANCE_PROPOSALS.map((prop) => {
            const hasVoted = votedProposals[prop.id]
            return (
              <div key={prop.id} className="space-y-3 p-4">
                <div className="flex items-start justify-between gap-2">
                  <h4 className="pr-2 text-xs font-semibold leading-snug text-white">{prop.title}</h4>
                  <span className={prop.status === 'Active' ? 'pulse-chip pulse-chip-gold' : 'pulse-chip pulse-chip-green'}>
                    {prop.status}
                  </span>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between font-mono text-[10px] font-semibold tabular-nums">
                    <span className="text-emerald-400">For {prop.forPct}%</span>
                    <span className="text-zinc-400">Against {prop.againstPct}%</span>
                  </div>
                  <div className="flex h-2 w-full overflow-hidden rounded-full border border-white/5 bg-black/70 p-0.5">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${prop.forPct}%` }}
                      transition={{ duration: 1, ease: 'easeOut' }}
                      className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.6)]"
                    />
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${prop.againstPct}%` }}
                      transition={{ duration: 1, ease: 'easeOut', delay: 0.1 }}
                      className="ml-0.5 h-full rounded-full bg-zinc-700"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    disabled={busy || votingId === prop.id}
                    onClick={() => handleVote(prop.id, 'for')}
                    className={`flex items-center justify-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-semibold transition-all disabled:opacity-50 ${
                      hasVoted === 'for'
                        ? 'border-emerald-500/50 bg-emerald-500/20 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                        : 'border-white/10 bg-black/50 text-zinc-300 hover:border-white/20 hover:bg-white/5'
                    }`}
                  >
                    {votingId === prop.id ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      hasVoted === 'for' && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                    )}
                    <span>Vote for</span>
                  </button>

                  <button
                    type="button"
                    disabled={busy || votingId === prop.id}
                    onClick={() => handleVote(prop.id, 'against')}
                    className={`flex items-center justify-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-semibold transition-all disabled:opacity-50 ${
                      hasVoted === 'against'
                        ? 'border-rose-500/50 bg-rose-500/20 text-rose-300 shadow-[0_0_15px_rgba(244,63,94,0.3)]'
                        : 'border-white/10 bg-black/50 text-zinc-300 hover:border-white/20 hover:bg-white/5'
                    }`}
                  >
                    {hasVoted === 'against' && <AlertCircle className="h-3.5 w-3.5 text-rose-400" />}
                    <span>Against</span>
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </motion.div>

    </motion.div>
  )
}
