'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { 
  Wallet, 
  ArrowUpRight, 
  ArrowDownLeft, 
  RefreshCw, 
  ShieldCheck, 
  Coins, 
  TrendingUp, 
  Globe, 
  Sparkles,
  Zap,
  CheckCircle2,
  DollarSign
} from 'lucide-react'
import { usePulse } from '../store'
import { Pill, RiskNote } from '../ui-bits'
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
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.05,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 280,
      damping: 22,
    },
  },
}

// ----------------------------------------------------------------------
// SUPERIOR 3D INTERACTIVE METALLIC GOLD VISA CARD (FRONT & BACK FLIP)
// ----------------------------------------------------------------------
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
        className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[10px] font-mono tracking-wider uppercase shadow-[0_0_15px_rgba(245,166,35,0.2)]"
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
          className="relative w-full h-full rounded-2xl shadow-[0_25px_60px_rgba(0,0,0,0.8),0_0_30px_rgba(245,166,35,0.25)] group"
        >
          {/* FRONT SIDE */}
          <div
            className="absolute inset-0 rounded-2xl overflow-hidden border border-amber-300/40 p-5 flex flex-col justify-between backface-hidden shadow-2xl"
            style={{
              backfaceVisibility: 'hidden',
              background: `
                radial-gradient(400px circle at ${mousePos.x}px ${mousePos.y}px, rgba(255, 230, 150, 0.35), transparent 70%),
                linear-gradient(135deg, #f3d57d 0%, #d4af37 35%, #aa7c11 70%, #855c08 100%)
              `,
            }}
          >
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-white to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out" />

            <div className="flex items-center justify-between relative z-10">
              <div className="space-y-0.5">
                <h3 className="font-black text-black tracking-widest text-lg font-mono drop-shadow-[0_1px_1px_rgba(255,255,255,0.4)]">
                  PULSE
                </h3>
                <div className="w-10 h-8 rounded bg-gradient-to-br from-amber-200 via-yellow-400 to-amber-600 border border-amber-800/40 shadow-inner flex items-center justify-center p-0.5 opacity-90">
                  <div className="w-full h-full border border-amber-900/40 grid grid-cols-3 grid-rows-3 gap-px bg-amber-300/30">
                    <div className="bg-amber-900/20 col-span-3 row-span-1" />
                  </div>
                </div>
              </div>

              <div className="relative w-16 h-16 rounded-full border border-black/30 bg-gradient-to-br from-black/20 to-black/40 flex items-center justify-center shadow-inner overflow-hidden">
                <div className="absolute inset-1 rounded-full border border-black/20 flex items-center justify-center">
                  <div className="w-12 h-12 rotate-45 border border-dashed border-amber-900/50 absolute" />
                  <div className="text-black font-black text-xs tracking-tighter opacity-80 flex items-center">
                    <span className="font-mono">⚡</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="font-mono font-bold text-black/90 text-sm sm:text-base tracking-[0.25em] drop-shadow-[0_1px_0px_rgba(255,255,255,0.5)]">
              {cardNumber}
            </div>

            <div className="flex items-end justify-between relative z-10 pt-1 border-t border-black/10">
              <div className="space-y-0.5">
                <div className="text-[9px] font-bold text-black/70 uppercase tracking-wider flex items-center gap-1">
                  <span>BANK OF AFRICA</span>
                  <span className="text-[7px] text-black/50">MEMBER SINCE {memberSince}</span>
                </div>
                <div className="font-black text-black text-xs sm:text-sm tracking-wide uppercase drop-shadow-[0_1px_1px_rgba(255,255,255,0.4)]">
                  {cardholderName}
                </div>
              </div>

              <div className="font-black italic text-black text-xl tracking-tighter drop-shadow-[0_1px_1px_rgba(255,255,255,0.5)]">
                VISA
              </div>
            </div>
          </div>

          {/* BACK SIDE */}
          <div
            className="absolute inset-0 rounded-2xl overflow-hidden border border-amber-300/40 flex flex-col justify-between py-4 backface-hidden shadow-2xl"
            style={{
              backfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
              background: `
                radial-gradient(400px circle at ${mousePos.x}px ${mousePos.y}px, rgba(255, 230, 150, 0.35), transparent 70%),
                linear-gradient(135deg, #d4af37 0%, #aa7c11 50%, #724e03 100%)
              `,
            }}
          >
            <div className="w-full h-8 bg-[#1a1408] shadow-inner mt-1" />

            <div className="px-4 space-y-1">
              <div className="flex items-center gap-2">
                <div className="flex-1 h-8 bg-amber-100/90 rounded border border-amber-900/30 px-3 flex items-center shadow-inner">
                  <span className="font-serif italic font-bold text-black/90 text-sm tracking-wider">
                    {cardholderName}
                  </span>
                </div>
                <div className="h-8 px-3 rounded bg-amber-950 text-amber-300 border border-amber-500/50 font-mono font-black text-xs flex items-center justify-center shadow-[0_0_12px_rgba(245,166,35,0.4)]">
                  CVV {cvv}
                </div>
              </div>
              <p className="text-[8px] font-mono text-black/80 tracking-tight">
                AUTHORIZED SIGNATURE • NOT TRANSFERABLE • PROPERTY OF BANK OF AFRICA
              </p>
            </div>

            <div className="px-4 flex items-end justify-between text-[8px] text-black/80 font-mono">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2 font-black">
                  <span className="text-black">◆ PLUS</span>
                  <span>NYCE</span>
                </div>
                <p className="max-w-[200px] leading-tight">
                  Africa Heritage Foundation • Randburg, South Africa
                </p>
              </div>
              <div className="text-[9px] font-black tracking-widest text-black">
                SECURE RWA
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}

