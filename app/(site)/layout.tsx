import type { Metadata, Viewport } from 'next'
import { Inter, JetBrains_Mono } from 'next/font/google'
import { SiteNav } from '@/components/site/nav'
import { SiteFooter } from '@/components/site/footer'
import { PWAInstaller } from '@/components/pulse/pwa-installer'
import '@/app/globals.css'

/**
 * Must match app/layout.tsx exactly. This layout previously loaded Geist
 * while globals.css resolved --font-sans to --font-jakarta, which was never
 * defined here — so every marketing page silently fell back to the system
 * font while the app shell used a different one. That was the mismatch.
 */
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
  weight: ['400', '500', '600', '700', '800'],
})

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
  title: {
    default: 'Pulse Investment Group',
    template: '%s | Pulse Investment Group',
  },
  description:
    'Pulse is a transparent investment platform connecting capital to high-impact, real SADC projects across Southern Africa. Investments carry risk.',
  keywords: ['investment', 'Africa', 'SADC', 'private markets', 'Southern Africa'],
  manifest: '/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Pulse',
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icons/icon.svg', type: 'image/svg+xml' },
    ],
    shortcut: ['/favicon.ico'],
    apple: [{ url: '/icons/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
    other: [{ rel: 'mask-icon', url: '/icons/mask-icon.svg', color: '#f59e0b' }],
  },
  openGraph: {
    type: 'website',
    locale: 'en_ZA',
    siteName: 'Pulse Investment Group',
    title: 'Pulse Investment Group',
    description:
      'Pulse is a transparent investment platform connecting capital to high-impact, real SADC projects across Southern Africa.',
    images: [{ url: '/og', width: 1200, height: 630, alt: 'Pulse Investment Group' }],
  },
}

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${monoNum.variable} dark`}>
      <body className="bg-background text-foreground font-sans antialiased selection:bg-amber-500 selection:text-black min-h-screen flex flex-col pt-safe pb-safe pl-safe pr-safe">
        <div className="flex min-h-screen flex-col relative overflow-hidden">
          <SiteNav />
          <main className="flex-1 pulse-app">{children}</main>
          <SiteFooter />
        </div>
        <PWAInstaller />
      </body>
    </html>
  )
}
