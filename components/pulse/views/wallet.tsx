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

const STAKE_APY = 24.8

function useMouseGlow<T extends HTMLElement>() {
  const ref = React.useRef<T | null>(null)
  const onMove = (e: React.PointerEvent<T>) => {
    const el = ref.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    el.style.setProperty('--mx', `${e.clientX - rect.left}px`)
    el.style.setProperty('--my', `${e.clientY - rect.top}px`)
  }
  return { ref, onMove }
}

const CARD_STATUS_META: Record<string, { label: string; chip: string }> = {
  none: { label: 'Not applied', chip: 'pulse-chip pulse-chip-gold' },
  waitlisted: { label: 'Waitlisted', chip: 'pulse-chip pulse-chip-gold' },
  approved: { label: 'Approved', chip: 'pulse-chip pulse-chip-green' },
  free_card_earned: { label: 'Free card earned', chip: 'pulse-chip pulse-chip-green' },
}

const TXN_STATUS_CHIP: Record<string, string> = {
  completed: 'pulse-chip pulse-chip-green',
  pending: 'pulse-chip pulse-chip-gold',
  processing: 'pulse-chip pulse-chip-gold',
  failed: 'pulse-chip pulse-chip-gold',
  rejected: 'pulse-chip pulse-chip-gold',
}

