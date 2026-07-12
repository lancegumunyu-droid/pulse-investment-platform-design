import { NextResponse } from 'next/server'
import { Client } from 'pg'

export async function GET() {
  const client = new Client({ connectionString: process.env.NEON_DATABASE_URL })
  try {
    await client.connect()
    const result = await client.query(`
      SELECT
        a.id,
        a.user_id,
        a.role,
        a.is_active,
        a.created_at,
        u.email,
        u.full_name
      FROM admin_users a
      JOIN users u ON u.id = a.user_id
      ORDER BY a.created_at ASC
    `)
    return NextResponse.json({ admins: result.rows })
  } catch (err) {
    console.error('[admin/manage/list]', err)
    return NextResponse.json({ admins: [] })
  } finally {
    await client.end()
  }
}
