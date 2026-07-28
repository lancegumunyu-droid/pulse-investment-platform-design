import { ImageResponse } from '@vercel/og'
import type { NextRequest } from 'next/server'

export const runtime = 'edge'

// This route only RENDERS an image from query params — it does not compute
// the score itself (that happens in getPulseScore(), which requires a real
// login session and can't run on the edge runtime this needs). The client
// calls getPulseScore() first, then builds the share URL from that real
// result. Never hardcode values here or let this route accept arbitrary
// unverified claims as "real" — it's a renderer, not a source of truth.
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const score = Math.max(0, Math.min(100, Number(searchParams.get('score')) || 0))
  const name = (searchParams.get('name') || 'A Pulse investor').slice(0, 40)
  const diversification = Math.max(0, Math.min(100, Number(searchParams.get('diversification')) || 0))
  const risk = (searchParams.get('risk') || 'Moderate').slice(0, 12)
  const beats = Math.max(0, Math.min(100, Number(searchParams.get('beats')) || 0))
  const topProject = (searchParams.get('top') || '').slice(0, 40)

  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(135deg, #050505, #14100a)',
          width: 1200,
          height: 630,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 60,
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
          <div style={{ fontSize: 28, fontWeight: 700, color: '#e8a317', letterSpacing: 2 }}>PULSE</div>
        </div>

        <div style={{ display: 'flex', alignItems: 'baseline', gap: 14 }}>
          <div style={{ fontSize: 140, fontWeight: 900, color: '#e8a317', lineHeight: 1 }}>{score}</div>
          <div style={{ fontSize: 32, color: '#888' }}>/ 100 Pulse Score</div>
        </div>

        <div style={{ fontSize: 26, color: '#f0d9a8', marginTop: 8 }}>{name}&apos;s Portfolio</div>

        <div style={{ display: 'flex', gap: 48, marginTop: 44 }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ fontSize: 34, fontWeight: 700, color: '#fff' }}>{diversification}%</div>
            <div style={{ fontSize: 16, color: '#888', marginTop: 4 }}>Diversification</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ fontSize: 34, fontWeight: 700, color: '#fff' }}>{risk}</div>
            <div style={{ fontSize: 16, color: '#888', marginTop: 4 }}>Risk exposure</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ fontSize: 34, fontWeight: 700, color: '#fff' }}>{beats}%</div>
            <div style={{ fontSize: 16, color: '#888', marginTop: 4 }}>Beats other investors</div>
          </div>
        </div>

        {topProject && (
          <div style={{ fontSize: 18, color: '#666', marginTop: 40 }}>Top holding: {topProject}</div>
        )}

        <div style={{ fontSize: 18, color: '#555', marginTop: 36 }}>pulse-invest.vercel.app</div>
      </div>
    ),
    { width: 1200, height: 630 },
  )
}
