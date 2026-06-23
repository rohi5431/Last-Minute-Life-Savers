import { useState } from 'react'
import {
  Clock, Flag, CheckCircle2, RotateCcw, MoreHorizontal, Calendar, Play, Loader2, StickyNote,
} from 'lucide-react'
import { useTasks } from '../context/TaskContext'
import {
  priorityMeta, statusMeta, formatDuration, formatDateTime, classNames,
} from '../utils/format'

const NEXT_STATUS = {
  pending: 'in_progress',
  in_progress: 'completed',
  completed: 'pending',
}

export default function TaskCard({ task }) {
  const { updateTask } = useTasks()
  const [busy, setBusy] = useState(false)
  const [showNotes, setShowNotes] = useState(false)

  const pm = priorityMeta(task.priority)
  const sm = statusMeta(task.status)
  const isDone = task.status === 'completed' || task.completed_at

  const cycleStatus = async () => {
    setBusy(true)
    try {
      const next = NEXT_STATUS[task.status] || 'completed'
      const patch = { status: next }
      if (next === 'completed') patch.completed_at = new Date().toISOString()
      else if (next === 'pending') patch.completed_at = null
      await updateTask(task.id, patch)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div
      className={classNames(
        'group relative bg-white rounded-xl border p-4 transition-all hover:shadow-card hover:-translate-y-0.5',
        isDone ? 'border-ink-100 opacity-80' : 'border-ink-200',
        `ring-1 ${pm.ring}`
      )}
    >
      <div className="flex items-start gap-2.5">
        <button
          onClick={cycleStatus}
          disabled={busy}
          className={classNames(
            'mt-0.5 h-5 w-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all',
            isDone
              ? 'bg-emerald-500 border-emerald-500 text-white'
              : 'border-ink-300 hover:border-emerald-400'
          )}
          title={isDone ? 'Mark pending' : 'Mark complete'}
        >
          {busy ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : (
            isDone && <CheckCircle2 className="h-3 w-3" />
          )}
        </button>

        <div className="min-w-0 flex-1">
          <h4
            className={classNames(
              'text-sm font-medium leading-snug',
              isDone ? 'text-ink-400 line-through' : 'text-ink-900'
            )}
          >
            {task.title}
          </h4>

          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-ink-500">
            <span className={classNames('inline-flex items-center gap-1 px-2 py-0.5 rounded-full', pm.badge)}>
              <span className={classNames('h-1.5 w-1.5 rounded-full', pm.dot)} />
              {pm.label}
            </span>
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {formatDuration(task.duration_min)}
            </span>
            <span className={classNames('px-2 py-0.5 rounded-full', sm.badge)}>
              {sm.label}
            </span>
            {task.scheduled_at && (
              <span className="inline-flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {formatDateTime(task.scheduled_at)}
              </span>
            )}
          </div>

          {task.notes && (
            <div className="mt-2">
              <button
                onClick={() => setShowNotes((s) => !s)}
                className="inline-flex items-center gap-1 text-xs text-ink-400 hover:text-ink-600"
              >
                <StickyNote className="h-3 w-3" />
                {showNotes ? 'Hide note' : 'Show note'}
              </button>
              {showNotes && (
                <p className="mt-1 text-xs text-ink-600 bg-ink-50 rounded-lg px-2.5 py-1.5">
                  {task.notes}
                </p>
              )}
            </div>
          )}
        </div>

        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
          {!isDone && (
            <button
              onClick={cycleStatus}
              className="p-1.5 rounded-lg hover:bg-ink-100 text-ink-500"
              title="Start"
            >
              <Play className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
