'use server'

import { createClient } from '@/lib/supabase/server'
import { TOKEN } from '@/lib/pulse-data'
import { createHash, randomBytes, scryptSync } from 'node:crypto'
import type { Snapshot, LeaderboardRow, FounderRow, MyReferralRow } from '@/lib/pulse/types'
import {
  getSnapshot as getSnapshotFromDb,
  adjustAccount,
  recordTxn,
  isUserAdmin as checkIsUserAdmin,
  getLiveProjects as getLiveProjectsFromDb,
} from '@/lib/pulse/data-access'
import { serviceClient } from '@/lib/pulse/service'
import type { Project } from '@/lib/pulse-data'

async function getSupabase() {
  return await createClient()
}

async function requireUser() {
  const supabase = await getSupabase()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return user
}

export async function getLiveProjects(): Promise<Project[]> {
  return getLiveProjectsFromDb()
}

export async function getLiveProjectFunding(): Promise<
  { ok: true; funding: Record<string, number> } | { ok: false; error: string }
> {
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

export async function getSnapshot(userId: string): Promise<Snapshot> {
  return getSnapshotFromDb(userId)
}

export async function fetchSnapshot(): Promise<Snapshot | null> {
  const supabase = await getSupabase()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('No authenticated Supabase user')
  }

  try {
    return await getSnapshotFromDb(user.id, user.email ?? undefined, supabase)
  } catch (error) {
    console.error('Portfolio load failed:', error)
    throw error
  }
}

// NEW — backs sale.tsx. The private-sale progress bar previously showed a
// hardcoded SALE_RAISED = 1_842_000 that never changed regardless of actual
// purchases. This sums every completed token_purchase transaction's usdCost
// across all users, so the bar reflects the real ledger.
export async function getSaleProgress(): Promise<
  { ok: true; raisedUsd: number; buyerCount: number } | { ok: false; error: string }
> {
  try {
    const db = serviceClient()
    const { data, error } = await db
      .from('transactions')
      .select('user_id, amount, currency, status, meta')
      .eq('type', 'token_purchase')
      .eq('status', 'completed')

    if (error) return { ok: false, error: error.message }

    let raisedUsd = 0
    const buyers = new Set<string>()
    for (const t of data ?? []) {
      const meta = t.meta as Record<string, unknown> | null
      const usdCost = Number(meta?.usdCost)
      // Fall back to amount * salePrice for older rows written before usdCost
      // was always stored in meta.
      raisedUsd += usdCost > 0 ? usdCost : Number(t.amount) * TOKEN.salePrice
      buyers.add(t.user_id)
    }

    return { ok: true, raisedUsd, buyerCount: buyers.size }
  } catch (e) {
    return { ok: false, error: (e as Error).message }
  }
}

export async function validateReferralCode(code: string): Promise<{ ok: boolean; valid: boolean; error?: string }> {
  const clean = code?.trim().toUpperCase()
  if (!clean) return { ok: false, valid: false, error: 'Code cannot be empty' }
  try {
    const db = serviceClient()

  const { data: byWallet } = await db.from('accounts').select('user_id, wallet_id').eq('wallet_id', clean).maybeSingle()
  if (byWallet) {
    const { data: verifiedKyc } = await db
      .from('kyc_submissions')
      .select('id')
      .eq('user_id', byWallet.user_id)
      .eq('status', 'verified')
      .maybeSingle()
    if (verifiedKyc) return { ok: true, valid: true }
  }

  if (clean.toUpperCase() === 'PULSE-PUBLIC') return { ok: true, valid: true }


    return { ok: false, valid: false, error: 'Invalid or expired referral code' }
  } catch (e) {
    return { ok: false, valid: false, error: (e as Error).message }
  }
}

