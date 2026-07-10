'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client'
import { getKycStatus } from '@/app/actions/kyc-submit'
import { KycForm } from '@/app/components/kyc-form'
import { Button } from '@/components/ui/button'
import { CheckCircle, AlertCircle } from 'lucide-react'

export default function KycPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [kycStatus, setKycStatus] = useState<any>(null)
  const [loading, setLoading] = useState(true)
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

      setUser(session.user)

      // Check KYC status
      const status = await getKycStatus()
      setKycStatus(status.data)
      setChecking(false)
    })
  }, [router])

  if (checking || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="animate-pulse text-center">
          <div className="mb-4 h-3 w-48 rounded bg-muted mx-auto"></div>
          <div className="h-2 w-32 rounded bg-muted mx-auto"></div>
        </div>
      </div>
    )
  }

  const isApproved = kycStatus?.status === 'approved'
  const isPending = kycStatus?.status === 'pending'
  const isRejected = kycStatus?.status === 'rejected'

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="mx-auto max-w-2xl">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-3xl font-bold text-foreground">Know Your Customer (KYC)</h1>
          <p className="text-muted-foreground">
            Complete your identity verification to unlock all platform features
          </p>
        </div>

        {/* Status Messages */}
        {isApproved && (
          <div className="mb-8 flex gap-3 rounded-lg border border-green-200 bg-green-50 p-4">
            <CheckCircle className="size-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-green-900">KYC Approved</h3>
              <p className="text-sm text-green-700">Your identity has been verified. You can now use all platform features.</p>
              <Button
                onClick={() => router.push('/app')}
                className="mt-3 bg-green-600 hover:bg-green-700 text-white"
                size="sm"
              >
                Go to Dashboard
              </Button>
            </div>
          </div>
        )}

        {isPending && (
          <div className="mb-8 flex gap-3 rounded-lg border border-blue-200 bg-blue-50 p-4">
            <AlertCircle className="size-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-blue-900">KYC Under Review</h3>
              <p className="text-sm text-blue-700">Your application is being reviewed by our team. This typically takes 1-2 business days.</p>
            </div>
          </div>
        )}

        {isRejected && (
          <div className="mb-8 flex gap-3 rounded-lg border border-red-200 bg-red-50 p-4">
            <AlertCircle className="size-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-red-900">KYC Rejected</h3>
              <p className="text-sm text-red-700 mb-3">
                {kycStatus?.rejection_reason || 'Your application did not meet our requirements. Please resubmit with correct information.'}
              </p>
              <Button
                onClick={() => setKycStatus(null)}
                className="bg-red-600 hover:bg-red-700 text-white"
                size="sm"
              >
                Resubmit Application
              </Button>
            </div>
          </div>
        )}

        {/* Form */}
        {!isApproved && (
          <div className="rounded-lg border border-border bg-card p-8">
            <KycForm
              onSuccess={() => {
                setKycStatus({ status: 'pending' })
              }}
            />
          </div>
        )}

        {/* Info Box */}
        <div className="mt-8 rounded-lg border border-border/50 bg-muted/30 p-6">
          <h3 className="font-semibold text-foreground mb-3">Why KYC?</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex gap-2">
              <span className="text-gold">•</span>
              <span>Comply with international financial regulations</span>
            </li>
            <li className="flex gap-2">
              <span className="text-gold">•</span>
              <span>Protect your account from unauthorized access</span>
            </li>
            <li className="flex gap-2">
              <span className="text-gold">•</span>
              <span>Enable higher transaction limits</span>
            </li>
            <li className="flex gap-2">
              <span className="text-gold">•</span>
              <span>Ensure secure financial operations</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}
