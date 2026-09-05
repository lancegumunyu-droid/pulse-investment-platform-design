'use client'

import React, { useState } from 'react'
import { motion, useMotionValue, useMotionTemplate } from 'framer-motion'
import { ArrowRight, CheckCircle2, RefreshCw, ShieldCheck, TrendingUp, Vote, XCircle, Zap } from 'lucide-react'
import { money, usePulse } from '../store'
import { Glass, Pill, RiskNote, SectionTitle } from '../ui-bits'
import { TOKEN } from '@/lib/pulse-data'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const PROPOSALS = [
  { id: 'p1', title: 'Add Namibian green hydrogen project to the platform', forPct: 72, status: 'Active' },
  { id: 'p2', title: 'Lower minimum entry for the Starter tier to $50', forPct: 58, status: 'Active' },
  { id: 'p3', title: 'Allocate 5% of fees to a community reserve', forPct: 81, status: 'Passing' },
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 32, scale: 0.95, filter: 'blur(10px)' },
  visible: { opacity: 1, y: 0, scale: 1, filter: 'blur(0px)', transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] } },
}

export function StakeView() {
  const { state, api, busy, toast } = usePulse()
  const [mode, setMode] = useState<'stake' | 'unstake'>('stake')
  const [amount, setAmount] = useState('')
  const [voted, setVoted] = useState<Record<string, 'for' | 'against'>>({})

  const value = Number(amount) || 0
  const max = mode === 'stake' ? state.pulse : state.staked
  const estYearly = (state.staked * TOKEN.salePrice * TOKEN.stakingApy) / 100
  const mouseX = useMotionValue(200)
  const mouseY = useMotionValue(100)

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const { left, top } = e.currentTarget.getBoundingClientRect()
    mouseX.set(e.clientX - left)
    mouseY.set(e.clientY - top)
  }

  const act = async () => {
    if (value <= 0 || value > max) {
      toast({ title: 'Invalid amount', description: `Max ${money(max, 0)} PULSE.`, variant: 'error' })
      return
    }
    const res = mode === 'stake' ? await api.stake(value) : await api.unstake(value)
    if (!res.ok) {
      toast({ title: 'Action failed', description: res.error, variant: 'error' })
      return
    }
    toast({
      title: mode === 'stake' ? 'Staked successfully' : 'Unstaked successfully',
      description: `${money(value, 0)} PULSE ${mode === 'stake' ? 'is now earning rewards' : 'returned to balance'}.`,
      variant: 'success',
    })
    setAmount('')
  }

  const vote = async (id: string, dir: 'for' | 'against') => {
    if (state.staked <= 0) {
      toast({ title: 'Stake to vote', description: 'You need staked PULSE to participate in governance.', variant: 'error' })
      return
    }
    const res = await api.vote(id, dir)
    if (!res.ok) {
      toast({ title: 'Vote failed', description: res.error, variant: 'error' })
      return
    }
    setVoted((v) => ({ ...v, [id]: dir }))
    toast({ title: 'Vote recorded', description: `Your ${dir === 'for' ? 'support' : 'objection'} was counted.`, variant: 'success' })
  }

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="mx-auto max-w-md space-y-6 px-1 pb-32 pt-2 text-zinc-100 selection:bg-amber-500/30 font-sans">
      <style>{`@keyframes rotateConic { from { transform: rotate(0deg); } to { transform: rotate(360deg); } } @keyframes shimmerSweep { 0% { transform: translateX(-150%) skewX(-25deg); } 50%,100% { transform: translateX(250%) skewX(-25deg); } } @keyframes liquidMove { 0%,100% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } } .stake-conic { animation: rotateConic 6s linear infinite; } .stake-shimmer::after { content: ''; position: absolute; inset: 0; pointer-events: none; background: linear-gradient(90deg, transparent, rgba(255,215,0,.24), transparent); animation: shimmerSweep 3.8s infinite ease-in-out; } .stake-liquid { background-size: 200% 200%; animation: liquidMove 4s infinite ease-in-out; } .stake-noise { background-image: radial-gradient(rgba(255,255,255,.05) 1px, transparent 0); background-size: 12px 12px; } @media (prefers-reduced-motion: reduce) { .stake-conic, .stake-shimmer::after, .stake-liquid { animation: none; } }`}</style>
      <motion.div variants={itemVariants}>
        <SectionTitle
          title="Stake & earn"
          subtitle="Stake $PULSE to earn rewards and vote on platform decisions."
          icon={<Zap className="size-5" />}
        />
      </motion.div>

      <motion.div variants={itemVariants}>
        <div className="relative overflow-hidden rounded-3xl p-[1.5px] shadow-[0_0_40px_rgba(245,158,11,.25)]"><div className="stake-conic pointer-events-none absolute -inset-[180%] bg-[conic-gradient(from_0deg,#f59e0b,transparent_120deg,#10b981_240deg,#f59e0b)] opacity-75" /><Glass gold className="stake-shimmer stake-noise relative border border-amber-500/30 bg-gradient-to-b from-[#18140e] via-[#0f0c08] to-[#050505] p-6 backdrop-blur-2xl">
          <div className="pointer-events-none absolute -right-10 -top-10 size-40 rounded-full bg-gold/10 blur-2xl" />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-wide text-gold font-semibold">Current APY</p>
              <p className="mt-0.5 font-mono text-3xl font-semibold text-white">{TOKEN.stakingApy}%</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Staked</p>
              <p className="font-mono text-lg font-semibold text-white">{money(state.staked, 0)}</p>
              <p className="text-xs text-green font-medium">≈ ${money(estYearly)}/yr rewards</p>
            </div>
          </div>
