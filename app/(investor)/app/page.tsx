'use client'

import React, { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'

// Initialize Supabase Client safely
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

export default function UltimateDashboard() {
  const [activeTab, setActiveTab] = useState<'home' | 'invest' | 'wallet' | 'profile'>('home')
  const [isAdmin, setIsAdmin] = useState(true) // Switchable for testing admin vs user view
  const [balance, setBalance] = useState(12500.00)
  const [amountInput, setAmountInput] = useState('')
  
  const [transactions, setTransactions] = useState<Transaction[]>([
    { id: '1', user_email: 'client@pulse.sadr', type: 'Deposit', amount: 100.00, status: 'completed', created_at: '2026-09-09' },
    { id: '2', user_email: 'client@pulse.sadr', type: 'Withdrawal', amount: 50.00, status: 'completed', created_at: '2026-09-09' }
  ])
  
  const [pendingApprovals, setPendingApprovals] = useState<Transaction[]>([
    { id: 'p1', user_email: 'investor@sadr.org', type: 'Deposit', amount: 5000.00, status: 'pending', created_at: '2026-09-09' },
    { id: 'p2', user_email: 'partner@sadr.org', type: 'Withdrawal', amount: 1200.00, status: 'pending', created_at: '2026-09-09' }
  ])

  // Projects list with enhanced 4D cover assets
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
      title: 'Zambian Copperbelt Smelting & Refining Grid',
      category: 'Zambia • Infrastructure',
      apy: 21.0,
      raised: 620000,
      goal: 1000000,
      cover_url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80',
      status: 'Active'
    }
  ])

  // User active investments for closing & transfer capability
  const [myInvestments, setMyInvestments] = useState<UserInvestment[]>([
    { id: 'inv-1', projectId: 'sandsloot', name: 'Sandsloot Lithium Hub', staked: 2500, returns: 312.50 }
  ])

  // Handle Deposit / Withdrawal creation (Submits to Pending State)
  const handleFinancialAction = async (type: 'Deposit' | 'Withdrawal') => {
    const val = parseFloat(amountInput)
    if (isNaN(val) || val <= 0) {
      alert('Enter a valid monetary amount.')
      return
    }

    if (type === 'Withdrawal' && val > balance) {
      alert('Insufficient available liquidity for this withdrawal request.')
      return
    }

    const newTx: Transaction = {
      id: Math.random().toString(36).substring(2, 9),
      user_email: 'current-user@pulse.sadr',
      type: type,
      amount: val,
      status: 'pending',
      created_at: new Date().toISOString().split('T')[0]
    }

    // Optional Supabase persistence if table exists
    try {
      await supabase.from('transactions').insert([
        { type, amount: val, status: 'pending', user_email: newTx.user_email }
      ])
    } catch (err) {
      console.warn('Supabase offline or table missing, running local state fallback.')
    }

    setPendingApprovals([newTx, ...pendingApprovals])
    setAmountInput('')
    alert(`${type} request submitted successfully. Status is marked as PENDING and requires administrative compliance approval.`)
  }

  // Admin approval handler
  const approveTransaction = async (id: string) => {
    const tx = pendingApprovals.find(t => t.id === id)
    if (!tx) return

    setPendingApprovals(pendingApprovals.filter(t => t.id !== id))
    setTransactions([{ ...tx, status: 'completed' }, ...transactions])

    if (tx.type === 'Deposit') {
      setBalance(prev => prev + tx.amount)
    } else if (tx.type === 'Withdrawal') {
      setBalance(prev => prev - tx.amount)
    }

    try {
      await supabase.from('transactions').update({ status: 'completed' }).eq('id', id)
    } catch (err) {
      console.warn('Supabase update skipped (local fallback active).')
    }
  }

  // Close project & transfer funds back to wallet
  const handleCloseProject = (invId: string, stakedAmount: number, returns: number) => {
    const totalPayout = stakedAmount + returns
    setBalance(prev => prev + totalPayout)
    setMyInvestments(myInvestments.filter(i => i.id !== invId))
    alert(`Project successfully closed. Total liquidity of $${totalPayout.toFixed(2)} transferred back to your Pulse Wallet.`)
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-amber-100 font-sans pb-24">
      {/* Top Header & Institutional Navigation */}
      <header className="border-b border-amber-500/20 bg-[#121212]/80 backdrop-blur sticky top-0 z-50 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-amber-600 to-yellow-300 flex items-center justify-center font-bold text-black">
            P
          </div>
          <span className="text-xl font-extrabold tracking-widest text-amber-400">PULSE // SADC</span>
        </div>
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => setIsAdmin(!isAdmin)}
            className="text-xs px-3 py-1.5 rounded bg-amber-500/10 border border-amber-500/30 text-amber-300 hover:bg-amber-500/20 transition"
          >
            Role: {isAdmin ? 'Admin Portal' : 'Client Mode'}
          </button>
          <div className="text-right">
            <p className="text-xs text-amber-400/60">Available Liquidity</p>
            <p className="font-mono font-bold text-amber-300">${balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-5xl mx-auto px-4 pt-6 space-y-8">
        
        {/* VIEW: ADMIN APPROVALS */}
        {isAdmin && (
          <div className="bg-amber-950/20 border border-amber-500/30 rounded-2xl p-6 shadow-xl space-y-6">
            <div className="flex justify-between items-center border-b border-amber-500/20 pb-4">
              <div>
                <h2 className="text-lg font-bold text-amber-300">Admin Clearance & Approvals</h2>
                <p className="text-xs text-amber-400/60">Review and authorize pending user capital injections and withdrawals.</p>
              </div>
              <span className="px-2.5 py-1 rounded-full text-xs bg-amber-500/20 text-amber-300 font-mono">
                {pendingApprovals.length} Pending Actions
              </span>
            </div>

            {pendingApprovals.length === 0 ? (
              <p className="text-sm text-amber-400/40 italic text-center py-6">No pending deposits or withdrawals requiring clearance.</p>
            ) : (
              <div className="space-y-3">
                {pendingApprovals.map(tx => (
                  <div key={tx.id} className="flex items-center justify-between bg-black/40 border border-amber-500/20 p-4 rounded-xl">
                    <div>
                      <span className="text-xs px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono uppercase">{tx.type}</span>
                      <p className="font-bold text-amber-100 mt-1">${tx.amount.toFixed(2)}</p>
                      <p className="text-xs text-amber-400/50">User: {tx.user_email} • {tx.created_at}</p>
                    </div>
                    <div>
                      <button 
                        onClick={() => approveTransaction(tx.id)}
                        className="px-4 py-2 bg-amber-500 text-black font-bold text-xs rounded-lg hover:bg-amber-400 transition"
                      >
                        Approve & Sync Ledger
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB SWITCHER */}
        <div className="flex space-x-2 border-b border-amber-500/20 pb-2">
          {(['home', 'invest', 'wallet', 'profile'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold capitalize transition ${
                activeTab === tab ? 'bg-amber-500 text-black' : 'text-amber-400/60 hover:text-amber-300 hover:bg-amber-500/10'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* SECTION: HOME & REGIONAL OPPORTUNITIES */}
        {activeTab === 'home' && (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h1 className="text-2xl font-extrabold text-amber-300 tracking-tight">REGIONAL OPPORTUNITIES PIPELINE</h1>
              <p className="text-xs text-amber-400/60">Live Ledger Synced • SADC Sovereign Infrastructure Mandate</p>
            </div>

            {/* Enhanced 4D Cover Photos Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {projects.map((proj) => (
                <div key={proj.id} className="bg-[#141414] border border-amber-500/30 rounded-2xl overflow-hidden shadow-2xl hover:border-amber-500/60 transition group">
                  <div className="relative h-48 w-full overflow-hidden">
                    <img 
                      src={proj.cover_url} 
                      alt={proj.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                    />
                    <div className="absolute top-3 right-3 bg-black/70 backdrop-blur border border-amber-500/40 px-3 py-1 rounded-full text-xs font-mono text-amber-300">
                      {proj.apy}% APY
                    </div>
                  </div>
                  <div className="p-5 space-y-4">
                    <div>
                      <p className="text-xs text-amber-400/60 uppercase tracking-widest">{proj.category}</p>
                      <h3 className="font-bold text-amber-100 text-base mt-1">{proj.title}</h3>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs text-amber-400/80 font-mono">
                        <span>Funded Progress</span>
                        <span>${proj.raised.toLocaleString()} / ${proj.goal.toLocaleString()}</span>
                      </div>
                      <div className="w-full bg-black h-2 rounded-full overflow-hidden border border-amber-500/20">
                        <div className="bg-amber-500 h-full rounded-full" style={{ width: `${(proj.raised / proj.goal) * 100}%` }} />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Institutional Quick Hubs & Reference Code Section */}
            <div className="bg-[#121212] border border-amber-500/30 rounded-2xl p-6 space-y-4">
              <h3 className="text-sm font-bold text-amber-300 uppercase tracking-wider">Institutional Quick Hubs</h3>
              <p className="text-xs text-amber-400/60">Your secure cryptographic reference code identifier linked to current regional clearing channels.</p>
              <div className="bg-black/60 border border-amber-500/20 p-4 rounded-xl flex items-center justify-between font-mono text-xs">
                <span className="text-amber-400/50">REF-SADC-9921-X7</span>
                <span className="text-emerald-400 font-bold">● Active Clearance Verified</span>
              </div>
            </div>

            {/* Professional Regulatory & Risk Disclosure Box */}
            <div className="bg-[#121212] border border-amber-500/20 rounded-2xl p-6 text-xs text-amber-400/70 space-y-3">
              <div className="flex items-center space-x-2 text-amber-300 font-bold">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
                <span>SADC Institutional Compliance & Risk Notice</span>
              </div>
              <p>
                Capital allocations directed toward Southern African Development Community (SADC) infrastructure pipelines are governed under rigorous institutional clearing standards. Projected yields and APY baselines represent modeled targets and remain subject to sovereign macroeconomic clearing protocols and performance guarantees.
              </p>
              <div className="flex justify-between text-[10px] text-amber-500/60 pt-2 border-t border-amber-500/10 font-mono">
                <span>Protocol Version: 2.4.0-SADC</span>
                <span>Encrypted 256-bit SSL Clearing</span>
              </div>
            </div>
          </div>
        )}

        {/* TAB: INVESTMENTS / PORTFOLIO CLOSE CAPABILITY */}
        {activeTab === 'invest' && (
          <div className="space-y-6">
            <h2 className="text-lg font-bold text-amber-300">Active Portfolio Allocations & Closure Hub</h2>
            <p className="text-xs text-amber-400/60">Manage your active stakes. You retain full capability to close projects and instantly transfer funds back to your wallet.</p>

            {myInvestments.length === 0 ? (
              <p className="text-sm text-amber-400/50 italic py-8 text-center">No active project stakes currently open in portfolio.</p>
            ) : (
              <div className="space-y-4">
                {myInvestments.map(inv => (
                  <div key={inv.id} className="bg-[#121212] border border-amber-500/30 rounded-xl p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                      <h4 className="font-bold text-amber-100">{inv.name}</h4>
                      <p className="text-xs text-amber-400/60 mt-1">Staked Capital: <span className="text-amber-300 font-mono">${inv.staked.toFixed(2)}</span> • Accrued Returns: <span className="text-emerald-400 font-mono">+${inv.returns.toFixed(2)}</span></p>
                    </div>
                    <button 
                      onClick={() => handleCloseProject(inv.id, inv.staked, inv.returns)}
                      className="px-4 py-2 bg-red-500/20 border border-red-500/40 text-red-300 text-xs font-bold rounded-lg hover:bg-red-500/30 transition"
                    >
                      Close Project & Transfer Funds
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB: WALLET & FINANCIAL OPERATIONS */}
        {activeTab === 'wallet' && (
          <div className="space-y-6">
            <h2 className="text-lg font-bold text-amber-300">Pulse Liquidity & Transaction Gateway</h2>
            
            {/* Action Input Card */}
            <div className="bg-[#121212] border border-amber-500/30 rounded-2xl p-6 space-y-4">
              <h3 className="text-sm font-bold text-amber-200">Initiate Capital Transfer</h3>
              <div className="flex gap-4">
                <input 
                  type="number"
                  placeholder="Enter amount (USD / USDT)"
                  value={amountInput}
                  onChange={(e) => setAmountInput(e.target.value)}
                  className="flex-1 bg-black border border-amber-500/30 rounded-xl px-4 py-2.5 text-amber-100 text-sm focus:outline-none focus:border-amber-500"
                />
                <button 
                  onClick={() => handleFinancialAction('Deposit')}
                  className="px-5 py-2.5 bg-amber-500 text-black font-bold text-xs rounded-xl hover:bg-amber-400 transition"
                >
                  Deposit
                </button>
                <button 
                  onClick={() => handleFinancialAction('Withdrawal')}
                  className="px-5 py-5 bg-amber-950/60 border border-amber-500/40 text-amber-300 font-bold text-xs rounded-xl hover:bg-amber-900/60 transition"
                >
                  Withdraw
                </button>
              </div>
              <p className="text-[11px] text-amber-400/50">Note: All transactions route through pending administrative compliance queues before final ledger settlement.</p>
            </div>

            {/* Live Activity Feed */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-amber-300">Live Activity Feed</h3>
              <div className="space-y-2">
                {transactions.map(tx => (
                  <div key={tx.id} className="flex justify-between items-center bg-[#121212] border border-amber-500/20 p-4 rounded-xl text-sm">
                    <div>
                      <p className="font-bold text-amber-100">{tx.type}</p>
                      <p className="text-xs text-amber-400/50">{tx.created_at}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-mono font-bold text-amber-300">${tx.amount.toFixed(2)}</p>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 uppercase font-mono">
                        {tx.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'profile' && (
          <div className="bg-[#121212] border border-amber-500/30 rounded-2xl p-6 space-y-4">
            <h2 className="text-lg font-bold text-amber-300">Institutional Profile & Tier Status</h2>
            <p className="text-xs text-amber-400/60">KYC Clearance Level 4 Verified • Fully synced with SADC banking rails.</p>
          </div>
        )}

      </main>
    </div>
  )
}
