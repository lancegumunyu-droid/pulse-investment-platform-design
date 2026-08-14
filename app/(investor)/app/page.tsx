import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getSnapshot } from '@/lib/pulse/data-access'
import { PulseApp } from '@/components/pulse/app'

// Force per-request evaluation (prevents static prerender build failures)
export const dynamic = 'force-dynamic'

export default async function AppPage() {
  const supabase = await createClient()
  
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // IMPORTANT: redirect() must run outside any try/catch block
  if (!user) {
    redirect('/auth/login')
  }

  // Safely fetch snapshot data with fallback protection
  let initial = null

  try {
    initial = await getSnapshot(user.id)
  } catch (err) {
    console.error('[Pulse App Page] Failed to fetch user snapshot:', (err as Error).message)
  }

  // Ensure initial is never undefined when handed to PulseApp
  const safeInitial = initial || {
    user: { id: user.id, email: user.email },
    portfolio: [],
    stats: {
      portfolioReturn: 0,
      totalInvested: 0,
      totalYieldEarned: 0,
    },
    projects: [],
  }

  return <PulseApp initial={safeInitial} />
}
