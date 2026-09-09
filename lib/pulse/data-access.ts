import 'server-only'
import { serviceClient } from './service'
import { tierForAmount, type TierId, PROJECTS, type Project } from '@/lib/pulse-data'
import type { Snapshot, SnapshotTxn } from './types'

export async function getLiveProjects(): Promise<Project[]> {
  const db = serviceClient()
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
  const db = serviceClient()
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

/**
 * Compliance check: Verifies if user has admin-approved KYC.
 * Admins bypass this check. Regular users must be explicitly 'verified'.
 */
export async function assertKycVerified(userId: string): Promise<boolean> {
  const db = serviceClient()
  const { data: profile } = await db.from('profiles').select('kyc_status, role').eq('id', userId).maybeSingle()
  if (profile?.role === 'admin') return true
  return profile?.kyc_status === 'verified'
}

export async function calculateCashBalanceFromLedger(userId: string): Promise<number> {
  const db = serviceClient()
  const { data: txns, error } = await db
    .from('transactions')
    .select('type, amount, currency, status, meta')
    .eq('user_id', userId)

  if (error) return 0

  let balance = 0
  for (const txn of txns ?? []) {
    if (txn.status === 'failed' || txn.status === 'rejected') continue
    const amount = Number(txn.amount) || 0
    if (txn.currency === 'USD' || !txn.currency) {
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
        if (meta?.usdCost) balance -= Number(meta.usdCost) || 0
      }
    }
  }
  return Math.max(0, balance)
}

export async function calculateTokenBalanceFromLedger(userId: string): Promise<number> {
  const db = serviceClient()
  const { data: txns, error } = await db
    .from('transactions')
    .select('type, amount, currency, status, meta')
    .eq('user_id', userId)

  if (error) return 0

  let balance = 0
  for (const txn of txns ?? []) {
    if (txn.status === 'failed' || txn.status === 'rejected') continue
    const amount = Number(txn.amount) || 0
    if (txn.currency === 'PULSE') {
      if (txn.type === 'token_purchase' || txn.type === 'unstake' || txn.type === 'p2p_receive') {
        balance += amount
      } else if (txn.type === 'stake' || txn.type === 'p2p_send') {
        balance -= amount
      }
    }
  }
  return Math.max(0, balance)
}

export async function calculateStakedBalanceFromLedger(userId: string): Promise<number> {
  const db = serviceClient()
  const { data: txns, error } = await db
    .from('transactions')
    .select('type, amount, currency, status')
    .eq('user_id', userId)
    .eq('currency', 'PULSE')

  if (error) return 0

  let balance = 0
  for (const txn of txns ?? []) {
    if (txn.status === 'failed' || txn.status === 'rejected') continue
    const amount = Number(txn.amount) || 0
    if (txn.type === 'stake') balance += amount
    else if (txn.type === 'unstake') balance -= amount
  }
  return Math.max(0, balance)
}

export async function adjustAccount(
  userId: string,
  deltas: Partial<Pick<AccountRow, 'cash_balance' | 'invested_balance' | 'staked_balance' | 'token_balance' | 'pending_yield'>>,
): Promise<AccountRow> {
  const isVerified = await assertKycVerified(userId)
  if (!isVerified) throw new Error('Account operations locked: KYC must be completed and approved by admin.')

  const db = serviceClient()
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
  const db = serviceClient()
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
  const db = serviceClient()
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

  const kycStatus = profile?.kyc_status ?? 'none'
  const isAdmin = profile?.role === 'admin'
  const isVerified = isAdmin || kycStatus === 'verified'

  let cashBalance = 0
  let tokenBalance = 0
  let stakedBalance = 0
  let pendingYield = 0
  let activeHoldings = []

  // ONLY sync and unlock real balances if the user's KYC is verified by an Admin (or user is admin)
  if (isVerified) {
    cashBalance = Number(acct.cash_balance)
    const ledgerCash = await calculateCashBalanceFromLedger(userId)
    if (cashBalance <= 0 && ledgerCash > 0) {
      cashBalance = ledgerCash
      await db.from('accounts').update({ cash_balance: cashBalance }).eq('user_id', userId)
    }

    tokenBalance = Number(acct.token_balance)
    const ledgerTokens = await calculateTokenBalanceFromLedger(userId)
    if (tokenBalance <= 0 && ledgerTokens > 0) {
      tokenBalance = ledgerTokens
      await db.from('accounts').update({ token_balance: tokenBalance }).eq('user_id', userId)
    }

    stakedBalance = Number(acct.staked_balance)
    const ledgerStaked = await calculateStakedBalanceFromLedger(userId)
    if (stakedBalance <= 0 && ledgerStaked > 0) {
      stakedBalance = ledgerStaked
      await db.from('accounts').update({ staked_balance: stakedBalance }).eq('user_id', userId)
    }

    pendingYield = Number(acct.pending_yield)
    activeHoldings = (holdings ?? []).map((h) => ({
      id: h.id,
      projectId: h.project_id,
      tierId: (tierForAmount(Number(h.amount)).id) as TierId,
      amount: Number(h.amount),
      date: new Date(h.created_at).getTime(),
    }))
  }

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
    pendingYield: pendingYield,
    holdings: activeHoldings,
    txns: (txns ?? []).map((t) => ({
      id: t.id,
      type: TXN_TYPE_MAP[t.type] ?? 'deposit',
      label: (t.meta?.label as string) ?? TXN_LABEL[t.type] ?? t.type,
      amount: Number(t.amount),
      currency: t.currency === 'PULSE' ? 'PULSE' : 'USDT',
      status: t.status as SnapshotTxn['status'],
      isProcessing: !!t.processing_started_at,
      date: new Date(t.created_at).getTime(),
    })),
    kyc: kycMap[kycStatus] ?? 'none',
    wallet: profile?.wallet_address ?? null,
    referralCode: (acct as AccountRow & { wallet_id?: string }).wallet_id ?? profile?.referral_code ?? 'PLS-XXXX',
    fullName: profile?.full_name ?? null,
    email: profile?.email ?? null,
    tier: profile?.tier ?? 0,
    isAdmin: isAdmin,
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

export async function isUserAdmin(userId: string): Promise<boolean> {
  const db = serviceClient()
  const { data } = await db.from('profiles').select('role').eq('id', userId).maybeSingle()
  return data?.role === 'admin'
      }
