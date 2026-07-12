import { NextRequest, NextResponse } from 'next/server'
import { Client } from 'pg'
import crypto from 'crypto'

export async function POST(req: NextRequest) {
  const client = new Client({ connectionString: process.env.NEON_DATABASE_URL })
  try {
    const { appointedBy, email, fullName, role } = await req.json()

    if (!appointedBy || !email || !fullName || !role) {
      return NextResponse.json({ ok: false, error: 'Missing required fields.' }, { status: 400 })
    }

    const validRoles = ['chief_admin', 'approval_manager', 'kyc_reviewer']
    if (!validRoles.includes(role)) {
      return NextResponse.json({ ok: false, error: 'Invalid role.' }, { status: 400 })
    }

    await client.connect()

    // Verify the person appointing is an active admin
    const authCheck = await client.query(
      `SELECT role FROM admin_users WHERE user_id = $1 AND is_active = true`,
      [appointedBy]
    )
    if (authCheck.rows.length === 0) {
      return NextResponse.json({ ok: false, error: 'Unauthorized.' }, { status: 403 })
    }

    // Check if user already exists
    let userId: string
    const existing = await client.query('SELECT id FROM users WHERE email = $1', [email.toLowerCase()])

    if (existing.rows.length > 0) {
      userId = existing.rows[0].id
    } else {
      // Create user account with a temporary random password
      const tempPassword = crypto.randomBytes(16).toString('hex')
      const newUser = await client.query(
        `INSERT INTO users (email, full_name, password_hash, status, email_verified)
         VALUES ($1, $2, $3, 'active', true)
         RETURNING id`,
        [email.toLowerCase(), fullName, tempPassword]
      )
      userId = newUser.rows[0].id

      // Create wallet
      await client.query(
        `INSERT INTO wallets (user_id, balance, available_balance) VALUES ($1, 0, 0)
         ON CONFLICT DO NOTHING`,
        [userId]
      )
    }

    // Upsert admin role
    await client.query(
      `INSERT INTO admin_users (user_id, role, is_active)
       VALUES ($1, $2, true)
       ON CONFLICT (user_id) DO UPDATE SET role = $2, is_active = true`,
      [userId, role]
    )

    // Audit log
    await client.query(
      `INSERT INTO audit_logs (admin_id, action, entity_type, entity_id, details, created_at)
       VALUES ($1, 'appoint_admin', 'admin_user', $2, $3, NOW())`,
      [appointedBy, userId, JSON.stringify({ email, role, fullName })]
    )

    return NextResponse.json({ ok: true, userId })
  } catch (err) {
    console.error('[admin/manage/appoint]', err)
    return NextResponse.json({ ok: false, error: 'Failed to appoint admin.' }, { status: 500 })
  } finally {
    await client.end()
  }
}
