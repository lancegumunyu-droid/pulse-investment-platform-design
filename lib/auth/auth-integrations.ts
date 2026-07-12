/**
 * Authentication Integration Manager
 * Supports Clerk (primary) and Auth0 (fallback)
 * Manages all auth provider operations
 */

import { INTEGRATION_CONFIG, getAuthProvider } from '@/lib/pulse/integrations-config'

export type AuthProvider = 'clerk' | 'auth0' | null

// Auth provider status
export interface AuthStatus {
  provider: AuthProvider
  configured: boolean
  clientId?: string
  domain?: string
  error?: string
}

// Get current auth provider
export function getCurrentAuthProvider(): AuthProvider {
  return getAuthProvider()
}

// Check which auth provider is available
export function getAvailableAuthProviders() {
  return {
    clerk: INTEGRATION_CONFIG.auth.isConfigured,
    auth0: INTEGRATION_CONFIG.auth0.isConfigured,
    primary: getAuthProvider(),
  }
}

// Clerk configuration
export function getClerkConfig() {
  if (!INTEGRATION_CONFIG.auth.isConfigured) {
    return null
  }

  return {
    publishableKey: INTEGRATION_CONFIG.auth.keys.publishableKey,
    secretKey: INTEGRATION_CONFIG.auth.keys.secretKey, // Never expose in frontend
    isConfigured: true,
  }
}

// Auth0 configuration
export function getAuth0Config() {
  if (!INTEGRATION_CONFIG.auth0.isConfigured) {
    return null
  }

  return {
    clientId: INTEGRATION_CONFIG.auth0.config.clientId,
    clientSecret: INTEGRATION_CONFIG.auth0.config.clientSecret, // Never expose in frontend
    domain: INTEGRATION_CONFIG.auth0.config.domain,
    secret: INTEGRATION_CONFIG.auth0.config.secret, // Never expose in frontend
    isConfigured: true,
  }
}

// Get frontend-safe auth configuration
export function getFrontendAuthConfig() {
  const provider = getAuthProvider()

  if (provider === 'clerk') {
    return {
      provider: 'clerk',
      publishableKey: INTEGRATION_CONFIG.auth.keys.publishableKey,
    }
  }

  if (provider === 'auth0') {
    return {
      provider: 'auth0',
      clientId: INTEGRATION_CONFIG.auth0.config.clientId,
      domain: INTEGRATION_CONFIG.auth0.config.domain,
    }
  }

  return null
}

// Auth service health check
export async function checkAuthHealth(): Promise<AuthStatus> {
  const provider = getAuthProvider()

  if (!provider) {
    return {
      provider: null,
      configured: false,
      error: 'No auth provider configured',
    }
  }

  if (provider === 'clerk') {
    return {
      provider: 'clerk',
      configured: INTEGRATION_CONFIG.auth.isConfigured,
      clientId: INTEGRATION_CONFIG.auth.keys.publishableKey?.substring(0, 20) + '...',
    }
  }

  if (provider === 'auth0') {
    return {
      provider: 'auth0',
      configured: INTEGRATION_CONFIG.auth0.isConfigured,
      clientId: INTEGRATION_CONFIG.auth0.config.clientId,
      domain: INTEGRATION_CONFIG.auth0.config.domain,
    }
  }

  return {
    provider: null,
    configured: false,
  }
}

// Export auth integrations status
export function getAuthIntegrationStatus() {
  return {
    currentProvider: getAuthProvider(),
    availableProviders: getAvailableAuthProviders(),
    clerkConfig: getClerkConfig() ? { configured: true } : null,
    auth0Config: getAuth0Config() ? { configured: true } : null,
    frontendSafeConfig: getFrontendAuthConfig(),
  }
}
