import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { enforceRateLimit, financialRequestSchema, idempotencyKey, claimIdempotency, requestIdentity } from '@/lib/security/financial'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const limit = await enforceRateLimit(requestIdentity(request, user.id), true)
  if (!limit.success) return NextResponse.json({ error: 'rate_limited' }, { status: 429 })
  const key = idempotencyKey(request)
  if (!key) return NextResponse.json({ error: 'idempotency_key_required' }, { status: 400 })
  const lock = await claimIdempotency(key, user.id)
  if (lock.configured && !lock.claimed) return NextResponse.json({ error: 'duplicate_request' }, { status: 409 })

  const parsed = financialRequestSchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success || parsed.data.currency !== 'PI' || parsed.data.amount < 20) {
    return NextResponse.json({ error: 'invalid_pi_purchase', minimumUsd: 20 }, { status: 400 })
  }

  return NextResponse.json({
    status: 'pending',
    message: 'Pi payment approval is pending server-side verification.',
    amount: parsed.data.amount,
    currency: 'PI',
  })
}
