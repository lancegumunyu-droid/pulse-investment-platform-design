import Link from 'next/link'
import { AlertCircle, ArrowRight } from 'lucide-react'

export default function ErrorPage() {
  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col justify-center px-5 py-10 text-center">
      <div className="glass rounded-3xl p-8">
        <span className="mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
          <AlertCircle className="size-7" />
        </span>
        <h1 className="text-lg font-semibold">Authentication Error</h1>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground text-pretty">
          Something went wrong during authentication. This usually means:
        </p>
        <ul className="mt-4 space-y-2 text-left text-xs text-muted-foreground">
          <li>✓ The verification link expired (links are valid for 24 hours)</li>
          <li>✓ You clicked the link twice</li>
          <li>✓ A temporary network issue occurred</li>
        </ul>
        <div className="mt-6 space-y-2">
          <Link
            href="/auth/sign-up"
            className="flex items-center justify-center gap-2 rounded-xl bg-gold px-6 py-3 text-sm font-semibold text-primary-foreground hover:opacity-90"
          >
            Try signing up again <ArrowRight className="size-4" />
          </Link>
          <Link
            href="/auth/login"
            className="flex items-center justify-center gap-2 rounded-xl border border-white/12 bg-white/[0.04] px-6 py-3 text-sm font-medium hover:bg-white/[0.07]"
          >
            Go to sign in
          </Link>
        </div>
        <p className="mt-4 text-xs text-muted-foreground">
          If you continue experiencing issues, contact support at support@pulse.africa
        </p>
      </div>
    </div>
  )
}