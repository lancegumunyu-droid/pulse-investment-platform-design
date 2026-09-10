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
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-5 pb-32 pt-2 px-1 text-zinc-100 font-sans">
      <motion.div variants={itemVariants}>
        <SectionTitle title="Profile" subtitle="Account details, verification, and network activity." icon={<User className="size-5 text-amber-400" />} />
      </motion.div>

      {/* Main Profile Header Card */}
      <motion.div variants={itemVariants} className="transition-all">
        <Glass className="border border-amber-400/40 bg-gradient-to-b from-[#181510] to-[#0d0e12] p-5 relative overflow-hidden">
          <div className="flex items-center gap-4 relative z-10">
            <span className="flex size-14 items-center justify-center rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/40">
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
                    className="min-w-0 flex-1 rounded-xl border border-amber-400/50 bg-black/80 px-3 py-2 text-sm text-white outline-none"
                  />
                  <Button size="sm" className="bg-amber-400 font-bold text-black" disabled={savingUsername} onClick={saveUsername}>
                    Save
                  </Button>
                  <Button size="sm" variant="ghost" className="text-muted-foreground" onClick={() => { setEditingUsername(false); setUsernameInput(state.username ?? '') }}>
                    Cancel
                  </Button>
                </div>
              ) : (
                <button onClick={() => setEditingUsername(true)} className="text-left cursor-pointer">
                  <p className="truncate text-lg font-bold text-white hover:text-amber-300 transition-colors">
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
            <div className="mt-4 flex items-center justify-between rounded-xl border border-amber-400/20 bg-black/40 px-3.5 py-2.5 text-xs">
              <span className="text-zinc-400">Pulse Wallet ID</span>
              <span className="font-mono font-bold text-amber-400">{state.walletId}</span>
            </div>
          )}
        </Glass>
      </motion.div>

      {/* Refer Friends Card */}
      <motion.div variants={itemVariants} className="transition-all">
        <Glass className="border border-white/10 bg-black/40 p-5">
          <div className="mb-3 flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/30">
              <Gift className="size-5" />
            </span>
            <div>
              <p className="text-sm font-bold text-white">Refer friends</p>
              <p className="text-xs text-zinc-400">Earn Pulse Points and build your network</p>
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-xl border border-amber-400/20 bg-black/60 px-3.5 py-2.5">
            <span className="flex-1 truncate font-mono text-sm text-amber-300">{referralLink}</span>
            <button onClick={copyRef} className="text-amber-400 hover:text-white transition-colors cursor-pointer" aria-label="Copy referral link">
              <Copy className="size-4" />
            </button>
          </div>
        </Glass>
      </motion.div>

      {/* Admin Panel Access Button (Only visible if admin status is active) */}
      {state.isAdmin && (
        <motion.div variants={itemVariants}>
          <Button
            variant="outline"
            size="lg"
            className="h-11 w-full border-amber-400/40 bg-amber-500/10 text-amber-300 font-bold hover:bg-amber-500/20 cursor-pointer"
            onClick={openAdmin}
          >
            <Lock className="size-4 mr-2" />
            Admin Dashboard
          </Button>
        </motion.div>
      )}

      <motion.div variants={itemVariants}>
        <Button
          variant="ghost"
          size="lg"
          className="h-11 w-full font-bold text-zinc-400 hover:bg-red-500/10 hover:text-red-400 cursor-pointer"
          onClick={signOut}
        >
          <LogOut className="size-4 mr-2" /> Sign out
        </Button>
      </motion.div>

      <motion.div variants={itemVariants}>
        <RiskNote />
      </motion.div>
    </motion.div>
  )
}
