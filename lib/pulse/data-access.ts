/**
 * This file does NOT import 'server-only' — see the comment in ./service.ts
 * for why that guard is removed rather than restored. Server confinement is
 * enforced there instead.
 */
import { serviceClient } from './service'
import { tierForAmount, type TierId, PROJECTS, type Project } from '@/lib/pulse-data'
import type { Snapshot, SnapshotTxn } from './types'

export async function getLiveProjects(): Promise<Project[]> {
  try {
    const db = serviceClient()
    const { data: rows, error } = await db.from('holdings').select('project_id, amount')

    if (error) {
      console.warn('[Data Access] Failed to fetch live holdings for projects:', error.message)
      return PROJECTS
    }

    const liveByProject = new Map<string, number>()
    for (const r of rows ?? []) {
      liveByProject.set(r.project_id, (liveByProject.get(r.project_id) ?? 0) + Number(r.amount))
    }

    return PROJECTS.map((p) => ({
      ...p,
      funded: Math.min(p.goal, p.funded + (liveByProject.get(p.id) ?? 0)),
    }))
  } catch (err) {
    console.warn('[Data Access] getLiveProjects fallback to static list:', err)
    return PROJECTS
  }
}

const TXN_TYPE_MAP: Record<string, SnapshotTxn['type']> = {
  deposit: 'deposit',
  topup: 'deposit',
  credit: 'deposit',
  withdrawal: 'withdraw',
  withdraw: 'withdraw',
  investment: 'invest',
  invest: 'invest',
  buy: 'invest',
  stake: 'stake',
  unstake: 'unstake',
  token_purchase: 'sale',
  token_sale: 'sale',
  sale: 'sale',
  close_investment: 'invest',
  yield: 'deposit',
  payout: 'deposit',
  project_payout: 'deposit',
  p2p_send: 'p2p_send',
  p2p_receive: 'p2p_receive',
}

const TXN_LABEL: Record<string, string> = {
  deposit: 'Deposit',
  topup: 'Deposit',
  credit: 'Deposit',
  withdrawal: 'Withdrawal to wallet',
  withdraw: 'Withdrawal to wallet',
  investment: 'Project share purchase',
  invest: 'Project share purchase',
  buy: 'Project share purchase',
  stake: 'Staked PULSE',
  unstake: 'Unstaked PULSE',
  token_purchase: 'Private sale purchase',
  token_sale: 'PULSE sold for cash',
  sale: 'Private sale purchase',
  close_investment: 'Investment liquidated',
  yield: 'Yield disbursement',
  payout: 'Project payout from float',
  project_payout: 'Project payout from float',
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
  const { data, error } = await db
    .from('wallets')
    .select('id, user_id, balance, available_balance, pending_balance, total_earnings, currency, updated_at')
    .eq('user_id', userId)
    .maybeSingle()
  if (error && error.code !== 'PGRST116') {
    console.error('[Data Access] ensureAccount error:', error)
  }
  if (data) {
    return {
      user_id: data.user_id,
      cash_balance: Number(data.available_balance ?? data.balance ?? 0),
      invested_balance: 0,
      staked_balance: 0,
      token_balance: 0,
      pending_yield: Number(data.pending_balance ?? 0),
      updated_at: data.updated_at,
      wallet_id: data.id,
    } as unknown as AccountRow & { wallet_id: string }
  }

  const { data: created, error: createError } = await db
    .from('wallets')
    .insert({ user_id: userId, currency: 'USD' })
    .select('id, user_id, balance, available_balance, pending_balance, total_earnings, currency, updated_at')
    .single()

  if (createError) {
    console.error('[Data Access] ensureAccount createError:', createError)
    return {
      user_id: userId,
      cash_balance: 0,
      invested_balance: 0,
      staked_balance: 0,
      token_balance: 0,
      pending_yield: 0,
    }
  }

  return created as AccountRow
}

const SETTLED_EXCLUDED = ['failed', 'rejected', 'cancelled', 'pending', 'processing']

