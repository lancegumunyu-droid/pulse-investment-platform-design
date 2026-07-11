'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Lock, User, Clock } from 'lucide-react'

interface AdminSession {
  id: string
  email: string
  name: string
  loginTime: string
}

export default function AdminSettings() {
  const router = useRouter()
  const admin: AdminSession | null = typeof window !== 'undefined' 
    ? JSON.parse(localStorage.getItem('adminSession') || 'null')
    : null

  useEffect(() => {
    if (!admin) {
      router.push('/admin/login')
    }
  }, [admin, router])

  if (!admin) {
    return null
  }

  return (
    <div className="min-h-dvh bg-gradient-to-br from-background via-background to-background/95">
      <div className="border-b border-white/[0.06] bg-white/[0.02] backdrop-blur">
        <div className="mx-auto max-w-4xl px-5 py-6">
          <Link href="/admin/dashboard" className="inline-flex items-center gap-2 text-sm text-gold hover:opacity-80 mb-6">
            <ArrowLeft className="size-4" />
            Back to Dashboard
          </Link>
          <h1 className="text-2xl font-semibold">Admin Settings</h1>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-5 py-8">
        {/* Account Info */}
        <div className="rounded-lg border border-white/[0.08] bg-white/[0.03] p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <User className="size-5 text-gold" />
            <h2 className="text-lg font-semibold">Account Information</h2>
          </div>
          <div className="space-y-3">
            <div>
              <p className="text-xs text-muted-foreground">Name</p>
              <p className="text-sm font-medium">{admin.name}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Email</p>
              <p className="text-sm font-medium">{admin.email}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Admin ID</p>
              <p className="text-sm font-mono">{admin.id}</p>
            </div>
          </div>
        </div>

        {/* Session Info */}
        <div className="rounded-lg border border-white/[0.08] bg-white/[0.03] p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <Clock className="size-5 text-gold" />
            <h2 className="text-lg font-semibold">Session Information</h2>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Login Time</p>
            <p className="text-sm font-medium">{new Date(admin.loginTime).toLocaleString()}</p>
          </div>
        </div>

        {/* Security */}
        <div className="rounded-lg border border-yellow-500/30 bg-yellow-500/[0.08] p-6">
          <div className="flex items-center gap-3 mb-4">
            <Lock className="size-5 text-yellow-500" />
            <h2 className="text-lg font-semibold">Security Notice</h2>
          </div>
          <ul className="space-y-2 text-sm text-muted-foreground list-disc list-inside">
            <li>Keep your credentials confidential</li>
            <li>All admin actions are logged and monitored</li>
            <li>Unauthorized access attempts will be reported</li>
            <li>Log out when finished with admin tasks</li>
            <li>Do not share your admin credentials with others</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
