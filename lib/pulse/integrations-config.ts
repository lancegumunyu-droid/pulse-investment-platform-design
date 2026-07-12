/**
 * PULSE Integration Configuration
 * Custom prefix: PULSE_
 * Manages all third-party integrations
 */

export const INTEGRATION_CONFIG = {
  // Custom prefix for all PULSE env variables
  PREFIX: 'PULSE_',

  // Database Integration (Neon PostgreSQL)
  database: {
    provider: 'neon',
    prefix: 'NEON_',
    urls: {
      pooled: process.env.NEON_POSTGRES_URL || process.env.NEON_DATABASE_URL,
      unpooled: process.env.NEON_DATABASE_URL_UNPOOLED || process.env.NEON_POSTGRES_URL_NON_POOLING,
      prisma: process.env.NEON_POSTGRES_PRISMA_URL,
      noSsl: process.env.NEON_POSTGRES_URL_NO_SSL,
    },
    connection: {
      host: process.env.NEON_PGHOST || process.env.NEON_POSTGRES_HOST,
      hostUnpooled: process.env.NEON_PGHOST_UNPOOLED,
      port: 5432,
      database: process.env.NEON_PGDATABASE || process.env.NEON_POSTGRES_DATABASE,
      user: process.env.NEON_PGUSER || process.env.NEON_POSTGRES_USER,
      password: process.env.NEON_PGPASSWORD || process.env.NEON_POSTGRES_PASSWORD,
      projectId: process.env.NEON_PROJECT_ID,
    },
    isConfigured: !!process.env.NEON_DATABASE_URL,
  },

  // Authentication Integration (Clerk)
  auth: {
    provider: 'clerk',
    prefix: 'CLERK_',
    keys: {
      publishableKey: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
      secretKey: process.env.CLERK_SECRET_KEY,
    },
    isConfigured: !!(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && process.env.CLERK_SECRET_KEY),
  },

  // Alternative Auth (Auth0)
  auth0: {
    provider: 'auth0',
    prefix: 'AUTH0_',
    config: {
      clientId: process.env.AUTH0_CLIENT_ID,
      clientSecret: process.env.AUTH0_CLIENT_SECRET,
      domain: process.env.AUTH0_DOMAIN,
      secret: process.env.AUTH0_SECRET,
    },
    isConfigured: !!(process.env.AUTH0_CLIENT_ID && process.env.AUTH0_CLIENT_SECRET),
  },

  // Email Service (AgentMail)
  email: {
    provider: 'agentmail',
    prefix: 'AGENTMAIL_',
    keys: {
      apiKey: process.env.AGENTMAIL_API_KEY,
    },
    isConfigured: !!process.env.AGENTMAIL_API_KEY,
  },

  // Supabase Integration (JWT-based)
  supabase: {
    provider: 'supabase',
    prefix: 'SUPABASE_',
    keys: {
      jwt: process.env.JWT,
    },
    isConfigured: !!process.env.JWT,
  },

  // Analytics
  analytics: {
    vercelWebAnalytics: process.env.VERCEL_WEB_ANALYTICS_ID,
    gaTrackingId: process.env.NEXT_PUBLIC_GA_TRACKING_ID,
  },

  // AI Gateway
  ai: {
    gatewayApiKey: process.env.AI_GATEWAY_API_KEY,
    isConfigured: !!process.env.AI_GATEWAY_API_KEY,
  },
}

// Validate all critical integrations
export function validateIntegrations(): { valid: boolean; errors: string[] } {
  const errors: string[] = []

  if (!INTEGRATION_CONFIG.database.isConfigured) {
    errors.push('Database (Neon) not configured - NEON_DATABASE_URL missing')
  }

  if (!INTEGRATION_CONFIG.auth.isConfigured && !INTEGRATION_CONFIG.auth0.isConfigured) {
    errors.push('Authentication not configured - Clerk or Auth0 required')
  }

  if (!INTEGRATION_CONFIG.email.isConfigured) {
    errors.push('Email service (AgentMail) not configured - AGENTMAIL_API_KEY missing')
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}

// Get primary database URL
export function getDatabaseUrl(): string {
  return (
    INTEGRATION_CONFIG.database.urls.pooled ||
    INTEGRATION_CONFIG.database.urls.unpooled ||
    process.env.DATABASE_URL ||
    ''
  )
}

// Get primary auth provider
export function getAuthProvider(): 'clerk' | 'auth0' | null {
  if (INTEGRATION_CONFIG.auth.isConfigured) return 'clerk'
  if (INTEGRATION_CONFIG.auth0.isConfigured) return 'auth0'
  return null
}

// Environment variables status report
export function getIntegrationStatus() {
  return {
    timestamp: new Date().toISOString(),
    integrations: {
      database: {
        provider: INTEGRATION_CONFIG.database.provider,
        configured: INTEGRATION_CONFIG.database.isConfigured,
        host: INTEGRATION_CONFIG.database.connection.host,
        database: INTEGRATION_CONFIG.database.connection.database,
      },
      auth: {
        primary: getAuthProvider(),
        clerk: INTEGRATION_CONFIG.auth.isConfigured,
        auth0: INTEGRATION_CONFIG.auth0.isConfigured,
      },
      email: {
        provider: INTEGRATION_CONFIG.email.provider,
        configured: INTEGRATION_CONFIG.email.isConfigured,
      },
      ai: {
        configured: INTEGRATION_CONFIG.ai.isConfigured,
      },
    },
    validation: validateIntegrations(),
  }
}
