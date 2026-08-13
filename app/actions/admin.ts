'use server'

import { createClient } from '@/lib/supabase/server'
import { serviceClient } from '@/lib/pulse/service'
import { adjustAccount, isUserAdmin, recordTxn } from '@/lib/pulse/data-access'
import type { AdminSnapshot } from '@/lib/pulse/types'
import type { Project, Signal } from '@/lib/pulse/pulse-data'

async function requireAdmin() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')
  if (!(await isUserAdmin(user.id))) throw new Error('Admin access required')
  return user
}

async function requireAdminScope(allowed: Array<'full' | 'finance' | 'operations' | 'manager' | 'director'>) {
  const user = await requireAdmin()
  const db = serviceClient()
  const { data } = await db.from('profiles').select('admin_scope').eq('id', user.id).maybeSingle()
  const scope = (data?.admin_scope as 'full' | 'finance' | 'operations' | 'manager' | 'director' | null) ?? 'full'
  if (!allowed.includes(scope)) throw new Error(`This action requires ${allowed.join(' or ')} admin access`)
  return user
}

type AdminResult = { ok: true; snapshot: AdminSnapshot } | { ok: false; error: string }

export async function getAdminSnapshot(): Promise<AdminResult> {
  try {
    await requireAdmin()
    const db = serviceClient()
    const [{ data: profiles }, { data: accounts }, { data: kyc }, { data: txns }, { data: cardApps }] = await Promise.all([
      db.from('profiles').select('*').order('created_at', { ascending: false }),
      db.from('accounts').select('*'),
      db.from('kyc_submissions').select('*').eq('status', 'pending').order('created_at', { ascending: false }),
      db.from('transactions').select('*').order('created_at', { ascending: false }).limit(200),
      db.from('card_applications').select('*').order('created_at', { ascending: false }),
    ])

    const acctMap = new Map((accounts ?? []).map((a) => [a.user_id, a]))
    const emailMap = new Map((profiles ?? []).map((p) => [p.id, p.email]))
    const profileMap = new Map((profiles ?? []).map((p) => [p.id, p]))

    const users = (profiles ?? []).map((p) => {
      const a = acctMap.get(p.id)
      return {
        id: p.id,
        email: p.email,
        fullName: p.full_name,
        username: p.username,
        role: p.role,
        kycStatus: p.kyc_status,
        cash: Number(a?.cash_balance ?? 0),
        invested: Number(a?.invested_balance ?? 0),
        staked: Number(a?.staked_balance ?? 0),
        createdAt: new Date(p.created_at).getTime(),
        adminScope: p.admin_scope ?? null,
        managerId: p.managed_by ?? null,
        isAdmin: p.role === 'admin',
      }
    })

    // FIXED: Calculate real total deposits from verified/completed deposit transactions
    const totalDeposits = (txns ?? [])
      .filter((t) => t.type === 'deposit' && t.status === 'completed')
      .reduce((s, t) => s + Number(t.amount), 0)

    const totalInvested = (accounts ?? []).reduce((s, a) => s + Number(a.invested_balance), 0)
    const totalStaked = (accounts ?? []).reduce((s, a) => s + Number(a.staked_balance), 0)

    const depositQueue = (txns ?? [])
      .filter((t) => t.type === 'deposit' && t.status === 'pending')
      .map((t) => ({
        id: t.id,
        userId: t.user_id,
        email: emailMap.get(t.user_id) ?? null,
        type: t.type,
        amount: Number(t.amount),
        currency: t.currency,
        status: t.status,
        reference: t.reference,
        createdAt: new Date(t.created_at).getTime(),
        settledStatus: ((t.meta as Record<string, unknown> | null)?.settled_status as string | null) ?? null,
        payCurrency: ((t.meta as Record<string, unknown> | null)?.payCurrency as string | null) ?? null,
        userTxRef: ((t.meta as Record<string, unknown> | null)?.userTxRef as string | null) ?? null,
      }))

    const withdrawalQueue = (txns ?? [])
      .filter((t) => t.type === 'withdrawal' && t.status === 'pending')
      .map((t) => ({
        id: t.id,
        userId: t.user_id,
        email: emailMap.get(t.user_id) ?? null,
        type: t.type,
        amount: Number(t.amount),
        currency: t.currency,
        status: t.status,
        reference: t.reference,
        createdAt: new Date(t.created_at).getTime(),
        destinationAddress: ((t.meta as Record<string, unknown> | null)?.wallet as string | null) ?? null,
        walletName: ((t.meta as Record<string, unknown> | null)?.walletName as string | null) ?? null,
        network: ((t.meta as Record<string, unknown> | null)?.network as string | null) ?? null,
        broker: ((t.meta as Record<string, unknown> | null)?.broker as string | null) ?? null,
      }))

    const p2pQueue = (txns ?? [])
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

    const recentTxns = (txns ?? []).slice(0, 40).map((t) => ({
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

    const cardQueue = (cardApps ?? [])
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

    const kycQueue = (kyc ?? []).map((k) => ({
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
        .ilike('reference', 'welcome_bonus')
        .maybeSingle()
      if (!alreadyBonused) {
        await adjustAccount(sub.user_id, { cash_balance: 35 })
        await recordTxn(sub.user_id, {
          type: 'yield',
          amount: 35,
          currency: 'USD',
          status: 'completed',
          processedBy: admin.id,
          meta: { label: 'Welcome bonus' },
        })
      }

      const { error: founderErr } = await db.rpc('assign_founder_number', { p_user_id: sub.user_id })
      if (founderErr) console.error('assign_founder_number failed:', founderErr.message)

      const { error: kycPointsErr } = await db.rpc('award_points', { p_user_id: sub.user_id, p_amount: 100, p_reason: 'KYC verified' })
      if (kycPointsErr) console.error('award_points (kyc self) failed:', kycPointsErr.message)

      const { data: verifiedProfile } = await db.from('profiles').select('referred_by').eq('id', sub.user_id).maybeSingle()
      if (verifiedProfile?.referred_by) {
        const { error: refPointsErr } = await db.rpc('award_points', { p_user_id: verifiedProfile.referred_by, p_amount: 100, p_reason: 'Your referral completed KYC' })
        if (refPointsErr) console.error('award_points (kyc referrer) failed:', refPointsErr.message)
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
    const { error: profErr } = await db
      .from('profiles')
      .update({ kyc_status: 'none' })
      .eq('id', userId)
    if (profErr) return { ok: false, error: `profiles update failed: ${profErr.message}` }
    return getAdminSnapshot()
  } catch (e) {
    return { ok: false, error: (e as Error).message }
  }
}

export async function reviewDeposit(id: string, decision: 'approved' | 'rejected'): Promise<AdminResult> {
  try {
    const admin = await requireAdminScope(['full', 'finance'])
    const db = serviceClient()
    const { data: txn } = await db.from('transactions').select('*').eq('id', id).single()
    if (!txn || txn.type !== 'deposit' || txn.status !== 'pending') {
      return { ok: false, error: 'Deposit not found or already processed' }
    }
    if (decision === 'approved') {
      await adjustAccount(txn.user_id, { cash_balance: Number(txn.amount) })
      const { error } = await db
        .from('transactions')
        .update({ status: 'completed', processed_by: admin.id })
        .eq('id', id)
      if (error) return { ok: false, error: `transactions update failed: ${error.message}` }
    } else {
      const { error } = await db
        .from('transactions')
        .update({ status: 'cancelled', processed_by: admin.id })
        .eq('id', id)
      if (error) return { ok: false, error: `transactions update failed: ${error.message}` }
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
    const { data: txn } = await db.from('transactions').select('*').eq('id', id).single()
    if (!txn || txn.type !== 'withdrawal' || txn.status !== 'pending') {
      return { ok: false, error: 'Withdrawal not found or already processed' }
    }
    if (decision === 'approved') {
      const { error } = await db
        .from('transactions')
        .update({ status: 'completed', processed_by: admin.id })
        .eq('id', id)
      if (error) return { ok: false, error: `transactions update failed: ${error.message}` }
    } else {
      await adjustAccount(txn.user_id, { cash_balance: Number(txn.amount) })
      const { error } = await db
        .from('transactions')
        .update({ status: 'cancelled', processed_by: admin.id })
        .eq('id', id)
      if (error) return { ok: false, error: `transactions update failed: ${error.message}` }
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
    const { data: txn } = await db.from('transactions').select('*').eq('id', id).single()
    if (!txn || txn.type !== 'p2p_send' || txn.status !== 'pending') {
      return { ok: false, error: 'Transfer not found or already processed' }
    }
    const meta = (txn.meta as Record<string, unknown> | null) ?? {}
    const recipientId = meta.recipientId as string | undefined
    if (decision === 'approved') {
      if (!recipientId) return { ok: false, error: 'Transfer is missing a recipient — cannot approve' }
      await adjustAccount(recipientId, { cash_balance: Number(txn.amount) })
      await recordTxn(recipientId, {
        type: 'p2p_receive',
        amount: Number(txn.amount),
        status: 'completed',
        processedBy: admin.id,
        meta: { label: 'Received transfer', senderId: txn.user_id },
      })
      const { error } = await db
        .from('transactions')
        .update({ status: 'completed', processed_by: admin.id })
        .eq('id', id)
      if (error) return { ok: false, error: `transactions update failed: ${error.message}` }
    } else {
      await adjustAccount(txn.user_id, { cash_balance: Number(txn.amount) })
      const { error } = await db
        .from('transactions')
        .update({ status: 'cancelled', processed_by: admin.id })
        .eq('id', id)
      if (error) return { ok: false, error: `transactions update failed: ${error.message}` }
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
      const { data: profile } = await db.from('profiles').select('kyc_status').eq('id', app.user_id).maybeSingle()
      if (profile?.kyc_status !== 'verified') {
        return { ok: false, error: 'This applicant has not completed KYC yet — verify identity before approving a card' }
      }
    }
    const cardRef =
      decision === 'approved'
        ? `PULSE-${Array.from({ length: 4 }, () => Math.floor(1000 + Math.random() * 9000)).join('-')}`
        : null
    const { error } = await db
      .from('card_applications')
      .update({
        status: decision === 'approved' ? 'approved' : 'rejected',
        reviewed_by: admin.id,
        reviewed_at: new Date().toISOString(),
        ...(cardRef ? { card_ref: cardRef } : {}),
      })
      .eq('id', id)
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

export async function addAdminByEmail(email: string): Promise<AdminResult> {
  try {
    await requireAdminScope(['full'])
    const clean = email.trim().toLowerCase()
    if (!clean.includes('@')) return { ok: false, error: 'Enter a valid email' }
    const db = serviceClient()
    const { error: allowErr } = await db.from('admin_allowlist').upsert({ email: clean }, { onConflict: 'email' })
    if (allowErr) return { ok: false, error: `admin_allowlist upsert failed: ${allowErr.message}` }
    await db.from('profiles').update({ role: 'admin' }).ilike('email', clean)
    return getAdminSnapshot()
  } catch (e) {
    return { ok: false, error: (e as Error).message }
  }
}

export async function appointAdminScope(userId: string, scope: 'full' | 'finance' | 'operations' | 'manager' | 'director'): Promise<AdminResult> {
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
    const { error } = await db.from('profiles').update({ managed_by: managerId }).eq('id', userId)
    if (error) return { ok: false, error: error.message }
    return getAdminSnapshot()
  } catch (e) {
    return { ok: false, error: (e as Error).message }
  }
}

export async function deleteUser(userId: string): Promise<AdminResult> {
  try {
    await requireAdminScope(['full'])
    const db = serviceClient()
    const { error } = await db.from('profiles').delete().eq('id', userId)
    if (error) return { ok: false, error: error.message }
    return getAdminSnapshot()
  } catch (e) {
    return { ok: false, error: (e as Error).message }
  }
}

// ==========================================
// PROJECT MANAGEMENT ACTIONS (NEW)
// ==========================================

export async function fetchProjects(): Promise<{ ok: boolean; projects?: Project[]; error?: string }> {
  try {
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
      { onConflict: 'id' }
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
// SIGNAL MANAGEMENT ACTIONS (NEW)
// ==========================================

export async function fetchSignals(): Promise<{ ok: boolean; signals?: Signal[]; error?: string }> {
  try {
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
    const db = serviceClient()
    const { error } = await db.from('signals').upsert(
      {
        id: signal.id,
        project_id: signal.projectId,
        title: signal.title,
        window_label: signal.window,
        detail: signal.detail,
        target_yield: signal.targetYield,
        urgency: signal.urgency,
      },
      { onConflict: 'id' }
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

export async function processProjectPayout(projectId: string): Promise<{ ok: boolean; error?: string }> {
  try {
    await requireAdminScope(['full', 'operations', 'finance'])
    const db = serviceClient()
    const { data: holdings } = await db.from('holdings').select('*').eq('project_id', projectId)
    
    if (holdings && holdings.length > 0) {
      for (const h of holdings) {
        const yieldPayout = Number(h.amount) * 0.1
        if (yieldPayout > 0) {
          await adjustAccount(h.user_id, { cash_balance: yieldPayout })
          await recordTxn(h.user_id, {
            type: 'yield',
            amount: yieldPayout,
            currency: 'USD',
            status: 'completed',
            meta: { label: `Project Payout (${projectId})` },
          })
        }
      }
    }
    return { ok: true }
  } catch (e) {
    return { ok: false, error: (e as Error).message }
  }
}

export async function getTeamVolumeReport(): Promise<
  | { ok: true; scope: 'manager' | 'director'; rows: { userId: string; name: string | null; email: string | null; kycVerified: boolean; investedVolume: number }[] }
  | AdminResult
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
