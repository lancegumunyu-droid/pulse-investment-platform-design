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
    // redirect() intentionally throws a NEXT_REDIRECT signal for Next.js
    // to catch at the framework layer — a generic catch here was
    // swallowing that signal, silently cancelling the redirect and
    // showing the marketing page even when login succeeded. Only
    // real auth-check failures should be caught and logged.
    if ((err as { digest?: string })?.digest?.startsWith('NEXT_REDIRECT')) {
      throw err
    }
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

  const PROJECTS_FEATURED = PROJECTS.slice(0, 3)

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-white/[0.06]">
        {/* ambient pulse glow, matches globals.css body gradients */}
        <div
          className="pointer-events-none absolute inset-x-0 -top-40 h-[32rem] opacity-80"
          style={{
            background:
              'radial-gradient(40rem 40rem at 70% 0%, rgba(245,158,11,0.14), transparent 60%), radial-gradient(30rem 30rem at 10% 30%, rgba(16,185,129,0.08), transparent 55%)',
          }}
        />

        <div className="relative mx-auto max-w-6xl px-5 pb-24 pt-20 md:pt-32">
          <div className="animate-rise inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/[0.08] px-3.5 py-1.5 text-xs font-semibold text-gold">
            <span className="relative flex size-1.5">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-gold opacity-75" />
              <span className="relative inline-flex size-1.5 rounded-full bg-gold" />
            </span>
            Private sale open — secure your PULSE allocation
          </div>

          <h1
            className="animate-rise mt-6 max-w-3xl text-4xl font-semibold leading-tight tracking-tight text-balance md:text-6xl md:leading-tight"
            style={{ animationDelay: '80ms' }}
          >
            Real African projects. <span className="text-gold">Real returns.</span> Real transparency.
          </h1>

          <p
            className="animate-rise mt-5 max-w-xl text-base leading-relaxed text-muted-foreground text-pretty md:text-lg"
            style={{ animationDelay: '140ms' }}
          >
            Pulse connects sophisticated investors to high-impact SADC projects across energy, agriculture, fintech,
            and infrastructure. Yields are variable and based on actual project performance.
          </p>

          <div className="animate-rise mt-8 flex flex-wrap items-center gap-3" style={{ animationDelay: '200ms' }}>
            <Link
              href="/auth/sign-up"
              className="group inline-flex items-center gap-2 rounded-xl bg-gold px-6 py-3 text-sm font-semibold text-primary-foreground shadow-[0_16px_32px_-16px_rgba(245,158,11,0.55)] transition-all hover:opacity-90 hover:shadow-[0_20px_40px_-16px_rgba(245,158,11,0.7)]"
            >
              Start investing
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link
              href="/projects"
              className="inline-flex items-center gap-2 rounded-xl border border-white/12 bg-white/[0.04] px-6 py-3 text-sm font-medium transition-colors hover:bg-white/[0.07]"
            >
              Browse projects
            </Link>
          </div>

          {/* Stats strip */}
          <div
            className="animate-rise mt-14 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.04] md:grid-cols-4"
            style={{ animationDelay: '260ms' }}
          >
            {STATS.map((s) => (
              <div key={s.label} className="bg-background px-6 py-5 transition-colors hover:bg-white/[0.02]">
                <p className="text-2xl font-semibold tracking-tight">{s.value}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </div>

          <p className="mt-3 text-[11px] text-muted-foreground">
            Yields are targets, not guarantees. Investing involves risk of capital loss.
          </p>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-6xl px-5 py-20">
        <div className="mb-12 max-w-xl">
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-gold">Why Pulse</p>
          <h2 className="text-3xl font-semibold tracking-tight text-balance md:text-4xl">
            Built for the modern African investor
          </h2>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {FEATURES.map((f, i) => (
            <div
              key={f.title}
              className="animate-rise group rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6 transition-all hover:-translate-y-0.5 hover:border-gold/25 hover:bg-white/[0.05]"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <span className="flex size-10 items-center justify-center rounded-xl bg-gold/[0.12] text-gold transition-transform group-hover:scale-110">
                {f.icon}
              </span>
              <p className="mt-4 font-semibold">{f.title}</p>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Featured projects */}
      <section className="border-t border-white/[0.06] bg-white/[0.015]">
        <div className="mx-auto max-w-6xl px-5 py-20">
          <div className="mb-12 flex items-end justify-between gap-4">
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-gold">Live projects</p>
              <h2 className="text-3xl font-semibold tracking-tight text-balance">Where your capital goes</h2>
            </div>
            <Link href="/projects" className="shrink-0 text-sm font-medium text-gold transition-opacity hover:opacity-80">
              View all →
            </Link>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {PROJECTS_FEATURED.map((p, i) => {
              const pct = Math.round((p.funded / p.goal) * 100)
              return (
                <div
                  key={p.id}
                  className="animate-rise group rounded-2xl border border-white/[0.08] bg-background p-6 transition-all hover:-translate-y-0.5 hover:border-gold/25"
                  style={{ animationDelay: `${i * 80}ms` }}
                >
                  <div className="flex items-center justify-between">
                    <span className="rounded-lg border border-white/[0.08] bg-white/[0.03] px-2.5 py-1 text-xs font-medium">
                      {p.sector}
                    </span>
                    <span className="text-xs text-muted-foreground">{p.country}</span>
                  </div>
                  <p className="mt-4 font-semibold">{p.name}</p>
                  <p className="mt-0.5 text-sm text-muted-foreground">Target return: {p.targetYield} p.a.</p>

                  <div className="mt-4">
                    <div className="mb-1.5 flex justify-between text-xs text-muted-foreground">
                      <span>Funded</span>
                      <span className="font-semibold text-foreground">{pct}%</span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/[0.08]">
                      <div
                        className="h-full rounded-full bg-gold transition-[width] duration-700 ease-out group-hover:brightness-110"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-5 py-20">
        <div className="glass-gold relative overflow-hidden rounded-3xl px-8 py-14 text-center">
          <div
            className="pointer-events-none absolute inset-x-0 -top-32 h-64 opacity-60"
            style={{ background: 'radial-gradient(24rem 24rem at 50% 0%, rgba(245,158,11,0.3), transparent 65%)' }}
          />
          <div className="relative">
            <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-gold">Get started</p>
            <h2 className="mx-auto max-w-lg text-3xl font-semibold tracking-tight text-balance md:text-4xl">
              Ready to invest in Africa&apos;s growth?
            </h2>
            <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-muted-foreground text-pretty">
              Create your account, complete identity verification, and invest in vetted SADC projects — all from your
              phone. Yields are variable. Capital is at risk.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/auth/sign-up"
                className="inline-flex items-center gap-2 rounded-xl bg-gold px-7 py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
              >
                Create free account <ArrowRight className="size-4" />
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 rounded-xl border border-white/12 px-7 py-3 text-sm font-medium transition-colors hover:bg-white/[0.04]"
              >
                Talk to us
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
