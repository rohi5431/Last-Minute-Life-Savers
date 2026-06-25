import axios from 'axios'

const TOKEN_KEY = 'lmls_token'

export const API_BASE_URL =
  (import.meta.env.VITE_API_BASE_URL as string)?.replace(/\/$/, '') || '/api'

export const WS_BASE_URL = (
  (import.meta.env.VITE_WS_BASE_URL as string) ||
  (API_BASE_URL.startsWith('http')
    ? API_BASE_URL.replace(/^http/, 'ws')
    : `${window.location.protocol === 'https:' ? 'wss' : 'ws'}://${window.location.host}/api`)
).replace(/\/$/, '')

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 20000,
})

// Attach JWT
api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY)
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Auto-logout on 401
let onUnauthorized: (() => void) | null = null
export function setUnauthorizedHandler(handler: () => void) {
  onUnauthorized = handler
}

api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem(TOKEN_KEY)
      if (onUnauthorized) onUnauthorized()
    }
    const message =
      error.response?.data?.detail ||
      error.response?.data?.message ||
      error.message ||
      'Request failed'
    return Promise.reject({ ...error, friendlyMessage: message })
  }
)

// ---------- Interfaces ----------
export interface GoalPayload {
  title: string
  description?: string
  deadline?: string
}

export interface Goal {
  id: number
  title: string
  description?: string
  deadline?: string
  created_at: string
}

export interface TaskPayload {
  title: string
  description?: string
  goal_id: number
  priority?: 'high' | 'medium' | 'low'
  status?: 'pending' | 'in_progress' | 'completed'
  duration?: number
  scheduled_at?: string
}

export interface Task {
  id: number
  title: string
  description?: string
  goal_id: number
  priority: 'high' | 'medium' | 'low'
  status: 'pending' | 'in_progress' | 'completed'
  duration?: number
  deadline?: string
  scheduled_at?: string
  completed_at?: string
}

export interface ScheduleItem {
  id: number
  task_id: number
  task_title: string
  start_at: string
  end_at: string
}

export interface NotificationItem {
  id: number
  title: string
  message: string
  created_at: string
  is_read: boolean
  type: 'reminder' | 'deadline' | 'update' | 'achievement'
}

export interface CalendarStatus {
  connected: boolean;
  event_count: number;
  last_synced_at?: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  start_at: string;
  end_at: string;
  location?: string;
}

export interface Conflict {
  task_id: number;
  task_title: string;
  conflict_with: string;
  overlap_start: string;
  overlap_end: string;
  message: string;
}

export interface AnalyticsData {
  totalGoals: number
  totalTasks: number
  completed: number
  pending: number
  completionRate: number
  productivity: number
  streak: number
  byPriority: Array<{
    priority: string
    total: number
    completed: number
  }>
}

// ---------- Auth ----------
export const auth = {
  login: async (emailVal: string, passwordVal: string) => {
    const formData = new URLSearchParams()
    formData.append('username', emailVal)
    formData.append('password', passwordVal)
    const { data } = await api.post('/auth/login', formData, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    })
    return data // { access_token, token_type }
  },
  signup: async (emailVal: string, passwordVal: string) => {
    const { data } = await api.post('/auth/register', { email: emailVal, password: passwordVal })
    return data // { id, email, created_at }
  },
  getToken: () => localStorage.getItem(TOKEN_KEY),
  setToken: (token: string) => localStorage.setItem(TOKEN_KEY, token),
  clearToken: () => localStorage.removeItem(TOKEN_KEY),
}

// ---------- Goals ----------
export const goals = {
  create: (payload: GoalPayload): Promise<Goal> => api.post('/goals/', payload).then((r) => r.data),
  list: (): Promise<Goal[]> => api.get('/goals/').then((r) => r.data),
  get: (id: number): Promise<Goal> => api.get(`/goals/${id}`).then((r) => r.data),
  remove: (id: number): Promise<any> => api.delete(`/goals/${id}`).then((r) => r.data),
  getPlan: (id: number): Promise<any> => api.get(`/goals/${id}/plan`).then((r) => r.data),
}

// ---------- Tasks ----------
export const tasks = {
  list: (goalId?: number): Promise<Task[]> =>
    api.get('/tasks/', { params: goalId ? { goal_id: goalId } : {} }).then((r) => r.data),
  update: (id: number, patch: Partial<Task>): Promise<Task> => api.patch(`/tasks/${id}`, patch).then((r) => r.data),
  create: (payload: TaskPayload): Promise<Task> => api.post('/tasks/', payload).then((r) => r.data),
}

