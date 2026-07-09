import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getSnapshot } from '@/lib/pulse/data-access'
import { PulseApp } from '@/components/pulse/app'

export default async function InvestorAppPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const snapshot = await getSnapshot(user.id)
  return <PulseApp initial={snapshot} />
}
