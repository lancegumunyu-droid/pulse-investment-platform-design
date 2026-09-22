import Image from 'next/image'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { ArrowRight, BadgeCheck, Globe, ShieldCheck, TrendingUp, Zap } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { PROJECTS } from '@/lib/pulse-data'

const STATS = [
  { label: 'Active projects', value: '12' },
  { label: 'Countries', value: '6' },
  { label: 'Target yield (p.a.)', value: '18–34%' },
  { label: 'Investors', value: '400+' },
]

const FAQS = [
  ['Is investing guaranteed?', 'No. Targets are not guarantees, and capital is at risk. Review each project, its reporting, and the risk disclaimer before investing.'],
  ['Why is identity verification required?', 'Pulse uses verification before investing to protect users, reduce fraud, and support responsible platform operations.'],
  ['How do I get help?', 'Use the Support widget inside your Pulse account to send a message and attach a screenshot. Support replies appear in your notification bell.'],
  ['Can I use Pulse on my phone?', 'Yes. Pulse is responsive and can be added to your phone home screen from your browser using Add to Home Screen.'],
  ['How are project updates shared?', 'Project performance and platform announcements are shared through the dashboard notification center and project reporting surfaces.'],
] as const

const TESTIMONIALS = [
  ['Dadirai-ZIM', '24', 'I was skeptical about local platforms at first, but the V2 security checks and clear dashboard sold me. Tracking my portfolio in real-time gives me complete peace of mind.'],
  ['Samke-Zambia', '25', 'The onboarding process took under two minutes. Having transparent yield reporting without confusing fees makes managing my investments effortless.'],
  ['Craig-Angola', '29', 'The platform interface is incredibly fast and responsive. I love how straightforward it is to monitor project rails and see instant verification updates.'],
  ['Thandiwe-MZ', '27', "Finally, an investment interface that doesn't feel cluttered or overly complex. Secure, straightforward, and built for real usability."],
  ['Nkosana-ZIM', '31', 'Security was my biggest priority. The multi-factor verification system and instant transaction logs prove this platform takes investor protection seriously.'],
  ['Rudo-ZAM', '26', "The mobile layout and clean design make checking daily returns seamless whether I'm on my laptop or on the go."],
  ['Sipho-SA', '30', "Depositing, tracking asset performance, and accessing support was smooth from day one. Hands down the most reliable investment layout I've used."],
] as const

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
              <Link href={`/projects/${p.id}`} key={p.name} className="pulse-tile group relative overflow-hidden rounded-2xl border border-white/[0.09] bg-card p-6 shadow-xl">
                <Image src={p.image ?? '/projects/lovable-pulse-hero.jpg'} alt="" fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover opacity-80 saturate-150 brightness-125 contrast-105 transition-transform duration-700 group-hover:scale-105" aria-hidden="true" />
                <div className="absolute inset-0 bg-gradient-to-r from-background/55 via-background/35 to-transparent" aria-hidden="true" />
                
                <div className="relative flex items-center justify-between">
                  <span className="rounded-lg border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium backdrop-blur-md">
                    {p.sector}
                  </span>
                  <span className="text-xs font-medium text-muted-foreground">{p.country}</span>
                </div>
                
                <p className="relative mt-5 text-lg font-display font-semibold text-foreground">{p.name}</p>
                <p className="relative mt-1 text-sm font-medium text-amber-400">Target return: {p.targetYield} p.a.</p>

                {/* Funding bar */}
                <div className="relative mt-6">
                  <div className="mb-2 flex justify-between text-xs text-muted-foreground font-technical">
                    <span>Funded</span>
                    <span className="font-bold text-foreground">{Math.round((p.funded / p.goal) * 100)}%</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-white/[0.08] p-0.5 border border-white/5">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-amber-600 to-amber-400 transition-all duration-1000"
                      style={{ width: `${p.funded}%` }}
                    />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-white/[0.08]">
        <div className="mx-auto max-w-6xl px-5 py-24">
          <div className="mb-10 max-w-xl">
            <p className="mb-3 text-xs font-bold uppercase tracking-widest text-gold">Questions, answered</p>
            <h2 className="text-3xl font-display font-semibold tracking-tight md:text-4xl">A clearer way to get started</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {FAQS.map(([question, answer]) => (
              <details key={question} className="group rounded-2xl border border-white/[0.08] bg-white/[0.02] p-5">
                <summary className="cursor-pointer list-none pr-8 text-base font-semibold text-foreground marker:hidden">{question}</summary>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{answer}</p>
              </details>
            ))}
          </div>
          <div className="mt-14 rounded-3xl border border-amber-400/20 bg-amber-400/[0.04] p-8 text-center">
            <p className="text-xs font-bold uppercase tracking-widest text-gold">Investor voices</p>
            <h2 className="mt-3 text-2xl font-display font-semibold">Real experiences belong here</h2>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground">Testimonials are shown with the names and wording supplied by the Pulse team.</p>
            <div className="mt-8 grid gap-3 text-left sm:grid-cols-2 lg:grid-cols-4">
              {TESTIMONIALS.map(([name, age, quote]) => (
                <div key={name} className="rounded-2xl border border-white/[0.08] bg-black/20 p-4">
                  <p className="text-sm font-semibold text-foreground">{name} <span className="font-normal text-muted-foreground">({age})</span></p>
                  <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{quote}</p>
                </div>
              ))}
            </div>
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
