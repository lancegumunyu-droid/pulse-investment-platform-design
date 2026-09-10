'use client'

import React from 'react'

export function DashboardView({ state, dispatch }: { state: any; dispatch: any }) {
  const account = state?.account || {
    cash_balance: 1396,
    invested_balance: 450,
    staked_balance: 0,
    pending_yield: 2136.00,
    pulse_tokens: 6750
  }

  const totalNetPortfolioValue = (account.cash_balance || 0) + (account.invested_balance || 0) + (account.staked_balance || 0)

  return (
    <div className="space-y-4 pb-24">
      {/* HERO BALANCE CARD */}
      <div className="bg-gradient-to-b from-[#181814] via-[#12120e] to-[#0a0a08] border border-amber-500/40 rounded-3xl p-6 space-y-5 shadow-2xl relative overflow-hidden">
        <div className="flex justify-between items-start">
          <p className="text-[11px] text-amber-400/70 uppercase tracking-widest font-semibold">TOTAL NET PORTFOLIO VALUE</p>
          <div className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2.5 py-1 rounded-full font-mono border border-emerald-500/30 font-bold flex items-center gap-1">
            <span>📈</span> +854.4% APY Avg
          </div>
        </div>

        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-amber-300 font-mono tracking-tight flex items-baseline gap-2">
            ${totalNetPortfolioValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            <span className="text-xs font-normal text-amber-400/60">USDT</span>
          </h1>
          <p className="text-[11px] text-emerald-400 font-mono mt-1">
            Cumulative Yield: <span className="text-emerald-300 font-bold">${(account.pending_yield || 2136).toFixed(2)}</span> (+854.4%)
          </p>
        </div>

        <div className="flex gap-2 pt-1">
          <button 
            onClick={() => dispatch({ type: 'SET_TAB', tab: 'invest' })} 
            className="flex-1 bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs py-3 rounded-xl transition shadow flex items-center justify-center gap-1.5"
          >
            <span>↘</span> Deposit Capital
          </button>
          <button 
            onClick={() => alert('Yield withdrawal request initiated.')} 
            className="flex-1 bg-[#1a1a1a] hover:bg-[#222] border border-amber-500/30 text-amber-200 font-bold text-xs py-3 rounded-xl transition flex items-center justify-center gap-1.5 shadow"
          >
            <span>↗</span> Withdraw Earnings
          </button>
        </div>

        <div className="grid grid-cols-3 gap-2 pt-3 border-t border-amber-500/15 text-center font-mono">
          <div>
            <span className="text-[9px] text-amber-400/60 block uppercase tracking-wider">AVAILABLE CASH</span>
            <span className="text-xs text-amber-200 font-bold">${(account.cash_balance || 0).toLocaleString()}</span>
          </div>
          <div>
            <span className="text-[9px] text-amber-400/60 block uppercase tracking-wider">ACTIVE PRINCIPAL</span>
            <span className="text-xs text-amber-200 font-bold">${(account.invested_balance || 0).toLocaleString()}</span>
          </div>
          <div>
            <span className="text-[9px] text-amber-400/60 block uppercase tracking-wider">PULSE TOKENS</span>
            <span className="text-xs text-amber-300 font-bold">{(account.pulse_tokens || 0).toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* STANDING: BUILDER VIP CARD */}
      <div className="bg-[#101010] border border-amber-500/30 rounded-3xl p-5 space-y-3 shadow-xl font-mono">
        <div className="flex justify-between items-center text-xs">
          <span className="text-amber-300 font-bold flex items-center gap-1.5">
            <span>🔒</span> STANDING: BUILDER VIP
          </span>
          <span className="text-[10px] text-amber-400/60">$450 / $750</span>
        </div>
        <div className="flex justify-between text-[11px] text-amber-400/70">
          <span className="text-emerald-400 font-semibold">15-18% target</span>
          <span>Next Unlock: Leader</span>
        </div>
        <div className="w-full bg-black h-2 rounded-full overflow-hidden border border-amber-500/20">
          <div className="bg-gradient-to-r from-amber-600 to-yellow-400 h-full" style={{ width: '60%' }} />
        </div>
      </div>

      {/* ACTIVE HOLDINGS */}
      <div className="space-y-3">
        <span className="font-bold text-amber-300 uppercase tracking-wider text-xs px-1">ACTIVE HOLDINGS (1)</span>
        
        <div className="bg-[#101010] border border-amber-500/30 rounded-3xl p-4 flex items-center justify-between shadow-xl">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <span>⛏️</span>
            </div>
            <div>
              <h4 className="font-bold text-amber-100 text-xs">Copperbelt Royalty Note</h4>
              <p className="text-[11px] text-amber-400/60 font-mono">$150 USDT • Generating Yield</p>
            </div>
          </div>
          <span className="text-xs font-mono text-emerald-400 font-bold">+21% APY</span>
        </div>
      </div>
    </div>
  )
}
