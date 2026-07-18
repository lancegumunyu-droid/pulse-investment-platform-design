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
  type: 'deposit' | 'withdraw' | 'invest' | 'stake' | 'unstake' | 'sale'
  label: string
  amount: number
  currency: 'USDT' | 'PULSE'
  status: 'completed' | 'pending'
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
}

// Admin dashboard payload
export interface AdminUserRow {
  id: string
  email: string | null
  fullName: string | null
  role: string
  kycStatus: string
  cash: number
  invested: number
  staked: number
  createdAt: number
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
}

export interface AdminSnapshot {
  totalDeposits: number
  totalInvested: number
  totalStaked: number
  pendingWithdrawals: number
  pendingDeposits: number
  pendingKyc: number
  userCount: number
  users: AdminUserRow[]
  kycQueue: AdminKycRow[]
  withdrawalQueue: AdminTxnRow[]
  depositQueue: AdminTxnRow[]
  recentTxns: AdminTxnRow[]
}
