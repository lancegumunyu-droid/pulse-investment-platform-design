import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Projects',
  description:
    'Browse vetted SADC investment projects on Pulse — spanning energy, agriculture, fintech, and infrastructure across Southern Africa.',
}

const PROJECTS = [
  {
    id: 'kalahari-solar',
    name: 'Kalahari Solar Farm',
    location: 'Gaborone, Botswana',
    sector: 'Renewable Energy',
    target: '24–28% p.a.',
    minInvest: '$50',
    funded: 78,
    goal: '$2,400,000',
    summary:
      'A 12 MW solar photovoltaic facility supplying clean energy to Botswana\'s national grid under a 15-year power purchase agreement. Revenue is contracted and indexed to energy output.',
    highlight: 'PPA-backed, contracted revenue',
  },
  {
    id: 'limpopo-agri',
    name: 'Limpopo AgriHub',
    location: 'Polokwane, South Africa',
    sector: 'Agriculture',
    target: '18–22% p.a.',
    minInvest: '$75',
    funded: 91,
    goal: '$850,000',
    summary:
      'A diversified agri-processing hub supplying packaged produce to major retail chains in South Africa. Operates three packing facilities with cold-chain logistics.',
    highlight: 'Major retail supply contracts',
  },
  {
    id: 'harare-fintech',
    name: 'Harare Fintech Bridge',
    location: 'Harare, Zimbabwe',
    sector: 'Fintech',
    target: '28–34% p.a.',
    minInvest: '$100',
    funded: 55,
    goal: '$600,000',
    summary:
      'A remittance and mobile-wallet platform enabling diaspora transfers into Zimbabwe at a fraction of traditional costs. Currently processing $1.2M/month in transaction volume.',
    highlight: '$1.2M/month transaction volume',
  },
  {
    id: 'lusaka-logistics',
    name: 'Lusaka Logistics Park',
    location: 'Lusaka, Zambia',
    sector: 'Infrastructure',
    target: '20–25% p.a.',
    minInvest: '$150',
    funded: 42,
    goal: '$1,800,000',
    summary:
      'A last-mile logistics and warehousing facility positioned on Zambia\'s key North-South Corridor. Anchor tenants include two multinational FMCG companies.',
    highlight: 'Multinational anchor tenants',
  },
  {
    id: 'cape-edtech',
    name: 'Cape EdTech Academy',
    location: 'Cape Town, South Africa',
    sector: 'Education',
    target: '18–24% p.a.',
    minInvest: '$50',
    funded: 67,
    goal: '$480,000',
    summary:
      'An accredited online coding and digital-skills bootcamp generating recurring tuition revenue from over 1,400 enrolled students across sub-Saharan Africa.',
    highlight: '1,400+ enrolled students',
  },
  {
    id: 'maputo-water',
    name: 'Maputo Water Solutions',
    location: 'Maputo, Mozambique',
    sector: 'Infrastructure',
    target: '22–27% p.a.',
    minInvest: '$75',
    funded: 33,
    goal: '$920,000',
    summary:
      'A water purification and distribution company serving peri-urban communities in greater Maputo. Revenue driven by municipal supply contracts and direct consumer sales.',
    highlight: 'Municipal supply contracts',
  },
]

const SECTORS = ['All', 'Energy', 'Agriculture', 'Fintech', 'Infrastructure', 'Education']

export default function ProjectsPage() {
  return (
    <>
      {/* Header */}
      <section className="border-b border-white/[0.06]">
        <div className="mx-auto max-w-6xl px-5 pb-16 pt-16 md:pt-24">
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-gold">Portfolio</p>
          <h1 className="max-w-2xl text-4xl font-semibold tracking-tight text-balance md:text-5xl">
            SADC projects open for investment
          </h1>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-muted-foreground text-pretty">
            Each project below has been independently vetted by the Pulse team. Yield targets are based on
            projected and actual performance — they are not guaranteed. All capital is at risk.
          </p>
        </div>
      </section>

      {/* Project grid */}
      <section className="mx-auto max-w-6xl px-5 py-14">
        <div className="grid gap-5 md:grid-cols-2">
          {PROJECTS.map((p) => (
            <article
              key={p.id}
              className="flex flex-col rounded-2xl border border-white/[0.08] bg-white/[0.02] p-6 transition-colors hover:border-white/[0.14] hover:bg-white/[0.04]"
            >
              <div className="flex items-start justify-between gap-3">
                <span className="rounded-lg border border-white/[0.08] bg-white/[0.03] px-2.5 py-1 text-xs font-medium">
                  {p.sector}
                </span>
                <span className="text-xs text-muted-foreground">{p.location}</span>
              </div>

              <h2 className="mt-4 text-lg font-semibold">{p.name}</h2>
              <p className="mt-1.5 flex-1 text-sm leading-relaxed text-muted-foreground">{p.summary}</p>

              {/* Highlight pill */}
              <div className="mt-3 inline-flex items-center gap-1.5 self-start rounded-full border border-gold/20 bg-gold/[0.07] px-3 py-1 text-xs font-medium text-gold">
                <span className="size-1.5 rounded-full bg-gold" />
                {p.highlight}
              </div>

              {/* Funding bar */}
              <div className="mt-4">
                <div className="mb-1.5 flex justify-between text-xs text-muted-foreground">
                  <span>Funded of {p.goal}</span>
                  <span className="font-semibold text-foreground">{p.funded}%</span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/[0.08]">
                  <div className="h-full rounded-full bg-gold" style={{ width: `${p.funded}%` }} />
                </div>
              </div>

              {/* Meta row */}
              <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
                <span>
                  Target <span className="font-semibold text-foreground">{p.target}</span>
                </span>
                <span>
                  Min. <span className="font-semibold text-foreground">{p.minInvest}</span>
                </span>
              </div>
            </article>
          ))}
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
            className="mt-8 inline-flex items-center gap-2 rounded-xl bg-gold px-7 py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
          >
            Create account to invest <ArrowRight className="size-4" />
          </Link>
        </div>
      </section>
    </>
  )
}
