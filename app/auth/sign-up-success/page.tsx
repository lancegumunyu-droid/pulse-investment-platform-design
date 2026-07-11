import Link from 'next/link'
import { MailCheck } from 'lucide-react'

export default function SignUpSuccessPage() {
  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col justify-center px-5 py-10 text-center">
      <div className="glass rounded-3xl p-8">
        <span className="mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl bg-green-500/20 text-green-500">
          <MailCheck className="size-7" />
        </span>
        <h1 className="text-xl font-semibold tracking-tight">Account created!</h1>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground text-pretty">
          We&apos;ve sent a confirmation email to your inbox. Click the link in the email to verify your account.
        </p>
        
        <div className="mt-6 rounded-lg border border-white/[0.08] bg-white/[0.03] p-4 text-sm text-left">
          <p className="font-semibold mb-2">What happens next:</p>
          <ol className="space-y-2 text-muted-foreground text-xs">
            <li>1. Check your email inbox (and spam folder)</li>
            <li>2. Click the confirmation link</li>
            <li>3. Return here and sign in with your credentials</li>
            <li>4. Access your Pulse portfolio immediately</li>
          </ol>
        </div>
        
        <p className="mt-4 text-xs text-muted-foreground">
          Didn&apos;t receive the email? Check your spam folder or contact support.
        </p>
        
        <Link
          href="/auth/login"
          className="mt-6 flex h-11 w-full items-center justify-center rounded-xl bg-gold font-semibold text-primary-foreground transition-opacity hover:opacity-90"
        >
          Go back to sign in
        </Link>
        
        <Link
          href="/"
          className="mt-3 flex h-11 w-full items-center justify-center rounded-xl border border-white/12 bg-white/[0.04] font-semibold transition-colors hover:bg-white/[0.07]"
        >
          Return home
        </Link>
      </div>
    </div>
  )
}
