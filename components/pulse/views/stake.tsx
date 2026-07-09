'use client'

import { useState } from 'react'
import { Vote, Zap } from 'lucide-react'
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

export function StakeView() {
  const { state, dispatch, toast } = usePulse()
  const [mode, setMode] = useState<'stake' | 'unstake'>('stake')
  const [amount, setAmount] = useState('')
  const [voted, setVoted] = useState<Record<string, 'for' | 'against'>>({})

  const value = Number(amount) || 0
  const max = mode === 'stake' ? state.pulse : state.staked
  const estYearly = (state.staked * TOKEN.salePrice * TOKEN.stakingApy) / 100

  const act = () => {
    if (value <= 0 || value > max) {
      toast({ title: 'Invalid amount', description: `Max ${money(max, 0)} PULSE.`, variant: 'error' })
      return
    }
    dispatch({ type: mode === 'stake' ? 'STAKE' : 'UNSTAKE', amount: value })
    toast({
      title: mode === 'stake' ? 'Staked successfully' : 'Unstaked successfully',
      description: `${money(value, 0)} PULSE ${mode === 'stake' ? 'is now earning rewards' : 'returned to balance'}.`,
      variant: 'success',
    })
    setAmount('')
  }

  const vote = (id: string, dir: 'for' | 'against') => {
    if (state.staked <= 0) {
      toast({ title: 'Stake to vote', description: 'You need staked PULSE to participate in governance.', variant: 'error' })
      return
    }
    setVoted((v) => ({ ...v, [id]: dir }))
    toast({ title: 'Vote recorded', description: `Your ${dir === 'for' ? 'support' : 'objection'} was counted.`, variant: 'success' })
  }

  return (
    <div className="space-y-5">
      <SectionTitle
        title="Stake & earn"
        subtitle="Stake $PULSE to earn rewards and vote on platform decisions."
        icon={<Zap className="size-5" />}
      />

      <Glass gold className="animate-rise">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-wide text-gold">Current APY</p>
            <p className="mt-0.5 font-mono text-3xl font-semibold">{TOKEN.stakingApy}%</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Staked</p>
            <p className="font-mono text-lg font-semibold">{money(state.staked, 0)}</p>
            <p className="text-xs text-green">≈ ${money(estYearly)}/yr rewards</p>
          </div>
        </div>
      </Glass>

      <Glass className="animate-rise">
        <div className="mb-4 grid grid-cols-2 gap-2">
          {(['stake', 'unstake'] as const).map((m) => (
            <button
              key={m}
              onClick={() => {
                setMode(m)
                setAmount('')
              }}
              className={cn(
                'rounded-2xl border px-4 py-2.5 text-sm font-semibold capitalize transition-colors',
                mode === m ? 'border-gold/50 bg-gold-soft text-gold' : 'border-white/8 bg-white/[0.03] text-muted-foreground',
              )}
            >
              {m}
            </button>
          ))}
        </div>
        <div className="mb-1.5 flex justify-between text-xs text-muted-foreground">
          <span>Amount (PULSE)</span>
          <button onClick={() => setAmount(String(max))} className="font-medium text-gold">
            Max {money(max, 0)}
          </button>
        </div>
        <input
          type="number"
          inputMode="decimal"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="0"
          className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-3 font-mono text-sm outline-none focus:border-gold/50 focus:ring-2 focus:ring-gold/20"
        />
        <Button
          size="lg"
          className="mt-4 h-12 w-full bg-gold text-base font-semibold text-primary-foreground hover:bg-gold/90 capitalize"
          onClick={act}
        >
          {mode} PULSE
        </Button>
        {state.pulse + state.staked === 0 ? (
          <p className="mt-3 text-center text-xs text-muted-foreground">
            Get $PULSE from the private sale to start staking.
          </p>
        ) : null}
      </Glass>

      <div>
        <SectionTitle title="Governance" subtitle="Staked holders shape the platform." icon={<Vote className="size-5" />} />
        <div className="space-y-3">
          {PROPOSALS.map((p) => (
            <Glass key={p.id} className="animate-rise">
              <div className="flex items-start justify-between gap-3">
                <p className="text-sm font-medium leading-relaxed">{p.title}</p>
                <Pill tone={p.status === 'Passing' ? 'green' : 'gold'}>{p.status}</Pill>
              </div>
              <div className="mt-3">
                <div className="mb-1 flex justify-between text-xs text-muted-foreground">
                  <span className="text-green">For {p.forPct}%</span>
                  <span>Against {100 - p.forPct}%</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-destructive/30">
                  <div className="h-full rounded-full bg-green" style={{ width: `${p.forPct}%` }} />
                </div>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <Button
                  size="sm"
                  variant={voted[p.id] === 'for' ? 'default' : 'outline'}
                  className={cn('font-semibold', voted[p.id] === 'for' ? 'bg-green text-background hover:bg-green/90' : 'border-white/12 bg-white/[0.03]')}
                  onClick={() => vote(p.id, 'for')}
                >
                  Vote for
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className={cn('font-semibold', voted[p.id] === 'against' ? 'border-destructive/50 text-destructive' : 'border-white/12 bg-white/[0.03]')}
                  onClick={() => vote(p.id, 'against')}
                >
                  Against
                </Button>
              </div>
            </Glass>
          ))}
        </div>
      </div>

      <RiskNote />
    </div>
  )
}
