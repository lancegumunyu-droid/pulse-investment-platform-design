'use client'

import React, { useState } from 'react'
import { motion, useMotionValue, useMotionTemplate } from 'framer-motion'
import { Sparkles, Coins, Zap, ArrowRight, ShieldCheck, RefreshCw } from 'lucide-react'
import { money, usePulse } from '../store'
import { Glass, Pill, ProgressBar, RiskNote, SectionTitle } from '../ui-bits'
import { TOKEN } from '@/lib/pulse-data'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const SALE_RAISED = 1_842_000
const SALE_GOAL = 3_000_000

// ============================================================================
// 1. ADVANCED MOTION ORCHESTRATION VARIANTS
// ============================================================================
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
  hidden: { 
    opacity: 0, 
    y: 28, 
    scale: 0.96,
    filter: 'blur(8px)' 
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    filter: 'blur(0px)',
    transition: {
      duration: 0.6,
      ease: [0.16, 1, 0.3, 1],
    },
  },
}

const badgePulse = {
  initial: { scale: 1 },
  animate: {
    scale: [1, 1.05, 1],
    transition: {
      duration: 2.5,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
}

// ============================================================================
// 2. MAIN SALE VIEW COMPONENT
// ============================================================================
export function SaleView() {
  const { state, api, busy, toast, openModal } = usePulse()
  const [usd, setUsd] = useState('200')

  const value = Number(usd) || 0
  const baseTokens = value / TOKEN.salePrice
  const bonusTokens = baseTokens * (TOKEN.bonusPct / 100)
  const totalTokens = baseTokens + bonusTokens
  const pct = Math.round((SALE_RAISED / SALE_GOAL) * 100)
  const insufficient = value > state.cash

  // Interactive Cursor Light Tracking
  const mouseX = useMotionValue(200)
  const mouseY = useMotionValue(100)

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const { left, top } = e.currentTarget.getBoundingClientRect()
    mouseX.set(e.clientX - left)
    mouseY.set(e.clientY - top)
  }

  const buy = async () => {
    if (insufficient) {
      toast({ title: 'Insufficient balance', description: 'Deposit funds to join the sale.', variant: 'error' })
      openModal('deposit')
      return
    }
    const res = await api.buyToken(value, Math.round(totalTokens))
    if (!res.ok) {
      toast({ title: 'Purchase failed', description: res.error, variant: 'error' })
      return
    }
    toast({
      title: 'Purchase confirmed',
      description: `${Math.round(totalTokens).toLocaleString()} PULSE added (incl. ${TOKEN.bonusPct}% bonus).`,
      variant: 'success',
    })
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6 max-w-md mx-auto pb-32 pt-2 px-1 text-zinc-100 selection:bg-amber-500/30 font-sans"
    >
      {/* ------------------------------------------------------------------ */}
      {/* RICH SHADER & GLASS EFFECT INJECTIONS                              */}
      {/* ------------------------------------------------------------------ */}
      <style>{`
        /* Continuous Conic Border Rotation */
        @keyframes rotateConic {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .animate-conic-border {
          animation: rotateConic 7s linear infinite;
        }

        /* Premium Shimmer Sweep */
        @keyframes shimmerSweep {
          0% { transform: translateX(-150%) skewX(-20deg); }
          50%, 100% { transform: translateX(250%) skewX(-20deg); }
        }
        .shimmer-sweep-active::after {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0; bottom: 0;
          background: linear-gradient(
            90deg, 
            transparent 0%, 
            rgba(245, 158, 11, 0.03) 20%, 
            rgba(255, 215, 0, 0.22) 50%, 
            rgba(245, 158, 11, 0.03) 80%, 
            transparent 100%
          );
          animation: shimmerSweep 4s infinite ease-in-out;
          pointer-events: none;
        }

        /* Metallic Border Glow Pulse */
        @keyframes glowPulse {
          0%, 100% {
            border-color: rgba(245, 158, 11, 0.35);
            box-shadow: 0 0 15px rgba(245, 158, 11, 0.15), inset 0 0 12px rgba(245, 158, 11, 0.1);
          }
          50% {
            border-color: rgba(245, 158, 11, 0.75);
            box-shadow: 0 0 30px rgba(245, 158, 11, 0.38), inset 0 0 20px rgba(245, 158, 11, 0.2);
          }
        }
        .glow-edge-gold {
          animation: glowPulse 3.5s infinite ease-in-out;
        }

        /* Liquid Gradient Motion */
        @keyframes liquidMove {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animate-liquid {
          background-size: 200% 200%;
          animation: liquidMove 5s infinite ease-in-out;
        }
        .sale-noise {
          background-image: radial-gradient(rgba(255,255,255,.045) 1px, transparent 0);
          background-size: 12px 12px;
        }
        @media (prefers-reduced-motion: reduce) {
          .animate-conic-border, .shimmer-sweep-active::after, .glow-edge-gold, .animate-liquid { animation: none; }
        }
      `}</style>

      {/* ------------------------------------------------------------------ */}
      {/* SECTION HEADER                                                     */}
      {/* ------------------------------------------------------------------ */}
      <motion.div variants={itemVariants}>
        <SectionTitle
          title="$PULSE Private Sale"
          subtitle="Early access to the ecosystem token that powers staking and governance."
          icon={<Sparkles className="size-5 text-amber-400 drop-shadow-[0_0_8px_rgba(245,158,11,0.6)]" />}
        />
      </motion.div>

      {/* ------------------------------------------------------------------ */}
      {/* SALE STATS HERO CARD (WITH CONIC ROTATING GLASS BORDER)            */}
      {/* ------------------------------------------------------------------ */}
      <motion.div variants={itemVariants}>
        <div className="relative p-[1.5px] rounded-3xl overflow-hidden shadow-[0_0_35px_rgba(245,158,11,0.22)]">
          {/* Animated Conic Border Background */}
          <div className="absolute -inset-[180%] bg-[conic-gradient(from_0deg,#f59e0b_0deg,transparent_120deg,#10b981_240deg,#f59e0b_360deg)] opacity-70 animate-conic-border pointer-events-none" />

          <div
            onPointerMove={handlePointerMove}
            className="relative rounded-3xl bg-gradient-to-b from-[#16130d] via-[#0d0b08] to-[#050505] p-6 backdrop-blur-2xl overflow-hidden shimmer-sweep-active sale-noise border border-amber-500/30"
          >
            {/* Spotlight Glow Tracked to Cursor */}
            <motion.div
              className="pointer-events-none absolute -inset-px rounded-3xl opacity-100 transition-opacity duration-300 z-0"
              style={{
                background: useMotionTemplate`
                  radial-gradient(
                    260px circle at ${mouseX}px ${mouseY}px,
                    rgba(245, 158, 11, 0.22),
                    transparent 75%
                  )
                `,
              }}
            />

            {/* Ambient Background Blur Orbs */}
            <div className="pointer-events-none absolute -right-10 -top-10 size-44 rounded-full bg-amber-500/15 blur-3xl animate-pulse" />
            <div className="pointer-events-none absolute -left-10 -bottom-10 size-36 rounded-full bg-emerald-500/10 blur-3xl" />

            <div className="relative z-10 flex items-center justify-between">
              <div>
                <p className="text-[11px] font-black uppercase tracking-widest text-amber-400/90">
                  Sale Price
                </p>
                <p className="mt-1 font-mono text-3xl font-black text-white drop-shadow-[0_2px_10px_rgba(255,255,255,0.2)]">
                  ${TOKEN.salePrice.toFixed(2)}
                </p>
              </div>

              <motion.div variants={badgePulse} initial="initial" animate="animate">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/15 border border-emerald-400/40 text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.3)]">
                  <Zap className="size-3 text-emerald-400 fill-emerald-400" />
                  +{TOKEN.bonusPct}% Bonus
                </span>
              </motion.div>
            </div>

            <div className="relative z-10 mt-6">
              <div className="mb-2 flex justify-between text-xs font-semibold">
                <span className="text-zinc-400">{pct}% of round raised</span>
                <span className="font-mono text-white tracking-wide">
                  ${money(SALE_RAISED, 0)} <span className="text-zinc-500">/ ${money(SALE_GOAL, 0)}</span>
                </span>
              </div>
              <div className="p-1 rounded-xl bg-black/60 border border-white/10 backdrop-blur-md shadow-inner">
                <ProgressBar value={pct} tone="gold" className="h-3 rounded-lg" />
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ------------------------------------------------------------------ */}
      {/* CALCULATOR & INTERACTIVE PURCHASE PANEL                            */}
      {/* ------------------------------------------------------------------ */}
      <motion.div variants={itemVariants}>
        <div
          onPointerMove={handlePointerMove}
          className="group relative rounded-3xl border border-amber-500/20 bg-gradient-to-b from-[#141414] via-[#0d0d0d] to-[#080808] p-6 backdrop-blur-2xl shadow-xl overflow-hidden hover:border-amber-500/40 transition-all duration-300 sale-noise"
        >
          {/* Spotlight Effect */}
          <motion.div
            className="pointer-events-none absolute -inset-px rounded-3xl opacity-100 transition-opacity duration-300 z-0"
            style={{
              background: useMotionTemplate`
                radial-gradient(
                  220px circle at ${mouseX}px ${mouseY}px,
                  rgba(245, 158, 11, 0.12),
                  transparent 75%
                )
              `,
            }}
          />

          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-extrabold text-white tracking-wide flex items-center gap-2">
                <Coins className="size-4 text-amber-400" />
                USDT Calculator
              </p>
              <span className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-wider">
                Instant Settlement
              </span>
            </div>

            {/* Input Field */}
            <label className="block">
              <span className="mb-1.5 block text-[10px] font-black text-zinc-400 uppercase tracking-widest">
                You Pay (USDT)
              </span>
              <div className="relative">
                <input
                  type="number"
                  inputMode="decimal"
                  value={usd}
                  onChange={(e) => setUsd(e.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-black/50 px-4 py-3.5 font-mono text-base font-bold text-white outline-none focus:border-amber-500/60 focus:bg-white/[0.04] transition-all shadow-inner focus:shadow-[0_0_15px_rgba(245,158,11,0.2)]"
                  placeholder="0.00"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 font-mono text-xs font-bold text-amber-400/80 bg-amber-500/10 px-2 py-1 rounded-lg border border-amber-500/20">
                  USDT
                </span>
              </div>
            </label>

            {/* Calculation Breakdown */}
            <div className="mt-5 space-y-3 rounded-2xl bg-black/40 p-4 border border-white/10 backdrop-blur-md shadow-inner">
              <Row label="Base Tokens" value={`${money(baseTokens, 0)} PULSE`} />
              <Row label={`Bonus (${TOKEN.bonusPct}%)`} value={`+${money(bonusTokens, 0)} PULSE`} tone="green" />
              <div className="my-1 border-t border-white/10" />
              <Row label="Total You Receive" value={`${money(totalTokens, 0)} PULSE`} tone="gold" bold />
            </div>

            {/* Quick Amount Selector Buttons */}
            <div className="mt-4 grid grid-cols-4 gap-2">
              {[100, 250, 500, 1000].map((v) => (
                <motion.button
                  key={v}
                  whileTap={{ scale: 0.94 }}
                  whileHover={{ scale: 1.03 }}
                  onClick={() => setUsd(String(v))}
                  className={cn(
                    'rounded-xl border py-2.5 text-xs font-black transition-all shadow-md',
                    value === v
                      ? 'border-amber-400/60 bg-amber-500/20 text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.2)]'
                      : 'border-white/10 bg-white/[0.03] text-zinc-400 hover:bg-white/[0.08] hover:text-white'
                  )}
                >
                  ${v}
                </motion.button>
              ))}
            </div>

            {/* Action Button */}
            <motion.div 
              whileTap={{ scale: 0.97 }} 
              whileHover={{ scale: 1.01 }}
              className="mt-6"
            >
              <Button
                size="lg"
                className="h-13 w-full bg-gradient-to-r from-amber-400 via-amber-500 to-amber-300 text-black font-black text-xs uppercase tracking-wider transition-all duration-300 rounded-xl shadow-[0_0_25px_rgba(245,158,11,0.4)] border border-amber-200/60 hover:brightness-110 animate-liquid flex items-center justify-center gap-2"
                disabled={value <= 0 || busy}
                onClick={buy}
              >
                {busy ? (
                  <RefreshCw className="size-4 animate-spin text-black" />
                ) : insufficient ? (
                  'Deposit to Continue'
                ) : (
                  <>
                    <span>Buy {money(totalTokens, 0)} PULSE</span>
                    <ArrowRight className="size-4 stroke-[3]" />
                  </>
                )}
              </Button>
            </motion.div>

            <div className="mt-4 flex items-center justify-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-zinc-500">
              <ShieldCheck className="size-3.5 text-amber-400/80" />
              <span>Settled via NOWPayments · Simulated</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ------------------------------------------------------------------ */}
      {/* RISK NOTE CONTAINER                                               */}
      {/* ------------------------------------------------------------------ */}
      <motion.div variants={itemVariants}>
        <div className="p-0.5 rounded-2xl bg-gradient-to-r from-amber-500/20 via-transparent to-amber-500/20">
          <RiskNote />
        </div>
      </motion.div>
    </motion.div>
  )
}

// Helper Row Component
function Row({ label, value, tone, bold }: { label: string; value: string; tone?: 'gold' | 'green'; bold?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-zinc-400 text-xs font-semibold">{label}</span>
      <span
        className={cn(
          'font-mono text-xs font-bold tracking-wide',
          bold && 'text-sm font-black',
          tone === 'gold' 
            ? 'text-amber-400 drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]' 
            : tone === 'green' 
              ? 'text-emerald-400 drop-shadow-[0_0_8px_rgba(16,185,129,0.4)]' 
              : 'text-white'
        )}
      >
        {value}
      </span>
    </div>
  )
}
