import type { Metadata, Viewport } from 'next'
import { SiteNav } from '@/components/site/nav'
import { SiteFooter } from '@/components/site/footer'

export const metadata: Metadata = {
  title: {
    default: 'Pulse Investment Group',
    template: '%s | Pulse Investment Group',
  },
  description:
    'Pulse is a transparent investment platform connecting capital to high-impact, real SADC projects across Southern Africa. Investments carry risk.',
  keywords: ['investment', 'Africa', 'SADC', 'private markets', 'Southern Africa'],
  openGraph: {
    type: 'website',
    locale: 'en_ZA',
    siteName: 'Pulse Investment Group',
  },
}

export const viewport: Viewport = {
  colorScheme: 'dark',
  themeColor: '#050505',
  width: 'device-width',
  initialScale: 1,
}

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteNav />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </div>
  )
}
