'use client'

import { motion } from 'framer-motion'
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
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        'rounded-3xl p-6 shadow-[0_25px_60px_rgba(0,0,0,0.85)] backdrop-blur-2xl transition-all duration-300 glow-card',
        gold
          ? 'border border-amber-400/40 bg-gradient-to-br from-zinc-950/95 via-zinc-900/90 to-amber-950/25 shadow-[0_0_35px_rgba(245,158,11,0.16)] glass-gold'
          : 'border border-white/12 bg-zinc-950/85 glass',
        className
      )}
    >
      {children}
    </motion.div>
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
    <div className={cn('mb-6 flex items-start gap-3.5', className)}>
      {icon ? (
        <div className="mt-0.5 flex size-11 shrink-0 items-center justify-center rounded-2xl border border-amber-400/35 bg-amber-400/10 text-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.2)]">
          {icon}
        </div>
      ) : null}
      <div>
        <h2 className="text-balance text-xl font-bold tracking-tight text-white font-display">{title}</h2>
        {subtitle ? <p className="mt-1 text-sm leading-relaxed text-zinc-400">{subtitle}</p> : null}
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
  tone?: 'gold' | 'green' | 'muted' | 'danger'
  className?: string
}) {
  const tones = {
    gold: 'border-amber-400/35 bg-amber-400/12 text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.15)]',
    green: 'border-emerald-500/35 bg-emerald-500/12 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.15)]',
    muted: 'border-white/12 bg-white/[0.05] text-zinc-300',
    danger: 'border-rose-500/35 bg-rose-500/12 text-rose-300 shadow-[0_0_15px_rgba(244,63,94,0.15)]',
  }

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-semibold tracking-wide backdrop-blur-md pulse-tile',
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
    <div className={cn('h-2.5 w-full overflow-hidden rounded-full bg-white/10 p-0.5 shadow-inner backdrop-blur-md border border-white/5', className)}>
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${Math.min(100, Math.max(0, value))}%` }}
        transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
        className={cn(
          'h-full rounded-full shimmer-sweep',
          tone === 'gold'
            ? 'bg-gradient-to-r from-amber-600 via-amber-500 to-amber-300 shadow-[0_0_20px_rgba(245,158,11,0.7)]'
            : 'bg-gradient-to-r from-emerald-700 via-emerald-600 to-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.7)]'
        )}
      />
    </div>
  )
}

export function RiskNote({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'flex items-start gap-3 rounded-2xl border border-amber-400/25 bg-amber-400/[0.05] p-4 text-xs leading-relaxed text-zinc-300 shadow-[0_12px_35px_rgba(0,0,0,0.6)] backdrop-blur-xl glow-card',
        className,
      )}
    >
      <TriangleAlert className="mt-0.5 size-4 shrink-0 text-amber-400 drop-shadow-[0_0_10px_rgba(245,158,11,0.6)]" />
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
    <div className={cn('pulse-tile rounded-2xl p-4 border border-white/5 bg-white/[0.02] hover:bg-white/[0.04]', className)}>
      <p className="text-[11px] font-medium uppercase tracking-wider text-zinc-400 font-technical">{label}</p>
      <p className="mt-1 font-sans text-xl font-bold tracking-tight text-white font-display">{value}</p>
      {sub ? <p className="mt-1 text-xs text-zinc-400/90">{sub}</p> : null}
    </div>
  )
}

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
            ? 'animate-heartbeat-ring-fast bg-amber-400/45 shadow-[0_0_25px_rgba(245,158,11,0.8)]'
            : 'animate-heartbeat-ring-slow bg-amber-400/20'
        )}
      />
      <span
        className={cn(
          'relative flex items-center justify-center rounded-full border border-amber-400/40 bg-amber-400/12 text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.35)] backdrop-blur-md',
          active ? 'animate-heartbeat-icon-fast' : 'animate-heartbeat-icon-slow'
        )}
        style={{ width: size, height: size }}
      >
        <Activity strokeWidth={2.5} style={{ width: size * 0.55, height: size * 0.55 }} />
      </span>
    </span>
  )
}
