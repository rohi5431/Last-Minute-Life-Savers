import { useMemo } from 'react'
import { CalendarClock, Inbox, Loader2 } from 'lucide-react'
import ScheduleCard from './ScheduleCard'
import { useTasks } from '../context/TaskContext'
import { formatDuration, classNames } from '../utils/format'

export default function Timeline({ todayOnly = false }) {
  const { schedules, tasks, loading } = useTasks()

  const items = useMemo(() => {
    const taskMap = new Map(tasks.map((t) => [t.id, t]))
    let rows = schedules
      .map((s) => ({ schedule: s, task: taskMap.get(s.task_id) }))
      .sort(
        (a, b) =>
          new Date(a.schedule.scheduled_for) - new Date(b.schedule.scheduled_for)
      )

    if (todayOnly) {
      const now = new Date()
      const start = new Date(now)
      start.setHours(0, 0, 0, 0)
      const end = new Date(now)
      end.setHours(23, 59, 59, 999)
      rows = rows.filter(({ schedule }) => {
        const d = new Date(schedule.scheduled_for)
        return d >= start && d <= end
      })
    }

    // Group by day.
    const groups = {}
    rows.forEach((r) => {
      const key = new Date(r.schedule.scheduled_for).toDateString()
      if (!groups[key]) groups[key] = []
      groups[key].push(r)
    })
    return Object.entries(groups)
  }, [schedules, tasks, todayOnly])

  if (loading && schedules.length === 0) {
    return (
      <div className="flex items-center justify-center py-12 text-ink-400">
        <Loader2 className="h-5 w-5 animate-spin mr-2" />
        Loading schedule...
      </div>
    )
  }

  if (items.length === 0) {
    return <EmptyTimeline todayOnly={todayOnly} />
  }

  const totalMinutes = items
    .flatMap(([, rs]) => rs)
    .reduce((acc, { task }) => acc + (task?.duration_min || 0), 0)

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-ink-500">
          <CalendarClock className="h-4 w-4" />
          <span>{todayOnly ? 'Today' : 'All'} schedule</span>
        </div>
        <span className="text-xs text-ink-400">
          {formatDuration(totalMinutes)} planned
        </span>
      </div>

      {items.map(([day, rows]) => (
        <div key={day}>
          <div className="flex items-center gap-2 mb-3">
            <div className="text-xs font-semibold uppercase tracking-wide text-ink-500">
              {formatDayHeader(day)}
            </div>
            <div className="flex-1 h-px bg-ink-100" />
          </div>
          <div className="space-y-0">
            {rows.map(({ schedule, task }) => (
              <ScheduleCard key={schedule.id} item={schedule} task={task} />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

function EmptyTimeline({ todayOnly }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center border border-dashed border-ink-200 rounded-2xl bg-white animate-fade-in">
      <div className="h-12 w-12 rounded-2xl bg-ink-100 flex items-center justify-center mb-3">
        <Inbox className="h-6 w-6 text-ink-400" />
      </div>
      <p className="text-sm font-semibold text-ink-800">
        {todayOnly ? 'Nothing scheduled today' : 'No schedule yet'}
      </p>
      <p className="text-xs text-ink-500 mt-1 max-w-xs">
        Once the AI plans a goal with a deadline, scheduled tasks appear here on your timeline.
      </p>
    </div>
  )
}

function formatDayHeader(dayString) {
  const d = new Date(dayString)
  if (Number.isNaN(d.getTime())) return dayString
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const cmp = new Date(d)
  cmp.setHours(0, 0, 0, 0)
  const diff = Math.round((cmp - today) / 86400000)
  if (diff === 0) return 'Today'
  if (diff === 1) return 'Tomorrow'
  if (diff === -1) return 'Yesterday'
  return d.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })
}
