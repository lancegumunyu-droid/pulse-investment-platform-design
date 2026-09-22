'use client'

import { useState } from 'react'
import { Check, Copy, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function SupabaseSqlCopy({ sql }: { sql: string }) {
  const [copied, setCopied] = useState(false)

  async function copySql() {
    await navigator.clipboard.writeText(sql)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1800)
  }

  function downloadSql() {
    const blob = new Blob([sql], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'pulse-final-supabase.sql'
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <section className="mt-8 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] shadow-2xl">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 px-4 py-3">
        <div>
          <p className="text-sm font-medium">pulse-final-supabase.sql</p>
          <p className="text-xs text-zinc-500">Admin setup, support policies, notifications, and verification queries</p>
        </div>
        <div className="flex gap-2">
          <Button type="button" variant="outline" size="sm" onClick={downloadSql} className="border-white/10 bg-transparent text-zinc-200 hover:bg-white/10">
            <Download className="mr-2 size-4" /> Download
          </Button>
          <Button type="button" size="sm" onClick={copySql} className="bg-amber-500 text-black hover:bg-amber-400">
            {copied ? <Check className="mr-2 size-4" /> : <Copy className="mr-2 size-4" />}
            {copied ? 'Copied' : 'Copy SQL'}
          </Button>
        </div>
      </div>
      <pre className="max-h-[65vh] overflow-auto p-4 text-xs leading-6 text-zinc-300"><code>{sql}</code></pre>
    </section>
  )
}
