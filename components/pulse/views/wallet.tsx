'use client'

import React, { useState, useRef, useCallback, useMemo } from 'react'
import { motion, useMotionValue, useSpring, useTransform, AnimatePresence } from 'framer-motion'
import { 
  ArrowUpRight, 
  ArrowDownLeft, 
  Wallet as WalletIcon, 
  ShieldCheck, 
  Zap, 
  Sparkles, 
  TrendingUp, 
  History, 
  CheckCircle2, 
  X,
  CreditCard,
  ChevronRight,
  AlertCircle
} from 'lucide-react'
import { usePulse } from '../../context/PulseContext'

export const WalletView: React.FC = () => {
  const { 
    pulseLiquid, 
    pulseStaked, 
    vaultCash, 
    activities, 
    sellPulse
  } = usePulse()

  // --- Card Motion Values ---
  const cardRef = useRef<HTMLDivElement>(null)
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)

  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [12, -12]), { damping: 20, stiffness: 200 })
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-12, 12]), { damping: 20, stiffness: 200 })
  const glareX = useTransform(mouseX, [-0.5, 0.5], ['0%', '100%'])
  const glareY = useTransform(mouseY, [-0.5, 0.5], ['0%', '100%'])

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return
    const rect = cardRef.current.getBoundingClientRect()
    const width = rect.width
    const height = rect.height
    const x = (e.clientX - rect.left) / width - 0.5
    const y = (e.clientY - rect.top) / height - 0.5
    mouseX.set(x)
    mouseY.set(y)
  }, [mouseX, mouseY])

  const handleMouseLeave = useCallback(() => {
    mouseX.set(0)
    mouseY.set(0)
  }, [mouseX, mouseY])

  // --- Drawers / Modal States ---
  const [isSellOpen, setIsSellOpen] = useState(false)
  const [sellAmount, setSellAmount] = useState('')
  const [sellError, setSellError] = useState<string | null>(null)
  const [isSuccess, setIsSuccess] = useState(false)

  // --- Calculated Values ---
  const pulseRate = 0.08 // $0.08 per PULSE
  const totalPulse = pulseLiquid + pulseStaked
  const totalPortfolioValue = (totalPulse * pulseRate) + vaultCash

  const calculatedCashOutput = useMemo(() => {
    const numericAmt = parseFloat(sellAmount.replace(/,/g, '')) || 0
    return (numericAmt * pulseRate).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })
  }, [sellAmount, pulseRate])

  const handleSellSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSellError(null)

    const numericAmt = parseFloat(sellAmount.replace(/,/g, ''))
    if (isNaN(numericAmt) || numericAmt <= 0) {
      setSellError('Please enter a valid amount greater than 0.')
      return
    }

    if (numericAmt > pulseLiquid) {
      setSellError(`Amount exceeds liquid balance (${pulseLiquid.toLocaleString()} PULSE).`)
      return
    }

    // Execute transaction via context
    sellPulse(numericAmt)
    setIsSuccess(true)

    setTimeout(() => {
      setIsSuccess(false)
      setIsSellOpen(false)
      setSellAmount('')
    }, 1800)
  }

  return (
    <div className="w-full max-w-7xl mx-auto p-4 md:p-8 space-y-8 text-white min-h-screen">
      
      {/* HEADER STATS SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 pb-6 border-b border-white/10">
        <div>
          <span className="text-xs font-mono uppercase tracking-widest text-emerald-400 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Decentralized Reserve Account
          </span>
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight mt-1 bg-gradient-to-r from-white via-neutral-200 to-neutral-400 bg-clip-text text-transparent">
            Wallet & Assets
          </h1>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <button
            onClick={() => setIsSellOpen(true)}
            className="flex-1 md:flex-initial px-5 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 font-semibold text-sm transition-all duration-200 shadow-lg shadow-emerald-500/20 active:scale-95 flex items-center justify-center gap-2"
          >
            <ArrowUpRight className="w-4 h-4" />
            Liquidate PULSE
          </button>
        </div>
      </div>

      {/* MAIN CARDS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: 3D METALLIC VIP CARD */}
        <div className="lg:col-span-5 flex flex-col items-center">
          <div 
            className="w-full perspective-1000 py-4"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
          >
            <motion.div
              ref={cardRef}
              style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}
              className="relative w-full aspect-[1.586/1] rounded-2xl p-6 md:p-8 flex flex-col justify-between shadow-2xl overflow-hidden border border-white/20 bg-neutral-900 cursor-pointer"
            >
              {/* Card Metallic Gradient Layer */}
              <div className="absolute inset-0 bg-gradient-to-br from-neutral-800 via-neutral-900 to-black z-0" />
              
              {/* Dynamic Glare Effect */}
              <motion.div 
                style={{
                  background: `radial-gradient(circle at ${glareX} ${glareY}, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0) 80%)`
                }}
                className="absolute inset-0 pointer-events-none z-10"
              />

              {/* Decorative Vector Patterns */}
              <div className="absolute -right-12 -bottom-12 w-64 h-64 rounded-full border border-emerald-500/10 pointer-events-none z-0" />
              <div className="absolute -right-20 -bottom-20 w-80 h-80 rounded-full border border-emerald-500/5 pointer-events-none z-0" />

              {/* Top Row: Chip & Brand */}
              <div className="relative z-20 flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-8 rounded-md bg-gradient-to-r from-amber-300 via-amber-400 to-amber-200 border border-amber-200/50 flex items-center justify-center shadow-inner">
                    <div className="w-full h-px bg-amber-600/40 my-1" />
                  </div>
                  <Zap className="w-5 h-5 text-emerald-400" />
                </div>
                <span className="font-mono text-xs text-neutral-400 uppercase tracking-widest border border-white/10 px-3 py-1 rounded-full bg-black/40 backdrop-blur-sm">
                  Pulse Black Tier
                </span>
              </div>

              {/* Middle Row: Card Number Representation */}
              <div className="relative z-20 my-auto pt-4">
                <span className="font-mono text-lg md:text-xl text-neutral-300 tracking-[0.25em] drop-shadow">
                  •••• •••• •••• 8842
                </span>
              </div>

              {/* Bottom Row: Details & Balance */}
              <div className="relative z-20 flex justify-between items-end border-t border-white/10 pt-4">
                <div>
                  <div className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider">Total Value</div>
                  <div className="text-xl md:text-2xl font-bold font-mono text-white">
                    ${totalPortfolioValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider">Network</div>
                  <div className="text-xs font-semibold text-emerald-400 flex items-center justify-end gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" /> PulseNet
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Quick Balance Breakdown Below Card */}
          <div className="w-full grid grid-cols-2 gap-3 mt-4">
            <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10 backdrop-blur-md">
              <span className="text-xs text-neutral-400 block mb-1">Liquid Tokens</span>
              <span className="text-lg font-bold font-mono text-emerald-400">
                {pulseLiquid.toLocaleString()} <span className="text-xs text-neutral-500">PULSE</span>
              </span>
            </div>
            <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10 backdrop-blur-md">
              <span className="text-xs text-neutral-400 block mb-1">Staked Tokens</span>
              <span className="text-lg font-bold font-mono text-teal-400">
                {pulseStaked.toLocaleString()} <span className="text-xs text-neutral-500">PULSE</span>
              </span>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: PORTFOLIO SUMMARY & ACTIVITIES */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* STAT CARDS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-5 rounded-2xl bg-neutral-900/80 border border-white/10 flex flex-col justify-between relative overflow-hidden">
              <div className="flex justify-between items-center">
                <span className="text-xs font-mono text-neutral-400 uppercase">Vault Reserve</span>
                <WalletIcon className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="mt-4">
                <div className="text-2xl font-bold font-mono">
                  ${vaultCash.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
                <div className="text-xs text-neutral-400 mt-1 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3 text-emerald-400" /> Ready for withdrawal
                </div>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-neutral-900/80 border border-white/10 flex flex-col justify-between relative overflow-hidden">
              <div className="flex justify-between items-center">
                <span className="text-xs font-mono text-neutral-400 uppercase">Token Rate</span>
                <Sparkles className="w-4 h-4 text-teal-400" />
              </div>
              <div className="mt-4">
                <div className="text-2xl font-bold font-mono">
                  ${pulseRate.toFixed(2)} <span className="text-xs text-neutral-500">USD/PULSE</span>
                </div>
                <div className="text-xs text-emerald-400 mt-1 flex items-center gap-1">
                  Stable Valuation Guarantee
                </div>
              </div>
            </div>
          </div>

          {/* RECENT ACTIVITY TABLE */}
          <div className="p-6 rounded-2xl bg-neutral-900/80 border border-white/10 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <History className="w-5 h-5 text-emerald-400" />
                Ledger Activity
              </h2>
              <span className="text-xs font-mono text-neutral-400">Real-time Log</span>
            </div>

            <div className="space-y-3">
              {activities.length === 0 ? (
                <div className="text-center py-8 text-neutral-500 text-sm">
                  No recent activities found on network.
                </div>
              ) : (
                activities.slice(0, 5).map((item) => {
                  const isPositive = item.type === 'EARN' || item.type === 'BUY'
                  const parsedDate = isNaN(new Date(item.date).getTime()) 
                    ? 'Recent' 
                    : new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })

                  return (
                    <div 
                      key={item.id}
                      className="flex items-center justify-between p-3.5 rounded-xl bg-white/[0.02] hover:bg-white/[0.05] border border-white/5 transition-colors duration-150"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${isPositive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                          {isPositive ? <ArrowDownLeft className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-neutral-200">{item.description}</div>
                          <div className="text-xs text-neutral-500 font-mono">{parsedDate}</div>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className={`text-sm font-mono font-bold ${isPositive ? 'text-emerald-400' : 'text-neutral-300'}`}>
                          {isPositive ? '+' : '-'}{item.amount.toLocaleString()} PULSE
                        </div>
                        <div className="text-[10px] text-neutral-500 font-mono uppercase">
                          Completed
                        </div>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>

        </div>

      </div>

      {/* LIQUIDATE PULSE DRAWER / MODAL */}
      <AnimatePresence>
        {isSellOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSellOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />

            {/* Modal Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg rounded-2xl bg-neutral-900 border border-white/20 p-6 md:p-8 shadow-2xl z-10 space-y-6"
            >
              <div className="flex justify-between items-center pb-4 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-emerald-400" />
                  <h3 className="text-xl font-bold">Liquidate PULSE</h3>
                </div>
                <button
                  onClick={() => setIsSellOpen(false)}
                  className="p-1 rounded-lg text-neutral-400 hover:text-white hover:bg-white/10 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {isSuccess ? (
                <div className="py-8 flex flex-col items-center justify-center space-y-3">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', damping: 15 }}
                    className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/40"
                  >
                    <CheckCircle2 className="w-8 h-8" />
                  </motion.div>
                  <h4 className="text-xl font-bold text-white">Transaction Confirmed</h4>
                  <p className="text-sm text-neutral-400 text-center">
                    Converted PULSE to Cash Vault instantly.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSellSubmit} className="space-y-5">
                  <div>
                    <div className="flex justify-between text-xs text-neutral-400 mb-2 font-mono">
                      <span>Amount to Sell</span>
                      <span>Available: {pulseLiquid.toLocaleString()} PULSE</span>
                    </div>
                    <div className="relative">
                      <input
                        type="text"
                        value={sellAmount}
                        onChange={(e) => setSellAmount(e.target.value)}
                        placeholder="0.00"
                        className="w-full bg-black/50 border border-white/15 rounded-xl px-4 py-3 text-lg font-mono text-white focus:outline-none focus:border-emerald-500 transition-colors"
                      />
                      <button
                        type="button"
                        onClick={() => setSellAmount(pulseLiquid.toString())}
                        className="absolute right-3 top-1/2 -translate-y-1/2 px-2.5 py-1 text-xs font-mono bg-white/10 hover:bg-white/20 rounded-md text-emerald-400 transition"
                      >
                        MAX
                      </button>
                    </div>
                  </div>

                  {sellError && (
                    <div className="flex items-center gap-2 text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 p-3 rounded-xl">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{sellError}</span>
                    </div>
                  )}

                  {/* Summary Box */}
                  <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10 space-y-2 text-xs font-mono">
                    <div className="flex justify-between text-neutral-400">
                      <span>Rate</span>
                      <span>$0.08 / PULSE</span>
                    </div>
                    <div className="flex justify-between text-neutral-400">
                      <span>Network Fee</span>
                      <span className="text-emerald-400">Free ($0.00)</span>
                    </div>
                    <div className="border-t border-white/10 pt-2 flex justify-between font-bold text-sm text-white">
                      <span>Est. Cash Proceeds</span>
                      <span className="text-emerald-400">${calculatedCashOutput}</span>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 font-semibold text-sm transition shadow-lg shadow-emerald-500/20 active:scale-[0.98] flex items-center justify-center gap-2"
                  >
                    Confirm Liquidation
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  )
}

// Export Alias to guarantee backward compatibility with both import styles
export const Wallet = WalletView
export default WalletView
