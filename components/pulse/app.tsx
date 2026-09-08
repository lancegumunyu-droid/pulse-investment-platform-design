'use client'

import React from 'react'
import type { Snapshot } from '@/app/actions/types'
import { PulseProvider, usePulse } from './store'
import { WalletView } from './views/wallet'

interface PulseAppProps {
  initialSnapshot: Snapshot | null
}

// Inline InvestView component integrated cleanly with your store
function InvestView() {
  const { state, api, toast } = usePulse()
  const [loadingId, setLoadingId] = React.useState<string | null>(null)

  const handleInvest = async (projectId: string, amount: number) => {
    setLoadingId(projectId)
    const res = await api.invest(amount, projectId)
    setLoadingId(null)
    if (res.ok) {
      toast({ title: 'Success', description: 'Investment successfully completed!', variant: 'success' })
    } else {
      toast({ title: 'Investment Failed', description: res.error || 'Unknown error', variant: 'error' })
    }
  }

  const cash = state?.cash || 0

  return (
    <div className="space-y-6">
      <div className="border-b border-zinc-800 pb-4">
        <h2 className="text-xl font-black text-white">Investment Tiers & Opportunities</h2>
        <p className="text-xs text-zinc-400">Deploy your available cash into high-yield vetted pools.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6 space-y-4">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 uppercase font-bold">
                Tier 1 Pool
              </span>
              <h3 className="text-lg font-bold text-white mt-2">Venture Growth Fund Alpha</h3>
            </div>
            <span className="font-mono text-emerald-400 font-bold text-sm">14.5% APY</span>
          </div>
          <p className="text-xs text-zinc-400">Targeted allocation toward high-growth decentralized assets and tokenized debt instruments.</p>
          <div className="flex justify-between items-center pt-2 border-t border-zinc-800/80 text-xs">
            <span className="text-zinc-500">Min Investment: $500</span>
            <button
              disabled={loadingId === 'proj-1' || cash < 500}
              onClick={() => handleInvest('proj-1', 500)}
              className="rounded-lg bg-amber-500 px-4 py-2 font-bold text-black hover:bg-amber-400 disabled:opacity-50 transition"
            >
              {loadingId === 'proj-1' ? 'Processing...' : 'Invest $500'}
            </button>
          </div>
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6 space-y-4">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 uppercase font-bold">
                Tier 2 Pool
              </span>
              <h3 className="text-lg font-bold text-white mt-2">Infrastructure & Node Pool</h3>
            </div>
            <span className="font-mono text-cyan-400 font-bold text-sm">18.2% APY</span>
          </div>
          <p className="text-xs text-zinc-400">Institutional validation node infrastructure backed by multi-sig escrow collateral.</p>
          <div className="flex justify-between items-center pt-2 border-t border-zinc-800/80 text-xs">
            <span className="text-zinc-500">Min Investment: $1,000</span>
            <button
              disabled={loadingId === 'proj-2' || cash < 1000}
              onClick={() => handleInvest('proj-2', 1000)}
              className="rounded-lg bg-cyan-500 px-4 py-2 font-bold text-black hover:bg-cyan-400 disabled:opacity-50 transition"
            >
              {loadingId === 'proj-2' ? 'Processing...' : 'Invest $1,000'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function DashboardContent() {
  const { state, view, setView, totalInvested, currentTier, portfolioValue, signOut } = usePulse()

  const safeState = state || { fullName: '', email: '', cash: 0, holdings: [], txns: [] }
  const safeTier = currentTier || { name: 'Standard' }

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6 p-6 text-zinc-100 antialiased pb-32">
      {/* Top Header & Navigation Bar */}
      <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-white">Pulse Investment Dashboard</h1>
          <p className="text-xs text-zinc-400">Welcome, {safeState.fullName || safeState.email || 'Investor'}</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 font-mono text-xs font-bold text-amber-400">
            {safeTier.name} Tier
          </span>
          <button
            onClick={() => signOut()}
            className="rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-1.5 text-xs font-medium text-zinc-300 hover:bg-zinc-700 transition"
          >
            Sign Out
          </button>
        </div>
      </div>

      {/* View Switcher Tabs */}
      <div className="flex gap-2 border-b border-zinc-800/60 pb-3">
        <button
          onClick={() => setView('dashboard')}
          className={`rounded-lg px-4 py-2 text-xs font-mono font-bold transition ${
            view === 'dashboard' ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20' : 'bg-zinc-900 text-zinc-400 hover:text-white'
          }`}
        >
          Overview
        </button>
        <button
          onClick={() => setView('invest')}
          className={`rounded-lg px-4 py-2 text-xs font-mono font-bold transition ${
            view === 'invest' ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20' : 'bg-zinc-900 text-zinc-400 hover:text-white'
          }`}
        >
          Invest Tiers
        </button>
        <button
          onClick={() => setView('wallet')}
          className={`rounded-lg px-4 py-2 text-xs font-mono font-bold transition ${
            view === 'wallet' ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20' : 'bg-zinc-900 text-zinc-400 hover:text-white'
          }`}
        >
          Wallet
        </button>
      </div>

      {/* Dynamic View Switcher */}
      {view === 'invest' ? (
        <InvestView />
      ) : view === 'wallet' ? (
        <WalletView />
      ) : (
        <div className="space-y-6">
          {/* Portfolio Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-5 shadow-lg">
              <p className="font-mono text-xs uppercase tracking-wider text-zinc-400">Total Portfolio Value</p>
              <p className="mt-2 font-mono text-3xl font-black text-white">${(portfolioValue || 0).toLocaleString()}</p>
            </div>
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-5 shadow-lg">
              <p className="font-mono text-xs uppercase tracking-wider text-zinc-400">Liquid Cash</p>
              <p className="mt-2 font-mono text-3xl font-black text-emerald-400">${(safeState.cash || 0).toLocaleString()}</p>
            </div>
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-5 shadow-lg">
              <p className="font-mono text-xs uppercase tracking-wider text-zinc-400">Total Invested</p>
              <p className="mt-2 font-mono text-3xl font-black text-amber-400">${(totalInvested || 0).toLocaleString()}</p>
            </div>
          </div>

          {/* Holdings & Transactions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-6 space-y-4">
              <h3 className="font-bold text-lg text-white">Active Holdings</h3>
              {(!safeState.holdings || safeState.holdings.length === 0) ? (
                <p className="text-sm text-zinc-500">No active investment holdings found.</p>
              ) : (
                safeState.holdings.map((h: any) => (
                  <div key={h.id || Math.random()} className="flex justify-between items-center border-b border-zinc-800 pb-3 text-sm">
                    <div>
                      <p className="font-medium text-white">{h.projectName || 'Project Holding'}</p>
                      <p className="text-xs text-zinc-500">Active Investment</p>
                    </div>
                    <p className="font-mono font-bold text-amber-400">${(h.amount || 0).toLocaleString()}</p>
                  </div>
                ))
              )}
            </div>

            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-6 space-y-4">
              <h3 className="font-bold text-lg text-white">Transaction History</h3>
              {(!safeState.txns || safeState.txns.length === 0) ? (
                <p className="text-sm text-zinc-500">No transactions recorded yet.</p>
              ) : (
                safeState.txns.map((tx: any) => (
                  <div key={tx.id || Math.random()} className="flex justify-between items-center border-b border-zinc-800 pb-3 text-sm">
                    <div>
                      <p className="font-medium text-white">{tx.label || tx.type || 'Transaction'}</p>
                      <p className="text-xs text-zinc-500">{tx.date ? new Date(tx.date).toLocaleDateString() : 'Recent'}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-mono font-bold text-white">${(tx.amount || 0).toLocaleString()}</p>
                      <span className="text-[10px] uppercase font-mono text-emerald-400">{tx.status || 'completed'}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export function PulseApp({ initialSnapshot }: PulseAppProps) {
  if (!initialSnapshot) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black text-white p-6">
        <div className="text-center space-y-3">
          <h1 className="text-xl font-bold text-red-400">Authentication Session Required</h1>
          <p className="text-sm text-zinc-400">Please sign in to view your investment portal.</p>
        </div>
      </div>
    )
  }

  return (
    <PulseProvider initialSnapshot={initialSnapshot}>
      <DashboardContent />
    </PulseProvider>
  )
}
