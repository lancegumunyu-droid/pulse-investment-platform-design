'use client'

import { useState } from 'react'
import { Calculator } from 'lucide-react'

interface TokenPricing {
  usdAmount: number
  tokensReceived: number
  bonusTokens: number
  totalTokens: number
  effectivePrice: number
}

const PULSE_TOKEN_PRICING = {
  tiers: [
    { min: 100, max: 999, price: 1.0, bonus: 0 },
    { min: 1000, max: 4999, price: 0.95, bonus: 0.05 },
    { min: 5000, max: 9999, price: 0.90, bonus: 0.1 },
    { min: 10000, max: 49999, price: 0.85, bonus: 0.15 },
    { min: 50000, max: Infinity, price: 0.80, bonus: 0.2 },
  ],
  stakingYield: {
    'starter': 5,
    'silver': 8,
    'gold': 12,
    'platinum': 15,
    'elite': 20,
  },
}

export function TokenCalculator() {
  const [usdAmount, setUsdAmount] = useState<number>(1000)
  const [selectedTier, setSelectedTier] = useState<string>('silver')

  const calculateTokens = (amount: number): TokenPricing => {
    const tier = PULSE_TOKEN_PRICING.tiers.find(
      t => amount >= t.min && amount <= t.max
    ) || PULSE_TOKEN_PRICING.tiers[0]

    const tokensReceived = amount / tier.price
    const bonusPercent = tier.bonus
    const bonusTokens = tokensReceived * bonusPercent
    const totalTokens = tokensReceived + bonusTokens
    const effectivePrice = amount / totalTokens

    return {
      usdAmount: amount,
      tokensReceived: Math.round(tokensReceived * 100) / 100,
      bonusTokens: Math.round(bonusTokens * 100) / 100,
      totalTokens: Math.round(totalTokens * 100) / 100,
      effectivePrice: Math.round(effectivePrice * 1000) / 1000,
    }
  }

  const pricing = calculateTokens(usdAmount)
  const stakingYield = PULSE_TOKEN_PRICING.stakingYield[selectedTier as keyof typeof PULSE_TOKEN_PRICING.stakingYield] || 5
  const annualYield = (pricing.totalTokens * stakingYield) / 100

  return (
    <div className="mx-auto max-w-2xl space-y-6 rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] p-6">
      <div className="flex items-center gap-3">
        <Calculator className="size-6 text-gold" />
        <h2 className="text-2xl font-semibold">PULSE Token Calculator</h2>
      </div>

      {/* USD Amount Input */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-muted-foreground">
          Investment Amount (USD)
        </label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-semibold text-gold">$</span>
          <input
            type="number"
            min="100"
            step="100"
            value={usdAmount}
            onChange={(e) => setUsdAmount(Math.max(100, Number(e.target.value)))}
            className="w-full rounded-xl border border-white/12 bg-white/[0.02] pl-8 pr-4 py-3 font-mono text-lg outline-none placeholder-muted-foreground transition-colors focus:border-gold/50 focus:bg-white/[0.04]"
            placeholder="1000"
          />
        </div>
        <div className="flex gap-2">
          {[500, 1000, 5000, 10000, 50000].map((amount) => (
            <button
              key={amount}
              onClick={() => setUsdAmount(amount)}
              className="rounded-lg border border-white/12 bg-white/[0.04] px-3 py-1.5 text-xs font-medium text-muted-foreground transition-all hover:border-gold/30 hover:bg-white/[0.08] hover:text-gold"
            >
              ${amount.toLocaleString()}
            </button>
          ))}
        </div>
      </div>

      {/* Staking Tier Selection */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-muted-foreground">
          Select Staking Tier
        </label>
        <div className="grid grid-cols-5 gap-2">
          {Object.entries(PULSE_TOKEN_PRICING.stakingYield).map(([tier, yield_]) => (
            <button
              key={tier}
              onClick={() => setSelectedTier(tier)}
              className={`rounded-lg border px-3 py-2 text-xs font-medium capitalize transition-all ${
                selectedTier === tier
                  ? 'border-gold/50 bg-gold/10 text-gold'
                  : 'border-white/12 bg-white/[0.04] text-muted-foreground hover:border-gold/30'
              }`}
            >
              {tier}
              <div className="mt-1 text-xs opacity-75">{yield_}% APY</div>
            </button>
          ))}
        </div>
      </div>

      {/* Results */}
      <div className="space-y-3 rounded-xl border border-gold/20 bg-gold/5 p-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-muted-foreground">Base PULSE Tokens</p>
            <p className="mt-1 text-2xl font-bold text-gold">
              {pricing.tokensReceived.toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Bonus Tokens</p>
            <p className="mt-1 text-2xl font-bold text-green-400">
              +{pricing.bonusTokens.toLocaleString()}
            </p>
          </div>
        </div>

        <div className="border-t border-white/10 pt-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Total PULSE Tokens</span>
            <span className="text-2xl font-bold text-gold">
              {pricing.totalTokens.toLocaleString()}
            </span>
          </div>
        </div>

        <div className="space-y-2 border-t border-white/10 pt-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Effective Price per Token</span>
            <span className="font-mono">${pricing.effectivePrice.toFixed(3)}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">{selectedTier} Tier APY</span>
            <span className="font-mono">{stakingYield}%</span>
          </div>
          <div className="flex items-center justify-between border-t border-white/10 pt-2 text-sm font-semibold">
            <span>Annual Staking Yield</span>
            <span className="text-green-400">{annualYield.toLocaleString()} PULSE</span>
          </div>
          <div className="flex items-center justify-between text-sm font-semibold">
            <span>Annual Yield Value (USD)</span>
            <span className="text-green-400">${(annualYield * pricing.effectivePrice).toLocaleString('en-US', { maximumFractionDigits: 2 })}</span>
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="space-y-2 rounded-lg bg-white/[0.02] p-3 text-xs text-muted-foreground">
        <p>✓ Prices decrease with larger purchases</p>
        <p>✓ Bonus tokens automatically credited to your account</p>
        <p>✓ Staking yield varies by tier (5% - 20% APY)</p>
        <p>✓ 1 PULSE Token = 1 USDT equivalent value</p>
      </div>
    </div>
  )
}
