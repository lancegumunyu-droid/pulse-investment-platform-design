'use client'

import { AlertCircle, Lock, CheckCircle, Clock } from 'lucide-react'
import { getUserAccessRules, getUserMessaging, WELCOME_BONUS, TIER_CONFIG, type UserAccessRules } from '@/lib/pulse/business-rules'
import type { Snapshot } from '@/lib/pulse/types'

interface UserDashboardProtectedProps {
  snapshot: Snapshot | null
  onDeposit?: () => void
  onWithdraw?: () => void
  onInvest?: () => void
  onKyc?: () => void
}

export function UserDashboardProtected({
  snapshot,
  onDeposit,
  onWithdraw,
  onInvest,
  onKyc,
}: UserDashboardProtectedProps) {
  const rules = getUserAccessRules(snapshot)
  const messaging = getUserMessaging(snapshot)

  if (!snapshot) {
    return (
      <div className="space-y-6">
        <div className="rounded-lg border border-gold/20 bg-dark p-6">
          <h2 className="text-2xl font-bold text-gold">{messaging.title}</h2>
          <p className="mt-2 text-muted-foreground">{messaging.subtitle}</p>
          <button className="mt-4 rounded-lg bg-gold px-6 py-2 text-dark font-semibold hover:bg-gold/90">
            {messaging.actionRequired}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Status Banner */}
      <StatusBanner snapshot={snapshot} rules={rules} messaging={messaging} />

      {/* Alerts */}
      {rules.requiresKyc && <KycRequiredAlert onKyc={onKyc} />}
      {rules.userStatus === 'kyc_rejected' && <RejectedAlert />}
      {rules.userStatus === 'kyc_pending' && <PendingKycAlert />}

      {/* Welcome Bonus Section */}
      {snapshot.cash === WELCOME_BONUS.amount && (
        <WelcomeBonusCard snapshot={snapshot} rules={rules} onDeposit={onDeposit} />
      )}

      {/* Account Overview */}
      <AccountOverview snapshot={snapshot} rules={rules} />

      {/* Action Buttons */}
      <ActionButtons snapshot={snapshot} rules={rules} onDeposit={onDeposit} onWithdraw={onWithdraw} onInvest={onInvest} />

      {/* Tier Information */}
      <TierInfo snapshot={snapshot} rules={rules} />

      {/* Restrictions Notice */}
      {rules.requiresKyc && <RestrictionsNotice rules={rules} />}
    </div>
  )
}

function StatusBanner({
  snapshot,
  rules,
  messaging,
}: {
  snapshot: Snapshot
  rules: UserAccessRules
  messaging: ReturnType<typeof getUserMessaging>
}) {
  const statusColors = {
    new: 'border-yellow-500/30 bg-yellow-500/5',
    kyc_pending: 'border-blue-500/30 bg-blue-500/5',
    kyc_approved: 'border-green-500/30 bg-green-500/5',
    kyc_rejected: 'border-red-500/30 bg-red-500/5',
    blocked: 'border-red-500/30 bg-red-500/5',
  }

  return (
    <div className={`rounded-lg border p-6 ${statusColors[rules.userStatus]}`}>
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">{messaging.title}</h2>
          <p className="mt-2 text-muted-foreground">{messaging.subtitle}</p>
        </div>
        {rules.userStatus === 'kyc_approved' && <CheckCircle className="h-6 w-6 text-green-500" />}
        {rules.userStatus === 'kyc_pending' && <Clock className="h-6 w-6 text-blue-500" />}
        {rules.userStatus === 'kyc_rejected' && <AlertCircle className="h-6 w-6 text-red-500" />}
      </div>

      {messaging.actionRequired && (
        <div className="mt-4 flex items-center gap-2 rounded-lg bg-white/5 px-4 py-2">
          <AlertCircle className="h-4 w-4 text-yellow-500" />
          <span className="text-sm text-yellow-200">{messaging.actionRequired}</span>
        </div>
      )}
    </div>
  )
}

function KycRequiredAlert({ onKyc }: { onKyc?: () => void }) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-yellow-500/30 bg-yellow-500/5 p-4">
      <AlertCircle className="h-5 w-5 text-yellow-500 flex-shrink-0" />
      <div className="flex-1">
        <p className="text-sm font-semibold text-yellow-200">KYC Verification Required</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Complete your identity verification to unlock deposits, investments, and withdrawals.
        </p>
      </div>
      <button
        onClick={onKyc}
        className="flex-shrink-0 rounded-lg bg-gold px-4 py-1 text-xs font-semibold text-dark hover:bg-gold/90"
      >
        Verify Now
      </button>
    </div>
  )
}

function RejectedAlert() {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-red-500/30 bg-red-500/5 p-4">
      <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
      <div>
        <p className="text-sm font-semibold text-red-200">KYC Verification Rejected</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Your documents did not meet our requirements. Please{' '}
          <a href="mailto:support@pulse.app" className="underline">
            contact support
          </a>
          .
        </p>
      </div>
    </div>
  )
}

function PendingKycAlert() {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-blue-500/30 bg-blue-500/5 p-4">
      <Clock className="h-5 w-5 text-blue-500 flex-shrink-0" />
      <div>
        <p className="text-sm font-semibold text-blue-200">KYC Verification Pending</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Your documents are under review. This usually takes 1-2 business days.
        </p>
      </div>
    </div>
  )
}

