import { NextResponse } from 'next/server'

export function GET() {
  return new NextResponse(
    'User-agent: *\nAllow: /\nSitemap: https://pulseinvest.uk/sitemap.xml\n',
    {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
      },
    },
  )
}
