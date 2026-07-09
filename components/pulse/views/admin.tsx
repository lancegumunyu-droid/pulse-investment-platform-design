'use client'

import { useMemo, useState } from 'react'
import { Check, Lock, ShieldCheck } from 'lucide-react'
import { money, usePulse } from '../store'
import { Glass, Pill, SectionTitle, Stat } from '../ui-bits'
import { PROJECTS } from '@/lib/pulse-data'
import { Button } from '@/components/ui/button'

const ADMIN_PASSWORD = 'pulse-admin'

export function AdminView() {
  const { state, dispatch, toast, totalInvested } = usePulse()
  const [authed, setAuthed] = useState(false)
  const [pw, setPw] = useState('')
  const [disburse, setDisburse] = useState('25')

  const pending = useMemo(() => state.txns.filter((t) => t.status === 'pending'), [state.txns])

  const login = () => {
    if (pw === ADMIN_PASSWORD) {
      setAuthed(true)
      toast({ title: 'Admin access granted', variant: 'success' })
    } else {
      toast({ title: 'Incorrect password', description: 'Hint: pulse-admin (demo).', variant: 'error' })
    }
  }

  if (!authed) {
    return (
      <div className="space-y-5">
        <SectionTitle title="Admin dashboard" subtitle="Restricted access." icon={<Lock className="size-5" />} />
        <Glass className="animate-rise">
          <div className="mb-4 flex flex-col items-center text-center">
            <span className="flex size-12 items-center justify-center rounded-2xl bg-gold-soft text-gold">
              <ShieldCheck className="size-6" />
            </span>
            <p className="mt-3 font-semibold">Enter admin password</p>
            <p className="mt-1 text-xs text-muted-foreground">Demo password: pulse-admin</p>
          </div>
          <input
            type="password"
            value={pw}
            onChange={(e) => setPw(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.nativeEvent.isComposing) login()
            }}
            placeholder="Password"
            className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-3 text-sm outline-none focus:border-gold/50 focus:ring-2 focus:ring-gold/20"
          />
          <Button size="lg" className="mt-4 h-12 w-full bg-gold font-semibold text-primary-foreground hover:bg-gold/90" onClick={login}>
            Unlock
          </Button>
        </Glass>
      </div>
    )
  }

  const platformDeposits = state.txns.filter((t) => t.type === 'deposit').reduce((s, t) => s + t.amount, 0)

  return (
    <div className="space-y-5">
      <SectionTitle title="Admin dashboard" subtitle="Platform management (demo)." icon={<ShieldCheck className="size-5" />} />

      <Glass className="animate-rise">
        <div className="grid grid-cols-2 gap-4">
          <Stat label="Total deposits" value={`$${money(platformDeposits, 0)}`} />
          <Stat label="Total invested" value={`$${money(totalInvested, 0)}`} />
          <Stat label="Active projects" value={PROJECTS.length} />
          <Stat label="Pending actions" value={pending.length} />
        </div>
      </Glass>

      <Glass className="animate-rise">
        <p className="mb-3 text-sm font-semibold">Pending withdrawals</p>
        {pending.length === 0 ? (
          <p className="text-sm text-muted-foreground">No pending items.</p>
        ) : (
          <div className="space-y-2">
            {pending.map((t) => (
              <div key={t.id} className="flex items-center justify-between rounded-2xl bg-white/[0.03] p-3">
                <div>
                  <p className="text-sm font-medium">{t.label}</p>
                  <p className="text-xs text-muted-foreground">${money(t.amount)} · {new Date(t.date).toLocaleString()}</p>
                </div>
                <Button
                  size="sm"
                  className="bg-green font-semibold text-background hover:bg-green/90"
                  onClick={() => {
                    dispatch({ type: 'APPROVE_TXN', id: t.id })
                    toast({ title: 'Withdrawal approved', description: `$${money(t.amount)} disbursed.`, variant: 'success' })
                  }}
                >
                  <Check className="size-4" /> Approve
                </Button>
              </div>
            ))}
          </div>
        )}
      </Glass>

      <Glass className="animate-rise">
        <p className="mb-1 text-sm font-semibold">Manual yield disbursement</p>
        <p className="mb-3 text-xs leading-relaxed text-muted-foreground">
          Credit realised project returns to the investor&apos;s balance. Use only for actual, reported performance.
        </p>
        <div className="flex gap-2">
          <input
            type="number"
            inputMode="decimal"
            value={disburse}
            onChange={(e) => setDisburse(e.target.value)}
            className="flex-1 rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-3 font-mono text-sm outline-none focus:border-gold/50 focus:ring-2 focus:ring-gold/20"
          />
          <Button
            size="lg"
            className="h-12 bg-gold px-5 font-semibold text-primary-foreground hover:bg-gold/90"
            onClick={() => {
              const amt = Number(disburse) || 0
              if (amt <= 0) return
              dispatch({ type: 'ADMIN_DISBURSE', amount: amt })
              toast({ title: 'Yield disbursed', description: `$${money(amt)} credited to investor.`, variant: 'success' })
            }}
          >
            Disburse
          </Button>
        </div>
      </Glass>

      <Glass className="animate-rise">
        <p className="mb-3 text-sm font-semibold">Project funding</p>
        <div className="space-y-2.5">
          {PROJECTS.map((p) => (
            <div key={p.id} className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">{p.name}</span>
              <Pill tone="green">{Math.round((p.funded / p.goal) * 100)}% funded</Pill>
            </div>
          ))}
        </div>
      </Glass>
    </div>
  )
}