function WelcomeBonusCard({
  snapshot,
  rules,
  onDeposit,
}: {
  snapshot: Snapshot
  rules: UserAccessRules
  onDeposit?: () => void
}) {
  return (
    <div className="rounded-lg border border-gold/30 bg-gradient-to-r from-gold/10 to-gold/5 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-muted-foreground">Welcome Bonus</p>
          <p className="mt-2 text-3xl font-bold text-gold">${WELCOME_BONUS.amount}</p>
          <p className="mt-2 text-xs text-muted-foreground max-w-md">
            {WELCOME_BONUS.message}
          </p>
        </div>
        <Lock className="h-8 w-8 text-gold/50" />
      </div>

      <button
        onClick={onDeposit}
        disabled={!rules.canDeposit}
        className="mt-4 w-full rounded-lg bg-gold px-6 py-3 font-semibold text-dark hover:bg-gold/90 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Make First Deposit to Unlock
      </button>
    </div>
  )
}

function AccountOverview({
  snapshot,
  rules,
}: {
  snapshot: Snapshot
  rules: UserAccessRules
}) {
  const cards = [
    {
      label: 'Cash Balance',
      value: `$${snapshot.cash.toFixed(2)}`,
      locked: !rules.canWithdraw,
    },
    {
      label: 'Invested',
      value: `$${snapshot.pulse.toFixed(2)}`,
      locked: !rules.canInvest,
    },
    {
      label: 'Staked',
      value: `$${snapshot.staked.toFixed(2)}`,
      locked: !rules.canAccessFloat,
    },
    {
      label: 'Pending Yield',
      value: `$${snapshot.pendingYield.toFixed(2)}`,
      locked: !rules.canInvest,
    },
  ]

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
      {cards.map((card) => (
        <div key={card.label} className="rounded-lg border border-gold/20 bg-dark/50 p-4">
          <p className="flex items-center justify-between text-xs font-semibold text-muted-foreground">
            {card.label}
            {card.locked && <Lock className="h-3 w-3" />}
          </p>
          <p className="mt-2 text-lg font-bold text-white">{card.value}</p>
        </div>
      ))}
    </div>
  )
}

function ActionButtons({
  snapshot,
  rules,
  onDeposit,
  onWithdraw,
  onInvest,
}: {
  snapshot: Snapshot
  rules: UserAccessRules
  onDeposit?: () => void
  onWithdraw?: () => void
  onInvest?: () => void
}) {
  const buttons = [
    {
      label: 'Deposit',
      onClick: onDeposit,
      enabled: rules.canDeposit,
      icon: '↓',
      color: 'bg-gold hover:bg-gold/90',
      disabledText: 'Complete KYC first',
    },
    {
      label: 'Withdraw',
      onClick: onWithdraw,
      enabled: rules.canWithdraw && snapshot.cash > WELCOME_BONUS.amount,
      icon: '↑',
      color: 'bg-gold/20 hover:bg-gold/30 text-gold',
      disabledText: 'Need approved KYC & deposit',
    },
    {
      label: 'Invest',
      onClick: onInvest,
      enabled: rules.canInvest,
      icon: '→',
      color: 'bg-gold/10 hover:bg-gold/20 text-gold border border-gold/30',
      disabledText: 'Complete KYC & deposit first',
    },
  ]

  return (
    <div className="grid grid-cols-3 gap-3">
      {buttons.map((btn) => (
        <button
          key={btn.label}
          onClick={btn.onClick}
          disabled={!btn.enabled}
          title={!btn.enabled ? btn.disabledText : undefined}
          className={`rounded-lg px-4 py-3 font-semibold transition ${btn.color} disabled:opacity-40 disabled:cursor-not-allowed`}
        >
          <span className="mr-1">{btn.icon}</span>
          {btn.label}
        </button>
      ))}
    </div>
  )
}

function TierInfo({
  snapshot,
  rules,
}: {
  snapshot: Snapshot
  rules: UserAccessRules
}) {
  const tierKey = `tier${snapshot.tier}` as keyof typeof TIER_CONFIG
  const tier = TIER_CONFIG[tierKey]

  return (
    <div className="rounded-lg border border-gold/20 bg-dark/50 p-4">
      <p className="text-xs font-semibold text-muted-foreground">Current Tier</p>
      <p className="mt-2 text-xl font-bold text-white">{tier.name}</p>
      <div className="mt-4 space-y-2 text-xs text-muted-foreground">
        <p>Min Deposit: ${tier.minDeposit}</p>
        <p>Max Deposit: ${tier.maxDeposit}</p>
        <p>Monthly Withdrawal Limit: ${tier.monthlyWithdrawalLimit}</p>
        <p>Float Access: {tier.floatAccessAllowed ? 'Yes' : 'No'}</p>
      </div>
    </div>
  )
}

function RestrictionsNotice({ rules }: { rules: UserAccessRules }) {
  const restrictions = []

  if (rules.requiresKyc) restrictions.push('Complete KYC verification')
  if (!rules.canDeposit) restrictions.push('Deposits are locked until KYC approval')
  if (!rules.canWithdraw) restrictions.push('Withdrawals are locked until KYC approval')
  if (!rules.canInvest) restrictions.push('Investments are locked until you deposit')
  if (!rules.canAccessFloat) restrictions.push('Float access requires Tier 2+')

  return (
    <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-4">
      <p className="text-sm font-semibold text-red-200">Current Restrictions</p>
      <ul className="mt-2 space-y-1">
        {restrictions.map((r) => (
          <li key={r} className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="h-1 w-1 rounded-full bg-red-500" />
            {r}
          </li>
        ))}
      </ul>
    </div>
  )
}
