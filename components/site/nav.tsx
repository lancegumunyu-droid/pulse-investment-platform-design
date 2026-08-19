'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
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
    <header className="site-nav sticky top-0 z-50 w-full border-b border-white/[0.08] bg-background/85 backdrop-blur-xl shadow-lg shadow-black/20">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
        {/* Logo */}
        <Link
          href="/"
          className="group inline-flex items-center gap-2.5 transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/50 rounded-xl p-0.5"
          aria-label="Pulse home"
        >
          <span className="flex size-8 items-center justify-center rounded-lg border border-gold/30 bg-gold-soft text-gold shadow-sm transition-transform group-hover:scale-105">
            <Activity className="size-4" />
          </span>
          <span className="font-bold tracking-tight text-foreground transition-colors group-hover:text-gold">
            Pulse
          </span>
        </Link>

        {/* Desktop links */}
        <nav className="hidden items-center gap-8 md:flex" aria-label="Main navigation">
          {LINKS.map((l) => {
            const isActive = pathname === l.href
            return (
              <Link
                key={l.href}
                href={l.href}
                className={cn(
                  'relative text-sm font-medium transition-colors hover:text-gold',
                  isActive ? 'text-foreground font-semibold' : 'text-muted-foreground'
                )}
              >
                {l.label}
                {isActive && (
                  <motion.span
                    layoutId="desktopNavIndicator"
                    className="absolute -bottom-1.5 left-0 right-0 h-0.5 rounded-full bg-gold shadow-[0_0_8px_rgba(232,163,23,0.6)]"
                    transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                  />
                )}
              </Link>
            )
          })}
        </nav>

        {/* Desktop CTA */}
        <div className="hidden items-center gap-3.5 md:flex">
          <Link
            href="/auth/login"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/50 rounded-lg px-2 py-1"
          >
            Sign in
          </Link>
          <Link
            href="/auth/sign-up"
            className="rounded-xl border border-gold/30 bg-gold px-4 py-2 text-sm font-semibold text-primary-foreground shadow-md shadow-gold/20 transition-all hover:bg-gold/90 hover:shadow-gold/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/50"
          >
            Get started
          </Link>
        </div>

        {/* Mobile hamburger button */}
        <motion.button
          whileTap={{ scale: 0.9 }}
          className="flex size-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] text-foreground md:hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/50"
          onClick={() => setOpen((o) => !o)}
          aria-label={open ? 'Close menu' : 'Open menu'}
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </motion.button>
      </div>

      {/* Mobile drawer with smooth Framer Motion entrance */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden border-t border-white/[0.08] bg-background/95 backdrop-blur-2xl md:hidden"
          >
            <div className="flex flex-col gap-1.5 px-5 py-5">
              <nav className="flex flex-col gap-1.5" aria-label="Mobile navigation">
                {LINKS.map((l) => {
                  const isActive = pathname === l.href
                  return (
                    <Link
                      key={l.href}
                      href={l.href}
                      onClick={() => setOpen(false)}
                      className={cn(
                        'rounded-xl px-3.5 py-3 text-sm font-medium transition-all',
                        isActive
                          ? 'border border-gold/20 bg-gold-soft text-gold font-semibold shadow-sm'
                          : 'text-muted-foreground hover:bg-white/[0.04] hover:text-foreground'
                      )}
                    >
                      {l.label}
                    </Link>
                  )
                })}
              </nav>

              <div className="mt-4 flex gap-3 border-t border-white/10 pt-4">
                <Link
                  href="/auth/login"
                  onClick={() => setOpen(false)}
                  className="flex-1 rounded-xl border border-white/12 bg-white/[0.02] py-3 text-center text-sm font-medium text-foreground transition-colors hover:bg-white/[0.06]"
                >
                  Sign in
                </Link>
                <Link
                  href="/auth/sign-up"
                  onClick={() => setOpen(false)}
                  className="flex-1 rounded-xl border border-gold/30 bg-gold py-3 text-center text-sm font-semibold text-primary-foreground shadow-md shadow-gold/20 transition-all hover:bg-gold/90"
                >
                  Get started
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
