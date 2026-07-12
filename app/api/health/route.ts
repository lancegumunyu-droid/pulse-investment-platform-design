import { NextResponse } from 'next/server'
import { verifyAllIntegrations } from '@/lib/integrations/verify'
import { getEnvStatus } from '@/lib/env'

export async function GET() {
  try {
    const [integrations, envStatus] = await Promise.all([
      verifyAllIntegrations(),
      Promise.resolve(getEnvStatus()),
    ])

    const allConnected = integrations.every((i) => i.status === 'connected')

    return NextResponse.json({
      status: allConnected ? 'operational' : 'degraded',
      timestamp: new Date().toISOString(),
      integrations,
      environment: envStatus,
      version: '2.0.0',
    })
  } catch (err) {
    return NextResponse.json(
      {
        status: 'error',
        error: (err as Error).message,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    )
  }
}
