import { motion } from 'framer-motion'
import { AreaChart, Area, PieChart, Pie, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { TrendingUp, Clock, Target, Zap } from 'lucide-react'
import GlassCard from './GlassCard'
import { useTasks } from '../../context/TaskContext'

export default function AnalyticsDash() {
  const { tasks, analytics: analyticsData } = useTasks()

  // Calculate real metrics
  const completionRate = analyticsData?.completionRate ?? 0
  const focusMinutes = tasks.filter(t => t.status === 'completed').reduce((sum, t) => sum + (t.duration || 0), 0)
  const focusHours = (focusMinutes / 60).toFixed(1) + 'h'
  const productivity = analyticsData?.productivity ?? 0
  const streak = analyticsData?.streak ?? 0

  const stats = [
    { icon: Target, label: 'Completion Rate', value: `${completionRate}%`, trend: completionRate > 50 ? '+5%' : 'Keep it up!', color: 'text-emerald-400' },
    { icon: Clock, label: 'Focus Time', value: focusHours, trend: focusMinutes > 0 ? 'Active' : 'No time yet', color: 'text-cyan-400' },
    { icon: TrendingUp, label: 'Productivity', value: `${productivity}/100`, trend: `Score`, color: 'text-violet-400' },
    { icon: Zap, label: 'Streak', value: `${streak} days`, trend: streak > 0 ? 'Active!' : 'Start today!', color: 'text-amber-400' },
  ]

  // Calculate weekly activity dynamically
  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const areaData = daysOfWeek.map((dayName, idx) => {
    const completedOnDay = tasks.filter(t => {
      if (!t.completed_at) return false
      const d = new Date(t.completed_at)
      return d.getDay() === idx
    })
    const mins = completedOnDay.reduce((sum, t) => sum + (t.duration || 0), 0)
    return {
      name: dayName,
      tasks: completedOnDay.length,
      hours: Math.round((mins / 60) * 10) / 10
    }
  })

  // Calculate task distribution by priority
  const highTasks = tasks.filter(t => t.priority === 'high').length
  const mediumTasks = tasks.filter(t => t.priority === 'medium').length
  const lowTasks = tasks.filter(t => t.priority === 'low').length
  const totalWithPriority = highTasks + mediumTasks + lowTasks

  const priorityData = [
    { name: 'High', value: totalWithPriority > 0 ? Math.round((highTasks / totalWithPriority) * 100) : 0, color: '#ef4444' },
    { name: 'Medium', value: totalWithPriority > 0 ? Math.round((mediumTasks / totalWithPriority) * 100) : 0, color: '#f59e0b' },
    { name: 'Low', value: totalWithPriority > 0 ? Math.round((lowTasks / totalWithPriority) * 100) : 0, color: '#06b6d4' },
  ]
  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <GlassCard>
              <div className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-10 h-10 rounded-xl bg-white/[0.05] flex items-center justify-center`}>
                    <stat.icon className={`w-5 h-5 ${stat.color}`} />
                  </div>
                  <span className="text-xs text-emerald-400">{stat.trend}</span>
                </div>
                <div className="text-2xl font-bold text-white">{stat.value}</div>
                <div className="text-sm text-slate-400 mt-1">{stat.label}</div>
              </div>
            </GlassCard>
          </motion.div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Area Chart */}
        <GlassCard>
          <div className="p-6">
            <h3 className="text-lg font-semibold text-white mb-6">Weekly Activity</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={areaData}>
                  <defs>
                    <linearGradient id="colorTasks" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorHours" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="name" stroke="#475569" fontSize={12} />
                  <YAxis stroke="#475569" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(15, 15, 20, 0.9)',
                      border: '1px solid rgba(139, 92, 246, 0.2)',
                      borderRadius: '12px',
                    }}
                  />
                  <Area type="monotone" dataKey="tasks" stroke="#8b5cf6" fill="url(#colorTasks)" strokeWidth={2} />
                  <Area type="monotone" dataKey="hours" stroke="#06b6d4" fill="url(#colorHours)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </GlassCard>

        {/* Priority & Stats */}
        <GlassCard>
          <div className="p-6">
            <h3 className="text-lg font-semibold text-white mb-6">Task Distribution</h3>
            <div className="flex items-center gap-8">
              <div className="h-48 w-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={priorityData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {priorityData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-4">
                {priorityData.map((item) => (
                  <div key={item.name} className="flex items-center gap-3">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-slate-300">{item.name}</span>
                    <span className="text-white font-medium ml-auto">{item.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  )
}
