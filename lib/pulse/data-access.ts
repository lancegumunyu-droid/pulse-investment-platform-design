import 'server-only'
import { serviceClient } from './service'
import { tierForAmount, type TierId, PROJECTS, type Project } from '@/lib/pulse-data'
import type { Snapshot, SnapshotTxn } from './types'

export async function getLiveProjects(): Promise<Project[]> {
  const db = serviceClient()
  const { data: rows, error } = await db.from('holdings').select('project_id, amount').eq('status', 'active')
  if (error) throw error

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
  sale: 'sale',
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
  sale: 'Private sale purchase',
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
  if (error) throw error
  if (data) return data as AccountRow

  const { data: created, error: createError } = await db
    .from('accounts')
    .insert({ user_id: userId })
    .select('*')
    .single()
  if (createError) throw createError
  return created as AccountRow
}

export async function calculateCashBalanceFromLedger(userId: string): Promise<number> {
  const db = serviceClient()
  const { data: txns, error } = await db
    .from('transactions')
    .select('type, amount, currency, status, meta')
    .eq('user_id', userId)

  if (error) throw error

  let balance = 0
  for (const txn of txns ?? []) {
    const status = (txn.status || '').toLowerCase()
    if (status === 'failed' || status === 'rejected' || status === 'cancelled') continue

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
        case 'refund':
          balance += amount
          break
        case 'withdrawal':
        case 'withdraw':
        case 'investment':
        case 'invest':
        case 'buy':
        case 'token_purchase':
        case 'sale':
        case 'p2p_send':
          balance -= amount
          break
      }
    } else if (currency === 'PULSE' || currency === 'PLS') {
      if (type === 'token_purchase' || type === 'sale') {
        const meta = txn.meta as Record<string, unknown> | null
        const usdCost = Number(meta?.usdCost) || 0
        const hasDirectUsdTxn = (txns ?? []).some((t) => {
          const tType = (t.type || '').toLowerCase()
          const tCurr = (t.currency || '').toUpperCase()
          const tStatus = (t.status || '').toLowerCase()
          return (
            (tType === 'token_purchase' || tType === 'sale') &&
            (tCurr === 'USD' || tCurr === 'USDT' || tCurr === 'USDC') &&
            !['failed', 'rejected', 'cancelled'].includes(tStatus)
          )
        })
        if (usdCost > 0 && !hasDirectUsdTxn) {
          balance -= usdCost
        }
      }
    }
  }
  return Math.max(0, balance)
}

export async function calculateTokenBalanceFromLedger(userId: string): Promise<number> {
  const db = serviceClient()
  const { data: txns, error } = await db
    .from('transactions')
    .select('type, amount, currency, status')
    .eq('user_id', userId)

  if (error) throw error

  let balance = 0
  for (const txn of txns ?? []) {
    const status = (txn.status || '').toLowerCase()
    if (status === 'failed' || status === 'rejected' || status === 'cancelled') continue

    const amount = Number(txn.amount) || 0
    const currency = (txn.currency || '').toUpperCase()
    const type = (txn.type || '').toLowerCase()

    if (currency === 'PULSE' || currency === 'PLS') {
      if (['token_purchase', 'sale', 'unstake', 'p2p_receive'].includes(type)) {
        balance += amount
      } else if (['stake', 'p2p_send'].includes(type)) {
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

  if (error) throw error

  let balance = 0
  for (const txn of txns ?? []) {
    const status = (txn.status || '').toLowerCase()
    if (status === 'failed' || status === 'rejected' || status === 'cancelled') continue

    const amount = Number(txn.amount) || 0
    const currency = (txn.currency || '').toUpperCase()
    const type = (txn.type || '').toLowerCase()

    if (currency === 'PULSE' || currency === 'PLS') {
      if (type === 'stake') balance += amount
      else if (type === 'unstake') balance -= amount
    }
  }
  return Math.max(0, balance)
}

export async function adjustAccount(
  userId: string,
  deltas: Partial<Pick<AccountRow, 'cash_balance' | 'invested_balance' | 'staked_balance' | 'token_balance' | 'pending_yield'>>,
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
  }
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
    processedBy: processedBy ?? 'float-wallet-system',
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

export async function getSnapshot(userId: string): Promise<Snapshot> {
  const db = serviceClient()
  const [
    { data: profile },
    acct,
    { data: holdings },
    { data: txns },
    { data: pointsRows },
    { data: referrals },
    { data: badgeRows },
    { data: cardApp },
    { data: wallets },
  ] = await Promise.all([
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

  const hasExistingData =
    Number(acct.cash_balance) > 0 ||
    Number(acct.token_balance) > 0 ||
    Number(acct.staked_balance) > 0 ||
    (holdings ?? []).length > 0 ||
    (txns ?? []).length > 0

  const isVerified = isAdmin || kycStatus === 'verified' || hasExistingData

  let cashBalance = Number(acct.cash_balance ?? 0)
  let tokenBalance = Number(acct.token_balance ?? 0)
  let stakedBalance = Number(acct.staked_balance ?? 0)
  let pendingYield = Number(acct.pending_yield ?? 0)

  let activeHoldings = (holdings ?? []).map((h) => ({
    id: h.id,
    projectId: h.project_id,
    tierId: tierForAmount(Number(h.amount)).id as TierId,
    amount: Number(h.amount),
    date: new Date(h.created_at).getTime(),
  }))

  if (isVerified) {
    const [ledgerCash, ledgerTokens, ledgerStaked] = await Promise.all([
      calculateCashBalanceFromLedger(userId),
      calculateTokenBalanceFromLedger(userId),
      calculateStakedBalanceFromLedger(userId),
    ])

    if (cashBalance <= 0 && ledgerCash > 0) {
      cashBalance = ledgerCash
      await db.from('accounts').update({ cash_balance: cashBalance, updated_at: new Date().toISOString() }).eq('user_id', userId)
    }

    if (tokenBalance <= 0 && ledgerTokens > 0) {
      tokenBalance = ledgerTokens
      await db.from('accounts').update({ token_balance: tokenBalance, updated_at: new Date().toISOString() }).eq('user_id', userId)
    }

    if (stakedBalance <= 0 && ledgerStaked > 0) {
      stakedBalance = ledgerStaked
      await db.from('accounts').update({ staked_balance: stakedBalance, updated_at: new Date().toISOString() }).eq('user_id', userId)
    }
  } else {
    cashBalance = 0
    tokenBalance = 0
    stakedBalance = 0
    pendingYield = 0
    activeHoldings = []
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
    txns: (txns ?? []).map((t) => {
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
                              
