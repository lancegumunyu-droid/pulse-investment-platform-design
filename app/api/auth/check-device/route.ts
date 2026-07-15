import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db/neon-client'

/**
 * GET /api/auth/check-device?fp=<sha256-hash>
 * Returns 200 if no account exists from this device.
 * Returns 409 if an existing verified account was found.
 * Returns 403 if the device is explicitly blocked.
 * The fingerprint hash is SHA-256 of browser signals — not PII.
 */
export async function GET(request: NextRequest) {
  const fp = request.nextUrl.searchParams.get('fp')
  if (!fp || fp.length < 10) {
    return NextResponse.json({ ok: true })
  }

  try {
    const [row] = await sql`
      SELECT id, blocked FROM device_signups
      WHERE fingerprint_hash = ${fp}
      LIMIT 1
    `

    if (!row) return NextResponse.json({ ok: true }, { status: 200 })

    if (row.blocked) {
      return NextResponse.json(
        { error: 'This device has been restricted from creating new accounts. Please contact support.' },
        { status: 403 }
      )
    }

    return NextResponse.json(
      { error: 'An account already exists from this device. Please sign in instead.' },
      { status: 409 }
    )
  } catch {
    // If the table doesn't exist yet or query fails, allow signup to proceed
    return NextResponse.json({ ok: true }, { status: 200 })
  }
}
