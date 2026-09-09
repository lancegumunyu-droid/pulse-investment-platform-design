'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ArrowDownRight, ArrowUpRight, TrendingUp, DollarSign, Clock, 
  ShieldAlert, RefreshCw, X, CheckCircle2, ChevronRight, Lock, AlertTriangle, Layers
} from 'lucide-react'
import { money, usePulse } from '../store'
import { Button } from '@/components/ui/button'

interface PortfolioItem {
  id: string
  plan_name: string
  image_url: string
  principal: number
  accrued_yield: number
  daily_rate_pct: number
  early_penalty_pct: number
  status: 'active' | 'liquidated' | 'matured'
  created_at: string
}

interface TransactionItem {
  id: string
  type: string
  amount: number
  status: string
  created_at: string
  metadata?: any
}

export function DashboardView() {
  const state = usePulse((s) => s.state)
  const currentTier = usePulse((s) => s.currentTier)
  const portfolioValue = usePulse((s) => s.portfolioValue)

  // System Settings
  const [pulsePrice, setPulsePrice] = useState(0.08)
  const [minDeposit, setMinDeposit] = useState(10.00)
  const [minWithdrawal, setMinWithdrawal] = useState(20.00)

  // Data
  const [portfolios, setPortfolios] = useState<PortfolioItem[]>([])
  const [transactions, setTransactions] = useState<TransactionItem[]>([])
  const [loading, setLoading] = useState(false)

  // Interaction State
  const [selectedPortfolio, setSelectedPortfolio] = useState<PortfolioItem | null>(null)
  const [activeModal, setActiveModal] = useState<'detail' | 'deposit' | 'withdraw' | 'sell' | null>(null)

  // Action Inputs
  const [depositAmount, setDepositAmount] = useState('')
  const [depositTxHash, setDepositTxHash] = useState('')
  const [withdrawAmount, setWithdrawAmount] = useState('')
  const [withdrawAddress, setWithdrawAddress] = useState('')
  const [sellTokenAmount, setSellTokenAmount] = useState('')

  // Action Feedback
  const [statusError, setStatusError] = useState<string | null>(null)
  const [statusSuccess, setStatusSuccess] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Load Synced Dashboard Data
  const loadDashboardData = async () => {
    const supabase = (window as any).supabase
    if (!supabase) return

    setLoading(true)
    try {
      // 1. Admin Dynamic Settings
      const { data: settings } = await supabase.from('admin_settings').select('*')
      if (settings) {
        settings.forEach((s: any) => {
          if (s.key === 'pulse_price_usdt') setPulsePrice(parseFloat(s.value))
          if (s.key === 'min_deposit_usdt') setMinDeposit(parseFloat(s.value))
          if (s.key === 'min_withdrawal_usdt') setMinWithdrawal(parseFloat(s.value))
        })
      }

      // 2. Fetch User Portfolios (Active and Closed)
      const { data: invList } = await supabase
        .from('user_investments')
        .select('*')
        .order('created_at', { ascending: false })
      if (invList) setPortfolios(invList)

      // 3. Fetch Transaction History
      const { data: txList } = await supabase
        .from('transactions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20)
      if (txList) setTransactions(txList)
    } catch (e) {
      console.error('Error fetching terminal data:', e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadDashboardData()
  }, [])

  const closeModal = () => {
    setActiveModal(null)
    setSelectedPortfolio(null)
    setStatusError(null)
    setStatusSuccess(null)
    setIsSubmitting(false)
    setDepositAmount('')
    setDepositTxHash('')
    setWithdrawAmount('')
    setWithdrawAddress('')
    setSellTokenAmount('')
  }

  // 1. Move Yield Action inside Portfolio Detail View
  const handleMoveYield = async () => {
    if (!selectedPortfolio) return
    setIsSubmitting(true)
    setStatusError(null)
    setStatusSuccess(null)

    try {
      const supabase = (window as any).supabase
      const { data, error } = await supabase.rpc('move_investment_yield_to_cash', {
        p_investment_id: selectedPortfolio.id
      })

      if (error) throw error

      setStatusSuccess(`Moved +$${money(selectedPortfolio.accrued_yield)} USDT yield directly to cash!`)
      await loadDashboardData()
      
      // Update selected portfolio view state locally
      setSelectedPortfolio((prev) => prev ? { ...prev, accrued_yield: 0 } : null)
    } catch (err: any) {
      setStatusError(err.message || 'Yield transfer failed.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // 2. Early Liquidation Action inside Portfolio Detail View
  const handleLiquidateEarly = async () => {
    if (!selectedPortfolio) return
    setIsSubmitting(true)
    setStatusError(null)
    setStatusSuccess(null)

    try {
      const supabase = (window as any).supabase
      const { data, error } = await supabase.rpc('liquidate_investment_early', {
        p_investment_id: selectedPortfolio.id
      })

      if (error) throw error

      setStatusSuccess(`Project closed! Net refund of $${money(data.net_refund)} credited to liquid balance.`)
      await loadDashboardData()

      // Update selected portfolio view state locally to CLOSED
      setSelectedPortfolio((prev) => prev ? { ...prev, status: 'liquidated', accrued_yield: 0 } : null)
    } catch (err: any) {
      setStatusError(err.message || 'Liquidation failed.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const calculatedReturn = Math.max(0, (parseFloat(sellTokenAmount) || 0) * pulsePrice)

  return (
    <div className="mx-auto w-full max-w-lg space-y-5 pb-28 text-neutral-100 antialiased px-3">
      {/* TERMINAL HEADER */}
      <div className="flex items-center justify-between rounded-2xl border border-neutral-800 bg-neutral-900/90 p-3.5 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <div className="size-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs font-black uppercase tracking-wider text-neutral-200">
            SADC Terminal
          </span>
        </div>
        <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-[10px] font-black uppercase text-amber-400">
          {currentTier.name} VIP
        </span>
      </div>

      {/* NET WORTH CARD */}
      <div className="rounded-3xl border border-neutral-800 bg-gradient-to-b from-neutral-900 via-neutral-950 to-black p-6 shadow-2xl relative overflow-hidden">
        <div className="space-y-4 relative z-10">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-widest text-neutral-400">Total Net Portfolio</span>
            <span className="flex items-center gap-1 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-[10px] font-bold text-emerald-400">
              <TrendingUp className="size-3" /> Live
            </span>
          </div>

          <div>
            <h1 className="text-4xl font-black text-white">${money(portfolioValue)} <span className="text-sm font-bold text-neutral-400">USDT</span></h1>
            <p className="text-xs text-neutral-400 mt-1">Liquid Cash Balance: <strong className="text-emerald-400 font-bold">${money(state.cash)} USDT</strong></p>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <Button 
              className="h-11 rounded-xl bg-amber-500 font-black text-neutral-950 hover:bg-amber-400"
              onClick={() => setActiveModal('deposit')}
            >
              <ArrowDownRight className="size-4 stroke-[3]" /> Deposit
            </Button>
            <Button 
              variant="outline"
              className="h-11 rounded-xl border-neutral-800 bg-neutral-900 font-bold text-white hover:bg-neutral-800"
              onClick={() => setActiveModal('withdraw')}
            >
              <ArrowUpRight className="size-4 stroke-[2.5]" /> Withdraw
            </Button>
          </div>
        </div>
      </div>

      {/* ACTIVE & CLOSED PORTFOLIOS (CLICKABLE) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-black uppercase tracking-wider text-neutral-300 flex items-center gap-2">
            <Layers className="size-4 text-amber-400" /> Active Portfolios
          </h3>
          <span className="text-[11px] font-bold text-neutral-400">Click card to manage</span>
        </div>

        {portfolios.length === 0 ? (
          <div className="rounded-2xl border border-neutral-800 bg-neutral-900/40 p-6 text-center space-y-1">
            <p className="text-xs text-neutral-400 font-medium">No active portfolio deployments running.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {portfolios.map((item) => {
              const isClosed = item.status === 'liquidated' || item.status === 'matured'
              return (
                <div 
                  key={item.id} 
                  onClick={() => { setSelectedPortfolio(item); setActiveModal('detail'); }}
                  className={`group cursor-pointer overflow-hidden rounded-2xl border transition-all duration-200 ${
                    isClosed 
                      ? 'border-neutral-800 bg-neutral-950/60 opacity-75' 
                      : 'border-neutral-800 bg-neutral-900 hover:border-amber-500/50 hover:shadow-lg'
                  }`}
                >
                  {/* Image Header */}
                  <div className="h-28 w-full relative bg-neutral-950 overflow-hidden">
                    <img 
                      src={item.image_url || 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?auto=format&fit=crop&w=800&q=80'} 
                      alt={item.plan_name}
                      className={`h-full w-full object-cover transition-transform duration-300 group-hover:scale-105 ${isClosed ? 'grayscale brightness-50' : 'brightness-90'}`}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/20 to-transparent" />
                    
                    <div className="absolute top-3 right-3">
                      {isClosed ? (
                        <span className="rounded-md bg-rose-500/20 px-2.5 py-1 text-[10px] font-black uppercase text-rose-300 border border-rose-500/40 backdrop-blur-md">
                          CLOSED / LIQUIDATED
                        </span>
                      ) : (
                        <span className="rounded-md bg-emerald-500/20 px-2.5 py-1 text-[10px] font-black text-emerald-300 border border-emerald-500/40 backdrop-blur-md">
                          +{item.daily_rate_pct}% DAILY
                        </span>
                      )}
                    </div>

                    <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between">
                      <span className="text-sm font-black text-white">{item.plan_name}</span>
                      <ChevronRight className="size-4 text-neutral-400 group-hover:text-amber-400 transition-colors" />
                    </div>
                  </div>

                  <div className="p-3.5 grid grid-cols-2 gap-2 text-xs">
                    <div className="rounded-xl bg-neutral-950/80 p-2.5 border border-neutral-800/80">
                      <span className="text-[10px] text-neutral-400 block font-medium">Principal Staked</span>
                      <strong className="text-white text-sm font-black">${money(item.principal)}</strong>
                    </div>
                    <div className="rounded-xl bg-neutral-950/80 p-2.5 border border-neutral-800/80">
                      <span className="text-[10px] text-neutral-400 block font-medium">Accrued Yield</span>
                      <strong className={isClosed ? 'text-neutral-500 text-sm font-black' : 'text-emerald-400 text-sm font-black'}>
                        {isClosed ? '$0.00' : `+$${money(item.accrued_yield)}`}
                      </strong>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* TRANSACTIONS & PAYOUTS LEDGER */}
      <div className="rounded-2xl border border-neutral-800 bg-neutral-950 p-4 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-extrabold uppercase tracking-wider text-neutral-300 flex items-center gap-2">
            <Clock className="size-4 text-amber-400" /> Transactions & Payouts
          </span>
          <button onClick={loadDashboardData} className="text-xs text-amber-400 hover:underline flex items-center font-bold gap-1">
            <RefreshCw className={`size-3 ${loading ? 'animate-spin' : ''}`} /> Refresh
          </button>
        </div>

        {transactions.length === 0 ? (
          <div className="text-center py-4 text-xs text-neutral-500">No transaction logs recorded yet.</div>
        ) : (
          <div className="space-y-2">
            {transactions.slice(0, 5).map((tx) => (
              <div key={tx.id} className="flex items-center justify-between rounded-xl bg-neutral-900 p-3 border border-neutral-800">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-white text-xs uppercase">{tx.type.replace('_', ' ')}</span>
                    <span className={`rounded px-1.5 py-0.5 text-[9px] font-black uppercase ${
                      tx.status === 'completed' || tx.status === 'approved' 
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : tx.status === 'pending'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                    }`}>
                      {tx.status}
                    </span>
                  </div>
                  <p className="text-[10px] text-neutral-400">{new Date(tx.created_at).toLocaleString()}</p>
                </div>
                <div className="text-right">
                  <span className={`text-xs font-black ${
                    tx.type === 'deposit' || tx.type === 'yield_transfer' || tx.type === 'liquidation' ? 'text-emerald-400' : 'text-amber-300'
                  }`}>
                    {tx.type === 'deposit' || tx.type === 'yield_transfer' || tx.type === 'liquidation' ? '+' : '-'}${money(tx.amount)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* PORTFOLIO ACCESS MODAL (ACCESS PROJECT & MOVE FUNDS) */}
      <AnimatePresence>
        {activeModal === 'detail' && selectedPortfolio && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
            <div className="w-full max-w-md rounded-3xl border border-neutral-800 bg-neutral-950 p-6 space-y-5 relative shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
              <button onClick={closeModal} className="absolute top-4 right-4 z-20 text-neutral-400 hover:text-white bg-black/50 p-1.5 rounded-full backdrop-blur-md">
                <X className="size-5" />
              </button>

              {/* Cover Banner */}
              <div className="h-36 -mx-6 -mt-6 relative bg-neutral-900">
                <img 
                  src={selectedPortfolio.image_url || 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?auto=format&fit=crop&w=800&q=80'} 
                  alt={selectedPortfolio.plan_name}
                  className={`h-full w-full object-cover ${selectedPortfolio.status === 'liquidated' ? 'grayscale brightness-50' : 'brightness-90'}`}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/40 to-transparent" />
                <div className="absolute bottom-3 left-6">
                  <h2 className="text-xl font-black text-white">{selectedPortfolio.plan_name}</h2>
                  <p className="text-[11px] text-neutral-300">Started: {new Date(selectedPortfolio.created_at).toLocaleDateString()}</p>
                </div>
              </div>

              {/* Status Badge */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">Project Status</span>
                {selectedPortfolio.status === 'active' ? (
                  <span className="rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-black text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                    <CheckCircle2 className="size-3.5" /> ACTIVE & YIELDING
                  </span>
                ) : (
                  <span className="rounded-full bg-rose-500/20 px-3 py-1 text-xs font-black text-rose-300 border border-rose-500/40 flex items-center gap-1">
                    <Lock className="size-3.5" /> LIQUIDATED & CLOSED
                  </span>
                )}
              </div>

              {/* Metric Breakdown */}
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-2xl bg-neutral-900 p-3.5 border border-neutral-800 space-y-1">
                  <span className="text-[10px] text-neutral-400 font-bold block uppercase">Staked Principal</span>
                  <span className="text-lg font-black text-white">${money(selectedPortfolio.principal)}</span>
                </div>
                <div className="rounded-2xl bg-neutral-900 p-3.5 border border-neutral-800 space-y-1">
                  <span className="text-[10px] text-neutral-400 font-bold block uppercase">Accrued Yield</span>
                  <span className={`text-lg font-black ${selectedPortfolio.status === 'active' ? 'text-emerald-400' : 'text-neutral-500'}`}>
                    ${money(selectedPortfolio.accrued_yield)}
                  </span>
                </div>
              </div>

              {/* Action Controls inside Portfolio */}
              {selectedPortfolio.status === 'active' ? (
                <div className="space-y-3 pt-2">
                  <div className="rounded-2xl bg-neutral-900/60 p-4 border border-neutral-800 space-y-3">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-neutral-300 font-medium">Daily Earnings Rate</span>
                      <span className="font-bold text-emerald-400">+{selectedPortfolio.daily_rate_pct}% Daily</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-neutral-300 font-medium">Early Exit Penalty Rate</span>
                      <span className="font-bold text-rose-400">{selectedPortfolio.early_penalty_pct}% Penalty</span>
                    </div>
                  </div>

                  {statusError && <div className="text-xs text-rose-400 font-bold flex items-center gap-1"><AlertTriangle className="size-4" />{statusError}</div>}
                  {statusSuccess && <div className="text-xs text-emerald-400 font-bold flex items-center gap-1"><CheckCircle2 className="size-4" />{statusSuccess}</div>}

                  <Button 
                    disabled={isSubmitting || selectedPortfolio.accrued_yield <= 0}
                    onClick={handleMoveYield}
                    className="w-full h-11 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-xl"
                  >
                    {isSubmitting ? 'Transferring...' : `Move $${money(selectedPortfolio.accrued_yield)} Yield to Cash Balance`}
                  </Button>

                  <Button 
                    disabled={isSubmitting}
                    onClick={handleLiquidateEarly}
                    variant="destructive"
                    className="w-full h-11 bg-rose-600 hover:bg-rose-500 text-white font-black rounded-xl"
                  >
                    {isSubmitting ? 'Liquidating...' : `Close Early & Deduct ${selectedPortfolio.early_penalty_pct}% Penalty`}
                  </Button>
                </div>
              ) : (
                <div className="rounded-2xl bg-neutral-900 p-4 border border-neutral-800 text-center space-y-2">
                  <p className="text-xs text-neutral-400 font-medium">
                    This project was liquidated and closed. All net principal funds have been settled into your cash balance and logged in the transaction ledger.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