export async function submitDeposit(amount: number, currency: 'usdttrc20' | 'btc', txReference: string) {
  const user = await requireUser()
  if (!user) return { ok: false as const, error: 'Unauthorized' }
  if (!(amount > 0)) return { ok: false as const, error: 'Enter a valid amount' }
  try {
    await recordTxn(user.id, {
      type: 'deposit',
      amount,
      currency: 'USD',
      status: 'pending',
      reference: txReference,
      meta: { originalCurrency: currency, label: 'Deposit' },
    })
    return { ok: true as const, snapshot: await getSnapshotFromDb(user.id) }
  } catch (e) {
    return { ok: false as const, error: (e as Error).message }
  }
}

export async function requestWithdrawal(
  amount: number,
  destinationAddress: string,
  network: string,
  broker: string,
) {
  const user = await requireUser()
  if (!user) return { ok: false as const, error: 'Unauthorized' }
  if (!(amount > 0)) return { ok: false as const, error: 'Enter a valid amount' }
  try {
    const snapshotBefore = await getSnapshotFromDb(user.id)
    if (snapshotBefore.kyc !== 'verified') {
      return { ok: false as const, error: 'Complete KYC verification before withdrawing' }
    }
    if (amount > snapshotBefore.cash) {
      return { ok: false as const, error: 'Amount exceeds your available balance' }
    }

    await recordTxn(user.id, {
      type: 'withdrawal',
      amount,
      currency: 'USD',
      status: 'pending',
      meta: { destinationAddress, network, broker, label: 'Withdrawal to wallet' },
    })
    return { ok: true as const, snapshot: await getSnapshotFromDb(user.id) }
  } catch (e) {
    return { ok: false as const, error: (e as Error).message }
  }
}

export async function invest(amount: number, projectId: string) {
  const user = await requireUser()
  if (!user) return { ok: false as const, error: 'Unauthorized' }
  if (!(amount > 0)) return { ok: false as const, error: 'Enter a valid amount' }
  try {
    const db = serviceClient()

  const snap = await getSnapshotFromDb(user.id)
  if (snap.holdings.length >= 2) {
    return { ok: false as const, error: 'You can only hold two active positions at a time.' }
  }
  if (amount > 500 && snap.kyc !== 'verified') {
      return { ok: false as const, error: 'KYC verification is required for investments over $500' }
    }

    const { data: project } = await db.from('projects').select('status, deadline').eq('id', projectId).maybeSingle()
    if (project?.status === 'Closed') {
      return { ok: false as const, error: 'This project is closed to new investment' }
    }

    await adjustAccount(user.id, { cash_balance: -amount, invested_balance: amount })
    await db.from('holdings').insert({ user_id: user.id, project_id: projectId, amount })
    await recordTxn(user.id, {
      type: 'investment',
      amount,
      currency: 'USD',
      meta: { projectId, label: 'Project share purchase' },
    })
    return { ok: true as const, snapshot: await getSnapshotFromDb(user.id) }
  } catch (e) {
    return { ok: false as const, error: (e as Error).message }
  }
}

export async function buyToken(cost: number, pulse: number) {
  const user = await requireUser()
  if (!user) return { ok: false as const, error: 'Unauthorized' }
  if (!(cost > 0) || !(pulse > 0)) return { ok: false as const, error: 'Enter a valid amount' }
  try {
    await adjustAccount(user.id, { cash_balance: -cost, token_balance: pulse })
    await recordTxn(user.id, {
      type: 'token_purchase',
      amount: pulse,
      currency: 'PULSE',
      meta: { usdCost: cost, pulseAmount: pulse, label: 'Private sale purchase' },
    })
    return { ok: true as const, snapshot: await getSnapshotFromDb(user.id) }
  } catch (e) {
    return { ok: false as const, error: (e as Error).message }
  }
}

