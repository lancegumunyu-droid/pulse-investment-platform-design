import Link from 'next/link'
import { MailCheck, Sparkles } from 'lucide-react'

export default function SignUpSuccessPage() {
  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col justify-center px-5 py-10 text-center">
      <div className="glass-gold relative overflow-hidden rounded-3xl p-8 animate-rise">
        {/* soft ambient glow behind the icon, matches homepage radial gradients */}
        <div
          className="pointer-events-none absolute inset-x-0 -top-24 h-56 opacity-70"
          style={{
            background:
              'radial-gradient(16rem 16rem at 50% 0%, rgba(245,158,11,0.35), transparent 65%)',
          }}
        />

        <div className="relative">
          <span className="relative mx-auto mb-5 flex size-16 items-center justify-center rounded-2xl bg-gold-soft text-gold">
            <span className="absolute inset-0 animate-ping rounded-2xl bg-gold/20" />
            <MailCheck className="relative size-8" />
          </span>

          <h1 className="text-2xl font-semibold tracking-tight">You&apos;re almost in</h1>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground text-pretty">
            We&apos;ve sent a confirmation link to your inbox. Tap it, then come back and sign in —
            your Pulse portfolio will be waiting.
          </p>

          <div className="mt-6 flex items-center justify-center gap-2 rounded-xl border border-gold/20 bg-white/[0.03] px-4 py-3 text-xs text-muted-foreground">
            <Sparkles className="size-3.5 text-gold" />
            <span>Didn&apos;t get it? Check spam, or request a new link from the sign-in page.</span>
          </div>

          <Link
            href="/auth/login"
            className="mt-6 flex h-11 w-full items-center justify-center rounded-xl bg-gold font-semibold text-primary-foreground shadow-[0_16px_32px_-16px_rgba(245,158,11,0.6)] transition-opacity hover:opacity-90"
          >
            Back to sign in
          </Link>
        </div>
      </div>
    </div>
  )
}
