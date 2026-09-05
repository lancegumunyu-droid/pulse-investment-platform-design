'use client'

import React, { useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, ShieldCheck, Zap, Lock, Info, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { RiskNote } from '../ui-bits'

const STAKING_POOLS = [
  { id: 'pulse-vault-30', title: '30-Day Growth Vault', apy: '12.5%', lockPeriod: '30 Days', minStake: '100', riskLevel: 'Low', totalStaked: '$1,240,500', featured: false },
  { id: 'pulse-vault-90', title: '90-Day High Yield Vault', apy: '18.8%', lockPeriod: '90 Days', minStake: '250', riskLevel: 'Moderate', totalStaked: '$3,890,200', featured: true },
  { id: 'pulse-vault-180', title: '180-Day Premier Lock', apy: '24.2%', lockPeriod: '180 Days', minStake: '500', riskLevel: 'Moderate', totalStaked: '$5,120,000', featured: false },
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } },
}

export function StakeView() {
  const [selectedPool, setSelectedPool] = useState(STAKING_POOLS[1].id)
  const [stakeAmount, setStakeAmount] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [mousePos, setMousePos] = useState({ x: 200, y: 100 })

  const activePoolData = STAKING_POOLS.find((p) => p.id === selectedPool) || STAKING_POOLS[1]

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top })
  }

  const handleStakeSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!stakeAmount || Number(stakeAmount) <= 0) return

    setIsSubmitting(true)
    setTimeout(() => {
      setIsSubmitting(false)
      setIsSuccess(true)
      setTimeout(() => setIsSuccess(false), 4000)
    }, 1200)
  }

  const calculatedReturn = useCallback(() => {
    const amount = parseFloat(stakeAmount)
    if (Number.isNaN(amount) || amount <= 0) return '0.00'
    const apy = parseFloat(activePoolData.apy.replace('%', '')) / 100
    const days = parseInt(activePoolData.lockPeriod, 10) || 30
    return (amount + amount * apy * (days / 365)).toFixed(2)
  }, [stakeAmount, activePoolData])

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-5 max-w-md mx-auto pb-28 pt-2 px-1 text-zinc-100 font-sans">
      <motion.div variants={itemVariants} className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20"><TrendingUp className="size-5 text-amber-400" /></div>
          <div><h2 className="text-base font-bold text-white leading-tight">Vault Staking</h2><p className="text-xs text-zinc-400">Lock assets to earn automated yield payouts.</p></div>
        </div>
      </motion.div>

      <motion.div variants={itemVariants} className="space-y-3">
        <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">Select Staking Pool</span>
        <div className="grid grid-cols-1 gap-2.5">
          {STAKING_POOLS.map((pool) => {
            const isSelected = selectedPool === pool.id
            return <div key={pool.id} onClick={() => setSelectedPool(pool.id)} className={`cursor-pointer rounded-2xl p-4 border transition-all duration-200 relative overflow-hidden ${isSelected ? 'border-amber-400 bg-amber-500/10 shadow-lg shadow-amber-500/5' : 'border-white/10 bg-black/40 hover:border-white/20'}`}>
              {pool.featured && <span className="absolute top-3 right-3 text-[9px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded-full bg-amber-400 text-black">Popular</span>}
              <div className="flex justify-between items-center pr-12"><div><h3 className="text-sm font-bold text-white">{pool.title}</h3><p className="text-xs text-zinc-400 mt-0.5">Min: ${pool.minStake} • Lock: {pool.lockPeriod}</p></div><div className="text-right"><span className="text-base font-extrabold text-amber-400 font-mono">{pool.apy}</span><p className="text-[10px] text-zinc-500">Fixed APY</p></div></div>
            </div>
          })}
        </div>
      </motion.div>

      <motion.div variants={itemVariants}>
        <div onPointerMove={handlePointerMove} style={{ background: `radial-gradient(220px circle at ${mousePos.x}px ${mousePos.y}px, rgba(245, 158, 11, 0.12), transparent 80%), linear-gradient(to bottom, #141414, #0a0a0a)` }} className="relative rounded-2xl border border-amber-500/20 p-5 shadow-xl space-y-4 overflow-hidden">
          <div className="flex items-center justify-between border-b border-white/10 pb-3"><div className="flex items-center gap-2"><Lock className="size-4 text-amber-400" /><span className="text-xs font-bold text-white">{activePoolData.title}</span></div><span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">{activePoolData.apy} APY</span></div>
          <form onSubmit={handleStakeSubmit} className="space-y-4">
            <div><div className="flex justify-between text-xs font-semibold text-zinc-400 mb-1.5"><span>Amount to Stake</span><span>Balance: $10,000.00</span></div><div className="relative"><input type="number" placeholder={`Min ${activePoolData.minStake}`} value={stakeAmount} onChange={(e) => setStakeAmount(e.target.value)} className="w-full bg-black/60 border border-white/15 text-white placeholder:text-zinc-600 focus:border-amber-400 pr-16 h-11 text-sm rounded-xl font-mono px-3 outline-none" /><button type="button" onClick={() => setStakeAmount('1000')} className="absolute right-2 top-2 text-[10px] font-bold px-2 py-1 bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 rounded-lg transition-colors">MAX</button></div></div>
            <div className="rounded-xl bg-black/40 p-3 border border-white/5 space-y-1.5 text-xs"><div className="flex justify-between text-zinc-400"><span className="flex items-center gap-1"><Info className="size-3 text-zinc-500" /> Estimated Return</span><span className="font-mono text-white font-bold">${calculatedReturn()} USD</span></div><div className="flex justify-between text-zinc-400"><span>Lock Duration</span><span className="font-mono text-zinc-300">{activePoolData.lockPeriod}</span></div></div>
            <Button type="submit" disabled={isSubmitting || !stakeAmount || Number(stakeAmount) < Number(activePoolData.minStake)} className="w-full h-11 bg-amber-400 hover:bg-amber-300 text-black font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md shadow-amber-500/10 flex items-center justify-center gap-2">{isSubmitting ? <div className="size-4 border-2 border-black/20 border-t-black rounded-full animate-spin" /> : isSuccess ? <><CheckCircle2 className="size-4 text-black" /><span>Staked Successfully</span></> : <><Zap className="size-4 fill-black" /><span>Confirm & Stake</span></>}</Button>
          </form>
        </div>
      </motion.div>

      <motion.div variants={itemVariants}><div className="flex items-center gap-2 p-3 rounded-xl bg-white/[0.02] border border-white/5 text-[11px] text-zinc-400"><ShieldCheck className="size-4 text-emerald-400 shrink-0" /><span>Smart contracts are audited and yield payouts execute automatically at period end.</span></div></motion.div>
      <motion.div variants={itemVariants}><RiskNote /></motion.div>
    </motion.div>
  )
}
