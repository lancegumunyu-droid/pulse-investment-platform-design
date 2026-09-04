import { NextResponse } from 'next/server'

export function GET() {
  return new NextResponse(`# Pulse Investment Group

> Transparent investment education and SADC project information. Investment carries risk; returns are variable and not guaranteed.

- Website: https://pulseinvest.uk
- Projects: https://pulseinvest.uk/projects
- About: https://pulseinvest.uk/about
- Risk disclosure: https://pulseinvest.uk/legal/risk-disclaimer
- Contact: mailto:support@pulseinvest.uk
- Pi Network: https://minepi.com
- Pi developer documentation: https://developers.minepi.com
`, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'public, max-age=3600' },
  })
}
