import Link from 'next/link'
import { redirect } from 'next/navigation'
import { ArrowRight, BadgeCheck, Globe, ShieldCheck, TrendingUp, Zap, Lock, Wallet, Shield, Users } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'

const STATS = [
  { label: 'Active projects', value: '12' },
  { label: 'Countries', value: '6' },
  { label: 'Investors', value: '400+' },
]

const ANNOUNCEMENTS = [
  {
    title: 'Pulse Private Sale Now Open',
    description: 'The private sale of PULSE tokens has officially begun. Secure your allocation and get early access to premium features.',
    date: '2026-07-11',
    tag: 'PULSE Token',
  },
  {
    title: 'New Project: Kalahari Solar Farm',
    description: 'We are pleased to announce a new energy project in Botswana targeting 24-28% annual returns.',
    date: '2026-07-10',
    tag: 'New Investment',
  },
  {
    title: 'Enhanced Security Update',
    description: 'Platform security system has been continuously upgraded. Your funds are safer than ever.',
    date: '2026-07-09',
    tag: 'Security',
  },
]

const FEATURES = [
  {
    icon: <TrendingUp className="size-8" />,
    title: 'Spot Trading',
    body: 'Invest in real African projects with transparent returns and regular updates.',
  },
  {
    icon: <Lock className="size-8" />,
    title: 'Position Management',
    body: 'Track and manage your investments with detailed analytics and performance metrics.',
  },
  {
    icon: <Wallet className="size-8" />,
    title: 'Buy and Sell',
    body: 'Trade your positions easily with secure P2P matching and instant settlement.',
  },
  {
    icon: <Shield className="size-8" />,
    title: 'Account Security',
    body: 'Personalized access mechanisms and security protocols protect your account and funds.',
  },
  {
    icon: <ShieldCheck className="size-8" />,
    title: 'KYC Verification',
    body: 'Identity verification ensures platform safety and regulatory compliance for all users.',
  },
  {
    icon: <Users className="size-8" />,
    title: 'User Dashboard',
    body: 'The complete investment hub with portfolio tracking, analytics, and market insights.',
  },
]

