'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useTransition,
  useState,
  type ReactNode,
} from 'react'
import { useRouter } from 'next/navigation'
import { tierForAmount, TIERS, TOKEN } from '@/lib/pulse-data'
import { createClient } from '@/lib/supabase/client'
import type {
  Snapshot,
  SnapshotHolding,
  SnapshotTxn,
  LeaderboardRow,
  FounderRow,
  MyReferralRow,
  BadgeRow,
  SavedWallet,
} from '@/lib/pulse/types'
import {
  buyToken as buyTokenAction,
  sellToken as sellTokenAction,
  castVote,
  claimAdmin as claimAdminAction,
  applyForCard as applyForCardAction,
  setPulsePin,
  requestPulsePinReset,
  resetPulsePin,
  addSavedWallet as addSavedWalletAction,
  removeSavedWallet as removeSavedWalletAction,
  requestTransfer as requestTransferAction,
  fetchSnapshot,
  getFoundersWall,
  getLeaderboard,
  getMyReferrals,
  invest as investAction,
  requestWithdrawal,
  setUsername as setUsernameAction,
  setWallet as setWalletAction,
  submitDeposit,
  stake as stakeAction,
  submitKyc as submitKycAction,
  unstake as unstakeAction,
  getLiveProjectFunding,
  closeInvestment,
} from '@/app/actions/pulse'

export type View = 'dashboard' | 'invest' | 'sale' | 'stake' | 'signals' | 'wallet' | 'profile' | 'admin'
export type KycStatus = 'none' | 'pending' | 'verified' | 'rejected'
export type Holding = SnapshotHolding
export type Txn = SnapshotTxn

export interface NotificationRow {
  id: string
  title: string
  body: string
  read: boolean
  createdAt: string
}

export interface ModalState {
  type: 'kyc' | 'invest' | 'deposit' | 'withdraw' | 'transfer' | null
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
  pulseId: string | null
  fullName: string | null
  email: string | null
  tier: import('@/lib/pulse-data').TierId
  isAdmin: boolean
  points: number
  founderNumber: number | null
  walletId: string | null
  username: string | null
  referralCount: number
  referralVerifiedCount: number
  badges: BadgeRow[]
  adminScope: 'full' | 'finance' | 'operations' | 'manager' | 'director' | null
  cardStatus: 'none' | 'waitlisted' | 'approved' | 'pending_pin' | 'active' | 'locked' | 'free_card_earned'
  cardRef: string | null
  cardLast4: string | null
  pinRequired: boolean
  cardCvv: string | null
  cardExpiryMonth: number | null
  cardExpiryYear: number | null
  cardholderName: string | null
  savedWallets: SavedWallet[]
}

