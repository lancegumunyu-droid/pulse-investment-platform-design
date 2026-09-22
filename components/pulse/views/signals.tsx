'use client'

import React, { useCallback, useEffect, useState } from 'react'
import Image from 'next/image'
import { Radio, RotateCcw, Zap, Inbox, TrendingUp, Clock, ArrowRight, ShieldCheck } from 'lucide-react'
import { usePulse } from '../store'
import { PROJECTS as INITIAL_PROJECTS } from '@/lib/pulse-data'

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

function urgencyChip(urgency: string): string {
  switch (urgency) {
    case 'Closing soon':
      return 'pulse-chip pulse-chip-red'
    case 'New':
      return 'pulse-chip pulse-chip-gold'
    case 'Open':
      return 'pulse-chip pulse-chip-green'
    default:
      return 'pulse-chip pulse-chip-muted'
  }
}

function useMouseGlow<T extends HTMLElement>() {
  const ref = React.useRef<T | null>(null)
  const onMove = (e: React.PointerEvent<T>) => {
    const el = ref.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    el.style.setProperty('--mx', `${e.clientX - rect.left}px`)
    el.style.setProperty('--my', `${e.clientY - rect.top}px`)
  }
  const onLeave = () => {
    const el = ref.current
    if (!el) return
    el.style.removeProperty('--mx')
    el.style.removeProperty('--my')
  }
  return { ref, onMove, onLeave }
}

