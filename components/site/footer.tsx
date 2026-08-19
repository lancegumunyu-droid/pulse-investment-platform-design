import Link from 'next/link'
import { Activity } from 'lucide-react'

const COLS = [
  {
    title: 'Platform',
    links: [
      { href: '/auth/sign-up', label: 'Get started' },
      { href: '/auth/login', label: 'Sign in' },
      { href: '/projects', label: 'Projects' },
    ],
  },
  {
    title: 'Company',
    links: [
      { href: '/about', label: 'About us' },
      { href: '/contact', label: 'Contact' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { href: '/legal/terms', label: 'Terms of use' },
      { href: '/legal/privacy', label: 'Privacy policy' },
      { href: '/legal/risk-disclaimer', label: 'Risk disclaimer' },
    ],
  },
]

export function SiteFooter() {
  return (
    <footer className="border-t border-white/[0.08] bg-background text-foreground">
      <div className="mx-auto max-w-6xl px-5 py-14">
        <div className="grid grid-cols-2 gap-10 md:grid-cols-4">
          <div className="col-span-2 md:col-span-1">
            <Link
              href="/"
              className="inline-flex items-center gap-2.5 transition-opacity hover:opacity-90"
              aria-label="Pulse home"
            >
              <span className="flex size-8 items-center justify-center rounded-lg border border-gold/30 bg-gold-soft text-gold shadow-sm">
                <Activity className="size-4" />
              </span>
              <span className="font-bold tracking-tight text-foreground">Pulse</span>
            </Link>
            <p className="mt-3 text-xs leading-relaxed text-muted-foreground text-pretty">
              Connecting capital to impactful SADC projects. Transparency, performance, growth.
            </p>
            <a
              href="mailto:contact@pulseinvest.africa"
              className="mt-3 block text-xs text-muted-foreground transition-colors hover:text-gold"
            >
              contact@pulseinvest.africa
            </a>
          </div>

          {COLS.map((col) => (
            <div key={col.title}>
              <p className="mb-3 text-xs font-bold uppercase tracking-widest text-muted-foreground">
                {col.title}
              </p>
              <ul className="space-y-2.5">
                {col.links.map((l) => (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      className="text-sm text-muted-foreground transition-colors hover:text-gold"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-start justify-between gap-4 border-t border-white/[0.08] pt-8 text-xs text-muted-foreground md:flex-row md:items-center">
          <p>&copy; {new Date().getFullYear()} Pulse Investment Group. All rights reserved.</p>
          <p className="max-w-xl text-pretty leading-relaxed">
            Investments carry risk of capital loss. Variable yields depend entirely on real project performance and
            are not guaranteed. Past performance is not indicative of future results. This platform is for
            informational purposes.
          </p>
        </div>
      </div>
    </footer>
  )
}
