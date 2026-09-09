'use client'

import { useState } from 'react'
import { money, usePulse } from '../store'

const FALLBACK_PROJECTS = [
  {
    id: 'proj-1',
    name: 'Sandsloot Lithium & Tantalum Extraction Hub',
    country: 'South Africa',
    sector: 'Critical Minerals',
    targetYield: '22.5% APY',
    goal: 500000,
    funded: 385000,
  },
  {
    id: 'proj-3',
    name: 'Copperbelt High-Voltage Grid Modernization',
    country: 'Zambia',
    sector: 'Infrastructure',
    targetYield: '24.0% APY',
    goal: 850000,
    funded: 620000,
  },
]

export function DashboardView() {
  const { state, api, openModal, totalInvested, currentTier, portfolioValue } = usePulse()
  const [activeTab, setActiveTab] = useState<'overview' | 'projects'>('overview')

  return (
    <div className="mx-auto w-full max-w-[480px] md:max-w-3xl lg:max-w-5xl space-y-4 pb-24 text-amber-100 antialiased">
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

        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <span className="font-mono text-[11px] uppercase tracking-wider text-amber-400/60">Total Net Portfolio Value</span>
            <div className="mt-2 font-mono text-3xl font-extrabold tracking-tight text-amber-300 md:text-5xl">
              ${money(portfolioValue)} <span className="text-sm font-normal text-amber-400/50">USDT</span>
            </div>
            <p className="mt-2 font-mono text-xs text-emerald-400">
              Pending yield: +${money(state.pendingYield)}
            </p>
          </div>
        </div>

        {/* Breakdown Sub-Grid */}
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

      {/* STANDING & TIER BADGE CARD */}
      <div className="flex items-center justify-between rounded-2xl border border-amber-500/30 bg-[#101010] p-4 shadow-lg">
        <div className="space-y-0.5">
          <span className="block font-mono text-[10px] uppercase tracking-wider text-amber-400/60">Standing: {currentTier.name}</span>
          <p className="text-xs font-medium text-amber-200">{currentTier.yieldLabel} target</p>
        </div>
        <div className="rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 font-mono text-xs text-amber-300">
          {currentTier.yieldLabel}
        </div>
      </div>

      {/* Quick tabs */}
      <div className="flex gap-6 border-b border-amber-500/20 pt-2">
        <button
          onClick={() => setActiveTab('overview')}
          className={`border-b-2 pb-3 text-xs font-bold uppercase tracking-wider transition-colors ${
            activeTab === 'overview' ? 'border-amber-400 text-amber-300' : 'border-transparent text-amber-400/50 hover:text-amber-300'
          }`}
        >
          Portfolio &amp; Holdings ({state.holdings.length})
        </button>
        <button
          onClick={() => setActiveTab('projects')}
          className={`border-b-2 pb-3 text-xs font-bold uppercase tracking-wider transition-colors ${
            activeTab === 'projects' ? 'border-amber-400 text-amber-300' : 'border-transparent text-amber-400/50 hover:text-amber-300'
          }`}
        >
          Projects Pipeline
        </button>
      </div>

      {activeTab === 'overview' && (
        <div className="space-y-4">
          {/* Holdings */}
          <div className="rounded-2xl border border-amber-500/30 bg-[#101010] p-5 shadow-xl">
            <h3 className="mb-4 text-xs font-bold uppercase tracking-wider text-amber-300">Active Holdings</h3>
            {state.holdings.length === 0 ? (
              <p className="font-mono text-xs text-amber-400/50">No active capital allocations found. Explore the Projects Pipeline to deploy capital.</p>
            ) : (
              <div className="space-y-2.5">
                {state.holdings.map((h) => (
                  <div key={h.id} className="flex items-center justify-between border-b border-amber-500/10 py-2 text-xs last:border-0">
                    <span className="font-medium text-amber-200">Project Holding</span>
                    <span className="font-mono font-semibold text-amber-400">${money(h.amount)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Ledger Transactions */}
          <div className="rounded-2xl border border-amber-500/30 bg-[#101010] p-5 shadow-xl">
            <h3 className="mb-4 text-xs font-bold uppercase tracking-wider text-amber-300">Transaction Ledger</h3>
            {state.txns.length === 0 ? (
              <p className="font-mono text-xs text-amber-400/50">No transactions recorded yet.</p>
            ) : (
              <div className="space-y-2.5">
                {state.txns.slice(0, 5).map((t) => (
                  <div key={t.id} className="flex items-center justify-between border-b border-amber-500/10 py-2 font-mono text-xs last:border-0">
                    <div>
                      <div className="font-medium text-amber-200">{t.label}</div>
                      <span className="text-[9px] text-amber-400/50">{new Date(t.date).toLocaleDateString()}</span>
                    </div>
                    <div className={`font-semibold ${t.currency === 'PULSE' ? 'text-amber-400' : 'text-emerald-400'}`}>
                      ${money(t.amount)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'projects' && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {FALLBACK_PROJECTS.map((p) => {
            const pct = Math.min(100, Math.round((p.funded / p.goal) * 100))
            return (
              <div key={p.id} className="overflow-hidden rounded-2xl border border-amber-500/30 bg-[#101010] shadow-xl">
                <div className="space-y-3 p-5">
                  <span className="block font-mono text-[10px] uppercase tracking-wider text-emerald-400">
                    {p.country} • {p.sector}
                  </span>
                  <h3 className="text-base font-bold text-amber-200">{p.name}</h3>

                  <div className="space-y-1.5 pt-2 font-mono text-xs">
                    <div className="flex justify-between text-amber-400/80">
                      <span>Funded: ${money(p.funded, 0)} / ${money(p.goal, 0)}</span>
                      <span className="text-amber-300">{pct}%</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full border border-amber-500/20 bg-black">
                      <div className="h-full rounded-full bg-gradient-to-r from-amber-600 to-yellow-400" style={{ width: `${pct}%` }} />
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-t border-amber-500/20 pt-3">
                    <div>
                      <span className="block font-mono text-[9px] uppercase text-amber-400/50">Target Yield</span>
                      <span className="font-mono text-xs font-bold text-emerald-400">{p.targetYield}</span>
                    </div>
                    <button
                      onClick={() => openModal('invest', { projectId: p.id })}
                      className="rounded-xl bg-amber-500 px-3.5 py-2 text-xs font-bold text-black shadow transition-colors hover:bg-amber-400"
                    >
                      Deploy Tranche
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

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
