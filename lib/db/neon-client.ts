/**
 * Neon PostgreSQL Database Client
 * Singleton pattern for database connections
 * Pooled connections for Vercel Edge Runtime compatibility
 */

import { sql } from '@vercel/postgres'
import { INTEGRATION_CONFIG, getDatabaseUrl } from '@/lib/pulse/integrations-config'

// Database connection status
export interface DbStatus {
  connected: boolean
  provider: string
  host?: string
  database?: string
  error?: string
}

// Test database connection
export async function testDatabaseConnection(): Promise<DbStatus> {
  try {
    const dbUrl = getDatabaseUrl()

    if (!dbUrl) {
      return {
        connected: false,
        provider: 'neon',
        error: 'No database URL configured',
      }
    }

    // Simple test query
    const result = await sql`SELECT NOW() as timestamp`

    return {
      connected: !!result,
      provider: INTEGRATION_CONFIG.database.provider,
      host: INTEGRATION_CONFIG.database.connection.host,
      database: INTEGRATION_CONFIG.database.connection.database,
    }
  } catch (error) {
    return {
      connected: false,
      provider: 'neon',
      error: error instanceof Error ? error.message : 'Unknown connection error',
    }
  }
}

// Get active connection string
export function getConnectionString(): string {
  return getDatabaseUrl()
}

// Connection pool stats
export async function getPoolStats() {
  try {
    // Neon pooler endpoint from config
    const poolerHost = INTEGRATION_CONFIG.database.connection.host
    const unpooledHost = INTEGRATION_CONFIG.database.connection.hostUnpooled

    return {
      pooled: {
        host: poolerHost,
        type: 'Neon Connection Pooler (PgBouncer)',
      },
      unpooled: {
        host: unpooledHost,
        type: 'Direct Connection',
      },
      currentlyUsing: 'pooled',
      reason: 'Optimized for serverless/edge runtime',
    }
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

// Health check
export async function healthCheck() {
  const status = await testDatabaseConnection()

  return {
    service: 'Neon PostgreSQL',
    status: status.connected ? 'healthy' : 'unhealthy',
    timestamp: new Date().toISOString(),
    details: status,
  }
}

// Export SQL helper for use throughout the app
export { sql }
