import { ResetPasswordForm } from '@/components/pulse/reset-password-form'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Create New Password - PULSE',
  description: 'Create a new password for your PULSE account',
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <ResetPasswordForm />
      </div>
    </div>
  )
}