export async function sellToken(pulseAmount: number) {
  const user = await requireUser()
  if (!user) return { ok: false as const, error: 'Unauthorized' }
  if (!(pulseAmount > 0)) return { ok: false as const, error: 'Enter a valid amount' }
  try {
    const usdValue = pulseAmount * TOKEN.salePrice
    await adjustAccount(user.id, { token_balance: -pulseAmount, cash_balance: usdValue })
    await recordTxn(user.id, {
      type: 'token_sale',
      amount: pulseAmount,
      currency: 'PULSE',
      meta: { usdValue, label: 'PULSE sold for cash' },
    })
    return { ok: true as const, snapshot: await getSnapshotFromDb(user.id) }
  } catch (e) {
    return { ok: false as const, error: (e as Error).message }
  }
}

export async function stake(amount: number) {
  const user = await requireUser()
  if (!user) return { ok: false as const, error: 'Unauthorized' }
  if (!(amount > 0)) return { ok: false as const, error: 'Enter a valid amount' }
  try {
    await adjustAccount(user.id, { token_balance: -amount, staked_balance: amount })
    await recordTxn(user.id, { type: 'stake', amount, currency: 'PULSE', meta: { label: 'Staked PULSE' } })
    return { ok: true as const, snapshot: await getSnapshotFromDb(user.id) }
  } catch (e) {
    return { ok: false as const, error: (e as Error).message }
  }
}

export async function unstake(amount: number) {
  const user = await requireUser()
  if (!user) return { ok: false as const, error: 'Unauthorized' }
  if (!(amount > 0)) return { ok: false as const, error: 'Enter a valid amount' }
  try {
    await adjustAccount(user.id, { staked_balance: -amount, token_balance: amount })
    await recordTxn(user.id, { type: 'unstake', amount, currency: 'PULSE', meta: { label: 'Unstaked PULSE' } })
    return { ok: true as const, snapshot: await getSnapshotFromDb(user.id) }
  } catch (e) {
    return { ok: false as const, error: (e as Error).message }
  }
}

export async function setWallet(address: string | null) {
  const user = await requireUser()
  if (!user) return { ok: false as const, error: 'Unauthorized' }
  try {
    const db = serviceClient()
    const { error } = await db.from('accounts').update({ wallet_id: address }).eq('user_id', user.id)
    if (error) throw error
    return { ok: true as const, snapshot: await getSnapshotFromDb(user.id) }
  } catch (e) {
    return { ok: false as const, error: (e as Error).message }
  }
}

export async function submitKyc(input: {
  fullName: string
  idNumber: string
  dateOfBirth?: string
  nationality?: string
  country?: string
  phone?: string
  address?: string
}) {
  const user = await requireUser()
  if (!user) return { ok: false as const, error: 'Unauthorized' }
  try {
  const db = serviceClient()
  const { data: latestSubmission, error: latestError } = await db
    .from('kyc_submissions')
    .select('status')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()
  if (latestError) return { ok: false as const, error: `Could not check existing verification: ${latestError.message}` }
  const latestStatus = String(latestSubmission?.status ?? '').toLowerCase()
  if (latestStatus === 'approved' || latestStatus === 'verified') {
    return { ok: true as const, snapshot: await getSnapshotFromDb(user.id) }
  }
  const { error: subErr } = await db.from('kyc_submissions').insert({
      user_id: user.id,
      full_name: input.fullName,
      id_number: input.idNumber,
      date_of_birth: input.dateOfBirth ?? null,
      nationality: input.nationality ?? null,
      country: input.country ?? null,
      phone: input.phone ?? null,
      address: input.address ?? null,
      status: 'pending',
    })
    if (subErr) return { ok: false as const, error: `Could not file submission: ${subErr.message}` }

    return { ok: true as const, snapshot: await getSnapshotFromDb(user.id) }
  } catch (e) {
    return { ok: false as const, error: (e as Error).message }
  }
}

export async function castVote(proposalId: string, choice: 'for' | 'against' | 'abstain') {
  const user = await requireUser()
  if (!user) return { ok: false as const, error: 'Unauthorized' }
  try {
    const db = serviceClient()
    await db.from('votes').upsert({ user_id: user.id, proposal_id: proposalId, choice })
    return { ok: true as const, snapshot: await getSnapshotFromDb(user.id) }
  } catch (e) {
    return { ok: false as const, error: (e as Error).message }
  }
}

