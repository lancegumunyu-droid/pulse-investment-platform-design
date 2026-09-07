import type { Metadata } from 'next'
import { AuthForm } from '@/components/pulse/auth-form'

export const metadata: Metadata = {
  title: 'Authenticate Terminal | SADC Pulse Private Wealth',
  description: 'Secure executive login for institutional private equity members.',
}

export default function LoginPage() {
  return <AuthForm mode="login" />
}
