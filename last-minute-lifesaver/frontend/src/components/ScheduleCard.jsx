import { Clock, Calendar } from 'lucide-react'
import { formatTime, formatDuration, priorityMeta, classNames } from '../utils/format'

export default function ScheduleCard({ item, task }) {
  const pm = priorityMeta(task?.priority)
  const isDone = task?.status === 'completed' || task?.completed_at
  const title = task?.title || `Task #${item.task_id}`
  const borderColor = isDone
    ? 'border-emerald-300'
    : task?.priority === 'high'
      ? 'border-red-400'
      : task?.priority === 'low'
        ? 'border-sky-400'
        : 'border-amber-400'

  return (
    <div
      className={classNames(
        'relative flex gap-4 group',
        isDone && 'opacity-70'
      )}
    >
      {/* Timeline marker */}
      <div className="flex flex-col items-center shrink-0">
        <div
          className={classNames(
            'h-10 w-10 rounded-full flex items-center justify-center border-2 bg-white shadow-soft',
            isDone ? 'border-emerald-300' : borderColor
          )}
        >
          <Clock className={classNames('h-4 w-4', isDone ? 'text-emerald-500' : 'text-ink-500')} />
        </div>
        <div className="w-px flex-1 bg-ink-200 mt-1" />
      </div>

      {/* Card */}
      <div className="flex-1 pb-5">
        <div className="card p-4 hover:shadow-card transition-shadow">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-semibold text-emerald-600 inline-flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {formatTime(item.scheduled_for)}
            </span>
            {task && (
              <span className={classNames('text-[11px] px-2 py-0.5 rounded-full', pm.badge)}>
                {pm.label}
              </span>
            )}
          </div>
          <h4
            className={classNames(
              'mt-1.5 text-sm font-medium leading-snug',
              isDone ? 'text-ink-400 line-through' : 'text-ink-900'
            )}
          >
            {title}
          </h4>
          <div className="mt-1.5 flex items-center gap-3 text-xs text-ink-500">
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {formatDuration(task?.duration_min)}
            </span>
            {isDone && (
              <span className="text-emerald-600 font-medium">Completed</span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
