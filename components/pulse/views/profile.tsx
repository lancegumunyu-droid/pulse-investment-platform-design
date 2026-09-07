'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Award,
  BadgeCheck,
  Copy,
  Gift,
  ListChecks,
  Lock,
  LogOut,
  Medal,
  ShieldCheck,
  Sparkles,
  Trophy,
  User,
  Users,
} from 'lucide-react'
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

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } },
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

  const referralLink = `https://pulseinvest.uk/?ref=${encodeURIComponent(referralCode)}`

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
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-5">
      <motion.div variants={itemVariants}>
        <SectionTitle title="Profile" subtitle="Account details, verification, and network activity." icon={<User className="size-5 text-amber-400 drop-shadow-[0_0_10px_rgba(245,166,35,0.6)]" />} />
      </motion.div>

      {/* Main Profile Header Card */}
      <motion.div variants={itemVariants} whileHover={{ scale: 1.01 }} className="transition-all">
        <Glass gold className="border border-amber-400/40 bg-gradient-to-b from-[#181510] to-[#0d0e12] backdrop-blur-2xl p-5 shadow-[0_0_40px_rgba(245,166,35,0.15)] relative overflow-hidden group">
          {/* Enhanced Shimmer & Background Glows */}
          <div className="pointer-events-none absolute -right-12 -top-12 size-48 rounded-full bg-amber-500/20 blur-3xl animate-pulse" />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-300/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 pointer-events-none" />

          <div className="flex items-center gap-4 relative z-10">
            <span className="flex size-14 items-center justify-center rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/40 shadow-[0_0_20px_rgba(245,166,35,0.3)]">
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
                    className="min-w-0 flex-1 rounded-xl border border-amber-400/50 bg-black/80 px-3 py-2 text-sm text-white outline-none focus:shadow-[0_0_15px_rgba(245,166,35,0.3)]"
                  />
                  <Button size="sm" className="shrink-0 bg-gradient-to-r from-amber-400 to-amber-500 font-bold text-black hover:brightness-110 shadow-[0_0_15px_rgba(245,166,35,0.4)]" disabled={savingUsername} onClick={saveUsername}>
                    Save
                  </Button>
                  <Button size="sm" variant="ghost" className="shrink-0 text-muted-foreground hover:text-white" onClick={() => { setEditingUsername(false); setUsernameInput(state.username ?? '') }}>
                    Cancel
                  </Button>
                </div>
              ) : (
                <button onClick={() => setEditingUsername(true)} className="text-left group/btn">
                  <p className="truncate text-lg font-bold text-white group-hover/btn:text-amber-300 transition-colors drop-shadow-sm">
                    {state.username ? `@${state.username}` : 'Set a username →'}
                  </p>
                </button>
              )}
              <p className="truncate text-xs text-zinc-400 mt-0.5">
                {state.fullName ?? 'Investor'} &middot; <span className="text-amber-400 font-semibold">{currentTier.name} tier</span>
              </p>
            </div>
          </div>

          {state.walletId && (
            <div className="mt-4 flex items-center justify-between rounded-xl border border-amber-400/20 bg-black/40 px-3.5 py-2.5 text-xs relative z-10 shadow-inner">
              <span className="text-zinc-400">Pulse Wallet ID</span>
              <span className="font-mono font-bold text-amber-400 drop-shadow-[0_0_8px_rgba(245,166,35,0.4)]">{state.walletId}</span>
            </div>
          )}

          {state.founderNumber && (
            <div className="mt-3 flex items-center gap-2.5 rounded-xl border border-amber-400/50 bg-gradient-to-r from-amber-500/20 via-amber-500/10 to-transparent px-3.5 py-2.5 relative overflow-hidden shadow-[0_0_20px_rgba(245,166,35,0.2)]">
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-amber-300/30 to-transparent animate-pulse" />
              <Award className="size-4 shrink-0 text-amber-400" />
              <p className="text-xs font-bold text-amber-300 relative z-10">Pulse Pioneer &mdash; Founder #{state.founderNumber} of 1,000</p>
            </div>
          )}
        </Glass>
      </motion.div>

      {/* Badges Section */}
      {state.badges.length > 0 && (
        <motion.div variants={itemVariants} whileHover={{ scale: 1.005 }} className="transition-all">
          <Glass className="border border-white/10 hover:border-amber-400/30 bg-black/40 backdrop-blur-xl p-5 shadow-lg transition-colors">
            <div className="mb-3 flex items-center gap-3">
              <span className="flex size-10 items-center justify-center rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/30 shadow-[0_0_15px_rgba(245,166,35,0.2)]">
                <Medal className="size-5" />
              </span>
              <div>
                <p className="text-sm font-bold text-white">Badges</p>
                <p className="text-xs text-zinc-400">Earned through real, verified activity</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {state.badges.map((b) => {
                const meta = BADGE_LABELS[b.key] ?? { label: b.key, hint: '' }
                return (
                  <div key={b.key} className="rounded-xl border border-amber-400/30 bg-gradient-to-br from-amber-500/10 to-transparent p-3 hover:border-amber-400/60 transition-all shadow-[0_0_10px_rgba(245,166,35,0.1)]">
                    <div className="flex items-center gap-1.5">
                      <Award className="size-3.5 shrink-0 text-amber-400" />
                      <p className="truncate text-xs font-bold text-amber-300">{meta.label}</p>
                    </div>
                    {meta.hint && <p className="mt-1 text-[10px] leading-snug text-zinc-400">{meta.hint}</p>}
                  </div>
                )
              })}
            </div>
          </Glass>
        </motion.div>
      )}

      {/* Pulse Points */}
      <motion.div variants={itemVariants} whileHover={{ scale: 1.005 }} className="transition-all">
        <Glass className="border border-white/10 hover:border-amber-400/30 bg-black/40 backdrop-blur-xl p-5 shadow-lg transition-colors">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="flex size-10 items-center justify-center rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/30 shadow-[0_0_15px_rgba(245,166,35,0.2)]">
                <Sparkles className="size-5 animate-pulse" />
              </span>
              <div>
                <p className="text-sm font-bold text-white">Pulse Points</p>
                <p className="text-xs text-zinc-400">Earned through real activity &mdash; never affects yield</p>
              </div>
            </div>
            <span className="font-mono text-lg font-black text-amber-400 drop-shadow-[0_0_10px_rgba(245,166,35,0.5)]">
              {state.points.toLocaleString()}
            </span>
          </div>
        </Glass>
      </motion.div>

      {/* Identity Verification */}
      <motion.div variants={itemVariants} whileHover={{ scale: 1.005 }} className="transition-all">
        <Glass className="border border-white/10 hover:border-amber-400/30 bg-black/40 backdrop-blur-xl p-5 shadow-lg transition-colors">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="flex size-10 items-center justify-center rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/30 shadow-[0_0_15px_rgba(245,166,35,0.2)]">
                <ShieldCheck className="size-5" />
              </span>
              <div>
                <p className="text-sm font-bold text-white">Identity verification</p>
                <p className="text-xs text-zinc-400">Required for larger investments & withdrawals</p>
              </div>
            </div>
            {state.kyc === 'verified' ? (
              <Pill tone="green" className="shadow-[0_0_12px_rgba(16,185,129,0.3)]">
                <BadgeCheck className="size-3.5" /> Verified
              </Pill>
            ) : (
              <Button size="sm" className="bg-gradient-to-r from-amber-400 to-amber-500 font-bold text-black hover:brightness-110 shadow-[0_0_20px_rgba(245,166,35,0.4)]" onClick={() => openModal('kyc')}>
                {state.kyc === 'pending' ? 'Pending' : 'Verify'}
              </Button>
            )}
          </div>
        </Glass>
      </motion.div>

      {/* Refer Friends Card */}
      <motion.div variants={itemVariants} whileHover={{ scale: 1.005 }} className="transition-all">
        <Glass className="border border-white/10 hover:border-amber-400/30 bg-black/40 backdrop-blur-xl p-5 shadow-lg transition-colors relative overflow-hidden">
          <div className="absolute right-0 bottom-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />
          
          <div className="mb-3 flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/30 shadow-[0_0_15px_rgba(245,166,35,0.2)]">
              <Gift className="size-5" />
            </span>
            <div>
              <p className="text-sm font-bold text-white">Refer friends</p>
              <p className="text-xs text-zinc-400">Earn Pulse Points &mdash; real people, real rewards</p>
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-xl border border-amber-400/20 bg-black/60 px-3.5 py-2.5 shadow-inner">
            <span className="flex-1 truncate font-mono text-sm text-amber-300">{referralLink}</span>
            <button onClick={copyRef} className="text-amber-400 hover:text-white transition-colors" aria-label="Copy referral link">
              <Copy className="size-4" />
            </button>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <div className="rounded-xl border border-white/10 bg-black/40 p-3 text-center shadow-inner">
              <p className="font-mono text-lg font-black text-white">{state.referralCount}</p>
              <p className="text-[10px] uppercase tracking-wide text-zinc-400">Joined via your link</p>
            </div>
            <div className="rounded-xl border border-amber-500/20 bg-black/40 p-3 text-center shadow-inner">
              <p className="font-mono text-lg font-black text-emerald-400 drop-shadow-[0_0_8px_rgba(16,185,129,0.3)]">{state.referralVerifiedCount}</p>
              <p className="text-[10px] uppercase tracking-wide text-zinc-400">Verified identity</p>
            </div>
          </div>
          <p className="mt-3 text-xs leading-relaxed text-zinc-400">
            You and your friend each earn 50 points when they sign up, 100 more when they verify their identity, and
            200 for you when they make their first investment. Points are a recognition system only &mdash; they never
            affect your tier, your yields, or how projects perform. Returns come solely from real project performance.
          </p>
        </Glass>
      </motion.div>

      {/* Accordions: My Referrals, Leaderboard, Founders */}
      {[
        { title: 'My Referrals', count: state.referralCount, data: myReferrals, loading: loadingReferrals, toggle: toggleMyReferrals, icon: <ListChecks className="size-5" /> },
        { title: 'Top Referrers', count: null, data: leaderboard, loading: loadingBoard, toggle: toggleLeaderboard, icon: <Trophy className="size-5" /> },
        { title: 'Wall of Founders', count: null, data: founders, loading: loadingFounders, toggle: toggleFounders, icon: <Users className="size-5" /> }
      ].map((section, idx) => (
        <motion.div key={idx} variants={itemVariants} whileHover={{ scale: 1.005 }} className="transition-all">
          <Glass className="border border-white/10 hover:border-amber-400/30 bg-black/40 backdrop-blur-xl p-5 shadow-lg transition-colors">
            <button onClick={section.toggle} className="flex w-full items-center justify-between text-left" disabled={section.loading}>
              <div className="flex items-center gap-3">
                <span className="flex size-10 items-center justify-center rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/30 shadow-[0_0_15px_rgba(245,166,35,0.2)]">
                  {section.icon}
                </span>
                <div>
                  <p className="text-sm font-bold text-white">{section.title}</p>
                  <p className="text-xs text-zinc-400">
                    {section.loading ? 'Loading…' : section.data ? 'Tap to hide' : 'Tap to expand & view details'}
                  </p>
                </div>
              </div>
            </button>
            {section.data && (
              <div className="mt-4 max-h-64 space-y-2.5 overflow-y-auto border-t border-white/10 pt-4 no-scrollbar">
                {section.data.length === 0 ? (
                  <p className="text-xs text-zinc-400">No records found yet.</p>
                ) : (
                  section.data.map((row: any, i: number) => (
                    <div key={i} className="flex items-center justify-between gap-2 text-xs border-b border-white/5 pb-2">
                      <div className="min-w-0">
                        <p className="truncate font-bold text-white">{row.displayName || row.fullName}</p>
                        <p className="truncate font-mono text-[10px] text-amber-400/80">{row.walletId ?? (row.totalPoints ? `${row.totalPoints.toLocaleString()} pts` : '')}</p>
                      </div>
                      {row.kycStatus ? (
                        <Pill tone={row.kycStatus === 'verified' ? 'green' : 'muted'}>{row.kycStatus}</Pill>
                      ) : row.founderNumber ? (
                        <span className="font-mono font-black text-amber-400">#{row.founderNumber}</span>
                      ) : null}
                    </div>
                  ))
                )}
              </div>
            )}
          </Glass>
        </motion.div>
      ))}

      {/* How Pulse Works */}
      <motion.div variants={itemVariants} whileHover={{ scale: 1.005 }} className="transition-all">
        <Glass className="border border-white/10 hover:border-amber-400/30 bg-black/40 backdrop-blur-xl p-5 shadow-lg transition-colors">
          <p className="text-sm font-bold text-white">How Pulse works</p>
          <ul className="mt-2.5 space-y-2 text-sm leading-relaxed text-zinc-400">
            <li>&middot; You buy shares in vetted, real SADC projects.</li>
            <li>&middot; Projects generate variable returns based on actual performance.</li>
            <li>&middot; Yields are targets, not guarantees &mdash; capital is at risk.</li>
            <li>&middot; We publish performance reports and disburse returns transparently.</li>
          </ul>
        </Glass>
      </motion.div>

      {state.isAdmin && (
        <motion.div variants={itemVariants} whileTap={{ scale: 0.98 }}>
          <Button
            variant="outline"
            size="lg"
            className="h-11 w-full border-amber-400/40 bg-amber-500/10 text-amber-300 font-bold hover:bg-amber-500/20 shadow-[0_0_20px_rgba(245,166,35,0.2)] transition-all"
            onClick={openAdmin}
          >
            <Lock className="size-4" />
            Admin dashboard
          </Button>
        </motion.div>
      )}

      <motion.div variants={itemVariants} whileTap={{ scale: 0.98 }}>
        <Button
          variant="ghost"
          size="lg"
          className="h-11 w-full font-bold text-zinc-400 hover:bg-red-500/10 hover:text-red-400 transition-colors"
          onClick={signOut}
        >
          <LogOut className="size-4" /> Sign out
        </Button>
      </motion.div>

      <motion.div variants={itemVariants}>
        <RiskNote />
      </motion.div>
    </motion.div>
  )
}
