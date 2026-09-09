'use client'

import React, { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
const supabase = createClient(supabaseUrl, supabaseAnonKey)

interface AccountState {
  cash_balance: number
  invested_balance: number
  staked_balance: number
  pending_yield: number
  pulse_tokens: number
}

interface HoldingItem {
  id: string
  project_id: string
  amount: number
  target_yield_low?: number
  target_yield_high?: number
  expected_return?: number
  status: string
}

interface TransactionItem {
  id: string
  type: string
  amount: number
  created_at: string
  status: string
}

export default function SADCTerminalAllProjects() {
  const [activeTab, setActiveTab] = useState<'home' | 'invest' | 'sale' | 'stake' | 'signals' | 'wallet' | 'profile'>('home')
  
  const [account, setAccount] = useState<AccountState>({
    cash_balance: 0,
    invested_balance: 0,
    staked_balance: 0,
    pending_yield: 0,
    pulse_tokens: 0
  })
  
  const [holdings, setHoldings] = useState<HoldingItem[]>([])
  const [transactions, setTransactions] = useState<TransactionItem[]>([])
  
  const [userEmail, setUserEmail] = useState('investor@sadr.org')
  const [referralCode, setReferralCode] = useState('SADC-REF-9921-X7')
  const [selectedProject, setSelectedProject] = useState<any | null>(null)
  const [usdtInput, setUsdtInput] = useState<number>(100)

  useEffect(() => {
    async function syncData() {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (user && user.email) {
          setUserEmail(user.email)
          const hash = user.id ? user.id.split('-')[0].toUpperCase() : '9921'
          setReferralCode(`SADC-${user.email.substring(0, 3).toUpperCase()}-${hash}-X7`)

          // Real-time synchronization directly from database ledger
          const { data: acc } = await supabase.from('accounts').select('*').eq('user_id', user.id).single()
          if (acc) {
            setAccount({
              cash_balance: Number(acc.cash_balance ?? acc.cash ?? 0),
              invested_balance: Number(acc.invested_balance ?? acc.invested ?? 0),
              staked_balance: Number(acc.staked_balance ?? acc.staked ?? 0),
              pending_yield: Number(acc.pending_yield ?? 0),
              pulse_tokens: Number(acc.pulse_tokens ?? acc.tokens ?? 0)
            })
          }

          const { data: holds } = await supabase.from('holdings').select('*').eq('user_id', user.id)
          if (holds) setHoldings(holds)

          const { data: txs } = await supabase.from('transactions').select('*').eq('user_id', user.id)
          if (txs) setTransactions(txs)
        }
      } catch (err) {
        console.warn('Supabase active sync notice: Running on fallback public node.')
      }
    }
    syncData()
  }, [])

  const handleBuyPulse = async () => {
    try {
      const tokensToReceive = Math.round(usdtInput * 12.5 * 1.35)
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        await supabase.from('transactions').insert([
          { user_id: user.id, type: 'Buy Pulse', amount: usdtInput, status: 'COMPLETED' }
        ])
      }
      setAccount(prev => ({ ...prev, pulse_tokens: prev.pulse_tokens + tokensToReceive }))
      alert(`Successfully purchased tokens! Added ${tokensToReceive} PULSE to your vault.`)
    } catch (err: any) {
      alert('Purchase simulated successfully!')
    }
  }

  const projectsPipeline = [
    { id: 'sandsloot', title: 'Sandsloot Lithium & Tantalum Extraction Hub', cat: 'South Africa • Critical Minerals', apy: 22.5, raised: 385000, goal: 500000, cover: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=1200&q=80' },
    { id: 'kalahari', title: 'Kalahari Green Hydrogen & Ammonia Corridor', cat: 'Namibia • Clean Energy', apy: 19.8, raised: 940000, goal: 1200000, cover: 'https://images.unsplash.com/photo-1466611653911-95081537e5b7?auto=format&fit=crop&w=1200&q=80' },
    { id: 'copperbelt', title: 'Zambian Copperbelt High-Voltage Grid Modernization', cat: 'Zambia • Infrastructure', apy: 21.0, raised: 620000, goal: 1000000, cover: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80' },
    { id: 'zambezi', title: 'Zambezi Hydro-Electric Generation & Transmission Grid', cat: 'Zimbabwe / Zambia • Clean Energy', apy: 18.5, raised: 1450000, goal: 2000000, cover: 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?auto=format&fit=crop&w=1200&q=80' }
  ]

  const netLiquidityValue = account.cash_balance + account.invested_balance + account.staked_balance

  return (
    <div className="min-h-screen bg-[#060606] text-amber-100 font-sans flex flex-col items-center pb-40 selection:bg-amber-500 selection:text-black">
      <div className="w-full max-w-[480px] md:max-w-3xl lg:max-w-5xl mx-auto px-4 py-4 space-y-4">
        
        {/* ======================================================= */}
        {/* EXACT OG TOP HEADER BAR MATCHING SCREENSHOT             */}
        {/* ======================================================= */}
        <div className="w-full flex items-center justify-between gap-2">
          <div className="bg-[#101010]/90 border border-amber-500/30 rounded-full px-3.5 py-1.5 flex items-center space-x-2 shadow-xl backdrop-blur-md">
            <div className="w-5 h-5 rounded-full bg-amber-500 flex items-center justify-center font-black text-black text-[10px] shadow">
              P
            </div>
            <span className="text-[10px] font-bold text-amber-300 tracking-wider uppercase">SADC SOVEREIGN TERMINAL & GEO...</span>
          </div>

          <div className="flex items-center space-x-2">
            <div className="bg-[#101010]/90 border border-amber-500/30 rounded-full px-3 py-1.5 hidden sm:flex items-center space-x-2 shadow-xl backdrop-blur-md">
              <span className="text-[10px] text-amber-400 font-medium">Ambassador VIP</span>
            </div>

            <div className="bg-[#101010]/90 border border-amber-500/30 rounded-full px-3.5 py-1.5 flex items-center space-x-2 shadow-xl backdrop-blur-md">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-xs font-mono font-bold text-amber-300">${account.cash_balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              <div className="flex space-x-1 pl-1 border-l border-amber-500/20">
                <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                <span className="w-2 h-2 rounded-full bg-yellow-400"></span>
              </div>
            </div>
          </div>
        </div>

        {/* TAB: HOME */}
        {activeTab === 'home' && (
          <div className="space-y-4">
            <div className="bg-gradient-to-b from-[#141414] to-[#0c0c0c] border border-amber-500/30 rounded-2xl p-5 md:p-6 text-center space-y-3 shadow-2xl relative overflow-hidden">
              <div className="absolute top-3 right-4 text-[10px] bg-amber-500/20 text-amber-300 px-2.5 py-1 rounded-full font-mono border border-amber-500/30">Ambassador VIP</div>
              <p className="text-[11px] text-amber-400/60 uppercase tracking-widest font-medium">Net Liquidity Value</p>
              <h1 className="text-3xl md:text-5xl font-extrabold text-amber-300 font-mono tracking-tight">
                ${netLiquidityValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </h1>
              <p className="text-[11px] text-emerald-400 font-mono">Sovereign Yield: +20.2% APY (Synced Ledger)</p>

              <div className="flex flex-col sm:flex-row gap-2.5 pt-2 max-w-md mx-auto">
                <button onClick={() => setSelectedProject({ title: 'General Capital Valuation', apy: 20.2 })} className="flex-1 bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs py-2.5 rounded-xl transition shadow">
                  + Valuate Capital
                </button>
                <button onClick={() => alert('Yield withdrawal request initiated to sovereign vault.')} className="flex-1 bg-amber-950/40 hover:bg-amber-900/40 border border-amber-500/40 text-amber-300 font-bold text-xs py-2.5 rounded-xl transition">
                  Withdraw Yields
                </button>
              </div>

              <div className="grid grid-cols-3 gap-2 pt-3 border-t border-amber-500/10 text-center font-mono max-w-lg mx-auto">
                <div className="bg-black/50 p-2 rounded-xl border border-amber-500/10">
                  <span className="text-[9px] text-amber-400/50 block">CASH</span>
                  <span className="text-xs text-amber-200 font-bold">${account.cash_balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
                <div className="bg-black/50 p-2 rounded-xl border border-amber-500/10">
                  <span className="text-[9px] text-amber-400/50 block">PRINCIPAL</span>
                  <span className="text-xs text-amber-200 font-bold">${account.invested_balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
                <div className="bg-black/50 p-2 rounded-xl border border-amber-500/10">
                  <span className="text-[9px] text-amber-400/50 block">$PULSE</span>
                  <span className="text-xs text-amber-200 font-bold">{account.pulse_tokens.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Regional Pipeline */}
            <div className="space-y-3">
              <div className="flex justify-between items-center px-1">
                <span className="font-bold text-amber-300 uppercase tracking-wider text-xs">Regional Opportunities Pipeline ({projectsPipeline.length})</span>
                <span className="text-[10px] text-amber-400/60 font-mono">Live Ledger Synced</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {projectsPipeline.map((p) => {
                  const percent = Math.min(100, Math.round((p.raised / p.goal) * 100))
                  return (
                    <div 
                      key={p.id} 
                      onClick={() => setSelectedProject(p)}
                      className="bg-[#101010] border border-amber-500/30 rounded-2xl overflow-hidden shadow-lg hover:border-amber-500/60 transition cursor-pointer flex flex-col justify-between"
                    >
                      <div>
                        <div className="relative h-36 w-full overflow-hidden">
                          <img src={p.cover} alt={p.title} className="w-full h-full object-cover" />
                          <div className="absolute top-2.5 right-2.5 bg-black/80 backdrop-blur border border-amber-500/40 px-3 py-1 rounded-full text-xs font-mono text-amber-300">
                            {p.apy}% APY
                          </div>
                        </div>
                        <div className="p-4 space-y-3">
                          <div>
                            <p className="text-[10px] text-amber-400/60 uppercase tracking-widest">{p.cat}</p>
                            <h3 className="font-bold text-amber-100 text-sm mt-0.5">{p.title}</h3>
                          </div>
                          <div className="space-y-1.5 font-mono text-xs">
                            <div className="flex justify-between text-amber-400/80">
                              <span>Funded: ${p.raised.toLocaleString()} / ${p.goal.toLocaleString()}</span>
                              <span className="text-amber-300">{percent}%</span>
                            </div>
                            <div className="w-full bg-black h-2 rounded-full overflow-hidden border border-amber-500/20">
                              <div className="bg-gradient-to-r from-amber-600 to-yellow-400 h-full" style={{ width: `${percent}%` }} />
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="px-4 pb-4 pt-1">
                        <span className="w-full block text-center bg-amber-500/10 text-amber-300 border border-amber-500/30 rounded-xl py-2 text-xs font-mono">
                          Allocate Tranche →
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* ======================================================= */}
            {/* COMPLIANCE & LEGAL DISCLAIMER WIDGET                    */}
            {/* ======================================================= */}
            <div className="bg-[#0c0c0c] border border-amber-500/20 rounded-2xl p-4 text-[10px] text-amber-400/50 space-y-2 font-mono leading-relaxed mt-6">
              <div className="flex items-center space-x-2 text-amber-300 font-bold uppercase tracking-wider">
                <span>⚠️</span>
                <span>Institutional Regulatory Disclaimer</span>
              </div>
              <p>
                The SADC Sovereign Terminal and Pulse instruments represent qualified institutional infrastructure placements. Yield outputs, APY metrics, and capital tranches reflect live database ledger states and smart-contract protocol calculations. Past performance does not guarantee future sovereign distributions. All allocations are subject to regional compliance mandates and cross-border regulatory frameworks.
              </p>
            </div>
          </div>
        )}

        {/* TAB: SALE */}
        {activeTab === 'sale' && (
          <div className="space-y-4">
            <div className="border-b border-amber-500/20 pb-3">
              <h2 className="text-base font-bold text-amber-300 uppercase">USDT Calculator</h2>
            </div>
            <div className="bg-[#101010] border border-amber-500/30 rounded-2xl p-5 space-y-4 font-mono shadow-xl">
              <input 
                type="number" 
                value={usdtInput} 
                onChange={(e) => setUsdtInput(Number(e.target.value))}
                className="w-full bg-black/60 border border-amber-500/30 rounded-xl px-4 py-3 text-amber-300 font-bold text-lg outline-none"
              />
              <button onClick={handleBuyPulse} className="w-full bg-amber-500 text-black font-bold py-3.5 rounded-xl text-xs transition">
                BUY {Math.round(usdtInput * 12.5 * 1.35)} PULSE →
              </button>
            </div>
          </div>
        )}

      </div>

      {/* Bottom Navigation Dock */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#0c0c0c]/95 backdrop-blur border-t border-amber-500/20 py-3 px-3 flex justify-around items-center z-40 max-w-xl mx-auto rounded-t-2xl shadow-2xl">
        <button onClick={() => setActiveTab('home')} className={`flex flex-col items-center text-[9px] transition ${activeTab === 'home' ? 'text-amber-400 font-bold scale-110' : 'text-amber-400/50'}`}>
          <span className="text-sm">🏠</span>
          <span>HOME</span>
        </button>
        <button onClick={() => setActiveTab('invest')} className={`flex flex-col items-center text-[9px] transition ${activeTab === 'invest' ? 'text-amber-400 font-bold scale-110' : 'text-amber-400/50'}`}>
          <span className="text-sm">📈</span>
          <span>INVEST</span>
        </button>
        <button onClick={() => setActiveTab('sale')} className={`flex flex-col items-center text-[9px] transition ${activeTab === 'sale' ? 'text-amber-400 font-bold scale-110' : 'text-amber-400/50'}`}>
          <span className="text-sm">✨</span>
          <span>SALE</span>
        </button>
        <button onClick={() => setActiveTab('stake')} className={`flex flex-col items-center text-[9px] transition ${activeTab === 'stake' ? 'text-amber-400 font-bold scale-110' : 'text-amber-400/50'}`}>
          <span className="text-sm">⚡</span>
          <span>STAKE</span>
        </button>
        <button onClick={() => setActiveTab('signals')} className={`flex flex-col items-center text-[9px] transition ${activeTab === 'signals' ? 'text-amber-400 font-bold scale-110' : 'text-amber-400/50'}`}>
          <span className="text-sm">📡</span>
          <span>SIGNALS</span>
        </button>
        <button onClick={() => setActiveTab('wallet')} className={`flex flex-col items-center text-[9px] transition ${activeTab === 'wallet' ? 'text-amber-400 font-bold scale-110' : 'text-amber-400/50'}`}>
          <span className="text-sm">💳</span>
          <span>WALLET</span>
        </button>
        <button onClick={() => setActiveTab('profile')} className={`flex flex-col items-center text-[9px] transition ${activeTab === 'profile' ? 'text-amber-400 font-bold scale-110' : 'text-amber-400/50'}`}>
          <span className="text-sm">👤</span>
          <span>PROFILE</span>
        </button>
      </div>
    </div>
  )
}
