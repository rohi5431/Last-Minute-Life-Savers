import { useEffect, useRef, useState } from 'react'
import { Bell, CheckCheck, BellOff, X } from 'lucide-react'
import { useTasks } from '../context/TaskContext'
import { useAuth } from '../context/AuthContext'
import useWebSocket from '../hooks/useWebSocket'
import { relativeTime, classNames } from '../utils/format'

export default function NotificationBell() {
  const { notifications, markNotificationRead, handleLiveEvent } = useTasks()
  const { isAuthenticated } = useAuth()
  const { connected } = useWebSocket(handleLiveEvent, { enabled: isAuthenticated })
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  // Live updates.
  useWebSocket(handleLiveEvent)

  useEffect(() => {
    const onClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  const unread = notifications.filter((n) => !n.is_read)
  const unreadCount = unread.length

  const handleMarkAll = async () => {
    await Promise.all(unread.map((n) => markNotificationRead(n.id)))
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="relative p-2 rounded-lg hover:bg-ink-100 text-ink-600 hover:text-ink-900 transition-colors"
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 flex items-center justify-center rounded-full bg-red-500 text-white text-[10px] font-bold ring-2 ring-white animate-pulse-emerald">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>
      <span
        title={connected ? 'Live' : 'Reconnecting...'}
        className={classNames(
          'h-2 w-2 rounded-full ring-2 ring-white',
          connected ? 'bg-emerald-500' : 'bg-amber-400 animate-pulse'
        )}
      />

      {open && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-card border border-ink-100 overflow-hidden z-50 animate-slide-up">
          <div className="flex items-center justify-between px-4 py-3 border-b border-ink-100">
            <div className="flex items-center gap-2">
              <Bell className="h-4 w-4 text-ink-700" />
              <span className="font-semibold text-ink-900 text-sm">Notifications</span>
              {unreadCount > 0 && (
                <span className="text-xs px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">
                  {unreadCount} new
                </span>
              )}
            </div>
            <div className="flex items-center gap-1">
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAll}
                  className="flex items-center gap-1 text-xs text-emerald-600 hover:text-emerald-700 font-medium px-2 py-1 rounded-lg hover:bg-emerald-50"
                >
                  <CheckCheck className="h-3.5 w-3.5" />
                  Mark all
                </button>
              )}
              <button
                onClick={() => setOpen(false)}
                className="p-1 rounded-lg hover:bg-ink-100 text-ink-400"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <EmptyNotifications />
            ) : (
              notifications.map((n) => (
                <button
                  key={n.id}
                  onClick={() => markNotificationRead(n.id)}
                  className={classNames(
                    'w-full text-left px-4 py-3 border-b border-ink-50 hover:bg-ink-50 transition-colors flex gap-3',
                    !n.is_read && 'bg-emerald-50/40'
                  )}
                >
                  <span
                    className={classNames(
                      'mt-1.5 h-2 w-2 shrink-0 rounded-full',
                      n.is_read ? 'bg-ink-200' : 'bg-emerald-500'
                    )}
                  />
                  <div className="min-w-0 flex-1">
                    <p className={classNames(
                      'text-sm leading-snug',
                      n.is_read ? 'text-ink-500' : 'text-ink-900 font-medium'
                    )}>
                      {n.message}
                    </p>
                    <p className="text-xs text-ink-400 mt-0.5">{relativeTime(n.sent_at)}</p>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function EmptyNotifications() {
  return (
    <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
      <div className="h-12 w-12 rounded-full bg-ink-100 flex items-center justify-center mb-3">
        <BellOff className="h-6 w-6 text-ink-400" />
      </div>
      <p className="text-sm font-medium text-ink-700">All caught up</p>
      <p className="text-xs text-ink-400 mt-1">New reminders appear here in real time.</p>
    </div>
  )
}
