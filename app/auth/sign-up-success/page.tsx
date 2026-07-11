'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle, Loader2 } from 'lucide-react'

export default function SignUpSuccessPage() {
  const router = useRouter()
  
  useEffect(() => {
    // Redirect to dashboard after 2 seconds
    const timeout = setTimeout(() => {
      router.push('/app')
    }, 2000)
    
    return () => clearTimeout(timeout)
  }, [router])

  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col justify-center px-5 py-10 text-center">
      <div className="glass rounded-3xl p-8">
        <span className="mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl bg-green-500/20 text-green-500 animate-pulse">
          <CheckCircle className="size-7" />
        </span>
        <h1 className="text-2xl font-semibold tracking-tight">Welcome to Pulse!</h1>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground text-pretty">
          Your account has been created successfully. You&apos;re being redirected to your portfolio...
        </p>
        
        <div className="mt-8 flex items-center justify-center gap-2">
          <Loader2 className="size-5 text-gold animate-spin" />
          <span className="text-sm text-muted-foreground">Loading dashboard</span>
        </div>
        
        <p className="mt-6 text-xs text-muted-foreground">
          If you&apos;re not redirected automatically, click below:
        </p>
        
        <Link
          href="/app"
          className="mt-4 flex h-11 w-full items-center justify-center rounded-xl bg-gold font-semibold text-primary-foreground transition-opacity hover:opacity-90"
        >
          Go to Dashboard
        </Link>
      </div>
    </div>
  )
}
