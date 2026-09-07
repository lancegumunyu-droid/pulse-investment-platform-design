'use client'

import { useEffect, useState, type ReactNode } from 'react'
import { ArrowDownRight, ArrowUpRight, Copy, Send, ShieldCheck, AlertCircle, Clock, X, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { money, usePulse } from './store'
import { RiskNote } from './ui-bits'
import { PLATFORM_WALLETS, PROJECTS, tierForAmount } from '@/lib/pulse-data'
import { cn } from '@/lib/utils'

const KYC_REQUIRED_ABOVE = 500

const AFRICA_SADC = [
  'Angola', 'Botswana', 'Comoros', 'DR Congo', 'Eswatini', 'Lesotho', 'Madagascar',
  'Malawi', 'Mauritius', 'Mozambique', 'Namibia', 'Seychelles', 'South Africa',
  'Tanzania', 'Zambia', 'Zimbabwe',
]
const AFRICA_REST = [
  'Algeria', 'Benin', 'Burkina Faso', 'Burundi', 'Cabo Verde', 'Cameroon',
  'Central African Republic', 'Chad', 'Republic of the Congo', "Cote d'Ivoire",
  'Djibouti', 'Egypt', 'Equatorial Guinea', 'Eritrea', 'Ethiopia', 'Gabon', 'Gambia',
  'Ghana', 'Guinea', 'Guinea-Bissau', 'Kenya', 'Liberia', 'Libya', 'Mali',
  'Mauritania', 'Morocco', 'Niger', 'Nigeria', 'Rwanda', 'Sao Tome and Principe',
  'Senegal', 'Sierra Leone', 'Somalia', 'South Sudan', 'Sudan', 'Togo', 'Tunisia',
  'Uganda',
]

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
    <div className="fixed inset-0 z-[70] flex items-end justify-center sm:items-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md transition-opacity" onClick={onClose} aria-hidden />
      <motion.div 
        initial={{ opacity: 0, y: 40, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.98 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 max-h-[90vh] w-full max-w-md overflow-y-auto rounded-t-[28px] border border-amber-500/20 bg-zinc-950/95 shadow-[0_25px_60px_rgba(0,0,0,0.9)] no-scrollbar sm:rounded-3xl"
      >
        <div className="sticky top-0 z-20 flex items-center justify-between border-b border-amber-500/15 bg-zinc-950/90 px-6 py-4 backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-2xl bg-amber-400/15 text-amber-400 border border-amber-400/30 shadow-[0_0_15px_rgba(245,158,11,0.2)]">
              {icon}
            </span>
            <h3 className="text-base font-semibold tracking-tight text-white">{title}</h3>
          </div>
          <button
            onClick={onClose}
            className="flex size-9 items-center justify-center rounded-full bg-white/[0.06] text-zinc-400 transition-all hover:bg-white/[0.12] hover:text-white"
            aria-label="Close"
          >
            <X className="size-4" />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </motion.div>
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
  const [form, setForm] = useState({ name: '', nationality: 'Botswana', country: 'Botswana', idNumber: '', dob: '', phone: '', address: '' })

  const phoneValid = /^\+?[0-9\s\-()]{7,16}$/.test(form.phone.trim())
  const idValid = /^[A-Za-z0-9\-\s]{5,20}$/.test(form.idNumber.trim())
  const ageValid = (() => {
    if (!form.dob) return false
    const dob = new Date(form.dob)
    if (Number.isNaN(dob.getTime())) return false
    const age = (Date.now() - dob.getTime()) / (365.25 * 24 * 60 * 60 * 1000)
    return age >= 18
  })()

  const submit = async () => {
    const res = await api.submitKyc({
      fullName: form.name,
      idNumber: form.idNumber,
      dateOfBirth: form.dob || undefined,
      nationality: form.nationality,
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
      title: 'KYC Submitted',
      description: 'Your verification details have been sent to admin for review.',
      variant: 'success',
    })
    setTimeout(onClose, 1500)
  }

  const canSubmit = form.name.trim().length >= 2 && idValid && ageValid && phoneValid && form.address.trim().length >= 5

  return (
    <ModalShell title="Identity Verification" icon={<ShieldCheck className="size-5" />} onClose={onClose}>
      {state.kyc === 'pending' || step === 2 ? (
        <div className="flex flex-col items-center py-10 text-center">
          <span className="flex size-16 items-center justify-center rounded-2xl bg-amber-400/10 text-amber-400 border border-amber-400/30 shadow-[0_0_20px_rgba(245,158,11,0.25)]">
            <Clock className="size-8 animate-pulse" />
          </span>
          <p className="mt-5 text-lg font-semibold text-white">KYC Verification Pending</p>
          <p className="mt-2 text-sm text-zinc-400 max-w-xs leading-relaxed">
            An admin is currently reviewing your submission. You will be notified automatically once approved.
          </p>
        </div>
      ) : (
        <>
          <p className="mb-5 text-sm leading-relaxed text-zinc-400">
            KYC is required to protect investors and comply with SADC financial regulations. You must be 18 or older to invest with Pulse.
          </p>
          <div className="space-y-4">
            <Field label="Full legal name">
              <input
                className={inputCls}
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. Thabo Nkosi"
              />
            </Field>
            <Field label="Nationality">
              <select
                className={inputCls}
                value={form.nationality}
                onChange={(e) => setForm({ ...form, nationality: e.target.value })}
              >
                <optgroup label="SADC region" className="bg-zinc-950 text-white">
                  {AFRICA_SADC.map((c) => (
                    <option key={c} value={c} className="bg-zinc-950 text-white">
                      {c}
                    </option>
                  ))}
                </optgroup>
                <optgroup label="Rest of Africa" className="bg-zinc-950 text-white">
                  {AFRICA_REST.map((c) => (
                    <option key={c} value={c} className="bg-zinc-950 text-white">
                      {c}
                    </option>
                  ))}
                </optgroup>
              </select>
            </Field>
            <Field label="Country of residence">
              <select
                className={inputCls}
                value={form.country}
                onChange={(e) => setForm({ ...form, country: e.target.value })}
              >
                <optgroup label="SADC region" className="bg-zinc-950 text-white">
                  {AFRICA_SADC.map((c) => (
                    <option key={c} value={c} className="bg-zinc-950 text-white">
                      {c}
                    </option>
                  ))}
                </optgroup>
                <optgroup label="Rest of Africa" className="bg-zinc-950 text-white">
                  {AFRICA_REST.map((c) => (
                    <option key={c} value={c} className="bg-zinc-950 text-white">
                      {c}
                    </option>
                  ))}
                </optgroup>
              </select>
            </Field>
            <Field label="National ID / Passport number">
              <input
                className={inputCls}
                value={form.idNumber}
                onChange={(e) => setForm({ ...form, idNumber: e.target.value })}
                placeholder="ID number"
              />
              {form.idNumber && !idValid && (
                <p className="mt-1.5 text-[11px] text-red-400">5–20 letters/numbers, no special characters.</p>
              )}
            </Field>
            <Field label="Date of birth">
              <input
                type="date"
                className={inputCls}
                value={form.dob}
                onChange={(e) => setForm({ ...form, dob: e.target.value })}
              />
              {form.dob && !ageValid && (
                <p className="mt-1.5 text-[11px] text-red-400">You must be 18 or older to invest with Pulse.</p>
              )}
            </Field>
            <Field label="Phone number">
              <input
                type="tel"
                className={inputCls}
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="+267 71 234 567"
              />
              {form.phone && !phoneValid && (
                <p className="mt-1.5 text-[11px] text-red-400">Enter a valid phone number with country code.</p>
              )}
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
            className="mt-6 h-12 w-full bg-amber-400 text-base font-semibold text-zinc-950 hover:bg-amber-300 shadow-[0_0_20px_rgba(245,158,11,0.3)] transition-all"
            disabled={!canSubmit || busy}
            onClick={submit}
          >
            Submit for verification
          </Button>
          <p className="mt-3 text-center text-xs text-zinc-500">A Pulse admin reviews every submission before approval.</p>
        </>
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
      toast({
        title: state.kyc === 'pending' ? 'KYC Pending Review' : 'Verification required',
        description: state.kyc === 'pending'
          ? 'Your KYC is currently under admin review. Please wait for approval.'
          : `KYC is required for investments over $${KYC_REQUIRED_ABOVE}.`,
        variant: 'error',
      })
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
    toast({
      title: 'Investment Confirmed',
      description: `$${money(value)} allocated to ${project.name}. Admin dates and updates synced.`,
      variant: 'success',
    })
    onClose()
  }

  return (
    <ModalShell title={`Invest — ${project.name}`} icon={<ArrowUpRight className="size-5" />} onClose={onClose}>
      <div className="mb-5 rounded-2xl border border-amber-500/10 bg-white/[0.02] p-4">
        <div className="flex items-center justify-between text-xs">
          <span className="text-zinc-400 font-medium">{project.country} · {project.sector}</span>
          <span className="font-semibold text-emerald-400">{project.targetYield} target</span>
        </div>
        <p className="mt-2 text-xs leading-relaxed text-zinc-300">{project.summary}</p>
      </div>

      {state.kyc === 'pending' && (
        <div className="mb-4 flex items-center gap-2.5 rounded-xl border border-amber-400/30 bg-amber-400/10 p-3 text-xs text-amber-300">
          <Clock className="size-4 shrink-0" />
          <span>Your KYC is under admin review. Larger transactions remain locked until approval.</span>
        </div>
      )}

      <Field label="Amount (USDT)">
        <input
          type="number"
          inputMode="decimal"
          className={inputCls}
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
      </Field>
      <div className="mt-2.5 grid grid-cols-4 gap-2">
        {[75, 150, 300, 750].map((v) => (
          <button
            key={v}
            onClick={() => setAmount(String(v))}
            className="rounded-xl border border-white/10 bg-white/[0.03] py-2 text-xs font-semibold text-zinc-300 transition-all hover:border-amber-400/50 hover:bg-amber-400/10 hover:text-amber-400"
          >
            ${v}
          </button>
        ))}
      </div>

      <div className="mt-5 space-y-2.5 rounded-2xl border border-white/5 bg-white/[0.02] p-4 text-xs">
        <Row label="Available balance" value={`$${money(state.cash)}`} />
        <Row label="Resulting tier" value={tier.name} tone="gold" />
        <Row label="Target yield range" value={tier.yieldLabel} tone="green" />
      </div>

      {needsKyc ? (
        <p className="mt-3 text-xs text-amber-400">Investments over ${KYC_REQUIRED_ABOVE} require verified identity status.</p>
      ) : null}

      <Button
        size="lg"
        className={cn('mt-5 h-12 w-full text-base font-semibold bg-amber-400 text-zinc-950 hover:bg-amber-300 shadow-[0_0_20px_rgba(245,158,11,0.3)]')}
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
    <div className="mb-5">
      <div className="mb-2.5 flex items-center justify-between">
        <p className="text-xs font-semibold text-zinc-400">
          {context ? 'Your saved wallets' : 'Choose a receiving wallet'}
        </p>
        {!adding && (
          <button onClick={() => setAdding(true)} className="text-xs font-semibold text-amber-400 hover:underline">
            + Add wallet
          </button>
        )}
      </div>

      {state.savedWallets.length === 0 && !adding && (
        <p className="rounded-xl border border-white/5 bg-white/[0.02] px-3.5 py-3 text-xs text-zinc-400 leading-relaxed">
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
                'flex items-center gap-3 rounded-xl border px-3.5 py-2.5 transition-all',
                active ? 'border-amber-400/50 bg-amber-400/10 shadow-[0_0_15px_rgba(245,158,11,0.15)]' : 'border-white/10 bg-white/[0.02]',
              )}
            >
              <button onClick={() => useWallet(w.address)} disabled={busyId === w.address} className="min-w-0 flex-1 text-left">
                <p className={cn('truncate text-xs font-semibold', active ? 'text-amber-400' : 'text-zinc-200')}>{w.label}</p>
                <p className="truncate font-mono text-[11px] text-zinc-400">
                  {w.address.slice(0, 8)}…{w.address.slice(-6)}
                </p>
              </button>
              {active && <span className="shrink-0 rounded-md bg-amber-400/20 px-2 py-0.5 text-[9px] font-bold text-amber-400 border border-amber-400/30">ACTIVE</span>}
              <button onClick={() => remove(w.id)} disabled={busyId === w.id} className="shrink-0 text-zinc-400 hover:text-red-400 transition-colors" aria-label="Remove wallet">
                <X className="size-3.5" />
              </button>
            </div>
          )
        })}
      </div>

      {adding && (
        <div className="mt-3 space-y-2.5 rounded-xl border border-amber-400/20 bg-white/[0.02] p-3.5">
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
          <div className="flex gap-2 pt-1">
            <Button size="sm" className="flex-1 bg-amber-400 font-semibold text-zinc-950 hover:bg-amber-300" disabled={busyId === 'new'} onClick={saveNew}>
              {busyId === 'new' ? 'Saving…' : 'Save & use'}
            </Button>
            <Button size="sm" variant="ghost" className="text-zinc-400 hover:text-white" onClick={() => setAdding(false)}>
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
    toast({
      title: 'Deposit submitted to Admin',
      description: 'Your request is pending admin verification. You will receive a notification when credited.',
      variant: 'info',
    })
    onClose()
  }

  return (
    <ModalShell title="Deposit Funds" icon={<ArrowDownRight className="size-5" />} onClose={onClose}>
      <div className="mb-4 grid grid-cols-2 gap-2.5">
        {(['usdttrc20', 'btc'] as const).map((c) => (
          <button
            key={c}
            onClick={() => setCurrency(c)}
            className={cn(
              'rounded-2xl border px-4 py-3 text-xs font-semibold transition-all',
              currency === c ? 'border-amber-400/50 bg-amber-400/10 text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.15)]' : 'border-white/10 bg-white/[0.02] text-zinc-400 hover:text-white',
            )}
          >
            {c === 'btc' ? 'BTC' : 'USDT (TRC-20)'}
          </button>
        ))}
      </div>

      <Field label="Amount (USD)">
        <input type="number" inputMode="decimal" className={inputCls} value={amount} onChange={(e) => setAmount(e.target.value)} />
      </Field>

      <div className="mt-4">
        <span className="mb-1.5 block text-xs font-semibold text-zinc-400">Send to this address</span>
        <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.02] px-3.5 py-2.5">
          <span className="flex-1 truncate font-mono text-xs text-zinc-300">{address}</span>
          <button onClick={copyAddress} className="flex items-center gap-1.5 text-xs font-semibold text-amber-400 hover:underline" aria-label="Copy deposit address">
            <Copy className="size-3.5" /> Copy
          </button>
        </div>
      </div>

      <Field label="Transaction reference / TXID" className="mt-4">
        <input
          type="text"
          className={inputCls}
          placeholder="Paste transaction hash from your wallet"
          value={txRef}
          onChange={(e) => setTxRef(e.target.value)}
        />
      </Field>

      <div className="mt-4 space-y-2 rounded-2xl border border-white/5 bg-white/[0.02] p-4 text-xs">
        <Row label="Pay with" value={label} />
        <Row label="Credited on approval" value={`$${money(usd)}`} tone="green" />
      </div>

      <div className="mt-3.5 flex items-start gap-2.5 rounded-xl border border-amber-400/20 bg-amber-400/5 p-3 text-xs text-zinc-300 leading-relaxed">
        <AlertCircle className="mt-0.5 size-4 shrink-0 text-amber-400" />
        <span>Your deposit stays pending until an admin confirms your transaction and updates your balance.</span>
      </div>

      <Button
        size="lg"
        className="mt-5 h-12 w-full bg-amber-400 text-base font-semibold text-zinc-950 hover:bg-amber-300 shadow-[0_0_20px_rgba(245,158,11,0.3)]"
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
      toast({
        title: state.kyc === 'pending' ? 'KYC Pending' : 'Verification required',
        description: state.kyc === 'pending' ? 'KYC must be approved by admin before withdrawing.' : 'Complete KYC before withdrawing.',
        variant: 'error',
      })
      onClose()
      openModal('kyc')
      return
    }
    if (!address.trim()) {
      toast({ title: 'Enter destination wallet address', variant: 'error' })
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
    toast({
      title: 'Withdrawal Requested',
      description: 'Submitted for admin approval and disbursement notification.',
      variant: 'info',
    })
    onClose()
  }

  return (
    <ModalShell title="Withdraw to Wallet" icon={<ArrowUpRight className="size-5" />} onClose={onClose}>
      <div className="mb-5 rounded-2xl border border-white/5 bg-white/[0.02] p-4 text-xs space-y-2.5">
        <Row label="Withdrawable balance" value={`$${money(state.cash)}`} />
        <Row
          label="KYC status"
          value={state.kyc === 'verified' ? 'Verified' : state.kyc === 'pending' ? 'Pending Review' : 'Required'}
          tone={state.kyc === 'verified' ? 'green' : 'danger'}
        />
      </div>

      <SavedWalletsPanel />

      <Field label="Amount (USDT)">
        <input type="number" inputMode="decimal" className={inputCls} value={amount} onChange={(e) => setAmount(e.target.value)} />
      </Field>

      <Field label="Wallet address" className="mt-4">
        <input
          type="text"
          className={inputCls}
          placeholder="Paste receiving wallet address"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
        />
      </Field>

      <Field label="Network" className="mt-4">
        <select className={inputCls} value={network} onChange={(e) => setNetwork(e.target.value)}>
          <option className="bg-zinc-950 text-white">USDT (TRC-20)</option>
          <option className="bg-zinc-950 text-white">USDT (ERC-20)</option>
          <option className="bg-zinc-950 text-white">USDT (BEP-20)</option>
          <option className="bg-zinc-950 text-white">BTC</option>
        </select>
      </Field>

      <Button
        size="lg"
        className="mt-6 h-12 w-full bg-amber-400 text-base font-semibold text-zinc-950 hover:bg-amber-300 shadow-[0_0_20px_rgba(245,158,11,0.3)]"
        disabled={usd <= 0 || busy || !address.trim()}
        onClick={submit}
      >
        Request withdrawal
      </Button>
      <p className="mt-3 text-center text-xs text-zinc-500">Withdrawals are reviewed, updated, and disbursed by the platform admin.</p>
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
      toast({
        title: state.kyc === 'pending' ? 'KYC Pending' : 'Verification required',
        description: state.kyc === 'pending' ? 'Your KYC is under admin review.' : 'Complete KYC before sending funds.',
        variant: 'error',
      })
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
    toast({
      title: 'Transfer Requested',
      description: 'Held pending admin review. You and recipient will receive updates on approval.',
      variant: 'info',
    })
    onClose()
  }

  return (
    <ModalShell title="Send to Another User" icon={<Send className="size-5" />} onClose={onClose}>
      <div className="mb-5 rounded-2xl border border-white/5 bg-white/[0.02] p-4 text-xs space-y-2.5">
        <Row label="Available balance" value={`$${money(state.cash)}`} />
        <Row
          label="KYC status"
          value={state.kyc === 'verified' ? 'Verified' : state.kyc === 'pending' ? 'Pending Review' : 'Required'}
          tone={state.kyc === 'verified' ? 'green' : 'danger'}
        />
      </div>
      <Field label="Recipient username or Pulse ID">
        <input
          className={inputCls}
          value={recipient}
          onChange={(e) => setRecipient(e.target.value)}
          placeholder="@username or PLS-XXXXXX"
        />
      </Field>
      <div className="mt-4">
        <Field label="Amount (USD)">
          <input type="number" inputMode="decimal" className={inputCls} value={amount} onChange={(e) => setAmount(e.target.value)} />
        </Field>
      </div>
      <p className="mt-4 text-xs leading-relaxed text-zinc-400">
        For safety, transfers are held and reviewed by an admin before the recipient is credited.
      </p>
      <Button
        size="lg"
        className="mt-6 h-12 w-full bg-amber-400 text-base font-semibold text-zinc-950 hover:bg-amber-300 shadow-[0_0_20px_rgba(245,158,11,0.3)]"
        disabled={usd <= 0 || busy || !recipient.trim()}
        onClick={submit}
      >
        Send ${money(usd)}
      </Button>
    </ModalShell>
  )
}

const inputCls =
  'w-full rounded-xl border border-white/10 bg-zinc-900/80 px-3.5 py-3 text-sm text-white placeholder-zinc-500 outline-none transition-all focus:border-amber-400/60 focus:bg-zinc-900 focus:ring-2 focus:ring-amber-400/20'

function Field({ label, children, className }: { label: string; children: ReactNode; className?: string }) {
  return (
    <label className={cn('block', className)}>
      <span className="mb-1.5 block text-xs font-semibold text-zinc-400">{label}</span>
      {children}
    </label>
  )
}

function Row({ label, value, tone }: { label: string; value: string; tone?: 'gold' | 'green' | 'danger' }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-zinc-400 font-medium">{label}</span>
      <span
        className={cn(
          'font-semibold',
          tone === 'gold' && 'text-amber-400',
          tone === 'green' && 'text-emerald-400',
          tone === 'danger' && 'text-red-400',
          !tone && 'text-zinc-200'
        )}
      >
        {value}
      </span>
    </div>
  )
}
