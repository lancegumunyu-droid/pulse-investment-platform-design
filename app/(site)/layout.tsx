import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { SiteNav } from '@/components/site/nav'
import { SiteFooter } from '@/components/site/footer'
import { PWAInstaller } from '@/components/pulse/pwa-installer'
import '@/app/globals.css'

const geistSans = Geist({
  subsets: ['latin'],
  variable: '--font-geist-sans',
  display: 'swap',
})

const geistMono = Geist_Mono({
  subsets: ['latin'],
  variable: '--font-geist-mono',
  display: 'swap',
})

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: '#050505',
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
    apple: [
      { url: '/icons/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    other: [
      {
        rel: 'mask-icon',
        url: '/icons/mask-icon.svg',
        color: '#f59e0b',
      },
    ],
  },
  openGraph: {
    type: 'website',
    locale: 'en_ZA',
    siteName: 'Pulse Investment Group',
    title: 'Pulse Investment Group',
    description:
      'Pulse is a transparent investment platform connecting capital to high-impact, real SADC projects across Southern Africa.',
    images: [
      {
        url: '/og',
        width: 1200,
        height: 630,
        alt: 'Pulse Investment Group',
      },
    ],
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} dark`}>
      <body className="bg-[#050505] text-zinc-100 font-sans antialiased selection:bg-[#f59e0b] selection:text-black min-h-screen flex flex-col">
        <div className="flex min-h-screen flex-col">
          <SiteNav />
          <main className="flex-1">{children}</main>
          <SiteFooter />
        </div>
        <PWAInstaller />
      </body>
    </html>
  )
}
