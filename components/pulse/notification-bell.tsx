'use client'

import { useEffect, useRef, useState } from 'react'
import { Bell, Check, CheckCheck } from 'lucide-react'
import { usePulse, type NotificationRow } from './store'
import { cn } from '@/lib/utils'

function formatRelativeTime(dateString: string) {
  const date = new Date(dateString)
  if (Number.isNaN(date.getTime())) return ''
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (diffInSeconds < 60) return 'Just now'
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

/**
 * NotificationBell — self-contained bell + dropdown, fetches on mount and
 * on open, marks read on click or batch mark all.
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

  // Poll lightly every 60s to keep unread badges up-to-date
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

  const markAllRead = async () => {
    if (!rows || unreadCount === 0) return
    const unreadIds = rows.filter((n) => !n.read).map((n) => n.id)
    setRows((prev) => (prev ? prev.map((n) => ({ ...n, read: true })) : prev))
    await Promise.all(unreadIds.map((id) => api.markNotificationRead(id)))
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => {
          setOpen((v) => !v)
          if (!open) load()
        }}
        className="relative flex size-9 items-center justify-center rounded-xl bg-white/[0.04] text-muted-foreground transition-colors hover:bg-white/[0.08] hover:text-foreground"
        aria-label="Notifications"
      >
        <Bell className="size-4" />
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex size-4 items-center justify-center rounded-full bg-gold text-[9px] font-bold text-primary-foreground shadow-sm">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="animate-toast-in absolute right-0 top-11 z-50 max-h-96 w-80 overflow-y-auto rounded-2xl glass border border-white/10 bg-background/95 p-2 shadow-2xl backdrop-blur-xl no-scrollbar">
          <div className="flex items-center justify-between border-b border-white/5 px-2 pb-2 pt-1">
            <div className="flex items-center gap-2">
              <p className="text-xs font-semibold text-foreground">Notifications</p>
              {unreadCount > 0 && (
                <span className="rounded-full bg-gold/10 px-2 py-0.5 text-[10px] font-medium text-gold">
                  {unreadCount} unread
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="flex items-center gap-1 text-[11px] font-medium text-gold transition-opacity hover:opacity-80"
              >
                <CheckCheck className="size-3.5" />
                Mark all read
              </button>
            )}
          </div>

          {loading && !rows ? (
            <div className="py-8 text-center text-xs text-muted-foreground">
              <div className="mx-auto mb-2 size-4 animate-spin rounded-full border-2 border-gold border-t-transparent" />
              Loading notifications…
            </div>
          ) : !rows || rows.length === 0 ? (
            <div className="py-8 text-center text-xs text-muted-foreground">
              <p className="font-medium text-foreground/80">No notifications yet</p>
              <p className="mt-1 text-[10px] text-muted-foreground/70">Updates on transactions, KYC, and investments will appear here.</p>
            </div>
          ) : (
            <div className="mt-1 space-y-1">
              {rows.map((n) => (
                <button
                  key={n.id}
                  onClick={() => !n.read && markRead(n.id)}
                  className={cn(
                    'group w-full rounded-xl px-3 py-2.5 text-left transition-colors',
                    n.read
                      ? 'bg-transparent hover:bg-white/[0.03]'
                      : 'border border-gold/10 bg-gold-soft/60 hover:bg-gold-soft/80',
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className={cn('text-xs font-semibold leading-snug', n.read ? 'text-foreground/90' : 'text-gold')}>
                      {n.title}
                    </p>
                    <div className="flex shrink-0 items-center gap-1">
                      {!n.read && <span className="size-1.5 rounded-full bg-gold" />}
                      {n.read && <Check className="size-3 text-muted-foreground/60" />}
                    </div>
                  </div>
                  <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">{n.body}</p>
                  <p className="mt-1.5 text-[10px] font-medium text-muted-foreground/70">
                    {formatRelativeTime(n.createdAt)}
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
