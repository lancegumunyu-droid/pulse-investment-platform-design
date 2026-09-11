'use client'

import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { Lock, Pickaxe, Radio, Rocket, ShieldCheck, Sprout, Sun, Zap, Building2, Layers, BadgeCheck } from 'lucide-react'
import { money, usePulse } from '../store'
import { PROJECTS, nextTier, type Project } from '@/lib/pulse-data'

function sectorIcon(sector?: string) {
  const s = (sector ?? '').toLowerCase()
  if (s.includes('mining') || s.includes('mineral')) return Pickaxe
  if (s.includes('energy') || s.includes('solar') || s.includes('hydro')) return Sun
  if (s.includes('agri')) return Sprout
  if (s.includes('infra')) return Building2
  return Layers
}

function useMouseGlow<T extends HTMLElement>() {
  const ref = useRef<T | null>(null)
  const onMove = (e: React.PointerEvent<T>) => {
    const el = ref.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    el.style.setProperty('--mx', `${e.clientX - rect.left}px`)
    el.style.setProperty('--my', `${e.clientY - rect.top}px`)
  }
  return { ref, onMove }
}

function ProjectImage({ src, alt }: { src?: string; alt: string }) {
  const [loaded, setLoaded] = useState(false)
  const [failed, setFailed] = useState(false)

  if (!src || failed) {
    return (
      <div className="flex h-40 w-full items-center justify-center bg-gradient-to-br from-amber-500/15 to-black text-xs font-bold uppercase tracking-widest text-amber-400/70 font-mono">
        Pulse Project
      </div>
    )
  }

  return (
    <div className="relative h-40 w-full overflow-hidden">
      {!loaded && <div className="pulse-img-skeleton absolute inset-0" />}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        loading="lazy"
        onLoad={() => setLoaded(true)}
        onError={() => setFailed(true)}
        className={`h-full w-full object-cover transition-opacity duration-500 ${loaded ? 'opacity-100' : 'opacity-0'}`}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
    </div>
  )
}

