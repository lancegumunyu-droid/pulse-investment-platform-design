'use client'

import React, { useState } from 'react'
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { 
  ArrowUpRight, 
  ArrowDownLeft, 
  Send, 
  RefreshCw, 
  Coins, 
  Zap,
  CheckCircle2,
  Wallet
} from 'lucide-react'
import { usePulse } from '../store'
import { RiskNote } from '../ui-bits'
import { Button } from '@/components/ui/button'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.02 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 300, damping: 25 },
  },
}

// ----------------------------------------------------------------------
// DYNAMIC METALLIC CARD WITH HOVER MOTION
// ----------------------------------------------------------------------
function DynamicMetallicCard({
  cardholderName,
  cardNumber,
  cvv,
  memberSince,
  cardStatus,
}: {
  cardholderName: string
  cardNumber: string
  cvv: string
  memberSince: string
  cardStatus: string
}) {
  const [isFlipped, setIsFlipped] = useState(false)
  const [mousePos, setMousePos] = useState({ x: 180, y: 100 })
  const [isHovered, setIsHovered] = useState(false)

  const x = useMotionValue(0)
  const y = useMotionValue(0)

  const mouseXSpring = useSpring(x, { stiffness: 350, damping: 30 })
  const mouseYSpring = useSpring(y, { stiffness: 350, damping: 30 })

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

  return (
    <div className="w-full flex flex-col items-center space-y-2">
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
          transition={{ duration: 0.6, type: 'spring', stiffness: 280, damping: 22 }}
          style={{
            rotateX: isHovered && !isFlipped ? rotateX : 0,
            rotateY: isHovered && !isFlipped ? rotateY : 0,
            transformStyle: 'preserve-3d',
          }}
          className="relative w-full h-full rounded-2xl shadow-[0_15px_40px_rgba(0,0,0,0.8),0_0_20px_rgba(245,166,35,0.15)] group"
        >
          {/* FRONT */}
          <div
            className="absolute inset-0 rounded-2xl overflow-hidden border border-amber-300/40 p-4 flex flex-col justify-between backface-hidden shadow-2xl"
            style={{
              backfaceVisibility: 'hidden',
              background: `
                radial-gradient(350px circle at ${mousePos.x}px ${mousePos.y}px, rgba(255, 230, 150, 0.35), transparent 70%),
                linear-gradient(135deg, #f3d57d 0%, #d4af37 35%, #aa7c11 70%, #855c08 100%)
              `,
            }}
          >
            <div className="absolute inset-0 border border-white/30 rounded-2xl pointer-events-none" />
            <div className="flex items-center justify-between relative z-10">
              <div className="space-y-0.5">
                <h3 className="font-black text-black tracking-widest text-sm font-mono">PULSE</h3>
                <div className="w-7 h-5 rounded bg-gradient-to-br from-amber-200 to-amber-600 border border-amber-800/40 flex items-center justify-center">
                  <div className="w-full h-full border border-amber-900/30 bg-amber-300/30" />
                </div>
              </div>
              <div className="text-black font-black text-xs font-mono opacity-80">⚡</div>
            </div>
            <div className="font-mono font-bold text-black/90 text-xs tracking-[0.2em]">{cardNumber}</div>
            <div className="flex items-end justify-between relative z-10 pt-1 border-t border-black/10">
              <div className="space-y-0.5">
                <div className="text-[7px] font-bold text-black/70 uppercase">{cardholderName} • {memberSince}</div>
                <div className="font-black text-black text-[10px] uppercase">LINKED TO PULSE WALLET</div>
              </div>
              <div className="font-black italic text-black text-base">VISA</div>
            </div>
          </div>

          {/* BACK */}
          <div
            className="absolute inset-0 rounded-2xl overflow-hidden border border-amber-300/40 flex flex-col justify-between py-3 backface-hidden shadow-2xl"
            style={{
              backfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
              background: `
                radial-gradient(350px circle at ${mousePos.x}px ${mousePos.y}px, rgba(255, 230, 150, 0.35), transparent 70%),
                linear-gradient(135deg, #d4af37 0%, #aa7c11 50%, #724e03 100%)
              `,
            }}
          >
            <div className="absolute inset-0 border border-white/30 rounded-2xl pointer-events-none" />
            <div className="w-full h-6 bg-[#1a1408] mt-1 shadow-inner" />
            <div className="px-4 space-y-1">
              <div className="flex items-center gap-2">
                <div className="flex-1 h-6 bg-amber-100/90 rounded px-2 flex items-center text-black font-serif italic text-[11px]">{cardholderName}</div>
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

// ----------------------------------------------------------------------
// FULLY SYNCHRONIZED WALLET VIEW
// ----------------------------------------------------------------------
export function WalletView({ userData }: { userData?: any }) {
  const openModal = usePulse((state) => state.openModal)
  const [receivingAddress, setReceivingAddress] = useState(userData?.withdrawalAddress || '')
  const [showSellDrawer, setShowSellDrawer] = useState(false)
  const [sellAmount, setSellAmount] = useState(userData?.pulseWallet?.liquid?.toString() || '45,171')
  const [isSelling, setIsSelling] = useState(false)
  const [sellSuccess, setSellSuccess] = useState(false)

  // Fallback data mapping if user context properties aren't completely passed yet
  const cashBalance = userData?.cashBalance ?? '$587.25'
  const pulseLiquid = userData?.pulseWallet?.liquid ?? '45,171'
  const pulseStaked = userData?.pulseWallet?.staked ?? '3,300'
  const totalPulse = userData?.pulseWallet?.total ?? '48,471'
  const cardData = userData?.cardInfo ?? {
    name: 'LANCE GUMUNYU',
    number: '•••• •••• •••• 9C87',
    cvv: '123',
    memberSince: '2023',
    status: 'approved'
  }
  const activityList = userData?.activities || [
    { id: 1, title: 'Closed investment early — $15 penalty', date: '05/09/2026', status: 'completed', amount: '-$60.00', type: 'expense' },
    { id: 2, title: 'Project Payout (kalahari-solar)', date: '04/09/2026', status: 'completed', amount: '+$180.00', type: 'income' },
    { id: 3, title: 'Project Payout (kalahari-solar)', date: '04/09/2026', status: 'completed', amount: '+$9.00', type: 'income' },
    { id: 4, title: 'Manual deposit — USDT (TRC-20)', date: '04/09/2026', status: 'pending', amount: '+$100.00', type: 'pending' },
    { id: 5, title: 'Project share purchase', date: '04/09/2026', status: 'completed', amount: '-$1,500.00', type: 'expense' }
  ]

  const handleConfirmSale = () => {
    setIsSelling(true)
    setTimeout(() => {
      setIsSelling(false)
      setSellSuccess(true)
      setTimeout(() => {
        setSellSuccess(false)
        setShowSellDrawer(false)
      }, 2500)
    }, 1800)
  }

  return (
    <motion.div 
      variants={containerVariants} 
      initial="hidden" 
      animate="visible" 
      className="space-y-4 max-w-md mx-auto pb-32 pt-1 px-2 text-zinc-100 font-sans"
    >
      {/* HEADER TITLE */}
      <motion.div variants={itemVariants} className="space-y-0.5 px-1">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-xl bg-amber-500/15 text-amber-400">
            <Wallet className="size-4" />
          </div>
          <h2 className="text-base font-extrabold text-white">Wallet</h2>
        </div>
        <p className="text-[11px] text-zinc-400 pl-7">Manage funds, connect a wallet, and review activity.</p>
      </motion.div>

      {/* 1. CASH WALLET TILE */}
      <motion.div 
        variants={itemVariants} 
        whileHover={{ scale: 1.005 }}
        className="relative rounded-3xl border border-amber-500/40 p-4 bg-[#12100d] bg-gradient-to-b from-[#181510] to-[#0e1014] shadow-[0_10px_30px_rgba(0,0,0,0.6)] space-y-3 transition-all"
      >
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono text-amber-400 uppercase tracking-widest font-bold">CASH WALLET</span>
            <h3 className="text-2xl font-black text-white font-mono tracking-tight mt-0.5">{cashBalance}</h3>
            <p className="text-[10px] text-zinc-400">Available to invest, withdraw, or send</p>
          </div>
          <div className="p-2 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
            <Coins className="size-4" />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 pt-1">
          <Button
            onClick={() => openModal('deposit')}
            className="w-full bg-gradient-to-r from-amber-400 to-amber-500 hover:brightness-110 text-black font-extrabold text-xs rounded-xl shadow-[0_0_15px_rgba(245,166,35,0.3)] h-9 flex items-center justify-center gap-1 cursor-pointer"
          >
            <ArrowDownLeft className="size-3.5 stroke-[2.5]" />
            <span>Deposit</span>
          </Button>

          <Button
            onClick={() => openModal('withdraw')}
            variant="outline"
            className="w-full bg-white/5 border border-white/15 hover:bg-white/10 text-white font-bold text-xs rounded-xl h-9 flex items-center justify-center gap-1 cursor-pointer"
          >
            <ArrowUpRight className="size-3.5 stroke-[2.5] text-amber-400" />
            <span>Withdraw</span>
          </Button>

          <Button
            onClick={() => openModal('send')}
            variant="outline"
            className="w-full bg-white/5 border border-white/15 hover:bg-white/10 text-white font-bold text-xs rounded-xl h-9 flex items-center justify-center gap-1 cursor-pointer"
          >
            <Send className="size-3.5 text-amber-400" />
            <span>Send</span>
          </Button>
        </div>
      </motion.div>

      {/* 2. WITHDRAWAL WALLET STATUS TILE */}
      <motion.div 
        variants={itemVariants} 
        whileHover={{ scale: 1.005 }}
        className="rounded-3xl border border-white/10 hover:border-amber-500/30 p-4 bg-[#101217] space-y-2.5 transition-all"
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
          className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-xs font-mono text-white outline-none focus:border-amber-500/50"
        />
        <Button className="w-full bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 border border-amber-500/40 font-bold text-xs rounded-xl h-9 flex items-center justify-center gap-1.5 cursor-pointer">
          <RefreshCw className="size-3.5" />
          <span>{receivingAddress ? 'Update wallet' : 'Connect wallet'}</span>
        </Button>
      </motion.div>

      {/* 3. PULSE WALLET TILE & SELL DRAWER */}
      <motion.div 
        variants={itemVariants} 
        whileHover={{ scale: 1.005 }}
        className="rounded-3xl border border-white/10 hover:border-amber-500/30 p-4 bg-[#101217] space-y-3 transition-all"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="size-6 rounded-lg bg-amber-500/20 flex items-center justify-center text-amber-400 text-xs font-bold font-mono">⚡</div>
            <span className="text-xs font-bold text-white uppercase tracking-wider">PULSE wallet</span>
          </div>
          <span className="text-base font-black font-mono text-white">{totalPulse}</span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-2xl bg-black/40 border border-white/10 p-2.5 space-y-0.5">
            <span className="text-[9px] font-mono text-zinc-400 uppercase tracking-wider block">LIQUID — USABLE NOW</span>
            <span className="text-sm font-black font-mono text-white">{pulseLiquid}</span>
          </div>
          <div className="rounded-2xl bg-black/40 border border-white/10 p-2.5 space-y-0.5">
            <span className="text-[9px] font-mono text-amber-400 uppercase tracking-wider block">STAKED — FARMING 24.8% APY</span>
            <span className="text-sm font-black font-mono text-amber-300">{pulseStaked}</span>
          </div>
        </div>

        <p className="text-[10px] text-zinc-400 leading-tight">
          Unstaking moves PULSE from Staked to Liquid instantly — it stays in this wallet, ready to use or convert.
        </p>

        {!showSellDrawer ? (
          <Button
            onClick={() => setShowSellDrawer(true)}
            variant="outline"
            className="w-full bg-white/5 border border-white/10 hover:bg-amber-500/10 text-amber-400 font-bold text-xs rounded-xl h-9 flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Zap className="size-3.5" />
            <span>Sell PULSE for cash</span>
          </Button>
        ) : (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
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
              className="w-full bg-black/80 border border-amber-500/40 rounded-xl px-3 py-2 text-xs font-mono text-amber-300 outline-none"
            />

            <div className="flex items-center justify-between text-[11px] font-mono">
              <span className="text-zinc-400">You receive</span>
              <span className="text-emerald-400 font-bold">
                ${(parseFloat(sellAmount.replace(/,/g, '')) * 0.08 || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} cash
              </span>
            </div>

            <Button
              onClick={handleConfirmSale}
              disabled={isSelling}
              className="w-full bg-amber-400 hover:bg-amber-500 text-black font-extrabold text-xs rounded-xl h-9 flex items-center justify-center gap-1.5 cursor-pointer shadow-[0_0_15px_rgba(245,166,35,0.25)]"
            >
              {isSelling ? <RefreshCw className="size-3.5 animate-spin" /> : sellSuccess ? <CheckCircle2 className="size-3.5 text-black" /> : <Zap className="size-3.5" />}
              <span>{isSelling ? 'Processing Sale...' : sellSuccess ? 'Sale Confirmed!' : 'Confirm sale'}</span>
            </Button>
          </motion.div>
        )}
      </motion.div>

      {/* 4. PULSE CARD TILE */}
      <motion.div 
        variants={itemVariants} 
        whileHover={{ scale: 1.005 }}
        className="rounded-3xl border border-amber-500/30 p-4 bg-[#101217] space-y-3 transition-all shadow-[0_0_20px_rgba(245,166,35,0.08)]"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-xl bg-amber-500/20 text-amber-400">
              <Coins className="size-3.5" />
            </div>
            <span className="text-xs font-bold text-white">Pulse Card</span>
          </div>
          <span className="bg-emerald-500/20 text-emerald-400 text-[9px] font-mono font-black px-2.5 py-0.5 rounded-full border border-emerald-500/40 uppercase tracking-widest">
            {cardData.status}
          </span>
        </div>

        <DynamicMetallicCard
          cardholderName={cardData.name}
          cardNumber={cardData.number}
          cvv={cardData.cvv}
          memberSince={cardData.memberSince}
          cardStatus={cardData.status}
        />

        <p className="text-[10px] text-zinc-400 text-center leading-normal px-2">
          Your Pulse Card has been approved. Physical card issuance and activation will appear here once it ships.
        </p>
      </motion.div>

      {/* 5. DYNAMIC ACTIVITY FEED */}
      <motion.div variants={itemVariants} className="space-y-2.5 pt-2">
        <h4 className="text-xs font-mono font-black uppercase tracking-wider text-zinc-400 px-1">Activity</h4>

        <div className="space-y-2">
          {activityList.map((item: any) => {
            const isPositive = item.amount.startsWith('+')
            const isPending = item.status === 'pending'

            return (
              <motion.div 
                key={item.id}
                whileHover={{ scale: 1.01 }} 
                className="rounded-2xl border border-white/10 p-3 bg-[#101217] flex items-center justify-between transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <div className={`size-7 rounded-xl flex items-center justify-center ${
                    isPending ? 'bg-amber-500/20 text-amber-400' : isPositive ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
                  }`}>
                    {isPending ? <RefreshCw className="size-3.5 animate-spin" /> : isPositive ? <ArrowDownLeft className="size-3.5" /> : <ArrowUpRight className="size-3.5" />}
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-white">{item.title}</h5>
                    <p className="text-[10px] font-mono text-zinc-400">{item.date} • {item.status}</p>
                  </div>
                </div>
                <span className={`text-xs font-mono font-bold ${
                  isPending ? 'text-amber-400' : isPositive ? 'text-emerald-400' : 'text-red-400'
                }`}>
                  {item.amount}
                </span>
              </motion.div>
            )
          })}
  
