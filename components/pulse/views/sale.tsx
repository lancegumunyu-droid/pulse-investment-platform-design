'use client'

import { useState } from 'react'
import { Sparkles } from 'lucide-react'
import { money, usePulse } from '../store'
import { Glass, Pill, ProgressBar, RiskNote, SectionTitle } from '../ui-bits'
import { TOKEN } from '@/lib/pulse-data'
import { Button } from '@/components/ui/button'

const SALE_RAISED = 1_842_000
const SALE_GOAL = 3_000_000

export function SaleView() {
  const { state, dispatch, toast, openModal } = usePulse()
  const [usd, setUsd] = useState('200')

  const value = Number(usd) || 0
  const baseTokens = value / TOKEN.salePrice
  const bonusTokens = baseTokens * (TOKEN.bonusPct / 100)
  const totalTokens = baseTokens + bonusTokens
  const pct = Math.round((SALE_RAISED / SALE_GOAL) * 100)
  const insufficient = value > state.cash

  const buy = () => {
    if (insufficient) {
      toast({ title: 'Insufficient balance', description: 'Deposit funds to join the sale.', variant: 'error' })
      openModal('deposit')
      return
    }
    dispatch({ type: 'BUY_TOKEN', pulse: Math.round(totalTokens), cost: value })
    toast({
      title: 'Purchase confirmed',
      description: `${Math.round(totalTokens).toLocaleString()} PULSE added (incl. ${TOKEN.bonusPct}% bonus).`,
      variant: 'success',
    })
  }

  return (
    <div className="space-y-5">
      <SectionTitle
        title="$PULSE private sale"
        subtitle="Early access to the ecosystem token that powers staking and governance."
        icon={<Sparkles className="size-5" />}
      />

      <Glass gold className="animate-rise">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-wide text-gold">Sale price</p>
            <p className="mt-0.5 font-mono text-2xl font-semibold">${TOKEN.salePrice.toFixed(2)}</p>
          </div>
          <Pill tone="green">+{TOKEN.bonusPct}% bonus</Pill>
        </div>
        <div className="mt-4">
          <div className="mb-1.5 flex justify-between text-xs text-muted-foreground">
            <span>{pct}% of round raised</span>
            <span>${money(SALE_RAISED, 0)} / ${money(SALE_GOAL, 0)}</span>
          </div>
          <ProgressBar value={pct} tone="gold" />
        </div>
      </Glass>

      <Glass className="animate-rise">
        <p className="mb-3 text-sm font-semibold">USDT calculator</p>
        <label className="block">
          <span className="mb-1.5 block text-xs font-medium text-muted-foreground">You pay (USDT)</span>
          <input
            type="number"
            inputMode="decimal"
            value={usd}
            onChange={(e) => setUsd(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-3 font-mono text-sm outline-none focus:border-gold/50 focus:ring-2 focus:ring-gold/20"
          />
        </label>
        <div className="mt-4 space-y-2 rounded-2xl bg-white/[0.03] p-4 text-sm">
          <Row label="Base tokens" value={`${money(baseTokens, 0)} PULSE`} />
          <Row label={`Bonus (${TOKEN.bonusPct}%)`} value={`+${money(bonusTokens, 0)} PULSE`} tone="green" />
          <div className="my-1 border-t border-white/8" />
          <Row label="Total you receive" value={`${money(totalTokens, 0)} PULSE`} tone="gold" bold />
        </div>
        <div className="mt-2 flex gap-2">
          {[100, 250, 500, 1000].map((v) => (
            <button
              key={v}
              onClick={() => setUsd(String(v))}
              className="flex-1 rounded-xl border border-white/8 bg-white/[0.03] py-2 text-xs font-medium hover:border-gold/40"
            >
              ${v}
            </button>
          ))}
        </div>
        <Button
          size="lg"
          className="mt-4 h-12 w-full bg-gold text-base font-semibold text-primary-foreground hover:bg-gold/90"
          disabled={value <= 0}
          onClick={buy}
        >
          {insufficient ? 'Deposit to continue' : `Buy ${money(totalTokens, 0)} PULSE`}
        </Button>
        <p className="mt-3 text-center text-xs text-muted-foreground">
          Settled via NOWPayments in production · simulated here
        </p>
      </Glass>

      <RiskNote />
    </div>
  )
}

function Row({ label, value, tone, bold }: { label: string; value: string; tone?: 'gold' | 'green'; bold?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span
        className={`font-mono ${bold ? 'text-base font-semibold' : 'font-medium'} ${
          tone === 'gold' ? 'text-gold' : tone === 'green' ? 'text-green' : ''
        }`}
      >
        {value}
      </span>
    </div>
  )
}
