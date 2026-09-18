'use server'

import { createClient } from '@/lib/supabase/server'
import { serviceClient } from '@/lib/pulse/service'
import { randomInt, randomBytes, scryptSync } from 'node:crypto'
import { adjustAccount, isUserAdmin, recordTxn } from '@/lib/pulse/data-access'
import type {
  AdminSnapshot,
  AdminUserRow,
  AdminKycRow,
  AdminTxnRow,
  AdminCardRow,
  AdminP2PRow,
} from '@/lib/pulse/types'
// FIX #4 — BUILD BLOCKER. This used to import from '@/lib/pulse/pulse-data',
// a path that does not exist. The real module is '@/lib/pulse-data'.
import type { Project, Signal } from '@/lib/pulse-data'

type AdminScope = 'full' | 'finance' | 'operations' | 'manager' | 'director'

// ==========================================
// AUTHORIZATION HELPERS
// ==========================================

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
  const { data } = await db.from('profiles').select('admin_scope').eq('id', user.id).maybeSingle()

  const scope = data?.admin_scope as AdminScope | null

  // No implicit privilege. An admin with no scope set can only perform
  // actions that explicitly allow 'operations'.
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

// ==========================================
// SNAPSHOT & CORE DASHBOARD
// ==========================================

export async function getAdminSnapshot(): Promise<AdminResult> {
  try {
    await requireAdmin()
    const db = serviceClient()

    const [{ data: profiles }, { data: accounts }, { data: kyc }, { data: txns }, { data: cardApps }] =
      await Promise.all([
        db.from('profiles').select('*').order('created_at', { ascending: false }).limit(500),
        db.from('accounts').select('*').limit(500),
        db.from('kyc_submissions').select('*').eq('status', 'pending').order('created_at', { ascending: false }),
        db.from('transactions').select('*').order('created_at', { ascending: false }).limit(200),
        db.from('card_applications').select('*').order('created_at', { ascending: false }).limit(200),
      ])

    const acctMap = new Map((accounts ?? []).map((a) => [a.user_id, a]))
    const emailMap = new Map((profiles ?? []).map((p) => [p.id, p.email]))
    const profileMap = new Map((profiles ?? []).map((p) => [p.id, p]))

    const users: AdminUserRow[] = (profiles ?? []).map((p) => {
      const a = acctMap.get(p.id)
      return {
        id: p.id,
        email: p.email,
        fullName: p.full_name,
        username: p.username,
        role: p.role,
        kycStatus: p.kyc_status,
        // FIX #5 — admin.tsx renders `u.kycVerified` to decide the
        // Verified/Pending pill. It was never in the payload, so every user
        // showed "Pending" regardless of their real KYC state.
        kycVerified: p.kyc_status === 'verified',
        cash: Number(a?.cash_balance ?? 0),
        invested: Number(a?.invested_balance ?? 0),
        staked: Number(a?.staked_balance ?? 0),
        createdAt: new Date(p.created_at).getTime(),
        adminScope: p.admin_scope ?? null,
        managerId: p.managed_by ?? null,
        isAdmin: p.role === 'admin' || p.role === 'super_admin',
      }
    })

    const totalDeposits = (txns ?? [])
      .filter((t) => t.type === 'deposit' && t.status === 'completed')
      .reduce((s, t) => s + Number(t.amount), 0)

    const totalInvested = (accounts ?? []).reduce((s, a) => s + Number(a.invested_balance ?? 0), 0)
    const totalStaked = (accounts ?? []).reduce((s, a) => s + Number(a.staked_balance ?? 0), 0)

    const depositQueue: AdminTxnRow[] = (txns ?? [])
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
          payCurrency: (meta.payCurrency as string | null) ?? null,
          userTxRef: (meta.userTxRef as string | null) ?? null,
        }
      })

    const withdrawalQueue: AdminTxnRow[] = (txns ?? [])
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
          // FIX #6 — requestWithdrawal() stores meta.destinationAddress, but
          // this read meta.wallet, so the admin queue always showed "N/A" for
          // the destination. Both keys are now accepted.
          destinationAddress:
            ((meta.destinationAddress as string | null) ?? (meta.wallet as string | null)) ?? null,
          walletName: (meta.walletName as string | null) ?? null,
          network: (meta.network as string | null) ?? null,
          broker: (meta.broker as string | null) ?? null,
        }
      })

    const p2pQueue: AdminP2PRow[] = (txns ?? [])
      .filter((t) => t.type === 'p2p_send' && t.status === 'pending')
      .map((t) => {
        const meta = (t.meta as Record<string, unknown> | null) ?? {}
        const recipientId = meta.recipientId as string | undefined
        return {
          id: t.id,
          senderId: t.user_id,
          senderEmail: emailMap.get(t.user_id) ?? null,
          recipientId: recipientId ?? '',
          recipientEmail: recipientId ? emailMap.get(recipientId) ?? null : null,
          type: t.type,
          amount: Number(t.amount),
          currency: t.currency,
          status: t.status,
          reference: t.reference,
          note: (meta.note as string | null) ?? null,
          createdAt: new Date(t.created_at).getTime(),
        }
      })

    const recentTxns: AdminTxnRow[] = (txns ?? []).slice(0, 40).map((t) => ({
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

    const cardQueue: AdminCardRow[] = (cardApps ?? [])
      .filter((c) => c.status === 'waitlisted')
      .map((c) => {
        const p = profileMap.get(c.user_id)
        return {
          id: c.id,
          userId: c.user_id,
          email: emailMap.get(c.user_id) ?? null,
          fullName: p?.full_name ?? null,
          cardType: c.card_type ?? 'virtual',
          shippingAddress: c.shipping_address ?? null,
          kycStatus: p?.kyc_status ?? 'none',
          status: c.status,
          createdAt: new Date(c.created_at).getTime(),
        }
      })

    const kycQueue: AdminKycRow[] = (kyc ?? []).map((k) => ({
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
      // FIX #7 — admin.tsx maps over `snapshot.usersList`, which this action
      // never returned. The Users tab rendered an empty table on every load.
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

// ==========================================
// KYC & USER MANAGEMENT ACTIONS
// ==========================================

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

    const { error: profErr } = await db
      .from('profiles')
      .update({ kyc_status: decision === 'approved' ? 'verified' : 'rejected' })
      .eq('id', sub.user_id)
    if (profErr) return { ok: false, error: `profiles update failed: ${profErr.message}` }

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
          // FIX #8 — the duplicate guard above looks up reference ===
          // 'welcome_bonus', but the insert never set a reference. Every KYC
          // re-approval therefore paid the $35 bonus again.
          reference: 'welcome_bonus',
          processedBy: admin.id,
          meta: { label: 'Welcome bonus' },
        })
      }

      await db.rpc('assign_founder_number', { p_user_id: sub.user_id })
      await db.rpc('award_points', { p_user_id: sub.user_id, p_amount: 100, p_reason: 'KYC verified' })

      const { data: verifiedProfile } = await db
        .from('profiles')
        .select('referred_by')
        .eq('id', sub.user_id)
        .maybeSingle()
      if (verifiedProfile?.referred_by) {
        await db.rpc('award_points', {
          p_user_id: verifiedProfile.referred_by,
          p_amount: 100,
          p_reason: 'Your referral completed KYC',
        })
      }
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
    const { error: profErr } = await db.from('profiles').update({ kyc_status: 'none' }).eq('id', userId)
    if (profErr) return { ok: false, error: `profiles update failed: ${profErr.message}` }
    return getAdminSnapshot()
  } catch (e) {
    return { ok: false, error: (e as Error).message }
  }
}

// ==========================================
// TRANSACTION REVIEW ACTIONS (ATOMIC GUARDS)
// ==========================================

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

    // FIX #9 — MONEY BUG. requestWithdrawal() never debits; it only logs a
    // pending row. The old code refunded cash_balance on *rejection*, crediting
    // money that was never taken. Approval is what must debit.
    if (decision === 'approved') {
      try {
        await adjustAccount(txn.user_id, { cash_balance: -Number(txn.amount) })
      } catch (err) {
        // Roll the row back to pending so it is not silently marked paid
        // when the account can no longer cover it.
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
      // requestTransfer() debits the sender immediately, so a rejection is the
      // one case here that genuinely needs a refund.
      await adjustAccount(txn.user_id, { cash_balance: Number(txn.amount) })
    }

    return getAdminSnapshot()
  } catch (e) {
    return { ok: false, error: (e as Error).message }
  }
}

