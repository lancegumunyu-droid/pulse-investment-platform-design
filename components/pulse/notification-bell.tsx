'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
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
 * NotificationBell — self-contained bell + dropdown, fetches safely on mount
 * with fallback protection for unbuilt backend services.
 */
export function NotificationBell() {
  const { api } = usePulse()
  const [mounted, setMounted] = useState(false)
  const [open, setOpen] = useState(false)
  const [rows, setRows] = useState<NotificationRow[] | null>(null)
  const [loading, setLoading] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const load = async () => {
    setLoading(true)
    try {
      // Safe check to ensure the API function exists before invoking
      if (api && typeof api.notifications === 'function') {
        const res = await api.notifications()
        if (res?.ok) {
          setRows(res.rows)
        } else {
          setRows([])
        }
      } else {
        // Fallback state if backend method isn't implemented yet
        setRows([])
      }
    } catch (err) {
      console.warn('Notifications endpoint not ready:', err)
      setRows([])
    }
    setLoading(false)
  }

  useEffect(() => {
    setMounted(true)
  }, [])

  // Keep live updates lightweight and pause polling when the tab is hidden.
  useEffect(() => {
    if (!mounted) return
    const refreshWhenVisible = () => {
      if (document.visibilityState === 'visible') void load()
    }
    refreshWhenVisible()
    const t = window.setInterval(refreshWhenVisible, 30_000)
    document.addEventListener('visibilitychange', refreshWhenVisible)
    return () => {
      window.clearInterval(t)
      document.removeEventListener('visibilitychange', refreshWhenVisible)
    }
  }, [mounted])

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
    try {
      if (api && typeof api.markNotificationRead === 'function') {
        await api.markNotificationRead(id)
      }
    } catch (err) {
      console.warn('Failed to sync markRead:', err)
    }
  }

  const markAllRead = async () => {
    if (!rows || unreadCount === 0) return
    const unreadIds = rows.filter((n) => !n.read).map((n) => n.id)
    setRows((prev) => (prev ? prev.map((n) => ({ ...n, read: true })) : prev))
    try {
      if (api && typeof api.markNotificationRead === 'function') {
        await Promise.all(unreadIds.map((id) => api.markNotificationRead(id)))
      }
    } catch (err) {
      console.warn('Failed to sync markAllRead:', err)
    }
  }

  if (!mounted) {
    return (
      <div className="relative flex size-9 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-zinc-400">
        <Bell className="size-4" />
      </div>
    )
  }

  return (
    <div ref={ref} className="relative font-sans">
      <button
        onClick={() => {
          setOpen((v) => !v)
          if (!open) load()
        }}
        className={cn(
          'relative flex size-9 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-zinc-400 transition-all hover:bg-white/[0.08] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/50',
          open && 'border-amber-400/50 bg-amber-400/10 text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.2)]'
        )}
        aria-label="Notifications"
      >
        <Bell className="size-4" />
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex size-4 items-center justify-center rounded-full bg-amber-400 text-[9px] font-bold text-zinc-950 shadow-[0_0_8px_rgba(245,158,11,0.8)]">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="absolute right-0 top-12 z-50 max-h-[420px] w-80 overflow-y-auto rounded-2xl border border-amber-500/20 bg-zinc-950/95 p-3 shadow-[0_20px_50px_rgba(0,0,0,0.9)] backdrop-blur-2xl no-scrollbar transform-gpu"
          >
            <div className="flex items-center justify-between border-b border-white/10 px-2 pb-2.5 pt-1">
              <div className="flex items-center gap-2">
                <p className="text-xs font-semibold text-white font-display">Notifications</p>
                {unreadCount > 0 && (
                  <span className="rounded-full bg-amber-400/15 px-2 py-0.5 text-[10px] font-bold text-amber-400 border border-amber-400/30">
                    {unreadCount} unread
                  </span>
                )}
              </div>
              {unreadCount > 0 && (
                <button
                  onClick={markAllRead}
                  className="flex items-center gap-1.5 text-[11px] font-semibold text-amber-400 transition-opacity hover:opacity-80 focus-visible:outline-none"
                >
                  <CheckCheck className="size-3.5" />
                  Mark all read
                </button>
              )}
            </div>

            {loading && !rows ? (
              <div className="py-12 text-center text-xs text-zinc-400 font-sans">
                <div className="mx-auto mb-2.5 size-4 animate-spin rounded-full border-2 border-amber-400 border-t-transparent" />
                Loading notifications…
              </div>
            ) : !rows || rows.length === 0 ? (
              <div className="py-12 text-center text-xs text-zinc-400 font-sans">
                <p className="font-semibold text-white font-display">No notifications yet</p>
                <p className="mt-1 text-[11px] text-zinc-500">Updates on transactions, KYC, and investments will appear here.</p>
              </div>
            ) : (
              <div className="mt-2 space-y-1.5 font-sans">
                {rows.map((n) => (
                  <button
                    key={n.id}
                    onClick={() => !n.read && markRead(n.id)}
                    className={cn(
                      'group w-full rounded-xl px-3 py-2.5 text-left transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-amber-400/50',
                      n.read
                        ? 'bg-transparent hover:bg-white/[0.03]'
                        : 'border border-amber-400/25 bg-amber-400/10 hover:bg-amber-400/15 shadow-[0_0_15px_rgba(245,158,11,0.08)]'
                    )}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className={cn('text-xs font-semibold leading-snug font-display', n.read ? 'text-zinc-300' : 'text-amber-400')}>
                        {n.title}
                      </p>
                      <div className="flex shrink-0 items-center gap-1 pt-0.5">
                        {!n.read && <span className="size-1.5 rounded-full bg-amber-400 shadow-[0_0_6px_rgba(245,158,11,0.8)]" />}
                        {n.read && <Check className="size-3 text-zinc-500" />}
                      </div>
                    </div>
                    <p className="mt-1 text-[11px] leading-relaxed text-zinc-400 font-sans">{n.body}</p>
                    <p className="mt-2 text-[10px] font-medium text-zinc-500 font-sans">
                      {formatRelativeTime(n.createdAt)}
                    </p>
                  </button>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
