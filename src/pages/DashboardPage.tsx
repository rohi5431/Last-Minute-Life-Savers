import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  LayoutDashboard, ListTodo, Calendar, BarChart3, Settings, LogOut,
  Zap, Plus, Sparkles, Clock, Bell, Search, ChevronDown, Zap as Bolt,
  Menu, X, Target, Inbox, CheckCircle2, Brain
} from 'lucide-react'
import AnimatedBackground from '../components/ui/AnimatedBackground'
import GlassCard from '../components/ui/GlassCard'
import TaskCard from '../components/ui/TaskCard'
import Timeline from '../components/ui/Timeline'
import AnalyticsDash from '../components/ui/AnalyticsDash'
import NotificationBell from '../components/ui/NotificationBell'
import AnimatedButton from '../components/ui/AnimatedButton'

const sidebarItems = [
  { icon: LayoutDashboard, label: 'Dashboard', id: 'dashboard' },
  { icon: ListTodo, label: 'Tasks', id: 'tasks' },
  { icon: Calendar, label: 'Schedule', id: 'schedule' },
  { icon: BarChart3, label: 'Analytics', id: 'analytics' },
  { icon: Settings, label: 'Settings', id: 'settings' },
]

const mockTasks = [
  { id: 1, title: 'Research AI models for project', description: 'Compare GPT-4, Claude, and open-source alternatives', priority: 'high' as const, status: 'in_progress' as const, deadline: '2024-01-20', duration: 45 },
  { id: 2, title: 'Write technical documentation', description: 'Create API docs and integration guide', priority: 'medium' as const, status: 'pending' as const, deadline: '2024-01-22', duration: 90 },
  { id: 3, title: 'Design system components', description: 'Build reusable UI components', priority: 'high' as const, status: 'pending' as const, deadline: '2024-01-19', duration: 120 },
  { id: 4, title: 'Code review for PR #42', description: 'Review authentication module changes', priority: 'medium' as const, status: 'completed' as const, deadline: '2024-01-18', duration: 30 },
  { id: 5, title: 'Set up CI/CD pipeline', description: 'Configure GitHub Actions for deployment', priority: 'low' as const, status: 'pending' as const, deadline: '2024-01-25', duration: 60 },
  { id: 6, title: 'Client presentation prep', description: 'Prepare slides for stakeholder meeting', priority: 'high' as const, status: 'in_progress' as const, deadline: '2024-01-19', duration: 45 },
]

const timelineItems = [
  { id: 1, time: '9:00 AM', title: 'Morning standup meeting', status: 'completed' as const, type: 'meeting' as const },
  { id: 2, time: '10:00 AM', title: 'Research AI models', status: 'current' as const, type: 'task' as const },
  { id: 3, time: '11:30 AM', title: 'Design review session', status: 'upcoming' as const, type: 'meeting' as const },
  { id: 4, time: '1:00 PM', title: 'Lunch break', status: 'upcoming' as const, type: 'break' as const },
  { id: 5, time: '2:00 PM', title: 'Write documentation', status: 'upcoming' as const, type: 'task' as const },
  { id: 6, time: '4:00 PM', title: 'Code review session', status: 'upcoming' as const, type: 'task' as const },
]

