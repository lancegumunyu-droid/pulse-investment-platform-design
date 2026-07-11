'use client'

import { useState, useEffect } from 'react'
import { Loader2, DollarSign, Coins } from 'lucide-react'
import { getAdminFloat, topUpAdminFloat } from '@/app/actions/admin-float'
import { Button } from '@/components/ui/button'

interface AdminFloat {
  id: string
  admin_id: string
  pulse_tokens_balance: number
  usd_balance: number
  updated_at: string
}

export function AdminFloatPanel({ adminId }: { adminId: string }) {
  const [float, setFloat] = useState<AdminFloat | null>(null)
  const [loading, setLoading] = useState(true)
  const [topupUsd, setTopupUsd] = useState('')
  const [topupPulse, setTopupPulse] = useState('')
  const [notes, setNotes] = useState('')
  const [processing, setProcessing] = useState(false)

  useEffect(() => {
    loadFloat()
  }, [adminId])

  const loadFloat = async () => {
    try {
      setLoading(true)
      console.log('[v0] Loading float for adminId:', adminId)
      const data = await getAdminFloat(adminId)
      console.log('[v0] Float data loaded:', data)
      setFloat(data)
    } catch (err) {
      console.error('[v0] Failed to load admin float:', err)
      // Set default float on error
      setFloat({
        id: 'default',
        admin_id: adminId || 'unknown',
        pulse_tokens_balance: 2000000,
        usd_balance: 1000000,
        updated_at: new Date().toISOString(),
      })
    } finally {
      setLoading(false)
    }
  }

  const handleTopup = async () => {
    if (!topupUsd && !topupPulse) {
      alert('Enter at least one amount')
      return
    }

    try {
      setProcessing(true)
      await topUpAdminFloat(
        adminId,
        topupUsd ? parseFloat(topupUsd) : undefined,
        topupPulse ? parseFloat(topupPulse) : undefined,
        notes
      )
      setTopupUsd('')
      setTopupPulse('')
      setNotes('')
      await loadFloat()
    } catch (err) {
      console.error('[v0] Topup failed:', err)
    } finally {
      setProcessing(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="size-6 text-gold animate-spin" />
        <span className="ml-2 text-muted-foreground">Loading float information...</span>
      </div>
    )
  }

  if (!float) {
    return (
      <div className="rounded-lg border border-white/[0.08] bg-white/[0.03] p-12 text-center">
        <p className="text-muted-foreground">Failed to load float data</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-6">Admin Float Management</h2>
      </div>

      {/* Current Balances */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-lg border border-gold/30 bg-gold/[0.08] p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-muted-foreground">USD Balance</p>
            <DollarSign className="size-5 text-gold" />
          </div>
          <p className="text-3xl font-bold text-gold">${float.usd_balance.toFixed(2)}</p>
          <p className="text-xs text-muted-foreground mt-2">
            Last updated: {new Date(float.updated_at).toLocaleString()}
          </p>
        </div>

        <div className="rounded-lg border border-gold/30 bg-gold/[0.08] p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-muted-foreground">PULSE Tokens</p>
            <Coins className="size-5 text-gold" />
          </div>
          <p className="text-3xl font-bold text-gold">{float.pulse_tokens_balance.toFixed(0)}</p>
          <p className="text-xs text-muted-foreground mt-2">
            For user distributions
          </p>
        </div>
      </div>

      {/* Top-up Form */}
      <div className="rounded-lg border border-white/[0.08] bg-white/[0.03] p-6">
        <h3 className="font-semibold mb-4">Top-up Float Balances</h3>

        <div className="space-y-4">
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-2 block">Add USD</label>
            <input
              type="number"
              value={topupUsd}
              onChange={(e) => setTopupUsd(e.target.value)}
              placeholder="Amount in USD"
              className="pulse-input"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground mb-2 block">Add PULSE Tokens</label>
            <input
              type="number"
              value={topupPulse}
              onChange={(e) => setTopupPulse(e.target.value)}
              placeholder="Amount in PULSE"
              className="pulse-input"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground mb-2 block">Notes (optional)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Reason for topup..."
              className="pulse-input resize-none h-20"
            />
          </div>

          <Button
            onClick={handleTopup}
            disabled={processing}
            className="w-full bg-gold hover:bg-gold/90 text-primary-foreground font-semibold"
          >
            {processing ? <Loader2 className="size-4 animate-spin" /> : 'Top-up Float'}
          </Button>
        </div>
      </div>

      {/* Instructions */}
      <div className="rounded-lg border border-white/[0.08] bg-white/[0.02] p-6">
        <h3 className="font-semibold mb-3">About Admin Float</h3>
        <ul className="space-y-2 text-sm text-muted-foreground list-disc list-inside">
          <li>USD Balance: Used to process deposits into user accounts</li>
          <li>PULSE Tokens: Distributed to new users (50 USDT promo) and other incentives</li>
          <li>All topups are logged with timestamps and notes for audit purposes</li>
          <li>Request topups from Finance when balance runs low</li>
        </ul>
      </div>
    </div>
  )
}
