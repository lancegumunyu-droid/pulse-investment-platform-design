import Link from 'next/link'
import { MailCheck, Gift } from 'lucide-react'

export default function SignUpSuccessPage() {
  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col justify-center px-5 py-10 text-center">
      <div className="glass rounded-3xl p-8">
        <span className="mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl bg-green-500/20 text-green-500">
          <MailCheck className="size-7" />
        </span>
        <h1 className="text-2xl font-semibold tracking-tight">Account created!</h1>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground text-pretty">
          We&apos;ve sent a confirmation email to your inbox.
        </p>
        
        <div className="mt-6 rounded-lg border border-gold/30 bg-gold/[0.08] p-4 text-sm text-left">
          <div className="flex items-start gap-2">
            <Gift className="size-5 text-gold shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-gold mb-1">50 USDT PULSE Tokens Credited!</p>
              <p className="text-xs text-muted-foreground">
                Promotional credit added to your account. (Non-withdrawable until you make your first deposit)
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6 rounded-lg border border-white/[0.08] bg-white/[0.03] p-4 text-sm text-left space-y-3">
          <p className="font-semibold">What happens next:</p>
          <ol className="space-y-2 text-muted-foreground text-xs">
            <li><strong>1.</strong> Check your email inbox for confirmation link</li>
            <li><strong>2.</strong> Click the link to verify your account</li>
            <li><strong>3.</strong> You&apos;ll gain access to view all investments</li>
            <li><strong>4.</strong> Admin will review & approve your account</li>
            <li><strong>5.</strong> After approval, complete KYC to unlock deposits & tiers</li>
          </ol>
        </div>
        
        <p className="mt-4 text-xs text-muted-foreground">
          Didn&apos;t receive the email? Check your spam folder or{' '}
          <Link href="/auth/resend-verification" className="text-gold hover:underline">
            request another copy
          </Link>
        </p>
        
        <Link
          href="/auth/login"
          className="mt-6 flex h-11 w-full items-center justify-center rounded-xl bg-gold font-semibold text-primary-foreground transition-opacity hover:opacity-90"
        >
          Go to login
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
