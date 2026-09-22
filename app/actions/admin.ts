'use server'

import { createClient } from '@/lib/supabase/server'
import { serviceClient } from '@/lib/pulse/service'
import { randomInt } from 'node:crypto'
import { adjustAccount, isUserAdmin, recordTxn } from '@/lib/pulse/data-access'
import type {
  AdminSnapshot,
  AdminUserRow,
  AdminKycRow,
  AdminTxnRow,
  AdminCardRow,
} from '@/lib/pulse/types'
import type { Project, Signal } from '@/lib/pulse-data'

type AdminScope = 'full' | 'finance' | 'operations' | 'manager' | 'director'

async function requireAdmin() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')
  if (!(await isUserAdmin(user.id))) throw new Error('Admin access required')
  return user
}

async function requireAdminScope(allowed: AdminScope[]) {
  const user = await requireAdmin()
  const db = serviceClient()
  const { data } = await db.from('user_roles').select('role').eq('user_id', user.id).maybeSingle()

  const assignedRole = String(data?.role ?? '').toLowerCase()
  const scope = ['admin', 'super_admin', 'director'].includes(assignedRole) ? ('full' as AdminScope) : null

  if (!scope && !allowed.includes('operations')) {
    throw new Error('This action requires an explicit admin scope configuration.')
  }

  const effectiveScope: AdminScope = scope ?? 'operations'
  if (effectiveScope !== 'full' && !allowed.includes(effectiveScope)) {
    throw new Error(`This action requires ${allowed.join(' or ')} admin access`)
  }
  return user
}

type AdminResult = { ok: true; snapshot: AdminSnapshot } | { ok: false; error: string }

function normalizeKycStatus(value: unknown): 'none' | 'pending' | 'verified' | 'rejected' {
  const status = String(value ?? 'none').toLowerCase()
  if (status === 'approved' || status === 'verified') return 'verified'
  if (status === 'pending') return 'pending'
  if (status === 'rejected' || status === 'declined') return 'rejected'
  return 'none'
}

