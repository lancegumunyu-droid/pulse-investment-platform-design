'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Activity, Loader2, CheckCircle2, AlertCircle, Eye, EyeOff } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { SecurityValidator } from '@/lib/security'

export function ResetPasswordForm() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const [sessionReady, setSessionReady] = useState(false)
  const [passwordStrength, setPasswordStrength] = useState<any>(null)

  useEffect(() => {
    // Check if user has valid session from email link
    const checkSession = async () => {
      try {
        const supabase = createClient()
        const { data } = await supabase.auth.getSession()
        if (data.session) {
          setSessionReady(true)
        } else {
          setError('Invalid or expired reset link. Please request a new one.')
        }
      } catch (err) {
        setError('Unable to verify your session.')
      }
    }

    checkSession()
  }, [])

  const handlePasswordChange = (value: string) => {
    setPassword(value)
    const strength = SecurityValidator.validatePasswordStrength(value)
    setPasswordStrength(strength)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      if (!password || !confirmPassword) {
        setError('Please fill in all fields')
        setLoading(false)
        return
      }

      if (password !== confirmPassword) {
        setError('Passwords do not match')
        setLoading(false)
        return
      }

      if (!passwordStrength?.isStrong) {
        setError('Password is not strong enough. ' + passwordStrength?.feedback.join(', '))
        setLoading(false)
        return
      }

      const supabase = createClient()
      const { error: updateError } = await supabase.auth.updateUser({ password })

      if (updateError) {
        setError(updateError.message || 'Failed to update password')
        setLoading(false)
        return
      }

      setSuccess(true)
      setLoading(false)
      setTimeout(() => router.push('/auth/login'), 2000)
    } catch (err) {
      setError((err as Error).message || 'An error occurred')
      setLoading(false)
    }
  }

  if (!sessionReady && !error) {
    return (
      <div className="space-y-6 rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] p-8">
        <div className="flex justify-center">
          <Loader2 className="size-6 text-gold animate-spin" />
        </div>
        <p className="text-center text-muted-foreground">Verifying your reset link...</p>
      </div>
    )
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
          <h2 className="text-2xl font-bold">Password Reset</h2>
          <p className="text-muted-foreground">
            Your password has been successfully updated. Redirecting to login...
          </p>
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
        <h1 className="text-2xl font-bold">Create New Password</h1>
        <p className="text-sm text-muted-foreground">
          Enter a strong password to secure your account
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
          <label className="text-sm font-medium">New Password</label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter new password"
              value={password}
              onChange={(e) => handlePasswordChange(e.target.value)}
              disabled={loading}
              className="w-full rounded-xl border border-white/12 bg-white/[0.02] px-4 py-3 pr-10 outline-none placeholder-muted-foreground transition-colors focus:border-gold/50 focus:bg-white/[0.04] disabled:opacity-50"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>
          
          {password && passwordStrength && (
            <div className="space-y-1">
              <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all ${
                    passwordStrength.score <= 2
                      ? 'bg-red-500'
                      : passwordStrength.score <= 3
                        ? 'bg-yellow-500'
                        : 'bg-green-500'
                  }`}
                  style={{ width: `${(passwordStrength.score / 6) * 100}%` }}
                />
              </div>
              {passwordStrength.feedback.length > 0 && (
                <ul className="text-xs text-muted-foreground space-y-0.5">
                  {passwordStrength.feedback.map((tip: string) => (
                    <li key={tip}>• {tip}</li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Confirm Password</label>
          <input
            type={showPassword ? 'text' : 'password'}
            placeholder="Confirm new password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            disabled={loading}
            className="w-full rounded-xl border border-white/12 bg-white/[0.02] px-4 py-3 outline-none placeholder-muted-foreground transition-colors focus:border-gold/50 focus:bg-white/[0.04] disabled:opacity-50"
          />
        </div>

        <Button
          type="submit"
          disabled={loading || !password || !confirmPassword}
          className="w-full bg-gold hover:bg-gold/90 disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 size-4 animate-spin" />
              Updating Password...
            </>
          ) : (
            'Create New Password'
          )}
        </Button>
      </form>

      <div className="text-center text-sm">
        <span className="text-muted-foreground">Know your password? </span>
        <Link href="/auth/login" className="text-gold hover:text-gold/80 font-medium">
          Sign in
        </Link>
      </div>
    </div>
  )
}
