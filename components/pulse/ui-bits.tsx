'use client'

import { Activity, TriangleAlert } from 'lucide-react'
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
    <div
      className={cn(
        'rounded-3xl p-5 shadow-2xl backdrop-blur-xl',
        gold ? 'glass-gold border border-gold/30 bg-background/95' : 'glass border border-white/10 bg-background/95',
        className
      )}
    >
      {children}
    </div>
  )
}

export function SectionTitle({
  title,
  subtitle,
  icon,
  className,
}: {
  title: string
  subtitle?: string
  icon?: ReactNode
  className?: string
}) {
  return (
    <div className={cn('mb-5 flex items-start gap-3.5', className)}>
      {icon ? (
        <div className="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-xl border border-gold/20 bg-gold-soft text-gold shadow-sm">
          {icon}
        </div>
      ) : null}
      <div>
        <h2 className="text-balance text-xl font-bold tracking-tight text-foreground">{title}</h2>
        {subtitle ? <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{subtitle}</p> : null}
      </div>
    </div>
  )
}

export function Pill({
  children,
  tone = 'muted',
  className,
}: {
  children: ReactNode
  tone?: 'gold' | 'green' | 'muted' | 'danger' | 'red'
  className?: string
}) {
  const tones = {
    gold: 'border-gold/20 bg-gold-soft text-gold',
    green: 'border-green/20 bg-green-soft text-green',
    muted: 'border-white/10 bg-white/[0.04] text-muted-foreground',
    danger: 'border-destructive/20 bg-destructive/10 text-destructive',
    red: 'border-destructive/20 bg-destructive/10 text-destructive', // Alias for TopBar compatibility
  }

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold tracking-wide',
        tones[tone],
        className
      )}
    >
      {children}
    </span>
  )
}

export function ProgressBar({
  value,
  tone = 'gold',
  className,
}: {
  value: number
  tone?: 'gold' | 'green'
  className?: string
}) {
  return (
    <div className={cn('h-2 w-full overflow-hidden rounded-full bg-white/10 shadow-inner', className)}>
      <div
        className={cn(
          'h-full rounded-full transition-all duration-700 ease-out',
          tone === 'gold' ? 'bg-gold shadow-[0_0_10px_rgba(232,163,23,0.5)]' : 'bg-green shadow-[0_0_10px_rgba(34,197,94,0.5)]'
        )}
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  )
}

export function RiskNote({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'flex items-start gap-3 rounded-2xl border border-gold/15 bg-gold/5 p-4 text-xs leading-relaxed text-muted-foreground shadow-sm',
        className,
      )}
    >
      <TriangleAlert className="mt-0.5 size-4 shrink-0 text-gold" />
      <p className="text-pretty">{RISK_DISCLAIMER}</p>
    </div>
  )
}

export function Stat({
  label,
  value,
  sub,
  className,
}: {
  label: string
  value: ReactNode
  sub?: ReactNode
  className?: string
}) {
  return (
    <div className={className}>
      <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="mt-1 font-mono text-lg font-bold tracking-tight text-foreground">{value}</p>
      {sub ? <p className="mt-1 text-xs text-muted-foreground/80">{sub}</p> : null}
    </div>
  )
}

/**
 * Heartbeat — the "living golden heartbeat" brand mark. A pulsing ring +
 * icon that beats steadily when idle/online, and beats faster with a
 * brighter flash while `active` (e.g. mid-transaction: depositing,
 * withdrawing, submitting KYC).
 *
 * Animation classes (animate-heartbeat-ring-slow/fast,
 * animate-heartbeat-icon-slow/fast) are defined in app/globals.css.
 *
 * Usage:
 *   <Heartbeat />                    — idle, steady beat (use in headers)
 *   <Heartbeat active />             — faster/brighter (use during a
 *                                      pending deposit/withdrawal/etc.)
 *   <Heartbeat size={28} />          — bigger, e.g. for a splash/loading
 *                                      screen
 */
export function Heartbeat({
  active = false,
  size = 20,
  className,
}: {
  active?: boolean
  size?: number
  className?: string
}) {
  return (
    <span className={cn('relative inline-flex items-center justify-center', className)}>
      <span
        aria-hidden
        className={cn(
          'absolute inset-0 rounded-full',
          active
            ? 'animate-heartbeat-ring-fast bg-gold/50 shadow-[0_0_15px_rgba(232,163,23,0.6)]'
            : 'animate-heartbeat-ring-slow bg-gold/30'
        )}
      />
      <span
        className={cn(
          'relative flex items-center justify-center rounded-full bg-gold-soft text-gold backdrop-blur-sm',
          active ? 'animate-heartbeat-icon-fast' : 'animate-heartbeat-icon-slow'
        )}
        style={{ width: size, height: size }}
      >
        <Activity strokeWidth={2.5} style={{ width: size * 0.55, height: size * 0.55 }} />
      </span>
    </span>
  )
}
