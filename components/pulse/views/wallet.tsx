'use client'

import {
  ArrowDownRight,
  ArrowUpRight,
  Coins,
  Copy,
  LogOut,
  Sparkles,
  Wallet,
  Zap,
} from 'lucide-react'
import { money, usePulse, type Txn } from '../store'
import { Glass, RiskNote, SectionTitle } from '../ui-bits'
import { Button } from '@/components/ui/button'

declare global {
  interface Window {
    ethereum?: { request: (args: { method: string }) => Promise<string[]> }
  }
}

const txMeta: Record<Txn['type'], { icon: typeof ArrowDownRight; tone: string; sign: string }> = {
  deposit: { icon: ArrowDownRight, tone: 'text-green', sign: '+' },
  withdraw: { icon: ArrowUpRight, tone: 'text-destructive', sign: '-' },
  invest: { icon: ArrowUpRight, tone: 'text-gold', sign: '-' },
  sale: { icon: Sparkles, tone: 'text-gold', sign: '' },
  stake: { icon: Zap, tone: 'text-gold', sign: '' },
  unstake: { icon: Coins, tone: 'text-green', sign: '' },
}

export function WalletView() {
  const { state, dispatch, toast, openModal } = usePulse()

  const connect = async () => {
    try {
      if (typeof window !== 'undefined' && window.ethereum) {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' })
        if (accounts?.[0]) {
          dispatch({ type: 'CONNECT_WALLET', address: accounts[0] })
          toast({ title: 'Wallet connected', description: 'MetaMask linked successfully.', variant: 'success' })
          return
        }
      }
      // Fallback for environments without an injected wallet (e.g. preview / webview).
      const demo = '0x' + Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join('')
      dispatch({ type: 'CONNECT_WALLET', address: demo })
      toast({ title: 'Demo wallet connected', description: 'No injected wallet found — using a demo address.', variant: 'info' })
    } catch {
      toast({ title: 'Connection cancelled', variant: 'error' })
    }
  }

  const copy = () => {
    if (state.wallet) {
      navigator.clipboard?.writeText(state.wallet)
      toast({ title: 'Address copied', variant: 'info' })
    }
  }

  return (
    <div className="space-y-5">
      <SectionTitle title="Wallet" subtitle="Manage funds, connect a wallet, and review activity." icon={<Wallet className="size-5" />} />

      <Glass gold className="animate-rise">
        <p className="text-xs uppercase tracking-wide text-gold">Available balance</p>
        <p className="mt-1 font-mono text-3xl font-semibold">${money(state.cash)}</p>
        <div className="mt-4 grid grid-cols-2 gap-3">
          <Button size="lg" className="h-11 w-full bg-gold font-semibold text-primary-foreground hover:bg-gold/90" onClick={() => openModal('deposit')}>
            <ArrowDownRight className="size-4" /> Deposit
          </Button>
          <Button size="lg" variant="outline" className="h-11 w-full border-white/12 bg-white/[0.03] font-semibold" onClick={() => openModal('withdraw')}>
            <ArrowUpRight className="size-4" /> Withdraw
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
                <p className="text-sm font-semibold">Connected</p>
                <button onClick={copy} className="flex items-center gap-1 font-mono text-xs text-muted-foreground hover:text-foreground">
                  {state.wallet.slice(0, 8)}…{state.wallet.slice(-6)} <Copy className="size-3" />
                </button>
              </div>
            </div>
            <Button size="icon" variant="ghost" onClick={() => dispatch({ type: 'DISCONNECT_WALLET' })} aria-label="Disconnect wallet">
              <LogOut className="size-4" />
            </Button>
          </div>
        ) : (
          <div className="text-center">
            <p className="text-sm font-semibold">No wallet connected</p>
            <p className="mt-1 text-xs text-muted-foreground">Connect MetaMask to enable withdrawals to your address.</p>
            <Button size="lg" className="mt-4 h-11 w-full bg-gold font-semibold text-primary-foreground hover:bg-gold/90" onClick={connect}>
              <Wallet className="size-4" /> Connect MetaMask
            </Button>
          </div>
        )}
      </Glass>

      <Glass className="animate-rise">
        <div className="mb-2 flex items-center justify-between">
          <p className="text-sm font-semibold">PULSE token</p>
          <span className="font-mono text-sm">{money(state.pulse + state.staked, 0)}</span>
        </div>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="rounded-2xl bg-white/[0.03] p-3">
            <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Liquid</p>
            <p className="mt-1 font-mono font-semibold">{money(state.pulse, 0)}</p>
          </div>
          <div className="rounded-2xl bg-white/[0.03] p-3">
            <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Staked</p>
            <p className="mt-1 font-mono font-semibold text-gold">{money(state.staked, 0)}</p>
          </div>
        </div>
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
