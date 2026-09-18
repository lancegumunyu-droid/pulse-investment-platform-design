import Image from 'next/image'
import Link from 'next/link'
import { ChevronLeft, ArrowRight, AlertCircle, TrendingUp, Calendar } from 'lucide-react'
import { PROJECTS } from '@/lib/pulse-data'
import { notFound } from 'next/navigation'

interface Props {
  params: Promise<{ slug: string }>
}

export default async function ProjectPage({ params }: Props) {
  const { slug } = await params
  const project = PROJECTS.find((p) => p.id === slug)

  if (!project) {
    notFound()
  }

  const funded = Math.round((project.funded / project.goal) * 100)
  const remaining = project.goal - project.funded

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header with project image */}
      <section className="relative h-96 overflow-hidden border-b border-white/10">
        {project.image && (
          <Image
            src={project.image}
            alt={project.name}
            fill
            className="object-cover brightness-50"
            priority
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/50 to-background" />

        <div className="relative mx-auto max-w-6xl px-5 h-full flex flex-col justify-between pt-16 pb-8">
          <Link
            href="/projects"
            className="inline-flex w-fit items-center gap-2 rounded-xl border border-white/10 bg-background/80 px-3 py-2 text-sm font-medium text-white backdrop-blur-sm transition-colors hover:bg-background/95"
          >
            <ChevronLeft className="size-4" />
            Back to projects
          </Link>

          <div>
            <div className="inline-flex items-center gap-2 rounded-lg border border-gold/30 bg-gold-soft/20 px-3 py-1.5 mb-4">
              <span className="text-xs font-semibold text-gold uppercase tracking-wider">{project.sector}</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground text-balance">
              {project.name}
            </h1>
            <p className="mt-3 text-base text-muted-foreground">{project.country}</p>
          </div>
        </div>
      </section>

      {/* Main content */}
      <section className="mx-auto max-w-6xl px-5 py-16">
        <div className="grid gap-12 md:grid-cols-3 md:gap-16">
          {/* Left column: Details */}
          <div className="md:col-span-2 space-y-12">
            {/* Summary */}
            <div>
              <h2 className="text-xl font-bold tracking-tight text-foreground mb-3">Overview</h2>
              <p className="text-base leading-relaxed text-muted-foreground">{project.summary}</p>
            </div>

            {/* Stage & Timeline */}
            <div className="grid gap-6 md:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 backdrop-blur-sm">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="size-4 text-gold" />
                  <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Stage</span>
                </div>
                <p className="text-lg font-semibold text-foreground">{project.stage}</p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 backdrop-blur-sm">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="size-4 text-gold" />
                  <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Target completion</span>
                </div>
                <p className="text-lg font-semibold text-foreground">{project.timeline}</p>
              </div>
            </div>

            {/* Impact */}
            <div>
              <h3 className="text-lg font-bold tracking-tight text-foreground mb-3">Impact</h3>
              <p className="text-base leading-relaxed text-muted-foreground">{project.impact}</p>
            </div>

            {/* Milestones */}
            {project.milestones && project.milestones.length > 0 && (
              <div>
                <h3 className="text-lg font-bold tracking-tight text-foreground mb-4">Key milestones</h3>
                <div className="space-y-3">
                  {project.milestones.map((m, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="mt-1 size-2 rounded-full bg-gold shrink-0" />
                      <p className="text-base text-muted-foreground">{m}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Risk Disclaimer */}
            <div className="rounded-2xl border border-yellow-500/30 bg-yellow-500/10 p-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="size-5 text-yellow-500 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-yellow-50 mb-1">Risk factors</h4>
                  <p className="text-sm text-yellow-50/80">{project.riskDetail}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right column: Funding widget */}
          <div>
            <div className="sticky top-20 space-y-6">
              {/* Funding card */}
              <div className="rounded-3xl border border-white/10 bg-white/[0.05] p-8 backdrop-blur-xl shadow-2xl">
                <div className="mb-6">
                  <div className="flex items-end justify-between mb-2">
                    <span className="text-sm font-bold uppercase tracking-widest text-muted-foreground">
                      Funding raised
                    </span>
                    <span className="text-2xl font-bold text-gold">{funded}%</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-gold/80 to-gold transition-all"
                      style={{ width: `${funded}%` }}
                    />
                  </div>
                  <div className="mt-3 flex justify-between text-xs text-muted-foreground">
                    <span>${(project.funded / 1_000_000).toFixed(1)}M raised</span>
                    <span>${(project.goal / 1_000_000).toFixed(1)}M goal</span>
                  </div>
                </div>

                {remaining > 0 && (
                  <p className="mb-6 text-sm text-muted-foreground">
                    ${(remaining / 1_000_000).toFixed(1)}M remaining to close the raise.
                  </p>
                )}

                {/* Key metrics */}
                <div className="space-y-4 mb-6 pb-6 border-b border-white/10">
                  <div>
                    <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">Target yield</p>
                    <p className="text-xl font-bold text-gold">{project.targetYield} p.a.</p>
                  </div>

                  <div>
                    <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">Risk profile</p>
                    <p className="text-sm font-semibold text-foreground">{project.risk}</p>
                  </div>
                </div>

                {/* CTA */}
                <Link
                  href={`/auth/sign-up?project=${project.id}`}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-gold/90 to-gold px-4 py-3.5 text-center text-sm font-bold text-zinc-950 shadow-lg shadow-gold/25 transition-all hover:opacity-95"
                >
                  <span>Invest now</span>
                  <ArrowRight className="size-4" />
                </Link>

                <p className="mt-3 text-center text-xs text-muted-foreground">
                  Sign up or log in to invest in this project.
                </p>
              </div>

              {/* Disclaimer */}
              <div className="rounded-lg border border-white/5 bg-white/[0.02] p-4 text-xs text-muted-foreground">
                <p className="leading-relaxed">
                  Investing carries the risk of capital loss. Variable yields depend entirely on project performance and market conditions. Pulse does not guarantee returns.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Related projects */}
      <section className="border-t border-white/10 bg-white/[0.01]">
        <div className="mx-auto max-w-6xl px-5 py-16">
          <div className="mb-8">
            <h3 className="text-2xl font-bold tracking-tight text-foreground">Other projects</h3>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {PROJECTS.filter((p) => p.id !== project.id)
              .slice(0, 3)
              .map((p) => (
                <Link
                  key={p.id}
                  href={`/projects/${p.id}`}
                  className="group rounded-2xl border border-white/10 overflow-hidden bg-card transition-all hover:border-gold/30"
                >
                  {p.image && (
                    <div className="relative h-40 overflow-hidden">
                      <Image
                        src={p.image}
                        alt={p.name}
                        fill
                        className="object-cover transition-transform group-hover:scale-105"
                      />
                    </div>
                  )}
                  <div className="p-5">
                    <p className="text-sm font-semibold text-gold mb-1">{p.sector}</p>
                    <p className="font-bold text-foreground text-lg mb-2">{p.name}</p>
                    <p className="text-sm text-muted-foreground mb-4">{p.country}</p>
                    <p className="text-sm font-semibold text-gold">{p.targetYield} p.a.</p>
                  </div>
                </Link>
              ))}
          </div>
        </div>
      </section>
    </div>
  )
}