export async function claimAdmin() {
  const user = await requireUser()
  if (!user) return { ok: false as const, error: 'Unauthorized' }
  try {
    const admin = await checkIsUserAdmin(user.id)
    if (!admin) {
      return { ok: false as const, error: 'Admin access is not enabled for this account.' }
    }
    return { ok: true as const, snapshot: await getSnapshotFromDb(user.id) }
  } catch (e) {
    return { ok: false as const, error: (e as Error).message }
  }
}

export async function setUsername(username: string) {
  const user = await requireUser()
  if (!user) return { ok: false as const, error: 'Unauthorized' }
  const clean = username.trim().toLowerCase().replace(/^@/, '')
  if (clean.length < 3 || clean.length > 20 || !/^[a-z0-9_]+$/.test(clean)) {
    return { ok: false as const, error: 'Username must be 3–20 characters: letters, numbers, underscore' }
  }
  try {
    const db = serviceClient()
    const { data: taken } = await db.from('profiles').select('id').eq('username', clean).maybeSingle()
    if (taken && taken.id !== user.id) {
      return { ok: false as const, error: 'That username is already taken' }
    }
    await db.from('profiles').update({ username: clean }).eq('id', user.id)
    return { ok: true as const, snapshot: await getSnapshotFromDb(user.id) }
  } catch (e) {
    return { ok: false as const, error: (e as Error).message }
  }
}

export async function applyForCard() {
  const user = await requireUser()
  if (!user) return { ok: false as const, error: 'Unauthorized' }
  try {
    const db = serviceClient()
    const { data: existing } = await db
    .from('card_applications')
    .select('id, status')
    .eq('user_id', user.id)
    .in('status', ['waitlisted', 'approved'])
    .maybeSingle()
  if (!existing) {
    const cardRef = `PULSE-${randomBytes(10).toString('hex').toUpperCase()}`
    const { error } = await db.from('card_applications').insert({
      user_id: user.id,
      status: 'waitlisted',
      card_ref: cardRef,
      card_number_last4: cardRef.slice(-4),
    })
    if (error) throw error
  }
    return { ok: true as const, snapshot: await getSnapshotFromDb(user.id) }
  } catch (e) {
    return { ok: false as const, error: (e as Error).message }
  }
}

function hashPin(pin: string) {
  const salt = randomBytes(16).toString('hex')
  const digest = scryptSync(pin, salt, 32).toString('hex')
  return `${salt}:${digest}`
}

function hashResetToken(token: string) {
  return createHash('sha256').update(token).digest('hex')
}

function validPin(pin: string) {
  return /^(?!([0-9])\\1{3,5}$)(?!0123$|1234$|4321$)[0-9]{4,6}$/.test(pin)
}

export async function setPulsePin(pin: string) {
  const user = await requireUser()
  if (!user) return { ok: false as const, error: 'Unauthorized' }
  if (!validPin(pin)) return { ok: false as const, error: 'Use a unique 4–6 digit PIN.' }
  try {
    const db = serviceClient()
    const { data: card } = await db.from('card_applications').select('id, status').eq('user_id', user.id).in('status', ['approved', 'free_card_earned']).order('created_at', { ascending: false }).limit(1).maybeSingle()
    if (!card || !['approved', 'pending_pin', 'active', 'free_card_earned'].includes(card.status)) {
      return { ok: false as const, error: 'Your Pulse card is not ready for PIN setup.' }
    }
    const { error } = await db.from('card_applications').update({ pin_hash: hashPin(pin), status: 'approved', pin_set_at: new Date().toISOString(), updated_at: new Date().toISOString() }).eq('id', card.id)
    if (error) throw error
    return { ok: true as const, snapshot: await getSnapshotFromDb(user.id) }
  } catch (e) {
    return { ok: false as const, error: (e as Error).message }
  }
}

