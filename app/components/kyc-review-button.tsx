'use client'

import { reviewKycSubmission } from '@/app/actions/kyc-actions'
import { useState } from 'react'
import { Button } from '@/components/ui/button'

interface KycReviewButtonProps {
  kycId: string
  onSuccess?: () => void
}

export function KycReviewButton({ kycId, onSuccess }: KycReviewButtonProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleApprove = async () => {
    setLoading(true)
    setError(null)
    const result = await reviewKycSubmission(kycId, 'approved')
    setLoading(false)
    
    if (result.error) {
      setError(result.error)
      console.error('[v0] KYC approval failed:', result.error)
    } else {
      onSuccess?.()
    }
  }

  const handleReject = async () => {
    setLoading(true)
    setError(null)
    const result = await reviewKycSubmission(kycId, 'rejected')
    setLoading(false)
    
    if (result.error) {
      setError(result.error)
      console.error('[v0] KYC rejection failed:', result.error)
    } else {
      onSuccess?.()
    }
  }

  return (
    <div className="flex gap-2">
      <Button
        onClick={handleApprove}
        disabled={loading}
        variant="default"
      >
        {loading ? 'Processing...' : 'Approve KYC'}
      </Button>
      <Button
        onClick={handleReject}
        disabled={loading}
        variant="destructive"
      >
        {loading ? 'Processing...' : 'Reject KYC'}
      </Button>
      {error && <p className="text-red-500 text-sm">{error}</p>}
    </div>
  )
}
