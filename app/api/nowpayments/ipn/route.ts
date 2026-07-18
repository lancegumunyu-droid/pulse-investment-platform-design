import { NextResponse } from 'next/server'
import crypto from 'node:crypto'
import { serviceClient } from '@/lib/pulse/service'

// NOWPayments signs IPN callbacks with HMAC-SHA512 over the JSON body with keys
// sorted alphabetically, using the IPN secret. We must verify before doing
// anything with the payload.
function sortObject(obj: unknown): unknown {
  if (Array.isArray(obj)) return obj.map(sortObject)
  if (obj && typeof obj === 'object') {
    return Object.keys(obj as Record<string, unknown>)
      .sort()
      .reduce<Record<string, unknown>>((acc, key) => {
        acc[key] = sortObject((obj as Record<string, unknown>)[key])
        return acc
      }, {})
  }
  return obj
}

export async function POST(req: Request) {
  const ipnSecret = process.env.NOWPAYMENTS_IPN_SECRET
  if (!ipnSecret) {
    return NextResponse.json({ error: 'not_configured' }, { status: 501 })
  }

  const raw = await req.text()
  const signature = req.headers.get('x-nowpayments-sig') ?? ''

  let payload: Record<string, unknown>
  try {
    payload = JSON.parse(raw)
  } catch {
    return NextResponse.json({ error: 'bad_json' }, { status: 400 })
  }

  const expected = crypto
    .createHmac('sha512', ipnSecret)
    .update(JSON.stringify(sortObject(payload)))
    .digest('hex')

  const valid =
    signature.length === expected.length &&
    crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))
  if (!valid) {
    return NextResponse.json({ error: 'invalid_signature' }, { status: 401 })
  }

  const paymentId = String(payload.payment_id ?? '')
  const status = String(payload.payment_status ?? '')

  const db = serviceClient()
  const { data: txn } = await db
    .from('transactions')
    .select('*')
    .eq('reference', paymentId)
    .eq('type', 'deposit')
    .maybeSingle()

  if (!txn) return NextResponse.json({ ok: true, note: 'no matching transaction' })

  // CHANGED: even a fully settled payment no longer auto-credits the balance.
  // We record that NOWPayments confirmed it (settled_status) and leave the
  // transaction status as 'pending' so it appears in the admin deposit
  // queue. adjustAccount only ever runs from reviewDeposit() in admin.ts,
  // triggered by an admin clicking Approve.
  if ((status === 'finished' || status === 'confirmed') && txn.status === 'pending') {
    await db
      .from('transactions')
      .update({ meta: { ...txn.meta, settled_status: status } })
      .eq('id', txn.id)
  } else if (status === 'failed' || status === 'expired' || status === 'refunded') {
    await db.from('transactions').update({ status: 'failed', meta: { ...txn.meta, settled_status: status } }).eq('id', txn.id)
  }

  return NextResponse.json({ ok: true })
}
