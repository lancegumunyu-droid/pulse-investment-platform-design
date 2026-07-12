export function EnvInjector() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    console.error('[v0] Environment variables not loaded on server')
    return null
  }

  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `
          window.__SUPABASE_URL = ${JSON.stringify(supabaseUrl)};
          window.__SUPABASE_ANON_KEY = ${JSON.stringify(supabaseKey)};
          console.log('[v0] Environment variables injected into window');
        `,
      }}
    />
  )
}
