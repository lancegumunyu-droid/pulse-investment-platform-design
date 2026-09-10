'use server'

import { createClient } from '@/lib/supabase/server'
import { tierForAmount, type TierId, PROJECTS, type Project, TOKEN } from '@/lib/pulse-data'
import { isUserAdmin as checkIsUserAdmin } from '@/lib/pulse/data-access'
import type { Snapshot, SnapshotTxn, LeaderboardRow, FounderRow, MyReferralRow } from './types'

// Helper to get a Supabase client inside server actions
async function getSupabase() {
  return await createClient()
}

export async function getLiveProjects(): Promise<Project[]> {
  const db = await getSupabase()
  const { data: rows } = await db.from('holdings').select('project_id, amount')
  const liveByProject = new Map<string, number>()
  for (const r of rows ?? []) {
    liveByProject.set(r.project_id, (liveByProject.get(r.project_id) ?? 0) + Number(r.amount))
  }
  return PROJECTS.map((p) => ({
    ...p,
    funded: Math.min(p.goal, p.funded + (liveByProject.get(p.id) ?? 0)),
  }))
}

export async function getLiveProjectFunding(): Promise<{ ok: true; funding: Record<string, number> } | { ok: false; error: string }> {
  try {
    const projects = await getLiveProjects()
    const funding: Record<string, number> = {}
    for (const p of projects) {
      funding[p.id] = p.funded
    }
    return { ok: true, funding }
  } catch (e) {
    return { ok: false, error: (e as Error).message }
  }
}

const TXN_TYPE_MAP: Record<string, SnapshotTxn['type']> = {
  deposit: 'deposit',
  withdrawal: 'withdraw',
  investment: 'invest',
  stake: 'stake',
  unstake: 'unstake',
  token_purchase: 'sale',
  yield: 'deposit',
  p2p_send: 'p2p_send',
  p2p_receive: 'p2p_receive',
}

const TXN_LABEL: Record<string, string> = {
  deposit: 'Deposit',
  withdrawal: 'Withdrawal to wallet',
  investment: 'Project share purchase',
  stake: 'Staked PULSE',
  unstake: 'Unstaked PULSE',
  token_purchase: 'Private sale purchase',
  yield: 'Yield disbursement',
  p2p_send: 'Sent to another user',
  p2p_receive: 'Received from another user',
}

export interface AccountRow {
  user_id: string
  cash_balance: number
  invested_balance: number
  staked_balance: number
  token_balance: number
  pending_yield: number
  updated_at?: string
}

export async function ensureAccount(userId: string): Promise<AccountRow> {
  const db = await getSupabase()
  const { data } = await db.from('accounts').select('*').eq('user_id', userId).maybeSingle()
  if (data) return data as AccountRow
  const { data: created, error } = await db
    .from('accounts')
    .insert({ user_id: userId })
    .select('*')
    .single()
  if (error) throw error
  return created as AccountRow
}

export async function calculateCashBalanceFromLedger(userId: string): Promise<number> {
  const db = await getSupabase()
  const { data: txns, error } = await db
    .from('transactions')
    .select('type, amount, currency, status, meta')
    .eq('user_id', userId)
    .eq('status', 'completed')

  if (error) {
    console.error('[calculateCashBalanceFromLedger] Query error:', error)
    return 0
  }

  let balance = 0
  for (const txn of txns ?? []) {
    const amount = Number(txn.amount)
    if (txn.currency === 'USD') {
      switch (txn.type) {
        case 'deposit':
        case 'yield':
        case 'p2p_receive':
        case 'token_purchase':
          balance += amount
          break
        case 'withdrawal':
        case 'investment':
        case 'p2p_send':
          balance -= amount
          break
      }
    } else if (txn.currency === 'PULSE') {
      if (txn.type === 'token_purchase') {
        const meta = txn.meta as Record<string, unknown> | null
        if (meta?.usdCost) {
          balance -= Number(meta.usdCost)
        }
      }
    }
  }

  return Math.max(0, balance)
}

