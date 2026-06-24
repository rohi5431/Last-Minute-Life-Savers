import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, ReactNode } from 'react'
import {
  goals as apiGoals,
  tasks as apiTasks,
  schedule as apiSchedule,
  notifications as apiNotifications,
  analytics as apiAnalytics,
  Goal,
  Task,
  ScheduleItem,
  NotificationItem,
  AnalyticsData,
  GoalPayload
} from '../services/api'

interface TaskContextType {
  goals: Goal[]
  tasks: Task[]
  schedules: ScheduleItem[]
  notifications: NotificationItem[]
  analytics: AnalyticsData | null
  loading: boolean
  error: string | null
  loaded: boolean
  refreshAll: () => Promise<void>
  refreshTasks: () => Promise<void>
  refreshNotifications: () => Promise<void>
  addGoal: (payload: GoalPayload) => Promise<Goal>
  removeGoal: (id: number) => Promise<void>
  getGoalPlan: (id: number) => Promise<any>
  updateTask: (id: number, patch: Partial<Task>) => Promise<Task>
  markNotificationRead: (id: number) => Promise<void>
  handleLiveEvent: (evt: any) => void
}

const TaskContext = createContext<TaskContextType | null>(null)

export function TaskProvider({ children }: { children: ReactNode }) {
  const [goalsList, setGoalsList] = useState<Goal[]>([])
  const [tasksList, setTasksList] = useState<Task[]>([])
  const [scheduleList, setScheduleList] = useState<ScheduleItem[]>([])
  const [notificationsList, setNotificationsList] = useState<NotificationItem[]>([])
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const loadedOnce = useRef(false)

  const refreshAll = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [g, t, s, n] = await Promise.all([
        apiGoals.list(),
        apiTasks.list(),
        apiSchedule.list(),
        apiNotifications.list(),
      ])
      setGoalsList(g)
      setTasksList(t)
      setScheduleList(s)
      setNotificationsList(n)
      setAnalyticsData(apiAnalytics.computeAnalytics(g, t))
      loadedOnce.current = true
    } catch (e: any) {
      setError(e.friendlyMessage || 'Failed to load data')
    } finally {
      setLoading(false)
    }
  }, [])

  const refreshTasks = useCallback(async () => {
    try {
      const t = await apiTasks.list()
      setTasksList(t)
      setAnalyticsData(apiAnalytics.computeAnalytics(goalsList, t))
    } catch {
      /* handled in caller */
    }
  }, [goalsList])

  const refreshNotifications = useCallback(async () => {
    try {
      const n = await apiNotifications.list()
      setNotificationsList(n)
    } catch {
      /* noop */
    }
  }, [])

  // Goals
  const addGoal = useCallback(async (payload: GoalPayload) => {
    const goal = await apiGoals.create(payload)
    setGoalsList((prev) => [goal, ...prev])
    return goal
  }, [])

  const removeGoal = useCallback(async (id: number) => {
    await apiGoals.remove(id)
    setGoalsList((prev) => prev.filter((g) => g.id !== id))
  }, [])

  const getGoalPlan = useCallback((id: number) => apiGoals.getPlan(id), [])

  // Tasks
  const updateTask = useCallback(
    async (id: number, patch: Partial<Task>) => {
      const updated = await apiTasks.update(id, patch)
      setTasksList((prev) => prev.map((t) => (t.id === id ? updated : t)))
      setAnalyticsData(apiAnalytics.computeAnalytics(goalsList, tasksList))
      return updated
    },
    [goalsList, tasksList]
  )

  // Notifications
  const markNotificationRead = useCallback(async (id: number) => {
    try {
      await apiNotifications.markRead(id)
      setNotificationsList((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      )
    } catch {
      /* noop */
    }
  }, [])

  // Live update handlers driven by WebSocket events.
  const handleLiveEvent = useCallback(
    (evt: any) => {
      if (!evt || !evt.type) return
      switch (evt.type) {
        case 'notification':
        case 'new_notification':
          setNotificationsList((prev) => {
            if (prev.some((n) => n.id === evt.payload.id)) return prev
            return [evt.payload, ...prev]
          })
          break
        case 'task_created':
          setTasksList((prev) =>
            prev.some((t) => t.id === evt.payload.id) ? prev : [...prev, evt.payload]
          )
          break
        case 'task_updated':
          setTasksList((prev) => prev.map((t) => (t.id === evt.payload.id ? evt.payload : t)))
          break
        case 'schedule':
        case 'schedule_updated':
          setScheduleList((prev) =>
            prev.some((s) => s.task_id === evt.payload.task_id)
              ? prev.map((s) => (s.task_id === evt.payload.task_id ? evt.payload : s))
              : [...prev, evt.payload]
          )
          break
        case 'reprioritized':
          // Priority changes — refresh tasks + analytics so the board reflects
          // new priorities without a manual reload.
          refreshTasks()
          break
        case 'refresh':
          refreshAll()
          break
        default:
          break
      }
    },
    [refreshAll, refreshTasks]
  )

  useEffect(() => {
    const token = localStorage.getItem('lmls_token')
    if (token) {
      refreshAll()
    }
  }, [refreshAll])

  const value = useMemo(
    () => ({
      goals: goalsList,
      tasks: tasksList,
      schedules: scheduleList,
      notifications: notificationsList,
      analytics: analyticsData,
      loading,
      error,
      loaded: loadedOnce.current,
      refreshAll,
      refreshTasks,
      refreshNotifications,
      addGoal,
      removeGoal,
      getGoalPlan,
      updateTask,
      markNotificationRead,
      handleLiveEvent,
    }),
    [
      goalsList, tasksList, scheduleList, notificationsList, analyticsData,
      loading, error, refreshAll, refreshTasks, refreshNotifications,
      addGoal, removeGoal, getGoalPlan, updateTask, markNotificationRead, handleLiveEvent,
    ]
  )

  return <TaskContext.Provider value={value}>{children}</TaskContext.Provider>
}

export function useTasks() {
  const ctx = useContext(TaskContext)
  if (!ctx) throw new Error('useTasks must be used within TaskProvider')
  return ctx
}

export default TaskContext
