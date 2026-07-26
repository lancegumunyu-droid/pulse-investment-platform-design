'use client'

import { useState } from 'react'
import { Award, BadgeCheck, Copy, Gift, ListChecks, Lock, LogOut, Medal, ShieldCheck, Sparkles, Trophy, User, Users } from 'lucide-react'
import { usePulse } from '../store'
import { Glass, Pill, RiskNote, SectionTitle } from '../ui-bits'
import { Button } from '@/components/ui/button'
import type { LeaderboardRow, FounderRow, MyReferralRow } from '@/lib/pulse/types'

const BADGE_LABELS: Record<string, { label: string; hint: string }> = {
  referral_10: { label: '10 Referrals', hint: '10 verified friends joined through you' },
  referral_25: { label: '25 Referrals', hint: '25 verified friends joined through you' },
  referral_100: { label: '100 Referrals', hint: '100 verified friends — free Pulse Card earned' },
  founder: { label: 'Founder', hint: 'One of the first 1,000 verified investors' },
}

export function ProfileView() {
  const { state, currentTier, openModal, setView, toast, signOut, api } = usePulse()
  const referralCode = state.referralCode
  const [leaderboard, setLeaderboard] = useState<LeaderboardRow[] | null>(null)
  const [founders, setFounders] = useState<FounderRow[] | null>(null)
  const [myReferrals, setMyReferrals] = useState<MyReferralRow[] | null>(null)
  const [loadingBoard, setLoadingBoard] = useState(false)
  const [loadingFounders, setLoadingFounders] = useState(false)
  const [loadingReferrals, setLoadingReferrals] = useState(false)
  const [editingUsername, setEditingUsername] = useState(false)
  const [usernameInput, setUsernameInput] = useState(state.username ?? '')
  const [savingUsername, setSavingUsername] = useState(false)

  const saveUsername = async () => {
    setSavingUsername(true)
    const res = await api.setUsername(usernameInput)
    if (res.ok) {
      toast({ title: 'Username updated', variant: 'success' })
      setEditingUsername(false)
    } else {
      toast({ title: 'Could not update username', description: res.error, variant: 'error' })
    }
    setSavingUsername(false)
  }

  const referralLink =
    typeof window !== 'undefined'
      ? `${window.location.origin}/auth/sign-up?ref=${referralCode}`
      : `https://pulse-invest.vercel.app/auth/sign-up?ref=${referralCode}`

  const copyRef = () => {
    navigator.clipboard?.writeText(referralLink)
    toast({ title: 'Referral link copied', variant: 'info' })
  }

  const toggleLeaderboard = async () => {
    if (leaderboard) {
      setLeaderboard(null)
      return
    }
    setLoadingBoard(true)
    const res = await api.leaderboard()
    if (res.ok) setLeaderboard(res.rows)
    else toast({ title: 'Could not load leaderboard', description: res.error, variant: 'error' })
    setLoadingBoard(false)
  }

  const toggleFounders = async () => {
    if (founders) {
      setFounders(null)
      return
    }
    setLoadingFounders(true)
    const res = await api.foundersWall()
    if (res.ok) setFounders(res.rows)
    else toast({ title: 'Could not load Founders\u2019 Wall', description: res.error, variant: 'error' })
    setLoadingFounders(false)
  }

  const toggleMyReferrals = async () => {
    if (myReferrals) {
      setMyReferrals(null)
      return
    }
    setLoadingReferrals(true)
    const res = await api.myReferrals()
    if (res.ok) setMyReferrals(res.rows)
    else toast({ title: 'Could not load referrals', description: res.error, variant: 'error' })
    setLoadingReferrals(false)
  }

  const openAdmin = async () => {
    if (state.isAdmin) {
      setView('admin')
      return
    }
    const res = await api.claimAdmin()
    if (res.ok) {
      toast({ title: 'Admin access granted', description: 'You are now a platform administrator.', variant: 'success' })
      setView('admin')
    } else {
      toast({ title: 'Admin access unavailable', description: res.error, variant: 'error' })
    }
  }

  return (
    <div className="space-y-5">
      <SectionTitle title="Profile" icon={<User className="size-5" />} />

      <Glass className="animate-rise">
        <div className="flex items-center gap-4">
          <span className="flex size-14 items-center justify-center rounded-2xl glass-gold text-gold">
            <User className="size-7" />
          </span>
          <div className="min-w-0 flex-1">
            {editingUsername ? (
              <div className="flex items-center gap-2">
                <input
                  value={usernameInput}
                  onChange={(e) => setUsernameInput(e.target.value)}
                  placeholder="username"
                  autoFocus
                  className="min-w-0 flex-1 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-sm outline-none focus:border-gold/50"
                />
                <Button size="sm" className="shrink-0 bg-gold font-semibold text-primary-foreground hover:bg-gold/90" disabled={savingUsername} onClick={saveUsername}>
                  Save
                </Button>
                <Button size="sm" variant="ghost" className="shrink-0" onClick={() => { setEditingUsername(false); setUsernameInput(state.username ?? '') }}>
                  Cancel
                </Button>
              </div>
            ) : (
              <button onClick={() => setEditingUsername(true)} className="text-left">
                <p className="truncate text-lg font-semibold">
                  {state.username ? `@${state.username}` : 'Set a username →'}
                </p>
              </button>
            )}
            <p className="truncate text-sm text-muted-foreground">
              {state.fullName ?? 'Investor'} &middot; {currentTier.name} tier
            </p>
          </div>
        </div>
        {state.walletId && (
          <div className="mt-2 flex items-center justify-between rounded-xl bg-white/[0.03] px-3.5 py-2.5 text-xs">
            <span className="text-muted-foreground">Pulse Wallet ID</span>
            <span className="font-mono font-semibold text-gold">{state.walletId}</span>
          </div>
        )}
        {state.founderNumber && (
          <div className="mt-2 flex items-center gap-2 rounded-xl border border-gold/30 bg-gold/[0.08] px-3.5 py-2.5">
            <Award className="size-4 shrink-0 text-gold" />
            <p className="text-xs font-semibold text-gold">Pulse Pioneer &mdash; Founder #{state.founderNumber} of 1,000</p>
          </div>
        )}
      </Glass>

      {state.badges.length > 0 && (
        <Glass className="animate-rise">
          <div className="mb-3 flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-xl bg-gold-soft text-gold">
              <Medal className="size-5" />
            </span>
            <div>
              <p className="text-sm font-semibold">Badges</p>
              <p className="text-xs text-muted-foreground">Earned through real, verified activity</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {state.badges.map((b) => {
              const meta = BADGE_LABELS[b.key] ?? { label: b.key, hint: '' }
              return (
                <div key={b.key} className="rounded-xl border border-gold/25 bg-gold/[0.06] p-2.5">
                  <div className="flex items-center gap-1.5">
                    <Award className="size-3.5 shrink-0 text-gold" />
                    <p className="truncate text-xs font-semibold text-gold">{meta.label}</p>
                  </div>
                  {meta.hint && <p className="mt-1 text-[10px] leading-snug text-muted-foreground">{meta.hint}</p>}
                </div>
              )
            })}
          </div>
        </Glass>
      )}

      <Glass className="animate-rise">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-xl bg-gold-soft text-gold">
              <Sparkles className="size-5" />
            </span>
            <div>
              <p className="text-sm font-semibold">Pulse Points</p>
              <p className="text-xs text-muted-foreground">Earned through real activity &mdash; never affects yield</p>
            </div>
          </div>
          <span className="font-mono text-lg font-semibold text-gold">{state.points.toLocaleString()}</span>
        </div>
      </Glass>

      <Glass className="animate-rise">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-xl bg-gold-soft text-gold">
              <ShieldCheck className="size-5" />
            </span>
            <div>
              <p className="text-sm font-semibold">Identity verification</p>
              <p className="text-xs text-muted-foreground">Required for larger investments & withdrawals</p>
            </div>
          </div>
          {state.kyc === 'verified' ? (
            <Pill tone="green">
              <BadgeCheck className="size-3.5" /> Verified
            </Pill>
          ) : (
            <Button size="sm" className="bg-gold font-semibold text-primary-foreground hover:bg-gold/90" onClick={() => openModal('kyc')}>
              {state.kyc === 'pending' ? 'Pending' : 'Verify'}
            </Button>
          )}
        </div>
      </Glass>

      <Glass className="animate-rise">
        <div className="mb-3 flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-xl bg-gold-soft text-gold">
            <Gift className="size-5" />
          </span>
          <div>
            <p className="text-sm font-semibold">Refer friends</p>
            <p className="text-xs text-muted-foreground">Earn Pulse Points &mdash; real people, real rewards</p>
          </div>
        </div>
        <div className="flex items-center gap-2 rounded-xl border border-white/8 bg-white/[0.03] px-3.5 py-2.5">
          <span className="flex-1 truncate font-mono text-sm">{referralLink}</span>
          <button onClick={copyRef} className="text-gold" aria-label="Copy referral link">
            <Copy className="size-4" />
          </button>
        </div>
        <div className="mt-2.5 grid grid-cols-2 gap-2">
          <div className="rounded-xl bg-white/[0.03] p-2.5 text-center">
            <p className="font-mono text-lg font-semibold">{state.referralCount}</p>
            <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Joined via your link</p>
          </div>
          <div className="rounded-xl bg-white/[0.03] p-2.5 text-center">
            <p className="font-mono text-lg font-semibold text-green">{state.referralVerifiedCount}</p>
            <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Verified identity</p>
          </div>
        </div>
        <p className="mt-2.5 text-xs leading-relaxed text-muted-foreground">
          You and your friend each earn 50 points when they sign up, 100 more when they verify their identity, and
          200 for you when they make their first investment. Points are a recognition system only &mdash; they never
          affect your tier, your yields, or how projects perform. Returns come solely from real project performance.
        </p>
      </Glass>

      <Glass className="animate-rise">
        <button onClick={toggleMyReferrals} className="flex w-full items-center justify-between" disabled={loadingReferrals}>
          <div className="flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-xl bg-gold-soft text-gold">
              <ListChecks className="size-5" />
            </span>
            <div className="text-left">
              <p className="text-sm font-semibold">My Referrals</p>
              <p className="text-xs text-muted-foreground">
                {loadingReferrals ? 'Loading…' : myReferrals ? 'Tap to hide' : `${state.referralCount} joined via your link`}
              </p>
            </div>
          </div>
        </button>
        {myReferrals && (
          <div className="mt-3 max-h-64 space-y-2 overflow-y-auto border-t border-white/8 pt-3 no-scrollbar">
            {myReferrals.length === 0 ? (
              <p className="text-xs text-muted-foreground">Nobody has joined with your link yet.</p>
            ) : (
              myReferrals.map((r, i) => (
                <div key={i} className="flex items-center justify-between gap-2 text-xs">
                  <div className="min-w-0">
                    <p className="truncate font-medium">{r.displayName}</p>
                    <p className="truncate font-mono text-[10px] text-muted-foreground">{r.walletId ?? 'No wallet yet'}</p>
                  </div>
                  <Pill tone={r.kycStatus === 'verified' ? 'green' : 'muted'}>{r.kycStatus}</Pill>
                </div>
              ))
            )}
          </div>
        )}
      </Glass>

      <Glass className="animate-rise">
        <button onClick={toggleLeaderboard} className="flex w-full items-center justify-between" disabled={loadingBoard}>
          <div className="flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-xl bg-gold-soft text-gold">
              <Trophy className="size-5" />
            </span>
            <div className="text-left">
              <p className="text-sm font-semibold">Top Referrers</p>
              <p className="text-xs text-muted-foreground">{loadingBoard ? 'Loading…' : leaderboard ? 'Tap to hide' : 'Tap to view'}</p>
            </div>
          </div>
        </button>
        {leaderboard && (
          <div className="mt-3 space-y-1.5 border-t border-white/8 pt-3">
            {leaderboard.length === 0 ? (
              <p className="text-xs text-muted-foreground">No points earned yet &mdash; be the first.</p>
            ) : (
              leaderboard.map((row, i) => (
                <div key={i} className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">
                    #{i + 1} {row.fullName}
                    {row.founderNumber ? <span className="ml-1.5 text-gold">Founder #{row.founderNumber}</span> : null}
                  </span>
                  <span className="font-mono font-semibold">{row.totalPoints.toLocaleString()} pts</span>
                </div>
              ))
            )}
          </div>
        )}
      </Glass>

      <Glass className="animate-rise">
        <button onClick={toggleFounders} className="flex w-full items-center justify-between" disabled={loadingFounders}>
          <div className="flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-xl bg-gold-soft text-gold">
              <Users className="size-5" />
            </span>
            <div className="text-left">
              <p className="text-sm font-semibold">Wall of Founders</p>
              <p className="text-xs text-muted-foreground">{loadingFounders ? 'Loading…' : founders ? 'Tap to hide' : 'The first 1,000 verified investors'}</p>
            </div>
          </div>
        </button>
        {founders && (
          <div className="mt-3 max-h-64 space-y-1.5 overflow-y-auto border-t border-white/8 pt-3 no-scrollbar">
            {founders.length === 0 ? (
              <p className="text-xs text-muted-foreground">No Founders yet &mdash; complete KYC to become #1.</p>
            ) : (
              founders.map((row) => (
                <div key={row.founderNumber} className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">{row.fullName}</span>
                  <span className="font-mono font-semibold text-gold">#{row.founderNumber}</span>
                </div>
              ))
            )}
          </div>
        )}
      </Glass>

      <Glass className="animate-rise">
        <p className="text-sm font-semibold">How Pulse works</p>
        <ul className="mt-2 space-y-1.5 text-sm leading-relaxed text-muted-foreground">
          <li>&middot; You buy shares in vetted, real SADC projects.</li>
          <li>&middot; Projects generate variable returns based on actual performance.</li>
          <li>&middot; Yields are targets, not guarantees &mdash; capital is at risk.</li>
          <li>&middot; We publish performance reports and disburse returns transparently.</li>
        </ul>
      </Glass>

      {state.isAdmin && (
        <Button
          variant="outline"
          size="lg"
          className="h-11 w-full border-white/12 bg-white/[0.03] font-medium"
          onClick={openAdmin}
        >
          <Lock className="size-4" />
          Admin dashboard
        </Button>
      )}

      <Button
        variant="ghost"
        size="lg"
        className="h-11 w-full font-medium text-muted-foreground hover:text-destructive"
        onClick={signOut}
      >
        <LogOut className="size-4" /> Sign out
      </Button>

      <RiskNote />
    </div>
  )
}