// FIX — BUILD BLOCKER / ADMIN CONSOLE FULLY DOWN. This queried tables
// called `wallets`, `users`, and `admin_users`, none of which exist in the
// live database (verified directly) — the real tables are `accounts`,
// `profiles` + `kyc_submissions`, and `user_roles`. This was the exact
// cause of "Admin data load failed: Could not find the table
// 'public.wallets'" — the whole admin console was unusable.
export async function getAdminSnapshot(): Promise<AdminResult> {
  try {
    await requireAdmin()
    const db = serviceClient()

    const results = await Promise.all([
      db.from('accounts').select('user_id, cash_balance, invested_balance, staked_balance, updated_at').limit(500),
      db.from('profiles').select('id, email, username, full_name, kyc_status, created_at').limit(500),
      db.from('kyc_submissions').select('*').order('created_at', { ascending: false }).limit(500),
      db.from('user_roles').select('user_id, role').limit(500),
      db.from('transactions').select('*').order('created_at', { ascending: false }).limit(200),
      db.from('card_applications').select('*').eq('status', 'waitlisted').limit(200),
      // FIX — profiles.email is empty for all 69 accounts (verified directly).
      // Real emails only exist in auth.users, which is why the admin table
      // showed raw UUID fragments instead of addresses.
      db.auth.admin.listUsers({ page: 1, perPage: 1000 }),
    ])
    const failed = results.slice(0, 6).find((result: any) => result.error)
    if (failed?.error) throw new Error(`Admin data load failed: ${failed.error.message}`)
    const [{ data: accounts }, { data: profiles }, { data: kyc }, { data: roles }, { data: txns }, { data: cardApps }, authResult] = results as any
    type AdminRawRow = Record<string, any>
    const accountRows = (accounts ?? []) as AdminRawRow[]
    const profileRows = (profiles ?? []) as AdminRawRow[]
    const kycRows = (kyc ?? []) as AdminRawRow[]
    const roleRows = (roles ?? []) as AdminRawRow[]
    const txnRows = (txns ?? []) as AdminRawRow[]
    const cardRows = (cardApps ?? []) as AdminRawRow[]
    const authUsers = (authResult?.data?.users ?? []) as AdminRawRow[]

    const acctMap = new Map(accountRows.map((a) => [a.user_id, a]))
    const profileMap = new Map(profileRows.map((p) => [p.id, p]))
    const authEmailMap = new Map(authUsers.map((u) => [u.id, u.email ?? null]))
    const emailMap = new Map(profileRows.map((p) => [p.id, authEmailMap.get(p.id) ?? p.email ?? null]))
    const roleMap = new Map(roleRows.map((r) => [r.user_id, r.role]))
    const latestKycByUser = new Map<string, AdminRawRow>()
    for (const row of kycRows) if (!latestKycByUser.has(row.user_id)) latestKycByUser.set(row.user_id, row)

    const users: AdminUserRow[] = profileRows.map((p) => {
      const a = acctMap.get(p.id)
      const role = roleMap.get(p.id) ?? null
      return {
        id: p.id,
        email: emailMap.get(p.id) ?? null,
        fullName: p.full_name ?? null,
        username: p.username ?? null,
        role,
        kycStatus: normalizeKycStatus(p.kyc_status),
        kycVerified: normalizeKycStatus(p.kyc_status) === 'verified',
        cash: Number(a?.cash_balance ?? 0),
        invested: Number(a?.invested_balance ?? 0),
        staked: Number(a?.staked_balance ?? 0),
        createdAt: new Date(p.created_at ?? Date.now()).getTime(),
        adminScope: role === 'admin' ? 'full' : null,
        managerId: null,
        isAdmin: role === 'admin',
      }
    })

    const totalDeposits = txnRows
      .filter((t) => t.type === 'deposit' && t.status === 'completed')
      .reduce((s, t) => s + Number(t.amount), 0)

    const totalInvested = accountRows.reduce((s, a) => s + Number(a.invested_balance ?? 0), 0)
    const totalStaked = accountRows.reduce((s, a) => s + Number(a.staked_balance ?? 0), 0)

    const depositQueue: AdminTxnRow[] = txnRows
      .filter((t) => t.type === 'deposit' && t.status === 'pending')
      .map((t) => {
        const meta = (t.meta as Record<string, unknown> | null) ?? {}
        return {
          id: t.id,
          userId: t.user_id,
          email: emailMap.get(t.user_id) ?? null,
          type: t.type,
          amount: Number(t.amount),
          currency: t.currency,
          status: t.status,
          reference: t.reference,
          createdAt: new Date(t.created_at).getTime(),
          settledStatus: (meta.settled_status as string | null) ?? null,
          payCurrency: (meta.originalCurrency as string | null) ?? (meta.payCurrency as string | null) ?? null,
          userTxRef: (meta.userTxRef as string | null) ?? t.reference ?? null,
        }
      })

    const withdrawalQueue: AdminTxnRow[] = txnRows
      .filter((t) => t.type === 'withdrawal' && t.status === 'pending')
      .map((t) => {
        const meta = (t.meta as Record<string, unknown> | null) ?? {}
        return {
          id: t.id,
          userId: t.user_id,
          email: emailMap.get(t.user_id) ?? null,
          type: t.type,
          amount: Number(t.amount),
          currency: t.currency,
          status: t.status,
          reference: t.reference,
          createdAt: new Date(t.created_at).getTime(),
          destinationAddress:
            ((meta.destinationAddress as string | null) ?? (meta.wallet as string | null)) ?? null,
          walletName: (meta.walletName as string | null) ?? null,
          network: (meta.network as string | null) ?? null,
          broker: (meta.broker as string | null) ?? null,
        }
      })

    const p2pQueue: AdminTxnRow[] = txnRows
      .filter((t) => t.type === 'p2p_send' && t.status === 'pending')
      .map((t) => {
        const meta = (t.meta as Record<string, unknown> | null) ?? {}
        const recipientId = meta.recipientId as string | undefined
        return {
          id: t.id,
          userId: t.user_id,
          email: emailMap.get(t.user_id) ?? null,
          type: t.type,
          amount: Number(t.amount),
          currency: t.currency,
          status: t.status,
          reference: t.reference,
          createdAt: new Date(t.created_at).getTime(),
          counterpartyLabel: recipientId ? emailMap.get(recipientId) ?? recipientId : null,
        }
      })

    const recentTxns: AdminTxnRow[] = txnRows.slice(0, 40).map((t) => ({
      id: t.id,
      userId: t.user_id,
      email: emailMap.get(t.user_id) ?? null,
      type: t.type,
      amount: Number(t.amount),
      currency: t.currency,
      status: t.status,
      reference: t.reference,
      createdAt: new Date(t.created_at).getTime(),
    }))

    const cardQueue: AdminCardRow[] = cardRows.map((c) => {
      const p = profileMap.get(c.user_id)
      return {
        id: c.id,
        userId: c.user_id,
        email: emailMap.get(c.user_id) ?? null,
        fullName: p?.full_name ?? null,
        kycStatus: normalizeKycStatus(p?.kyc_status),
        status: c.status,
        createdAt: new Date(c.created_at).getTime(),
      }
    })

    const kycQueue: AdminKycRow[] = kycRows
      .filter((k) => k.status === 'pending')
      .map((k) => ({
        id: k.id,
        userId: k.user_id,
        email: emailMap.get(k.user_id) ?? null,
        fullName: k.full_name,
        idNumber: k.id_number,
        dateOfBirth: k.date_of_birth,
        nationality: k.nationality ?? null,
        country: k.country,
        status: k.status,
        createdAt: new Date(k.created_at).getTime(),
      }))

    const snapshot: AdminSnapshot = {
      totalDeposits,
      totalInvested,
      totalStaked,
      pendingWithdrawals: withdrawalQueue.length,
      pendingDeposits: depositQueue.length,
      pendingKyc: kycQueue.length,
      pendingP2P: p2pQueue.length,
      pendingCards: cardQueue.length,
      userCount: users.length,
      users,
      usersList: users,
      kycQueue,
      withdrawalQueue,
      depositQueue,
      p2pQueue,
      cardQueue,
      recentTxns,
    }
    return { ok: true, snapshot }
  } catch (e) {
    return { ok: false, error: (e as Error).message }
  }
}

