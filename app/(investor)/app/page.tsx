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
  const [selectedProject, setSelectedProject] = useState<any | null>(null)

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
    <div className="min-h-screen bg-[#060606] text-amber-100 font-sans flex flex-col items-center pb-32 selection:bg-amber-500 selection:text-black">
      
      {/* Fully Responsive Shell: Optimized for Mobile apps AND expands cleanly into a professional desktop dashboard */}
      <div className="w-full max-w-[480px] md:max-w-3xl lg:max-w-5xl mx-auto px-4 py-4 space-y-4">
        
        {/* Top Header Bar */}
        <div className="flex justify-between items-center bg-[#101010] border border-amber-500/20 px-4 py-3 rounded-2xl shadow-md transition-all hover:border-amber-500/40">
          <div className="flex items-center space-x-2.5">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-amber-600 to-yellow-400 flex items-center justify-center font-bold text-black text-xs animate-pulse">P</div>
            <span className="text-xs md:text-sm font-extrabold tracking-wider text-amber-400">Pulse SADC Terminal</span>
          </div>
          <span className="hidden sm:inline text-[10px] text-amber-400/60 uppercase tracking-widest font-mono">SOVEREIGN CLEARING NODE</span>
          <div className="font-mono text-xs md:text-sm font-bold text-amber-300 bg-black/40 px-3 py-1 rounded-xl border border-amber-500/20">${account.cash_balance.toLocaleString()}</div>
        </div>

        {/* TAB: HOME */}
        {activeTab === 'home' && (
          <div className="space-y-4 animate-fadeIn duration-500">
            
            {/* Net Liquidity Card */}
            <div className="bg-gradient-to-b from-[#141414] to-[#0c0c0c] border border-amber-500/30 rounded-2xl p-5 md:p-6 text-center space-y-3 shadow-2xl relative overflow-hidden transition-all hover:shadow-[0_0_30px_rgba(245,158,11,0.15)]">
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

            {/* Unique Referral Code Box */}
            <div className="bg-[#101010] border border-amber-500/20 rounded-2xl p-4 flex items-center justify-between text-xs transition hover:border-amber-500/40">
              <div>
                <span className="text-[10px] text-amber-400/50 uppercase tracking-widest block font-mono">Your Unique Referral Code</span>
                <span className="font-mono font-bold text-amber-200 text-sm mt-0.5 block">{referralCode}</span>
              </div>
              <button 
                onClick={() => { navigator.clipboard.writeText(referralCode); alert('Referral code copied to clipboard!'); }}
                className="px-4 py-2 bg-amber-500/10 border border-amber-500/30 text-amber-300 rounded-xl hover:bg-amber-500/20 transition font-mono text-xs"
              >
                Copy Code
              </button>
            </div>

            {/* REGIONAL OPPORTUNITIES PIPELINE (Grid view on desktop, stacked on mobile) */}
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
                      className="bg-[#101010] border border-amber-500/30 rounded-2xl overflow-hidden shadow-lg hover:border-amber-500/60 transition-all duration-300 group cursor-pointer flex flex-col justify-between"
                    >
                      <div>
                        <div className="relative h-36 w-full overflow-hidden">
                          <img src={p.cover} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                          <div className="absolute top-2.5 right-2.5 bg-black/80 backdrop-blur border border-amber-500/40 px-3 py-1 rounded-full text-xs font-mono text-amber-300 shadow">
                            {p.apy}% APY
                          </div>
                        </div>
                        <div className="p-4 space-y-3">
                          <div>
                            <p className="text-[10px] text-amber-400/60 uppercase tracking-widest">{p.cat}</p>
                            <h3 className="font-bold text-amber-100 text-sm mt-0.5">{p.title}</h3>
                          </div>
                          <div className="space-y-1.5">
                            <div className="flex justify-between text-xs text-amber-400/80 font-mono">
                              <span>Funded Progress ({percent}%)</span>
                              <span>${p.raised.toLocaleString()} / ${p.goal.toLocaleString()}</span>
                            </div>
                            <div className="w-full bg-black h-2 rounded-full overflow-hidden border border-amber-500/20">
                              <div className="bg-gradient-to-r from-amber-600 to-yellow-400 h-full rounded-full transition-all duration-500" style={{ width: `${percent}%` }} />
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="px-4 pb-4 pt-1">
                        <span className="w-full block text-center bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-xl py-2 text-xs font-mono transition">
                          Allocate Tranche →
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Institutional Compliance & Risk Disclaimer */}
            <div className="bg-[#101010] border border-amber-500/20 rounded-2xl p-5 text-xs text-amber-400/70 space-y-2.5 leading-relaxed">
              <div className="flex items-center space-x-2 text-amber-300 font-bold uppercase tracking-wider">
                <span>Institutional Regulatory Disclaimer</span>
              </div>
              <p>
                Capital allocations directed toward SADC infrastructure pipelines operate under sovereign clearing mandates. Projected yields and APY baselines represent algorithmic targets governed by macroeconomic stability protocols.
              </p>
              <div className="flex justify-between text-[10px] text-amber-500/50 pt-2 border-t border-amber-500/10 font-mono">
                <span>Protocol: SADC-256-SSL</span>
                <span>Session: {userEmail}</span>
              </div>
            </div>

          </div>
        )}

        {/* TAB: INVEST */}
        {activeTab === 'invest' && (
          <div className="space-y-4 animate-fadeIn duration-300">
            <div className="border-b border-amber-500/20 pb-3">
              <h2 className="text-base font-bold text-amber-300 uppercase">Regional Investment Deployment</h2>
              <p className="text-xs text-amber-400/60">Choose your capital allocation tranche from the pipeline.</p>
            </div>
            <div className="bg-[#101010] border border-amber-500/20 rounded-2xl p-6 text-center space-y-4 font-mono text-xs">
              <p className="text-amber-200">Available Cash Liquidity: <span className="font-bold text-amber-300 text-sm">${account.cash_balance.toLocaleString()}</span></p>
              <button onClick={() => setActiveTab('home')} className="w-full max-w-sm mx-auto bg-amber-500 text-black font-bold py-3 rounded-xl text-xs hover:bg-amber-400 transition">
                Return to Pipeline & Select Project
              </button>
            </div>
          </div>
        )}

        {/* TAB: WALLET */}
        {activeTab === 'wallet' && (
          <div className="space-y-4 animate-fadeIn duration-300">
            <div className="border-b border-amber-500/20 pb-3">
              <h2 className="text-base font-bold text-amber-300 uppercase">Pulse Wallet & Vault</h2>
              <p className="text-xs text-amber-400/60">Secure gateway and liquidity status.</p>
            </div>
            <div className="bg-[#101010] border border-amber-500/20 rounded-2xl p-6 space-y-3 font-mono text-sm">
              <div className="flex justify-between border-b border-amber-500/10 pb-3">
                <span className="text-amber-400/60">Cash Balance:</span>
                <span className="text-amber-200 font-bold">${account.cash_balance.toLocaleString()}</span>
              </div>
              <div className="flex justify-between border-b border-amber-500/10 pb-3">
                <span className="text-amber-400/60">Invested Balance:</span>
                <span className="text-amber-200 font-bold">${account.invested_balance.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-amber-400/60">Staked Balance:</span>
                <span className="text-amber-200 font-bold">${account.staked_balance.toLocaleString()}</span>
              </div>
            </div>
          </div>
        )}

        {/* TAB: PROFILE */}
        {activeTab === 'profile' && (
          <div className="space-y-4 animate-fadeIn duration-300">
            <div className="border-b border-amber-500/20 pb-3">
              <h2 className="text-base font-bold text-amber-300 uppercase">Sovereign User Profile</h2>
              <p className="text-xs text-amber-400/60">KYC Level 4 Verified • Ambassador Syndicate.</p>
            </div>
            <div className="bg-[#101010] border border-amber-500/20 rounded-2xl p-6 space-y-3 text-xs font-mono">
              <p className="text-amber-400/60">Account Email: <span className="text-amber-200">{userEmail}</span></p>
              <p className="text-amber-400/60">Referral Identifier: <span className="text-amber-200">{referralCode}</span></p>
            </div>
          </div>
        )}

      </div>

      {/* Interactive Capital Allocation Modal */}
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

      {/* Fixed Mobile Bottom Navigation Dock */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#0c0c0c]/95 backdrop-blur border-t border-amber-500/20 py-3 px-6 flex justify-around items-center z-40 max-w-md md:max-w-xl mx-auto rounded-t-2xl shadow-2xl">
        <button onClick={() => setActiveTab('home')} className={`flex flex-col items-center text-[10px] transition ${activeTab === 'home' ? 'text-amber-400 font-bold scale-110' : 'text-amber-400/50 hover:text-amber-300'}`}>
          <span className="text-base">🏠</span>
          <span>Home</span>
        </button>
        <button onClick={() => setActiveTab('invest')} className={`flex flex-col items-center text-[10px] transition ${activeTab === 'invest' ? 'text-amber-400 font-bold scale-110' : 'text-amber-400/50 hover:text-amber-300'}`}>
          <span className="text-base">📈</span>
          <span>Invest</span>
        </button>
        <button onClick={() => setActiveTab('wallet')} className={`flex flex-col items-center text-[10px] transition ${activeTab === 'wallet' ? 'text-amber-400 font-bold scale-110' : 'text-amber-400/50 hover:text-amber-300'}`}>
          <span className="text-base">💳</span>
          <span>Wallet</span>
        </button>
        <button onClick={() => setActiveTab('profile')} className={`flex flex-col items-center text-[10px] transition ${activeTab === 'profile' ? 'text-amber-400 font-bold scale-110' : 'text-amber-400/50 hover:text-amber-300'}`}>
          <span className="text-base">👤</span>
          <span>Profile</span>
        </button>
      </div>

    </div>
  )
}
