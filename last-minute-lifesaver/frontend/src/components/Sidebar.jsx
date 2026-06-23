import { NavLink, Link } from 'react-router-dom'
import {
  Clock, LayoutDashboard, ListTodo, CalendarDays, BarChart3, Settings as SettingsIcon, Sparkles,
} from 'lucide-react'
import { classNames } from '../utils/format'

const NAV = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/tasks', label: 'Tasks', icon: ListTodo },
  { to: '/calendar', label: 'Schedule', icon: CalendarDays },
  { to: '/analytics', label: 'Analytics', icon: BarChart3 },
  { to: '/settings', label: 'Settings', icon: SettingsIcon },
]

export default function Sidebar({ open, onClose }) {
  return (
    <>
      {/* Mobile backdrop */}
      <div
        className={classNames(
          'fixed inset-0 z-40 bg-ink-950/40 backdrop-blur-sm lg:hidden transition-opacity',
          open ? 'opacity-100' : 'opacity-0 pointer-events-none'
        )}
        onClick={onClose}
      />

      <aside
        className={classNames(
          'fixed lg:sticky top-0 z-50 lg:z-0 h-screen w-64 bg-ink-950 text-white flex flex-col transition-transform lg:translate-x-0',
          open ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex items-center gap-2.5 px-5 h-16 border-b border-white/10">
          <Link to="/dashboard" className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-emerald-500 flex items-center justify-center shadow-lg">
              <Clock className="h-5 w-5 text-white" />
            </div>
            <div className="leading-tight">
              <div className="font-semibold text-sm tracking-tight">Life Saver</div>
              <div className="text-[10px] text-ink-400 truncate">Deadline rescue</div>
            </div>
          </Link>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <div className="px-2 pb-1 text-[10px] font-semibold uppercase tracking-wider text-ink-400">
            Menu
          </div>
          {NAV.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={onClose}
              className={({ isActive }) =>
                classNames(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20'
                    : 'text-ink-300 hover:bg-white/5 hover:text-white border border-transparent'
                )
              }
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="px-4 py-4 border-t border-white/10">
          <div className="rounded-xl bg-gradient-to-br from-emerald-500/15 to-blue-500/10 border border-emerald-500/20 p-3.5">
            <div className="flex items-center gap-2 text-emerald-300 text-xs font-semibold">
              <Sparkles className="h-3.5 w-3.5" />
              Pro tip
            </div>
            <p className="mt-1.5 text-xs text-ink-300 leading-relaxed">
              Add a goal with a tight deadline to watch the AI plan in real time.
            </p>
          </div>
        </div>
      </aside>
    </>
  )
}
