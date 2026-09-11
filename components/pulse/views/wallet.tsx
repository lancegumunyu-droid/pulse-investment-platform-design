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
  RotateCw,
  Calculator,
} from 'lucide-react'
import { money, usePulse } from '../store'
import { TOKEN } from '@/lib/pulse-data'

const STAKE_APY = TOKEN.stakingApy ?? 24.8

const CARD_STATUS_META: Record<string, { label: string; tone: 'muted' | 'gold' | 'green' }> = {
  none: { label: 'Not applied', tone: 'muted' },
  waitlisted: { label: 'Waitlisted', tone: 'gold' },
  approved: { label: 'Approved', tone: 'green' },
  free_card_earned: { label: 'Free card earned', tone: 'green' },
}

const TXN_STATUS_META: Record<string, { label: string; tone: 'green' | 'gold' | 'red' }> = {
  completed: { label: 'completed', tone: 'green' },
  pending: { label: 'pending', tone: 'gold' },
  processing: { label: 'processing', tone: 'gold' },
  failed: { label: 'failed', tone: 'red' },
  rejected: { label: 'rejected', tone: 'red' },
}

function chipClass(tone: 'muted' | 'gold' | 'green' | 'red') {
  return {
    muted: 'pulse-chip pulse-chip-muted',
    gold: 'pulse-chip pulse-chip-gold',
    green: 'pulse-chip pulse-chip-green',
    red: 'pulse-chip pulse-chip-red',
  }[tone]
}

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

