'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Copy, Gift, Lock, LogOut, User, ChevronDown } from 'lucide-react'
import { usePulse } from '../store'
import { Button } from '@/components/ui/button'
import type { LeaderboardRow, FounderRow, MyReferralRow } from '@/lib/pulse/types'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } },
}

/**
 * Persistent-ref mouse glow, identical to wallet.tsx.
 *
 * The PointerEvent type is imported explicitly rather than written as
 * `React.PointerEvent`. This file is an ES module with no default React
 * import, so `React.X` would resolve to the UMD global and fail type-check.
 */
export function ProfileView() {
  const { state, currentTier, setView, toast, signOut, api } = usePulse()
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

  const referralLink = `${typeof window !== 'undefined' ? window.location.origin : 'https://pulseinvest.uk'}/auth/sign-up?ref=${encodeURIComponent(referralCode)}`

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
    else toast({ title: 'Could not load Founders Wall', description: res.error, variant: 'error' })
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

  // Admin button is always visible; claimAdmin() checks profiles.role server-side.
  const openAdmin = async () => {
    const res = await api.claimAdmin()
    if (res.ok) {
      setView('admin')
    } else {
      toast({ title: 'Admin access unavailable', description: res.error, variant: 'error' })
    }
  }

  const displayName = state.fullName || state.username || 'Investor'

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="pulse-executive-shell mx-auto w-full max-w-[480px] space-y-4 pb-24 text-amber-100 antialiased lg:max-w-3xl"
    >
      {/* SECTION HEADER */}
      <motion.div variants={itemVariants} className="pulse-glass-card pulse-static flex items-center gap-3 p-4">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-amber-500/30 bg-amber-500/10">
          <User className="h-4 w-4 text-amber-400" />
        </span>
        <div>
          <h2 className="text-lg font-bold text-white">Profile</h2>
          <p className="pulse-label mt-0.5 normal-case tracking-normal text-zinc-400">
            Account details, verification, and network activity.
          </p>
        </div>
      </motion.div>

      {/* PROFILE HERO CARD */}
      <motion.div variants={itemVariants}>
        <div
          className="pulse-hero-premium pulse-glow-track"
        >
          <div className="relative z-[3] p-6 md:p-8">
            <div className="flex items-center gap-4">
              <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-amber-500/40 bg-amber-500/15 text-amber-400">
                <User className="h-7 w-7" />
              </span>
              <div className="min-w-0 flex-1">
                {editingUsername ? (
                  <div className="flex items-center gap-2">
                    <input
                      value={usernameInput}
                      onChange={(e) => setUsernameInput(e.target.value)}
                      placeholder="username"
                      autoFocus
                      className="pulse-input min-w-0 flex-1 border-amber-400/50 bg-black/80"
                    />
                    <Button
                      size="sm"
                      className="bg-amber-400 font-semibold text-black hover:bg-amber-300"
                      disabled={savingUsername}
                      onClick={saveUsername}
                    >
                      Save
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-muted-foreground"
                      onClick={() => {
                        setEditingUsername(false)
                        setUsernameInput(state.username ?? '')
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                ) : (
                  <button onClick={() => setEditingUsername(true)} className="text-left">
                    <p className="pulse-value-md truncate text-lg transition-colors hover:text-amber-300">
                      {state.username ? `@${state.username}` : 'Set a username \u2192'}
                    </p>
                  </button>
                )}
                <p className="pulse-label mt-1 truncate normal-case tracking-normal text-zinc-400">
                  {displayName} &middot; <span className="pulse-value-accent">{currentTier.name} tier</span>
                </p>
              </div>
            </div>

            {state.walletId && (
              <div className="mt-4 flex items-center justify-between rounded-xl border border-amber-500/20 bg-black/40 px-3.5 py-2.5">
                <span className="pulse-label">Pulse Wallet ID</span>
                <span className="pulse-value-accent">{state.walletId}</span>
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* REFER FRIENDS */}
      <motion.div variants={itemVariants} className="pulse-glass-card pulse-static p-5">
        <div className="mb-3 flex items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-amber-500/30 bg-amber-500/15 text-amber-400">
            <Gift className="h-5 w-5" />
          </span>
          <div>
            <p className="pulse-value-md">Refer friends</p>
            <p className="pulse-label mt-0.5 normal-case tracking-normal text-zinc-400">
              Earn Pulse Points and build your network
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 rounded-xl border border-amber-500/25 bg-black/40 px-3.5 py-2.5">
          <span className="flex-1 truncate font-mono text-sm text-amber-300">{referralLink}</span>
          <button
            onClick={copyRef}
            className="shrink-0 text-amber-400 transition-colors hover:text-white"
            aria-label="Copy referral link"
          >
            <Copy className="h-4 w-4" />
          </button>
        </div>
      </motion.div>

      {/* MY REFERRALS */}
      <motion.div variants={itemVariants} className="pulse-glass-card pulse-static overflow-hidden">
        <button onClick={toggleMyReferrals} className="pulse-vault-header w-full text-left">
          <div>
            <p className="pulse-value-md">My Referrals</p>
            <p className="pulse-label mt-0.5 normal-case tracking-normal text-zinc-400">Tap to expand &amp; view</p>
          </div>
          <motion.span animate={{ rotate: myReferrals ? 180 : 0 }} transition={{ duration: 0.25 }}>
            <ChevronDown className="h-4 w-4 text-amber-400" />
          </motion.span>
        </button>
        {loadingReferrals && !myReferrals ? (
          <p className="pulse-label p-5 normal-case tracking-normal text-zinc-500">Loading&hellip;</p>
        ) : myReferrals ? (
          <div className="divide-y divide-white/[0.06]">
            {myReferrals.length === 0 ? (
              <p className="pulse-label p-5 normal-case tracking-normal text-zinc-500">No referrals yet.</p>
            ) : (
              myReferrals.map((r, i) => (
                <div key={i} className="flex items-center justify-between p-4">
                  <span className="text-sm text-zinc-200">{r.name}</span>
                  <span className={r.status === 'verified' ? 'pulse-chip pulse-chip-green' : 'pulse-chip pulse-chip-gold'}>
                    {r.status}
                  </span>
                </div>
              ))
            )}
          </div>
        ) : null}
      </motion.div>

      {/* TOP REFERRERS */}
      <motion.div variants={itemVariants} className="pulse-glass-card pulse-static overflow-hidden">
        <button onClick={toggleLeaderboard} className="pulse-vault-header w-full text-left">
          <div>
            <p className="pulse-value-md">Top Referrers</p>
            <p className="pulse-label mt-0.5 normal-case tracking-normal text-zinc-400">Tap to expand &amp; view</p>
          </div>
          <motion.span animate={{ rotate: leaderboard ? 180 : 0 }} transition={{ duration: 0.25 }}>
            <ChevronDown className="h-4 w-4 text-amber-400" />
          </motion.span>
        </button>
        {loadingBoard && !leaderboard ? (
          <p className="pulse-label p-5 normal-case tracking-normal text-zinc-500">Loading&hellip;</p>
        ) : leaderboard ? (
          <div className="divide-y divide-white/[0.06]">
            {leaderboard.length === 0 ? (
              <p className="pulse-label p-5 normal-case tracking-normal text-zinc-500">No data yet.</p>
            ) : (
              leaderboard.map((row) => (
                <div key={row.rank} className="flex items-center justify-between p-4">
                  <span className="text-sm text-zinc-200">
                    #{row.rank} {row.username}
                  </span>
                  <span className="pulse-value-accent text-xs">{row.points} pts</span>
                </div>
              ))
            )}
          </div>
        ) : null}
      </motion.div>

      {/* WALL OF FOUNDERS */}
      <motion.div variants={itemVariants} className="pulse-glass-card pulse-static overflow-hidden">
        <button onClick={toggleFounders} className="pulse-vault-header w-full text-left">
          <div>
            <p className="pulse-value-md">Wall of Founders</p>
            <p className="pulse-label mt-0.5 normal-case tracking-normal text-zinc-400">Tap to expand &amp; view</p>
          </div>
          <motion.span animate={{ rotate: founders ? 180 : 0 }} transition={{ duration: 0.25 }}>
            <ChevronDown className="h-4 w-4 text-amber-400" />
          </motion.span>
        </button>
        {loadingFounders && !founders ? (
          <p className="pulse-label p-5 normal-case tracking-normal text-zinc-500">Loading&hellip;</p>
        ) : founders ? (
          <div className="divide-y divide-white/[0.06]">
            {founders.length === 0 ? (
              <p className="pulse-label p-5 normal-case tracking-normal text-zinc-500">No founders listed yet.</p>
            ) : (
              founders.map((f) => (
                <div key={f.founderNumber} className="flex items-center justify-between p-4">
                  <span className="text-sm text-zinc-200">
                    #{f.founderNumber} {f.name}
                  </span>
                </div>
              ))
            )}
          </div>
        ) : null}
      </motion.div>

      {/* ADMIN PANEL ACCESS */}
      <motion.div variants={itemVariants}>
        <button
          onClick={openAdmin}
          className="pulse-glass-card pulse-glow-track flex w-full items-center justify-center gap-2 p-4 text-sm font-semibold uppercase tracking-wide text-amber-300"
        >
          <Lock className="h-4 w-4" />
          Admin Dashboard
        </button>
      </motion.div>

      {/* SIGN OUT */}
      <motion.div variants={itemVariants}>
        <button
          onClick={signOut}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.02] p-4 text-sm font-semibold uppercase tracking-wide text-zinc-400 transition hover:border-red-500/30 hover:bg-red-500/5 hover:text-red-400"
        >
          <LogOut className="h-4 w-4" /> Sign out
        </button>
      </motion.div>

      {/* RISK DISCLAIMER */}
      <motion.div variants={itemVariants} className="pulse-glass-card pulse-static space-y-2 p-4">
        <div className="pulse-disclaimer-title flex items-center gap-2">
          <span>&#9888;&#65039;</span>
          <span>Risk Disclaimer</span>
        </div>
        <p className="pulse-disclaimer">
          Yield outputs and APY metrics reflect live ledger states and are variable, not guaranteed. Past performance
          does not guarantee future returns. Capital is at risk — do not invest money you cannot afford to lose.
        </p>
      </motion.div>
    </motion.div>
  )
}
