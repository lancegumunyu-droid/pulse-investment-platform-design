'use client'

import React, { useState, useEffect } from 'react'
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { 
  ArrowUpRight, 
  ArrowDownLeft, 
  Send, 
  RefreshCw, 
  Coins, 
  Zap,
  CheckCircle2,
  Wallet,
  Clock,
  ShieldCheck,
  Sparkles
} from 'lucide-react'
import { usePulse } from '../store'
import { RiskNote } from '../ui-bits'
import { Button } from '@/components/ui/button'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.02 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 320, damping: 26 },
  },
}

function DynamicMetallicCard({
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
  const [mousePos, setMousePos] = useState({ x: 170, y: 95 })
  const [isHovered, setIsHovered] = useState(false)

  const x = useMotionValue(0)
  const y = useMotionValue(0)

  const mouseXSpring = useSpring(x, { stiffness: 400, damping: 30 })
  const mouseYSpring = useSpring(y, { stiffness: 400, damping: 30 })

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ['12deg', '-12deg'])
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ['-12deg', '12deg'])

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const mouseX = e.clientX - rect.left
    const mouseY = e.clientY - rect.top
    setMousePos({ x: mouseX, y: mouseY })
    x.set(mouseX / rect.width - 0.5)
    y.set(mouseY / rect.height - 0.5)
  }

  return (
    <div className="w-full flex flex-col items-center space-y-2 py-1">
      <div
        style={{ perspective: 1500 }}
        className="w-full max-w-[340px] aspect-[1.586/1] cursor-pointer select-none"
        onClick={() => setIsFlipped(!isFlipped)}
        onPointerMove={handlePointerMove}
        onPointerEnter={() => setIsHovered(true)}
        onPointerLeave={() => { setIsHovered(false); x.set(0); y.set(0); }}
      >
        <motion.div
          animate={{ rotateY: isFlipped ? 180 : 0 }}
          transition={{ duration: 0.6, type: 'spring', stiffness: 280, damping: 22 }}
          style={{
            rotateX: isHovered && !isFlipped ? rotateX : 0,
            rotateY: isHovered && !isFlipped ? rotateY : 0,
            transformStyle: 'preserve-3d',
          }}
          className="relative w-full h-full rounded-2xl shadow-[0_25px_60px_rgba(0,0,0,0.85),0_0_35px_rgba(245,166,35,0.25)] group"
        >
          {/* Front Face */}
          <div
            className="absolute inset-0 rounded-2xl overflow-hidden border border-amber-300/60 p-4 flex flex-col justify-between backface-hidden shadow-2xl"
            style={{
              backfaceVisibility: 'hidden',
              background: `
                radial-gradient(350px circle at ${mousePos.x}px ${mousePos.y}px, rgba(255, 240, 180, 0.5), transparent 75%),
                linear-gradient(135deg, #fceca4 0%, #d4af37 38%, #b38711 72%, #7c5405 100%)
              `,
            }}
          >
            <motion.div 
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 pointer-events-none"
            />
            <div className="absolute inset-0 border border-white/40 rounded-2xl pointer-events-none" />
            
            <div className="flex items-center justify-between relative z-10">
              <div className="space-y-0.5">
                <h3 className="font-black text-black tracking-widest text-xs font-mono drop-shadow-sm flex items-center gap-1">
                  PULSE <Sparkles className="size-3 text-amber-900" />
                </h3>
                <div className="w-8 h-5.5 rounded bg-gradient-to-br from-amber-200 to-amber-600 border border-amber-900/40 flex items-center justify-center shadow-inner">
                  <div className="w-full h-full border border-amber-950/30 bg-amber-300/40 rounded-sm" />
                </div>
              </div>
              <div className="text-black font-black text-xs font-mono opacity-90 animate-pulse">⚡</div>
            </div>

            <div className="font-mono font-extrabold text-black/90 text-sm tracking-[0.2em] drop-shadow-sm">{cardNumber}</div>

            <div className="flex items-end justify-between relative z-10 pt-1 border-t border-black/15">
              <div className="space-y-0.5">
                <div className="text-[7.5px] font-bold text-black/80 uppercase tracking-wider">{cardholderName} • {memberSince}</div>
                <div className="font-black text-black text-[9px] uppercase tracking-wide">SECURE RWA ASSET LINKED</div>
              </div>
              <div className="font-black italic text-black text-base tracking-tighter">VISA</div>
            </div>
          </div>

          {/* Back Face */}
          <div
            className="absolute inset-0 rounded-2xl overflow-hidden border border-amber-300/60 flex flex-col justify-between py-3 backface-hidden shadow-2xl"
            style={{
              backfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
              background: `
                radial-gradient(350px circle at ${mousePos.x}px ${mousePos.y}px, rgba(255, 240, 180, 0.5), transparent 75%),
                linear-gradient(135deg, #d4af37 0%, #aa7c11 52%, #543702 100%)
              `,
            }}
          >
            <div className="absolute inset-0 border border-white/40 rounded-2xl pointer-events-none" />
            <div className="w-full h-7 bg-[#120e06] mt-1 shadow-inner opacity-90" />
            <div className="px-4 space-y-1">
              <div className="flex items-center gap-2">
                <div className="flex-1 h-6 bg-amber-100/95 rounded px-2 flex items-center text-black font-serif italic text-[11px] shadow-inner">{cardholderName}</div>
                <div className="h-6 px-2.5 rounded bg-amber-950 text-amber-300 font-mono text-[10px] flex items-center border border-amber-500/50 shadow-inner">CVV {cvv}</div>
              </div>
            </div>
            <div className="px-4 flex items-end justify-between text-[7.5px] text-black/90 font-mono">
              <span className="font-semibold">Africa Heritage Foundation Trust</span>
              <span className="font-black">ENCRYPTED RWA</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export function WalletView({ userData }: { userData?: any }) {
  const openModal = usePulse((state) => state.openModal)
  const storeCashBalance = usePulse((state) => state.vaultCash)
  const storePulseLiquid = usePulse((state) => state.pulseLiquid)
  const storePulseStaked = usePulse((state) => state.pulseStaked)
  const sellPulseStore = usePulse((state) => state.sellPulse)
  
  const safeData = userData || {}

  const [activities, setActivities] = useState<any[]>(safeData.activities || [])
  const [receivingAddress, setReceivingAddress] = useState(safeData.withdrawalAddress || '')
  const [showSellDrawer, setShowSellDrawer] = useState(false)
  
  const initialLiquid = storePulseLiquid ?? safeData?.pulseWallet?.liquid ?? safeData?.pulse_liquid ?? 5000
  const [sellAmount, setSellAmount] = useState(initialLiquid.toString())
  const [isSelling, setIsSelling] = useState(false)
  const [sellSuccess, setSellSuccess] = useState(false)

  useEffect(() => {
    if (userData) {
      if (userData.activities) setActivities(userData.activities)
      if (userData.withdrawalAddress !== undefined) setReceivingAddress(userData.withdrawalAddress)
    }
  }, [userData])

  // Clean and robust parsing for cash balances from store or fallback props
  const rawCash = storeCashBalance ?? safeData.cashBalance ?? safeData.cash_balance ?? 14850.00
  const numericCash = typeof rawCash === 'number' 
    ? rawCash 
    : parseFloat(String(rawCash).replace(/[^0-9.-]+/g, '')) || 0

  const pulseLiquid = storePulseLiquid ?? safeData.pulseWallet?.liquid ?? safeData.pulse_liquid ?? '5,000'
  const pulseStaked = storePulseStaked ?? safeData.pulseWallet?.staked ?? safeData.pulse_staked ?? '15,000'
  
  const numericLiquid = Number(String(pulseLiquid).replace(/,/g, '')) || 0
  const numericStaked = Number(String(pulseStaked).replace(/,/g, '')) || 0
  const totalPulse = (numericLiquid + numericStaked).toLocaleString()
  
  const cardData = safeData.cardInfo || safeData.card_info || {
    name: safeData.name ? safeData.name.toUpperCase() : 'LANCE GUMUNYU',
    number: safeData.card_number || '4892 •••• •••• 8219',
    cvv: safeData.cvv || '492',
    memberSince: safeData.memberSince || '2025',
    status: safeData.card_status || 'Active & Verified'
  }

  const handleConfirmSale = () => {
    setIsSelling(true)
    setTimeout(() => {
      setIsSelling(false)
      setSellSuccess(true)
      const numericSellAmt = parseFloat(String(sellAmount).replace(/,/g, '')) || 0
      
      if (sellPulseStore && typeof sellPulseStore === 'function') {
        sellPulseStore(numericSellAmt)
      }

      const newActivity = {
        id: Date.now(),
        title: `PULSE Liquidated to Cash (${numericSellAmt.toLocaleString()} tokens)`,
        date: new Date().toLocaleDateString('en-GB'),
        status: 'completed',
        amount: `+$${(numericSellAmt * 0.08).toFixed(2)}`,
        type: 'income'
      }
      setActivities(prev => [newActivity, ...prev])
      setTimeout(() => {
        setSellSuccess(false)
        setShowSellDrawer(false)
      }, 1800)
    }, 1500)
  }

  return (
    <motion.div 
      variants={containerVariants} 
      initial="hidden" 
      animate="visible" 
      className="space-y-4 max-w-md mx-auto pb-36 pt-1 px-2.5 text-zinc-100 font-sans"
    >
      <motion.div variants={itemVariants} className="space-y-1 px-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <motion.div 
              whileHover={{ rotate: 15, scale: 1.12 }}
              className="p-2 rounded-2xl bg-amber-500/20 text-amber-400 shadow-[0_0_20px_rgba(245,166,35,0.35)] border border-amber-500/30"
            >
              <Wallet className="size-4" />
            </motion.div>
            <h2 className="text-lg font-black tracking-tight text-white">Wallet & Ledger</h2>
          </div>
          <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/30 flex items-center gap-1.5 shadow-[0_0_10px_rgba(16,185,129,0.2)]">
            <span className="size-1.5 rounded-full bg-emerald-400 animate-ping" /> Secure Node Synced
          </span>
        </div>
        <p className="text-[11px] text-zinc-400 pl-8">Real-time asset tracking for cash vaults, RWA tokens, and payouts.</p>
      </motion.div>

      {/* Cash Wallet Card */}
      <motion.div 
        variants={itemVariants} 
        whileHover={{ scale: 1.01, boxShadow: '0 20px 40px rgba(245,166,35,0.18)' }}
        className="relative rounded-3xl border border-amber-500/40 p-5 bg-[#0f1117] bg-gradient-to-b from-[#161410] to-[#0a0c10] shadow-[0_12px_35px_rgba(0,0,0,0.7)] space-y-4 transition-all overflow-hidden"
      >
        <div className="absolute -right-12 -top-12 w-36 h-36 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex items-center justify-between relative z-10">
          <div>
            <span className="text-[10px] font-mono text-amber-400 uppercase tracking-widest font-extrabold flex items-center gap-1">
              <ShieldCheck className="size-3 text-amber-400" /> CASH VAULT BALANCE
            </span>
            <h3 className="text-3xl font-black text-white font-mono tracking-tight mt-1 drop-shadow-[0_0_12px_rgba(255,255,255,0.25)]">
              ${numericCash.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h3>
            <p className="text-[10px] text-zinc-400 mt-0.5">Available for instant deployment or payout</p>
          </div>
          <div className="p-3 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400 shadow-[0_0_20px_rgba(245,166,35,0.25)]">
            <Coins className="size-5" />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2.5 pt-1 relative z-10">
          <motion.div whileTap={{ scale: 0.95 }}>
            <Button
              onClick={() => openModal('deposit')}
              className="w-full bg-gradient-to-r from-amber-400 to-amber-500 hover:brightness-110 text-black font-extrabold text-xs rounded-xl shadow-[0_0_20px_rgba(245,166,35,0.4)] h-10 flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <ArrowDownLeft className="size-4 stroke-[2.5]" />
              <span>Deposit</span>
            </Button>
          </motion.div>

          <motion.div whileTap={{ scale: 0.95 }}>
            <Button
              onClick={() => openModal('withdraw')}
              variant="outline"
              className="w-full bg-white/5 border border-white/15 hover:bg-white/10 hover:border-amber-500/50 text-white font-bold text-xs rounded-xl h-10 flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <ArrowUpRight className="size-4 stroke-[2.5] text-amber-400" />
              <span>Withdraw</span>
            </Button>
          </motion.div>

          <motion.div whileTap={{ scale: 0.95 }}>
            <Button
              onClick={() => openModal('send')}
              variant="outline"
              className="w-full bg-white/5 border border-white/15 hover:bg-white/10 hover:border-amber-500/50 text-white font-bold text-xs rounded-xl h-10 flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Send className="size-4 text-amber-400" />
              <span>Send</span>
            </Button>
          </motion.div>
        </div>
      </motion.div>

      {/* Withdrawal Address Connection Card */}
      <motion.div 
        variants={itemVariants} 
        whileHover={{ scale: 1.005 }}
        className="rounded-3xl border border-white/10 hover:border-amber-500/30 p-4 bg-[#0f1117] space-y-3 transition-all shadow-md"
      >
        <div>
          <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-amber-400" />
            {receivingAddress ? 'Connected Withdrawal Address' : 'No Withdrawal Wallet Connected'}
          </h4>
          <p className="text-[10px] text-zinc-400 mt-0.5">Configure your receiving address for fast USDT (TRC-20) or BTC payouts.</p>
        </div>
        <input
          type="text"
          placeholder="Paste TRC-20 or BTC receiving address"
          value={receivingAddress}
          onChange={(e) => setReceivingAddress(e.target.value)}
          className="w-full bg-black/70 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs font-mono text-white outline-none focus:border-amber-500/60 transition-colors"
        />
        <motion.div whileTap={{ scale: 0.98 }}>
          <Button className="w-full bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 border border-amber-500/40 font-bold text-xs rounded-xl h-9.5 flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_15px_rgba(245,166,35,0.15)]">
            <RefreshCw className="size-3.5" />
            <span>{receivingAddress ? 'Update payout address' : 'Connect payout wallet'}</span>
          </Button>
        </motion.div>
      </motion.div>

      {/* Pulse Wallet Breakdown & Liquidation */}
      <motion.div 
        variants={itemVariants} 
        whileHover={{ scale: 1.005 }}
        className="rounded-3xl border border-white/10 hover:border-amber-500/30 p-4 bg-[#0f1117] space-y-3.5 transition-all shadow-md"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="size-7 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-400 text-xs font-bold font-mono shadow-[0_0_12px_rgba(245,166,35,0.25)] border border-amber-500/30">⚡</div>
            <span className="text-xs font-black text-white uppercase tracking-wider">PULSE Protocol Balance</span>
          </div>
          <span className="text-base font-black font-mono text-amber-400">{totalPulse}</span>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          <div className="rounded-2xl bg-black/50 border border-white/10 p-3 space-y-1">
            <span className="text-[9px] font-mono text-zinc-400 uppercase tracking-wider block">LIQUID — USABLE NOW</span>
            <span className="text-sm font-black font-mono text-white">
              {typeof pulseLiquid === 'number' ? pulseLiquid.toLocaleString() : pulseLiquid}
            </span>
          </div>
          <div className="rounded-2xl bg-black/50 border border-amber-500/25 p-3 space-y-1 bg-gradient-to-br from-amber-500/10 to-transparent">
            <span className="text-[9px] font-mono text-amber-400 uppercase tracking-wider block">STAKED — 24.8% APY</span>
            <span className="text-sm font-black font-mono text-amber-300">
              {typeof pulseStaked === 'number' ? pulseStaked.toLocaleString() : pulseStaked}
            </span>
          </div>
        </div>

        {!showSellDrawer ? (
          <motion.div whileTap={{ scale: 0.98 }}>
            <Button
              onClick={() => setShowSellDrawer(true)}
              variant="outline"
              className="w-full bg-white/5 border border-white/10 hover:bg-amber-500/15 hover:border-amber-500/50 text-amber-400 font-bold text-xs rounded-xl h-10 flex items-center justify-center gap-2 cursor-pointer transition-all shadow-sm"
            >
              <Zap className="size-3.5 animate-pulse text-amber-400" />
              <span>Liquidate PULSE for instant cash</span>
            </Button>
          </motion.div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-3 pt-2.5 border-t border-white/10"
          >
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-zinc-400 font-mono">Conversion rate: $0.08 / token</span>
              <button 
                onClick={() => setShowSellDrawer(false)}
                className="text-amber-400 hover:underline font-bold text-[10px]"
              >
                Cancel
              </button>
            </div>

            <div className="relative">
              <input
                type="text"
                value={sellAmount}
                onChange={(e) => setSellAmount(e.target.value)}
                className="w-full bg-black/90 border border-amber-500/50 rounded-xl px-3.5 py-2.5 text-xs font-mono text-amber-300 outline-none focus:border-amber-400 shadow-inner"
              />
              <span className="absolute right-3 top-2.5 text-[10px] font-mono text-zinc-500 uppercase">Tokens</span>
            </div>

            <div className="flex items-center justify-between text-[11px] font-mono bg-black/30 p-2.5 rounded-xl border border-white/5">
              <span className="text-zinc-400">Estimated Cash Payout</span>
              <span className="text-emerald-400 font-black">
                ${(parseFloat(String(sellAmount).replace(/,/g, '')) * 0.08 || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>

            <motion.div whileTap={{ scale: 0.98 }}>
              <Button
                onClick={handleConfirmSale}
                disabled={isSelling}
                className="w-full bg-amber-400 hover:bg-amber-300 text-black font-extrabold text-xs rounded-xl h-10 flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_20px_rgba(245,166,35,0.4)]"
              >
                {isSelling ? <RefreshCw className="size-4 animate-spin" /> : sellSuccess ? <CheckCircle2 className="size-4 text-black" /> : <Zap className="size-4" />}
                <span>{isSelling ? 'Processing Liquidation...' : sellSuccess ? 'Liquidation Confirmed!' : 'Confirm liquidation'}</span>
              </Button>
            </motion.div>
          </motion.div>
        )}
      </motion.div>

      {/* Pulse Card 3D Display Section */}
      <motion.div 
        variants={itemVariants} 
        whileHover={{ scale: 1.005 }}
        className="rounded-3xl border border-amber-500/40 p-4 bg-[#0f1117] space-y-3.5 transition-all shadow-[0_0_30px_rgba(245,166,35,0.12)] relative overflow-hidden"
      >
        <div className="absolute right-0 top-0 w-44 h-44 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-xl bg-amber-500/20 text-amber-400 shadow-[0_0_12px_rgba(245,166,35,0.25)] border border-amber-500/30">
              <Coins className="size-3.5" />
            </div>
            <span className="text-xs font-bold text-white uppercase tracking-wider">Pulse Metallic Card</span>
          </div>
          <span className="bg-emerald-500/20 text-emerald-400 text-[9px] font-mono font-black px-2.5 py-1 rounded-full border border-emerald-500/40 uppercase tracking-widest shadow-[0_0_10px_rgba(16,185,129,0.25)]">
            {cardData.status}
          </span>
        </div>

        <DynamicMetallicCard
          cardholderName={cardData.name}
          cardNumber={cardData.number}
          cvv={cardData.cvv}
          memberSince={cardData.memberSince}
        />

        <p className="text-[10px] text-zinc-400 text-center leading-normal px-2 relative z-10">
          Click or hover over the card to view the encrypted CVV security pane and experience dynamic metallic light refractions.
        </p>
      </motion.div>

      {/* Live Activity Feed */}
      <motion.div variants={itemVariants} className="space-y-3 pt-2">
        <div className="flex items-center justify-between px-1">
          <h4 className="text-xs font-mono font-black uppercase tracking-wider text-zinc-400">Live Activity Feed</h4>
          <span className="text-[10px] font-mono text-amber-400 flex items-center gap-1.5 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20 shadow-sm">
            <span className="size-1.5 rounded-full bg-emerald-400 animate-ping" /> Ledger Synced
          </span>
        </div>

        <div className="space-y-2">
          {activities.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="rounded-2xl border border-white/10 p-6 text-center bg-[#0f1117]"
            >
              <p className="text-xs text-zinc-400">No transaction activity recorded for this user account yet.</p>
            </motion.div>
          ) : (
            activities.map((item: any, idx: number) => {
              const isPositive = item.amount?.startsWith('+')
              const isPending = item.status === 'pending'

              return (
                <motion.div 
                  key={item.id || idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.04 }}
                  whileHover={{ scale: 1.01, borderColor: 'rgba(245,166,35,0.45)' }} 
                  className="rounded-2xl border border-white/10 p-3.5 bg-[#0f1117] flex items-center justify-between transition-colors shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    <div className={`size-8.5 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${
                      isPending 
                        ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' 
                        : isPositive 
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                        : 'bg-red-500/20 text-red-400 border border-red-500/30'
                    }`}>
                      {isPending ? (
                        <Clock className="size-4 animate-spin" />
                      ) : isPositive ? (
                        <ArrowDownLeft className="size-4" />
                      ) : (
                        <ArrowUpRight className="size-4" />
                      )}
                    </div>
                    <div>
                      <h5 className="text-xs font-bold text-white tracking-tight">{item.title}</h5>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] font-mono text-zinc-400">{item.date}</span>
                        <span className="text-[9px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-zinc-300">
                          {item.status}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className={`text-xs font-mono font-black block ${
                      isPending ? 'text-amber-400' : isPositive ? 'text-emerald-400' : 'text-zinc-200'
                    }`}>
                      {item.amount}
                    </span>
                    <span className="text-[9px] font-mono text-zinc-500 uppercase">{item.type || 'tx'}</span>
                  </div>
                </motion.div>
              )
            })
          )}
        </div>
      </motion.div>

      <motion.div variants={itemVariants} className="pt-2">
        <RiskNote />
      </motion.div>
    </motion.div>
  )
}
