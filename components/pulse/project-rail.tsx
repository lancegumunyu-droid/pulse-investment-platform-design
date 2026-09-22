'use client'

import Image from 'next/image'
import { ArrowUpRight, MapPin } from 'lucide-react'
import { PULSE_PROJECTS } from '@/lib/pulse-data'

export function ProjectRail() {
  return (
    <section aria-labelledby="available-projects-heading" className="space-y-3">
      <div className="flex items-end justify-between gap-3 px-1">
        <div>
          <p className="pulse-label text-amber-400">More opportunities</p>
          <h2 id="available-projects-heading" className="text-lg font-bold text-white">Explore the full project pipeline</h2>
        </div>
        <span className="shrink-0 text-[11px] font-medium text-zinc-500">Swipe to explore</span>
      </div>
      <div className="-mx-1 flex snap-x snap-mandatory gap-3 overflow-x-auto px-1 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {PULSE_PROJECTS.map((project) => (
          <article key={project.id} className="group w-[min(78vw,280px)] shrink-0 snap-start overflow-hidden rounded-2xl border border-amber-500/20 bg-zinc-950/90 shadow-[0_14px_40px_rgba(0,0,0,0.28)] transition duration-300 hover:-translate-y-1 hover:border-amber-400/50">
            <div className="relative h-36 overflow-hidden bg-zinc-900">
              <Image src={project.image} alt={`${project.title} project`} fill sizes="280px" className="object-cover transition duration-700 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
              <span className="absolute bottom-3 left-3 rounded-full border border-white/15 bg-black/60 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-amber-200">{project.category}</span>
            </div>
            <div className="space-y-3 p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <h3 className="truncate text-sm font-bold text-white">{project.title}</h3>
                  <p className="mt-1 flex items-center gap-1 text-[11px] text-zinc-400"><MapPin className="h-3 w-3 text-amber-400" />{project.location}</p>
                </div>
                <ArrowUpRight className="h-4 w-4 shrink-0 text-amber-400" aria-hidden="true" />
              </div>
              <div className="flex items-center justify-between border-t border-white/10 pt-3 text-[11px]">
                <span className="text-zinc-500">Target APY</span>
                <span className="font-semibold text-emerald-300">{project.apy}</span>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}

export default ProjectRail
