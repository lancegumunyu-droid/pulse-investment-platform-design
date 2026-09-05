'use client'

import React, { useState } from 'react'
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { 
  ArrowUpRight, 
  ArrowDownLeft, 
  RefreshCw, 
  Coins, 
  TrendingUp, 
  Sparkles,
  Zap,
  CheckCircle2,
  DollarSign
} from 'lucide-react'
import { usePulse } from '../store'
import { RiskNote } from '../ui-bits'
import { Button } from '@/components/ui/button'

export interface WalletAsset {
  id: string
  symbol: string
  name: string
  balance: number
  fiatValueUSD: number
  change24h: number
  chain: string
  color: string
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.05 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: 'spring', stiffness: 280, damping: 22 },
  },
}

function HeroMetallicCard({
  cardholderName,
  cardNumber,
  cvv,
  memberSince,
}: {
  cardholderName: string
  cardNumber: string
  cvv: string
  memberSince: string
}) {
  const [isFlipped, setIsFlipped] = useState(false)
  const [mousePos, setMousePos] = useState({ x: 180, y: 100 })
  const [isHovered, setIsHovered] = useState(false)

  const x = useMotionValue(0)
  const y = useMotionValue(0)

  const mouseXSpring = useSpring(x, { stiffness: 350, damping: 30 })
  const mouseYSpring = useSpring(y, { stiffness: 350, damping: 30 })

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ['10deg', '-10deg'])
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ['-10deg', '10deg'])

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const mouseX = e.clientX - rect.left
    const mouseY = e.clientY - rect.top
    setMousePos({ x: mouseX, y: mouseY })
    x.set(mouseX / rect.width - 0.5)
    y.set(mouseY / rect.height - 0.5)
  }

  return (
    <div className="w-full flex flex-col items-center space-y-3 py-2">
      <motion.div 
        initial={{ opacity: 0, y: -5 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[10px] font-mono tracking-wider uppercase"
      >
        <Sparkles className="size-3 animate-spin" />
        <span>Click card to flip ({isFlipped ? 'Showing Back / CVV' : 'Showing Front'})</span>
      </motion.div>

      <motion.div
        style={{ perspective: 1400 }}
        className="w-full max-w-[360px] aspect-[1.586/1] cursor-pointer select-none"
        onClick={() => setIsFlipped(!isFlipped)}
        onPointerMove={handlePointerMove}
        onPointerEnter={() => setIsHovered(true)}
        onPointerLeave={() => { setIsHovered(false); x.set(0); y.set(0); }}
      >
        <motion.div
          animate={{ rotateY: isFlipped ? 180 : 0 }}
          transition={{ duration: 0.7, type: 'spring', stiffness: 300, damping: 25 }}
          style={{
            rotateX: isHovered && !isFlipped ? rotateX : 0,
            rotateY: isHovered && !isFlipped ? rotateY : 0,
            transformStyle: 'preserve-3d',
          }}
          className="relative w-full h-full rounded-2xl shadow-2xl group"
        >
          <div
            className="absolute inset-0 rounded-2xl overflow-hidden border border-amber-300/40 p-5 flex flex-col justify-between backface-hidden shadow-2xl"
            style={{
              backfaceVisibility: 'hidden',
              background: `radial-gradient(400px circle at ${mousePos.x}px ${mousePos.y}px, rgba(255, 230, 150, 0.35), transparent 70%), linear-gradient(135deg, #f3d57d 0%, #d4af37 35%, #aa7c11 70%, #855c08 100%)`,
            }}
          >
            <div className="flex items-center justify-between relative z-10">
              <div className="space-y-0.5">
                <h3 className="font-black text-black tracking-widest text-lg font-mono">PULSE</h3>
                <div className="w-10 h-8 rounded bg-gradient-to-br from-amber-200 via-yellow-400 to-amber-600 border border-amber-800/40 shadow-inner flex items-center justify-center p-0.5">
                  <div className="w-full h-full border border-amber-900/40 bg-amber-300/30" />
                </div>
              </div>
              <div className="text-black font-black text-xs font-mono">⚡</div>
            </div>
            <div className="font-mono font-bold text-black/90 text-sm tracking-[0.25em]">{cardNumber}</div>
            <div className="flex items-end justify-between relative z-10 pt-1 border-t border-black/10">
              <div className="space-y-0.5">
                <div className="text-[9px] font-bold text-black/70 uppercase">BANK OF AFRICA • {memberSince}</div>
                <div className="font-black text-black text-xs uppercase">{cardholderName}</div>
              </div>
              <div className="font-black italic text-black text-xl">VISA</div>
            </div>
          </div>

          <div
            className="absolute inset-0 rounded-2xl overflow-hidden border border-amber-300/40 flex flex-col justify-between py-4 backface-hidden shadow-2xl"
            style={{
              backfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
              background: `radial-gradient(400px circle at ${mousePos.x}px ${mousePos.y}px, rgba(255, 230, 150, 0.35), transparent 70%), linear-gradient(135deg, #d4af37 0%, #aa7c11 50%, #724e03 100%)`,
            }}
          >
            <div className="w-full h-8 bg-[#1a1408] mt-1" />
            <div className="px-4 space-y-1">
              <div className="flex items-center gap-2">
                <div className="flex-1 h-8 bg-amber-100/90 rounded px-3 flex items-center text-black font-serif italic text-sm">{cardholderName}</div>
                <div className="h-8 px-3 rounded bg-amber-950 text-amber-300 font-mono text-xs flex items-center">CVV {cvv}</div>
              </div>
            </div>
            <div className="px-4 flex items-end justify-between text-[8px] text-black/80 font-mono">
              <span>Africa Heritage Foundation</span>
              <span className="font-black">SECURE RWA</span>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}

function SellPulseForCashCard() {
  const [isSelling, setIsSelling] = useState(false)
  const [success, setSuccess] = useState(false)
  const [amount, setAmount] = useState('1000')

  const handleSell = () => {
    setIsSelling(true)
    setSuccess(false)
    setTimeout(() => {
      setIsSelling(false)
      setSuccess(true)
      setTimeout(() => setSuccess(false), 4000)
    }, 2200)
  }

  return (
    <motion.div variants={itemVariants} className="relative rounded-3xl border border-amber-500/40 p-5 bg-[#101217] space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2.5 rounded-2xl bg-amber-500/20 text-amber-400">
            <DollarSign className="size-5" />
          </div>
          <div>
            <h4 className="text-sm font-extrabold text-white">Sell Pulse for Instant Cash</h4>
            <p className="text-[11px] text-zinc-400">Convert RWA yield directly to ZAR / USD bank.</p>
          </div>
        </div>
      </div>
      <div className="space-y-3">
        <div className="rounded-2xl bg-black/60 border border-white/10 p-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-amber-400 font-mono font-bold">$</span>
            <input
              type="text"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="bg-transparent text-white font-mono font-extrabold outline-none w-32"
            />
          </div>
          <span className="text-xs font-mono text-emerald-400">Payout: ${(Number(amount || 0) * 1.02).toFixed(2)}</span>
        </div>
        <Button
          disabled={isSelling}
          onClick={handleSell}
          className="w-full bg-amber-400 text-black font-extrabold text-xs rounded-xl h-12 flex items-center justify-center gap-2"
        >
          {isSelling ? <RefreshCw className="size-4 animate-spin" /> : success ? <CheckCircle2 className="size-4" /> : <Zap className="size-4" />}
          <span>{isSelling ? 'Processing...' : success ? 'Transferred!' : 'Sell Pulse for Cash'}</span>
        </Button>
      </div>
    </motion.div>
  )
}

export function WalletView() {
  const openModal = usePulse((state) => state.openModal)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const assets: WalletAsset[] = [
    { id: '1', symbol: 'ZARs', name: 'South African Rand Stable', balance: 145250.00, fiatValueUSD: 7980.25, change24h: 4.8, chain: 'Polygon RWA', color: '#F5A623' },
    { id: '2', symbol: 'USDC', name: 'USD Coin', balance: 24500.00, fiatValueUSD: 24500.00, change24h: 0.0, chain: 'Ethereum', color: '#2775CA' },
    { id: '3', symbol: 'SOLAR-ZAR', name: 'Bushveld Solar Yield', balance: 1250.00, fiatValueUSD: 12850.50, change24h: 12.4, chain: 'Pulse SADC', color: '#10B981' },
  ]

  const totalBalance = assets.reduce((acc, curr) => acc + curr.fiatValueUSD, 0)
  const totalYield24h = assets.reduce((acc, curr) => acc + (curr.fiatValueUSD * (curr.change24h / 100)) / 365, 0)

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6 max-w-md mx-auto pb-28 pt-1 px-1.5 text-zinc-100 font-sans">
      <motion.div variants={itemVariants} className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-amber-500/20 text-amber-400">
            <Coins className="size-5" />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-white">Wallet & Treasury</h2>
            <p className="text-[11px] text-zinc-400">Manage your real-world asset capital.</p>
          </div>
        </div>
        <Button size="sm" variant="ghost" className="w-9 h-9 p-0 bg-white/5" onClick={() => setIsRefreshing(true)}>
          <RefreshCw className={`size-4 ${isRefreshing ? 'animate-spin text-amber-400' : ''}`} />
        </Button>
      </motion.div>

      <motion.div variants={itemVariants}>
        <HeroMetallicCard cardholderName="SAMUEL K. MENSAH" cardNumber="4532 •••• •••• 8821" cvv="492" memberSince="2023" />
      </motion.div>

      <motion.div variants={itemVariants} className="rounded-3xl border border-white/15 p-5 bg-[#101217] space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[11px] font-mono text-zinc-400">Total Net Liquidity</span>
            <h3 className="text-2xl font-black text-white font-mono">${totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}</h3>
          </div>
          <div className="flex items-center gap-1 bg-emerald-950/80 text-emerald-400 px-2.5 py-1 rounded-full text-xs font-bold font-mono">
            <TrendingUp className="size-3.5" />
            <span>+${totalYield24h.toFixed(2)}</span>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 pt-2 border-t border-white/10">
          <Button onClick={() => openModal('deposit')} className="w-full bg-amber-400 text-black font-extrabold text-xs h-11">
            <ArrowDownLeft className="size-4 mr-1" /> Deposit
          </Button>
          <Button onClick={() => openModal('withdraw')} variant="outline" className="w-full bg-white/5 text-white font-bold text-xs h-11">
            <ArrowUpRight className="size-4 mr-1 text-amber-400" /> Withdraw
          </Button>
        </div>
      </motion.div>

      <SellPulseForCashCard />

      <motion.div variants={itemVariants} className="space-y-3">
        <h4 className="text-xs font-mono font-black uppercase text-zinc-400">Active Asset Holdings</h4>
        <div className="space-y-3">
          {assets.map((asset) => (
            <div key={asset.id} className="rounded-2xl border border-white/10 p-4 bg-[#101217] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-xl flex items-center justify-center font-black font-mono text-black" style={{ backgroundColor: asset.color }}>
                  {asset.symbol.slice(0, 3)}
                </div>
                <div>
                  <h5 className="text-sm font-extrabold text-white">{asset.name}</h5>
                  <p className="text-[10px] font-mono text-zinc-400">{asset.chain}</p>
                </div>
              </div>
              <div className="text-right font-mono">
                <p className="text-sm font-black text-white">${asset.fiatValueUSD.toLocaleString()}</p>
                <p className="text-[11px] text-emerald-400">{asset.balance} {asset.symbol}</p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      <motion.div variants={itemVariants}>
        <RiskNote />
      </motion.div>
    </motion.div>
  )
}