const FAQS = [
  {
    question: 'How do I get started investing with Pulse?',
    answer: 'Sign up with your email, complete KYC verification, deposit funds via USDT or BTC, and begin exploring available investment opportunities.',
  },
  {
    question: 'What projects are available to invest in?',
    answer: 'Pulse offers vetted SADC projects across energy, agriculture, fintech, and infrastructure sectors with yields ranging from 18-34% p.a.',
  },
  {
    question: 'How do I withdraw my returns?',
    answer: 'Returns are automatically credited to your wallet. You can withdraw via the same crypto method you used to deposit.',
  },
  {
    question: 'Is my investment secure?',
    answer: 'All investments are secured with our RLS database protection, identity verification, and transparent audit trails.',
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
  // Check if user is already logged in
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    // If logged in, go straight to app
    if (user) {
      redirect('/app')
    }
  } catch (err) {
    // If Supabase isn't configured, just show the marketing page
    console.log('[v0] Supabase auth check skipped:', (err as Error).message)
  }

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-white/[0.06]">
        <div className="mx-auto max-w-6xl px-5 pb-16 pt-20 md:pt-28">
          <h1 className="max-w-3xl text-5xl font-bold leading-tight tracking-tight text-balance md:text-6xl md:leading-tight">
            The Most Trusted<br />
            <span className="text-gold">Blockchain</span> &<br />
            PULSE
          </h1>

          <p className="mt-6 max-w-xl text-base leading-relaxed text-muted-foreground text-pretty md:text-lg">
            Invest in real African projects with real returns. Pulse connects global investors to vetted SADC opportunities across energy, agriculture, fintech, and infrastructure.
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
              View projects
            </Link>
          </div>

          {/* Stats strip */}
          <div className="mt-12 grid grid-cols-3 gap-6">
            {STATS.map((s) => (
              <div key={s.label}>
                <p className="text-3xl font-bold tracking-tight text-gold">{s.value}+</p>
                <p className="mt-1 text-sm text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Announcements */}
      <section className="border-b border-white/[0.06]">
        <div className="mx-auto max-w-6xl px-5 py-16">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gold">Announcements</h2>
          </div>
          <div className="space-y-4">
            {ANNOUNCEMENTS.map((ann) => (
              <div key={ann.title} className="flex items-start gap-4 rounded-lg border border-white/[0.08] bg-white/[0.03] p-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="inline-block rounded bg-gold/20 px-2 py-1 text-xs font-semibold text-gold">{ann.tag}</span>
                    <span className="text-xs text-muted-foreground">{ann.date}</span>
                  </div>
                  <p className="mt-2 font-semibold">{ann.title}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{ann.description}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 text-center">
            <button className="text-sm font-medium text-gold hover:opacity-80">View more →</button>
          </div>
        </div>
      </section>

      {/* App Showcase */}
      <section className="border-b border-white/[0.06]">
        <div className="mx-auto max-w-6xl px-5 py-16">
          <div className="grid items-center gap-12 md:grid-cols-2">
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-balance md:text-4xl">
                Trade anytime, anywhere!
              </h2>
              <p className="mt-4 text-base leading-relaxed text-muted-foreground">
                Download the app, and all transactions are at your fingertips. Manage your portfolio, track returns, and make investments with confidence.
              </p>
              <div className="mt-6 flex gap-3">
                <Link href="/auth/sign-up" className="rounded-lg bg-gold px-6 py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90">
                  Download App
                </Link>
              </div>
            </div>
            <div className="flex justify-center">
              <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6 text-center">
                <p className="text-gold font-semibold">Android APK</p>
                <p className="mt-2 text-muted-foreground">Available on iOS and Android</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Product Features */}
      <section className="border-b border-white/[0.06]">
        <div className="mx-auto max-w-6xl px-5 py-16">
          <div className="mb-12">
            <h2 className="text-3xl font-bold tracking-tight">Product description</h2>
            <p className="mt-2 text-muted-foreground">Start your investment journey with Pulse</p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f) => (
              <div key={f.title} className="group rounded-xl border border-white/[0.08] bg-white/[0.03] p-6 transition-all hover:bg-white/[0.05]">
                <div className="flex size-12 items-center justify-center rounded-lg bg-gold/[0.15] text-gold transition-all group-hover:bg-gold/20">
                  {f.icon}
                </div>
                <p className="mt-4 font-semibold text-lg">{f.title}</p>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="border-b border-white/[0.06]">
        <div className="mx-auto max-w-6xl px-5 py-16">
          <div className="mb-12">
            <h2 className="text-3xl font-bold tracking-tight text-center">FAQ</h2>
          </div>
          <div className="mx-auto max-w-3xl space-y-4">
            {FAQS.map((faq) => (
              <details key={faq.question} className="group rounded-lg border border-white/[0.08] bg-white/[0.03] p-6">
                <summary className="flex cursor-pointer items-center justify-between font-semibold text-lg">
                  {faq.question}
                  <span className="text-gold transition-transform group-open:rotate-180">↓</span>
                </summary>
                <p className="mt-4 text-muted-foreground">{faq.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Live Projects */}
      <section className="border-b border-white/[0.06] bg-white/[0.015]">
        <div className="mx-auto max-w-6xl px-5 py-16">
          <div className="mb-12">
            <h2 className="text-3xl font-bold tracking-tight">Live projects</h2>
            <p className="mt-2 text-muted-foreground">Where your capital goes</p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {PROJECTS.map((p) => (
              <div key={p.name} className="group rounded-xl border border-white/[0.08] bg-background p-6 transition-all hover:border-gold/30">
                <div className="flex items-center justify-between">
                  <span className="rounded-lg border border-white/[0.08] bg-white/[0.03] px-2.5 py-1 text-xs font-medium">
                    {p.sector}
                  </span>
                  <span className="text-xs text-muted-foreground">{p.location}</span>
                </div>
                <p className="mt-4 font-semibold text-lg">{p.name}</p>
                <p className="mt-1 text-sm text-muted-foreground">Target: {p.target} p.a.</p>

                <div className="mt-6">
                  <div className="mb-2 flex justify-between text-xs">
                    <span className="text-muted-foreground">Funded</span>
                    <span className="font-semibold text-gold">{p.funded}%</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-white/[0.08]">
                    <div
                      className="h-full bg-gold"
                      style={{ width: `${p.funded}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-8 text-center">
            <Link href="/projects" className="text-gold font-medium hover:opacity-80">
              View all projects →
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-white/[0.06] bg-gradient-to-b from-transparent to-gold/5">
        <div className="mx-auto max-w-6xl px-5 py-20 text-center">
          <p className="text-sm text-muted-foreground">
            Register for a chance to receive up to 1,000 USDT in trial funds and a mystery bonus.
          </p>
          <div className="mt-6">
            <Link
              href="/auth/sign-up"
              className="inline-flex items-center gap-2 rounded-xl bg-gold px-8 py-3 font-semibold text-primary-foreground transition-opacity hover:opacity-90"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
