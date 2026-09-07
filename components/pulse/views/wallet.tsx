'use client'

import React, { useState } from 'react'
import { Wallet, ArrowUpRight, ArrowDownLeft, ShieldCheck, History, CreditCard, ChevronRight, CheckCircle2, X } from 'lucide-react'
import { usePulse } from '../store'

export function WalletView() {
  const { 
    pulseLiquid, 
    pulseStaked, 
    vaultCash, 
    activities, 
    sellPulse,
    portfolioBalance,
    withdrawalAddress,
    setWithdrawalAddress
  } = usePulse()

  const [addressInput, setAddressInput] = useState('')
  const [isSellOpen, setIsSellOpen] = useState(false)
  const [sellAmount, setSellAmount] = useState('')
  const [sellError, setSellError] = useState<string | null>(null)
  const [isSuccess, setIsSuccess] = useState(false)

  // Computed Portfolio calculation ensuring live sync across all data points
  const calculatedPortfolio = portfolioBalance ?? ((vaultCash || 0) + ((pulseLiquid || 0) + (pulseStaked || 0)) * 0.08)

  const handleConnectWallet = () => {
    if (!addressInput) return
    if (setWithdrawalAddress) {
      setWithdrawalAddress(addressInput)
    }
    setAddressInput('')
    alert('Withdrawal wallet connected successfully!')
  }

  const handleSellSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSellError(null)

    const numericAmt = parseFloat(sellAmount)
    if (isNaN(numericAmt) || numericAmt <= 0) {
      setSellError('Please enter a valid amount greater than 0.')
      return
    }

    if (numericAmt > (pulseLiquid || 0)) {
      setSellError(`Amount exceeds liquid balance (${(pulseLiquid || 0).toLocaleString()} PULSE).`)
      return
    }

    if (sellPulse) {
      sellPulse(numericAmt)
    }
    setIsSuccess(true)

    setTimeout(() => {
      setIsSuccess(false)
      setIsSellOpen(false)
      setSellAmount('')
    }, 1500)
  }

  return (
    <div className="w-full max-w-xl mx-auto p-4 md:p-6 text-white space-y-6 font-sans">
      
      {/* TOP HEADER & PORTFOLIO BAR */}
      <div className="flex justify-between items-center bg-neutral-900/90 border border-white/10 p-4 rounded-2xl backdrop-blur-md">
        <div>
          <span className="text-[10px] font-mono tracking-widest text-neutral-400 block">PULSE PLATFORM</span>
          <h1 className="text-lg font-bold text-white tracking-tight">Wallet & Activity</h1>
        </div>
        <div className="text-right">
          <span className="text-[10px] font-mono tracking-widest text-neutral-400 block uppercase">Portfolio</span>
          <span className="text-xl font-bold font-mono text-amber-400">
            ${calculatedPortfolio.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>
      </div>

      {/* 1. CASH WALLET SECTION */}
      <div className="bg-neutral-900/90 border border-white/10 rounded-2xl p-5 space-y-4 shadow-xl">
        <div className="flex justify-between items-start">
          <div>
            <span className="text-xs font-mono text-amber-400 font-bold tracking-wider">CASH WALLET</span>
            <div className="text-3xl font-extrabold font-mono mt-1 text-white">
              ${(vaultCash || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-neutral-400 mt-0.5">Available to invest, withdraw, or send</p>
          </div>
          <div className="w-8 h-8 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <CreditCard className="w-4 h-4" />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 pt-1">
          <button className="bg-amber-400 hover:bg-amber-300 text-black font-semibold py-2.5 rounded-xl text-xs transition flex items-center justify-center gap-1.5 shadow-lg shadow-amber-400/10">
            <ArrowDownLeft className="w-3.5 h-3.5" /> Deposit
          </button>
          <button className="bg-neutral-800 hover:bg-neutral-700 text-white font-semibold py-2.5 rounded-xl text-xs transition border border-white/10 flex items-center justify-center gap-1.5">
            <ArrowUpRight className="w-3.5 h-3.5" /> Withdraw
          </button>
          <button className="bg-neutral-800 hover:bg-neutral-700 text-white font-semibold py-2.5 rounded-xl text-xs transition border border-white/10 flex items-center justify-center gap-1.5">
            Send
          </button>
        </div>
      </div>

      {/* 2. WITHDRAWAL WALLET CONNECTION */}
      <div className="bg-neutral-900/90 border border-white/10 rounded-2xl p-4 space-y-3 shadow-xl">
        <div className="text-xs text-neutral-300">
          {withdrawalAddress ? (
            <span className="text-emerald-400 font-mono flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4" /> Connected: {withdrawalAddress.slice(0, 6)}...{withdrawalAddress.slice(-4)}
            </span>
          ) : (
            <div>
              <span className="font-bold text-white block mb-0.5">No withdrawal wallet connected</span>
              <span className="text-neutral-400 text-[11px] leading-relaxed block">
                Add or manage the address you want withdrawals sent to — USDT (TRC-20) or BTC.
              </span>
            </div>
          )}
        </div>

        {!withdrawalAddress && (
          <div className="space-y-2 pt-1">
            <input 
              type="text" 
              placeholder="Paste your receiving address" 
              value={addressInput}
              onChange={(e) => setAddressInput(e.target.value)}
              className="w-full bg-black/60 border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-amber-400 transition"
            />
            <button 
              onClick={handleConnectWallet}
              className="w-full bg-neutral-800 hover:bg-neutral-700 text-amber-400 font-semibold py-2.5 rounded-xl text-xs transition border border-white/10 flex items-center justify-center gap-1.5"
            >
              Connect wallet
            </button>
          </div>
        )}
      </div>

      {/* 3. PULSE WALLET SECTION */}
      <div className="bg-neutral-900/90 border border-white/10 rounded-2xl p-5 space-y-4 shadow-xl">
        <div className="flex justify-between items-center">
          <div>
            <span className="text-xs font-mono text-amber-400 font-bold tracking-wider">PULSE WALLET</span>
          </div>
          <div className="text-right font-mono text-lg font-bold text-white">
            {((pulseLiquid || 0) + (pulseStaked || 0)).toLocaleString()}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="bg-black/60 border border-white/10 p-3.5 rounded-xl">
            <span className="text-[10px] font-mono text-neutral-400 block tracking-wider">LIQUID - USABLE NOW</span>
            <div className="text-lg font-bold font-mono text-amber-400 mt-1">
              {(pulseLiquid || 0).toLocaleString()}
            </div>
          </div>
          <div className="bg-black/60 border border-white/10 p-3.5 rounded-xl">
            <span className="text-[10px] font-mono text-neutral-400 block tracking-wider">STAKED - 24.8% APY</span>
            <div className="text-lg font-bold font-mono text-amber-400 mt-1">
              {(pulseStaked || 0).toLocaleString()}
            </div>
          </div>
        </div>

        <button
          onClick={() => setIsSellOpen(true)}
          className="w-full py-3 rounded-xl bg-neutral-800 hover:bg-neutral-700 border border-white/10 text-amber-400 font-semibold text-xs tracking-wider transition flex items-center justify-center gap-2"
        >
          <span>Sell PULSE for cash</span>
        </button>
      </div>

      {/* 4. LIVE ACTIVITY FEED SECTION */}
      <div className="bg-neutral-900/90 border border-white/10 rounded-2xl p-5 space-y-3 shadow-xl">
        <div className="flex justify-between items-center pb-2 border-b border-white/10">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-bold text-white uppercase tracking-wider">Live Activity Feed</span>
          </div>
          <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Live Sync Active
          </span>
        </div>

        <div className="space-y-2 pt-1">
          {(!activities || activities.length === 0) ? (
            <p className="text-xs text-neutral-500 py-3 text-center">No transaction activity recorded for this user account yet.</p>
          ) : (
            activities.slice(0, 5).map((act, idx) => (
              <div key={act.id || idx} className="flex justify-between items-center text-xs py-2 border-b border-white/5 last:border-0">
                <div>
                  <span className="text-neutral-200 font-medium block">{act.description || act.type}</span>
                  <span className="text-[10px] font-mono text-neutral-500">{new Date(act.date || act.created_at || Date.now()).toLocaleDateString()}</span>
                </div>
                <span className="text-amber-400 font-mono font-bold">+{act.amount.toLocaleString()} PULSE</span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* RISK DISCLAIMER */}
      <div className="p-3 bg-black/40 rounded-xl border border-white/5 text-[10px] text-neutral-500 leading-relaxed font-sans">
        <strong className="text-neutral-400">Risk Warning:</strong> Trading stocks, options, futures, and forex carries a high level of risk and may not be suitable for all investors. Leverage can work against you as well as for you.
      </div>

      {/* LIQUIDATION MODAL */}
      {isSellOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-neutral-900 border border-white/20 p-6 space-y-5 shadow-2xl">
            <div className="flex justify-between items-center pb-3 border-b border-white/10">
              <h3 className="text-sm font-bold tracking-wider text-white uppercase">Liquidate PULSE Tokens</h3>
              <button onClick={() => setIsSellOpen(false)} className="text-neutral-400 hover:text-white transition">
                <X className="w-5 h-5" />
              </button>
            </div>

            {isSuccess ? (
              <div className="py-8 text-center space-y-3">
                <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
                <h4 className="font-bold text-white text-base">Liquidation Successful!</h4>
                <p className="text-xs text-neutral-400">PULSE converted to cash balance immediately.</p>
              </div>
            ) : (
              <form onSubmit={handleSellSubmit} className="space-y-4">
                <div>
                  <div className="flex justify-between text-xs text-neutral-400 mb-1 font-mono">
                    <span>Amount to Sell</span>
                    <span>Max: {(pulseLiquid || 0).toLocaleString()}</span>
                  </div>
                  <input
                    type="number"
                    value={sellAmount}
                    onChange={(e) => setSellAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full bg-black/60 border border-white/15 rounded-xl p-3 text-white font-mono focus:outline-none focus:border-amber-400 transition"
                  />
                </div>

                {sellError && <p className="text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 p-2.5 rounded-xl">{sellError}</p>}

                <button
                  type="submit"
                  className="w-full bg-amber-400 hover:bg-amber-300 text-black font-semibold py-3 rounded-xl text-xs transition shadow-lg shadow-amber-400/10"
                >
                  Confirm Liquidation
                </button>
              </form>
            )}
          </div>
        </div>
      )}

    </div>
  )
}

export default WalletView
