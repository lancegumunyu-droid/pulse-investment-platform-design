import type { Metadata, Viewport } from 'next'
import { Plus_Jakarta_Sans, JetBrains_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { PWAInstaller } from '@/components/pulse/pwa-installer'
import './globals.css'

/**
 * ONE interface typeface for the entire application — Plus Jakarta Sans.
 * Roboto is declared as the system fallback inside globals.css.
 * Geist and Space Grotesk have been removed: loading them was what made the
 * marketing pages and the app shell render in different faces.
 */
const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-jakarta',
  display: 'swap',
  weight: ['400', '500', '600', '700', '800'],
})

/** Numerals only: tabular figures for balances, amounts, APY, hashes. */
const monoNum = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono-num',
  display: 'swap',
  weight: ['400', '500', '600', '700'],
})

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: '#060608',
  colorScheme: 'dark',
}

export const metadata: Metadata = {
  metadataBase: new URL('https://pulseinvest.uk'),
  title: {
    default: 'Pulse — Invest in real African projects',
    template: '%s | Pulse',
  },
  description:
    'Pulse is a transparent investment platform for real SADC projects. Yields are variable and based on actual project performance. Investing carries risk.',
  keywords: ['investment', 'Africa', 'SADC', 'private markets', 'Southern Africa', 'Pulse'],
  manifest: '/manifest.webmanifest',
  appleWebApp: { capable: true, statusBarStyle: 'black-translucent', title: 'Pulse' },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icons/icon.svg', type: 'image/svg+xml' },
    ],
    shortcut: ['/favicon.ico'],
    apple: [{ url: '/icons/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
    other: [{ rel: 'mask-icon', url: '/icons/mask-icon.svg', color: '#f59e0b' }],
  },
  verification: { google: 'googlec3f80f65cdb022b2' },
  alternates: { canonical: 'https://pulseinvest.uk' },
  openGraph: {
    type: 'website',
    locale: 'en_ZA',
    siteName: 'Pulse Platform',
    title: 'Pulse — Invest in real African projects',
    description: 'Pulse is a transparent investment platform for real SADC projects.',
    images: [{ url: '/og', width: 1200, height: 630, alt: 'Pulse Investment Platform' }],
  },
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      suppressHydrationWarning
      className={`${jakarta.variable} ${monoNum.variable} dark bg-[#060608] text-foreground h-full`}
    >
      <body className="font-sans text-zinc-100 antialiased selection:bg-amber-500 selection:text-black min-h-screen min-h-[100dvh] flex flex-col relative overflow-x-hidden bg-background">
        <div
          className="pointer-events-none fixed inset-0 z-0 opacity-60 mix-blend-screen transform-gpu"
          style={{
            background:
              'radial-gradient(circle 900px at 50% -200px, rgba(245,158,11,0.16), rgba(16,185,129,0.07) 50%, transparent 75%)',
          }}
        />
        <div className="relative z-10 flex flex-col min-h-screen min-h-[100dvh] flex-1 w-full max-w-full overflow-x-hidden">
          {children}
        </div>
        <PWAInstaller />
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
