import 'server-only'
import { serviceClient } from './service'
import { tierForAmount, type TierId } from '@/lib/pulse-data'
import type { Snapshot, SnapshotTxn } from './types'

const TXN_TYPE_MAP: Record<string, SnapshotTxn['type']> = {
  deposit: 'deposit',
  withdrawal: 'withdraw',
  investment: 'invest',
  stake: 'stake',
  unstake: 'unstake',
  token_purchase: 'sale',
  yield: 'deposit',
}

const TXN_LABEL: Record<string, string> = {
  deposit: 'Deposit',
  withdrawal: 'Withdrawal to wallet',
  investment: 'Project share purchase',
  stake: 'Staked PULSE',
  unstake: 'Unstaked PULSE',
  token_purchase: 'Private sale purchase',
  yield: 'Yield disbursement',
}

export interface AccountRow {
  user_id: string
  cash_balance: number
  invested_balance: number
  staked_balance: number
  token_balance: number
  pending_yield: number
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

// Read-modify-write balance adjustment. Deltas are added to current values.
export async function adjustAccount(
  userId: string,
  deltas: Partial<Pick<AccountRow, 'cash_balance' | 'invested_balance' | 'staked_balance' | 'token_balance' | 'pending_yield'>>,
): Promise<AccountRow> {
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
  const [{ data: profile }, acct, { data: holdings }, { data: txns }, { data: pointsRows }, { data: referrals }, { data: badgeRows }] = await Promise.all([
    db.from('profiles').select('*').eq('id', userId).maybeSingle(),
    ensureAccount(userId),
    db.from('holdings').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
    db.from('transactions').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(50),
    db.from('points_ledger').select('amount').eq('user_id', userId),
    db.from('profiles').select('kyc_status').eq('referred_by', userId),
    db.from('badges').select('badge_key, earned_at').eq('user_id', userId),
  ])

  const kycMap: Record<string, Snapshot['kyc']> = {
    none: 'none',
    pending: 'pending',
    verified: 'verified',
    rejected: 'rejected',
  }

  return {
    cash: Number(acct.cash_balance),
    pulse: Number(acct.token_balance),
    staked: Number(acct.staked_balance),
    pendingYield: Number(acct.pending_yield),
    holdings: (holdings ?? []).map((h) => ({
      id: h.id,
      projectId: h.project_id,
      tierId: (tierForAmount(Number(h.amount)).id) as TierId,
      amount: Number(h.amount),
      date: new Date(h.created_at).getTime(),
    })),
    txns: (txns ?? []).map((t) => ({
      id: t.id,
      type: TXN_TYPE_MAP[t.type] ?? 'deposit',
      label: (t.meta?.label as string) ?? TXN_LABEL[t.type] ?? t.type,
      amount: Number(t.amount),
      currency: t.currency === 'PULSE' ? 'PULSE' : 'USDT',
      // CHANGED: pass through the real status instead of collapsing
      // 'cancelled'/'failed' into 'pending'. This was the actual bug
      // behind "status never updates" — the DB was correct the whole
      // time, this mapping was just lying about it.
      status: t.status as SnapshotTxn['status'],
      date: new Date(t.created_at).getTime(),
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
    walletId: (acct as AccountRow & { wallet_id?: string }).wallet_id ?? null,
    username: profile?.username ?? null,
    referralCount: (referrals ?? []).length,
    referralVerifiedCount: (referrals ?? []).filter((r) => r.kyc_status === 'verified').length,
    badges: (badgeRows ?? []).map((b) => ({ key: b.badge_key, earnedAt: new Date(b.earned_at).getTime() })),
    adminScope: (profile?.admin_scope as Snapshot['adminScope']) ?? null,
  }
}

export async function isUserAdmin(userId: string): Promise<boolean> {
  const db = serviceClient()
  const { data } = await db.from('profiles').select('role').eq('id', userId).maybeSingle()
  return data?.role === 'admin'
}
