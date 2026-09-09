'use client'

import { usePulse, money } from '@/app/providers/pulse-provider'
import { useState } from 'react'

export default function DashboardView() {
  const { state, openModal, portfolioValue, totalInvested } = usePulse()
  const [activeTab, setActiveTab] = useState<'overview' | 'projects'>('overview')

  return (
    <div className="space-y-6 text-slate-100 max-w-7xl mx-auto p-4 md:p-6 pb-24">
      
      {/* Top Status & Ambassador Terminal Bar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-2xl backdrop-blur-md">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-xs font-mono uppercase tracking-widest text-emerald-400">SADC CAPITAL • LIVE TERMINAL</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white mt-1">
            {state.fullName || state.username || 'Ambassador Member'}
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Apex Institutional Rank Active • Tier {state.tier} Unlocked {state.founderNumber ? `• Founder #${state.founderNumber}` : ''}
          </p>
        </div>

        <div className="mt-4 md:mt-0 flex gap-3">
          <button
            onClick={() => openModal('deposit')}
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-medium px-4 py-2 rounded-xl text-sm transition-all shadow-lg shadow-emerald-900/30"
          >
            + Deposit Capital
          </button>
          <button
            onClick={() => openModal('withdraw')}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium px-4 py-2 rounded-xl text-sm transition-all border border-slate-700"
          >
            Withdraw Earnings
          </button>
        </div>
      </div>

      {/* Main Portfolio Summary Card */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-900/90 to-emerald-950/30 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10 font-mono text-7xl text-emerald-500 pointer-events-none select-none">
          $PULSE
        </div>

        <div className="flex justify-between items-start flex-wrap gap-4">
          <div>
            <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">Total Net Portfolio Value</span>
            <div className="text-3xl md:text-5xl font-extrabold text-white mt-2 tracking-tight">
              ${money(portfolioValue)} <span className="text-sm font-normal text-slate-400">USDT</span>
            </div>
            <p className="text-xs text-emerald-400 mt-2 font-medium">
              Cumulative Yield: +${money(state.pendingYield)} (Active APY Tracking)
            </p>
          </div>

          <div className="bg-slate-800/80 border border-slate-700/60 rounded-xl px-4 py-2 text-xs font-mono text-emerald-400">
            +2,359.4% APY Avg
          </div>
        </div>

        {/* Breakdown Sub-Grid */}
        <div className="grid grid-cols-3 gap-4 mt-8 pt-6 border-t border-slate-800/80">
          <div>
            <span className="text-[11px] font-mono text-slate-400 uppercase">Cash Balance</span>
            <div className="text-lg md:text-xl font-bold text-white mt-1">${money(state.cash)}</div>
          </div>
          <div>
            <span className="text-[11px] font-mono text-slate-400 uppercase">Principal Deployed</span>
            <div className="text-lg md:text-xl font-bold text-white mt-1">${money(totalInvested)}</div>
          </div>
          <div>
            <span className="text-[11px] font-mono text-slate-400 uppercase">$PULSE Balance</span>
            <div className="text-lg md:text-xl font-bold text-amber-400 mt-1">{money(state.pulse, 0)}</div>
          </div>
        </div>
      </div>

      {/* Quick Standing & Navigation Tabs */}
      <div className="flex border-b border-slate-800 gap-6">
        <button
          onClick={() => setActiveTab('overview')}
          className={`pb-3 text-sm font-medium transition-colors border-b-2 ${
            activeTab === 'overview'
              ? 'border-emerald-500 text-emerald-400'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          Portfolio & Holdings ({state.holdings.length})
        </button>
        <button
          onClick={() => setActiveTab('projects')}
          className={`pb-3 text-sm font-medium transition-colors border-b-2 ${
            activeTab === 'projects'
              ? 'border-emerald-500 text-emerald-400'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          Live Synced Pipeline
        </button>
      </div>

      {/* Overview Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Active Holdings List */}
          <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <h3 className="text-base font-bold text-white mb-4">Active Tranche Holdings</h3>
            {state.holdings.length === 0 ? (
              <div className="text-center py-10 text-slate-500">
                <p className="text-sm">No active project tranches deployed yet.</p>
                <button
                  onClick={() => setActiveTab('projects')}
                  className="mt-3 text-xs text-emerald-400 hover:underline font-medium"
                >
                  Explore available infrastructure nodes &rarr;
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {state.holdings.map((h) => (
                  <div key={h.id} className="flex items-center justify-between p-4 bg-slate-800/40 border border-slate-700/40 rounded-xl">
                    <div>
                      <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-widest">{h.projectId}</span>
                      <h4 className="font-semibold text-white text-sm mt-0.5">Principal Tranche</h4>
                      <span className="text-[11px] text-slate-400">Tier: {h.tierId} • Deployed {new Date(h.date).toLocaleDateString()}</span>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-white text-sm">${money(h.amount)}</div>
                      <span className="text-[10px] text-emerald-400 font-mono">Yield Accruing</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Ledger Transactions */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <h3 className="text-base font-bold text-white mb-4">Transaction Ledger</h3>
            <div className="space-y-3">
              {state.txns.slice(0, 5).map((t) => (
                <div key={t.id} className="flex justify-between items-center text-xs py-2 border-b border-slate-800/80 last:border-0">
                  <div>
                    <div className="font-medium text-white">{t.label}</div>
                    <span className="text-[10px] text-slate-500">{new Date(t.date).toLocaleDateString()}</span>
                  </div>
                  <div className={`font-mono font-semibold ${t.currency === 'USD' ? 'text-emerald-400' : 'text-amber-400'}`}>
                    ${money(t.amount)}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* Projects Pipeline Tab Content */}
      {activeTab === 'projects' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Kalahari Solar Project Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 relative overflow-hidden group">
            <span className="text-[10px] font-mono text-emerald-400 tracking-wider">BOTSWANA • RENEWABLE ENERGY</span>
            <h3 className="text-lg font-bold text-white mt-1">Kalahari Solar Field</h3>
            <p className="text-xs text-slate-400 mt-1">Grid-interconnected solar array expansion serving Southern African energy corridors.</p>
            
            {/* Funding Progress Bar */}
            <div className="mt-5">
              <div className="flex justify-between text-xs text-slate-400 mb-1.5 font-mono">
                <span>Funded: $9,650.00</span>
                <span>Goal: $100,000.00 (10%)</span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full rounded-full w-[10%]" />
              </div>
            </div>

            <div className="mt-6 flex items-center justify-between pt-4 border-t border-slate-800">
              <div>
                <span className="text-[10px] text-slate-400 block uppercase font-mono">Target Yield</span>
                <span className="text-emerald-400 font-bold text-sm">12-15% APY</span>
              </div>
              <button
                onClick={() => openModal('invest', { projectId: 'kalahari' })}
                className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-xl text-xs font-semibold transition-colors shadow-md"
              >
                Deploy Tranche
              </button>
            </div>
          </div>

          {/* Copperbelt Royalty Note Project Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 relative overflow-hidden group">
            <span className="text-[10px] font-mono text-emerald-400 tracking-wider">ZAMBIA • MINING ROYALTIES</span>
            <h3 className="text-lg font-bold text-white mt-1">Copperbelt Royalty Note</h3>
            <p className="text-xs text-slate-400 mt-1">Secured production royalty notes backed by active copper mining output streams.</p>
            
            {/* Funding Progress Bar */}
            <div className="mt-5">
              <div className="flex justify-between text-xs text-slate-400 mb-1.5 font-mono">
                <span>Funded: $2,100.00</span>
                <span>Goal: $150,000.00 (2%)</span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full rounded-full w-[2%]" />
              </div>
            </div>

            <div className="mt-6 flex items-center justify-between pt-4 border-t border-slate-800">
              <div>
                <span className="text-[10px] text-slate-400 block uppercase font-mono">Target Yield</span>
                <span className="text-emerald-400 font-bold text-sm">16-20% APY</span>
              </div>
              <button
                onClick={() => openModal('invest', { projectId: 'copperbelt' })}
                className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-xl text-xs font-semibold transition-colors shadow-md"
              >
                Deploy Tranche
              </button>
            </div>
          </div>

        </div>
      )}

    </div>
  )
}
