'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { LogOut, Settings } from 'lucide-react'
import { AdminApprovalsView } from '@/components/pulse/views/admin-approvals'
import { AdminFloatPanel } from '@/components/pulse/admin-float-panel'
import { Button } from '@/components/ui/button'

interface AdminSession {
  id: string
  email: string
  name: string
  loginTime: string
}

export default function AdminDashboard() {
  const router = useRouter()
  const [admin, setAdmin] = useState<AdminSession | null>(null)
  const [activeTab, setActiveTab] = useState<'approvals' | 'float'>('approvals')

  useEffect(() => {
    const session = localStorage.getItem('adminSession')
    if (!session) {
      router.push('/admin/login')
      return
    }
    setAdmin(JSON.parse(session))
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem('adminSession')
    router.push('/admin/login')
  }

  if (!admin) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <p className="text-muted-foreground">Loading admin panel...</p>
      </div>
    )
  }

  return (
    <div className="min-h-dvh bg-gradient-to-br from-background via-background to-background/95">
      {/* Header */}
      <div className="border-b border-white/[0.06] bg-white/[0.02] backdrop-blur">
        <div className="mx-auto max-w-6xl px-5 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold">Pulse Admin Portal</h1>
              <p className="mt-1 text-sm text-muted-foreground">Welcome, {admin.name}</p>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/admin/settings" className="inline-flex items-center gap-2 rounded-lg border border-white/12 px-3 py-2 text-sm hover:bg-white/[0.05]">
                <Settings className="size-4" />
                Settings
              </Link>
              <Button
                onClick={handleLogout}
                variant="outline"
                size="sm"
                className="gap-2"
              >
                <LogOut className="size-4" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-white/[0.06] bg-white/[0.01]">
        <div className="mx-auto max-w-6xl px-5">
          <div className="flex gap-1">
            <button
              onClick={() => setActiveTab('approvals')}
              className={`px-4 py-3 text-sm font-medium transition-colors border-b-2 ${
                activeTab === 'approvals'
                  ? 'border-gold text-foreground'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              User Approvals
            </button>
            <button
              onClick={() => setActiveTab('float')}
              className={`px-4 py-3 text-sm font-medium transition-colors border-b-2 ${
                activeTab === 'float'
                  ? 'border-gold text-foreground'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              Admin Float
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-6xl px-5 py-8">
        {activeTab === 'approvals' ? (
          <AdminApprovalsView adminId={admin.id} />
        ) : (
          <AdminFloatPanel adminId={admin.id} />
        )}
      </div>
    </div>
  )
}