export async function requestPulsePinReset() {
  const user = await requireUser()
  if (!user) return { ok: false as const, error: 'Unauthorized' }
  try {
    const db = serviceClient()
    const { data: card } = await db.from('card_applications').select('id').eq('user_id', user.id).in('status', ['approved', 'free_card_earned']).order('created_at', { ascending: false }).limit(1).maybeSingle()
    if (!card) return { ok: false as const, error: 'No Pulse card found.' }
    const token = randomBytes(32).toString('base64url')
    const { error } = await db.from('pulse_card_pin_resets').insert({ card_id: card.id, user_id: user.id, token_hash: hashResetToken(token), expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString() })
    if (error) throw error
    return { ok: true as const, token }
  } catch (e) {
    return { ok: false as const, error: (e as Error).message }
  }
}

export async function resetPulsePin(token: string, pin: string) {
  const user = await requireUser()
  if (!user) return { ok: false as const, error: 'Unauthorized' }
  if (!validPin(pin)) return { ok: false as const, error: 'Use a unique 4–6 digit PIN.' }
  try {
    const db = serviceClient()
    const { data: reset } = await db.from('pulse_card_pin_resets').select('id, card_id, expires_at, consumed_at').eq('user_id', user.id).eq('token_hash', hashResetToken(token)).maybeSingle()
    if (!reset || reset.consumed_at || new Date(reset.expires_at) < new Date()) return { ok: false as const, error: 'That reset request has expired. Start again.' }
    const { error: cardError } = await db.from('card_applications').update({ pin_hash: hashPin(pin), status: 'approved', pin_set_at: new Date().toISOString(), updated_at: new Date().toISOString() }).eq('id', reset.card_id).eq('user_id', user.id)
    if (cardError) throw cardError
    const { error } = await db.from('pulse_card_pin_resets').update({ consumed_at: new Date().toISOString() }).eq('id', reset.id)
    if (error) throw error
    return { ok: true as const, snapshot: await getSnapshotFromDb(user.id) }
  } catch (e) {
    return { ok: false as const, error: (e as Error).message }
  }
}

export async function addSavedWallet(label: string, address: string) {
  const user = await requireUser()
  if (!user) return { ok: false as const, error: 'Unauthorized' }
  if (address.trim().length < 20) return { ok: false as const, error: 'That does not look like a valid address' }
  try {
    const db = serviceClient()
    await db.from('saved_wallets').insert({ user_id: user.id, label: label || 'Wallet', address: address.trim() })
    return { ok: true as const, snapshot: await getSnapshotFromDb(user.id) }
  } catch (e) {
    return { ok: false as const, error: (e as Error).message }
  }
}

export async function removeSavedWallet(id: string) {
  const user = await requireUser()
  if (!user) return { ok: false as const, error: 'Unauthorized' }
  try {
    const db = serviceClient()
    await db.from('saved_wallets').delete().eq('id', id).eq('user_id', user.id)
    return { ok: true as const, snapshot: await getSnapshotFromDb(user.id) }
  } catch (e) {
    return { ok: false as const, error: (e as Error).message }
  }
}

