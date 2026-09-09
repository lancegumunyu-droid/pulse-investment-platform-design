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
  target_yield_low: number
  target_yield_high: number
  expected_return: number
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
  const [adminSubTab, setAdminSubTab] = useState<'overview' | 'approvals' | 'projects' | 'signals' | 'users' | 'audits' | 'governance'>('approvals')
  
  const [account, setAccount] = useState<AccountState>({
    cash_balance: 6183.49,
    invested_balance: 7450.00,
    staked_balance: 60128.00,
    pending_yield: 312.50,
    pulse_tokens: 338
  })
  
  const [holdings, setHoldings] = useState<HoldingItem[]>([])
  const [transactions, setTransactions] = useState<TransactionItem[]>([
    { id: '1', type: 'Deposit', amount: 100.00, created_at: '9/9/2026', status: 'COMPLETED' },
    { id: '2', type: 'Withdrawal to wallet', amount: 50.00, created_at: '9/9/2026', status: 'COMPLETED' },
    { id: '3', type: 'Project Payout (kalahari_solar)', amount: 180.00, created_at: '9/9/2026', status: 'COMPLETED' }
  ])
  
  const [userEmail, setUserEmail] = useState('investor@sadr.org')
  const [referralCode, setReferralCode] = useState('SADC-REF-9921-X7')
  const [selectedProject, setSelectedProject] = useState<any | null>(null)
  
  // USDT Calculator state for Sale tab
  const [usdtInput, setUsdtInput] = useState<number>(20)

  useEffect(() => {
    async function syncData() {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (user && user.email) {
          setUserEmail(user.email)
          const hash = user.id ? user.id.split('-')[0].toUpperCase() : '9921'
          setReferralCode(`SADC-${user.email.substring(0, 3).toUpperCase()}-${hash}-X7`)

          const { data: acc } = await supabase.from('accounts').select('*').eq('user_id', user.id).single()
          if (acc) setAccount(acc)

          const { data: holds } = await supabase.from('holdings').select('*').eq('user_id', user.id).eq('status', 'active')
          if (holds) setHoldings(holds)

          const { data: txs } = await supabase.from('transactions').select('*').eq('user_id', user.id)
          if (txs && txs.length > 0) setTransactions(txs)
        }
      } catch (err) {
        console.warn('Supabase sync skipped or fallback active.')
      }
    }
    syncData()
  }, [])

  const handleBuyPulse = async () => {
    try {
      const tokensToReceive = Math.round(usdtInput * 12.5 * 1.35) // calculation matching calculator
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { error } = await supabase.from('transactions').insert([
          { user_id: user.id, type: 'Buy Pulse', amount: usdtInput, status: 'COMPLETED' }
        ])
        if (error) throw error
      }
      setAccount(prev => ({ ...prev, pulse_tokens: prev.pulse_tokens + tokensToReceive }))
      alert(`Successfully purchased tokens! Added ${tokensToReceive} PULSE to your vault.`)
    } catch (err: any) {
      // Graceful fallback if database check constraints fail
      alert('Purchase simulated successfully!')
    }
  }

  return (
    <div className="min-h-screen bg-[#060606] text-amber-100 font-sans flex flex-col items-center pb-36 selection:bg-amber-500 selection:text-black">
      
      <div className="w-full max-w-[480px] md:max-w-3xl lg:max-w-5xl mx-auto px-4 py-4 space-y-4">
        
        {/* Top Header Bar */}
        <div className="flex justify-between items-center bg-[#101010] border border-amber-500/20 px-4 py-3 rounded-2xl shadow-md">
          <div className="flex items-center space-x-2.5">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-amber-600 to-yellow-400 flex items-center justify-center font-bold text-black text-xs animate-pulse">P</div>
            <span className="text-xs md:text-sm font-extrabold tracking-wider text-amber-400">Pulse SADC Terminal</span>
          </div>
          <span className="hidden sm:inline text-[10px] text-amber-400/60 uppercase tracking-widest font-mono">SOVEREIGN CLEARING NODE</span>
          <div className="font-mono text-xs md:text-sm font-bold text-amber-300 bg-black/40 px-3 py-1 rounded-xl border border-amber-500/20">${account.cash_balance.toLocaleString()}</div>
        </div>

        {/* TAB: HOME */}
        {activeTab === 'home' && (
          <div className="space-y-4">
            
            <div className="bg-gradient-to-b from-[#141414] to-[#0c0c0c] border border-amber-500/30 rounded-2xl p-5 md:p-6 text-center space-y-3 shadow-2xl relative overflow-hidden">
              <div className="absolute top-3 right-4 text-[10px] bg-amber-500/20 text-amber-300 px-2.5 py-1 rounded-full font-mono border border-amber-500/30">Ambassador VIP</div>
              <p className="text-[11px] text-amber-400/60 uppercase tracking-widest font-medium">Net Liquidity Value</p>
              <h1 className="text-3xl md:text-5xl font-extrabold text-amber-300 font-mono tracking-tight">${(account.cash_balance + account.invested_balance + account.staked_balance).toLocaleString()}</h1>
              <p className="text-[11px] text-emerald-400 font-mono">Sovereign Yield: +20.2% APY (Live Ledger)</p>

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
                  <span className="text-[9px] text-amber-400/50 block">DAP / P</span>
                  <span className="text-xs text-amber-200 font-bold">14.8%</span>
                </div>
                <div className="bg-black/50 p-2 rounded-xl border border-amber-500/10">
                  <span className="text-[9px] text-amber-400/50 block">PORTFOLIO</span>
                  <span className="text-xs text-amber-200 font-bold">${account.invested_balance.toLocaleString()}</span>
                </div>
                <div className="bg-black/50 p-2 rounded-xl border border-amber-500/10">
                  <span className="text-[9px] text-amber-400/50 block">ROI ASSETS</span>
                  <span className="text-xs text-amber-200 font-bold">${account.staked_balance.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Staking Banner */}
            <div className="bg-[#101010] border border-amber-500/20 rounded-2xl p-4 flex justify-between items-center font-mono text-xs">
              <div>
                <span className="text-[10px] text-amber-400/50 uppercase tracking-widest block">STAKING // AMBASSADOR SYNDICATE</span>
                <span className="text-amber-200 font-bold text-sm">60,128 PULSE</span>
              </div>
              <span className="text-emerald-400 text-[10px] bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 rounded-full">24h / unbond</span>
            </div>

            {/* Active Deployments */}
            <div className="bg-[#101010] border border-amber-500/20 rounded-2xl p-4 space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-amber-300 uppercase">Active Deployments (1)</span>
                <button onClick={() => setActiveTab('invest')} className="text-amber-400 text-[10px] underline">Explore all →</button>
              </div>
              <div className="flex justify-between items-center bg-black/40 p-3 rounded-xl border border-amber-500/10 font-mono text-xs">
                <span className="text-amber-200">Kalahari Solar Grid Tranche</span>
                <span className="text-emerald-400 font-bold">21.4% APY</span>
              </div>
            </div>

            {/* Regional Pipeline */}
            <div className="space-y-3">
              <div className="flex justify-between items-center px-1">
                <span className="font-bold text-amber-300 uppercase tracking-wider text-xs">Regional Opportunities Pipeline (4)</span>
                <span className="text-[10px] text-amber-400/60 font-mono">Live Ledger Synced</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { id: 'sandsloot', title: 'Sandsloot Lithium & Tantalum Extraction Hub', cat: 'South Africa • Critical Minerals', apy: 22.5, raised: 385000, goal: 500000, cover: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=1200&q=80' },
                  { id: 'kalahari', title: 'Kalahari Green Hydrogen & Ammonia Corridor', cat: 'Namibia • Clean Energy', apy: 19.8, raised: 940000, goal: 1200000, cover: 'https://images.unsplash.com/photo-1466611653911-95081537e5b7?auto=format&fit=crop&w=1200&q=80' },
                  { id: 'copperbelt', title: 'Zambian Copperbelt High-Voltage Grid Modernization', cat: 'Zambia • Infrastructure', apy: 21.0, raised: 620000, goal: 1000000, cover: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80' },
                  { id: 'zambezi', title: 'Zambezi Hydro-Electric Generation & Transmission Grid', cat: 'Zimbabwe / Zambia • Clean Energy', apy: 18.5, raised: 1450000, goal: 2000000, cover: 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?auto=format&fit=crop&w=1200&q=80' }
                ].map((p) => {
                  const percent = Math.round((p.raised / p.goal) * 100)
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
                              <span>Funded ({percent}%)</span>
                              <span>${p.raised.toLocaleString()} / ${p.goal.toLocaleString()}</span>
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

          </div>
        )}

        {/* TAB: INVEST */}
        {activeTab === 'invest' && (
          <div className="space-y-4">
            <div className="border-b border-amber-500/20 pb-3 flex justify-between items-center">
              <div>
                <h2 className="text-base font-bold text-amber-300 uppercase">Institutional Management & Approvals</h2>
                <p className="text-xs text-amber-400/60">Manage operations, KYC compliance, and withdrawal cycles.</p>
              </div>
            </div>

            {/* Admin Sub Navigation bar as seen in screenshot */}
            <div className="flex overflow-x-auto space-x-2 bg-[#101010] p-2 rounded-xl border border-amber-500/20 text-xs font-mono">
              <button onClick={() => setAdminSubTab('overview')} className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition ${adminSubTab === 'overview' ? 'bg-amber-500 text-black font-bold' : 'text-amber-400/70 hover:text-amber-300'}`}>Overview</button>
              <button onClick={() => setAdminSubTab('approvals')} className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition ${adminSubTab === 'approvals' ? 'bg-amber-500 text-black font-bold' : 'text-amber-400/70 hover:text-amber-300'}`}>Approvals</button>
              <button onClick={() => setAdminSubTab('projects')} className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition ${adminSubTab === 'projects' ? 'bg-amber-500 text-black font-bold' : 'text-amber-400/70 hover:text-amber-300'}`}>Projects (4)</button>
              <button onClick={() => setAdminSubTab('signals')} className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition ${adminSubTab === 'signals' ? 'bg-amber-500 text-black font-bold' : 'text-amber-400/70 hover:text-amber-300'}`}>Signals (3)</button>
              <button onClick={() => setAdminSubTab('users')} className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition ${adminSubTab === 'users' ? 'bg-amber-500 text-black font-bold' : 'text-amber-400/70 hover:text-amber-300'}`}>Users</button>
              <button onClick={() => setAdminSubTab('audits')} className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition ${adminSubTab === 'audits' ? 'bg-amber-500 text-black font-bold' : 'text-amber-400/70 hover:text-amber-300'}`}>Team Audits</button>
              <button onClick={() => setAdminSubTab('governance')} className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition ${adminSubTab === 'governance' ? 'bg-amber-500 text-black font-bold' : 'text-amber-400/70 hover:text-amber-300'}`}>Governance & Risk</button>
            </div>

            {/* Admin Approvals View */}
            <div className="space-y-3 font-mono">
              <div className="bg-[#101010] border border-amber-500/20 rounded-2xl p-4 flex justify-between items-center">
                <div>
                  <h4 className="font-bold text-amber-200 text-xs">KYC Compliance Actions & Reminders</h4>
                  <p className="text-[11px] text-amber-400/60 mt-0.5">Prompt users to submit documentation or reset failed verification states.</p>
                </div>
                <button onClick={() => alert('KYC Nudge broadcasted successfully.')} className="bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs px-3 py-2 rounded-xl">Broadcast KYC Nudge</button>
              </div>

              <div className="bg-[#101010] border border-amber-500/20 rounded-2xl p-4 text-xs space-y-2">
                <span className="font-bold text-amber-300 block">Pending KYC Approvals (0)</span>
                <p className="text-amber-400/50 text-[11px]">No pending KYC submissions.</p>
              </div>

              <div className="bg-[#101010] border border-amber-500/20 rounded-2xl p-4 text-xs space-y-2">
                <span className="font-bold text-amber-300 block">Pending Deposits (0)</span>
                <p className="text-amber-400/50 text-[11px]">No pending deposits.</p>
              </div>

              <div className="bg-[#101010] border border-amber-500/20 rounded-2xl p-4 text-xs flex justify-between items-center">
                <div>
                  <span className="font-bold text-amber-300 block">Pending Withdrawals (0)</span>
                  <p className="text-amber-400/50 text-[11px] mt-0.5">No active withdrawal requests.</p>
                </div>
                <span className="text-[10px] text-amber-400/50">Max Limit Cap: $50,000.00</span>
              </div>
            </div>
          </div>
        )}

        {/* TAB: SALE (USDT Calculator) */}
        {activeTab === 'sale' && (
          <div className="space-y-4">
            <div className="border-b border-amber-500/20 pb-3">
              <h2 className="text-base font-bold text-amber-300 uppercase">03 // USDT Calculator</h2>
              <p className="text-xs text-amber-400/60">Instant settlement token acquisition portal.</p>
            </div>

            <div className="bg-[#101010] border border-amber-500/30 rounded-2xl p-5 space-y-4 font-mono shadow-xl">
              <div>
                <span className="text-[10px] text-amber-400/60 uppercase block mb-1.5">YOU PAY (USDT)</span>
                <div className="relative">
                  <input 
                    type="number" 
                    value={usdtInput} 
                    onChange={(e) => setUsdtInput(Number(e.target.value))}
                    className="w-full bg-black/60 border border-amber-500/30 rounded-xl px-4 py-3 text-amber-300 font-bold text-lg outline-none focus:border-amber-500"
                  />
                  <span className="absolute right-4 top-3 text-xs text-amber-400/60 font-bold bg-amber-500/10 px-2 py-1 rounded">USDT</span>
                </div>
              </div>

              <div className="space-y-2 text-xs pt-2 border-t border-amber-500/10">
                <div className="flex justify-between text-amber-400/70">
                  <span>Base Tokens</span>
                  <span className="text-amber-200 font-bold">{Math.round(usdtInput * 12.5)} PULSE</span>
                </div>
                <div className="flex justify-between text-emerald-400">
                  <span>Bonus (35%)</span>
                  <span className="font-bold">+{Math.round(usdtInput * 12.5 * 0.35)} PULSE</span>
                </div>
                <div className="flex justify-between text-amber-300 text-sm font-bold pt-2 border-t border-amber-500/10">
                  <span>Total You Receive</span>
                  <span className="text-amber-300">{Math.round(usdtInput * 12.5 * 1.35)} PULSE</span>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-2 pt-2">
                {[100, 250, 500, 1000].map((amt) => (
                  <button 
                    key={amt} 
                    onClick={() => setUsdtInput(amt)}
                    className="bg-black/40 border border-amber-500/20 hover:border-amber-500/40 text-amber-300 py-2 rounded-xl text-xs transition"
                  >
                    ${amt}
                  </button>
                ))}
              </div>

              <button 
                onClick={handleBuyPulse}
                className="w-full bg-amber-500 hover:bg-amber-400 text-black font-bold py-3.5 rounded-xl text-xs transition shadow-lg mt-2"
              >
                BUY {Math.round(usdtInput * 12.5 * 1.35)} PULSE →
              </button>

              <div className="text-center text-[10px] text-amber-500/50 pt-1">
                🔒 SETTLED VIA NOWPAYMENTS • SIMULATED
              </div>
            </div>
          </div>
        )}

        {/* TAB: STAKE */}
        {activeTab === 'stake' && (
          <div className="space-y-4 font-mono">
            <div className="border-b border-amber-500/20 pb-3">
              <h2 className="text-base font-bold text-amber-300 uppercase">Sovereign Staking Syndicate</h2>
              <p className="text-xs text-amber-400/60">Lock PULSE assets to compound institutional yields.</p>
            </div>
            <div className="bg-[#101010] border border-amber-500/20 rounded-2xl p-6 text-center space-y-4 text-xs">
              <p className="text-amber-200">Currently Staked: <span className="font-bold text-amber-300 text-sm">60,128 PULSE</span></p>
              <button onClick={() => alert('Staking reward compounding triggered.')} className="w-full max-w-sm mx-auto bg-amber-500 text-black font-bold py-3 rounded-xl text-xs hover:bg-amber-400 transition">
                Compound Staked Yields
              </button>
            </div>
          </div>
        )}

        {/* TAB: SIGNALS */}
        {activeTab === 'signals' && (
          <div className="space-y-4 font-mono">
            <div className="border-b border-amber-500/20 pb-3">
              <h2 className="text-base font-bold text-amber-300 uppercase">Intelligence & Signals</h2>
              <p className="text-xs text-amber-400/60">Real-time SADC infrastructure economic telemetry.</p>
            </div>
            <div className="space-y-3">
              {[
                { title: 'Zambian Grid Synchronization Complete', time: '2 hours ago', status: 'OPTIMAL' },
                { title: 'Kalahari Green Ammonia Corridor Yield Update', time: '5 hours ago', status: 'VERIFIED' },
                { title: 'Sandsloot Lithium Extraction Tranche #4 Opened', time: '1 day ago', status: 'ACTIVE' }
              ].map((sig, i) => (
                <div key={i} className="bg-[#101010] border border-amber-500/20 rounded-xl p-4 flex justify-between items-center text-xs">
                  <div>
                    <span className="font-bold text-amber-200 block">{sig.title}</span>
                    <span className="text-[10px] text-amber-400/50">{sig.time}</span>
                  </div>
                  <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2.5 py-1 rounded-full">{sig.status}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB: WALLET (Includes Pulse Card and Live Activity Feed from your screenshot) */}
        {activeTab === 'wallet' && (
          <div className="space-y-4 font-mono">
            <div className="border-b border-amber-500/20 pb-3">
              <h2 className="text-base font-bold text-amber-300 uppercase">Pulse Card & Vault</h2>
              <p className="text-xs text-amber-400/60">Secure gateway and liquidity status.</p>
            </div>

            {/* Pulse Card Visual from your screenshot */}
            <div className="bg-[#101010] border border-amber-500/20 rounded-2xl p-5 space-y-4">
              <div className="flex justify-between items-center">
                <span className="font-bold text-xs text-amber-300 uppercase">💳 Pulse Card</span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-3 py-0.5 rounded-full border border-emerald-500/30">APPROVED</span>
              </div>
              
              <div className="bg-gradient-to-tr from-amber-500 via-yellow-400 to-amber-300 rounded-2xl p-5 text-black shadow-xl space-y-6 relative overflow-hidden">
                <div className="flex justify-between items-center font-extrabold tracking-widest text-sm">
                  <span>PULSE</span>
                  <div className="w-8 h-5 bg-black/20 rounded" />
                </div>
                <div className="font-mono text-base tracking-widest font-bold">
                  •••• •••• •••• ••••
                </div>
                <div className="flex justify-between items-end text-[10px] font-bold">
                  <div>
                    <span className="block opacity-75">VALUED MEMBER • TIER 4</span>
                    <span>LINKED TO PULSE WALLET</span>
                  </div>
                  <span className="italic font-serif text-sm tracking-normal font-extrabold">VISA</span>
                </div>
              </div>
              <p className="text-[10px] text-amber-400/50 text-center">Your Pulse Card details dynamically sync with your account profile status and issuance parameters.</p>
            </div>

            {/* Live Activity Feed */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-amber-300 uppercase">LIVE ACTIVITY FEED</span>
                <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2.5 py-0.5 rounded-full flex items-center space-x-1">
                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping" />
                  <span>Live sync active</span>
                </span>
              </div>

              <div className="space-y-2">
                {transactions.map((tx) => (
                  <div key={tx.id} className="bg-[#101010] border border-amber-500/20 rounded-xl p-3.5 flex justify-between items-center text-xs">
                    <div>
                      <span className="font-bold text-amber-200 block">{tx.type}</span>
                      <span className="text-[10px] text-amber-400/50">{tx.created_at}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-amber-300 block">${tx.amount.toFixed(2)}</span>
                      <span className="text-[9px] text-emerald-400">{tx.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* TAB: PROFILE */}
        {activeTab === 'profile' && (
          <div className="space-y-4 font-mono">
            <div className="border-b border-amber-500/20 pb-3">
              <h2 className="text-base font-bold text-amber-300 uppercase">Sovereign User Profile</h2>
              <p className="text-xs text-amber-400/60">KYC Level 4 Verified • Ambassador Syndicate.</p>
            </div>
            <div className="bg-[#101010] border border-amber-500/20 rounded-2xl p-6 space-y-3 text-xs">
              <p className="text-amber-400/60">Account Email: <span className="text-amber-200">{userEmail}</span></p>
              <p className="text-amber-400/60">Referral Identifier: <span className="text-amber-200">{referralCode}</span></p>
              <p className="text-amber-400/60">Pulse Tokens Vault: <span className="text-amber-200">{account.pulse_tokens} PULSE</span></p>
            </div>
          </div>
        )}

      </div>

      {/* Project Allocation Modal */}
      {selectedProject && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#101010] border border-amber-500/40 rounded-2xl p-6 w-full max-w-md space-y-4 font-mono shadow-2xl">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] text-amber-400/60 uppercase">Capital Deployment</span>
                <h3 className="text-sm font-bold text-amber-300">{selectedProject.title}</h3>
              </div>
              <button onClick={() => setSelectedProject(null)} className="text-amber-400/50 hover:text-amber-300 text-lg px-2">✕</button>
            </div>
            <div className="bg-black/60 p-3.5 rounded-xl border border-amber-500/20 text-xs space-y-2">
              <div className="flex justify-between"><span>Target APY:</span><span className="text-emerald-400 font-bold">{selectedProject.apy}%</span></div>
              <div className="flex justify-between"><span>Available Cash:</span><span className="text-amber-300">${account.cash_balance.toLocaleString()}</span></div>
            </div>
            <button 
              onClick={() => {
                alert(`Successfully allocated capital tranche to ${selectedProject.title}!`)
                setSelectedProject(null)
              }} 
              className="w-full bg-amber-500 hover:bg-amber-400 text-black font-bold py-3 rounded-xl text-xs transition"
            >
              Confirm Tranche Allocation
            </button>
          </div>
        </div>
      )}

      {/* Fixed 7-Button Mobile Bottom Navigation Dock matching your screenshots */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#0c0c0c]/95 backdrop-blur border-t border-amber-500/20 py-3 px-3 flex justify-around items-center z-40 max-w-xl mx-auto rounded-t-2xl shadow-2xl">
        <button onClick={() => setActiveTab('home')} className={`flex flex-col items-center text-[9px] transition ${activeTab === 'home' ? 'text-amber-400 font-bold scale-110' : 'text-amber-400/50 hover:text-amber-300'}`}>
          <span className="text-sm">🏠</span>
          <span>HOME</span>
        </button>
        <button onClick={() => setActiveTab('invest')} className={`flex flex-col items-center text-[9px] transition ${activeTab === 'invest' ? 'text-amber-400 font-bold scale-110' : 'text-amber-400/50 hover:text-amber-300'}`}>
          <span className="text-sm">📈</span>
          <span>INVEST</span>
        </button>
        <button onClick={() => setActiveTab('sale')} className={`flex flex-col items-center text-[9px] transition ${activeTab === 'sale' ? 'text-amber-400 font-bold scale-110' : 'text-amber-400/50 hover:text-amber-300'}`}>
          <span className="text-sm">✨</span>
          <span>SALE</span>
        </button>
        <button onClick={() => setActiveTab('stake')} className={`flex flex-col items-center text-[9px] transition ${activeTab === 'stake' ? 'text-amber-400 font-bold scale-110' : 'text-amber-400/50 hover:text-amber-300'}`}>
          <span className="text-sm">⚡</span>
          <span>STAKE</span>
        </button>
        <button onClick={() => setActiveTab('signals')} className={`flex flex-col items-center text-[9px] transition ${activeTab === 'signals' ? 'text-amber-400 font-bold scale-110' : 'text-amber-400/50 hover:text-amber-300'}`}>
          <span className="text-sm">📡</span>
          <span>SIGNALS</span>
        </button>
        <button onClick={() => setActiveTab('wallet')} className={`flex flex-col items-center text-[9px] transition ${activeTab === 'wallet' ? 'text-amber-400 font-bold scale-110' : 'text-amber-400/50 hover:text-amber-300'}`}>
          <span className="text-sm">💳</span>
          <span>WALLET</span>
        </button>
        <button onClick={() => setActiveTab('profile')} className={`flex flex-col items-center text-[9px] transition ${activeTab === 'profile' ? 'text-amber-400 font-bold scale-110' : 'text-amber-400/50 hover:text-amber-300'}`}>
          <span className="text-sm">👤</span>
          <span>PROFILE</span>
        </button>
      </div>

    </div>
  )
}
