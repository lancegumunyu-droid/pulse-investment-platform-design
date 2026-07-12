/**
 * Integrations Status Endpoint
 * GET /api/integrations/status
 * Returns complete status of all integrations
 */

import { NextRequest, NextResponse } from 'next/server'
import { getIntegrationStatus, validateIntegrations } from '@/lib/pulse/integrations-config'
import { healthCheck } from '@/lib/db/neon-client'
import { checkAuthHealth } from '@/lib/auth/auth-integrations'
import { getEmailServiceStatus } from '@/lib/email/email-client'

export async function GET(request: NextRequest) {
  try {
    // Check authorization (admin only)
    const authHeader = request.headers.get('authorization')
    const adminKey = process.env.ADMIN_API_KEY
    if (!adminKey || authHeader !== `Bearer ${adminKey}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Collect all integration statuses
    const [integrationConfig, dbHealth, authHealth, emailHealth] = await Promise.all([
      Promise.resolve(getIntegrationStatus()),
      healthCheck(),
      checkAuthHealth(),
      getEmailServiceStatus(),
    ])

    const validation = validateIntegrations()

    return NextResponse.json(
      {
        success: true,
        timestamp: new Date().toISOString(),
        validation: {
          allConfigured: validation.valid,
          errors: validation.errors,
        },
        services: {
          database: dbHealth,
          authentication: authHealth,
          email: emailHealth,
          integrations: integrationConfig,
        },
        environment: {
          nodeEnv: process.env.NODE_ENV,
          vercelEnv: process.env.VERCEL_ENV,
          isDevelopment: process.env.NODE_ENV === 'development',
          isProduction: process.env.NODE_ENV === 'production',
        },
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('[INTEGRATIONS] Status check error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Status check failed',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    )
  }
}