// ---------- Schedule ----------
export const schedule = {
  list: (): Promise<ScheduleItem[]> => api.get('/schedule/').then((r) => r.data),
  today: (): Promise<ScheduleItem[]> => api.get('/schedule/today').then((r) => r.data),
}

// ---------- Notifications ----------
export const notifications = {
  list: (): Promise<NotificationItem[]> => api.get('/notifications/').then((r) => r.data),
  markRead: (id: number): Promise<any> => api.patch(`/notifications/${id}/read`).then((r) => r.data),
}

// ---------- Analytics ----------
export const analytics = {
  fetch: async (): Promise<AnalyticsData> => {
    const [g, t] = await Promise.all([goals.list(), tasks.list()])
    return computeAnalytics(g, t)
  },
  computeAnalytics,
}

// ---------- Calendar integration ----------
export const calendar = {
  status: (): Promise<CalendarStatus> => api.get('/calendar/status').then((r) => r.data),
  startOAuth: (): Promise<{ authorization_url: string }> => api.post('/calendar/oauth/start').then((r) => r.data),
  sync: (): Promise<{ message: string; imported: number; conflicts?: any[] }> => api.post('/calendar/sync').then((r) => r.data),
  listEvents: (): Promise<CalendarEvent[]> => api.get('/calendar/events').then((r) => r.data),
  listConflicts: (): Promise<Conflict[]> => api.get('/calendar/conflicts').then((r) => r.data),
  optimize: (): Promise<{ message: string }> => api.post('/calendar/optimize').then((r) => r.data),
  disconnect: (): Promise<any> => api.post('/calendar/oauth/disconnect').then((r) => r.data),
}

// ---------- Habits ----------
export interface Habit {
  id: number
  title: string
  frequency: 'daily' | 'weekly'
  streak: number
  last_completed?: string
}

export const habits = {
  list: (): Promise<Habit[]> => api.get('/habits/').then((r) => r.data),
  create: (payload: { title: string; frequency?: string }): Promise<Habit> =>
    api.post('/habits/', payload).then((r) => r.data),
  complete: (id: number): Promise<Habit> => api.post(`/habits/${id}/complete`).then((r) => r.data),
  remove: (id: number): Promise<any> => api.delete(`/habits/${id}`).then((r) => r.data),
}

// ---------- Productivity Recommendations & AI Assistant ----------
export interface Recommendation {
  id: string
  tip: string
  context: string
  priority: 'high' | 'medium' | 'low'
  created_at: string
}

export const productivity = {
  getRecommendations: (): Promise<Recommendation[]> =>
    api.get('/productivity/recommendations').then((r) => r.data),
  askAssistant: (message: string): Promise<{ response: string; action_taken?: string }> =>
    api.post('/productivity/assistant', { message }).then((r) => r.data),
}

export function computeAnalytics(goalList: Goal[], taskList: Task[]): AnalyticsData {
  const total = taskList.length
  const completed = taskList.filter(
    (t) => t.status === 'completed' || t.completed_at
  ).length
  const pending = total - completed
  const completionRate = total === 0 ? 0 : Math.round((completed / total) * 100)

  const byPriority = ['high', 'medium', 'low'].map((p) => ({
    priority: p.charAt(0).toUpperCase() + p.slice(1),
    total: taskList.filter((t) => (t.priority || 'medium') === p).length,
    completed: taskList.filter(
      (t) => (t.priority || 'medium') === p && (t.status === 'completed' || t.completed_at)
    ).length,
  }))

  // Streak: count consecutive days (up to today) with at least one completed task.
  const days: Record<string, number> = {}
  taskList.forEach((t) => {
    const ts = t.completed_at
    if (!ts) return
    const day = new Date(ts).toISOString().slice(0, 10)
    days[day] = (days[day] || 0) + 1
  })
  let streak = 0
  const cursor = new Date()
  while (true) {
    const key = cursor.toISOString().slice(0, 10)
    if (days[key]) {
      streak += 1
      cursor.setDate(cursor.getDate() - 1)
    } else if (streak === 0) {
      cursor.setDate(cursor.getDate() - 1)
      if (Object.keys(days).length === 0) break
      const beforeKey = cursor.toISOString().slice(0, 10)
      if (!days[beforeKey]) break
    } else {
      break
    }
    if (streak > 365) break
  }

  // Productivity score: weighted blend of completion rate + streak bonus.
  const productivity = Math.min(
    100,
    Math.round(completionRate * 0.7 + Math.min(streak, 7) * 5 + (total > 0 ? 15 : 0))
  )

  return {
    totalGoals: goalList.length,
    totalTasks: total,
    completed,
    pending,
    completionRate,
    productivity,
    streak,
    byPriority,
  }
}

export default api
