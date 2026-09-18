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
  { href: '/apply/project', label: 'Submit a project' },
]

export function SiteNav() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  return (
    <header className="site-nav sticky top-0 z-50 w-full border-b border-white/10 bg-zinc-950/85 backdrop-blur-2xl shadow-[0_10px_30px_rgba(0,0,0,0.8)]">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
        {/* Logo */}
        <Link
          href="/"
          className="group inline-flex items-center gap-2.5 transition-transform hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/50 rounded-xl p-0.5"
          aria-label="Pulse home"
        >
          <span className="flex size-9 items-center justify-center rounded-xl border border-amber-400/30 bg-amber-400/10 text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.2)] transition-transform group-hover:scale-105">
            <Activity className="size-4" />
          </span>
          <span className="font-bold tracking-tight text-white transition-colors group-hover:text-amber-400 text-lg">
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
                  'relative text-sm font-medium transition-colors hover:text-amber-400',
                  isActive ? 'text-white font-semibold' : 'text-zinc-400'
                )}
              >
                {l.label}
                {isActive && (
                  <motion.span
                    layoutId="desktopNavIndicator"
                    className="absolute -bottom-1.5 left-0 right-0 h-0.5 rounded-full bg-amber-400 shadow-[0_0_10px_rgba(245,158,11,0.7)]"
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
            className="text-sm font-medium text-zinc-400 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/50 rounded-lg px-2 py-1"
          >
            Sign in
          </Link>
          <Link
            href="/auth/sign-up"
            className="rounded-xl border border-amber-400/40 bg-gradient-to-r from-amber-500 to-amber-400 px-4 py-2 text-sm font-semibold text-zinc-950 shadow-[0_0_20px_rgba(245,158,11,0.25)] transition-all hover:brightness-110 hover:shadow-[0_0_25px_rgba(245,158,11,0.4)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/50"
          >
            Get started
          </Link>
        </div>

        {/* Mobile hamburger button */}
        <motion.button
          whileTap={{ scale: 0.9 }}
          className="flex size-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] text-white md:hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/50"
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
            className="overflow-hidden border-t border-white/10 bg-zinc-950/95 backdrop-blur-2xl md:hidden shadow-[0_20px_40px_rgba(0,0,0,0.9)]"
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
                          ? 'border border-amber-400/30 bg-amber-400/10 text-amber-400 font-semibold shadow-[0_0_15px_rgba(245,158,11,0.1)]'
                          : 'text-zinc-400 hover:bg-white/[0.04] hover:text-white'
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
                  className="flex-1 rounded-xl border border-white/10 bg-white/[0.02] py-3 text-center text-sm font-medium text-white transition-colors hover:bg-white/[0.06]"
                >
                  Sign in
                </Link>
                <Link
                  href="/auth/sign-up"
                  onClick={() => setOpen(false)}
                  className="flex-1 rounded-xl border border-amber-400/40 bg-gradient-to-r from-amber-500 to-amber-400 py-3 text-center text-sm font-semibold text-zinc-950 shadow-[0_0_20px_rgba(245,158,11,0.25)] transition-all hover:brightness-110"
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
