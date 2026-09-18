'use client'

import React from 'react'
import { ArrowUpRight, Check, ChevronRight, Layers, Lock } from 'lucide-react'
import { money, usePulse } from '../store'
import { TIERS } from '@/lib/pulse-data'

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

export function InvestView() {
  const { totalInvested, currentTier, openModal } = usePulse()
  const heroGlow = useMouseGlow<HTMLDivElement>()

  return (
    <div className="pulse-executive-shell mx-auto w-full max-w-[480px] space-y-4 pb-24 text-amber-100 antialiased lg:max-w-3xl">
      {/* HEADER */}
      <div className="pulse-glass-card pulse-static flex items-center gap-3 p-4">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-amber-500/30 bg-amber-500/10">
          <Layers className="h-4 w-4 text-amber-400" />
        </span>
        <div>
          <h2 className="text-lg font-bold text-white">Progressive Share Tiers</h2>
          <p className="pulse-label mt-0.5 normal-case tracking-normal text-zinc-400">
            Tiers unlock automatically as your total investment grows — no recruitment required.
          </p>
        </div>
      </div>

      {/* TOTAL INVESTED HERO — real state.holdings total, always-on glow */}
      <div
        ref={heroGlow.ref}
        onPointerMove={heroGlow.onMove}
        onPointerLeave={heroGlow.onLeave}
        className="pulse-hero-premium pulse-glow-track"
      >
        <div className="relative z-[3] flex items-start justify-between gap-3 p-6 md:p-8">
          <div>
            <span className="pulse-label">Your total invested</span>
            <div className="pulse-value-xl mt-2 text-4xl">${money(totalInvested)}</div>
          </div>
          <span className="pulse-chip pulse-chip-green">
            <span className="pulse-sync-dot" /> Active
          </span>
        </div>
        <div className="pulse-hero-telemetry relative z-[3] flex items-center justify-between px-6 py-4 md:px-8">
          <span className="pulse-label normal-case tracking-normal text-zinc-400">
            Current: <span className="pulse-value-sm">{currentTier.name} tier</span>
          </span>
          <span className="pulse-chip pulse-chip-green">
            {currentTier.yieldLabel} target <ArrowUpRight className="h-3 w-3" />
          </span>
        </div>
      </div>

      {/* TIER LIST — TIERS is static product config from lib/pulse-data.ts,
          not ledger data. Which tier is "current" and "unlocked" derives
          entirely from the real totalInvested figure above. */}
      <div className="space-y-3">
        {TIERS.map((tier, i) => {
          const unlocked = totalInvested >= tier.minInvest
          const isCurrent = currentTier.id === tier.id

          return (
            <div
              key={tier.id}
              className={`pulse-glass-card space-y-4 p-5 ${isCurrent ? 'pulse-glow-frame' : ''} ${
                !unlocked ? 'opacity-70' : ''
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <span
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border font-mono text-sm font-bold tabular-nums ${
                      isCurrent
                        ? 'border-amber-400/60 bg-gradient-to-tr from-amber-500 to-amber-300 text-black'
                        : unlocked
                          ? 'border-amber-500/30 bg-amber-500/15 text-amber-400'
                          : 'border-white/10 bg-white/[0.04] text-zinc-500'
                    }`}
                  >
                    0{i + 1}
                  </span>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="truncate text-base font-bold text-white">{tier.name}</p>
                      {isCurrent && <span className="pulse-chip pulse-chip-gold">Active</span>}
                    </div>
                    <p className="pulse-label mt-0.5 normal-case tracking-normal text-zinc-400">
                      From ${money(tier.minInvest, 0)}
                    </p>
                  </div>
                </div>
                <span className="pulse-chip pulse-chip-green shrink-0">{tier.yieldLabel}</span>
              </div>

              <ul className="space-y-2.5 border-t border-white/[0.06] pt-3">
                {tier.perks.map((perk) => (
                  <li key={perk} className="flex items-start gap-2.5 text-xs font-medium text-zinc-300">
                    <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border border-emerald-500/40 bg-emerald-500/20">
                      <Check className="h-2.5 w-2.5 text-emerald-400" />
                    </span>
                    <span>{perk}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => openModal('invest', { amount: tier.minInvest })}
                className={`flex h-12 w-full items-center justify-center gap-2 rounded-xl text-xs font-semibold uppercase tracking-wide transition ${
                  unlocked
                    ? 'bg-gradient-to-r from-amber-400 via-amber-500 to-amber-300 text-black shadow-[0_8px_24px_-8px_rgba(245,158,11,0.7)] hover:brightness-110'
                    : 'border border-white/15 bg-white/[0.04] text-zinc-200 hover:border-amber-500/40 hover:bg-white/[0.08]'
                }`}
              >
                {unlocked ? (
                  <>
                    <span>Add to this tier</span>
                    <ChevronRight className="h-4 w-4 shrink-0" />
                  </>
                ) : (
                  <>
                    <Lock className="h-4 w-4 shrink-0 text-amber-400" />
                    <span>Unlock with ${money(tier.minInvest, 0)}</span>
                  </>
                )}
              </button>
            </div>
          )
        })}
      </div>

    </div>
  )
}
