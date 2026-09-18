import type { Metadata } from 'next'
import Link from 'next/link'
import { ChevronLeft, AlertTriangle, Mail, Lock } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Report Fraud & Impersonation | Pulse',
  description: 'Report fraudulent activity, impersonation, scams, or security concerns to Pulse.',
}

export default function FraudReportPage() {
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
            Report Fraud & Impersonation
          </h1>
          <p className="text-base text-muted-foreground max-w-2xl">
            If you suspect fraudulent activity, impersonation, scams, or security breaches, report them immediately.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-5 py-16">
        <div className="space-y-12">
          {/* Alert Banner */}
          <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-6">
            <div className="flex items-start gap-4">
              <AlertTriangle className="size-6 text-red-500 shrink-0 mt-0.5" />
              <div>
                <h2 className="text-lg font-bold text-red-50 mb-2">Immediate Threat?</h2>
                <p className="text-sm text-red-50/90 mb-4">
                  If you believe your account or funds are at immediate risk, change your password immediately and contact compliance@pulseinvest.uk with urgent in the subject line.
                </p>
              </div>
            </div>
          </div>

          {/* What to Report */}
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-foreground mb-6">
              What We Want to Know
            </h2>
            <div className="space-y-4">
              <div className="rounded-xl border border-white/10 bg-white/[0.02] p-5">
                <p className="font-semibold text-foreground mb-2">Impersonation & Scams</p>
                <p className="text-sm text-muted-foreground">
                  If someone is pretending to be a Pulse representative, employee, or project sponsor.
                </p>
              </div>

              <div className="rounded-xl border border-white/10 bg-white/[0.02] p-5">
                <p className="font-semibold text-foreground mb-2">Account Compromise</p>
                <p className="text-sm text-muted-foreground">
                  Unauthorized access to your account, suspicious login attempts, or funds missing.
                </p>
              </div>

              <div className="rounded-xl border border-white/10 bg-white/[0.02] p-5">
                <p className="font-semibold text-foreground mb-2">Phishing & Malicious Links</p>
                <p className="text-sm text-muted-foreground">
                  Emails, SMS, or messages pretending to be from Pulse asking for your password or personal data.
                </p>
              </div>

              <div className="rounded-xl border border-white/10 bg-white/[0.02] p-5">
                <p className="font-semibold text-foreground mb-2">Transaction Fraud</p>
                <p className="text-sm text-muted-foreground">
                  Unauthorized or duplicate investments, withdrawals, or payments from your account.
                </p>
              </div>

              <div className="rounded-xl border border-white/10 bg-white/[0.02] p-5">
                <p className="font-semibold text-foreground mb-2">Platform Abuse</p>
                <p className="text-sm text-muted-foreground">
                  Suspected money laundering, wash trading, or other misuse of Pulse services.
                </p>
              </div>
            </div>
          </div>

          {/* How to Report */}
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-foreground mb-6">
              How to Report
            </h2>
            <div className="space-y-4">
              {/* Email */}
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-sm">
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex size-10 items-center justify-center rounded-lg border border-gold/30 bg-gold-soft text-gold">
                    <Mail className="size-5" />
                  </div>
                  <h3 className="text-lg font-bold text-foreground">Email (Preferred)</h3>
                </div>
                <p className="text-muted-foreground mb-4">
                  Send a detailed email with:
                </p>
                <ul className="space-y-2 text-muted-foreground ml-4 mb-4 text-sm">
                  <li>• What happened and when</li>
                  <li>• Names or accounts involved</li>
                  <li>• Any screenshots, emails, or evidence</li>
                  <li>• How to contact you</li>
                </ul>
                <p className="text-sm">
                  <strong>To:</strong> <a href="mailto:fraud@pulseinvest.uk" className="text-gold font-semibold hover:underline">fraud@pulseinvest.uk</a>
                </p>
              </div>

              {/* Compliance */}
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-sm">
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex size-10 items-center justify-center rounded-lg border border-gold/30 bg-gold-soft text-gold">
                    <Lock className="size-5" />
                  </div>
                  <h3 className="text-lg font-bold text-foreground">Compliance Team</h3>
                </div>
                <p className="text-muted-foreground text-sm mb-3">
                  For sensitive or urgent concerns:
                </p>
                <p className="text-sm">
                  <strong>Email:</strong> <a href="mailto:compliance@pulseinvest.uk" className="text-gold font-semibold hover:underline">compliance@pulseinvest.uk</a>
                </p>
              </div>
            </div>
          </div>

          {/* What Happens Next */}
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-foreground mb-6">
              What Happens After You Report
            </h2>
            <div className="space-y-4 text-muted-foreground">
              <p>
                <strong className="text-foreground">1. Acknowledgment:</strong> We&apos;ll confirm receipt of your report within 24 hours.
              </p>
              <p>
                <strong className="text-foreground">2. Investigation:</strong> Our compliance team will investigate the claim. This may take 5–10 business days.
              </p>
              <p>
                <strong className="text-foreground">3. Action:</strong> If fraud is confirmed, we&apos;ll take immediate steps including account suspension, fund freezing, or law enforcement referral.
              </p>
              <p>
                <strong className="text-foreground">4. Follow-up:</strong> We&apos;ll keep you informed of the outcome and any actions taken on your behalf.
              </p>
            </div>
          </div>

          {/* Protection Tips */}
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-foreground mb-6">
              Protect Yourself
            </h2>
            <ul className="space-y-3 text-muted-foreground">
              <li className="flex items-start gap-3">
                <span className="text-gold font-bold mt-0.5">✓</span>
                <span><strong className="text-foreground">Verify before you trust.</strong> Pulse staff will never ask for your password, 2FA code, or seed phrase.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-gold font-bold mt-0.5">✓</span>
                <span><strong className="text-foreground">Use official channels.</strong> Always access Pulse through pulseinvest.uk, never links in emails.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-gold font-bold mt-0.5">✓</span>
                <span><strong className="text-foreground">Enable 2FA.</strong> Secure your account with two-factor authentication.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-gold font-bold mt-0.5">✓</span>
                <span><strong className="text-foreground">Check the URL.</strong> Look for https:// and the Pulse logo in the address bar.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-gold font-bold mt-0.5">✓</span>
                <span><strong className="text-foreground">Report suspicious emails.</strong> Forward phishing attempts to fraud@pulseinvest.uk.</span>
              </li>
            </ul>
          </div>

          {/* Confidentiality */}
          <div className="rounded-2xl border border-gold/30 bg-gold-soft/10 p-6">
            <p className="text-sm text-muted-foreground">
              <strong className="text-foreground">Your report is confidential.</strong> We protect reporter identity and will not share details without consent, except when required by law.
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
