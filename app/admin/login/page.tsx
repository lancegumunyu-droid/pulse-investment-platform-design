import Link from 'next/link'
import { Shield } from 'lucide-react'
import { AdminLoginForm } from '@/components/pulse/admin-login-form'

export default function AdminLoginPage() {
  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col justify-center px-5 py-10">
      <div className="mb-8 flex flex-col items-center text-center">
        <span className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-gold/20">
          <Shield className="size-7 text-gold" />
        </span>
        <h1 className="text-2xl font-semibold tracking-tight">Admin Portal</h1>
        <p className="mt-1.5 text-sm text-muted-foreground text-pretty">
          Manage user approvals and platform operations
        </p>
      </div>

      <AdminLoginForm />

      <p className="mt-8 text-center text-[11px] leading-relaxed text-muted-foreground text-pretty">
        This is a restricted admin portal. Unauthorized access attempts are logged and monitored.
      </p>
    </div>
  )
}
