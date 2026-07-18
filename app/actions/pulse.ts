'use server'

import { createClient } from '@/lib/supabase/server'
import { serviceClient } from '@/lib/pulse/service'
import { adjustAccount, ensureAccount, getSnapshot, recordTxn } from '@/lib/pulse/data-access'
import { tierForAmount, TIERS } from '@/lib/pulse-data'
import type { Snapshot } from '@/lib/pulse/types'

async function requireUser() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')
  return user
}

type Result = { ok: true; snapshot: Snapshot } | { ok: false; error: string }

async function withSnapshot(userId: string): Promise<Result> {
  return { ok: true, snapshot: await getSnapshot(userId) }
}

export async function fetchSnapshot(): Promise<Snapshot | null> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null
  return getSnapshot(user.id)
}

// Recompute and persist the tier based on total invested.
async function syncTier(userId: string) {
  const db = serviceClient()
  const acct = await ensureAccount(userId)
  const tier = tierForAmount(Number(acct.invested_balance))
  const idx = TIERS.findIndex((t) => t.id === tier.id)
  await db.from('profiles').update({ tier: idx }).eq('id', userId)
}

// CHANGED: this used to credit cash_balance immediately (bypassing review).
// Now it only records a PENDING deposit request. The balance is credited by
// reviewDeposit() in admin.ts once an admin approves it — same pattern as
// requestWithdrawal below. Function name kept as simulateDeposit so no UI
// call sites need to change.
export async function simulateDeposit(amount: number): Promise<Result> {
  try {
    const user = await requireUser()
    if (!(amount > 0)) return { ok: false, error: 'Enter a valid amount' }
    await recordTxn(user.id, {
      type: 'deposit',
      amount,
      currency: 'USD',
      status: 'pending',
      reference: 'manual',
      meta: { label: 'Deposit request — pending admin approval' },
    })
    return withSnapshot(user.id)
  } catch (e) {
    return { ok: false, error: (e as Error).message }
  }
}

export async function requestWithdrawal(amount: number): Promise<Result> {
  try {
    const user = await requireUser()
    if (!(amount > 0)) return { ok: false, error: 'Enter a valid amount' }
    const snap = await getSnapshot(user.id)
    if (snap.kyc !== 'verified') return { ok: false, error: 'Identity verification is required to withdraw' }
    if (amount > snap.cash) return { ok: false, error: 'Amount exceeds available balance' }
    // Hold the funds and create a pending withdrawal for admin approval.
    await adjustAccount(user.id, { cash_balance: -amount })
    await recordTxn(user.id, {
      type: 'withdrawal',
      amount,
      currency: 'USD',
      status: 'pending',
      meta: { label: 'Withdrawal to wallet', wallet: snap.wallet },
    })
    return withSnapshot(user.id)
  } catch (e) {
    return { ok: false, error: (e as Error).message }
  }
}

export async function invest(amount: number, projectId: string): Promise<Result> {
  try {
    const user = await requireUser()
    if (!(amount > 0)) return { ok: false, error: 'Enter a valid amount' }
    const snap = await getSnapshot(user.id)
    if (amount > snap.cash) return { ok: false, error: 'Insufficient balance — deposit first' }
    if (amount > 500 && snap.kyc !== 'verified') {
      return { ok: false, error: 'Verify your identity for investments over $500' }
    }
    const newTotalInvested = snap.holdings.reduce((s, h) => s + h.amount, 0) + amount
    const tier = tierForAmount(newTotalInvested)
    const db = serviceClient()
    await adjustAccount(user.id, { cash_balance: -amount, invested_balance: amount })
    await db.from('holdings').insert({
      user_id: user.id,
      project_id: projectId,
      amount,
      tier: TIERS.findIndex((t) => t.id === tier.id),
      target_yield_low: tier.yieldLow,
      target_yield_high: tier.yieldHigh,
    })
    await recordTxn(user.id, {
      type: 'investment',
      amount,
      currency: 'USD',
      status: 'completed',
      meta: { label: 'Project share purchase', projectId },
    })
    await syncTier(user.id)
    return withSnapshot(user.id)
  } catch (e) {
    return { ok: false, error: (e as Error).message }
  }
}

