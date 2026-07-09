import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy policy',
  description: 'How Pulse Investment Group collects, stores, and uses your personal data.',
}

export default function PrivacyPage() {
  return (
    <article className="mx-auto max-w-3xl px-5 py-16">
      <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-gold">Legal</p>
      <h1 className="text-3xl font-semibold tracking-tight">Privacy policy</h1>
      <p className="mt-2 text-xs text-muted-foreground">Last updated: {new Date().toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' })}</p>

      <Section title="1. Data we collect">
        We collect the following personal information when you use Pulse: name, email address, identity documents
        submitted during KYC, wallet addresses, transaction data, and usage analytics. We do not sell your personal
        data to third parties.
      </Section>

      <Section title="2. How we use your data">
        Your data is used to: operate your investor account, comply with KYC and anti-money-laundering obligations,
        process deposits and withdrawals, communicate important platform updates, and improve the platform
        experience.
      </Section>

      <Section title="3. Data storage and security">
        All personal data is stored in encrypted databases hosted on Supabase infrastructure within data centres
        that meet international security standards. Balance mutations are performed exclusively server-side using
        service-role credentials — users cannot directly modify financial records.
      </Section>

      <Section title="4. KYC data">
        Identity documents collected during KYC are retained only as long as required by applicable law and
        regulatory obligations. Access to KYC documents is restricted to authorised Pulse compliance staff.
      </Section>

      <Section title="5. Payment data">
        Crypto deposit payments are processed by NOWPayments. Pulse does not store private keys, wallet seeds,
        or payment card data. NOWPayments&apos; own privacy policy governs data processed through their gateway.
      </Section>

      <Section title="6. Cookies and analytics">
        Pulse uses Vercel Analytics for anonymous, aggregate usage data. No personally identifiable information
        is collected through analytics. We do not use advertising cookies.
      </Section>

      <Section title="7. Your rights">
        You have the right to access, correct, or delete your personal data. To exercise these rights, email{' '}
        <a href="mailto:compliance@pulseinvest.africa" className="text-gold hover:underline">
          compliance@pulseinvest.africa
        </a>
        . We will respond within 30 days.
      </Section>

      <Section title="8. Contact">
        For privacy-related questions, contact{' '}
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
