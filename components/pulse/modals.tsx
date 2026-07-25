'use client'

import { useEffect, useState, type ReactNode } from 'react'
import { ArrowDownRight, ArrowUpRight, Copy, Send, ShieldCheck, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { money, usePulse } from './store'
import { RiskNote } from './ui-bits'
import { PLATFORM_WALLETS, PROJECTS, tierForAmount } from '@/lib/pulse-data'
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
  if (modal.type === 'transfer') return <TransferModal onClose={closeModal} />
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

function SavedWalletsPanel({ context }: { context?: boolean }) {
  const { state, api, toast } = usePulse()
  const [adding, setAdding] = useState(false)
  const [label, setLabel] = useState('')
  const [address, setAddress] = useState('')
  const [busyId, setBusyId] = useState<string | null>(null)

  const useWallet = async (addr: string) => {
    setBusyId(addr)
    const res = await api.connectWallet(addr)
    setBusyId(null)
    if (!res.ok) toast({ title: 'Could not select wallet', description: res.error, variant: 'error' })
  }

  const saveNew = async () => {
    if (address.trim().length < 20) {
      toast({ title: "That doesn't look like a valid address", variant: 'error' })
      return
    }
    setBusyId('new')
    const res = await api.addSavedWallet(label || 'Wallet', address.trim())
    if (!res.ok) {
      setBusyId(null)
      toast({ title: 'Could not save wallet', description: res.error, variant: 'error' })
      return
    }
    await api.connectWallet(address.trim())
    setBusyId(null)
    setAdding(false)
    setLabel('')
    setAddress('')
    toast({ title: 'Wallet saved and selected', variant: 'success' })
  }

  const remove = async (id: string) => {
    setBusyId(id)
    const res = await api.removeSavedWallet(id)
    setBusyId(null)
    if (!res.ok) toast({ title: 'Could not remove wallet', description: res.error, variant: 'error' })
  }

  return (
    <div className="mb-4">
      <div className="mb-2 flex items-center justify-between">
        <p className="text-xs font-medium text-muted-foreground">
          {context ? 'Your saved wallets' : 'Choose a receiving wallet'}
        </p>
        {!adding && (
          <button onClick={() => setAdding(true)} className="text-xs font-medium text-gold">
            + Add wallet
          </button>
        )}
      </div>

      {state.savedWallets.length === 0 && !adding && (
        <p className="rounded-xl bg-white/[0.03] px-3.5 py-3 text-xs text-muted-foreground">
          No wallets saved yet. {context ? 'Add one so it\'s ready when you withdraw.' : 'Add the address you want withdrawals sent to.'}
        </p>
      )}

      <div className="space-y-2">
        {state.savedWallets.map((w) => {
          const active = state.wallet === w.address
          return (
            <div
              key={w.id}
              className={cn(
                'flex items-center gap-2 rounded-xl border px-3.5 py-2.5',
                active ? 'border-gold/50 bg-gold-soft' : 'border-white/8 bg-white/[0.03]',
              )}
            >
              <button onClick={() => useWallet(w.address)} disabled={busyId === w.address} className="min-w-0 flex-1 text-left">
                <p className={cn('truncate text-xs font-semibold', active && 'text-gold')}>{w.label}</p>
                <p className="truncate font-mono text-[11px] text-muted-foreground">
                  {w.address.slice(0, 8)}…{w.address.slice(-6)}
                </p>
              </button>
              {active && <span className="shrink-0 text-[10px] font-semibold text-gold">ACTIVE</span>}
              <button onClick={() => remove(w.id)} disabled={busyId === w.id} className="shrink-0 text-muted-foreground hover:text-destructive" aria-label="Remove wallet">
                <X className="size-3.5" />
              </button>
            </div>
          )
        })}
      </div>

      {adding && (
        <div className="mt-2 space-y-2 rounded-xl border border-white/8 bg-white/[0.03] p-3">
          <input
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="Label (e.g. My Binance wallet)"
            className={inputCls}
          />
          <input
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Address (USDT TRC-20 or BTC)"
            className={inputCls}
          />
          <div className="flex gap-2">
            <Button size="sm" className="flex-1 bg-gold font-semibold text-primary-foreground hover:bg-gold/90" disabled={busyId === 'new'} onClick={saveNew}>
              {busyId === 'new' ? 'Saving…' : 'Save & use'}
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setAdding(false)}>
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

function DepositModal({ onClose }: { onClose: () => void }) {
  const { api, busy, toast } = usePulse()
  const [currency, setCurrency] = useState<'usdttrc20' | 'btc'>('usdttrc20')
  const [amount, setAmount] = useState('100')
  const [txRef, setTxRef] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const usd = Number(amount) || 0
  const address = PLATFORM_WALLETS[currency]
  const label = currency === 'btc' ? 'BTC' : 'USDT (TRC-20)'

  const copyAddress = () => {
    navigator.clipboard?.writeText(address)
    toast({ title: 'Address copied', variant: 'info' })
  }

  const submit = async () => {
    if (usd <= 0) {
      toast({ title: 'Enter a valid amount', variant: 'error' })
      return
    }
    if (!txRef.trim()) {
      toast({ title: 'Enter your transaction reference / TXID', description: 'This is how we match your payment to your account.', variant: 'error' })
      return
    }
    setSubmitting(true)
    const res = await api.deposit(usd, currency, txRef.trim())
    setSubmitting(false)
    if (!res.ok) {
      toast({ title: 'Deposit failed', description: res.error, variant: 'error' })
      return
    }
    toast({ title: 'Deposit submitted', description: 'Pending admin verification — this can take a little while.', variant: 'info' })
    onClose()
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

      <div className="mt-4">
        <span className="mb-1.5 block text-xs font-medium text-muted-foreground">Send to this address</span>
        <div className="flex items-center gap-2 rounded-xl border border-white/8 bg-white/[0.03] px-3.5 py-2.5">
          <span className="flex-1 truncate font-mono text-xs">{address}</span>
          <button onClick={copyAddress} className="flex items-center gap-1 text-gold" aria-label="Copy deposit address">
            <Copy className="size-3.5" /> Copy
          </button>
        </div>
        <p className="mt-1.5 text-[11px] text-muted-foreground">
          Only send {label}. Sending on the wrong network will result in lost funds.
        </p>
      </div>

      <Field label="Transaction reference / TXID" className="mt-4">
        <input
          type="text"
          className={inputCls}
          placeholder="Paste the transaction hash from your wallet"
          value={txRef}
          onChange={(e) => setTxRef(e.target.value)}
        />
      </Field>
      <p className="mt-1.5 text-[11px] text-muted-foreground">
        After you send the payment on your side, paste the transaction ID here so we can match it to your deposit.
      </p>

      <div className="mt-4 space-y-2 rounded-2xl bg-white/[0.03] p-4 text-sm">
        <Row label="Pay with" value={label} />
        <Row label="Credited on approval" value={`$${money(usd)}`} tone="green" />
      </div>

      <p className="mt-3 text-xs text-muted-foreground">
        Your deposit stays pending until an admin confirms your transaction on-chain and approves it.
      </p>

      <Button
        size="lg"
        className="mt-4 h-12 w-full bg-gold text-base font-semibold text-primary-foreground hover:bg-gold/90"
        disabled={usd <= 0 || !txRef.trim() || submitting || busy}
        onClick={submit}
      >
        {submitting ? 'Submitting…' : `Submit deposit — $${money(usd)}`}
      </Button>
    </ModalShell>
  )
}

function WithdrawModal({ onClose }: { onClose: () => void }) {
  const { state, api, busy, toast, openModal } = usePulse()
  const [amount, setAmount] = useState('50')
  const [address, setAddress] = useState(state.wallet ?? '')
  const [network, setNetwork] = useState('USDT (TRC-20)')
  const [broker, setBroker] = useState('')
  const usd = Number(amount) || 0
  const insufficient = usd > state.cash

  const submit = async () => {
    if (state.kyc !== 'verified') {
      toast({ title: 'Verification required', description: 'Complete KYC before withdrawing.', variant: 'error' })
      onClose()
      openModal('kyc')
      return
    }
    if (!address.trim()) {
      toast({ title: 'Enter the wallet address you want your withdrawal sent to', variant: 'error' })
      return
    }
    if (insufficient) {
      toast({ title: 'Amount exceeds balance', variant: 'error' })
      return
    }
    const res = await api.withdraw(usd, address.trim(), network, broker)
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
        <Row label="KYC status" value={state.kyc === 'verified' ? 'Verified' : 'Required'} tone={state.kyc === 'verified' ? 'green' : 'danger'} />
      </div>

      <SavedWalletsPanel />

      <Field label="Amount (USDT)">
        <input type="number" inputMode="decimal" className={inputCls} value={amount} onChange={(e) => setAmount(e.target.value)} />
      </Field>

      <Field label="Wallet address" className="mt-4">
        <input
          type="text"
          className={inputCls}
          placeholder="Paste the receiving wallet address"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
        />
      </Field>

      <Field label="Network" className="mt-4">
        <select
          className={inputCls}
          value={network}
          onChange={(e) => setNetwork(e.target.value)}
        >
          <option>USDT (TRC-20)</option>
          <option>USDT (ERC-20)</option>
          <option>USDT (BEP-20)</option>
          <option>BTC</option>
        </select>
      </Field>
      <p className="mt-1.5 text-[11px] text-muted-foreground">
        Choose the network your receiving wallet actually supports — sending on the wrong one loses funds and can't be
        reversed.
      </p>

      <Field label="Exchange / broker (optional)" className="mt-4">
        <input
          type="text"
          className={inputCls}
          placeholder="e.g. Binance, Bybit, your personal wallet"
          value={broker}
          onChange={(e) => setBroker(e.target.value)}
        />
      </Field>

      <Button
        size="lg"
        className="mt-4 h-12 w-full bg-gold text-base font-semibold text-primary-foreground hover:bg-gold/90"
        disabled={usd <= 0 || busy || !address.trim()}
        onClick={submit}
      >
        Request withdrawal
      </Button>
      <p className="mt-3 text-xs text-muted-foreground">Withdrawals are reviewed and disbursed by the platform admin.</p>
    </ModalShell>
  )
}

function TransferModal({ onClose }: { onClose: () => void }) {
  const { state, api, busy, toast, openModal } = usePulse()
  const [recipient, setRecipient] = useState('')
  const [amount, setAmount] = useState('20')
  const usd = Number(amount) || 0
  const insufficient = usd > state.cash

  const submit = async () => {
    if (state.kyc !== 'verified') {
      toast({ title: 'Verification required', description: 'Complete KYC before sending funds.', variant: 'error' })
      onClose()
      openModal('kyc')
      return
    }
    if (!recipient.trim()) {
      toast({ title: 'Enter a username or Pulse ID', variant: 'error' })
      return
    }
    if (insufficient) {
      toast({ title: 'Amount exceeds balance', variant: 'error' })
      return
    }
    const res = await api.transfer(recipient.trim(), usd)
    if (!res.ok) {
      toast({ title: 'Transfer failed', description: res.error, variant: 'error' })
      return
    }
    toast({ title: 'Transfer requested', description: 'Held pending admin approval, for both your safety.', variant: 'info' })
    onClose()
  }

  return (
    <ModalShell title="Send to another user" icon={<Send className="size-5" />} onClose={onClose}>
      <div className="mb-4 rounded-2xl bg-white/[0.03] p-4 text-sm">
        <Row label="Available balance" value={`$${money(state.cash)}`} />
        <Row label="KYC status" value={state.kyc === 'verified' ? 'Verified' : 'Required'} tone={state.kyc === 'verified' ? 'green' : 'danger'} />
      </div>
      <Field label="Recipient username or Pulse ID">
        <input
          className={inputCls}
          value={recipient}
          onChange={(e) => setRecipient(e.target.value)}
          placeholder="@username or PLS-XXXXXX"
        />
      </Field>
      <div className="mt-3">
        <Field label="Amount (USD)">
          <input type="number" inputMode="decimal" className={inputCls} value={amount} onChange={(e) => setAmount(e.target.value)} />
        </Field>
      </div>
      <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
        For safety, transfers are held and reviewed by an admin before the recipient is credited — the same as
        deposits and withdrawals. Your balance is deducted now and refunded in full if the transfer is declined.
      </p>
      <Button
        size="lg"
        className="mt-4 h-12 w-full bg-gold text-base font-semibold text-primary-foreground hover:bg-gold/90"
        disabled={usd <= 0 || busy || !recipient.trim()}
        onClick={submit}
      >
        Send ${money(usd)}
      </Button>
    </ModalShell>
  )
}

const inputCls =
  'w-full rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-3 text-sm outline-none transition-colors focus:border-gold/50 focus:ring-2 focus:ring-gold/20'

function Field({ label, children, className }: { label: string; children: ReactNode; className?: string }) {
  return (
    <label className={cn('block', className)}>
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
