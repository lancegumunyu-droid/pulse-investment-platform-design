import { NextResponse } from 'next/server'

/**
 * Deliberately disabled until the production Supabase schema includes a
 * maturity date, idempotency constraint, approval queue, and ledger RPC.
 * Never enable client-side balance mutation for financial operations.
 */
export async function GET(request: Request) {
  const authorization = request.headers.get('authorization')
  const expected = process.env.CRON_SECRET

  if (!expected || authorization !== `Bearer ${expected}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (process.env.PULSE_AUTO_CLOSE_ENABLED !== 'true') {
    return NextResponse.json(
      {
        ok: false,
        enabled: false,
        error: 'Auto-close is disabled until the production maturity and ledger schema is installed.',
      },
      { status: 503 },
    )
  }

  return NextResponse.json(
    {
      ok: false,
      enabled: false,
      error: 'Auto-close requires the approved Supabase ledger migration before activation.',
    },
    { status: 501 },
  )
}

export const runtime = 'nodejs'
