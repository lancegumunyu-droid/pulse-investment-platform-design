import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export default function Icon() {
  return new ImageResponse(
    <div
      style={{
        background: '#050505',
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#f59e0b',
        fontSize: 64,
        fontWeight: 700,
      }}
    >
      P
    </div>,
    { width: 64, height: 64 },
  )
}
