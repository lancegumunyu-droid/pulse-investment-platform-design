'use client'

import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { Radio, RotateCcw, Zap, Inbox, TrendingUp, Clock, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { usePulse } from '../store'
import { Glass, Pill, RiskNote } from '../ui-bits'
import { PROJECTS as INITIAL_PROJECTS } from '@/lib/pulse-data'
import { Button } from '@/components/ui/button'

export interface Signal {
  id: string
  project_id: string
  title: string
  detail: string
  target_yield: string
  urgency: 'Closing soon' | 'New' | 'Open' | 'Standard' | string
  window_label?: string
  window?: string
  created_at?: string
  updated_at?: string
}

// Stagger Container Physics
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.05,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 35, scale: 0.94 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 24,
    },
  },
}

// High-Fidelity 3D Perspective Reactive Signal Card
function SignalCard3D({
  signal,
  project,
  liveFunding,
  onInvest,
  getUrgencyTone,
}: {
  signal: Signal
  project?: typeof INITIAL_PROJECTS[0]
  liveFunding: Record<string, number> | null
  onInvest: (projectId: string) => void
  getUrgencyTone: (urgency: string) => 'danger' | 'gold' | 'green' | 'muted'
}) {
  const [mousePos, setMousePos] = useState({ x: 200, y: 100 })
  const [isHovered, setIsHovered] = useState(false)

  // Framer Motion Values for Realtime 3D Tilt
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

    const xPct = mouseX / rect.width - 0.5
    const yPct = mouseY / rect.height - 0.5

    x.set(xPct)
    y.set(yPct)
  }

  const handlePointerLeave = () => {
    setIsHovered(false)
    x.set(0)
    y.set(0)
  }

  const handlePointerEnter = () => {
    setIsHovered(true)
  }

  const funded = project
    ? project.funded + (liveFunding?.[project.id] ?? 0)
    : 0
  const pct = project ? Math.min(100, Math.round((funded / project.goal) * 100)) : 0

  const rawDate = signal.updated_at || signal.created_at
  const formattedDate = rawDate
    ? new Date(rawDate).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : null

  const displayWindow = signal.window_label || signal.window

  return (
    <motion.div
      variants={itemVariants}
      layout
      style={{ perspective: 1200 }}
      className="w-full"
    >
      <motion.div
        style={{
          rotateX: isHovered ? rotateX : 0,
          rotateY: isHovered ? rotateY : 0,
          transformStyle: 'preserve-3d',
          background: `radial-gradient(350px circle at ${mousePos.x}px ${mousePos.y}px, rgba(245, 166, 35, 0.18), transparent 80%), linear-gradient(180deg, rgba(24, 28, 38, 0.95) 0%, rgba(10, 12, 16, 0.99) 100%)`,
        }}
        onPointerMove={handlePointerMove}
        onPointerEnter={handlePointerEnter}
        onPointerLeave={handlePointerLeave}
        whileHover={{ scale: 1.025 }}
        transition={{ type: 'spring', stiffness: 450, damping: 28 }}
        className="relative overflow-hidden rounded-3xl border border-white/15 p-5 shadow-[0_20px_50px_rgba(0,0,0,0.6)] space-y-4 transition-colors duration-300 hover:border-amber-500/70 backdrop-blur-2xl group cursor-pointer"
      >
        {/* Animated Sweep Shimmer Edge */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-amber-400 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out" />

        {/* Dynamic Specular Spotlight Following Cursor */}
        <div
          className="pointer-events-none absolute -inset-px rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{
            background: `radial-gradient(450px circle at ${mousePos.x}px ${mousePos.y}px, rgba(255, 255, 255, 0.12), transparent 50%)`,
          }}
        />

        {/* Header Row: Urgency & Target Yield (3D Depth: 25px) */}
        <div
          className="flex items-center justify-between gap-3 border-b border-white/10 pb-3.5 relative z-10"
          style={{ transform: 'translateZ(25px)' }}
        >
          <div className="flex items-center gap-2">
            <span className="relative flex size-3">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-amber-400 opacity-80" />
              <span className="relative inline-flex size-3 rounded-full bg-amber-500 shadow-[0_0_12px_rgba(245,166,35,1)]" />
            </span>
            <Pill tone={getUrgencyTone(signal.urgency)}>
              <span className="font-mono font-black uppercase tracking-wider text-[9px]">
                {signal.urgency}
              </span>
            </Pill>
          </div>

          <motion.div
            whileHover={{ scale: 1.05 }}
            className="bg-gradient-to-r from-emerald-950/90 to-emerald-900/80 border border-emerald-500/50 text-emerald-400 px-3.5 py-1 rounded-full text-xs font-black font-mono flex items-center gap-1.5 shadow-[0_0_20px_rgba(16,185,129,0.3)]"
          >
            <TrendingUp className="size-3.5 text-emerald-400" />
            <span>{signal.target_yield}</span>
          </motion.div>
        </div>

        {/* Signal Content Block (3D Depth: 30px) */}
        <div className="space-y-1.5 relative z-10" style={{ transform: 'translateZ(30px)' }}>
          <h4 className="text-base font-extrabold text-white leading-snug group-hover:text-amber-400 transition-colors flex items-center gap-2">
            <span>{signal.title}</span>
            <Sparkles className="size-4 text-amber-400/90 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </h4>
          <p className="text-xs leading-relaxed text-zinc-300 font-medium">{signal.detail}</p>
        </div>

        {/* Underlying Asset Progress Bar (3D Depth: 20px) */}
        {project && (
          <div
            className="space-y-2 relative z-10 bg-black/60 p-3.5 rounded-2xl border border-white/10 backdrop-blur-md shadow-inner"
            style={{ transform: 'translateZ(20px)' }}
          >
            <div className="flex justify-between text-[10px] font-semibold text-zinc-400">
              <span className="uppercase tracking-wider font-mono flex items-center gap-1">
                <ShieldCheck className="size-3.5 text-amber-400" />
                Underlying Asset Target
              </span>
              <span className="text-emerald-400 font-mono font-black">{pct}% allocated</span>
            </div>
            <div className="h-2.5 w-full overflow-hidden rounded-full bg-zinc-950 p-0.5 border border-white/10">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
                className="h-full bg-gradient-to-r from-amber-500 via-amber-400 to-emerald-400 rounded-full shadow-[0_0_15px_rgba(245,166,35,0.7)]"
              />
            </div>
          </div>
        )}

        {/* Footer & One-Click Invest CTA (3D Depth: 35px) */}
        <div
          className="flex items-center justify-between pt-2 border-t border-white/10 relative z-10"
          style={{ transform: 'translateZ(35px)' }}
        >
          <div className="flex flex-col text-xs text-zinc-400">
            <div className="flex items-center gap-1 font-bold text-white text-[11px]">
              <Clock className="size-3.5 text-amber-400" />
              <span>{displayWindow || 'Execution Window Active'}</span>
            </div>
            {formattedDate && (
              <span className="text-[10px] text-zinc-500 font-mono mt-0.5" suppressHydrationWarning>
                Broadcasted: {formattedDate}
              </span>
            )}
          </div>

          <motion.div whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.92 }}>
            <Button
              size="sm"
              className="bg-gradient-to-r from-amber-400 via-amber-500 to-amber-400 hover:brightness-110 text-black font-extrabold text-xs rounded-xl shadow-[0_0_25px_rgba(245,166,35,0.5)] flex items-center gap-1.5 px-4 h-9 cursor-pointer border border-amber-300/50"
              onClick={() => onInvest(signal.project_id)}
            >
              <Zap className="size-3.5 fill-black" />
              <span>One-Click Invest</span>
              <ArrowRight className="size-3.5 ml-0.5" />
            </Button>
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  )
}