export async function calculateTokenBalanceFromLedger(userId: string): Promise<number> {
  const db = await getSupabase()
  const { data: txns, error } = await db
    .from('transactions')
    .select('type, amount, currency, status, meta')
    .eq('user_id', userId)
    .eq('status', 'completed')

  if (error) {
    console.error('[calculateTokenBalanceFromLedger] Query error:', error)
    return 0
  }

  let balance = 0
  for (const txn of txns ?? []) {
    const amount = Number(txn.amount)
    if (txn.currency === 'PULSE') {
      switch (txn.type) {
        case 'token_purchase':
        case 'unstake':
          balance += amount
          break
        case 'stake':
          balance -= amount
          break
      }
    } else if (txn.currency === 'USD') {
      if (txn.type === 'token_purchase') {
        const meta = txn.meta as Record<string, unknown> | null
        if (meta?.pulseAmount) {
          balance -= Number(meta.pulseAmount)
        }
      }
    }
  }

  return Math.max(0, balance)
}

export async function calculateStakedBalanceFromLedger(userId: string): Promise<number> {
  const db = await getSupabase()
  const { data: txns, error } = await db
    .from('transactions')
    .select('type, amount, currency, status')
    .eq('user_id', userId)
    .eq('status', 'completed')
    .eq('currency', 'PULSE')

  if (error) {
    console.error('[calculateStakedBalanceFromLedger] Query error:', error)
    return 0
  }

  let balance = 0
  for (const txn of txns ?? []) {
    const amount = Number(txn.amount)
    if (txn.type === 'stake') balance += amount
    else if (txn.type === 'unstake') balance -= amount
  }

  return Math.max(0, balance)
}

export async function adjustAccount(
  userId: string,
  deltas: Partial<Pick<AccountRow, 'cash_balance' | 'invested_balance' | 'staked_balance' | 'token_balance' | 'pending_yield'>>,
): Promise<AccountRow> {
  const db = await getSupabase()
  const acct = await ensureAccount(userId)
  const next: Record<string, number> = {}
  for (const [k, v] of Object.entries(deltas)) {
    next[k] = Number(acct[k as keyof AccountRow] as number) + Number(v)
    if (next[k] < -0.0001) throw new Error('Insufficient balance')
  }
  const { data, error } = await db
    .from('accounts')
    .update({ ...next, updated_at: new Date().toISOString() })
    .eq('user_id', userId)
    .select('*')
    .single()
  if (error) throw error
  return data as AccountRow
}

export async function recordTxn(userId: string, row: {
  type: string
  amount: number
  currency?: string
  status?: string
  reference?: string | null
  meta?: Record<string, unknown>
  processedBy?: string | null
}) {
  const db = await getSupabase()
  const { data, error } = await db
    .from('transactions')
    .insert({
      user_id: userId,
      type: row.type,
      amount: row.amount,
      currency: row.currency ?? 'USD',
      status: row.status ?? 'completed',
      reference: row.reference ?? null,
      meta: row.meta ?? {},
      processed_by: row.processedBy ?? null,
    })
    .select('*')
    .single()
  if (error) throw error
  return data
}