// ----------------------------------------------------------------------
// SELL PULSE FOR CASH FEATURE CARD
// ----------------------------------------------------------------------
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
    <motion.div
      variants={itemVariants}
      className="relative overflow-hidden rounded-3xl border border-amber-500/40 p-5 bg-gradient-to-b from-[#181510] via-[#101217] to-[#0a0c10] shadow-[0_15px_40px_rgba(0,0,0,0.7)] space-y-4 group"
    >
      <div className="absolute -right-12 -top-12 w-40 h-40 bg-amber-500/15 rounded-full blur-3xl pointer-events-none group-hover:bg-amber-500/25 transition-all duration-700" />
      
      <div className="flex items-center justify-between relative z-10">
        <div className="flex items-center gap-2.5">
          <div className="p-2.5 rounded-2xl bg-gradient-to-br from-amber-500/20 to-amber-600/10 border border-amber-500/50 text-amber-400 shadow-[0_0_20px_rgba(245,166,35,0.4)]">
            <DollarSign className="size-5" />
          </div>
          <div>
            <h4 className="text-sm font-extrabold text-white flex items-center gap-1.5">
              Sell Pulse for Instant Cash
              <span className="bg-emerald-500/20 text-emerald-400 text-[9px] font-mono font-black px-2 py-0.5 rounded-full border border-emerald-500/40 uppercase tracking-widest">
                Zero Fee
              </span>
            </h4>
            <p className="text-[11px] text-zinc-400">Convert RWA yield directly to ZAR / USD bank or card.</p>
          </div>
        </div>
      </div>

      <div className="space-y-3 relative z-10 pt-1">
        <div className="relative rounded-2xl bg-black/60 border border-white/10 p-3 flex items-center justify-between backdrop-blur-md">
          <div className="space-y-0.5">
            <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">Amount to Liquidate</span>
            <div className="flex items-center gap-2">
              <span className="text-amber-400 font-mono font-bold text-lg">$</span>
              <input
                type="text"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="bg-transparent text-white font-mono font-extrabold text-lg outline-none w-32"
              />
            </div>
          </div>
          <div className="text-right">
            <span className="text-[10px] font-mono text-emerald-400 font-bold block">Rate: 1 Pulse = 1.02 USD</span>
            <span className="text-xs font-mono text-zinc-300">Est. Payout: ${(Number(amount || 0) * 1.02).toFixed(2)}</span>
          </div>
        </div>

        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button
            disabled={isSelling}
            onClick={handleSell}
            className="w-full bg-gradient-to-r from-amber-400 via-amber-500 to-amber-400 hover:brightness-110 text-black font-extrabold text-xs rounded-xl shadow-[0_0_25px_rgba(245,166,35,0.5)] h-12 flex items-center justify-center gap-2 cursor-pointer border border-amber-300/60"
          >
            {isSelling ? (
              <div className="flex items-center gap-2 font-mono">
                <RefreshCw className="size-4 animate-spin text-black" />
                <span>Executing Instant Liquidity...</span>
              </div>
            ) : success ? (
              <div className="flex items-center gap-2 font-mono text-emerald-950">
                <CheckCircle2 className="size-4 text-emerald-900" />
                <span>Successfully Transferred to Bank!</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 font-mono">
                <Zap className="size-4 fill-black" />
                <span>Sell Pulse for Cash Now</span>
              </div>
            )}
          </Button>
        </motion.div>
      </div>

      {success && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 text-xs font-mono flex items-center gap-2 shadow-[0_0_20px_rgba(16,185,129,0.3)]"
        >
          <CheckCircle2 className="size-4 text-emerald-400 shrink-0" />
          <span>Transaction confirmed! Funds dispatched to your linked SADC account.</span>
        </motion.div>
      )}
    </motion.div>
  )
}

