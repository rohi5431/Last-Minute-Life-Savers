import { useMemo } from 'react'
import {
  PieChart, Pie, Cell, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, RadialBarChart, RadialBar, PolarAngleAxis,
} from 'recharts'
import { TrendingUp, Flame, Target, Zap } from 'lucide-react'
import { useTasks } from '../context/TaskContext'

const COLORS = {
  completed: '#10b981',
  pending: '#cbd5e1',
  high: '#ef4444',
  medium: '#f59e0b',
  low: '#0ea5e9',
}

export default function AnalyticsDash() {
  const { analytics } = useTasks()

  if (!analytics) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-24 bg-ink-100 rounded-xl animate-pulse" />
        ))}
      </div>
    )
  }

  const {
    completionRate, productivity, streak, totalTasks, completed, pending, byPriority,
  } = analytics

  const pieData = [
    { name: 'Completed', value: completed, fill: COLORS.completed },
    { name: 'Pending', value: pending, fill: COLORS.pending },
  ].filter((d) => d.value > 0)

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          icon={TrendingUp}
          label="Completion rate"
          value={`${completionRate}%`}
          accent="emerald"
          progress={completionRate}
        />
        <StatCard
          icon={Flame}
          label="Current streak"
          value={`${streak}d`}
          accent="orange"
        />
        <StatCard
          icon={Zap}
          label="Productivity"
          value={`${productivity}`}
          accent="blue"
          progress={productivity}
          suffix="/100"
        />
        <StatCard
          icon={Target}
          label="Tasks"
          value={totalTasks}
          accent="sky"
          sub={`${completed} done · ${pending} left`}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Completion donut */}
        <div className="card p-5">
          <h3 className="text-sm font-semibold text-ink-700 mb-1">Completed vs pending</h3>
          <p className="text-xs text-ink-400 mb-3">Overall task completion</p>
          {totalTasks === 0 ? (
            <EmptyChart label="No tasks yet" />
          ) : (
            <div className="h-44">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    innerRadius={45}
                    outerRadius={70}
                    paddingAngle={3}
                    startAngle={90}
                    endAngle={-270}
                  >
                    {pieData.map((d) => (
                      <Cell key={d.name} fill={d.fill} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      borderRadius: 10,
                      border: '1px solid #eceef3',
                      fontSize: 12,
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
          <div className="flex justify-center gap-4 mt-1">
            <Legend color={COLORS.completed} label={`Completed ${completed}`} />
            <Legend color={COLORS.pending} label={`Pending ${pending}`} />
          </div>
        </div>

        {/* Priority breakdown bar */}
        <div className="card p-5">
          <h3 className="text-sm font-semibold text-ink-700 mb-1">Tasks by priority</h3>
          <p className="text-xs text-ink-400 mb-3">Total and completed per bucket</p>
          {totalTasks === 0 ? (
            <EmptyChart label="No tasks yet" />
          ) : (
            <div className="h-44">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={byPriority} barGap={2}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#eceef3" vertical={false} />
                  <XAxis dataKey="priority" tick={{ fontSize: 11, fill: '#67738a' }} axisLine={false} tickLine={false} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#67738a' }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ borderRadius: 10, border: '1px solid #eceef3', fontSize: 12 }}
                    cursor={{ fill: '#f6f7f9' }}
                  />
                  <Bar dataKey="total" name="Total" radius={[4, 4, 0, 0]} maxBarSize={28}>
                    {byPriority.map((entry) => (
                      <Cell key={entry.priority} fill={COLORS[entry.priority.toLowerCase()]} />
                    ))}
                  </Bar>
                  <Bar dataKey="completed" name="Completed" radius={[4, 4, 0, 0]} maxBarSize={28} fill="#10b981" fillOpacity={0.35} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Productivity radial */}
        <div className="card p-5">
          <h3 className="text-sm font-semibold text-ink-700 mb-1">Productivity score</h3>
          <p className="text-xs text-ink-400 mb-3">Blended completion + momentum</p>
          <div className="h-44 relative">
            <ResponsiveContainer width="100%" height="100%">
              <RadialBarChart
                innerRadius="68%"
                outerRadius="100%"
                data={[{ name: 'score', value: productivity, fill: '#10b981' }]}
                startAngle={90}
                endAngle={-270}
              >
                <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
                <RadialBar background={{ fill: '#eceef3' }} dataKey="value" cornerRadius={10} />
              </RadialBarChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-3xl font-bold text-ink-900">{productivity}</span>
              <span className="text-xs text-ink-400">out of 100</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function StatCard({ icon: Icon, label, value, accent, progress, suffix, sub }) {
  const accents = {
    emerald: 'bg-emerald-50 text-emerald-600',
    orange: 'bg-orange-50 text-orange-600',
    blue: 'bg-blue-50 text-blue-600',
    sky: 'bg-sky-50 text-sky-600',
  }
  const bars = {
    emerald: 'bg-emerald-500',
    orange: 'bg-orange-500',
    blue: 'bg-blue-500',
    sky: 'bg-sky-500',
  }
  return (
    <div className="card p-4">
      <div className="flex items-center justify-between">
        <div className={`h-9 w-9 rounded-xl flex items-center justify-center ${accents[accent]}`}>
          <Icon className="h-5 w-5" />
        </div>
        {typeof progress === 'number' && (
          <span className="text-[10px] font-semibold text-ink-400">{progress}%</span>
        )}
      </div>
      <div className="mt-2.5">
        <div className="text-xl font-bold text-ink-900 tracking-tight">
          {value}
          {suffix && <span className="text-sm font-medium text-ink-400">{suffix}</span>}
        </div>
        <div className="text-xs text-ink-500 mt-0.5">{label}</div>
        {sub && <div className="text-[11px] text-ink-400 mt-0.5">{sub}</div>}
      </div>
      {typeof progress === 'number' && (
        <div className="mt-2.5 h-1.5 bg-ink-100 rounded-full overflow-hidden">
          <div
            className={`h-full ${bars[accent]} rounded-full transition-all`}
            style={{ width: `${Math.min(100, progress)}%` }}
          />
        </div>
      )}
    </div>
  )
}

function Legend({ color, label }) {
  return (
    <div className="flex items-center gap-1.5 text-xs text-ink-500">
      <span className="h-2.5 w-2.5 rounded-sm" style={{ background: color }} />
      {label}
    </div>
  )
}

function EmptyChart({ label }) {
  return (
    <div className="h-44 flex items-center justify-center text-xs text-ink-400">{label}</div>
  )
}
