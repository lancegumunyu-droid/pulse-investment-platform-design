'use client'

import { useCallback, useEffect, useState } from 'react'
import {
  Activity,
  BadgeCheck,
  Check,
  ChevronRight,
  Coins,
  Lock,
  ShieldCheck,
  TriangleAlert,
  User,
  X,
} from 'lucide-react'
import { usePulse, money } from '../store'
import { Glass, Pill, SectionTitle, Stat } from '../ui-bits'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { getAdminSnapshot, reviewKyc, reviewWithdrawal, disburseYield, addAdminByEmail } from '@/app/actions/admin'
import type { AdminSnapshot } from '@/lib/pulse/types'

type Tab = 'overview' | 'kyc' | 'withdrawals' | 'users' | 'settings'

export function AdminView() {
  const { state, setView, toast } = usePulse()
  const [snap, setSnap] = useState<AdminSnapshot | null>(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<Tab>('overview')
  const [disburseUser, setDisburseUser] = useState('')
  const [disburseAmt, setDisburseAmt] = useState('')
  const [newAdminEmail, setNewAdminEmail] = useState('')
  const [busy, setBusy] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    const res = await getAdminSnapshot()
    if (res.ok) setSnap(res.snapshot)
    else toast({ title: 'Admin load failed', description: res.error, variant: 'error' })
    setLoading(false)
  }, [toast])

  useEffect(() => { load() }, [load])

  // Non-admin guard
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

  const tabs: { id: Tab; label: string }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'kyc', label: `KYC${snap ? ` (${snap.pendingKyc})` : ''}` },
    { id: 'withdrawals', label: `Withdrawals${snap ? ` (${snap.pendingWithdrawals})` : ''}` },
    { id: 'users', label: 'Users' },
    { id: 'settings', label: 'Settings' },
  ]

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

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <SectionTitle title="Admin" subtitle="Platform management" icon={<ShieldCheck className="size-5" />} />
        <Button size="sm" variant="ghost" className="text-muted-foreground" onClick={() => setView('profile')}>
          Exit
        </Button>
      </div>

      {/* Tab strip */}
      <div className="no-scrollbar flex gap-1.5 overflow-x-auto pb-0.5">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              'shrink-0 rounded-xl px-3.5 py-2 text-xs font-semibold transition-colors',
              tab === t.id
                ? 'bg-gold text-primary-foreground'
                : 'bg-white/[0.05] text-muted-foreground hover:bg-white/[0.09]',
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading && (
        <Glass className="flex items-center justify-center py-10 animate-rise">
          <Activity className="size-5 animate-spin text-gold" />
          <span className="ml-2 text-sm text-muted-foreground">Loading…</span>
        </Glass>
      )}

      {!loading && snap && (
        <>
          {/* ── Overview ── */}
          {tab === 'overview' && (
            <div className="space-y-4 animate-rise">
              <Glass>
                <div className="grid grid-cols-2 gap-4">
                  <Stat label="Total cash balances" value={`$${money(snap.totalDeposits, 0)}`} />
                  <Stat label="Total invested" value={`$${money(snap.totalInvested, 0)}`} />
                  <Stat label="Total staked (PULSE)" value={`${money(snap.totalStaked, 0)}`} />
                  <Stat label="Users" value={snap.userCount} />
                  <Stat label="Pending KYC" value={snap.pendingKyc} />
                  <Stat label="Pending withdrawals" value={snap.pendingWithdrawals} />
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
                        <div className="ml-3 text-right shrink-0">
                          <span className="block font-mono font-semibold">${money(t.amount)}</span>
                          <Pill tone={t.status === 'completed' ? 'green' : 'gold'}>{t.status}</Pill>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Glass>

              {/* Manual yield disbursement */}
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

          {/* ── KYC queue ── */}
          {tab === 'kyc' && (
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
                      <p>ID: <span className="text-foreground font-mono">{k.idNumber}</span></p>
                      {k.dateOfBirth && <p>DOB: {k.dateOfBirth}</p>}
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

          {/* ── Withdrawal queue ── */}
          {tab === 'withdrawals' && (
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
                      <div>
                        <p className="font-semibold">${money(w.amount)}</p>
                        <p className="text-xs text-muted-foreground">{w.email ?? w.userId.slice(0, 12)}</p>
                        <p className="text-xs text-muted-foreground">{new Date(w.createdAt).toLocaleString()}</p>
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
                            if (res.ok) toast({ title: 'Withdrawal cancelled, funds refunded.', variant: 'info' })
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

          {/* ── Users ── */}
          {tab === 'users' && (
            <div className="space-y-3 animate-rise">
              {snap.users.map((u) => (
                <Glass key={u.id} className="animate-rise">
                  <div className="flex items-center justify-between">
                    <div className="flex min-w-0 items-center gap-3">
                      <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-white/[0.06]">
                        <User className="size-4 text-muted-foreground" />
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold">{u.email ?? u.id.slice(0, 14)}</p>
                        <p className="text-xs text-muted-foreground">{u.fullName ?? 'No name'}</p>
                      </div>
                    </div>
                    <div className="ml-2 flex shrink-0 items-center gap-1.5">
                      {u.role === 'admin' && <Pill tone="gold">admin</Pill>}
                      <Pill tone={u.kycStatus === 'verified' ? 'green' : 'muted'}>{u.kycStatus}</Pill>
                    </div>
                  </div>
                  <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
                    <div className="rounded-lg bg-white/[0.03] p-2 text-center">
                      <p className="font-mono font-semibold">${money(u.cash, 0)}</p>
                      <p className="text-muted-foreground">Cash</p>
                    </div>
                    <div className="rounded-lg bg-white/[0.03] p-2 text-center">
                      <p className="font-mono font-semibold">${money(u.invested, 0)}</p>
                      <p className="text-muted-foreground">Invested</p>
                    </div>
                    <div className="rounded-lg bg-white/[0.03] p-2 text-center">
                      <p className="font-mono font-semibold">{money(u.staked, 0)}</p>
                      <p className="text-muted-foreground">Staked</p>
                    </div>
                  </div>
                </Glass>
              ))}
            </div>
          )}

          {/* ── Settings ── */}
          {tab === 'settings' && (
            <div className="space-y-4 animate-rise">
              <Glass>
                <p className="mb-1 text-sm font-semibold">Add admin</p>
                <p className="mb-3 text-xs leading-relaxed text-muted-foreground">
                  Add an email to the admin allowlist. They&apos;ll be granted admin role immediately if their
                  account already exists, or on their next sign-up.
                </p>
                <input
                  type="email"
                  value={newAdminEmail}
                  onChange={(e) => setNewAdminEmail(e.target.value)}
                  placeholder="admin@example.com"
                  className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-2.5 text-sm outline-none focus:border-gold/50"
                />
                <Button
                  size="lg"
                  className="mt-3 h-11 w-full bg-gold font-semibold text-primary-foreground hover:bg-gold/90"
                  disabled={!newAdminEmail.includes('@') || busy}
                  onClick={() =>
                    act(async () => {
                      const res = await addAdminByEmail(newAdminEmail)
                      if (res.ok) {
                        toast({ title: 'Admin added', description: newAdminEmail, variant: 'success' })
                        setNewAdminEmail('')
                      }
                      return res
                    })
                  }
                >
                  <ShieldCheck className="size-4" /> Add admin
                </Button>
              </Glass>

              <Glass>
                <p className="mb-2 text-sm font-semibold">NOWPayments integration</p>
                <div className="space-y-2 text-xs text-muted-foreground">
                  <p className="leading-relaxed">
                    To enable real crypto deposits, add these environment variables in your Vercel project settings
                    (Settings → Vars):
                  </p>
                  {[
                    { key: 'NOWPAYMENTS_API_KEY', hint: 'From nowpayments.io → API keys' },
                    { key: 'NOWPAYMENTS_IPN_SECRET', hint: 'From nowpayments.io → IPN settings' },
                    { key: 'NOWPAYMENTS_SANDBOX', hint: 'Set to "true" for testing' },
                  ].map((v) => (
                    <div key={v.key} className="rounded-xl border border-white/8 bg-white/[0.03] p-3">
                      <p className="font-mono font-semibold text-foreground">{v.key}</p>
                      <p className="mt-0.5">{v.hint}</p>
                    </div>
                  ))}
                  <p className="leading-relaxed pt-1">
                    Set your IPN callback URL to:{' '}
                    <span className="font-mono text-gold break-all">
                      https://your-domain.com/api/nowpayments/ipn
                    </span>
                  </p>
                </div>
              </Glass>

              <Glass>
                <div className="flex items-start gap-3">
                  <TriangleAlert className="mt-0.5 size-4 shrink-0 text-gold" />
                  <p className="text-xs leading-relaxed text-muted-foreground">
                    All balance mutations (deposits, investments, withdrawals, yield disbursements) are performed
                    server-side using the Supabase service role. Clients cannot directly modify balances. Every
                    operation is recorded in the immutable transactions ledger.
                  </p>
                </div>
              </Glass>

              <Button
                variant="outline"
                size="lg"
                className="h-11 w-full border-white/12 bg-white/[0.03] font-medium"
                onClick={() => { load() }}
              >
                <Activity className="size-4" /> Refresh dashboard
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
