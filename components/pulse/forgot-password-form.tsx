'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Activity, Loader2, CheckCircle2, AlertCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'

export function ForgotPasswordForm() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      if (!email) {
        setError('Please enter your email address')
        setLoading(false)
        return
      }

      const supabase = createClient()
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      })

      if (resetError) {
        setError(resetError.message || 'Failed to send reset link')
        setLoading(false)
        return
      }

      setSuccess(true)
      setLoading(false)
    } catch (err) {
      setError((err as Error).message || 'An error occurred')
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="space-y-6 rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] p-8">
        <div className="flex justify-center">
          <div className="rounded-full bg-green-500/20 p-3">
            <CheckCircle2 className="size-6 text-green-400" />
          </div>
        </div>
        
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold">Check Your Email</h2>
          <p className="text-muted-foreground">
            We&apos;ve sent a password reset link to <strong>{email}</strong>
          </p>
        </div>

        <div className="rounded-lg bg-blue-500/10 border border-blue-500/20 p-3 text-sm text-blue-400">
          <p>Click the link in your email to create a new password. The link expires in 24 hours.</p>
        </div>

        <div className="flex gap-2">
          <Link href="/auth/login" className="flex-1">
            <Button className="w-full bg-gold hover:bg-gold/90">
              Back to Login
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] p-8">
      <div className="space-y-2 text-center">
        <div className="flex justify-center mb-4">
          <div className="rounded-full border-2 border-gold/30 bg-gold/5 p-3">
            <Activity className="size-6 text-gold" />
          </div>
        </div>
        <h1 className="text-2xl font-bold">Reset Your Password</h1>
        <p className="text-sm text-muted-foreground">
          Enter your email and we&apos;ll send you a link to create a new password
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-3 flex gap-2">
            <AlertCircle className="size-5 text-red-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        <div className="space-y-2">
          <label className="text-sm font-medium">Email Address</label>
          <input
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
            className="w-full rounded-xl border border-white/12 bg-white/[0.02] px-4 py-3 outline-none placeholder-muted-foreground transition-colors focus:border-gold/50 focus:bg-white/[0.04] disabled:opacity-50"
          />
        </div>

        <Button
          type="submit"
          disabled={loading || !email}
          className="w-full bg-gold hover:bg-gold/90 disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 size-4 animate-spin" />
              Sending...
            </>
          ) : (
            'Send Reset Link'
          )}
        </Button>
      </form>

      <div className="text-center text-sm">
        <span className="text-muted-foreground">Remember your password? </span>
        <Link href="/auth/login" className="text-gold hover:text-gold/80 font-medium">
          Sign in
        </Link>
      </div>
    </div>
  )
}
