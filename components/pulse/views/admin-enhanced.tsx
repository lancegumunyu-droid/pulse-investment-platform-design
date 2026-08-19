'use client'

import { useMemo, useState } from 'react'
import confetti from 'canvas-confetti'
import { Check, Lock, ShieldCheck, Plus, Edit2, Trash2, X, Save } from 'lucide-react'
import { money, usePulse } from '../store'
import { Glass, Pill, SectionTitle, Stat } from '../ui-bits'
import { PROJECTS, SIGNALS } from '@/lib/pulse-data'
import { Button } from '@/components/ui/button'

export function AdminEnhancedView() {
  const { state, dispatch, toast, totalInvested } = usePulse()
  const [authed, setAuthed] = useState(false)
  const [pw, setPw] = useState('')
  const [authenticating, setAuthenticating] = useState(false)
  const [tab, setTab] = useState<'dashboard' | 'signals' | 'projects' | 'payments'>('dashboard')
  
  // Signal management
  const [signals, setSignals] = useState(SIGNALS)
  const [editingSignal, setEditingSignal] = useState<string | null>(null)
  const [newSignal, setNewSignal] = useState({
    projectId: '',
    title: '',
    detail: '',
    targetYield: '',
    urgency: 'New' as const,
    window: '',
  })
  
  // Project management
  const [projects, setProjects] = useState(PROJECTS)
  const [editingProject, setEditingProject] = useState<string | null>(null)
  const [newProject, setNewProject] = useState({
    name: '',
    country: '',
    sector: 'Renewable Energy' as const,
    targetYield: '',
    goal: 0,
    risk: 'Moderate' as const,
    summary: '',
  })

  const pending = useMemo(() => state.txns.filter((t) => t.status === 'pending'), [state.txns])

  const login = async () => {
    if (authenticating) return
    setAuthenticating(true)
    try {
      if (process.env.NODE_ENV !== 'production' && pw === 'pulse-admin') {
        setAuthed(true)
        toast({ title: 'Demo admin access granted', description: 'Local preview only.', variant: 'success' })
        return
      }

      const response = await fetch('/api/admin/session', { cache: 'no-store' })
      if (!response.ok) {
        toast({ title: 'Admin access denied', description: 'Sign in with an approved Pulse administrator account.', variant: 'error' })
        return
      }

      const result = (await response.json()) as { authorized?: boolean }
      if (result.authorized) {
        setAuthed(true)
        toast({ title: 'Admin access granted', variant: 'success' })
      } else {
        toast({ title: 'Admin access denied', description: 'Your account is not approved for administration.', variant: 'error' })
      }
    } catch {
      toast({ title: 'Unable to verify access', description: 'Please try again after signing in.', variant: 'error' })
    } finally {
      setAuthenticating(false)
    }
  }

  if (!authed) {
    return (
      <div className="space-y-5">
        <SectionTitle title="Admin dashboard" subtitle="Restricted access." icon={<Lock className="size-5" />} />
        <Glass className="animate-rise">
          <div className="mb-4 flex flex-col items-center text-center">
            <span className="flex size-12 items-center justify-center rounded-2xl bg-gold-soft text-gold">
              <ShieldCheck className="size-6" />
            </span>
            <p className="mt-3 font-semibold">Verify admin access</p>
            <p className="mt-1 text-xs text-muted-foreground">Production access requires a signed-in, approved administrator account.</p>
          </div>
          <input
            type="password"
            value={pw}
            onChange={(e) => setPw(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.nativeEvent.isComposing) login()
            }}
            placeholder="Password"
            className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-3 text-sm outline-none focus:border-gold/50 focus:ring-2 focus:ring-gold/20"
          />
          <Button size="lg" className="mt-4 h-12 w-full bg-gold font-semibold text-primary-foreground hover:bg-gold/90" onClick={login} disabled={authenticating}>
            {authenticating ? 'Verifying…' : 'Verify access'}
          </Button>
        </Glass>
      </div>
    )
  }

  const platformDeposits = state.txns.filter((t) => t.type === 'deposit').reduce((s, t) => s + t.amount, 0)

  return (
    <div className="space-y-5">
      <SectionTitle title="Admin dashboard" subtitle="Platform management." icon={<ShieldCheck className="size-5" />} />

      {/* Tab Navigation */}
      <Glass className="flex gap-2 p-2">
        {(['dashboard', 'signals', 'projects', 'payments'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium transition-all ${
              tab === t ? 'bg-gold text-primary-foreground' : 'text-muted-foreground hover:bg-white/5'
            }`}
          >
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </Glass>

      {/* DASHBOARD TAB */}
      {tab === 'dashboard' && (
        <div className="space-y-5">
          <Glass className="grid grid-cols-2 gap-4">
            <Stat label="Total deposits" value={`$${money(platformDeposits, 0)}`} />
            <Stat label="Total invested" value={`$${money(totalInvested, 0)}`} />
            <Stat label="Active signals" value={signals.length} />
            <Stat label="Pending approvals" value={pending.length} />
          </Glass>

          <Glass className="animate-rise">
            <p className="mb-3 text-sm font-semibold">Pending withdrawals</p>
            {pending.length === 0 ? (
              <p className="text-sm text-muted-foreground">No pending items.</p>
            ) : (
              <div className="space-y-2">
                {pending.map((t) => (
                  <div key={t.id} className="flex items-center justify-between rounded-2xl bg-white/[0.03] p-3">
                    <div>
                      <p className="text-sm font-medium">{t.label}</p>
                      <p className="text-xs text-muted-foreground">${money(t.amount)} · {new Date(t.date).toLocaleString()}</p>
                    </div>
                    <Button
                      size="sm"
                      className="bg-green font-semibold text-background hover:bg-green/90"
                      onClick={() => {
dispatch({ type: 'APPROVE_TXN', id: t.id })
              confetti({ particleCount: 70, spread: 55, origin: { y: 0.72 }, colors: ['#f59e0b', '#fef3c7', '#111111'] })
              toast({ title: 'Withdrawal approved', description: `$${money(t.amount)} disbursed.`, variant: 'success' })
                      }}
                    >
                      <Check className="size-4" /> Approve
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </Glass>
        </div>
      )}

      {/* SIGNALS TAB */}
      {tab === 'signals' && (
        <div className="space-y-5">
          <Glass className="space-y-4 p-4">
            <p className="font-semibold">Create new signal</p>
            <div className="space-y-3">
              <select
                value={newSignal.projectId}
                onChange={(e) => setNewSignal({ ...newSignal, projectId: e.target.value })}
                className="w-full rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-sm focus:border-gold/50 focus:ring-2 focus:ring-gold/20"
              >
                <option value="">Select project</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
              <input
                type="text"
                placeholder="Signal title"
                value={newSignal.title}
                onChange={(e) => setNewSignal({ ...newSignal, title: e.target.value })}
                className="w-full rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-sm focus:border-gold/50 focus:ring-2 focus:ring-gold/20"
              />
              <textarea
                placeholder="Signal detail"
                value={newSignal.detail}
                onChange={(e) => setNewSignal({ ...newSignal, detail: e.target.value })}
                className="w-full rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-sm focus:border-gold/50 focus:ring-2 focus:ring-gold/20"
                rows={3}
              />
              <input
                type="text"
                placeholder="Target yield (e.g., 12-15%)"
                value={newSignal.targetYield}
                onChange={(e) => setNewSignal({ ...newSignal, targetYield: e.target.value })}
                className="w-full rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-sm focus:border-gold/50 focus:ring-2 focus:ring-gold/20"
              />
              <input
                type="text"
                placeholder="Window (e.g., Closes in 5 days)"
                value={newSignal.window}
                onChange={(e) => setNewSignal({ ...newSignal, window: e.target.value })}
                className="w-full rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-sm focus:border-gold/50 focus:ring-2 focus:ring-gold/20"
              />
              <select
                value={newSignal.urgency}
                onChange={(e) => setNewSignal({ ...newSignal, urgency: e.target.value as any })}
                className="w-full rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-sm focus:border-gold/50 focus:ring-2 focus:ring-gold/20"
              >
                <option value="New">New</option>
                <option value="Open">Open</option>
                <option value="Closing soon">Closing soon</option>
              </select>
              <Button
                className="w-full bg-gold hover:bg-gold/90"
                onClick={() => {
                  if (!newSignal.projectId || !newSignal.title || !newSignal.detail) {
                    toast({ title: 'Please fill all fields', variant: 'error' })
                    return
                  }
                  const signal = {
                    id: `sig-${Date.now()}`,
                    ...newSignal,
                  }
                  setSignals([...signals, signal])
                  setNewSignal({ projectId: '', title: '', detail: '', targetYield: '', urgency: 'New', window: '' })
                  toast({ title: 'Signal created', variant: 'success' })
                }}
              >
                <Plus className="size-4 mr-2" /> Create Signal
              </Button>
            </div>
          </Glass>

          <Glass className="space-y-3">
            <p className="font-semibold mb-2">Active signals ({signals.length})</p>
            {signals.map((signal) => (
              <div key={signal.id}>
                {editingSignal === signal.id ? (
                  <div className="space-y-2 rounded-lg border border-gold/30 bg-white/[0.03] p-3">
                    <input
                      defaultValue={signal.title}
                      onBlur={(e) => setSignals(signals.map((s) => s.id === signal.id ? { ...s, title: e.target.value } : s))}
                      className="w-full rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-sm"
                      placeholder="Signal title"
                    />
                    <textarea
                      defaultValue={signal.detail}
                      onBlur={(e) => setSignals(signals.map((s) => s.id === signal.id ? { ...s, detail: e.target.value } : s))}
                      className="w-full rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-sm"
                      rows={2}
                    />
                    <input
                      defaultValue={signal.targetYield}
                      onBlur={(e) => setSignals(signals.map((s) => s.id === signal.id ? { ...s, targetYield: e.target.value } : s))}
                      className="w-full rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-sm"
                      placeholder="Target yield"
                    />
                    <input
                      defaultValue={signal.window}
                      onBlur={(e) => setSignals(signals.map((s) => s.id === signal.id ? { ...s, window: e.target.value } : s))}
                      className="w-full rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-sm"
                      placeholder="Window (e.g. Closes in 5 days)"
                    />
                    <select
                      defaultValue={signal.urgency}
                      onChange={(e) => setSignals(signals.map((s) => s.id === signal.id ? { ...s, urgency: e.target.value as any } : s))}
                      className="w-full rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-sm"
                    >
                      <option value="New">New</option>
                      <option value="Open">Open</option>
                      <option value="Closing soon">Closing soon</option>
                    </select>
                    <Button
                      size="sm"
                      className="w-full bg-gold hover:bg-gold/90"
                      onClick={() => {
                        setEditingSignal(null)
                        toast({ title: 'Signal updated', variant: 'success' })
                      }}
                    >
                      <Save className="size-4 mr-2" /> Save changes
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-start justify-between rounded-lg bg-white/[0.03] p-3">
                    <div className="flex-1">
                      <p className="font-medium text-sm">{signal.title}</p>
                      <p className="text-xs text-muted-foreground mt-1">{signal.window}</p>
                      <div className="flex gap-2 mt-2">
                        <Pill tone="gold">{signal.targetYield}</Pill>
                        <Pill tone={signal.urgency === 'Closing soon' ? 'danger' : 'muted'}>{signal.urgency}</Pill>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setEditingSignal(signal.id)}
                        className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                      >
                        <Edit2 className="size-4 text-muted-foreground" />
                      </button>
                      <button
                        onClick={() => {
                          setSignals(signals.filter((s) => s.id !== signal.id))
                          toast({ title: 'Signal deleted', variant: 'success' })
                        }}
                        className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                      >
                        <Trash2 className="size-4 text-red-500/60" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </Glass>
        </div>
      )}

      {/* PROJECTS TAB */}
      {tab === 'projects' && (
        <div className="space-y-5">
          <Glass className="space-y-4 p-4">
            <p className="font-semibold">Create new project</p>
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Project name"
                value={newProject.name}
                onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                className="w-full rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-sm focus:border-gold/50 focus:ring-2 focus:ring-gold/20"
              />
              <input
                type="text"
                placeholder="Country"
                value={newProject.country}
                onChange={(e) => setNewProject({ ...newProject, country: e.target.value })}
                className="w-full rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-sm focus:border-gold/50 focus:ring-2 focus:ring-gold/20"
              />
              <select
                value={newProject.sector}
                onChange={(e) => setNewProject({ ...newProject, sector: e.target.value as any })}
                className="w-full rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-sm focus:border-gold/50 focus:ring-2 focus:ring-gold/20"
              >
                <option value="Renewable Energy">Renewable Energy</option>
                <option value="Mining Royalties">Mining Royalties</option>
                <option value="Agriculture">Agriculture</option>
                <option value="Infrastructure">Infrastructure</option>
              </select>
              <input
                type="text"
                placeholder="Target yield (e.g., 12-15%)"
                value={newProject.targetYield}
                onChange={(e) => setNewProject({ ...newProject, targetYield: e.target.value })}
                className="w-full rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-sm focus:border-gold/50 focus:ring-2 focus:ring-gold/20"
              />
              <input
                type="number"
                placeholder="Funding goal ($)"
                value={newProject.goal || ''}
                onChange={(e) => setNewProject({ ...newProject, goal: Number(e.target.value) })}
                className="w-full rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-sm focus:border-gold/50 focus:ring-2 focus:ring-gold/20"
              />
              <select
                value={newProject.risk}
                onChange={(e) => setNewProject({ ...newProject, risk: e.target.value as any })}
                className="w-full rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-sm focus:border-gold/50 focus:ring-2 focus:ring-gold/20"
              >
                <option value="Lower">Lower risk</option>
                <option value="Moderate">Moderate risk</option>
                <option value="Higher">Higher risk</option>
              </select>
              <textarea
                placeholder="Project summary"
                value={newProject.summary}
                onChange={(e) => setNewProject({ ...newProject, summary: e.target.value })}
                className="w-full rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-sm focus:border-gold/50 focus:ring-2 focus:ring-gold/20"
                rows={3}
              />
              <Button
                className="w-full bg-gold hover:bg-gold/90"
                onClick={() => {
                  if (!newProject.name || !newProject.country || !newProject.goal) {
                    toast({ title: 'Please fill all required fields', variant: 'error' })
                    return
                  }
                  const project = {
                    id: `proj-${Date.now()}`,
                    ...newProject,
                    funded: 0,
                  }
                  setProjects([...projects, project])
                  setNewProject({ name: '', country: '', sector: 'Renewable Energy', targetYield: '', goal: 0, risk: 'Moderate', summary: '' })
                  toast({ title: 'Project created', variant: 'success' })
                }}
              >
                <Plus className="size-4 mr-2" /> Create Project
              </Button>
            </div>
          </Glass>

          <Glass className="space-y-3">
            <p className="font-semibold mb-2">Active projects ({projects.length})</p>
            {projects.map((project) => (
              <div key={project.id}>
                {editingProject === project.id ? (
                  <div className="space-y-2 rounded-lg border border-gold/30 bg-white/[0.03] p-3">
                    <input
                      defaultValue={project.name}
                      onBlur={(e) => setProjects(projects.map((p) => p.id === project.id ? { ...p, name: e.target.value } : p))}
                      className="w-full rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-sm"
                      placeholder="Project name"
                    />
                    <input
                      defaultValue={project.country}
                      onBlur={(e) => setProjects(projects.map((p) => p.id === project.id ? { ...p, country: e.target.value } : p))}
                      className="w-full rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-sm"
                      placeholder="Country"
                    />
                    <input
                      defaultValue={project.targetYield}
                      onBlur={(e) => setProjects(projects.map((p) => p.id === project.id ? { ...p, targetYield: e.target.value } : p))}
                      className="w-full rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-sm"
                      placeholder="Target yield"
                    />
                    <select
                      defaultValue={project.risk}
                      onChange={(e) => setProjects(projects.map((p) => p.id === project.id ? { ...p, risk: e.target.value as any } : p))}
                      className="w-full rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-sm"
                    >
                      <option value="Lower">Lower risk</option>
                      <option value="Moderate">Moderate risk</option>
                      <option value="Higher">Higher risk</option>
                    </select>
                    <textarea
                      defaultValue={project.summary}
                      onBlur={(e) => setProjects(projects.map((p) => p.id === project.id ? { ...p, summary: e.target.value } : p))}
                      className="w-full rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-sm"
                      rows={2}
                      placeholder="Summary"
                    />
                    <Button
                      size="sm"
                      className="w-full bg-gold hover:bg-gold/90"
                      onClick={() => {
                        setEditingProject(null)
                        toast({ title: 'Project updated', variant: 'success' })
                      }}
                    >
                      <Save className="size-4 mr-2" /> Save changes
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-start justify-between rounded-lg bg-white/[0.03] p-3">
                    <div className="flex-1">
                      <p className="font-medium text-sm">{project.name}</p>
                      <p className="text-xs text-muted-foreground mt-1">{project.country} · {project.sector}</p>
                      <p className="text-xs text-muted-foreground mt-1">{project.summary.substring(0, 60)}...</p>
                      <div className="flex gap-2 mt-2">
                        <Pill tone="gold">{project.targetYield}</Pill>
                        <Pill tone={project.risk === 'Lower' ? 'green' : project.risk === 'Higher' ? 'danger' : 'muted'}>{project.risk} risk</Pill>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setEditingProject(project.id)}
                        className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                      >
                        <Edit2 className="size-4 text-muted-foreground" />
                      </button>
                      <button
                        onClick={() => {
                          setProjects(projects.filter((p) => p.id !== project.id))
                          toast({ title: 'Project deleted', variant: 'success' })
                        }}
                        className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                      >
                        <Trash2 className="size-4 text-red-500/60" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </Glass>
        </div>
      )}

      {/* PAYMENTS TAB */}
      {tab === 'payments' && (
        <Glass className="animate-rise">
          <p className="mb-3 text-sm font-semibold">Payment approval queue</p>
          {pending.length === 0 ? (
            <p className="text-sm text-muted-foreground">No pending payments.</p>
          ) : (
            <div className="space-y-2">
              {pending.map((t) => (
                <div key={t.id} className="flex items-center justify-between rounded-2xl bg-white/[0.03] p-3">
                  <div>
                    <p className="text-sm font-medium">{t.label}</p>
                    <p className="text-xs text-muted-foreground">${money(t.amount)} · {new Date(t.date).toLocaleString()}</p>
                  </div>
                  <Button
                    size="sm"
                    className="bg-green font-semibold text-background hover:bg-green/90"
                    onClick={() => {
                      dispatch({ type: 'APPROVE_TXN', id: t.id })
                      toast({ title: 'Payment approved', description: `$${money(t.amount)} processed.`, variant: 'success' })
                    }}
                  >
                    <Check className="size-4" /> Approve
                  </Button>
                </div>
              ))}
            </div>
          )}
        </Glass>
      )}
    </div>
  )
}
