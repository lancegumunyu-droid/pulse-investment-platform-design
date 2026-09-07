'use client'

import React, { useEffect, useState } from 'react'
import { supabase } from '@/utils/supabase'

interface WalletData {
  portfolio_balance: number
  cash_balance: number
  liquid_balance: number
  staked_balance: number
  withdrawal_address: string | null
}

interface Activity {
  id: string
  type: string
  amount: number
  status: string
  created_at: string
}

export default function PulseWallet() {
  const [wallet, setWallet] = useState<WalletData | null>(null)
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)
  const [addressInput, setAddressInput] = useState('')

  useEffect(() => {
    async function fetchWalletData() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setLoading(false)
        return
      }

      // Fetch wallet balances
      const { data: walletData } = await supabase
        .from('user_wallets')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (walletData) setWallet(walletData)

      // Fetch live activity feed
      const { data: activityData } = await supabase
        .from('wallet_activities')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5)

      if (activityData) setActivities(activityData)

      setLoading(false)
    }

    fetchWalletData()
  }, [])

  const handleConnectWallet = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user || !addressInput) return

    const { error } = await supabase
      .from('user_wallets')
      .update({ withdrawal_address: addressInput })
      .eq('user_id', user.id)

    if (!error) {
      setWallet(prev => prev ? { ...prev, withdrawal_address: addressInput } : null)
      setAddressInput('')
      alert('Withdrawal wallet connected successfully!')
    }
  }

  if (loading) {
    return <div className="p-6 text-center text-amber-400">Loading wallet ledger...</div>
  }

  return (
    <div className="w-full max-w-md mx-auto p-4 bg-black text-white rounded-xl space-y-6 font-sans">
      
      {/* Portfolio Header */}
      <div className="flex justify-between items-center bg-zinc-900 p-4 rounded-xl border border-zinc-800">
        <div>
          <span className="text-xs text-zinc-400 tracking-wider">PORTFOLIO</span>
          <h2 className="text-2xl font-bold text-amber-400">
            ${wallet?.portfolio_balance?.toLocaleString('en-US', { minimumFractionDigits: 2 }) ?? '0.00'}
          </h2>
        </div>
      </div>

      {/* Cash Wallet Section */}
      <div className="bg-zinc-900 p-5 rounded-2xl border border-zinc-800 space-y-4">
        <div>
          <span className="text-xs text-amber-500 font-semibold tracking-wider">CASH WALLET</span>
          <h3 className="text-3xl font-ext500 mt-1">
            ${wallet?.cash_balance?.toLocaleString('en-US', { minimumFractionDigits: 2 }) ?? '0.00'}
          </h3>
          <p className="text-xs text-zinc-400 mt-1">Available to invest, withdraw, or send</p>
        </div>
        <div className="grid grid-cols-3 gap-2 pt-2">
          <button className="bg-amber-400 text-black font-semibold py-2.5 rounded-xl text-sm hover:bg-amber-300 transition">Deposit</button>
          <button className="bg-zinc-800 text-white font-semibold py-2.5 rounded-xl text-sm hover:bg-zinc-700 transition">Withdraw</button>
          <button className="bg-zinc-800 text-white font-semibold py-2.5 rounded-xl text-sm hover:bg-zinc-700 transition">Send</button>
        </div>
      </div>

      {/* Withdrawal Wallet Connection */}
      <div className="bg-zinc-900 p-4 rounded-xl border border-zinc-800 space-y-3">
        <p className="text-xs text-zinc-400">
          {wallet?.withdrawal_address 
            ? `Connected: ${wallet.withdrawal_address.slice(0, 6)}...${wallet.withdrawal_address.slice(-4)}`
            : "No withdrawal wallet connected. Add address for USDT (TRC-20) or BTC."}
        </p>
        {!wallet?.withdrawal_address && (
          <div className="space-y-2">
            <input 
              type="text" 
              placeholder="Paste your receiving address" 
              value={addressInput}
              onChange={(e) => setAddressInput(e.target.value)}
              className="w-full bg-black border border-zinc-700 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-amber-400"
            />
            <button 
              onClick={handleConnectWallet}
              className="w-full bg-zinc-800 hover:bg-zinc-700 text-amber-400 font-medium py-2 rounded-lg text-xs transition border border-zinc-700"
            >
              Connect wallet
            </button>
          </div>
        )}
      </div>

      {/* Pulse Wallet Grid */}
      <div className="bg-zinc-900 p-4 rounded-xl border border-zinc-800 grid grid-cols-2 gap-3">
        <div className="bg-black p-3 rounded-lg border border-zinc-800">
          <span className="text-[10px] text-amber-400 block font-bold">PULSE WALLET</span>
          <span className="text-xs text-zinc-400 block mt-1">LIQUID - USABLE NOW</span>
          <span className="text-lg font-bold mt-1 block">{wallet?.liquid_balance ?? 0}</span>
        </div>
        <div className="bg-black p-3 rounded-lg border border-zinc-800">
          <span className="text-[10px] text-transparent block font-bold">&nbsp;</span>
          <span className="text-xs text-zinc-400 block mt-1">STAKED - 24.8% APY</span>
          <span className="text-lg font-bold mt-1 block">{wallet?.staked_balance ?? 0}</span>
        </div>
      </div>

      {/* Live Activity Feed */}
      <div className="bg-zinc-900 p-4 rounded-xl border border-zinc-800 space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-xs font-bold text-zinc-300">LIVE ACTIVITY FEED</span>
          <span className="text-[10px] text-emerald-400 bg-emerald-950/50 px-2 py-0.5 rounded border border-emerald-800">LIVE SYNC ACTIVE</span>
        </div>
        {activities.length === 0 ? (
          <p className="text-xs text-zinc-500 py-2">No transaction activity recorded for this user account yet.</p>
        ) : (
          activities.map((act) => (
            <div key={act.id} className="flex justify-between text-xs py-1 border-b border-zinc-800">
              <span className="text-zinc-300">{act.type}</span>
              <span className="text-amber-400 font-mono">${act.amount}</span>
            </div>
          ))
        )}
      </div>

      {/* Risk Warning Disclaimer */}
      <div className="p-3 bg-zinc-950 rounded-lg border border-zinc-900 text-[10px] text-zinc-500 leading-relaxed">
        <strong className="text-zinc-400">Risk Warning:</strong> Trading stocks, options, futures, and forex carries a high level of risk and may not be suitable for all investors. Leverage can work against you as well as for you.
      </div>

    </div>
  )
            }
