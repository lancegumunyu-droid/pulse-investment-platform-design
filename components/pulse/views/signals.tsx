'use client'

import { Radio, Zap } from 'lucide-react'
import { usePulse } from '../store'
import { Glass, Pill, RiskNote, SectionTitle } from '../ui-bits'
import { PROJECTS, SIGNALS } from '@/lib/pulse-data'
import { Button } from '@/components/ui/button'

export function SignalsView() {
  const { openModal } = usePulse()

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
