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
  const { dispatch, toast, state } = usePulse()
  const [step, setStep] = useState(state.kyc === 'pending' ? 2 : 0)
  const [form, setForm] = useState({ name: '', country: 'Botswana', idNumber: '', dob: '' })

  const submit = () => {
    dispatch({ type: 'SET_KYC', status: 'pending' })
    setStep(2)
    setTimeout(() => {
      dispatch({ type: 'SET_KYC', status: 'verified' })
      toast({ title: 'Identity verified', description: 'You now have full access to Pulse.', variant: 'success' })
      onClose()
    }, 1800)
  }

  return (
    <ModalShell title="Identity verification" icon={<ShieldCheck className="size-5" />} onClose={onClose}>
      {step < 2 ? (
        <>
          <p className="mb-4 text-sm leading-relaxed text-muted-foreground">
            KYC is required to protect investors and comply with SADC financial regulations. Your details are used only
            for verification in this demo.
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
          </div>
          <Button
            variant="default"
            size="lg"
            className="mt-5 h-12 w-full bg-gold text-base font-semibold text-primary-foreground hover:bg-gold/90"
            disabled={!form.name || !form.idNumber || !form.dob}
            onClick={submit}
          >
            Submit for verification
          </Button>
          <p className="mt-3 text-center text-xs text-muted-foreground">Verification usually completes instantly in this demo.</p>
        </>
      ) : (
        <div className="flex flex-col items-center py-8 text-center">
          <span className="flex size-14 items-center justify-center rounded-2xl bg-gold-soft text-gold">
            <ShieldCheck className="size-7 animate-pulse" />
          </span>
          <p className="mt-4 font-semibold">Reviewing your details…</p>
          <p className="mt-1 text-sm text-muted-foreground">This will only take a moment.</p>
        </div>
      )}
    </ModalShell>
  )
}

function InvestModal({ onClose }: { onClose: () => void }) {
  const { state, dispatch, toast, openModal } = usePulse()
  const projectId = (usePulse().modal.payload?.projectId as string) || PROJECTS[0].id
  const preset = usePulse().modal.payload?.amount as number | undefined
  const project = PROJECTS.find((p) => p.id === projectId) || PROJECTS[0]
  const [amount, setAmount] = useState(String(preset ?? 75))

  const value = Number(amount) || 0
  const tier = tierForAmount(state.holdings.reduce((s, h) => s + h.amount, 0) + value)
  const insufficient = value > state.cash
  const needsKyc = value > KYC_REQUIRED_ABOVE && state.kyc !== 'verified'

  const confirm = () => {
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
    dispatch({ type: 'INVEST', amount: value, projectId })
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
        disabled={value <= 0}
        onClick={confirm}
      >
        {insufficient ? 'Deposit to continue' : `Confirm $${money(value)} investment`}
      </Button>
      <RiskNote className="mt-4" />
    </ModalShell>
  )
}

function DepositModal({ onClose }: { onClose: () => void }) {
  const { dispatch, toast } = usePulse()
  const [currency, setCurrency] = useState<'USDT' | 'BTC'>('USDT')
  const [amount, setAmount] = useState('100')
  const [processing, setProcessing] = useState(false)

  const usd = Number(amount) || 0
  const btcRate = 68000
  const cryptoAmount = currency === 'USDT' ? usd : usd / btcRate

  const pay = () => {
    setProcessing(true)
    // Simulated NOWPayments confirmation flow.
    setTimeout(() => {
      dispatch({ type: 'DEPOSIT', amount: usd, currency: 'USDT' })
      toast({ title: 'Deposit confirmed', description: `$${money(usd)} credited via ${currency}.`, variant: 'success' })
      setProcessing(false)
      onClose()
    }, 1600)
  }

  return (
    <ModalShell title="Deposit funds" icon={<ArrowDownRight className="size-5" />} onClose={onClose}>
      <div className="mb-4 grid grid-cols-2 gap-2">
        {(['USDT', 'BTC'] as const).map((c) => (
          <button
            key={c}
            onClick={() => setCurrency(c)}
            className={cn(
              'rounded-2xl border px-4 py-3 text-sm font-semibold transition-colors',
              currency === c ? 'border-gold/50 bg-gold-soft text-gold' : 'border-white/8 bg-white/[0.03] text-muted-foreground',
            )}
          >
            {c}
          </button>
        ))}
      </div>
      <Field label="Amount (USD)">
        <input type="number" inputMode="decimal" className={inputCls} value={amount} onChange={(e) => setAmount(e.target.value)} />
      </Field>
      <div className="mt-4 space-y-2 rounded-2xl bg-white/[0.03] p-4 text-sm">
        <Row label="You pay" value={`${currency === 'BTC' ? cryptoAmount.toFixed(6) : money(cryptoAmount)} ${currency}`} />
        <Row label="You receive" value={`$${money(usd)} balance`} tone="green" />
        <Row label="Network fee" value="Covered by Pulse" />
      </div>
      <p className="mt-3 text-xs text-muted-foreground">
        Processed via NOWPayments in production. This demo simulates the confirmation and does not move real funds.
      </p>
      <Button
        size="lg"
        className="mt-4 h-12 w-full bg-gold text-base font-semibold text-primary-foreground hover:bg-gold/90"
        disabled={usd <= 0 || processing}
        onClick={pay}
      >
        {processing ? 'Confirming payment…' : `Deposit $${money(usd)}`}
      </Button>
    </ModalShell>
  )
}

function WithdrawModal({ onClose }: { onClose: () => void }) {
  const { state, dispatch, toast, openModal } = usePulse()
  const [amount, setAmount] = useState('50')
  const usd = Number(amount) || 0
  const insufficient = usd > state.cash

  const submit = () => {
    if (state.kyc !== 'verified') {
      toast({ title: 'Verification required', description: 'Complete KYC before withdrawing.', variant: 'error' })
      onClose()
      openModal('kyc')
      return
    }
    if (!state.wallet) {
      toast({ title: 'No wallet connected', description: 'Connect a wallet to receive withdrawals.', variant: 'error' })
      onClose()
      return
    }
    if (insufficient) {
      toast({ title: 'Amount exceeds balance', variant: 'error' })
      return
    }
    dispatch({ type: 'WITHDRAW', amount: usd })
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
      <Field label="Amount (USDT)">
        <input type="number" inputMode="decimal" className={inputCls} value={amount} onChange={(e) => setAmount(e.target.value)} />
      </Field>
      <Button
        size="lg"
        className="mt-4 h-12 w-full bg-gold text-base font-semibold text-primary-foreground hover:bg-gold/90"
        disabled={usd <= 0}
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
