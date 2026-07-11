import { ForgotPasswordForm } from '@/components/pulse/forgot-password-form'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Reset Password - PULSE',
  description: 'Reset your PULSE account password',
}

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <ForgotPasswordForm />
      </div>
    </div>
  )
}
