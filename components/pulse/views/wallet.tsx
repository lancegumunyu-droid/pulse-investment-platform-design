'use client'

import { useState } from 'react'
import {
  ArrowDownRight,
  ArrowUpRight,
  Coins,
  Copy,
  CreditCard,
  LogOut,
  Send,
  Sparkles,
  Wallet,
  Zap,
} from 'lucide-react'
import { money, usePulse, type Txn } from '../store'
import { Glass, Pill, RiskNote, SectionTitle } from '../ui-bits'
import { Button } from '@/components/ui/button'
import { TOKEN } from '@/lib/pulse-data'

const txMeta: Record<Txn['type'], { icon: typeof ArrowDownRight; tone: string; sign: string }> = {
  deposit: { icon: ArrowDownRight, tone: 'text-green', sign: '+' },
  withdraw: { icon: ArrowUpRight, tone: 'text-destructive', sign: '-' },
  invest: { icon: ArrowUpRight, tone: 'text-gold', sign: '-' },
  sale: { icon: Sparkles, tone: 'text-gold', sign: '' },
  stake: { icon: Zap, tone: 'text-gold', sign: '' },
  unstake: { icon: Coins, tone: 'text-green', sign: '' },
  p2p_send: { icon: Send, tone: 'text-destructive', sign: '-' },
  p2p_receive: { icon: ArrowDownRight, tone: 'text-green', sign: '+' },
}

const CARD_COPY: Record<'none' | 'waitlisted' | 'approved' | 'free_card_earned', { title: string; body: string }> = {
  none: {
    title: 'Apply for a Pulse Card',
    body: 'Spend directly from your Pulse Wallet — funded by your cash balance and PULSE token, no separate top-up needed. Physical cards are rolling out to the waitlist in order.',
  },
  waitlisted: {
    title: "You're on the waitlist",
    body: "We'll notify you here the moment your Pulse Card is ready to activate. No action needed in the meantime.",
  },
  approved: {
    title: 'Your card is approved',
    body: 'Your Pulse Card has been approved. Physical card issuance and activation will appear here once it ships.',
  },
  free_card_earned: {
    title: 'Free card earned 🎉',
    body: 'You reached 100 verified referrals and earned a free Pulse Card. Physical card issuance and activation will appear here once it ships.',
  },
}

