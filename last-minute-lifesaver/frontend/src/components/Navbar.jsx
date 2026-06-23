import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  Clock, Bell, LogOut, Menu, Search, ChevronsLeft,
} from 'lucide-react'
import NotificationBell from './NotificationBell'
import { useAuth } from '../context/AuthContext'
import { initialsFromEmail } from '../utils/format'

export default function Navbar({ onToggleSidebar, sidebarOpen }) {
  const { email, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  const pageTitle = titleFromPath(location.pathname)

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/80 backdrop-blur border-b border-ink-100 flex items-center gap-3 px-4 sm:px-6">
      <button
        onClick={onToggleSidebar}
        className="lg:hidden p-2 -ml-2 rounded-lg hover:bg-ink-100 text-ink-600"
        aria-label="Toggle sidebar"
      >
        {sidebarOpen ? <ChevronsLeft className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      <div className="flex items-center gap-2 lg:hidden">
        <div className="h-8 w-8 rounded-lg bg-emerald-500 flex items-center justify-center">
          <Clock className="h-4 w-4 text-white" />
        </div>
      </div>

      <div className="hidden lg:flex items-center gap-2">
        <h1 className="text-lg font-semibold text-ink-900 tracking-tight">{pageTitle}</h1>
      </div>

      <div className="hidden md:flex flex-1 max-w-md mx-auto">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-400" />
          <input
            type="text"
            placeholder="Search tasks, goals..."
            className="input pl-9 py-2 bg-ink-50 border-transparent focus:bg-white"
          />
        </div>
      </div>

      <div className="flex-1 md:hidden" />

      <NotificationBell />

      <div className="flex items-center gap-3 pl-2 border-l border-ink-100">
        <div className="hidden sm:block text-right">
          <div className="text-sm font-medium text-ink-900 leading-tight">{email || 'Guest'}</div>
          <div className="text-xs text-ink-400">Member</div>
        </div>
        <div className="h-9 w-9 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 text-white flex items-center justify-center text-xs font-semibold shadow-sm">
          {initialsFromEmail(email)}
        </div>
        <button
          onClick={handleLogout}
          className="p-2 rounded-lg hover:bg-ink-100 text-ink-500 hover:text-ink-700"
          title="Log out"
          aria-label="Log out"
        >
          <LogOut className="h-5 w-5" />
        </button>
      </div>
    </header>
  )
}

function titleFromPath(path) {
  if (path.startsWith('/dashboard')) return 'Dashboard'
  if (path.startsWith('/tasks')) return 'Tasks'
  if (path.startsWith('/schedule') || path.startsWith('/calendar')) return 'Schedule'
  if (path.startsWith('/analytics')) return 'Analytics'
  if (path.startsWith('/settings')) return 'Settings'
  return 'Last-Minute Life Saver'
}
