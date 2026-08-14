'use client'

import React, { useState, useEffect, useCallback, useTransition } from 'react'
import {
  Activity,
  UserPlus,
  Trash2,
  Users,
  Settings,
  FolderKanban,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowUpRight,
  ArrowDownLeft,
  CreditCard,
  ShieldCheck,
  TrendingUp,
  RefreshCw,
  AlertCircle,
  Briefcase,
  Radio,
  Plus
} from 'lucide-react'

// Server Actions import
import {
  getAdminSnapshot,
  reviewKyc,
  resetKyc,
  reviewDeposit,
  reviewWithdrawal,
  reviewP2PTransfer,
  reviewCardApplication,
  disburseYield,
  addAdminByEmail,
  appointAdminScope,
  assignManager,
  deleteUser,
  setProjectStatus,
  fetchProjects,
  fetchSignals,
  upsertSignal,
  deleteSignal,
  processProjectPayout,
  getTeamVolumeReport
} from '@/app/actions/admin' // Adjust path if needed

import type { AdminSnapshot } from '@/lib/pulse/types'
import type { Project, Signal } from '@/lib/pulse/pulse-data'

export type AdminScope = 'full' | 'finance' | 'operations' | 'manager' | 'director'
export type UrgencyLevel = 'Open' | 'Standard' | 'New' | 'Closing soon'