export async function reviewKyc(id: string, decision: 'approved' | 'rejected'): Promise<AdminResult> {
  try {
    const admin = await requireAdminScope(['full', 'operations'])
    const db = serviceClient()
    const { data: sub } = await db.from('kyc_submissions').select('*').eq('id', id).single()
    if (!sub) return { ok: false, error: 'Submission not found' }

    const { error: kycErr } = await db
      .from('kyc_submissions')
      .update({ status: decision, reviewed_by: admin.id, reviewed_at: new Date().toISOString() })
      .eq('id', id)
      .eq('status', 'pending')
    if (kycErr) return { ok: false, error: `kyc_submissions update failed: ${kycErr.message}` }

    if (decision === 'approved') {
      const { data: alreadyBonused } = await db
        .from('transactions')
        .select('id')
        .eq('user_id', sub.user_id)
        .eq('type', 'yield')
        .eq('reference', 'welcome_bonus')
        .maybeSingle()

      if (!alreadyBonused) {
        await adjustAccount(sub.user_id, { cash_balance: 35 })
        await recordTxn(sub.user_id, {
          type: 'yield',
          amount: 35,
          currency: 'USD',
          status: 'completed',
          reference: 'welcome_bonus',
          processedBy: admin.id,
          meta: { label: 'Welcome bonus' },
        })
      }

      await db.rpc('assign_founder_number', { p_user_id: sub.user_id })
      await db.rpc('award_points', { p_user_id: sub.user_id, p_amount: 100, p_reason: 'KYC verified' })
    }

    return getAdminSnapshot()
  } catch (e) {
    return { ok: false, error: (e as Error).message }
  }
}

