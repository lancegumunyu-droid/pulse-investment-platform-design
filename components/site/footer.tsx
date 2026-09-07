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
    <footer className="relative border-t border-white/10 bg-zinc-950 text-white backdrop-blur-2xl">
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
      <div className="relative mx-auto max-w-6xl px-5 py-14">
        <div className="grid grid-cols-2 gap-10 md:grid-cols-4">
          <div className="col-span-2 md:col-span-1">
            <Link
              href="/"
              className="inline-flex items-center gap-2.5 transition-transform hover:scale-[1.02]"
              aria-label="Pulse home"
            >
              <span className="flex size-9 items-center justify-center rounded-xl border border-amber-400/30 bg-amber-400/10 text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.2)]">
                <Activity className="size-4" />
              </span>
              <span className="font-bold tracking-tight text-white text-lg">Pulse</span>
            </Link>
            <p className="mt-3.5 text-xs leading-relaxed text-zinc-400 text-pretty">
              Connecting capital to impactful SADC projects. Transparency, performance, growth.
            </p>
            <a
              href="mailto:contact@pulseinvest.africa"
              className="mt-3 block text-xs font-medium text-zinc-400 transition-colors hover:text-amber-400"
            >
              contact@pulseinvest.africa
            </a>
          </div>

          {COLS.map((col) => (
            <div key={col.title}>
              <p className="mb-3.5 text-xs font-bold uppercase tracking-widest text-zinc-400">
                {col.title}
              </p>
              <ul className="space-y-3">
                {col.links.map((l) => (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      className="text-sm text-zinc-400 transition-colors hover:text-amber-400"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-start justify-between gap-6 border-t border-white/10 pt-8 text-xs text-zinc-400 md:flex-row md:items-center">
          <p>&copy; {new Date().getFullYear()} Pulse Investment Group. All rights reserved.</p>
          <p className="max-w-xl text-pretty leading-relaxed text-zinc-500">
            Investments carry risk of capital loss. Variable yields depend entirely on real project performance and
            are not guaranteed. Past performance is not indicative of future results. This platform is for
            informational purposes.
          </p>
        </div>
      </div>
    </footer>
  )
}
