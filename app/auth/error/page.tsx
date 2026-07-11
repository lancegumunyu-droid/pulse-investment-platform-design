import Link from 'next/link'
import { AlertCircle } from 'lucide-react'

export default function AuthErrorPage() {
  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col justify-center px-5 py-10 text-center">
      <div className="glass rounded-3xl p-8">
        <span className="mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl bg-red-500/20 text-red-500">
          <AlertCircle className="size-7" />
        </span>
        <h1 className="text-xl font-semibold tracking-tight">Authentication Error</h1>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground text-pretty">
          There was an issue verifying your email or signing in. This could happen if:
        </p>
        <ul className="mt-4 text-sm text-muted-foreground text-left space-y-2">
          <li>• The confirmation link has expired</li>
          <li>• You've already confirmed this email</li>
          <li>• Your account doesn't exist</li>
        </ul>
        <div className="mt-6 space-y-3">
          <Link
            href="/auth/login"
            className="flex h-11 w-full items-center justify-center rounded-xl bg-gold font-semibold text-primary-foreground transition-opacity hover:opacity-90"
          >
            Try signing in
          </Link>
          <Link
            href="/auth/sign-up"
            className="flex h-11 w-full items-center justify-center rounded-xl border border-white/12 bg-white/[0.04] font-semibold transition-colors hover:bg-white/[0.07]"
          >
            Create a new account
          </Link>
        </div>
      </div>
    </div>
  )
}
