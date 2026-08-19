import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { PWAInstaller } from '@/components/pulse/pwa-installer'
import './globals.css'

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
    default: 'Pulse — Invest in real African projects',
    template: '%s | Pulse',
  },
  description:
    'Pulse is a transparent investment platform for real SADC projects. Yields are variable and based on actual project performance. Investing carries risk. This is a product demo.',
  keywords: ['investment', 'Africa', 'SADC', 'private markets', 'Southern Africa', 'Pulse'],
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
    siteName: 'Pulse Platform',
    title: 'Pulse — Invest in real African projects',
    description:
      'Pulse is a transparent investment platform for real SADC projects.',
    images: [
      {
        url: '/og',
        width: 1200,
        height: 630,
        alt: 'Pulse Investment Platform',
      },
    ],
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} dark bg-[#050505]`}
    >
      <body className="font-sans text-zinc-100 antialiased selection:bg-[#f59e0b] selection:text-black min-h-screen flex flex-col">
        {children}
        <PWAInstaller />
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
