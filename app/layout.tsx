import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import { ExperienceProvider } from '@/components/pulse/experience-provider'

const geistSans = Geist({ subsets: ['latin'], variable: '--font-geist-sans' })
const geistMono = Geist_Mono({ subsets: ['latin'], variable: '--font-geist-mono' })

const siteUrl = 'https://pulseinvest.uk'
const siteDescription =
  'Pulse is a transparent investment platform for real SADC projects. Yields are variable and based on actual project performance. Investing carries risk. This is a product demo.'

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Pulse Invest — Transparent project investing',
    template: '%s | Pulse Invest',
  },
  description: siteDescription,
  applicationName: 'Pulse Invest',
  generator: 'v0.app',
  alternates: {
    canonical: '/',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
  openGraph: {
    type: 'website',
    url: siteUrl,
    siteName: 'Pulse Invest',
    title: 'Pulse Invest — Transparent project investing',
    description: siteDescription,
    images: [{ url: '/pulse-icon.png', width: 1024, height: 1024, alt: 'Pulse Invest' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Pulse Invest — Transparent project investing',
    description: siteDescription,
    images: ['/pulse-icon.png'],
  },
  icons: {
    icon: [
      { url: '/icon-light-32x32.png', media: '(prefers-color-scheme: light)' },
      { url: '/icon-dark-32x32.png', media: '(prefers-color-scheme: dark)' },
      { url: '/pulse-icon.png', sizes: '1024x1024', type: 'image/png' },
    ],
    apple: '/apple-icon.png',
  },
}

export const viewport: Viewport = {
  colorScheme: 'dark',
  themeColor: '#050505',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} bg-background`}>
      <body className="font-sans antialiased">
        <ExperienceProvider>{children}</ExperienceProvider>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebSite',
              name: 'Pulse Invest',
              url: siteUrl,
              description: siteDescription,
            }),
          }}
        />
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