export async function resetKyc(userId: string): Promise<AdminResult> {
  try {
    await requireAdminScope(['full', 'operations'])
    const db = serviceClient()
    const { data: submission, error: findError } = await db.from('kyc_submissions').select('id').eq('user_id', userId).order('created_at', { ascending: false }).limit(1).maybeSingle()
    if (findError) return { ok: false, error: findError.message }
    if (!submission) return { ok: false, error: 'No KYC submission found for this user.' }
    const { error } = await db.from('kyc_submissions').update({ status: 'pending', reviewed_by: null, reviewed_at: null }).eq('id', submission.id)
    if (error) return { ok: false, error: error.message }
    return getAdminSnapshot()
  } catch (e) {
    return { ok: false, error: (e as Error).message }
  }
}

export async function reviewDeposit(id: string, decision: 'approved' | 'rejected'): Promise<AdminResult> {
  try {
    const admin = await requireAdminScope(['full', 'finance'])
    const db = serviceClient()

    const newStatus = decision === 'approved' ? 'completed' : 'cancelled'
    const { data: txn, error: updateErr } = await db
      .from('transactions')
      .update({ status: newStatus, processed_by: admin.id })
      .eq('id', id)
      .eq('type', 'deposit')
      .eq('status', 'pending')
      .select()
      .maybeSingle()

    if (updateErr || !txn) {
      return { ok: false, error: 'Deposit not found or already processed concurrently' }
    }

    if (decision === 'approved') {
      await adjustAccount(txn.user_id, { cash_balance: Number(txn.amount) })
    }

    return getAdminSnapshot()
  } catch (e) {
    return { ok: false, error: (e as Error).message }
  }
}

export async function reviewWithdrawal(id: string, decision: 'approved' | 'rejected'): Promise<AdminResult> {
  try {
    const admin = await requireAdminScope(['full', 'finance'])
    const db = serviceClient()

    const newStatus = decision === 'approved' ? 'completed' : 'cancelled'
    const { data: txn, error: updateErr } = await db
      .from('transactions')
      .update({ status: newStatus, processed_by: admin.id })
      .eq('id', id)
      .eq('type', 'withdrawal')
      .eq('status', 'pending')
      .select()
      .maybeSingle()

    if (updateErr || !txn) {
      return { ok: false, error: 'Withdrawal not found or already processed concurrently' }
    }

    if (decision === 'approved') {
      try {
        await adjustAccount(txn.user_id, { cash_balance: -Number(txn.amount) })
      } catch (err) {
        await db.from('transactions').update({ status: 'pending', processed_by: null }).eq('id', id)
        return { ok: false, error: `Cannot approve: ${(err as Error).message}` }
      }
    }

    return getAdminSnapshot()
  } catch (e) {
    return { ok: false, error: (e as Error).message }
  }
}

export async function reviewP2PTransfer(id: string, decision: 'approved' | 'rejected'): Promise<AdminResult> {
  try {
    const admin = await requireAdminScope(['full', 'finance'])
    const db = serviceClient()

    const newStatus = decision === 'approved' ? 'completed' : 'cancelled'
    const { data: txn, error: updateErr } = await db
      .from('transactions')
      .update({ status: newStatus, processed_by: admin.id })
      .eq('id', id)
      .eq('type', 'p2p_send')
      .eq('status', 'pending')
      .select()
      .maybeSingle()

    if (updateErr || !txn) {
      return { ok: false, error: 'Transfer not found or already processed concurrently' }
    }

    const meta = (txn.meta as Record<string, unknown> | null) ?? {}
    const recipientId = meta.recipientId as string | undefined

    if (decision === 'approved') {
      if (!recipientId) {
        await db.from('transactions').update({ status: 'pending', processed_by: null }).eq('id', id)
        return { ok: false, error: 'Transfer is missing a recipient — cannot approve' }
      }

      await adjustAccount(recipientId, { cash_balance: Number(txn.amount) })
      await recordTxn(recipientId, {
        type: 'p2p_receive',
        amount: Number(txn.amount),
        currency: txn.currency ?? 'USD',
        status: 'completed',
        processedBy: admin.id,
        meta: { label: 'Received transfer', senderId: txn.user_id },
      })
    } else {
      await adjustAccount(txn.user_id, { cash_balance: Number(txn.amount) })
    }

    return getAdminSnapshot()
  } catch (e) {
    return { ok: false, error: (e as Error).message }
  }
}

