import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Terms of use',
  description: 'Pulse Investment Group terms of use governing access to the platform and all investment activity.',
}

export default function TermsPage() {
  return (
    <article className="mx-auto max-w-3xl px-5 py-16 prose-invert">
      <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-gold">Legal</p>
      <h1 className="text-3xl font-semibold tracking-tight">Terms of use</h1>
      <p className="mt-2 text-xs text-muted-foreground">Last updated: {new Date().toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' })}</p>

      <Section title="1. Acceptance of terms">
        By accessing or using the Pulse Investment Group platform (&quot;Pulse&quot;, &quot;we&quot;, &quot;us&quot;), you agree to be bound by these Terms
        of Use. If you do not agree, you must not use the platform.
      </Section>

      <Section title="2. Eligibility">
        You must be at least 18 years of age to use Pulse. By using the platform you represent that you meet this
        requirement and that you have the legal capacity to enter a binding agreement.
      </Section>

      <Section title="3. Investment risk">
        All investments made through Pulse carry risk of partial or total capital loss. Yield targets displayed on
        the platform are projections based on project financial models and historical data where available. They are
        not guaranteed returns. Past performance of any project does not guarantee future results.
      </Section>

      <Section title="4. Identity verification (KYC)">
        Pulse requires mandatory identity verification (KYC) for investment activity above certain thresholds. You
        agree to provide accurate, complete, and up-to-date information during the KYC process. Pulse reserves the
        right to suspend access pending successful verification.
      </Section>

      <Section title="5. Deposits and withdrawals">
        Deposits are accepted via the NOWPayments crypto payment gateway. Pulse processes withdrawal requests
        within a reasonable review period. Withdrawal approval is subject to completed KYC and compliance checks.
        Pulse does not guarantee a specific processing time.
      </Section>

      <Section title="6. Prohibited conduct">
        You must not use the platform for money laundering, terrorist financing, fraud, or any activity prohibited
        by applicable law. Pulse will report suspicious activity to relevant authorities and will freeze accounts
        under investigation.
      </Section>

      <Section title="7. Intellectual property">
        All content, trademarks, and intellectual property on the platform belong to Pulse Investment Group.
        You may not reproduce, distribute, or create derivative works without written consent.
      </Section>

      <Section title="8. Limitation of liability">
        To the fullest extent permitted by law, Pulse shall not be liable for indirect, incidental, or
        consequential losses arising from use of the platform, investment losses, or technical failures.
      </Section>

      <Section title="9. Governing law">
        These terms are governed by the laws of the Republic of Botswana. Disputes shall be resolved in the
        courts of Gaborone, Botswana.
      </Section>

      <Section title="10. Contact">
        For questions about these terms, contact{' '}
        <a href="mailto:compliance@pulseinvest.africa" className="text-gold hover:underline">
          compliance@pulseinvest.africa
        </a>
        .
      </Section>
    </article>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-8">
      <h2 className="mb-2 text-base font-semibold">{title}</h2>
      <p className="text-sm leading-relaxed text-muted-foreground">{children}</p>
    </div>
  )
}
