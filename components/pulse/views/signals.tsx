'use client'

import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { motion, AnimatePresence, useMotionValue, useMotionTemplate } from 'framer-motion'
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
  const mouseX = useMotionValue(200)
  const mouseY = useMotionValue(100)
  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const { left, top } = e.currentTarget.getBoundingClientRect()
    mouseX.set(e.clientX - left)
    mouseY.set(e.clientY - top)
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
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="pulse-signals space-y-5">
      {/* Header */}
      <motion.div variants={itemVariants} className="flex items-center justify-between">
        <SectionTitle
          title="Investment signals"
          subtitle="Timely, research-backed opportunities across our live projects."
          icon={<Radio className="size-5 text-gold" />}
        />
        <motion.div whileTap={{ scale: 0.92 }}>
          <Button
            size="sm"
            variant="ghost"
            className="text-muted-foreground hover:text-foreground"
            disabled={isRefreshing || loading}
            onClick={handleRefresh}
          >
            <RotateCcw className={`size-4 ${isRefreshing || loading ? 'animate-spin text-gold' : ''}`} />
          </Button>
        </motion.div>
      </motion.div>

      <motion.div variants={itemVariants} className="flex items-center justify-between rounded-2xl border border-amber-500/20 bg-gradient-to-r from-amber-500/10 via-black/50 to-black/80 px-4 py-2.5 shadow-lg backdrop-blur-md">
        <div className="flex min-w-0 items-center gap-2.5"><span className="relative flex size-2.5 shrink-0"><span className="absolute inline-flex size-full animate-ping rounded-full bg-amber-400" /><span className="relative size-2.5 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(245,158,11,1)]" /></span><span className="truncate text-[11px] font-black uppercase tracking-widest text-amber-300">Satellite Feed</span></div>
        <div className="flex shrink-0 items-center gap-1.5 font-mono text-[10px] font-bold text-zinc-400"><Activity className="size-3 animate-pulse text-emerald-400" />{signals.length} ACTIVE</div>
      </motion.div>

      {/* Main Container */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <Glass key={i} className="animate-pulse space-y-3 p-4 border border-white/10 bg-black/40">
              <div className="h-4 w-1/4 rounded bg-white/10" />
              <div className="h-6 w-3/4 rounded bg-white/10" />
              <div className="h-4 w-1/2 rounded bg-white/10" />
            </Glass>
          ))}
        </div>
      ) : signals.length === 0 ? (
        <motion.div variants={itemVariants}>
          <Glass className="flex flex-col items-center justify-center py-12 text-center border border-white/10 bg-black/40">
            <Inbox className="size-10 text-muted-foreground/50 mb-2" />
            <p className="text-sm font-medium text-white">No active signals found</p>
            <p className="text-xs text-muted-foreground">Check back later for newly broadcast opportunities.</p>
          </Glass>
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
                  <Glass onPointerMove={handlePointerMove} className="group relative overflow-hidden glow-card border border-amber-500/20 bg-gradient-to-b from-[#161616] via-[#0e0e0e] to-[#080808] p-5 shadow-xl transition-all duration-300 hover:-translate-y-1 hover:border-amber-500/45"><motion.div className="pointer-events-none absolute -inset-px rounded-3xl" style={{ background: useMotionTemplate`radial-gradient(240px circle at ${mouseX}px ${mouseY}px, rgba(245,158,11,.14), transparent 75%)` }} />
                    <div className="flex items-start justify-between gap-3 border-b border-white/10 pb-3">
                      <div className="flex items-center gap-2">
                        <span className="relative flex size-2.5">
                          <span className="absolute inline-flex size-full animate-ping rounded-full bg-gold opacity-60" />
                          <span className="relative inline-flex size-2.5 rounded-full bg-gold" />
                        </span>
                        <Pill tone={getUrgencyTone(s.urgency)}>{s.urgency}</Pill>
                      </div>
                      <Pill tone="green">{s.target_yield}</Pill>
                    </div>

                    <div>
                      <p className="font-semibold leading-tight text-white">{s.title}</p>
                      <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{s.detail}</p>
                    </div>

                    {project && (
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-xs text-muted-foreground font-medium">
                          <span>Underlying project</span>
                          <span className="text-white font-mono">{pct}% funded</span>
                        </div>
                        <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                          <div className="h-full bg-gold transition-all duration-500" style={{ width: `${pct}%` }} />
                        </div>
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
                          className="bg-gold font-semibold text-primary-foreground hover:bg-gold/90 shadow-lg shadow-gold/15"
                          onClick={() => openModal('invest', { projectId: s.project_id })}
                        >
                          <Zap className="size-4 mr-1" /> One-click invest
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
