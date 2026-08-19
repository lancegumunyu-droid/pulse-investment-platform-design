import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy | Pulse',
  description: 'How Pulse Investment Group collects, stores, and uses your personal data.',
}

export default function PrivacyPage() {
  return (
    <div className="relative overflow-hidden bg-background text-foreground py-16 md:py-24">
      {/* Background glow effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute left-1/2 top-20 -translate-x-1/2 size-[500px] rounded-full bg-gold/5 blur-[140px]" />
      </div>

      <article className="relative mx-auto max-w-3xl px-5">
        <div className="glass rounded-3xl border border-white/10 p-8 md:p-12 shadow-2xl backdrop-blur-xl">
          <span className="inline-block mb-3 rounded-full border border-gold/20 bg-gold-soft px-3 py-1 text-xs font-semibold uppercase tracking-widest text-gold">
            Legal
          </span>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground md:text-4xl">Privacy Policy</h1>
          <p className="mt-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Last updated: {new Date().toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>

          <div className="mt-8 space-y-8 divide-y divide-white/[0.08]">
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
              <a href="mailto:compliance@pulseinvest.africa" className="font-semibold text-gold transition-colors hover:underline">
                compliance@pulseinvest.africa
              </a>
              . We will respond within 30 days.
            </Section>

            <Section title="8. Contact">
              For privacy-related questions, contact{' '}
              <a href="mailto:compliance@pulseinvest.africa" className="font-semibold text-gold transition-colors hover:underline">
                compliance@pulseinvest.africa
              </a>
              .
            </Section>
          </div>
        </div>
      </article>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="pt-8 first:pt-0">
      <h2 className="mb-2.5 text-base font-bold tracking-tight text-foreground">{title}</h2>
      <p className="text-sm leading-relaxed text-muted-foreground">{children}</p>
    </div>
  )
}
