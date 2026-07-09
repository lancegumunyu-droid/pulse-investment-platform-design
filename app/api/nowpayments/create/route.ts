import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { serviceClient } from '@/lib/pulse/service'

const SANDBOX = process.env.NOWPAYMENTS_SANDBOX === 'true'
const API_BASE = SANDBOX ? 'https://api-sandbox.nowpayments.io/v1' : 'https://api.nowpayments.io/v1'

export async function POST(req: Request) {
  const apiKey = process.env.NOWPAYMENTS_API_KEY
  if (!apiKey) {
    return NextResponse.json(
      { error: 'not_configured', message: 'NOWPayments API key is not set. Use the sandbox deposit for now.' },
      { status: 501 },
    )
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  let body: { amount?: number; payCurrency?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'bad_request' }, { status: 400 })
  }

  const amount = Number(body.amount)
  const payCurrency = (body.payCurrency ?? 'usdttrc20').toLowerCase()
  if (!(amount > 0)) return NextResponse.json({ error: 'invalid_amount' }, { status: 400 })

  const orderId = `${user.id}:${crypto.randomUUID()}`
  const origin = new URL(req.url).origin
  const ipnUrl = `${origin}/api/nowpayments/ipn`

  const res = await fetch(`${API_BASE}/payment`, {
    method: 'POST',
    headers: { 'x-api-key': apiKey, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      price_amount: amount,
      price_currency: 'usd',
      pay_currency: payCurrency,
      order_id: orderId,
      order_description: 'Pulse account deposit',
      ipn_callback_url: ipnUrl,
    }),
  })

  const data = await res.json()
  if (!res.ok) {
    return NextResponse.json({ error: 'nowpayments_error', detail: data }, { status: 502 })
  }

  // Record a pending deposit keyed by the NOWPayments payment id.
  const db = serviceClient()
  await db.from('transactions').insert({
    user_id: user.id,
    type: 'deposit',
    amount,
    currency: 'USD',
    status: 'pending',
    reference: String(data.payment_id),
    meta: { label: 'Crypto deposit (NOWPayments)', order_id: orderId, pay_currency: payCurrency },
  })

  return NextResponse.json({
    paymentId: data.payment_id,
    payAddress: data.pay_address,
    payAmount: data.pay_amount,
    payCurrency: data.pay_currency,
    amount,
  })
}
