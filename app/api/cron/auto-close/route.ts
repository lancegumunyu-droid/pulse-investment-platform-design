import { NextResponse } from 'next/server'
import { createClient as createSupabaseAdmin } from '@supabase/supabase-js'

const admin = () => createSupabaseAdmin(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SECRET_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } },
)

export async function GET(request: Request) {
  const authorization = request.headers.get('authorization')
  const expected = process.env.CRON_SECRET
  if (!expected || authorization !== `Bearer ${expected}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = admin()
  const now = new Date().toISOString()
  const { data: investments, error } = await supabase
    .from('investments')
    .select('id, user_id, amount, expected_return, roi_percentage, currency, end_date, status')
    .eq('status', 'active')
    .lte('end_date', now)
    .limit(500)

  if (error) return NextResponse.json({ error: 'Unable to inspect investments' }, { status: 500 })

  let queued = 0
  for (const investment of investments ?? []) {
    const { data: existing, error: lookupError } = await supabase
      .from('approval_queues')
      .select('id')
      .eq('entity_id', investment.id)
      .eq('entity_type', 'investment_close')
      .maybeSingle()

    if (lookupError) return NextResponse.json({ error: 'Unable to inspect approval queue' }, { status: 500 })
    if (existing) continue

    const expectedReturn = Number(investment.expected_return ?? 0)
    const roi = Number(investment.roi_percentage ?? 0)
    const credit = expectedReturn || (Number(investment.amount) * roi) / 100

    const { error: queueError } = await supabase.from('approval_queues').insert({
      entity_id: investment.id,
      entity_type: 'investment_close',
      user_id: investment.user_id,
      status: 'pending',
    })
    if (queueError) return NextResponse.json({ error: 'Unable to queue investment close' }, { status: 500 })

    const { error: transactionError } = await supabase.from('transactions').insert({
      user_id: investment.user_id,
      type: 'investment_maturity',
      amount: credit,
      currency: investment.currency ?? 'USD',
      status: 'pending',
      requires_approval: true,
      approval_status: 'pending',
      reference_id: investment.id,
      description: 'Investment maturity credit awaiting admin approval',
      metadata: { investment_id: investment.id, source: 'pulse_auto_close' },
    })
    if (transactionError) return NextResponse.json({ error: 'Unable to create maturity transaction' }, { status: 500 })

    await supabase.from('investments').update({ status: 'closed_pending_approval', updated_at: now }).eq('id', investment.id).eq('status', 'active')
    queued += 1
  }

  return NextResponse.json({ ok: true, inspected: investments?.length ?? 0, queued })
}

export const runtime = 'nodejs'
