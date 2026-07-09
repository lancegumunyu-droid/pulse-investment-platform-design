'use client'

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useReducer,
  useState,
  type ReactNode,
} from 'react'
import { tierForAmount, TIERS, type TierId } from '@/lib/pulse-data'

export type View = 'dashboard' | 'invest' | 'sale' | 'stake' | 'signals' | 'wallet' | 'profile' | 'admin'
export type KycStatus = 'none' | 'pending' | 'verified'

export interface Holding {
  id: string
  projectId: string
  tierId: TierId
  amount: number
  date: number
}

export interface Txn {
  id: string
  type: 'deposit' | 'withdraw' | 'invest' | 'stake' | 'unstake' | 'sale'
  label: string
  amount: number
  currency: 'USDT' | 'PULSE'
  status: 'completed' | 'pending'
  date: number
}

export interface ModalState {
  type: 'kyc' | 'invest' | 'deposit' | 'withdraw' | null
  payload?: Record<string, unknown>
}

interface State {
  cash: number
  pulse: number
  staked: number
  holdings: Holding[]
  txns: Txn[]
  kyc: KycStatus
  wallet: string | null
  referrals: number
}

type Action =
  | { type: 'DEPOSIT'; amount: number; currency: 'USDT' }
  | { type: 'WITHDRAW'; amount: number }
  | { type: 'INVEST'; amount: number; projectId: string }
  | { type: 'BUY_TOKEN'; pulse: number; cost: number }
  | { type: 'STAKE'; amount: number }
  | { type: 'UNSTAKE'; amount: number }
  | { type: 'SET_KYC'; status: KycStatus }
  | { type: 'CONNECT_WALLET'; address: string }
  | { type: 'DISCONNECT_WALLET' }
  | { type: 'ADMIN_DISBURSE'; amount: number }
  | { type: 'APPROVE_TXN'; id: string }

function uid() {
  return Math.random().toString(36).slice(2, 10)
}

const initialState: State = {
  cash: 250,
  pulse: 0,
  staked: 0,
  holdings: [],
  txns: [
    {
      id: uid(),
      type: 'deposit',
      label: 'Welcome demo credit',
      amount: 250,
      currency: 'USDT',
      status: 'completed',
      date: Date.now() - 1000 * 60 * 60 * 24 * 3,
    },
  ],
  kyc: 'none',
  wallet: null,
  referrals: 4,
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'DEPOSIT':
      return {
        ...state,
        cash: state.cash + action.amount,
        txns: [
          {
            id: uid(),
            type: 'deposit',
            label: `Deposit via ${action.currency}`,
            amount: action.amount,
            currency: 'USDT',
            status: 'completed',
            date: Date.now(),
          },
          ...state.txns,
        ],
      }
    case 'WITHDRAW':
      return {
        ...state,
        cash: state.cash - action.amount,
        txns: [
          {
            id: uid(),
            type: 'withdraw',
            label: 'Withdrawal to wallet',
            amount: action.amount,
            currency: 'USDT',
            status: 'pending',
            date: Date.now(),
          },
          ...state.txns,
        ],
      }
    case 'INVEST': {
      const totalInvested = state.holdings.reduce((s, h) => s + h.amount, 0) + action.amount
      const tier = tierForAmount(totalInvested)
      return {
        ...state,
        cash: state.cash - action.amount,
        holdings: [
          { id: uid(), projectId: action.projectId, tierId: tier.id, amount: action.amount, date: Date.now() },
          ...state.holdings,
        ],
        txns: [
          {
            id: uid(),
            type: 'invest',
            label: 'Project share purchase',
            amount: action.amount,
            currency: 'USDT',
            status: 'completed',
            date: Date.now(),
          },
          ...state.txns,
        ],
      }
    }
    case 'BUY_TOKEN':
      return {
        ...state,
        cash: state.cash - action.cost,
        pulse: state.pulse + action.pulse,
        txns: [
          {
            id: uid(),
            type: 'sale',
            label: `Private sale — ${action.pulse.toLocaleString()} PULSE`,
            amount: action.cost,
            currency: 'USDT',
            status: 'completed',
            date: Date.now(),
          },
          ...state.txns,
        ],
      }
    case 'STAKE':
      return {
        ...state,
        pulse: state.pulse - action.amount,
        staked: state.staked + action.amount,
        txns: [
          {
            id: uid(),
            type: 'stake',
            label: 'Staked PULSE',
            amount: action.amount,
            currency: 'PULSE',
            status: 'completed',
            date: Date.now(),
          },
          ...state.txns,
        ],
      }
    case 'UNSTAKE':
      return {
        ...state,
        pulse: state.pulse + action.amount,
        staked: state.staked - action.amount,
        txns: [
          {
            id: uid(),
            type: 'unstake',
            label: 'Unstaked PULSE',
            amount: action.amount,
            currency: 'PULSE',
            status: 'completed',
            date: Date.now(),
          },
          ...state.txns,
        ],
      }
    case 'SET_KYC':
      return { ...state, kyc: action.status }
    case 'CONNECT_WALLET':
      return { ...state, wallet: action.address }
    case 'DISCONNECT_WALLET':
      return { ...state, wallet: null }
    case 'ADMIN_DISBURSE':
      return {
        ...state,
        cash: state.cash + action.amount,
        txns: [
          {
            id: uid(),
            type: 'deposit',
            label: 'Yield disbursement (admin)',
            amount: action.amount,
            currency: 'USDT',
            status: 'completed',
            date: Date.now(),
          },
          ...state.txns,
        ],
      }
    case 'APPROVE_TXN':
      return {
        ...state,
        txns: state.txns.map((t) => (t.id === action.id ? { ...t, status: 'completed' } : t)),
      }
    default:
      return state
  }
}

export interface Toast {
  id: string
  title: string
  description?: string
  variant: 'success' | 'error' | 'info'
}

interface StoreContext {
  state: State
  dispatch: React.Dispatch<Action>
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
}

const Ctx = createContext<StoreContext | null>(null)

export function PulseProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState)
  const [view, setView] = useState<View>('dashboard')
  const [modal, setModal] = useState<ModalState>({ type: null })
  const [toasts, setToasts] = useState<Toast[]>([])

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

  const totalInvested = useMemo(() => state.holdings.reduce((s, h) => s + h.amount, 0), [state.holdings])
  const currentTier = useMemo(() => tierForAmount(totalInvested), [totalInvested])
  const portfolioValue = useMemo(
    () => state.cash + totalInvested + (state.pulse + state.staked) * 0.08,
    [state.cash, totalInvested, state.pulse, state.staked],
  )

  const value: StoreContext = {
    state,
    dispatch,
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
  }

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function usePulse() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('usePulse must be used within PulseProvider')
  return ctx
}

export function money(n: number, digits = 2) {
  return n.toLocaleString('en-US', { minimumFractionDigits: digits, maximumFractionDigits: digits })
}
