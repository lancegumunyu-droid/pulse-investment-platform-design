import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono, Plus_Jakarta_Sans, Space_Grotesk } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { PWAInstaller } from '@/components/pulse/pwa-installer'
import { GooglePiRuntime } from '@/components/pulse/google-pi'
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

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-jakarta',
  display: 'swap',
})

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk',
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
  metadataBase: new URL('https://pulseinvest.uk'),
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
  verification: {
    google: 'googlec3f80f65cdb022b2',
  },
  alternates: {
    canonical: 'https://pulseinvest.uk',
  },
  openGraph: {
    type: 'website',
    locale: 'en_ZA',
    siteName: 'Pulse Platform',
    title: 'Pulse — Invest in real African projects',
    description: 'Pulse is a transparent investment platform for real SADC projects.',
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
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} ${jakarta.variable} ${spaceGrotesk.variable} dark bg-[#050505] text-foreground`}
    >
      <body className="font-sans text-zinc-100 antialiased selection:bg-amber-500 selection:text-black min-h-screen flex flex-col relative overflow-x-hidden bg-background">
        {/* Subtle global atmospheric ambient glow */}
        <div 
          className="pointer-events-none fixed inset-0 z-0 opacity-40 mix-blend-screen"
          style={{
            background: 'radial-gradient(circle 800px at 50% -200px, rgba(245,158,11,0.08), transparent 70%)'
          }}
        />

        {/* Main Application Container with Smooth Motion Transition Wrapper */}
        <div className="relative z-10 flex flex-col min-h-screen flex-1">
          {children}
        </div>

        <GooglePiRuntime />
        <PWAInstaller />
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