// High-Shimmer Animated Skeleton Loader
function SignalsSkeletonLoader() {
  return (
    <div className="space-y-4">
      {[1, 2].map((i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: i * 0.1 }}
          className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#12151c]/90 p-5 space-y-4 shadow-2xl"
        >
          {/* Animated Shimmer Wave */}
          <motion.div
            className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/5 to-transparent"
            animate={{ translateX: ['-100%', '100%'] }}
            transition={{ repeat: Infinity, duration: 1.8, ease: 'easeInOut' }}
          />

          <div className="flex justify-between items-center border-b border-white/5 pb-3">
            <div className="h-5 w-24 rounded-full bg-white/10 animate-pulse" />
            <div className="h-6 w-20 rounded-full bg-emerald-500/20 animate-pulse" />
          </div>

          <div className="space-y-2">
            <div className="h-5 w-3/4 rounded-lg bg-white/10 animate-pulse" />
            <div className="h-10 w-full rounded-lg bg-white/5 animate-pulse" />
          </div>

          <div className="h-14 w-full rounded-2xl bg-black/40 border border-white/5 p-3 space-y-2">
            <div className="h-3 w-1/3 rounded bg-white/10 animate-pulse" />
            <div className="h-2 w-full rounded-full bg-white/10 animate-pulse" />
          </div>

          <div className="flex justify-between items-center pt-2">
            <div className="h-4 w-28 rounded bg-white/10 animate-pulse" />
            <div className="h-9 w-32 rounded-xl bg-amber-500/20 animate-pulse" />
          </div>
        </motion.div>
      ))}
    </div>
  )
}

