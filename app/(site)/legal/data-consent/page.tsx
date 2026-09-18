import type { Metadata } from 'next'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Data Consent & Privacy | Pulse',
  description: 'Understand how Pulse collects, uses, and protects your personal and financial data.',
}

export default function DataConsentPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <section className="relative border-b border-white/10">
        <div className="mx-auto max-w-4xl px-5 py-16">
          <Link
            href="/legal"
            className="inline-flex items-center gap-2 text-sm font-medium text-gold mb-6 hover:opacity-80 transition-opacity"
          >
            <ChevronLeft className="size-4" />
            Back to legal
          </Link>

          <h1 className="text-4xl font-bold tracking-tight text-foreground mb-4">
            Data Consent & Privacy
          </h1>
          <p className="text-base text-muted-foreground max-w-2xl">
            How Pulse collects, uses, and protects your information.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-5 py-16 prose prose-invert max-w-none">
        <div className="space-y-10">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-foreground mb-4">
              1. Information We Collect
            </h2>
            <p className="text-muted-foreground mb-4">
              When you use Pulse, we collect:
            </p>
            <ul className="space-y-2 text-muted-foreground ml-4">
              <li><strong>Identity data:</strong> Name, date of birth, nationality, government-issued ID.</li>
              <li><strong>Contact data:</strong> Email, phone number, mailing address.</li>
              <li><strong>Financial data:</strong> Bank account details, payment method, transaction history, investment activity.</li>
              <li><strong>Device data:</strong> IP address, browser type, device fingerprint, cookies.</li>
              <li><strong>Behavioral data:</strong> Pages viewed, investment history, communication preferences.</li>
            </ul>
          </div>

          <div>
            <h2 className="text-2xl font-bold tracking-tight text-foreground mb-4">
              2. How We Use Your Data
            </h2>
            <p className="text-muted-foreground mb-4">
              We use your data to:
            </p>
            <ul className="space-y-2 text-muted-foreground ml-4">
              <li>Verify your identity (KYC) and prevent fraud.</li>
              <li>Process investments, deposits, and withdrawals.</li>
              <li>Provide performance reports and updates on your investments.</li>
              <li>Meet regulatory and compliance obligations.</li>
              <li>Send critical platform updates and communications.</li>
              <li>Improve platform features and user experience.</li>
              <li>Detect and prevent abuse, money laundering, and scams.</li>
            </ul>
          </div>

          <div>
            <h2 className="text-2xl font-bold tracking-tight text-foreground mb-4">
              3. Data Retention
            </h2>
            <p className="text-muted-foreground">
              Pulse retains your data as long as your account is active, plus an additional 7 years for regulatory compliance. After that period, we securely delete your data unless law requires longer retention.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold tracking-tight text-foreground mb-4">
              4. Data Security
            </h2>
            <p className="text-muted-foreground mb-4">
              We protect your data using:
            </p>
            <ul className="space-y-2 text-muted-foreground ml-4">
              <li>End-to-end encryption for sensitive information.</li>
              <li>Secure, role-based database access controls (RLS).</li>
              <li>Regular security audits and penetration testing.</li>
              <li>Compliance with international data protection standards (GDPR-aligned).</li>
            </ul>
          </div>

          <div>
            <h2 className="text-2xl font-bold tracking-tight text-foreground mb-4">
              5. Your Rights
            </h2>
            <p className="text-muted-foreground mb-4">
              You have the right to:
            </p>
            <ul className="space-y-2 text-muted-foreground ml-4">
              <li>Access your personal data at any time.</li>
              <li>Correct inaccurate information.</li>
              <li>Request deletion of your data (subject to legal holds).</li>
              <li>Withdraw consent for non-essential data use.</li>
              <li>Export your data in a portable format.</li>
            </ul>
            <p className="text-muted-foreground mt-4">
              To exercise these rights, contact us at <a href="mailto:privacy@pulseinvest.uk" className="text-gold font-semibold">privacy@pulseinvest.uk</a>.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold tracking-tight text-foreground mb-4">
              6. Third-Party Sharing
            </h2>
            <p className="text-muted-foreground">
              We share your data only with:
            </p>
            <ul className="space-y-2 text-muted-foreground ml-4 mt-4">
              <li>Regulatory bodies and law enforcement (when legally required).</li>
              <li>Payment processors and banks (for transactions).</li>
              <li>KYC verification partners (for identity verification).</li>
              <li>Project sponsors (limited to your investment activity in their project).</li>
            </ul>
            <p className="text-muted-foreground mt-4">
              We never sell or commercially license your personal data.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold tracking-tight text-foreground mb-4">
              7. User Consent
            </h2>
            <p className="text-muted-foreground mb-4">
              <strong>By creating an account and using Pulse, you consent to:</strong>
            </p>
            <ul className="space-y-2 text-muted-foreground ml-4">
              <li>Collection and processing of your identity and financial data for KYC and AML compliance.</li>
              <li>Use of your data to facilitate investments and provide account services.</li>
              <li>Sharing of your data with project sponsors and regulatory bodies as necessary.</li>
              <li>Storage of your data in encrypted databases subject to Pulse&apos;s security controls.</li>
            </ul>
            <p className="text-muted-foreground mt-4">
              You may withdraw consent for marketing and non-essential communications at any time through your account settings or by emailing <a href="mailto:privacy@pulseinvest.uk" className="text-gold font-semibold">privacy@pulseinvest.uk</a>.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold tracking-tight text-foreground mb-4">
              8. Contact Us
            </h2>
            <p className="text-muted-foreground">
              For questions about your data or this privacy policy, contact us at:
            </p>
            <div className="mt-4 space-y-1 text-muted-foreground">
              <p><strong>Email:</strong> <a href="mailto:privacy@pulseinvest.uk" className="text-gold">privacy@pulseinvest.uk</a></p>
              <p><strong>Compliance:</strong> <a href="mailto:compliance@pulseinvest.uk" className="text-gold">compliance@pulseinvest.uk</a></p>
            </div>
          </div>

          <div className="rounded-2xl border border-gold/30 bg-gold-soft/10 p-6 mt-10">
            <p className="text-sm text-muted-foreground">
              <strong>Last updated:</strong> September 2026. This policy is subject to change. Changes are effective immediately upon posting.
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
