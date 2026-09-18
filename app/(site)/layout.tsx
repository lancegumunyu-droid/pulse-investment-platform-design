import type { Metadata, Viewport } from 'next'
import { SiteNav } from '@/components/site/nav'
import { SiteFooter } from '@/components/site/footer'
import { PWAInstaller } from '@/components/pulse/pwa-installer'
import '@/app/globals.css'

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
    <div className="flex min-h-screen flex-col overflow-hidden bg-background text-foreground font-sans antialiased selection:bg-amber-500 selection:text-black pt-safe pb-safe pl-safe pr-safe">
      <SiteNav />
      <main className="flex-1 pulse-app">{children}</main>
      <SiteFooter />
      <PWAInstaller />
    </div>
  )
}
