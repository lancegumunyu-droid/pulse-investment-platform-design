'use client'

import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { Lock, Pickaxe, Radio, Rocket, ShieldCheck, Sprout, Sun, Zap, Building2, Layers, BadgeCheck, ChevronRight } from 'lucide-react'
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
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
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

  const principalPlusCash = state.cash + totalInvested
  const cumulativeYield = Math.max(0, portfolioValue - principalPlusCash)
  const cumulativeYieldPct = principalPlusCash > 0 ? (cumulativeYield / principalPlusCash) * 100 : 0

  return (
    <div className="mx-auto w-full max-w-[480px] space-y-4 pb-24 text-amber-100 antialiased lg:max-w-3xl">
      {/* SADC CAPITAL STATUS BAR */}
      <div className="pulse-glass-card pulse-glow-frame flex flex-wrap items-center justify-between gap-3 p-4">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
          </span>
          <span className="pulse-label text-zinc-300">SADC Capital Network • Live Terminal</span>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/40 bg-amber-500/10 px-3 py-1 font-mono text-xs font-bold text-amber-300">
          <BadgeCheck className="h-3.5 w-3.5" />
          {currentTier.name} Member
        </span>
      </div>

      {/* MAIN PORTFOLIO SUMMARY CARD */}
      <div ref={heroGlow.ref} onPointerMove={heroGlow.onMove} className="pulse-hero-premium pulse-glow-track">
        <div className="relative z-[3] p-6 md:p-8">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <span className="pulse-label">Total Net Portfolio Value</span>
            {cumulativeYieldPct > 0 && (
              <span className="shrink-0 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-2.5 py-1 font-mono text-[10px] font-bold text-emerald-400">
                ↗ +{cumulativeYieldPct.toFixed(1)}% APY Avg
              </span>
            )}
          </div>

          <div className="pulse-value-xl mt-2">
            ${money(portfolioValue)}{' '}
            <span className="text-sm font-normal text-zinc-500 font-sans tracking-normal">USDT</span>
          </div>

          <p className="mt-2 font-mono text-xs text-zinc-400">
            Cumulative Yield:{' '}
            <span className="pulse-value-accent">
              +${money(cumulativeYield)} ({cumulativeYieldPct.toFixed(1)}%)
            </span>
          </p>

          <div className="mt-5 flex gap-2.5">
            <button
              onClick={() => openModal('deposit')}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-gradient-to-b from-amber-400 to-amber-500 px-4 py-2.5 text-xs font-bold uppercase tracking-wide text-black shadow-[0_8px_24px_-8px_rgba(245,158,11,0.6)] transition hover:brightness-110"
            >
              ↘ Deposit Capital
            </button>
            <button
              onClick={() => openModal('withdraw')}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-xs font-bold uppercase tracking-wide text-zinc-200 transition hover:bg-white/[0.07]"
            >
              ↗ Withdraw Earnings
            </button>
          </div>
        </div>

        <div className="pulse-hero-telemetry grid grid-cols-3">
          <div className="px-4 py-4 text-center">
            <span className="pulse-label block">Cash</span>
            <div className="pulse-value-md mt-1">${money(state.cash, 0)}</div>
          </div>
          <div className="px-4 py-4 text-center">
            <span className="pulse-label block">Principal</span>
            <div className="pulse-value-md mt-1">${money(totalInvested, 0)}</div>
          </div>
          <div className="px-4 py-4 text-center">
            <span className="pulse-label block">$PULSE</span>
            <div className="pulse-value-accent mt-1 text-base">{money(state.pulse, 0)}</div>
          </div>
        </div>
      </div>

      {/* STANDING */}
      <div className="pulse-glass-card p-4">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Lock className="h-4 w-4 text-amber-400 shrink-0" />
            <span className="pulse-label">
              Standing: <span className="font-bold text-white normal-case tracking-normal">{currentTier.name} VIP</span>
            </span>
          </div>
          {!upcoming && (
            <span className="shrink-0 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-2.5 py-1 font-mono text-[10px] font-bold text-emerald-400">
              {currentTier.yieldLabel.replace(' target', '')} target
            </span>
          )}
        </div>
        <p className="pulse-value-accent mt-1.5 text-sm">{currentTier.yieldLabel}</p>
        {upcoming ? (
          <div className="mt-3 space-y-2">
            <div className="flex items-center justify-between font-mono text-xs text-zinc-500">
              <span>Next Unlock: {upcoming.name}</span>
              <span className="pulse-value-accent">
                ${money(totalInvested, 0)} / ${money(upcoming.minInvest, 0)}
              </span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full border border-amber-500/20 bg-black/40">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="h-full rounded-full bg-gradient-to-r from-amber-500 to-yellow-400"
              />
            </div>
          </div>
        ) : (
          <p className="mt-1.5 font-mono text-xs text-zinc-400">Apex Institutional Rank Active • Max Tier Unlocked.</p>
        )}
      </div>

      {/* ACTIVE HOLDINGS */}
      <button
        onClick={() => setView('wallet')}
        className="pulse-glass-card flex w-full items-center justify-between p-4 text-left"
      >
        <span className="pulse-label">Active Holdings ({state.holdings.length})</span>
        <span className="flex items-center gap-1 font-mono text-xs font-bold text-amber-400">
          Explore <ChevronRight className="h-3.5 w-3.5" />
        </span>
      </button>
      {state.holdings.length > 0 && (
        <div className="pulse-glass-card divide-y divide-white/[0.06] overflow-hidden">
          {state.holdings.slice(0, 3).map((h) => {
            const proj = findProject(h.projectId)
            const Icon = sectorIcon(proj?.sector)
            return (
              <div key={h.id} className="flex items-center gap-3 p-4 transition-colors hover:bg-white/[0.02]">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-amber-500/30 bg-amber-500/10">
                  <Icon className="h-4 w-4 text-amber-400" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-white">{proj?.name ?? 'Legacy Holding'}</p>
                  <p className="pulse-value-accent text-xs">
                    ${money(h.amount, 0)} <span className="font-sans font-normal text-zinc-500">USDT · Generating Yield</span>
                  </p>
                </div>
                <button
                  onClick={() => api.closeInvestment(h.id)}
                  className="shrink-0 rounded-full border border-white/10 bg-black/30 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wide text-zinc-300 transition hover:border-red-500/40 hover:text-red-400"
                >
                  Liquidate
                </button>
              </div>
            )
          })}
        </div>
      )}

      {/* REGIONAL OPPORTUNITIES */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="pulse-label text-amber-300">Regional Opportunities ({projects.length})</h3>
          <span className="flex items-center gap-1.5 text-xs font-bold text-amber-400">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-amber-400" /> Verified SADC Pipeline
          </span>
        </div>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {projects.map((p, i) => {
            const pct = p.goal > 0 ? Math.min(100, Math.round((p.funded / p.goal) * 100)) : 0
            const Icon = sectorIcon(p.sector)
            return (
              <ProjectCard key={p.id} project={p} pct={pct} Icon={Icon} delay={i * 0.05} onInvest={() => openModal('invest', { projectId: p.id })} />
            )
          })}
        </div>
      </div>

      {/* REFERRAL */}
      <button onClick={() => setView('profile')} className="pulse-glass-card flex w-full items-center justify-between p-4 text-left">
        <div className="min-w-0 space-y-0.5">
          <span className="pulse-label block truncate">Your Referral Code</span>
          <p className="pulse-value-accent truncate text-sm tracking-wider">{state.referralCode}</p>
        </div>
        <span className="shrink-0 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 font-mono text-xs text-amber-300">
          {state.referralCount} joined
        </span>
      </button>

      {/* QUICK ACTIONS */}
      <div className="space-y-3">
        <h3 className="pulse-label text-amber-300">Quick Actions &amp; Hubs</h3>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <ActionTile icon={<Rocket className="h-4 w-4 text-amber-300" />} label="Buy $PULSE" detail="Private sale round" badge="Private" onClick={() => setView('sale')} />
          <ActionTile icon={<Zap className="h-4 w-4 text-amber-300" />} label="Stake Vault" detail="High yield pool" badge="24.8% APY" onClick={() => setView('stake')} />
          <ActionTile icon={<Radio className="h-4 w-4 text-amber-300" />} label="Signals Feed" detail="Institutional deals" badge="Live" onClick={() => setView('signals')} />
          <ActionTile
            icon={<ShieldCheck className="h-4 w-4 text-amber-300" />}
            label="Verify KYC"
            detail="Unlocked access"
            badge={state.kyc === 'verified' ? 'Verified' : 'Level 2'}
            onClick={() => (state.kyc === 'verified' ? setView('profile') : openModal('kyc'))}
          />
        </div>
      </div>

      {/* COMPLIANCE */}
      <div className="mt-6 space-y-2 rounded-2xl border border-amber-500/20 bg-[#0c0c0c] p-4 font-mono text-[10px] leading-relaxed text-amber-400/70">
        <div className="flex items-center space-x-2 pulse-disclaimer-title">
          <span>⚠️</span>
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

function ProjectCard({
  project: p,
  pct,
  Icon,
  delay,
  onInvest,
}: {
  project: Project
  pct: number
  Icon: React.ComponentType<{ className?: string }>
  delay: number
  onInvest: () => void
}) {
  const glow = useMouseGlow<HTMLDivElement>()
  return (
    <motion.div
      ref={glow.ref}
      onPointerMove={glow.onMove}
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.4, delay, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -4 }}
      className="pulse-glass-card pulse-glow-track overflow-hidden"
    >
      <div className="relative z-[3]">
        <ProjectImage src={p.image} alt={p.name} />
        {p.image && (
          <span className="absolute left-3 top-3 z-10 rounded-full border border-amber-500/40 bg-black/70 px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-wide text-amber-300">
            Verified Project
          </span>
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
            <span className="pulse-value-accent shrink-0 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-2.5 py-1 text-xs">
              {p.targetYield}
            </span>
          </div>

          {p.summary && <p className="text-xs leading-relaxed text-zinc-400">{p.summary}</p>}

          <div className="space-y-1.5 font-mono text-xs">
            <div className="flex justify-between text-zinc-400">
              <span className="font-bold text-white">{pct}% Allocated</span>
              <span className="pulse-value-accent text-xs">
                ${money(p.funded, 0)} / ${money(p.goal, 0)}
              </span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full border border-amber-500/20 bg-black/40">
              <motion.div
                initial={{ width: 0 }}
                whileInView={{ width: `${pct}%` }}
                viewport={{ once: true }}
                transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                className="h-full rounded-full bg-gradient-to-r from-amber-500 to-yellow-400"
              />
            </div>
          </div>

          {p.risk && <p className="font-mono text-[11px] text-zinc-500">Risk Profile: {p.risk}</p>}

          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            onClick={onInvest}
            className="w-full rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 px-3.5 py-2.5 text-xs font-bold uppercase tracking-wide text-black shadow-[0_8px_24px_-8px_rgba(245,158,11,0.5)] transition hover:brightness-105"
          >
            Deploy Capital
          </motion.button>
        </div>
      </div>
    </motion.div>
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
  const glow = useMouseGlow<HTMLButtonElement>()
  return (
    <motion.button
      ref={glow.ref}
      onPointerMove={glow.onMove}
      whileHover={{ y: -3 }}
      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
      onClick={onClick}
      className="pulse-glass-card pulse-glow-track flex flex-col justify-between p-4 text-left"
    >
      <div className="relative z-[3] flex items-center justify-between gap-1">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-amber-500/30 bg-amber-500/10">
          {icon}
        </div>
        <span className="truncate rounded-md border border-amber-500/40 bg-amber-500/20 px-2 py-0.5 font-mono text-[10px] font-bold text-amber-300">
          {badge}
        </span>
      </div>
      <div className="relative z-[3] mt-3.5 space-y-1">
        <h4 className="text-xs font-extrabold text-white">{label}</h4>
        <p className="truncate text-[10px] text-amber-400/60">{detail}</p>
      </div>
    </motion.button>
  )
}
