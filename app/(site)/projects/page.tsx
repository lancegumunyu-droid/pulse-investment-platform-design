import Image from 'next/image'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { ArrowRight, BadgeCheck, Globe, ShieldCheck, TrendingUp, Zap } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { PROJECTS } from '@/lib/pulse-data'

const STATS = [
  { label: 'Active projects', value: String(PROJECTS.length) },
  { label: 'Countries', value: String(new Set(PROJECTS.map((p) => p.country)).size) },
  { label: 'Target yield (p.a.)', value: '10–20%' },
  { label: 'Investors', value: '400+' },
]

export default async function HomePage() {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (user) {
      redirect('/app')
    }
  } catch (err) {
    console.log('[v0] Supabase auth check skipped:', (err as Error).message)
  }

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
      body: 'Fund your account through Pulse-supported rails with clear fees, transparent status, and investor-first controls.',
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

  const PROJECTS_FEATURED = PROJECTS.slice(0, 3)

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-white/[0.08] bg-gradient-to-b from-background via-background/95 to-background">
        {/* Ambient background glows */}
        <div
          className="pointer-events-none absolute inset-x-0 -top-40 h-[36rem] opacity-70"
          style={{
            background:
              'radial-gradient(45rem 45rem at 70% 0%, rgba(245,158,11,0.18), transparent 65%), radial-gradient(35rem 35rem at 15% 25%, rgba(16,185,129,0.08), transparent 60%)',
          }}
        />

        <div className="relative mx-auto max-w-6xl px-5 pb-28 pt-24 md:pt-36">
          <div className="animate-rise inline-flex items-center gap-2.5 rounded-full border border-gold/40 bg-gold/10 px-4 py-1.5 text-xs font-semibold text-gold shadow-lg shadow-amber-500/10">
            <span className="relative flex size-2">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-gold opacity-75" />
              <span className="relative inline-flex size-2 rounded-full bg-gold" />
            </span>
            Private sale open — secure your PULSE allocation
          </div>

          <h1
            className="animate-rise mt-6 max-w-3xl text-4xl font-extrabold tracking-tight text-balance md:text-6xl md:leading-[1.12]"
            style={{ animationDelay: '80ms' }}
          >
            Real African projects.{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-200 to-amber-500">
              Real returns.
            </span>{' '}
            Real transparency.
          </h1>

          <p
            className="animate-rise mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground text-pretty md:text-lg font-normal"
            style={{ animationDelay: '140ms' }}
          >
            Pulse connects sophisticated investors to high-impact SADC projects across energy, agriculture, fintech,
            and infrastructure. Yields are variable and based on actual project performance.
          </p>

          <div className="animate-rise mt-9 flex flex-wrap items-center gap-4" style={{ animationDelay: '200ms' }}>
            <Link
              href="/auth/sign-up"
              className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 px-7 py-3.5 text-sm font-semibold text-primary-foreground shadow-[0_16px_32px_-12px_rgba(245,158,11,0.5)] transition-all hover:opacity-95 hover:shadow-[0_20px_40px_-10px_rgba(245,158,11,0.7)]"
            >
              Start investing
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              href="/projects"
              className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/[0.04] px-7 py-3.5 text-sm font-medium transition-all hover:bg-white/[0.08] hover:border-white/25"
            >
              Browse projects
            </Link>
          </div>

          {/* Stats Strip */}
          <div
            className="animate-rise mt-16 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-white/[0.1] bg-white/[0.05] md:grid-cols-4 shadow-2xl backdrop-blur-xl"
            style={{ animationDelay: '260ms' }}
          >
            {STATS.map((s) => (
              <div key={s.label} className="bg-background/90 px-6 py-6 transition-colors hover:bg-white/[0.03]">
                <p className="text-3xl font-bold tracking-tight text-foreground">{s.value}</p>
                <p className="mt-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider">{s.label}</p>
              </div>
            ))}
          </div>

          <p className="mt-4 text-xs text-muted-foreground/85">
            * Yields are targets, not guarantees. Investing involves risk of capital loss.
          </p>
        </div>
      </section>

      {/* Features Section */}
      <section className="mx-auto max-w-6xl px-5 py-24">
        <div className="mb-14 max-w-xl">
          <p className="mb-3 text-xs font-bold uppercase tracking-widest text-gold">Why Pulse</p>
          <h2 className="text-3xl font-semibold tracking-tight text-balance md:text-4xl">
            Built for the modern African investor
          </h2>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {FEATURES.map((f, i) => (
            <div
              key={f.title}
              className="animate-rise group rounded-2xl border border-white/[0.08] bg-white/[0.02] p-7 backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-gold/30 hover:bg-white/[0.04] shadow-lg"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <span className="flex size-12 items-center justify-center rounded-xl border border-amber-500/20 bg-amber-500/10 text-gold shadow-inner transition-transform group-hover:scale-110">
                {f.icon}
              </span>
              <p className="mt-5 text-lg font-semibold text-foreground">{f.title}</p>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Projects Section (With Crisp Image Headers) */}
      <section className="border-t border-white/[0.08] bg-white/[0.01]">
        <div className="mx-auto max-w-6xl px-5 py-24">
          <div className="mb-14 flex items-end justify-between gap-4">
            <div>
              <p className="mb-3 text-xs font-bold uppercase tracking-widest text-gold">Live projects</p>
              <h2 className="text-3xl font-semibold tracking-tight text-balance">Where your capital goes</h2>
            </div>
            <Link
              href="/projects"
              className="shrink-0 text-sm font-semibold text-gold transition-opacity hover:opacity-80 inline-flex items-center gap-1"
            >
              View all <ArrowRight className="size-4" />
            </Link>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {PROJECTS_FEATURED.map((p, i) => {
              const pct = Math.round((p.funded / p.goal) * 100)
              return (
                <div
                  key={p.id}
                  className="animate-rise group rounded-2xl border border-white/[0.1] bg-card overflow-hidden shadow-2xl flex flex-col transition-all duration-300 hover:-translate-y-1 hover:border-amber-500/40"
                  style={{ animationDelay: `${i * 80}ms` }}
                >
                  {/* Clean image thumbnail header */}
                  <div className="relative h-52 w-full overflow-hidden bg-white/5">
                    {p.image ? (
                      <Image
                        src={p.image}
                        alt={p.name}
                        fill
                        sizes="(max-width: 768px) 100vw, 33vw"
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-br from-amber-500/20 to-black flex items-center justify-center text-amber-400 font-bold">
                        Pulse Project
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-black/30" />

                    {/* Sector Badge */}
                    <div className="absolute top-3 left-3">
                      <span className="rounded-lg border border-white/20 bg-background/80 backdrop-blur-md px-3 py-1 text-xs font-semibold text-foreground shadow-lg">
                        {p.sector}
                      </span>
                    </div>

                    {/* Location Tag */}
                    <div className="absolute top-3 right-3">
                      <span className="rounded-lg border border-white/10 bg-black/60 backdrop-blur-md px-2.5 py-1 text-xs font-medium text-amber-400">
                        {p.country}
                      </span>
                    </div>
                  </div>

                  {/* Content body */}
                  <div className="p-6 flex-1 flex flex-col justify-between">
                    <div>
                      <p className="text-lg font-semibold text-foreground">{p.name}</p>
                      <p className="mt-1 text-sm font-medium text-muted-foreground">
                        Target return: <span className="text-amber-400 font-semibold">{p.targetYield} p.a.</span>
                      </p>
                    </div>

                    {/* Funding bar */}
                    <div className="mt-6">
                      <div className="mb-2 flex justify-between text-xs text-muted-foreground font-mono">
                        <span>Funded</span>
                        <span className="font-bold text-foreground">{pct}%</span>
                      </div>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-white/[0.08] p-0.5 border border-white/5">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-amber-600 to-amber-400 transition-all duration-1000 group-hover:brightness-110"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="mx-auto max-w-6xl px-5 py-24">
        <div className="relative overflow-hidden rounded-3xl border border-white/[0.12] bg-gradient-to-b from-white/[0.06] to-white/[0.02] px-8 py-16 text-center shadow-2xl backdrop-blur-xl">
          <div
            className="pointer-events-none absolute inset-x-0 -top-32 h-64 opacity-70"
            style={{ background: 'radial-gradient(28rem 28rem at 50% 0%, rgba(245,158,11,0.35), transparent 65%)' }}
          />
          <div className="relative">
            <p className="mb-3 text-xs font-bold uppercase tracking-widest text-gold">Get started</p>
            <h2 className="mx-auto max-w-lg text-3xl font-semibold tracking-tight text-balance md:text-4xl">
              Ready to invest in Africa&apos;s growth?
            </h2>
            <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-muted-foreground text-pretty">
              Create your account, complete identity verification, and invest in vetted SADC projects — all from your
              phone. Yields are variable. Capital is at risk.
            </p>
            <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/auth/sign-up"
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 px-8 py-3.5 text-sm font-semibold text-primary-foreground shadow-lg shadow-amber-500/25 transition-all hover:opacity-95"
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
        </div>
      </section>
    </div>
  )
}
