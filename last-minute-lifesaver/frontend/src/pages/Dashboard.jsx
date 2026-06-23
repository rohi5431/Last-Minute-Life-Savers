import { Sparkles } from 'lucide-react'
import GoalInput from '../components/GoalInput'
import TaskBoard from '../components/TaskBoard'
import Timeline from '../components/Timeline'
import AnalyticsDash from '../components/AnalyticsDash'
import { useTasks } from '../context/TaskContext'

export default function Dashboard() {
  const { loading, error } = useTasks()

  return (
    <div className="space-y-6">
      {error && (
        <div className="text-sm text-red-700 bg-red-50 border border-red-100 rounded-xl px-3.5 py-2.5">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-6">
          <GoalInput />
          <section>
            <SectionHeader
              icon={<Sparkles className="h-4 w-4 text-emerald-500" />}
              title="Your task board"
              subtitle="AI-decomposed, prioritized, and ready to execute."
            />
            <TaskBoard />
          </section>
        </div>

        <div className="space-y-6">
          <section className="card p-5">
            <SectionHeader
              icon={<Sparkles className="h-4 w-4 text-blue-500" />}
              title="Live updates"
              subtitle="WebSocket-connected"
              compact
            />
            <AnalyticsDash />
          </section>
        </div>
      </div>

      <section>
        <SectionHeader
          icon={<Sparkles className="h-4 w-4 text-emerald-500" />}
          title="Today's timeline"
          subtitle="A focused view of what's scheduled today."
        />
        <div className="card p-5">
          <Timeline todayOnly />
        </div>
      </section>
    </div>
  )
}

function SectionHeader({ icon, title, subtitle, compact }) {
  return (
    <div className={compact ? 'mb-3' : 'mb-4'}>
      <div className="flex items-center gap-2">
        {icon}
        <h2 className="text-base font-semibold text-ink-900 tracking-tight">{title}</h2>
      </div>
      {subtitle && <p className="text-sm text-ink-500 mt-0.5">{subtitle}</p>}
    </div>
  )
}
