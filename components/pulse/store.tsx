'use client'

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  useTransition,
  type ReactNode,
} from 'react'
import { useRouter } from 'next/navigation'
import { tierForAmount, TIERS, TOKEN } from '@/lib/pulse-data'
import { createClient } from '@/lib/supabase/client'
import type { Snapshot, SnapshotHolding, SnapshotTxn, LeaderboardRow, FounderRow } from '@/lib/pulse/types'
import {
  buyToken as buyTokenAction,
  castVote,
  claimAdmin as claimAdminAction,
  fetchSnapshot,
  getFoundersWall,
  getLeaderboard,
  invest as investAction,
  requestWithdrawal,
  setWallet as setWalletAction,
  simulateDeposit,
  stake as stakeAction,
  submitKyc as submitKycAction,
  unstake as unstakeAction,
} from '@/app/actions/pulse'

export type View = 'dashboard' | 'invest' | 'sale' | 'stake' | 'signals' | 'wallet' | 'profile' | 'admin'
export type KycStatus = 'none' | 'pending' | 'verified' | 'rejected'
export type Holding = SnapshotHolding
export type Txn = SnapshotTxn

export interface ModalState {
  type: 'kyc' | 'invest' | 'deposit' | 'withdraw' | null
  payload?: Record<string, unknown>
}

interface State {
  cash: number
  pulse: number
  staked: number
  pendingYield: number
  holdings: Holding[]
  txns: Txn[]
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
}

function fromSnapshot(s: Snapshot): State {
  return {
    cash: s.cash,
    pulse: s.pulse,
    staked: s.staked,
    pendingYield: s.pendingYield,
    holdings: s.holdings,
    txns: s.txns,
    kyc: s.kyc,
    wallet: s.wallet,
    referralCode: s.referralCode,
    fullName: s.fullName,
    email: s.email,
    tier: s.tier,
    isAdmin: s.isAdmin,
    points: s.points,
    founderNumber: s.founderNumber,
    walletId: s.walletId,
  }
}

function uid() {
  return Math.random().toString(36).slice(2, 10)
}

export interface Toast {
  id: string
  title: string
  description?: string
  variant: 'success' | 'error' | 'info'
}

type ActionResult = { ok: true; snapshot: Snapshot } | { ok: false; error: string }

interface StoreContext {
  state: State
  busy: boolean
  view: View
  setView: (v: View) => void
  modal: ModalState
  openModal: (type: ModalState['type'], payload?: Record<string, unknown>) => void
  closeModal: () => void
  toasts: Toast[]
  toast: (t: Omit<Toast, 'id'>) => void
  dismissToast: (id: string) => void
  totalInvested: number
  currentTier: (typeof TIERS)[number]
  portfolioValue: number
  refresh: () => Promise<void>
  signOut: () => Promise<void>
  api: {
    deposit: (amount: number) => Promise<ActionResult>
    withdraw: (amount: number) => Promise<ActionResult>
    invest: (amount: number, projectId: string) => Promise<ActionResult>
    buyToken: (cost: number, pulse: number) => Promise<ActionResult>
    stake: (amount: number) => Promise<ActionResult>
    unstake: (amount: number) => Promise<ActionResult>
    connectWallet: (address: string) => Promise<ActionResult>
    disconnectWallet: () => Promise<ActionResult>
    submitKyc: (input: { fullName: string; idNumber: string; dateOfBirth?: string; country?: string; phone?: string; address?: string }) => Promise<ActionResult>
    vote: (proposalId: string, choice: 'for' | 'against' | 'abstain') => Promise<ActionResult>
    claimAdmin: () => Promise<ActionResult>
    leaderboard: () => Promise<{ ok: true; rows: LeaderboardRow[] } | { ok: false; error: string }>
    foundersWall: () => Promise<{ ok: true; rows: FounderRow[] } | { ok: false; error: string }>
  }
}

const Ctx = createContext<StoreContext | null>(null)

export function PulseProvider({ children, initial }: { children: ReactNode; initial: Snapshot }) {
  const router = useRouter()
  const [state, setState] = useState<State>(() => fromSnapshot(initial))
  const [view, setView] = useState<View>('dashboard')
  const [modal, setModal] = useState<ModalState>({ type: null })
  const [toasts, setToasts] = useState<Toast[]>([])
  const [pending, startTransition] = useTransition()
  const [localBusy, setLocalBusy] = useState(false)

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const toast = useCallback(
    (t: Omit<Toast, 'id'>) => {
      const id = uid()
      setToasts((prev) => [...prev, { ...t, id }])
      setTimeout(() => dismissToast(id), 4200)
    },
    [dismissToast],
  )

  const openModal = useCallback(
    (type: ModalState['type'], payload?: Record<string, unknown>) => setModal({ type, payload }),
    [],
  )
  const closeModal = useCallback(() => setModal({ type: null }), [])

  const applyResult = useCallback((res: ActionResult): ActionResult => {
    if (res.ok) setState(fromSnapshot(res.snapshot))
    return res
  }, [])

  const run = useCallback(
    async (fn: () => Promise<ActionResult>): Promise<ActionResult> => {
      setLocalBusy(true)
      try {
        const res = await fn()
        return applyResult(res)
      } catch (e) {
        return { ok: false, error: (e as Error).message }
      } finally {
        setLocalBusy(false)
      }
    },
    [applyResult],
  )

  const refresh = useCallback(async () => {
    const snap = await fetchSnapshot()
    if (snap) setState(fromSnapshot(snap))
  }, [])

  const signOut = useCallback(async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    startTransition(() => {
      router.push('/auth/login')
      router.refresh()
    })
  }, [router])

  const api = useMemo<StoreContext['api']>(
    () => ({
      deposit: (amount) => run(() => simulateDeposit(amount)),
      withdraw: (amount) => run(() => requestWithdrawal(amount)),
      invest: (amount, projectId) => run(() => investAction(amount, projectId)),
      buyToken: (cost, pulse) => run(() => buyTokenAction(cost, pulse)),
      stake: (amount) => run(() => stakeAction(amount)),
      unstake: (amount) => run(() => unstakeAction(amount)),
      connectWallet: (address) => run(() => setWalletAction(address)),
      disconnectWallet: () => run(() => setWalletAction(null)),
      submitKyc: (input) => run(() => submitKycAction(input)),
      vote: (proposalId, choice) => run(() => castVote(proposalId, choice)),
      claimAdmin: () => run(() => claimAdminAction()),
      leaderboard: () => getLeaderboard(),
      foundersWall: () => getFoundersWall(),
    }),
    [run],
  )

  const totalInvested = useMemo(() => state.holdings.reduce((s, h) => s + h.amount, 0), [state.holdings])
  const currentTier = useMemo(() => tierForAmount(totalInvested), [totalInvested])
  const portfolioValue = useMemo(
    () => state.cash + totalInvested + (state.pulse + state.staked) * TOKEN.salePrice,
    [state.cash, totalInvested, state.pulse, state.staked],
  )

  const value: StoreContext = {
    state,
    busy: localBusy || pending,
    view,
    setView,
    modal,
    openModal,
    closeModal,
    toasts,
    toast,
    dismissToast,
    totalInvested,
    currentTier,
    portfolioValue,
    refresh,
    signOut,
    api,
  }

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function usePulse() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('usePulse must be used within PulseProvider')
  return ctx
}

export function money(n: number, digits = 2) {
  return (n ?? 0).toLocaleString('en-US', { minimumFractionDigits: digits, maximumFractionDigits: digits })
}
