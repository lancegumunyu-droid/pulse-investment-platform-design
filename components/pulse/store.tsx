'use server'

import { createClient } from '@/lib/supabase/server'
import { serviceClient } from '@/lib/pulse/service'
import { adjustAccount, ensureAccount, getSnapshot, recordTxn } from '@/lib/pulse/data-access'
import { tierForAmount, TIERS, TOKEN } from '@/lib/pulse-data'
import type { Snapshot, LeaderboardRow, FounderRow, MyReferralRow } from '@/lib/pulse/types'

async function requireUser() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')
  return user
}

type Result = { ok: true; snapshot: Snapshot } | { ok: false; error: string }

export async function validateReferralCode(code: string): Promise<{ ok: true } | { ok: false; error: string }> {
  const clean = code.trim().replace(/^@/, '')
  if (!clean) return { ok: false, error: 'Enter the referral code your friend shared with you' }
  const db = serviceClient()
  const { data: referrer } = await db
    .from('profiles')
    .select('id, kyc_status')
    .eq('referral_code', clean)
    .maybeSingle()
  if (!referrer) return { ok: false, error: "We couldn't find a Pulse account with that code" }
  if (referrer.kyc_status !== 'verified') {
    return { ok: false, error: 'That account is not yet verified — only a verified user\'s code can be used' }
  }
  return { ok: true }
}

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
export async function submitDeposit(amount: number, currency: 'usdttrc20' | 'btc', txReference: string): Promise<Result> {
  try {
    const user = await requireUser()
    if (!(amount > 0)) return { ok: false, error: 'Enter a valid amount' }
    if (!txReference.trim()) return { ok: false, error: 'Enter the transaction reference / TXID you sent with' }
    const snap = await getSnapshot(user.id)
    if (snap.kyc !== 'verified') return { ok: false, error: 'Identity verification is required to deposit' }
    await recordTxn(user.id, {
      type: 'deposit',
      amount,
      currency: 'USD',
      status: 'pending',
      reference: txReference.trim(),
      meta: {
        label: `Manual deposit — ${currency === 'btc' ? 'BTC' : 'USDT (TRC-20)'}, awaiting admin verification`,
        payCurrency: currency,
        userTxRef: txReference.trim(),
      },
    })
    return withSnapshot(user.id)
  } catch (e) {
    return { ok: false, error: (e as Error).message }
  }
}