export async function getSnapshot(userId: string): Promise<Snapshot> {
  const db = await getSupabase()
  const [{ data: profile }, acct, { data: holdings }, { data: txns }, { data: pointsRows }, { data: referrals }, { data: badgeRows }, { data: cardApp }, { data: wallets }] = await Promise.all([
    db.from('profiles').select('*').eq('id', userId).maybeSingle(),
    ensureAccount(userId),
    db.from('holdings').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
    db.from('transactions').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(50),
    db.from('points_ledger').select('amount').eq('user_id', userId),
    db.from('profiles').select('kyc_status').eq('referred_by', userId),
    db.from('badges').select('badge_key, earned_at').eq('user_id', userId),
    db.from('card_applications').select('status, card_ref').eq('user_id', userId).maybeSingle(),
    db.from('saved_wallets').select('id, label, address').eq('user_id', userId).order('created_at', { ascending: true }),
  ])

  let cashBalance = Number(acct.cash_balance)
  if (cashBalance <= 0 || acct.cash_balance === null || isNaN(cashBalance)) {
    cashBalance = await calculateCashBalanceFromLedger(userId)
  }

  let tokenBalance = Number(acct.token_balance)
  if (tokenBalance <= 0 || acct.token_balance === null || isNaN(tokenBalance)) {
    tokenBalance = await calculateTokenBalanceFromLedger(userId)
  }

  let stakedBalance = Number(acct.staked_balance)
  if (stakedBalance <= 0 || acct.staked_balance === null || isNaN(stakedBalance)) {
    stakedBalance = await calculateStakedBalanceFromLedger(userId)
  }

  const mappedHoldings = (holdings ?? []).map((h) => ({
    id: h.id,
    projectId: h.project_id,
    tierId: (tierForAmount(Number(h.amount)).id) as TierId,
    amount: Number(h.amount),
    date: new Date(h.created_at).getTime(),
  }))

  const kycMap: Record<string, Snapshot['kyc']> = {
    none: 'none',
    pending: 'pending',
    verified: 'verified',
    rejected: 'rejected',
  }

  return {
    cash: cashBalance,
    pulse: tokenBalance,
    staked: stakedBalance,
    pendingYield: Number(acct.pending_yield),
    holdings: mappedHoldings,
    txns: (txns ?? []).map((t) => ({
      id: t.id,
      type: TXN_TYPE_MAP[t.type] ?? 'deposit',
      label: (t.meta?.label as string) ?? TXN_LABEL[t.type] ?? t.type,
      amount: Number(t.amount),
      currency: t.currency === 'PULSE' ? 'PULSE' : 'USD',
      status: t.status as SnapshotTxn['status'],
      isProcessing: !!t.processing_started_at,
      date: new Date(t.created_at).getTime(),
    })),
    kyc: kycMap[profile?.kyc_status ?? 'none'] ?? 'none',
    wallet: profile?.wallet_address ?? null,
    referralCode: (acct as AccountRow & { wallet_id?: string }).wallet_id ?? profile?.referral_code ?? 'PLS-XXXX',
    fullName: profile?.full_name ?? null,
    email: profile?.email ?? null,
    tier: profile?.tier ?? 0,
    isAdmin: profile?.role === 'admin',
    points: (pointsRows ?? []).reduce((s, r) => s + Number(r.amount), 0),
    founderNumber: profile?.founder_number ?? null,
    walletId: (acct as AccountRow & { wallet_id?: string }).wallet_id ?? null,
    username: profile?.username ?? null,
    referralCount: (referrals ?? []).length,
    referralVerifiedCount: (referrals ?? []).filter((r) => r.kyc_status === 'verified').length,
    badges: (badgeRows ?? []).map((b) => ({ key: b.badge_key, earnedAt: new Date(b.earned_at).getTime() })),
    adminScope: (profile?.admin_scope as Snapshot['adminScope']) ?? null,
    cardStatus: (cardApp?.status as Snapshot['cardStatus']) ?? 'none',
    cardRef: cardApp?.card_ref ?? null,
    savedWallets: (wallets ?? []).map((w) => ({ id: w.id, label: w.label, address: w.address })),
  }
}

export async function fetchSnapshot(): Promise<Snapshot | null> {
  const supabase = await getSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  return getSnapshot(user.id)
}

// User Action Wrappers
export async function validateReferralCode(code: string): Promise<{ valid: boolean; error?: string }> {
  if (!code || code.trim() === '') return { valid: false, error: 'Code cannot be empty' }
  try {
    const db = await getSupabase()
    const { data } = await db.from('profiles').select('id').eq('referral_code', code.trim()).maybeSingle()
    if (data) {
      return { valid: true }
    }
    const { data: acctData } = await db.from('accounts').select('user_id').eq('wallet_id', code.trim()).maybeSingle()
    if (acctData) {
      return { valid: true }
    }
    return { valid: false, error: 'Invalid or expired referral code' }
  } catch (e) {
    return { valid: false, error: (e as Error).message }
  }
}

