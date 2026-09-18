'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowRight, CheckCircle2, FileText, ShieldCheck } from 'lucide-react'

export default function ProjectApplicationPage() {
  const [submitted, setSubmitted] = useState(false)

  if (submitted) {
    return (
      <div className="min-h-screen bg-background px-5 py-24 text-foreground">
        <div className="mx-auto max-w-2xl rounded-3xl border border-gold/30 bg-gold-soft/10 p-10 text-center shadow-2xl">
          <CheckCircle2 className="mx-auto size-12 text-gold" />
          <h1 className="mt-5 text-3xl font-bold">Application received</h1>
          <p className="mx-auto mt-3 max-w-lg text-muted-foreground leading-relaxed">
            Thank you for sharing your opportunity. Our project partnerships team will review the information and contact you at the email provided.
          </p>
          <Link href="/projects" className="mt-8 inline-flex items-center gap-2 rounded-xl bg-gold px-5 py-3 font-semibold text-zinc-950">
            Explore projects <ArrowRight className="size-4" />
          </Link>
        </div>
      </div>
    )
}

  return (
    <div className="min-h-screen bg-background text-foreground">
      <section className="border-b border-white/10">
        <div className="mx-auto max-w-6xl px-5 py-16 md:py-24">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-gold">Project partnerships</p>
          <h1 className="mt-4 max-w-3xl text-4xl font-bold tracking-tight text-balance md:text-6xl">Bring a strong African opportunity to Pulse.</h1>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground md:text-lg">
            Tell us about your operating business, infrastructure asset, or development project. We look for credible operators, measurable impact, and transparent reporting.
          </p>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-12 px-5 py-16 md:grid-cols-[0.75fr_1.25fr]">
        <div className="space-y-5">
          {[
            ['Proof first', 'Share operating evidence, permits, contracts, budgets, and the people accountable for delivery.'],
            ['Aligned capital', 'We structure opportunities around clear use of funds, milestones, risks, and investor reporting.'],
            ['Regional impact', 'We prioritise opportunities that build resilient businesses, jobs, infrastructure, and access.'],
          ].map(([title, body]) => (
            <div key={title} className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
              <div className="flex items-center gap-3"><ShieldCheck className="size-5 text-gold" /><h2 className="font-bold">{title}</h2></div>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{body}</p>
            </div>
          ))}
          <div className="rounded-2xl border border-yellow-500/30 bg-yellow-500/10 p-5 text-sm leading-relaxed text-yellow-50/80">
            <FileText className="mb-2 size-5 text-yellow-400" />
            Submission does not guarantee acceptance, funding, or investment. We may request additional due-diligence material.
          </div>
        </div>

        <form onSubmit={(event) => { event.preventDefault(); setSubmitted(true) }} className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 shadow-2xl backdrop-blur-xl md:p-8">
          <div className="grid gap-5 md:grid-cols-2">
            <Field label="Your name" name="name" required />
            <Field label="Work email" name="email" type="email" required />
            <Field label="Organisation" name="organisation" required />
            <Field label="Country" name="country" required />
            <Field label="Project name" name="project" required />
            <Field label="Sector" name="sector" required placeholder="Energy, agriculture, infrastructure..." />
            <Field label="Capital sought (USD)" name="capital" type="number" required />
            <Field label="Website or data room link" name="website" type="url" />
          </div>
          <label className="mt-5 block"><span className="mb-2 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">Project overview</span><textarea name="overview" required rows={6} className="pulse-input resize-none" placeholder="What does the project do, what stage is it at, and what would the capital unlock?" /></label>
          <label className="mt-5 flex items-start gap-3 text-sm text-muted-foreground"><input type="checkbox" required className="mt-1 accent-amber-500" /> <span>I confirm that the information provided is accurate and I consent to Pulse contacting me about this submission. See the <Link href="/legal/data-consent" className="text-gold underline">data consent notice</Link>.</span></label>
          <button type="submit" className="mt-7 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gold px-5 py-3.5 font-bold text-zinc-950 transition-opacity hover:opacity-90">Submit application <ArrowRight className="size-4" /></button>
        </form>
      </section>
    </div>
  )
}

function Field({ label, name, type = 'text', placeholder, required = false }: { label: string; name: string; type?: string; placeholder?: string; required?: boolean }) {
  return <label className="block"><span className="mb-2 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</span><input name={name} type={type} placeholder={placeholder} required={required} className="pulse-input" /></label>
}

