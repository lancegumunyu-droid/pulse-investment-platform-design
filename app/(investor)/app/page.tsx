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

  // Safely fetch snapshot data with robust error recovery
  let initial = null
  let fetchError = null

  try {
    initial = await getSnapshot(user.id)
  } catch (err) {
    fetchError = (err as Error).message
    console.error('[Pulse App Page] Failed to fetch user snapshot:', fetchError)
  }

  // Fallback state if database snapshot fails or is uninitialized
  const safeInitial = initial || {
    cash: 0,
    pulse: 0,
    staked: 0,
    pendingYield: 0,
    holdings: [],
    txns: [],
    kyc: 'none',
    wallet: null,
    referralCode: 'PULSE-' + user.id.slice(0, 6).toUpperCase(),
    fullName: user.user_metadata?.full_name || null,
    email: user.email || null,
    tier: 1,
    isAdmin: false,
    points: 0,
    founderNumber: null,
    walletId: null,
    username: null,
    referralCount: 0,
    referralVerifiedCount: 0,
    badges: [],
    adminScope: null,
    cardStatus: 'none',
    cardRef: null,
    savedWallets: [],
  }

  return <PulseApp initial={safeInitial} />
}
