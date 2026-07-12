import { NextRequest, NextResponse } from 'next/server'
import { Client } from 'pg'

export async function POST(req: NextRequest) {
  const client = new Client({ connectionString: process.env.NEON_DATABASE_URL })
  try {
    const { revokedBy, userId } = await req.json()

    if (!revokedBy || !userId) {
      return NextResponse.json({ ok: false, error: 'Missing fields.' }, { status: 400 })
    }

    await client.connect()

    // Verify the person revoking is an active admin
    const authCheck = await client.query(
      `SELECT role FROM admin_users WHERE user_id = $1 AND is_active = true`,
      [revokedBy]
    )
    if (authCheck.rows.length === 0) {
      return NextResponse.json({ ok: false, error: 'Unauthorized.' }, { status: 403 })
    }

    // Cannot revoke yourself
    if (revokedBy === userId) {
      return NextResponse.json({ ok: false, error: 'Cannot revoke your own access.' }, { status: 400 })
    }

    await client.query(
      `UPDATE admin_users SET is_active = false WHERE user_id = $1`,
      [userId]
    )

    // Audit log
    await client.query(
      `INSERT INTO audit_logs (admin_id, action, entity_type, entity_id, details, created_at)
       VALUES ($1, 'revoke_admin', 'admin_user', $2, $3, NOW())`,
      [revokedBy, userId, JSON.stringify({ revokedUserId: userId })]
    )

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[admin/manage/revoke]', err)
    return NextResponse.json({ ok: false, error: 'Failed to revoke access.' }, { status: 500 })
  } finally {
    await client.end()
  }
}