export async function requestTransfer(recipientIdentifier: string, amount: number) {
  const user = await requireUser()
  if (!user) return { ok: false as const, error: 'Unauthorized' }
  if (!(amount > 0)) return { ok: false as const, error: 'Enter a valid amount' }
  try {
    const db = serviceClient()
    const ident = recipientIdentifier.trim().replace(/^@/, '')

    const { data: byUsername } = await db.from('profiles').select('id').eq('username', ident.toLowerCase()).maybeSingle()
    let recipientId = byUsername?.id as string | undefined

    if (!recipientId) {
      const { data: byWalletId } = await db.from('accounts').select('user_id').eq('wallet_id', ident).maybeSingle()
      recipientId = byWalletId?.user_id as string | undefined
    }
    if (!recipientId) {
      const { data: byEmail } = await db.from('profiles').select('id').ilike('email', ident).maybeSingle()
      recipientId = byEmail?.id as string | undefined
    }

    if (!recipientId) return { ok: false as const, error: `No Pulse user found for "${recipientIdentifier}"` }
    if (recipientId === user.id) return { ok: false as const, error: 'You cannot send funds to yourself' }

    await adjustAccount(user.id, { cash_balance: -amount })
    await recordTxn(user.id, {
      type: 'p2p_send',
      amount,
      currency: 'USD',
      status: 'pending',
      meta: { recipientId, recipientIdentifier: ident, label: 'Sent to another user' },
    })
    return { ok: true as const, snapshot: await getSnapshotFromDb(user.id) }
  } catch (e) {
    return { ok: false as const, error: (e as Error).message }
  }
}

export async function closeInvestment(holdingId: string) {
  const user = await requireUser()
  if (!user) return { ok: false as const, error: 'Unauthorized' }
  try {
    const db = serviceClient()
    const { data: holding } = await db
      .from('holdings')
      .select('*')
      .eq('id', holdingId)
      .eq('user_id', user.id)
      .maybeSingle()
    if (!holding) return { ok: false as const, error: 'Holding not found' }

  const amount = Number(holding.amount)
  const openedAt = new Date(holding.created_at ?? 0).getTime()
  const earlyClose = Number.isFinite(openedAt) && Date.now() - openedAt < 14 * 24 * 60 * 60 * 1000
  const earlyCloseFee = earlyClose ? 15 : 0
  await adjustAccount(user.id, { invested_balance: -amount, cash_balance: amount - earlyCloseFee })
  await db.from('holdings').delete().eq('id', holdingId).eq('user_id', user.id)
    await recordTxn(user.id, {
      type: 'close_investment',
      amount,
      currency: 'USD',
    meta: { holdingId, label: earlyClose ? 'Investment liquidated — $15 early close fee' : 'Investment liquidated', earlyCloseFee },
  })

    return { ok: true as const, snapshot: await getSnapshotFromDb(user.id) }
  } catch (e) {
    return { ok: false as const, error: (e as Error).message }
  }
}

export async function getLeaderboard(): Promise<{ ok: true; rows: LeaderboardRow[] } | { ok: false; error: string }> {
  try {
    const db = serviceClient()
    const [{ data: profiles }, { data: points }] = await Promise.all([
      db.from('profiles').select('id, username, full_name, tier').limit(200),
      db.from('points_ledger').select('user_id, amount'),
    ])

    const totals = new Map<string, number>()
    for (const p of points ?? []) {
      totals.set(p.user_id, (totals.get(p.user_id) ?? 0) + Number(p.amount))
    }

    const rows: LeaderboardRow[] = (profiles ?? [])
      .map((p) => ({
        rank: 0,
        username: p.username ?? p.full_name ?? 'Anonymous',
        tier: p.tier ?? 0,
        points: totals.get(p.id) ?? 0,
      }))
      .sort((a, b) => b.points - a.points)
      .slice(0, 20)
      .map((r, i) => ({ ...r, rank: i + 1 }))

    return { ok: true, rows }
  } catch (e) {
    return { ok: false, error: (e as Error).message }
  }
}

export async function getFoundersWall(): Promise<{ ok: true; rows: FounderRow[] } | { ok: false; error: string }> {
  try {
    const db = serviceClient()
    const { data } = await db
      .from('profiles')
      .select('username, full_name, founder_number')
      .not('founder_number', 'is', null)
      .order('founder_number', { ascending: true })
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
    const user = await requireUser()
    if (!user) return { ok: false, error: 'Unauthorized' }
    const db = serviceClient()
    const { data } = await db
      .from('profiles')
      .select('username, full_name, kyc_status, created_at')
      .eq('referred_by', user.id)
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
  return checkIsUserAdmin(userId)
}
