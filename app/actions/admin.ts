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
      pendingKyc: kycQueue.length,
      userCount: users.length,
      users,
      kycQueue,
      withdrawalQueue,
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
    await db
      .from('kyc_submissions')
      .update({ status: decision, reviewed_by: admin.id, reviewed_at: new Date().toISOString() })
      .eq('id', id)
    await db
      .from('profiles')
      .update({ kyc_status: decision === 'approved' ? 'verified' : 'rejected' })
      .eq('id', sub.user_id)
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
      await db
        .from('transactions')
        .update({ status: 'completed', processed_by: admin.id })
        .eq('id', id)
    } else {
      // Refund the held funds back to the user's balance.
      await adjustAccount(txn.user_id, { cash_balance: Number(txn.amount) })
      await db
        .from('transactions')
        .update({ status: 'cancelled', processed_by: admin.id })
        .eq('id', id)
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
    await db.from('admin_allowlist').upsert({ email: clean }, { onConflict: 'email' })
    // If the user already exists, promote them immediately.
    await db.from('profiles').update({ role: 'admin' }).ilike('email', clean)
    return getAdminSnapshot()
  } catch (e) {
    return { ok: false, error: (e as Error).message }
  }
}

// ──────────────────────────────────────
// Staff Management
// ──────────────────────────────────────

export async function addStaffMember(staffData: {
  email: string
  fullName: string
  department: string
  position: string
  role: 'staff' | 'manager' | 'director'
  phone?: string
  country?: string
  notes?: string
}): Promise<{ ok: boolean; error?: string; staffId?: string }> {
  try {
    const admin = await requireAdmin()
    const db = serviceClient()
    const clean = staffData.email.trim().toLowerCase()
    
    const { data, error } = await db
      .from('staff_members')
      .insert({
        email: clean,
        full_name: staffData.fullName,
        department: staffData.department,
        position: staffData.position,
        role: staffData.role,
        phone: staffData.phone || null,
        country: staffData.country || null,
        notes: staffData.notes || null,
        created_by: admin.id,
      })
      .select('id')
      .single()
    
    if (error) return { ok: false, error: error.message }
    
    // Log the action
    await db.from('staff_logs').insert({
      staff_id: data.id,
      action: 'created',
      performed_by: admin.id,
      changes: { email: clean, department: staffData.department, position: staffData.position },
    })
    
    return { ok: true, staffId: data.id }
  } catch (e) {
    return { ok: false, error: (e as Error).message }
  }
}

export async function updateStaffMember(
  staffId: string,
  staffData: Partial<{
    fullName: string
    department: string
    position: string
    role: 'staff' | 'manager' | 'director'
    status: 'active' | 'inactive' | 'suspended'
    phone: string
    country: string
    notes: string
  }>
): Promise<{ ok: boolean; error?: string }> {
  try {
    const admin = await requireAdmin()
    const db = serviceClient()
    
    const updateData: Record<string, any> = {}
    if (staffData.fullName !== undefined) updateData.full_name = staffData.fullName
    if (staffData.department !== undefined) updateData.department = staffData.department
    if (staffData.position !== undefined) updateData.position = staffData.position
    if (staffData.role !== undefined) updateData.role = staffData.role
    if (staffData.status !== undefined) updateData.status = staffData.status
    if (staffData.phone !== undefined) updateData.phone = staffData.phone || null
    if (staffData.country !== undefined) updateData.country = staffData.country || null
    if (staffData.notes !== undefined) updateData.notes = staffData.notes || null
    
    const { error } = await db
      .from('staff_members')
      .update(updateData)
      .eq('id', staffId)
    
    if (error) return { ok: false, error: error.message }
    
    // Log the update
    await db.from('staff_logs').insert({
      staff_id: staffId,
      action: 'updated',
      performed_by: admin.id,
      changes: staffData,
    })
    
    return { ok: true }
  } catch (e) {
    return { ok: false, error: (e as Error).message }
  }
}

export async function suspendStaffMember(staffId: string, reason: string): Promise<{ ok: boolean; error?: string }> {
  try {
    const admin = await requireAdmin()
    const db = serviceClient()
    
    const { error } = await db
      .from('staff_members')
      .update({ status: 'suspended' })
      .eq('id', staffId)
    
    if (error) return { ok: false, error: error.message }
    
    await db.from('staff_logs').insert({
      staff_id: staffId,
      action: 'suspended',
      performed_by: admin.id,
      changes: { reason },
    })
    
    return { ok: true }
  } catch (e) {
    return { ok: false, error: (e as Error).message }
  }
}

export async function getStaffList(): Promise<{ ok: boolean; staff?: any[]; error?: string }> {
  try {
    await requireAdmin()
    const db = serviceClient()
    
    const { data, error } = await db
      .from('staff_members')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) return { ok: false, error: error.message }
    
    return {
      ok: true,
      staff: data || [],
    }
  } catch (e) {
    return { ok: false, error: (e as Error).message }
  }
}

export async function getStaffLogs(staffId: string): Promise<{ ok: boolean; logs?: any[]; error?: string }> {
  try {
    await requireAdmin()
    const db = serviceClient()
    
    const { data, error } = await db
      .from('staff_logs')
      .select('*')
      .eq('staff_id', staffId)
      .order('created_at', { ascending: false })
    
    if (error) return { ok: false, error: error.message }
    
    return {
      ok: true,
      logs: data || [],
    }
  } catch (e) {
    return { ok: false, error: (e as Error).message }
  }
}
