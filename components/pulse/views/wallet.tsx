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
  X,
  Loader2,
  CreditCard,
} from 'lucide-react'
import { usePulse } from './store'

// TODO: replace with the real values from lib/pulse-data (TOKEN.stakeApy, deposit addresses).
const STAKE_APY = 24.8
const DEPOSIT_OPTIONS = [
  { id: 'btc' as const, label: 'BTC — Luno', network: 'Bitcoin', address: 'REPLACE_WITH_LUNO_BTC_ADDRESS' },
  { id: 'usdttrc20' as const, label: 'USDT — TRC20 (Binance)', network: 'TRON (TRC-20)', address: 'REPLACE_WITH_BINANCE_USDT_TRC20_ADDRESS' },
]

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

function usd(n: number) {
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

type ModalKind = 'deposit' | 'withdraw' | 'send' | 'sell' | null

export function WalletView() {
  const { state, api, toast } = usePulse()
  const [modal, setModal] = React.useState<ModalKind>(null)
  const [busy, setBusy] = React.useState(false)
  const [addressDraft, setAddressDraft] = React.useState('')

  const cardMeta = CARD_STATUS_META[state.cardStatus ?? 'none'] ?? CARD_STATUS_META.none
  const recentTxns = state.txns.slice(0, 6)

  async function runAction<T extends { ok: boolean; error?: string }>(fn: () => Promise<T>, successMsg: string) {
    setBusy(true)
    try {
      const res = await fn()
      if (res.ok) {
        toast({ title: 'Success', description: successMsg, variant: 'success' })
        setModal(null)
      } else {
        toast({ title: 'Failed', description: res.error ?? 'Something went wrong', variant: 'error' })
      }
    } finally {
      setBusy(false)
    }
  }

  async function handleConnectWallet() {
    if (!addressDraft.trim()) return
    await runAction(() => api.connectWallet(addressDraft.trim()), 'Withdrawal wallet connected.')
    setAddressDraft('')
  }

  return (
    <div className="space-y-6">
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
          <p className="mt-1 font-mono text-3xl font-black text-white">{usd(state.cash)}</p>
          <p className="text-xs text-zinc-500">Available to invest, withdraw, or send</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setModal('deposit')}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-gradient-to-b from-amber-400 to-amber-500 px-3 py-2.5 text-xs font-bold text-black transition hover:from-amber-300 hover:to-amber-400"
          >
            <ArrowDownToLine className="h-3.5 w-3.5" /> Deposit
          </button>
          <button
            onClick={() => setModal('withdraw')}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2.5 text-xs font-bold text-zinc-200 transition hover:bg-zinc-700"
          >
            <ArrowUpFromLine className="h-3.5 w-3.5" /> Withdraw
          </button>
          <button
            onClick={() => setModal('send')}
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
                onClick={() => runAction(() => api.disconnectWallet(), 'Withdrawal wallet disconnected.')}
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
        <button
          onClick={() => setModal('sell')}
          disabled={state.pulse <= 0}
          className="w-full rounded-lg border border-zinc-700 px-3 py-2.5 text-xs font-bold text-amber-400 transition hover:bg-zinc-800 disabled:opacity-40"
        >
          Sell PULSE for cash
        </button>
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
            onClick={() => runAction(() => api.applyForCard(), 'Card application submitted.')}
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
                    {tx.currency === 'PULSE' ? tx.amount.toLocaleString() : usd(tx.amount)}
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

      {modal && (
        <Modal onClose={() => !busy && setModal(null)}>
          {modal === 'deposit' && <DepositForm busy={busy} onSubmit={(amt, cur, ref) => runAction(() => api.deposit(amt, cur, ref), 'Deposit submitted for approval.')} />}
          {modal === 'withdraw' && (
            <WithdrawForm
              busy={busy}
              maxAmount={state.cash * 0.8}
              hasWallet={!!state.wallet}
              onSubmit={(amt) => runAction(() => api.withdraw(amt, state.wallet ?? '', 'TRC20', 'internal'), 'Withdrawal requested.')}
            />
          )}
          {modal === 'send' && <SendForm busy={busy} onSubmit={(recipient, amt) => runAction(() => api.transfer(recipient, amt), 'Funds sent.')} />}
          {modal === 'sell' && (
            <SellForm busy={busy} maxAmount={state.pulse} onSubmit={(amt) => runAction(() => api.sellToken(amt), 'PULSE sold for cash.')} />
          )}
        </Modal>
      )}
    </div>
  )
}

