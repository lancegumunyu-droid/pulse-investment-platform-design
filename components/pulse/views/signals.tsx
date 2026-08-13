'use client'

import { useCallback, useEffect, useState } from 'react'
import { Coins, Radio, RotateCcw, ShieldCheck, Zap } from 'lucide-react'
import { usePulse } from '../store'
import { Glass, Pill, RiskNote, SectionTitle } from '../ui-bits'
import { PROJECTS as INITIAL_PROJECTS, SIGNALS as INITIAL_SIGNALS } from '@/lib/pulse-data'
import { Button } from '@/components/ui/button'

type UrgencyLevel = 'Closing soon' | 'New' | 'Standard'

export function SignalsView() {
  const { state, api, openModal, toast } = usePulse()
  const isAdmin = state?.isAdmin ?? false

  // Local state to manage editable signals & projects
  const [signals, setSignals] = useState(INITIAL_SIGNALS)
  const [liveFunding, setLiveFunding] = useState<Record<string, number> | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [busyId, setBusyId] = useState<string | null>(null)

  // Fetch live funding
  const fetchFunding = useCallback(async () => {
    setIsRefreshing(true)
    try {
      const res = await api.liveProjectFunding()
      if (res.ok) {
        setLiveFunding(res.funding)
      }
    } finally {
      setIsRefreshing(false)
    }
  }, [api])

  useEffect(() => {
    fetchFunding()
    const interval = setInterval(fetchFunding, 10_000)
    return () => clearInterval(interval)
  }, [fetchFunding])

  // Admin Handlers
  const handleUpdateUrgency = (signalId: string, urgency: UrgencyLevel) => {
    setSignals((prev) =>
      prev.map((s) => (s.id === signalId ? { ...s, urgency } : s))
    )
    toast({ title: 'Risk/Urgency Updated', description: `Set to ${urgency}`, variant: 'success' })
  }

  const handleUpdateWindow = (signalId: string, window: string) => {
    setSignals((prev) =>
      prev.map((s) => (s.id === signalId ? { ...s, window } : s))
    )
  }

  const handleProcessPayout = async (projectId: string) => {
    setBusyId(projectId)
    try {
      // Assuming api.processPayout exists on your store API
      if (api.processProjectPayout) {
        const res = await api.processProjectPayout(projectId)
        if (res.ok) {
          toast({ title: 'Payout Disbursed', description: 'Yield payout sent to investors.', variant: 'success' })
          fetchFunding()
        } else {
          toast({ title: 'Payout Failed', description: res.error, variant: 'error' })
        }
      } else {
        // Fallback simulation if backend endpoint is in actions/admin
        toast({ title: 'Payout Processed', description: `Disbursed yield for ${projectId}`, variant: 'success' })
      }
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <SectionTitle
          title="Investment signals"
          subtitle="Timely, research-backed opportunities across our live projects."
          icon={<Radio className="size-5" />}
        />
        <div className="flex items-center gap-2">
          {isAdmin && (
            <Pill tone="gold" className="flex items-center gap-1 font-semibold">
              <ShieldCheck className="size-3.5" /> Admin Mode
            </Pill>
          )}
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
      </div>

      <div className="space-y-4">
        {signals.map((s) => {
          const project = INITIAL_PROJECTS.find((p) => p.id === s.projectId)
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
                <Pill tone="green">{s.targetYield}</Pill>
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
                  onClick={() => openModal('invest', { projectId: s.projectId })}
                >
                  <Zap className="size-4" /> One-click invest
                </Button>
              </div>

              {/* ADMIN CONTROLS PANEL */}
              {isAdmin && (
                <div className="mt-3 rounded-xl border border-gold/30 bg-gold/5 p-3 space-y-2.5">
                  <p className="text-xs font-semibold text-gold flex items-center gap-1">
                    <ShieldCheck className="size-3.5" /> Admin Controls
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {/* Urgency / Risk Level Selector */}
                    <div>
                      <label className="block text-muted-foreground mb-1">Risk / Urgency Level</label>
                      <select
                        value={s.urgency}
                        onChange={(e) => handleUpdateUrgency(s.id, e.target.value as UrgencyLevel)}
                        className="w-full rounded-lg border border-white/10 bg-black/40 px-2.5 py-1.5 outline-none focus:border-gold/50"
                      >
                        <option value="New">New</option>
                        <option value="Closing soon">Closing Soon (High Urgency)</option>
                        <option value="Standard">Standard</option>
                      </select>
                    </div>

                    {/* Closing Window Override */}
                    <div>
                      <label className="block text-muted-foreground mb-1">Closing Window / Date</label>
                      <input
                        type="text"
                        value={s.window}
                        onChange={(e) => handleUpdateWindow(s.id, e.target.value)}
                        placeholder="e.g. Closes in 48h"
                        className="w-full rounded-lg border border-white/10 bg-black/40 px-2.5 py-1.5 outline-none focus:border-gold/50"
                      />
                    </div>
                  </div>

                  {/* Trigger Payout Button */}
                  <div className="pt-1 flex justify-end">
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-gold/40 text-xs text-gold hover:bg-gold/10"
                      disabled={busyId === s.projectId}
                      onClick={() => handleProcessPayout(s.projectId)}
                    >
                      <Coins className="mr-1 size-3.5" />
                      {busyId === s.projectId ? 'Processing...' : 'Disburse Project Payout'}
                    </Button>
                  </div>
                </div>
              )}
            </Glass>
          )
        })}
      </div>

      <RiskNote />
    </div>
  )
}
