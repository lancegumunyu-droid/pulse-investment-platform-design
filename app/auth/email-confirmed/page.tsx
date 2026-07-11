import Link from 'next/link'
import { CheckCircle, Clock, FileText, Lock } from 'lucide-react'

export default function EmailConfirmedPage() {
  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col justify-center px-5 py-10 text-center">
      <div className="glass rounded-3xl p-8">
        <span className="mx-auto mb-4 flex size-16 items-center justify-center rounded-2xl bg-green-500/20 text-green-500 animate-pulse">
          <CheckCircle className="size-8" />
        </span>
        
        <h1 className="text-2xl font-semibold tracking-tight">Email Confirmed!</h1>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground text-pretty">
          Welcome to Pulse. Your email has been verified successfully.
        </p>

        <div className="mt-6 rounded-lg border border-gold/30 bg-gold/[0.08] p-4">
          <div className="flex items-start gap-3">
            <div className="size-5 rounded-full bg-gold/20 flex items-center justify-center flex-shrink-0 mt-0.5">
              <div className="size-2 rounded-full bg-gold" />
            </div>
            <div className="text-left">
              <p className="font-semibold text-gold text-sm">Dashboard Access Unlocked</p>
              <p className="text-xs text-muted-foreground mt-1">
                You now have limited access to explore all features while awaiting admin approval.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6 space-y-3">
          <div className="rounded-lg border border-white/[0.08] bg-white/[0.03] p-4 text-left">
            <div className="flex items-start gap-3">
              <Clock className="size-5 text-yellow-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-sm">Pending Admin Approval</p>
                <p className="text-xs text-muted-foreground mt-1">Our team will review your account shortly</p>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-white/[0.08] bg-white/[0.03] p-4 text-left">
            <div className="flex items-start gap-3">
              <Lock className="size-5 text-blue-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-sm">Complete KYC</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Upload ID & address to unlock deposits and tiers
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-white/[0.08] bg-white/[0.03] p-4 text-left">
            <div className="flex items-start gap-3">
              <FileText className="size-5 text-purple-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-sm">50 USDT PULSE Ready</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Your promotional tokens are waiting in your wallet
                </p>
              </div>
            </div>
          </div>
        </div>

        <Link
          href="/app"
          className="mt-6 flex h-11 w-full items-center justify-center rounded-xl bg-gold font-semibold text-primary-foreground transition-opacity hover:opacity-90"
        >
          Go to Dashboard
        </Link>

        <p className="mt-4 text-xs text-muted-foreground">
          Check your email for more information. You can now explore all features!
        </p>
      </div>
    </div>
  )
}
