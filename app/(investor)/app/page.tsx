import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getSnapshot } from '@/lib/pulse/data-access'
import { PulseApp } from '@/components/pulse/app'
import { ShieldAlert, RefreshCcw } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export const dynamic = 'force-dynamic'

export default async function AppPage() {
  const supabase = await createClient()

  // Use getUser() to securely validate the session from cookies
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    redirect('/auth/login')
  }

  // Safely fetch snapshot data
  let initial = null
  try {
    initial = await getSnapshot(user.id)
  } catch (err) {
    console.error('[Pulse App Page] Failed to fetch user snapshot:', err)
  }

  // Fallback safe state if profile row doesn't exist yet in database
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

  // Correctly passing initialSnapshot here:
  return <PulseApp initialSnapshot={safeInitial} />
}
