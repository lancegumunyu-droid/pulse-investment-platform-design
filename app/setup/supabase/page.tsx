import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { MarkdownCopy } from '@/components/setup/markdown-copy'

export const metadata = {
  title: 'Supabase setup | Pulse',
  robots: { index: false, follow: false },
}

export default async function SupabaseSetupPage() {
  const markdown = await readFile(path.join(process.cwd(), 'PULSE-SUPABASE-HANDOVER.md'), 'utf8')

  return (
    <main className="min-h-screen bg-[#050505] px-4 py-10 text-white sm:px-6">
      <div className="mx-auto max-w-5xl">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-amber-400">Pulse setup</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">Complete Supabase handover</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-400">
          Copy the complete Markdown handover below into a file or documentation tool. It includes the SQL order, RLS rules, admin setup, announcements, storage, sound, testing, and deployment checklist.
        </p>
        <MarkdownCopy markdown={markdown} />
      </div>
    </main>
  )
}
