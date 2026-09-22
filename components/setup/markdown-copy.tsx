'use client'

import { useState } from 'react'
import { Check, Copy, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function MarkdownCopy({ markdown }: { markdown: string }) {
  const [copied, setCopied] = useState(false)

  async function copyMarkdown() {
    await navigator.clipboard.writeText(markdown)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1800)
  }

  function downloadMarkdown() {
    const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'PULSE-SUPABASE-HANDOVER.md'
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <section className="mt-8 overflow-hidden rounded-2xl border border-amber-400/20 bg-zinc-950 shadow-2xl">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 px-4 py-3">
        <div>
          <p className="text-sm font-medium text-white">PULSE-SUPABASE-HANDOVER.md</p>
          <p className="text-xs text-zinc-500">Complete Supabase, SQL, security, admin, announcements, and deployment instructions</p>
        </div>
        <div className="flex gap-2">
          <Button type="button" variant="outline" size="sm" onClick={downloadMarkdown} className="border-white/10 bg-transparent text-zinc-200 hover:bg-white/10">
            <Download className="mr-2 size-4" /> Download
          </Button>
          <Button type="button" size="sm" onClick={copyMarkdown} className="bg-amber-500 text-black hover:bg-amber-400">
            {copied ? <Check className="mr-2 size-4" /> : <Copy className="mr-2 size-4" />}
            {copied ? 'Copied' : 'Copy Markdown'}
          </Button>
        </div>
      </div>
      <pre className="max-h-[72vh] overflow-auto whitespace-pre-wrap p-5 text-xs leading-6 text-zinc-300"><code>{markdown}</code></pre>
    </section>
  )
}
