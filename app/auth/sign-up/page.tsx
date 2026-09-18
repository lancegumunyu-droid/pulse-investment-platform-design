import type { Metadata } from 'next'
import { AuthForm } from '@/components/pulse/auth-form'

export const metadata: Metadata = {
  title: 'Create your Pulse account',
  description: 'Create a verified Pulse account to access SADC investment opportunities.',
}

export default function SignUpPage() {
  return <AuthForm mode="sign-up" />
}
