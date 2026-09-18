import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, FileCheck2, ShieldAlert, UserRoundCheck } from 'lucide-react'

export const metadata: Metadata = { title: 'Legal & Trust Centre | Pulse', description: 'Pulse legal notices, risk disclosures, privacy, consent, and fraud reporting.' }

const ITEMS = [
  { href: '/legal/risk-disclaimer', title: 'Risk disclaimer', body: 'Understand investment risk, variable returns, and why capital is never guaranteed.', icon: ShieldAlert },
  { href: '/legal/privacy', title: 'Privacy policy', body: 'How we process and protect personal information across the platform.', icon: UserRoundCheck },
  { href: '/legal/data-consent', title: 'Data consent', body: 'The information we collect, why we use it, and the choices available to you.', icon: FileCheck2 },
  { href: '/legal/terms', title: 'Terms of use', body: 'The rules and responsibilities that govern use of Pulse services.', icon: FileCheck2 },
  { href: '/legal/fraud-report', title: 'Report fraud or impersonation', body: 'Report scams, fake representatives, phishing, or suspicious activity.', icon: ShieldAlert },
]

export default function LegalPage() {
  return <div className="min-h-screen bg-background text-foreground"><section className="border-b border-white/10"><div className="mx-auto max-w-6xl px-5 py-16 md:py-24"><p className="text-xs font-bold uppercase tracking-[0.22em] text-gold">Trust centre</p><h1 className="mt-4 max-w-3xl text-4xl font-bold tracking-tight text-balance md:text-6xl">Clear terms for serious participation.</h1><p className="mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground md:text-lg">Our legal centre explains how Pulse operates, how your information is handled, and where to report concerns.</p></div></section><section className="mx-auto grid max-w-6xl gap-5 px-5 py-16 md:grid-cols-2">{ITEMS.map(({ href, title, body, icon: Icon }) => <Link key={href} href={href} className="group rounded-3xl border border-white/10 bg-white/[0.03] p-7 transition-all hover:-translate-y-1 hover:border-gold/30 hover:bg-white/[0.05]"><div className="flex items-start justify-between"><span className="flex size-11 items-center justify-center rounded-2xl border border-gold/20 bg-gold-soft text-gold"><Icon className="size-5" /></span><ArrowRight className="size-5 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-gold" /></div><h2 className="mt-6 text-xl font-bold">{title}</h2><p className="mt-2 text-sm leading-relaxed text-muted-foreground">{body}</p></Link>)}</section><section className="mx-auto max-w-6xl px-5 pb-20"><div className="rounded-3xl border border-yellow-500/25 bg-yellow-500/10 p-6 text-sm leading-relaxed text-yellow-50/80">Pulse Investment Group is based in the SADC region. This website is informational and does not constitute personal investment, legal, tax, or financial advice. Speak to an appropriately qualified adviser before making decisions.</div></section></div>
}
