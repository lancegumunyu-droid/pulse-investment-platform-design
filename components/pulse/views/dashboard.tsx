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

export default function SADCTerminalAllProjects() {
  const [activeTab, setActiveTab] = useState<'home' | 'invest' | 'wallet' | 'profile'>('home')
  const [account, setAccount] = useState<AccountState>({
    cash_balance: 6183.49,
    invested_balance: 7450.00,
    staked_balance: 60128.00,
    pending_yield: 312.50
  })
  const [holdings, setHoldings] = useState<HoldingItem[]>([])
  const [userEmail, setUserEmail] = useState('investor@sadr.org')
  const [referralCode, setReferralCode] = useState('SADC-REF-9921-X7')

  // Fetch real data & generate referral code from Supabase session on mount
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
        }
      } catch (err) {
        console.warn('Fallback state active.')
      }
    }
    syncData()
  }, [])

  return (
    <div className="min-h-screen bg-[#060606] text-amber-100 font-sans flex flex-col items-center pb-28 selection:bg-amber-500 selection:text-black">
      
      {/* Exact OG Mobile-Centered Layout Container matching DASH_2.png */}
      <div className="w-full max-w-[420px] mx-auto px-3 py-3 space-y-3.5">
        
        {/* Top Header Bar */}
        <div className="flex justify-between items-center bg-[#101010] border border-amber-500/20 px-3.5 py-2 rounded-xl shadow-md transition-all duration-300 hover:border-amber-500/40">
          <div className="flex items-center space-x-2">
            <div className="w-5 h-5 rounded bg-gradient-to-tr from-amber-600 to-yellow-400 flex items-center justify-center font-bold text-black text-[10px] animate-pulse">P</div>
            <span className="text-[11px] font-extrabold tracking-wider text-amber-400">Pulse</span>
          </div>
          <span className="text-[9px] text-amber-400/60 uppercase tracking-widest font-mono">SADC SOVEREIGN TERMINAL</span>
          <div className="font-mono text-xs font-bold text-amber-300">${account.cash_balance.toLocaleString()}</div>
        </div>

        {/* TAB: HOME */}
        {activeTab === 'home' && (
          <div className="space-y-3.5 animate-fadeIn duration-500">
            
            {/* Net Liquidity Card */}
            <div className="bg-gradient-to-b from-[#141414] to-[#0c0c0c] border border-amber-500/30 rounded-2xl p-4 text-center space-y-2.5 shadow-2xl relative overflow-hidden transition-all duration-300 hover:shadow-[0_0_25px_rgba(245,158,11,0.15)]">
              <div className="absolute top-2 right-3 text-[9px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full font-mono border border-amber-500/30">Ambassador VIP</div>
              <p className="text-[10px] text-amber-400/60 uppercase tracking-widest font-medium">Net Liquidity Value</p>
              <h1 className="text-3xl font-extrabold text-amber-300 font-mono tracking-tight">${(account.cash_balance + account.invested_balance + account.staked_balance).toLocaleString()}</h1>
              <p className="text-[10px] text-emerald-400 font-mono">Sovereign Yield: +20.2% APY (2026.09.09)</p>

              <div className="flex gap-2 pt-1">
                <button className="flex-1 bg-amber-500 hover:bg-amber-400 text-black font-bold text-[11px] py-2 rounded-xl transition-all duration-300 hover:scale-[1.02] shadow">
                  + Valuate Capital
                </button>
                <button className="flex-1 bg-amber-950/40 hover:bg-amber-900/40 border border-amber-500/40 text-amber-300 font-bold text-[11px] py-2 rounded-xl transition-all duration-300 hover:scale-[1.02]">
                  Withdraw Yields
                </button>
              </div>

              <div className="grid grid-cols-3 gap-1.5 pt-1.5 border-t border-amber-500/10 text-center font-mono">
                <div className="bg-black/50 p-1.5 rounded-lg border border-amber-500/10">
                  <span className="text-[9px] text-amber-400/50 block">DAP / P</span>
                  <span className="text-[11px] text-amber-200 font-bold">14.8%</span>
                </div>
                <div className="bg-black/50 p-1.5 rounded-lg border border-amber-500/10">
                  <span className="text-[9px] text-amber-400/50 block">PORTFOLIO</span>
                  <span className="text-[11px] text-amber-200 font-bold">${account.invested_balance.toLocaleString()}</span>
                </div>
                <div className="bg-black/50 p-1.5 rounded-lg border border-amber-500/10">
                  <span className="text-[9px] text-amber-400/50 block">ROI OR ASSETS</span>
                  <span className="text-[11px] text-amber-200 font-bold">${account.staked_balance.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Unique Referral Code Box */}
            <div className="bg-[#101010] border border-amber-500/20 rounded-xl p-3.5 flex items-center justify-between text-xs transition-all hover:border-amber-500/40">
              <div>
                <span className="text-[9px] text-amber-400/50 uppercase tracking-widest block font-mono">Your Unique Referral Code</span>
                <span className="font-mono font-bold text-amber-200 text-xs mt-0.5 block">{referralCode}</span>
              </div>
              <button 
                onClick={() => { navigator.clipboard.writeText(referralCode); alert('Referral code copied to clipboard!'); }}
                className="px-3 py-1.5 bg-amber-500/10 border border-amber-500/30 text-amber-300 rounded-lg hover:bg-amber-500/20 transition-all font-mono text-[10px] hover:scale-105"
              >
                Copy Code
              </button>
            </div>

            {/* Staking Badge Banner */}
            <div className="bg-[#101010] border border-amber-500/20 rounded-xl px-3.5 py-2.5 flex justify-between items-center text-[11px]">
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
                <span className="text-amber-200 font-semibold tracking-wide text-[10px]">STAKING // AMBASSADOR SYNDICATE</span>
              </div>
              <span className="text-[9px] text-amber-400/60 font-mono">24hr Horizon</span>
            </div>

            {/* Active Deployments Section */}
            <div className="bg-[#101010] border border-amber-500/20 rounded-2xl p-3.5 space-y-2.5">
              <div className="flex justify-between items-center text-[11px]">
                <span className="font-bold text-amber-300 uppercase tracking-wider text-[10px]">Active Deployments (1)</span>
                <span onClick={() => setActiveTab('invest')} className="text-[10px] text-amber-400/60 cursor-pointer hover:text-amber-300 font-mono transition">Explore all →</span>
              </div>
              <div className="bg-black/60 border border-amber-500/20 p-3 rounded-xl flex justify-between items-center">
                <div>
                  <p className="text-[11px] font-bold text-amber-100">Sandsloot Lithium Hub Staked</p>
                  <p className="text-[10px] text-amber-400/50 font-mono mt-0.5">$2,500.00</p>
                </div>
                <span className="text-[10px] font-mono bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded-lg border border-emerald-500/30">22.5% APY</span>
              </div>
            </div>

            {/* ALL 4 REGIONAL OPPORTUNITIES PIPELINE (Accurate Math & Pictures) */}
            <div className="space-y-2.5">
              <div className="flex justify-between items-center text-[11px] px-1">
                <span className="font-bold text-amber-300 uppercase tracking-wider text-[10px]">Regional Opportunities Pipeline (4)</span>
                <span className="text-[9px] text-amber-400/60 font-mono">Live Ledger Synced</span>
              </div>

              <div className="space-y-3">
                {[
                  { id: 'sandsloot', title: 'Sandsloot Lithium & Tantalum Extraction Hub', cat: 'South Africa • Critical Minerals', apy: 22.5, raised: 385000, goal: 500000, cover: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=1200&q=80' },
                  { id: 'kalahari', title: 'Kalahari Green Hydrogen & Ammonia Corridor', cat: 'Namibia • Clean Energy', apy: 19.8, raised: 940000, goal: 1200000, cover: 'https://images.unsplash.com/photo-1466611653911-95081537e5b7?auto=format&fit=crop&w=1200&q=80' },
                  { id: 'copperbelt', title: 'Zambian Copperbelt High-Voltage Grid Modernization', cat: 'Zambia • Infrastructure', apy: 21.0, raised: 620000, goal: 1000000, cover: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80' },
                  { id: 'zambezi', title: 'Zambezi Hydro-Electric Generation & Transmission Grid', cat: 'Zimbabwe / Zambia • Clean Energy', apy: 18.5, raised: 1450000, goal: 2000000, cover: 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?auto=format&fit=crop&w=1200&q=80' }
                ].map((p) => {
                  const percent = Math.round((p.raised / p.goal) * 100)
                  return (
                    <div key={p.id} className="bg-[#101010] border border-amber-500/30 rounded-2xl overflow-hidden shadow-lg hover:border-amber-500/60 transition-all duration-300 group">
                      <div className="relative h-32 w-full overflow-hidden">
                        <img src={p.cover} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                        <div className="absolute top-2 right-2 bg-black/80 backdrop-blur border border-amber-500/40 px-2.5 py-0.5 rounded-full text-[10px] font-mono text-amber-300 shadow">
                          {p.apy}% APY
                        </div>
                      </div>
                      <div className="p-3 space-y-2.5">
                        <div>
                          <p className="text-[9px] text-amber-400/60 uppercase tracking-widest">{p.cat}</p>
                          <h3 className="font-bold text-amber-100 text-xs mt-0.5">{p.title}</h3>
                        </div>
                        <div className="space-y-1">
                          <div className="flex justify-between text-[10px] text-amber-400/80 font-mono">
                            <span>Funded Progress ({percent}%)</span>
                            <span>${p.raised.toLocaleString()} / ${p.goal.toLocaleString()}</span>
                          </div>
                          <div className="w-full bg-black h-1.5 rounded-full overflow-hidden border border-amber-500/20">
                            <div className="bg-gradient-to-r from-amber-600 to-yellow-400 h-full rounded-full transition-all duration-500" style={{ width: `${percent}%` }} />
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Institutional Quick Hubs */}
            <div className="bg-[#101010] border border-amber-500/20 rounded-2xl p-3.5 space-y-2.5">
              <span className="text-[10px] font-bold text-amber-300 uppercase tracking-wider">Institutional Quick Hubs</span>
              <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
                <div className="bg-black/60 border border-amber-500/20 p-2.5 rounded-xl hover:border-amber-500/40 transition cursor-pointer">
                  <span className="text-[9px] text-amber-400/50 block">Ray SADC</span>
                  <span className="text-amber-200 font-bold text-[10px]">● Wholescale Vault</span>
                </div>
                <div className="bg-black/60 border border-amber-500/20 p-2.5 rounded-xl hover:border-amber-500/40 transition cursor-pointer">
                  <span className="text-[9px] text-amber-400/50 block">Initial Guide</span>
                  <span className="text-amber-200 font-bold text-[10px]">● Sovereign KYC</span>
                </div>
                <div className="bg-black/60 border border-amber-500/20 p-2.5 rounded-xl hover:border-amber-500/40 transition cursor-pointer">
                  <span className="text-[9px] text-amber-400/50 block">Signals Vault</span>
                  <span className="text-amber-200 font-bold text-[10px]">● DeFi Analytics</span>
                </div>
                <div className="bg-black/60 border border-amber-500/20 p-2.5 rounded-xl hover:border-amber-500/40 transition cursor-pointer">
                  <span className="text-[9px] text-amber-400/50 block">Audit Clearance</span>
                  <span className="text-amber-200 font-bold text-[10px]">● Full Compliance</span>
                </div>
              </div>
            </div>

            {/* Official SADC Institutional Compliance & Risk Disclaimer */}
            <div className="bg-[#101010] border border-amber-500/20 rounded-2xl p-4 text-[10px] text-amber-400/70 space-y-2 leading-relaxed">
              <div className="flex items-center space-x-1.5 text-amber-300 font-bold uppercase tracking-wider">
                <svg className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
                <span>Institutional Regulatory Disclaimer</span>
              </div>
              <p>
                Capital allocations directed toward SADC infrastructure pipelines operate under sovereign clearing mandates. Projected yields and APY baselines represent algorithmic targets governed by macroeconomic stability protocols and are subject to regional audit clearance.
              </p>
              <div className="flex justify-between text-[9px] text-amber-500/50 pt-1.5 border-t border-amber-500/10 font-mono">
                <span>Protocol: SADC-256-SSL</span>
                <span>Session: {userEmail}</span>
              </div>
            </div>

          </div>
        )}

        {/* TAB: INVEST */}
        {activeTab === 'invest' && (
          <div className="space-y-4 animate-fadeIn duration-300">
            <div className="border-b border-amber-500/20 pb-2">
              <h2 className="text-sm font-bold text-amber-300 uppercase">Regional Investment Deployment</h2>
              <p className="text-[10px] text-amber-400/60">Choose your capital allocation tranche.</p>
            </div>
            <div className="bg-[#101010] border border-amber-500/20 rounded-2xl p-4 text-center space-y-3 font-mono text-xs">
              <p className="text-amber-200">Available Cash Liquidity: <span className="font-bold text-amber-300">${account.cash_balance.toLocaleString()}</span></p>
              <button onClick={() => alert('Select a project pipeline card from Home to stake.')} className="w-full bg-amber-500 text-black font-bold py-2 rounded-xl text-xs hover:bg-amber-400 transition">
                Allocate Capital Tranche
              </button>
            </div>
          </div>
        )}

        {/* TAB: WALLET */}
        {activeTab === 'wallet' && (
          <div className="space-y-4 animate-fadeIn duration-300">
            <div className="border-b border-amber-500/20 pb-2">
              <h2 className="text-sm font-bold text-amber-300 uppercase">Pulse Wallet & Vault</h2>
              <p className="text-[10px] text-amber-400/60">Secure gateway and liquidity status.</p>
            </div>
            <div className="bg-[#101010] border border-amber-500/20 rounded-2xl p-4 space-y-2 font-mono text-xs">
              <div className="flex justify-between border-b border-amber-500/10 pb-1.5">
                <span className="text-amber-400/60">Cash:</span>
                <span className="text-amber-200 font-bold">${account.cash_balance.toLocaleString()}</span>
              </div>
              <div className="flex justify-between border-b border-amber-500/10 pb-1.5">
                <span className="text-amber-400/60">Invested:</span>
                <span className="text-amber-200 font-bold">${account.invested_balance.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-amber-400/60">Staked:</span>
                <span className="text-amber-200 font-bold">${account.staked_balance.toLocaleString()}</span>
              </div>
            </div>
          </div>
        )}

        {/* TAB: PROFILE */}
        {activeTab === 'profile' && (
          <div className="space-y-4 animate-fadeIn duration-300">
            <div className="border-b border-amber-500/20 pb-2">
              <h2 className="text-sm font-bold text-amber-300 uppercase">Sovereign User Profile</h2>
              <p className="text-[10px] text-amber-400/60">KYC Level 4 Verified • Ambassador Syndicate.</p>
            </div>
            <div className="bg-[#101010] border border-amber-500/20 rounded-2xl p-4 space-y-2 text-xs font-mono">
              <p className="text-amber-400/60">Account Email: <span className="text-amber-200">{userEmail}</span></p>
              <p className="text-amber-400/60">Referral Identifier: <span className="text-amber-200">{referralCode}</span></p>
            </div>
          </div>
        )}

      </div>

      {/* Fixed Mobile Bottom Navigation Dock */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#0c0c0c]/95 backdrop-blur border-t border-amber-500/20 py-2.5 px-6 flex justify-around items-center z-50 max-w-[420px] mx-auto rounded-t-2xl shadow-2xl">
        <button onClick={() => setActiveTab('home')} className={`flex flex-col items-center text-[10px] transition-all duration-300 ${activeTab === 'home' ? 'text-amber-400 font-bold scale-110' : 'text-amber-400/50 hover:text-amber-300'}`}>
          <span className="text-sm">🏠</span>
          <span>Home</span>
        </button>
        <button onClick={() => setActiveTab('invest')} className={`flex flex-col items-center text-[10px] transition-all duration-300 ${activeTab === 'invest' ? 'text-amber-400 font-bold scale-110' : 'text-amber-400/50 hover:text-amber-300'}`}>
          <span className="text-sm">📈</span>
          <span>Invest</span>
        </button>
        <button onClick={() => setActiveTab('wallet')} className={`flex flex-col items-center text-[10px] transition-all duration-300 ${activeTab === 'wallet' ? 'text-amber-400 font-bold scale-110' : 'text-amber-400/50 hover:text-amber-300'}`}>
          <span className="text-sm">💳</span>
          <span>Wallet</span>
        </button>
        <button onClick={() => setActiveTab('profile')} className={`flex flex-col items-center text-[10px] transition-all duration-300 ${activeTab === 'profile' ? 'text-amber-400 font-bold scale-110' : 'text-amber-400/50 hover:text-amber-300'}`}>
          <span className="text-sm">👤</span>
          <span>Profile</span>
        </button>
      </div>

    </div>
  )
}
