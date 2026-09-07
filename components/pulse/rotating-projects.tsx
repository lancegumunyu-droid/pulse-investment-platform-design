'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, Sparkles, ShieldCheck, MapPin, ArrowUpRight, TrendingUp, Clock } from 'lucide-react'
import { PULSE_PROJECTS, PulseProject } from '@/lib/pulse-projects'
import Link from 'next/link'
import Image from 'next/image'
import { ProgressBar } from '@/components/pulse/ui-bits'

export function RotatingProjects() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const [progress, setProgress] = useState(0)

  const currentProject: PulseProject = PULSE_PROJECTS[currentIndex]
  const ROTATION_INTERVAL = 7000

  useEffect(() => {
    if (isPaused) return

    const startTime = Date.now()
    const timer = setInterval(() => {
      const elapsed = Date.now() - startTime
      const currentProgress = Math.min((elapsed / ROTATION_INTERVAL) * 100, 100)
      setProgress(currentProgress)

      if (elapsed >= ROTATION_INTERVAL) {
        setCurrentIndex((prev) => (prev + 1) % PULSE_PROJECTS.length)
        setProgress(0)
      }
    }, 50)

    return () => clearInterval(timer)
  }, [currentIndex, isPaused])

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % PULSE_PROJECTS.length)
    setProgress(0)
  }

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + PULSE_PROJECTS.length) % PULSE_PROJECTS.length)
    setProgress(0)
  }

  const fundingPercentage = Math.round((currentProject.raisedAmount / currentProject.targetRaise) * 100)

  return (
    <div 
      className="w-full max-w-5xl mx-auto my-12 px-4 sm:px-6"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="size-2 rounded-full bg-amber-400 animate-ping shrink-0" />
            <span className="text-xs font-mono uppercase tracking-[0.2em] text-amber-400">Live Institutional Syndicates</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white font-display">
            Curated Private Placements
          </h2>
        </div>
        
        {/* Navigation Controls */}
        <div className="flex items-center gap-3 self-end sm:self-auto">
          <span className="text-xs font-mono text-zinc-500 mr-2">
            0{currentIndex + 1} / 0{PULSE_PROJECTS.length}
          </span>
          <button 
            onClick={handlePrev}
            className="size-11 rounded-2xl border border-white/12 bg-white/[0.03] flex items-center justify-center text-zinc-300 hover:bg-white/[0.08] hover:border-amber-500/40 hover:text-amber-400 transition-all shadow-lg active:scale-95"
            aria-label="Previous syndicate"
          >
            <ChevronLeft className="size-5" />
          </button>
          <button 
            onClick={handleNext}
            className="size-11 rounded-2xl border border-white/12 bg-white/[0.03] flex items-center justify-center text-zinc-300 hover:bg-white/[0.08] hover:border-amber-500/40 hover:text-amber-400 transition-all shadow-lg active:scale-95"
            aria-label="Next syndicate"
          >
            <ChevronRight className="size-5" />
          </button>
        </div>
      </div>

      {/* Main Container Card */}
      <div className="relative rounded-[28px] sm:rounded-[32px] border border-white/[0.12] bg-zinc-950/90 backdrop-blur-3xl overflow-hidden shadow-[0_30px_90px_rgba(0,0,0,0.9)] group glow-card">
        
        {/* Shimmer Border Accent */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-amber-400 to-transparent shadow-[0_0_20px_rgba(245,158,11,0.6)] z-20" />

        {/* Ambient Glows */}
        <div className="pointer-events-none absolute -right-32 -top-32 size-96 rounded-full bg-amber-500/[0.08] blur-[120px]" />
        <div className="pointer-events-none absolute -left-32 -bottom-32 size-96 rounded-full bg-emerald-500/[0.06] blur-[120px]" />

        <AnimatePresence mode="wait">
          <motion.div
            key={currentProject.id}
            initial={{ opacity: 0, y: 15, scale: 0.99 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -15, scale: 0.99 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 p-6 sm:p-10 items-center relative z-10"
          >
            {/* Responsive Image Frame */}
            <div className="lg:col-span-5 relative w-full h-64 sm:h-72 lg:h-80 rounded-2xl overflow-hidden border border-white/12 shadow-2xl bg-zinc-900">
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent z-10" />
              <motion.div 
                initial={{ scale: 1 }}
                animate={{ scale: 1.05 }}
                transition={{ duration: 7, ease: 'linear' }}
                className="absolute inset-0 size-full"
              >
                <Image 
                  src={currentProject.image} 
                  alt={currentProject.title}
                  fill
                  sizes="(max-width: 1024px) 100vw, 40vw"
                  className="object-cover object-center"
                  priority
                />
              </motion.div>
              
              {/* Floating Badge */}
              <div className="absolute top-4 left-4 z-20 bg-zinc-950/85 backdrop-blur-xl border border-amber-500/45 px-3 py-1.5 rounded-full text-xs font-semibold text-amber-300 shadow-xl flex items-center gap-1.5">
                <Sparkles className="size-3 text-amber-400 shrink-0" />
                <span className="truncate">{currentProject.badge}</span>
              </div>

              {/* Location & Category Overlays */}
              <div className="absolute bottom-4 left-4 right-4 z-20 flex items-center justify-between gap-2 text-xs text-zinc-200 font-medium">
                <div className="flex items-center gap-1.5 bg-black/75 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/12 truncate">
                  <MapPin className="size-3.5 text-amber-400 shrink-0" />
                  <span className="truncate">{currentProject.location}</span>
                </div>
                <div className="bg-black/75 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/12 font-mono text-emerald-400 shrink-0">
                  {currentProject.category}
                </div>
              </div>
            </div>

            {/* Content Details Side */}
            <div className="lg:col-span-7 flex flex-col justify-between space-y-5 sm:space-y-6">
              <div>
                <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                  <div className="inline-flex items-center gap-1.5 bg-emerald-500/12 border border-emerald-500/35 px-3 py-1 rounded-xl text-emerald-300 font-mono text-xs font-semibold">
                    <TrendingUp className="size-3.5 shrink-0" /> Target APY: {currentProject.apy}
                  </div>
                  <span className="text-xs font-mono text-zinc-300 bg-white/[0.04] border border-white/12 px-3 py-1 rounded-xl">
                    Minimum Entry: <strong className="text-white">${currentProject.minInvestment.toLocaleString()}</strong>
                  </span>
                </div>

                <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight font-display">
                  {currentProject.title}
                </h3>
                <p className="mt-2 text-xs sm:text-sm text-zinc-300 leading-relaxed text-pretty">
                  {currentProject.description}
                </p>
              </div>

              {/* Tangible Financial Metrics Grid */}
              <div className="grid grid-cols-3 gap-2.5 sm:gap-3 font-mono text-xs">
                <div className="bg-white/[0.02] p-3 rounded-2xl border border-white/10 hover:border-amber-500/40 transition-colors pulse-tile">
                  <span className="text-zinc-400 block text-[10px] mb-0.5 font-technical">Projected IRR</span>
                  <span className="text-amber-400 font-bold text-sm sm:text-base">{currentProject.metrics.irr}</span>
                </div>
                <div className="bg-white/[0.02] p-3 rounded-2xl border border-white/10 hover:border-amber-500/40 transition-colors pulse-tile">
                  <span className="text-zinc-400 block text-[10px] mb-0.5 font-technical">Lockup Term</span>
                  <span className="text-white font-bold text-sm sm:text-base flex items-center gap-1 truncate">
                    <Clock className="size-3 text-zinc-400 shrink-0" /> {currentProject.metrics.duration}
                  </span>
                </div>
                <div className="bg-white/[0.02] p-3 rounded-2xl border border-white/10 hover:border-amber-500/40 transition-colors pulse-tile">
                  <span className="text-zinc-400 block text-[10px] mb-0.5 font-technical">Risk Rating</span>
                  <span className="text-zinc-200 font-bold text-sm sm:text-base truncate">{currentProject.metrics.riskProfile}</span>
                </div>
              </div>

              {/* Funding Progress Bar */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-zinc-300">Syndicate Pool: <strong className="text-white">${currentProject.raisedAmount.toLocaleString()}</strong></span>
                  <span className="text-amber-400 font-semibold">{fundingPercentage}% Allocated</span>
                </div>
                <ProgressBar value={fundingPercentage} tone="gold" />
              </div>

              {/* Call to Action Bar */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-xs text-zinc-300 font-mono">
                  <ShieldCheck className="size-4 text-emerald-400 shrink-0" />
                  <span>Verified SADC Private Placement Offering</span>
                </div>

                <motion.div whileTap={{ scale: 0.98 }} className="w-full sm:w-auto">
                  <Link
                    href={`/app/invest/${currentProject.id}`}
                    className="flex h-12 w-full sm:w-auto items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-400 px-7 text-xs font-semibold text-zinc-950 shadow-[0_0_25px_rgba(245,158,11,0.4)] hover:shadow-[0_0_35px_rgba(245,158,11,0.6)] transition-all group/btn"
                  >
                    Inspect Syndicate Portfolio 
                    <ArrowUpRight className="size-4 transition-transform group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1" />
                  </Link>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Rotation Timer Progress Bar */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/5 z-20">
          <div 
            className="h-full bg-amber-400 transition-all duration-75 shadow-[0_0_10px_rgba(245,158,11,0.8)]"
            style={{ width: `${isPaused ? 100 : progress}%` }}
          />
        </div>
      </div>
    </div>
  )
}
