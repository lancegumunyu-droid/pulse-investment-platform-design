'use client'

import React, { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
const supabase = createClient(supabaseUrl, supabaseAnonKey)

interface Project {
  id: string
  title: string
  category: string
  apy: number
  raised: number
  goal: number
  cover_url: string
  status: string
}

interface Transaction {
  id: string
  user_email: string
  type: string
  amount: number
  status: 'pending' | 'completed' | 'rejected'
  created_at: string
}

interface UserInvestment {
  id: string
  projectId: string
  name: string
  staked: number
  returns: number
}

export default function UltimateSADCTerminal() {
  const [activeTab, setActiveTab] = useState<'home' | 'portfolio' | 'wallet' | 'profile'>('home')
  const [balance, setBalance] = useState(6183.49)
  const [userEmail, setUserEmail] = useState('investor@sadr.org')
  const [referralCode, setReferralCode] = useState('SADC-REF-9921-X7')
  
  // Projects Pipeline with Exact Percentages, Metrics, and High-Res Assets
  const [projects, setProjects] = useState<Project[]>([
    {
      id: 'sandsloot',
      title: 'Sandsloot Lithium & Tantalum Extraction Hub',
      category: 'South Africa • Critical Minerals',
      apy: 22.5,
      raised: 385000,
      goal: 500000,
      cover_url: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=1200&q=80',
      status: 'Active'
    },
    {
      id: 'kalahari',
      title: 'Kalahari Green Hydrogen & Ammonia Corridor',
      category: 'Namibia • Clean Energy',
      apy: 19.8,
      raised: 940000,
      goal: 1200000,
      cover_url: 'https://images.unsplash.com/photo-1466611653911-95081537e5b7?auto=format&fit=crop&w=1200&q=80',
      status: 'Active'
    },
    {
      id: 'copperbelt',
      title: 'Zambian Copperbelt High-Voltage Grid Modernization',
      category: 'Zambia • Infrastructure',
      apy: 21.0,
      raised: 620000,
      goal: 1000000,
      cover_url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80',
      status: 'Active'
    },
    {
      id: 'zambezi',
      title: 'Zambezi Hydro-Electric Generation & Transmission Grid',
      category: 'Zimbabwe / Zambia • Clean Energy',
      apy: 18.5,
      raised: 1450000,
      goal: 2000000,
      cover_url: 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?auto=format&fit=crop&w=1200&q=80',
      status: 'Active'
    }
  ])

  // Portfolio Folder State
  const [myInvestments, setMyInvestments] = useState<UserInvestment[]>([
    { id: 'inv-1', projectId: 'sandsloot', name: 'Sandsloot Lithium Hub Staked', staked: 2500, returns: 312.50 }
  ])

  // Transactions State
  const [transactions, setTransactions] = useState<Transaction[]>([
    { id: 't1', user_email: 'investor@sadr.org', type: 'Deposit', amount: 5000.00, status: 'completed', created_at: '2026-09-09' }
  ])

  // Fetch Supabase Profile, Referral Code & Projects on Load
  useEffect(() => {
    async function syncSupabaseData() {
      try {
        const { data: projData } = await supabase.from('projects').select('*')
        if (projData && projData.length > 0) {
          setProjects(projData)
        }

        const { data: { user } } = await supabase.auth.getUser()
        if (user && user.email) {
          setUserEmail(user.email)
          // Generate deterministic unique referral code per user email
          const hash = user.email.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
          setReferralCode(`SADC-${user.email.substring(0, 3).toUpperCase()}-${hash}-X7`)
        }
      } catch (err) {
        console.warn('Supabase sync skipped, utilizing localized state fallback.')
      }
    }
    syncSupabaseData()
  }, [])

  // Close project & transfer funds back to wallet folder
  const handleCloseProject = (invId: string, stakedAmount: number, returns: number) => {
    const totalPayout = stakedAmount + returns
    setBalance(prev => prev + totalPayout)
    setMyInvestments(myInvestments.filter(i => i.id !== invId))
    alert(`Project successfully closed. Total liquidity of $${totalPayout.toFixed(2)} transferred back to your Pulse Wallet.`)
  }

  return (
    <div className="min-h-screen bg-[#060606] text-amber-100 font-sans flex flex-col items-center pb-28 selection:bg-amber-500 selection:text-black">
      
      {/* Responsive Shell Frame */}
      <div className="w-full max-w-xl mx-auto px-4 py-4 space-y-6">
        
        {/* Top Header Bar */}
        <div className="flex justify-between items-center bg-[#121212]/90 backdrop-blur border border-amber-500/20 px-4 py-3 rounded-2xl shadow-xl">
          <div className="flex items-center space-x-2.5">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-amber-600 to-yellow-300 flex items-center justify-center font-extrabold text-black text-xs shadow-md">P</div>
            <span className="text-xs font-black tracking-widest text-amber-400">PULSE // SADC</span>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-amber-400/50 block font-mono">LIQUIDITY</span>
            <span className="font-mono text-xs font-bold text-amber-300">${balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
          </div>
        </div>

        {/* TAB: HOME */}
        {activeTab === 'home' && (
          <div className="space-y-6 animate-fadeIn">
            
            {/* Net Liquidity Card */}
            <div className="bg-gradient-to-b from-[#141414] to-[#0a0a0a] border border-amber-500/30 rounded-3xl p-6 text-center space-y-4 shadow-2xl relative overflow-hidden">
              <div className="absolute top-3 right-4 text-[10px] bg-amber-500/20 border border-amber-500/30 text-amber-300 px-2.5 py-1 rounded-full font-mono">Ambassador VIP</div>
              <p className="text-[11px] text-amber-400/60 uppercase tracking-widest font-semibold">Net Liquidity Value</p>
              <h1 className="text-4xl font-black text-amber-300 font-mono tracking-tight">${balance.toLocaleString()}</h1>
              <p className="text-xs text-emerald-400 font-mono">Sovereign Yield Index: +20.2% APY</p>

              <div className="grid grid-cols-3 gap-2 pt-3 border-t border-amber-500/10 text-center font-mono">
                <div className="bg-black/50 p-2.5 rounded-xl border border-amber-500/10">
                  <span className="text-[10px] text-amber-400/50 block">DAP / P</span>
                  <span className="text-xs text-amber-200 font-bold">14.8%</span>
                </div>
                <div className="bg-black/50 p-2.5 rounded-xl border border-amber-500/10">
                  <span className="text-[10px] text-amber-400/50 block">PORTFOLIO</span>
                  <span className="text-xs text-amber-200 font-bold">$7,450</span>
                </div>
                <div className="bg-black/50 p-2.5 rounded-xl border border-amber-500/10">
                  <span className="text-[10px] text-amber-400/50 block">ROI ASSETS</span>
                  <span className="text-xs text-amber-200 font-bold">$60,128</span>
                </div>
              </div>
            </div>

            {/* Unique Referral Code Box (Wired to User Account) */}
            <div className="bg-[#121212] border border-amber-500/20 rounded-2xl p-4 flex items-center justify-between text-xs">
              <div>
                <span className="text-[10px] text-amber-400/50 uppercase block">Your Unique Referral Identifier</span>
                <span className="font-mono font-bold text-amber-200 mt-0.5 block">{referralCode}</span>
              </div>
              <button 
                onClick={() => { navigator.clipboard.writeText(referralCode); alert('Referral code copied to clipboard!'); }}
                className="px-3 py-1.5 bg-amber-500/10 border border-amber-500/30 text-amber-300 rounded-xl hover:bg-amber-500/20 transition font-mono text-[10px]"
              >
                Copy Link
              </button>
            </div>

            {/* Regional Opportunities Pipeline */}
            <div className="space-y-4">
              <div className="flex justify-between items-center text-xs px-1">
                <span className="font-bold text-amber-300 uppercase tracking-widest">Regional Opportunities Pipeline</span>
                <span className="text-[10px] text-amber-400/50 font-mono">Live Ledger Synced</span>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {projects.map((proj) => (
                  <div key={proj.id} className="bg-[#121212] border border-amber-500/30 rounded-2xl overflow-hidden shadow-xl hover:border-amber-500/60 transition group">
                    <div className="relative h-44 w-full overflow-hidden">
                      <img 
                        src={proj.cover_url} 
                        alt={proj.title} 
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                      />
                      <div className="absolute top-3 right-3 bg-black/80 backdrop-blur border border-amber-500/40 px-3 py-1 rounded-full text-xs font-mono text-amber-300 shadow-md">
                        {proj.apy}% APY
                      </div>
                    </div>
                    <div className="p-4 space-y-3">
                      <div>
                        <p className="text-[10px] text-amber-400/60 uppercase tracking-widest">{proj.category}</p>
                        <h3 className="font-bold text-amber-100 text-sm mt-0.5">{proj.title}</h3>
                      </div>
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-[11px] text-amber-400/80 font-mono">
                          <span>Funded Progress</span>
                          <span>${proj.raised.toLocaleString()} / ${proj.goal.toLocaleString()}</span>
                        </div>
                        <div className="w-full bg-black h-2 rounded-full overflow-hidden border border-amber-500/20">
                          <div className="bg-gradient-to-r from-amber-600 to-yellow-400 h-full rounded-full transition-all duration-500" style={{ width: `${(proj.raised / proj.goal) * 100}%` }} />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Official SADC Institutional Compliance & Risk Disclaimer */}
            <div className="bg-[#121212] border border-amber-500/20 rounded-2xl p-5 text-[11px] text-amber-400/70 space-y-2.5 leading-relaxed">
              <div className="flex items-center space-x-2 text-amber-300 font-bold uppercase tracking-wider">
                <svg className="w-4 h-4 text-amber-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
                <span>Institutional Regulatory Disclaimer</span>
              </div>
              <p>
                Capital allocations directed toward Southern African Development Community (SADC) infrastructure pipelines operate under rigorous sovereign clearing mandates. Projected yields and APY baselines represent algorithmic targets governed by macroeconomic stability protocols and are subject to regional audit clearance.
              </p>
              <div className="flex justify-between text-[10px] text-amber-500/50 pt-2 border-t border-amber-500/10 font-mono">
                <span>Protocol: SADC-256-SSL</span>
                <span>Session: {userEmail}</span>
              </div>
            </div>

          </div>
        )}

        {/* TAB: PORTFOLIO FOLDER */}
        {activeTab === 'portfolio' && (
          <div className="space-y-5 animate-fadeIn">
            <div className="border-b border-amber-500/20 pb-3">
              <h2 className="text-base font-bold text-amber-300">Active Portfolio & Closure Hub</h2>
              <p className="text-xs text-amber-400/60">Manage your active stakes and transfer liquidity back to wallet instantly.</p>
            </div>

            {myInvestments.length === 0 ? (
              <p className="text-xs text-amber-400/40 italic text-center py-10">No active project allocations currently open.</p>
            ) : (
              <div className="space-y-3">
                {myInvestments.map(inv => (
                  <div key={inv.id} className="bg-[#121212] border border-amber-500/30 rounded-2xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <div>
                      <h4 className="font-bold text-amber-100 text-sm">{inv.name}</h4>
                      <p className="text-xs text-amber-400/60 mt-0.5">Staked: <span className="text-amber-300 font-mono">${inv.staked.toFixed(2)}</span> • Returns: <span className="text-emerald-400 font-mono">+${inv.returns.toFixed(2)}</span></p>
                    </div>
                    <button 
                      onClick={() => handleCloseProject(inv.id, inv.staked, inv.returns)}
                      className="px-3 py-1.5 bg-red-500/20 border border-red-500/40 text-red-300 text-[11px] font-bold rounded-xl hover:bg-red-500/30 transition w-full sm:w-auto"
                    >
                      Close & Transfer Funds
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB: WALLET */}
        {activeTab === 'wallet' && (
          <div className="space-y-5 animate-fadeIn">
            <div className="border-b border-amber-500/20 pb-3">
              <h2 className="text-base font-bold text-amber-300">Liquidity & Transaction Gateway</h2>
              <p className="text-xs text-amber-400/60">Secure deposit and withdrawal clearance pipeline.</p>
            </div>
            <div className="bg-[#121212] border border-amber-500/30 rounded-2xl p-5 space-y-3">
              <span className="text-xs font-bold text-amber-200 block">Available Balance: ${balance.toLocaleString()}</span>
              <p className="text-xs text-amber-400/60">Transactions route through administrative compliance queues.</p>
            </div>
          </div>
        )}

        {/* TAB: PROFILE */}
        {activeTab === 'profile' && (
          <div className="space-y-5 animate-fadeIn">
            <div className="border-b border-amber-500/20 pb-3">
              <h2 className="text-base font-bold text-amber-300">Sovereign User Profile</h2>
              <p className="text-xs text-amber-400/60">KYC Clearance Level 4 Verified • Ambassador Syndicate.</p>
            </div>
            <div className="bg-[#121212] border border-amber-500/30 rounded-2xl p-5 space-y-2 text-xs font-mono">
              <p className="text-amber-400/60">Account: <span className="text-amber-200">{userEmail}</span></p>
              <p className="text-amber-400/60">Referral ID: <span className="text-amber-200">{referralCode}</span></p>
            </div>
          </div>
        )}

      </div>

      {/* Fixed Mobile Bottom Navigation Dock */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#0c0c0c]/95 backdrop-blur border-t border-amber-500/20 py-2.5 px-6 flex justify-around items-center z-50 max-w-xl mx-auto rounded-t-3xl shadow-2xl">
        <button onClick={() => setActiveTab('home')} className={`flex flex-col items-center text-[10px] transition ${activeTab === 'home' ? 'text-amber-400 font-bold scale-105' : 'text-amber-400/40 hover:text-amber-300'}`}>
          <span className="text-base">🏠</span>
          <span>Home</span>
        </button>
        <button onClick={() => setActiveTab('portfolio')} className={`flex flex-col items-center text-[10px] transition ${activeTab === 'portfolio' ? 'text-amber-400 font-bold scale-105' : 'text-amber-400/40 hover:text-amber-300'}`}>
          <span className="text-base">📂</span>
          <span>Portfolio</span>
        </button>
        <button onClick={() => setActiveTab('wallet')} className={`flex flex-col items-center text-[10px] transition ${activeTab === 'wallet' ? 'text-amber-400 font-bold scale-105' : 'text-amber-400/40 hover:text-amber-300'}`}>
          <span className="text-base">💳</span>
          <span>Wallet</span>
        </button>
        <button onClick={() => setActiveTab('profile')} className={`flex flex-col items-center text-[10px] transition ${activeTab === 'profile' ? 'text-amber-400 font-bold scale-105' : 'text-amber-400/40 hover:text-amber-300'}`}>
          <span className="text-base">👤</span>
          <span>Profile</span>
        </button>
      </div>

    </div>
  )
}
