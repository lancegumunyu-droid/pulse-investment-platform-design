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
  adminScope: 'full' | 'finance' | 'operations' | 'manager' | 'director' | null
  cardStatus: 'none' | 'waitlisted' | 'approved' | 'free_card_earned'
  /** data-access.ts has always returned card_applications.card_ref, but it was
   *  missing from this type, so wallet.tsx could never read it and the card
   *  face was permanently stuck on bullets. */
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

/** Shape returned by getMyReferrals() — was previously declared with fields
 *  (walletId / displayName / kycStatus / createdAt) that the action never
 *  produced, so profile.tsx read undefined for every row. */
export interface MyReferralRow {
  name: string
  status: 'verified' | 'pending'
  date: number
}

/** Shape returned by getLeaderboard(). Same mismatch as above: the old type
 *  declared fullName / totalPoints / founderNumber while the action returned
 *  rank / username / tier / points. */
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
  /** admin.tsx renders this to pick the Verified/Pending pill. */
  kycVerified: boolean
  cash: number
  invested: number
  staked: number
  createdAt: number
  adminScope: 'full' | 'finance' | 'operations' | 'manager' | 'director' | null
  managerId: string | null
  isAdmin: boolean
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
  /** admin.tsx maps over `usersList`; kept as an alias of `users` so both
   *  names resolve instead of one rendering an empty table. */
  usersList: AdminUserRow[]
  kycQueue: AdminKycRow[]
  withdrawalQueue: AdminTxnRow[]
  depositQueue: AdminTxnRow[]
  p2pQueue: AdminP2PRow[]
  cardQueue: AdminCardRow[]
  recentTxns: AdminTxnRow[]
}
