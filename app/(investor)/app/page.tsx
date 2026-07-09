'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client'
import { fetchSnapshot } from '@/app/actions/pulse'
import { PulseApp } from '@/components/pulse/app'
import type { Snapshot } from '@/lib/pulse/types'
import { Activity } from 'lucide-react'

export default function InvestorAppPage() {
  const router = useRouter()
  const [snapshot, setSnapshot] = useState<Snapshot | null>(null)
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      router.replace('/auth/login')
      return
    }
    const supabase = createClient()
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) {
        router.replace('/auth/login')
        return
      }
      const snap = await fetchSnapshot()
      if (!snap) {
        router.replace('/auth/login')
        return
      }
      setSnapshot(snap)
      setChecking(false)
    })
  }, [router])

  if (checking || !snapshot) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Activity className="size-6 animate-spin text-gold" />
      </div>
    )
  }

  return <PulseApp initial={snapshot} />
}
