'use client'

import { useState } from 'react'
import { Mail, MapPin, MessageSquare, Loader2, Send, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

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
    <div className="relative overflow-hidden bg-background text-foreground">
      {/* Background glow effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute right-1/4 top-10 size-[450px] rounded-full bg-gold/5 blur-[130px]" />
      </div>

      {/* Header */}
      <section className="relative border-b border-white/[0.08]">
        <div className="mx-auto max-w-6xl px-5 pb-16 pt-16 md:pt-24">
          <span className="inline-block mb-3 rounded-full border border-gold/20 bg-gold-soft px-3 py-1 text-xs font-semibold uppercase tracking-widest text-gold">
            Get in touch
          </span>
          <h1 className="max-w-2xl text-4xl font-extrabold tracking-tight text-balance md:text-5xl">
            We&apos;d love to hear from you
          </h1>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-muted-foreground text-pretty">
            Whether you are an investor, project sponsor, or media enquiry — reach us directly below.
          </p>
        </div>
      </section>

      <section className="relative mx-auto max-w-6xl px-5 py-16">
        <div className="grid gap-12 md:grid-cols-2 md:gap-16 items-start">
          {/* Contact details */}
          <div className="space-y-6">
            <h2 className="text-xl font-bold tracking-tight text-foreground">Contact details</h2>
            <div className="space-y-4">
              {CONTACT_DETAILS.map((c) => (
                <div
                  key={c.label}
                  className="group flex items-start gap-4 rounded-3xl border border-white/10 bg-background/80 p-5 shadow-xl backdrop-blur-xl transition-all hover:border-gold/30 hover:bg-background"
                >
                  <span className="mt-0.5 flex size-11 shrink-0 items-center justify-center rounded-2xl border border-gold/20 bg-gold-soft text-gold shadow-sm">
                    {c.icon}
                  </span>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{c.label}</p>
                    {c.href ? (
                      <a href={c.href} className="mt-1 block text-sm font-bold text-gold transition-colors hover:underline">
                        {c.value}
                      </a>
                    ) : (
                      <p className="mt-1 text-sm font-bold text-foreground">{c.value}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="glass rounded-3xl border border-white/10 p-6 shadow-xl backdrop-blur-xl">
              <p className="text-sm font-bold tracking-tight text-foreground">Response times</p>
              <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <span className="size-1.5 rounded-full bg-gold" />
                  General enquiries — within 2 business days
                </li>
                <li className="flex items-center gap-2">
                  <span className="size-1.5 rounded-full bg-gold" />
                  Compliance / KYC — within 1 business day
                </li>
                <li className="flex items-center gap-2">
                  <span className="size-1.5 rounded-full bg-gold" />
                  Project sponsorship — within 5 business days
                </li>
              </ul>
            </div>
          </div>

          {/* Contact form */}
          <div>
            <h2 className="text-xl font-bold tracking-tight text-foreground mb-6">Send us a message</h2>
            {sent ? (
              <div className="glass-gold flex flex-col items-center rounded-3xl border border-gold/30 bg-background/95 p-10 text-center shadow-2xl backdrop-blur-xl">
                <span className="flex size-14 items-center justify-center rounded-2xl border border-gold/30 bg-gold-soft text-gold shadow-sm">
                  <CheckCircle2 className="size-7" />
                </span>
                <p className="mt-4 text-lg font-bold text-foreground">Message received</p>
                <p className="mt-1.5 text-sm text-muted-foreground text-pretty">
                  We&apos;ll get back to you within 2 business days.
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSent(false)
                    setForm({ name: '', email: '', subject: '', message: '' })
                  }}
                  className="mt-6 text-gold hover:text-gold"
                >
                  Send another message
                </Button>
              </div>
            ) : (
              <form onSubmit={submit} className="glass rounded-3xl border border-white/10 bg-background/95 p-6 md:p-8 shadow-2xl backdrop-blur-xl space-y-5">
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

                <Button
                  type="submit"
                  variant="gold"
                  size="lg"
                  disabled={loading}
                  className="w-full text-base font-bold"
                >
                  {loading ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="size-4" />
                      Send message
                    </>
                  )}
                </Button>
              </form>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</span>
      {children}
    </label>
  )
}
