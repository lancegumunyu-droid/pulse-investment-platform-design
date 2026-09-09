'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  TrendingUp, Clock, RefreshCw, X, CheckCircle2, 
  ChevronRight, Lock, AlertTriangle, Layers, Wallet, ShieldCheck
} from 'lucide-react'
import { supabase } from '@/lib/supabaseClient'
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
  const setPortfolioData = usePulse((s) => s.setPortfolioData)

  const [portfolios, setPortfolios] = useState<PortfolioItem[]>([])
  const [transactions, setTransactions] = useState<TransactionItem[]>([])
  const [loading, setLoading] = useState(false)

  const [selectedPortfolio, setSelectedPortfolio] = useState<PortfolioItem | null>(null)
  const [activeModal, setActiveModal] = useState<'detail' | null>(null)

  const [statusError, setStatusError] = useState<string | null>(null)
  const [statusSuccess, setStatusSuccess] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const loadDashboardData = async () => {
    setLoading(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        setLoading(false)
        return
      }

      // Fetch user profile cash balance
      const { data: profileData } = await supabase
        .from('profiles')
        .select('cash')
        .eq('id', session.user.id)
        .single()

      const userCash = profileData?.cash || 0

      // Fetch user active / closed investments
      const { data: invList } = await supabase
        .from('user_investments')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false })
      
      if (invList) {
        setPortfolios(invList)
        const totalStaked = invList.reduce((acc, item) => acc + (item.status === 'active' ? Number(item.principal) : 0), 0)
        setPortfolioData(userCash, totalStaked, currentTier.name)
      }

      // Fetch transactions ledger
      const { data: txList } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false })
        .limit(10)
      
      if (txList) setTransactions(txList)

    } catch (e) {
      console.error('Error syncing terminal data:', e)
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
  }

  const handleMoveYield = async () => {
    if (!selectedPortfolio) return
    setIsSubmitting(true)
    setStatusError(null)
    setStatusSuccess(null)

    try {
      const { error } = await supabase.rpc('move_investment_yield_to_cash', {
        p_investment_id: selectedPortfolio.id
      })

      if (error) throw error

      setStatusSuccess(`Moved +$${money(selectedPortfolio.accrued_yield)} USDT yield directly to cash!`)
      await loadDashboardData()
      setSelectedPortfolio((prev) => prev ? { ...prev, accrued_yield: 0 } : null)
    } catch (err: any) {
      setStatusError(err.message || 'Yield transfer failed.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleLiquidateEarly = async () => {
    if (!selectedPortfolio) return
    setIsSubmitting(true)
    setStatusError(null)
    setStatusSuccess(null)

    try {
      const { data, error } = await supabase.rpc('liquidate_investment_early', {
        p_investment_id: selectedPortfolio.id
      })

      if (error) throw error

      const refundAmount = data?.net_refund || (selectedPortfolio.principal * (1 - selectedPortfolio.early_penalty_pct / 100))
      setStatusSuccess(`Project closed! Net refund of $${money(refundAmount)} credited to liquid balance.`)
      await loadDashboardData()
      setSelectedPortfolio((prev) => prev ? { ...prev, status: 'liquidated', accrued_yield: 0 } : null)
    } catch (err: any) {
      setStatusError(err.message || 'Liquidation failed.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="mx-auto w-full max-w-lg space-y-5 pb-28 text-neutral-100 antialiased px-3">
      {/* HEADER */}
      <div className="flex items-center justify-between rounded-2xl border border-neutral-800 bg-neutral-900/90 p-3.5 backdrop-blur-md shadow-lg">
        <div className="flex items-center gap-2.5">
          <div className="size-3 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_10px_#34d399]" />
          <span className="text-xs font-black uppercase tracking-wider text-neutral-100">
            SADC Terminal
          </span>
        </div>
        <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-[10px] font-black uppercase text-amber-400 flex items-center gap-1">
          <ShieldCheck className="size-3" /> {currentTier.name} VIP
        </span>
      </div>

      {/* NET WORTH CARD */}
      <div className="rounded-3xl border border-neutral-800 bg-gradient-to-b from-neutral-900 via-neutral-950 to-black p-6 shadow-2xl relative overflow-hidden">
        <div className="absolute -right-10 -top-10 w-40 h-40 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="space-y-4 relative z-10">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-widest text-neutral-400 flex items-center gap-1.5">
              <Wallet className="size-3.5 text-amber-400" /> Total Net Portfolio
            </span>
            <span className="flex items-center gap-1 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-[10px] font-bold text-emerald-400">
              <TrendingUp className="size-3" /> Live
            </span>
          </div>

          <div>
            <h1 className="text-4xl font-black text-white tracking-tight">
              ${money(portfolioValue)} <span className="text-sm font-bold text-neutral-400">USDT</span>
            </h1>
            <p className="text-xs text-neutral-400 mt-1.5 flex items-center gap-1.5">
              Liquid Cash Balance: <strong className="text-emerald-400 font-bold">${money(state.cash)} USDT</strong>
            </p>
          </div>
        </div>
      </div>

      {/* ACTIVE & CLOSED PORTFOLIOS */}
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
                      : 'border-neutral-800 bg-neutral-900 hover:border-amber-500/50 hover:shadow-xl'
                  }`}
                >
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

      {/* TRANSACTIONS LEDGER */}
      <div className="rounded-2xl border border-neutral-800 bg-neutral-950 p-4 space-y-3 shadow-lg">
        <div className="flex items-center justify-between">
          <span className="text-xs font-extrabold uppercase tracking-wider text-neutral-300 flex items-center gap-2">
            <Clock className="size-4 text-amber-400" /> Transactions & Payouts
          </span>
          <button onClick={loadDashboardData} className="text-xs text-amber-400 hover:underline flex items-center font-bold gap-1 cursor-pointer">
            <RefreshCw className={`size-3 ${loading ? 'animate-spin' : ''}`} /> Refresh
          </button>
        </div>

        {transactions.length === 0 ? (
          <div className="text-center py-4 text-xs text-neutral-500">No transaction logs recorded yet.</div>
        ) : (
          <div className="space-y-2">
            {transactions.map((tx) => (
              <div key={tx.id} className="flex items-center justify-between rounded-xl bg-neutral-900 p-3 border border-neutral-800">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-white text-xs uppercase">{tx.type.replace('_', ' ')}</span>
                    <span className="rounded px-1.5 py-0.5 text-[9px] font-black uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      {tx.status}
                    </span>
                  </div>
                  <p className="text-[10px] text-neutral-400">{new Date(tx.created_at).toLocaleString()}</p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-black text-emerald-400">
                    +${money(tx.amount)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* PORTFOLIO ACCESS MODAL */}
      <AnimatePresence>
        {activeModal === 'detail' && selectedPortfolio && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md rounded-3xl border border-neutral-800 bg-neutral-950 p-6 space-y-5 relative shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
            >
              <button onClick={closeModal} className="absolute top-4 right-4 z-20 text-neutral-400 hover:text-white bg-black/50 p-1.5 rounded-full backdrop-blur-md cursor-pointer">
                <X className="size-5" />
              </button>

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
                    className="w-full h-11 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-xl cursor-pointer"
                  >
                    {isSubmitting ? 'Transferring...' : `Move $${money(selectedPortfolio.accrued_yield)} Yield to Cash Balance`}
                  </Button>

                  <Button 
                    disabled={isSubmitting}
                    onClick={handleLiquidateEarly}
                    variant="destructive"
                    className="w-full h-11 bg-rose-600 hover:bg-rose-500 text-white font-black rounded-xl cursor-pointer"
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
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