export async function submitDeposit(amount: number, currency: 'usdttrc20' | 'btc', txReference: string) {
  const supabase = await getSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { ok: false as const, error: 'Unauthorized' }
  try {
    // SECURITY: deposits must NOT touch the account balance here. This just logs the
    // claim as 'pending'. Balance only moves when an admin approves it via reviewDeposit
    // in app/actions/admin.ts, which updates this same row's status to 'completed' and
    // THEN calls adjustAccount. Do not remove the pending status or the balance skip below
    // — without it, anyone can credit their own account by calling this action directly.
    await recordTxn(user.id, {
      type: 'deposit',
      amount,
      currency: 'USD',
      status: 'pending',
      reference: txReference,
      meta: { originalCurrency: currency },
    })
    const snapshot = await getSnapshot(user.id)
    return { ok: true as const, snapshot }
  } catch (e) {
    return { ok: false as const, error: (e as Error).message }
  }
}

export async function requestWithdrawal(amount: number, destinationAddress: string, network: string, broker: string) {
  const supabase = await getSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { ok: false as const, error: 'Unauthorized' }
  try {
    // SECURITY: same pattern as submitDeposit — log as 'pending' only. We do NOT touch
    // cash_balance here. Debiting happens when an admin approves via reviewWithdrawal in
    // app/actions/admin.ts. If withdrawals debit here AND get rejected later, the user
    // was never refunded — pending-only avoids that class of bug entirely.
    await recordTxn(user.id, {
      type: 'withdrawal',
      amount,
      currency: 'USD',
      status: 'pending',
      meta: { destinationAddress, network, broker },
    })
    const snapshot = await getSnapshot(user.id)
    return { ok: true as const, snapshot }
  } catch (e) {
    return { ok: false as const, error: (e as Error).message }
  }
}

export async function invest(amount: number, projectId: string) {
  const supabase = await getSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { ok: false as const, error: 'Unauthorized' }
  try {
    const db = await getSupabase()
    await adjustAccount(user.id, { cash_balance: -amount, invested_balance: amount })
    await db.from('holdings').insert({ user_id: user.id, project_id: projectId, amount })
    await recordTxn(user.id, { type: 'investment', amount, currency: 'USD', meta: { projectId } })
    const snapshot = await getSnapshot(user.id)
    return { ok: true as const, snapshot }
  } catch (e) {
    return { ok: false as const, error: (e as Error).message }
  }
}

export async function buyToken(cost: number, pulse: number) {
  const supabase = await getSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { ok: false as const, error: 'Unauthorized' }
  try {
    await adjustAccount(user.id, { cash_balance: -cost, token_balance: pulse })
    await recordTxn(user.id, { type: 'token_purchase', amount: pulse, currency: 'PULSE', meta: { usdCost: cost, pulseAmount: pulse } })
    const snapshot = await getSnapshot(user.id)
    return { ok: true as const, snapshot }
  } catch (e) {
    return { ok: false as const, error: (e as Error).message }
  }
}

export async function sellToken(pulseAmount: number) {
  const supabase = await getSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { ok: false as const, error: 'Unauthorized' }
  try {
    const usdValue = pulseAmount * TOKEN.salePrice
    await adjustAccount(user.id, { token_balance: -pulseAmount, cash_balance: usdValue })
    await recordTxn(user.id, { type: 'token_sale', amount: pulseAmount, currency: 'PULSE', meta: { usdValue } })
    const snapshot = await getSnapshot(user.id)
    return { ok: true as const, snapshot }
  } catch (e) {
    return { ok: false as const, error: (e as Error).message }
  }
}

export async function stake(amount: number) {
  const supabase = await getSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { ok: false as const, error: 'Unauthorized' }
  try {
    await adjustAccount(user.id, { token_balance: -amount, staked_balance: amount })
    await recordTxn(user.id, { type: 'stake', amount, currency: 'PULSE' })
    const snapshot = await getSnapshot(user.id)
    return { ok: true as const, snapshot }
  } catch (e) {
    return { ok: false as const, error: (e as Error).message }
  }
}