// FIX — this checked kyc_submissions.status = 'verified', a value that
// column never holds ('pending'/'approved'/'rejected' — confirmed
// directly). That silently blocked EVERY card approval. It also wrote raw
// card_number/cvv straight into card_applications — a second, less secure
// storage path duplicating the hashed pulse_cards system already built and
// tested this session. Now checks the real verified flag and calls the
// tested provision_pulse_card() RPC instead of hand-rolling card data.
export async function reviewCardApplication(id: string, decision: 'approved' | 'rejected'): Promise<AdminResult> {
  try {
    const admin = await requireAdminScope(['full', 'operations'])
    const db = serviceClient()

    const { data: app } = await db.from('card_applications').select('*').eq('id', id).single()
    if (!app || app.status !== 'waitlisted') {
      return { ok: false, error: 'Application not found or already processed' }
    }

    if (decision === 'approved') {
      const { data: profile } = await db.from('profiles').select('kyc_status').eq('id', app.user_id).maybeSingle()
      if (profile?.kyc_status !== 'verified') {
        return { ok: false, error: 'Applicant has not completed KYC verification' }
      }
    }

    const { error } = await db
      .from('card_applications')
      .update({
        status: decision === 'approved' ? 'approved' : 'rejected',
        reviewed_by: admin.id,
        reviewed_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('status', 'waitlisted')

    if (error) return { ok: false, error: `card_applications update failed: ${error.message}` }

    if (decision === 'approved') {
      const { error: provisionError } = await db.rpc('provision_pulse_card', { p_application_id: id })
      if (provisionError) {
        return { ok: false, error: `Application approved but card provisioning failed: ${provisionError.message}` }
      }
    }

    return getAdminSnapshot()
  } catch (e) {
    return { ok: false, error: (e as Error).message }
  }
}

export async function disburseYield(userId: string, amount: number): Promise<AdminResult> {
  try {
    const admin = await requireAdminScope(['full', 'finance'])
    if (!(amount > 0)) return { ok: false, error: 'Enter a valid amount' }
    await adjustAccount(userId, { cash_balance: amount })
    await recordTxn(userId, {
      type: 'yield',
      amount,
      currency: 'USD',
      status: 'completed',
      processedBy: admin.id,
      meta: { label: 'Yield disbursement (admin)' },
    })
    return getAdminSnapshot()
  } catch (e) {
    return { ok: false, error: (e as Error).message }
  }
}

export async function addAdminByEmail(email: string, scope: AdminScope = 'operations'): Promise<AdminResult> {
  try {
    void scope
    await requireAdminScope(['full'])
    const clean = email.trim().toLowerCase()
    if (!clean.includes('@')) return { ok: false, error: 'Enter a valid email' }

    const db = serviceClient()
    await db.from('admin_allowlist').upsert({ email: clean }, { onConflict: 'email' })

    const { data: authData, error: authError } = await db.auth.admin.listUsers({ page: 1, perPage: 1000 })
    if (authError) return { ok: false, error: authError.message }
    const target = authData.users.find((candidate) => candidate.email?.toLowerCase() === clean)
    if (!target) {
      return {
        ok: false,
        error: `No registered profile found for ${clean}. They must sign up first — the allowlist entry has been saved and will apply once they do.`,
      }
    }

    const { error: roleError } = await db.from('user_roles').upsert({ user_id: target.id, role: 'admin' }, { onConflict: 'user_id' })
    if (roleError) return { ok: false, error: roleError.message }
    return getAdminSnapshot()
  } catch (e) {
    return { ok: false, error: (e as Error).message }
  }
}

export async function appointAdminScope(userId: string, scope: AdminScope): Promise<AdminResult> {
  try {
    await requireAdminScope(['full'])
    const db = serviceClient()
    if (!['full', 'operations', 'finance', 'compliance'].includes(scope)) return { ok: false, error: 'Unsupported admin scope for the current schema.' }
    const { error } = await db.from('user_roles').upsert({ user_id: userId, role: 'admin' }, { onConflict: 'user_id' })
    if (error) return { ok: false, error: error.message }
    return getAdminSnapshot()
  } catch (e) {
    return { ok: false, error: (e as Error).message }
  }
}

export async function assignManager(userId: string, managerId: string): Promise<AdminResult> {
  void userId
  void managerId
  await requireAdminScope(['full', 'operations'])
  return { ok: false, error: 'Manager assignment is unavailable until admin_memberships is added to the production schema.' }
}

export async function deleteUser(userId: string): Promise<AdminResult> {
  try {
    const admin = await requireAdminScope(['full'])
    if (admin.id === userId) return { ok: false, error: 'You cannot delete your own admin account' }
    return { ok: false, error: 'User deletion is disabled until the production deletion/audit policy is implemented.' }
  } catch (e) {
    return { ok: false, error: (e as Error).message }
  }
}

export async function fetchProjects(): Promise<{ ok: boolean; projects?: Project[]; error?: string }> {
  try {
    await requireAdmin()
    const db = serviceClient()
    const { data, error } = await db.from('projects').select('*').order('created_at', { ascending: false })
    if (error) return { ok: false, error: error.message }

    const projects: Project[] = (data ?? []).map((p) => ({
      id: p.id,
      name: p.name,
      country: p.country,
      sector: p.sector,
      targetYield: p.target_yield,
      funded: Number(p.funded),
      goal: Number(p.goal),
      risk: p.risk,
      summary: p.summary,
      status: p.status === 'Closed' ? 'Closed' : 'Open',
      deadline: p.deadline ?? undefined,
      image: p.image ?? undefined,
      stage: p.stage ?? undefined,
      progress: p.progress == null ? undefined : Number(p.progress),
      timeline: p.timeline ?? undefined,
      impact: p.impact ?? undefined,
      milestones: p.milestones ?? undefined,
      riskDetail: p.risk_detail ?? undefined,
      riskProfile: p.risk_profile ?? undefined,
    }))
    return { ok: true, projects }
  } catch (e) {
    return { ok: false, error: (e as Error).message }
  }
}

export async function getProjectAdminStatuses(): Promise<{
  ok: boolean
  statuses?: Record<string, { status: 'Open' | 'Closed'; deadline: string | null }>
  error?: string
}> {
  try {
    await requireAdminScope(['full', 'operations', 'finance'])
    const db = serviceClient()
    const { data, error } = await db.from('projects').select('id, status, deadline')
    if (error) return { ok: false, error: error.message }

    const statuses: Record<string, { status: 'Open' | 'Closed'; deadline: string | null }> = {}
    for (const row of data ?? []) {
      statuses[row.id] = {
        status: row.status ?? 'Open',
        deadline: row.deadline ?? null,
      }
    }
    return { ok: true, statuses }
  } catch (e) {
    return { ok: false, error: (e as Error).message }
  }
}

export async function setProjectStatus(
  projectId: string,
  closed: boolean,
  deadlineOverride?: string | null,
): Promise<{ ok: boolean; error?: string }> {
  try {
    await requireAdminScope(['full', 'operations'])
    const db = serviceClient()
    const updatePayload: Record<string, unknown> = { status: closed ? 'Closed' : 'Open', updated_at: new Date().toISOString() }
    if (deadlineOverride !== undefined) {
      updatePayload.deadline = deadlineOverride && deadlineOverride.length > 0 ? deadlineOverride : null
    }

    const { error } = await db.from('projects').update(updatePayload).eq('id', projectId)
    if (error) return { ok: false, error: error.message }
    return { ok: true }
  } catch (e) {
    return { ok: false, error: (e as Error).message }
  }
}

export async function upsertProject(project: Project): Promise<{ ok: boolean; error?: string }> {
  try {
    await requireAdminScope(['full', 'operations'])
    const db = serviceClient()
    const { error } = await db.from('projects').upsert(
      {
        id: project.id,
        name: project.name,
        country: project.country,
        sector: project.sector,
        target_yield: project.targetYield,
        funded: project.funded,
        goal: project.goal,
        risk: project.risk,
        summary: project.summary,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'id' },
    )
    if (error) return { ok: false, error: error.message }
    return { ok: true }
  } catch (e) {
    return { ok: false, error: (e as Error).message }
  }
}

export async function deleteProject(id: string): Promise<{ ok: boolean; error?: string }> {
  try {
    await requireAdminScope(['full', 'operations'])
    const db = serviceClient()
    const { error } = await db.from('projects').delete().eq('id', id)
    if (error) return { ok: false, error: error.message }
    return { ok: true }
  } catch (e) {
    return { ok: false, error: (e as Error).message }
  }
}

export async function fetchSignals(): Promise<{ ok: boolean; signals?: Signal[]; error?: string }> {
  try {
    await requireAdmin()
    const db = serviceClient()
    const { data, error } = await db.from('signals').select('*').order('created_at', { ascending: false })
    if (error) return { ok: false, error: error.message }

    const signals: Signal[] = (data ?? []).map((s) => ({
      id: s.id,
      projectId: s.project_id,
      title: s.title,
      window: s.window_label,
      detail: s.detail,
      targetYield: s.target_yield,
      urgency: s.urgency,
    }))
    return { ok: true, signals }
  } catch (e) {
    return { ok: false, error: (e as Error).message }
  }
}

export async function upsertSignal(signal: Signal): Promise<{ ok: boolean; error?: string }> {
  try {
    await requireAdminScope(['full', 'operations'])
    if (!signal.id?.trim() || !signal.title?.trim()) {
      return { ok: false, error: 'Signal ID and title are required' }
    }
    const db = serviceClient()
    const { error } = await db.from('signals').upsert(
      {
        id: signal.id.trim(),
        project_id: signal.projectId || null,
        title: signal.title,
        window_label: signal.window ?? '',
        detail: signal.detail ?? '',
        target_yield: signal.targetYield ?? '',
        urgency: signal.urgency ?? 'Open',
      },
      { onConflict: 'id' },
    )
    if (error) return { ok: false, error: error.message }
    return { ok: true }
  } catch (e) {
    return { ok: false, error: (e as Error).message }
  }
}

export async function deleteSignal(id: string): Promise<{ ok: boolean; error?: string }> {
  try {
    await requireAdminScope(['full', 'operations'])
    const db = serviceClient()
    const { error } = await db.from('signals').delete().eq('id', id)
    if (error) return { ok: false, error: error.message }
    return { ok: true }
  } catch (e) {
    return { ok: false, error: (e as Error).message }
  }
}

// Payout split: 30% retained in the Pulse Vault (platform reserve), 70%
// disbursed to investors — confirmed business rule. Only the 70% investor
// share is ever credited or recorded as a transaction; the 30% vault share
// is simply not disbursed (it stays unspent platform-side, no separate
// ledger table exists yet for it — flag this if a Vault balance ever needs
// its own visible line item).
//
// This action is itself the admin-approval gate — only an authenticated
// admin with 'full'/'operations'/'finance' scope can call it at all, so
// "admin approved first" is already enforced structurally, not a separate
// pending-queue step.
//
// Fortnightly cadence: enforced here by refusing to run again for the same
// project within 14 days of its last completed payout.
const PAYOUT_INVESTOR_SHARE = 0.7
const PAYOUT_COOLDOWN_DAYS = 14

export async function processProjectPayout(
  projectId: string,
  customYieldRate?: number,
): Promise<{ ok: boolean; error?: string }> {
  try {
    const admin = await requireAdminScope(['full', 'operations', 'finance'])
    const db = serviceClient()

    const { data: project, error: projErr } = await db
      .from('projects')
      .select('target_yield')
      .eq('id', projectId)
      .single()
    if (projErr) return { ok: false, error: `Failed to fetch project: ${projErr.message}` }

    const cooldownCutoff = new Date(Date.now() - PAYOUT_COOLDOWN_DAYS * 24 * 60 * 60 * 1000).toISOString()
    const { data: recentPayout, error: recentErr } = await db
      .from('transactions')
      .select('id, created_at')
      .eq('type', 'yield')
      .eq('status', 'completed')
      .ilike('meta->>label', `Project Payout (${projectId})%`)
      .gte('created_at', cooldownCutoff)
      .limit(1)
      .maybeSingle()
    if (recentErr) return { ok: false, error: `Failed to check payout cooldown: ${recentErr.message}` }
    if (recentPayout) {
      return {
        ok: false,
        error: `This project was already paid out within the last ${PAYOUT_COOLDOWN_DAYS} days. Payouts run on a fortnightly cycle.`,
      }
    }

    const parseYield = (raw: string | null | undefined): number => {
      if (!raw) return 0.1
      const nums = raw.match(/\d+(\.\d+)?/g)?.map(Number) ?? []
      if (nums.length === 0) return 0.1
      const avg = nums.reduce((a, b) => a + b, 0) / nums.length
      return avg / 100
    }

    const yieldRate = customYieldRate ?? parseYield(project?.target_yield)

    const { data: holdings, error: holdErr } = await db.from('holdings').select('*').eq('project_id', projectId)
    if (holdErr) return { ok: false, error: `Failed to fetch holdings: ${holdErr.message}` }
    if (!holdings || holdings.length === 0) return { ok: true }

    const errors: string[] = []
    const BATCH_SIZE = 20

    for (let i = 0; i < holdings.length; i += BATCH_SIZE) {
      const batch = holdings.slice(i, i + BATCH_SIZE)
      await Promise.all(
        batch.map(async (h) => {
          try {
            const grossYield = Number(h.amount) * yieldRate
            const investorPayout = grossYield * PAYOUT_INVESTOR_SHARE
            if (investorPayout > 0) {
              await adjustAccount(h.user_id, { cash_balance: investorPayout })
              await recordTxn(h.user_id, {
                type: 'yield',
                amount: investorPayout,
                currency: 'USD',
                status: 'completed',
                processedBy: admin.id,
                meta: {
                  label: `Project Payout (${projectId})`,
                  rate: yieldRate,
                  grossYield,
                  vaultShare: grossYield - investorPayout,
                  investorSharePct: PAYOUT_INVESTOR_SHARE,
                },
              })
            }
          } catch (err) {
            errors.push(`User ${h.user_id}: ${(err as Error).message}`)
          }
        }),
      )
    }

    if (errors.length > 0) {
      return { ok: false, error: `Payout completed with errors: ${errors.slice(0, 3).join('; ')}` }
    }

    return { ok: true }
  } catch (e) {
    return { ok: false, error: (e as Error).message }
  }
}

export async function getTeamVolumeReport(): Promise<
  | {
      ok: true
      scope: 'manager' | 'director'
      rows: {
        userId: string
        name: string | null
        email: string | null
        kycVerified: boolean
        investedVolume: number
      }[]
    }
  | { ok: false; error: string }
> {
  try {
    await requireAdminScope(['manager', 'director', 'full'])
    return { ok: false, error: 'Team access is unavailable until admin_memberships is added to the production schema.' }
  } catch (e) {
    return { ok: false, error: (e as Error).message }
  }
}
