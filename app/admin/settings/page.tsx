'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft, Shield, UserPlus, Trash2, Lock, Clock,
  CheckCircle2, XCircle, Loader2, ChevronDown
} from 'lucide-react'
import { Button } from '@/components/ui/button'

interface AdminSession {
  id: string
  email: string
  name: string
  loginTime: string
  role?: string
}

interface AdminUser {
  id: string
  user_id: string
  email: string
  full_name: string
  role: string
  is_active: boolean
  created_at: string
}

const ROLE_LABELS: Record<string, { label: string; description: string; color: string }> = {
  chief_admin: {
    label: 'Chief Admin',
    description: 'Full platform access. Can appoint/revoke other admins.',
    color: 'text-gold border-gold/40 bg-gold/10',
  },
  approval_manager: {
    label: 'Approval Manager',
    description: 'Approve deposits, withdrawals, and transactions.',
    color: 'text-blue-400 border-blue-400/40 bg-blue-400/10',
  },
  kyc_reviewer: {
    label: 'KYC Reviewer',
    description: 'Review and approve KYC submissions only.',
    color: 'text-purple-400 border-purple-400/40 bg-purple-400/10',
  },
}

export default function AdminSettings() {
  const router = useRouter()
  const [admin, setAdmin] = useState<AdminSession | null>(null)
  const [admins, setAdmins] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)
  const [adding, setAdding] = useState(false)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const [newEmail, setNewEmail] = useState('')
  const [newName, setNewName] = useState('')
  const [newRole, setNewRole] = useState<string>('kyc_reviewer')

  useEffect(() => {
    const session = typeof window !== 'undefined'
      ? JSON.parse(localStorage.getItem('adminSession') || 'null')
      : null
    if (!session) { router.push('/admin/login'); return }
    setAdmin(session)
    loadAdmins()
  }, [router])

  async function loadAdmins() {
    try {
      const res = await fetch('/api/admin/manage/list')
      if (res.ok) {
        const data = await res.json()
        setAdmins(data.admins ?? [])
      }
    } finally {
      setLoading(false)
    }
  }

  async function appointAdmin(e: React.FormEvent) {
    e.preventDefault()
    setActionLoading('appoint')
    setMessage(null)
    try {
      const res = await fetch('/api/admin/manage/appoint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          appointedBy: admin?.id,
          email: newEmail,
          fullName: newName,
          role: newRole,
        }),
      })
      const data = await res.json()
      if (data.ok) {
        setMessage({ type: 'success', text: `${newName} appointed as ${ROLE_LABELS[newRole]?.label}.` })
        setNewEmail('')
        setNewName('')
        setNewRole('kyc_reviewer')
        setAdding(false)
        await loadAdmins()
      } else {
        setMessage({ type: 'error', text: data.error ?? 'Failed to appoint admin.' })
      }
    } catch {
      setMessage({ type: 'error', text: 'Network error. Please try again.' })
    } finally {
      setActionLoading(null)
    }
  }

  async function revokeAdmin(userId: string, name: string) {
    if (!confirm(`Revoke admin access for ${name}? They will no longer be able to log in.`)) return
    setActionLoading(userId)
    try {
      const res = await fetch('/api/admin/manage/revoke', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ revokedBy: admin?.id, userId }),
      })
      const data = await res.json()
      if (data.ok) {
        setMessage({ type: 'success', text: `Access revoked for ${name}.` })
        await loadAdmins()
      } else {
        setMessage({ type: 'error', text: data.error ?? 'Failed to revoke.' })
      }
    } finally {
      setActionLoading(null)
    }
  }

  if (!admin) return null

  return (
    <div className="min-h-dvh bg-background">
      {/* Header */}
      <div className="border-b border-white/[0.06] bg-white/[0.02]">
        <div className="mx-auto max-w-3xl px-5 py-5">
          <Link href="/admin/panel" className="inline-flex items-center gap-2 text-sm text-gold hover:opacity-80 mb-5">
            <ArrowLeft className="size-4" />
            Back to Panel
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold">Admin Management</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Appoint and manage who has admin access to PULSE.
              </p>
            </div>
            <Shield className="size-8 text-gold opacity-50" />
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-5 py-8 space-y-8">
        {/* Owner notice */}
        <div className="rounded-xl border border-gold/20 bg-gold/[0.06] p-4 flex gap-3">
          <Lock className="size-5 text-gold shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-semibold text-foreground mb-1">Owner-Controlled Access</p>
            <p className="text-muted-foreground">
              Only you decide who gets admin rights. Appointed admins can only perform actions within their role.
              You can revoke access at any time.
            </p>
          </div>
        </div>

        {/* Status message */}
        {message && (
          <div className={`rounded-xl border p-3 flex items-center gap-2 text-sm ${
            message.type === 'success'
              ? 'border-green-500/30 bg-green-500/10 text-green-400'
              : 'border-destructive/30 bg-destructive/10 text-destructive'
          }`}>
            {message.type === 'success'
              ? <CheckCircle2 className="size-4 shrink-0" />
              : <XCircle className="size-4 shrink-0" />}
            {message.text}
          </div>
        )}

        {/* Current admins */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Active Admin Accounts</h2>
            <Button
              size="sm"
              onClick={() => setAdding(!adding)}
              className="bg-gold/10 text-gold border border-gold/30 hover:bg-gold/20"
              variant="ghost"
            >
              <UserPlus className="size-4 mr-2" />
              Appoint Admin
            </Button>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="size-6 animate-spin text-gold" />
            </div>
          ) : admins.length === 0 ? (
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-8 text-center text-muted-foreground text-sm">
              No admin accounts found. Appoint your first admin below.
            </div>
          ) : (
            <div className="space-y-3">
              {admins.map((a) => {
                const roleInfo = ROLE_LABELS[a.role] ?? { label: a.role, color: 'text-muted-foreground border-white/10 bg-white/5', description: '' }
                const isYou = a.email === admin.email
                return (
                  <div
                    key={a.id}
                    className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 flex items-center gap-4"
                  >
                    <div className={`size-10 rounded-full flex items-center justify-center text-sm font-bold border ${roleInfo.color}`}>
                      {(a.full_name || a.email).charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-sm truncate">{a.full_name || 'Unnamed'}</p>
                        {isYou && (
                          <span className="text-[10px] font-semibold bg-gold/20 text-gold px-1.5 py-0.5 rounded">YOU</span>
                        )}
                        {!a.is_active && (
                          <span className="text-[10px] font-semibold bg-red-500/20 text-red-400 px-1.5 py-0.5 rounded">REVOKED</span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground truncate">{a.email}</p>
                      <span className={`inline-block mt-1 text-[11px] font-medium px-2 py-0.5 rounded border ${roleInfo.color}`}>
                        {roleInfo.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <div className="text-right hidden sm:block">
                        <p className="text-xs text-muted-foreground">Added</p>
                        <p className="text-xs">{new Date(a.created_at).toLocaleDateString()}</p>
                      </div>
                      {!isYou && a.is_active && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => revokeAdmin(a.user_id, a.full_name || a.email)}
                          disabled={actionLoading === a.user_id}
                          className="text-muted-foreground hover:text-destructive"
                        >
                          {actionLoading === a.user_id
                            ? <Loader2 className="size-4 animate-spin" />
                            : <Trash2 className="size-4" />}
                        </Button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Appoint form */}
        {adding && (
          <form onSubmit={appointAdmin} className="rounded-xl border border-gold/20 bg-gold/[0.03] p-6 space-y-5">
            <h3 className="font-semibold text-foreground">Appoint New Admin</h3>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">Full Name</label>
                <input
                  className="pulse-input"
                  placeholder="e.g. Sarah Mokoena"
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">Email Address</label>
                <input
                  type="email"
                  className="pulse-input"
                  placeholder="admin@yourdomain.com"
                  value={newEmail}
                  onChange={e => setNewEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">Role</label>
              <div className="relative">
                <select
                  value={newRole}
                  onChange={e => setNewRole(e.target.value)}
                  className="pulse-input appearance-none pr-8 w-full"
                >
                  {Object.entries(ROLE_LABELS).map(([value, { label }]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
              </div>
              {newRole && ROLE_LABELS[newRole] && (
                <p className="text-xs text-muted-foreground mt-1.5">{ROLE_LABELS[newRole].description}</p>
              )}
            </div>

            <div className="rounded-lg border border-white/[0.06] bg-white/[0.03] p-3 text-xs text-muted-foreground">
              A temporary access link will be generated. Share it securely with the person you are appointing.
              They will set their own password on first login.
            </div>

            <div className="flex gap-3">
              <Button
                type="submit"
                disabled={actionLoading === 'appoint'}
                className="bg-gold text-dark hover:bg-gold/90 font-semibold"
              >
                {actionLoading === 'appoint'
                  ? <><Loader2 className="size-4 animate-spin mr-2" />Appointing...</>
                  : <><UserPlus className="size-4 mr-2" />Appoint Admin</>}
              </Button>
              <Button type="button" variant="ghost" onClick={() => setAdding(false)}>
                Cancel
              </Button>
            </div>
          </form>
        )}

        {/* Role reference */}
        <div>
          <h2 className="text-lg font-semibold mb-4">Role Permissions</h2>
          <div className="space-y-3">
            {Object.entries(ROLE_LABELS).map(([role, info]) => (
              <div key={role} className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded border ${info.color}`}>{info.label}</span>
                </div>
                <p className="text-sm text-muted-foreground">{info.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Session */}
        <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5">
          <div className="flex items-center gap-2 mb-3">
            <Clock className="size-4 text-gold" />
            <h2 className="font-semibold text-sm">Your Session</h2>
          </div>
          <div className="space-y-1 text-sm">
            <p><span className="text-muted-foreground">Logged in as: </span>{admin.name} ({admin.email})</p>
            <p><span className="text-muted-foreground">Session started: </span>{new Date(admin.loginTime).toLocaleString()}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