export async function unstake(amount: number) {
  const supabase = await getSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { ok: false as const, error: 'Unauthorized' }
  try {
    await adjustAccount(user.id, { staked_balance: -amount, token_balance: amount })
    await recordTxn(user.id, { type: 'unstake', amount, currency: 'PULSE' })
    const snapshot = await getSnapshot(user.id)
    return { ok: true as const, snapshot }
  } catch (e) {
    return { ok: false as const, error: (e as Error).message }
  }
}

export async function setWallet(address: string | null) {
  const supabase = await getSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { ok: false as const, error: 'Unauthorized' }
  try {
    const db = await getSupabase()
    await db.from('profiles').update({ wallet_address: address }).eq('id', user.id)
    const snapshot = await getSnapshot(user.id)
    return { ok: true as const, snapshot }
  } catch (e) {
    return { ok: false as const, error: (e as Error).message }
  }
}

export async function submitKyc(input: { fullName: string; idNumber: string; dateOfBirth?: string; country?: string; phone?: string; address?: string }) {
  const supabase = await getSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { ok: false as const, error: 'Unauthorized' }
  try {
    const db = await getSupabase()
    await db.from('profiles').update({ kyc_status: 'pending', full_name: input.fullName }).eq('id', user.id)
    const snapshot = await getSnapshot(user.id)
    return { ok: true as const, snapshot }
  } catch (e) {
    return { ok: false as const, error: (e as Error).message }
  }
}

export async function castVote(proposalId: string, choice: 'for' | 'against' | 'abstain') {
  const supabase = await getSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { ok: false as const, error: 'Unauthorized' }
  try {
    const db = await getSupabase()
    await db.from('votes').upsert({ user_id: user.id, proposal_id: proposalId, choice })
    const snapshot = await getSnapshot(user.id)
    return { ok: true as const, snapshot }
  } catch (e) {
    return { ok: false as const, error: (e as Error).message }
  }
}

export async function claimAdmin() {
  const supabase = await getSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { ok: false as const, error: 'Unauthorized' }
  try {
    // SECURITY: self-service admin promotion is disabled. This now only recognizes
    // admin status that already exists — via profiles.role, or the hardcoded owner
    // email check in lib/pulse/data-access.ts's isUserAdmin(). It can no longer grant
    // admin to anyone who doesn't already qualify by one of those two paths.
    const admin = await checkIsUserAdmin(user.id)
    if (!admin) {
      return { ok: false as const, error: 'Admin access is not enabled for this account.' }
    }
    const snapshot = await getSnapshot(user.id)
    return { ok: true as const, snapshot }
  } catch (e) {
    return { ok: false as const, error: (e as Error).message }
  }
}

export async function setUsername(username: string) {
  const supabase = await getSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { ok: false as const, error: 'Unauthorized' }
  try {
    const db = await getSupabase()
    await db.from('profiles').update({ username }).eq('id', user.id)
    const snapshot = await getSnapshot(user.id)
    return { ok: true as const, snapshot }
  } catch (e) {
    return { ok: false as const, error: (e as Error).message }
  }
}

export async function applyForCard() {
  const supabase = await getSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { ok: false as const, error: 'Unauthorized' }
  try {
    const db = await getSupabase()
    await db.from('card_applications').upsert({ user_id: user.id, status: 'waitlisted' })
    const snapshot = await getSnapshot(user.id)
    return { ok: true as const, snapshot }
  } catch (e) {
    return { ok: false as const, error: (e as Error).message }
  }
}

export async function addSavedWallet(label: string, address: string) {
  const supabase = await getSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { ok: false as const, error: 'Unauthorized' }
  try {
    const db = await getSupabase()
    await db.from('saved_wallets').insert({ user_id: user.id, label, address })
    const snapshot = await getSnapshot(user.id)
    return { ok: true as const, snapshot }
  } catch (e) {
    return { ok: false as const, error: (e as Error).message }
  }
}

