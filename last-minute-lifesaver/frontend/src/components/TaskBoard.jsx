import { useMemo, useState } from 'react'
import { ListTodo, Inbox, ArrowUpDown } from 'lucide-react'
import TaskCard from './TaskCard'
import { useTasks } from '../context/TaskContext'
import { classNames } from '../utils/format'

const GROUPS = [
  { key: 'priority', label: 'By priority', columns: ['high', 'medium', 'low'] },
  { key: 'status', label: 'By status', columns: ['pending', 'in_progress', 'completed'] },
]

const COLUMN_META = {
  high: { label: 'High priority', accent: 'border-t-red-400', dot: 'bg-red-500' },
  medium: { label: 'Medium', accent: 'border-t-amber-400', dot: 'bg-amber-500' },
  low: { label: 'Low', accent: 'border-t-sky-400', dot: 'bg-sky-500' },
  pending: { label: 'To do', accent: 'border-t-ink-300', dot: 'bg-ink-400' },
  in_progress: { label: 'In progress', accent: 'border-t-blue-400', dot: 'bg-blue-500' },
  completed: { label: 'Done', accent: 'border-t-emerald-400', dot: 'bg-emerald-500' },
}

export default function TaskBoard({ goalId }) {
  const { tasks, loading } = useTasks()
  const [grouping, setGrouping] = useState('priority')

  const filtered = useMemo(
    () => (goalId ? tasks.filter((t) => t.goal_id === goalId) : tasks),
    [tasks, goalId]
  )

  const grouped = useMemo(() => {
    const current = GROUPS.find((g) => g.key === grouping)
    const map = {}
    current.columns.forEach((c) => (map[c] = []))
    filtered.forEach((t) => {
      const key = grouping === 'priority' ? (t.priority || 'medium') : t.status
      if (!map[key]) map[key] = []
      map[key].push(t)
    })
    return { columns: current.columns, map }
  }, [filtered, grouping])

  if (loading && filtered.length === 0) {
    return <BoardSkeleton />
  }

  if (filtered.length === 0) {
    return <EmptyBoard />
  }

  return (
    <div className="animate-slide-up">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <ListTodo className="h-4 w-4 text-ink-500" />
          <span className="text-sm text-ink-500">{filtered.length} tasks</span>
        </div>
        <div className="flex items-center gap-1 bg-ink-100 rounded-lg p-0.5">
          <ArrowUpDown className="h-3.5 w-3.5 text-ink-400 ml-1.5" />
          {GROUPS.map((g) => (
            <button
              key={g.key}
              onClick={() => setGrouping(g.key)}
              className={classNames(
                'text-xs font-medium px-2.5 py-1 rounded-md transition-colors',
                grouping === g.key
                  ? 'bg-white text-ink-900 shadow-sm'
                  : 'text-ink-500 hover:text-ink-700'
              )}
            >
              {g.label.replace('By ', '')}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {grouped.columns.map((col) => {
          const colTasks = grouped.map[col] || []
          const meta = COLUMN_META[col] || { label: col, accent: 'border-t-ink-200', dot: 'bg-ink-400' }
          return (
            <div
              key={col}
              className={classNames('rounded-2xl border border-ink-100 bg-ink-50/50 p-3 border-t-4', meta.accent)}
            >
              <div className="flex items-center justify-between px-1 pb-2.5">
                <div className="flex items-center gap-2">
                  <span className={classNames('h-2 w-2 rounded-full', meta.dot)} />
                  <h3 className="text-sm font-semibold text-ink-700">{meta.label}</h3>
                </div>
                <span className="text-xs text-ink-400 px-1.5 py-0.5 rounded-full bg-white border border-ink-100">
                  {colTasks.length}
                </span>
              </div>
              <div className="space-y-2.5">
                {colTasks.length === 0 ? (
                  <div className="text-xs text-ink-400 text-center py-6 border border-dashed border-ink-200 rounded-xl">
                    No tasks
                  </div>
                ) : (
                  colTasks.map((t) => <TaskCard key={t.id} task={t} />)
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function EmptyBoard() {
  return (
    <div className="flex flex-col items-center justify-center py-14 px-4 text-center border border-dashed border-ink-200 rounded-2xl bg-white animate-fade-in">
      <div className="h-14 w-14 rounded-2xl bg-ink-100 flex items-center justify-center mb-3">
        <Inbox className="h-7 w-7 text-ink-400" />
      </div>
      <p className="text-sm font-semibold text-ink-800">No tasks yet</p>
      <p className="text-xs text-ink-500 mt-1 max-w-xs">
        Create a goal above and the AI will decompose it into prioritized tasks that land here.
      </p>
    </div>
  )
}

function BoardSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {[0, 1, 2].map((c) => (
        <div key={c} className="rounded-2xl border border-ink-100 bg-ink-50/50 p-3">
          <div className="h-4 w-24 bg-ink-100 rounded animate-pulse mb-3" />
          {[0, 1].map((r) => (
            <div key={r} className="h-20 bg-white border border-ink-100 rounded-xl animate-pulse mb-2.5" />
          ))}
        </div>
      ))}
    </div>
  )
}
