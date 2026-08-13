'use client'

import { useCallback, useEffect, useState } from 'react'
import { Radio, RotateCcw, Zap } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { usePulse } from '../store'
import { Glass, Pill, RiskNote, SectionTitle } from '../ui-bits'
import { PROJECTS as INITIAL_PROJECTS } from '@/lib/pulse-data'
import { Button } from '@/components/ui/button'

interface Signal {
  id: string
  project_id: string
  title: string
  detail: string
  target_yield: string
  urgency: string
  window: string
  created_at?: string
  updated_at?: string
}

export function SignalsView() {
  const supabase = createClient()
  const { api, openModal } = usePulse()

  const [signals, setSignals] = useState<Signal[]>([])
  const [loading, setLoading] = useState(true)
  const [liveFunding, setLiveFunding] = useState<Record<string, number> | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Fetch signals from Supabase
  const loadSignals = useCallback(async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('signals')
        .select('*')
        .order('created_at', { ascending: true })

      if (!error && data) {
        setSignals(data as Signal[])
      }
    } catch (err) {
      console.error('Error fetching signals:', err)
    } finally {
      setLoading(false)
    }
  }, [supabase])

  // Fetch live project funding
  const fetchFunding = useCallback(async () => {
    setIsRefreshing(true)
    try {
      const res = await api.liveProjectFunding()
      if (res?.ok) setLiveFunding(res.funding)
    } finally {
      setIsRefreshing(false)
    }
  }, [api])

  // Manual trigger for both Signals and Funding
  const handleRefresh = useCallback(() => {
    loadSignals()
    fetchFunding()
  }, [loadSignals, fetchFunding])

  useEffect(() => {
    // Initial fetch
    loadSignals()
    fetchFunding()

    // Realtime subscription for live signal updates (dates, urgency, yields)
    const channel = supabase
      .channel('public:signals')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'signals' },
        () => {
          loadSignals()
        }
      )
      .subscribe()

    // Funding polling interval
    const interval = setInterval(fetchFunding, 10_000)

    return () => {
      supabase.removeChannel(channel)
      clearInterval(interval)
    }
  }, [loadSignals, fetchFunding, supabase])

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <SectionTitle
          title="Investment signals"
          subtitle="Timely, research-backed opportunities across our live projects."
          icon={<Radio className="size-5" />}
        />
        <Button
          size="sm"
          variant="ghost"
          className="text-muted-foreground hover:text-foreground"
          disabled={isRefreshing || loading}
          onClick={handleRefresh}
        >
          <RotateCcw className={`size-4 ${isRefreshing || loading ? 'animate-spin text-gold' : ''}`} />
        </Button>
      </div>

      {loading ? (
        <div className="py-8 text-center text-sm text-muted-foreground">Loading signals...</div>
      ) : (
        <div className="space-y-4">
          {signals.map((s) => {
            const project = INITIAL_PROJECTS.find((p) => p.id === s.project_id)
            const funded = project ? (liveFunding ? project.funded + (liveFunding[project.id] ?? 0) : project.funded) : 0
            const pct = project ? Math.min(100, Math.round((funded / project.goal) * 100)) : 0
            
            // Format updated/created date
            const rawDate = s.updated_at || s.created_at
            const formattedDate = rawDate
              ? new Date(rawDate).toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })
              : null

            return (
              <Glass key={s.id} className="animate-rise space-y-3">
                {/* Card Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="relative flex size-2.5">
                      <span className="absolute inline-flex size-full animate-ping rounded-full bg-gold opacity-60" />
                      <span className="relative inline-flex size-2.5 rounded-full bg-gold" />
                    </span>
                    <Pill tone={s.urgency === 'Closing soon' ? 'danger' : s.urgency === 'New' ? 'gold' : 'muted'}>
                      {s.urgency}
                    </Pill>
                  </div>
                  <Pill tone="green">{s.target_yield}</Pill>
                </div>

                {/* Title & Detail */}
                <div>
                  <p className="font-semibold leading-tight">{s.title}</p>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{s.detail}</p>
                </div>

                {project && (
                  <p className="text-xs text-muted-foreground">
                    {pct}% funded of the underlying project
                  </p>
                )}

                {/* Public Actions & Rendered Date */}
                <div className="flex items-center justify-between pt-1">
                  <div className="flex flex-col text-xs text-muted-foreground">
                    <span className="font-medium text-foreground/90">{s.window}</span>
                    {formattedDate && (
                      <span className="text-[10px] opacity-70">
                        Updated: {formattedDate}
                      </span>
                    )}
                  </div>
                  <Button
                    size="sm"
                    className="bg-gold font-semibold text-primary-foreground hover:bg-gold/90"
                    onClick={() => openModal('invest', { projectId: s.project_id })}
                  >
                    <Zap className="size-4" /> One-click invest
                  </Button>
                </div>
              </Glass>
            )
          })}
        </div>
      )}

      <RiskNote />
    </div>
  )
}