export function WalletView() {
  const { state, api, toast, openModal } = usePulse()
  const [addressInput, setAddressInput] = useState('')
  const [connecting, setConnecting] = useState(false)
  const [applyingCard, setApplyingCard] = useState(false)
  const [sellOpen, setSellOpen] = useState(false)
  const [sellAmount, setSellAmount] = useState('')
  const [selling, setSelling] = useState(false)

  const sellPulseAmount = Number(sellAmount) || 0
  const sellUsdValue = sellPulseAmount * TOKEN.salePrice

  const submitSell = async () => {
    if (sellPulseAmount <= 0) {
      toast({ title: 'Enter a valid amount', variant: 'error' })
      return
    }
    if (sellPulseAmount > state.pulse) {
      toast({ title: 'Not enough liquid PULSE', description: 'Unstake first if the amount is currently staked.', variant: 'error' })
      return
    }
    setSelling(true)
    const res = await api.sellToken(sellPulseAmount)
    setSelling(false)
    if (!res.ok) {
      toast({ title: 'Sale failed', description: res.error, variant: 'error' })
      return
    }
    toast({ title: 'PULSE sold', description: `$${money(sellUsdValue)} added to your cash wallet.`, variant: 'success' })
    setSellOpen(false)
    setSellAmount('')
  }

  const connect = async () => {
    const addr = addressInput.trim()
    if (addr.length < 20) {
      toast({ title: "That doesn't look like a valid address", description: 'Paste your USDT (TRC-20) or BTC receiving address.', variant: 'error' })
      return
    }
    setConnecting(true)
    const res = await api.connectWallet(addr)
    setConnecting(false)
    if (!res.ok) {
      toast({ title: 'Could not save wallet', description: res.error, variant: 'error' })
      return
    }
    setAddressInput('')
    toast({ title: 'Wallet connected', description: 'This is where your withdrawals will be sent.', variant: 'success' })
  }

  const disconnect = async () => {
    const res = await api.disconnectWallet()
    if (res.ok) toast({ title: 'Wallet disconnected', variant: 'info' })
  }

  const copy = () => {
    if (state.wallet) {
      navigator.clipboard?.writeText(state.wallet)
      toast({ title: 'Address copied', variant: 'info' })
    }
  }

  const applyCard = async () => {
    setApplyingCard(true)
    const res = await api.applyForCard()
    setApplyingCard(false)
    if (!res.ok) {
      toast({ title: 'Could not submit application', description: res.error, variant: 'error' })
      return
    }
    toast({ title: "You're on the Pulse Card waitlist", variant: 'success' })
  }

  const cardCopy = CARD_COPY[state.cardStatus]

  return (
    <div className="space-y-5">
      <SectionTitle title="Wallet" subtitle="Manage funds, connect a wallet, and review activity." icon={<Wallet className="size-5" />} />

      <Glass gold className="glow-edge animate-rise">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-wide text-gold">Cash wallet</p>
          <span className="flex size-8 items-center justify-center rounded-lg bg-gold-soft text-gold">
            <Wallet className="size-4" />
          </span>
        </div>
        <p className="mt-2 font-mono text-4xl font-semibold tracking-tight">${money(state.cash)}</p>
        <p className="mt-1 text-xs text-muted-foreground">Available to invest, withdraw, or send</p>
        <div className="mt-5 grid grid-cols-3 gap-2">
          <Button size="lg" className="h-11 w-full bg-gold font-semibold text-primary-foreground hover:bg-gold/90" onClick={() => openModal('deposit')}>
            <ArrowDownRight className="size-4" /> Deposit
          </Button>
          <Button size="lg" variant="outline" className="h-11 w-full border-white/12 bg-white/[0.03] font-semibold" onClick={() => openModal('withdraw')}>
            <ArrowUpRight className="size-4" /> Withdraw
          </Button>
          <Button size="lg" variant="outline" className="h-11 w-full border-white/12 bg-white/[0.03] font-semibold" onClick={() => openModal('transfer')}>
            <Send className="size-4" /> Send
          </Button>
        </div>
      </Glass>

      <Glass className="animate-rise">
        {state.wallet ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="flex size-10 items-center justify-center rounded-xl bg-green-soft text-green">
                <Wallet className="size-5" />
              </span>
              <div>
                <p className="text-sm font-semibold">Withdrawal wallet connected</p>
                <button onClick={copy} className="flex items-center gap-1 font-mono text-xs text-muted-foreground hover:text-foreground">
                  {state.wallet.slice(0, 8)}…{state.wallet.slice(-6)} <Copy className="size-3" />
                </button>
              </div>
            </div>
            <Button size="icon" variant="ghost" onClick={disconnect} aria-label="Disconnect wallet">
              <LogOut className="size-4" />
            </Button>
          </div>
        ) : (
          <div>
            <p className="text-sm font-semibold">No withdrawal wallet connected</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Add the address you want withdrawals sent to — USDT (TRC-20) or BTC.
            </p>
            <input
              value={addressInput}
              onChange={(e) => setAddressInput(e.target.value)}
              placeholder="Paste your receiving address"
              className="mt-3 w-full rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-3 text-sm outline-none transition-colors focus:border-gold/50 focus:ring-2 focus:ring-gold/20"
            />
            <Button
              size="lg"
              className="mt-3 h-11 w-full bg-gold font-semibold text-primary-foreground hover:bg-gold/90"
              disabled={connecting || addressInput.trim().length < 20}
              onClick={connect}
            >
              <Wallet className="size-4" /> {connecting ? 'Connecting…' : 'Connect wallet'}
            </Button>
          </div>
        )}
      </Glass>

      <Glass className="glow-edge animate-rise">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="flex size-8 items-center justify-center rounded-lg bg-gold-soft text-gold">
              <Coins className="size-4" />
            </span>
            <p className="text-sm font-semibold">PULSE wallet</p>
          </div>
          <span className="font-mono text-lg font-semibold text-gold">{money(state.pulse + state.staked, 0)}</span>
        </div>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-3.5 transition-colors">
            <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Liquid — usable now</p>
            <p className="mt-1.5 font-mono text-lg font-semibold">{money(state.pulse, 0)}</p>
          </div>
          <div className="rounded-2xl border border-gold/20 bg-gold/[0.05] p-3.5 transition-colors">
            <p className="text-[10px] uppercase tracking-wide text-gold">Staked — earning 24.8% APY</p>
            <p className="mt-1.5 font-mono text-lg font-semibold text-gold">{money(state.staked, 0)}</p>
          </div>
        </div>
        <p className="mt-3 text-[11px] text-muted-foreground">
          Unstaking moves PULSE from Staked to Liquid instantly — it stays in this wallet, ready to use or convert.
        </p>

        {state.pulse > 0 && (
          <div className="mt-4 border-t border-white/8 pt-4">
            {!sellOpen ? (
              <Button
                size="sm"
                variant="outline"
                className="w-full border-white/12 bg-white/[0.03] font-semibold"
                onClick={() => setSellOpen(true)}
              >
                <ArrowDownRight className="size-3.5" /> Sell PULSE for cash
              </Button>
            ) : (
              <div>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Sell liquid PULSE at ${TOKEN.salePrice.toFixed(2)} / token</span>
                  <button onClick={() => setSellOpen(false)} className="text-muted-foreground hover:text-foreground">
                    Cancel
                  </button>
                </div>
                <input
                  type="number"
                  inputMode="decimal"
                  value={sellAmount}
                  onChange={(e) => setSellAmount(e.target.value)}
                  placeholder={`Up to ${money(state.pulse, 0)} PULSE`}
                  className="mt-2 w-full rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-2.5 text-sm outline-none transition-colors focus:border-gold/50 focus:ring-2 focus:ring-gold/20"
                />
                <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                  <span>You receive</span>
                  <span className="font-mono font-semibold text-green">${money(sellUsdValue)} cash</span>
                </div>
                <Button
                  size="sm"
                  className="mt-3 w-full bg-gold font-semibold text-primary-foreground hover:bg-gold/90"
                  disabled={selling || sellPulseAmount <= 0}
                  onClick={submitSell}
                >
                  {selling ? 'Selling…' : 'Confirm sale'}
                </Button>
              </div>
            )}
          </div>
        )}
      </Glass>

      {/*
        Pulse Card — interface only, deliberately. No real card-issuer
        integration exists yet (needs a licensed partner like Marqeta or
        Stripe Issuing). This section shows real, live status pulled from
        card_applications, and gives every user a way to get on the list —
        so the moment a real issuer is connected, this UI already works,
        nothing here needs to change.
      */}
      <Glass className="animate-rise">
        <div className="mb-3 flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-xl bg-gold-soft text-gold">
            <CreditCard className="size-5" />
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <p className="text-sm font-semibold">Pulse Card</p>
              {state.cardStatus !== 'none' && (
                <Pill tone={state.cardStatus === 'waitlisted' ? 'muted' : 'gold'}>
                  {state.cardStatus === 'free_card_earned' ? 'free card' : state.cardStatus}
                </Pill>
              )}
            </div>
          </div>
        </div>

        {/* Visual card face — mockup only, not a real issued card */}
        <div className="mb-3 rounded-2xl bg-gradient-to-br from-gold/25 via-gold/10 to-transparent p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-gold">Pulse</span>
            <Wallet className="size-4 text-gold" />
          </div>
          <p className="mt-6 font-mono text-sm tracking-widest text-muted-foreground">
            {state.walletId ? `•••• •••• •••• ${state.walletId.slice(-4)}` : '•••• •••• •••• ••••'}
          </p>
          <p className="mt-2 text-[10px] text-muted-foreground">Linked to your Pulse Wallet — not yet active</p>
        </div>

        <p className="text-xs leading-relaxed text-muted-foreground">{cardCopy.body}</p>

        {state.cardStatus === 'none' && (
          <Button
            size="lg"
            className="mt-3 h-11 w-full bg-gold font-semibold text-primary-foreground hover:bg-gold/90"
            disabled={applyingCard}
            onClick={applyCard}
          >
            {applyingCard ? 'Submitting…' : cardCopy.title}
          </Button>
        )}
      </Glass>

      <div>
        <SectionTitle title="Activity" />
        <div className="space-y-2">
          {state.txns.map((t) => {
            const meta = txMeta[t.type]
            const Icon = meta.icon
            return (
              <div key={t.id} className="flex items-center gap-3 rounded-2xl glass px-4 py-3">
                <span className="flex size-9 items-center justify-center rounded-xl bg-white/[0.04]">
                  <Icon className={`size-4 ${meta.tone}`} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{t.label}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(t.date).toLocaleDateString()} · {t.status}
                  </p>
                </div>
                <span className={`font-mono text-sm font-semibold ${meta.tone}`}>
                  {meta.sign}
                  {t.currency === 'USDT' ? '$' : ''}
                  {money(t.amount, t.currency === 'PULSE' ? 0 : 2)} {t.currency === 'PULSE' ? 'PULSE' : ''}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      <RiskNote />
    </div>
  )
}
