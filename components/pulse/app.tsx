'use client'

import React from 'react'
import type { Snapshot } from '@/app/actions/types'
import { PulseProvider, usePulse } from './store'
import { InvestView } from './views/invest-view'

interface PulseAppProps {
  initialSnapshot: Snapshot | null
}

function DashboardContent() {
  const { state, view, setView, totalInvested, currentTier, portfolioValue, signOut } = usePulse()

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6 p-6 text-zinc-100 antialiased">
      {/* Top Header & Navigation Bar */}
      <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-white">Pulse Investment Dashboard</h1>
          <p className="text-xs text-zinc-400">Welcome, {state.fullName || state.email || 'Investor'}</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 font-mono text-xs font-bold text-amber-400">
            {currentTier.name} Tier
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
      </div>

      {/* Dynamic View Switcher */}
      {view === 'invest' ? (
        <InvestView />
      ) : (
        <div className="space-y-6">
          {/* Portfolio Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-5 shadow-lg">
              <p className="font-mono text-xs uppercase tracking-wider text-zinc-400">Total Portfolio Value</p>
              <p className="mt-2 font-mono text-3xl font-black text-white">${portfolioValue.toLocaleString()}</p>
            </div>
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-5 shadow-lg">
              <p className="font-mono text-xs uppercase tracking-wider text-zinc-400">Liquid Cash</p>
              <p className="mt-2 font-mono text-3xl font-black text-emerald-400">${state.cash.toLocaleString()}</p>
            </div>
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-5 shadow-lg">
              <p className="font-mono text-xs uppercase tracking-wider text-zinc-400">Total Invested</p>
              <p className="mt-2 font-mono text-3xl font-black text-amber-400">${totalInvested.toLocaleString()}</p>
            </div>
          </div>

          {/* Holdings & Transactions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-6 space-y-4">
              <h3 className="font-bold text-lg text-white">Active Holdings</h3>
              {state.holdings.length === 0 ? (
                <p className="text-sm text-zinc-500">No active investment holdings found.</p>
              ) : (
                state.holdings.map((h) => (
                  <div key={h.id} className="flex justify-between items-center border-b border-zinc-800 pb-3 text-sm">
                    <div>
                      <p className="font-medium text-white">Project Holding</p>
                      <p className="text-xs text-zinc-500">Active Investment</p>
                    </div>
                    <p className="font-mono font-bold text-amber-400">${h.amount.toLocaleString()}</p>
                  </div>
                ))
              )}
            </div>

            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-6 space-y-4">
              <h3 className="font-bold text-lg text-white">Transaction History</h3>
              {state.txns.length === 0 ? (
                <p className="text-sm text-zinc-500">No transactions recorded yet.</p>
              ) : (
                state.txns.map((tx) => (
                  <div key={tx.id} className="flex justify-between items-center border-b border-zinc-800 pb-3 text-sm">
                    <div>
                      <p className="font-medium text-white">{tx.label}</p>
                      <p className="text-xs text-zinc-500">{new Date(tx.date).toLocaleDateString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-mono font-bold text-white">${tx.amount.toLocaleString()}</p>
                      <span className="text-[10px] uppercase font-mono text-emerald-400">{tx.status}</span>
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
    <PulseProvider initial={initialSnapshot}>
      <DashboardContent />
    </PulseProvider>
  )
}
