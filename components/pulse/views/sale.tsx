'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles } from 'lucide-react'
import { money, usePulse } from '../store'
import { Glass, Pill, ProgressBar, RiskNote, SectionTitle } from '../ui-bits'
import { TOKEN } from '@/lib/pulse-data'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const SALE_RAISED = 1_842_000
const SALE_GOAL = 3_000_000

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } },
}

export function SaleView() {
  const { state, api, busy, toast, openModal } = usePulse()
  const [usd, setUsd] = useState('200')

  const value = Number(usd) || 0
  const baseTokens = value / TOKEN.salePrice
  const bonusTokens = baseTokens * (TOKEN.bonusPct / 100)
  const totalTokens = baseTokens + bonusTokens
  const pct = Math.round((SALE_RAISED / SALE_GOAL) * 100)
  const insufficient = value > state.cash

  const buy = async () => {
    if (insufficient) {
      toast({ title: 'Insufficient balance', description: 'Deposit funds to join the sale.', variant: 'error' })
      openModal('deposit')
      return
    }
    const res = await api.buyToken(value, Math.round(totalTokens))
    if (!res.ok) {
      toast({ title: 'Purchase failed', description: res.error, variant: 'error' })
      return
    }
    toast({
      title: 'Purchase confirmed',
      description: `${Math.round(totalTokens).toLocaleString()} PULSE added (incl. ${TOKEN.bonusPct}% bonus).`,
      variant: 'success',
    })
  }

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-5">
      <motion.div variants={itemVariants}>
        <SectionTitle
          title="$PULSE private sale"
          subtitle="Early access to the ecosystem token that powers staking and governance."
          icon={<Sparkles className="size-5" />}
        />
      </motion.div>

      <motion.div variants={itemVariants}>
        <Glass gold className="border border-gold/20 bg-black/40 backdrop-blur-xl p-5 shadow-2xl relative overflow-hidden">
          <div className="pointer-events-none absolute -right-10 -top-10 size-40 rounded-full bg-gold/10 blur-2xl" />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-wide text-gold font-semibold">Sale price</p>
              <p className="mt-0.5 font-mono text-2xl font-semibold text-white">${TOKEN.salePrice.toFixed(2)}</p>
            </div>
            <Pill tone="green">+{TOKEN.bonusPct}% bonus</Pill>
          </div>
          <div className="mt-5">
            <div className="mb-1.5 flex justify-between text-xs text-muted-foreground font-medium">
              <span>{pct}% of round raised</span>
              <span className="font-mono text-white">${money(SALE_RAISED, 0)} / ${money(SALE_GOAL, 0)}</span>
            </div>
            <ProgressBar value={pct} tone="gold" />
          </div>
        </Glass>
      </motion.div>

      <motion.div variants={itemVariants}>
        <Glass className="border border-white/10 bg-black/40 backdrop-blur-xl p-5">
          <p className="mb-4 text-sm font-semibold text-white">USDT calculator</p>
          <label className="block">
            <span className="mb-1.5 block text-xs font-medium text-muted-foreground uppercase tracking-wide">You pay (USDT)</span>
            <input
              type="number"
              inputMode="decimal"
              value={usd}
              onChange={(e) => setUsd(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-3 font-mono text-sm text-white outline-none focus:border-gold/50 focus:bg-white/[0.08] transition-all"
            />
          </label>
          
          <div className="mt-5 space-y-2 rounded-2xl bg-white/[0.03] p-4 border border-white/5">
            <Row label="Base tokens" value={`${money(baseTokens, 0)} PULSE`} />
            <Row label={`Bonus (${TOKEN.bonusPct}%)`} value={`+${money(bonusTokens, 0)} PULSE`} tone="green" />
            <div className="my-1 border-t border-white/10" />
            <Row label="Total you receive" value={`${money(totalTokens, 0)} PULSE`} tone="gold" bold />
          </div>

          <div className="mt-4 flex gap-2">
            {[100, 250, 500, 1000].map((v) => (
              <motion.button
                key={v}
                whileTap={{ scale: 0.95 }}
                onClick={() => setUsd(String(v))}
                className="flex-1 rounded-xl border border-white/10 bg-white/[0.03] py-2 text-xs font-medium text-muted-foreground hover:bg-white/[0.08] hover:text-white transition-all"
              >
                ${v}
              </motion.button>
            ))}
          </div>

          <motion.div whileTap={{ scale: 0.98 }}>
            <Button
              size="lg"
              className="mt-5 h-12 w-full bg-gold text-base font-semibold text-primary-foreground hover:bg-gold/90 shadow-lg shadow-gold/20"
              disabled={value <= 0 || busy}
              onClick={buy}
            >
              {insufficient ? 'Deposit to continue' : `Buy ${money(totalTokens, 0)} PULSE`}
            </Button>
          </motion.div>
          <p className="mt-4 text-center text-[10px] uppercase tracking-wider text-muted-foreground/60">
            Settled via NOWPayments · Simulated
          </p>
        </Glass>
      </motion.div>

      <motion.div variants={itemVariants}>
        <RiskNote />
      </motion.div>
    </motion.div>
  )
}

function Row({ label, value, tone, bold }: { label: string; value: string; tone?: 'gold' | 'green'; bold?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground text-sm">{label}</span>
      <span
        className={cn(
          'font-mono text-sm',
          bold && 'text-base font-semibold',
          tone === 'gold' ? 'text-gold' : tone === 'green' ? 'text-green' : 'text-white'
        )}
      >
        {value}
      </span>
    </div>
  )
}
