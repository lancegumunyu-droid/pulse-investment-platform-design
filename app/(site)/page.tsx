import Image from 'next/image'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { ArrowRight, BadgeCheck, Globe, ShieldCheck, TrendingUp, Zap } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'

const STATS = [
  { label: 'Active projects', value: '12' },
  { label: 'Countries', value: '6' },
  { label: 'Target yield (p.a.)', value: '18–34%' },
  { label: 'Investors', value: '400+' },
]

const FEATURES = [
  {
    icon: <Globe className="size-5" />,
    title: 'Real SADC projects',
    body: 'Every project on Pulse is a vetted, operational business in Southern Africa — agri, energy, fintech, and infrastructure.',
  },
  {
    icon: <BadgeCheck className="size-5" />,
    title: 'Transparent performance',
    body: 'We publish regular performance reports for every active project. You always know exactly how your capital is deployed.',
  },
  {
    icon: <ShieldCheck className="size-5" />,
    title: 'Identity-verified',
    body: 'KYC verification is required before you can invest, protecting all participants and meeting regulatory expectations.',
  },
  {
    icon: <Zap className="size-5" />,
    title: 'Crypto-native deposits',
    body: 'Fund your account with USDT or BTC via NOWPayments. Instant, borderless, and low-fee — built for the African diaspora.',
  },
  {
    icon: <TrendingUp className="size-5" />,
    title: 'Tier-based access',
    body: 'The more you invest, the higher your tier — and the higher your access to premium projects with greater return potential.',
  },
  {
    icon: <BadgeCheck className="size-5" />,
    title: 'PULSE token',
    body: 'Earn PULSE tokens through the private sale and stake them for additional yield, governance participation, and platform perks.',
  },
]

const PROJECTS = [
  {
    name: 'Kalahari Solar Farm',
    location: 'Botswana',
    sector: 'Energy',
    target: '24–28%',
    funded: 78,
    image: '/projects/kalahari-solar.png',
  },
  {
    name: 'Limpopo AgriHub',
    location: 'South Africa',
    sector: 'Agriculture',
    target: '18–22%',
    funded: 91,
    image: '/projects/limpopo-agri.png',
  },
  {
    name: 'Harare Fintech Bridge',
    location: 'Zimbabwe',
    sector: 'Fintech',
    target: '28–34%',
    funded: 55,
    image: '/projects/harare-fintech.png',
  },
]