// FIX — PERFORMANCE. This component used to call api.liveProjectFunding()
// itself, inside its own useEffect. liveProjectFunding() fetches funding
// totals for every project at once, not just this card's project — so with
// 4 project signals on screen, opening this page fired 4 separate,
// simultaneous, identical database queries. funding is now fetched exactly
// once by the parent SignalsView and passed down as a prop.
function SignalCard({ signal, index, funding }: { signal: Signal; index: number; funding: Record<string, number> | null }) {
  const { openModal } = usePulse()
  const glow = useMouseGlow<HTMLDivElement>()

  const project = INITIAL_PROJECTS.find((p) => p.id === signal.project_id)
  const fundedAmount = project ? funding?.[project.id] ?? project.funded : 0
  const pct = project ? Math.min(100, Math.round((fundedAmount / project.goal) * 100)) : 0
  const displayWindow = signal.window_label || signal.window
  const rawDate = signal.updated_at || signal.created_at
  const formattedDate = rawDate
    ? new Date(rawDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : null

  return (
    <div
      ref={glow.ref}
      onPointerMove={glow.onMove}
      onPointerLeave={glow.onLeave}
      className="group pulse-glass-card pulse-glow-track space-y-4 p-5 transition-transform duration-300 hover:-translate-y-1"
    >
      <div className="relative z-[3] flex items-center justify-between gap-3 border-b border-white/10 pb-3.5">
        <div className="flex items-center gap-2.5">
          <span className="font-mono text-[11px] font-bold tabular-nums text-amber-400">
            {String(index + 1).padStart(2, '0')}
          </span>
          <span className="pulse-live-dot" />
          <span className={urgencyChip(signal.urgency)}>{signal.urgency}</span>
        </div>
        <span className="pulse-chip pulse-chip-green">
          <TrendingUp className="h-3 w-3" /> {signal.target_yield}
        </span>
      </div>

      {project?.image && (
        <div className="relative z-[3] h-36 overflow-hidden rounded-2xl border border-amber-500/20 bg-black/40">
          <Image
            src={project.image}
            alt={`${project.name} project image`}
            fill
            sizes="(max-width: 640px) 100vw, 640px"
            className="object-cover transition duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
        </div>
      )}

      <div className="relative z-[3] space-y-1.5">
        <h4 className="text-base font-bold leading-snug text-white">{signal.title}</h4>
        <p className="text-xs leading-relaxed text-zinc-300">{signal.detail}</p>
      </div>

      {project && (
        <div className="relative z-[3] space-y-2 rounded-xl border border-white/10 bg-black/40 p-3.5">
          <div className="flex items-center justify-between">
            <span className="pulse-label flex items-center gap-1">
              <ShieldCheck className="h-3.5 w-3.5 text-amber-400" /> Underlying asset target
            </span>
            <span className="pulse-value-accent text-emerald-400">{pct}% allocated</span>
          </div>
          <div className="h-2.5 w-full overflow-hidden rounded-full border border-white/10 bg-zinc-950 p-0.5">
            <div
              className="h-full rounded-full bg-gradient-to-r from-amber-500 via-amber-400 to-emerald-400 shadow-[0_0_15px_rgba(245,158,11,0.6)] transition-all duration-700"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      )}

      <div className="relative z-[3] flex items-center justify-between gap-3 border-t border-white/10 pt-2">
        <div className="flex flex-col text-xs text-zinc-400">
          <span className="flex items-center gap-1 text-[11px] font-semibold text-white">
            <Clock className="h-3.5 w-3.5 text-amber-400" />
            {displayWindow || 'Execution window active'}
          </span>
          {formattedDate && (
            <span className="pulse-label mt-0.5 normal-case tracking-normal text-zinc-500" suppressHydrationWarning>
              Broadcast {formattedDate}
            </span>
          )}
        </div>
        <button
          onClick={() => openModal('invest', { projectId: signal.project_id })}
          className="flex h-9 items-center gap-1.5 rounded-xl border border-amber-300/50 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-400 px-4 text-xs font-semibold uppercase tracking-wide text-black shadow-[0_0_20px_rgba(245,158,11,0.5)] transition hover:brightness-110"
        >
          <Zap className="h-3.5 w-3.5" />
          <span>One-click invest</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  )
}

export function SignalsView() {
  const { api } = usePulse()
  const [signals, setSignals] = useState<Signal[]>([])
  const [funding, setFunding] = useState<Record<string, number> | null>(null)
  const [loading, setLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const loadSignals = useCallback((showLoading = true) => {
    if (showLoading) setLoading(true)
    try {
      const projectSignals: Signal[] = INITIAL_PROJECTS.map((project) => ({
        id: `project-${project.id}`,
        project_id: project.id,
        title: `${project.name} investment window`,
        detail: project.summary,
        target_yield: project.targetYield,
        urgency: project.status === 'Closed' ? 'Standard' : 'Open',
        window_label: project.status === 'Closed' ? 'Closed' : 'Open for investment',
        created_at: new Date().toISOString(),
      }))
      setSignals(projectSignals)
    } catch (err) {
      console.error('[v0] Error building project signals:', err)
    } finally {
      if (showLoading) setLoading(false)
    }
  }, [])

  const loadFunding = useCallback(async () => {
    const res = await api.liveProjectFunding()
    if (res.ok) setFunding(res.funding)
  }, [api])

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true)
    await Promise.all([loadSignals(false), loadFunding()])
    setIsRefreshing(false)
  }, [loadSignals, loadFunding])

  useEffect(() => {
    loadSignals(true)
    loadFunding()
  }, [loadSignals, loadFunding])

  return (
    <div className="pulse-executive-shell mx-auto w-full max-w-[480px] space-y-4 pb-24 text-amber-100 antialiased lg:max-w-3xl">
      {/* HEADER */}
      <div className="pulse-glass-card pulse-static flex items-center justify-between gap-3 p-4">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-amber-500/30 bg-amber-500/10">
            <Radio className="h-4 w-4 text-amber-400" />
          </span>
          <div>
            <h2 className="flex items-center gap-1.5 text-lg font-bold text-white">
              Investment Signals
              <span className="pulse-chip pulse-chip-green">Live Feed</span>
            </h2>
            <p className="pulse-label mt-0.5 normal-case tracking-normal text-zinc-400">
              Institutional opportunities across live SADC ventures.
            </p>
          </div>
        </div>
        <button
          onClick={handleRefresh}
          disabled={isRefreshing || loading}
          aria-label="Refresh signals"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-zinc-300 transition hover:bg-white/[0.09] disabled:opacity-50"
        >
          <RotateCcw className={`h-4 w-4 ${isRefreshing || loading ? 'animate-spin text-amber-400' : ''}`} />
        </button>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="pulse-glass-card pulse-static space-y-4 p-5">
              <div className="pulse-img-skeleton h-5 w-24 rounded-full" />
              <div className="pulse-img-skeleton h-5 w-3/4 rounded-lg" />
              <div className="pulse-img-skeleton h-16 w-full rounded-xl" />
            </div>
          ))}
        </div>
      ) : signals.length === 0 ? (
        <div className="pulse-glass-card pulse-static flex flex-col items-center gap-3 py-12 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-zinc-500">
            <Inbox className="h-7 w-7" />
          </span>
          <div>
            <p className="text-sm font-bold text-white">No active signals broadcasted</p>
            <p className="pulse-label mt-1 max-w-xs normal-case tracking-normal text-zinc-400">
              New institutional SADC deal signals will appear here automatically.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {signals.map((signal, index) => (
            <SignalCard key={signal.id} signal={signal} index={index} funding={funding} />
          ))}
        </div>
      )}

    </div>
  )
}
