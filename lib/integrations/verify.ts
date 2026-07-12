import 'server-only'

export interface IntegrationStatus {
  name: string
  status: 'connected' | 'missing' | 'error'
  message: string
  variables: string[]
}

export async function verifySupabaseIntegration(): Promise<IntegrationStatus> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !anonKey || !serviceKey) {
    return {
      name: 'Supabase',
      status: 'missing',
      message: 'Missing required environment variables',
      variables: [
        url ? '✓ NEXT_PUBLIC_SUPABASE_URL' : '✗ NEXT_PUBLIC_SUPABASE_URL',
        anonKey ? '✓ NEXT_PUBLIC_SUPABASE_ANON_KEY' : '✗ NEXT_PUBLIC_SUPABASE_ANON_KEY',
        serviceKey ? '✓ SUPABASE_SERVICE_ROLE_KEY' : '✗ SUPABASE_SERVICE_ROLE_KEY',
      ],
    }
  }

  try {
    const response = await fetch(`${url}/rest/v1/`, {
      headers: {
        Authorization: `Bearer ${anonKey}`,
        'apikey': anonKey,
      },
    })

    if (response.ok) {
      return {
        name: 'Supabase',
        status: 'connected',
        message: 'Connected and operational',
        variables: [
          '✓ NEXT_PUBLIC_SUPABASE_URL',
          '✓ NEXT_PUBLIC_SUPABASE_ANON_KEY',
          '✓ SUPABASE_SERVICE_ROLE_KEY',
        ],
      }
    }
  } catch (err) {
    return {
      name: 'Supabase',
      status: 'error',
      message: `Connection failed: ${(err as Error).message}`,
      variables: [
        '✓ NEXT_PUBLIC_SUPABASE_URL',
        '✓ NEXT_PUBLIC_SUPABASE_ANON_KEY',
        '✓ SUPABASE_SERVICE_ROLE_KEY',
      ],
    }
  }

  return {
    name: 'Supabase',
    status: 'error',
    message: 'Unknown error',
    variables: [],
  }
}

export async function verifyAllIntegrations(): Promise<IntegrationStatus[]> {
  return [await verifySupabaseIntegration()]
}