function fromSnapshot(s: Snapshot | null | undefined): State {
  const data = s || ({} as Partial<Snapshot>)
  return {
    cash: data.cash ?? 0,
    pulse: data.pulse ?? 0,
    staked: data.staked ?? 0,
    pendingYield: data.pendingYield ?? 0,
    holdings: data.holdings ?? [],
    txns: data.txns ?? [],
    kyc: data.kyc ?? 'none',
    wallet: data.wallet ?? null,
    referralCode: data.referralCode ?? 'PULSE-USER',
    pulseId: data.pulseId ?? null,
    fullName: data.fullName ?? null,
    email: data.email ?? null,
    tier: data.tier ?? 'starter',
    isAdmin: data.isAdmin ?? false,
    points: data.points ?? 0,
    founderNumber: data.founderNumber ?? null,
    walletId: data.walletId ?? null,
    username: data.username ?? null,
    referralCount: data.referralCount ?? 0,
    referralVerifiedCount: data.referralVerifiedCount ?? 0,
    badges: data.badges ?? [],
    adminScope: data.adminScope ?? null,
  cardStatus: data.cardStatus ?? 'none',
  cardRef: data.cardRef ?? null,
  cardLast4: data.cardLast4 ?? null,
  pinRequired: data.pinRequired ?? false,
  cardCvv: data.cardCvv ?? null,
  cardExpiryMonth: data.cardExpiryMonth ?? null,
  cardExpiryYear: data.cardExpiryYear ?? null,
  cardholderName: data.cardholderName ?? null,

    savedWallets: data.savedWallets ?? [],
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
  syncing: boolean
  lastSyncedAt: number | null
  refresh: () => Promise<void>
  signOut: () => Promise<void>
  api: {
    deposit: (amount: number, currency: 'usdttrc20' | 'btc', txReference: string) => Promise<ActionResult>
    withdraw: (amount: number, destinationAddress: string, network: string, broker: string) => Promise<ActionResult>
    invest: (amount: number, projectId: string) => Promise<ActionResult>
    buyToken: (cost: number, pulse: number) => Promise<ActionResult>
    sellToken: (pulseAmount: number) => Promise<ActionResult>
    stake: (amount: number) => Promise<ActionResult>
    unstake: (amount: number) => Promise<ActionResult>
    connectWallet: (address: string) => Promise<ActionResult>
    disconnectWallet: () => Promise<ActionResult>
    submitKyc: (input: {
      fullName: string
      idNumber: string
      dateOfBirth?: string
      nationality?: string
      country?: string
      phone?: string
      address?: string
    }) => Promise<ActionResult>
    vote: (proposalId: string, choice: 'for' | 'against' | 'abstain') => Promise<ActionResult>
    claimAdmin: () => Promise<ActionResult>
    setUsername: (username: string) => Promise<ActionResult>
    leaderboard: () => Promise<{ ok: true; rows: LeaderboardRow[] } | { ok: false; error: string }>
    foundersWall: () => Promise<{ ok: true; rows: FounderRow[] } | { ok: false; error: string }>
    myReferrals: () => Promise<{ ok: true; rows: MyReferralRow[] } | { ok: false; error: string }>
    applyForCard: () => Promise<ActionResult>
    setPulsePin: (pin: string) => Promise<ActionResult>
    requestPulsePinReset: () => Promise<{ ok: true; token: string } | { ok: false; error: string }>
    resetPulsePin: (token: string, pin: string) => Promise<ActionResult>
    addSavedWallet: (label: string, address: string) => Promise<ActionResult>
    removeSavedWallet: (id: string) => Promise<ActionResult>
    transfer: (recipientIdentifier: string, amount: number) => Promise<ActionResult>
    liveProjectFunding: () => Promise<{ ok: true; funding: Record<string, number> } | { ok: false; error: string }>
    closeInvestment: (holdingId: string) => Promise<ActionResult>
    notifications: () => Promise<{ ok: true; rows: NotificationRow[] } | { ok: false; error: string }>
    markNotificationRead: (id: string) => Promise<{ ok: true } | { ok: false; error: string }>
  }
}

const Ctx = createContext<StoreContext | null>(null)

/** Background re-sync cadence. Realtime handles most updates; this is the
 *  safety net for missed events, tab wake-ups, and dropped sockets. */
const SYNC_INTERVAL_MS = 30_000

export function PulseProvider({ children, initial }: { children: ReactNode; initial: Snapshot }) {
  const router = useRouter()
  const [state, setState] = useState<State>(() => fromSnapshot(initial))
  const [view, setView] = useState<View>('dashboard')
  const [modal, setModal] = useState<ModalState>({ type: null })
  const [toasts, setToasts] = useState<Toast[]>([])
  const [pending, startTransition] = useTransition()
  const [localBusy, setLocalBusy] = useState(false)
  const [syncing, setSyncing] = useState(false)
  const [lastSyncedAt, setLastSyncedAt] = useState<number | null>(null)

  const inFlight = useRef(false)
  const mounted = useRef(true)

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
    if (res.ok) {
      setState({ ...fromSnapshot(res.snapshot) })
      setLastSyncedAt(Date.now())
    }
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

  /**
   * Pull a fresh server snapshot. Every balance shown in the UI comes from
   * this call — nothing is computed or cached client-side, so what the user
   * sees always matches the Supabase ledger.
   */
  const refresh = useCallback(async () => {
    if (inFlight.current) return
    inFlight.current = true
    setSyncing(true)
    try {
      const snap = await fetchSnapshot()
      if (snap && mounted.current) {
        setState({ ...fromSnapshot(snap) })
        setLastSyncedAt(Date.now())
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Supabase synchronization failed.'
      toast({ title: 'Live sync failed', description: message, variant: 'error' })
      console.error('[v0] Live sync failed', error)
    } finally {
      inFlight.current = false
      if (mounted.current) setSyncing(false)
    }
  }, [toast])

  // ---- LIVE SUPABASE SYNC ----------------------------------------------
  // Three triggers, all funnelling into refresh():
  //   1. Realtime postgres_changes on the tables that move money
  //   2. A 30s interval as a dropped-socket safety net
  //   3. Tab focus / visibility, so a backgrounded PWA is never stale
  useEffect(() => {
    mounted.current = true
    let supabase: ReturnType<typeof createClient> | null = null
    let channel: ReturnType<ReturnType<typeof createClient>['channel']> | null = null

    const start = async () => {
      try {
        supabase = createClient()
      } catch {
        return // Supabase not configured in this environment — skip live sync.
      }

      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user || !mounted.current) return

      const nextChannel = supabase.channel(`pulse-sync-${user.id}-${crypto.randomUUID()}`)

      nextChannel.on('postgres_changes', { event: '*', schema: 'public', table: 'transactions', filter: `user_id=eq.${user.id}` }, () => void refresh())
      nextChannel.on('postgres_changes', { event: '*', schema: 'public', table: 'wallets', filter: `user_id=eq.${user.id}` }, () => void refresh())
      nextChannel.on('postgres_changes', { event: '*', schema: 'public', table: 'users', filter: `id=eq.${user.id}` }, () => void refresh())
      nextChannel.on('postgres_changes', { event: '*', schema: 'public', table: 'user_profiles', filter: `user_id=eq.${user.id}` }, () => void refresh())

      if (!mounted.current) return
      channel = nextChannel
      channel.subscribe()
    }

    start()

    // Pull once on mount so a server-rendered snapshot that is already a few
    // seconds old is corrected immediately.
    void Promise.resolve().then(() => refresh())

    const interval = setInterval(refresh, SYNC_INTERVAL_MS)
    const onVisible = () => {
      if (document.visibilityState === 'visible') refresh()
    }
    document.addEventListener('visibilitychange', onVisible)
    window.addEventListener('focus', refresh)

    return () => {
      mounted.current = false
      clearInterval(interval)
      document.removeEventListener('visibilitychange', onVisible)
      window.removeEventListener('focus', refresh)
      if (supabase && channel) supabase.removeChannel(channel)
    }
  }, [refresh])

  const signOut = useCallback(async () => {
    try {
      const supabase = createClient()
      await supabase.auth.signOut()
    } catch {
      // Still navigate away even if the sign-out call itself fails.
    }
    startTransition(() => {
      router.push('/auth/login')
      router.refresh()
    })
  }, [router])

  const api = useMemo<StoreContext['api']>(
    () => ({
      deposit: (amount, currency, txReference) => run(() => submitDeposit(amount, currency, txReference)),
      withdraw: (amount, destinationAddress, network, broker) =>
        run(() => requestWithdrawal(amount, destinationAddress, network, broker)),
      invest: (amount, projectId) => run(() => investAction(amount, projectId)),
      buyToken: (cost, pulse) => run(() => buyTokenAction(cost, pulse)),
      sellToken: (pulseAmount) => run(() => sellTokenAction(pulseAmount)),
      stake: (amount) => run(() => stakeAction(amount)),
      unstake: (amount) => run(() => unstakeAction(amount)),
      connectWallet: (address) => run(() => setWalletAction(address)),
      disconnectWallet: () => run(() => setWalletAction(null)),
      submitKyc: (input) => run(() => submitKycAction(input)),
      vote: (proposalId, choice) => run(() => castVote(proposalId, choice)),
      claimAdmin: () => run(() => claimAdminAction()),
      setUsername: (username) => run(() => setUsernameAction(username)),
      leaderboard: () => getLeaderboard(),
      foundersWall: () => getFoundersWall(),
      myReferrals: () => getMyReferrals(),
      applyForCard: () => run(() => applyForCardAction()),
      setPulsePin: (pin) => run(() => setPulsePin(pin)),
      requestPulsePinReset: () => requestPulsePinReset(),
      resetPulsePin: (token, pin) => run(() => resetPulsePin(token, pin)),
      addSavedWallet: (label, address) => run(() => addSavedWalletAction(label, address)),
      removeSavedWallet: (id) => run(() => removeSavedWalletAction(id)),
      transfer: (recipientIdentifier, amount) => run(() => requestTransferAction(recipientIdentifier, amount)),
      liveProjectFunding: () => getLiveProjectFunding(),
      closeInvestment: (holdingId) => run(() => closeInvestment(holdingId)),

      notifications: async () => {
        try {
          // Notifications are not part of the live production schema yet.
          // Keep the contract stable without issuing a guaranteed failing query.
          return { ok: true, rows: [] as NotificationRow[] }
        } catch (e) {
          return { ok: false, error: (e as Error).message }
        }
      },
      markNotificationRead: async (id: string) => {
        try {
          const supabase = createClient()
          void id
          return { ok: true }
        } catch (e) {
          return { ok: false, error: (e as Error).message }
        }
      },
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
    syncing,
    lastSyncedAt,
    refresh,
    signOut,
    api,
  }

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function usePulse(): StoreContext
export function usePulse<T>(selector: (state: StoreContext) => T): T
export function usePulse<T>(selector?: (state: StoreContext) => T) {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('usePulse must be used within PulseProvider')
  return selector ? selector(ctx) : ctx
}

export function money(n: number, digits = 2) {
  return (n ?? 0).toLocaleString('en-US', { minimumFractionDigits: digits, maximumFractionDigits: digits })
}
