'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Activity, Menu, X } from 'lucide-react'
import { cn } from '@/lib/utils'

const LINKS = [
  { href: '/about', label: 'About' },
  { href: '/projects', label: 'Projects' },
  { href: '/contact', label: 'Contact' },
]

export function SiteNav() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  return (
    <header className="site-nav sticky top-0 z-50 w-full border-b border-white/[0.06] bg-background/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5" aria-label="Pulse home">
          <span className="flex size-8 items-center justify-center rounded-lg glass-gold">
            <Activity className="size-4 text-gold" />
          </span>
          <span className="font-semibold tracking-tight">Pulse</span>
        </Link>

        {/* Desktop links */}
        <nav className="hidden items-center gap-7 md:flex" aria-label="Main navigation">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={cn(
                'text-sm font-medium transition-colors',
                pathname === l.href ? 'text-foreground' : 'text-muted-foreground hover:text-foreground',
              )}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        {/* CTA */}
        <div className="hidden items-center gap-3 md:flex">
          <Link
            href="/auth/login"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Sign in
          </Link>
          <Link
            href="/auth/sign-up"
            className="rounded-xl bg-gold px-4 py-2 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
          >
            Get started
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          className="flex size-9 items-center justify-center rounded-xl md:hidden"
          onClick={() => setOpen((o) => !o)}
          aria-label={open ? 'Close menu' : 'Open menu'}
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div className="border-t border-white/[0.06] bg-background px-5 pb-5 pt-4 md:hidden">
          <nav className="flex flex-col gap-1" aria-label="Mobile navigation">
            {LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className={cn(
                  'rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
                  pathname === l.href
                    ? 'bg-white/[0.06] text-foreground'
                    : 'text-muted-foreground hover:bg-white/[0.04] hover:text-foreground',
                )}
              >
                {l.label}
              </Link>
            ))}
            <div className="mt-3 flex gap-2">
              <Link
                href="/auth/login"
                onClick={() => setOpen(false)}
                className="flex-1 rounded-xl border border-white/12 py-2.5 text-center text-sm font-medium text-muted-foreground"
              >
                Sign in
              </Link>
              <Link
                href="/auth/sign-up"
                onClick={() => setOpen(false)}
                className="flex-1 rounded-xl bg-gold py-2.5 text-center text-sm font-semibold text-primary-foreground"
              >
                Get started
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}
