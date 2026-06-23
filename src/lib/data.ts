import { supabase, DEMO_USER_ID } from './supabase'

export type Goal = {
  id: number
  user_id: number
  title: string
  description: string | null
  deadline: string | null
  status: string
  created_at: string
}

export type Task = {
  id: number
  goal_id: number
  title: string
  duration_min: number | null
  priority: string
  scheduled_at: string | null
  completed_at: string | null
  status: string
  notes: string | null
  ai_metadata: Record<string, unknown> | null
  created_at: string
}

export type Schedule = {
  id: number
  user_id: number
  task_id: number
  scheduled_for: string
  created_at: string
}

export type Notification = {
  id: number
  user_id: number
  task_id: number | null
  message: string
  is_read: boolean
  sent_at: string
}

export type CalendarEvent = {
  id: number
  user_id: number
  external_id: string
  provider: string
  title: string
  start_at: string
  end_at: string
  location: string | null
}

export async function fetchGoals(): Promise<Goal[]> {
  const { data, error } = await supabase
    .from('goals')
    .select('*')
    .eq('user_id', DEMO_USER_ID)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data ?? []
}

export async function fetchTasks(): Promise<Task[]> {
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data ?? []
}

export async function fetchSchedules(): Promise<Schedule[]> {
  const { data, error } = await supabase
    .from('schedules')
    .select('*')
    .eq('user_id', DEMO_USER_ID)
    .order('scheduled_for', { ascending: true })
  if (error) throw error
  return data ?? []
}

export async function fetchNotifications(): Promise<Notification[]> {
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', DEMO_USER_ID)
    .order('sent_at', { ascending: false })
  if (error) throw error
  return data ?? []
}

export async function fetchCalendarEvents(): Promise<CalendarEvent[]> {
  const { data, error } = await supabase
    .from('calendar_events')
    .select('*')
    .eq('user_id', DEMO_USER_ID)
    .order('start_at', { ascending: true })
  if (error) throw error
  return data ?? []
}

export async function updateTaskStatus(
  taskId: number,
  status: 'pending' | 'in_progress' | 'completed'
): Promise<Task | null> {
  const patch: Partial<Task> = { status }
  if (status === 'completed') patch.completed_at = new Date().toISOString()
  if (status !== 'completed') patch.completed_at = null

  const { data, error } = await supabase
    .from('tasks')
    .update(patch)
    .eq('id', taskId)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function markNotificationRead(id: number): Promise<void> {
  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('id', id)
  if (error) throw error
}

export type Analytics = {
  totalGoals: number
  totalTasks: number
  completed: number
  pending: number
  inProgress: number
  completionRate: number
  productivity: number
  streak: number
  byPriority: { priority: string; total: number; completed: number }[]
}

export function computeAnalytics(goals: Goal[], tasks: Task[]): Analytics {
  const total = tasks.length
  const completed = tasks.filter(
    (t) => t.status === 'completed' || t.completed_at
  ).length
  const inProgress = tasks.filter((t) => t.status === 'in_progress').length
  const pending = total - completed - inProgress
  const completionRate = total === 0 ? 0 : Math.round((completed / total) * 100)

  const byPriority = ['high', 'medium', 'low'].map((p) => ({
    priority: p,
    total: tasks.filter((t) => (t.priority || 'medium') === p).length,
    completed: tasks.filter(
      (t) => (t.priority || 'medium') === p && (t.status === 'completed' || t.completed_at)
    ).length,
  }))

  // streak: consecutive days with at least one completed task
  const days: Record<string, number> = {}
  tasks.forEach((t) => {
    if (!t.completed_at) return
    const day = new Date(t.completed_at).toISOString().slice(0, 10)
    days[day] = (days[day] || 0) + 1
  })
  let streak = 0
  const cursor = new Date()
  let guard = 0
  while (guard < 400) {
    const key = cursor.toISOString().slice(0, 10)
    if (days[key]) {
      streak += 1
      cursor.setDate(cursor.getDate() - 1)
    } else if (streak === 0) {
      cursor.setDate(cursor.getDate() - 1)
      if (Object.keys(days).length === 0) break
    } else {
      break
    }
    guard++
  }

  const productivity = Math.min(
    100,
    Math.round(completionRate * 0.7 + Math.min(streak, 7) * 5 + (total > 0 ? 15 : 0))
  )

  return {
    totalGoals: goals.length,
    totalTasks: total,
    completed,
    pending,
    inProgress,
    completionRate,
    productivity,
    streak,
    byPriority,
  }
}

export function formatDateTime(iso: string | null): string {
  if (!iso) return '—'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

export function formatTime(iso: string | null): string {
  if (!iso) return '—'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })
}

export function formatDuration(minutes: number | null): string {
  if (!minutes && minutes !== 0) return '—'
  if (minutes < 60) return `${minutes}m`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m ? `${h}h ${m}m` : `${h}h`
}

export function relativeTime(iso: string): string {
  const d = new Date(iso)
  const diff = (Date.now() - d.getTime()) / 1000
  if (diff < 60) return 'just now'
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}
