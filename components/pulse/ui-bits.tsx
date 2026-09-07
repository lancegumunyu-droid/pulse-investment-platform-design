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
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        'rounded-3xl p-5 shadow-[0_20px_50px_rgba(0,0,0,0.8)] backdrop-blur-2xl transition-all',
        gold
          ? 'border border-amber-400/40 bg-gradient-to-br from-zinc-950/95 via-zinc-900/90 to-amber-950/20 shadow-[0_0_30px_rgba(245,158,11,0.12)]'
          : 'border border-white/10 bg-zinc-950/85',
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
    <div className={cn('mb-5 flex items-start gap-3.5', className)}>
      {icon ? (
        <div className="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-xl border border-amber-400/30 bg-amber-400/10 text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.15)]">
          {icon}
        </div>
      ) : null}
      <div>
        <h2 className="text-balance text-xl font-bold tracking-tight text-white">{title}</h2>
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
    gold: 'border-amber-400/30 bg-amber-400/10 text-amber-400 shadow-[0_0_10px_rgba(245,158,11,0.1)]',
    green: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.1)]',
    muted: 'border-white/10 bg-white/[0.04] text-zinc-400',
    danger: 'border-rose-500/30 bg-rose-500/10 text-rose-400 shadow-[0_0_10px_rgba(244,63,94,0.1)]',
  }

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold tracking-wide backdrop-blur-md',
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
    <div className={cn('h-2 w-full overflow-hidden rounded-full bg-white/10 p-0.5 shadow-inner backdrop-blur-md', className)}>
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${Math.min(100, Math.max(0, value))}%` }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className={cn(
          'h-full rounded-full',
          tone === 'gold'
            ? 'bg-gradient-to-r from-amber-500 to-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.6)]'
            : 'bg-gradient-to-r from-emerald-600 to-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.6)]'
        )}
      />
    </div>
  )
}

export function RiskNote({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'flex items-start gap-3 rounded-2xl border border-amber-400/20 bg-amber-400/[0.04] p-4 text-xs leading-relaxed text-zinc-400 shadow-[0_10px_30px_rgba(0,0,0,0.5)] backdrop-blur-xl',
        className,
      )}
    >
      <TriangleAlert className="mt-0.5 size-4 shrink-0 text-amber-400 drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]" />
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
      <p className="text-[11px] font-medium uppercase tracking-wider text-zinc-400">{label}</p>
      <p className="mt-1 font-sans text-lg font-bold tracking-tight text-white">{value}</p>
      {sub ? <p className="mt-1 text-xs text-zinc-400/80">{sub}</p> : null}
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
            ? 'animate-heartbeat-ring-fast bg-amber-400/40 shadow-[0_0_20px_rgba(245,158,11,0.7)]'
            : 'animate-heartbeat-ring-slow bg-amber-400/20'
        )}
      />
      <span
        className={cn(
          'relative flex items-center justify-center rounded-full border border-amber-400/30 bg-amber-400/10 text-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.3)] backdrop-blur-md',
          active ? 'animate-heartbeat-icon-fast' : 'animate-heartbeat-icon-slow'
        )}
        style={{ width: size, height: size }}
      >
        <Activity strokeWidth={2.5} style={{ width: size * 0.55, height: size * 0.55 }} />
      </span>
    </span>
  )
}
