'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Lock, Pickaxe, Radio, Rocket, ShieldCheck, Sprout, Sun, Zap, Building2, Layers } from 'lucide-react'
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

  return (
    <div className="mx-auto w-full max-w-[480px] space-y-4 pb-24 text-amber-100 antialiased md:max-w-3xl lg:max-w-5xl">
      {/* SADC CAPITAL STATUS BAR */}
      <div className="glow-edge space-y-2 rounded-2xl border border-amber-500/30 bg-[#0a0a0a] p-4 shadow-lg">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-heartbeat-ring-slow rounded-full bg-emerald-400" />
            <span className="relative inline-flex h-2 w-2 animate-heartbeat-icon-slow rounded-full bg-emerald-400" />
          </span>
          <span className="font-mono text-[11px] font-bold uppercase tracking-widest text-zinc-300">SADC Capital Network • Live Terminal</span>
        </div>
        <span className="inline-block rounded-full border border-amber-500/40 px-3 py-1 font-mono text-xs font-semibold text-amber-300">
          {currentTier.name} Member
        </span>
      </div>

      {/* MAIN PORTFOLIO SUMMARY CARD */}
      <div className="glass-gold glow-edge shimmer-sweep relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-900/30 via-[#141414] to-[#0e0e0e] p-6 shadow-2xl md:p-8">
        <div className="pointer-events-none absolute right-0 top-0 select-none p-8 font-mono text-7xl text-amber-500 opacity-5">
          $PULSE
        </div>

        <div className="relative z-10 flex items-start justify-between gap-3">
          <span className="font-mono text-[11px] uppercase tracking-wider text-zinc-400">Total Net Portfolio Value</span>
          <span className="shrink-0 rounded-full border border-emerald-500/40 bg-emerald-950/60 px-2.5 py-1 font-mono text-[10px] font-bold text-emerald-400">
            ↗ Live
          </span>
        </div>
        <div className="relative z-10 mt-2 font-mono text-3xl font-extrabold tracking-tight text-white md:text-5xl">
          ${money(portfolioValue)} <span className="text-sm font-normal text-zinc-500">USDT</span>
        </div>
        <p className="relative z-10 mt-2 font-mono text-xs text-zinc-400">
          Pending yield: <span className="font-bold text-emerald-400">+${money(state.pendingYield)}</span>
        </p>

        <div className="relative z-10 mt-5 flex gap-2.5">
          <button
            onClick={() => openModal('deposit')}
            className="pulse-action flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-gradient-to-b from-amber-400 to-amber-500 px-4 py-2.5 text-xs font-bold text-black shadow-lg shadow-amber-900/30"
          >
            ↘ Deposit Capital
          </button>
          <button
            onClick={() => openModal('withdraw')}
            className="pulse-action flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-white/10 bg-black/40 px-4 py-2.5 text-xs font-bold text-zinc-200"
          >
            ↗ Withdraw Earnings
          </button>
        </div>

        <div className="relative z-10 mt-5 grid grid-cols-3 gap-2 border-t border-white/10 pt-4 text-center font-mono">
          <div>
            <span className="block text-[10px] uppercase tracking-wide text-zinc-500">Available Cash</span>
            <div className="mt-1 text-base font-bold text-white">${money(state.cash, 0)}</div>
          </div>
          <div>
            <span className="block text-[10px] uppercase tracking-wide text-zinc-500">Active Principal</span>
            <div className="mt-1 text-base font-bold text-white">${money(totalInvested, 0)}</div>
          </div>
          <div>
            <span className="block text-[10px] uppercase tracking-wide text-zinc-500">Pulse Tokens</span>
            <div className="mt-1 text-base font-bold text-amber-400">{money(state.pulse, 0)}</div>
          </div>
        </div>
      </div>

      {/* STANDING WITH LOCKED NEXT-TIER PROGRESS */}
      <div className="glow-card rounded-2xl border border-amber-500/30 bg-[#0a0a0a] p-4 shadow-lg">
        <div className="flex items-center gap-2">
          <Lock className="h-4 w-4 text-amber-400" />
          <span className="font-mono text-xs uppercase tracking-wider text-zinc-400">
            Standing: <span className="font-bold text-white">{currentTier.name} VIP</span>
          </span>
        </div>
        <p className="mt-1.5 font-mono text-sm font-bold text-emerald-400">{currentTier.yieldLabel} target</p>
        {upcoming ? (
          <div className="mt-3 space-y-2">
            <div className="flex items-center justify-between font-mono text-xs text-zinc-500">
              <span>Next Unlock: {upcoming.name}</span>
              <span className="font-bold text-amber-300">${money(totalInvested, 0)} / ${money(upcoming.minInvest, 0)}</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full border border-amber-500/20 bg-black">
              <div className="h-full rounded-full bg-gradient-to-r from-amber-600 to-yellow-400" style={{ width: `${progress}%` }} />
            </div>
          </div>
        ) : (
          <p className="mt-1.5 font-mono text-xs text-zinc-400">Apex Institutional Rank Active.</p>
        )}
      </div>

      {/* REFERRAL QUICK-ACCESS */}
      <button
        onClick={() => setView('profile')}
        className="glow-card pulse-tile flex w-full items-center justify-between rounded-2xl border border-amber-500/30 bg-[#0a0a0a] p-4 text-left shadow-lg"
      >
        <div className="space-y-0.5">
          <span className="block font-mono text-[10px] uppercase tracking-wider text-zinc-500">Your Referral Code</span>
          <p className="font-mono text-sm font-bold tracking-wider text-amber-300">{state.referralCode}</p>
        </div>
        <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 font-mono text-xs text-amber-300">
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
            <p className="font-mono text-xs text-zinc-500">No active capital allocations found. Explore the pipeline below to deploy capital.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {state.holdings.map((h) => {
              const proj = findProject(h.projectId)
              const Icon = sectorIcon(proj?.sector)
              return (
                <div key={h.id} className="glow-card pulse-tile flex items-center gap-3 rounded-2xl border border-amber-500/30 bg-[#0a0a0a] p-4">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-amber-500/30 bg-amber-500/10">
                    <Icon className="h-4 w-4 text-amber-400" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-white">{proj?.name ?? 'Legacy Holding'}</p>
                    <p className="font-mono text-xs text-amber-400">
                      ${money(h.amount, 0)} USDT <span className="text-zinc-500">· Generating Yield</span>
                    </p>
                  </div>
                  <button
                    onClick={() => api.closeInvestment(h.id)}
                    className="shrink-0 rounded-full border border-white/10 bg-black/40 px-3 py-1.5 text-[10px] font-bold text-zinc-300 transition hover:border-red-500/40 hover:text-red-400"
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
            Some holdings reference older projects no longer in the active pipeline — balances are correct, display names are limited for these.
          </p>
        )}
      </div>

      {/* QUICK ACTIONS & HUBS */}
      <div className="space-y-3">
        <h3 className="px-1 text-xs font-bold uppercase tracking-wider text-amber-300">Quick Actions &amp; Hubs</h3>
        <div className="grid grid-cols-2 gap-3">
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

      {/* REGIONAL OPPORTUNITIES PIPELINE */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs font-bold uppercase tracking-wider text-amber-300">Regional Opportunities ({projects.length})</h3>
          <span className="flex items-center gap-1.5 text-xs font-bold text-amber-400">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-amber-400" /> Verified SADC Pipeline
          </span>
        </div>
        <div className="space-y-4">
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
                {p.image && (
                  <div className="relative h-40 w-full overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={p.image} alt={p.name} className="h-full w-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                    <span className="absolute left-3 top-3 rounded-full border border-amber-500/40 bg-black/70 px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-wide text-amber-300">
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
                      <p className="font-mono text-xs text-zinc-400">{p.country} • {p.sector}</p>
                    </div>
                    <span className="shrink-0 rounded-full border border-emerald-500/40 bg-emerald-950/60 px-2.5 py-1 font-mono text-xs font-bold text-emerald-400">
                      {p.targetYield}
                    </span>
                  </div>

                  {p.summary && <p className="text-xs leading-relaxed text-zinc-400">{p.summary}</p>}

                  <div className="space-y-1.5 font-mono text-xs">
                    <div className="flex justify-between text-zinc-400">
                      <span className="font-bold text-white">{pct}% Allocated</span>
                      <span>${money(p.funded, 0)} / ${money(p.goal, 0)}</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full border border-amber-500/20 bg-black">
                      <div className="h-full rounded-full bg-gradient-to-r from-amber-600 to-yellow-400" style={{ width: `${pct}%` }} />
                    </div>
                  </div>

                  {p.risk && <p className="font-mono text-[11px] text-zinc-500">Risk Profile: {p.risk}</p>}

                  <motion.button
                    whileTap={{ scale: 0.98 }}
                    onClick={() => openModal('invest', { projectId: p.id })}
                    className="pulse-action w-full rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 px-3.5 py-2.5 text-xs font-bold text-black shadow"
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
      <div className="mt-6 space-y-2 rounded-2xl border border-amber-500/20 bg-[#0c0c0c] p-4 font-mono text-[10px] leading-relaxed text-amber-400/50">
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

function ActionTile({ icon, label, detail, badge, onClick }: { icon: React.ReactNode; label: string; detail: string; badge: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="glow-card pulse-tile flex flex-col justify-between rounded-2xl border border-amber-500/30 bg-[#101010] p-4 text-left shadow-md"
    >
      <div className="flex items-center justify-between gap-1">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-amber-500/30 bg-amber-500/10">
          {icon}
        </div>
        <span className="truncate rounded-md border border-amber-500/40 bg-amber-500/20 px-2 py-0.5 text-[10px] font-bold text-amber-300">
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
