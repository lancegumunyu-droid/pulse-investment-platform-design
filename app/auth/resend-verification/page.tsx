'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Activity, Loader2, Mail } from 'lucide-react'
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'

export default function ResendVerificationPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

  const handleResend = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('loading')
    setMessage('')

    try {
      if (!isSupabaseConfigured()) {
        throw new Error('Supabase is not configured')
      }

      if (!email) {
        throw new Error('Please enter your email address')
      }

      const supabase = createClient()
      const { error } = await supabase.auth.resendEnvConfirmationEmail({
        email,
        captchaToken: undefined,
      })

      if (error) {
        throw error
      }

      setStatus('success')
      setMessage('Verification email sent! Check your inbox.')
      setTimeout(() => router.push('/auth/login'), 3000)
    } catch (err) {
      setStatus('error')
      let msg = (err as Error).message
      
      if (msg.includes('For security purposes') || msg.includes('after 15 seconds')) {
        msg = 'Please wait 15 seconds before requesting another verification email.'
      } else if (msg.includes('not found')) {
        msg = 'No account found with this email. Please sign up first.'
      }
      
      setMessage(msg)
    }
  }

  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col justify-center px-5 py-10">
      <div className="mb-8 flex flex-col items-center text-center">
        <span className="mb-4 flex size-14 items-center justify-center rounded-2xl glass-gold">
          <Mail className="size-7 text-gold" />
        </span>
        <h1 className="text-2xl font-semibold tracking-tight">Resend verification email</h1>
        <p className="mt-1.5 text-sm text-muted-foreground text-pretty">
          Didn&apos;t receive your confirmation email? We&apos;ll send it again.
        </p>
      </div>

      <form onSubmit={handleResend} className="glass rounded-3xl p-5">
        <label className="mb-3 block">
          <span className="mb-1.5 block text-xs font-medium text-muted-foreground">Email</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            className="pulse-input"
            placeholder="you@example.com"
            disabled={status === 'loading' || status === 'success'}
          />
        </label>

        {status === 'success' && (
          <p className="mt-3 rounded-xl border border-emerald-200/30 bg-emerald-50/10 px-3 py-2 text-xs text-emerald-600">
            {message}
          </p>
        )}

        {status === 'error' && (
          <p className="mt-3 rounded-xl border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive">
            {message}
          </p>
        )}

        <Button
          type="submit"
          size="lg"
          disabled={status === 'loading' || status === 'success'}
          className="mt-5 h-12 w-full bg-gold text-base font-semibold text-primary-foreground hover:bg-gold/90"
        >
          {status === 'loading' ? <Loader2 className="size-4 animate-spin" /> : 'Send verification email'}
        </Button>
      </form>

      <p className="mt-5 text-center text-sm text-muted-foreground">
        Remember your password?{' '}
        <Link href="/auth/login" className="font-semibold text-gold hover:text-gold/80">
          Sign in instead
        </Link>
      </p>
    </div>
  )
}
