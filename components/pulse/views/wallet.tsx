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
  Clock
} from 'lucide-react'
import { usePulse } from '../store'
import { RiskNote } from '../ui-bits'
import { Button } from '@/components/ui/button'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.04 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 300, damping: 24 },
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
    <div className="w-full flex flex-col items-center space-y-2 py-2">
      <div
        style={{ perspective: 1400 }}
        className="w-full max-w-[340px] aspect-[1.586/1] cursor-pointer select-none"
        onClick={() => setIsFlipped(!isFlipped)}
        onPointerMove={handlePointerMove}
        onPointerEnter={() => setIsHovered(true)}
        onPointerLeave={() => { setIsHovered(false); x.set(0); y.set(0); }}
      >
        <motion.div
          animate={{ rotateY: isFlipped ? 180 : 0 }}
          transition={{ duration: 0.6, type: 'spring', stiffness: 260, damping: 20 }}
          style={{
            rotateX: isHovered && !isFlipped ? rotateX : 0,
            rotateY: isHovered && !isFlipped ? rotateY : 0,
            transformStyle: 'preserve-3d',
          }}
          className="relative w-full h-full rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.8),0_0_30px_rgba(245,166,35,0.2)] group"
        >
          {/* Front Face */}
          <div
            className="absolute inset-0 rounded-2xl overflow-hidden border border-amber-300/50 p-4 flex flex-col justify-between backface-hidden shadow-2xl"
            style={{
              backfaceVisibility: 'hidden',
              background: `
                radial-gradient(350px circle at ${mousePos.x}px ${mousePos.y}px, rgba(255, 230, 150, 0.4), transparent 70%),
                linear-gradient(135deg, #f5d77f 0%, #d4af37 35%, #aa7c11 70%, #7c5405 100%)
              `,
            }}
          >
            <motion.div 
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 pointer-events-none"
            />
            <div className="absolute inset-0 border border-white/30 rounded-2xl pointer-events-none" />
            
            <div className="flex items-center justify-between relative z-10">
              <div className="space-y-0.5">
                <h3 className="font-black text-black tracking-widest text-sm font-mono drop-shadow-sm">PULSE</h3>
                <div className="w-7 h-5 rounded bg-gradient-to-br from-amber-200 to-amber-600 border border-amber-800/40 flex items-center justify-center shadow-inner">
                  <div className="w-full h-full border border-amber-900/30 bg-amber-300/30" />
                </div>
              </div>
              <div className="text-black font-black text-xs font-mono opacity-90 animate-pulse">⚡</div>
            </div>

            <div className="font-mono font-bold text-black/90 text-xs tracking-[0.2em] drop-shadow-sm">{cardNumber}</div>

            <div className="flex items-end justify-between relative z-10 pt-1 border-t border-black/10">
              <div className="space-y-0.5">
                <div className="text-[7px] font-bold text-black/75 uppercase tracking-wider">{cardholderName} • {memberSince}</div>
                <div className="font-black text-black text-[10px] uppercase tracking-wide">LINKED TO PULSE WALLET</div>
              </div>
              <div className="font-black italic text-black text-base tracking-tighter">VISA</div>
            </div>
          </div>

          {/* Back Face */}
          <div
            className="absolute inset-0 rounded-2xl overflow-hidden border border-amber-300/50 flex flex-col justify-between py-3 backface-hidden shadow-2xl"
            style={{
              backfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
              background: `
                radial-gradient(350px circle at ${mousePos.x}px ${mousePos.y}px, rgba(255, 230, 150, 0.4), transparent 70%),
                linear-gradient(135deg, #d4af37 0%, #aa7c11 50%, #634302 100%)
              `,
            }}
          >
            <div className="absolute inset-0 border border-white/30 rounded-2xl pointer-events-none" />
            <div className="w-full h-6 bg-[#1a1408] mt-1 shadow-inner" />
            <div className="px-4 space-y-1">
              <div className="flex items-center gap-2">
                <div className="flex-1 h-6 bg-amber-100/90 rounded px-2 flex items-center text-black font-serif italic text-[11px] shadow-inner">{cardholderName}</div>
                <div className="h-6 px-2 rounded bg-amber-950 text-amber-300 font-mono text-[9px] flex items-center border border-amber-500/40">CVV {cvv}</div>
              </div>
            </div>
            <div className="px-4 flex items-end justify-between text-[7px] text-black/80 font-mono">
              <span>Africa Heritage Foundation</span>
              <span className="font-black">SECURE RWA</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export function WalletView({ userData }: { userData?: any }) {
  const openModal = usePulse((state) => state.openModal)
  
  const safeData = userData || {}

  const [activities, setActivities] = useState<any[]>(safeData.activities || [])
  const [receivingAddress, setReceivingAddress] = useState(safeData.withdrawalAddress || '')
  const [showSellDrawer, setShowSellDrawer] = useState(false)
  
  const initialLiquid = safeData?.pulseWallet?.liquid ?? safeData?.pulse_liquid ?? '0'
  const [sellAmount, setSellAmount] = useState(initialLiquid.toString())
  const [isSelling, setIsSelling] = useState(false)
  const [sellSuccess, setSellSuccess] = useState(false)

  // Auto-sync local state when Supabase fetch completes asynchronously
  useEffect(() => {
    if (userData) {
      if (userData.activities) setActivities(userData.activities)
      if (userData.withdrawalAddress !== undefined) setReceivingAddress(userData.withdrawalAddress)
      if (userData.pulseWallet?.liquid !== undefined) {
        setSellAmount(userData.pulseWallet.liquid.toString())
      }
    }
  }, [userData])

  const cashBalance = safeData.cashBalance ?? safeData.cash_balance ?? '$0.00'
  const pulseLiquid = safeData.pulseWallet?.liquid ?? safeData.pulse_liquid ?? '0'
  const pulseStaked = safeData.pulseWallet?.staked ?? safeData.pulse_staked ?? '0'
  const totalPulse = safeData.pulseWallet?.total ?? safeData.total_pulse ?? '0'
  
  const cardData = safeData.cardInfo || safeData.card_info || {
    name: safeData.name ? safeData.name.toUpperCase() : 'VALUED MEMBER',
    number: safeData.card_number || '•••• •••• •••• ••••',
    cvv: safeData.cvv || '•••',
    memberSince: safeData.memberSince || new Date().getFullYear().toString(),
    status: safeData.card_status || 'pending'
  }

  const handleConfirmSale = () => {
    setIsSelling(true)
    setTimeout(() => {
      setIsSelling(false)
      setSellSuccess(true)
      const numericSellAmt = parseFloat(sellAmount.replace(/,/g, '')) || 0
      const newActivity = {
        id: Date.now(),
        title: `PULSE Sold to Cash (${sellAmount} tokens)`,
        date: new Date().toLocaleDateString('en-GB'),
        status: 'completed',
        amount: `+$${(numericSellAmt * 0.08).toFixed(2)}`,
        type: 'income'
      }
      setActivities(prev => [newActivity, ...prev])
      setTimeout(() => {
        setSellSuccess(false)
        setShowSellDrawer(false)
      }, 2000)
    }, 1600)
  }

  return (
    <motion.div 
      variants={containerVariants} 
      initial="hidden" 
      animate="visible" 
      className="space-y-4 max-w-md mx-auto pb-32 pt-1 px-2 text-zinc-100 font-sans"
    >
      <motion.div variants={itemVariants} className="space-y-0.5 px-1">
        <div className="flex items-center gap-2">
          <motion.div 
            whileHover={{ rotate: 15, scale: 1.1 }}
            className="p-1.5 rounded-xl bg-amber-500/15 text-amber-400 shadow-[0_0_15px_rgba(245,166,35,0.3)]"
          >
            <Wallet className="size-4" />
          </motion.div>
          <h2 className="text-base font-extrabold text-white">Wallet & Activity</h2>
        </div>
        <p className="text-[11px] text-zinc-400 pl-7">Real-time ledger tracking for deposits, withdrawals, and payouts.</p>
      </motion.div>

      <motion.div 
        variants={itemVariants} 
        whileHover={{ scale: 1.01, boxShadow: '0 15px 35px rgba(245,166,35,0.15)' }}
        className="relative rounded-3xl border border-amber-500/40 p-4 bg-[#12100d] bg-gradient-to-b from-[#181510] to-[#0e1014] shadow-[0_10px_30px_rgba(0,0,0,0.6)] space-y-3 transition-all overflow-hidden"
      >
        <div className="absolute -right-10 -top-10 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
        
        <div className="flex items-center justify-between relative z-10">
          <div>
            <span className="text-[10px] font-mono text-amber-400 uppercase tracking-widest font-bold">CASH WALLET</span>
            <h3 className="text-2xl font-black text-white font-mono tracking-tight mt-0.5 drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]">{cashBalance}</h3>
            <p className="text-[10px] text-zinc-400">Available to invest, withdraw, or send</p>
          </div>
          <div className="p-2 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 shadow-[0_0_15px_rgba(245,166,35,0.2)]">
            <Coins className="size-4" />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 pt-1 relative z-10">
          <motion.div whileTap={{ scale: 0.95 }}>
            <Button
              onClick={() => openModal('deposit')}
              className="w-full bg-gradient-to-r from-amber-400 to-amber-500 hover:brightness-110 text-black font-extrabold text-xs rounded-xl shadow-[0_0_20px_rgba(245,166,35,0.4)] h-9 flex items-center justify-center gap-1 cursor-pointer"
            >
              <ArrowDownLeft className="size-3.5 stroke-[2.5]" />
              <span>Deposit</span>
            </Button>
          </motion.div>

          <motion.div whileTap={{ scale: 0.95 }}>
            <Button
              onClick={() => openModal('withdraw')}
              variant="outline"
              className="w-full bg-white/5 border border-white/15 hover:bg-white/10 hover:border-amber-500/40 text-white font-bold text-xs rounded-xl h-9 flex items-center justify-center gap-1 cursor-pointer"
            >
              <ArrowUpRight className="size-3.5 stroke-[2.5] text-amber-400" />
              <span>Withdraw</span>
            </Button>
          </motion.div>

          <motion.div whileTap={{ scale: 0.95 }}>
            <Button
              onClick={() => openModal('send')}
              variant="outline"
              className="w-full bg-white/5 border border-white/15 hover:bg-white/10 hover:border-amber-500/40 text-white font-bold text-xs rounded-xl h-9 flex items-center justify-center gap-1 cursor-pointer"
            >
              <Send className="size-3.5 text-amber-400" />
              <span>Send</span>
            </Button>
          </motion.div>
        </div>
      </motion.div>

      <motion.div 
        variants={itemVariants} 
        whileHover={{ scale: 1.005 }}
        className="rounded-3xl border border-white/10 hover:border-amber-500/30 p-4 bg-[#101217] space-y-2.5 transition-all shadow-md"
      >
        <div>
          <h4 className="text-xs font-bold text-white">
            {receivingAddress ? 'Connected withdrawal address' : 'No withdrawal wallet connected'}
          </h4>
          <p className="text-[10px] text-zinc-400">Add or manage the address you want withdrawals sent to — USDT (TRC-20) or BTC.</p>
        </div>
        <input
          type="text"
          placeholder="Paste your receiving address"
          value={receivingAddress}
          onChange={(e) => setReceivingAddress(e.target.value)}
          className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-xs font-mono text-white outline-none focus:border-amber-500/50 transition-colors"
        />
        <motion.div whileTap={{ scale: 0.98 }}>
          <Button className="w-full bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 border border-amber-500/40 font-bold text-xs rounded-xl h-9 flex items-center justify-center gap-1.5 cursor-pointer shadow-[0_0_10px_rgba(245,166,35,0.15)]">
            <RefreshCw className="size-3.5" />
            <span>{receivingAddress ? 'Update wallet' : 'Connect wallet'}</span>
          </Button>
        </motion.div>
      </motion.div>

      <motion.div 
        variants={itemVariants} 
        whileHover={{ scale: 1.005 }}
        className="rounded-3xl border border-white/10 hover:border-amber-500/30 p-4 bg-[#101217] space-y-3 transition-all shadow-md"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="size-6 rounded-lg bg-amber-500/20 flex items-center justify-center text-amber-400 text-xs font-bold font-mono shadow-[0_0_10px_rgba(245,166,35,0.2)]">⚡</div>
            <span className="text-xs font-bold text-white uppercase tracking-wider">PULSE wallet</span>
          </div>
          <span className="text-base font-black font-mono text-white">{totalPulse}</span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-2xl bg-black/40 border border-white/10 p-2.5 space-y-0.5">
            <span className="text-[9px] font-mono text-zinc-400 uppercase tracking-wider block">LIQUID — USABLE NOW</span>
            <span className="text-sm font-black font-mono text-white">{pulseLiquid}</span>
          </div>
          <div className="rounded-2xl bg-black/40 border border-amber-500/20 p-2.5 space-y-0.5 bg-gradient-to-br from-amber-500/5 to-transparent">
            <span className="text-[9px] font-mono text-amber-400 uppercase tracking-wider block">STAKED — 24.8% APY</span>
            <span className="text-sm font-black font-mono text-amber-300">{pulseStaked}</span>
          </div>
        </div>

        {!showSellDrawer ? (
          <motion.div whileTap={{ scale: 0.98 }}>
            <Button
              onClick={() => setShowSellDrawer(true)}
              variant="outline"
              className="w-full bg-white/5 border border-white/10 hover:bg-amber-500/10 hover:border-amber-500/40 text-amber-400 font-bold text-xs rounded-xl h-9 flex items-center justify-center gap-1.5 cursor-pointer transition-all"
            >
              <Zap className="size-3.5 animate-pulse" />
              <span>Sell PULSE for cash</span>
            </Button>
          </motion.div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-2.5 pt-2 border-t border-white/10"
          >
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-zinc-400 font-mono">Sell liquid PULSE at $0.08 / token</span>
              <button 
                onClick={() => setShowSellDrawer(false)}
                className="text-amber-400 hover:underline font-bold text-[10px]"
              >
                Cancel
              </button>
            </div>

            <input
              type="text"
              value={sellAmount}
              onChange={(e) => setSellAmount(e.target.value)}
              className="w-full bg-black/80 border border-amber-500/40 rounded-xl px-3 py-2 text-xs font-mono text-amber-300 outline-none focus:border-amber-500"
            />

            <div className="flex items-center justify-between text-[11px] font-mono">
              <span className="text-zinc-400">You receive</span>
              <span className="text-emerald-400 font-bold">
                ${(parseFloat(sellAmount.replace(/,/g, '')) * 0.08 || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} cash
              </span>
            </div>

            <motion.div whileTap={{ scale: 0.98 }}>
              <Button
                onClick={handleConfirmSale}
                disabled={isSelling}
                className="w-full bg-amber-400 hover:bg-amber-500 text-black font-extrabold text-xs rounded-xl h-9 flex items-center justify-center gap-1.5 cursor-pointer shadow-[0_0_20px_rgba(245,166,35,0.4)]"
              >
                {isSelling ? <RefreshCw className="size-3.5 animate-spin" /> : sellSuccess ? <CheckCircle2 className="size-3.5 text-black" /> : <Zap className="size-3.5" />}
                <span>{isSelling ? 'Processing Sale...' : sellSuccess ? 'Sale Confirmed!' : 'Confirm sale'}</span>
              </Button>
            </motion.div>
          </motion.div>
        )}
      </motion.div>

      <motion.div 
        variants={itemVariants} 
        whileHover={{ scale: 1.005 }}
        className="rounded-3xl border border-amber-500/40 p-4 bg-[#101217] space-y-3 transition-all shadow-[0_0_25px_rgba(245,166,35,0.1)] relative overflow-hidden"
      >
        <div className="absolute right-0 top-0 w-40 h-40 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-xl bg-amber-500/20 text-amber-400 shadow-[0_0_10px_rgba(245,166,35,0.2)]">
              <Coins className="size-3.5" />
            </div>
            <span className="text-xs font-bold text-white">Pulse Card</span>
          </div>
          <span className="bg-emerald-500/20 text-emerald-400 text-[9px] font-mono font-black px-2.5 py-0.5 rounded-full border border-emerald-500/40 uppercase tracking-widest shadow-[0_0_10px_rgba(16,185,129,0.2)]">
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
          Your Pulse Card details dynamically sync with your account profile status and issuance parameters.
        </p>
      </motion.div>

      <motion.div variants={itemVariants} className="space-y-2.5 pt-2">
        <div className="flex items-center justify-bet
