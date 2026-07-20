'use server'

import { createClient } from '@/lib/supabase/server'
import { serviceClient } from '@/lib/pulse/service'
import { adjustAccount, isUserAdmin, recordTxn } from '@/lib/pulse/data-access'
import type { AdminSnapshot } from '@/lib/pulse/types'

async function requireAdmin() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')
  if (!(await isUserAdmin(user.id))) throw new Error('Admin access required')
  return user
}

type AdminResult = { ok: true; snapshot: AdminSnapshot } | { ok: false; error: string }

export async function getAdminSnapshot(): Promise<AdminResult> {
  try {
    await requireAdmin()
    const db = serviceClient()
    const [{ data: profiles }, { data: accounts }, { data: kyc }, { data: txns }] = await Promise.all([
      db.from('profiles').select('*').order('created_at', { ascending: false }),
      db.from('accounts').select('*'),
      db.from('kyc_submissions').select('*').eq('status', 'pending').order('created_at', { ascending: false }),
      db.from('transactions').select('*').order('created_at', { ascending: false }).limit(200),
    ])

    const acctMap = new Map((accounts ?? []).map((a) => [a.user_id, a]))
    const emailMap = new Map((profiles ?? []).map((p) => [p.id, p.email]))

    const users = (profiles ?? []).map((p) => {
      const a = acctMap.get(p.id)
      return {
        id: p.id,
        email: p.email,
        fullName: p.full_name,
        role: p.role,
        kycStatus: p.kyc_status,
        cash: Number(a?.cash_balance ?? 0),
        invested: Number(a?.invested_balance ?? 0),
        staked: Number(a?.staked_balance ?? 0),
        createdAt: new Date(p.created_at).getTime(),
      }
    })

    const totalDeposits = (accounts ?? []).reduce((s, a) => s + Number(a.cash_balance), 0)
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
        settledStatus: (t.meta as Record<string, unknown> | null)?.settled_status as string | null ?? null,
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
      }))

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

    const kycQueue = (kyc ?? []).map((k) => ({
      id: k.id,
      userId: k.user_id,
      email: emailMap.get(k.user_id) ?? null,
      fullName: k.full_name,
      idNumber: k.id_number,
      dateOfBirth: k.date_of_birth,
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
      userCount: users.length,
      users,
      kycQueue,
      withdrawalQueue,
      depositQueue,
      recentTxns,
    }
    return { ok: true, snapshot }
  } catch (e) {
    return { ok: false, error: (e as Error).message }
  }
}

export async function reviewKyc(id: string, decision: 'approved' | 'rejected'): Promise<AdminResult> {
  try {
    const admin = await requireAdmin()
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

    // Welcome bonus: credited once, only on first approval, matching the
    // original design (bonus unlocks alongside verified access).
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
          reference: 'welcome_bonus',
          processedBy: admin.id,
          meta: { label: 'Welcome bonus' },
        })
      }

      // Honest referral rewards: points only, never yield. And a shot at
      // the real (non-fabricated) Founders' Circle badge.
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

// NEW: lets admin send a user's KYC back to square one so they can resubmit
// (e.g. blurry ID photo, mismatched details, or they need a fresh look).
export async function resetKyc(userId: string): Promise<AdminResult> {
  try {
    await requireAdmin()
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
    const admin = await requireAdmin()
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
    const admin = await requireAdmin()
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

export async function disburseYield(userId: string, amount: number): Promise<AdminResult> {
  try {
    const admin = await requireAdmin()
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
    await requireAdmin()
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

// NEW: fully remove a user who doesn't meet requirements. Cleans up all
// dependent rows first, then removes the auth account itself. Irreversible.
export async function deleteUser(userId: string): Promise<AdminResult> {
  try {
    const admin = await requireAdmin()
    if (userId === admin.id) return { ok: false, error: "You can't delete your own admin account" }
    const db = serviceClient()

    await db.from('transactions').delete().eq('user_id', userId)
    await db.from('kyc_submissions').delete().eq('user_id', userId)
    await db.from('holdings').delete().eq('user_id', userId)
    await db.from('staking_positions').delete().eq('user_id', userId)
    await db.from('governance_votes').delete().eq('user_id', userId)
    await db.from('accounts').delete().eq('user_id', userId)
    await db.from('profiles').delete().eq('id', userId)

    const { error: authErr } = await db.auth.admin.deleteUser(userId)
    if (authErr) return { ok: false, error: `Auth account removal failed: ${authErr.message}` }

    return getAdminSnapshot()
  } catch (e) {
    return { ok: false, error: (e as Error).message }
  }
}