const notifications = [
  { id: 1, title: 'Task Deadline Approaching', message: 'Research AI models is due in 2 hours', time: '2 min ago', read: false, type: 'deadline' as const },
  { id: 2, title: 'New Task Assigned', message: 'Design system components has been added', time: '1 hour ago', read: false, type: 'reminder' as const },
  { id: 3, title: 'Achievement Unlocked', message: 'Completed 10 tasks this week!', time: '3 hours ago', read: true, type: 'achievement' as const },
]

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [goalInput, setGoalInput] = useState('')
  const [tasks, setTasks] = useState(mockTasks)

  const handleStatusChange = (id: number, status: string) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, status: status as typeof t.status } : t))
  }

  const handleMarkRead = (id: number) => {
    // In real app, this would update state
  }

  const handleMarkAllRead = () => {
    // In real app, this would update all notifications
  }

  return (
    <div className="relative min-h-screen overflow-hidden">
      <AnimatedBackground />

      <div className="flex">
        {/* Mobile Sidebar Overlay */}
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <motion.aside
          initial={false}
          animate={{ x: sidebarOpen ? 0 : '-100%' }}
          className={`fixed lg:sticky top-0 left-0 z-50 h-screen w-64 bg-[#0f0f15] border-r border-white/[0.05] flex flex-col transition-transform lg:translate-x-0`}
        >
          {/* Logo */}
          <div className="h-16 flex items-center justify-between px-5 border-b border-white/[0.05]">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center">
                <Zap className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-white">LifeSaver</span>
            </div>
            <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-slate-400">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-3 space-y-1">
            {sidebarItems.map((item) => (
              <motion.button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id)
                  setSidebarOpen(false)
                }}
                whileHover={{ x: 4 }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${
                  activeTab === item.id
                    ? 'bg-violet-500/10 text-violet-400 border border-violet-500/20'
                    : 'text-slate-400 hover:text-white hover:bg-white/[0.03]'
                }`}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </motion.button>
            ))}
          </nav>

          {/* AI Card */}
          <div className="p-3">
            <GlassCard hover={false}>
              <div className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Brain className="w-4 h-4 text-violet-400" />
                  <span className="text-sm font-medium text-white">AI Assistant</span>
                </div>
                <p className="text-xs text-slate-400 mb-3">
                  Smart suggestions based on your patterns
                </p>
                <button className="w-full text-xs px-3 py-2 rounded-lg bg-violet-500/20 text-violet-400 hover:bg-violet-500/30 transition-colors">
                  Get Suggestions
                </button>
              </div>
            </GlassCard>
          </div>

          {/* User */}
          <div className="p-3 border-t border-white/[0.05]">
            <div className="flex items-center gap-3 px-3 py-2">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center text-white text-sm font-bold">
                JD
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-white truncate">John Doe</div>
                <div className="text-xs text-slate-500 truncate">john@example.com</div>
              </div>
              <button className="p-1.5 rounded-lg hover:bg-white/[0.05] text-slate-400 hover:text-white transition-colors">
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.aside>

        {/* Main Content */}
        <div className="flex-1 min-h-screen">
          {/* Header */}
          <header className="sticky top-0 z-30 h-16 bg-[#0a0a0f]/80 backdrop-blur-xl border-b border-white/[0.05]">
            <div className="flex items-center gap-4 px-6 h-full">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 -ml-2 rounded-lg text-slate-400 hover:text-white"
              >
                <Menu className="w-5 h-5" />
              </button>

              <div className="flex-1">
                <div className="relative max-w-xl">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    placeholder="Search tasks, goals, schedules..."
                    className="w-full pl-10 pr-4 py-2 rounded-xl bg-white/[0.03] border border-white/[0.08] text-white text-sm placeholder:text-slate-500 focus:outline-none focus:border-violet-500/50"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button className="p-2 rounded-xl bg-white/[0.03] border border-white/[0.08] hover:bg-white/[0.05] transition-colors">
                  <Bell className="w-5 h-5 text-slate-400" />
                </button>
                <NotificationBell
                  notifications={notifications}
                  onMarkRead={handleMarkRead}
                  onMarkAllRead={handleMarkAllRead}
                />
              </div>
            </div>
          </header>

          {/* Page Content */}
          <main className="p-4 lg:p-8">
            {activeTab === 'dashboard' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                {/* Goal Input */}
                <GlassCard>
                  <div className="p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <Target className="w-5 h-5 text-violet-400" />
                      <h2 className="text-lg font-semibold text-white">What do you want to accomplish?</h2>
                    </div>
                    <div className="flex gap-3">
                      <input
                        type="text"
                        value={goalInput}
                        onChange={(e) => setGoalInput(e.target.value)}
                        placeholder="e.g., Complete the project presentation before Friday"
                        className="flex-1 px-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.08] text-white placeholder:text-slate-500 focus:outline-none focus:border-violet-500/50"
                      />
                      <AnimatedButton variant="gradient" icon={<Sparkles className="w-4 h-4" />}>
                        AI Plan
                      </AnimatedButton>
                    </div>
                  </div>
                </GlassCard>

                {/* Stats */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { label: 'Total Tasks', value: tasks.length, icon: Inbox, color: 'text-violet-400' },
                    { label: 'In Progress', value: tasks.filter(t => t.status === 'in_progress').length, icon: Clock, color: 'text-blue-400' },
                    { label: 'Completed', value: tasks.filter(t => t.status === 'completed').length, icon: CheckCircle2, color: 'text-emerald-400' },
                    { label: 'High Priority', value: tasks.filter(t => t.priority === 'high').length, icon: Bolt, color: 'text-amber-400' },
                  ].map((stat, i) => (
                    <GlassCard key={i}>
                      <div className="p-4 flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl bg-white/[0.05] flex items-center justify-center`}>
                          <stat.icon className={`w-5 h-5 ${stat.color}`} />
                        </div>
                        <div>
                          <div className="text-xl font-bold text-white">{stat.value}</div>
                          <div className="text-xs text-slate-400">{stat.label}</div>
                        </div>
                      </div>
                    </GlassCard>
                  ))}
                </div>

                {/* Task Board & Timeline */}
                <div className="grid lg:grid-cols-3 gap-6">
                  {/* Task Board */}
                  <div className="lg:col-span-2 space-y-4">
                    <div className="flex items-center justify-between">
                      <h2 className="text-lg font-semibold text-white">Task Board</h2>
                      <AnimatedButton variant="secondary" size="sm" icon={<Plus className="w-4 h-4" />} iconPosition="left">
                        Add Task
                      </AnimatedButton>
                    </div>

                    <div className="grid sm:grid-cols-3 gap-4">
                      {['pending', 'in_progress', 'completed'].map((status) => (
                        <div key={status} className="space-y-3">
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${
                              status === 'pending' ? 'bg-slate-400' :
                              status === 'in_progress' ? 'bg-blue-400' : 'bg-emerald-400'
                            }`} />
                            <span className="text-sm font-medium text-slate-400">
                              {status === 'pending' ? 'To Do' : status === 'in_progress' ? 'In Progress' : 'Done'}
                            </span>
                            <span className="text-xs text-slate-500 px-1.5 py-0.5 rounded-full bg-white/[0.05]">
                              {tasks.filter(t => t.status === status).length}
                            </span>
                          </div>
                          <div className="space-y-3">
                            {tasks.filter(t => t.status === status).map((task) => (
                              <TaskCard
                                key={task.id}
                                task={task}
                                onStatusChange={handleStatusChange}
                              />
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Timeline */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-lg font-semibold text-white">Today</h2>
                      <span className="text-xs text-slate-500">{new Date().toLocaleDateString()}</span>
                    </div>
                    <GlassCard hover={false}>
                      <div className="p-4">
                        <Timeline items={timelineItems} />
                      </div>
                    </GlassCard>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'tasks' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-4"
              >
                <div className="flex items-center justify-between">
                  <h1 className="text-2xl font-bold text-white">All Tasks</h1>
                  <AnimatedButton variant="gradient" size="sm" icon={<Plus className="w-4 h-4" />} iconPosition="left">
                    Add Task
                  </AnimatedButton>
                </div>
                <div className="grid gap-3">
                  {tasks.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onStatusChange={handleStatusChange}
                    />
                  ))}
                </div>
              </motion.div>
            )}

            {activeTab === 'schedule' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <h1 className="text-2xl font-bold text-white mb-6">Schedule</h1>
                <GlassCard hover={false}>
                  <div className="p-6">
                    <div className="text-center text-slate-400 py-12">
                      Calendar integration coming soon
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            )}

            {activeTab === 'analytics' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <h1 className="text-2xl font-bold text-white mb-6">Analytics</h1>
                <AnalyticsDash />
              </motion.div>
            )}

            {activeTab === 'settings' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <h1 className="text-2xl font-bold text-white mb-6">Settings</h1>
                <GlassCard hover={false}>
                  <div className="p-6">
                    <div className="text-center text-slate-400 py-12">
                      Settings panel coming soon
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            )}
          </main>
        </div>
      </div>
    </div>
  )
}
