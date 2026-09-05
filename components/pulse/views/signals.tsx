'use client'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Radio, RotateCcw, Zap, Inbox, TrendingUp, Clock, ArrowRight } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { usePulse } from '../store'
import { Glass, Pill, RiskNote } from '../ui-bits'
import { PROJECTS as INITIAL_PROJECTS } from '@/lib/pulse-data'
import { Button } from '@/components/ui/button'
export interface Signal {
id: string
project_id: string
title: string
detail: string
target_yield: string
urgency: 'Closing soon' | 'New' | 'Open' | 'Standard' | string
window_label?: string
window?: string
created_at?: string
updated_at?: string
}
// High-Octane Spring Stagger Physics
const containerVariants = {
hidden: { opacity: 0 },
visible: {
opacity: 1,
transition: {
staggerChildren: 0.08,
delayChildren: 0.04,
},
},
}
const itemVariants = {
hidden: { opacity: 0, y: 20, scale: 0.98 },
visible: {
opacity: 1,
y: 0,
scale: 1,
transition: {
type: 'spring',
stiffness: 300,
damping: 24,
},
},
}
// Reactive Lighting Signal Card Component
function SignalCard({
signal,
project,
liveFunding,
onInvest,
getUrgencyTone,
}: {
signal: Signal
project?: typeof INITIAL_PROJECTS[0]
liveFunding: Record<string, number> | null
onInvest: (projectId: string) => void
getUrgencyTone: (urgency: string) => 'danger' | 'gold' | 'green' | 'muted'
}) {
const [mousePos, setMousePos] = useState({ x: 200, y: 80 })
const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
const rect = e.currentTarget.getBoundingClientRect()
setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top })
}
const funded = project
? project.funded + (liveFunding?.[project.id] ?? 0)
: 0
const pct = project ? Math.min(100, Math.round((funded / project.goal) * 100)) : 0
const rawDate = signal.updated_at || signal.created_at
const formattedDate = rawDate
? new Date(rawDate).toLocaleDateString('en-US', {
month: 'short',
day: 'numeric',
year: 'numeric',
})
: null
const displayWindow = signal.window_label || signal.window
return (
<motion.div
variants={itemVariants}
layout
whileHover={{ y: -3, scale: 1.01 }}
transition={{ type: 'spring', stiffness: 400, damping: 25 }}
onPointerMove={handlePointerMove}
style={{
background: radial-gradient(280px circle at ${mousePos.x}px ${mousePos.y}px, rgba(245, 166, 35, 0.12), transparent 80%), linear-gradient(180deg, rgba(20, 24, 33, 0.95) 0%, rgba(10, 12, 16, 0.98) 100%),
}}
className="relative overflow-hidden rounded-2xl border border-white/10 p-5 shadow-2xl space-y-4 transition-colors duration-300 hover:border-amber-500/50 backdrop-blur-xl group"
>
{/* Top Ambient Shimmer Sweep */}
<div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-amber-400/50 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
{/* Header Row: Urgency Badge & Target Yield */}
<div className="flex items-center justify-between gap-3 border-b border-white/10 pb-3 relative z-10">
<div className="flex items-center gap-2">
<span className="relative flex size-2.5">
<span className="absolute inline-flex size-full animate-ping rounded-full bg-amber-400 opacity-75" />
<span className="relative inline-flex size-2.5 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,166,35,0.8)]" />
</span>
<Pill tone={getUrgencyTone(signal.urgency)}>
<span className="font-mono font-black uppercase tracking-wider text-[9px]">{signal.urgency}</span>
</Pill>
</div>
<div className="bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 px-3 py-1 rounded-full text-xs font-black font-mono flex items-center gap-1.5 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
<TrendingUp className="size-3.5 text-emerald-400" />
<span>{signal.target_yield}</span>
</div>
</div>
{/* Main Signal Content */}
<div className="space-y-1.5 relative z-10">
<h4 className="text-sm font-extrabold text-white leading-snug group-hover:text-amber-400 transition-colors">
{signal.title}
</h4>
<p className="text-xs leading-relaxed text-zinc-300 font-medium">{signal.detail}</p>
</div>
{/* Underlying Project Progress Bar */}
{project && (
<div className="space-y-1.5 relative z-10 bg-black/40 p-3 rounded-xl border border-white/5">
<div className="flex justify-between text-[10px] font-semibold text-zinc-400">
<span className="uppercase tracking-wider font-mono">Underlying Asset Target</span>
<span className="text-emerald-400 font-mono font-black">{pct}% allocated</span>
</div>
<div className="h-2 w-full overflow-hidden rounded-full bg-zinc-800/80 p-0.5 border border-white/5">
<motion.div
initial={{ width: 0 }}
animate={{ width: ${pct}% }}
transition={{ duration: 1.2, ease: 'easeOut' }}
className="h-full bg-gradient-to-r from-amber-500 via-yellow-400 to-emerald-400 rounded-full shadow-[0_0_10px_rgba(245,166,35,0.5)]"
/>
</div>
</div>
)}
{/* Footer & Action Button */}
<div className="flex items-center justify-between pt-2 border-t border-white/10 relative z-10">
<div className="flex flex-col text-xs text-zinc-400">
<div className="flex items-center gap-1 font-bold text-white text-[11px]">
<Clock className="size-3 text-amber-400" />
<span>{displayWindow || 'Execution Window Active'}</span>
</div>
{formattedDate && (
<span className="text-[10px] text-zinc-500 font-mono mt-0.5" suppressHydrationWarning>
Broadcasted: {formattedDate}
</span>
)}
</div>
<motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
<Button
size="sm"
className="bg-gradient-to-r from-amber-400 via-amber-500 to-amber-400 hover:brightness-110 text-black font-extrabold text-xs rounded-xl shadow-[0_0_20px_rgba(245,166,35,0.3)] flex items-center gap-1.5 px-4 h-9 cursor-pointer"
onClick={() => onInvest(signal.project_id)}
>
<Zap className="size-3.5 fill-black" />
<span>One-Click Invest</span>
<ArrowRight className="size-3.5 ml-0.5" />
</Button>
</motion.div>
</div>
</motion.div>
)
}
export function SignalsView() {
const supabase = useMemo(() => createClient(), [])
const { api, openModal } = usePulse()
const [signals, setSignals] = useState<Signal[]>([])
const [loading, setLoading] = useState(true)
const [liveFunding, setLiveFunding] = useState<Record<string, number> | null>(null)
const [isRefreshing, setIsRefreshing] = useState(false)
// Fetch Signals
const loadSignals = useCallback(async (showLoading = true) => {
if (showLoading) setLoading(true)
try {
const { data, error } = await supabase
.from('signals')
.select('*')
.order('created_at', { ascending: false })
if (!error && data) {
setSignals(data as Signal[])
}
} catch (err) {
console.error('Error fetching signals:', err)
} finally {
if (showLoading) setLoading(false)
}
}, [supabase])
// Fetch Funding
const fetchFunding = useCallback(async () => {
try {
const res = await api.liveProjectFunding()
if (res?.ok && res.funding) {
setLiveFunding(res.funding)
}
} catch (err) {
console.error('Error fetching live funding:', err)
}
}, [api])
// Refresh Trigger
const handleRefresh = useCallback(async () => {
setIsRefreshing(true)
await Promise.all([loadSignals(false), fetchFunding()])
setIsRefreshing(false)
}, [loadSignals, fetchFunding])
// Realtime & Interval Setup
useEffect(() => {
loadSignals(true)
fetchFunding()
const channel = supabase
.channel('signals-realtime')
.on(
'postgres_changes',
{ event: '*', schema: 'public', table: 'signals' },
(payload) => {
if (payload.eventType === 'INSERT') {
const newSignal = payload.new as Signal
setSignals((prev) => [newSignal, ...prev.filter((s) => s.id !== newSignal.id)])
} else if (payload.eventType === 'UPDATE') {
const updatedSignal = payload.new as Signal
setSignals((prev) =>
prev.map((s) => (s.id === updatedSignal.id ? updatedSignal : s))
)
} else if (payload.eventType === 'DELETE') {
const deletedId = payload.old?.id
if (deletedId) {
setSignals((prev) => prev.filter((s) => s.id !== deletedId))
}
}
}
)
.subscribe()
const interval = setInterval(fetchFunding, 10_000)
return () => {
supabase.removeChannel(channel)
clearInterval(interval)
}
}, [supabase, loadSignals, fetchFunding])
const getUrgencyTone = (urgency: string): 'danger' | 'gold' | 'green' | 'muted' => {
switch (urgency) {
case 'Closing soon':
return 'danger'
case 'New':
return 'gold'
case 'Open':
return 'green'
default:
return 'muted'
}
}
return (
<motion.div
variants={containerVariants}
initial="hidden"
animate="visible"
className="pulse-signals space-y-4 max-w-md mx-auto pb-28 pt-1 px-1.5 text-zinc-100 font-sans selection:bg-amber-500/30"
>
{/* Dynamic Header with Animated Signal Icon & Live Radar Ticker */}
<motion.div variants={itemVariants} className="flex items-center justify-between">
<div className="flex items-center gap-3">
<motion.div
whileHover={{ scale: 1.08, rotate: 5 }}
whileTap={{ scale: 0.95 }}
className="relative p-2.5 rounded-2xl bg-gradient-to-br from-cyan-500/20 via-blue-500/10 to-transparent border border-cyan-500/40 text-cyan-400 shrink-0 shadow-[0_0_25px_rgba(6,182,212,0.25)]"
>
<Radio className="size-5 text-cyan-400 animate-pulse" />
</motion.div>
<div>
<h2 className="text-base font-extrabold text-white leading-tight tracking-wide flex items-center gap-1.5">
Investment signals
<span className="bg-cyan-500/20 text-cyan-300 text-[9px] font-mono font-black px-2 py-0.5 rounded-full border border-cyan-500/40 uppercase">
Live Feed
</span>
</h2>
<p className="text-[11px] text-zinc-400 leading-normal">
Timely, research-backed opportunities across live SADC projects.
</p>
</div>
</div>
{/* Refresh Action Button */}
<motion.div whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.9 }}>
<Button
size="sm"
variant="ghost"
className="w-9 h-9 p-0 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-zinc-300 hover:text-white shadow-md cursor-pointer"
disabled={isRefreshing || loading}
onClick={handleRefresh}
>
<RotateCcw className={size-4 ${isRefreshing || loading ? 'animate-spin text-amber-400' : ''}} />
</Button>
</motion.div>
</motion.div>
{/* Main Signal Feed Container */}
{loading ? (
<div className="space-y-4">
{[1, 2].map((i) => (
<motion.div
key={i}
initial={{ opacity: 0.5 }}
animate={{ opacity: [0.5, 0.9, 0.5] }}
transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
className="rounded-2xl border border-white/10 bg-[#101217] p-5 space-y-3"
>
<div className="flex justify-between items-center">
<div className="h-4 w-1/4 rounded-md bg-white/10 animate-pulse" />
<div className="h-5 w-1/5 rounded-full bg-emerald-500/20 animate-pulse" />
</div>
<div className="h-5 w-3/4 rounded-md bg-white/10 animate-pulse" />
<div className="h-10 w-full rounded-md bg-white/5 animate-pulse" />
<div className="h-8 w-full rounded-xl bg-white/10 animate-pulse pt-2" />
</motion.div>
))}
</div>
) : signals.length === 0 ? (
<motion.div variants={itemVariants}>
<Glass className="flex flex-col items-center justify-center py-12 text-center border border-white/10 bg-[#101217]/90 rounded-2xl shadow-xl space-y-3">
<motion.div
animate={{ scale: [1, 1.1, 1] }}
transition={{ repeat: Infinity, duration: 3 }}
className="p-4 rounded-full bg-white/5 border border-white/10 text-zinc-500"
>
<Inbox className="size-8" />
</motion.div>
<div>
<p className="text-sm font-bold text-white">No active signals found</p>
<p className="text-xs text-zinc-400 max-w-xs mt-1">
Check back shortly for newly broadcast institutional opportunities.
</p>
</div>
</Glass>
</motion.div>
) : (
<div className="space-y-4">
<AnimatePresence mode="popLayout">
{signals.map((signal) => {
const project = INITIAL_PROJECTS.find((p) => p.id === signal.project_id)
return (
<SignalCard
key={signal.id}
signal={signal}
project={project}
liveFunding={liveFunding}
onInvest={(projectId) => openModal('invest', { projectId })}
getUrgencyTone={getUrgencyTone}
/>
)
})}
</AnimatePresence>
</div>
)}
{/* Risk Note Footer */}
<motion.div variants={itemVariants}>
<RiskNote />
</motion.div>
</motion.div>
)
  }
