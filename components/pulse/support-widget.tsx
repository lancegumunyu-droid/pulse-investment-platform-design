'use client'

import { useState } from 'react'
import { LifeBuoy, Paperclip, Send, X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

const categories = [
  ['login', 'Login or access'],
  ['verification', 'Identity verification'],
  ['deposit', 'Deposit'],
  ['withdrawal', 'Withdrawal'],
  ['card', 'Pulse card'],
  ['referral', 'Referral'],
  ['transaction', 'Transaction'],
  ['profile', 'Profile'],
  ['technical', 'Technical issue'],
  ['other', 'Other'],
] as const

export function SupportWidget() {
  const [open, setOpen] = useState(false)
  const [category, setCategory] = useState<(typeof categories)[number][0]>('technical')
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')

  async function submit() {
    if (subject.trim().length < 3 || message.trim().length < 3) return
    setStatus('sending')
    const supabase = createClient()
    const { data: userData } = await supabase.auth.getUser()
    const userId = userData.user?.id
    if (!userId) {
      setStatus('error')
      return
    }

    const { data: ticket, error } = await supabase
      .from('support_tickets')
      .insert({ user_id: userId, category, subject: subject.trim(), message: message.trim() })
      .select('id')
      .single()

    if (error || !ticket) {
      setStatus('error')
      return
    }

    if (file) {
      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '-').slice(-100)
      const path = `${userId}/${ticket.id}/${crypto.randomUUID()}-${safeName}`
      const upload = await supabase.storage.from('support-attachments').upload(path, file, { contentType: file.type, upsert: false })
      if (!upload.error) {
        await supabase.from('support_attachments').insert({
          ticket_id: ticket.id,
          user_id: userId,
          storage_path: path,
          file_name: file.name,
          content_type: file.type,
          file_size: file.size,
        })
      }
    }

    setSubject('')
    setMessage('')
    setFile(null)
    setStatus('sent')
  }

  return (
    <div className="fixed bottom-[calc(5.75rem+env(safe-area-inset-bottom))] right-3 z-40 sm:bottom-6 sm:right-6">
      {open ? (
        <section className="w-[min(92vw,380px)] overflow-hidden rounded-2xl border border-amber-400/25 bg-zinc-950/95 shadow-2xl backdrop-blur-xl" aria-label="Pulse support">
          <header className="flex items-center justify-between border-b border-white/10 px-4 py-3">
            <div><p className="text-sm font-semibold text-white">Pulse support</p><p className="text-xs text-zinc-400">Tell us what happened and we&apos;ll follow up.</p></div>
            <button onClick={() => setOpen(false)} className="rounded-lg p-2 text-zinc-400 hover:bg-white/10" aria-label="Close support"><X className="size-4" /></button>
          </header>
          <div className="flex max-h-[70vh] flex-col gap-3 overflow-y-auto p-4">
            {status === 'sent' ? <div className="rounded-xl border border-emerald-400/20 bg-emerald-400/10 p-4 text-sm text-emerald-200">Your issue has been sent to Pulse support. We&apos;ll notify you when there&apos;s a reply.</div> : null}
            <label className="text-xs font-medium text-zinc-300">What can we help with?
              <select value={category} onChange={(e) => setCategory(e.target.value as typeof category)} className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none focus:border-amber-400">
                {categories.map(([value, label]) => <option key={value} value={value} className="bg-zinc-900">{label}</option>)}
              </select>
            </label>
            <label className="text-xs font-medium text-zinc-300">Subject<input value={subject} onChange={(e) => setSubject(e.target.value)} maxLength={160} className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none focus:border-amber-400" placeholder="Short summary" /></label>
            <label className="text-xs font-medium text-zinc-300">Message<textarea value={message} onChange={(e) => setMessage(e.target.value)} maxLength={5000} rows={5} className="mt-1 w-full resize-none rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none focus:border-amber-400" placeholder="Include any relevant details" /></label>
            <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-dashed border-white/15 px-3 py-3 text-xs text-zinc-400 hover:border-amber-400/50"><Paperclip className="size-4" />{file ? file.name : 'Add screenshot (PNG, JPG, WEBP or PDF)'}<input type="file" accept="image/png,image/jpeg,image/webp,application/pdf" className="sr-only" onChange={(e) => { const next = e.target.files?.[0] ?? null; if (next && next.size <= 10 * 1024 * 1024) setFile(next) }} /></label>
            {status === 'error' ? <p className="text-xs text-red-300">We couldn&apos;t send this yet. Please check your connection and try again.</p> : null}
            <button onClick={submit} disabled={status === 'sending' || subject.trim().length < 3 || message.trim().length < 3} className="flex min-h-11 items-center justify-center gap-2 rounded-xl bg-amber-400 px-4 py-2.5 text-sm font-semibold text-black disabled:cursor-not-allowed disabled:opacity-50"><Send className="size-4" />{status === 'sending' ? 'Sending…' : 'Send to support'}</button>
          </div>
        </section>
      ) : <button onClick={() => setOpen(true)} className="flex min-h-11 items-center gap-2 rounded-full border border-amber-400/40 bg-zinc-950/90 px-4 py-3 text-sm font-semibold text-amber-200 shadow-xl backdrop-blur-xl hover:bg-amber-400/10" aria-label="Contact Pulse support"><LifeBuoy className="size-4" />Support</button>}
    </div>
  )
}
