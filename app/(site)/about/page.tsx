import type { Metadata } from 'next'
import { Activity, BadgeCheck, Globe, ShieldCheck } from 'lucide-react'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'About',
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
    <>
      {/* Header */}
      <section className="border-b border-white/[0.06]">
        <div className="mx-auto max-w-6xl px-5 pb-20 pt-16 md:pt-24">
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-gold">About Pulse</p>
          <h1 className="max-w-2xl text-4xl font-semibold tracking-tight text-balance md:text-5xl">
            Investing in Africa&apos;s next chapter
          </h1>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-muted-foreground text-pretty">
            Pulse was founded on a simple conviction: African projects produce real returns, but are largely inaccessible
            to everyday investors. We are changing that — with technology, transparency, and purpose.
          </p>
        </div>
      </section>

      {/* Mission */}
      <section className="mx-auto max-w-6xl px-5 py-16">
        <div className="grid gap-10 md:grid-cols-2 md:gap-16">
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-gold">Mission</p>
            <h2 className="text-2xl font-semibold tracking-tight">
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
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-gold">For NOWPayments approval</p>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Pulse Investment Group operates a fully compliant investment platform with mandatory identity
              verification (KYC) for all investors. All financial activity is recorded in an immutable transaction
              ledger. We operate under corporate registration and use NOWPayments exclusively to process crypto
              deposit payments — providing African investors with a borderless, low-fee funding option.
            </p>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Our business email for platform enquiries and partnerships is{' '}
              <a href="mailto:contact@pulseinvest.africa" className="font-medium text-gold hover:underline">
                contact@pulseinvest.africa
              </a>
              . For technical or compliance questions, reach us at{' '}
              <a href="mailto:compliance@pulseinvest.africa" className="font-medium text-gold hover:underline">
                compliance@pulseinvest.africa
              </a>
              .
            </p>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="border-t border-white/[0.06] bg-white/[0.015]">
        <div className="mx-auto max-w-6xl px-5 py-16">
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-gold">Our values</p>
          <h2 className="mb-10 text-2xl font-semibold tracking-tight">What we stand for</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {VALUES.map((v) => (
              <div key={v.title} className="rounded-2xl border border-white/[0.08] bg-background p-6">
                <span className="flex size-10 items-center justify-center rounded-xl bg-gold/[0.12] text-gold">
                  {v.icon}
                </span>
                <p className="mt-4 font-semibold">{v.title}</p>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{v.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-5 py-16 text-center">
        <h2 className="text-2xl font-semibold tracking-tight">Ready to join Pulse?</h2>
        <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-muted-foreground text-pretty">
          Create an account, complete KYC, and start investing in real African projects today.
          Yields are variable. Capital is at risk.
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/auth/sign-up"
            className="inline-flex items-center gap-2 rounded-xl bg-gold px-7 py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
          >
            Create account
          </Link>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 rounded-xl border border-white/12 px-7 py-3 text-sm font-medium transition-colors hover:bg-white/[0.04]"
          >
            Contact us
          </Link>
        </div>
      </section>
    </>
  )
}
