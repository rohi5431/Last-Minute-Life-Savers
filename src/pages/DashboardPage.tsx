import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, ListTodo, Calendar, BarChart3, Settings, LogOut,
  Zap, Plus, Sparkles, Clock, Bell, Search, ChevronDown, Zap as Bolt,
  Menu, X, Target, Inbox, CheckCircle2, Brain, RefreshCw, Loader2,
  ExternalLink, CalendarOff, AlertTriangle, AlertCircle, MapPin
} from 'lucide-react'
import AnimatedBackground from '../components/ui/AnimatedBackground'
import GlassCard from '../components/ui/GlassCard'
import TaskCard from '../components/ui/TaskCard'
import Timeline from '../components/ui/Timeline'
import AnalyticsDash from '../components/ui/AnalyticsDash'
import NotificationBell from '../components/ui/NotificationBell'
import AnimatedButton from '../components/ui/AnimatedButton'
import { useAuth } from '../context/AuthContext'
import { useTasks } from '../context/TaskContext'
import { useGoalPlan } from '../hooks/useGoals'
import useWebSocket from '../hooks/useWebSocket'
import { calendar as apiCalendar } from '../services/api'

const sidebarItems = [
  { icon: LayoutDashboard, label: 'Dashboard', id: 'dashboard' },
  { icon: ListTodo, label: 'Tasks', id: 'tasks' },
  { icon: Calendar, label: 'Schedule', id: 'schedule' },
  { icon: BarChart3, label: 'Analytics', id: 'analytics' },
  { icon: Settings, label: 'Settings', id: 'settings' },
]

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024)
    }
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Auth Context
  const { email, logout } = useAuth()

  // Task Context
  const {
    goals,
    tasks,
    schedules,
    notifications: apiNotificationsList,
    analytics: analyticsData,
    loading: tasksLoading,
    error: tasksError,
    refreshAll,
    refreshTasks,
    addGoal,
    updateTask,
    markNotificationRead,
    handleLiveEvent
  } = useTasks()

  // WebSocket Live Connection
  const { connected: wsConnected } = useWebSocket(handleLiveEvent)

  // Goal AI Planning state
  const { loading: planLoading, plan, error: planError, fetchUntilReady, reset: resetPlan } = useGoalPlan()
  const [goalTitle, setGoalTitle] = useState('')
  const [goalDesc, setGoalDesc] = useState('')
  const [goalDeadline, setGoalDeadline] = useState('')
  const [goalSubmitting, setGoalSubmitting] = useState(false)
  const [goalSuccess, setGoalSuccess] = useState<string | null>(null)

  // Google Calendar Integration states
  const [calendarStatus, setCalendarStatus] = useState<any>(null)
  const [calendarEvents, setCalendarEvents] = useState<any[]>([])
  const [calendarConflicts, setCalendarConflicts] = useState<any[]>([])
  const [calendarLoading, setCalendarLoading] = useState(true)
  const [calendarSyncing, setCalendarSyncing] = useState(false)
  const [calendarOptimizing, setCalendarOptimizing] = useState(false)
  const [calendarFeedback, setCalendarFeedback] = useState<{ type: 'success' | 'warning' | 'error'; text: string } | null>(null)
  const [calendarError, setCalendarError] = useState<string | null>(null)

  // Settings tab states
  const [settingsSyncing, setSettingsSyncing] = useState(false)
  const [settingsSynced, setSettingsSynced] = useState(false)
  const [settingsError, setSettingsError] = useState<string | null>(null)

  // --- Calendar Load ---
  const loadCalendarData = useCallback(async () => {
    setCalendarLoading(true)
    setCalendarError(null)
    try {
      const [s, e, c] = await Promise.all([
        apiCalendar.status().catch(() => ({ connected: false, event_count: 0 })),
        apiCalendar.listEvents().catch(() => []),
        apiCalendar.listConflicts().catch(() => []),
      ])
      setCalendarStatus(s)
      setCalendarEvents(e)
      setCalendarConflicts(c)
    } catch (err: any) {
      setCalendarError(err.friendlyMessage || 'Failed to load calendar data')
    } finally {
      setCalendarLoading(false)
    }
  }, [])

  useEffect(() => {
    if (activeTab === 'schedule') {
      loadCalendarData()
    }
  }, [activeTab, loadCalendarData])

  // Pick up Google Calendar OAuth Redirect params
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get('oauth_success')) {
      setCalendarFeedback({ type: 'success', text: 'Google Calendar connected successfully.' })
      loadCalendarData()
    } else if (params.get('oauth_error')) {
      setCalendarError(`Google authorization failed: ${params.get('oauth_error')}`)
    }
    if (params.get('oauth_success') || params.get('oauth_error')) {
      window.history.replaceState({}, '', window.location.pathname)
    }
  }, [loadCalendarData])

  // --- Notifications Mapping ---
  const mappedNotifications = apiNotificationsList.map(n => ({
    id: n.id,
    title: n.title,
    message: n.message,
    time: new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    read: n.is_read,
    type: n.type || 'reminder'
  }))

  const handleMarkRead = async (id: number) => {
    await markNotificationRead(id)
  }

  const handleMarkAllRead = async () => {
    const unread = apiNotificationsList.filter(n => !n.is_read)
    for (const n of unread) {
      await markNotificationRead(n.id)
    }
  }

  // --- Status Change handler ---
  const handleStatusChange = async (id: number, status: string) => {
    await updateTask(id, { status: status as any })
  }

  // --- Goal Submission ---
  const handleGoalSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!goalTitle.trim()) return

    setGoalSubmitting(true)
    setGoalSuccess(null)
    resetPlan()
    try {
      const payload = {
        title: goalTitle.trim(),
        description: goalDesc.trim() || undefined,
        deadline: goalDeadline ? new Date(goalDeadline).toISOString() : undefined,
      }
      const goal = await addGoal(payload)
      setGoalSuccess(`Goal created. AI is planning your tasks...`)
      fetchUntilReady(goal.id)
    } catch (err: any) {
      setGoalSuccess(null)
      resetPlan()
    } finally {
      setGoalSubmitting(false)
    }
  }

  const handleLoadTasks = async () => {
    await refreshTasks()
    setGoalSuccess(null)
    resetPlan()
    setGoalTitle('')
    setGoalDesc('')
    setGoalDeadline('')
  }

  // --- Google Calendar handlers ---
  const handleConnectCalendar = async () => {
    setCalendarError(null)
    setCalendarFeedback(null)
    try {
      const { authorization_url } = await apiCalendar.startOAuth()
      window.location.href = authorization_url
    } catch (err: any) {
      setCalendarError(err.friendlyMessage || 'Could not start Google OAuth.')
    }
  }

  const handleDisconnectCalendar = async () => {
    setCalendarSyncing(true)
    try {
      await apiCalendar.disconnect()
      setCalendarFeedback({ type: 'success', text: 'Calendar disconnected.' })
      await loadCalendarData()
    } catch (err: any) {
      setCalendarError(err.friendlyMessage || 'Disconnect failed.')
    } finally {
      setCalendarSyncing(false)
    }
  }

  const handleSyncCalendar = async () => {
    setCalendarSyncing(true)
    setCalendarError(null)
    setCalendarFeedback(null)
    try {
      const result = await apiCalendar.sync()
      setCalendarFeedback({
        type: 'success',
        text: result.message || `Imported ${result.imported} event(s).`,
      })
      if (result.conflicts?.length) {
        setCalendarFeedback({
          type: 'warning',
          text: `Imported ${result.imported} events. Found ${result.conflicts.length} conflict(s).`,
        })
      }
      await Promise.all([loadCalendarData(), refreshAll()])
    } catch (err: any) {
      setCalendarError(err.friendlyMessage || 'Calendar sync failed.')
    } finally {
      setCalendarSyncing(false)
    }
  }

  const handleOptimizeCalendar = async () => {
    setCalendarOptimizing(true)
    setCalendarError(null)
    setCalendarFeedback(null)
    try {
      const result = await apiCalendar.optimize()
      setCalendarFeedback({
        type: 'success',
        text: result.message || 'Schedule optimized.',
      })
      await Promise.all([loadCalendarData(), refreshAll()])
    } catch (err: any) {
      setCalendarError(err.friendlyMessage || 'Optimization failed.')
    } finally {
      setCalendarOptimizing(false)
    }
  }

  // --- Settings sync ---
  const handleSettingsSync = async () => {
    setSettingsSyncing(true)
    setSettingsError(null)
    setSettingsSynced(false)
    try {
      await refreshAll()
      setSettingsSynced(true)
      setTimeout(() => setSettingsSynced(false), 2500)
    } catch (err: any) {
      setSettingsError(err.friendlyMessage || 'Refresh failed')
    } finally {
      setSettingsSyncing(false)
    }
  }

  // --- Timeline items mapping ---
  const mappedTimelineItems = schedules
    .map((s, idx) => {
      const start = new Date(s.start_at)
      const timeStr = start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      const task = tasks.find(t => t.id === s.task_id)
      const isCompleted = task?.status === 'completed'
      const now = new Date()
      const isCurrent = !isCompleted && now >= new Date(s.start_at) && now <= new Date(s.end_at)
      return {
        id: s.id || idx,
        time: timeStr,
        title: s.task_title,
        status: (isCompleted ? 'completed' : isCurrent ? 'current' : 'upcoming') as 'completed' | 'current' | 'upcoming',
        type: 'task' as const,
        startAt: start
      }
    })
    .sort((a, b) => a.startAt.getTime() - b.startAt.getTime())

  const todayStart = new Date()
  todayStart.setHours(0,0,0,0)
  const todayEnd = new Date()
  todayEnd.setHours(23,59,59,999)
  const todayTimelineItems = mappedTimelineItems.filter(item => {
    return item.startAt >= todayStart && item.startAt <= todayEnd
  })

  // --- Clarification / Planning ---
  const clarification = plan?.clarification
  const needsClarification = clarification?.needs_clarification
  const planTasks = plan?.plan?.tasks || []
  const planReady = plan && !needsClarification && planTasks.length > 0

  return (
    <div className="relative h-screen w-screen overflow-hidden flex bg-[#0a0a0f]">
      <AnimatedBackground />
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
          animate={{ x: isMobile ? (sidebarOpen ? 0 : '-100%') : 0 }}
          className="fixed lg:sticky top-0 left-0 z-50 h-full w-64 bg-[#0f0f15] border-r border-white/[0.05] flex flex-col flex-shrink-0"
        >
          {/* Logo */}
          <div className="h-16 flex items-center justify-between px-5 border-b border-white/[0.05]">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center animate-pulse">
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

          {/* Connection Indicator */}
          <div className="px-5 py-3 border-t border-white/[0.05] flex items-center gap-2">
            <span className={`h-2 w-2 rounded-full ${wsConnected ? 'bg-emerald-500' : 'bg-amber-500 animate-ping'}`} />
            <span className="text-xs text-slate-400">
              {wsConnected ? 'WebSocket Live Connected' : 'Connecting to Live Feed...'}
            </span>
          </div>

          {/* User Profile */}
          <div className="p-3 border-t border-white/[0.05]">
            <div className="flex items-center gap-3 px-3 py-2">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center text-white text-sm font-bold">
                {(email || 'U').slice(0, 2).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-white truncate">
                  {email ? email.split('@')[0] : 'User'}
                </div>
                <div className="text-xs text-slate-500 truncate">{email || 'lmls@user.app'}</div>
              </div>
              <button
                onClick={logout}
                className="p-1.5 rounded-lg hover:bg-white/[0.05] text-slate-400 hover:text-white transition-colors"
                title="Sign out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.aside>

        {/* Main Content */}
        <div className="flex-1 h-full flex flex-col overflow-hidden relative z-10">
          {/* Header */}
          <header className="h-16 flex-shrink-0 bg-[#0a0a0f]/80 backdrop-blur-xl border-b border-white/[0.05] z-30">
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
                <NotificationBell
                  notifications={mappedNotifications}
                  onMarkRead={handleMarkRead}
                  onMarkAllRead={handleMarkAllRead}
                />
              </div>
            </div>
          </header>

          {/* Page Content */}
          <main className="flex-1 overflow-y-auto p-4 lg:p-8">
            {tasksError && (
              <div className="text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-xl px-4 py-3 mb-6">
                {tasksError}
              </div>
            )}

            {activeTab === 'dashboard' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                {/* Goal Input form */}
                <GlassCard>
                  <div className="p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <Target className="w-5 h-5 text-violet-400" />
                      <h2 className="text-lg font-semibold text-white">Turn panic into a plan. Enter your goal and deadline:</h2>
                    </div>
                    <form onSubmit={handleGoalSubmit} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input
                          type="text"
                          value={goalTitle}
                          onChange={(e) => setGoalTitle(e.target.value)}
                          placeholder="e.g., Complete the project presentation"
                          required
                          className="px-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.08] text-white placeholder:text-slate-500 focus:outline-none focus:border-violet-500/50"
                        />
                        <input
                          type="datetime-local"
                          value={goalDeadline}
                          onChange={(e) => setGoalDeadline(e.target.value)}
                          className="px-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.08] text-white placeholder:text-slate-500 focus:outline-none focus:border-violet-500/50"
                        />
                      </div>
                      <div className="flex gap-3">
                        <input
                          type="text"
                          value={goalDesc}
                          onChange={(e) => setGoalDesc(e.target.value)}
                          placeholder="Goal description/scope notes (optional)"
                          className="flex-1 px-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.08] text-white placeholder:text-slate-500 focus:outline-none focus:border-violet-500/50"
                        />
                        <AnimatedButton
                          type="submit"
                          variant="gradient"
                          icon={goalSubmitting || planLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                          disabled={goalSubmitting || planLoading || !goalTitle.trim()}
                        >
                          {goalSubmitting || planLoading ? 'Planning...' : 'AI Plan'}
                        </AnimatedButton>
                      </div>
                    </form>

                    {/* Planning Feedback */}
                    {goalSuccess && (
                      <div className="mt-4 flex items-center gap-2.5 text-sm text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 rounded-xl px-4 py-3 animate-fade-in">
                        <Loader2 className="h-4 w-4 animate-spin shrink-0" />
                        <span>{goalSuccess}</span>
                      </div>
                    )}

                    {planError && (
                      <div className="mt-4 flex items-start gap-2.5 text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-xl px-4 py-3 animate-fade-in">
                        <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                        <div>
                          <p className="font-semibold">Plan generation failed</p>
                          <p className="text-red-300/80">{planError}</p>
                        </div>
                      </div>
                    )}

                    {needsClarification && (
                      <div className="mt-4 rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 animate-fade-in space-y-2">
                        <div className="flex items-center gap-2 text-amber-400">
                          <Brain className="h-4 w-4" />
                          <span className="text-sm font-semibold">AI Clarification Needed</span>
                        </div>
                        <p className="text-sm text-slate-300">
                          {clarification.summary || clarification.message || 'Please provide more details on the following questions:'}
                        </p>
                        <ul className="list-decimal pl-5 space-y-1 text-slate-400 text-sm">
                          {(clarification.questions || clarification.clarifying_questions || []).map((q: any, i: number) => (
                            <li key={i}>{typeof q === 'string' ? q : q.question || q.text}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {planReady && (
                      <div className="mt-4 rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4 animate-fade-in flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-emerald-400">
                            <CheckCircle2 className="h-4 w-4" />
                            <span className="text-sm font-semibold">AI Decomposition Complete!</span>
                          </div>
                          <p className="text-xs text-slate-300">
                            Generated {planTasks.length} task{planTasks.length === 1 ? '' : 's'} scheduled around your availability.
                          </p>
                        </div>
                        <AnimatedButton variant="secondary" size="sm" icon={<RefreshCw className="w-3.5 h-3.5" />} onClick={handleLoadTasks}>
                          Load Tasks
                        </AnimatedButton>
                      </div>
                    )}
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
                            {tasks.filter(t => t.status === status).length === 0 && (
                              <div className="text-center py-8 text-xs text-slate-600 border border-dashed border-white/[0.05] rounded-xl">
                                Empty
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Today Timeline */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-lg font-semibold text-white">Today</h2>
                      <span className="text-xs text-slate-500">{new Date().toLocaleDateString()}</span>
                    </div>
                    <GlassCard hover={false}>
                      <div className="p-4">
                        {todayTimelineItems.length === 0 ? (
                          <div className="text-center py-12 text-slate-500 text-sm">
                            No tasks scheduled for today
                          </div>
                        ) : (
                          <Timeline items={todayTimelineItems} />
                        )}
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
                </div>
                {tasks.length === 0 ? (
                  <div className="text-center py-20 text-slate-500 border border-dashed border-white/[0.08] rounded-2xl">
                    No tasks found. Create a goal on the dashboard to generate tasks!
                  </div>
                ) : (
                  <div className="grid gap-3">
                    {tasks.map((task) => (
                      <TaskCard
                        key={task.id}
                        task={task}
                        onStatusChange={handleStatusChange}
                      />
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'schedule' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-6"
              >
                <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
                  <div>
                    <h1 className="text-2xl font-bold text-white">Schedule</h1>
                    <p className="text-sm text-slate-400 mt-1">
                      Manage Google Calendar integrations, audit conflicts, and optimize schedules.
                    </p>
                  </div>
                  {calendarLoading ? (
                    <div className="h-10 w-36 bg-white/[0.05] rounded-xl animate-pulse" />
                  ) : calendarStatus?.connected ? (
                    <div className="flex items-center gap-2">
                      <button onClick={handleSyncCalendar} disabled={calendarSyncing} className="px-4 py-2 text-xs font-semibold rounded-xl bg-white/[0.05] border border-white/[0.08] text-white hover:bg-white/[0.1] transition-all flex items-center gap-1.5">
                        {calendarSyncing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
                        Sync Calendar
                      </button>
                      <button onClick={handleDisconnectCalendar} disabled={calendarSyncing} className="px-4 py-2 text-xs font-semibold rounded-xl text-red-400 bg-red-400/5 hover:bg-red-400/10 border border-red-400/10 transition-all flex items-center gap-1.5">
                        <CalendarOff className="h-3.5 w-3.5" />
                        Disconnect
                      </button>
                    </div>
                  ) : (
                    <button onClick={handleConnectCalendar} className="px-4 py-2 text-xs font-semibold rounded-xl bg-gradient-to-r from-violet-500 to-cyan-500 text-white hover:opacity-90 transition-all flex items-center gap-1.5">
                      <ExternalLink className="h-3.5 w-3.5" />
                      Connect Google Calendar
                    </button>
                  )}
                </div>

                {calendarFeedback && (
                  <div className={`flex items-start gap-2 text-sm rounded-xl px-4 py-3 animate-fade-in ${
                    calendarFeedback.type === 'success' ? 'text-emerald-400 bg-emerald-400/10 border border-emerald-400/20' :
                    calendarFeedback.type === 'warning' ? 'text-amber-400 bg-amber-400/10 border border-amber-400/20' :
                    'text-red-400 bg-red-400/10 border border-red-400/20'
                  }`}>
                    {calendarFeedback.type === 'success' ? <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0" /> : <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />}
                    <span>{calendarFeedback.text}</span>
                  </div>
                )}

                {calendarError && (
                  <div className="flex items-start gap-2 text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-xl px-4 py-3 animate-fade-in">
                    <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                    <span>{calendarError}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Connection Card */}
                  <GlassCard>
                    <div className="p-5 space-y-4">
                      <h2 className="text-sm font-semibold text-white">Calendar Connection</h2>
                      {calendarLoading ? (
                        <div className="space-y-2 animate-pulse">
                          <div className="h-4 bg-white/5 rounded w-2/3" />
                          <div className="h-4 bg-white/5 rounded w-1/2" />
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <span className={`h-2.5 w-2.5 rounded-full ${calendarStatus?.connected ? 'bg-emerald-500' : 'bg-slate-600'}`} />
                            <span className="text-sm font-medium text-slate-200">
                              {calendarStatus?.connected ? 'Linked to Google Account' : 'Not connected'}
                            </span>
                          </div>
                          <dl className="space-y-2 text-xs border-t border-white/[0.05] pt-3 text-slate-400">
                            <div className="flex justify-between">
                              <dt>Imported events</dt>
                              <dd className="text-white font-medium">{calendarStatus?.event_count ?? 0}</dd>
                            </div>
                            <div className="flex justify-between">
                              <dt>Last synced</dt>
                              <dd className="text-white font-medium">
                                {calendarStatus?.last_synced_at ? new Date(calendarStatus.last_synced_at).toLocaleString() : 'Never'}
                              </dd>
                            </div>
                          </dl>
                        </div>
                      )}
                      {calendarStatus?.connected && (
                        <AnimatedButton
                          variant="gradient"
                          className="w-full"
                          icon={calendarOptimizing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                          onClick={handleOptimizeCalendar}
                          disabled={calendarOptimizing}
                        >
                          {calendarOptimizing ? 'Rescheduling...' : 'Optimize Schedule'}
                        </AnimatedButton>
                      )}
                    </div>
                  </GlassCard>

                  {/* Calendar Conflicts */}
                  <div className="lg:col-span-2">
                    <GlassCard>
                      <div className="p-5 space-y-4">
                        <div className="flex items-center justify-between">
                          <h2 className="text-sm font-semibold text-white">Schedule Conflicts</h2>
                          {calendarConflicts.length > 0 && (
                            <span className="text-xs px-2.5 py-0.5 rounded-full bg-red-500/10 text-red-400 border border-red-500/20">
                              {calendarConflicts.length} Conflict{calendarConflicts.length > 1 ? 's' : ''}
                            </span>
                          )}
                        </div>
                        {calendarLoading ? (
                          <div className="space-y-3 animate-pulse">
                            <div className="h-14 bg-white/5 rounded-xl" />
                            <div className="h-14 bg-white/5 rounded-xl" />
                          </div>
                        ) : calendarConflicts.length === 0 ? (
                          <div className="flex flex-col items-center justify-center py-8 text-center border border-dashed border-white/[0.05] rounded-xl">
                            <CheckCircle2 className="h-7 w-7 text-emerald-400 mb-2" />
                            <p className="text-sm font-medium text-slate-200">No conflicts detected</p>
                            <p className="text-xs text-slate-500 mt-1">Your schedules fit nicely around calendar events.</p>
                          </div>
                        ) : (
                          <ul className="space-y-3">
                            {calendarConflicts.map((c, i) => (
                              <li key={i} className="flex gap-3 p-3.5 rounded-xl bg-red-500/5 border border-red-500/10">
                                <AlertTriangle className="h-4.5 w-4.5 text-red-400 shrink-0 mt-0.5" />
                                <div className="min-w-0">
                                  <p className="text-sm font-medium text-white">{c.task_title}</p>
                                  <p className="text-xs text-slate-400 mt-0.5">
                                    Clashes with: <strong className="text-slate-300">{c.conflict_with}</strong>
                                  </p>
                                  <p className="text-xs text-red-300 mt-1">{c.message}</p>
                                </div>
                              </li>
                            ))}
                          </ul>
                        )}
                        {calendarStatus?.connected && calendarConflicts.length > 0 && (
                          <button onClick={handleOptimizeCalendar} disabled={calendarOptimizing} className="w-full py-2 px-3 text-xs font-semibold rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.08] text-white flex items-center justify-center gap-1.5">
                            {calendarOptimizing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Zap className="h-3.5 w-3.5" />}
                            Resolve Conflicts Automatically
                          </button>
                        )}
                      </div>
                    </GlassCard>
                  </div>
                </div>

                {/* Upcoming Events */}
                <GlassCard>
                  <div className="p-5 space-y-4">
                    <h2 className="text-sm font-semibold text-white">Imported Calendar Events</h2>
                    {calendarLoading ? (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 animate-pulse">
                        <div className="h-16 bg-white/5 rounded-xl" />
                        <div className="h-16 bg-white/5 rounded-xl" />
                        <div className="h-16 bg-white/5 rounded-xl" />
                      </div>
                    ) : calendarEvents.length === 0 ? (
                      <div className="text-center py-10 border border-dashed border-white/[0.05] rounded-xl text-slate-500 text-sm">
                        {calendarStatus?.connected ? 'No calendar events synced yet' : 'Connect Google Calendar to import events'}
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {calendarEvents.map((evt) => (
                          <div key={evt.id} className="p-3.5 rounded-xl border border-white/[0.05] bg-white/[0.02]">
                            <p className="text-sm font-medium text-white line-clamp-1">{evt.title}</p>
                            <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-400">
                              <Clock className="h-3.5 w-3.5 text-slate-500" />
                              <span>{new Date(evt.start_at).toLocaleString()}</span>
                            </div>
                            {evt.location && (
                              <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-400">
                                <MapPin className="h-3.5 w-3.5 text-slate-500" />
                                <span className="line-clamp-1">{evt.location}</span>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </GlassCard>

                {/* Timeline */}
                <GlassCard>
                  <div className="p-5 space-y-4">
                    <h2 className="text-sm font-semibold text-white">Full Task Timeline</h2>
                    {mappedTimelineItems.length === 0 ? (
                      <div className="text-center py-12 text-slate-500 text-sm">
                        No scheduled timeline entries.
                      </div>
                    ) : (
                      <Timeline items={mappedTimelineItems} />
                    )}
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
                className="space-y-6 max-w-3xl"
              >
                <h1 className="text-2xl font-bold text-white">Settings</h1>

                {/* Account Details */}
                <GlassCard>
                  <div className="p-5 space-y-4">
                    <h2 className="text-sm font-semibold text-white">Account Details</h2>
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-full bg-gradient-to-br from-violet-500 to-cyan-500 text-white flex items-center justify-center font-bold text-lg">
                        {(email || 'U').slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-white">{email ? email.split('@')[0] : 'User'}</div>
                        <div className="text-xs text-slate-400">{email || 'lmls@user.app'}</div>
                      </div>
                    </div>
                  </div>
                </GlassCard>

                {/* Sync controls */}
                <GlassCard>
                  <div className="p-5 space-y-4 flex items-center justify-between gap-4">
                    <div>
                      <h2 className="text-sm font-semibold text-white">Sync Application Data</h2>
                      <p className="text-xs text-slate-400 mt-1">
                        Force refetch all goals, tasks, and notification feeds from the database.
                      </p>
                    </div>
                    <button onClick={handleSettingsSync} disabled={settingsSyncing} className="px-4 py-2 text-xs font-semibold rounded-xl bg-white/[0.05] border border-white/[0.08] text-white hover:bg-white/[0.1] transition-all flex items-center gap-1.5 shrink-0">
                      {settingsSyncing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
                      {settingsSyncing ? 'Syncing...' : 'Sync Now'}
                    </button>
                  </div>
                  {settingsSynced && (
                    <div className="px-5 pb-4 text-xs text-emerald-400 flex items-center gap-1.5 animate-fade-in">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      All dashboard data synchronized successfully.
                    </div>
                  )}
                  {settingsError && (
                    <div className="px-5 pb-4 text-xs text-red-400 flex items-center gap-1.5 animate-fade-in">
                      <AlertCircle className="h-3.5 w-3.5" />
                      {settingsError}
                    </div>
                  )}
                </GlassCard>

                {/* Session Logout */}
                <GlassCard>
                  <div className="p-5 space-y-3">
                    <h2 className="text-sm font-semibold text-white">Logout Session</h2>
                    <p className="text-xs text-slate-400">
                      Sign out of your active account on this web client.
                    </p>
                    <button onClick={logout} className="px-4 py-2.5 text-xs font-semibold rounded-xl text-red-400 bg-red-400/5 hover:bg-red-400/10 border border-red-400/10 transition-all">
                      Log Out Account
                    </button>
                  </div>
                </GlassCard>
              </motion.div>
            )}
          </main>
        </div>
      </div>
    )
}
