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
    <footer className="border-t border-white/[0.06] bg-background">
      <div className="mx-auto max-w-6xl px-5 py-14">
        <div className="grid grid-cols-2 gap-10 md:grid-cols-4">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2.5" aria-label="Pulse home">
              <span className="flex size-8 items-center justify-center rounded-lg glass-gold">
                <Activity className="size-4 text-gold" />
              </span>
              <span className="font-semibold tracking-tight">Pulse</span>
            </Link>
            <p className="mt-3 text-xs leading-relaxed text-muted-foreground text-pretty">
              Connecting capital to impactful SADC projects. Transparency, performance, growth.
            </p>
            <p className="mt-3 text-xs text-muted-foreground">
              contact@pulseinvest.africa
            </p>
          </div>

          {COLS.map((col) => (
            <div key={col.title}>
              <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                {col.title}
              </p>
              <ul className="space-y-2.5">
                {col.links.map((l) => (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-start justify-between gap-4 border-t border-white/[0.06] pt-8 text-xs text-muted-foreground md:flex-row md:items-center">
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