export default async function HomePage() {
  let user = null

  try {
    const supabase = await createClient()
    const { data } = await supabase.auth.getUser()
    user = data?.user
  } catch (err) {
    console.log('[v0] Supabase auth check skipped:', (err as Error).message)
  }

  // Safe execution point: redirect is completely outside try/catch
  if (user) {
    redirect('/app')
  }

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Pulse Investment Group',
    url: 'https://pulseinvest.uk',
    email: 'support@pulseinvest.uk',
    description: 'A transparent platform showcasing SADC investment projects and digital asset education. Returns are variable and capital is at risk.',
    sameAs: ['https://minepi.com', 'https://developers.minepi.com'],
  }

  return (
    <div className="pulse-home pulse-view">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-white/[0.08]">
        <div className="absolute inset-0 bg-radial from-amber-500/10 via-transparent to-transparent pointer-events-none" />
        <div className="mx-auto max-w-6xl px-5 pb-24 pt-24 md:pt-36">
          <div className="inline-flex items-center gap-2.5 rounded-full border border-gold/40 bg-gold/10 px-4 py-1.5 text-xs font-semibold text-gold animate-rise shadow-lg shadow-amber-500/5">
            <span className="size-2 rounded-full bg-gold animate-pulse-beat" />
            Private sale open — secure your PULSE allocation
          </div>

          <h1 className="text-hero mt-6 max-w-3xl font-display text-balance tracking-tight">
            Real African projects.{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-200 to-amber-500">Real returns.</span>{' '}
            Real transparency.
          </h1>

          <p className="mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground text-pretty md:text-lg font-technical">
            Pulse connects sophisticated investors to high-impact SADC projects across energy, agriculture, fintech,
            and infrastructure. Yields are variable and based on actual project performance.
          </p>

          <div className="mt-9 flex flex-wrap items-center gap-4">
            <Link
              href="/auth/sign-up"
              className="pulse-action inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 px-7 py-3.5 text-sm font-semibold text-primary-foreground shadow-lg shadow-amber-500/25"
            >
              Start investing <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              href="/projects"
              className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/[0.05] px-7 py-3.5 text-sm font-medium transition-all hover:bg-white/[0.09] hover:border-white/25"
            >
              Browse projects
            </Link>
          </div>

          {/* Stats strip */}
          <div className="mt-16 grid grid-cols-2 gap-px rounded-2xl border border-white/[0.1] bg-white/[0.04] overflow-hidden shadow-2xl md:grid-cols-4 backdrop-blur-xl">
            {STATS.map((s) => (
              <div key={s.label} className="bg-background/80 px-6 py-6 transition-colors hover:bg-white/[0.02]">
                <p className="text-3xl font-bold tracking-tight font-display text-foreground">{s.value}</p>
                <p className="mt-1 text-xs font-medium text-muted-foreground uppercase tracking-wider">{s.label}</p>
              </div>
            ))}
          </div>

          <p className="mt-4 text-xs text-muted-foreground font-technical">
            * Yields are targets, not guarantees. Investing involves risk of capital loss.
          </p>
        </div>
      </section>

      {/* Features Section */}
      <section className="mx-auto max-w-6xl px-5 py-24">
        <div className="mb-14 max-w-xl">
          <p className="mb-3 text-xs font-bold uppercase tracking-widest text-gold">Why Pulse</p>
          <h2 className="text-3xl font-display font-semibold tracking-tight text-balance md:text-4xl">
            Built for the modern African investor
          </h2>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {FEATURES.map((f) => (
            <div key={f.title} className="glow-card rounded-2xl border border-white/[0.08] bg-white/[0.02] p-7 backdrop-blur-md">
              <span className="flex size-12 items-center justify-center rounded-xl border border-amber-500/20 bg-amber-500/10 text-gold shadow-inner">
                {f.icon}
              </span>
              <p className="mt-5 text-lg font-display font-semibold text-foreground">{f.title}</p>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground font-technical">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Projects Section */}
      <section className="border-t border-white/[0.08] bg-white/[0.01]">
        <div className="mx-auto max-w-6xl px-5 py-24">
          <div className="mb-14 flex items-end justify-between gap-4">
            <div>
              <p className="mb-3 text-xs font-bold uppercase tracking-widest text-gold">Live projects</p>
              <h2 className="text-3xl font-display font-semibold tracking-tight text-balance">
                Where your capital goes
              </h2>
            </div>
            <Link
              href="/projects"
              className="shrink-0 text-sm font-semibold text-gold transition-opacity hover:opacity-80 inline-flex items-center gap-1"
            >
              View all <ArrowRight className="size-4" />
            </Link>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {PROJECTS.map((p) => (
              <div key={p.name} className="pulse-tile group relative overflow-hidden rounded-2xl border border-white/[0.09] bg-card p-6 shadow-xl">
                <Image src={p.image} alt="" fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover opacity-42 saturate-125 brightness-110 transition-transform duration-700 group-hover:scale-105" aria-hidden="true" />
                <div className="absolute inset-0 bg-gradient-to-r from-background via-background/95 to-transparent" aria-hidden="true" />
                
                <div className="relative flex items-center justify-between">
                  <span className="rounded-lg border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium backdrop-blur-md">
                    {p.sector}
                  </span>
                  <span className="text-xs font-medium text-muted-foreground">{p.location}</span>
                </div>
                
                <p className="relative mt-5 text-lg font-display font-semibold text-foreground">{p.name}</p>
                <p className="relative mt-1 text-sm font-medium text-amber-400">Target return: {p.target} p.a.</p>

                {/* Funding bar */}
                <div className="relative mt-6">
                  <div className="mb-2 flex justify-between text-xs text-muted-foreground font-technical">
                    <span>Funded</span>
                    <span className="font-bold text-foreground">{p.funded}%</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-white/[0.08] p-0.5 border border-white/5">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-amber-600 to-amber-400 transition-all duration-1000"
                      style={{ width: `${p.funded}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="mx-auto max-w-6xl px-5 py-24">
        <div className="glow-edge overflow-hidden rounded-3xl border border-white/[0.1] bg-gradient-to-b from-white/[0.05] to-white/[0.02] px-8 py-16 text-center shadow-2xl backdrop-blur-xl">
          <p className="mb-3 text-xs font-bold uppercase tracking-widest text-gold">Get started</p>
          <h2 className="mx-auto max-w-lg text-3xl font-display font-semibold tracking-tight text-balance md:text-4xl">
            Ready to invest in Africa&apos;s growth?
          </h2>
          <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-muted-foreground text-pretty font-technical">
            Create your account, complete identity verification, and invest in vetted SADC projects — all from your
            phone. Yields are variable. Capital is at risk.
          </p>
          <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/auth/sign-up"
              className="pulse-action inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 px-8 py-3.5 text-sm font-semibold text-primary-foreground shadow-lg shadow-amber-500/25"
            >
              Create free account <ArrowRight className="size-4" />
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/[0.04] px-8 py-3.5 text-sm font-medium transition-colors hover:bg-white/[0.08]"
            >
              Talk to us
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
