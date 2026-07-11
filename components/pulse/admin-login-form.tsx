'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

// Strict admin credentials - ONLY these can log in
const ADMIN_CREDENTIALS = [
  {
    id: 'admin-1',
    email: 'admin@pulse.com',
    password: 'PulseAdmin@2024!Secure',
    name: 'Senior Admin',
  },
  {
    id: 'admin-2',
    email: 'manager@pulse.com',
    password: 'Manager@Pulse#2024Secure',
    name: 'Approval Manager',
  },
]

export function AdminLoginForm() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      // Validate credentials
      const admin = ADMIN_CREDENTIALS.find(
        (a) => a.email === email && a.password === password
      )

      if (!admin) {
        setError('Invalid admin credentials. Access denied.')
        console.error('[v0] Unauthorized admin login attempt:', email)
        return
      }

      // Store admin session
      localStorage.setItem('adminSession', JSON.stringify({
        id: admin.id,
        email: admin.email,
        name: admin.name,
        loginTime: new Date().toISOString(),
      }))

      console.log('[v0] Admin logged in:', admin.email)
      router.push('/admin/dashboard')
      router.refresh()
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={submit} className="glass rounded-3xl p-6">
      <div className="mb-4 rounded-lg border border-yellow-500/30 bg-yellow-500/[0.08] p-3 flex gap-2">
        <AlertCircle className="size-4 text-yellow-500 shrink-0 mt-0.5" />
        <p className="text-xs text-yellow-400">
          Restricted access. All login attempts are logged and monitored for security.
        </p>
      </div>

      <div className="mb-4">
        <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
          className="pulse-input"
          placeholder="admin@pulse.com"
        />
      </div>

      <div className="mb-4">
        <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="current-password"
          className="pulse-input"
          placeholder="••••••••"
        />
      </div>

      {error ? (
        <div className="mb-4 rounded-xl border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive">
          {error}
        </div>
      ) : null}

      <Button
        type="submit"
        size="lg"
        disabled={loading}
        className="h-11 w-full bg-gold text-base font-semibold text-primary-foreground hover:bg-gold/90"
      >
        {loading ? <Loader2 className="size-4 animate-spin" /> : 'Admin Login'}
      </Button>

      <div className="mt-6 space-y-2 text-xs text-muted-foreground bg-white/[0.02] p-4 rounded-lg border border-white/[0.08]">
        <p className="font-semibold text-foreground">Main Admin Credentials:</p>
        <div className="space-y-2 font-mono">
          <p>Email: admin@pulse.com</p>
          <p>Pass: PulseAdmin@2024!Secure</p>
        </div>
        <div className="border-t border-white/[0.08] pt-2 mt-2">
          <p className="font-semibold text-foreground mb-2">Approval Manager:</p>
          <p>Email: manager@pulse.com</p>
          <p>Pass: Manager@Pulse#2024Secure</p>
        </div>
      </div>
    </form>
  )
}
