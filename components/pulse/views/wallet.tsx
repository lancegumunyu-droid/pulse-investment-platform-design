'use client'

import React from 'react'
import {
  ArrowDownToLine,
  ArrowUpFromLine,
  Send as SendIcon,
  Link2,
  Zap,
  Folder,
  ShieldAlert,
  Loader2,
  CreditCard,
} from 'lucide-react'
import { money, usePulse } from '../store'

const STAKE_APY = 24.8 // TODO: pull from lib/pulse-data if a staking APY constant exists there

const CARD_STATUS_META: Record<string, { label: string; className: string }> = {
  none: { label: 'Not applied', className: 'border-zinc-700 bg-zinc-800/60 text-zinc-400' },
  waitlisted: { label: 'Waitlisted', className: 'border-amber-500/30 bg-amber-500/10 text-amber-400' },
  approved: { label: 'Approved', className: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400' },
  free_card_earned: { label: 'Free card earned', className: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400' },
}

const TXN_STATUS_META: Record<string, string> = {
  completed: 'text-emerald-400',
  pending: 'text-amber-400',
  processing: 'text-amber-400',
  failed: 'text-red-400',
  rejected: 'text-red-400',
}

export function WalletView() {
  const { state, api, toast, openModal, busy } = usePulse()
  const [addressDraft, setAddressDraft] = React.useState('')
  const [sellAmount, setSellAmount] = React.useState('')
  const [sellOpen, setSellOpen] = React.useState(false)

  const cardMeta = CARD_STATUS_META[state.cardStatus ?? 'none'] ?? CARD_STATUS_META.none
  const recentTxns = state.txns.slice(0, 6)

  async function handleConnectWallet() {
    if (!addressDraft.trim()) return
    const res = await api.connectWallet(addressDraft.trim())
    if (res.ok) {
      toast({ title: 'Wallet connected', variant: 'success' })
      setAddressDraft('')
    } else {
      toast({ title: 'Could not connect wallet', description: res.error, variant: 'error' })
    }
  }

  async function handleDisconnectWallet() {
    const res = await api.disconnectWallet()
    if (res.ok) toast({ title: 'Wallet disconnected', variant: 'success' })
    else toast({ title: 'Could not disconnect', description: res.error, variant: 'error' })
  }

  async function handleSell() {
    const amt = Number(sellAmount)
    if (!amt || amt <= 0 || amt > state.pulse) return
    const res = await api.sellToken(amt)
    if (res.ok) {
      toast({ title: 'PULSE sold', description: `Sold ${amt.toLocaleString()} PULSE for cash.`, variant: 'success' })
      setSellOpen(false)
      setSellAmount('')
    } else {
      toast({ title: 'Sale failed', description: res.error, variant: 'error' })
    }
  }

  async function handleApplyForCard() {
    const res = await api.applyForCard()
    if (res.ok) toast({ title: 'Card application submitted', variant: 'success' })
    else toast({ title: 'Could not apply', description: res.error, variant: 'error' })
  }

  return (
    <div className="mx-auto w-full max-w-md space-y-6 pb-24 text-zinc-100 antialiased">
      <div className="flex items-center gap-2 border-b border-zinc-800 pb-4">
        <Folder className="h-5 w-5 text-amber-400" />
        <div>
          <h2 className="text-xl font-black text-white">Wallet &amp; Activity</h2>
          <p className="text-xs text-zinc-400">Real-time ledger tracking for deposits, withdrawals, and payouts.</p>
        </div>
      </div>

      <div className="md:grid md:grid-cols-2 md:gap-6 md:items-start space-y-6 md:space-y-0">
        {/* Cash wallet */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6 space-y-4">
          <div>
            <p className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-400">Cash wallet</p>
            <p className="mt-1 font-mono text-3xl font-black text-white">${money(state.cash)}</p>
            <p className="text-xs text-zinc-500">Available to invest, withdraw, or send</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => openModal('deposit')}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-gradient-to-b from-amber-400 to-amber-500 px-3 py-2.5 text-xs font-bold text-black transition hover:from-amber-300 hover:to-amber-400"
            >
              <ArrowDownToLine className="h-3.5 w-3.5" /> Deposit
            </button>
            <button
              onClick={() => openModal('withdraw')}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2.5 text-xs font-bold text-zinc-200 transition hover:bg-zinc-700"
            >
              <ArrowUpFromLine className="h-3.5 w-3.5" /> Withdraw
            </button>
            <button
              onClick={() => openModal('transfer')}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2.5 text-xs font-bold text-zinc-200 transition hover:bg-zinc-700"
            >
              <SendIcon className="h-3.5 w-3.5" /> Send
            </button>
          </div>
        </div>

        {/* Withdrawal wallet connect */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-6 space-y-3">
          {state.wallet ? (
            <>
              <p className="text-sm font-bold text-white">Withdrawal wallet connected</p>
              <div className="flex items-center justify-between rounded-lg border border-zinc-800 bg-black/40 px-3 py-2">
                <span className="truncate font-mono text-xs text-zinc-300">{state.wallet}</span>
                <button
                  onClick={handleDisconnectWallet}
                  disabled={busy}
                  className="ml-3 shrink-0 text-[11px] font-bold text-amber-400 hover:text-amber-300 disabled:opacity-50"
                >
                  Change
                </button>
              </div>
            </>
          ) : (
            <>
              <p className="text-sm font-bold text-white">No withdrawal wallet connected</p>
              <p className="text-xs text-zinc-500">
                Add or manage the address you want withdrawals sent to — USDT (TRC-20) or BTC.
              </p>
              <input
                value={addressDraft}
                onChange={(e) => setAddressDraft(e.target.value)}
                placeholder="Paste your receiving address"
                className="w-full rounded-lg border border-zinc-800 bg-black/40 px-3 py-2.5 text-xs text-zinc-200 placeholder:text-zinc-600 focus:border-amber-500/50 focus:outline-none"
              />
              <button
                onClick={handleConnectWallet}
                disabled={busy || !addressDraft.trim()}
                className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2.5 text-xs font-bold text-amber-400 transition hover:bg-amber-500/20 disabled:opacity-50"
              >
                {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Link2 className="h-3.5 w-3.5" />} Connect wallet
              </button>
            </>
          )}
        </div>
      </div>

      {/* Pulse wallet */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <p className="flex items-center gap-1.5 text-[10px] font-mono font-bold uppercase tracking-wider text-amber-400">
            <Zap className="h-3.5 w-3.5" /> Pulse wallet
          </p>
          <span className="font-mono text-lg font-black text-white">{state.pulse.toLocaleString()}</span>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-lg border border-zinc-800 bg-black/40 p-3">
            <p className="text-[10px] font-mono uppercase text-zinc-500">Liquid — usable now</p>
            <p className="mt-1 font-mono text-lg font-bold text-white">{state.pulse.toLocaleString()}</p>
          </div>
          <div className="rounded-lg border border-zinc-800 bg-black/40 p-3">
            <p className="text-[10px] font-mono uppercase text-zinc-500">Staked — {STAKE_APY}% APY</p>
            <p className="mt-1 font-mono text-lg font-bold text-amber-400">{state.staked.toLocaleString()}</p>
          </div>
        </div>

        {sellOpen ? (
          <div className="space-y-2 rounded-lg border border-zinc-800 bg-black/40 p-3">
            <input
              type="number"
              value={sellAmount}
              onChange={(e) => setSellAmount(e.target.value)}
              placeholder="PULSE amount"
              className="w-full rounded-lg border border-zinc-800 bg-black/40 px-3 py-2 text-sm text-white placeholder:text-zinc-600 focus:border-amber-500/50 focus:outline-none"
            />
            <div className="flex gap-2">
              <button
                onClick={handleSell}
                disabled={busy || !sellAmount || Number(sellAmount) <= 0 || Number(sellAmount) > state.pulse}
                className="flex-1 rounded-lg bg-gradient-to-b from-amber-400 to-amber-500 px-3 py-2 text-xs font-bold text-black disabled:opacity-50"
              >
                Confirm sale
              </button>
              <button
                onClick={() => { setSellOpen(false); setSellAmount('') }}
                className="rounded-lg border border-zinc-700 px-3 py-2 text-xs font-bold text-zinc-300"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setSellOpen(true)}
            disabled={state.pulse <= 0}
            className="w-full rounded-lg border border-zinc-700 px-3 py-2.5 text-xs font-bold text-amber-400 transition hover:bg-zinc-800 disabled:opacity-40"
          >
            Sell PULSE for cash
          </button>
        )}
      </div>

      <div className="md:grid md:grid-cols-2 md:gap-6 md:items-start space-y-6 md:space-y-0">
        {/* Pulse Card */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="flex items-center gap-1.5 text-sm font-bold text-white">
              <CreditCard className="h-4 w-4 text-amber-400" /> Pulse Card
            </p>
            <span className={`rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase ${cardMeta.className}`}>
              {cardMeta.label}
            </span>
          </div>

          <div className="relative overflow-hidden rounded-2xl border border-amber-500/30 bg-gradient-to-br from-amber-300 via-amber-400 to-yellow-600 p-5 shadow-lg shadow-amber-500/10">
            <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/20 blur-2xl" />
            <div className="flex items-start justify-between">
              <p className="text-lg font-black tracking-tight text-black">PULSE</p>
              <div className="h-6 w-8 rounded bg-black/20" />
            </div>
            <p className="mt-8 font-mono text-sm tracking-[0.3em] text-black/80">•••• •••• •••• ••••</p>
            <div className="mt-4 flex items-end justify-between">
              <div>
                <p className="text-[9px] font-bold uppercase tracking-wider text-black/60">
                  {state.tier ? `Valued member · Tier ${state.tier}` : 'Valued member'}
                </p>
                <p className="text-[9px] font-bold uppercase tracking-wider text-black/60">Linked to Pulse wallet</p>
              </div>
              <p className="text-sm font-black italic text-black">VISA</p>
            </div>
          </div>

          {state.cardStatus === 'none' ? (
            <button
              onClick={handleApplyForCard}
              disabled={busy}
              className="w-full rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2.5 text-xs font-bold text-amber-400 transition hover:bg-amber-500/20 disabled:opacity-50"
            >
              Apply for Pulse Card
            </button>
          ) : (
            <p className="text-center text-[11px] text-zinc-500">
              Your Pulse Card details dynamically sync with your account profile status and issuance parameters.
            </p>
          )}
        </div>

        {/* Live activity feed */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-400">Live activity feed</p>
            <span className="flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-bold text-emerald-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> Live sync active
            </span>
          </div>
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/80 divide-y divide-zinc-800">
            {recentTxns.length === 0 ? (
              <p className="p-6 text-center text-sm text-zinc-500">No transaction activity recorded for this user account yet.</p>
            ) : (
              recentTxns.map((tx) => (
                <div key={tx.id} className="flex items-center justify-between p-4 text-sm">
                  <div>
                    <p className="font-medium text-white">{tx.label}</p>
                    <p className="text-xs text-zinc-500">{new Date(tx.date).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-mono font-bold text-white">
                      {tx.currency === 'PULSE' ? tx.amount.toLocaleString() : `$${money(tx.amount)}`}
                    </p>
                    <span className={`text-[10px] uppercase font-mono ${TXN_STATUS_META[tx.status] ?? 'text-zinc-500'}`}>
                      {tx.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Risk warning */}
      <div className="flex gap-3 rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4">
        <ShieldAlert className="h-4 w-4 shrink-0 text-amber-400" />
        <p className="text-[11px] leading-relaxed text-zinc-400">
          Trading stocks, options, futures, and forex carries a high level of risk and may not be suitable for all
          investors. Leverage can work against you as well as for you. Before deciding to trade, you should carefully
          consider your investment objectives, level of experience, and risk appetite. The possibility exists that you
          could sustain a loss of some or all of your initial investment and therefore you should not invest money
          that you cannot afford to lose.
        </p>
      </div>
    </div>
  )
}
