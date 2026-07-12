'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/button'

// Admin credentials are verified server-side via environment variables.
// Never expose credentials in client code.
async function verifyAdminCredentials(email: string, password: string): Promise<{ ok: boolean; name?: string; id?: string }> {
  try {
    const res = await fetch('/api/admin/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
    if (!res.ok) return { ok: false }
    return res.json()
  } catch {
    return { ok: false }
  }
}

export function AdminLoginForm() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const result = await verifyAdminCredentials(email, password)

      if (!result.ok) {
        setError('Invalid credentials. Access denied.')
        return
      }

      localStorage.setItem('adminSession', JSON.stringify({
        id: result.id,
        email,
        name: result.name,
        loginTime: new Date().toISOString(),
      }))

      router.push('/admin/panel')
      router.refresh()
    } catch {
      setError('Authentication failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={submit} className="glass rounded-3xl p-6 space-y-4">
      <div className="rounded-lg border border-white/[0.08] bg-white/[0.03] p-3 text-xs text-muted-foreground text-center">
        Restricted access. All login attempts are logged and monitored.
      </div>

      <div>
        <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
          Admin Email
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
          className="pulse-input"
          placeholder="your@email.com"
        />
      </div>

      <div>
        <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
          Password
        </label>
        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
            className="pulse-input pr-10"
            placeholder="••••••••••••"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          >
            {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive">
          {error}
        </div>
      )}

      <Button
        type="submit"
        size="lg"
        disabled={loading}
        className="h-11 w-full bg-gold text-base font-semibold text-primary-foreground hover:bg-gold/90"
      >
        {loading ? <Loader2 className="size-4 animate-spin" /> : 'Access Admin Portal'}
      </Button>

      <p className="text-center text-[11px] text-muted-foreground">
        Credentials are managed by the platform owner.
        <br />
        Contact your administrator if you need access.
      </p>
    </form>
  )
}
