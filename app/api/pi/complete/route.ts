import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { enforceRateLimit, idempotencyKey, claimIdempotency } from '@/lib/security/financial'
import { z } from 'zod'

const schema = z.object({ paymentId: z.string().trim().min(1).max(200), amount: z.number().finite().positive().max(1_000_000) }).strict()

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  const limit = await enforceRateLimit(`user:${user.id}`, true)
  if (!limit.success) return NextResponse.json({ error: 'rate_limited' }, { status: 429 })
  const key = idempotencyKey(request)
  if (!key) return NextResponse.json({ error: 'idempotency_key_required' }, { status: 400 })
  const lock = await claimIdempotency(key, user.id)
  if (lock.configured && !lock.claimed) return NextResponse.json({ error: 'duplicate_request' }, { status: 409 })
  const parsed = schema.safeParse(await request.json().catch(() => null))
  if (!parsed.success || parsed.data.amount < 20) return NextResponse.json({ error: 'invalid_pi_payment' }, { status: 400 })

  const apiKey = process.env.PI_API_KEY
  if (!apiKey) return NextResponse.json({ error: 'pi_verification_not_configured', status: 'pending' }, { status: 503 })
  const response = await fetch(`https://api.minepi.com/v2/payments/${encodeURIComponent(parsed.data.paymentId)}`, { headers: { Authorization: `Key ${apiKey}` }, cache: 'no-store' })
  if (!response.ok) return NextResponse.json({ error: 'pi_verification_failed' }, { status: 502 })
  const payment = await response.json() as { status?: string; user_uid?: string }
  if (payment.user_uid && payment.user_uid !== user.id) return NextResponse.json({ error: 'payment_owner_mismatch' }, { status: 403 })
  if (payment.status !== 'completed') return NextResponse.json({ status: payment.status ?? 'pending' })
  return NextResponse.json({ status: 'verified', paymentId: parsed.data.paymentId })
}
