import { NextResponse } from 'next/server'
import { z } from 'zod'

const contactSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(320),
  subject: z.string().trim().min(2).max(120),
  message: z.string().trim().min(10).max(5000),
})

export async function POST(request: Request) {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    return NextResponse.json(
      { error: 'Contact email is not configured yet. Please use the published support email.' },
      { status: 503 },
    )
  }

  const parsed = contactSchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) {
    return NextResponse.json({ error: 'Please check all form fields and try again.' }, { status: 400 })
  }

  const { name, email, subject, message } = parsed.data
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'Pulse Website <no-reply@pulseinvest.uk>',
      to: ['contact@pulseinvest.uk'],
      reply_to: email,
      subject: `[Pulse contact] ${subject}`,
      text: `Name: ${name}\nEmail: ${email}\nSubject: ${subject}\n\n${message}`,
    }),
  })

  if (!response.ok) {
    return NextResponse.json({ error: 'We could not send your message. Please try again later.' }, { status: 502 })
  }

  return NextResponse.json({ ok: true })
}
