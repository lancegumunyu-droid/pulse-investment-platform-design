import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getSnapshot } from '@/lib/pulse/data-access'
import { PulseApp } from '@/components/pulse/app'

// This route depends on the logged-in user's session and must be
// evaluated per-request — without this, Next.js tries to statically
// prerender it at build time (no request/session exists then), which
// was the actual cause of the "NEXT_PUBLIC_SUPABASE_URL must be set"
// build failure.
export const dynamic = 'force-dynamic'

export default async function AppPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // IMPORTANT: redirect() is called here, completely outside any
  // try/catch. Wrapping it in a try/catch (as the homepage and login
  // form both used to do) causes the redirect signal itself to be
  // caught and swallowed, which is what produced the redirect loops
  // fixed earlier in this app. Do not wrap this in try/catch.
  if (!user) {
    redirect('/auth/login')
  }

  const initial = await getSnapshot(user.id)

  return <PulseApp initial={initial} />
}
