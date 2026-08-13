'use client'

import { useCallback, useEffect, useState } from 'react'
import {
  Activity,
  BadgeCheck,
  Check,
  Coins,
  Lock,
  Radio,
  RotateCcw,
  ShieldCheck,
  Trash2,
  TriangleAlert,
  User,
  UserPlus,
  X,
} from 'lucide-react'
import { usePulse, money } from '../store'
import { Glass, Pill, SectionTitle, Stat } from '../ui-bits'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import {
  getAdminSnapshot,
  reviewKyc,
  reviewWithdrawal,
  reviewDeposit,
  reviewP2PTransfer,
  reviewCardApplication,
  assignManager,
  disburseYield,
  addAdminByEmail,
  appointAdminScope,
  resetKyc,
  deleteUser,
  getProjectAdminStatuses,
  setProjectStatus,
  processProjectPayout,
} from '@/app/actions/admin'
import type { AdminSnapshot } from '@/lib/pulse/types'
import { PROJECTS } from '@/lib/pulse-data'

type Tab =
  | 'overview'
  | 'kyc'
  | 'deposits'
  | 'withdrawals'
  | 'transfers'
  | 'cards'
  | 'users'
  | 'projects'
  | 'settings'

type AdminScopeType = 'full' | 'finance' | 'operations'
type UrgencyLevel = 'Closing soon' | 'New' | 'Standard' | 'Open'

interface SignalData {
  id: string
  project_id: string
  title: string
  urgency: UrgencyLevel
  window: string
  target_yield: string
}