export function SignalsView() {
  const supabase = useMemo(() => createClient(), [])
  const { api, openModal } = usePulse()

  const [signals, setSignals] = useState<Signal[]>([])
  const [loading, setLoading] = useState(true)
  const [liveFunding, setLiveFunding] = useState<Record<string, number> | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Fetch Signals
  const loadSignals = useCallback(async (showLoading = true) => {
    if (showLoading) setLoading(true)
    try {
      const { data, error } = await supabase
        .from('signals')
        .select('*')
        .order('created_at', { ascending: false })

      if (!error && data) {
        setSignals(data as Signal[])
      }
    } catch (err) {
      console.error('Error fetching signals:', err)
    } finally {
      if (showLoading) setLoading(false)
    }
  }, [supabase])

  // Fetch Live Funding
  const fetchFunding = useCallback(async () => {
    try {
      if (api?.liveProjectFunding) {
        const res = await api.liveProjectFunding()
        if (res?.ok && res.funding) {
          setLiveFunding(res.funding)
        }
      }
    } catch (err) {
      console.error('Error fetching live funding:', err)
    }
  }, [api])

  // Refresh Trigger
  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true)
    await Promise.all([loadSignals(false), fetchFunding()])
    setIsRefreshing(false)
  }, [loadSignals, fetchFunding])

  // Realtime Setup
  useEffect(() => {
    loadSignals(true)
    fetchFunding()

    const channel = supabase
      .channel('signals-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'signals' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const newSignal = payload.new as Signal
            setSignals((prev) => [newSignal, ...prev.filter((s) => s.id !== newSignal.id)])
          } else if (payload.eventType === 'UPDATE') {
            const updatedSignal = payload.new as Signal
            setSignals((prev) =>
              prev.map((s) => (s.id === updatedSignal.id ? updatedSignal : s))
            )
          } else if (payload.eventType === 'DELETE') {
            const deletedId = payload.old?.id
            if (deletedId) {
              setSignals((prev) => prev.filter((s) => s.id !== deletedId))
            }
          }
        }
      )
      .subscribe()

    const interval = setInterval(fetchFunding, 10_000)

    return () => {
      supabase.removeChannel(channel)
      clearInterval(interval)
    }
  }, [supabase, loadSignals, fetchFunding])

  const getUrgencyTone = (urgency: string): 'danger' | 'gold' | 'green' | 'muted' => {
    switch (urgency) {
      case 'Closing soon':
        return 'danger'
      case 'New':
        return 'gold'
      case 'Open':
        return 'green'
      default:
        return 'muted'
    }
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="pulse-signals space-y-5 max-w-md mx-auto pb-28 pt-1 px-1.5 text-zinc-100 font-sans selection:bg-amber-500/30"
    >
      {/* Dynamic Header */}
      <motion.div variants={itemVariants} className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <motion.div
            whileHover={{ scale: 1.1, rotate: 12 }}
            whileTap={{ scale: 0.9 }}
            className="relative p-2.5 rounded-2xl bg-gradient-to-br from-cyan-500/20 via-blue-500/10 to-transparent border border-cyan-500/40 text-cyan-400 shrink-0 shadow-[0_0_25px_rgba(6,182,212,0.4)]"
          >
            <Radio className="size-5 text-cyan-400 animate-pulse" />
          </motion.div>
          <div>
            <h2 className="text-base font-extrabold text-white leading-tight tracking-wide flex items-center gap-1.5">
              Investment Signals
              <span className="bg-cyan-500/20 text-cyan-300 text-[9px] font-mono font-black px-2 py-0.5 rounded-full border border-cyan-500/40 uppercase tracking-widest shadow-[0_0_10px_rgba(6,182,212,0.3)]">
                Live Feed
              </span>
            </h2>
            <p className="text-[11px] text-zinc-400 leading-normal">
              Institutional opportunities across live SADC ventures.
            </p>
          </div>
        </div>

        {/* Refresh Action Button */}
        <motion.div whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.9 }}>
          <Button
            size="sm"
            variant="ghost"
            className="w-9 h-9 p-0 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-zinc-300 hover:text-white shadow-md cursor-pointer"
            disabled={isRefreshing || loading}
            onClick={handleRefresh}
          >
            <RotateCcw className={`size-4 ${isRefreshing || loading ? 'animate-spin text-amber-400' : ''}`} />
          </Button>
        </motion.div>
      </motion.div>

      {/* Main Signal Feed & Loader State */}
      {loading ? (
        <SignalsSkeletonLoader />
      ) : signals.length === 0 ? (
        <motion.div variants={itemVariants}>
          <Glass className="flex flex-col items-center justify-center py-12 text-center border border-white/10 bg-[#101217]/90 rounded-3xl shadow-xl space-y-3">
            <motion.div
              animate={{ scale: [1, 1.08, 1] }}
              transition={{ repeat: Infinity, duration: 3 }}
              className="p-4 rounded-full bg-white/5 border border-white/10 text-zinc-500"
            >
              <Inbox className="size-8" />
            </motion.div>
            <div>
              <p className="text-sm font-bold text-white">No active signals broadcasted</p>
              <p className="text-xs text-zinc-400 max-w-xs mt-1">
                New institutional SADC deal signals will appear here automatically.
              </p>
            </div>
          </Glass>
        </motion.div>
      ) : (
        <div className="space-y-4">
          <AnimatePresence mode="popLayout">
            {signals.map((signal) => {
              const project = INITIAL_PROJECTS.find((p) => p.id === signal.project_id)
              return (
                <SignalCard3D
                  key={signal.id}
                  signal={signal}
                  project={project}
                  liveFunding={liveFunding}
                  onInvest={(projectId) => openModal('invest', { projectId })}
                  getUrgencyTone={getUrgencyTone}
                />
              )
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Footer Risk Note */}
      <motion.div variants={itemVariants}>
        <RiskNote />
      </motion.div>
    </motion.div>
  )
      }
            
