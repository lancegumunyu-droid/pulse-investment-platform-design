'use client'

import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Activity, Clock, Radio, RotateCcw, TrendingUp, Zap, Inbox } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { usePulse } from '../store'
import { Glass, Pill, RiskNote, SectionTitle } from '../ui-bits'
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

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 24, scale: 0.97, filter: 'blur(8px)' },
  visible: { opacity: 1, y: 0, scale: 1, filter: 'blur(0px)', transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } },
  exit: { opacity: 0, scale: 0.94, filter: 'blur(10px)', transition: { duration: 0.25 } },
}

export function SignalsView() {
  const supabase = useMemo(() => createClient(), [])
  const { api, openModal } = usePulse()

  const [signals, setSignals] = useState<Signal[]>([])
  const [loading, setLoading] = useState(true)
  const [liveFunding, setLiveFunding] = useState<Record<string, number> | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [mousePos, setMousePos] = useState({ x: 200, y: 100 })
  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top })
  }

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

  // Fetch Funding
  const fetchFunding = useCallback(async () => {
    try {
      const res = await api.liveProjectFunding()
      if (res?.ok && res.funding) {
        setLiveFunding(res.funding)
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

  // Realtime & Interval Setup
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

  const getUrgencyTone = (urgency: string) => {
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
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="pulse-signals mx-auto max-w-md space-y-6 px-1 pb-32 pt-2 font-sans text-zinc-100 selection:bg-amber-500/30">
      <style>{`.signals-spotlight { background-image: radial-gradient(240px circle at var(--spotlight-x) var(--spotlight-y), rgba(245,158,11,.14), transparent 75%), linear-gradient(to bottom, #161616, #080808); } @media (prefers-reduced-motion: reduce) { .signals-spotlight { transition: none; } }`}</style>

      {/* Header */}
      <motion.div variants={itemVariants} className="flex items-center justify-between">
        <SectionTitle
          title="Investment Signals"
          subtitle="Real-time, research-backed deal flows across active assets."
          icon={<Radio className="size-5 text-amber-400 drop-shadow-[0_0_10px_rgba(245,158,11,0.7)]" />}
        />
        <motion.div whileTap={{ scale: 0.92 }}>
          <Button
            size="icon"
            variant="ghost"
            aria-label="Refresh investment signals"
            className="size-10 shrink-0 rounded-2xl border border-white/10 bg-black/40 text-zinc-400 shadow-md backdrop-blur-md transition-all hover:bg-white/[0.08] hover:text-amber-400"
            disabled={isRefreshing || loading}
            onClick={handleRefresh}
          >
            <RotateCcw className={`size-4 ${isRefreshing || loading ? 'animate-spin text-gold' : ''}`} />
          </Button>
        </motion.div>
      </motion.div>

      <motion.div variants={itemVariants} className="flex items-center justify-between rounded-2xl border border-amber-500/20 bg-gradient-to-r from-amber-500/10 via-black/50 to-black/80 px-4 py-2.5 shadow-lg backdrop-blur-md">
        <div className="flex min-w-0 items-center gap-2.5"><span className="relative flex size-2.5 shrink-0"><span className="absolute inline-flex size-full animate-ping rounded-full bg-amber-400" /><span className="relative size-2.5 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(245,158,11,1)]" /></span><span className="truncate text-[11px] font-black uppercase tracking-widest text-amber-300">Satellite Feed</span></div>
        <div className="flex shrink-0 items-center gap-1.5 font-mono text-[10px] font-bold text-zinc-400"><Activity className="size-3 animate-pulse text-emerald-400" />{signals.length} ACTIVE DISPATCHES</div>
      </motion.div>

      {/* Main Container */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="animate-pulse space-y-4 rounded-3xl border border-white/10 bg-black/40 p-6 backdrop-blur-xl">
              <div className="h-4 w-1/4 rounded bg-white/10" />
              <div className="h-6 w-3/4 rounded bg-white/10" />
              <div className="h-4 w-1/2 rounded bg-white/10" />
            </div>
          ))}
        </div>
      ) : signals.length === 0 ? (
        <motion.div variants={itemVariants}>
          <div className="flex flex-col items-center justify-center rounded-3xl border border-white/10 bg-gradient-to-b from-[#141414] to-[#0a0a0a] p-6 py-16 text-center shadow-2xl backdrop-blur-xl bg-noise">
            <div className="mb-3 rounded-2xl border border-amber-500/20 bg-amber-500/10 p-4 shadow-[0_0_20px_rgba(245,158,11,0.15)]"><Inbox className="size-8 text-amber-400" /></div>
            <p className="text-base font-black tracking-wide text-white">No Active Signals</p>
            <p className="mt-1 max-w-xs text-xs leading-relaxed text-zinc-400">Automated research models are scanning active opportunities. Check back shortly for tactical entry signals.</p>
          </div>
        </motion.div>
      ) : (
        <div className="space-y-4">
          <AnimatePresence>
            {signals.map((s) => {
              const project = INITIAL_PROJECTS.find((p) => p.id === s.project_id)
              const funded = project
                ? project.funded + (liveFunding?.[project.id] ?? 0)
                : 0
              const pct = project ? Math.min(100, Math.round((funded / project.goal) * 100)) : 0

              const rawDate = s.updated_at || s.created_at
              const formattedDate = rawDate
                ? new Date(rawDate).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  })
                : null

              const displayWindow = s.window_label || s.window

              return (
                <motion.div key={s.id} variants={itemVariants} layout>
                  <Glass onPointerMove={handlePointerMove} className="signals-spotlight group relative overflow-hidden glow-card border border-amber-500/20 bg-gradient-to-b from-[#161616] via-[#0e0e0e] to-[#080808] p-5 shadow-xl transition-all duration-300 hover:-translate-y-1 hover:border-amber-500/45"><div className="pointer-events-none absolute -inset-px rounded-3xl" style={{ '--spotlight-x': `${mousePos.x}px`, '--spotlight-y': `${mousePos.y}px` } as React.CSSProperties} />
                    <div className="flex items-start justify-between gap-3 border-b border-white/10 pb-3">
                      <div className="flex items-center gap-2">
                        <span className="relative flex size-2.5">
                          <span className="absolute inline-flex size-full animate-ping rounded-full bg-gold opacity-60" />
                          <span className="relative inline-flex size-2.5 rounded-full bg-gold" />
                        </span>
                        <Pill tone={getUrgencyTone(s.urgency)}>{s.urgency}</Pill>
                      </div>
                      <div className="flex shrink-0 items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 font-mono text-xs font-black text-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.25)]"><TrendingUp className="size-3.5" /><span>{s.target_yield} Yield</span></div>
                    </div>

                    <div>
                      <h3 className="text-base font-black leading-snug tracking-wide text-white transition-colors group-hover:text-amber-300">{s.title}</h3>
                      <p className="mt-2 text-xs font-medium leading-relaxed text-zinc-400">{s.detail}</p>
                    </div>

                    {project && (
                      <div className="space-y-2 rounded-2xl border border-white/10 bg-black/50 p-3.5 shadow-inner backdrop-blur-md">
                        <div className="flex justify-between text-[11px] font-bold"><span className="uppercase tracking-wider text-zinc-400">Asset Progress</span><span className="font-mono text-amber-400">{pct}% Funded</span></div>
                        <div className="h-2 w-full overflow-hidden rounded-full border border-white/5 bg-black/80"><div className="h-full rounded-full bg-gradient-to-r from-amber-500 to-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.5)] transition-all duration-500" style={{ width: `${pct}%` }} /></div>
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-3 border-t border-white/10">
                      <div className="flex flex-col text-xs text-muted-foreground">
                        <span className="font-medium text-white">{displayWindow}</span>
                        {formattedDate && (
                          <span className="text-[10px] text-muted-foreground/70" suppressHydrationWarning>
                            Updated: {formattedDate}
                          </span>
                        )}
                      </div>
                      <motion.div whileTap={{ scale: 0.95 }}>
                        <Button
                          size="sm"
                          className="h-10 rounded-xl border border-amber-200/60 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-300 px-4 text-xs font-black uppercase tracking-wider text-black shadow-[0_0_20px_rgba(245,158,11,.35)] hover:brightness-110 animate-liquid"
                          onClick={() => openModal('invest', { projectId: s.project_id })}
                        >
                          <Zap className="mr-1 size-3.5 fill-black" /> One-Click Invest
                        </Button>
                      </motion.div>
                    </div>
                  </Glass>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>
      )}

      <motion.div variants={itemVariants}>
        <RiskNote />
      </motion.div>
    </motion.div>
  )
}