export function AdminView() {
  const supabase = createClient()
  const { state, setView, toast } = usePulse()
  const [snap, setSnap] = useState<AdminSnapshot | null>(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<Tab>('overview')

  // Form states
  const [disburseUser, setDisburseUser] = useState('')
  const [disburseAmt, setDisburseAmt] = useState('')
  const [newAdminEmail, setNewAdminEmail] = useState('')
  const [newAdminScope, setNewAdminScope] = useState<AdminScopeType>('operations')
  const [busy, setBusy] = useState(false)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
  const [managerIdDraft, setManagerIdDraft] = useState<Record<string, string>>({})

  // Projects & Signals Admin State
  const [projectStatuses, setProjectStatuses] = useState<Record<string, { closed: boolean; deadlineOverride: string | null }> | null>(null)
  const [loadingProjects, setLoadingProjects] = useState(false)
  const [deadlineDraft, setDeadlineDraft] = useState<Record<string, string>>({})
  const [signals, setSignals] = useState<Record<string, SignalData>>({})

  const load = useCallback(async () => {
    setLoading(true)
    const res = await getAdminSnapshot()
    if (res.ok && res.snapshot) {
      setSnap(res.snapshot)
    } else {
      toast({ title: 'Admin load failed', description: res.error, variant: 'error' })
    }
    setLoading(false)
  }, [toast])

  useEffect(() => {
    load()
  }, [load])

  const scope = state.adminScope ?? 'full'

  const allTabs: { id: Tab; label: string; scopes: AdminScopeType[] }[] = [
    { id: 'overview', label: 'Overview', scopes: ['full', 'finance', 'operations'] },
    { id: 'kyc', label: `KYC${snap?.pendingKyc ? ` (${snap.pendingKyc})` : ''}`, scopes: ['full', 'operations'] },
    { id: 'deposits', label: `Deposits${snap?.pendingDeposits ? ` (${snap.pendingDeposits})` : ''}`, scopes: ['full', 'finance'] },
    { id: 'withdrawals', label: `Withdrawals${snap?.pendingWithdrawals ? ` (${snap.pendingWithdrawals})` : ''}`, scopes: ['full', 'finance'] },
    { id: 'transfers', label: `Transfers${snap?.pendingP2P ? ` (${snap.pendingP2P})` : ''}`, scopes: ['full', 'finance'] },
    { id: 'cards', label: `Cards${snap?.pendingCards ? ` (${snap.pendingCards})` : ''}`, scopes: ['full', 'operations'] },
    { id: 'users', label: 'Users', scopes: ['full', 'operations'] },
    { id: 'projects', label: 'Projects & Signals', scopes: ['full', 'operations'] },
    { id: 'settings', label: 'Settings', scopes: ['full'] },
  ]

  const tabs = allTabs.filter((t) => t.scopes.includes(scope as AdminScopeType))
  const activeTab = tabs.some((t) => t.id === tab) ? tab : 'overview'

  // Fetch Projects and Signals together for the Projects Tab
  const loadProjectsAndSignals = useCallback(async () => {
    setLoadingProjects(true)
    try {
      const [projRes, sigRes] = await Promise.all([
        getProjectAdminStatuses(),
        supabase.from('signals').select('*'),
      ])

      if (projRes.ok && projRes.rows) {
        const map: Record<string, { closed: boolean; deadlineOverride: string | null }> = {}
        for (const r of projRes.rows) {
          map[r.projectId] = { closed: r.closed, deadlineOverride: r.deadlineOverride }
        }
        setProjectStatuses(map)
      } else if (projRes.error) {
        toast({ title: 'Could not load project statuses', description: projRes.error, variant: 'error' })
      }

      if (sigRes.data) {
        const sigMap: Record<string, SignalData> = {}
        for (const s of sigRes.data) {
          sigMap[s.project_id] = s as SignalData
        }
        setSignals(sigMap)
      }
    } catch (err) {
      console.error('Error loading projects & signals:', err)
    } finally {
      setLoadingProjects(false)
    }
  }, [supabase, toast])

  useEffect(() => {
    if (activeTab === 'projects' && projectStatuses === null) {
      loadProjectsAndSignals()
    }
  }, [activeTab, projectStatuses, loadProjectsAndSignals])

  const act = async (fn: () => Promise<{ ok: boolean; error?: string; snapshot?: AdminSnapshot }>) => {
    setBusy(true)
    try {
      const res = await fn()
      if (res.ok && res.snapshot) setSnap(res.snapshot)
      else if (!res.ok) toast({ title: 'Action failed', description: res.error, variant: 'error' })
      return res
    } finally {
      setBusy(false)
    }
  }

  // Handle updates to Signals table in Supabase
  const handleUpdateSignal = async (
    projectId: string,
    updates: Partial<Pick<SignalData, 'urgency' | 'window' | 'target_yield'>>
  ) => {
    setBusy(true)
    try {
      const currentSignal = signals[projectId]
      if (!currentSignal) return

      const { error } = await supabase
        .from('signals')
        .update(updates)
        .eq('project_id', projectId)

      if (error) {
        toast({ title: 'Signal update failed', description: error.message, variant: 'error' })
      } else {
        setSignals((prev) => ({
          ...prev,
          [projectId]: { ...prev[projectId], ...updates },
        }))
        toast({ title: 'Signal updated', description: 'Public signal feed reflects these changes.', variant: 'success' })
      }
    } finally {
      setBusy(false)
    }
  }

  if (!state.isAdmin) {
    return (
      <div className="space-y-5">
        <SectionTitle title="Admin dashboard" subtitle="Restricted access." icon={<Lock className="size-5" />} />
        <Glass className="animate-rise flex flex-col items-center py-8 text-center">
          <span className="flex size-12 items-center justify-center rounded-2xl bg-gold-soft text-gold">
            <ShieldCheck className="size-6" />
          </span>
          <p className="mt-3 font-semibold">Admin access required</p>
          <p className="mt-1 text-sm text-muted-foreground">Your account does not have admin privileges.</p>
          <p className="mt-2 text-xs text-muted-foreground">Ask an existing admin to add your email.</p>
        </Glass>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <SectionTitle
          title="Admin"
          subtitle={scope === 'full' ? 'Platform management' : `${scope === 'finance' ? 'Finance' : 'Operations'} admin`}
          icon={<ShieldCheck className="size-5" />}
        />
        <Button size="sm" variant="ghost" className="text-muted-foreground" onClick={() => setView('profile')}>
          Exit
        </Button>
      </div>

      {/* Nav Tabs */}
      <div className="no-scrollbar flex gap-1.5 overflow-x-auto pb-0.5">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              'shrink-0 rounded-xl px-3.5 py-2 text-xs font-semibold transition-colors',
              activeTab === t.id
                ? 'bg-gold text-primary-foreground'
                : 'bg-white/[0.05] text-muted-foreground hover:bg-white/[0.09]',
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading && (
        <Glass className="animate-rise flex items-center justify-center py-10">
          <Activity className="size-5 animate-spin text-gold" />
          <span className="ml-2 text-sm text-muted-foreground">Loading…</span>
        </Glass>
      )}

      {!loading && snap && (
        <>
          {/* TAB: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-4 animate-rise">
              <Glass>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                  <Stat label="Total cash balances" value={`$${money(snap.totalDeposits, 0)}`} />
                  <Stat label="Total invested" value={`$${money(snap.totalInvested, 0)}`} />
                  <Stat label="Total staked (PULSE)" value={`${money(snap.totalStaked, 0)}`} />
                  <Stat label="Users" value={snap.userCount} />
                  <Stat label="Pending KYC" value={snap.pendingKyc} />
                  <Stat label="Pending deposits" value={snap.pendingDeposits} />
                  <Stat label="Pending withdrawals" value={snap.pendingWithdrawals} />
                  <Stat label="Pending transfers" value={snap.pendingP2P} />
                </div>
              </Glass>

              <Glass>
                <p className="mb-3 text-sm font-semibold">Recent transactions</p>
                {snap.recentTxns.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No transactions yet.</p>
                ) : (
                  <div className="space-y-2">
                    {snap.recentTxns.slice(0, 8).map((t) => (
                      <div key={t.id} className="flex items-center justify-between text-xs">
                        <div className="min-w-0">
                          <span className="block truncate font-medium">{t.email ?? t.userId.slice(0, 8)}</span>
                          <span className="text-muted-foreground">{t.type}</span>
                        </div>
                        <div className="ml-3 shrink-0 text-right">
                          <span className="block font-mono font-semibold">${money(t.amount)}</span>
                          <Pill tone={t.status === 'completed' ? 'green' : 'gold'}>{t.status}</Pill>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Glass>

              <Glass>
                <p className="mb-1 text-sm font-semibold">Disburse yield</p>
                <p className="mb-3 text-xs leading-relaxed text-muted-foreground">
                  Credit realised project returns directly to an investor&apos;s balance. Only disburse
                  amounts supported by actual reported project performance.
                </p>
                <div className="space-y-2.5">
                  <div>
                    <span className="mb-1.5 block text-xs font-medium text-muted-foreground">User ID or email</span>
                    <select
                      value={disburseUser}
                      onChange={(e) => setDisburseUser(e.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2.5 text-sm outline-none focus:border-gold/50"
                    >
                      <option value="">— select investor —</option>
                      {snap.users.map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.email ?? u.id.slice(0, 12)} — ${money(u.cash, 0)} cash
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <span className="mb-1.5 block text-xs font-medium text-muted-foreground">Amount (USD)</span>
                    <input
                      type="number"
                      inputMode="decimal"
                      value={disburseAmt}
                      onChange={(e) => setDisburseAmt(e.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-2.5 font-mono text-sm outline-none focus:border-gold/50"
                      placeholder="0.00"
                    />
                  </div>
                  <Button
                    size="lg"
                    className="h-11 w-full bg-gold font-semibold text-primary-foreground hover:bg-gold/90"
                    disabled={!disburseUser || !Number(disburseAmt) || busy}
                    onClick={() =>
                      act(async () => {
                        const res = await disburseYield(disburseUser, Number(disburseAmt))
                        if (res.ok) {
                          toast({ title: 'Yield disbursed', description: `$${money(Number(disburseAmt))} credited.`, variant: 'success' })
                          setDisburseAmt('')
                        }
                        return res
                      })
                    }
                  >
                    <Coins className="size-4" /> Disburse
                  </Button>
                </div>
              </Glass>
            </div>
          )}

          {/* TAB: KYC */}
          {activeTab === 'kyc' && (
            <div className="space-y-3 animate-rise">
              {snap.kycQueue.length === 0 ? (
                <Glass className="py-8 text-center">
                  <BadgeCheck className="mx-auto size-8 text-green" />
                  <p className="mt-2 text-sm font-semibold">All clear</p>
                  <p className="text-xs text-muted-foreground">No pending KYC submissions.</p>
                </Glass>
              ) : (
                snap.kycQueue.map((k) => (
                  <Glass key={k.id} className="animate-rise">
                    <div className="mb-3">
                      <p className="font-semibold">{k.fullName}</p>
                      <p className="text-xs text-muted-foreground">{k.email ?? k.userId.slice(0, 12)}</p>
                    </div>
                    <div className="mb-3 space-y-1 text-xs text-muted-foreground">
                      <p>ID: <span className="font-mono text-foreground">{k.idNumber}</span></p>
                      {k.dateOfBirth && <p>DOB: {k.dateOfBirth}</p>}
                      {k.nationality && <p>Nationality: {k.nationality}</p>}
                      {k.country && <p>Country: {k.country}</p>}
                      <p>Submitted: {new Date(k.createdAt).toLocaleString()}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        className="flex-1 bg-green/90 font-semibold text-background hover:bg-green"
                        disabled={busy}
                        onClick={() =>
                          act(async () => {
                            const res = await reviewKyc(k.id, 'approved')
                            if (res.ok) toast({ title: 'KYC approved', description: k.fullName, variant: 'success' })
                            return res
                          })
                        }
                      >
                        <Check className="size-3.5" /> Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 border-destructive/40 font-semibold text-destructive hover:bg-destructive/10"
                        disabled={busy}
                        onClick={() =>
                          act(async () => {
                            const res = await reviewKyc(k.id, 'rejected')
                            if (res.ok) toast({ title: 'KYC rejected', variant: 'info' })
                            return res
                          })
                        }
                      >
                        <X className="size-3.5" /> Reject
                      </Button>
                    </div>
                  </Glass>
                ))
              )}
            </div>
          )}

          {/* TAB: DEPOSITS */}
          {activeTab === 'deposits' && (
            <div className="space-y-3 animate-rise">
              {snap.depositQueue.length === 0 ? (
                <Glass className="py-8 text-center">
                  <Check className="mx-auto size-8 text-green" />
                  <p className="mt-2 text-sm font-semibold">No pending deposits</p>
                </Glass>
              ) : (
                snap.depositQueue.map((d) => (
                  <Glass key={d.id} className="animate-rise">
                    <div className="mb-3 flex items-start justify-between">
                      <div className="min-w-0">
                        <p className="font-semibold">${money(d.amount)}</p>
                        <p className="text-xs text-muted-foreground">{d.email ?? d.userId.slice(0, 12)}</p>
                        <p className="text-xs text-muted-foreground">Requested {new Date(d.createdAt).toLocaleString()}</p>
                        {d.payCurrency && (
                          <p className="mt-1 text-xs text-muted-foreground">
                            Paid via <span className="font-medium text-foreground">{d.payCurrency.toUpperCase()}</span>
                          </p>
                        )}
                        {d.userTxRef && (
                          <p className="truncate font-mono text-xs text-gold" title={d.userTxRef}>
                            TXID: {d.userTxRef}
                          </p>
                        )}
                      </div>
                      <Pill tone="muted">pending</Pill>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        className="flex-1 bg-green/90 font-semibold text-background hover:bg-green"
                        disabled={busy}
                        onClick={() =>
                          act(async () => {
                            const res = await reviewDeposit(d.id, 'approved')
                            if (res.ok) toast({ title: 'Deposit approved', description: `$${money(d.amount)} credited.`, variant: 'success' })
                            return res
                          })
                        }
                      >
                        <Check className="size-3.5" /> Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 border-destructive/40 font-semibold text-destructive hover:bg-destructive/10"
                        disabled={busy}
                        onClick={() =>
                          act(async () => {
                            const res = await reviewDeposit(d.id, 'rejected')
                            if (res.ok) toast({ title: 'Deposit rejected', variant: 'info' })
                            return res
                          })
                        }
                      >
                        <X className="size-3.5" /> Reject
                      </Button>
                    </div>
                  </Glass>
                ))
              )}
            </div>
          )}

          {/* TAB: WITHDRAWALS */}
          {activeTab === 'withdrawals' && (
            <div className="space-y-3 animate-rise">
              {snap.withdrawalQueue.length === 0 ? (
                <Glass className="py-8 text-center">
                  <Check className="mx-auto size-8 text-green" />
                  <p className="mt-2 text-sm font-semibold">No pending withdrawals</p>
                </Glass>
              ) : (
                snap.withdrawalQueue.map((w) => (
                  <Glass key={w.id} className="animate-rise">
                    <div className="mb-3 flex items-start justify-between">
                      <div className="min-w-0">
                        <p className="font-semibold">${money(w.amount)}</p>
                        <p className="text-xs text-muted-foreground">{w.email ?? w.userId.slice(0, 12)}</p>
                        <p className="text-xs text-muted-foreground">Requested {new Date(w.createdAt).toLocaleString()}</p>
                        {w.walletName && <p className="mt-1 text-xs font-medium text-foreground">{w.walletName}</p>}
                        {w.destinationAddress && (
                          <p className="truncate font-mono text-xs text-gold" title={w.destinationAddress}>
                            To: {w.destinationAddress}
                          </p>
                        )}
                        {(w.network || w.broker) && (
                          <p className="text-xs text-muted-foreground">
                            {w.network ?? 'Network not specified'} · {w.broker ?? 'Broker not specified'}
                          </p>
                        )}
                      </div>
                      <Pill tone="gold">pending</Pill>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        className="flex-1 bg-green/90 font-semibold text-background hover:bg-green"
                        disabled={busy}
                        onClick={() =>
                          act(async () => {
                            const res = await reviewWithdrawal(w.id, 'approved')
                            if (res.ok) toast({ title: 'Withdrawal approved', description: `$${money(w.amount)} disbursed.`, variant: 'success' })
                            return res
                          })
                        }
                      >
                        <Check className="size-3.5" /> Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 border-destructive/40 font-semibold text-destructive hover:bg-destructive/10"
                        disabled={busy}
                        onClick={() =>
                          act(async () => {
                            const res = await reviewWithdrawal(w.id, 'rejected')
                            if (res.ok) toast({ title: 'Withdrawal rejected', variant: 'info' })
                            return res
                          })
                        }
                      >
                        <X className="size-3.5" /> Reject
                      </Button>
                    </div>
                  </Glass>
                ))
              )}
            </div>
          )}

          {/* TAB: TRANSFERS */}
          {activeTab === 'transfers' && (
            <div className="space-y-3 animate-rise">
              {snap.p2pQueue.length === 0 ? (
                <Glass className="py-8 text-center">
                  <Check className="mx-auto size-8 text-green" />
                  <p className="mt-2 text-sm font-semibold">No pending P2P transfers</p>
                </Glass>
              ) : (
                snap.p2pQueue.map((p) => (
                  <Glass key={p.id} className="animate-rise">
                    <div className="mb-3 flex items-start justify-between">
                      <div className="min-w-0">
                        <p className="font-semibold">${money(p.amount)}</p>
                        <p className="text-xs text-muted-foreground">From: {p.senderEmail ?? p.senderId.slice(0, 12)}</p>
                        <p className="text-xs text-muted-foreground">To: {p.recipientEmail ?? p.recipientId.slice(0, 12)}</p>
                        <p className="text-xs text-muted-foreground">Requested {new Date(p.createdAt).toLocaleString()}</p>
                        {p.note && <p className="mt-1 text-xs italic text-muted-foreground">&quot;{p.note}&quot;</p>}
                      </div>
                      <Pill tone="gold">pending</Pill>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        className="flex-1 bg-green/90 font-semibold text-background hover:bg-green"
                        disabled={busy}
                        onClick={() =>
                          act(async () => {
                            const res = await reviewP2PTransfer(p.id, 'approved')
                            if (res.ok) toast({ title: 'P2P Transfer approved', variant: 'success' })
                            return res
                          })
                        }
                      >
                        <Check className="size-3.5" /> Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 border-destructive/40 font-semibold text-destructive hover:bg-destructive/10"
                        disabled={busy}
                        onClick={() =>
                          act(async () => {
                            const res = await reviewP2PTransfer(p.id, 'rejected')
                            if (res.ok) toast({ title: 'P2P Transfer rejected', variant: 'info' })
                            return res
                          })
                        }
                      >
                        <X className="size-3.5" /> Reject
                      </Button>
                    </div>
                  </Glass>
                ))
              )}
            </div>
          )}

          {/* TAB: CARDS */}
          {activeTab === 'cards' && (
            <div className="space-y-3 animate-rise">
              {snap.cardQueue.length === 0 ? (
                <Glass className="py-8 text-center">
                  <Check className="mx-auto size-8 text-green" />
                  <p className="mt-2 text-sm font-semibold">No pending card applications</p>
                </Glass>
              ) : (
                snap.cardQueue.map((c) => (
                  <Glass key={c.id} className="animate-rise">
                    <div className="mb-3 flex items-start justify-between">
                      <div className="min-w-0">
                        <p className="font-semibold">{c.cardType.toUpperCase()} Card</p>
                        <p className="text-xs text-muted-foreground">{c.email ?? c.userId.slice(0, 12)}</p>
                        <p className="text-xs text-muted-foreground">Requested {new Date(c.createdAt).toLocaleString()}</p>
                        {c.shippingAddress && <p className="mt-1 text-xs text-muted-foreground">Ship: {c.shippingAddress}</p>}
                      </div>
                      <Pill tone="gold">pending</Pill>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        className="flex-1 bg-green/90 font-semibold text-background hover:bg-green"
                        disabled={busy}
                        onClick={() =>
                          act(async () => {
                            const res = await reviewCardApplication(c.id, 'approved')
                            if (res.ok) toast({ title: 'Card application approved', variant: 'success' })
                            return res
                          })
                        }
                      >
                        <Check className="size-3.5" /> Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 border-destructive/40 font-semibold text-destructive hover:bg-destructive/10"
                        disabled={busy}
                        onClick={() =>
                          act(async () => {
                            const res = await reviewCardApplication(c.id, 'rejected')
                            if (res.ok) toast({ title: 'Card application rejected', variant: 'info' })
                            return res
                          })
                        }
                      >
                        <X className="size-3.5" /> Reject
                      </Button>
                    </div>
                  </Glass>
                ))
              )}
            </div>
          )}

          {/* TAB: PROJECTS & SIGNALS */}
          {activeTab === 'projects' && (
            <div className="space-y-4 animate-rise">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold">Active Projects & Signal Controls</h3>
                  <p className="text-xs text-muted-foreground">Update project status, closing windows, urgency flags, or disburse returns.</p>
                </div>
                <Button size="sm" variant="ghost" onClick={loadProjectsAndSignals} disabled={loadingProjects}>
                  <RotateCcw className={`size-3.5 ${loadingProjects ? 'animate-spin' : ''}`} />
                </Button>
              </div>

              {loadingProjects ? (
                <Glass className="flex items-center justify-center py-8">
                  <Activity className="size-5 animate-spin text-gold" />
                  <span className="ml-2 text-sm text-muted-foreground">Loading projects and signals…</span>
                </Glass>
              ) : (
                PROJECTS.map((p) => {
                  const status = projectStatuses?.[p.id]
                  const isClosed = status?.closed ?? false
                  const signal = signals[p.id]

                  return (
                    <Glass key={p.id} className="space-y-4 border-gold/10">
                      {/* Project Header */}
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-semibold text-base">{p.name}</p>
                          <p className="text-xs text-muted-foreground">{p.country} · {p.sector}</p>
                        </div>
                        <Pill tone={isClosed ? 'muted' : 'green'}>
                          {isClosed ? 'closed' : 'open'}
                        </Pill>
                      </div>

                      {/* Date & Deadline Controls */}
                      <div className="rounded-lg bg-black/20 p-3 space-y-2 border border-white/5">
                        <p className="text-xs font-medium text-gold flex items-center gap-1.5">
                          <Radio className="size-3.5" /> Project Deadline & Status
                        </p>
                        <div className="flex flex-wrap items-center gap-2">
                          <input
                            type="date"
                            value={deadlineDraft[p.id] ?? status?.deadlineOverride ?? ''}
                            onChange={(e) => setDeadlineDraft({ ...deadlineDraft, [p.id]: e.target.value })}
                            className="rounded-lg border border-white/10 bg-white/[0.04] px-2.5 py-1.5 text-xs outline-none focus:border-gold/50"
                          />
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-xs"
                            disabled={busy}
                            onClick={() =>
                              act(async () => {
                                const res = await setProjectStatus(p.id, isClosed, deadlineDraft[p.id] ?? null)
                                if (res.ok) toast({ title: 'Date updated', variant: 'success' })
                                return res
                              })
                            }
                          >
                            Save Date
                          </Button>
                        </div>
                      </div>

                      {/* Signals Configuration (Urgency, Yield & Window) */}
                      {signal && (
                        <div className="rounded-lg bg-black/20 p-3 space-y-3 border border-white/5">
                          <p className="text-xs font-medium text-gold">Public Signal Settings</p>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                            <div>
                              <label className="block text-muted-foreground mb-1">Urgency</label>
                              <select
                                value={signal.urgency}
                                onChange={(e) => handleUpdateSignal(p.id, { urgency: e.target.value as UrgencyLevel })}
                                className="w-full rounded-lg border border-white/10 bg-black/40 px-2.5 py-1.5 outline-none focus:border-gold/50"
                              >
                                <option value="New">New</option>
                                <option value="Closing soon">Closing soon</option>
                                <option value="Standard">Standard</option>
                                <option value="Open">Open</option>
                              </select>
                            </div>

                            <div>
                              <label className="block text-muted-foreground mb-1">Window Text</label>
                              <input
                                type="text"
                                value={signal.window}
                                onChange={(e) => handleUpdateSignal(p.id, { window: e.target.value })}
                                placeholder="e.g. Closes in 24h"
                                className="w-full rounded-lg border border-white/10 bg-black/40 px-2.5 py-1.5 outline-none focus:border-gold/50"
                              />
                            </div>

                            <div>
                              <label className="block text-muted-foreground mb-1">Target Yield</label>
                              <input
                                type="text"
                                value={signal.target_yield}
                                onChange={(e) => handleUpdateSignal(p.id, { target_yield: e.target.value })}
                                placeholder="e.g. 14.5% IRR"
                                className="w-full rounded-lg border border-white/10 bg-black/40 px-2.5 py-1.5 outline-none focus:border-gold/50"
                              />
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Project Action Buttons */}
                      <div className="flex gap-2 pt-1">
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1 font-semibold text-xs"
                          disabled={busy}
                          onClick={() =>
                            act(async () => {
                              const res = await setProjectStatus(p.id, !isClosed, status?.deadlineOverride ?? null)
                              if (res.ok) toast({ title: `Project ${!isClosed ? 'closed' : 'reopened'}`, variant: 'success' })
                              return res
                            })
                          }
                        >
                          {!isClosed ? 'Close project' : 'Reopen project'}
                        </Button>

                        <Button
                          size="sm"
                          className="flex-1 bg-gold font-semibold text-xs text-primary-foreground hover:bg-gold/90"
                          disabled={busy}
                          onClick={() =>
                            act(async () => {
                              const res = await processProjectPayout(p.id)
                              if (res.ok) {
                                toast({ title: 'Payout processed', description: 'Returns disbursed successfully', variant: 'success' })
                              }
                              return res
                            })
                          }
                        >
                          Process payout
                        </Button>
                      </div>
                    </Glass>
                  )
                })
              )}
            </div>
          )}

          {/* TAB: USERS */}
          {activeTab === 'users' && (
            <div className="space-y-3 animate-rise">
              {snap.users.length === 0 ? (
                <Glass className="py-8 text-center">
                  <User className="mx-auto size-8 text-muted-foreground" />
                  <p className="mt-2 text-sm font-semibold">No registered users</p>
                </Glass>
              ) : (
                snap.users.map((u) => (
                  <Glass key={u.id} className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm font-semibold">{u.email ?? u.id}</p>
                        <p className="text-xs text-muted-foreground">
                          Joined {new Date(u.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <Pill tone={u.kycStatus === 'approved' ? 'green' : u.kycStatus === 'pending' ? 'gold' : 'muted'}>
                        {u.kycStatus}
                      </Pill>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-muted-foreground">Cash:</span> ${money(u.cash, 0)}
                      </div>
                      <div>
                        <span className="text-muted-foreground">Manager ID:</span> {u.managerId ?? 'None'}
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-white/5">
                      {/* Assign Manager */}
                      <div className="flex items-center gap-1.5 flex-1 min-w-[200px]">
                        <input
                          type="text"
                          placeholder="Manager ID"
                          value={managerIdDraft[u.id] ?? ''}
                          onChange={(e) => setManagerIdDraft({ ...managerIdDraft, [u.id]: e.target.value })}
                          className="w-full rounded-lg border border-white/10 bg-white/[0.04] px-2 py-1 text-xs outline-none focus:border-gold/50"
                        />
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-xs shrink-0"
                          disabled={busy}
                          onClick={() =>
                            act(async () => {
                              const res = await assignManager(u.id, managerIdDraft[u.id] || null)
                              if (res.ok) toast({ title: 'Manager updated', variant: 'success' })
                              return res
                            })
                          }
                        >
                          Set Manager
                        </Button>
                      </div>

                      {/* Reset KYC */}
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-xs text-muted-foreground hover:text-foreground"
                        disabled={busy}
                        onClick={() =>
                          act(async () => {
                            const res = await resetKyc(u.id)
                            if (res.ok) toast({ title: 'KYC Reset', variant: 'info' })
                            return res
                          })
                        }
                      >
                        Reset KYC
                      </Button>

                      {/* Delete User */}
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
                                setConfirmDeleteId(null)
                                if (res.ok) toast({ title: 'User deleted', variant: 'success' })
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
                          className="text-xs text-destructive hover:bg-destructive/10"
                          onClick={() => setConfirmDeleteId(u.id)}
                        >
                          <Trash2 className="size-3.5" />
                        </Button>
                      )}
                    </div>
                  </Glass>
                ))
              )}
            </div>
          )}

          {/* TAB: SETTINGS */}
          {activeTab === 'settings' && (
            <div className="space-y-4 animate-rise">
              <Glass>
                <p className="mb-1 text-sm font-semibold">Add New Admin</p>
                <p className="mb-3 text-xs text-muted-foreground">Grant admin access to an existing platform user by email.</p>
                
                <div className="space-y-3">
                  <div>
                    <span className="mb-1 block text-xs text-muted-foreground">Admin Email</span>
                    <input
                      type="email"
                      value={newAdminEmail}
                      onChange={(e) => setNewAdminEmail(e.target.value)}
                      placeholder="user@example.com"
                      className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-sm outline-none focus:border-gold/50"
                    />
                  </div>

                  <div>
                    <span className="mb-1 block text-xs text-muted-foreground">Admin Scope</span>
                    <select
                      value={newAdminScope}
                      onChange={(e) => setNewAdminScope(e.target.value as AdminScopeType)}
                      className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-sm outline-none focus:border-gold/50"
                    >
                      <option value="operations">Operations (KYC, Users, Cards, Projects)</option>
                      <option value="finance">Finance (Deposits, Withdrawals, Transfers)</option>
                      <option value="full">Full Admin (All Tabs + Settings)</option>
                    </select>
                  </div>

                  <Button
                    size="lg"
                    className="w-full bg-gold font-semibold text-primary-foreground hover:bg-gold/90"
                    disabled={!newAdminEmail || busy}
                    onClick={() =>
                      act(async () => {
                        const res = await addAdminByEmail(newAdminEmail, newAdminScope)
                        if (res.ok) {
                          toast({ title: 'Admin added', description: `${newAdminEmail} assigned ${newAdminScope} scope.`, variant: 'success' })
                          setNewAdminEmail('')
                        }
                        return res
                      })
                    }
                  >
                    <UserPlus className="size-4" /> Add Admin
                  </Button>
                </div>
              </Glass>
            </div>
          )}
        </>
      )}
    </div>
  )
}
