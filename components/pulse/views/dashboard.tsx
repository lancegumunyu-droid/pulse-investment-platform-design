'use client'

import { useEffect, useState } from 'react'
import { Award, Layers, Radio, Rocket, ShieldCheck, Zap } from 'lucide-react'
import { money, usePulse } from '../store'
import { PROJECTS, type Project } from '@/lib/pulse-data'

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

  const projectName = (projectId: string) => PROJECTS.find((p) => p.id === projectId)?.name ?? 'Project Holding'

  return (
    <div className="mx-auto w-full max-w-[480px] space-y-4 pb-24 text-amber-100 antialiased md:max-w-3xl lg:max-w-5xl">
      {/* SADC CAPITAL TERMINAL STATUS BAR */}
      <div className="relative flex flex-col items-start justify-between gap-4 overflow-hidden rounded-2xl border border-amber-500/30 bg-gradient-to-br from-[#121212] to-[#0a0a0a] p-5 shadow-2xl md:flex-row md:items-center">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
            <span className="font-mono text-[10px] uppercase tracking-widest text-emerald-400">SADC Capital • Live Terminal</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-amber-200 md:text-2xl">
            {state.fullName || state.username || 'Investor'}
          </h1>
          <p className="font-mono text-[11px] text-amber-400/60">
            {currentTier.name} Tier Active{state.founderNumber ? ` • Founder #${state.founderNumber}` : ''}
          </p>
        </div>

        <div className="flex w-full gap-2.5 md:w-auto">
          <button
            onClick={() => openModal('deposit')}
            className="flex-1 rounded-xl bg-amber-500 px-4 py-2 text-xs font-bold text-black shadow-lg shadow-amber-900/30 transition-all hover:bg-amber-400 md:flex-none"
          >
            + Deposit Capital
          </button>
          <button
            onClick={() => openModal('withdraw')}
            className="flex-1 rounded-xl border border-amber-500/30 bg-amber-950/40 px-4 py-2 text-xs font-bold text-amber-300 transition-all hover:bg-amber-900/40 md:flex-none"
          >
            Withdraw Earnings
          </button>
        </div>
      </div>

      {/* MAIN PORTFOLIO SUMMARY CARD */}
      <div className="relative overflow-hidden rounded-3xl border border-amber-500/30 bg-gradient-to-br from-[#141414] via-[#0e0e0e] to-emerald-950/20 p-6 shadow-2xl md:p-8">
        <div className="pointer-events-none absolute right-0 top-0 select-none p-8 font-mono text-7xl text-amber-500 opacity-5">
          $PULSE
        </div>

        <span className="font-mono text-[11px] uppercase tracking-wider text-amber-400/60">Total Net Portfolio Value</span>
        <div className="mt-2 font-mono text-3xl font-extrabold tracking-tight text-amber-300 md:text-5xl">
          ${money(portfolioValue)} <span className="text-sm font-normal text-amber-400/50">USDT</span>
        </div>
        <p className="mt-2 font-mono text-xs text-emerald-400">Pending yield: +${money(state.pendingYield)}</p>

        <div className="mt-6 grid grid-cols-3 gap-3 border-t border-amber-500/20 pt-5 text-center font-mono">
          <div className="rounded-2xl border border-amber-500/10 bg-black/40 p-3">
            <span className="block text-[10px] uppercase text-amber-400/60">Cash Balance</span>
            <div className="mt-1 text-base font-bold text-amber-200 md:text-lg">${money(state.cash)}</div>
          </div>
          <div className="rounded-2xl border border-amber-500/10 bg-black/40 p-3">
            <span className="block text-[10px] uppercase text-amber-400/60">Principal Deployed</span>
            <div className="mt-1 text-base font-bold text-amber-200 md:text-lg">${money(totalInvested)}</div>
          </div>
          <div className="rounded-2xl border border-amber-500/10 bg-black/40 p-3">
            <span className="block text-[10px] uppercase text-amber-400/60">$PULSE Balance</span>
            <div className="mt-1 text-base font-bold text-amber-400 md:text-lg">{money(state.pulse, 0)}</div>
          </div>
        </div>
      </div>

      {/* STANDING & REFERRAL QUICK-ACCESS */}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <div className="flex items-center justify-between rounded-2xl border border-amber-500/30 bg-[#101010] p-4 shadow-lg">
          <div className="space-y-0.5">
            <span className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-amber-400/60">
              <Award className="h-3.5 w-3.5" /> Standing: {currentTier.name}
            </span>
            <p className="text-xs font-medium text-amber-200">{currentTier.yieldLabel} target</p>
          </div>
          <div className="rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 font-mono text-xs text-amber-300">
            {currentTier.yieldLabel}
          </div>
        </div>

        <button
          onClick={() => setView('profile')}
          className="flex items-center justify-between rounded-2xl border border-amber-500/30 bg-[#101010] p-4 text-left shadow-lg transition hover:border-amber-500/50"
        >
          <div className="space-y-0.5">
            <span className="block font-mono text-[10px] uppercase tracking-wider text-amber-400/60">Your Referral Code</span>
            <p className="font-mono text-sm font-bold tracking-wider text-amber-300">{state.referralCode}</p>
          </div>
          <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 font-mono text-xs text-amber-300">
            {state.referralCount} joined
          </span>
        </button>
      </div>

      {/* ACTIVE HOLDINGS */}
      <div className="rounded-2xl border border-amber-500/30 bg-[#101010] p-5 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-300">
            <Layers className="h-4 w-4" /> Active Holdings ({state.holdings.length})
          </h3>
          <button onClick={() => setView('invest')} className="text-xs font-bold text-amber-400 hover:underline">
            Explore →
          </button>
        </div>
        {state.holdings.length === 0 ? (
          <p className="font-mono text-xs text-amber-400/50">No active capital allocations found. Explore the pipeline below to deploy capital.</p>
        ) : (
          <div className="space-y-2.5">
            {state.holdings.map((h) => (
              <div key={h.id} className="flex items-center justify-between border-b border-amber-500/10 py-2 text-xs last:border-0">
                <span className="font-medium text-amber-200">{projectName(h.projectId)}</span>
                <span className="font-mono font-semibold text-amber-400">${money(h.amount)}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* REGIONAL OPPORTUNITIES PIPELINE */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs font-bold uppercase tracking-wider text-amber-300">Regional Opportunities Pipeline ({projects.length})</h3>
          <span className="flex items-center gap-1.5 text-xs font-bold text-amber-400">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-amber-400" /> Live Ledger Synced
          </span>
        </div>
        <div className="grid gap-4">
          {projects.map((p) => {
            const pct = p.goal > 0 ? Math.min(100, Math.round((p.funded / p.goal) * 100)) : 0
            return (
              <div key={p.id} className="overflow-hidden rounded-2xl border border-amber-500/30 bg-[#101010] shadow-xl">
                <div className="relative h-36 w-full overflow-hidden bg-amber-950/30">
                  {p.image && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={p.image} alt={p.name} className="h-full w-full object-cover" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#101010] via-[#101010]/30 to-transparent" />
                  <div className="absolute right-3 top-3 rounded-lg border border-emerald-500/40 bg-emerald-950/90 px-2.5 py-1 text-xs font-bold text-emerald-300">
                    {p.targetYield}
                  </div>
                  <div className="absolute bottom-3 left-4 right-4">
                    <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-amber-300">{p.country} • {p.sector}</p>
                    <h4 className="text-base font-bold text-white">{p.name}</h4>
                  </div>
                </div>
                <div className="space-y-3 p-5">
                  <div className="space-y-1.5 font-mono text-xs">
                    <div className="flex justify-between text-amber-400/80">
                      <span>Funded: ${money(p.funded, 0)} / ${money(p.goal, 0)}</span>
                      <span className="text-amber-300">{pct}%</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full border border-amber-500/20 bg-black">
                      <div className="h-full rounded-full bg-gradient-to-r from-amber-600 to-yellow-400" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                  <button
                    onClick={() => openModal('invest', { projectId: p.id })}
                    className="w-full rounded-xl bg-amber-500 px-3.5 py-2.5 text-xs font-bold text-black shadow transition-colors hover:bg-amber-400"
                  >
                    Deploy Tranche
                  </button>
                </div>
              </div>
            )
          })}
        </div>
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
      className="flex flex-col justify-between rounded-2xl border border-amber-500/30 bg-[#101010] p-4 text-left shadow-md transition hover:border-amber-400"
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
