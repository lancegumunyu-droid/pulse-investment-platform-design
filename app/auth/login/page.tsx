import type { Metadata } from 'next'
import { AuthForm } from '@/components/pulse/auth-form'

export const metadata: Metadata = {
  title: 'Sign in to Pulse',
  description: 'Securely sign in to your Pulse investment account.',
}

export default function LoginPage() {
  return <AuthForm mode="login" />
}
