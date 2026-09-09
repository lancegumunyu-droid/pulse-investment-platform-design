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

  // 2. Fetch live snapshot data passing user ID and verified auth email
  let initial = null
  try {
    initial = await getSnapshot(user.id, user.email)
  } catch (err) {
    console.error('[Pulse App Page] Failed to fetch user snapshot:', err)
  }

  const isAdminUser = user.email?.toLowerCase() === 'lancegumunyu@gmail.com'

  // 3. Fallback safe state if database query returns null
  const safeInitial = initial || {
    cash: 0,
    pulse: 0,
    staked: 0,
    pendingYield: 0,
    holdings: [],
    txns: [],
    kyc: isAdminUser ? 'verified' : 'none',
    wallet: null,
    referralCode: 'PULSE-' + user.id.slice(0, 6).toUpperCase(),
    fullName: user.user_metadata?.full_name || null,
    email: user.email || null,
    tier: 1,
    isAdmin: isAdminUser,
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

  // Pass both `initial` and `initialSnapshot` to prevent prop naming mismatches
  return <PulseApp initial={safeInitial} initialSnapshot={safeInitial} />
}
