'use client'

import { useState } from 'react'
import { Mail, MapPin, MessageSquare } from 'lucide-react'

const CONTACT_DETAILS = [
  {
    icon: <Mail className="size-5" />,
    label: 'General enquiries',
    value: 'contact@pulseinvest.africa',
    href: 'mailto:contact@pulseinvest.africa',
  },
  {
    icon: <MessageSquare className="size-5" />,
    label: 'Compliance & KYC',
    value: 'compliance@pulseinvest.africa',
    href: 'mailto:compliance@pulseinvest.africa',
  },
  {
    icon: <MapPin className="size-5" />,
    label: 'Registered office',
    value: 'Gaborone, Botswana · SADC region',
    href: null,
  },
]

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' })
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    // Placeholder — wire to an email service (e.g. Resend) when ready.
    await new Promise((r) => setTimeout(r, 800))
    setSent(true)
    setLoading(false)
  }

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }))

  return (
    <>
      {/* Header */}
      <section className="border-b border-white/[0.06]">
        <div className="mx-auto max-w-6xl px-5 pb-16 pt-16 md:pt-24">
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-gold">Get in touch</p>
          <h1 className="max-w-2xl text-4xl font-semibold tracking-tight text-balance md:text-5xl">
            We&apos;d love to hear from you
          </h1>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-muted-foreground text-pretty">
            Whether you are an investor, project sponsor, or media enquiry — reach us directly below.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-14">
        <div className="grid gap-10 md:grid-cols-2 md:gap-16">
          {/* Contact details */}
          <div>
            <h2 className="mb-6 text-xl font-semibold">Contact details</h2>
            <div className="space-y-4">
              {CONTACT_DETAILS.map((c) => (
                <div key={c.label} className="flex items-start gap-4 rounded-2xl border border-white/[0.08] bg-white/[0.03] p-4">
                  <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl bg-gold/[0.12] text-gold">
                    {c.icon}
                  </span>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">{c.label}</p>
                    {c.href ? (
                      <a href={c.href} className="mt-0.5 block text-sm font-semibold text-gold hover:underline">
                        {c.value}
                      </a>
                    ) : (
                      <p className="mt-0.5 text-sm font-semibold">{c.value}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 rounded-2xl border border-white/[0.08] bg-white/[0.03] p-5">
              <p className="mb-2 text-sm font-semibold">Response times</p>
              <ul className="space-y-1.5 text-sm text-muted-foreground">
                <li>General enquiries — within 2 business days</li>
                <li>Compliance / KYC — within 1 business day</li>
                <li>Project sponsorship — within 5 business days</li>
              </ul>
            </div>
          </div>

          {/* Contact form */}
          <div>
            <h2 className="mb-6 text-xl font-semibold">Send us a message</h2>
            {sent ? (
              <div className="flex flex-col items-center rounded-2xl border border-white/[0.08] bg-white/[0.03] px-8 py-12 text-center">
                <span className="flex size-12 items-center justify-center rounded-2xl bg-gold/[0.12] text-gold">
                  <Mail className="size-6" />
                </span>
                <p className="mt-4 font-semibold">Message received</p>
                <p className="mt-1.5 text-sm text-muted-foreground">
                  We&apos;ll get back to you within 2 business days.
                </p>
                <button
                  onClick={() => { setSent(false); setForm({ name: '', email: '', subject: '', message: '' }) }}
                  className="mt-6 text-sm font-medium text-gold hover:underline"
                >
                  Send another message
                </button>
              </div>
            ) : (
              <form onSubmit={submit} className="space-y-4">
                <FormField label="Full name">
                  <input
                    required
                    className="pulse-input"
                    placeholder="Thabo Nkosi"
                    value={form.name}
                    onChange={set('name')}
                  />
                </FormField>
                <FormField label="Email address">
                  <input
                    type="email"
                    required
                    className="pulse-input"
                    placeholder="you@example.com"
                    value={form.email}
                    onChange={set('email')}
                  />
                </FormField>
                <FormField label="Subject">
                  <select className="pulse-input" value={form.subject} onChange={set('subject')} required>
                    <option value="">Select a topic</option>
                    <option>General enquiry</option>
                    <option>Investment question</option>
                    <option>KYC / compliance</option>
                    <option>Project sponsorship</option>
                    <option>Partnership</option>
                    <option>Media / press</option>
                  </select>
                </FormField>
                <FormField label="Message">
                  <textarea
                    required
                    rows={5}
                    className="pulse-input resize-none"
                    placeholder="Tell us what you need…"
                    value={form.message}
                    onChange={set('message')}
                  />
                </FormField>
                <button
                  type="submit"
                  disabled={loading}
                  className="mt-1 h-12 w-full rounded-xl bg-gold text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
                >
                  {loading ? 'Sending…' : 'Send message'}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>
    </>
  )
}

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-muted-foreground">{label}</span>
      {children}
    </label>
  )
}