export async function removeSavedWallet(id: string) {
  const supabase = await getSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { ok: false as const, error: 'Unauthorized' }
  try {
    const db = await getSupabase()
    await db.from('saved_wallets').delete().eq('id', id).eq('user_id', user.id)
    const snapshot = await getSnapshot(user.id)
    return { ok: true as const, snapshot }
  } catch (e) {
    return { ok: false as const, error: (e as Error).message }
  }
}

export async function requestTransfer(recipientIdentifier: string, amount: number) {
  const supabase = await getSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { ok: false as const, error: 'Unauthorized' }
  try {
    await adjustAccount(user.id, { cash_balance: -amount })
    await recordTxn(user.id, { type: 'p2p_send', amount, currency: 'USD', meta: { recipientIdentifier } })
    const snapshot = await getSnapshot(user.id)
    return { ok: true as const, snapshot }
  } catch (e) {
    return { ok: false as const, error: (e as Error).message }
  }
}

export async function closeInvestment(holdingId: string) {
  const supabase = await getSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { ok: false as const, error: 'Unauthorized' }
  try {
    const db = await getSupabase()
    const { data: holding } = await db.from('holdings').select('*').eq('id', holdingId).eq('user_id', user.id).single()
    if (!holding) return { ok: false as const, error: 'Holding not found' }

    const amount = Number(holding.amount)
    await adjustAccount(user.id, { invested_balance: -amount, cash_balance: amount })
    await db.from('holdings').delete().eq('id', holdingId)
    await recordTxn(user.id, { type: 'close_investment', amount, currency: 'USD', meta: { holdingId } })

    const snapshot = await getSnapshot(user.id)
    return { ok: true as const, snapshot }
  } catch (e) {
    return { ok: false as const, error: (e as Error).message }
  }
}

export async function getLeaderboard(): Promise<{ ok: true; rows: LeaderboardRow[] } | { ok: false; error: string }> {
  try {
    const db = await getSupabase()
    const { data } = await db.from('profiles').select('username, full_name, tier').limit(20)
    const rows: LeaderboardRow[] = (data ?? []).map((p, i) => ({
      rank: i + 1,
      username: p.username ?? p.full_name ?? 'Anonymous',
      tier: p.tier ?? 0,
      points: 0,
    }))
    return { ok: true, rows }
  } catch (e) {
    return { ok: false, error: (e as Error).message }
  }
}

export async function getFoundersWall(): Promise<{ ok: true; rows: FounderRow[] } | { ok: false; error: string }> {
  try {
    const db = await getSupabase()
    const { data } = await db.from('profiles').select('username, full_name, founder_number').not('founder_number', 'is', null).order('founder_number', { ascending: true })
    const rows: FounderRow[] = (data ?? []).map((p) => ({
      founderNumber: p.founder_number,
      name: p.username ?? p.full_name ?? 'Founder',
    }))
    return { ok: true, rows }
  } catch (e) {
    return { ok: false, error: (e as Error).message }
  }
}

export async function getMyReferrals(): Promise<{ ok: true; rows: MyReferralRow[] } | { ok: false; error: string }> {
  try {
    const supabase = await getSupabase()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { ok: false, error: 'Unauthorized' }
    const db = await getSupabase()
    const { data } = await db.from('profiles').select('username, full_name, kyc_status, created_at').eq('referred_by', user.id)
    const rows: MyReferralRow[] = (data ?? []).map((p) => ({
      name: p.username ?? p.full_name ?? 'Invited User',
      status: p.kyc_status === 'verified' ? 'verified' : 'pending',
      date: new Date(p.created_at).getTime(),
    }))
    return { ok: true, rows }
  } catch (e) {
    return { ok: false, error: (e as Error).message }
  }
}

export async function isUserAdmin(userId: string): Promise<boolean> {
  const db = await getSupabase()
  const { data } = await db.from('profiles').select('role').eq('id', userId).maybeSingle()
  return data?.role === 'admin'
}
