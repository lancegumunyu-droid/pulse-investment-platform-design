'use client'

import { usePulse, money } from '@/app/providers/pulse-provider'
import { useState } from 'react'

export default function DashboardView() {
  const { state, openModal, portfolioValue, totalInvested } = usePulse()
  const [activeTab, setActiveTab] = useState<'overview' | 'projects'>('overview')

  return (
    <div className="min-h-screen bg-[#060606] text-amber-100 font-sans flex flex-col items-center pb-40 selection:bg-amber-500 selection:text-black">
      <div className="w-full max-w-[480px] md:max-w-3xl lg:max-w-5xl mx-auto px-4 py-4 space-y-4">
        
        {/* ======================================================= */}
        {/* EXACT TOP HEADER BAR (NAVIGATION & BALANCE PILL)        */}
        {/* ======================================================= */}
        <div className="w-full bg-[#101010]/90 border border-amber-500/30 rounded-full px-4 py-2.5 flex items-center justify-between shadow-2xl backdrop-blur-md">
          <div className="flex items-center space-x-2.5">
            <div className="w-6 h-6 rounded-full bg-amber-500 flex items-center justify-center font-black text-black text-xs shadow-md">
              P
            </div>
            <div>
              <span className="text-xs font-bold text-amber-300 tracking-wider uppercase block">Pulse</span>
              <span className="text-[9px] text-amber-400/60 block">Grow responsibly</span>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="hidden sm:flex flex-col text-right">
              <span className="text-[9px] font-mono text-amber-400/60 uppercase">PORTFOLIO</span>
              <span className="text-xs font-mono font-bold text-amber-300">${money(portfolioValue)}</span>
            </div>
            <div className="bg-black/70 border border-amber-500/20 px-3 py-1.5 rounded-full flex items-center space-x-2 shadow-inner">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-xs font-mono font-bold text-amber-300">${money(portfolioValue)}</span>
            </div>
          </div>
        </div>

        {/* ======================================================= */}
        {/* SADC CAPITAL TERMINAL STATUS BAR                        */}
        {/* ======================================================= */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-gradient-to-br from-[#121212] to-[#0a0a0a] border border-amber-500/30 rounded-2xl p-5 shadow-2xl relative overflow-hidden">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-400">SADC CAPITAL • LIVE TERMINAL</span>
            </div>
            <h1 className="text-xl md:text-2xl font-bold tracking-tight text-amber-200">
              {state.fullName || state.username || 'Ambassador Member'}
            </h1>
            <p className="text-[11px] text-amber-400/60 font-mono">
              Apex Institutional Rank Active • Tier {state.tier} Unlocked {state.founderNumber ? `• Founder #${state.founderNumber}` : ''}
            </p>
          </div>

          <div className="mt-4 md:mt-0 flex gap-2.5 w-full md:w-auto">
            <button
              onClick={() => openModal('deposit')}
              className="flex-1 md:flex-none bg-amber-500 hover:bg-amber-400 text-black font-bold px-4 py-2 rounded-xl text-xs transition-all shadow-lg shadow-amber-900/30"
            >
              + Deposit Capital
            </button>
            <button
              onClick={() => openModal('withdraw')}
              className="flex-1 md:flex-none bg-amber-950/40 hover:bg-amber-900/40 text-amber-300 font-bold px-4 py-2 rounded-xl text-xs transition-all border border-amber-500/30"
            >
              Withdraw Earnings
            </button>
          </div>
        </div>

        {/* ======================================================= */}
        {/* MAIN PORTFOLIO SUMMARY CARD                             */}
        {/* ======================================================= */}
        <div className="bg-gradient-to-br from-[#141414] via-[#0e0e0e] to-emerald-950/20 border border-amber-500/30 rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-5 font-mono text-7xl text-amber-500 pointer-events-none select-none">
            $PULSE
          </div>

          <div className="flex justify-between items-start flex-wrap gap-4">
            <div>
              <span className="text-[11px] font-mono text-amber-400/60 uppercase tracking-wider">TOTAL NET PORTFOLIO VALUE</span>
              <div className="text-3xl md:text-5xl font-extrabold text-amber-300 mt-2 tracking-tight font-mono">
                ${money(portfolioValue)} <span className="text-sm font-normal text-amber-400/50">USDT</span>
              </div>
              <p className="text-xs text-emerald-400 mt-2 font-mono">
                Cumulative Yield: +${money(state.pendingYield)} (Active APY Tracking)
              </p>
            </div>

            <div className="bg-black/60 border border-amber-500/30 rounded-xl px-3.5 py-1.5 text-xs font-mono text-amber-300">
              +2,359.4% APY Avg
            </div>
          </div>

          {/* Breakdown Sub-Grid (Synced from State) */}
          <div className="grid grid-cols-3 gap-3 mt-6 pt-5 border-t border-amber-500/20 text-center font-mono">
            <div className="bg-black/40 p-3 rounded-2xl border border-amber-500/10">
              <span className="text-[10px] text-amber-400/60 block uppercase">CASH BALANCE</span>
              <div className="text-base md:text-lg font-bold text-amber-200 mt-1">${money(state.cash)}</div>
            </div>
            <div className="bg-black/40 p-3 rounded-2xl border border-amber-500/10">
              <span className="text-[10px] text-amber-400/60 block uppercase">PRINCIPAL DEPLOYED</span>
              <div className="text-base md:text-lg font-bold text-amber-200 mt-1">${money(totalInvested)}</div>
            </div>
            <div className="bg-black/40 p-3 rounded-2xl border border-amber-500/10">
              <span className="text-[10px] text-amber-400/60 block uppercase">$PULSE BALANCE</span>
              <div className="text-base md:text-lg font-bold text-amber-400 mt-1">{money(state.pulse, 0)}</div>
            </div>
          </div>
        </div>

        {/* ======================================================= */}
        {/* STANDING & TIER BADGE CARD                              */}
        {/* ======================================================= */}
        <div className="bg-[#101010] border border-amber-500/30 rounded-2xl p-4 flex items-center justify-between shadow-lg">
          <div className="space-y-0.5">
            <span className="text-[10px] font-mono text-amber-400/60 uppercase tracking-wider block">🛡️ STANDING: AMBASSADOR VIP</span>
            <p className="text-xs text-amber-200 font-medium">Apex Institutional Rank Active • Max Tier Unlocked.</p>
          </div>
          <div className="bg-amber-500/10 border border-amber-500/30 px-3 py-1 rounded-full text-xs font-mono text-amber-300">
            19-22% target
          </div>
        </div>

        {/* Quick Navigation Tabs */}
        <div className="flex border-b border-amber-500/20 gap-6 pt-2">
          <button
            onClick={() => setActiveTab('overview')}
            className={`pb-3 text-xs font-bold uppercase tracking-wider transition-colors border-b-2 ${
              activeTab === 'overview'
                ? 'border-amber-400 text-amber-300'
                : 'border-transparent text-amber-400/50 hover:text-amber-300'
            }`}
          >
            Portfolio & Holdings ({state.holdings.length})
          </button>
          <button
            onClick={() => setActiveTab('projects')}
            className={`pb-3 text-xs font-bold uppercase tracking-wider transition-colors border-b-2 ${
              activeTab === 'projects'
                ? 'border-amber-400 text-amber-300'
                : 'border-transparent text-amber-400/50 hover:text-amber-300'
            }`}
          >
            Live Synced Pipeline
          </button>
        </div>

        {/* Overview Tab Content */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            
            {/* Active Holdings List */}
            <div className="lg:col-span-2 bg-[#101010] border border-amber-500/30 rounded-2xl p-5 shadow-xl">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xs font-bold text-amber-300 uppercase tracking-wider">Active Holdings ({state.holdings.length})</h3>
                <span onClick={() => setActiveTab('projects')} className="text-[10px] text-amber-400 hover:underline cursor-pointer font-mono">Explore →</span>
              </div>

              {state.holdings.length === 0 ? (
                <div className="text-center py-8 text-amber-400/40">
                  <p className="text-xs">No active project tranches deployed yet.</p>
                  <button
                    onClick={() => setActiveTab('projects')}
                    className="mt-2 text-xs text-amber-400 hover:underline font-mono"
                  >
                    Explore available infrastructure nodes &rarr;
                  </button>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {state.holdings.map((h) => (
                    <div key={h.id} className="flex items-center justify-between p-3.5 bg-black/40 border border-amber-500/20 rounded-xl font-mono text-xs">
                      <div>
                        <span className="text-[9px] text-emerald-400 uppercase tracking-widest">{h.projectId}</span>
                        <div className="font-bold text-amber-200 mt-0.5">Principal Tranche</div>
                        <span className="text-[10px] text-amber-400/50">Tier: {h.tierId} • Deployed {new Date(h.date).toLocaleDateString()}</span>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-amber-300">${money(h.amount)}</div>
                        <span className="text-[9px] text-emerald-400">Yield Accruing</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recent Ledger Transactions */}
            <div className="bg-[#101010] border border-amber-500/30 rounded-2xl p-5 shadow-xl">
              <h3 className="text-xs font-bold text-amber-300 uppercase tracking-wider mb-4">Transaction Ledger</h3>
              <div className="space-y-2.5">
                {state.txns.slice(0, 5).map((t) => (
                  <div key={t.id} className="flex justify-between items-center text-xs py-2 border-b border-amber-500/10 last:border-0 font-mono">
                    <div>
                      <div className="font-medium text-amber-200">{t.label}</div>
                      <span className="text-[9px] text-amber-400/50">{new Date(t.date).toLocaleDateString()}</span>
                    </div>
                    <div className={`font-semibold ${t.currency === 'USD' ? 'text-emerald-400' : 'text-amber-400'}`}>
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Kalahari Solar Project Card */}
            <div className="bg-[#101010] border border-amber-500/30 rounded-2xl overflow-hidden shadow-xl">
              <div className="p-5 space-y-3">
                <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-wider block">BOTSWANA • RENEWABLE ENERGY</span>
                <h3 className="text-base font-bold text-amber-200">Kalahari Solar Field</h3>
                <p className="text-xs text-amber-400/60">Grid-interconnected solar array expansion serving Southern African energy corridors.</p>
                
                {/* Funding Progress Bar */}
                <div className="space-y-1.5 pt-2 font-mono text-xs">
                  <div className="flex justify-between text-amber-400/80">
                    <span>Funded: $9,650.00 / $100,000.00</span>
                    <span className="text-amber-300">10%</span>
                  </div>
                  <div className="w-full bg-black h-2 rounded-full overflow-hidden border border-amber-500/20">
                    <div className="bg-gradient-to-r from-amber-600 to-yellow-400 h-full rounded-full w-[10%]" />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-amber-500/20">
                  <div>
                    <span className="text-[9px] text-amber-400/50 block uppercase font-mono">Target Yield</span>
                    <span className="text-emerald-400 font-bold text-xs font-mono">12-15% APY</span>
                  </div>
                  <button
                    onClick={() => openModal('invest', { projectId: 'kalahari' })}
                    className="bg-amber-500 hover:bg-amber-400 text-black px-3.5 py-2 rounded-xl text-xs font-bold transition-colors shadow"
                  >
                    Deploy Tranche
                  </button>
                </div>
              </div>
            </div>

            {/* Copperbelt Royalty Note Project Card */}
            <div className="bg-[#101010] border border-amber-500/30 rounded-2xl overflow-hidden shadow-xl">
              <div className="p-5 space-y-3">
                <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-wider block">ZAMBIA • MINING ROYALTIES</span>
                <h3 className="text-base font-bold text-amber-200">Copperbelt Royalty Note</h3>
                <p className="text-xs text-amber-400/60">Secured production royalty notes backed by active copper mining output streams.</p>
                
                {/* Funding Progress Bar */}
                <div className="space-y-1.5 pt-2 font-mono text-xs">
                  <div className="flex justify-between text-amber-400/80">
                    <span>Funded: $2,100.00 / $150,000.00</span>
                    <span className="text-amber-300">2%</span>
                  </div>
                  <div className="w-full bg-black h-2 rounded-full overflow-hidden border border-amber-500/20">
                    <div className="bg-gradient-to-r from-amber-600 to-yellow-400 h-full rounded-full w-[2%]" />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-amber-500/20">
                  <div>
                    <span className="text-[9px] text-amber-400/50 block uppercase font-mono">Target Yield</span>
                    <span className="text-emerald-400 font-bold text-xs font-mono">16-20% APY</span>
                  </div>
                  <button
                    onClick={() => openModal('invest', { projectId: 'copperbelt' })}
                    className="bg-amber-500 hover:bg-amber-400 text-black px-3.5 py-2 rounded-xl text-xs font-bold transition-colors shadow"
                  >
                    Deploy Tranche
                  </button>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* ======================================================= */}
        {/* COMPLIANCE & REGULATORY DISCLAIMER WIDGET               */}
        {/* ======================================================= */}
        <div className="bg-[#0c0c0c] border border-amber-500/20 rounded-2xl p-4 text-[10px] text-amber-400/50 space-y-2 font-mono leading-relaxed mt-6">
          <div className="flex items-center space-x-2 text-amber-300 font-bold uppercase tracking-wider">
            <span>⚠️</span>
            <span>Institutional Regulatory Disclaimer</span>
          </div>
          <p>
            The SADC Sovereign Terminal and Pulse instruments represent qualified institutional infrastructure placements. Yield outputs, APY metrics, and capital tranches reflect live provider database ledger states and smart-contract protocol calculations. Past performance does not guarantee future sovereign distributions. All allocations are subject to regional compliance mandates and cross-border regulatory frameworks.
          </p>
        </div>

      </div>

      {/* Bottom Fixed Navigation Dock */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#0c0c0c]/95 backdrop-blur border-t border-amber-500/20 py-3 px-3 flex justify-around items-center z-40 max-w-xl mx-auto rounded-t-2xl shadow-2xl">
        <button onClick={() => setActiveTab('overview')} className="flex flex-col items-center text-[9px] text-amber-400 font-bold">
          <span className="text-sm">🏠</span>
          <span>HOME</span>
        </button>
        <button onClick={() => setActiveTab('projects')} className="flex flex-col items-center text-[9px] text-amber-400/60 hover:text-amber-300">
          <span className="text-sm">📈</span>
          <span>INVEST</span>
        </button>
        <button onClick={() => openModal('deposit')} className="flex flex-col items-center text-[9px] text-amber-400/60 hover:text-amber-300">
          <span className="text-sm">✨</span>
          <span>SALE</span>
        </button>
        <button onClick={() => openModal('invest')} className="flex flex-col items-center text-[9px] text-amber-400/60 hover:text-amber-300">
          <span className="text-sm">⚡</span>
          <span>STAKE</span>
        </button>
        <button onClick={() => alert('Signals feed active.')} className="flex flex-col items-center text-[9px] text-amber-400/60 hover:text-amber-300">
          <span className="text-sm">📡</span>
          <span>SIGNALS</span>
        </button>
      </div>
    </div>
  )
}