export async function requestWithdrawal(
  amount: number,
  destinationAddress: string,
  network: string,
  broker: string,
): Promise<Result> {
  try {
    const user = await requireUser()
    if (!(amount > 0)) return { ok: false, error: 'Enter a valid amount' }
    // Defensive: guard against a mismatched caller passing undefined for
    // any of these (this exact crash — "Cannot read properties of
    // undefined (reading 'trim')" — happened live from a stale/mismatched
    // client build). Never assume a string arg exists un-checked.
    if (!destinationAddress?.trim()) return { ok: false, error: 'Enter the wallet address to withdraw to' }
    const safeNetwork = network ?? ''
    const safeBroker = broker ?? ''
    const snap = await getSnapshot(user.id)
    if (snap.kyc !== 'verified') return { ok: false, error: 'Identity verification is required to withdraw' }
    if (amount > snap.cash) return { ok: false, error: 'Amount exceeds available balance' }
    const maxWithdrawable = snap.cash * 0.8
    if (amount > maxWithdrawable) {
      return { ok: false, error: `You can withdraw up to 80% of your balance at a time (max $${maxWithdrawable.toFixed(2)})` }
    }
    // Hold the funds and create a pending withdrawal for admin approval.
    await adjustAccount(user.id, { cash_balance: -amount })
    await recordTxn(user.id, {
      type: 'withdrawal',
      amount,
      currency: 'USD',
      status: 'pending',
      meta: {
        label: 'Withdrawal to wallet — awaiting admin approval',
        wallet: destinationAddress.trim(),
        network: safeNetwork.trim() || 'Not specified',
        broker: safeBroker.trim() || 'Not specified',
      },
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

    // Honest referral reward: points only, awarded once, on the referred
    // user's first investment. First-investment points apply to everyone;
    // the referrer bonus only applies if this user was actually referred.
    if (snap.holdings.length === 0) {
      const { error: pointsErr } = await db.rpc('award_points', { p_user_id: user.id, p_amount: 50, p_reason: 'First investment' })
      if (pointsErr) console.error('award_points (self) failed:', pointsErr.message)

      const { data: profile } = await db.from('profiles').select('referred_by').eq('id', user.id).maybeSingle()
      if (profile?.referred_by) {
        const { error: refErr } = await db.rpc('award_points', { p_user_id: profile.referred_by, p_amount: 200, p_reason: 'Your referral made their first investment' })
        if (refErr) console.error('award_points (referrer) failed:', refErr.message)
      }
    }

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

export async function sellToken(pulseAmount: number): Promise<Result> {
  try {
    const user = await requireUser()
    if (!(pulseAmount > 0)) return { ok: false, error: 'Enter a valid amount' }
    const snap = await getSnapshot(user.id)
    if (pulseAmount > snap.pulse) return { ok: false, error: 'Not enough liquid PULSE — staked PULSE must be unstaked first' }
    const usd = pulseAmount * TOKEN.salePrice
    await adjustAccount(user.id, { token_balance: -pulseAmount, cash_balance: usd })
    await recordTxn(user.id, {
      type: 'token_purchase',
      amount: usd,
      currency: 'USD',
      status: 'completed',
      meta: { label: `Converted ${Math.round(pulseAmount).toLocaleString()} PULSE to cash`, pulseAmount },
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
  nationality?: string
  country?: string
  phone?: string
  address?: string
}): Promise<Result> {
  try {
    const user = await requireUser()
    if (!input.fullName?.trim() || !input.idNumber?.trim()) {
      return { ok: false, error: 'Full name and ID number are required' }
    }
    if (!input.phone?.trim() || !input.address?.trim()) {
      return { ok: false, error: 'Phone number and address are required' }
    }
    if (!input.dateOfBirth) {
      return { ok: false, error: 'Date of birth is required' }
    }
    const dob = new Date(input.dateOfBirth)
    const age = (Date.now() - dob.getTime()) / (365.25 * 24 * 60 * 60 * 1000)
    if (age < 18) {
      return { ok: false, error: 'You must be at least 18 years old to invest with Pulse' }
    }
    const db = serviceClient()
    const idClean = input.idNumber.trim().toLowerCase()
    const { data: existing } = await db
      .from('kyc_submissions')
      .select('id, user_id')
      .ilike('id_number', idClean)
      .neq('user_id', user.id)
      .limit(1)
    if (existing && existing.length > 0) {
      return { ok: false, error: 'This ID number is already registered to another account' }
    }
    await db.from('kyc_submissions').insert({
      user_id: user.id,
      full_name: input.fullName.trim(),
      id_number: input.idNumber.trim(),
      date_of_birth: input.dateOfBirth || null,
      nationality: input.nationality || null,
      country: input.country || null,
      phone: input.phone.trim(),
      address: input.address.trim(),
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

export async function setUsername(username: string): Promise<Result> {
  try {
    const user = await requireUser()
    const clean = username.trim()
    if (!/^[a-zA-Z0-9_]{3,20}$/.test(clean)) {
      return { ok: false, error: 'Username must be 3–20 characters: letters, numbers, underscore only' }
    }
    const db = serviceClient()
    const { error } = await db.from('profiles').update({ username: clean }).eq('id', user.id)
    if (error) {
      if (error.code === '23505') return { ok: false, error: 'That username is already taken' }
      return { ok: false, error: error.message }
    }
    return withSnapshot(user.id)
  } catch (e) {
    return { ok: false, error: (e as Error).message }
  }
}

export async function addSavedWallet(label: string, address: string): Promise<Result> {
  try {
    const user = await requireUser()
    const cleanLabel = label.trim().slice(0, 40) || 'Wallet'
    const cleanAddress = address.trim()
    if (cleanAddress.length < 20) return { ok: false, error: 'That doesn\'t look like a valid address' }
    const db = serviceClient()
    const { error } = await db.from('saved_wallets').insert({ user_id: user.id, label: cleanLabel, address: cleanAddress })
    if (error) return { ok: false, error: error.message }
    return { ok: true, snapshot: await getSnapshot(user.id) }
  } catch (e) {
    return { ok: false, error: (e as Error).message }
  }
}

export async function removeSavedWallet(id: string): Promise<Result> {
  try {
    const user = await requireUser()
    const db = serviceClient()
    const { error } = await db.from('saved_wallets').delete().eq('id', id).eq('user_id', user.id)
    if (error) return { ok: false, error: error.message }
    return { ok: true, snapshot: await getSnapshot(user.id) }
  } catch (e) {
    return { ok: false, error: (e as Error).message }
  }
}

// P2P transfers, moderated: exactly the same hold-then-admin-approve
// pattern as withdrawals, for the same reason — the sender's funds are
// deducted immediately on request (so they can't spend the same balance
// twice while the transfer sits pending), and refunded if an admin
// rejects it. Nothing is ever credited to the recipient until an admin
// approves it. See admin.ts:reviewP2PTransfer for the other half.
export async function requestTransfer(recipientIdentifier: string, amount: number): Promise<Result> {
  try {
    const user = await requireUser()
    if (!Number.isFinite(amount) || amount <= 0) return { ok: false, error: 'Enter a valid amount' }
    const snap = await getSnapshot(user.id)
    if (snap.kyc !== 'verified') return { ok: false, error: 'Identity verification is required to send funds' }
    if (amount > snap.cash) return { ok: false, error: 'Amount exceeds your available balance' }

    const db = serviceClient()
    const clean = recipientIdentifier.trim().replace(/^@/, '')
    if (!clean) return { ok: false, error: 'Enter a username or Pulse ID' }

    // Look up by username first, then by Pulse Wallet ID — two separate
    // queries on purpose (see getMyReferrals for why we don't rely on
    // PostgREST embeds between profiles and accounts).
    let recipientId: string | null = null
    let recipientLabel = clean
    const { data: byUsername } = await db.from('profiles').select('id, username').ilike('username', clean).maybeSingle()
    if (byUsername) {
      recipientId = byUsername.id
      recipientLabel = byUsername.username ? `@${byUsername.username}` : clean
    } else {
      const { data: byWallet } = await db.from('accounts').select('user_id, wallet_id').eq('wallet_id', clean).maybeSingle()
      if (byWallet) {
        recipientId = byWallet.user_id
        recipientLabel = byWallet.wallet_id ?? clean
      }
    }
    if (!recipientId) return { ok: false, error: 'No Pulse user found with that username or Pulse ID' }
    if (recipientId === user.id) return { ok: false, error: "You can't send funds to yourself" }

    await adjustAccount(user.id, { cash_balance: -amount })
    await recordTxn(user.id, {
      type: 'p2p_send',
      amount,
      status: 'pending',
      meta: { label: `Sent to ${recipientLabel}`, recipientId, recipientLabel },
    })
    return { ok: true, snapshot: await getSnapshot(user.id) }
  } catch (e) {
    return { ok: false, error: (e as Error).message }
  }
}

export async function getMyNotifications(): Promise<
  { ok: true; rows: { id: string; title: string; body: string; kind: string; read: boolean; createdAt: number }[] } | { ok: false; error: string }
> {
  try {
    const user = await requireUser()
    const db = serviceClient()
    const { data, error } = await db
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(50)
    if (error) return { ok: false, error: error.message }
    return {
      ok: true,
      rows: (data ?? []).map((n) => ({
        id: n.id,
        title: n.title,
        body: n.body,
        kind: n.kind,
        read: n.read,
        createdAt: new Date(n.created_at).getTime(),
      })),
    }
  } catch (e) {
    return { ok: false, error: (e as Error).message }
  }
}

export async function markNotificationRead(id: string): Promise<Result> {
  try {
    const user = await requireUser()
    const db = serviceClient()
    await db.from('notifications').update({ read: true }).eq('id', id).eq('user_id', user.id)
    return withSnapshot(user.id)
  } catch (e) {
    return { ok: false, error: (e as Error).message }
  }
}

export async function applyForCard(): Promise<Result> {
  try {
    const user = await requireUser()
    const db = serviceClient()
    const snap = await getSnapshot(user.id)
    if (snap.kyc !== 'verified') {
      return { ok: false, error: 'Complete identity verification (KYC) before applying for a Pulse Card' }
    }
    const { data: existing } = await db.from('card_applications').select('id').eq('user_id', user.id).maybeSingle()
    if (!existing) {
      const { error } = await db.from('card_applications').insert({ user_id: user.id, status: 'waitlisted' })
      if (error) return { ok: false, error: error.message }
    }
    // already applied — treat as a no-op success, not an error
    return { ok: true, snapshot: await getSnapshot(user.id) }
  } catch (e) {
    return { ok: false, error: (e as Error).message }
  }
}

export async function getMyReferrals(): Promise<{ ok: true; rows: MyReferralRow[] } | { ok: false; error: string }> {
  try {
    const user = await requireUser()
    const db = serviceClient()
    const { data: referredProfiles, error } = await db
      .from('profiles')
      .select('id, username, full_name, kyc_status, created_at')
      .eq('referred_by', user.id)
      .order('created_at', { ascending: false })
    if (error) return { ok: false, error: error.message }

    const ids = (referredProfiles ?? []).map((p) => p.id)
    // Fetched separately and joined in JS, on purpose: profiles and accounts
    // have no foreign key PostgREST can resolve for an auto-embed
    // (`accounts(wallet_id)` inline in .select() throws "Could not find a
    // relationship between 'profiles' and 'accounts' in the schema cache").
    // Every other query in this codebase already avoids that embed for the
    // same reason — this is the one place that didn't, and it broke referrals
    // for every user in production. Not touching schema/FKs to fix this;
    // two queries + a Map merge is the same safe pattern used everywhere else.
    const walletByUserId = new Map<string, string | null>()
    if (ids.length > 0) {
      const { data: accts } = await db.from('accounts').select('user_id, wallet_id').in('user_id', ids)
      for (const a of accts ?? []) walletByUserId.set(a.user_id, a.wallet_id ?? null)
    }

    const rows: MyReferralRow[] = (referredProfiles ?? []).map((r) => {
      const walletId = walletByUserId.get(r.id) ?? null
      return {
        walletId,
        displayName: r.username ? `@${r.username}` : (walletId ?? 'Investor'),
        kycStatus: r.kyc_status ?? 'none',
        createdAt: new Date(r.created_at).getTime(),
      }
    })
    return { ok: true, rows }
  } catch (e) {
    return { ok: false, error: (e as Error).message }
  }
}

export async function getLeaderboard(): Promise<{ ok: true; rows: LeaderboardRow[] } | { ok: false; error: string }> {
  try {
    await requireUser()
    const db = serviceClient()
    const { data, error } = await db.rpc('get_leaderboard')
    if (error) return { ok: false, error: error.message }
    const rows: LeaderboardRow[] = (data ?? []).map((r: { full_name: string; total_points: number; founder_number: number | null }) => ({
      fullName: r.full_name,
      totalPoints: Number(r.total_points),
      founderNumber: r.founder_number,
    }))
    return { ok: true, rows }
  } catch (e) {
    return { ok: false, error: (e as Error).message }
  }
}

export async function getFoundersWall(): Promise<{ ok: true; rows: FounderRow[] } | { ok: false; error: string }> {
  try {
    await requireUser()
    const db = serviceClient()
    const { data, error } = await db.rpc('get_founders_wall')
    if (error) return { ok: false, error: error.message }
    const rows: FounderRow[] = (data ?? []).map((r: { full_name: string; founder_number: number }) => ({
      fullName: r.full_name,
      founderNumber: r.founder_number,
    }))
    return { ok: true, rows }
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
