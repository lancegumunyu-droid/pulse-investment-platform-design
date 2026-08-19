import type { Metadata } from 'next'
import { Activity, BadgeCheck, Globe, ShieldCheck, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export const metadata: Metadata = {
  title: 'About | Pulse',
  description:
    'Pulse Investment Group is a pan-African investment platform connecting global capital to vetted SADC projects. Learn about our mission and values.',
}

const VALUES = [
  {
    icon: <BadgeCheck className="size-5" />,
    title: 'Radical transparency',
    body: 'Every investment is backed by regular, published performance reports. We show you where your money is, what it is doing, and how it is performing.',
  },
  {
    icon: <Globe className="size-5" />,
    title: 'African focus',
    body: 'We invest exclusively in SADC projects — businesses and infrastructure built by Africans, for Africans — with an eye on long-term regional growth.',
  },
  {
    icon: <ShieldCheck className="size-5" />,
    title: 'Investor protection',
    body: 'KYC verification, immutable transaction ledgers, and service-role-secured databases mean investor funds and data are always protected.',
  },
  {
    icon: <Activity className="size-5" />,
    title: 'Variable, performance-based returns',
    body: 'Yields are real and variable — they depend entirely on how projects actually perform. We never manufacture or guarantee returns.',
  },
]

export default function AboutPage() {
  return (
    <div className="relative overflow-hidden bg-background text-foreground">
      {/* Background glow effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute left-1/4 top-0 -translate-x-1/2 size-[500px] rounded-full bg-gold/5 blur-[140px]" />
      </div>

      {/* Header */}
      <section className="relative border-b border-white/[0.08]">
        <div className="mx-auto max-w-6xl px-5 pb-20 pt-16 md:pt-24">
          <span className="inline-block mb-3 rounded-full border border-gold/20 bg-gold-soft px-3 py-1 text-xs font-semibold uppercase tracking-widest text-gold">
            About Pulse
          </span>
          <h1 className="max-w-3xl text-4xl font-extrabold tracking-tight text-balance md:text-6xl">
            Investing in Africa&apos;s next chapter
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground text-pretty md:text-lg">
            Pulse was founded on a simple conviction: African projects produce real returns, but are largely inaccessible
            to everyday investors. We are changing that — with technology, transparency, and purpose.
          </p>
        </div>
      </section>

      {/* Mission & Compliance */}
      <section className="relative mx-auto max-w-6xl px-5 py-20">
        <div className="grid gap-12 md:grid-cols-2 md:gap-16 items-start">
          <div className="glass rounded-3xl border border-white/10 p-8 shadow-2xl backdrop-blur-xl">
            <span className="text-xs font-bold uppercase tracking-widest text-gold">Mission</span>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-foreground">
              Bridge the gap between capital and African opportunity
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              Across the SADC region — from Botswana&apos;s solar belt to Zimbabwe&apos;s agritech corridor —
              there is an enormous pipeline of fundable, scalable projects that lack access to structured capital.
              Pulse exists to close that gap.
            </p>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              We vet every project rigorously, structure fair investment terms, and provide investors with full
              visibility into performance. No smoke. No mirrors. No manufactured yields.
            </p>
          </div>

          <div className="glass-gold rounded-3xl border border-gold/30 p-8 shadow-2xl backdrop-blur-xl">
            <span className="text-xs font-bold uppercase tracking-widest text-gold">Platform Standards &amp; Verification</span>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Pulse Investment Group operates a fully compliant investment platform with mandatory identity
              verification (KYC) for all investors. All financial activity is recorded in an immutable transaction
              ledger. We operate under corporate registration and use NOWPayments exclusively to process crypto
              deposit payments — providing African investors with a borderless, low-fee funding option.
            </p>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              Our business email for platform enquiries and partnerships is{' '}
              <a href="mailto:contact@pulseinvest.africa" className="font-semibold text-gold transition-colors hover:underline">
                contact@pulseinvest.africa
              </a>
              . For technical or compliance questions, reach us at{' '}
              <a href="mailto:compliance@pulseinvest.africa" className="font-semibold text-gold transition-colors hover:underline">
                compliance@pulseinvest.africa
              </a>
              .
            </p>
          </div>
        </div>
      </section>

      {/* Values Grid */}
      <section className="relative border-t border-white/[0.08] bg-white/[0.015] py-20">
        <div className="mx-auto max-w-6xl px-5">
          <div className="mb-12">
            <span className="text-xs font-bold uppercase tracking-widest text-gold">Our values</span>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-foreground">What we stand for</h2>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            {VALUES.map((v) => (
              <div
                key={v.title}
                className="group rounded-3xl border border-white/10 bg-background/80 p-8 shadow-xl backdrop-blur-xl transition-all hover:border-gold/30 hover:bg-background"
              >
                <span className="flex size-12 items-center justify-center rounded-2xl border border-gold/20 bg-gold-soft text-gold shadow-sm">
                  {v.icon}
                </span>
                <p className="mt-5 text-lg font-bold tracking-tight text-foreground">{v.title}</p>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{v.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative mx-auto max-w-4xl px-5 py-24 text-center">
        <div className="glass-gold rounded-3xl border border-gold/30 p-10 md:p-14 shadow-2xl backdrop-blur-2xl">
          <h2 className="text-3xl font-extrabold tracking-tight text-foreground">Ready to join Pulse?</h2>
          <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-muted-foreground text-pretty">
            Create an account, complete KYC, and start investing in real African projects today.
            Yields are variable. Capital is at risk.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Button asChild variant="gold" size="lg">
              <Link href="/auth/sign-up" className="inline-flex items-center gap-2">
                Create account
                <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button asChild variant="glass" size="lg">
              <Link href="/contact">Contact us</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
