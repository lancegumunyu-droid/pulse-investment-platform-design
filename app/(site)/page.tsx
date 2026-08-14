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
  },
  {
    name: 'Limpopo AgriHub',
    location: 'South Africa',
    sector: 'Agriculture',
    target: '18–22%',
    funded: 91,
  },
  {
    name: 'Harare Fintech Bridge',
    location: 'Zimbabwe',
    sector: 'Fintech',
    target: '28–34%',
    funded: 55,
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

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-white/[0.06]">
        <div className="mx-auto max-w-6xl px-5 pb-24 pt-20 md:pt-32">
          <div className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/[0.08] px-3.5 py-1.5 text-xs font-semibold text-gold">
            <span className="size-1.5 rounded-full bg-gold" />
            Private sale open — secure your PULSE allocation
          </div>

          <h1 className="mt-6 max-w-3xl text-4xl font-semibold leading-tight tracking-tight text-balance md:text-6xl md:leading-tight">
            Real African projects.{' '}
            <span className="text-gold">Real returns.</span>{' '}
            Real transparency.
          </h1>

          <p className="mt-5 max-w-xl text-base leading-relaxed text-muted-foreground text-pretty md:text-lg">
            Pulse connects sophisticated investors to high-impact SADC projects across energy, agriculture, fintech,
            and infrastructure. Yields are variable and based on actual project performance.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              href="/auth/sign-up"
              className="inline-flex items-center gap-2 rounded-xl bg-gold px-6 py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
            >
              Start investing <ArrowRight className="size-4" />
            </Link>
            <Link
              href="/projects"
              className="inline-flex items-center gap-2 rounded-xl border border-white/12 bg-white/[0.04] px-6 py-3 text-sm font-medium transition-colors hover:bg-white/[0.07]"
            >
              Browse projects
            </Link>
          </div>

          {/* Stats strip */}
          <div className="mt-14 grid grid-cols-2 gap-px rounded-2xl border border-white/[0.08] bg-white/[0.04] overflow-hidden md:grid-cols-4">
            {STATS.map((s) => (
              <div key={s.label} className="bg-background px-6 py-5">
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
          {FEATURES.map((f) => (
            <div key={f.title} className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6">
              <span className="flex size-10 items-center justify-center rounded-xl bg-gold/[0.12] text-gold">
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
              <h2 className="text-3xl font-semibold tracking-tight text-balance">
                Where your capital goes
              </h2>
            </div>
            <Link
              href="/projects"
              className="shrink-0 text-sm font-medium text-gold transition-opacity hover:opacity-80"
            >
              View all →
            </Link>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {PROJECTS.map((p) => (
              <div key={p.name} className="group rounded-2xl border border-white/[0.08] bg-background p-6">
                <div className="flex items-center justify-between">
                  <span className="rounded-lg border border-white/[0.08] bg-white/[0.03] px-2.5 py-1 text-xs font-medium">
                    {p.sector}
                  </span>
                  <span className="text-xs text-muted-foreground">{p.location}</span>
                </div>
                <p className="mt-4 font-semibold">{p.name}</p>
                <p className="mt-0.5 text-sm text-muted-foreground">Target return: {p.target} p.a.</p>

                {/* Funding bar */}
                <div className="mt-4">
                  <div className="mb-1.5 flex justify-between text-xs text-muted-foreground">
                    <span>Funded</span>
                    <span className="font-semibold text-foreground">{p.funded}%</span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/[0.08]">
                    <div
                      className="h-full rounded-full bg-gold"
                      style={{ width: `${p.funded}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-5 py-20">
        <div className="overflow-hidden rounded-3xl border border-white/[0.08] bg-white/[0.03] px-8 py-14 text-center">
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
      </section>
    </>
  )
}
