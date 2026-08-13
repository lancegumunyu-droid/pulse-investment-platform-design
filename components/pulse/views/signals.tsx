'use client'

import { useCallback, useEffect, useState } from 'react'
import { Coins, Radio, RotateCcw, ShieldCheck, Zap } from 'lucide-react'
import { createClient } from '@/lib/supabase/client' // Adjust to your Supabase client path
import { usePulse } from '../store'
import { Glass, Pill, RiskNote, SectionTitle } from '../ui-bits'
import { PROJECTS as INITIAL_PROJECTS } from '@/lib/pulse-data'
import { Button } from '@/components/ui/button'

type UrgencyLevel = 'Closing soon' | 'New' | 'Standard' | 'Open'

interface Signal {
  id: string
  project_id: string
  title: string
  detail: string
  target_yield: string
  urgency: UrgencyLevel
  window: string
}

export function SignalsView() {
  const supabase = createClient()
  const { api, openModal, toast } = usePulse()

  const [isAdmin, setIsAdmin] = useState(false)
  const [signals, setSignals] = useState<Signal[]>([])
  const [loading, setLoading] = useState(true)
  const [liveFunding, setLiveFunding] = useState<Record<string, number> | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [busyId, setBusyId] = useState<string | null>(null)

  // 1. Check Admin Status & Fetch Signals from Supabase
  const loadInitialData = useCallback(async () => {
    setLoading(true)
    try {
      // Check if user is admin via RPC/roles table
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: roleData } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .single()

        setIsAdmin(roleData?.role === 'admin')
      }

      // Fetch live signals from Supabase
      const { data: signalData, error } = await supabase
        .from('signals')
        .select('*')
        .order('created_at', { ascending: true })

      if (!error && signalData) {
        setSignals(signalData as Signal[])
      }
    } catch (err) {
      console.error('Error loading signals:', err)
    } finally {
      setLoading(false)
    }
  }, [supabase])

  // Fetch live project funding stats
  const fetchFunding = useCallback(async () => {
    setIsRefreshing(true)
    try {
      const res = await api.liveProjectFunding()
      if (res?.ok) {
        setLiveFunding(res.funding)
      }
    } finally {
      setIsRefreshing(false)
    }
  }, [api])

  useEffect(() => {
    loadInitialData()
    fetchFunding()
    const interval = setInterval(fetchFunding, 10_000)
    return () => clearInterval(interval)
  }, [loadInitialData, fetchFunding])

  // 2. Admin Handler: Update Urgency in Supabase
  const handleUpdateUrgency = async (signalId: string, urgency: UrgencyLevel) => {
    // Optimistic UI update
    setSignals((prev) => prev.map((s) => (s.id === signalId ? { ...s, urgency } : s)))

    const { error } = await supabase
      .from('signals')
      .update({ urgency })
      .eq('id', signalId)

    if (error) {
      toast({ title: 'Update Failed', description: error.message, variant: 'error' })
      loadInitialData() // Rollback on error
    } else {
      toast({ title: 'Risk/Urgency Updated', description: `Set to ${urgency}`, variant: 'success' })
    }
  }

  // 3. Admin Handler: Update Closing Window in Supabase
  const handleUpdateWindow = async (signalId: string, windowText: string) => {
    setSignals((prev) => prev.map((s) => (s.id === signalId ? { ...s, window: windowText } : s)))

    const { error } = await supabase
      .from('signals')
      .update({ window: windowText })
      .eq('id', signalId)

    if (error) {
      toast({ title: 'Update Failed', description: error.message, variant: 'error' })
    }
  }

  // 4. Admin Handler: Disburse Payout via Supabase RPC
  const handleProcessPayout = async (projectId: string) => {
    setBusyId(projectId)
    try {
      const { data, error } = await supabase.rpc('disburse_project_payout', {
        p_project_id: projectId,
      })

      if (error) {
        toast({ title: 'Payout Failed', description: error.message, variant: 'error' })
      } else {
        toast({ title: 'Payout Disbursed', description: data?.message || 'Yield payout processed.', variant: 'success' })
        fetchFunding()
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

                {/* ADMIN CONTROLS PANEL (Renders only for Admin) */}
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
                          <option value="Open">Open</option>
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
                        disabled={busyId === s.project_id}
                        onClick={() => handleProcessPayout(s.project_id)}
                      >
                        <Coins className="mr-1 size-3.5" />
                        {busyId === s.project_id ? 'Processing...' : 'Disburse Project Payout'}
                      </Button>
                    </div>
                  </div>
                )}
              </Glass>
            )
          })}
        </div>
      )}

      <RiskNote />
    </div>
  )
}
