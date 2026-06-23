import axios from 'axios'

const TOKEN_KEY = 'lmls_token'

// Base URL resolution: prefer env, otherwise fall back to the Vite dev proxy.
export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '') || '/api'

export const WS_BASE_URL = (
  import.meta.env.VITE_WS_BASE_URL ||
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
let onUnauthorized = null
export function setUnauthorizedHandler(handler) {
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

// ---------- Auth ----------
export const auth = {
  login: async (email, password) => {
    const formData = new URLSearchParams()
    formData.append('username', email)
    formData.append('password', password)
    const { data } = await api.post('/auth/login', formData, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    })
    return data // { access_token, token_type }
  },
  signup: async (email, password) => {
    const { data } = await api.post('/auth/register', { email, password })
    return data // { id, email, created_at }
  },
  getToken: () => localStorage.getItem(TOKEN_KEY),
  setToken: (token) => localStorage.setItem(TOKEN_KEY, token),
  clearToken: () => localStorage.removeItem(TOKEN_KEY),
}

// ---------- Goals ----------
export const goals = {
  create: (payload) => api.post('/goals/', payload).then((r) => r.data),
  list: () => api.get('/goals/').then((r) => r.data),
  get: (id) => api.get(`/goals/${id}`).then((r) => r.data),
  remove: (id) => api.delete(`/goals/${id}`).then((r) => r.data),
  getPlan: (id) => api.get(`/goals/${id}/plan`).then((r) => r.data),
}

// ---------- Tasks ----------
export const tasks = {
  list: (goalId) =>
    api.get('/tasks/', { params: goalId ? { goal_id: goalId } : {} }).then((r) => r.data),
  update: (id, patch) => api.patch(`/tasks/${id}`, patch).then((r) => r.data),
  create: (payload) => api.post('/tasks/', payload).then((r) => r.data),
}

// ---------- Schedule ----------
export const schedule = {
  list: () => api.get('/schedule/').then((r) => r.data),
  today: () => api.get('/schedule/today').then((r) => r.data),
}

// ---------- Notifications ----------
export const notifications = {
  list: () => api.get('/notifications/').then((r) => r.data),
  markRead: (id) => api.patch(`/notifications/${id}/read`).then((r) => r.data),
}

// ---------- Analytics ----------
// Derived client-side from tasks + goals when no dedicated endpoint exists.
export const analytics = {
  fetch: async () => {
    const [g, t] = await Promise.all([goals.list(), tasks.list()])
    return computeAnalytics(g, t)
  },
}

// ---------- Calendar integration (Phase 5) ----------
export const calendar = {
  status: () => api.get('/calendar/status').then((r) => r.data),
  startOAuth: () => api.post('/calendar/oauth/start').then((r) => r.data),
  sync: () => api.post('/calendar/sync').then((r) => r.data),
  listEvents: () => api.get('/calendar/events').then((r) => r.data),
  listConflicts: () => api.get('/calendar/conflicts').then((r) => r.data),
  optimize: () => api.post('/calendar/optimize').then((r) => r.data),
  disconnect: () => api.post('/calendar/oauth/disconnect').then((r) => r.data),
}

export function computeAnalytics(goalList, taskList) {
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
  const days = {}
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
