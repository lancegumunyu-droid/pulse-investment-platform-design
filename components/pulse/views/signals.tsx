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

  const fetchFunding = useCallback(async () => {
    setIsRefreshing(true)
    try {
      const res = await api.liveProjectFunding()
      if (res?.ok) setLiveFunding(res.funding)
    } finally {
      setIsRefreshing(false)
    }
  }, [api])

  useEffect(() => {
    loadSignals()
    fetchFunding()
    const interval = setInterval(fetchFunding, 10_000)
    return () => clearInterval(interval)
  }, [loadSignals, fetchFunding])

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
          disabled={isRefreshing}
          onClick={() => fetchFunding()}
        >
          <RotateCcw className={`size-4 ${isRefreshing ? 'animate-spin text-gold' : ''}`} />
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

                {/* Public Actions */}
                <div className="flex items-center justify-between pt-1">
                  <span className="text-xs text-muted-foreground">{s.window}</span>
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
