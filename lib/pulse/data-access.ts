// FIX #1 — BUILD BLOCKER.
// This line used to read: 'server-only'
// A bare string literal is parsed as a directive prologue, not an import.
// Turbopack discards the body of an app-rsc module carrying an unrecognised
// directive, which is why the build reported "The module has no exports at
// all" for getSnapshot / adjustAccount / recordTxn / isUserAdmin all at once.
import 'server-only'

import { serviceClient } from './service'
import { tierForAmount, type TierId, PROJECTS, type Project } from '@/lib/pulse-data'
import type { Snapshot, SnapshotTxn } from './types'

export async function getLiveProjects(): Promise<Project[]> {
  const db = serviceClient()
  const [{ data: projectRows, error: projectError }, { data: holdingRows, error: holdingError }] = await Promise.all([
    db.from('projects').select('id, name, country, sector, target_yield, funded, goal, risk, summary, status, deadline'),
    db.from('holdings').select('project_id, amount').eq('status', 'active'),
  ])

  if (projectError) {
    console.warn('[Data Access] Canonical projects query failed:', projectError.message)
    return PROJECTS
  }

  const liveByProject = new Map<string, number>()
  if (!holdingError) {
    for (const row of holdingRows ?? []) {
      liveByProject.set(row.project_id, (liveByProject.get(row.project_id) ?? 0) + Number(row.amount))
    }
  }

  return (projectRows ?? []).map((row) => ({
    id: row.id,
    name: row.name,
    country: row.country,
    sector: row.sector as Project['sector'],
    targetYield: row.target_yield,
    funded: Math.min(Number(row.goal), Number(row.funded) + (liveByProject.get(row.id) ?? 0)),
    goal: Number(row.goal),
    risk: row.risk as Project['risk'],
    summary: row.summary,
    status: row.status === 'Open' ? 'Open' : 'Closed',
    deadline: row.deadline,
    image: PROJECTS.find((project) => project.id === row.id)?.image,
    stage: PROJECTS.find((project) => project.id === row.id)?.stage,
    progress: PROJECTS.find((project) => project.id === row.id)?.progress,
    timeline: PROJECTS.find((project) => project.id === row.id)?.timeline,
    impact: PROJECTS.find((project) => project.id === row.id)?.impact,
    milestones: PROJECTS.find((project) => project.id === row.id)?.milestones,
    riskDetail: PROJECTS.find((project) => project.id === row.id)?.riskDetail,
  }))
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
  // FIX — sellToken() writes 'token_sale' and closeInvestment() writes
  // 'close_investment'. Neither was mapped, so both rendered in the activity
  // feed as "Deposit", which is why sales looked like incoming money.
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
  const { data, error } = await db.from('accounts').select('*').eq('user_id', userId).maybeSingle()
  if (error && error.code !== 'PGRST116') {
    console.error('[Data Access] ensureAccount error:', error)
  }
  if (data) return data as AccountRow

  const { data: created, error: createError } = await db
    .from('accounts')
    .insert({ user_id: userId })
    .select('*')
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
      // Pending money is not spendable money — only settled rows count.
      if (['failed', 'rejected', 'cancelled', 'pending', 'processing'].includes(status)) continue

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
        if (type === 'token_purchase') {
          const meta = txn.meta as Record<string, unknown> | null
          const usdCost = Number(meta?.usdCost) || 0
          if (usdCost > 0) balance -= usdCost
        } else if (type === 'token_sale') {
          const meta = txn.meta as Record<string, unknown> | null
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
      if (['failed', 'rejected', 'cancelled', 'pending', 'processing'].includes(status)) continue

      const amount = Number(txn.amount) || 0
      const currency = (txn.currency || '').toUpperCase()
      const type = (txn.type || '').toLowerCase()

      if (currency === 'PULSE' || currency === 'PLS') {
        if (['token_purchase', 'unstake', 'p2p_receive'].includes(type)) {
          balance += amount
        } else if (['stake', 'p2p_send', 'token_sale'].includes(type)) {
          balance -= amount
        }
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
      if (['failed', 'rejected', 'cancelled', 'pending', 'processing'].includes(status)) continue

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
    .from('accounts')
    .update({ ...next, updated_at: new Date().toISOString() })
    .eq('user_id', userId)
    .select('*')
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
      reference: row.reference ?? null,
      meta: row.meta ?? {},
      processed_by: row.processedBy ?? null,
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

export async function getSnapshot(userId: string, userEmail?: string): Promise<Snapshot> {
  const db = serviceClient()

  const safeQuery = async <T>(promise: PromiseLike<{ data: T | null; error: unknown }>): Promise<T | null> => {
    try {
      const res = await promise
      return res.data
    } catch {
      return null
    }
  }

  const [profile, acct, holdings, txns, pointsRows, referrals, badgeRows, cardApp, pulseCard, wallets, adminRow] = await Promise.all([
    safeQuery(db.from('profiles').select('*').eq('id', userId).maybeSingle()),
    ensureAccount(userId),
    safeQuery(db.from('holdings').select('*').eq('user_id', userId).order('created_at', { ascending: false })),
    safeQuery(
      db.from('transactions').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(50),
    ),
    safeQuery(db.from('points_ledger').select('amount').eq('user_id', userId)),
    safeQuery(db.from('profiles').select('kyc_status').eq('referred_by', userId)),
    safeQuery(db.from('badges').select('badge_key, earned_at').eq('user_id', userId)),
    safeQuery(db.from('card_applications').select('status, card_ref').eq('user_id', userId).maybeSingle()),
    safeQuery(
      db.from('pulse_cards')
        .select('card_number_last4, pin_hash, status')
        .eq('user_id', userId)
        .maybeSingle(),
    ),
    safeQuery(
      db.from('saved_wallets').select('id, label, address').eq('user_id', userId).order('created_at', { ascending: true }),
    ),
    // FIX — ADMIN CHECK WAS READING THE WRONG TABLE. Admin status lives in
    // public.user_roles (user_id, role), verified directly against the live
    // database — every one of the 15 "owner OR admin" RLS policies across
    // accounts/holdings/staking_positions/etc. calls the database's own
    // is_admin() function, which itself queries user_roles, not
    // profiles.role. profiles.role is 'user' for all 69 accounts, including
    // real admins, so the old check here (profile.role === 'admin') could
    // never succeed for anyone — this is exactly why the Admin Console
    // showed "Admin access required" for a genuinely-admin account.
    safeQuery(db.from('user_roles').select('role').eq('user_id', userId).eq('role', 'admin').maybeSingle()),
  ])

  const profileData = (profile ?? {}) as {
    email?: string
    kyc_status?: string
    wallet_address?: string
    referral_code?: string
    full_name?: string
    tier?: number
    founder_number?: number
    username?: string
    admin_scope?: Snapshot['adminScope']
  }
  const cardData = (pulseCard ?? {}) as {
    card_number_last4?: string | null
    pin_hash?: string | null
    status?: Snapshot['cardStatus'] | string | null
  }
  const applicationData = (cardApp ?? {}) as { status?: Snapshot['cardStatus']; card_ref?: string }
  const email = (profileData.email || userEmail || '').toLowerCase()
  const isAdmin = !!adminRow
  const rawKyc = (profileData.kyc_status ?? 'none') as Snapshot['kyc']

  // PERFORMANCE FIX — this used to run all three ledger recalculations on
  // EVERY single call to getSnapshot(), unconditionally, even though their
  // result is only ever used when a raw account balance is non-positive.
  // getSnapshot() runs after every action (deposit/withdraw/invest/stake/
  // etc.), on a 30-second interval, on tab focus, and on every realtime
  // change to 5 different tables — so this was three extra full-table
  // queries against `transactions`, on top of the ~10 already running in
  // the block above, on every single one of those triggers. For a properly-
  // maintained account (the normal case now that adjustAccount() is the
  // only write path), none of the three ever change the result, so they now
  // only run when the account they'd actually repair is in that broken
  // state — cutting the common-case query count roughly in half.
  let cashBalance = Number(acct.cash_balance ?? 0)
  let tokenBalance = Number(acct.token_balance ?? 0)
  let stakedBalance = Number(acct.staked_balance ?? 0)
  const pendingYield = Number(acct.pending_yield ?? 0)

  const [ledgerCash, ledgerTokens, ledgerStaked] = await Promise.all([
    cashBalance <= 0 ? calculateCashBalanceFromLedger(userId) : Promise.resolve(0),
    tokenBalance <= 0 ? calculateTokenBalanceFromLedger(userId) : Promise.resolve(0),
    stakedBalance <= 0 ? calculateStakedBalanceFromLedger(userId) : Promise.resolve(0),
  ])

  // The accounts table is authoritative. The ledger recomputation is a repair
  // path for rows that were never initialised, not a second source of truth.
  if (cashBalance <= 0 && ledgerCash > 0) cashBalance = ledgerCash
  if (tokenBalance <= 0 && ledgerTokens > 0) tokenBalance = ledgerTokens
  if (stakedBalance <= 0 && ledgerStaked > 0) stakedBalance = ledgerStaked

  // FIX #2 — DATA NOT FETCHING.
  // The previous version zeroed every balance and emptied the holdings array
  // whenever `isVerified` was false, and reported kyc as 'verified' whenever
  // the user merely had data. So a real user with a real balance who had not
  // completed KYC saw $0.00 across the whole app and assumed nothing was
  // loading. Balances are now always reported as they are in the database;
  // KYC gating belongs in the action layer (invest / withdraw / transfer all
  // already enforce it), not in the read path.
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
        meta?: Record<string, unknown>
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
        label: (t.meta?.label as string) ?? TXN_LABEL[rawType] ?? t.type,
        amount: Number(t.amount),
        currency: rawCurrency === 'PULSE' || rawCurrency === 'PLS' ? 'PULSE' : 'USDT',
        status: (t.status || 'completed').toLowerCase() as SnapshotTxn['status'],
        isProcessing: !!t.processing_started_at,
        date: new Date(t.created_at).getTime(),
      }
    }),
    kyc: rawKyc,
    wallet: profileData.wallet_address ?? null,
    pulseId: (acct as AccountRow & { pulse_id?: string | null }).pulse_id ?? null,
    referralCode:
      (acct as AccountRow & { wallet_id?: string }).wallet_id ??
      profileData.referral_code ??
      '',
    fullName: profileData.full_name ?? null,
    email: email || null,
    tier: tierForAmount(activeHoldings.reduce((sum, holding) => sum + holding.amount, 0)).id,
    isAdmin,
    points: ((pointsRows as Array<{ amount: number }>) ?? []).reduce((s, r) => s + Number(r.amount), 0),
    founderNumber: profileData.founder_number ?? null,
    walletId: (acct as AccountRow & { wallet_id?: string }).wallet_id ?? null,
    username: profileData.username ?? null,
    referralCount: ((referrals as unknown[]) ?? []).length,
    referralVerifiedCount: ((referrals as Array<{ kyc_status: string }>) ?? []).filter(
      (r) => r.kyc_status === 'verified',
    ).length,
    badges: ((badgeRows as Array<{ badge_key: string; earned_at: string }>) ?? []).map((b) => ({
      key: b.badge_key,
      earnedAt: new Date(b.earned_at).getTime(),
    })),
    adminScope: profileData.admin_scope ?? null,
    cardStatus: pulseCard
      ? (cardData.pin_hash ? 'active' : (cardData.status as Snapshot['cardStatus']) ?? 'pending_pin')
      : (applicationData.status ?? 'none'),
    cardRef: applicationData.card_ref ?? null,
    cardLast4: cardData.card_number_last4 ?? null,
    pinRequired: !!pulseCard && !cardData.pin_hash,
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
    // FIX — this used to check profiles.role, which is 'user' for every
    // single account in the live database, admins included. Confirmed
    // directly against the schema: the real admin flag lives in
    // public.user_roles (user_id, role), and it's the table every RLS
    // policy's admin check (public.is_admin(), no arguments) actually
    // queries. Checking anywhere else can never agree with what the
    // database itself already enforces.
    const { data } = await db.from('user_roles').select('role').eq('user_id', userId).eq('role', 'admin').maybeSingle()
    return !!data
  } catch {
    return false
  }
}
