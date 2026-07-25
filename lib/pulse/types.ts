import type { TierId } from '@/lib/pulse-data'

export type KycStatus = 'none' | 'pending' | 'verified' | 'rejected'

export interface SnapshotHolding {
  id: string
  projectId: string
  tierId: TierId
  amount: number
  date: number
}

export interface SnapshotTxn {
  id: string
  type: 'deposit' | 'withdraw' | 'invest' | 'stake' | 'unstake' | 'sale' | 'p2p_send' | 'p2p_receive'
  label: string
  amount: number
  currency: 'USDT' | 'PULSE'
  status: 'completed' | 'pending' | 'cancelled' | 'failed'
  date: number
}

export interface Snapshot {
  cash: number
  pulse: number
  staked: number
  pendingYield: number
  holdings: SnapshotHolding[]
  txns: SnapshotTxn[]
  kyc: KycStatus
  wallet: string | null
  referralCode: string
  fullName: string | null
  email: string | null
  tier: number
  isAdmin: boolean
  points: number
  founderNumber: number | null
  walletId: string | null
  username: string | null
  referralCount: number
  referralVerifiedCount: number
  badges: BadgeRow[]
  adminScope: 'full' | 'finance' | 'operations' | null
  cardStatus: 'none' | 'waitlisted' | 'approved' | 'free_card_earned'
  cardRef: string | null
  savedWallets: SavedWallet[]
}

export interface SavedWallet {
  id: string
  label: string
  address: string
}

export interface BadgeRow {
  key: string
  earnedAt: number
}

export interface MyReferralRow {
  walletId: string | null
  displayName: string
  kycStatus: string
  createdAt: number
}

export interface LeaderboardRow {
  fullName: string
  totalPoints: number
  founderNumber: number | null
}

export interface FounderRow {
  fullName: string
  founderNumber: number
}

// Admin dashboard payload
export interface AdminUserRow {
  id: string
  email: string | null
  fullName: string | null
  username: string | null
  role: string
  kycStatus: string
  cash: number
  invested: number
  staked: number
  createdAt: number
  adminScope: 'full' | 'finance' | 'operations' | null
}

export interface AdminKycRow {
  id: string
  userId: string
  email: string | null
  fullName: string
  idNumber: string
  dateOfBirth: string | null
  country: string | null
  status: string
  createdAt: number
}

export interface AdminCardRow {
  id: string
  userId: string
  email: string | null
  fullName: string | null
  kycStatus: string
  status: string
  createdAt: number
}

export interface AdminTxnRow {
  id: string
  userId: string
  email: string | null
  type: string
  amount: number
  currency: string
  status: string
  reference: string | null
  createdAt: number
  // NEW: lets the admin dashboard show "payment confirmed by NOWPayments,
  // awaiting your approval" vs. "awaiting payment" for deposits.
  settledStatus?: string | null
  // NEW: the deposit currency and the TXID/reference the user typed in,
  // so admin can cross-check it against the actual chain before approving.
  payCurrency?: string | null
  userTxRef?: string | null
  // NEW: for withdrawals — the address, network, and broker/exchange the
  // user entered when requesting the withdrawal.
  destinationAddress?: string | null
  network?: string | null
  broker?: string | null
  // NEW: for p2p_send rows, who the money is headed to — resolved
  // server-side so the admin doesn't have to cross-reference user IDs.
  counterpartyLabel?: string | null
}

export interface AdminSnapshot {
  totalDeposits: number
  totalInvested: number
  totalStaked: number
  pendingWithdrawals: number
  pendingDeposits: number // NEW
  pendingKyc: number
  pendingP2P: number // NEW
  pendingCards: number // NEW
  userCount: number
  users: AdminUserRow[]
  kycQueue: AdminKycRow[]
  withdrawalQueue: AdminTxnRow[]
  depositQueue: AdminTxnRow[] // NEW
  p2pQueue: AdminTxnRow[] // NEW
  cardQueue: AdminCardRow[] // NEW
  recentTxns: AdminTxnRow[]
}
