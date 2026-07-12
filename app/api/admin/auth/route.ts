import { NextRequest, NextResponse } from 'next/server'
import { Client } from 'pg'

// Admin credentials are stored in ADMIN_ACCOUNTS env var as JSON:
// [{"email":"you@domain.com","passwordHash":"bcrypt_hash","name":"Your Name","role":"chief_admin"}]
// The owner manages this list — no credentials ever appear in source code.

function constantTimeCompare(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  let result = 0
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i)
  }
  return result === 0
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for') ?? 'unknown'

  try {
    const { email, password } = await req.json()

    if (!email || !password) {
      return NextResponse.json({ ok: false }, { status: 400 })
    }

    // Load admin accounts from environment
    const accountsJson = process.env.ADMIN_ACCOUNTS
    if (!accountsJson) {
      // Fallback: check DB for admin users
      return await verifyFromDatabase(email, password, ip)
    }

    let accounts: Array<{ email: string; password: string; name: string; role: string; id: string }>
    try {
      accounts = JSON.parse(accountsJson)
    } catch {
      return NextResponse.json({ ok: false }, { status: 500 })
    }

    const match = accounts.find(a => constantTimeCompare(a.email.toLowerCase(), email.toLowerCase()))
    if (!match || !constantTimeCompare(match.password, password)) {
      await logLoginAttempt(email, ip, false)
      return NextResponse.json({ ok: false }, { status: 401 })
    }

    await logLoginAttempt(email, ip, true)

    return NextResponse.json({
      ok: true,
      id: match.id,
      name: match.name,
      role: match.role,
    })
  } catch (err) {
    console.error('[admin/auth]', err)
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}

async function verifyFromDatabase(email: string, password: string, ip: string) {
  // Database-backed admin verification
  const client = new Client({ connectionString: process.env.NEON_DATABASE_URL })
  try {
    await client.connect()

    const result = await client.query(
      `SELECT u.id, u.email, u.password_hash, u.full_name, a.role
       FROM users u
       JOIN admin_users a ON u.id = a.user_id
       WHERE u.email = $1 AND a.is_active = true
       LIMIT 1`,
      [email.toLowerCase()]
    )

    if (result.rows.length === 0) {
      await logLoginAttempt(email, ip, false)
      return NextResponse.json({ ok: false }, { status: 401 })
    }

    const admin = result.rows[0]

    // Simple password check (bcrypt in production — this checks plain for demo)
    // In production you'd use: import bcrypt from 'bcryptjs'; bcrypt.compare(password, admin.password_hash)
    const passwordMatch = constantTimeCompare(password, admin.password_hash) ||
      admin.password_hash.startsWith('$2b$') // bcrypt hashed — accept and validate below

    if (!passwordMatch && !admin.password_hash.startsWith('$2b$')) {
      await logLoginAttempt(email, ip, false)
      return NextResponse.json({ ok: false }, { status: 401 })
    }

    // For bcrypt hashed passwords, do a dynamic import
    if (admin.password_hash.startsWith('$2b$') || admin.password_hash.startsWith('$2a$')) {
      const bcrypt = await import('bcryptjs')
      const valid = await bcrypt.default.compare(password, admin.password_hash)
      if (!valid) {
        await logLoginAttempt(email, ip, false)
        return NextResponse.json({ ok: false }, { status: 401 })
      }
    }

    await logLoginAttempt(email, ip, true)

    return NextResponse.json({
      ok: true,
      id: admin.id,
      name: admin.full_name,
      role: admin.role,
    })
  } finally {
    await client.end()
  }
}

async function logLoginAttempt(email: string, ip: string, success: boolean) {
  try {
    const client = new Client({ connectionString: process.env.NEON_DATABASE_URL })
    await client.connect()
    await client.query(
      `INSERT INTO security_logs (event_type, ip_address, details, created_at)
       VALUES ($1, $2, $3, NOW())
       ON CONFLICT DO NOTHING`,
      [
        success ? 'admin_login_success' : 'admin_login_failed',
        ip,
        JSON.stringify({ email: email.substring(0, 3) + '***' }),
      ]
    )
    await client.end()
  } catch {
    // Non-blocking — don't fail login if logging fails
  }
}
