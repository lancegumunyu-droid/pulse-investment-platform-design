import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { PROJECTS, TIERS } from '@/lib/pulse-data'

export const metadata: Metadata = {
  title: 'Projects',
  description:
    "Browse vetted SADC investment projects on Pulse — spanning energy, mining, agriculture, and infrastructure across Southern Africa.",
}

const minInvest = `$${TIERS[0]?.minInvest ?? 50}`

export default function ProjectsPage() {
  return (
    <>
      {/* Header */}
      <section className="relative overflow-hidden border-b border-white/[0.06]">
        <div
          className="pointer-events-none absolute inset-x-0 -top-32 h-80 opacity-70"
          style={{ background: 'radial-gradient(30rem 30rem at 20% 0%, rgba(245,158,11,0.12), transparent 60%)' }}
        />
        <div className="relative mx-auto max-w-6xl px-5 pb-16 pt-16 md:pt-24">
          <p className="animate-rise mb-3 text-xs font-semibold uppercase tracking-widest text-gold">Portfolio</p>
          <h1 className="animate-rise max-w-2xl text-4xl font-semibold tracking-tight text-balance md:text-5xl" style={{ animationDelay: '60ms' }}>
            SADC projects open for investment
          </h1>
          <p
            className="animate-rise mt-4 max-w-xl text-base leading-relaxed text-muted-foreground text-pretty"
            style={{ animationDelay: '120ms' }}
          >
            Each project below has been independently vetted by the Pulse team. Yield targets are based on projected
            and actual performance — they are not guaranteed. All capital is at risk.
          </p>
        </div>
      </section>

      {/* Project grid */}
      <section className="mx-auto max-w-6xl px-5 py-14">
        <div className="grid gap-5 md:grid-cols-2">
          {PROJECTS.map((p, i) => {
            const pct = Math.round((p.funded / p.goal) * 100)
            return (
              <article
                key={p.id}
                className="animate-rise group flex flex-col rounded-2xl border border-white/[0.08] bg-white/[0.02] p-6 transition-all hover:-translate-y-0.5 hover:border-gold/25 hover:bg-white/[0.04]"
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <div className="flex items-start justify-between gap-3">
                  <span className="rounded-lg border border-white/[0.08] bg-white/[0.03] px-2.5 py-1 text-xs font-medium">
                    {p.sector}
                  </span>
                  <span className="text-xs text-muted-foreground">{p.country}</span>
                </div>

                <h2 className="mt-4 text-lg font-semibold">{p.name}</h2>
                <p className="mt-1.5 flex-1 text-sm leading-relaxed text-muted-foreground">{p.summary}</p>

                <div className="mt-3 inline-flex items-center gap-1.5 self-start rounded-full border border-gold/20 bg-gold/[0.07] px-3 py-1 text-xs font-medium text-gold">
                  <span className="relative flex size-1.5">
                    <span className="absolute inline-flex size-full animate-ping rounded-full bg-gold opacity-70" />
                    <span className="relative inline-flex size-1.5 rounded-full bg-gold" />
                  </span>
                  {p.risk} risk
                </div>

                <div className="mt-4">
                  <div className="mb-1.5 flex justify-between text-xs text-muted-foreground">
                    <span>Funded of ${p.goal.toLocaleString()}</span>
                    <span className="font-semibold text-foreground">{pct}%</span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/[0.08]">
                    <div
                      className="h-full rounded-full bg-gold transition-[width] duration-700 ease-out group-hover:brightness-110"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
                  <span>
                    Target <span className="font-semibold text-foreground">{p.targetYield}</span>
                  </span>
                  <span>
                    Min. <span className="font-semibold text-foreground">{minInvest}</span>
                  </span>
                </div>
              </article>
            )
          })}
        </div>
      </section>

      {/* Disclaimer + CTA */}
      <section className="border-t border-white/[0.06] bg-white/[0.015]">
        <div className="mx-auto max-w-6xl px-5 py-14 text-center">
          <p className="mx-auto max-w-2xl text-sm leading-relaxed text-muted-foreground text-pretty">
            Yield targets displayed represent projected annual returns based on project financial models and, where
            available, historical performance. They are not guaranteed. All investments involve risk of partial or
            total capital loss. Past performance of a project does not guarantee future results.
          </p>
          <Link
            href="/auth/sign-up"
            className="mt-8 inline-flex items-center gap-2 rounded-xl bg-gold px-7 py-3 text-sm font-semibold text-primary-foreground shadow-[0_16px_32px_-16px_rgba(245,158,11,0.55)] transition-all hover:opacity-90 hover:shadow-[0_20px_40px_-16px_rgba(245,158,11,0.7)]"
          >
            Create account to invest <ArrowRight className="size-4" />
          </Link>
        </div>
      </section>
    </>
  )
}
