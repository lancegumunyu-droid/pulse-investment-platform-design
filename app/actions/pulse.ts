'use server'

import { createClient } from '@/lib/supabase/server'
import { tierForAmount, type TierId, PROJECTS, type Project, TOKEN } from '@/lib/pulse-data'
import type { Snapshot, SnapshotTxn, LeaderboardRow, FounderRow, MyReferralRow } from './types'

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
  const { data: txns } = await db
    .from('transactions')
    .select('type, amount, currency, status, meta')
    .eq('user_id', userId)
    .eq('status', 'completed')

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
    }
  }
  return Math.max(0, balance)
}

export async function calculateTokenBalanceFromLedger(userId: string): Promise<number> {
  const db = await getSupabase()
  const { data: txns } = await db
    .from('transactions')
    .select('type, amount, currency, status, meta')
    .eq('user_id', userId)
    .eq('status', 'completed')

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
    }
  }
  return Math.max(0, balance)
}

export async function calculateStakedBalanceFromLedger(userId: string): Promise<number> {
  const db = await getSupabase()
  const { data: txns } = await db
    .from('transactions')
    .select('type, amount, currency, status')
    .eq('user_id', userId)
    .eq('status', 'completed')
    .eq('currency', 'PULSE')

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

export async function validateReferralCode(code: string) {
  if (!code || code.trim() === '') {
    return { valid: false, message: 'Referral code cannot be empty.' }
  }
  try {
    const db = await getSupabase()
    const { data, error } = await db
      .from('profiles')
      .select('id, full_name, username, tier')
      .eq('referral_code', code.trim())
      .maybeSingle()
    
    if (error || !data) {
      return { valid: false, message: 'Invalid referral code.' }
    }
    return { valid: true, ambassador: data.full_name || data.username || 'Ambassador', tier: data.tier }
  } catch (err) {
    return { valid: false, message: 'Validation failed.' }
  }
}

export async function getSnapshot(userId: string): Promise<Snapshot> {
  const db = await getSupabase()
  const [{ data: profile }, acct, { data: holdings }, { data: txns }, { data: pointsRows }, { data: referrals }, { data: badgeRows }, { data: cardApp }, { data: wallets }, liveProjects] = await Promise.all([
    db.from('profiles').select('*').eq('id', userId).maybeSingle(),
    ensureAccount(userId),
    db.from('holdings').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
    db.from('transactions').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(50),
    db.from('points_ledger').select('amount').eq('user_id', userId),
    db.from('profiles').select('kyc_status').eq('referred_by', userId),
    db.from('badges').select('badge_key, earned_at').eq('user_id', userId),
    db.from('card_applications').select('status, card_ref').eq('user_id', userId).maybeSingle(),
    db.from('saved_wallets').select('id, label, address').eq('user_id', userId).order('created_at', { ascending: true }),
    getLiveProjects(),
  ])

  let cashBalance = Number(acct.cash_balance)
  if (isNaN(cashBalance) || cashBalance <= 0) cashBalance = await calculateCashBalanceFromLedger(userId)

  let tokenBalance = Number(acct.token_balance)
  if (isNaN(tokenBalance) || tokenBalance <= 0) tokenBalance = await calculateTokenBalanceFromLedger(userId)

  let stakedBalance = Number(acct.staked_balance)
  if (isNaN(stakedBalance) || stakedBalance <= 0) stakedBalance = await calculateStakedBalanceFromLedger(userId)

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
    projects: liveProjects.map(p => ({
      id: p.id,
      title: p.title,
      category: p.category,
      apyRate: p.targetYieldMax,
      raisedAmount: p.funded,
      goalAmount: p.goal,
      progress: Math.min(100, Math.round((p.funded / p.goal) * 100)),
      coverImage: p.image,
      status: 'active'
    })),
    kyc: kycMap[profile?.kyc_status ?? 'none'] ?? 'none',
    wallet: profile?.wallet_address ?? null,
    referralCode: profile?.referral_code ?? 'PLS-XXXX',
    fullName: profile?.full_name ?? null,
    email: profile?.email ?? null,
    tier: profile?.tier ?? 0,
    isAdmin: profile?.role === 'admin',
    points: (pointsRows ?? []).reduce((s, r) => s + Number(r.amount), 0),
    founderNumber: profile?.founder_number ?? null,
    walletId: null,
    username: profile?.username ?? null,
    referralCount: (referrals ?? []).length,
    referralVerifiedCount: (referrals ?? []).filter((r) => r.kyc_status === 'verified').length,
    badges: (badgeRows ?? []).map((b) => ({ key: b.badge_key, earnedAt: new Date(b.earned_at).getTime() })),
    adminScope: null,
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

export async function deposit(amount: number) {
  const supabase = await getSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { ok: false as const, error: 'Unauthorized' }
  try {
    await adjustAccount(user.id, { cash_balance: amount })
    await recordTxn(user.id, { type: 'deposit', amount, currency: 'USD' })
    const snapshot = await getSnapshot(user.id)
    return { ok: true as const, snapshot }
  } catch (e) {
    return { ok: false as const, error: (e as Error).message }
  }
}

export async function withdraw(amount: number) {
  const supabase = await getSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { ok: false as const, error: 'Unauthorized' }
  try {
    await adjustAccount(user.id, { cash_balance: -amount })
    await recordTxn(user.id, { type: 'withdrawal', amount, currency: 'USD' })
    const snapshot = await getSnapshot(user.id)
    return { ok: true as const, snapshot }
  } catch (e) {
    return { ok: false as const, error: (e as Error).message }
  }
}