export function WalletView() {
  const { state, api, toast, openModal, busy } = usePulse()
  const [addressDraft, setAddressDraft] = React.useState('')
  const [sellAmount, setSellAmount] = React.useState('')
  const [sellOpen, setSellOpen] = React.useState(false)

  const cardMeta = CARD_STATUS_META[state.cardStatus ?? 'none'] ?? CARD_STATUS_META.none
  const recentTxns = state.txns.slice(0, 6)
  const heroGlow = useMouseGlow<HTMLDivElement>()

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

  async function handleUnstake(amount: number) {
    const res = await api.unstake(amount)
    if (res.ok) toast({ title: 'PULSE unstaked', description: `${amount.toLocaleString()} PULSE moved to liquid balance.`, variant: 'success' })
    else toast({ title: 'Unstake failed', description: res.error, variant: 'error' })
  }

  return (
    <div className="mx-auto w-full max-w-[480px] space-y-4 pb-24 text-amber-100 antialiased lg:max-w-3xl">
      {/* HEADER */}
      <div className="pulse-glass-card pulse-static flex items-center gap-3 p-4">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-amber-500/30 bg-amber-500/10">
          <Folder className="h-4 w-4 text-amber-400" />
        </span>
        <div>
          <h2 className="pulse-value-md text-lg">Wallet &amp; Activity</h2>
          <p className="pulse-label mt-0.5 normal-case tracking-normal text-zinc-400">
            Real-time ledger tracking for deposits, withdrawals, and payouts.
          </p>
        </div>
      </div>

      {/* CASH WALLET */}
      <div ref={heroGlow.ref} onPointerMove={heroGlow.onMove} className="pulse-hero-premium pulse-glow-track">
        <div className="relative z-[3] p-6">
          <span className="pulse-label">Cash Wallet</span>
          <div className="pulse-value-xl mt-2 text-4xl">${money(state.cash)}</div>
          <p className="pulse-label mt-1 normal-case tracking-normal text-zinc-500">
            Available to invest, withdraw, or send
          </p>
          <div className="mt-5 grid grid-cols-3 gap-2">
            <button
              onClick={() => openModal('deposit')}
              className="flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-b from-amber-400 to-amber-500 px-3 py-2.5 font-mono text-[11px] font-bold uppercase tracking-wide text-black shadow-[0_8px_24px_-8px_rgba(245,158,11,0.6)] transition hover:brightness-110"
            >
              <ArrowDownToLine className="h-3.5 w-3.5 shrink-0" /> Deposit
            </button>
            <button
              onClick={() => openModal('withdraw')}
              className="flex items-center justify-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2.5 font-mono text-[11px] font-bold uppercase tracking-wide text-zinc-200 transition hover:bg-white/[0.07]"
            >
              <ArrowUpFromLine className="h-3.5 w-3.5 shrink-0" /> Withdraw
            </button>
            <button
              onClick={() => openModal('transfer')}
              className="flex items-center justify-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2.5 font-mono text-[11px] font-bold uppercase tracking-wide text-zinc-200 transition hover:bg-white/[0.07]"
            >
              <SendIcon className="h-3.5 w-3.5 shrink-0" /> Send
            </button>
          </div>
        </div>
      </div>

      {/* WITHDRAWAL WALLET CONNECT */}
      <div className="pulse-glass-card pulse-static p-5">
        {state.wallet ? (
          <>
            <p className="pulse-value-md">Withdrawal wallet connected</p>
            <div className="mt-3 flex items-center justify-between rounded-xl border border-amber-500/20 bg-black/40 px-3.5 py-2.5">
              <span className="truncate font-mono text-xs text-zinc-300">{state.wallet}</span>
              <button
                onClick={handleDisconnectWallet}
                disabled={busy}
                className="ml-3 shrink-0 font-mono text-[11px] font-bold uppercase tracking-wide text-amber-400 hover:text-amber-300 disabled:opacity-50"
              >
                Change
              </button>
            </div>
          </>
        ) : (
          <>
            <p className="pulse-value-md">No withdrawal wallet connected</p>
            <p className="pulse-label mt-1 normal-case tracking-normal text-zinc-500">
              Add or manage the address you want withdrawals sent to — USDT (TRC-20) or BTC.
            </p>
            <input
              value={addressDraft}
              onChange={(e) => setAddressDraft(e.target.value)}
              placeholder="Paste your receiving address"
              className="pulse-input mt-3"
            />
            <button
              onClick={handleConnectWallet}
              disabled={busy || !addressDraft.trim()}
              className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-2.5 font-mono text-[11px] font-bold uppercase tracking-wide text-amber-300 transition hover:bg-amber-500/20 disabled:opacity-50"
            >
              {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Link2 className="h-3.5 w-3.5" />} Connect wallet
            </button>
          </>
        )}
      </div>

      {/* PULSE WALLET */}
      <div className="pulse-glass-card p-5">
        <div className="flex items-center justify-between">
          <span className="pulse-label flex items-center gap-1.5">
            <Zap className="h-3.5 w-3.5 text-amber-400" /> Pulse Wallet
          </span>
          <span className="pulse-value-md">{money(state.pulse, 0)}</span>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="rounded-xl border border-amber-500/15 bg-black/40 p-3">
            <span className="pulse-label block">Liquid — Usable Now</span>
            <div className="pulse-value-md mt-1">{money(state.pulse, 0)}</div>
          </div>
          <div className="rounded-xl border border-amber-500/15 bg-black/40 p-3">
            <span className="pulse-label block">Staked — {STAKE_APY}% APY</span>
            <div className="pulse-value-accent mt-1 text-base">{money(state.staked, 0)}</div>
          </div>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-2">
          {sellOpen ? (
            <div className="col-span-2 space-y-2 rounded-xl border border-amber-500/20 bg-black/40 p-3">
              <input
                type="number"
                value={sellAmount}
                onChange={(e) => setSellAmount(e.target.value)}
                placeholder="PULSE amount"
                className="pulse-input"
              />
              <div className="flex gap-2">
                <button
                  onClick={handleSell}
                  disabled={busy || !sellAmount || Number(sellAmount) <= 0 || Number(sellAmount) > state.pulse}
                  className="flex-1 rounded-xl bg-gradient-to-b from-amber-400 to-amber-500 px-3 py-2 font-mono text-[11px] font-bold uppercase tracking-wide text-black disabled:opacity-50"
                >
                  Confirm sale
                </button>
                <button
                  onClick={() => { setSellOpen(false); setSellAmount('') }}
                  className="rounded-xl border border-white/10 px-3 py-2 font-mono text-[11px] font-bold uppercase tracking-wide text-zinc-300"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setSellOpen(true)}
              disabled={state.pulse <= 0}
              className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2.5 font-mono text-[11px] font-bold uppercase tracking-wide text-amber-300 transition hover:bg-white/[0.07] disabled:opacity-40"
            >
              Sell PULSE
            </button>
          )}
          <button
            onClick={() => handleUnstake(state.staked)}
            disabled={busy || state.staked <= 0}
            className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2.5 font-mono text-[11px] font-bold uppercase tracking-wide text-amber-300 transition hover:bg-white/[0.07] disabled:opacity-40"
          >
            Unstake All
          </button>
        </div>
      </div>

      {/* PULSE CARD */}
      <div className="pulse-glass-card pulse-static p-5">
        <div className="flex items-center justify-between">
          <span className="pulse-label flex items-center gap-1.5">
            <CreditCard className="h-3.5 w-3.5 text-amber-400" /> Pulse Card
          </span>
          <span className={cardMeta.chip}>{cardMeta.label}</span>
        </div>

        <div className="relative mt-4 overflow-hidden rounded-2xl border border-amber-500/40 bg-gradient-to-br from-amber-300 via-amber-400 to-yellow-600 p-5 shadow-[0_0_45px_rgba(245,158,11,0.25)]">
          <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/25 blur-2xl" />
          <div className="flex items-start justify-between">
            <p className="font-display text-lg font-black tracking-tight text-black">PULSE</p>
            <div className="h-6 w-8 rounded bg-black/20" />
          </div>
          <p className="mt-8 font-mono text-sm tracking-[0.3em] text-black/80">•••• •••• •••• ••••</p>
          <div className="mt-4 flex items-end justify-between">
            <div>
              <p className="font-mono text-[9px] font-bold uppercase tracking-wider text-black/60">
                {state.tier ? `Valued Member · Tier ${state.tier}` : 'Valued Member'}
              </p>
              <p className="font-mono text-[9px] font-bold uppercase tracking-wider text-black/60">Linked to Pulse Wallet</p>
            </div>
            <p className="text-sm font-black italic text-black">VISA</p>
          </div>
        </div>

        {state.cardStatus === 'none' ? (
          <button
            onClick={handleApplyForCard}
            disabled={busy}
            className="mt-4 w-full rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-2.5 font-mono text-[11px] font-bold uppercase tracking-wide text-amber-300 transition hover:bg-amber-500/20 disabled:opacity-50"
          >
            Apply for Pulse Card
          </button>
        ) : (
          <p className="pulse-label mt-3 text-center normal-case tracking-normal text-zinc-500">
            Your Pulse Card details dynamically sync with your account profile status and issuance parameters.
          </p>
        )}
      </div>

      {/* LIVE ACTIVITY FEED */}
      <div className="pulse-glass-card pulse-static overflow-hidden">
        <div className="pulse-vault-header">
          <span className="pulse-label">Live Activity Feed</span>
          <span className="pulse-chip pulse-chip-green">
            <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-emerald-400" /> Live Sync Active
          </span>
        </div>
        {recentTxns.length === 0 ? (
          <p className="p-5 font-mono text-xs text-zinc-500">No transaction activity recorded for this user account yet.</p>
        ) : (
          <div className="divide-y divide-white/[0.06]">
            {recentTxns.map((tx) => (
              <div key={tx.id} className="flex items-center justify-between p-4">
                <div>
                  <p className="text-sm font-semibold text-white">{tx.label}</p>
                  <p className="pulse-label mt-0.5 normal-case tracking-normal text-zinc-500">
                    {new Date(tx.date).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="pulse-value-md">
                    {tx.currency === 'PULSE' ? money(tx.amount, 0) : `$${money(tx.amount)}`}
                  </p>
                  <span className={TXN_STATUS_CHIP[tx.status] ?? 'pulse-chip pulse-chip-gold'}>{tx.status}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* RISK DISCLAIMER — enforced shared treatment */}
      <div className="pulse-glass-card pulse-static space-y-2 p-4">
        <div className="flex items-center gap-2 pulse-disclaimer-title">
          <ShieldAlert className="h-3.5 w-3.5" />
          <span>Risk Disclaimer</span>
        </div>
        <p className="pulse-disclaimer">
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
