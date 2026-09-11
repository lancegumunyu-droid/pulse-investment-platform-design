'use client'

import { useEffect, useState } from 'react'
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

  const displayName = state.fullName || state.username || 'Investor'

  return (
    <div className="mx-auto w-full max-w-[480px] space-y-4 pb-24 text-amber-100 antialiased lg:max-w-3xl">
      {/* SADC CAPITAL STATUS BAR */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-amber-500/25 bg-[#0a0a0a] p-4">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
          </span>
          <span className="font-mono text-[11px] font-bold uppercase tracking-widest text-zinc-300">
            SADC Capital Network • Live Terminal
          </span>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/40 bg-amber-500/10 px-3 py-1 font-mono text-xs font-bold text-amber-300">
          <BadgeCheck className="h-3.5 w-3.5" />
          {currentTier.name} Member
        </span>
      </div>

      {/* MAIN PORTFOLIO SUMMARY CARD — flat glassmorphic, no engraving */}
      <motion.div
        whileHover={{ y: -2 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        className="relative overflow-hidden rounded-2xl border border-amber-500/30 bg-gradient-to-br from-[#151109] to-[#0a0906] p-6 md:p-8"
      >
        <div className="flex flex-wrap items-start justify-between gap-2">
          <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-zinc-400">
            Total Net Portfolio Value
          </span>
          {cumulativeYieldPct > 0 && (
            <span className="shrink-0 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-2.5 py-1 font-mono text-[10px] font-bold text-emerald-400">
              ↗ +{cumulativeYieldPct.toFixed(1)}% APY Avg
            </span>
          )}
        </div>

        <div className="pulse-figure-white mt-2 text-3xl md:text-5xl">
          ${money(portfolioValue)} <span className="text-sm font-normal text-zinc-500 font-sans">USDT</span>
        </div>

        <p className="mt-2 font-mono text-xs text-zinc-400">
          Cumulative Yield:{' '}
          <span className="pulse-figure text-emerald-400">
            +${money(cumulativeYield)} ({cumulativeYieldPct.toFixed(1)}%)
          </span>
        </p>

        <div className="mt-5 flex gap-2.5">
          <button
            onClick={() => openModal('deposit')}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-amber-400 px-4 py-2.5 text-xs font-bold uppercase tracking-wide text-black transition hover:bg-amber-300"
          >
            ↘ Deposit Capital
          </button>
          <button
            onClick={() => openModal('withdraw')}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-white/10 bg-black/30 px-4 py-2.5 text-xs font-bold uppercase tracking-wide text-zinc-200 transition hover:bg-black/50"
          >
            ↗ Withdraw Earnings
          </button>
        </div>

        <div className="mt-5 grid grid-cols-3 gap-2 border-t border-white/10 pt-4 text-center">
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
      </motion.div>

      {/* STANDING WITH LOCKED NEXT-TIER PROGRESS */}
      <div className="rounded-2xl border border-amber-500/25 bg-[#0a0a0a] p-4">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Lock className="h-4 w-4 text-amber-400 shrink-0" />
            <span className="font-mono text-xs uppercase tracking-wider text-zinc-400">
              Standing: <span className="font-bold text-white">{currentTier.name} VIP</span>
            </span>
          </div>
          {!upcoming && (
            <span className="shrink-0 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-2.5 py-1 font-mono text-[10px] font-bold text-emerald-400">
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

      {/* REFERRAL QUICK-ACCESS */}
      <motion.button
        whileHover={{ y: -2 }}
        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
        onClick={() => setView('profile')}
        className="flex w-full items-center justify-between rounded-2xl border border-amber-500/25 bg-[#0a0a0a] p-4 text-left"
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
      </motion.button>

      {/* ACTIVE HOLDINGS */}
      <div className="space-y-1">
        <h3 className="px-1 font-mono text-xs font-bold uppercase tracking-wider text-zinc-400">
          Active Holdings ({state.holdings.length})
        </h3>
        {state.holdings.length === 0 ? (
          <div className="rounded-2xl border border-amber-500/25 bg-[#0a0a0a] p-5">
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
                <motion.div
                  key={h.id}
                  whileHover={{ y: -2 }}
                  transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                  className="flex items-center gap-3 rounded-2xl border border-amber-500/25 bg-[#0a0a0a] p-4"
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
                    className="shrink-0 rounded-full border border-white/10 bg-black/30 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wide text-zinc-300 transition hover:border-red-500/40 hover:text-red-400"
                  >
                    Liquidate
                  </button>
                </motion.div>
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
                whileHover={{ y: -4, scale: 1.01 }}
                className="overflow-hidden rounded-2xl border border-amber-500/25 bg-[#0a0a0a] transition-colors hover:border-amber-500/50"
              >
                <div className="relative">
                  <ProjectImage src={p.image} alt={p.name} />
                  {p.image && (
                    <span className="absolute left-3 top-3 z-10 rounded-full border border-amber-500/40 bg-black/70 px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-wide text-amber-300">
                      Verified Project
                    </span>
                  )}
                </div>
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
                    <span className="pulse-figure shrink-0 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-2.5 py-1 text-xs">
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
                    onClick={() => openModal('invest', { projectId: p.id })}
                    className="w-full rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 px-3.5 py-2.5 text-xs font-bold uppercase tracking-wide text-black transition hover:brightness-105"
                  >
                    Deploy Capital
                  </motion.button>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* QUICK ACTIONS & HUBS — now strictly at the bottom, after Regional Opportunities */}
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
    <motion.button
      whileHover={{ y: -2 }}
      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
      onClick={onClick}
      className="flex flex-col justify-between rounded-2xl border border-amber-500/25 bg-[#101010] p-4 text-left transition-colors hover:border-amber-500/45"
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
    </motion.button>
  )
}
