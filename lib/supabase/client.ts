'use client'

import { createBrowserClient } from '@supabase/ssr'

let cachedClient: ReturnType<typeof createBrowserClient> | null = null

function getEnvVars() {
  // Try multiple sources for env vars
  const url =
    typeof window !== 'undefined'
      ? (window as any).__SUPABASE_URL ||
        process.env.NEXT_PUBLIC_SUPABASE_URL
      : process.env.NEXT_PUBLIC_SUPABASE_URL
  const key =
    typeof window !== 'undefined'
      ? (window as any).__SUPABASE_ANON_KEY ||
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      : process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  return { url, key }
}

export function isSupabaseConfigured() {
  const { url, key } = getEnvVars()
  const configured = !!(url && key && url.length > 0 && key.length > 0)
  return configured
}

export function createClient() {
  // Return cached client if already created
  if (cachedClient) {
    return cachedClient
  }

  const { url, key } = getEnvVars()

  if (!url || !key || url.length === 0 || key.length === 0) {
    console.error('[v0] Supabase configuration error - missing env vars', {
      urlPresent: !!url && url.length > 0,
      keyPresent: !!key && key.length > 0,
    })
    throw new Error(
      'Supabase is not configured. Please check Settings → Vars in your v0 project. Required: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY',
    )
  }

  cachedClient = createBrowserClient(url, key)
  return cachedClient
}