export async function buyToken(cost: number, pulse: number): Promise<Result> {
  try {
    const user = await requireUser()
    if (!(cost > 0)) return { ok: false, error: 'Enter a valid amount' }
    const snap = await getSnapshot(user.id)
    if (cost > snap.cash) return { ok: false, error: 'Insufficient balance — deposit first' }
    await adjustAccount(user.id, { cash_balance: -cost, token_balance: pulse })
    await recordTxn(user.id, {
      type: 'token_purchase',
      amount: pulse,
      currency: 'PULSE',
      status: 'completed',
      meta: { label: `Private sale — ${Math.round(pulse).toLocaleString()} PULSE`, usdCost: cost },
    })
    return withSnapshot(user.id)
  } catch (e) {
    return { ok: false, error: (e as Error).message }
  }
}

export async function stake(amount: number): Promise<Result> {
  try {
    const user = await requireUser()
    if (!(amount > 0)) return { ok: false, error: 'Enter a valid amount' }
    const snap = await getSnapshot(user.id)
    if (amount > snap.pulse) return { ok: false, error: 'Not enough liquid PULSE' }
    const db = serviceClient()
    await adjustAccount(user.id, { token_balance: -amount, staked_balance: amount })
    await db.from('staking_positions').insert({ user_id: user.id, amount, apy: 24.8, active: true })
    await recordTxn(user.id, {
      type: 'stake',
      amount,
      currency: 'PULSE',
      status: 'completed',
      meta: { label: 'Staked PULSE' },
    })
    return withSnapshot(user.id)
  } catch (e) {
    return { ok: false, error: (e as Error).message }
  }
}

export async function unstake(amount: number): Promise<Result> {
  try {
    const user = await requireUser()
    if (!(amount > 0)) return { ok: false, error: 'Enter a valid amount' }
    const snap = await getSnapshot(user.id)
    if (amount > snap.staked) return { ok: false, error: 'Not enough staked PULSE' }
    await adjustAccount(user.id, { token_balance: amount, staked_balance: -amount })
    await recordTxn(user.id, {
      type: 'unstake',
      amount,
      currency: 'PULSE',
      status: 'completed',
      meta: { label: 'Unstaked PULSE' },
    })
    return withSnapshot(user.id)
  } catch (e) {
    return { ok: false, error: (e as Error).message }
  }
}

export async function setWallet(address: string | null): Promise<Result> {
  try {
    const user = await requireUser()
    const db = serviceClient()
    await db.from('profiles').update({ wallet_address: address }).eq('id', user.id)
    return withSnapshot(user.id)
  } catch (e) {
    return { ok: false, error: (e as Error).message }
  }
}

export async function submitKyc(input: {
  fullName: string
  idNumber: string
  dateOfBirth?: string
  country?: string
}): Promise<Result> {
  try {
    const user = await requireUser()
    if (!input.fullName?.trim() || !input.idNumber?.trim()) {
      return { ok: false, error: 'Full name and ID number are required' }
    }
    const db = serviceClient()
    await db.from('kyc_submissions').insert({
      user_id: user.id,
      full_name: input.fullName.trim(),
      id_number: input.idNumber.trim(),
      date_of_birth: input.dateOfBirth || null,
      country: input.country || null,
      status: 'pending',
    })
    await db.from('profiles').update({ kyc_status: 'pending' }).eq('id', user.id)
    return withSnapshot(user.id)
  } catch (e) {
    return { ok: false, error: (e as Error).message }
  }
}

export async function castVote(proposalId: string, choice: 'for' | 'against' | 'abstain'): Promise<Result> {
  try {
    const user = await requireUser()
    const snap = await getSnapshot(user.id)
    if (snap.staked <= 0) return { ok: false, error: 'Stake PULSE to participate in governance' }
    const db = serviceClient()
    await db
      .from('governance_votes')
      .upsert({ user_id: user.id, proposal_id: proposalId, choice, weight: snap.staked }, { onConflict: 'user_id,proposal_id' })
    return withSnapshot(user.id)
  } catch (e) {
    return { ok: false, error: (e as Error).message }
  }
}

// Bootstrap: if there are no admins yet, the first caller becomes an admin.
// Also promotes any user whose email is on the admin allowlist.
export async function claimAdmin(): Promise<Result> {
  try {
    const user = await requireUser()
    const db = serviceClient()
    const { count } = await db.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'admin')
    const { data: allow } = await db
      .from('admin_allowlist')
      .select('email')
      .ilike('email', user.email ?? '')
      .maybeSingle()
    if ((count ?? 0) > 0 && !allow) {
      return { ok: false, error: 'An admin already exists. Ask an existing admin to add you.' }
    }
    await db.from('profiles').update({ role: 'admin' }).eq('id', user.id)
    await db.from('admin_allowlist').upsert({ email: user.email }, { onConflict: 'email' })
    return withSnapshot(user.id)
  } catch (e) {
    return { ok: false, error: (e as Error).message }
  }
}
