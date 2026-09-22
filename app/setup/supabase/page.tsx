import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { SupabaseSqlCopy } from '@/components/setup/supabase-sql-copy'

export const metadata = {
  title: 'Supabase setup | Pulse',
  robots: { index: false, follow: false },
}

export default async function SupabaseSetupPage() {
  const sql = await readFile(path.join(process.cwd(), 'scripts/pulse-final-supabase.sql'), 'utf8')

  return (
    <main className="min-h-screen bg-[#050505] px-4 py-10 text-white sm:px-6">
      <div className="mx-auto max-w-5xl">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-amber-400">Pulse setup</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">Supabase SQL handover</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-400">
          Copy the complete SQL directly into Supabase SQL Editor, run it as a project owner, then follow the verification queries at the bottom.
        </p>
        <SupabaseSqlCopy sql={sql} />
      </div>
    </main>
  )
}