// ----------------------------------------------------------------------
// MAIN WALLET VIEW
// ----------------------------------------------------------------------
export function WalletView() {
  const openModal = usePulse((state) => state.openModal)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const [assets] = useState<WalletAsset[]>([
    {
      id: '1',
      symbol: 'ZARs',
      name: 'South African Rand Stable',
      balance: 145250.00,
      fiatValueUSD: 7980.25,
      change24h: 4.8,
      chain: 'Polygon RWA',
      color: '#F5A623',
    },
    {
      id: '2',
      symbol: 'USDC',
      name: 'USD Coin',
      balance: 24500.00,
      fiatValueUSD: 24500.00,
      change24h: 0.0,
      chain: 'Ethereum',
      color: '#2775CA',
    },
    {
      id: '3',
      symbol: 'SOLAR-ZAR',
      name: 'Bushveld Solar Yield Token',
      balance: 1250.00,
      fiatValueUSD: 12850.50,
      change24h: 12.4,
      chain: 'Pulse SADC L1',
      color: '#10B981',
    },
  ])

  const totalBalance = assets.reduce((acc, curr) => acc + curr.fiatValueUSD, 0)
  const totalYield24h = assets.reduce((acc, curr) => acc + (curr.fiatValueUSD * (curr.change24h / 100)) / 365, 0)

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await new Promise((r) => setTimeout(r, 900))
    setIsRefreshing(false)
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="pulse-wallet space-y-6 max-w-md mx-auto pb-28 pt-1 px-1.5 text-zinc-100 font-sans selection:bg-amber-500/30"
    >
      <motion.div variants={itemVariants} className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <motion.div
            whileHover={{ scale: 1.1, rotate: 10 }}
            whileTap={{ scale: 0.9 }}
            className="relative p-2.5 rounded-2xl bg-gradient-to-br from-amber-500/20 via-yellow-500/10 to-transparent border border-amber-500/40 text-amber-400 shrink-0 shadow-[0_0_25px_rgba(245,166,35,0.3)]"
          >
            <Coins className="size-5 text-amber-400" />
          </motion.div>
          <div>
            <h2 className="text-base font-extrabold text-white leading-tight tracking-wide flex items-center gap-1.5">
              Wallet & Treasury
              <span className="bg-amber-500/20 text-amber-300 text-[9px] font-mono font-black px-2 py-0.5 rounded-full border border-amber-500/40 uppercase tracking-widest shadow-[0_0_10px_rgba(245,166,35,0.3)]">
                SADC Secured
              </span>
            </h2>
            <p className="text-[11px] text-zinc-400 leading-normal">
              Manage your real-world asset capital and yields.
            </p>
          </div>
        </div>

        <motion.div whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.9 }}>
          <Button
            size="sm"
            variant="ghost"
            className="w-9 h-9 p-0 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-zinc-300 hover:text-white shadow-md cursor-pointer"
            disabled={isRefreshing}
            onClick={handleRefresh}
          >
            <RefreshCw className={`size-4 ${isRefreshing ? 'animate-spin text-amber-400' : ''}`} />
          </Button>
        </motion.div>
      </motion.div>

      <motion.div variants={itemVariants}>
        <HeroMetallicCard
          cardholderName="SAMUEL K. MENSAH"
          cardNumber="4532 •••• •••• 8821"
          cvv="492"
          memberSince="2023"
        />
      </motion.div>

      <motion.div variants={itemVariants} className="rounded-3xl border border-white/15 p-5 bg-[#101217]/90 backdrop-blur-2xl shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider">Total Net Liquidity</span>
            <h3 className="text-2xl font-black text-white font-mono tracking-tight">
              ${totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </h3>
                {/* Asset Holdings Breakdown */}
      <motion.div variants={itemVariants} className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-mono font-black uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
            <Coins className="size-3.5 text-amber-400" />
            Active Asset Holdings
          </h4>
          <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded-md border border-emerald-500/30">
            {assets.length} Assets
          </span>
        </div>

        <div className="space-y-3">
          {assets.map((asset) => (
            <motion.div
              key={asset.id}
              whileHover={{ scale: 1.015 }}
              className="rounded-2xl border border-white/10 p-4 bg-[#101217]/90 shadow-lg flex items-center justify-between hover:border-amber-500/50 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div 
                  className="size-10 rounded-xl flex items-center justify-center font-black font-mono text-black shadow-lg"
                  style={{ backgroundColor: asset.color }}
                >
                  {asset.symbol.slice(0, 3)}
                </div>
                <div>
                  <h5 className="text-sm font-extrabold text-white">{asset.name}</h5>
                  <p className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">
                    {asset.chain} • {asset.symbol}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-black font-mono text-white">
                  ${asset.fiatValueUSD.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </p>
                <p className="text-[11px] font-mono text-emerald-400 font-bold">
                  {asset.balance.toLocaleString('en-US', { maximumFractionDigits: 4 })} {asset.symbol}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Risk Note */}
      <motion.div variants={itemVariants}>
        <RiskNote />
      </motion.div>
    </motion.div>
  )
          }
          
