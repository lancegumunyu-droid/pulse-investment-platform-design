'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Activity, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'

export default function UpdatePasswordPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }
    if (password !== confirm) {
      setError('Passwords do not match')
      return
    }
    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({ password })
    setLoading(false)
    if (error) {
      setError(error.message)
      return
    }
    // Full navigation, same reasoning as the login flow fix — guarantees
    // the refreshed session cookie is sent cleanly on the next request.
    window.location.href = '/app'
  }

  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col justify-center px-5 py-10">
      <div className="mb-8 flex flex-col items-center text-center">
        <span className="mb-4 flex size-14 items-center justify-center rounded-2xl glass-gold">
          <Activity className="size-7 text-gold" />
        </span>
        <h1 className="text-2xl font-semibold tracking-tight">Set a new password</h1>
        <p className="mt-1.5 text-sm text-muted-foreground">Choose a new password for your Pulse account.</p>
      </div>

      <form onSubmit={submit} className="glass rounded-3xl p-5">
        <label className="block">
          <span className="mb-1.5 block text-xs font-medium text-muted-foreground">New password</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            autoComplete="new-password"
            className="pulse-input"
            placeholder="••••••••"
          />
        </label>

        <label className="mt-4 block">
          <span className="mb-1.5 block text-xs font-medium text-muted-foreground">Confirm new password</span>
          <input
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
            minLength={6}
            autoComplete="new-password"
            className="pulse-input"
            placeholder="••••••••"
          />
        </label>

        {error ? (
          <p className="mt-3 rounded-xl border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive">
            {error}
          </p>
        ) : null}

        <Button
          type="submit"
          size="lg"
          disabled={loading}
          className="mt-5 h-12 w-full bg-gold text-base font-semibold text-primary-foreground hover:bg-gold/90"
        >
          {loading ? <Loader2 className="size-4 animate-spin" /> : 'Update password'}
        </Button>
      </form>
    </div>
  )
}
