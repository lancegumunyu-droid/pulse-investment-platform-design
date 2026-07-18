'use client'

import { BadgeCheck, Copy, Gift, Lock, LogOut, ShieldCheck, User } from 'lucide-react'
import { usePulse } from '../store'
import { Glass, Pill, RiskNote, SectionTitle } from '../ui-bits'
import { Button } from '@/components/ui/button'

export function ProfileView() {
  const { state, currentTier, openModal, setView, toast, signOut, api } = usePulse()
  const referralCode = state.referralCode

  const copyRef = () => {
    navigator.clipboard?.writeText(`https://pulse.africa/join?ref=${referralCode}`)
    toast({ title: 'Referral link copied', variant: 'info' })
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
          <div>
            <p className="text-lg font-semibold">Investor</p>
            <p className="text-sm text-muted-foreground">{currentTier.name} tier</p>
          </div>
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
            <p className="text-xs text-muted-foreground">Invite others to explore Pulse</p>
          </div>
        </div>
        <div className="flex items-center gap-2 rounded-xl border border-white/8 bg-white/[0.03] px-3.5 py-2.5">
          <span className="flex-1 truncate font-mono text-sm">pulse.africa/join?ref={referralCode}</span>
          <button onClick={copyRef} className="text-gold" aria-label="Copy referral link">
            <Copy className="size-4" />
          </button>
        </div>
        <p className="mt-2.5 text-xs leading-relaxed text-muted-foreground">
          Our referral program is a marketing perk only. It does not affect your tier, your yields, or how projects
          perform — returns come solely from real project performance.
        </p>
      </Glass>

      <Glass className="animate-rise">
        <p className="text-sm font-semibold">How Pulse works</p>
        <ul className="mt-2 space-y-1.5 text-sm leading-relaxed text-muted-foreground">
          <li>· You buy shares in vetted, real SADC projects.</li>
          <li>· Projects generate variable returns based on actual performance.</li>
          <li>· Yields are targets, not guarantees — capital is at risk.</li>
          <li>· We publish performance reports and disburse returns transparently.</li>
        </ul>
      </Glass>

      <Button
        variant="outline"
        size="lg"
        className="h-11 w-full border-white/12 bg-white/[0.03] font-medium"
        onClick={() => setView('admin')}
      >
        <Lock className="size-4" /> Admin dashboard
      </Button>

      <RiskNote />
    </div>
  )
}
