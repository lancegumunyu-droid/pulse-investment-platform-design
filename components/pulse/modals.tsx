'use client'

import { useEffect, useState, type ReactNode } from 'react'
import { ArrowDownRight, ArrowUpRight, ShieldCheck, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { money, usePulse } from './store'
import { RiskNote } from './ui-bits'
import { PROJECTS, tierForAmount } from '@/lib/pulse-data'
import { cn } from '@/lib/utils'

const KYC_REQUIRED_ABOVE = 500

function ModalShell({
  title,
  icon,
  children,
  onClose,
}: {
  title: string
  icon: ReactNode
  children: ReactNode
  onClose: () => void
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [onClose])

  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center sm:items-center">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} aria-hidden />
      <div className="animate-rise relative z-10 max-h-[92vh] w-full max-w-md overflow-y-auto rounded-t-3xl glass p-5 no-scrollbar sm:rounded-3xl">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="flex size-9 items-center justify-center rounded-xl bg-gold-soft text-gold">{icon}</span>
            <h3 className="text-lg font-semibold tracking-tight">{title}</h3>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground" aria-label="Close">
            <X className="size-5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}

export function Modals() {
  const { modal, closeModal } = usePulse()
  if (!modal.type) return null
  if (modal.type === 'kyc') return <KycModal onClose={closeModal} />
  if (modal.type === 'invest') return <InvestModal onClose={closeModal} />
  if (modal.type === 'deposit') return <DepositModal onClose={closeModal} />
  if (modal.type === 'withdraw') return <WithdrawModal onClose={closeModal} />
  return null
}

function KycModal({ onClose }: { onClose: () => void }) {
  const { api, busy, toast, state } = usePulse()
  const [step, setStep] = useState(state.kyc === 'pending' ? 2 : 0)
  const [form, setForm] = useState({ name: '', country: 'Botswana', idNumber: '', dob: '', phone: '', address: '' })

  const submit = async () => {
    const res = await api.submitKyc({
      fullName: form.name,
      idNumber: form.idNumber,
      dateOfBirth: form.dob || undefined,
      country: form.country,
      phone: form.phone,
      address: form.address,
    })
    if (!res.ok) {
      toast({ title: 'Could not submit', description: res.error, variant: 'error' })
      return
    }
    setStep(2)
    toast({
      title: 'Submitted for review',
      description: 'Our team will verify your identity shortly.',
      variant: 'success',
    })
    setTimeout(onClose, 1200)
  }

  const canSubmit = form.name && form.idNumber && form.dob && form.phone && form.address

  return (
    <ModalShell title="Identity verification" icon={<ShieldCheck className="size-5" />} onClose={onClose}>
      {step < 2 ? (
        <>
          <p className="mb-4 text-sm leading-relaxed text-muted-foreground">
            KYC is required to protect investors and comply with SADC financial regulations. You must be 18 or older
            to invest with Pulse. Your details are used only for verification.
          </p>
          <div className="space-y-3">
            <Field label="Full legal name">
              <input
                className={inputCls}
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. Thabo Nkosi"
              />
            </Field>
            <Field label="Country of residence">
              <select
                className={inputCls}
                value={form.country}
                onChange={(e) => setForm({ ...form, country: e.target.value })}
              >
                {['Botswana', 'South Africa', 'Zambia', 'Zimbabwe', 'Namibia', 'Mozambique', 'Malawi'].map((c) => (
                  <option key={c} value={c} className="bg-background">
                    {c}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="National ID / Passport number">
              <input
                className={inputCls}
                value={form.idNumber}
                onChange={(e) => setForm({ ...form, idNumber: e.target.value })}
                placeholder="ID number"
              />
            </Field>
            <Field label="Date of birth">
              <input
                type="date"
                className={inputCls}
                value={form.dob}
                onChange={(e) => setForm({ ...form, dob: e.target.value })}
              />
            </Field>
            <Field label="Phone number">
              <input
                type="tel"
                className={inputCls}
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="+267 71 234 567"
              />
            </Field>
            <Field label="Residential address">
              <input
                className={inputCls}
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                placeholder="Street, city, postal code"
              />
            </Field>
          </div>
          <Button
            variant="default"
            size="lg"
            className="mt-5 h-12 w-full bg-gold text-base font-semibold text-primary-foreground hover:bg-gold/90"
            disabled={!canSubmit || busy}
            onClick={submit}
          >
            Submit for verification
          </Button>
          <p className="mt-3 text-center text-xs text-muted-foreground">A Pulse admin reviews every submission before approval.</p>
        </>
      ) : (
        <div className="flex flex-col items-center py-8 text-center">
          <span className="flex size-14 items-center justify-center rounded-2xl bg-gold-soft text-gold">
            <ShieldCheck className="size-7 animate-pulse" />
          </span>
          <p className="mt-4 font-semibold">Submitted for review</p>
          <p className="mt-1 text-sm text-muted-foreground">You&apos;ll get full access once an admin approves your identity.</p>
        </div>
      )}
    </ModalShell>
  )
}

function InvestModal({ onClose }: { onClose: () => void }) {
  const { state, api, busy, toast, openModal, modal } = usePulse()
  const projectId = (modal.payload?.projectId as string) || PROJECTS[0].id
  const preset = modal.payload?.amount as number | undefined
  const project = PROJECTS.find((p) => p.id === projectId) || PROJECTS[0]
  const [amount, setAmount] = useState(String(preset ?? 75))

  const value = Number(amount) || 0
  const tier = tierForAmount(state.holdings.reduce((s, h) => s + h.amount, 0) + value)
  const insufficient = value > state.cash
  const needsKyc = value > KYC_REQUIRED_ABOVE && state.kyc !== 'verified'

  const confirm = async () => {
    if (needsKyc) {
      toast({ title: 'Verification required', description: `KYC is required for investments over $${KYC_REQUIRED_ABOVE}.`, variant: 'error' })
      onClose()
      openModal('kyc')
      return
    }
    if (insufficient) {
      toast({ title: 'Insufficient balance', description: 'Deposit funds before investing.', variant: 'error' })
      onClose()
      openModal('deposit')
      return
    }
    const res = await api.invest(value, projectId)
    if (!res.ok) {
      toast({ title: 'Investment failed', description: res.error, variant: 'error' })
      return
    }
    toast({ title: 'Investment confirmed', description: `$${money(value)} allocated to ${project.name}.`, variant: 'success' })
    onClose()
  }

  return (
    <ModalShell title={`Invest — ${project.name}`} icon={<ArrowUpRight className="size-5" />} onClose={onClose}>
      <div className="mb-4 rounded-2xl bg-white/[0.03] p-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">{project.country} · {project.sector}</span>
          <span className="font-medium text-green">{project.targetYield} target</span>
        </div>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{project.summary}</p>
      </div>

      <Field label="Amount (USDT)">
        <input
          type="number"
          inputMode="decimal"
          className={inputCls}
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
      </Field>
      <div className="mt-2 flex gap-2">
        {[75, 150, 300, 750].map((v) => (
          <button
            key={v}
            onClick={() => setAmount(String(v))}
            className="flex-1 rounded-xl border border-white/8 bg-white/[0.03] py-2 text-xs font-medium hover:border-gold/40"
          >
            ${v}
          </button>
        ))}
      </div>

      <div className="mt-4 space-y-2 rounded-2xl bg-white/[0.03] p-4 text-sm">
        <Row label="Available balance" value={`$${money(state.cash)}`} />
        <Row label="Resulting tier" value={tier.name} tone="gold" />
        <Row label="Target yield range" value={tier.yieldLabel} tone="green" />
      </div>

      {needsKyc ? (
        <p className="mt-3 text-xs text-gold">Investments over ${KYC_REQUIRED_ABOVE} require identity verification.</p>
      ) : null}

      <Button
        size="lg"
        className={cn(
          'mt-4 h-12 w-full text-base font-semibold',
          'bg-gold text-primary-foreground hover:bg-gold/90',
        )}
        disabled={value <= 0 || busy}
        onClick={confirm}
      >
        {insufficient ? 'Deposit to continue' : `Confirm $${money(value)} investment`}
      </Button>
      <RiskNote className="mt-4" />
    </ModalShell>
  )
}

interface PayInfo {
  payAddress: string
  payAmount: number
  payCurrency: string
}

function DepositModal({ onClose }: { onClose: () => void }) {
  const { api, busy, toast, refresh } = usePulse()
  const [currency, setCurrency] = useState<'usdttrc20' | 'btc'>('usdttrc20')
  const [amount, setAmount] = useState('100')
  const [processing, setProcessing] = useState(false)
  const [payInfo, setPayInfo] = useState<PayInfo | null>(null)

  const usd = Number(amount) || 0
  const label = currency === 'btc' ? 'BTC' : 'USDT (TRC-20)'

  const pay = async () => {
    setProcessing(true)
    try {
      const res = await fetch('/api/nowpayments/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: usd, payCurrency: currency }),
      })
      if (res.status === 501) {
        const r = await api.deposit(usd)
        if (!r.ok) {
          toast({ title: 'Deposit failed', description: r.error, variant: 'error' })
          return
        }
        toast({ title: 'Deposit requested', description: `$${money(usd)} pending admin approval.`, variant: 'info' })
        onClose()
        return
      }
      const data = await res.json()
      if (!res.ok) {
        toast({ title: 'Could not start payment', description: data?.message ?? 'Try again.', variant: 'error' })
        return
      }
      setPayInfo({ payAddress: data.payAddress, payAmount: data.payAmount, payCurrency: data.payCurrency })
      toast({ title: 'Payment created', description: 'Send the exact amount to the address shown.', variant: 'info' })
    } catch {
      toast({ title: 'Network error', description: 'Please try again.', variant: 'error' })
    } finally {
      setProcessing(false)
    }
  }

  if (payInfo) {
    return (
      <ModalShell title="Complete your deposit" icon={<ArrowDownRight className="size-5" />} onClose={onClose}>
        <p className="mb-4 text-sm leading-relaxed text-muted-foreground">
          Send exactly the amount below. Your deposit is credited once the payment is confirmed on-chain and approved
          by an admin.
        </p>
        <div className="space-y-2 rounded-2xl bg-white/[0.03] p-4 text-sm">
          <Row label="Send amount" value={`${payInfo.payAmount} ${payInfo.payCurrency.toUpperCase()}`} tone="gold" />
          <Row label="Credited" value={`$${money(usd)}`} tone="green" />
        </div>
        <div className="mt-3">
          <span className="mb-1.5 block text-xs font-medium text-muted-foreground">Deposit address</span>
          <div className="flex items-center gap-2 rounded-xl border border-white/8 bg-white/[0.03] px-3.5 py-2.5">
            <span className="flex-1 truncate font-mono text-xs">{payInfo.payAddress}</span>
            <button
              onClick={() => {
                navigator.clipboard?.writeText(payInfo.payAddress)
                toast({ title: 'Address copied', variant: 'info' })
              }}
              className="text-gold"
              aria-label="Copy deposit address"
            >
              Copy
            </button>
          </div>
        </div>
        <Button
          size="lg"
          variant="outline"
          className="mt-4 h-11 w-full border-white/12 bg-white/[0.03] font-semibold"
          onClick={() => refresh()}
        >
          Refresh balance
        </Button>
        <p className="mt-3 text-xs text-muted-foreground">
          Confirmation can take a few minutes depending on network conditions.
        </p>
      </ModalShell>
    )
  }

  return (
    <ModalShell title="Deposit funds" icon={<ArrowDownRight className="size-5" />} onClose={onClose}>
      <div className="mb-4 grid grid-cols-2 gap-2">
        {(['usdttrc20', 'btc'] as const).map((c) => (
          <button
            key={c}
            onClick={() => setCurrency(c)}
            className={cn(
              'rounded-2xl border px-4 py-3 text-sm font-semibold transition-colors',
              currency === c ? 'border-gold/50 bg-gold-soft text-gold' : 'border-white/8 bg-white/[0.03] text-muted-foreground',
            )}
          >
            {c === 'btc' ? 'BTC' : 'USDT'}
          </button>
        ))}
      </div>
      <Field label="Amount (USD)">
        <input type="number" inputMode="decimal" className={inputCls} value={amount} onChange={(e) => setAmount(e.target.value)} />
      </Field>
      <div className="mt-4 space-y-2 rounded-2xl bg-white/[0.03] p-4 text-sm">
        <Row label="Pay with" value={label} />
        <Row label="You receive" value={`$${money(usd)} balance`} tone="green" />
        <Row label="Network fee" value="Covered by Pulse" />
      </div>
      <p className="mt-3 text-xs text-muted-foreground">
        Crypto deposits are processed by NOWPayments and credited after admin approval.
      </p>
      <Button
        size="lg"
        className="mt-4 h-12 w-full bg-gold text-base font-semibold text-primary-foreground hover:bg-gold/90"
        disabled={usd <= 0 || processing || busy}
        onClick={pay}
      >
        {processing ? 'Starting payment…' : `Deposit $${money(usd)}`}
      </Button>
    </ModalShell>
  )
}

function WithdrawModal({ onClose }: { onClose: () => void }) {
  const { state, api, busy, toast, openModal } = usePulse()
  const [amount, setAmount] = useState('50')
  const [walletInput, setWalletInput] = useState('')
  const [connecting, setConnecting] = useState(false)
  const usd = Number(amount) || 0
  const insufficient = usd > state.cash

  const connect = async () => {
    const addr = walletInput.trim()
    if (addr.length < 20) {
      toast({ title: 'That doesn\'t look like a valid address', variant: 'error' })
      return
    }
    setConnecting(true)
    const res = await api.connectWallet(addr)
    setConnecting(false)
    if (!res.ok) {
      toast({ title: 'Could not connect wallet', description: res.error, variant: 'error' })
      return
    }
    toast({ title: 'Wallet connected', variant: 'success' })
  }

  const submit = async () => {
    if (state.kyc !== 'verified') {
      toast({ title: 'Verification required', description: 'Complete KYC before withdrawing.', variant: 'error' })
      onClose()
      openModal('kyc')
      return
    }
    if (!state.wallet) {
      toast({ title: 'Connect a wallet first', description: 'Add the address you want your withdrawal sent to.', variant: 'error' })
      return
    }
    if (insufficient) {
      toast({ title: 'Amount exceeds balance', variant: 'error' })
      return
    }
    const res = await api.withdraw(usd)
    if (!res.ok) {
      toast({ title: 'Withdrawal failed', description: res.error, variant: 'error' })
      return
    }
    toast({ title: 'Withdrawal requested', description: 'Funds will arrive after admin approval.', variant: 'info' })
    onClose()
  }

  return (
    <ModalShell title="Withdraw to wallet" icon={<ArrowUpRight className="size-5" />} onClose={onClose}>
      <div className="mb-4 rounded-2xl bg-white/[0.03] p-4 text-sm">
        <Row label="Withdrawable balance" value={`$${money(state.cash)}`} />
        <Row label="Destination" value={state.wallet ? `${state.wallet.slice(0, 6)}…${state.wallet.slice(-4)}` : 'Not connected'} tone={state.wallet ? 'gold' : 'danger'} />
        <Row label="KYC status" value={state.kyc === 'verified' ? 'Verified' : 'Required'} tone={state.kyc === 'verified' ? 'green' : 'danger'} />
      </div>

      {!state.wallet ? (
        <div className="mb-4">
          <Field label="Your wallet address (USDT TRC-20 or BTC)">
            <input
              className={inputCls}
              value={walletInput}
              onChange={(e) => setWalletInput(e.target.value)}
              placeholder="Paste the address you want to receive funds at"
            />
          </Field>
          <Button
            size="sm"
            variant="outline"
            className="mt-2 w-full border-white/12 bg-white/[0.03]"
            disabled={connecting || walletInput.trim().length < 20}
            onClick={connect}
          >
            {connecting ? 'Connecting…' : 'Connect wallet'}
          </Button>
          <p className="mt-2 text-[11px] text-muted-foreground">
            This is where withdrawals will be sent. You can change it any time before requesting a withdrawal.
          </p>
        </div>
      ) : (
        <button onClick={() => api.disconnectWallet()} className="mb-4 text-[11px] text-muted-foreground underline">
          Disconnect and use a different address
        </button>
      )}

      <Field label="Amount (USDT)">
        <input type="number" inputMode="decimal" className={inputCls} value={amount} onChange={(e) => setAmount(e.target.value)} />
      </Field>
      <Button
        size="lg"
        className="mt-4 h-12 w-full bg-gold text-base font-semibold text-primary-foreground hover:bg-gold/90"
        disabled={usd <= 0 || busy || !state.wallet}
        onClick={submit}
      >
        Request withdrawal
      </Button>
      <p className="mt-3 text-xs text-muted-foreground">Withdrawals are reviewed and disbursed by the platform admin.</p>
    </ModalShell>
  )
}

const inputCls =
  'w-full rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-3 text-sm outline-none transition-colors focus:border-gold/50 focus:ring-2 focus:ring-gold/20'

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-muted-foreground">{label}</span>
      {children}
    </label>
  )
}

function Row({ label, value, tone }: { label: string; value: string; tone?: 'gold' | 'green' | 'danger' }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span
        className={cn(
          'font-medium',
          tone === 'gold' && 'text-gold',
          tone === 'green' && 'text-green',
          tone === 'danger' && 'text-destructive',
        )}
      >
        {value}
      </span>
    </div>
  )
}
