import { useEffect, useState } from 'react'
import {
  Settings as SettingsIcon, Mail, Loader2, RefreshCw, CheckCircle2, AlertCircle,
  CalendarDays, ExternalLink,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useTasks } from '../context/TaskContext'
import { calendar } from '../services/api'
import { formatDateTime } from '../utils/format'

export default function Settings() {
  const { email, logout } = useAuth()
  const { refreshAll } = useTasks()
  const [refreshing, setRefreshing] = useState(false)
  const [refreshed, setRefreshed] = useState(false)
  const [error, setError] = useState(null)

  const onRefresh = async () => {
    setRefreshing(true)
    setError(null)
    setRefreshed(false)
    try {
      await refreshAll()
      setRefreshed(true)
      setTimeout(() => setRefreshed(false), 2500)
    } catch (e) {
      setError(e.friendlyMessage || 'Refresh failed')
    } finally {
      setRefreshing(false)
    }
  }

  return (
    <div className="space-y-5 max-w-2xl">
      <div>
        <div className="flex items-center gap-2">
          <SettingsIcon className="h-5 w-5 text-emerald-500" />
          <h1 className="text-xl font-bold text-ink-900 tracking-tight">Settings</h1>
        </div>
        <p className="text-sm text-ink-500 mt-1">Manage your account, calendar, and data sync.</p>
      </div>

      <section className="card p-5">
        <h2 className="text-sm font-semibold text-ink-700">Account</h2>
        <div className="mt-3 flex items-center gap-3">
          <div className="h-11 w-11 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 text-white flex items-center justify-center font-semibold">
            {(email || 'U').slice(0, 2).toUpperCase()}
          </div>
          <div className="min-w-0">
            <div className="text-sm font-medium text-ink-900 flex items-center gap-1.5">
              <Mail className="h-3.5 w-3.5 text-ink-400" />
              {email || '—'}
            </div>
            <div className="text-xs text-ink-400">Standard plan · Hackathon edition</div>
          </div>
        </div>
      </section>

      <CalendarSection />

      <section className="card p-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-ink-700">Data sync</h2>
            <p className="text-xs text-ink-500 mt-0.5">
              Re-pull goals, tasks, schedule, and notifications from the backend.
            </p>
          </div>
          <button onClick={onRefresh} disabled={refreshing} className="btn-secondary">
            {refreshing ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            {refreshing ? 'Syncing...' : 'Sync now'}
          </button>
        </div>
        {refreshed && (
          <div className="mt-3 text-xs text-emerald-600 flex items-center gap-1.5 animate-fade-in">
            <CheckCircle2 className="h-3.5 w-3.5" />
            All data refreshed.
          </div>
        )}
        {error && (
          <div className="mt-3 text-xs text-red-600 flex items-center gap-1.5 animate-fade-in">
            <AlertCircle className="h-3.5 w-3.5" />
            {error}
          </div>
        )}
      </section>

      <section className="card p-5">
        <h2 className="text-sm font-semibold text-ink-700">Session</h2>
        <p className="text-xs text-ink-500 mt-0.5">Sign out of this device.</p>
        <button onClick={logout} className="btn-secondary mt-3 text-red-600 hover:bg-red-50 border-red-100">
          Log out
        </button>
      </section>
    </div>
  )
}

function CalendarSection() {
  const [status, setStatus] = useState(null)
  const [loading, setLoading] = useState(true)
  const [connecting, setConnecting] = useState(false)
  const [calendarError, setCalendarError] = useState(null)
  const [feedback, setFeedback] = useState(null)

  useEffect(() => {
    let active = true
    calendar.status()
      .then((s) => active && setStatus(s))
      .catch(() => active && setStatus({ connected: false, event_count: 0 }))
      .finally(() => active && setLoading(false))
    return () => { active = false }
  }, [])

  const handleConnect = async () => {
    setConnecting(true)
    setCalendarError(null)
    setFeedback(null)
    try {
      const { authorization_url } = await calendar.startOAuth()
      window.location.href = authorization_url
    } catch (e) {
      setCalendarError(e.friendlyMessage || 'Google Calendar is not configured on the backend.')
    } finally {
      setConnecting(false)
    }
  }

  const handleSync = async () => {
    setConnecting(true)
    setCalendarError(null)
    setFeedback(null)
    try {
      const result = await calendar.sync()
      setFeedback(result.message || `Imported ${result.imported} event(s).`)
      const s = await calendar.status()
      setStatus(s)
    } catch (e) {
      setCalendarError(e.friendlyMessage || 'Sync failed.')
    } finally {
      setConnecting(false)
    }
  }

  const connected = status?.connected

  return (
    <section className="card p-5">
      <div className="flex items-center gap-2">
        <CalendarDays className="h-4 w-4 text-ink-600" />
        <h2 className="text-sm font-semibold text-ink-700">Google Calendar</h2>
      </div>
      <p className="text-xs text-ink-500 mt-0.5">
        Import your events so the AI can avoid conflicts when scheduling.
      </p>

      {loading ? (
        <div className="mt-3 h-9 w-full max-w-xs bg-ink-100 rounded-xl animate-pulse" />
      ) : connected ? (
        <div className="mt-3 space-y-3">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
            <span className="text-sm font-medium text-ink-900">Connected</span>
            <span className="text-xs text-ink-400">
              · {status?.event_count ?? 0} imported ·{' '}
              {status?.last_synced_at ? formatDateTime(status.last_synced_at) : 'never synced'}
            </span>
          </div>
          <button onClick={handleSync} disabled={connecting} className="btn-secondary">
            {connecting ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            {connecting ? 'Syncing...' : 'Sync now'}
          </button>
        </div>
      ) : (
        <button onClick={handleConnect} disabled={connecting} className="btn-primary mt-3">
          {connecting ? <Loader2 className="h-4 w-4 animate-spin" /> : <ExternalLink className="h-4 w-4" />}
          {connecting ? 'Redirecting...' : 'Connect Google Calendar'}
        </button>
      )}

      {feedback && (
        <div className="mt-3 text-xs text-emerald-600 flex items-center gap-1.5 animate-fade-in">
          <CheckCircle2 className="h-3.5 w-3.5" />
          {feedback}
        </div>
      )}
      {calendarError && (
        <div className="mt-3 text-xs text-red-600 flex items-center gap-1.5 animate-fade-in">
          <AlertCircle className="h-3.5 w-3.5" />
          {calendarError}
        </div>
      )}
    </section>
  )
}
