import Link from 'next/link'
import { MailCheck } from 'lucide-react'

export default function SignUpSuccessPage() {
  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col justify-center px-5 py-10 text-center">
      <div className="glass rounded-3xl p-8">
        <span className="mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl bg-green-soft text-green">
          <MailCheck className="size-7" />
        </span>
        <h1 className="text-xl font-semibold tracking-tight">Check your inbox</h1>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground text-pretty">
          We&apos;ve sent you a confirmation link. Confirm your email address, then sign in to access your Pulse
          portfolio.
        </p>
        <Link
          href="/auth/login"
          className="mt-6 flex h-11 w-full items-center justify-center rounded-xl bg-gold font-semibold text-primary-foreground transition-opacity hover:opacity-90"
        >
          Back to sign in
        </Link>
      </div>
    </div>
  )
}
