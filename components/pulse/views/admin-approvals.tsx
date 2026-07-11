'use client'

import { useState, useEffect } from 'react'
import { Check, X, Loader2 } from 'lucide-react'
import { approveUser, rejectUser, getPendingApprovals } from '@/app/actions/user-approval'
import { Button } from '@/components/ui/button'

interface PendingUser {
  id: string
  full_name: string
  email: string
  approval_status: string
  email_confirmed: boolean
  created_at: string
  pulse_tokens_balance: number
}

export function AdminApprovalsView({ adminId }: { adminId: string }) {
  const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([])
  const [loading, setLoading] = useState(true)
  const [approvingId, setApprovingId] = useState<string | null>(null)
  const [rejectingId, setRejectingId] = useState<string | null>(null)

  useEffect(() => {
    loadPendingUsers()
  }, [])

  const loadPendingUsers = async () => {
    try {
      setLoading(true)
      const users = await getPendingApprovals()
      setPendingUsers(users)
    } catch (err) {
      console.error('[v0] Failed to load pending users:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (userId: string) => {
    try {
      setApprovingId(userId)
      await approveUser(userId, adminId)
      setPendingUsers(pendingUsers.filter(u => u.id !== userId))
    } catch (err) {
      console.error('[v0] Approval failed:', err)
    } finally {
      setApprovingId(null)
    }
  }

  const handleReject = async (userId: string, reason: string) => {
    try {
      setRejectingId(userId)
      await rejectUser(userId, adminId, reason)
      setPendingUsers(pendingUsers.filter(u => u.id !== userId))
    } catch (err) {
      console.error('[v0] Rejection failed:', err)
    } finally {
      setRejectingId(null)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="size-6 text-gold animate-spin" />
        <span className="ml-2 text-muted-foreground">Loading pending approvals...</span>
      </div>
    )
  }

  if (pendingUsers.length === 0) {
    return (
      <div className="rounded-lg border border-white/[0.08] bg-white/[0.03] p-12 text-center">
        <p className="text-muted-foreground">No pending approvals at this time</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="mb-6">
        <h2 className="text-xl font-semibold">Pending User Approvals</h2>
        <p className="text-sm text-muted-foreground mt-1">{pendingUsers.length} user(s) awaiting approval</p>
      </div>

      {pendingUsers.map((user) => (
        <div key={user.id} className="rounded-lg border border-white/[0.08] bg-white/[0.03] p-6">
          <div className="mb-4 flex items-start justify-between">
            <div>
              <p className="font-semibold">{user.full_name}</p>
              <p className="text-sm text-muted-foreground">{user.email}</p>
              <p className="text-xs text-gold mt-2">Promo Balance: {user.pulse_tokens_balance} USDT (PULSE)</p>
            </div>
            <span className="rounded-full border border-white/[0.08] bg-white/[0.05] px-3 py-1 text-xs font-medium text-yellow-500">
              Pending
            </span>
          </div>

          <p className="text-xs text-muted-foreground mb-4">
            Signed up: {new Date(user.created_at).toLocaleDateString()}
          </p>

          <div className="flex gap-3">
            <Button
              size="sm"
              onClick={() => handleApprove(user.id)}
              disabled={approvingId === user.id}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              {approvingId === user.id ? <Loader2 className="size-4 animate-spin" /> : <Check className="size-4" />}
              Approve
            </Button>
            <Button
              size="sm"
              onClick={() => handleReject(user.id, 'Admin rejected')}
              disabled={rejectingId === user.id}
              variant="destructive"
              className="flex-1"
            >
              {rejectingId === user.id ? <Loader2 className="size-4 animate-spin" /> : <X className="size-4" />}
              Reject
            </Button>
          </div>
        </div>
      ))}
    </div>
  )
}
