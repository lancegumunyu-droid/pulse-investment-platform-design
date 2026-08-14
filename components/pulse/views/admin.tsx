import React, { useState, useEffect, useCallback } from 'react'
import {
  Activity,
  UserPlus,
  Trash2,
  Shield,
  Users,
  Settings,
  FolderKanban,
  CreditCard,
  ArrowUpRight,
  ArrowDownLeft,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Clock
} from 'lucide-react'

// ==========================================
// TYPES & INTERFACES
// ==========================================

export type UrgencyLevel = 'Open' | 'Standard' | 'New' | 'Closing soon'
export type AdminScopeType = 'operations' | 'finance' | 'full'
export type KycStatus = 'approved' | 'pending' | 'rejected' | 'none'

export interface ProjectStatus {
  closed: boolean
  deadlineOverride: string | null
}

export interface Project {
  id: string
  name: string
  status?: ProjectStatus
}

export interface Signal {
  projectId: string
  urgency: UrgencyLevel
  window: string
  target_yield: string
}

export interface User {
  id: string
  email: string | null
  kycStatus: KycStatus
  cash: number
  managerId: string | null
}

export interface Admin {
  id: string
  email: string
  scope: AdminScopeType
}

export interface SnapshotData {
  projects: Project[]
  signals: Record<string, Signal>
  users: User[]
  admins: Admin[]
}

// ==========================================
// UI AUXILIARY COMPONENTS
// ==========================================

function Button({
  children,
  variant = 'default',
  size = 'md',
  className = '',
  disabled,
  onClick,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'default' | 'outline' | 'ghost' | 'destructive'
  size?: 'sm' | 'md' | 'lg'
}) {
  const base = 'inline-flex items-center justify-center rounded-xl font-medium transition-colors focus:outline-none disabled:opacity-50 disabled:pointer-events-none'
  const variants = {
    default: 'bg-primary text-primary-foreground hover:bg-primary/90',
    outline: 'border border-white/10 bg-transparent hover:bg-white/5',
    ghost: 'hover:bg-white/5',
    destructive: 'bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/30'
  }
  const sizes = {
    sm: 'h-8 px-3 text-xs',
    md: 'h-10 px-4 text-sm',
    lg: 'h-11 px-6 text-base'
  }

  return (
    <button
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  )
}

function Glass({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl border border-white/10 bg-white/[0.02] p-4 backdrop-blur-md ${className}`}>
      {children}
    </div>
  )
}

function Pill({
  children,
  tone = 'muted'
}: {
  children: React.ReactNode
  tone?: 'green' | 'gold' | 'muted' | 'red'
}) {
  const tones = {
    green: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    gold: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    muted: 'bg-white/5 text-muted-foreground border-white/10',
    red: 'bg-red-500/10 text-red-400 border-red-500/20'
  }

  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${tones[tone]}`}>
      {children}
    </span>
  )
}

// Helper to format currency numbers safely
const money = (val: number) =>
  new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(val)

// Simple toast notification system mock
function useToast() {
  return {
    toast: ({ title, variant }: { title: string; variant?: string }) => {
      console.log(`[Toast ${variant ?? 'info'}]: ${title}`)
    }
  }
}

// ==========================================
// MAIN ADMIN PANEL COMPONENT
// ==========================================

