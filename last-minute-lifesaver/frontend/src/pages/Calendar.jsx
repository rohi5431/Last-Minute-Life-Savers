import { useEffect, useState, useCallback } from 'react'
import {
  CalendarDays, RefreshCw, Loader2, CheckCircle2, AlertCircle, AlertTriangle,
  ExternalLink, CalendarOff, Zap, Clock, MapPin,
} from 'lucide-react'
import { calendar } from '../services/api'
import { useTasks } from '../context/TaskContext'
import Timeline from '../components/Timeline'
import { formatDateTime, classNames } from '../utils/format'

export default function Calendar() {
  const { refreshAll } = useTasks()
  const [status, setStatus] = useState(null)
  const [events, setEvents] = useState([])
  const [conflicts, setConflicts] = useState([])
  const [loadingStatus, setLoadingStatus] = useState(true)
  const [syncing, setSyncing] = useState(false)
  const [optimizing, setOptimizing] = useState(false)
  const [feedback, setFeedback] = useState(null)
  const [error, setError] = useState(null)

  const loadAll = useCallback(async () => {
    setLoadingStatus(true)
    setError(null)
    try {
      const [s, e, c] = await Promise.all([
        calendar.status().catch(() => ({ connected: false, event_count: 0 })),
        calendar.listEvents().catch(() => []),
        calendar.listConflicts().catch(() => []),
      ])
      setStatus(s)
      setEvents(e)
      setConflicts(c)
    } catch (e) {
      setError(e.friendlyMessage || 'Failed to load calendar data')
    } finally {
      setLoadingStatus(false)
    }
  }, [])

  useEffect(() => {
    loadAll()
  }, [loadAll])

  // Pick up OAuth redirect params.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get('oauth_success')) {
      setFeedback({ type: 'success', text: 'Google Calendar connected successfully.' })
      loadAll()
    } else if (params.get('oauth_error')) {
      setError(`Google authorization failed: ${params.get('oauth_error')}`)
    }
    if (params.get('oauth_success') || params.get('oauth_error')) {
      window.history.replaceState({}, '', window.location.pathname)
    }
  }, [loadAll])

  const handleConnect = async () => {
    setError(null)
    setFeedback(null)
    try {
      const { authorization_url } = await calendar.startOAuth()
      window.location.href = authorization_url
    } catch (e) {
      setError(e.friendlyMessage || 'Could not start Google OAuth.')
    }
  }

  const handleDisconnect = async () => {
    setSyncing(true)
    try {
      await calendar.disconnect()
      setFeedback({ type: 'success', text: 'Calendar disconnected.' })
      await loadAll()
    } catch (e) {
      setError(e.friendlyMessage || 'Disconnect failed.')
    } finally {
      setSyncing(false)
    }
  }

  const handleSync = async () => {
    setSyncing(true)
    setError(null)
    setFeedback(null)
    try {
      const result = await calendar.sync()
      setFeedback({
        type: 'success',
        text: result.message || `Imported ${result.imported} event(s).`,
      })
      if (result.conflicts?.length) {
        setFeedback({
          type: 'warning',
          text: `Imported ${result.imported} events. Found ${result.conflicts.length} conflict(s).`,
        })
      }
      await Promise.all([loadAll(), refreshAll()])
    } catch (e) {
      setError(e.friendlyMessage || 'Calendar sync failed.')
    } finally {
      setSyncing(false)
    }
  }

  const handleOptimize = async () => {
    setOptimizing(true)
    setError(null)
    setFeedback(null)
    try {
      const result = await calendar.optimize()
      setFeedback({
        type: 'success',
        text: result.message || 'Schedule optimized.',
      })
      await Promise.all([loadAll(), refreshAll()])
    } catch (e) {
      setError(e.friendlyMessage || 'Optimization failed.')
    } finally {
      setOptimizing(false)
    }
  }

  const connected = status?.connected

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5 text-emerald-500" />
            <h1 className="text-xl font-bold text-ink-900 tracking-tight">Calendar</h1>
          </div>
          <p className="text-sm text-ink-500 mt-1">
            Sync Google Calendar, detect conflicts, and let the AI reschedule around your day.
          </p>
        </div>
        {loadingStatus ? (
          <div className="h-9 w-36 bg-ink-100 rounded-xl animate-pulse" />
        ) : connected ? (
          <div className="flex items-center gap-2">
            <button onClick={handleSync} disabled={syncing} className="btn-secondary">
              {syncing ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
              {syncing ? 'Syncing...' : 'Sync events'}
            </button>
            <button onClick={handleDisconnect} disabled={syncing} className="btn-ghost text-red-600">
              <CalendarOff className="h-4 w-4" />
              Disconnect
            </button>
          </div>
        ) : (
          <button onClick={handleConnect} className="btn-primary">
            <ExternalLink className="h-4 w-4" />
            Connect Google Calendar
          </button>
        )}
      </div>

      {feedback && (
        <div
          className={classNames(
            'flex items-start gap-2 text-sm rounded-xl px-3.5 py-2.5 animate-fade-in',
            feedback.type === 'success' && 'text-emerald-700 bg-emerald-50 border border-emerald-100',
            feedback.type === 'warning' && 'text-amber-700 bg-amber-50 border border-amber-100',
            feedback.type === 'error' && 'text-red-700 bg-red-50 border border-red-100'
          )}
        >
          {feedback.type === 'success' ? <CheckCircle2 className="h-4 w-4 mt-0.5" /> : <AlertTriangle className="h-4 w-4 mt-0.5" />}
          <span>{feedback.text}</span>
        </div>
      )}

      {error && (
        <div className="flex items-start gap-2 text-sm text-red-700 bg-red-50 border border-red-100 rounded-xl px-3.5 py-2.5 animate-fade-in">
          <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Connection + actions */}
        <section className="card p-5 lg:col-span-1">
          <h2 className="text-sm font-semibold text-ink-700">Connection</h2>
          {loadingStatus ? (
            <div className="mt-3 space-y-2">
              <div className="h-4 w-32 bg-ink-100 rounded animate-pulse" />
              <div className="h-4 w-24 bg-ink-100 rounded animate-pulse" />
            </div>
          ) : (
            <div className="mt-3">
              <div className="flex items-center gap-2">
                <span className={classNames(
                  'h-2.5 w-2.5 rounded-full',
                  connected ? 'bg-emerald-500' : 'bg-ink-300'
                )} />
                <span className="text-sm font-medium text-ink-900">
                  {connected ? 'Connected to Google' : 'Not connected'}
                </span>
              </div>
              <dl className="mt-3 space-y-1.5 text-xs text-ink-500">
                <div className="flex justify-between">
                  <dt>Provider</dt>
                  <dd className="text-ink-700 font-medium">Google Calendar</dd>
                </div>
                <div className="flex justify-between">
                  <dt>Imported events</dt>
                  <dd className="text-ink-700 font-medium">{status?.event_count ?? 0}</dd>
                </div>
                <div className="flex justify-between">
                  <dt>Last synced</dt>
                  <dd className="text-ink-700 font-medium">
                    {status?.last_synced_at ? formatDateTime(status.last_synced_at) : 'Never'}
                  </dd>
                </div>
              </dl>
            </div>
          )}

          {connected && (
            <button
              onClick={handleOptimize}
              disabled={optimizing}
              className="btn-primary w-full mt-4"
            >
              {optimizing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}
              {optimizing ? 'Rescheduling...' : 'Optimize schedule'}
            </button>
          )}
          <p className="text-xs text-ink-400 mt-2">
            Optimization reschedules tasks that conflict with calendar events or missed slots.
          </p>
        </section>

        {/* Conflicts */}
        <section className="card p-5 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-ink-700">Schedule conflicts</h2>
            {conflicts.length > 0 && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-red-50 text-red-700 border border-red-100">
                {conflicts.length} found
              </span>
            )}
          </div>
          {loadingStatus ? (
            <div className="mt-3 space-y-2">
              {[0, 1].map((i) => <div key={i} className="h-12 bg-ink-100 rounded-xl animate-pulse" />)}
            </div>
          ) : conflicts.length === 0 ? (
            <div className="mt-3 flex flex-col items-center justify-center py-8 text-center border border-dashed border-ink-200 rounded-xl">
              <CheckCircle2 className="h-7 w-7 text-emerald-500 mb-2" />
              <p className="text-sm font-medium text-ink-800">No conflicts</p>
              <p className="text-xs text-ink-500 mt-1">Your tasks fit cleanly around your calendar.</p>
            </div>
          ) : (
            <ul className="mt-3 space-y-2">
              {conflicts.map((c, i) => (
                <li key={i} className="flex gap-3 p-3 rounded-xl bg-red-50/50 border border-red-100">
                  <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-ink-900">{c.task_title}</p>
                    <p className="text-xs text-ink-500 mt-0.5">
                      {c.conflict_with} · {formatDateTime(c.overlap_start)} → {formatDateTime(c.overlap_end)}
                    </p>
                    <p className="text-xs text-red-600 mt-1">{c.message}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
          {connected && conflicts.length > 0 && (
            <button onClick={handleOptimize} disabled={optimizing} className="btn-secondary w-full mt-3">
              {optimizing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}
              Auto-resolve conflicts
            </button>
          )}
        </section>
      </div>

      {/* Imported events */}
      <section className="card p-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-ink-700">Upcoming calendar events</h2>
          {events.length > 0 && (
            <span className="text-xs text-ink-400">{events.length} imported</span>
          )}
        </div>
        {loadingStatus ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {[0, 1, 2].map((i) => <div key={i} className="h-20 bg-ink-100 rounded-xl animate-pulse" />)}
          </div>
        ) : events.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center border border-dashed border-ink-200 rounded-xl">
            <CalendarDays className="h-7 w-7 text-ink-400 mb-2" />
            <p className="text-sm font-medium text-ink-700">No imported events</p>
            <p className="text-xs text-ink-500 mt-1">
              {connected ? 'Sync to pull your next 30 days of events.' : 'Connect Google Calendar to import events.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {events.map((e) => (
              <div key={e.id} className="rounded-xl border border-ink-100 p-3 hover:shadow-soft transition-shadow">
                <p className="text-sm font-medium text-ink-900 line-clamp-1">{e.title}</p>
                <div className="mt-1.5 flex items-center gap-1.5 text-xs text-ink-500">
                  <Clock className="h-3 w-3" />
                  {formatDateTime(e.start_at)}
                </div>
                {e.location && (
                  <div className="mt-0.5 flex items-center gap-1.5 text-xs text-ink-400">
                    <MapPin className="h-3 w-3" />
                    <span className="line-clamp-1">{e.location}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="card p-5">
        <h2 className="text-sm font-semibold text-ink-700 mb-3">Your task timeline</h2>
        <Timeline />
      </section>
    </div>
  )
}