export async function calculateCashBalanceFromLedger(userId: string): Promise<number> {
  try {
    const db = serviceClient()
    const { data: txns, error } = await db
      .from('transactions')
      .select('type, amount, currency, status, meta')
      .eq('user_id', userId)

    if (error) return 0

    let balance = 0
    for (const txn of txns ?? []) {
      const status = (txn.status || '').toLowerCase()
      if (SETTLED_EXCLUDED.includes(status)) continue

      const amount = Number(txn.amount) || 0
      const currency = (txn.currency || 'USD').toUpperCase()
      const type = (txn.type || '').toLowerCase()

      if (currency === 'USD' || currency === 'USDT' || currency === 'USDC') {
        switch (type) {
          case 'deposit':
          case 'topup':
          case 'credit':
          case 'yield':
          case 'payout':
          case 'project_payout':
          case 'p2p_receive':
          case 'close_investment':
          case 'refund':
            balance += amount
            break
          case 'withdrawal':
          case 'withdraw':
          case 'investment':
          case 'invest':
          case 'buy':
          case 'p2p_send':
            balance -= amount
            break
        }
      } else if (currency === 'PULSE' || currency === 'PLS') {
        const meta = txn.meta as Record<string, unknown> | null
        if (type === 'token_purchase') {
          const usdCost = Number(meta?.usdCost) || 0
          if (usdCost > 0) balance -= usdCost
        } else if (type === 'token_sale') {
          const usdValue = Number(meta?.usdValue) || 0
          if (usdValue > 0) balance += usdValue
        }
      }
    }
    return Math.max(0, balance)
  } catch {
    return 0
  }
}

export async function calculateTokenBalanceFromLedger(userId: string): Promise<number> {
  try {
    const db = serviceClient()
    const { data: txns, error } = await db
      .from('transactions')
      .select('type, amount, currency, status')
      .eq('user_id', userId)

    if (error) return 0

    let balance = 0
    for (const txn of txns ?? []) {
      const status = (txn.status || '').toLowerCase()
      if (SETTLED_EXCLUDED.includes(status)) continue

      const amount = Number(txn.amount) || 0
      const currency = (txn.currency || '').toUpperCase()
      const type = (txn.type || '').toLowerCase()

      if (currency === 'PULSE' || currency === 'PLS') {
        if (['token_purchase', 'unstake', 'p2p_receive'].includes(type)) balance += amount
        else if (['stake', 'p2p_send', 'token_sale'].includes(type)) balance -= amount
      }
    }
    return Math.max(0, balance)
  } catch {
    return 0
  }
}

export async function calculateStakedBalanceFromLedger(userId: string): Promise<number> {
  try {
    const db = serviceClient()
    const { data: txns, error } = await db
      .from('transactions')
      .select('type, amount, currency, status')
      .eq('user_id', userId)

    if (error) return 0

    let balance = 0
    for (const txn of txns ?? []) {
      const status = (txn.status || '').toLowerCase()
      if (SETTLED_EXCLUDED.includes(status)) continue

      const amount = Number(txn.amount) || 0
      const currency = (txn.currency || '').toUpperCase()
      const type = (txn.type || '').toLowerCase()

      if (currency === 'PULSE' || currency === 'PLS') {
        if (type === 'stake') balance += amount
        else if (type === 'unstake') balance -= amount
      }
    }
    return Math.max(0, balance)
  } catch {
    return 0
  }
}

