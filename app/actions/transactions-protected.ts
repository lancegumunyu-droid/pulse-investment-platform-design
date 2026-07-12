'use server'

import { createClient } from '@/lib/supabase/server'
import { serviceClient } from '@/lib/pulse/service'
import { getSnapshot, adjustAccount, recordTxn } from '@/lib/pulse/data-access'
import { getUserAccessRules, validateDeposit, validateWithdrawal, WELCOME_BONUS } from '@/lib/pulse/business-rules'
import { logAuditEvent, performAmlCheck, checkKycCompliance } from '@/lib/pulse/security'

/**
 * Protected transaction actions with business rule enforcement
 */

interface DepositRequest {
  amount: number
  currency: string
  tier: number
  paymentMethod: string
}

export async function requestDeposit(req: DepositRequest): Promise<{ ok: true; txnId: string } | { ok: false; error: string }> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) throw new Error('Not authenticated')

    // Get user snapshot
    const snapshot = await getSnapshot(user.id)
    if (!snapshot) throw new Error('User not found')

    // Check access rules
    const rules = getUserAccessRules(snapshot)
    if (!rules.canDeposit) {
      return { ok: false, error: 'You must complete KYC verification before depositing' }
    }

    // Validate deposit amount
    const validation = validateDeposit(snapshot, req.amount)
    if (!validation.valid) {
      return { ok: false, error: validation.error }
    }

    // AML check
    const amlResult = performAmlCheck(req.amount, 1, 'normal')
    if (!amlResult.passed) {
      return { ok: false, error: amlResult.reason }
    }

    // Create pending transaction
    const txn = await recordTxn(user.id, {
      type: 'deposit',
      amount: req.amount,
      currency: req.currency || 'USD',
      status: 'pending',
      meta: {
        paymentMethod: req.paymentMethod,
        tier: req.tier,
        requiresReview: amlResult.requiresManualReview,
      },
    })

    // Log audit event
    logAuditEvent({
      userId: user.id,
      action: 'DEPOSIT_REQUESTED',
      resource: `txn:${txn.id}`,
      changes: { amount: req.amount, currency: req.currency },
      severity: amlResult.requiresManualReview ? 'warning' : 'info',
    })

    return { ok: true, txnId: txn.id }
  } catch (error) {
    console.error('[Deposit] Error:', error)
    return { ok: false, error: (error as Error).message }
  }
}

interface WithdrawalRequest {
  amount: number
  walletAddress: string
  currency: string
}

export async function requestWithdrawal(req: WithdrawalRequest): Promise<{ ok: true; txnId: string } | { ok: false; error: string }> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) throw new Error('Not authenticated')

    // Get user snapshot
    const snapshot = await getSnapshot(user.id)
    if (!snapshot) throw new Error('User not found')

    // Check access rules
    const rules = getUserAccessRules(snapshot)
    if (!rules.canWithdraw) {
      return { ok: false, error: 'You must complete KYC verification before withdrawing' }
    }

    // Get monthly withdrawal total
    const db = serviceClient()
    const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
    const { data: monthlyTxns } = await db
      .from('transactions')
      .select('amount')
      .eq('user_id', user.id)
      .eq('type', 'withdrawal')
      .eq('status', 'completed')
      .gte('created_at', monthAgo)

    const monthlyWithdrawn = monthlyTxns?.reduce((sum, txn) => sum + Number(txn.amount), 0) || 0

    // Validate withdrawal
    const validation = validateWithdrawal(snapshot, req.amount, monthlyWithdrawn)
    if (!validation.valid) {
      return { ok: false, error: validation.error }
    }

    // Check if trying to withdraw welcome bonus
    if (snapshot.cash === WELCOME_BONUS.amount) {
      return {
        ok: false,
        error: `Welcome bonus cannot be withdrawn. Please make a deposit first.`,
      }
    }

    // Create pending withdrawal
    const txn = await recordTxn(user.id, {
      type: 'withdrawal',
      amount: req.amount,
      currency: req.currency || 'USD',
      status: 'pending',
      meta: {
        walletAddress: req.walletAddress,
        monthlyWithdrawn,
      },
    })

    // Deduct from balance immediately (pending completion)
    await adjustAccount(user.id, { cash_balance: -req.amount })

    // Log audit event
    logAuditEvent({
      userId: user.id,
      action: 'WITHDRAWAL_REQUESTED',
      resource: `txn:${txn.id}`,
      changes: { amount: req.amount, wallet: req.walletAddress },
      severity: 'info',
    })

    return { ok: true, txnId: txn.id }
  } catch (error) {
    console.error('[Withdrawal] Error:', error)
    return { ok: false, error: (error as Error).message }
  }
}

