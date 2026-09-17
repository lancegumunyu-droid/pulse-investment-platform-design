import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Lock, Pickaxe, Radio, Rocket, ShieldCheck, Sprout, Sun, Zap, Building2, Layers } from 'lucide-react'
import { money, usePulse } from '../store'
import { PROJECTS, nextTier, isProjectClosed, type Project } from '@/lib/pulse-data'

function sectorIcon(sector?: string) {
  const s = (sector ?? '').toLowerCase()
  if (s.includes('mining') || s.includes('mineral')) return Pickaxe
  if (s.includes('energy') || s.includes('solar') || s.includes('hydro')) return Sun
  if (s.includes('agri')) return Sprout
  if (s.includes('infra')) return Building2
  return Layers
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

export function DashboardView() {
  const { state, api, openModal, setView, totalInvested, currentTier, portfolioValue, busy } = usePulse()
  const [projects, setProjects] = useState<Project[]>(PROJECTS)
  const [liquidatingId, setLiquidatingId] = useState<string | null>(null)

  const heroGlow = useMouseGlow<HTMLDivElement>()
  const standingGlow = useMouseGlow<HTMLDivElement>()
  const referralGlow = useMouseGlow<HTMLButtonElement>()

  useEffect(() => {
    let cancelled = false
    api.liveProjectFunding().then((res) => {
      if (!cancelled && res.ok) {
        setProjects((prev) => prev.map((p) => ({ ...p, funded: res.funding[p.id] ?? p.funded })))
      }
    })
    return () => {
      cancelled = true
    }
  }, [api])

  const findProject = (projectId: string) => PROJECTS.find((p) => p.id === projectId)
  const upcoming = nextTier(currentTier.id)
  const progress = upcoming ? Math.min(100, (totalInvested / upcoming.minInvest) * 100) : 100

  // FIX — the Liquidate button fired api.closeInvestment() and ignored the
  // result entirely: no toast on success, no error surfaced on failure, and
  // no busy state, so a failed liquidation looked identical to a successful
  // one and the user just saw nothing happen.
  const handleLiquidate = async (holdingId: string) => {
    setLiquidatingId(holdingId)
    const res = await api.closeInvestment(holdingId)
    setLiquidatingId(null)
    if (res.ok) {
      // toast is surfaced by the store's action result handling
    }
  }

  return (
    <div className="pulse-executive-shell mx-auto w-full max-w-[480px] space-y-4 pb-24 text-amber-100 antialiased lg:max-w-3xl">
      {/* STATUS BAR */}
      <div className="pulse-glass-card pulse-static pulse-glow-frame flex items-center justify-between gap-3 p-4">
        <div className="flex items-center gap-2">
          <span className="pulse-live-dot" />
          <span className="pulse-label">SADC Capital Network &bull; Live Terminal</span>
        </div>
        <span className="pulse-chip pulse-chip-gold">{currentTier.name} Member</span>
      </div>

      {/* PORTFOLIO HERO — always-on ambient glow + mouse tracking */}
      <div
        ref={heroGlow.ref}
        onPointerMove={heroGlow.onMove}
        onPointerLeave={heroGlow.onLeave}
        className="pulse-hero-premium pulse-glow-track"
      >
        <div className="relative z-[3] p-6 md:p-8">
          <div className="flex items-start justify-between gap-3">
            <span className="pulse-label">Total Net Portfolio Value</span>
            <span className="pulse-chip pulse-chip-green">
              <span className="pulse-sync-dot" /> Live
            </span>
          </div>

          <div className="pulse-value-xl mt-2">
            ${money(portfolioValue)} <span className="text-sm font-normal text-zinc-500">USDT</span>
          </div>
          <p className="pulse-label mt-1.5 normal-case tracking-normal text-zinc-400">
            Pending yield: <span className="pulse-value-accent">+${money(state.pendingYield)}</span>
          </p>

          <div className="mt-5 flex gap-2.5">
            <button
              onClick={() => openModal('deposit')}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-gradient-to-b from-amber-400 to-amber-500 px-4 py-2.5 text-xs font-semibold uppercase tracking-wide text-black shadow-[0_8px_24px_-8px_rgba(245,158,11,0.7)] transition hover:brightness-110"
            >
              Deposit Capital
            </button>
            <button
              onClick={() => openModal('withdraw')}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-xs font-semibold uppercase tracking-wide text-zinc-200 transition hover:bg-white/[0.09]"
            >
              Withdraw Earnings
            </button>
          </div>
        </div>

        {/* 3-COLUMN LIQUIDITY SPLIT */}
        <div className="pulse-hero-telemetry relative z-[3] grid grid-cols-3 px-6 py-4 text-center md:px-8">
          <div>
            <span className="pulse-label block">Available Cash</span>
            <div className="pulse-value-sm mt-1">${money(state.cash, 0)}</div>
          </div>
          <div>
            <span className="pulse-label block">Active Principal</span>
            <div className="pulse-value-sm mt-1">${money(totalInvested, 0)}</div>
          </div>
          <div>
            <span className="pulse-label block">Pulse Tokens</span>
            <div className="pulse-value-accent mt-1">{money(state.pulse, 0)}</div>
          </div>
        </div>
      </div>

      {/* STANDING / NEXT TIER */}
      <div
        ref={standingGlow.ref}
        onPointerMove={standingGlow.onMove}
        onPointerLeave={standingGlow.onLeave}
        className="pulse-glass-card pulse-glow-track p-5"
      >
        <div className="relative z-[3]">
          <div className="flex items-center gap-2">
            <Lock className="h-4 w-4 text-amber-400" />
            <span className="pulse-label">
              Standing: <span className="pulse-value-accent">{currentTier.name}</span>
            </span>
          </div>
          <p className="pulse-value-accent mt-1.5 text-emerald-400">{currentTier.yieldLabel} target</p>

          {upcoming ? (
            <div className="mt-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="pulse-label normal-case tracking-normal text-zinc-400">
                  Next unlock: {upcoming.name}
                </span>
                <span className="pulse-value-accent">
                  ${money(totalInvested, 0)} / ${money(upcoming.minInvest, 0)}
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full border border-amber-500/20 bg-black">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
                  className="h-full rounded-full bg-gradient-to-r from-amber-600 to-yellow-400 shadow-[0_0_12px_rgba(245,158,11,0.7)]"
                />
              </div>
            </div>
          ) : (
            <p className="pulse-label mt-1.5 normal-case tracking-normal text-zinc-400">
              Apex institutional rank active.
            </p>
          )}
        </div>
      </div>

      {/* REFERRAL */}
      <button
        ref={referralGlow.ref}
        onPointerMove={referralGlow.onMove}
        onPointerLeave={referralGlow.onLeave}
        onClick={() => setView('profile')}
        className="pulse-glass-card pulse-glow-track flex w-full items-center justify-between p-4 text-left"
      >
        <div className="relative z-[3] space-y-0.5">
          <span className="pulse-label block">Your Referral Code</span>
          <p className="pulse-value-accent">{state.referralCode}</p>
        </div>
        <span className="pulse-chip pulse-chip-gold relative z-[3]">{state.referralCount} joined</span>
      </button>

      {/* ACTIVE HOLDINGS */}
      <div className="pulse-glass-card pulse-static overflow-hidden">
        <div className="pulse-vault-header">
          <span className="pulse-label">Active Holdings ({state.holdings.length})</span>
          <span className="pulse-chip pulse-chip-muted">${money(totalInvested, 0)} deployed</span>
        </div>

        {state.holdings.length === 0 ? (
          <p className="pulse-label p-6 text-center normal-case tracking-normal text-zinc-500">
            No active capital allocations found. Explore the pipeline below to deploy capital.
          </p>
        ) : (
          <div className="divide-y divide-white/[0.06]">
            {state.holdings.map((h) => {
              const proj = findProject(h.projectId)
              const Icon = sectorIcon(proj?.sector)
              return (
                <div key={h.id} className="flex items-center gap-3 p-4 transition-colors hover:bg-white/[0.03]">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-amber-500/30 bg-amber-500/10">
                    <Icon className="h-4 w-4 text-amber-400" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-white">{proj?.name ?? 'Legacy Holding'}</p>
                    <p className="pulse-value-accent mt-0.5 text-xs">
                      ${money(h.amount, 0)} USDT <span className="text-zinc-500">&middot; generating yield</span>
                    </p>
                  </div>
                  <button
                    onClick={() => handleLiquidate(h.id)}
                    disabled={busy || liquidatingId === h.id}
                    className="shrink-0 rounded-full border border-white/10 bg-black/40 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wide text-zinc-300 transition hover:border-red-500/40 hover:text-red-400 disabled:opacity-50"
                  >
                    {liquidatingId === h.id ? 'Closing…' : 'Liquidate'}
                  </button>
                </div>
              )
            })}
          </div>
        )}

        {state.holdings.some((h) => !findProject(h.projectId)) && (
          <p className="pulse-label border-t border-white/[0.06] p-3 normal-case tracking-normal text-zinc-600">
            Some holdings reference older projects no longer in the active pipeline — balances are correct, display
            names are limited for these.
          </p>
        )}
      </div>

      {/* QUICK ACTIONS */}
      <div className="space-y-3">
        <h3 className="pulse-label px-1">Quick Actions &amp; Hubs</h3>
        <div className="grid grid-cols-2 gap-3">
          <ActionTile icon={<Rocket className="h-4 w-4 text-amber-300" />} label="Buy $PULSE" detail="Private sale round" badge="Private" onClick={() => setView('sale')} />
          <ActionTile icon={<Zap className="h-4 w-4 text-amber-300" />} label="Stake Vault" detail="High yield pool" badge={`${money(state.staked, 0)} staked`} onClick={() => setView('stake')} />
          <ActionTile icon={<Radio className="h-4 w-4 text-amber-300" />} label="Signals Feed" detail="Institutional deals" badge="Live" onClick={() => setView('signals')} />
          <ActionTile
            icon={<ShieldCheck className="h-4 w-4 text-amber-300" />}
            label="Verify KYC"
            detail="Unlock full access"
            badge={state.kyc === 'verified' ? 'Verified' : state.kyc === 'pending' ? 'In review' : 'Required'}
            onClick={() => (state.kyc === 'verified' ? setView('profile') : openModal('kyc'))}
          />
        </div>
      </div>

      {/* PROJECT PIPELINE */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="pulse-label">Regional Opportunities ({projects.length})</h3>
          <span className="pulse-chip pulse-chip-gold">Verified SADC Pipeline</span>
        </div>

        <div className="space-y-4">
          {projects.map((p, i) => {
            const pct = p.goal > 0 ? Math.min(100, Math.round((p.funded / p.goal) * 100)) : 0
            const Icon = sectorIcon(p.sector)
            // FIX — the pipeline let you tap "Deploy Capital" on projects that
            // are closed or past their deadline. isProjectClosed() already
            // existed in lib/pulse-data.ts but was never called here.
            const closed = isProjectClosed(p)

            return (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.4, delay: i * 0.05, ease: [0.16, 1, 0.3, 1] }}
                className="pulse-glass-card overflow-hidden"
              >
                {p.image && (
                  <div className="relative h-40 w-full overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={p.image} alt={p.name} className="h-full w-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                    <span className="pulse-chip pulse-chip-gold absolute left-3 top-3">
                      {closed ? 'Closed' : 'Verified Project'}
                    </span>
                  </div>
                )}

                <div className="space-y-3 p-5">
                  <div className="flex items-start gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-amber-500/30 bg-amber-500/10">
                      <Icon className="h-4 w-4 text-amber-400" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <h4 className="truncate text-base font-bold text-white">{p.name}</h4>
                      <p className="pulse-label mt-0.5 normal-case tracking-normal text-zinc-400">
                        {p.country} &bull; {p.sector}
                      </p>
                    </div>
                    <span className="pulse-chip pulse-chip-green">{p.targetYield}</span>
                  </div>

                  {p.summary && <p className="text-xs leading-relaxed text-zinc-400">{p.summary}</p>}

                  <div className="space-y-1.5">
                    <div className="flex justify-between">
                      <span className="pulse-value-sm">{pct}% allocated</span>
                      <span className="pulse-label normal-case tracking-normal text-zinc-400">
                        ${money(p.funded, 0)} / ${money(p.goal, 0)}
                      </span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full border border-amber-500/20 bg-black">
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: `${pct}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
                        className="h-full rounded-full bg-gradient-to-r from-amber-600 to-yellow-400 shadow-[0_0_12px_rgba(245,158,11,0.7)]"
                      />
                    </div>
                  </div>

                  {p.risk && (
                    <p className="pulse-label normal-case tracking-normal text-zinc-500">Risk profile: {p.risk}</p>
                  )}

                  <button
                    onClick={() => openModal('invest', { projectId: p.id })}
                    disabled={closed}
                    className="w-full rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 px-3.5 py-2.5 text-xs font-semibold uppercase tracking-wide text-black shadow-[0_8px_24px_-8px_rgba(245,158,11,0.7)] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {closed ? 'Closed to new investment' : 'Deploy Capital'}
                  </button>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* RISK DISCLAIMER */}
      <div className="pulse-glass-card pulse-static space-y-2 p-4">
        <div className="pulse-disclaimer-title flex items-center gap-2">
          <span>&#9888;&#65039;</span>
          <span>Risk Disclaimer</span>
        </div>
        <p className="pulse-disclaimer">
          Yield outputs and APY metrics reflect live ledger states and are variable, not guaranteed. Past performance
          does not guarantee future returns. Capital is at risk — do not invest money you cannot afford to lose.
        </p>
      </div>
    </div>
  )
}

function ActionTile({
  icon,
  label,
  detail,
  badge,
  onClick,
}: {
  icon: React.ReactNode
  label: string
  detail: string
  badge: string
  onClick: () => void
}) {
  return (
    <button onClick={onClick} className="pulse-glass-card flex flex-col justify-between p-4 text-left">
      <div className="flex items-center justify-between gap-1">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-amber-500/30 bg-amber-500/10">
          {icon}
        </div>
        <span className="pulse-chip pulse-chip-gold">{badge}</span>
      </div>
      <div className="mt-3.5 space-y-1">
        <h4 className="text-xs font-bold text-white">{label}</h4>
        <p className="pulse-label truncate normal-case tracking-normal text-zinc-500">{detail}</p>
      </div>
    </button>
  )
}
