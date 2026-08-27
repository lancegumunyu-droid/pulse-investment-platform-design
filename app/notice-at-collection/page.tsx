import Link from 'next/link'

export const metadata = {
  title: 'Notice at Collection',
  description: 'Pulse Trading Investment Inc. notice explaining personal information collection and use.',
}

const openRegions = [
  'Angola', 'Botswana', 'Comoros', 'Democratic Republic of the Congo', 'Eswatini',
  'Lesotho', 'Madagascar', 'Malawi', 'Mauritius', 'Mozambique', 'Namibia',
  'Seychelles', 'South Africa', 'Tanzania', 'Zambia', 'Zimbabwe',
]

export default function NoticeAtCollectionPage() {
  return (
    <main className="min-h-screen bg-background px-6 py-12 text-foreground sm:px-10">
      <article className="mx-auto max-w-3xl space-y-8">
        <header className="space-y-3">
          <Link href="/" className="text-sm text-gold hover:underline">Back to Pulse Invest</Link>
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">Privacy & data transparency</p>
          <h1 className="text-4xl font-semibold tracking-tight text-balance">Notice at Collection</h1>
          <p className="text-sm text-muted-foreground">Effective date: 27 August 2026</p>
        </header>

        <section className="space-y-4 leading-7 text-muted-foreground">
          <p>Pulse Trading Investment Inc. collects and uses personal information to operate Pulse Invest, provide account and investment services, protect the platform, meet legal obligations, and communicate with users.</p>
          <h2 className="pt-4 text-xl font-semibold text-foreground">Who we are</h2>
          <p>Pulse Trading Investment Inc. is registered in South Africa. Our physical address is One Exchange Square, 5 Gwen Lane, Sandown, Sandton, 2196, South Africa. Our postal address is Private Bag X991323, Sandton, 2196, South Africa.</p>
          <h2 className="pt-4 text-xl font-semibold text-foreground">Information we collect</h2>
          <p>Depending on how you use Pulse Invest, we may collect identity and contact details, account credentials, KYC and verification information, wallet and transaction information, investment activity, device and technical information, communications, and consent or preference records.</p>
          <h2 className="pt-4 text-xl font-semibold text-foreground">Why we collect it</h2>
          <p>We use information to create and secure accounts, verify eligibility, process platform activity, provide customer support, detect fraud and abuse, maintain audit records, improve the service, measure performance, and comply with applicable financial, tax, privacy, and anti-money-laundering requirements.</p>
          <h2 className="pt-4 text-xl font-semibold text-foreground">Cookies and analytics</h2>
          <p>Pulse Invest uses essential technologies for security, authentication, preferences, and operation. With applicable consent, the service may use Google Analytics 4 and Vercel Analytics to understand site usage. Details are available in our <a className="text-gold hover:underline" href="https://www.iubenda.com/privacy-policy/92520629/cookie-policy">Cookie Policy</a>.</p>
          <h2 className="pt-4 text-xl font-semibold text-foreground">Sharing and retention</h2>
          <p>Information may be processed by service providers supporting hosting, authentication, databases, analytics, compliance, security, and communications. We retain information only as long as reasonably necessary for the purposes described, legal obligations, dispute resolution, and legitimate business records.</p>
          <h2 className="pt-4 text-xl font-semibold text-foreground">Geographic availability</h2>
          <p>Pulse Invest may be available in SADC member states, including:</p>
          <ul className="list-disc space-y-1 pl-6">{openRegions.map((region) => <li key={region}>{region}</li>)}</ul>
          <p>Availability is subject to applicable law, onboarding, verification, and product-specific restrictions. The United States and its territories are excluded. EU/EEA access may be restricted or subject to enhanced requirements. Sanctioned, FATF high-risk, and other restricted jurisdictions are excluded.</p>
          <h2 className="pt-4 text-xl font-semibold text-foreground">Your choices and requests</h2>
          <p>For privacy or data requests, contact <a className="text-gold hover:underline" href="mailto:privacy@pulseinvest.uk">privacy@pulseinvest.uk</a>. You may also review the <a className="text-gold hover:underline" href="https://www.iubenda.com/privacy-policy/92520629">Privacy Policy</a> and <a className="text-gold hover:underline" href="https://www.iubenda.com/privacy-policy/92520629/cookie-policy">Cookie Policy</a>.</p>
          <p className="border-t border-border pt-6 text-sm">This notice is provided for transparency and does not replace the full Privacy Policy or applicable terms. It should be reviewed by qualified South African privacy and financial-regulatory counsel before being relied upon as legal advice.</p>
        </section>
      </article>
    </main>
  )
}
