import type { Metadata } from 'next'
import { AlertTriangle } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Risk Disclaimer | Pulse',
  description: 'Important risk information for investors using the Pulse Investment Group platform.',
}

export default function RiskPage() {
  return (
    <div className="relative overflow-hidden bg-background text-foreground py-16 md:py-24">
      {/* Background glow effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute right-1/4 top-20 size-[500px] rounded-full bg-gold/5 blur-[140px]" />
      </div>

      <article className="relative mx-auto max-w-3xl px-5">
        <div className="glass rounded-3xl border border-white/10 p-8 md:p-12 shadow-2xl backdrop-blur-xl">
          <span className="inline-block mb-3 rounded-full border border-gold/20 bg-gold-soft px-3 py-1 text-xs font-semibold uppercase tracking-widest text-gold">
            Legal
          </span>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground md:text-4xl">Risk Disclaimer</h1>
          <p className="mt-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Last updated: {new Date().toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>

          {/* High-visibility warning callout */}
          <div className="mt-8 flex items-start gap-4 rounded-2xl border border-gold/30 bg-gold/[0.06] p-5 shadow-inner">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-gold/20 text-gold">
              <AlertTriangle className="size-5" />
            </span>
            <p className="text-sm leading-relaxed text-foreground text-pretty">
              <strong className="font-bold text-gold">Important:</strong> Investing through Pulse involves significant financial risk, including the
              possible loss of all capital invested. You should only invest money you can afford to lose entirely.
            </p>
          </div>

          <div className="mt-8 space-y-8 divide-y divide-white/[0.08]">
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
              Depositing funds through supported payment rails carries additional risk including price
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
