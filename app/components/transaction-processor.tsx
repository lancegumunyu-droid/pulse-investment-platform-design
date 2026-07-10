'use client'

import { processTransaction } from '@/app/actions/kyc-actions'
import { useState } from 'react'
import { Button } from '@/components/ui/button'

interface TransactionProcessorProps {
  transactionId: string
  onSuccess?: () => void
}

export function TransactionProcessor({
  transactionId,
  onSuccess,
}: TransactionProcessorProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleComplete = async () => {
    setLoading(true)
    setError(null)
    const result = await processTransaction(transactionId, 'completed')
    setLoading(false)

    if (result.error) {
      setError(result.error)
      console.error('[v0] Transaction completion failed:', result.error)
    } else {
      onSuccess?.()
    }
  }

  const handleFail = async () => {
    setLoading(true)
    setError(null)
    const result = await processTransaction(transactionId, 'failed')
    setLoading(false)

    if (result.error) {
      setError(result.error)
      console.error('[v0] Transaction failure mark failed:', result.error)
    } else {
      onSuccess?.()
    }
  }

  return (
    <div className="flex gap-2">
      <Button
        onClick={handleComplete}
        disabled={loading}
        variant="default"
      >
        {loading ? 'Processing...' : 'Complete Transaction'}
      </Button>
      <Button
        onClick={handleFail}
        disabled={loading}
        variant="destructive"
      >
        {loading ? 'Processing...' : 'Mark as Failed'}
      </Button>
      {error && <p className="text-red-500 text-sm">{error}</p>}
    </div>
  )
}
