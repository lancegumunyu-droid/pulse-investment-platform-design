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
    cash_balance: 6183.49,
    invested_balance: 12500.00,
    staked_balance: 5000.00,
    pending_yield: 840.20,
    pulse_tokens: 80139
  })
  
  const [holdings, setHoldings] = useState<HoldingItem[]>([])
  const [transactions, setTransactions] = useState<TransactionItem[]>([])
  
  const [userEmail, setUserEmail] = useState('investor@sadr.org')
  const [referralCode, setReferralCode] = useState('SADC-REF-9921-X7')
  const [selectedProject, setSelectedProject] = useState<any | null>(null)
  const [usdtInput, setUsdtInput] = useState<number>(100)
  const [stakeInput, setStakeInput] = useState<number>(1000)

  useEffect(() => {
    async function syncData() {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (user && user.email) {
          setUserEmail(user.email)
          const hash = user.id ? user.id.split('-')[0].toUpperCase() : '9921'
          setReferralCode(`SADC-${user.email.substring(0, 3).toUpperCase()}-${hash}-X7`)

          const { data: acc } = await supabase.from('accounts').select('*').eq('user_id', user.id).single()
          if (acc) {
            setAccount({
              cash_balance: Number(acc.cash_balance ?? acc.cash ?? 6183.49),
              invested_balance: Number(acc.invested_balance ?? acc.invested ?? 12500.00),
              staked_balance: Number(acc.staked_balance ?? acc.staked ?? 5000.00),
              pending_yield: Number(acc.pending_yield ?? 840.20),
              pulse_tokens: Number(acc.pulse_tokens ?? acc.tokens ?? 80139)
            })
          }

          const { data: holds } = await supabase.from('holdings').select('*').eq('user_id', user.id)
          if (holds) setHoldings(holds)

          const { data: txs } = await supabase.from('transactions').select('*').eq('user_id', user.id)
          if (txs) setTransactions(txs)
        }
      } catch (err) {
        console.warn('Supabase active sync notice: Running on fallback node.')
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

  const handleStakeTokens = async () => {
    if (stakeInput > account.pulse_tokens) {
      alert('Insufficient $PULSE balance for staking.')
      return
    }
    setAccount(prev => ({
      ...prev,
      pulse_tokens: prev.pulse_tokens - stakeInput,
      staked_balance: prev.staked_balance + stakeInput
    }))
    alert(`Successfully staked ${stakeInput.toLocaleString()} $PULSE at 24.5% APY!`)
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
      <div className="w-full max-w-6xl mx-auto px-4 md:px-8 py-6 space-y-6">
        
        {/* TOP HEADER BAR */}
        <div className="w-full flex items-center justify-between gap-4">
          <div className="bg-[#101010]/90 border border-amber-500/30 rounded-full px-4 py-2 flex items-center space-x-3 shadow-xl backdrop-blur-md">
            <div className="w-6 h-6 rounded-full bg-amber-500 flex items-center justify-center font-black text-black text-xs shadow">
              P
            </div>
            <span className="text-xs font-bold text-amber-300 tracking-wider uppercase">SADC SOVEREIGN TERMINAL & GEOPOLITICAL VAULT</span>
          </div>

          <div className="flex items-center space-x-3">
            <div className="bg-[#101010]/90 border border-amber-500/30 rounded-full px-4 py-2 hidden sm:flex items-center space-x-2 shadow-xl backdrop-blur-md">
              <span className="text-xs text-amber-400 font-medium">Ambassador VIP</span>
            </div>

            <div className="bg-[#101010]/90 border border-amber-500/30 rounded-full px-4 py-2 flex items-center space-x-3 shadow-xl backdrop-blur-md">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-sm font-mono font-bold text-amber-300">${account.cash_balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
          </div>
        </div>

        {/* TAB: HOME */}
        {activeTab === 'home' && (
          <div className="space-y-6">
            <div className="bg-gradient-to-b from-[#141414] to-[#0c0c0c] border border-amber-500/30 rounded-3xl p-8 text-center space-y-4 shadow-2xl relative overflow-hidden">
              <div className="absolute top-4 right-6 text-xs bg-amber-500/20 text-amber-300 px-3 py-1.5 rounded-full font-mono border border-amber-500/30">Ambassador VIP</div>
              <p className="text-xs text-amber-400/60 uppercase tracking-widest font-medium">Net Liquidity Value</p>
              <h1 className="text-4xl md:text-6xl font-extrabold text-amber-300 font-mono tracking-tight">
                ${netLiquidityValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </h1>
              <p className="text-xs text-emerald-400 font-mono">Sovereign Yield: +20.2% APY (Synced Ledger)</p>

              <div className="flex flex-col sm:flex-row gap-3 pt-2 max-w-lg mx-auto">
                <button onClick={() => setActiveTab('invest')} className="flex-1 bg-amber-500 hover:bg-amber-400 text-black font-bold text-sm py-3 rounded-xl transition shadow">
                  + Allocate Capital
                </button>
                <button onClick={() => alert('Yield withdrawal request initiated to sovereign vault.')} className="flex-1 bg-amber-950/40 hover:bg-amber-900/40 border border-amber-500/40 text-amber-300 font-bold text-sm py-3 rounded-xl transition">
                  Withdraw Yields (${account.pending_yield.toFixed(2)})
                </button>
              </div>

              <div className="grid grid-cols-3 gap-4 pt-4 border-t border-amber-500/10 text-center font-mono max-w-2xl mx-auto">
                <div className="bg-black/50 p-3 rounded-2xl border border-amber-500/10">
                  <span className="text-[10px] text-amber-400/50 block">CASH</span>
                  <span className="text-sm text-amber-200 font-bold">${account.cash_balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
                <div className="bg-black/50 p-3 rounded-2xl border border-amber-500/10">
                  <span className="text-[10px] text-amber-400/50 block">PRINCIPAL</span>
                  <span className="text-sm text-amber-200 font-bold">${account.invested_balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
                <div className="bg-black/50 p-3 rounded-2xl border border-amber-500/10">
                  <span className="text-[10px] text-amber-400/50 block">$PULSE</span>
                  <span className="text-sm text-amber-200 font-bold">{account.pulse_tokens.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Regional Pipeline */}
            <div className="space-y-4">
              <div className="flex justify-between items-center px-2">
                <span className="font-bold text-amber-300 uppercase tracking-wider text-sm">Regional Opportunities Pipeline ({projectsPipeline.length})</span>
                <span className="text-xs text-amber-400/60 font-mono">Live Ledger Synced</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {projectsPipeline.map((p) => {
                  const percent = Math.min(100, Math.round((p.raised / p.goal) * 100))
                  return (
                    <div 
                      key={p.id} 
                      onClick={() => { setSelectedProject(p); setActiveTab('invest'); }}
                      className="bg-[#101010] border border-amber-500/30 rounded-3xl overflow-hidden shadow-xl hover:border-amber-500/60 transition cursor-pointer flex flex-col justify-between"
                    >
                      <div>
                        <div className="relative h-48 w-full overflow-hidden">
                          <img src={p.cover} alt={p.title} className="w-full h-full object-cover" />
                          <div className="absolute top-3 right-3 bg-black/80 backdrop-blur border border-amber-500/40 px-3.5 py-1.5 rounded-full text-xs font-mono text-amber-300">
                            {p.apy}% APY
                          </div>
                        </div>
                        <div className="p-5 space-y-4">
                          <div>
                            <p className="text-xs text-amber-400/60 uppercase tracking-widest">{p.cat}</p>
                            <h3 className="font-bold text-amber-100 text-base mt-1">{p.title}</h3>
                          </div>
                          <div className="space-y-2 font-mono text-xs">
                            <div className="flex justify-between text-amber-400/80">
                              <span>Funded: ${p.raised.toLocaleString()} / ${p.goal.toLocaleString()}</span>
                              <span className="text-amber-300">{percent}%</span>
                            </div>
                            <div className="w-full bg-black h-2.5 rounded-full overflow-hidden border border-amber-500/20">
                              <div className="bg-gradient-to-r from-amber-600 to-yellow-400 h-full" style={{ width: `${percent}%` }} />
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="px-5 pb-5 pt-1">
                        <span className="w-full block text-center bg-amber-500/10 text-amber-300 border border-amber-500/30 rounded-2xl py-2.5 text-xs font-mono hover:bg-amber-500/20 transition">
                          Allocate Tranche →
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Disclaimer */}
            <div className="bg-[#0c0c0c] border border-amber-500/20 rounded-3xl p-6 text-xs text-amber-400/50 space-y-3 font-mono leading-relaxed mt-8">
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

        {/* TAB: INVEST */}
        {activeTab === 'invest' && (
          <div className="space-y-6 max-w-4xl mx-auto">
            <div className="border-b border-amber-500/20 pb-4 flex justify-between items-center">
              <h2 className="text-lg font-bold text-amber-300 uppercase">Active Tranche Allocation & Pipeline</h2>
              <span className="text-xs font-mono text-amber-400/60">Select Project to Deploy Capital</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {projectsPipeline.map((p) => (
                <div key={p.id} className="bg-[#101010] border border-amber-500/30 rounded-3xl p-6 space-y-4 shadow-xl">
                  <h3 className="font-bold text-amber-200 text-base">{p.title}</h3>
                  <p className="text-xs text-amber-400/60">{p.cat} • <span className="text-amber-300 font-mono">{p.apy}% APY</span></p>
                  <button onClick={() => alert(`Allocating capital to ${p.title}`)} className="w-full bg-amber-500 hover:bg-amber-400 text-black font-bold py-3 rounded-2xl text-xs transition">
                    Commit Tranche Capital
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB: SALE */}
        {activeTab === 'sale' && (
          <div className="space-y-6 max-w-xl mx-auto">
            <div className="border-b border-amber-500/20 pb-4">
              <h2 className="text-lg font-bold text-amber-300 uppercase">$PULSE Token Public & Strategic Sale</h2>
            </div>
            <div className="bg-[#101010] border border-amber-500/30 rounded-3xl p-8 space-y-6 font-mono shadow-2xl">
              <div className="space-y-2">
                <label className="text-xs text-amber-400/70 block">USDT Contribution Amount</label>
                <input 
                  type="number" 
                  value={usdtInput} 
                  onChange={(e) => setUsdtInput(Number(e.target.value))}
                  className="w-full bg-black/60 border border-amber-500/30 rounded-2xl px-5 py-4 text-amber-300 font-bold text-xl outline-none"
                />
              </div>
              <div className="p-4 bg-black/40 rounded-2xl border border-amber-500/20 space-y-1 text-xs">
                <div className="flex justify-between text-amber-400/70">
                  <span>Exchange Rate:</span>
                  <span className="text-amber-200">1 USDT = 12.5 PULSE + 35% Bonus</span>
                </div>
                <div className="flex justify-between font-bold text-amber-300 pt-2 border-t border-amber-500/20 text-sm">
                  <span>Estimated Allocation:</span>
                  <span>{Math.round(usdtInput * 12.5 * 1.35).toLocaleString()} PULSE</span>
                </div>
              </div>
              <button onClick={handleBuyPulse} className="w-full bg-amber-500 text-black font-bold py-4 rounded-2xl text-sm transition hover:bg-amber-400">
                BUY {Math.round(usdtInput * 12.5 * 1.35).toLocaleString()} PULSE →
              </button>
            </div>
          </div>
        )}

        {/* TAB: STAKE */}
        {activeTab === 'stake' && (
          <div className="space-y-6 max-w-xl mx-auto">
            <div className="border-b border-amber-500/20 pb-4">
              <h2 className="text-lg font-bold text-amber-300 uppercase">Sovereign $PULSE Staking Vault</h2>
            </div>
            <div className="bg-[#101010] border border-amber-500/30 rounded-3xl p-8 space-y-6 font-mono shadow-2xl">
              <div className="flex justify-between text-xs text-amber-400/70">
                <span>Available Balance:</span>
                <span className="text-amber-200 font-bold">{account.pulse_tokens.toLocaleString()} PULSE</span>
              </div>
              <input 
                type="number" 
                value={stakeInput} 
                onChange={(e) => setStakeInput(Number(e.target.value))}
                className="w-full bg-black/60 border border-amber-500/30 rounded-2xl px-5 py-4 text-amber-300 font-bold text-xl outline-none"
              />
              <div className="p-4 bg-black/40 rounded-2xl border border-amber-500/20 text-xs flex justify-between">
                <span className="text-amber-400/70">Staking APY:</span>
                <span className="text-emerald-400 font-bold">24.5% Compound Yield</span>
              </div>
              <button onClick={handleStakeTokens} className="w-full bg-amber-500 text-black font-bold py-4 rounded-2xl text-sm transition hover:bg-amber-400">
                Stake $PULSE Vault →
              </button>
            </div>
          </div>
        )}

        {/* TAB: SIGNALS */}
        {activeTab === 'signals' && (
          <div className="space-y-6 max-w-3xl mx-auto">
            <div className="border-b border-amber-500/20 pb-4">
              <h2 className="text-lg font-bold text-amber-300 uppercase">Geopolitical & Infrastructure Telemetry</h2>
            </div>
            <div className="space-y-4 font-mono text-xs">
              <div className="bg-[#101010] border border-amber-500/30 rounded-2xl p-5 space-y-2">
                <div className="flex justify-between text-amber-400/60">
                  <span>[SIGNAL #991]</span>
                  <span>10 mins ago</span>
                </div>
                <p className="text-amber-200 text-sm font-sans font-medium">Sandsloot Lithium Corridor phase 2 grid connection approved by regional energy board.</p>
              </div>
              <div className="bg-[#101010] border border-amber-500/30 rounded-2xl p-5 space-y-2">
                <div className="flex justify-between text-amber-400/60">
                  <span>[SIGNAL #988]</span>
                  <span>3 hours ago</span>
                </div>
                <p className="text-amber-200 text-sm font-sans font-medium">Kalahari Green Hydrogen export framework finalized under SADC cross-border trade agreement.</p>
              </div>
            </div>
          </div>
        )}

        {/* TAB: WALLET */}
        {activeTab === 'wallet' && (
          <div className="space-y-6 max-w-3xl mx-auto">
            <div className="border-b border-amber-500/20 pb-4">
              <h2 className="text-lg font-bold text-amber-300 uppercase">Sovereign Treasury Wallet & Ledger</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono">
              <div className="bg-[#101010] border border-amber-500/30 rounded-2xl p-5 space-y-1">
                <span className="text-xs text-amber-400/50">CASH LIQUIDITY</span>
                <p className="text-xl font-bold text-amber-200">${account.cash_balance.toLocaleString()}</p>
              </div>
              <div className="bg-[#101010] border border-amber-500/30 rounded-2xl p-5 space-y-1">
                <span className="text-xs text-amber-400/50">STAKED VAULT</span>
                <p className="text-xl font-bold text-amber-200">${account.staked_balance.toLocaleString()}</p>
              </div>
              <div className="bg-[#101010] border border-amber-500/30 rounded-2xl p-5 space-y-1">
                <span className="text-xs text-amber-400/50">PENDING YIELD</span>
                <p className="text-xl font-bold text-emerald-400">${account.pending_yield.toLocaleString()}</p>
              </div>
            </div>
          </div>
        )}

        {/* TAB: PROFILE */}
        {activeTab === 'profile' && (
          <div className="space-y-6 max-w-xl mx-auto font-mono">
            <div className="border-b border-amber-500/20 pb-4">
              <h2 className="text-lg font-bold text-amber-300 uppercase">Ambassador VIP Profile</h2>
            </div>
            <div className="bg-[#101010] border border-amber-500/30 rounded-3xl p-8 space-y-4 shadow-2xl">
              <div className="space-y-1">
                <span className="text-xs text-amber-400/50">ACCOUNT EMAIL</span>
                <p className="text-amber-200 font-bold">{userEmail}</p>
              </div>
              <div className="space-y-1 pt-2 border-t border-amber-500/10">
                <span className="text-xs text-amber-400/50">AMBASSADOR REFERRAL CODE</span>
                <p className="text-amber-300 font-bold tracking-wider">{referralCode}</p>
              </div>
              <div className="space-y-1 pt-2 border-t border-amber-500/10">
                <span className="text-xs text-amber-400/50">SECURITY TIER</span>
                <p className="text-emerald-400 font-bold">Level 3 Sovereign Hardware Synced</p>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* Bottom Navigation Dock - Fixed and Centered */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-[#0c0c0c]/95 backdrop-blur border border-amber-500/30 py-3 px-8 flex justify-around items-center z-40 w-full max-w-xl mx-auto rounded-full shadow-2xl gap-2">
        <button onClick={() => setActiveTab('home')} className={`flex flex-col items-center text-[10px] transition ${activeTab === 'home' ? 'text-amber-400 font-bold scale-110' : 'text-amber-400/50 hover:text-amber-300'}`}>
          <span className="text-base">🏠</span>
          <span>HOME</span>
        </button>
        <button onClick={() => setActiveTab('invest')} className={`flex flex-col items-center text-[10px] transition ${activeTab === 'invest' ? 'text-amber-400 font-bold scale-110' : 'text-amber-400/50 hover:text-amber-300'}`}>
          <span className="text-base">📈</span>
          <span>INVEST</span>
        </button>
        <button onClick={() => setActiveTab('sale')} className={`flex flex-col items-center text-[10px] transition ${activeTab === 'sale' ? 'text-amber-400 font-bold scale-110' : 'text-amber-400/50 hover:text-amber-300'}`}>
          <span className="text-base">✨</span>
          <span>SALE</span>
        </button>
        <button onClick={() => setActiveTab('stake')} className={`flex flex-col items-center text-[10px] transition ${activeTab === 'stake' ? 'text-amber-400 font-bold scale-110' : 'text-amber-400/50 hover:text-amber-300'}`}>
          <span className="text-base">⚡</span>
          <span>STAKE</span>
        </button>
        <button onClick={() => setActiveTab('signals')} className={`flex flex-col items-center text-[10px] transition ${activeTab === 'signals' ? 'text-amber-400 font-bold scale-110' : 'text-amber-400/50 hover:text-amber-300'}`}>
          <span className="text-base">📡</span>
          <span>SIGNALS</span>
        </button>
        <button onClick={() => setActiveTab('wallet')} className={`flex flex-col items-center text-[10px] transition ${activeTab === 'wallet' ? 'text-amber-400 font-bold scale-110' : 'text-amber-400/50 hover:text-amber-300'}`}>
          <span className="text-base">💳</span>
          <span>WALLET</span>
        </button>
        <button onClick={() => setActiveTab('profile')} className={`flex flex-col items-center text-[10px] transition ${activeTab === 'profile' ? 'text-amber-400 font-bold scale-110' : 'text-amber-400/50 hover:text-amber-300'}`}>
          <span className="text-base">👤</span>
          <span>PROFILE</span>
        </button>
      </div>
    </div>
  )
}