export function DashboardView() {
  const { state, api, openModal, setView, totalInvested, currentTier, portfolioValue } = usePulse()
  const [projects, setProjects] = useState<Project[]>(PROJECTS)
  const heroGlow = useMouseGlow<HTMLDivElement>()

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

  // Cumulative yield telemetry — value above principal + cash, all-time gain
  const principalPlusCash = state.cash + totalInvested
  const cumulativeYield = Math.max(0, portfolioValue - principalPlusCash)
  const cumulativeYieldPct = principalPlusCash > 0 ? (cumulativeYield / principalPlusCash) * 100 : 0

  const displayName = state.fullName || state.username || 'Investor'

  return (
    <div className="pulse-executive-shell mx-auto w-full max-w-[480px] space-y-4 pb-24 text-amber-100 antialiased lg:max-w-none">
      {/* SADC CAPITAL STATUS BAR */}
      <div className="glow-edge flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-amber-500/30 bg-[#0a0a0a] p-4 shadow-lg">
        <div className="flex items-center gap-2">
          <span className="pulse-live-dot" aria-hidden />
          <span className="font-mono text-[11px] font-bold uppercase tracking-widest text-zinc-300">
            SADC Capital Network • Live Terminal
          </span>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/40 bg-amber-500/10 px-3 py-1 font-mono text-xs font-bold text-amber-300">
          <BadgeCheck className="h-3.5 w-3.5" />
          {currentTier.name} Member
        </span>
      </div>

      {/* MAIN PORTFOLIO SUMMARY CARD — Preview 3 Standard */}
      <div
        ref={heroGlow.ref}
        onPointerMove={heroGlow.onMove}
        className="mouse-glow pulse-hero-card shimmer-sweep relative p-6 shadow-2xl md:p-8"
      >
        {/* Ambient moving glow behind the card content */}
        <div
          className="pointer-events-none absolute inset-0 opacity-70 mix-blend-screen"
          style={{
            background:
              'radial-gradient(60% 60% at 20% 15%, rgba(245,158,11,0.16), transparent 60%), radial-gradient(50% 50% at 85% 85%, rgba(16,185,129,0.14), transparent 60%)',
            animation: 'pulse-shimmer 8s ease-in-out infinite',
            backgroundSize: '200% 200%',
          }}
        />
        {/* Engraved $PULSE watermark */}
        <div
          aria-hidden
          className="pointer-events-none absolute right-4 top-4 select-none font-mono text-6xl font-black tracking-tighter md:text-7xl"
          style={{
            color: 'transparent',
            WebkitTextStroke: '1px rgba(255,255,255,0.06)',
            textShadow: '1px 1px 0 rgba(0,0,0,0.6), -1px -1px 0 rgba(255,255,255,0.04)',
          }}
        >
          $PULSE
        </div>

        <div className="relative z-10 flex flex-wrap items-start justify-between gap-2">
          <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-zinc-400">
            Total Net Portfolio Value
          </span>
          {cumulativeYieldPct > 0 && (
            <span className="shrink-0 rounded-full border border-emerald-500/40 bg-emerald-950/60 px-2.5 py-1 font-mono text-[10px] font-bold text-emerald-400">
              ↗ +{cumulativeYieldPct.toFixed(1)}% APY Avg
            </span>
          )}
        </div>

        <div className="pulse-figure-white relative z-10 mt-2 text-3xl md:text-5xl">
          ${money(portfolioValue)} <span className="text-sm font-normal text-zinc-500 font-sans">USDT</span>
        </div>

        <p className="relative z-10 mt-2 font-mono text-xs text-zinc-400">
          Cumulative Yield:{' '}
          <span className="pulse-figure text-emerald-400">
            +${money(cumulativeYield)} ({cumulativeYieldPct.toFixed(1)}%)
          </span>
        </p>

        <div className="relative z-10 mt-5 flex gap-2.5">
          <button
            onClick={() => openModal('deposit')}
            className="pulse-action flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-gradient-to-b from-amber-400 to-amber-500 px-4 py-2.5 text-xs font-bold uppercase tracking-wide text-black shadow-lg shadow-amber-900/30"
          >
            ↘ Deposit Capital
          </button>
          <button
            onClick={() => openModal('withdraw')}
            className="pulse-action flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-white/10 bg-black/40 px-4 py-2.5 text-xs font-bold uppercase tracking-wide text-zinc-200"
          >
            ↗ Withdraw Earnings
          </button>
        </div>

        <div className="relative z-10 mt-5 grid grid-cols-3 gap-2 border-t border-white/10 pt-4 text-center">
          <div>
            <span className="block font-mono text-[10px] uppercase tracking-wide text-zinc-500">Cash</span>
            <div className="pulse-figure-white mt-1 text-base">${money(state.cash, 0)}</div>
          </div>
          <div>
            <span className="block font-mono text-[10px] uppercase tracking-wide text-zinc-500">Principal</span>
            <div className="pulse-figure-white mt-1 text-base">${money(totalInvested, 0)}</div>
          </div>
          <div>
            <span className="block font-mono text-[10px] uppercase tracking-wide text-zinc-500">$PULSE</span>
            <div className="pulse-figure mt-1 text-base">{money(state.pulse, 0)}</div>
          </div>
        </div>
      </div>

      {/* STANDING WITH LOCKED NEXT-TIER PROGRESS */}
      <div className="glow-card rounded-2xl border border-amber-500/30 bg-[#0a0a0a] p-4 shadow-lg">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Lock className="h-4 w-4 text-amber-400 shrink-0" />
            <span className="font-mono text-xs uppercase tracking-wider text-zinc-400">
              Standing: <span className="font-bold text-white">{currentTier.name} VIP</span>
            </span>
          </div>
          {!upcoming && (
            <span className="shrink-0 rounded-full border border-emerald-500/40 bg-emerald-950/60 px-2.5 py-1 font-mono text-[10px] font-bold text-emerald-400">
              {currentTier.yieldLabel.replace(' target', '')} target
            </span>
          )}
        </div>
        <p className="mt-1.5 font-mono text-sm font-bold text-emerald-400">{currentTier.yieldLabel}</p>
        {upcoming ? (
          <div className="mt-3 space-y-2">
            <div className="flex items-center justify-between font-mono text-xs text-zinc-500">
              <span>Next Unlock: {upcoming.name}</span>
              <span className="pulse-figure font-bold">
                ${money(totalInvested, 0)} / ${money(upcoming.minInvest, 0)}
              </span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full border border-amber-500/20 bg-black">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="h-full rounded-full bg-gradient-to-r from-amber-600 to-yellow-400"
              />
            </div>
          </div>
        ) : (
          <p className="mt-1.5 font-mono text-xs text-zinc-400">Apex Institutional Rank Active • Max Tier Unlocked.</p>
        )}
      </div>

      {/* REFERRAL QUICK-ACCESS */}
      <button
        onClick={() => setView('profile')}
        className="glow-card pulse-tile flex w-full items-center justify-between rounded-2xl border border-amber-500/30 bg-[#0a0a0a] p-4 text-left shadow-lg"
      >
        <div className="min-w-0 space-y-0.5">
          <span className="block font-mono text-[10px] uppercase tracking-wider text-zinc-500 truncate">
            {displayName} • Your Referral Code
          </span>
          <p className="pulse-figure truncate text-sm tracking-wider">{state.referralCode}</p>
        </div>
        <span className="shrink-0 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 font-mono text-xs text-amber-300">
          {state.referralCount} joined
        </span>
      </button>

      {/* ACTIVE HOLDINGS */}
      <div className="space-y-1">
        <h3 className="px-1 font-mono text-xs font-bold uppercase tracking-wider text-zinc-400">
          Active Holdings ({state.holdings.length})
        </h3>
        {state.holdings.length === 0 ? (
          <div className="rounded-2xl border border-amber-500/30 bg-[#0a0a0a] p-5">
            <p className="font-mono text-xs text-zinc-500">
              No active capital allocations found. Explore the pipeline below to deploy capital.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {state.holdings.map((h) => {
              const proj = findProject(h.projectId)
              const Icon = sectorIcon(proj?.sector)
              return (
                <div
                  key={h.id}
                  className="glow-card pulse-tile flex items-center gap-3 rounded-2xl border border-amber-500/30 bg-[#0a0a0a] p-4"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-amber-500/30 bg-amber-500/10">
                    <Icon className="h-4 w-4 text-amber-400" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-white">{proj?.name ?? 'Legacy Holding'}</p>
                    <p className="pulse-figure text-xs">
                      ${money(h.amount, 0)} <span className="font-sans font-normal text-zinc-500">USDT · Generating Yield</span>
                    </p>
                  </div>
                  <button
                    onClick={() => api.closeInvestment(h.id)}
                    className="shrink-0 rounded-full border border-white/10 bg-black/40 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wide text-zinc-300 transition hover:border-red-500/40 hover:text-red-400"
                  >
                    Liquidate
                  </button>
                </div>
              )
            })}
          </div>
        )}
        {state.holdings.some((h) => !findProject(h.projectId)) && (
          <p className="px-1 font-mono text-[10px] text-zinc-600">
            Some holdings reference older projects no longer in the active pipeline — balances are correct, display
            names are limited for these.
          </p>
        )}
      </div>

      {/* QUICK ACTIONS & HUBS */}
      <div className="space-y-3">
        <h3 className="px-1 text-xs font-bold uppercase tracking-wider text-amber-300">Quick Actions &amp; Hubs</h3>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <ActionTile
            icon={<Rocket className="h-4 w-4 text-amber-300" />}
            label="Buy $PULSE"
            detail="Private sale round"
            badge="Private"
            onClick={() => setView('sale')}
          />
          <ActionTile
            icon={<Zap className="h-4 w-4 text-amber-300" />}
            label="Stake Vault"
            detail="High yield pool"
            badge="24.8% APY"
            onClick={() => setView('stake')}
          />
          <ActionTile
            icon={<Radio className="h-4 w-4 text-amber-300" />}
            label="Signals Feed"
            detail="Institutional deals"
            badge="Live"
            onClick={() => setView('signals')}
          />
          <ActionTile
            icon={<ShieldCheck className="h-4 w-4 text-amber-300" />}
            label="Verify KYC"
            detail="Unlocked access"
            badge={state.kyc === 'verified' ? 'Verified' : 'Level 2'}
            onClick={() => (state.kyc === 'verified' ? setView('profile') : openModal('kyc'))}
          />
        </div>
      </div>

      {/* REGIONAL OPPORTUNITIES PIPELINE */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs font-bold uppercase tracking-wider text-amber-300">
            Regional Opportunities ({projects.length})
          </h3>
          <span className="flex items-center gap-1.5 text-xs font-bold text-amber-400">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-amber-400" /> Verified SADC Pipeline
          </span>
        </div>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {projects.map((p, i) => {
            const pct = p.goal > 0 ? Math.min(100, Math.round((p.funded / p.goal) * 100)) : 0
            const Icon = sectorIcon(p.sector)
            return (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.4, delay: i * 0.05, ease: [0.16, 1, 0.3, 1] }}
                whileHover={{ y: -2 }}
                className="glow-card overflow-hidden rounded-2xl border border-amber-500/30 bg-[#0a0a0a] shadow-xl"
              >
                <ProjectImage src={p.image} alt={p.name} />
                {p.image && (
                  <div className="relative">
                    <span className="absolute -top-[168px] left-3 z-10 rounded-full border border-amber-500/40 bg-black/70 px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-wide text-amber-300">
                      Verified Project
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
                      <p className="font-mono text-xs text-zinc-400">
                        {p.country} • {p.sector}
                      </p>
                    </div>
                    <span className="pulse-figure shrink-0 rounded-full border border-emerald-500/40 bg-emerald-950/60 px-2.5 py-1 text-xs">
                      {p.targetYield}
                    </span>
                  </div>

                  {p.summary && <p className="text-xs leading-relaxed text-zinc-400">{p.summary}</p>}

                  <div className="space-y-1.5 font-mono text-xs">
                    <div className="flex justify-between text-zinc-400">
                      <span className="font-bold text-white">{pct}% Allocated</span>
                      <span className="pulse-figure text-xs">
                        ${money(p.funded, 0)} / ${money(p.goal, 0)}
                      </span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full border border-amber-500/20 bg-black">
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: `${pct}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                        className="h-full rounded-full bg-gradient-to-r from-amber-600 to-yellow-400"
                      />
                    </div>
                  </div>

                  {p.risk && <p className="font-mono text-[11px] text-zinc-500">Risk Profile: {p.risk}</p>}

                  <motion.button
                    whileTap={{ scale: 0.98 }}
                    onClick={() => openModal('invest', { projectId: p.id })}
                    className="pulse-action w-full rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 px-3.5 py-2.5 text-xs font-bold uppercase tracking-wide text-black shadow"
                  >
                    Deploy Capital
                  </motion.button>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* COMPLIANCE DISCLAIMER */}
      <div className="mt-6 space-y-2 rounded-2xl border border-amber-500/20 bg-[#0c0c0c] p-4 font-mono text-[10px] leading-relaxed text-amber-400/70">
        <div className="flex items-center space-x-2 font-bold uppercase tracking-wider text-amber-300">
          <span>⚠️</span>
          <span>Risk Disclaimer</span>
        </div>
        <p>
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
    <button
      onClick={onClick}
      className="glow-card pulse-tile flex flex-col justify-between rounded-2xl border border-amber-500/30 bg-[#101010] p-4 text-left shadow-md"
    >
      <div className="flex items-center justify-between gap-1">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-amber-500/30 bg-amber-500/10">
          {icon}
        </div>
        <span className="truncate rounded-md border border-amber-500/40 bg-amber-500/20 px-2 py-0.5 font-mono text-[10px] font-bold text-amber-300">
          {badge}
        </span>
      </div>
      <div className="mt-3.5 space-y-1">
        <h4 className="text-xs font-extrabold text-white">{label}</h4>
        <p className="truncate text-[10px] text-amber-400/60">{detail}</p>
      </div>
    </button>
  )
}
