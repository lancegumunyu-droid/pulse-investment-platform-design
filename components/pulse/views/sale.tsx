'use client'

import React, { useEffect, useState } from 'react'
import { Sparkles, Coins, Zap, ArrowRight, ShieldCheck, RefreshCw } from 'lucide-react'
import { money, usePulse } from '../store'
import { TOKEN } from '@/lib/pulse-data'
import { getSaleProgress } from '@/app/actions/pulse'

// Sale ceiling is a business-configured target, not ledger data — kept as a
// constant. Raised amount is fetched below; it is no longer a hardcoded
// number that never moved.
const SALE_GOAL = 3_000_000

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

export function SaleView() {
  const { state, api, busy, toast, openModal } = usePulse()
  const [usd, setUsd] = useState('200')

  // FIX — this view previously hardcoded SALE_RAISED = 1_842_000. It never
  // changed no matter how many people bought tokens. getSaleProgress() sums
  // every completed token_purchase transaction's real USD cost.
  const [raisedUsd, setRaisedUsd] = useState<number | null>(null)
  const [loadingProgress, setLoadingProgress] = useState(true)

  useEffect(() => {
    let cancelled = false
    setLoadingProgress(true)
    getSaleProgress().then((res) => {
      if (cancelled) return
      if (res.ok) setRaisedUsd(res.raisedUsd)
      setLoadingProgress(false)
    })
    return () => {
      cancelled = true
    }
  }, [])

  const value = Number(usd) || 0
  const baseTokens = value / TOKEN.salePrice
  const bonusTokens = baseTokens * (TOKEN.bonusPct / 100)
  const totalTokens = baseTokens + bonusTokens
  const pct = raisedUsd !== null ? Math.min(100, Math.round((raisedUsd / SALE_GOAL) * 100)) : 0
  const insufficient = value > state.cash

  const heroGlow = useMouseGlow<HTMLDivElement>()
  const calcGlow = useMouseGlow<HTMLDivElement>()

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
    // The bar should move for the buyer immediately, not on next page load.
    setRaisedUsd((prev) => (prev ?? 0) + value)
  }

  return (
    <div className="pulse-executive-shell mx-auto w-full max-w-[480px] space-y-4 pb-24 text-amber-100 antialiased lg:max-w-3xl">
      {/* HEADER */}
      <div className="pulse-glass-card pulse-static flex items-center gap-3 p-4">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-amber-500/30 bg-amber-500/10">
          <Sparkles className="h-4 w-4 text-amber-400" />
        </span>
        <div>
          <h2 className="text-lg font-bold text-white">$PULSE Private Sale</h2>
          <p className="pulse-label mt-0.5 normal-case tracking-normal text-zinc-400">
            Early access to the ecosystem token that powers staking and governance.
          </p>
        </div>
      </div>

      {/* SALE STATS HERO — real raised amount, always-on ambient glow */}
      <div
        ref={heroGlow.ref}
        onPointerMove={heroGlow.onMove}
        onPointerLeave={heroGlow.onLeave}
        className="pulse-hero-premium pulse-glow-track"
      >
        <div className="relative z-[3] p-6 md:p-8">
          <div className="flex items-center justify-between">
            <div>
              <span className="pulse-label">Sale Price</span>
              <div className="pulse-value-xl mt-1 text-4xl">${TOKEN.salePrice.toFixed(2)}</div>
            </div>
            <span className="pulse-chip pulse-chip-green">
              <Zap className="h-3 w-3" /> +{TOKEN.bonusPct}% Bonus
            </span>
          </div>

          <div className="relative z-[3] mt-6">
            <div className="mb-2 flex items-center justify-between">
              {loadingProgress ? (
                <span className="pulse-label flex items-center gap-1.5 normal-case tracking-normal text-zinc-400">
                  <RefreshCw className="h-3 w-3 animate-spin" /> Loading live progress&hellip;
                </span>
              ) : (
                <span className="pulse-value-sm">{pct}% of round raised</span>
              )}
              <span className="pulse-label normal-case tracking-normal text-zinc-400">
                ${money(raisedUsd ?? 0, 0)} <span className="text-zinc-600">/ ${money(SALE_GOAL, 0)}</span>
              </span>
            </div>
            <div className="h-3 w-full overflow-hidden rounded-full border border-white/10 bg-black/60 p-0.5">
              <div
                className="h-full rounded-full bg-gradient-to-r from-amber-600 via-amber-500 to-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.7)] transition-all duration-700"
                style={{ width: `${Math.max(pct > 0 ? 1.5 : 0, pct)}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* CALCULATOR */}
      <div
        ref={calcGlow.ref}
        onPointerMove={calcGlow.onMove}
        onPointerLeave={calcGlow.onLeave}
        className="pulse-glass-card pulse-glow-track space-y-4 p-5"
      >
        <div className="relative z-[3] flex items-center justify-between">
          <p className="pulse-value-md flex items-center gap-2">
            <Coins className="h-4 w-4 text-amber-400" /> USDT Calculator
          </p>
          <span className="pulse-label normal-case tracking-normal text-zinc-500">Instant settlement</span>
        </div>

        <div className="relative z-[3]">
          <span className="pulse-label mb-1.5 block">You pay (USDT)</span>
          <div className="relative">
            <input
              type="number"
              inputMode="decimal"
              value={usd}
              onChange={(e) => setUsd(e.target.value)}
              className="pulse-input pr-16 text-base font-semibold"
              placeholder="0.00"
            />
            <span className="pulse-label absolute right-3.5 top-1/2 -translate-y-1/2 rounded-lg border border-amber-500/25 bg-amber-500/10 px-2 py-1 text-amber-300">
              USDT
            </span>
          </div>
        </div>

        <div className="relative z-[3] space-y-2 rounded-xl border border-white/10 bg-black/40 p-4">
          <Row label="Base tokens" value={`${money(baseTokens, 0)} PULSE`} />
          <Row label={`Bonus (${TOKEN.bonusPct}%)`} value={`+${money(bonusTokens, 0)} PULSE`} tone="green" />
          <div className="my-1 border-t border-white/10" />
          <Row label="Total you receive" value={`${money(totalTokens, 0)} PULSE`} tone="gold" bold />
        </div>

        <div className="relative z-[3] grid grid-cols-4 gap-2">
          {[100, 250, 500, 1000].map((v) => (
            <button
              key={v}
              onClick={() => setUsd(String(v))}
              className={`rounded-xl border py-2.5 text-xs font-semibold transition-all ${
                value === v
                  ? 'border-amber-400/60 bg-amber-500/20 text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.25)]'
                  : 'border-white/10 bg-white/[0.04] text-zinc-400 hover:bg-white/[0.09] hover:text-white'
              }`}
            >
              ${v}
            </button>
          ))}
        </div>

        <button
          onClick={buy}
          disabled={value <= 0 || busy}
          className="relative z-[3] flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-400 via-amber-500 to-amber-300 text-xs font-semibold uppercase tracking-wide text-black shadow-[0_0_25px_rgba(245,158,11,0.4)] transition hover:brightness-110 disabled:opacity-50"
        >
          {busy ? (
            <RefreshCw className="h-4 w-4 animate-spin" />
          ) : insufficient ? (
            'Deposit to continue'
          ) : (
            <>
              <span>Buy {money(totalTokens, 0)} PULSE</span>
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>

        <div className="relative z-[3] flex items-center justify-center gap-1.5">
          <ShieldCheck className="h-3.5 w-3.5 text-amber-400/80" />
          <span className="pulse-label normal-case tracking-normal text-zinc-500">Settlement handled by Pulse</span>
        </div>
      </div>

    </div>
  )
}

function Row({
  label,
  value,
  tone,
  bold,
}: {
  label: string
  value: string
  tone?: 'gold' | 'green'
  bold?: boolean
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="pulse-label normal-case tracking-normal text-zinc-400">{label}</span>
      <span className={bold ? 'pulse-value-md' : tone === 'green' ? 'pulse-value-accent text-emerald-400' : 'pulse-value-sm'}>
        {value}
      </span>
    </div>
  )
}
