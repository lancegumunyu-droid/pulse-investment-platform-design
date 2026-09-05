'use client'

import { motion, useMotionTemplate, useMotionValue } from 'framer-motion'
import { ArrowUpRight, Check, ChevronRight, Layers, Lock, Sparkles } from 'lucide-react'
import { money, usePulse } from '../store'
import { Pill, RiskNote, SectionTitle } from '../ui-bits'
import { TIERS } from '@/lib/pulse-data'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.05 } } }
const itemVariants = {
  hidden: { opacity: 0, y: 28, scale: 0.96, filter: 'blur(8px)' },
  visible: { opacity: 1, y: 0, scale: 1, filter: 'blur(0px)', transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } },
}

export function InvestView() {
  const { totalInvested, currentTier, openModal } = usePulse()
  const mouseX = useMotionValue(200)
  const mouseY = useMotionValue(100)
  const spotlight = useMotionTemplate`radial-gradient(240px circle at ${mouseX}px ${mouseY}px, rgba(245,158,11,.2), transparent 76%)`
  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect()
    mouseX.set(event.clientX - rect.left)
    mouseY.set(event.clientY - rect.top)
  }

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="mx-auto flex max-w-md flex-col gap-6 px-1 pb-32 pt-2 text-zinc-100 selection:bg-amber-500/30">
      <style>{`
        @keyframes investConic { to { transform: rotate(360deg); } }
        @keyframes investSweep { 0% { transform: translateX(-150%) skewX(-20deg); } 50%,100% { transform: translateX(250%) skewX(-20deg); } }
        @keyframes investGlow { 0%,100% { border-color: rgba(245,158,11,.3); box-shadow: 0 0 14px rgba(245,158,11,.12), inset 0 0 10px rgba(245,158,11,.06); } 50% { border-color: rgba(245,158,11,.72); box-shadow: 0 0 30px rgba(245,158,11,.3), inset 0 0 18px rgba(245,158,11,.15); } }
        @keyframes investLiquid { 0%,100% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } }
        @keyframes investFloat { 0%,100% { transform: translateY(0) rotate(0); } 50% { transform: translateY(-4px) rotate(1deg); } }
        .invest-conic { animation: investConic 8s linear infinite; }
        .invest-sweep::after { content: ''; position: absolute; inset: 0; pointer-events: none; background: linear-gradient(90deg, transparent, rgba(255,215,0,.2), transparent); animation: investSweep 4.5s ease-in-out infinite; }
        .invest-glow { animation: investGlow 3.5s ease-in-out infinite; }
        .invest-liquid { background-size: 200% 200%; animation: investLiquid 5s ease-in-out infinite; }
        .invest-float { animation: investFloat 5s ease-in-out infinite; }
        @media (prefers-reduced-motion: reduce) { .invest-conic,.invest-sweep::after,.invest-glow,.invest-liquid,.invest-float { animation: none; } }
      `}</style>

      <motion.div variants={itemVariants}>
        <SectionTitle title="Progressive share tiers" subtitle="Tiers unlock automatically as your total investment grows — no recruitment required." icon={<Layers className="size-5 text-amber-400" />} />
      </motion.div>

      <motion.div variants={itemVariants}>
        <div className="relative overflow-hidden rounded-3xl p-px shadow-[0_0_35px_rgba(245,158,11,.2)]">
          <div className="invest-conic pointer-events-none absolute -inset-[180%] bg-[conic-gradient(from_0deg,#f59e0b,transparent_120deg,#10b981_240deg,#f59e0b)] opacity-70" />
          <div onPointerMove={handlePointerMove} className="invest-sweep invest-glow relative overflow-hidden rounded-3xl border bg-gradient-to-b from-amber-950/40 via-neutral-950 to-black p-5 backdrop-blur-2xl">
            <motion.div className="pointer-events-none absolute inset-0 z-0" style={{ background: spotlight }} />
            <div className="invest-float pointer-events-none absolute -right-12 -top-12 size-44 rounded-full bg-amber-500/15 blur-3xl" />
            <div className="relative z-10 flex items-start justify-between gap-3">
              <div className="min-w-0"><div className="flex items-center gap-1.5"><Sparkles className="size-3.5 text-amber-400" /><p className="text-[11px] font-black uppercase tracking-widest text-amber-400">Your total invested</p></div><p className="mt-2 font-mono text-4xl font-black tracking-tight text-white">${money(totalInvested)}</p></div>
              <motion.span animate={{ scale: [1, 1.05, 1] }} transition={{ duration: 3, repeat: Infinity }} className="shrink-0 rounded-full border border-emerald-400/40 bg-emerald-500/15 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-emerald-300"><span className="mr-1.5 inline-block size-1.5 rounded-full bg-emerald-400" />Active Growth</motion.span>
            </div>
            <div className="relative z-10 mt-5 flex items-center justify-between gap-3 border-t border-amber-500/20 pt-4 text-xs text-zinc-400"><p>Current: <span className="font-bold text-white">{currentTier.name} Tier</span></p><span className="flex shrink-0 items-center gap-1 rounded-lg border border-emerald-500/30 bg-emerald-950/60 px-2.5 py-1 font-extrabold text-emerald-400">{currentTier.yieldLabel} Target <ArrowUpRight className="size-3.5" /></span></div>
          </div>
        </div>
      </motion.div>

      <div className="flex flex-col gap-4">
        {TIERS.map((tier, i) => {
          const unlocked = totalInvested >= tier.minInvest
          const isCurrent = currentTier.id === tier.id
          return <motion.div key={tier.id} variants={itemVariants}>
            <div onPointerMove={handlePointerMove} className={cn('invest-sweep group relative overflow-hidden rounded-2xl border p-5 transition-all', isCurrent ? 'invest-glow border-amber-500/30 bg-gradient-to-b from-amber-950/40 via-neutral-950 to-black' : unlocked ? 'border-amber-500/20 bg-gradient-to-b from-neutral-900 to-black hover:border-amber-500/40' : 'border-white/10 bg-black/40 opacity-80')}>
              <motion.div className="pointer-events-none absolute inset-0 z-0" style={{ background: spotlight }} />
              <div className="relative z-10 flex flex-col gap-4">
                <div className="flex items-start justify-between gap-3"><div className="flex min-w-0 items-center gap-3"><span className={cn('invest-float flex size-11 shrink-0 items-center justify-center rounded-xl border font-mono text-sm font-black', isCurrent ? 'bg-gradient-to-tr from-amber-500 to-amber-300 text-black' : unlocked ? 'border-amber-500/30 bg-amber-500/15 text-amber-400' : 'border-white/10 bg-white/[.04] text-zinc-500')}>{i + 1}</span><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><p className="truncate font-extrabold text-base text-white">{tier.name}</p>{isCurrent && <span className="rounded border border-amber-500/40 bg-amber-500/20 px-2 py-0.5 text-[9px] font-black uppercase tracking-widest text-amber-300">Active</span>}</div><p className="mt-0.5 text-xs text-zinc-400">From <span className="font-bold text-zinc-200">${money(tier.minInvest, 0)}</span></p></div></div><Pill tone="green" className="shrink-0 font-extrabold">{tier.yieldLabel}</Pill></div>
                <ul className="flex flex-col gap-2.5 border-t border-white/[.06] pt-3">{tier.perks.map((perk) => <li key={perk} className="flex items-start gap-2.5 text-xs font-medium text-zinc-300"><span className="mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full border border-emerald-500/40 bg-emerald-500/20"><Check className="size-2.5 text-emerald-400" /></span><span>{perk}</span></li>)}</ul>
                <motion.div whileTap={{ scale: .97 }} whileHover={{ scale: 1.01 }}><Button size="lg" variant={unlocked ? 'default' : 'outline'} className={cn('h-12 w-full rounded-xl text-xs font-black uppercase tracking-wider shadow-lg', unlocked ? 'invest-liquid border border-amber-200/60 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-300 text-black shadow-[0_0_20px_rgba(245,158,11,.35)]' : 'border-white/15 bg-white/[.04] text-zinc-200')} onClick={() => openModal('invest', { amount: tier.minInvest })}>{unlocked ? <><span>Add to this tier</span><ChevronRight className="size-4" /></> : <><Lock className="size-4 text-amber-400" /><span>Unlock with ${money(tier.minInvest, 0)}</span></>}</Button></motion.div>
              </div>
            </div>
          </motion.div>
        })}
      </div>

      <motion.div variants={itemVariants}><div className="rounded-2xl bg-gradient-to-r from-amber-500/20 via-transparent to-amber-500/20 p-px"><RiskNote /></div></motion.div>
    </motion.div>
  )
}