export async function adjustAccount(
  userId: string,
  deltas: Partial<
    Pick<AccountRow, 'cash_balance' | 'invested_balance' | 'staked_balance' | 'token_balance' | 'pending_yield'>
  >,
): Promise<AccountRow> {
  const db = serviceClient()
  const acct = await ensureAccount(userId)
  const next: Record<string, number> = {}

  for (const [k, v] of Object.entries(deltas)) {
    const currentVal = Number(acct[k as keyof AccountRow] ?? 0)
    const newVal = currentVal + Number(v)
    if (newVal < -0.0001) throw new Error(`Insufficient ${k.replace('_balance', '')} balance`)
    next[k] = newVal
  }

  const { data, error } = await db
    .from('wallets')
    .update({
      balance: next.cash_balance,
      available_balance: next.cash_balance,
      pending_balance: next.pending_yield,
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', userId)
    .select('id, user_id, balance, available_balance, pending_balance, total_earnings, currency, updated_at')
    .single()

  if (error) throw error
  return data as AccountRow
}

export async function recordTxn(
  userId: string,
  row: {
    type: string
    amount: number
    currency?: string
    status?: string
    reference?: string | null
    meta?: Record<string, unknown>
    processedBy?: string | null
  },
) {
  const db = serviceClient()
  const { data, error } = await db
    .from('transactions')
    .insert({
      user_id: userId,
      type: row.type.toLowerCase(),
      amount: row.amount,
      currency: (row.currency ?? 'USD').toUpperCase(),
      status: row.status ?? 'completed',
      reference_id: row.reference ?? null,
      metadata: row.meta ?? {},
    })
    .select('*')
    .single()

  if (error) throw error
  return data
}

export async function disburseProjectPayoutFromFloat(params: {
  userId: string
  projectId: string
  amount: number
  currency?: string
  floatTxHash?: string
  processedBy?: string
}) {
  const { userId, projectId, amount, currency = 'USD', floatTxHash, processedBy } = params

  const txn = await recordTxn(userId, {
    type: 'project_payout',
    amount,
    currency,
    status: 'completed',
    processedBy: processedBy ?? null,
    meta: {
      projectId,
      source: 'float_wallet',
      floatTxHash: floatTxHash ?? null,
      label: `Project Payout (${projectId})`,
    },
  })

  await adjustAccount(userId, { cash_balance: amount })
  return txn
}

export async function getSnapshot(
  userId: string,
  userEmail?: string,
  authenticatedDb?: ReturnType<typeof serviceClient>,
): Promise<Snapshot> {
  const db = authenticatedDb ?? serviceClient()

  const safeQuery = async <T>(promise: PromiseLike<{ data: T | null; error: unknown }>): Promise<T | null> => {
    try {
      const res = await promise
      return res.data
    } catch {
      return null
    }
  }

  const [profile, acct, holdings, txns, cardApplication] = await Promise.all([
    safeQuery(
      db
        .from('users')
        .select('id, email, full_name, kyc_status, referral_code, status, country_code, created_at')
        .eq('id', userId)
        .maybeSingle(),
    ),
    safeQuery(
      db
        .from('wallets')
        .select('user_id, balance, available_balance, pending_balance, updated_at')
        .eq('user_id', userId)
        .maybeSingle(),
    ),
    Promise.resolve([]),
    safeQuery(
      db
        .from('transactions')
        .select('id, type, amount, currency, status, metadata, reference_id, created_at, updated_at, description')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(50),
    ),
    safeQuery(
      db
        .from('card_applications')
        .select('id, status, card_number, card_number_last4, cvv, expiry_month, expiry_year, cardholder_name, pin_hash')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle(),
    ),
  ])

  const pointsRows: unknown[] = []
  const referrals: unknown[] = []
  const badgeRows: unknown[] = []
  const wallets: unknown[] = []

  const email = ((profile as { email?: string })?.email || userEmail || '').toLowerCase()
  const role = (profile as { role?: string })?.role
  const isAdmin = role === 'admin' || role === 'super_admin'
  const rawKyc = ((profile as { kyc_status?: string })?.kyc_status ?? 'none') as Snapshot['kyc']

  const [ledgerCash, ledgerTokens, ledgerStaked] = await Promise.all([
    calculateCashBalanceFromLedger(userId),
    calculateTokenBalanceFromLedger(userId),
    calculateStakedBalanceFromLedger(userId),
  ])

  const wallet = acct as { balance?: number; available_balance?: number; pending_balance?: number } | null
  let cashBalance = Number(wallet?.available_balance ?? wallet?.balance ?? 0)
  let tokenBalance = 0
  let stakedBalance = 0
  const pendingYield = Number(wallet?.pending_balance ?? 0)

  if (cashBalance <= 0 && ledgerCash > 0) cashBalance = ledgerCash
  if (tokenBalance <= 0 && ledgerTokens > 0) tokenBalance = ledgerTokens
  if (stakedBalance <= 0 && ledgerStaked > 0) stakedBalance = ledgerStaked

  const activeHoldings = (
    (holdings as Array<{ id: string; project_id: string; amount: number; created_at: string }>) ?? []
  ).map((h) => ({
    id: h.id,
    projectId: h.project_id,
    tierId: tierForAmount(Number(h.amount)).id as TierId,
    amount: Number(h.amount),
    date: new Date(h.created_at).getTime(),
  }))

  return {
    cash: cashBalance,
    pulse: tokenBalance,
    staked: stakedBalance,
    pendingYield,
    holdings: activeHoldings,
    txns: (
      (txns as Array<{
        id: string
        type: string
        currency: string
        metadata?: Record<string, unknown>
        amount: number
        status: string
        processing_started_at?: string
        created_at: string
      }>) ?? []
    ).map((t) => {
      const rawType = (t.type || '').toLowerCase()
      const rawCurrency = (t.currency || '').toUpperCase()
      return {
        id: t.id,
        type: TXN_TYPE_MAP[rawType] ?? 'deposit',
        label: (t.metadata?.label as string) ?? TXN_LABEL[rawType] ?? t.type,
        amount: Number(t.amount),
        currency: rawCurrency === 'PULSE' || rawCurrency === 'PLS' ? 'PULSE' : 'USDT',
        status: (t.status || 'completed').toLowerCase() as SnapshotTxn['status'],
        isProcessing: !!t.processing_started_at,
        date: new Date(t.created_at).getTime(),
      }
    }),
    kyc: rawKyc,
    wallet: (profile as { wallet_address?: string })?.wallet_address ?? null,
    referralCode:
      (profile as { referral_code?: string })?.referral_code ??
      'PLS-XXXX',
    fullName: (profile as { full_name?: string })?.full_name ?? null,
    email: email || null,
    tier: (profile as { tier?: number })?.tier ?? 1,
    isAdmin,
    points: ((pointsRows as Array<{ amount: number }>) ?? []).reduce((s, r) => s + Number(r.amount), 0),
    founderNumber: (profile as { founder_number?: number })?.founder_number ?? null,
    walletId: null,
    username: (profile as { username?: string })?.username ?? null,
    referralCount: ((referrals as unknown[]) ?? []).length,
    referralVerifiedCount: ((referrals as Array<{ kyc_status: string }>) ?? []).filter(
      (r) => r.kyc_status === 'verified',
    ).length,
    badges: ((badgeRows as Array<{ badge_key: string; earned_at: string }>) ?? []).map((b) => ({
      key: b.badge_key,
      earnedAt: new Date(b.earned_at).getTime(),
    })),
    adminScope: (profile as { admin_scope?: Snapshot['adminScope'] })?.admin_scope ?? null,
    cardStatus: ((cardApplication as { status?: string })?.status ?? 'none') as Snapshot['cardStatus'],
    cardRef: (cardApplication as { card_number?: string })?.card_number ?? null,
    cardLast4: (cardApplication as { card_number_last4?: string })?.card_number_last4 ?? null,
    cardCvv: (cardApplication as { cvv?: string })?.cvv ?? null,
    cardExpiryMonth: (cardApplication as { expiry_month?: number })?.expiry_month ?? null,
    cardExpiryYear: (cardApplication as { expiry_year?: number })?.expiry_year ?? null,
    cardholderName: (cardApplication as { cardholder_name?: string })?.cardholder_name ?? null,
    pinRequired: Boolean(cardApplication && !(cardApplication as { pin_hash?: string | null }).pin_hash),
    savedWallets: ((wallets as Array<{ id: string; label: string; address: string }>) ?? []).map((w) => ({
      id: w.id,
      label: w.label,
      address: w.address,
    })),
  }
}

export async function isUserAdmin(userId: string): Promise<boolean> {
  try {
    const db = serviceClient()
    const { data } = await db
      .from('admin_users')
      .select('role, is_active')
      .eq('user_id', userId)
      .maybeSingle()
    return data?.is_active === true && ['admin', 'super_admin'].includes(data.role)
  } catch {
    return false
  }
}
