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
  status: 'completed' | 'pending' | 'processing' | 'cancelled' | 'failed' | 'rejected'
  /** True while an admin has picked the txn up but not yet finalised it. */
  isProcessing?: boolean
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
  /** ADDED: data-access.ts has always returned this from card_applications.card_ref,
   *  but it was missing from the type, so wallet.tsx could never read it and the
   *  card face was permanently stuck on bullets. */
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
  name: string
  status: 'verified' | 'pending'
  date: number
}

export interface LeaderboardRow {
  rank: number
  username: string
  tier: number
  points: number
}

export interface FounderRow {
  founderNumber: number
  name: string
}

// ==========================================
// ADMIN DASHBOARD PAYLOAD
// ==========================================

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
  adminScope: 'full' | 'finance' | 'operations' | 'manager' | 'director' | null
  managerId: string | null
  isAdmin: boolean
  kycVerified?: boolean
}

export interface AdminKycRow {
  id: string
  userId: string
  email: string | null
  fullName: string
  idNumber: string
  dateOfBirth: string | null
  nationality: string | null
  country: string | null
  status: string
  createdAt: number
}

export interface AdminCardRow {
  id: string
  userId: string
  email: string | null
  fullName: string | null
  cardType: string
  shippingAddress: string | null
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
  settledStatus?: string | null
  payCurrency?: string | null
  userTxRef?: string | null
  destinationAddress?: string | null
  walletName?: string | null
  network?: string | null
  broker?: string | null
  counterpartyLabel?: string | null
}

export interface AdminP2PRow {
  id: string
  senderId: string
  senderEmail: string | null
  recipientId: string
  recipientEmail: string | null
  type: string
  amount: number
  currency: string
  status: string
  reference: string | null
  note: string | null
  createdAt: number
}

export interface AdminSnapshot {
  totalDeposits: number
  totalInvested: number
  totalStaked: number
  pendingWithdrawals: number
  pendingDeposits: number
  pendingKyc: number
  pendingP2P: number
  pendingCards: number
  userCount: number
  users: AdminUserRow[]
  /** admin.tsx renders `snapshot.usersList` — kept as an alias of `users`
   *  so both names resolve instead of one silently rendering nothing. */
  usersList: AdminUserRow[]
  kycQueue: AdminKycRow[]
  withdrawalQueue: AdminTxnRow[]
  depositQueue: AdminTxnRow[]
  p2pQueue: AdminP2PRow[]
  cardQueue: AdminCardRow[]
  recentTxns: AdminTxnRow[]
}
