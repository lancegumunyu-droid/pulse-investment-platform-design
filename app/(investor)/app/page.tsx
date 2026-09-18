import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getSnapshot } from '@/lib/pulse/data-access'
import { PulseApp } from '@/components/pulse/app'
// Force per-request evaluation (prevents static prerender build failures)
export const dynamic = 'force-dynamic'

export default async function AppPage() {
  let supabase: Awaited<ReturnType<typeof createClient>> | null = null
  try {
    supabase = await createClient()
  } catch (err) {
    console.error('[Pulse App Page] Supabase initialization failed:', err)
    redirect('/auth/login')
  }

  if (!supabase) redirect('/auth/login')

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  // IMPORTANT: redirect() must run outside any try/catch block
  if (authError || !user) {
    console.error('[Pulse App Page] Auth error:', authError?.message)
    redirect('/auth/login')
  }

  let initial
  try {
    initial = await getSnapshot(user.id, user.email ?? undefined, supabase)
  } catch (error) {
    console.error('[Pulse App Page] Failed to fetch user snapshot:', error)
    throw error
  }

  return <PulseApp initial={initial} />
}