function Modal({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm rounded-2xl border border-zinc-800 bg-zinc-900 p-6 shadow-2xl"
      >
        <div className="mb-4 flex justify-end">
          <button onClick={onClose} className="text-zinc-500 hover:text-zinc-300">
            <X className="h-4 w-4" />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}

function DepositForm({ busy, onSubmit }: { busy: boolean; onSubmit: (amount: number, currency: 'btc' | 'usdttrc20', reference: string) => void }) {
  const [option, setOption] = React.useState(DEPOSIT_OPTIONS[0])
  const [amount, setAmount] = React.useState('')
  const [reference, setReference] = React.useState('')

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-black text-white">Deposit funds</h3>
      <div className="flex gap-2">
        {DEPOSIT_OPTIONS.map((opt) => (
          <button
            key={opt.id}
            onClick={() => setOption(opt)}
            className={`flex-1 rounded-lg border px-3 py-2 text-xs font-bold transition ${
              option.id === opt.id ? 'border-amber-500 bg-amber-500/10 text-amber-400' : 'border-zinc-800 text-zinc-400'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
      <div className="rounded-lg border border-zinc-800 bg-black/40 p-3">
        <p className="text-[10px] uppercase text-zinc-500">Send {option.network} to</p>
        <p className="mt-1 break-all font-mono text-xs text-white">{option.address}</p>
      </div>
      <input
        type="number"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        placeholder="Amount sent (USD)"
        className="w-full rounded-lg border border-zinc-800 bg-black/40 px-3 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:border-amber-500/50 focus:outline-none"
      />
      <input
        value={reference}
        onChange={(e) => setReference(e.target.value)}
        placeholder="Transaction ID / reference"
        className="w-full rounded-lg border border-zinc-800 bg-black/40 px-3 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:border-amber-500/50 focus:outline-none"
      />
      <button
        disabled={busy || !amount || Number(amount) <= 0 || !reference.trim()}
        onClick={() => onSubmit(Number(amount), option.id, reference.trim())}
        className="w-full rounded-lg bg-gradient-to-b from-amber-400 to-amber-500 px-3 py-2.5 text-sm font-bold text-black disabled:opacity-50"
      >
        {busy ? 'Submitting…' : 'Submit deposit'}
      </button>
      <p className="text-[10px] text-zinc-500">Deposits are credited after admin verification of the transaction reference.</p>
    </div>
  )
}

function WithdrawForm({ busy, maxAmount, hasWallet, onSubmit }: { busy: boolean; maxAmount: number; hasWallet: boolean; onSubmit: (amount: number) => void }) {
  const [amount, setAmount] = React.useState('')
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-black text-white">Withdraw funds</h3>
      {!hasWallet ? (
        <p className="text-sm text-amber-400">Connect a withdrawal wallet before requesting a withdrawal.</p>
      ) : (
        <>
          <p className="text-xs text-zinc-500">Max withdrawal: {usd(maxAmount)} (80% of cash balance)</p>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Amount (USD)"
            className="w-full rounded-lg border border-zinc-800 bg-black/40 px-3 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:border-amber-500/50 focus:outline-none"
          />
          <button
            disabled={busy || !amount || Number(amount) <= 0 || Number(amount) > maxAmount}
            onClick={() => onSubmit(Number(amount))}
            className="w-full rounded-lg bg-gradient-to-b from-amber-400 to-amber-500 px-3 py-2.5 text-sm font-bold text-black disabled:opacity-50"
          >
            {busy ? 'Submitting…' : 'Request withdrawal'}
          </button>
        </>
      )}
    </div>
  )
}

function SendForm({ busy, onSubmit }: { busy: boolean; onSubmit: (recipient: string, amount: number) => void }) {
  const [recipient, setRecipient] = React.useState('')
  const [amount, setAmount] = React.useState('')
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-black text-white">Send to another user</h3>
      <input
        value={recipient}
        onChange={(e) => setRecipient(e.target.value)}
        placeholder="Recipient username or wallet ID"
        className="w-full rounded-lg border border-zinc-800 bg-black/40 px-3 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:border-amber-500/50 focus:outline-none"
      />
      <input
        type="number"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        placeholder="Amount (USD)"
        className="w-full rounded-lg border border-zinc-800 bg-black/40 px-3 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:border-amber-500/50 focus:outline-none"
      />
      <button
        disabled={busy || !recipient.trim() || !amount || Number(amount) <= 0}
        onClick={() => onSubmit(recipient.trim(), Number(amount))}
        className="w-full rounded-lg bg-gradient-to-b from-amber-400 to-amber-500 px-3 py-2.5 text-sm font-bold text-black disabled:opacity-50"
      >
        {busy ? 'Sending…' : 'Send funds'}
      </button>
    </div>
  )
}

function SellForm({ busy, maxAmount, onSubmit }: { busy: boolean; maxAmount: number; onSubmit: (amount: number) => void }) {
  const [amount, setAmount] = React.useState('')
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-black text-white">Sell PULSE</h3>
      <p className="text-xs text-zinc-500">Available: {maxAmount.toLocaleString()} PULSE</p>
      <input
        type="number"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        placeholder="PULSE amount"
        className="w-full rounded-lg border border-zinc-800 bg-black/40 px-3 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:border-amber-500/50 focus:outline-none"
      />
      <button
        disabled={busy || !amount || Number(amount) <= 0 || Number(amount) > maxAmount}
        onClick={() => onSubmit(Number(amount))}
        className="w-full rounded-lg bg-gradient-to-b from-amber-400 to-amber-500 px-3 py-2.5 text-sm font-bold text-black disabled:opacity-50"
      >
        {busy ? 'Selling…' : 'Confirm sale'}
      </button>
    </div>
  )
}
