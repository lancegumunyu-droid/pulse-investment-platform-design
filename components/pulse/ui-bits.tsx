'use client'

import { TriangleAlert } from 'lucide-react'
import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { RISK_DISCLAIMER } from '@/lib/pulse-data'

export function Glass({
  children,
  className,
  gold,
}: {
  children: ReactNode
  className?: string
  gold?: boolean
}) {
  return (
    <div className={cn('rounded-3xl p-5', gold ? 'glass-gold' : 'glass', className)}>{children}</div>
  )
}

export function SectionTitle({
  title,
  subtitle,
  icon,
}: {
  title: string
  subtitle?: string
  icon?: ReactNode
}) {
  return (
    <div className="mb-4 flex items-start gap-3">
      {icon ? (
        <div className="mt-0.5 flex size-9 items-center justify-center rounded-xl bg-gold-soft text-gold">
          {icon}
        </div>
      ) : null}
      <div>
        <h2 className="text-balance text-xl font-semibold tracking-tight">{title}</h2>
        {subtitle ? <p className="mt-0.5 text-sm leading-relaxed text-muted-foreground">{subtitle}</p> : null}
      </div>
    </div>
  )
}

export function Pill({
  children,
  tone = 'muted',
}: {
  children: ReactNode
  tone?: 'gold' | 'green' | 'muted' | 'danger'
}) {
  const tones = {
    gold: 'bg-gold-soft text-gold',
    green: 'bg-green-soft text-green',
    muted: 'bg-muted text-muted-foreground',
    danger: 'bg-destructive/15 text-destructive',
  }
  return (
    <span className={cn('inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium', tones[tone])}>
      {children}
    </span>
  )
}

export function ProgressBar({ value, tone = 'gold' }: { value: number; tone?: 'gold' | 'green' }) {
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-white/8">
      <div
        className={cn('h-full rounded-full transition-all duration-500', tone === 'gold' ? 'bg-gold' : 'bg-green')}
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  )
}

export function RiskNote({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'flex items-start gap-2.5 rounded-2xl border border-white/8 bg-white/[0.03] p-3.5 text-xs leading-relaxed text-muted-foreground',
        className,
      )}
    >
      <TriangleAlert className="mt-0.5 size-4 shrink-0 text-gold" />
      <p className="text-pretty">{RISK_DISCLAIMER}</p>
    </div>
  )
}

export function Stat({ label, value, sub }: { label: string; value: ReactNode; sub?: ReactNode }) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-1 font-mono text-lg font-semibold tracking-tight">{value}</p>
      {sub ? <p className="mt-0.5 text-xs text-muted-foreground">{sub}</p> : null}
    </div>
  )
}
