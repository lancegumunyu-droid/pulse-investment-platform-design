'use client'

import React, { useCallback, useMemo, useState } from 'react'
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
  Lock, 
  Sparkles,
  ArrowRight,
  PieChart
} from 'lucide-react'
import { usePulse } from '../store'
import { Glass, Pill, RiskNote } from '../ui-bits'
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

// Stagger Container Physics matching Dashboard / Signals view
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

// 3D Perspective Reactive Main Balance Card
function MainPortfolioCard({
  totalBalance,
  totalYield24h,
  onDeposit,
  onWithdraw,
}: {
  totalBalance: number
  totalYield24h: number
  onDeposit: () => void
  onWithdraw: () => void
}) {
  const [mousePos, setMousePos] = useState({ x: 200, y: 100 })
  const [isHovered, setIsHovered] = useState(false)

  const x = useMotionValue(0)
  const y = useMotionValue(0)

  const mouseXSpring = useSpring(x, { stiffness: 300, damping: 30 })
  const mouseYSpring = useSpring(y, { stiffness: 300, damping: 30 })

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ['8deg', '-8deg'])
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ['-8deg', '8deg'])

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const mouseX = e.clientX - rect.left
    const mouseY = e.clientY - rect.top
    setMousePos({ x: mouseX, y: mouseY })

    x.set(mouseX / rect.width - 0.5)
    y.set(mouseY / rect.height - 0.5)
  }

  const handlePointerLeave = () => {
    setIsHovered(false)
    x.set(0)
    y.set(0)
  }

  return (
    <motion.div
      variants={itemVariants}
      style={{ perspective: 1200 }}
      className="w-full"
    >
      <motion.div
        style={{
          rotateX: isHovered ? rotateX : 0,
          rotateY: isHovered ? rotateY : 0,
          transformStyle: 'preserve-3d',
          background: `radial-gradient(380px circle at ${mousePos.x}px ${mousePos.y}px, rgba(245, 166, 35, 0.16), transparent 80%), linear-gradient(135deg, rgba(20, 24, 33, 0.98) 0%, rgba(10, 12, 16, 0.99) 100%)`,
        }}
        onPointerMove={handlePointerMove}
        onPointerEnter={() => setIsHovered(true)}
        onPointerLeave={handlePointerLeave}
        whileHover={{ scale: 1.015 }}
        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        className="relative overflow-hidden rounded-3xl border border-amber-500/30 p-6 shadow-[0_20px_50px_rgba(0,0,0,0.7)] space-y-6 backdrop-blur-2xl group"
      >
        {/* Shimmer Line */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-amber-400 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out" />

        {/* Specular Glow */}
        <div 
          className="pointer-events-none absolute -inset-px rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          style={{ background: `radial-gradient(400px circle at ${mousePos.x}px ${mousePos.y}px, rgba(255, 255, 255, 0.08), transparent 50%)` }}
        />

        {/* Top Header Row */}
        <div className="flex items-center justify-between relative z-10" style={{ transform: 'translateZ(20px)' }}>
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400 shadow-[0_0_15px_rgba(245,166,35,0.2)]">
              <Wallet className="size-5" />
            </div>
            <div>
              <p className="text-[11px] font-mono uppercase tracking-widest text-zinc-400 font-semibold">Institutional Vault</p>
              <h3 className="text-sm font-extrabold text-white flex items-center gap-1.5">
                SADC RWA Treasury
                <Globe className="size-3.5 text-cyan-400" />
              </h3>
            </div>
          </div>
          <Pill tone="gold">
            <span className="font-mono text-[9px] font-black uppercase tracking-wider flex items-center gap-1">
              <ShieldCheck className="size-3 text-amber-400" />
              Fully Verified
            </span>
          </Pill>
        </div>

        {/* Balance Display */}
        <div className="space-y-1 relative z-10" style={{ transform: 'translateZ(30px)' }}>
          <span className="text-xs text-zinc-400 font-medium tracking-wide">Total Net Liquidity (USD Equivalent)</span>
          <div className="flex items-baseline gap-3">
            <h2 className="text-3xl sm:text-4xl font-black text-white font-mono tracking-tight">
              ${totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h2>
            <div className="flex items-center gap-1 bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 px-2.5 py-0.5 rounded-full text-xs font-bold font-mono">
              <TrendingUp className="size-3 text-emerald-400" />
              <span>+${totalYield24h.toFixed(2)} (24h)</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3 pt-2 relative z-10 border-t border-white/10" style={{ transform: 'translateZ(25px)' }}>
          <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
            <Button
              onClick={onDeposit}
              className="w-full bg-gradient-to-r from-amber-400 via-amber-500 to-amber-400 hover:brightness-110 text-black font-extrabold text-xs rounded-xl shadow-[0_0_20px_rgba(245,166,35,0.3)] h-11 flex items-center justify-center gap-2 cursor-pointer border border-amber-300/40"
            >
              <ArrowDownLeft className="size-4 stroke-[2.5]" />
              <span>Deposit Capital</span>
            </Button>
          </motion.div>

          <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
            <Button
              onClick={onWithdraw}
              variant="outline"
              className="w-full bg-white/5 border border-white/15 hover:bg-white/10 text-white font-bold text-xs rounded-xl h-11 flex items-center justify-center gap-2 cursor-pointer shadow-md"
            >
              <ArrowUpRight className="size-4 stroke-[2.5] text-amber-400" />
              <span>Withdraw / Yield</span>
            </Button>
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  )
}

// Individual Asset Holding Card
function AssetCard({ asset }: { asset: WalletAsset }) {
  const [mousePos, setMousePos] = useState({ x: 150, y: 80 })
  const [isHovered, setIsHovered] = useState(false)

  const x = useMotionValue(0)
  const y = useMotionValue(0)

  const mouseXSpring = useSpring(x, { stiffness: 350, damping: 30 })
  const mouseYSpring = useSpring(y, { stiffness: 350, damping: 30 })

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ['6deg', '-6deg'])
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ['-6deg', '6deg'])

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top })
    x.set((e.clientX - rect.left) / rect.width - 0.5)
    y.set((e.clientY - rect.top) / rect.height - 0.5)
  }

  return (
    <motion.div
      variants={itemVariants}
      style={{ perspective: 1000 }}
      className="w-full"
    >
      <motion.div
        style={{
          rotateX: isHovered ? rotateX : 0,
          rotateY: isHovered ? rotateY : 0,
          transformStyle: 'preserve-3d',
          background: `radial-gradient(280px circle at ${mousePos.x}px ${mousePos.y}px, rgba(255, 255, 255, 0.06), transparent 75%), linear-gradient(180deg, rgba(16, 19, 26, 0.95) 0%, rgba(8, 10, 14, 0.98) 100%)`,
        }}
        onPointerMove={handlePointerMove}
        onPointerEnter={() => setIsHovered(true)}
        onPointerLeave={() => { setIsHovered(false); x.set(0); y.set(0); }}
        whileHover={{ scale: 1.02 }}
        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        className="relative overflow-hidden rounded-2xl border border-white/10 p-4 shadow-xl space-y-3 transition-colors duration-300 hover:border-amber-500/50 backdrop-blur-xl group cursor-pointer"
      >
        <div className="flex items-center justify-between relative z-10" style={{ transform: 'translateZ(15px)' }}>
          <div className="flex items-center gap-3">
            <div 
              className="size-10 rounded-xl flex items-center justify-center font-black font-mono text-black shadow-lg"
              style={{ backgroundColor: asset.color }}
            >
              {asset.symbol.slice(0, 3)}
            </div>
            <div>
              <h4 className="text-sm font-extrabold text-white group-hover:text-amber-400 transition-colors">
                {asset.name}
              </h4>
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
        </div>
      </motion.div>
    </motion.div>
  )
}

