import Image from 'next/image'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { ArrowRight, BadgeCheck, Globe, Gift, MapPin, PlayCircle, ShieldCheck, TrendingUp, Zap } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { PROJECTS } from '@/lib/pulse-data'

const STATS = [
  { label: 'Active projects', value: '12' },
  { label: 'Countries', value: '5' },
  { label: 'Target yield (p.a.)', value: '10–20%' },
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
    image: '/projects/zambezi-agri.png',
  },
  {
    icon: <BadgeCheck className="size-5" />,
    title: 'Transparent performance',
    body: 'We publish regular performance reports for every active project. You always know exactly how your capital is deployed.',
    image: '/projects/kalahari-solar.png',
  },
  {
    icon: <ShieldCheck className="size-5" />,
    title: 'Identity-verified',
    body: 'KYC verification is required before you can invest, protecting all participants and meeting regulatory expectations.',
    image: '/projects/maputo-logistics.png',
  },
  {
    icon: <Zap className="size-5" />,
    title: 'Crypto-native deposits',
    body: 'Fund your account through Pulse-supported rails with clear fees, transparent status, and investor-first controls.',
    image: '/projects/copperbelt-royalty.png',
  },
  {
    icon: <TrendingUp className="size-5" />,
    title: 'Tier-based access',
    body: 'The more you invest, the higher your tier — and the higher your access to premium projects with greater return potential.',
    image: '/projects/lovable-project-energy.jpg',
  },
  {
    icon: <BadgeCheck className="size-5" />,
    title: 'PULSE token',
    body: 'Earn PULSE tokens through the private sale and stake them for additional yield, governance participation, and platform perks.',
    image: '/projects/lovable-project-mining.jpg',
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
        <div className="mx-auto max-w-6xl px-5 pb-12 pt-16 md:pb-16 md:pt-24">
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

          <div className="mt-7 flex flex-wrap items-center gap-3">
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
          <div className="mt-10 grid grid-cols-2 gap-px rounded-2xl border border-white/[0.1] bg-white/[0.04] overflow-hidden shadow-2xl md:grid-cols-4 backdrop-blur-xl">
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

      {/* Campaign film strip */}
      <section className="mx-auto max-w-6xl px-5 py-8 sm:py-10">
        <div className="grid gap-5 lg:grid-cols-[1.1fr_.9fr]">
          <div className="group relative min-h-[25rem] overflow-hidden rounded-[2rem] border border-white/10 bg-card shadow-2xl">
            <Image src="/campaign/pulse-discussion.png" alt="People discussing Pulse investment projects" fill sizes="(max-width: 1024px) 100vw, 60vw" className="campaign-motion object-cover transition duration-700 group-hover:scale-105" priority />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-black/30 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-200 backdrop-blur"> <PlayCircle className="size-3.5" /> The Pulse story</span>
              <h2 className="mt-3 max-w-lg text-3xl font-display font-semibold tracking-tight text-white sm:text-4xl">Invest in what people can see, understand, and believe in.</h2>
            </div>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-1">
            <div className="relative min-h-[12rem] overflow-hidden rounded-[2rem] border border-white/10 bg-card">
              <Image src="/campaign/pulse-founder.png" alt="Pulse founder presenting investment projects" fill sizes="(max-width: 1024px) 100vw, 40vw" className="campaign-motion object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
              <div className="absolute bottom-0 p-5"><p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-300">Founder perspective</p><p className="mt-2 text-xl font-semibold text-white">Built for real African growth.</p></div>
            </div>
            <div className="campaign-promo relative min-h-[12rem] overflow-hidden rounded-[2rem] border border-amber-400/30 bg-gradient-to-br from-amber-500/20 to-emerald-500/10 p-6 shadow-xl">
              <Gift className="size-7 text-amber-300" aria-hidden="true" />
              <p className="mt-5 text-xs font-semibold uppercase tracking-[0.18em] text-amber-300">Limited holiday promotion · first week of December</p>
              <h3 className="mt-2 text-3xl font-display font-semibold leading-tight text-white">WIN A FULLY PAID HOLIDAY TO BALI OR MAURITIUS</h3>
              <p className="mt-3 text-sm leading-6 text-zinc-200">The top three eligible Pulse performers win a holiday experience for themselves and their selected guests.</p>
              <div className="mt-5 grid gap-2 text-sm text-white sm:grid-cols-3">
                <div className="rounded-xl border border-white/10 bg-black/20 p-3"><strong className="block text-amber-300">#1</strong><span>Family package for 3</span></div>
                <div className="rounded-xl border border-white/10 bg-black/20 p-3"><strong className="block text-amber-300">#2</strong><span>Holiday package for 2</span></div>
                <div className="rounded-xl border border-white/10 bg-black/20 p-3"><strong className="block text-amber-300">#3</strong><span>Holiday package for 1</span></div>
              </div>
              <p className="mt-4 text-xs leading-5 text-zinc-400">Rankings are based on verified referral sign-ups, deposits, and purchases. A minimum of 3,000 points is required to qualify for the leaderboard. A qualifying purchase is a minimum $75 tier or Pulse Tokens worth at least $40. Full eligibility, verification, destination, travel dates, and campaign terms apply.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="mx-auto max-w-6xl px-5 py-8 sm:py-10">
        <div className="mb-9 max-w-xl">
          <p className="mb-3 text-xs font-bold uppercase tracking-widest text-gold">Why Pulse</p>
          <h2 className="text-3xl font-display font-semibold tracking-tight text-balance md:text-4xl">
            Built for the modern African investor
          </h2>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {FEATURES.map((f) => (
            <div key={f.title} className="glow-card group relative min-h-[11.5rem] overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.02] p-5 backdrop-blur-md sm:min-h-[12rem] sm:p-6">
              <Image src={f.image} alt="" fill sizes="(max-width: 768px) 92vw, (max-width: 1024px) 45vw, 30vw" className="tile-image object-cover opacity-25 saturate-125" loading="lazy" aria-hidden="true" />
              <div className="absolute inset-0 bg-gradient-to-br from-background/95 via-background/75 to-background/35" aria-hidden="true" />
              <div className="relative z-10">
                <span className="flex size-11 items-center justify-center rounded-xl border border-amber-500/20 bg-amber-500/15 text-gold shadow-inner">{f.icon}</span>
                <p className="mt-5 text-lg font-display font-semibold leading-tight text-foreground">{f.title}</p>
                <p className="mt-2 text-sm leading-6 text-muted-foreground font-technical">{f.body}</p>
                {f.title === 'PULSE token' && <div className="mt-4 flex flex-wrap gap-2 text-[11px] font-semibold text-amber-200"><span className="rounded-full border border-amber-400/25 bg-amber-400/10 px-2.5 py-1">Private sale access</span><span className="rounded-full border border-emerald-400/25 bg-emerald-400/10 px-2.5 py-1 text-emerald-200">Stake + govern</span></div>}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Projects Section */}
      <section className="border-t border-white/[0.08] bg-white/[0.01]">
        <div className="mx-auto max-w-6xl px-5 py-16 sm:py-20">
          <div className="mb-9 flex items-end justify-between gap-4">
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

          <div className="flex snap-x snap-mandatory gap-4 overflow-x-auto overscroll-x-contain pb-4 pr-5 [scrollbar-color:rgba(245,158,11,.45)_transparent] [scrollbar-width:thin]">
            {PROJECTS.map((p) => (
              <Link href={`/projects/${p.id}`} key={p.name} className="pulse-tile group relative min-w-[18rem] max-w-[22rem] flex-1 snap-start overflow-hidden rounded-2xl border border-white/[0.09] bg-card p-6 shadow-xl sm:min-w-[21rem]">
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
        <div className="mx-auto max-w-6xl px-5 py-8 sm:py-10">
          <div className="relative aspect-[16/8] min-h-[18rem] overflow-hidden rounded-[2rem] border border-white/10 sm:aspect-[16/7]">
            <Image src="/campaign/pulse-celebration.png" alt="Pulse investors celebrating a project milestone" fill sizes="100vw" className="object-cover" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/45 to-black/15" />
            <div className="relative flex h-full max-w-xl flex-col justify-end p-6 sm:p-10"><MapPin className="size-6 text-amber-300" aria-hidden="true" /><p className="mt-4 text-xs font-semibold uppercase tracking-[0.18em] text-amber-300">A platform with momentum</p><h2 className="mt-3 text-3xl font-display font-semibold leading-tight tracking-tight text-white sm:text-4xl">The best stories are the ones you help build.</h2><p className="mt-4 text-sm leading-6 text-zinc-200">Follow progress, understand the opportunity, and make informed decisions with a clearer view of the projects behind Pulse.</p></div>
          </div>

          <div className="mt-8 mb-5 max-w-2xl sm:mt-10">
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-gold">Questions, answered</p>
            <h2 className="text-3xl font-display font-semibold leading-tight tracking-tight md:text-4xl">A clearer way to get started</h2>
            <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground">Understand the platform, the qualification steps, and how your Pulse journey begins.</p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {FAQS.map(([question, answer]) => (
              <details key={question} className="group min-w-0 rounded-2xl border border-white/[0.08] bg-white/[0.02] p-5 transition-colors hover:border-amber-400/30">
                <summary className="cursor-pointer list-none pr-8 text-base font-semibold leading-6 text-foreground marker:hidden">{question}</summary>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{answer}</p>
              </details>
            ))}
          </div>
          <div className="mt-7 rounded-3xl border border-amber-400/20 bg-amber-400/[0.04] p-5 text-center sm:mt-8 sm:p-7">
            <p className="text-xs font-bold uppercase tracking-widest text-gold">Investor voices</p>
            <h2 className="mt-3 text-2xl font-display font-semibold">Real experiences belong here</h2>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground">Testimonials are shown with the names and wording supplied by the Pulse team.</p>
            <div className="mt-6 grid gap-3 text-left sm:grid-cols-2 lg:grid-cols-4">
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
      <section className="mx-auto max-w-6xl px-5 pb-8 pt-4 sm:pb-10 sm:pt-6">
        <div className="glow-edge overflow-hidden rounded-3xl border border-white/[0.1] bg-gradient-to-b from-white/[0.05] to-white/[0.02] px-5 py-9 text-center shadow-2xl backdrop-blur-xl sm:px-8 sm:py-12">
            <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.2em] text-gold">Get started · Pulse private access</p>
          <h2 className="mx-auto max-w-lg text-3xl font-display font-semibold tracking-tight text-balance md:text-4xl">
            Ready to invest in Africa&apos;s growth?
          </h2>
          <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-muted-foreground text-pretty font-technical">
            Create your account, complete identity verification, and invest in vetted SADC projects — all from your
            phone. Yields are variable. Capital is at risk.
          </p>
          <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
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