// ==========================================
// UI HELPER COMPONENTS
// ==========================================

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
  tone?: 'green' | 'gold' | 'muted' | 'red' | 'blue'
}) {
  const tones = {
    green: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    gold: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    muted: 'bg-white/5 text-muted-foreground border-white/10',
    red: 'bg-red-500/10 text-red-400 border-red-500/20',
    blue: 'bg-sky-500/10 text-sky-400 border-sky-500/20'
  }

  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${tones[tone]}`}>
      {children}
    </span>
  )
}

function Button({
  children,
  variant = 'default',
  size = 'md',
  className = '',
  disabled,
  onClick,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'default' | 'outline' | 'ghost' | 'destructive' | 'success'
  size?: 'sm' | 'md' | 'lg'
}) {
  const base =
    'inline-flex items-center justify-center rounded-xl font-medium transition-colors focus:outline-none disabled:opacity-50 disabled:pointer-events-none'
  const variants = {
    default: 'bg-primary text-primary-foreground hover:bg-primary/90',
    outline: 'border border-white/10 bg-transparent hover:bg-white/5',
    ghost: 'hover:bg-white/5 text-muted-foreground hover:text-foreground',
    destructive: 'bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/30',
    success: 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 border border-emerald-500/30'
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

const formatMoney = (val: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val)

// ==========================================
// MAIN ADMIN VIEW
// ==========================================

export function AdminView() {
  const [isPending, startTransition] = useTransition()
  
  // App Data State
  const [snapshot, setSnapshot] = useState<AdminSnapshot | null>(null)
  const [projects, setProjects] = useState<Project[]>([])
  const [signals, setSignals] = useState<Signal[]>([])
  const [teamReport, setTeamReport] = useState<{
    scope: 'manager' | 'director'
    rows: { userId: string; name: string | null; email: string | null; kycVerified: boolean; investedVolume: number }[]
  } | null>(null)

  // Status & Feedback
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)

  // Separate Active Navigation Tabs
  const [activeTab, setActiveTab] = useState<
    'overview' | 'approvals' | 'projects' | 'signals' | 'users' | 'team' | 'settings'
  >('overview')

  // Local Form / Draft States
  const [deadlineDraft, setDeadlineDraft] = useState<Record<string, string>>({})
  const [managerIdDraft, setManagerIdDraft] = useState<Record<string, string>>({})
  const [yieldDisburseAmount, setYieldDisburseAmount] = useState<Record<string, string>>({})
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
  const [newAdminEmail, setNewAdminEmail] = useState('')
  const [newAdminScope, setNewAdminScope] = useState<AdminScope>('operations')

  // Signal Creation Form State
  const [newSignal, setNewSignal] = useState<Partial<Signal>>({
    id: '',
    projectId: '',
    title: '',
    window: '',
    detail: '',
    targetYield: '',
    urgency: 'Standard'
  })

  // Notification Banner Handler
  const showNotice = (msg: string, isErr = false) => {
    if (isErr) {
      setError(msg)
      setTimeout(() => setError(null), 5000)
    } else {
      setNotice(msg)
      setTimeout(() => setNotice(null), 4000)
    }
  }

  // Load Main Data
  const loadSnapshot = useCallback(() => {
    startTransition(async () => {
      const res = await getAdminSnapshot()
      if (res.ok) {
        setSnapshot(res.snapshot)
      } else {
        setError(res.error)
      }
    })
  }, [])

  const loadProjectsAndSignalsData = useCallback(() => {
    startTransition(async () => {
      const [projRes, sigRes] = await Promise.all([fetchProjects(), fetchSignals()])
      if (projRes.ok && projRes.projects) setProjects(projRes.projects)
      if (sigRes.ok && sigRes.signals) setSignals(sigRes.signals)
    })
  }, [])

  const loadTeamData = useCallback(() => {
    startTransition(async () => {
      const res = await getTeamVolumeReport()
      if (res.ok && 'rows' in res) {
        setTeamReport({ scope: res.scope, rows: res.rows })
      }
    })
  }, [])

  useEffect(() => {
    loadSnapshot()
    loadProjectsAndSignalsData()
    loadTeamData()
  }, [loadSnapshot, loadProjectsAndSignalsData, loadTeamData])

  // Action Helpers
  const handleAction = async (actionCall: () => Promise<{ ok: boolean; error?: string } | AdminResult>) => {
    startTransition(async () => {
      const res = await actionCall()
      if ('ok' in res && res.ok) {
        showNotice('Action completed successfully')
        if ('snapshot' in res && res.snapshot) {
          setSnapshot(res.snapshot)
        } else {
          loadSnapshot()
        }
        loadProjectsAndSignalsData()
      } else {
        showNotice(('error' in res && res.error) || 'Action failed', true)
      }
    })
  }

  if (!snapshot && isPending) {
    return (
      <div className="flex h-64 w-full items-center justify-center text-muted-foreground">
        <RefreshCw className="size-6 animate-spin mr-2" /> Loading Admin Dashboard...
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-4 sm:p-6 text-foreground">
      {/* Top Bar / Global Status */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Admin Console</h1>
          <p className="text-xs text-muted-foreground">Manage platform operations, users, queue, projects, and signals.</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          disabled={isPending}
          onClick={() => {
            loadSnapshot()
            loadProjectsAndSignalsData()
            loadTeamData()
          }}
        >
          <RefreshCw className={`size-3.5 mr-1.5 ${isPending ? 'animate-spin' : ''}`} /> Refresh Data
        </Button>
      </div>

      {/* Alert Notices */}
      {error && (
        <div className="flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-400">
          <AlertCircle className="size-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}
      {notice && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3 text-sm text-emerald-400">
          <CheckCircle2 className="size-4 shrink-0" />
          <span>{notice}</span>
        </div>
      )}

      {/* Navigation Tabs (Distinct Projects & Signals tabs) */}
      <div className="flex overflow-x-auto border-b border-white/10 pb-2 gap-2">
        <Button
          variant={activeTab === 'overview' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('overview')}
        >
          <Activity className="size-4 mr-1.5" /> Overview
        </Button>
        <Button
          variant={activeTab === 'approvals' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('approvals')}
          className="relative"
        >
          <Clock className="size-4 mr-1.5" /> Approvals Queue
          {snapshot &&
            snapshot.pendingKyc +
              snapshot.pendingDeposits +
              snapshot.pendingWithdrawals +
              snapshot.pendingP2P +
              snapshot.pendingCards >
              0 && (
              <span className="ml-2 rounded-full bg-amber-500/20 px-2 py-0.5 text-[10px] font-bold text-amber-400 border border-amber-500/30">
                {snapshot.pendingKyc +
                  snapshot.pendingDeposits +
                  snapshot.pendingWithdrawals +
                  snapshot.pendingP2P +
                  snapshot.pendingCards}
              </span>
            )}
        </Button>
        <Button
          variant={activeTab === 'projects' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('projects')}
        >
          <FolderKanban className="size-4 mr-1.5" /> Projects ({projects.length})
        </Button>
        <Button
          variant={activeTab === 'signals' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('signals')}
        >
          <Radio className="size-4 mr-1.5 text-amber-400" /> Signals ({signals.length})
        </Button>
        <Button
          variant={activeTab === 'users' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('users')}
        >
          <Users className="size-4 mr-1.5" /> Users ({snapshot?.userCount ?? 0})
        </Button>
        <Button
          variant={activeTab === 'team' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('team')}
        >
          <Briefcase className="size-4 mr-1.5" /> Team Volume
        </Button>
        <Button
          variant={activeTab === 'settings' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('settings')}
        >
          <Settings className="size-4 mr-1.5" /> Scope & Admins
        </Button>
      </div>

      {/* ==========================================
          TAB 1: OVERVIEW METRICS
          ========================================== */}
      {activeTab === 'overview' && snapshot && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Glass>
              <span className="text-xs text-muted-foreground">Total Deposits</span>
              <p className="mt-1 text-2xl font-bold">{formatMoney(snapshot.totalDeposits)}</p>
            </Glass>
            <Glass>
              <span className="text-xs text-muted-foreground">Total Invested</span>
              <p className="mt-1 text-2xl font-bold">{formatMoney(snapshot.totalInvested)}</p>
            </Glass>
            <Glass>
              <span className="text-xs text-muted-foreground">Total Staked</span>
              <p className="mt-1 text-2xl font-bold">{formatMoney(snapshot.totalStaked)}</p>
            </Glass>
            <Glass>
              <span className="text-xs text-muted-foreground">Total Users</span>
              <p className="mt-1 text-2xl font-bold">{snapshot.userCount}</p>
            </Glass>
          </div>

          <Glass className="space-y-4">
            <h2 className="text-base font-semibold">Recent Transactions Log</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-white/10 text-muted-foreground">
                    <th className="p-2">User Email</th>
                    <th className="p-2">Type</th>
                    <th className="p-2">Amount</th>
                    <th className="p-2">Status</th>
                    <th className="p-2">Reference</th>
                    <th className="p-2">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {snapshot.recentTxns.map((tx) => (
                    <tr key={tx.id}>
                      <td className="p-2 font-mono">{tx.email ?? tx.userId}</td>
                      <td className="p-2 uppercase">{tx.type}</td>
                      <td className="p-2 font-semibold">{formatMoney(tx.amount)}</td>
                      <td className="p-2">
                        <Pill
                          tone={
                            tx.status === 'completed'
                              ? 'green'
                              : tx.status === 'pending'
                              ? 'gold'
                              : 'red'
                          }
                        >
                          {tx.status}
                        </Pill>
                      </td>
                      <td className="p-2 font-mono text-[10px] text-muted-foreground">{tx.reference ?? '-'}</td>
                      <td className="p-2 text-muted-foreground">
                        {new Date(tx.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Glass>
        </div>
      )}

      {/* ==========================================
          TAB 2: APPROVAL QUEUE
          ========================================== */}
      {activeTab === 'approvals' && snapshot && (
        <div className="space-y-6">
          {/* KYC Approvals */}
          <Glass className="space-y-3">
            <h3 className="font-semibold text-sm flex items-center gap-2">
              <ShieldCheck className="size-4 text-amber-400" /> Pending KYC Approvals ({snapshot.pendingKyc})
            </h3>
            {snapshot.kycQueue.length === 0 ? (
              <p className="text-xs text-muted-foreground py-2">No pending KYC submissions.</p>
            ) : (
              <div className="divide-y divide-white/5">
                {snapshot.kycQueue.map((k) => (
                  <div key={k.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                    <div className="space-y-0.5">
                      <p className="text-sm font-medium">{k.fullName}</p>
                      <p className="text-xs text-muted-foreground">{k.email} | ID: {k.idNumber}</p>
                      <p className="text-[10px] text-muted-foreground">
                        DOB: {k.dateOfBirth} | Country: {k.country}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="success"
                        disabled={isPending}
                        onClick={() => handleAction(() => reviewKyc(k.id, 'approved'))}
                      >
                        <CheckCircle2 className="size-3.5 mr-1" /> Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        disabled={isPending}
                        onClick={() => handleAction(() => reviewKyc(k.id, 'rejected'))}
                      >
                        <XCircle className="size-3.5 mr-1" /> Reject
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Glass>

          {/* Pending Deposits */}
          <Glass className="space-y-3">
            <h3 className="font-semibold text-sm flex items-center gap-2">
              <ArrowDownLeft className="size-4 text-emerald-400" /> Pending Deposits ({snapshot.pendingDeposits})
            </h3>
            {snapshot.depositQueue.length === 0 ? (
              <p className="text-xs text-muted-foreground py-2">No pending deposits.</p>
            ) : (
              <div className="divide-y divide-white/5">
                {snapshot.depositQueue.map((d) => (
                  <div key={d.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                    <div>
                      <p className="text-sm font-semibold">{formatMoney(d.amount)} <span className="text-xs text-muted-foreground">({d.currency})</span></p>
                      <p className="text-xs text-muted-foreground">{d.email}</p>
                      <p className="text-[10px] text-muted-foreground font-mono">Ref: {d.reference}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="success"
                        disabled={isPending}
                        onClick={() => handleAction(() => reviewDeposit(d.id, 'approved'))}
                      >
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        disabled={isPending}
                        onClick={() => handleAction(() => reviewDeposit(d.id, 'rejected'))}
                      >
                        Reject
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Glass>

          {/* Pending Withdrawals */}
          <Glass className="space-y-3">
            <h3 className="font-semibold text-sm flex items-center gap-2">
              <ArrowUpRight className="size-4 text-red-400" /> Pending Withdrawals ({snapshot.pendingWithdrawals})
            </h3>
            {snapshot.withdrawalQueue.length === 0 ? (
              <p className="text-xs text-muted-foreground py-2">No pending withdrawals.</p>
            ) : (
              <div className="divide-y divide-white/5">
                {snapshot.withdrawalQueue.map((w) => (
                  <div key={w.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                    <div>
                      <p className="text-sm font-semibold">{formatMoney(w.amount)}</p>
                      <p className="text-xs text-muted-foreground">{w.email}</p>
                      <p className="text-[10px] text-muted-foreground font-mono">
                        Dest: {w.destinationAddress ?? 'N/A'} ({w.network ?? 'Standard'})
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="success"
                        disabled={isPending}
                        onClick={() => handleAction(() => reviewWithdrawal(w.id, 'approved'))}
                      >
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        disabled={isPending}
                        onClick={() => handleAction(() => reviewWithdrawal(w.id, 'rejected'))}
                      >
                        Reject
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Glass>

          {/* Pending P2P Transfers */}
          <Glass className="space-y-3">
            <h3 className="font-semibold text-sm flex items-center gap-2">
              <TrendingUp className="size-4 text-sky-400" /> Pending P2P Transfers ({snapshot.pendingP2P})
            </h3>
            {snapshot.p2pQueue.length === 0 ? (
              <p className="text-xs text-muted-foreground py-2">No pending transfers.</p>
            ) : (
              <div className="divide-y divide-white/5">
                {snapshot.p2pQueue.map((p) => (
                  <div key={p.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                    <div>
                      <p className="text-sm font-semibold">{formatMoney(p.amount)}</p>
                      <p className="text-xs text-muted-foreground">From: {p.senderEmail} → To: {p.recipientEmail}</p>
                      {p.note && <p className="text-[10px] text-muted-foreground">Note: {p.note}</p>}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="success"
                        disabled={isPending}
                        onClick={() => handleAction(() => reviewP2PTransfer(p.id, 'approved'))}
                      >
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        disabled={isPending}
                        onClick={() => handleAction(() => reviewP2PTransfer(p.id, 'rejected'))}
                      >
                        Reject
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Glass>

          {/* Pending Cards */}
          <Glass className="space-y-3">
            <h3 className="font-semibold text-sm flex items-center gap-2">
              <CreditCard className="size-4 text-purple-400" /> Pending Card Applications ({snapshot.pendingCards})
            </h3>
            {snapshot.cardQueue.length === 0 ? (
              <p className="text-xs text-muted-foreground py-2">No pending card applications.</p>
            ) : (
              <div className="divide-y divide-white/5">
                {snapshot.cardQueue.map((c) => (
                  <div key={c.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                    <div>
                      <p className="text-sm font-medium">{c.fullName ?? c.email}</p>
                      <p className="text-xs text-muted-foreground">Type: {c.cardType} | KYC: {c.kycStatus}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="success"
                        disabled={isPending}
                        onClick={() => handleAction(() => reviewCardApplication(c.id, 'approved'))}
                      >
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        disabled={isPending}
                        onClick={() => handleAction(() => reviewCardApplication(c.id, 'rejected'))}
                      >
                        Reject
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Glass>
        </div>
      )}

      {/* ==========================================
          TAB 3: PROJECTS MANAGEMENT ONLY
          ========================================== */}
      {activeTab === 'projects' && (
        <div className="space-y-4">
          {projects.length === 0 ? (
            <Glass>
              <p className="text-center text-xs text-muted-foreground py-4">No projects available.</p>
            </Glass>
          ) : (
            projects.map((p) => {
              const isClosed = p.status === 'Closed'

              return (
                <Glass key={p.id} className="space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <h3 className="font-semibold text-base">{p.name}</h3>
                      <p className="text-xs text-muted-foreground">
                        Sector: {p.sector} | Country: {p.country} | Target Yield: {p.targetYield}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Funded: {formatMoney(p.funded)} / Goal: {formatMoney(p.goal)}
                      </p>
                    </div>
                    <Pill tone={isClosed ? 'red' : 'green'}>{p.status ?? 'Open'}</Pill>
                  </div>

                  {/* Project Management Actions */}
                  <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-white/5">
                    <div className="flex items-center gap-1.5">
                      <label className="text-[10px] text-muted-foreground uppercase">Deadline:</label>
                      <input
                        type="date"
                        value={deadlineDraft[p.id] ?? p.deadline ?? ''}
                        onChange={(e) => setDeadlineDraft({ ...deadlineDraft, [p.id]: e.target.value })}
                        className="rounded-lg border border-white/10 bg-white/[0.04] px-2.5 py-1 text-xs outline-none focus:border-amber-400"
                      />
                    </div>

                    <Button
                      size="sm"
                      variant="outline"
                      disabled={isPending}
                      onClick={() =>
                        handleAction(() =>
                          setProjectStatus(p.id, isClosed, deadlineDraft[p.id] ?? p.deadline)
                        )
                      }
                    >
                      Update Deadline
                    </Button>

                    <Button
                      size="sm"
                      variant={isClosed ? 'success' : 'destructive'}
                      disabled={isPending}
                      onClick={() =>
                        handleAction(() =>
                          setProjectStatus(p.id, !isClosed, deadlineDraft[p.id] ?? p.deadline)
                        )
                      }
                    >
                      {isClosed ? 'Reopen Project' : 'Close Project'}
                    </Button>

                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-amber-400 hover:bg-amber-500/10 ml-auto"
                      disabled={isPending}
                      onClick={() => handleAction(() => processProjectPayout(p.id))}
                    >
                      Process 10% Yield Payout
                    </Button>
                  </div>
                </Glass>
              )
            })
          )}
        </div>
      )}

      {/* ==========================================
          TAB 4: SIGNALS MANAGEMENT ONLY
          ========================================== */}
      {activeTab === 'signals' && (
        <div className="space-y-6">
          {/* Create / Edit Signal Section */}
          <Glass className="space-y-4">
            <h3 className="font-semibold text-sm flex items-center gap-2">
              <Plus className="size-4 text-amber-400" /> Create / Broadcast New Signal
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <div>
                <label className="text-[10px] text-muted-foreground uppercase block mb-1">Signal ID</label>
                <input
                  type="text"
                  placeholder="e.g. sig-energy-01"
                  value={newSignal.id ?? ''}
                  onChange={(e) => setNewSignal({ ...newSignal, id: e.target.value })}
                  className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-xs outline-none focus:border-amber-400"
                />
              </div>
              <div>
                <label className="text-[10px] text-muted-foreground uppercase block mb-1">Associated Project ID</label>
                <select
                  value={newSignal.projectId ?? ''}
                  onChange={(e) => setNewSignal({ ...newSignal, projectId: e.target.value })}
                  className="w-full rounded-xl border border-white/10 bg-neutral-900 px-3 py-2 text-xs outline-none focus:border-amber-400"
                >
                  <option value="">Select a Project...</option>
                  {projects.map((proj) => (
                    <option key={proj.id} value={proj.id}>
                      {proj.name} ({proj.id})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-[10px] text-muted-foreground uppercase block mb-1">Signal Title</label>
                <input
                  type="text"
                  placeholder="e.g. Solar Yield Surge"
                  value={newSignal.title ?? ''}
                  onChange={(e) => setNewSignal({ ...newSignal, title: e.target.value })}
                  className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-xs outline-none focus:border-amber-400"
                />
              </div>
              <div>
                <label className="text-[10px] text-muted-foreground uppercase block mb-1">Urgency</label>
                <select
                  value={newSignal.urgency ?? 'Standard'}
                  onChange={(e) => setNewSignal({ ...newSignal, urgency: e.target.value as UrgencyLevel })}
                  className="w-full rounded-xl border border-white/10 bg-neutral-900 px-3 py-2 text-xs outline-none focus:border-amber-400"
                >
                  <option value="Open">Open</option>
                  <option value="Standard">Standard</option>
                  <option value="New">New</option>
                  <option value="Closing soon">Closing soon</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] text-muted-foreground uppercase block mb-1">Window Label</label>
                <input
                  type="text"
                  placeholder="e.g. 72h Left"
                  value={newSignal.window ?? ''}
                  onChange={(e) => setNewSignal({ ...newSignal, window: e.target.value })}
                  className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-xs outline-none focus:border-amber-400"
                />
              </div>
              <div>
                <label className="text-[10px] text-muted-foreground uppercase block mb-1">Target Yield</label>
                <input
                  type="text"
                  placeholder="e.g. 14.5% APY"
                  value={newSignal.targetYield ?? ''}
                  onChange={(e) => setNewSignal({ ...newSignal, targetYield: e.target.value })}
                  className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-xs outline-none focus:border-amber-400"
                />
              </div>
            </div>
            <div>
              <label className="text-[10px] text-muted-foreground uppercase block mb-1">Detail / Explanation</label>
              <textarea
                placeholder="Details on why this signal is broadcasting..."
                value={newSignal.detail ?? ''}
                onChange={(e) => setNewSignal({ ...newSignal, detail: e.target.value })}
                className="w-full rounded-xl border border-white/10 bg-white/[0.04] p-3 text-xs outline-none focus:border-amber-400 h-20"
              />
            </div>
            <Button
              disabled={isPending || !newSignal.id || !newSignal.projectId || !newSignal.title}
              onClick={() =>
                handleAction(() =>
                  upsertSignal({
                    id: newSignal.id!,
                    projectId: newSignal.projectId!,
                    title: newSignal.title!,
                    window: newSignal.window ?? 'Active',
                    detail: newSignal.detail ?? '',
                    targetYield: newSignal.targetYield ?? '10%',
                    urgency: (newSignal.urgency as UrgencyLevel) ?? 'Standard'
                  })
                )
              }
            >
              Broadcast Signal
            </Button>
          </Glass>

          {/* Active Signals List */}
          <Glass className="space-y-4">
            <h3 className="font-semibold text-sm flex items-center gap-2">
              <Radio className="size-4 text-amber-400" /> Active Broadcast Signals
            </h3>
            {signals.length === 0 ? (
              <p className="text-xs text-muted-foreground py-2">No active broadcast signals.</p>
            ) : (
              <div className="space-y-3">
                {signals.map((sig) => (
                  <div key={sig.id} className="rounded-xl bg-black/20 p-4 border border-white/5 space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <p className="font-semibold text-sm">{sig.title}</p>
                        <p className="text-xs text-muted-foreground font-mono">
                          Signal ID: {sig.id} | Project ID: {sig.projectId}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Pill tone={sig.urgency === 'Closing soon' ? 'red' : 'gold'}>{sig.urgency}</Pill>
                        <Button
                          size="sm"
                          variant="destructive"
                          disabled={isPending}
                          onClick={() => handleAction(() => deleteSignal(sig.id))}
                        >
                          <Trash2 className="size-3.5" />
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-white/5">
                      <div>
                        <label className="text-[10px] text-muted-foreground uppercase block mb-1">Urgency</label>
                        <select
                          value={sig.urgency}
                          onChange={(e) =>
                            handleAction(() =>
                              upsertSignal({ ...sig, urgency: e.target.value as UrgencyLevel })
                            )
                          }
                          className="w-full rounded-lg border border-white/10 bg-neutral-900 px-2.5 py-1 text-xs outline-none focus:border-amber-400"
                        >
                          <option value="Open">Open</option>
                          <option value="Standard">Standard</option>
                          <option value="New">New</option>
                          <option value="Closing soon">Closing soon</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-[10px] text-muted-foreground uppercase block mb-1">Window Label</label>
                        <input
                          type="text"
                          defaultValue={sig.window}
                          onBlur={(e) =>
                            handleAction(() =>
                              upsertSignal({ ...sig, window: e.target.value })
                            )
                          }
                          className="w-full rounded-lg border border-white/10 bg-white/[0.04] px-2.5 py-1 text-xs outline-none focus:border-amber-400"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-muted-foreground uppercase block mb-1">Target Yield</label>
                        <input
                          type="text"
                          defaultValue={sig.targetYield}
                          onBlur={(e) =>
                            handleAction(() =>
                              upsertSignal({ ...sig, targetYield: e.target.value })
                            )
                          }
                          className="w-full rounded-lg border border-white/10 bg-white/[0.04] px-2.5 py-1 text-xs outline-none focus:border-amber-400"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Glass>
        </div>
      )}

      {/* ==========================================
          TAB 5: USERS MANAGEMENT
          ========================================== */}
      {activeTab === 'users' && snapshot && (
        <div className="space-y-3">
          {snapshot.users.map((u) => (
            <Glass key={u.id} className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="font-semibold text-sm">{u.fullName ?? u.email ?? 'Unidentified User'}</p>
                  <p className="font-mono text-xs text-muted-foreground">{u.id} | {u.email}</p>
                </div>
                <div className="flex items-center gap-2">
                  {u.isAdmin && <Pill tone="blue">Admin ({u.adminScope ?? 'full'})</Pill>}
                  <Pill tone={u.kycStatus === 'verified' ? 'green' : u.kycStatus === 'pending' ? 'gold' : 'muted'}>
                    KYC: {u.kycStatus}
                  </Pill>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="rounded-lg bg-black/20 p-2 border border-white/5">
                  <span className="text-muted-foreground block text-[10px]">Cash Balance</span>
                  <span className="font-semibold">{formatMoney(u.cash)}</span>
                </div>
                <div className="rounded-lg bg-black/20 p-2 border border-white/5">
                  <span className="text-muted-foreground block text-[10px]">Invested</span>
                  <span className="font-semibold">{formatMoney(u.invested)}</span>
                </div>
                <div className="rounded-lg bg-black/20 p-2 border border-white/5">
                  <span className="text-muted-foreground block text-[10px]">Manager ID</span>
                  <span className="font-mono text-[11px] truncate block">{u.managerId ?? 'None'}</span>
                </div>
              </div>

              {/* User Action Controls */}
              <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-white/5">
                {/* Disburse Manual Yield */}
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    placeholder="Amount $"
                    value={yieldDisburseAmount[u.id] ?? ''}
                    onChange={(e) => setYieldDisburseAmount({ ...yieldDisburseAmount, [u.id]: e.target.value })}
                    className="w-24 rounded-lg border border-white/10 bg-white/[0.04] px-2 py-1 text-xs outline-none"
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={isPending || !yieldDisburseAmount[u.id]}
                    onClick={() =>
                      handleAction(() =>
                        disburseYield(u.id, Number(yieldDisburseAmount[u.id]))
                      )
                    }
                  >
                    Disburse Yield
                  </Button>
                </div>

                {/* Assign Manager */}
                <div className="flex items-center gap-1">
                  <input
                    type="text"
                    placeholder="Manager UUID"
                    value={managerIdDraft[u.id] ?? ''}
                    onChange={(e) => setManagerIdDraft({ ...managerIdDraft, [u.id]: e.target.value })}
                    className="w-28 rounded-lg border border-white/10 bg-white/[0.04] px-2 py-1 text-xs outline-none font-mono"
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={isPending || !managerIdDraft[u.id]}
                    onClick={() =>
                      handleAction(() => assignManager(u.id, managerIdDraft[u.id]))
                    }
                  >
                    Assign Mgr
                  </Button>
                </div>

                <Button
                  size="sm"
                  variant="ghost"
                  disabled={isPending}
                  onClick={() => handleAction(() => resetKyc(u.id))}
                >
                  Reset KYC
                </Button>

                {confirmDeleteId === u.id ? (
                  <div className="flex items-center gap-1 ml-auto">
                    <Button
                      size="sm"
                      variant="destructive"
                      disabled={isPending}
                      onClick={() => handleAction(() => deleteUser(u.id))}
                    >
                      Confirm Delete
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => setConfirmDeleteId(null)}>
                      Cancel
                    </Button>
                  </div>
                ) : (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-red-400 hover:bg-red-500/10 ml-auto"
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

      {/* ==========================================
          TAB 6: TEAM VOLUME REPORT
          ========================================== */}
      {activeTab === 'team' && (
        <Glass className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-sm">
              Team Volume Report ({teamReport?.scope === 'director' ? 'Director View' : 'Manager View'})
            </h3>
          </div>
          {!teamReport || teamReport.rows.length === 0 ? (
            <p className="text-xs text-muted-foreground py-2">No managed users assigned under your view scope.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-white/10 text-muted-foreground">
                    <th className="p-2">Name / Email</th>
                    <th className="p-2">KYC Status</th>
                    <th className="p-2">Invested Volume</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {teamReport.rows.map((row) => (
                    <tr key={row.userId}>
                      <td className="p-2 font-medium">{row.name ?? row.email ?? row.userId}</td>
                      <td className="p-2">
                        <Pill tone={row.kycVerified ? 'green' : 'muted'}>
                          {row.kycVerified ? 'Verified' : 'Unverified'}
                        </Pill>
                      </td>
                      <td className="p-2 font-semibold">{formatMoney(row.investedVolume)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Glass>
      )}

      {/* ==========================================
          TAB 7: SETTINGS & SCOPE MANAGEMENT
          ========================================== */}
      {activeTab === 'settings' && (
        <div className="space-y-4">
          <Glass className="space-y-3">
            <h3 className="font-semibold text-sm">Add New Administrator</h3>
            <p className="text-xs text-muted-foreground">
              Add user email to the allowlist and set default privileges.
            </p>
            <div className="space-y-3 max-w-md">
              <input
                type="email"
                placeholder="admin@pulse.com"
                value={newAdminEmail}
                onChange={(e) => setNewAdminEmail(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-white/[0.04] p-2.5 text-xs outline-none focus:border-amber-400"
              />
              <select
                value={newAdminScope}
                onChange={(e) => setNewAdminScope(e.target.value as AdminScope)}
                className="w-full rounded-xl border border-white/10 bg-neutral-900 p-2.5 text-xs outline-none focus:border-amber-400"
              >
                <option value="operations">Operations (KYC, Users, Cards)</option>
                <option value="finance">Finance (Deposits, Withdrawals, Payouts)</option>
                <option value="manager">Manager</option>
                <option value="director">Director</option>
                <option value="full">Full Access</option>
              </select>
              <Button
                disabled={isPending || !newAdminEmail}
                onClick={() => handleAction(() => addAdminByEmail(newAdminEmail))}
              >
                <UserPlus className="size-3.5 mr-1.5" /> Appoint Admin
              </Button>
            </div>
          </Glass>

          {/* Active Admins list */}
          {snapshot && (
            <Glass className="space-y-3">
              <h3 className="font-semibold text-sm">Existing Administrator Privileges</h3>
              <div className="divide-y divide-white/5">
                {snapshot.users
                  .filter((u) => u.isAdmin)
                  .map((adm) => (
                    <div key={adm.id} className="flex items-center justify-between py-2">
                      <div>
                        <p className="text-xs font-semibold">{adm.email}</p>
                        <p className="text-[10px] text-muted-foreground font-mono">{adm.id}</p>
                      </div>
                      <select
                        value={adm.adminScope ?? 'full'}
                        disabled={isPending}
                        onChange={(e) =>
                          handleAction(() =>
                            appointAdminScope(adm.id, e.target.value as AdminScope)
                          )
                        }
                        className="rounded-lg border border-white/10 bg-neutral-900 px-2 py-1 text-xs outline-none"
                      >
                        <option value="operations">operations</option>
                        <option value="finance">finance</option>
                        <option value="manager">manager</option>
                        <option value="director">director</option>
                        <option value="full">full</option>
                      </select>
                    </div>
                  ))}
              </div>
            </Glass>
          )}
        </div>
      )}
    </div>
  )
}

export default AdminView