export function WalletView() {
  const openModal = usePulse((state) => state.openModal)
  const [isLoading, setIsLoading] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Mock Active SADC Asset Holdings (ZAR Stablecoin, USDC, Pi RWA Tokens)
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
    {
      id: '4',
      symbol: 'AGRI-MZ',
      name: 'Mozambique Agro-Export Share',
      balance: 840.00,
      fiatValueUSD: 9400.00,
      change24h: 8.2,
      chain: 'Pulse SADC L1',
      color: '#06B6D4',
    },
  ])

  const totalBalance = useMemo(() => {
    return assets.reduce((acc, curr) => acc + curr.fiatValueUSD, 0)
  }, [assets])

  const totalYield24h = useMemo(() => {
    return assets.reduce((acc, curr) => acc + (curr.fiatValueUSD * (curr.change24h / 100)) / 365, 0)
  }, [assets])

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
      className="pulse-wallet space-y-5 max-w-md mx-auto pb-28 pt-1 px-1.5 text-zinc-100 font-sans selection:bg-amber-500/30"
    >
      {/* Header Row */}
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
              <span className="bg-amber-500/20 text-amber-300 text-[9px] font-mono font-black px-2 py-0.5 rounded-full border border-amber-500/40 uppercase tracking-widest">
                SADC Secured
              </span>
            </h2>
            <p className="text-[11px] text-zinc-400 leading-normal">
              Manage your real-world asset capital and yields.
            </p>
          </div>
        </div>

        {/* Refresh Action */}
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

      {/* Main Treasury Card */}
      <MainPortfolioCard
        totalBalance={totalBalance}
        totalYield24h={totalYield24h}
        onDeposit={() => openModal('deposit')}
        onWithdraw={() => openModal('withdraw')}
      />

      {/* Asset Holdings Section Header */}
      <motion.div variants={itemVariants} className="flex items-center justify-between pt-2">
        <h3 className="text-xs font-mono font-black uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
          <PieChart className="size-3.5 text-amber-400" />
          Portfolio Asset Breakdown
        </h3>
        <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded-md border border-emerald-500/30">
          {assets.length} Active Holdings
        </span>
      </motion.div>

      {/* Asset List Grid */}
      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {assets.map((asset) => (
            <AssetCard key={asset.id} asset={asset} />
          ))}
        </AnimatePresence>
      </div>

      {/* Footer Risk Note */}
      <motion.div variants={itemVariants}>
        <RiskNote />
      </motion.div>
    </motion.div>
  )
}
