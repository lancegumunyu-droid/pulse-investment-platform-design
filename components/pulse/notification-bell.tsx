'use client'

import { useEffect, useRef, useState } from 'react'
import { Bell, Check } from 'lucide-react'
import { usePulse, type NotificationRow } from './store'
import { cn } from '@/lib/utils'

/**
 * NotificationBell — self-contained bell + dropdown, fetches on mount and
 * on open, marks read on click. Mounted in top-bar.tsx's persistent
 * header, so it's visible on every tab.
 */
export function NotificationBell() {
  const { api } = usePulse()
  const [open, setOpen] = useState(false)
  const [rows, setRows] = useState<NotificationRow[] | null>(null)
  const [loading, setLoading] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const load = async () => {
    setLoading(true)
    const res = await api.notifications()
    if (res.ok) setRows(res.rows)
    setLoading(false)
  }

  // Poll lightly so the unread dot stays fresh even if the dropdown's
  // never opened — every 60s, not aggressive enough to worry about load.
  useEffect(() => {
    load()
    const t = setInterval(load, 60_000)
    return () => clearInterval(t)
  }, [])

  useEffect(() => {
    if (!open) return
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [open])

  const unreadCount = (rows ?? []).filter((n) => !n.read).length

  const markRead = async (id: string) => {
    setRows((prev) => (prev ? prev.map((n) => (n.id === id ? { ...n, read: true } : n)) : prev))
    await api.markNotificationRead(id)
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => {
          setOpen((v) => !v)
          if (!open) load()
        }}
        className="relative flex size-9 items-center justify-center rounded-xl bg-white/[0.04] text-muted-foreground transition-colors hover:text-foreground"
        aria-label="Notifications"
      >
        <Bell className="size-4" />
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex size-4 items-center justify-center rounded-full bg-gold text-[9px] font-bold text-primary-foreground">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="animate-toast-in absolute right-0 top-11 z-50 max-h-96 w-80 overflow-y-auto rounded-2xl glass p-2 no-scrollbar">
          <div className="flex items-center justify-between px-2 py-1.5">
            <p className="text-xs font-semibold text-muted-foreground">Notifications</p>
            {unreadCount > 0 && <span className="text-[10px] text-gold">{unreadCount} unread</span>}
          </div>
          {loading && !rows ? (
            <p className="px-3 py-6 text-center text-xs text-muted-foreground">Loading…</p>
          ) : !rows || rows.length === 0 ? (
            <p className="px-3 py-6 text-center text-xs text-muted-foreground">Nothing yet.</p>
          ) : (
            <div className="space-y-1">
              {rows.map((n) => (
                <button
                  key={n.id}
                  onClick={() => !n.read && markRead(n.id)}
                  className={cn(
                    'w-full rounded-xl px-3 py-2.5 text-left transition-colors',
                    n.read ? 'bg-transparent' : 'bg-gold-soft',
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className={cn('text-xs font-semibold', !n.read && 'text-gold')}>{n.title}</p>
                    {!n.read && <span className="mt-0.5 size-1.5 shrink-0 rounded-full bg-gold" />}
                    {n.read && <Check className="mt-0.5 size-3 shrink-0 text-muted-foreground" />}
                  </div>
                  <p className="mt-0.5 text-[11px] leading-relaxed text-muted-foreground">{n.body}</p>
                  <p className="mt-1 text-[10px] text-muted-foreground">
                    {new Date(n.createdAt).toLocaleDateString()}
                  </p>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
