'use client'

import React, { useState } from 'react'
import type { Snapshot } from '@/app/actions/types'
import { PulseContext, usePulseState } from '../store'
import { InvestView } from '@/components/views/invest-view' // Adjust path if your views folder differs, or embed your views directly here
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface PulseAppProps {
  initialSnapshot: Snapshot | null
}

export function PulseApp({ initialSnapshot }: PulseAppProps) {
  const pulseStore = usePulseState(initialSnapshot)
  const [activeTab, setActiveTab] = useState<'dashboard' | 'invest'>('dashboard')

  if (!initialSnapshot) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-white p-6">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold text-red-400">Authentication Required</h1>
          <p className="text-slate-400">Please sign in to access your Pulse dashboard.</p>
        </div>
      </div>
    )
  }

  return (
    <PulseContext.Provider value={pulseStore}>
      <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-10 space-y-8">
        {/* Navigation Switcher */}
        <div className="flex justify-between items-center border-b border-slate-800 pb-4">
          <h1 className="text-2xl font-extrabold tracking-tight">Pulse Investment Platform</h1>
          <div className="flex gap-2">
            <Button 
              variant={activeTab === 'dashboard' ? 'default' : 'outline'} 
              onClick={() => setActiveTab('dashboard')}
              className="text-xs"
            >
              Dashboard
            </Button>
            <Button 
              variant={activeTab === 'invest' ? 'default' : 'outline'} 
              onClick={() => setActiveTab('invest')}
              className="text-xs"
            >
              Invest Tiers
            </Button>
          </div>
        </div>

        {/* Dynamic View Rendering */}
        {activeTab === 'invest' ? (
          <InvestView />
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Card className="bg-slate-900 border-slate-800">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs font-medium uppercase tracking-wider text-slate-400">Liquid Cash</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-emerald-400">${Number(pulseStore.snapshot.cash).toLocaleString()}</div>
                </CardContent>
              </Card>

              <Card className="bg-slate-900 border-slate-800">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs font-medium uppercase tracking-wider text-slate-400">PULSE Tokens</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-cyan-400">{Number(pulseStore.snapshot.pulse).toLocaleString()} PULSE</div>
                </CardContent>
              </Card>

              <Card className="bg-slate-900 border-slate-800">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs font-medium uppercase tracking-wider text-slate-400">Staked Balance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-purple-400">{Number(pulseStore.snapshot.staked).toLocaleString()} PULSE</div>
                </CardContent>
              </Card>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
              <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
              <div className="space-y-3">
                {pulseStore.snapshot.txns.length === 0 ? (
                  <p className="text-sm text-slate-500">No transactions found.</p>
                ) : (
                  pulseStore.snapshot.txns.map((tx) => (
                    <div key={tx.id} className="flex justify-between items-center text-sm py-2 border-b border-slate-800/60 last:border-0">
                      <div>
                        <p className="font-medium text-slate-200">{tx.label}</p>
                        <p className="text-xs text-slate-500">{new Date(tx.date).toLocaleDateString()}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">${tx.amount.toLocaleString()}</p>
                        <span className="text-[10px] uppercase text-slate-400">{tx.status}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </PulseContext.Provider>
  )
}
