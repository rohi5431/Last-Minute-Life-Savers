import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bell, Check, X, Clock } from 'lucide-react'

interface Notification {
  id: number
  title: string
  message: string
  time: string
  read: boolean
  type: 'reminder' | 'deadline' | 'update' | 'achievement'
}

interface NotificationBellProps {
  notifications: Notification[]
  onMarkRead: (id: number) => void
  onMarkAllRead: () => void
}

export default function NotificationBell({ notifications, onMarkRead, onMarkAllRead }: NotificationBellProps) {
  const [isOpen, setIsOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const unreadCount = notifications.filter(n => !n.read).length

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const typeColors = {
    reminder: 'border-l-violet-500',
    deadline: 'border-l-red-500',
    update: 'border-l-cyan-500',
    achievement: 'border-l-amber-500',
  }

  return (
    <div className="relative" ref={ref}>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-xl bg-white/[0.05] border border-white/[0.08] hover:bg-white/[0.1] transition-colors"
      >
        <Bell className="w-5 h-5 text-slate-400" />
        {unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 min-w-5 h-5 px-1.5 rounded-full bg-violet-500 text-white text-xs font-bold flex items-center justify-center"
          >
            {unreadCount}
          </motion.span>
        )}
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-[#0f0f15] border border-white/[0.08] shadow-2xl overflow-hidden z-50"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-white/[0.08]">
              <h3 className="font-semibold text-white">Notifications</h3>
              {unreadCount > 0 && (
                <button
                  onClick={onMarkAllRead}
                  className="text-xs text-violet-400 hover:text-violet-300 transition-colors"
                >
                  Mark all read
                </button>
              )}
            </div>

            {/* List */}
            <div className="max-h-96 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-slate-500 text-sm">
                  No notifications yet
                </div>
              ) : (
                notifications.map((notification) => (
                  <motion.div
                    key={notification.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`relative p-4 border-l-2 ${typeColors[notification.type]} ${
                      !notification.read ? 'bg-violet-500/5' : ''
                    } hover:bg-white/[0.03] transition-colors`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <h4 className={`text-sm ${!notification.read ? 'font-medium text-white' : 'text-slate-300'}`}>
                          {notification.title}
                        </h4>
                        <p className="text-xs text-slate-500 mt-1">{notification.message}</p>
                        <div className="flex items-center gap-1 mt-2 text-xs text-slate-500">
                          <Clock className="w-3 h-3" />
                          {notification.time}
                        </div>
                      </div>
                      {!notification.read && (
                        <button
                          onClick={() => onMarkRead(notification.id)}
                          className="p-1 rounded-lg hover:bg-white/5 transition-colors"
                        >
                          <Check className="w-4 h-4 text-slate-400" />
                        </button>
                      )}
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