export function WalletView() {
  const { state, api, toast, openModal, busy } = usePulse()
  const [addressDraft, setAddressDraft] = React.useState('')
  const [sellAmount, setSellAmount] = React.useState('')
  const [sellOpen, setSellOpen] = React.useState(false)
  const [cardFlipped, setCardFlipped] = React.useState(false)

  const cardMeta = CARD_STATUS_META[state.cardStatus ?? 'none'] ?? CARD_STATUS_META.none
  const recentTxns = state.txns.slice(0, 6)

  const cashGlow = useMouseGlow<HTMLDivElement>()
  const pulseGlow = useMouseGlow<HTMLDivElement>()

  // ---- Live sell calculator ----
  const sellAmountNum = Number(sellAmount) || 0
  const sellUsdValue = sellAmountNum * TOKEN.salePrice
  const sellExceedsBalance = sellAmountNum > state.pulse
  const sellPctOfHoldings = state.pulse > 0 ? Math.min(100, (sellAmountNum / state.pulse) * 100) : 0

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
    const amt = sellAmountNum
    if (!amt || amt <= 0 || amt > state.pulse) return
    const res = await api.sellToken(amt)
    if (res.ok) {
      toast({
        title: 'PULSE sold',
        description: `Sold ${amt.toLocaleString()} PULSE for $${money(sellUsdValue)}.`,
        variant: 'success',
      })
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

  const setPct = (pct: number) => {
    const amt = Math.floor(state.pulse * pct)
    setSellAmount(amt > 0 ? String(amt) : '')
  }

  return (
    <div className="mx-auto w-full max-w-[480px] space-y-4 pb-24 text-amber-100 antialiased lg:max-w-3xl">
      {/* HEADER */}
      <div className="pulse-glass-card pulse-static flex items-center gap-3 p-4">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-amber-500/30 bg-amber-500/10">
          <Folder className="h-4.5 w-4.5 text-amber-400" />
        </span>
        <div>
          <h2 className="text-lg font-bold text-white font-display">Wallet &amp; Activity</h2>
          <p className="pulse-label mt-0.5 normal-case tracking-normal text-zinc-400">
            Real-time ledger tracking for deposits, withdrawals, and payouts.
          </p>
        </div>
      </div>

      {/* CASH WALLET — hero card, cash-themed (green/amber) */}
      <div ref={cashGlow.ref} onPointerMove={cashGlow.onMove} className="pulse-hero-premium pulse-glow-track">
        <div className="relative z-[3] p-6 md:p-8">
          <span className="pulse-label">Cash Wallet</span>
          <div className="pulse-value-xl mt-2">${money(state.cash)}</div>
          <p className="mt-1.5 font-mono text-xs text-zinc-400">Available to invest, withdraw, or send</p>

          <div className="mt-5 grid grid-cols-3 gap-2.5">
            <button
              onClick={() => openModal('deposit')}
              className="flex flex-col items-center justify-center gap-1 rounded-xl bg-gradient-to-b from-amber-400 to-amber-500 px-2 py-3 text-black shadow-[0_8px_24px_-8px_rgba(245,158,11,0.6)] transition hover:brightness-110"
            >
              <ArrowDownToLine className="h-4 w-4" />
              <span className="text-[10px] font-bold uppercase tracking-wide">Deposit</span>
            </button>
            <button
              onClick={() => openModal('withdraw')}
              className="flex flex-col items-center justify-center gap-1 rounded-xl border border-white/10 bg-white/[0.03] px-2 py-3 text-zinc-200 transition hover:bg-white/[0.08]"
            >
              <ArrowUpFromLine className="h-4 w-4" />
              <span className="text-[10px] font-bold uppercase tracking-wide">Withdraw</span>
            </button>
            <button
              onClick={() => openModal('transfer')}
              className="flex flex-col items-center justify-center gap-1 rounded-xl border border-white/10 bg-white/[0.03] px-2 py-3 text-zinc-200 transition hover:bg-white/[0.08]"
            >
              <SendIcon className="h-4 w-4" />
              <span className="text-[10px] font-bold uppercase tracking-wide">Send</span>
            </button>
          </div>
        </div>
      </div>

      {/* WITHDRAWAL WALLET CONNECT */}
      <div className="pulse-glass-card pulse-static p-5">
        {state.wallet ? (
          <>
            <p className="pulse-value-md">Withdrawal wallet connected</p>
            <div className="mt-3 flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-black/30 px-3.5 py-2.5">
              <span className="truncate font-mono text-xs text-zinc-300">{state.wallet}</span>
              <button
                onClick={handleDisconnectWallet}
                disabled={busy}
                className="shrink-0 font-mono text-[11px] font-bold uppercase tracking-wide text-amber-400 transition hover:text-amber-300 disabled:opacity-50"
              >
                Change
              </button>
            </div>
          </>
        ) : (
          <>
            <p className="pulse-value-md">No withdrawal wallet connected</p>
            <p className="mt-1.5 font-mono text-xs text-zinc-500">
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
              className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-2.5 font-mono text-xs font-bold uppercase tracking-wide text-amber-400 transition hover:bg-amber-500/20 disabled:opacity-50"
            >
              {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Link2 className="h-3.5 w-3.5" />}
              Connect Wallet
            </button>
          </>
        )}
      </div>

      {/* PULSE TOKEN WALLET — violet-hero variant to differentiate from cash */}
      <div ref={pulseGlow.ref} onPointerMove={pulseGlow.onMove} className="pulse-hero-premium pulse-hero-violet pulse-glow-track">
        <div className="relative z-[3] p-6 md:p-8">
          <div className="flex items-center justify-between">
            <span className="pulse-label flex items-center gap-1.5">
              <Zap className="h-3.5 w-3.5 text-amber-400" /> Pulse Wallet
            </span>
            <span className="pulse-value-md">{state.pulse.toLocaleString()}</span>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-white/10 bg-black/30 p-3.5">
              <span className="pulse-label block">Liquid — usable now</span>
              <div className="pulse-value-md mt-1.5">{state.pulse.toLocaleString()}</div>
            </div>
            <div className="rounded-xl border border-white/10 bg-black/30 p-3.5">
              <span className="pulse-label block">Staked — {STAKE_APY}% APY</span>
              <div className="pulse-value-accent mt-1.5 text-base">{state.staked.toLocaleString()}</div>
            </div>
          </div>

          {/* LIVE SELL CALCULATOR */}
          {sellOpen ? (
            <div className="mt-4 space-y-3 rounded-xl border border-amber-500/25 bg-black/40 p-4">
              <div className="flex items-center gap-1.5 pulse-label text-amber-300">
                <Calculator className="h-3.5 w-3.5" />
                Sell Calculator
              </div>

              <input
                type="number"
                inputMode="decimal"
                value={sellAmount}
                onChange={(e) => setSellAmount(e.target.value)}
                placeholder="PULSE amount"
                className="pulse-input font-mono"
              />

              <div className="grid grid-cols-4 gap-1.5">
                {[0.25, 0.5, 0.75, 1].map((pct) => (
                  <button
                    key={pct}
                    onClick={() => setPct(pct)}
                    className="rounded-lg border border-white/10 bg-white/[0.03] py-1.5 font-mono text-[10px] font-bold text-zinc-300 transition hover:border-amber-400/50 hover:bg-amber-400/10 hover:text-amber-400"
                  >
                    {pct === 1 ? 'MAX' : `${pct * 100}%`}
                  </button>
                ))}
              </div>

              {/* live conversion preview */}
              <div className="space-y-2 rounded-lg border border-white/10 bg-white/[0.02] p-3">
                <div className="flex items-center justify-between font-mono text-xs">
                  <span className="text-zinc-400">Rate</span>
                  <span className="pulse-value-sm">${TOKEN.salePrice.toFixed(2)} / PULSE</span>
                </div>
                <div className="flex items-center justify-between font-mono text-xs">
                  <span className="text-zinc-400">You receive</span>
                  <span className={sellExceedsBalance ? 'pulse-value-sm text-rose-400' : 'pulse-value-accent'}>
                    ${money(sellUsdValue)}
                  </span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-black/50">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      sellExceedsBalance ? 'bg-rose-500' : 'bg-gradient-to-r from-amber-500 to-yellow-400'
                    }`}
                    style={{ width: `${sellPctOfHoldings}%` }}
                  />
                </div>
                {sellExceedsBalance && (
                  <p className="font-mono text-[10px] text-rose-400">Amount exceeds your liquid PULSE balance.</p>
                )}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleSell}
                  disabled={busy || !sellAmountNum || sellAmountNum <= 0 || sellExceedsBalance}
                  className="flex-1 rounded-xl bg-gradient-to-b from-amber-400 to-amber-500 px-3 py-2.5 font-mono text-xs font-bold uppercase tracking-wide text-black shadow-[0_8px_24px_-8px_rgba(245,158,11,0.6)] transition hover:brightness-110 disabled:opacity-50"
                >
                  Confirm Sale
                </button>
                <button
                  onClick={() => {
                    setSellOpen(false)
                    setSellAmount('')
                  }}
                  className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2.5 font-mono text-xs font-bold uppercase tracking-wide text-zinc-300 transition hover:bg-white/[0.08]"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setSellOpen(true)}
              disabled={state.pulse <= 0}
              className="mt-4 flex w-full items-center justify-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2.5 font-mono text-xs font-bold uppercase tracking-wide text-amber-400 transition hover:bg-white/[0.08] disabled:opacity-40"
            >
              <Calculator className="h-3.5 w-3.5" />
              Sell PULSE for Cash
            </button>
          )}
        </div>
      </div>

      {/* PULSE CARD */}
      <div className="pulse-glass-card pulse-static space-y-3 p-5">
        <div className="flex items-center justify-between">
          <p className="pulse-value-md flex items-center gap-1.5">
            <CreditCard className="h-4 w-4 text-amber-400" /> Pulse Card
          </p>
          <span className={chipClass(cardMeta.tone)}>{cardMeta.label}</span>
        </div>

        <button
          type="button"
          onClick={() => setCardFlipped((f) => !f)}
          aria-label="Flip Pulse Card"
          className="block w-full [perspective:1400px]"
        >
          <div
            className="relative h-[190px] w-full transition-transform duration-700 [transform-style:preserve-3d]"
            style={{ transform: cardFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)' }}
          >
            {/* FRONT FACE */}
            <div className="shimmer-sweep absolute inset-0 overflow-hidden rounded-2xl border border-amber-500/30 bg-gradient-to-br from-amber-300 via-amber-400 to-yellow-600 p-5 text-left shadow-lg shadow-amber-500/10 [backface-visibility:hidden]">
              <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/20 blur-2xl" />
              <div className="flex items-start justify-between">
                <p className="text-lg font-black tracking-tight text-black">PULSE</p>
                <div className="h-6 w-8 rounded bg-black/20" />
              </div>
              <p className="mt-8 font-mono text-sm tracking-[0.3em] text-black/80">
                •••• •••• •••• {state.cardLast4 ?? '••••'}
              </p>
              <div className="mt-4 flex items-end justify-between">
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-wider text-black/60">
                    {state.tier ? `Valued member · Tier ${state.tier}` : 'Valued member'}
                  </p>
                  <p className="text-[9px] font-bold uppercase tracking-wider text-black/60">Linked to Pulse wallet</p>
                </div>
                <p className="text-sm font-black italic text-black">VISA</p>
              </div>
              <RotateCw className="absolute bottom-3 right-3 h-3.5 w-3.5 text-black/40" />
            </div>

            {/* BACK FACE */}
            <div
              className="absolute inset-0 overflow-hidden rounded-2xl border border-amber-500/30 bg-gradient-to-br from-zinc-900 via-zinc-950 to-black p-5 text-left shadow-lg [backface-visibility:hidden]"
              style={{ transform: 'rotateY(180deg)' }}
            >
              <div className="h-9 w-full bg-black" />
              <div className="mt-5 flex items-center justify-between rounded-md bg-zinc-200/90 px-3 py-2">
                <span className="font-mono text-xs italic text-zinc-500">Authorized signature</span>
                <span className="font-mono text-xs font-bold text-black">{state.cardCvv ?? '•••'}</span>
              </div>
              <p className="mt-4 text-[9px] leading-relaxed text-zinc-500">
                This card is issued subject to Pulse Card Terms. Report loss or unauthorized use immediately via
                Profile → Support. Not a bank deposit — funds are held in your Pulse cash wallet.
              </p>
              <p className="mt-3 font-mono text-[10px] text-zinc-600">
                {state.cardStatus === 'approved' || state.cardStatus === 'free_card_earned'
                  ? 'Card active'
                  : 'Card inactive — pending issuance'}
              </p>
            </div>
          </div>
        </button>
        <p className="text-center font-mono text-[10px] text-zinc-600">Tap card to flip</p>

        {state.cardStatus === 'none' ? (
          <button
            onClick={handleApplyForCard}
            disabled={busy}
            className="w-full rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-2.5 font-mono text-xs font-bold uppercase tracking-wide text-amber-400 transition hover:bg-amber-500/20 disabled:opacity-50"
          >
            Apply for Pulse Card
          </button>
        ) : (
          <p className="text-center font-mono text-[11px] text-zinc-500">
            Your Pulse Card details dynamically sync with your account profile status and issuance parameters.
          </p>
        )}
      </div>

      {/* LIVE ACTIVITY FEED — synced directly from state.txns, no local caching */}
      <div className="pulse-glass-card pulse-static overflow-hidden">
        <div className="pulse-vault-header">
          <span className="pulse-label">Live Activity Feed</span>
          <span className="pulse-chip pulse-chip-green">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> Live Sync Active
          </span>
        </div>
        {recentTxns.length === 0 ? (
          <p className="p-6 text-center font-mono text-xs text-zinc-500">
            No transaction activity recorded for this user account yet.
          </p>
        ) : (
          <div className="divide-y divide-white/[0.06]">
            {recentTxns.map((tx) => {
              const meta = TXN_STATUS_META[tx.status] ?? { label: tx.status, tone: 'muted' as const }
              return (
                <div key={tx.id} className="flex items-center justify-between p-4 transition-colors hover:bg-white/[0.02]">
                  <div>
                    <p className="text-sm font-semibold text-white">{tx.label}</p>
                    <p className="mt-0.5 font-mono text-[11px] text-zinc-500">
                      {new Date(tx.date).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="pulse-value-sm">
                      {tx.currency === 'PULSE' ? tx.amount.toLocaleString() : `$${money(tx.amount)}`}
                    </p>
                    <span
                      className={`mt-1 inline-block font-mono text-[10px] font-bold uppercase ${
                        meta.tone === 'green'
                          ? 'text-emerald-400'
                          : meta.tone === 'gold'
                            ? 'text-amber-400'
                            : meta.tone === 'red'
                              ? 'text-rose-400'
                              : 'text-zinc-500'
                      }`}
                    >
                      {meta.label}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* RISK WARNING */}
      <div className="pulse-glass-card pulse-static space-y-2 p-4">
        <div className="flex items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-wider text-amber-300">
          <ShieldAlert className="h-4 w-4 shrink-0" />
          <span>Risk Disclaimer</span>
        </div>
        <p className="font-mono text-[10px] leading-relaxed text-amber-100/70">
          Yield outputs and APY metrics reflect live ledger states and are variable, not guaranteed. Past performance
          does not guarantee future returns. Capital is at risk — do not invest money you cannot afford to lose.
        </p>
      </div>
    </div>
  )
}
