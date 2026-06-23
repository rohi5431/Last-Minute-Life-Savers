import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { goals, tasks, schedule, notifications, analytics } from '../services/api'

const TaskContext = createContext(null)

export function TaskProvider({ children }) {
  const [goalsList, setGoalsList] = useState([])
  const [tasksList, setTasksList] = useState([])
  const [scheduleList, setScheduleList] = useState([])
  const [notificationsList, setNotificationsList] = useState([])
  const [analyticsData, setAnalyticsData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const loadedOnce = useRef(false)

  const refreshAll = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [g, t, s, n] = await Promise.all([
        goals.list(),
        tasks.list(),
        schedule.list(),
        notifications.list(),
      ])
      setGoalsList(g)
      setTasksList(t)
      setScheduleList(s)
      setNotificationsList(n)
      setAnalyticsData(analytics.computeAnalytics(g, t))
      loadedOnce.current = true
    } catch (e) {
      setError(e.friendlyMessage || 'Failed to load data')
    } finally {
      setLoading(false)
    }
  }, [])

  const refreshTasks = useCallback(async () => {
    try {
      const t = await tasks.list()
      setTasksList(t)
      setAnalyticsData(analytics.computeAnalytics(goalsList, t))
    } catch {
      /* handled in caller */
    }
  }, [goalsList])

  const refreshNotifications = useCallback(async () => {
    try {
      const n = await notifications.list()
      setNotificationsList(n)
    } catch {
      /* noop */
    }
  }, [])

  // Goals
  const addGoal = useCallback(async (payload) => {
    const goal = await goals.create(payload)
    setGoalsList((prev) => [goal, ...prev])
    return goal
  }, [])

  const removeGoal = useCallback(async (id) => {
    await goals.remove(id)
    setGoalsList((prev) => prev.filter((g) => g.id !== id))
  }, [])

  const getGoalPlan = useCallback((id) => goals.getPlan(id), [])

  // Tasks
  const updateTask = useCallback(
    async (id, patch) => {
      const updated = await tasks.update(id, patch)
      setTasksList((prev) => prev.map((t) => (t.id === id ? updated : t)))
      setAnalyticsData(analytics.computeAnalytics(goalsList, tasksList))
      return updated
    },
    [goalsList, tasksList]
  )

  // Notifications
  const markNotificationRead = useCallback(async (id) => {
    try {
      await notifications.markRead(id)
      setNotificationsList((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      )
    } catch {
      /* noop */
    }
  }, [])

  // Live update handlers driven by WebSocket events.
  const handleLiveEvent = useCallback(
    (evt) => {
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
    [refreshAll]
  )

  useEffect(() => {
    refreshAll()
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