</Glass></div>
      </motion.div>

      <motion.div variants={itemVariants}>
        <Glass onPointerMove={handlePointerMove} className="stake-noise relative overflow-hidden rounded-3xl border border-amber-500/25 bg-gradient-to-b from-[#161616] via-[#0e0e0e] to-[#080808] p-6 shadow-2xl backdrop-blur-2xl">
          <div className="mb-4 grid grid-cols-2 gap-2">
            {(['stake', 'unstake'] as const).map((m) => (
              <motion.button
                key={m}
                whileTap={{ scale: 0.96 }}
                onClick={() => {
                  setMode(m)
                  setAmount('')
                }}
                className={cn(
                  'rounded-2xl border px-4 py-2.5 text-sm font-semibold capitalize transition-all',
                  mode === m 
                    ? 'border-gold/50 bg-gold/15 text-gold shadow-lg shadow-gold/5' 
                    : 'border-white/10 bg-white/[0.03] text-muted-foreground hover:bg-white/[0.06] hover:text-white',
                )}
              >
                {m}
              </motion.button>
            ))}
          </div>

          <div className="mb-1.5 flex justify-between text-xs text-muted-foreground">
            <span>Amount (PULSE)</span>
            <button onClick={() => setAmount(String(max))} className="font-medium text-gold hover:underline">
              Max {money(max, 0)}
            </button>
          </div>

          <input
            type="number"
            inputMode="decimal"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0"
            className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-3 font-mono text-sm text-white outline-none focus:border-gold/50 focus:bg-white/[0.08] transition-all"
          />

          <motion.div whileTap={{ scale: 0.98 }}>
            <Button
              size="lg"
              className="stake-liquid mt-4 h-13 w-full rounded-xl border border-amber-200/60 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-300 text-xs font-black uppercase tracking-wider text-black shadow-[0_0_28px_rgba(245,158,11,.45)] hover:brightness-110"
              onClick={act}
              disabled={busy}
            >
              {busy ? <RefreshCw className="size-4 animate-spin" /> : <><span>{mode} PULSE</span><ArrowRight className="size-4" /></>}
            </Button>
          </motion.div>

          {state.pulse + state.staked === 0 ? (
            <p className="mt-3 text-center text-xs text-muted-foreground">
              Get $PULSE from the private sale to start staking.
            </p>
          ) : null}
        </Glass>
      </motion.div>

      <motion.div variants={itemVariants} className="space-y-3">
        <SectionTitle title="Governance" subtitle="Staked holders shape the platform." icon={<Vote className="size-5" />} />
        <div className="space-y-3">
          {PROPOSALS.map((p) => (
            <Glass key={p.id} className="border border-white/10 bg-black/40 backdrop-blur-xl p-5">
              <div className="flex items-start justify-between gap-3">
                <p className="text-sm font-medium leading-relaxed text-white">{p.title}</p>
                <Pill tone={p.status === 'Passing' ? 'green' : 'gold'}>{p.status}</Pill>
              </div>

              <div className="mt-4">
                <div className="mb-1.5 flex justify-between text-xs text-muted-foreground font-medium">
                  <span className="text-green">For {p.forPct}%</span>
                  <span className="text-white">Against {100 - p.forPct}%</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
                  <div className="h-full rounded-full bg-green transition-all duration-500" style={{ width: `${p.forPct}%` }} />
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2">
                <motion.div whileTap={{ scale: 0.97 }}>
                  <Button
                    size="sm"
                    variant={voted[p.id] === 'for' ? 'default' : 'outline'}
                    className={cn(
                      'w-full font-semibold transition-all',
                      voted[p.id] === 'for' 
                        ? 'bg-green text-background hover:bg-green/90' 
                        : 'border-white/12 bg-white/[0.03] text-white hover:bg-white/[0.08]'
                    )}
                    onClick={() => vote(p.id, 'for')}
                  >
                    Vote for
                  </Button>
                </motion.div>
                <motion.div whileTap={{ scale: 0.97 }}>
                  <Button
                    size="sm"
                    variant="outline"
                    className={cn(
                      'w-full font-semibold transition-all',
                      voted[p.id] === 'against' 
                        ? 'border-destructive/50 text-destructive bg-destructive/10' 
                        : 'border-white/12 bg-white/[0.03] text-white hover:bg-white/[0.08]'
                    )}
                    onClick={() => vote(p.id, 'against')}
                  >
                    Against
                  </Button>
                </motion.div>
              </div>
            </Glass>
          ))}
        </div>
      </motion.div>

      <motion.div variants={itemVariants}>
        <RiskNote />
      </motion.div>
    </motion.div>
  )
}