export default function AdminDashboard() {
  const { toast } = useToast()

  // State Management
  const [activeTab, setActiveTab] = useState<'projects' | 'users' | 'settings'>('projects')
  const [busy, setBusy] = useState(false)
  
  // Form & Draft States
  const [deadlineDraft, setDeadlineDraft] = useState<Record<string, string>>({})
  const [managerIdDraft, setManagerIdDraft] = useState<Record<string, string>>({})
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
  const [newAdminEmail, setNewAdminEmail] = useState('')
  const [newAdminScope, setNewAdminScope] = useState<AdminScopeType>('operations')

  // Main Data Snapshot
  const [snap, setSnap] = useState<SnapshotData>({
    projects: [
      { id: 'proj-1', name: 'Alpha Arbitrage Vault', status: { closed: false, deadlineOverride: '2026-12-31' } },
      { id: 'proj-[2]', name: 'Yield Multiplier Pool', status: { closed: true, deadlineOverride: null } }
    ],
    signals: {
      'proj-1': { projectId: 'proj-1', urgency: 'Open', window: '24h', target_yield: '14.2% APY' },
      'proj-2': { projectId: 'proj-2', urgency: 'Closing soon', window: '2h', target_yield: '22.0% APY' }
    },
    users: [
      { id: 'usr-101', email: 'investor1@example.com', kycStatus: 'approved', cash: 45200.5, managerId: 'mgr-88' },
      { id: 'usr-102', email: 'trader2@example.com', kycStatus: 'pending', cash: 1200.0, managerId: null }
    ],
    admins: [
      { id: 'adm-01', email: 'root@admin.com', scope: 'full' },
      { id: 'adm-02', email: 'ops@admin.com', scope: 'operations' }
    ]
  })

  // Action Runner wrapper
  const act = async (fn: () => Promise<{ ok: boolean }>) => {
    setBusy(true)
    try {
      return await fn()
    } catch (err) {
      toast({ title: 'An error occurred during operation', variant: 'destructive' })
      return { ok: false }
    } finally {
      setBusy(false)
    }
  }

  // Reload handler mock
  const loadProjectsAndSignals = useCallback(async () => {
    // Re-fetch logic or snapshot refresh
  }, [])

  // Action Handlers
  const setProjectStatus = async (id: string, status: ProjectStatus) => {
    setSnap((prev) => ({
      ...prev,
      projects: prev.projects.map((p) => (p.id === id ? { ...p, status } : p))
    }))
    return { ok: true }
  }

  const processProjectPayout = async (id: string) => {
    return { ok: true }
  }

  const handleUpdateSignal = (id: string, update: Partial<Signal>) => {
    setSnap((prev) => ({
      ...prev,
      signals: {
        ...prev.signals,
        [id]: { ...prev.signals[id], ...update }
      }
    }))
    toast({ title: 'Signal updated', variant: 'success' })
  }

  const assignManager = async (userId: string, managerId: string) => {
    setSnap((prev) => ({
      ...prev,
      users: prev.users.map((u) => (u.id === userId ? { ...u, managerId } : u))
    }))
    return { ok: true }
  }

  const resetKyc = async (userId: string) => {
    setSnap((prev) => ({
      ...prev,
      users: prev.users.map((u) => (u.id === userId ? { ...u, kycStatus: 'none' } : u))
    }))
    return { ok: true }
  }

  const deleteUser = async (userId: string) => {
    setSnap((prev) => ({
      ...prev,
      users: prev.users.filter((u) => u.id !== userId)
    }))
    return { ok: true }
  }

  const addAdminByEmail = async (email: string, scope: AdminScopeType) => {
    const newAdmin: Admin = { id: `adm-${Date.now()}`, email, scope }
    setSnap((prev) => ({ ...prev, admins: [...prev.admins, newAdmin] }))
    return { ok: true }
  }

  const appointAdminScope = async (adminId: string, scope: AdminScopeType) => {
    setSnap((prev) => ({
      ...prev,
      admins: prev.admins.map((a) => (a.id === adminId ? { ...a, scope } : a))
    }))
    return { ok: true }
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-4 sm:p-6 text-foreground">
      {/* Header Tabs */}
      <div className="flex border-b border-white/10 pb-3 gap-2">
        <Button
          variant={activeTab === 'projects' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('projects')}
          className="flex items-center gap-2"
        >
          <FolderKanban className="size-4" /> Projects & Signals
        </Button>
        <Button
          variant={activeTab === 'users' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('users')}
          className="flex items-center gap-2"
        >
          <Users className="size-4" /> Users
        </Button>
        <Button
          variant={activeTab === 'settings' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('settings')}
          className="flex items-center gap-2"
        >
          <Settings className="size-4" /> Settings & Admins
        </Button>
      </div>

      {/* TAB: PROJECTS & SIGNALS */}
      {activeTab === 'projects' && (
        <div className="space-y-4 animate-rise">
          {snap.projects.length === 0 ? (
            <Glass>
              <p className="text-center text-sm text-muted-foreground">No active projects found.</p>
            </Glass>
          ) : (
            snap.projects.map((p) => {
              const status = p.status
              const isClosed = status?.closed ?? false
              const signal = snap.signals[p.id]

              return (
                <Glass key={p.id} className="space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <h3 className="font-semibold text-base">{p.name}</h3>
                      <p className="font-mono text-xs text-muted-foreground">{p.id}</p>
                    </div>
                    <Pill tone={isClosed ? 'red' : 'green'}>
                      {isClosed ? 'Closed' : 'Active'}
                    </Pill>
                  </div>

                  {/* Deadline & Control Inputs */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-white/5">
                    <div className="flex items-center gap-2">
                      <input
                        type="date"
                        value={deadlineDraft[p.id] ?? status?.deadlineOverride ?? ''}
                        onChange={(e) => setDeadlineDraft({ ...deadlineDraft, [p.id]: e.target.value })}
                        className="rounded-lg border border-white/10 bg-white/[0.04] px-2.5 py-1 text-xs outline-none focus:border-gold/50"
                      />
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs"
                        disabled={busy}
                        onClick={() =>
                          act(async () => {
                            const newDeadline = deadlineDraft[p.id] ?? status?.deadlineOverride ?? null
                            const res = await setProjectStatus(p.id, {
                              closed: isClosed,
                              deadlineOverride: newDeadline,
                            })
                            if (res.ok) {
                              toast({ title: 'Deadline updated', variant: 'success' })
                              loadProjectsAndSignals()
                            }
                            return res
                          })
                        }
                      >
                        Set Deadline
                      </Button>

                      <Button
                        size="sm"
                        variant={isClosed ? 'default' : 'destructive'}
                        className="text-xs"
                        disabled={busy}
                        onClick={() =>
                          act(async () => {
                            const res = await setProjectStatus(p.id, {
                              closed: !isClosed,
                              deadlineOverride: status?.deadlineOverride ?? null,
                            })
                            if (res.ok) {
                              toast({
                                title: `Project ${!isClosed ? 'closed' : 'reopened'}`,
                                variant: 'success',
                              })
                              loadProjectsAndSignals()
                            }
                            return res
                          })
                        }
                      >
                        {isClosed ? 'Reopen Project' : 'Close Project'}
                      </Button>

                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-xs text-gold hover:bg-gold/10"
                        disabled={busy}
                        onClick={() =>
                          act(async () => {
                            const res = await processProjectPayout(p.id)
                            if (res.ok) {
                              toast({ title: 'Batch payout triggered', variant: 'success' })
                            }
                            return res
                          })
                        }
                      >
                        Trigger Batch Payout
                      </Button>
                    </div>
                  </div>

                  {/* Live Signal Data Overrides */}
                  {signal && (
                    <div className="space-y-3 rounded-lg bg-black/20 p-3 border border-white/5">
                      <p className="text-xs font-medium text-gold flex items-center gap-1.5">
                        <Activity className="size-3.5" /> Signal Broadcast Parameters
                      </p>
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                        <div>
                          <span className="mb-1 block text-[10px] text-muted-foreground uppercase tracking-wider">Urgency</span>
                          <select
                            value={signal.urgency}
                            onChange={(e) =>
                              handleUpdateSignal(p.id, { urgency: e.target.value as UrgencyLevel })
                            }
                            className="w-full rounded-lg border border-white/10 bg-white/[0.04] px-2.5 py-1.5 text-xs outline-none focus:border-gold/50"
                          >
                            <option value="Open">Open</option>
                            <option value="Standard">Standard</option>
                            <option value="New">New</option>
                            <option value="Closing soon">Closing soon</option>
                          </select>
                        </div>

                        <div>
                          <span className="mb-1 block text-[10px] text-muted-foreground uppercase tracking-wider">Window</span>
                          <input
                            type="text"
                            defaultValue={signal.window}
                            onBlur={(e) => {
                              if (e.target.value !== signal.window) {
                                handleUpdateSignal(p.id, { window: e.target.value })
                              }
                            }}
                            className="w-full rounded-lg border border-white/10 bg-white/[0.04] px-2.5 py-1.5 text-xs outline-none focus:border-gold/50"
                          />
                        </div>

                        <div>
                          <span className="mb-1 block text-[10px] text-muted-foreground uppercase tracking-wider">Target Yield</span>
                          <input
                            type="text"
                            defaultValue={signal.target_yield}
                            onBlur={(e) => {
                              if (e.target.value !== signal.target_yield) {
                                handleUpdateSignal(p.id, { target_yield: e.target.value })
                              }
                            }}
                            className="w-full rounded-lg border border-white/10 bg-white/[0.04] px-2.5 py-1.5 text-xs outline-none focus:border-gold/50"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </Glass>
              )
            })
          )}
        </div>
      )}

      {/* TAB: USERS */}
      {activeTab === 'users' && (
        <div className="space-y-3 animate-rise">
          {snap.users.map((u) => (
            <Glass key={u.id} className="animate-rise space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-semibold text-sm">{u.email ?? 'No Email'}</p>
                  <p className="font-mono text-xs text-muted-foreground">{u.id}</p>
                </div>
                <Pill tone={u.kycStatus === 'approved' ? 'green' : u.kycStatus === 'pending' ? 'gold' : 'muted'}>
                  KYC: {u.kycStatus}
                </Pill>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="rounded-lg bg-black/20 p-2 border border-white/5">
                  <span className="text-muted-foreground block">Cash Balance</span>
                  <span className="font-mono font-semibold">${money(u.cash)}</span>
                </div>
                <div className="rounded-lg bg-black/20 p-2 border border-white/5">
                  <span className="text-muted-foreground block">Manager ID</span>
                  <span className="font-mono text-[11px] truncate block">{u.managerId ?? 'Unassigned'}</span>
                </div>
              </div>

              {/* Manager Assignment & Actions */}
              <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-white/5">
                <input
                  type="text"
                  placeholder="Manager UUID"
                  value={managerIdDraft[u.id] ?? ''}
                  onChange={(e) => setManagerIdDraft({ ...managerIdDraft, [u.id]: e.target.value })}
                  className="flex-1 min-w-[140px] rounded-lg border border-white/10 bg-white/[0.04] px-2.5 py-1 text-xs font-mono outline-none focus:border-gold/50"
                />
                <Button
                  size="sm"
                  variant="outline"
                  className="text-xs"
                  disabled={busy || !managerIdDraft[u.id]}
                  onClick={() =>
                    act(async () => {
                      const res = await assignManager(u.id, managerIdDraft[u.id])
                      if (res.ok) toast({ title: 'Manager assigned', variant: 'success' })
                      return res
                    })
                  }
                >
                  <UserPlus className="size-3 mr-1" /> Assign Manager
                </Button>

                <Button
                  size="sm"
                  variant="ghost"
                  className="text-xs text-muted-foreground hover:text-foreground"
                  disabled={busy}
                  onClick={() =>
                    act(async () => {
                      const res = await resetKyc(u.id)
                      if (res.ok) toast({ title: 'KYC status reset', variant: 'info' })
                      return res
                    })
                  }
                >
                  Reset KYC
                </Button>

                {confirmDeleteId === u.id ? (
                  <div className="flex items-center gap-1">
                    <Button
                      size="sm"
                      variant="destructive"
                      className="text-xs"
                      disabled={busy}
                      onClick={() =>
                        act(async () => {
                          const res = await deleteUser(u.id)
                          if (res.ok) {
                            toast({ title: 'User deleted', variant: 'destructive' })
                            setConfirmDeleteId(null)
                          }
                          return res
                        })
                      }
                    >
                      Confirm Delete
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-xs"
                      onClick={() => setConfirmDeleteId(null)}
                    >
                      Cancel
                    </Button>
                  </div>
                ) : (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-xs text-destructive hover:bg-destructive/10 hover:text-destructive ml-auto"
                    onClick={() => setConfirmDeleteId(u.id)}
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                )}
              </div>
            </Glass>
          ))}
        </div>
      )}

      {/* TAB: SETTINGS */}
      {activeTab === 'settings' && (
        <div className="space-y-4 animate-rise">
          {/* Add New Admin */}
          <Glass>
            <p className="mb-1 text-sm font-semibold">Grant Admin Access</p>
            <p className="mb-3 text-xs text-muted-foreground">
              Appoint a team member as an administrator and define their scope.
            </p>
            <div className="space-y-3">
              <div>
                <span className="mb-1 block text-xs font-medium text-muted-foreground">User Email</span>
                <input
                  type="email"
                  value={newAdminEmail}
                  onChange={(e) => setNewAdminEmail(e.target.value)}
                  placeholder="admin@example.com"
                  className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-2.5 text-sm outline-none focus:border-gold/50"
                />
              </div>
              <div>
                <span className="mb-1 block text-xs font-medium text-muted-foreground">Scope Privilege</span>
                <select
                  value={newAdminScope}
                  onChange={(e) => setNewAdminScope(e.target.value as AdminScopeType)}
                  className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2.5 text-sm outline-none focus:border-gold/50"
                >
                  <option value="operations">Operations (KYC, Cards, Users, Signals)</option>
                  <option value="finance">Finance (Deposits, Withdrawals, Transfers)</option>
                  <option value="full">Full Access (All system functions & settings)</option>
                </select>
              </div>
              <Button
                size="lg"
                className="h-11 w-full bg-gold font-semibold text-primary-foreground hover:bg-gold/90"
                disabled={!newAdminEmail || busy}
                onClick={() =>
                  act(async () => {
                    const res = await addAdminByEmail(newAdminEmail, newAdminScope)
                    if (res.ok) {
                      toast({ title: 'Admin appointed successfully', variant: 'success' })
                      setNewAdminEmail('')
                    }
                    return res
                  })
                }
              >
                <UserPlus className="size-4 mr-1.5" /> Appoint Admin
              </Button>
            </div>
          </Glass>

          {/* Active Administrators Management */}
          <Glass>
            <p className="mb-3 text-sm font-semibold">System Administrators</p>
            <div className="space-y-2">
              {snap.admins?.map((adm) => (
                <div key={adm.id} className="flex items-center justify-between rounded-lg bg-black/20 p-2.5 border border-white/5">
                  <div>
                    <p className="text-xs font-semibold">{adm.email}</p>
                    <p className="text-[10px] text-muted-foreground font-mono">{adm.id}</p>
                  </div>
                  <select
                    value={adm.scope}
                    disabled={busy}
                    onChange={(e) =>
                      act(async () => {
                        const newScope = e.target.value as AdminScopeType
                        const res = await appointAdminScope(adm.id, newScope)
                        if (res.ok) toast({ title: 'Scope updated', variant: 'success' })
                        return res
                      })
                    }
                    className="rounded-lg border border-white/10 bg-white/[0.04] px-2 py-1 text-xs outline-none focus:border-gold/50"
                  >
                    <option value="operations">operations</option>
                    <option value="finance">finance</option>
                    <option value="full">full</option>
                  </select>
                </div>
              ))}
            </div>
          </Glass>
        </div>
      )}
    </div>
  )
}