interface KycSubmission {
  fullName: string
  dateOfBirth: string
  country: string
  idType: 'passport' | 'national_id' | 'drivers_license'
  idNumber: string
  photos: string[] // File IDs/URLs
}

export async function submitKyc(req: KycSubmission): Promise<{ ok: true; submissionId: string } | { ok: false; error: string }> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) throw new Error('Not authenticated')

    // Validate input
    if (!req.fullName || req.fullName.length < 2) {
      return { ok: false, error: 'Please provide your full name' }
    }

    if (!req.dateOfBirth) {
      return { ok: false, error: 'Date of birth is required' }
    }

    // Calculate age
    const dob = new Date(req.dateOfBirth)
    const age = new Date().getFullYear() - dob.getFullYear()

    // Check compliance
    const complianceCheck = checkKycCompliance(req.country, age)
    if (!complianceCheck.compliant) {
      return { ok: false, error: complianceCheck.issues[0] }
    }

    // Create KYC submission
    const db = serviceClient()
    const { data: submission, error } = await db
      .from('kyc_submissions')
      .insert({
        user_id: user.id,
        full_name: req.fullName,
        date_of_birth: req.dateOfBirth,
        country: req.country,
        id_type: req.idType,
        id_number: req.idNumber,
        photos: req.photos,
        status: 'pending',
        requires_escalation: complianceCheck.requiresEscalation,
      })
      .select('id')
      .single()

    if (error) throw error

    // Update user KYC status
    await db.from('profiles').update({ kyc_status: 'pending' }).eq('id', user.id)

    // Log audit event
    logAuditEvent({
      userId: user.id,
      action: 'KYC_SUBMITTED',
      resource: `kyc:${submission.id}`,
      changes: { country: req.country, age },
      severity: complianceCheck.requiresEscalation ? 'warning' : 'info',
    })

    return { ok: true, submissionId: submission.id }
  } catch (error) {
    console.error('[KYC] Error:', error)
    return { ok: false, error: (error as Error).message }
  }
}

interface ApproveUserKycRequest {
  userId: string
  submissionId: string
  notes?: string
}

export async function approveKyc(req: ApproveUserKycRequest): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    const supabase = await createClient()
    const {
      data: { user: admin },
    } = await supabase.auth.getUser()

    if (!admin) throw new Error('Not authenticated')

    // Check admin role
    const db = serviceClient()
    const { data: adminProfile } = await db.from('profiles').select('role').eq('id', admin.id).maybeSingle()

    if (adminProfile?.role !== 'admin' && adminProfile?.role !== 'kyc_reviewer') {
      throw new Error('Admin access required')
    }

    // Approve KYC
    const { error: kycError } = await db
      .from('kyc_submissions')
      .update({ status: 'verified' })
      .eq('id', req.submissionId)

    if (kycError) throw kycError

    // Update user profile
    const { error: profileError } = await db.from('profiles').update({ kyc_status: 'verified' }).eq('id', req.userId)

    if (profileError) throw profileError

    // Award welcome bonus
    await adjustAccount(req.userId, { cash_balance: WELCOME_BONUS.amount })

    // Log audit event
    logAuditEvent({
      userId: admin.id,
      action: 'KYC_APPROVED',
      resource: `kyc:${req.submissionId}`,
      changes: { targetUserId: req.userId, notes: req.notes },
      severity: 'info',
    })

    return { ok: true }
  } catch (error) {
    console.error('[KYC Approval] Error:', error)
    return { ok: false, error: (error as Error).message }
  }
}

interface RejectUserKycRequest {
  userId: string
  submissionId: string
  reason: string
}

export async function rejectKyc(req: RejectUserKycRequest): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    const supabase = await createClient()
    const {
      data: { user: admin },
    } = await supabase.auth.getUser()

    if (!admin) throw new Error('Not authenticated')

    // Check admin role
    const db = serviceClient()
    const { data: adminProfile } = await db.from('profiles').select('role').eq('id', admin.id).maybeSingle()

    if (adminProfile?.role !== 'admin' && adminProfile?.role !== 'kyc_reviewer') {
      throw new Error('Admin access required')
    }

    // Reject KYC
    const { error } = await db
      .from('kyc_submissions')
      .update({ status: 'rejected', rejection_reason: req.reason })
      .eq('id', req.submissionId)

    if (error) throw error

    // Update user profile
    await db.from('profiles').update({ kyc_status: 'rejected' }).eq('id', req.userId)

    // Log audit event
    logAuditEvent({
      userId: admin.id,
      action: 'KYC_REJECTED',
      resource: `kyc:${req.submissionId}`,
      changes: { targetUserId: req.userId, reason: req.reason },
      severity: 'info',
    })

    return { ok: true }
  } catch (error) {
    console.error('[KYC Rejection] Error:', error)
    return { ok: false, error: (error as Error).message }
  }
}
