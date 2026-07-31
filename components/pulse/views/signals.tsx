'use client'

import { useEffect, useState } from 'react'
import { Radio, Zap } from 'lucide-react'
import { usePulse } from '../store'
import { Glass, Pill, RiskNote, SectionTitle } from '../ui-bits'
import { PROJECTS, SIGNALS } from '@/lib/pulse-data'
import { Button } from '@/components/ui/button'

export function SignalsView() {
  const { api, openModal } = usePulse()

  // Same real-time funding overlay as the Dashboard — see comment there for
  // details. Used here so signal cards reflect real project momentum too.
  const [liveFunding, setLiveFunding] = useState<Record<string, number> | null>(null)
  useEffect(() => {
    let cancelled = false
    api.liveProjectFunding().then((res) => {
      if (!cancelled && res.ok) setLiveFunding(res.funding)
    })
    return () => {
      cancelled = true
    }
  }, [api])

  return (
    <div className="space-y-5">
      <SectionTitle
        title="Investment signals"
        subtitle="Timely, research-backed opportunities across our live projects."
        icon={<Radio className="size-5" />}
      />

      <div className="space-y-3">
        {SIGNALS.map((s) => {
          const project = PROJECTS.find((p) => p.id === s.projectId)
          const funded = project ? (liveFunding ? project.funded + (liveFunding[project.id] ?? 0) : project.funded) : 0
          const pct = project ? Math.min(100, Math.round((funded / project.goal) * 100)) : 0
          return (
            <Glass key={s.id} className="animate-rise">
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
                <Pill tone="green">{s.targetYield}</Pill>
              </div>

              <p className="mt-3 font-semibold leading-tight">{s.title}</p>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{s.detail}</p>

              {project && (
                <p className="mt-2 text-xs text-muted-foreground">
                  {pct}% funded of the underlying project
                </p>
              )}

              <div className="mt-3 flex items-center justify-between">
                <span className="text-xs text-muted-foreground">{s.window}</span>
                <Button
                  size="sm"
                  className="bg-gold font-semibold text-primary-foreground hover:bg-gold/90"
                  onClick={() => openModal('invest', { projectId: s.projectId })}
                >
                  <Zap className="size-4" /> One-click invest
                </Button>
              </div>
            </Glass>
          )
        })}
      </div>

      <RiskNote />
    </div>
  )
}
