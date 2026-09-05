import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getSnapshot } from '@/lib/pulse/data-access'
import { PulseApp } from '@/components/pulse/app'
import { ShieldAlert, RefreshCcw } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

// Force per-request evaluation (prevents static prerender build failures)
export const dynamic = 'force-dynamic'

function RecoveryState({ message }: { message: string }) {
  return (
    <main className="relative flex min-h-dvh flex-col items-center justify-center bg-background px-5 py-12 text-center text-foreground">
      <div className="relative z-10 mx-auto w-full max-w-md rounded-3xl border border-gold/30 bg-background/95 p-8 shadow-2xl backdrop-blur-xl">
        <div className="mx-auto mb-5 flex size-16 items-center justify-center rounded-2xl border border-destructive/30 bg-destructive/10 text-destructive shadow-sm">
          <ShieldAlert className="size-8" />
        </div>
        <h1 className="text-xl font-bold tracking-tight">Portfolio Sync Interrupted</h1>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{message}</p>
        <div className="mt-6 flex flex-col gap-3">
          <Button asChild variant="gold" size="lg" className="w-full"><a href="/app">Reconnect Portfolio</a></Button>
          <Button asChild variant="glass" size="sm" className="w-full"><Link href="/contact">Contact Support</Link></Button>
        </div>
      </div>
    </main>
  )
}

export default async function AppPage() {
  let supabase: Awaited<ReturnType<typeof createClient>> | null = null
  try {
    supabase = await createClient()
  } catch {
    supabase = null
  }

  if (!supabase) {
    return <RecoveryState message="Supabase is connected to the project, but its public runtime variables are not available in this preview yet." />
  }

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  // IMPORTANT: redirect() must run outside any try/catch block
  if (authError || !user) {
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
    savedWallets: [],
  }

  // If snapshot loading catastrophically failed, render a gorgeous recovery state
  if (fetchError && !initial) {
    return (
      <main className="relative flex min-h-dvh flex-col items-center justify-center bg-background px-5 py-12 text-center text-foreground selection:bg-gold/30">
        {/* Background glow effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute left-1/2 top-1/3 -translate-x-1/2 -translate-y-1/2 size-96 rounded-full bg-gold/10 blur-[120px]" />
        </div>

        <div className="relative z-10 mx-auto max-w-md w-full glass-gold rounded-3xl border border-gold/30 bg-background/95 p-8 shadow-2xl backdrop-blur-xl">
          <div className="mx-auto mb-5 flex size-16 items-center justify-center rounded-2xl border border-destructive/30 bg-destructive/10 text-destructive shadow-sm">
            <ShieldAlert className="size-8" />
          </div>

          <h1 className="text-xl font-bold tracking-tight text-foreground">Portfolio Sync Interrupted</h1>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground text-pretty">
            We encountered a temporary connection issue while securely loading your SADC investment ledger.
          </p>

          <div className="mt-6 flex flex-col gap-3">
            <Button asChild variant="gold" size="lg" className="w-full">
              <a href="/app" className="inline-flex items-center justify-center gap-2">
                <RefreshCcw className="size-4" />
                Reconnect Portfolio
              </a>
            </Button>
            <Button asChild variant="glass" size="sm" className="w-full">
              <Link href="/contact">Contact Support</Link>
            </Button>
          </div>
        </div>
      </main>
    )
  }

  return <PulseApp initial={safeInitial} />
}