export async function reviewCardApplication(id: string, decision: 'approved' | 'rejected'): Promise<AdminResult> {
  try {
    const admin = await requireAdminScope(['full', 'operations'])
    const db = serviceClient()

    const { data: app } = await db.from('card_applications').select('*').eq('id', id).single()
    if (!app || app.status !== 'waitlisted') {
      return { ok: false, error: 'Application not found or already processed' }
    }

    if (decision === 'approved') {
      const { data: profile } = await db.from('kyc_submissions').select('status').eq('user_id', app.user_id).eq('status', 'verified').maybeSingle()
      if (!profile) {
        return { ok: false, error: 'Applicant has not completed KYC verification' }
      }
    }

  const cardNumber =
  decision === 'approved'
  ? `PULSE-${Array.from({ length: 4 }, () => randomInt(1000, 10000)).join('-')}`
  : null
  const cvv = decision === 'approved' ? String(randomInt(100, 1000)) : null
  const cvvSalt = cvv ? randomBytes(16).toString('hex') : null
  const cvvHash = cvv && cvvSalt ? `${cvvSalt}:${scryptSync(cvv, cvvSalt, 32).toString('hex')}` : null
  const { data: authUser } = decision === 'approved' ? await db.auth.admin.getUserById(app.user_id) : { data: { user: null } }
  const cardholderName = authUser.user?.user_metadata?.full_name ?? authUser.user?.user_metadata?.name ?? authUser.user?.email?.split('@')[0] ?? 'Pulse Member'

  const { error } = await db


      .from('card_applications')
      .update({
        status: decision === 'approved' ? 'approved' : 'rejected',
        reviewed_by: admin.id,
        reviewed_at: new Date().toISOString(),
        ...(decision === 'approved' ? {
          card_number: cardNumber,
          card_number_last4: cardNumber?.slice(-4),
          cvv,
          expiry_month: new Date().getMonth() + 1,
          expiry_year: new Date().getFullYear() + 5,
          cardholder_name: cardholderName,
          updated_at: new Date().toISOString(),
        } : {}),
      })
      .eq('id', id)
  .eq('status', 'pending')

  if (error) return { ok: false, error: `card_applications update failed: ${error.message}` }

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

// FIX #10 — admin.tsx calls addAdminByEmail(email, scope) with two arguments,
// but this action only accepted one. The scope was silently dropped, so every
// appointed admin ended up with admin_scope = null and then hit "requires an
// explicit admin scope configuration" on almost every action.
export async function addAdminByEmail(email: string, scope: AdminScope = 'operations'): Promise<AdminResult> {
  try {
    await requireAdminScope(['full'])
    const clean = email.trim().toLowerCase()
    if (!clean.includes('@')) return { ok: false, error: 'Enter a valid email' }

    const db = serviceClient()
    await db.from('admin_allowlist').upsert({ email: clean }, { onConflict: 'email' })

    const { data: updated, error } = await db
      .from('profiles')
      .update({ role: 'admin', admin_scope: scope })
      .ilike('email', clean)
      .select('id')

    if (error) return { ok: false, error: error.message }
    if (!updated || updated.length === 0) {
      return {
        ok: false,
        error: `No registered profile found for ${clean}. They must sign up first — the allowlist entry has been saved and will apply once they do.`,
      }
    }

    return getAdminSnapshot()
  } catch (e) {
    return { ok: false, error: (e as Error).message }
  }
}

export async function appointAdminScope(userId: string, scope: AdminScope): Promise<AdminResult> {
  try {
    await requireAdminScope(['full'])
    const db = serviceClient()
    const { error } = await db.from('profiles').update({ admin_scope: scope, role: 'admin' }).eq('id', userId)
    if (error) return { ok: false, error: error.message }
    return getAdminSnapshot()
  } catch (e) {
    return { ok: false, error: (e as Error).message }
  }
}

export async function assignManager(userId: string, managerId: string): Promise<AdminResult> {
  try {
    await requireAdminScope(['full', 'operations'])
    const db = serviceClient()
    const clean = managerId.trim()
    const { error } = await db
      .from('profiles')
      .update({ managed_by: clean.length > 0 ? clean : null })
      .eq('id', userId)
    if (error) return { ok: false, error: error.message }
    return getAdminSnapshot()
  } catch (e) {
    return { ok: false, error: (e as Error).message }
  }
}

export async function deleteUser(userId: string): Promise<AdminResult> {
  try {
    const admin = await requireAdminScope(['full'])
    if (admin.id === userId) return { ok: false, error: 'You cannot delete your own admin account' }
    const db = serviceClient()
    const { error } = await db.from('profiles').delete().eq('id', userId)
    if (error) return { ok: false, error: error.message }
    return getAdminSnapshot()
  } catch (e) {
    return { ok: false, error: (e as Error).message }
  }
}

// ==========================================
// PROJECT MANAGEMENT ACTIONS
// ==========================================

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
      status: p.status,
      deadline: p.deadline,
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
    const updatePayload: Record<string, unknown> = { status: closed ? 'Closed' : 'Open' }
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
        status: project.status ?? 'Open',
        deadline: project.deadline ?? null,
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

// ==========================================
// SIGNAL MANAGEMENT ACTIONS
// ==========================================

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

// ==========================================
// BATCHED PROJECT PAYOUT
// ==========================================

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

    // target_yield is stored as a range string like "12–15%". parseFloat would
    // silently take only the lower bound, so the midpoint is used instead.
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
            const yieldPayout = Number(h.amount) * yieldRate
            if (yieldPayout > 0) {
              await adjustAccount(h.user_id, { cash_balance: yieldPayout })
              await recordTxn(h.user_id, {
                type: 'yield',
                amount: yieldPayout,
                currency: 'USD',
                status: 'completed',
                processedBy: admin.id,
                meta: { label: `Project Payout (${projectId})`, rate: yieldRate },
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

// ==========================================
// TEAM VOLUME REPORT
// ==========================================

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
    const user = await requireAdminScope(['manager', 'director', 'full'])
    const db = serviceClient()
    const { data: me } = await db.from('profiles').select('admin_scope').eq('id', user.id).maybeSingle()
    const scope: 'manager' | 'director' = me?.admin_scope === 'director' ? 'director' : 'manager'

    let teamIds: string[] = []
    if (scope === 'director') {
      const { data: managers } = await db.from('profiles').select('id').eq('reports_to_director', user.id)
      const managerIds = (managers ?? []).map((m) => m.id)
      const { data: managed } = managerIds.length
        ? await db.from('profiles').select('id').in('managed_by', managerIds)
        : { data: [] as { id: string }[] }
      teamIds = (managed ?? []).map((m) => m.id)
    } else {
      const { data: managed } = await db.from('profiles').select('id').eq('managed_by', user.id)
      teamIds = (managed ?? []).map((m) => m.id)
    }

    if (teamIds.length === 0) return { ok: true, scope, rows: [] }

    const [{ data: people }, { data: holdings }] = await Promise.all([
      db.from('profiles').select('id, full_name, email, kyc_status').in('id', teamIds),
      db.from('holdings').select('user_id, amount').in('user_id', teamIds),
    ])

    const volumeMap = new Map<string, number>()
    for (const h of holdings ?? []) {
      const current = volumeMap.get(h.user_id) ?? 0
      volumeMap.set(h.user_id, current + Number(h.amount))
    }

    const rows = (people ?? []).map((p) => ({
      userId: p.id,
      name: p.full_name,
      email: p.email,
      kycVerified: p.kyc_status === 'verified',
      investedVolume: volumeMap.get(p.id) ?? 0,
    }))

    return { ok: true, scope, rows }
  } catch (e) {
    return { ok: false, error: (e as Error).message }
  }
}
