import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getSnapshot } from '@/lib/pulse/data-access'
import { PulseApp } from '@/components/pulse/app'

export const dynamic = 'force-dynamic'

export default async function AppPage() {
  const supabase = await createClient()

  // 1. Securely validate session from server cookies
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    redirect('/auth/login')
  }

  // 2. Fetch live snapshot data for the authenticated user
  let initial = null
  try {
    initial = await getSnapshot(user.id)
  } catch (err) {
    console.error('[Pulse App Page] Failed to fetch user snapshot:', err)
  }

  // 3. Fallback safe state if profile/account row doesn't exist yet
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
    isAdmin: user.email?.toLowerCase() === 'lancegumunyu@gmail.com',
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

  // Pass both `initial` and `initialSnapshot` to fix prop mismatch issues
  return <PulseApp initial={safeInitial} initialSnapshot={safeInitial} />
}
