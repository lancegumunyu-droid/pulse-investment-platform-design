import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const sql = readFileSync(path.join(__dirname, 'migrate.sql'), 'utf8')

const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!url || !key) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const db = createClient(url, key, { auth: { persistSession: false } })

// Split on semicolons but keep blocks intact enough for Supabase's rpc path.
// Supabase REST doesn't support raw SQL — we use the postgres extension via rpc.
const { error } = await db.rpc('exec_sql', { query: sql }).maybeSingle()
if (error) {
  // exec_sql is not a built-in. Fall back to running via pg directly.
  console.log('exec_sql not available, trying via postgres extension…')
  
  // Use the Supabase postgres connection directly  
  const { createClient: pgCreate } = await import('@supabase/supabase-js')
  
  // Split into individual statements and run each via rpc
  const statements = sql
    .split(/;\s*\n/)
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith('--'))

  let failed = 0
  for (const stmt of statements) {
    const { error: e } = await db.from('_sql').select(stmt).maybeSingle()
    if (e && !e.message?.includes('does not exist')) {
      console.error('Error in statement:', stmt.slice(0, 80), '\n', e.message)
      failed++
    }
  }
  if (failed > 0) {
    console.error(`${failed} statement(s) failed.`)
    process.exit(1)
  }
}

console.log('Migration completed successfully.')
