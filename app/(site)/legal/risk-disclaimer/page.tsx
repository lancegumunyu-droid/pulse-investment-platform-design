import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Risk disclaimer',
  description: 'Important risk information for investors using the Pulse Investment Group platform.',
}

export default function RiskPage() {
  return (
    <article className="mx-auto max-w-3xl px-5 py-16">
      <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-gold">Legal</p>
      <h1 className="text-3xl font-semibold tracking-tight">Risk disclaimer</h1>
      <p className="mt-2 text-xs text-muted-foreground">Last updated: {new Date().toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' })}</p>

      <div className="mt-6 rounded-2xl border border-gold/30 bg-gold/[0.06] p-5 text-sm leading-relaxed">
        <strong>Important:</strong> Investing through Pulse involves significant financial risk, including the
        possible loss of all capital invested. You should only invest money you can afford to lose entirely.
      </div>

      <Section title="Capital risk">
        All investments made through the Pulse platform carry the risk of partial or total capital loss. The
        value of your investment can go down as well as up, and you may receive less than you invest.
      </Section>

      <Section title="Variable returns">
        Yield targets shown on the platform are projections derived from project financial models and, where
        available, historical operating data. They are not fixed interest rates, nor are they guaranteed in any
        way. Actual returns may be significantly lower or higher than the stated targets, or zero.
      </Section>

      <Section title="Illiquidity risk">
        Investments in private SADC projects are typically illiquid. You may not be able to withdraw your
        invested capital before a project matures or is exited. Pulse does not operate a secondary market.
      </Section>

      <Section title="Currency and regulatory risk">
        Investments across SADC countries involve currency and regulatory risk. Changes in foreign exchange
        rates, government policy, or regulatory environments in any project country may adversely affect returns.
      </Section>

      <Section title="Concentration risk">
        Investing a large proportion of your capital in a single project or sector increases your risk exposure.
        We encourage investors to diversify across multiple projects and asset classes.
      </Section>

      <Section title="Crypto deposit risk">
        Depositing funds via cryptocurrency (through NOWPayments) carries additional risk including price
        volatility, transaction irreversibility, and network failure. Pulse credits USD equivalent value based
        on settled payment amounts and is not responsible for crypto price movements during deposit processing.
      </Section>

      <Section title="No regulatory authorisation">
        Pulse Investment Group is not currently authorised or regulated by any financial services authority
        as an investment firm. You invest at your own risk and without regulatory protections that may apply
        to regulated investment products.
      </Section>

      <Section title="Seek independent advice">
        Before investing, you should consider whether investment through Pulse is appropriate for your financial
        circumstances and seek independent financial, legal, and tax advice if in doubt.
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
