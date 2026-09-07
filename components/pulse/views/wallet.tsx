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
    <div className="w-full max-w-md mx-auto p-4 bg-black text-white rounded-xl space-y-6 font-sans">
      
      {/* Portfolio Header */}
      <div className="flex justify-between items-center bg-zinc-900 p-4 rounded-xl border border-zinc-800">
        <div>
          <span className="text-xs text-zinc-400 tracking-wider">PORTFOLIO</span>
          <h2 className="text-2xl font-bold text-amber-400">
            ${(portfolioBalance ?? ((vaultCash || 0) + ((pulseLiquid || 0) + (pulseStaked || 0)) * 0.08)).toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </h2>
        </div>
      </div>

      {/* Cash Wallet Section */}
      <div className="bg-zinc-900 p-5 rounded-2xl border border-zinc-800 space-y-4">
        <div>
          <span className="text-xs text-amber-500 font-semibold tracking-wider">CASH WALLET / VAULT</span>
          <h3 className="text-3xl font-extrabold mt-1">
            ${(vaultCash || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </h3>
          <p className="text-xs text-zinc-400 mt-1">Available to invest, withdraw, or send</p>
        </div>
        <div className="grid grid-cols-3 gap-2 pt-2">
          <button className="bg-amber-400 text-black font-semibold py-2.5 rounded-xl text-sm hover:bg-amber-300 transition">Deposit</button>
          <button 
            onClick={() => setIsSellOpen(true)}
            className="bg-zinc-800 text-white font-semibold py-2.5 rounded-xl text-sm hover:bg-zinc-700 transition"
          >
            Liquidate
          </button>
          <button className="bg-zinc-800 text-white font-semibold py-2.5 rounded-xl text-sm hover:bg-zinc-700 transition">Send</button>
        </div>
      </div>

      {/* Withdrawal Wallet Connection */}
      <div className="bg-zinc-900 p-4 rounded-xl border border-zinc-800 space-y-3">
        <p className="text-xs text-zinc-400">
          {withdrawalAddress 
            ? `Connected: ${withdrawalAddress.slice(0, 6)}...${withdrawalAddress.slice(-4)}`
            : "No withdrawal wallet connected. Add address for USDT (TRC-20) or BTC."}
        </p>
        {!withdrawalAddress && (
          <div className="space-y-2">
            <input 
              type="text" 
              placeholder="Paste your receiving address" 
              value={addressInput}
              onChange={(e) => setAddressInput(e.target.value)}
              className="w-full bg-black border border-zinc-700 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-amber-400"
            />
            <button 
              onClick={handleConnectWallet}
              className="w-full bg-zinc-800 hover:bg-zinc-700 text-amber-400 font-medium py-2 rounded-lg text-xs transition border border-zinc-700"
            >
              Connect wallet
            </button>
          </div>
        )}
      </div>

      {/* Pulse Wallet Grid */}
      <div className="bg-zinc-900 p-4 rounded-xl border border-zinc-800 grid grid-cols-2 gap-3">
        <div className="bg-black p-3 rounded-lg border border-zinc-800">
          <span className="text-[10px] text-amber-400 block font-bold">PULSE WALLET</span>
          <span className="text-xs text-zinc-400 block mt-1">LIQUID - USABLE NOW</span>
          <span className="text-lg font-bold mt-1 block">{(pulseLiquid || 0).toLocaleString()}</span>
        </div>
        <div className="bg-black p-3 rounded-lg border border-zinc-800">
          <span className="text-[10px] text-transparent block font-bold">&nbsp;</span>
          <span className="text-xs text-zinc-400 block mt-1">STAKED - 24.8% APY</span>
          <span className="text-lg font-bold mt-1 block">{(pulseStaked || 0).toLocaleString()}</span>
        </div>
      </div>

      {/* Live Activity Feed */}
      <div className="bg-zinc-900 p-4 rounded-xl border border-zinc-800 space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-xs font-bold text-zinc-300">LIVE ACTIVITY FEED</span>
          <span className="text-[10px] text-emerald-400 bg-emerald-950/50 px-2 py-0.5 rounded border border-emerald-800">LIVE SYNC ACTIVE</span>
        </div>
        {(!activities || activities.length === 0) ? (
          <p className="text-xs text-zinc-500 py-2">No transaction activity recorded for this user account yet.</p>
        ) : (
          activities.slice(0, 5).map((act, idx) => (
            <div key={act.id || idx} className="flex justify-between text-xs py-1 border-b border-zinc-800">
              <span className="text-zinc-300">{act.description || act.type}</span>
              <span className="text-amber-400 font-mono">{act.amount} PULSE</span>
            </div>
          ))
        )}
      </div>

      {/* Risk Warning Disclaimer */}
      <div className="p-3 bg-zinc-950 rounded-lg border border-zinc-900 text-[10px] text-zinc-500 leading-relaxed">
        <strong className="text-zinc-400">Risk Warning:</strong> Trading stocks, options, futures, and forex carries a high level of risk and may not be suitable for all investors. Leverage can work against you as well as for you.
      </div>

      {/* Liquidation Modal */}
      {isSellOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-neutral-900 border border-white/20 p-6 space-y-5">
            <div className="flex justify-between items-center pb-3 border-b border-white/10">
              <h3 className="text-lg font-bold">Liquidate PULSE Tokens</h3>
              <button onClick={() => setIsSellOpen(false)} className="text-neutral-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {isSuccess ? (
              <div className="py-6 text-center space-y-2">
                <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
                <h4 className="font-bold text-lg">Liquidation Successful!</h4>
              </div>
            ) : (
              <form onSubmit={handleSellSubmit} className="space-y-4">
                <div>
                  <label className="text-xs text-neutral-400 block mb-1">Amount (Max: {(pulseLiquid || 0)})</label>
                  <input
                    type="number"
                    value={sellAmount}
                    onChange={(e) => setSellAmount(e.target.value)}
                    placeholder="0"
                    className="w-full bg-black border border-zinc-700 rounded-lg p-3 text-white font-mono focus:outline-none focus:border-amber-400"
                  />
                </div>

                {sellError && <p className="text-xs text-rose-400">{sellError}</p>}

                <button
                  type="submit"
                  className="w-full bg-amber-400 text-black font-semibold py-3 rounded-xl hover:bg-amber-300 transition"
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
