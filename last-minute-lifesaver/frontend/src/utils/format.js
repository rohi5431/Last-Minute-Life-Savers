// Small UI helpers shared across components.

export function formatDateTime(iso) {
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

export function formatTime(iso) {
  if (!iso) return '—'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })
}

export function formatDuration(minutes) {
  if (!minutes && minutes !== 0) return '—'
  if (minutes < 60) return `${minutes}m`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m ? `${h}h ${m}m` : `${h}h`
}

export function relativeTime(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  const diff = (Date.now() - d.getTime()) / 1000
  if (diff < 60) return 'just now'
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

export const PRIORITY_META = {
  high: {
    label: 'High',
    badge: 'bg-red-50 text-red-700 border border-red-200',
    dot: 'bg-red-500',
    ring: 'ring-red-100',
  },
  medium: {
    label: 'Medium',
    badge: 'bg-amber-50 text-amber-700 border border-amber-200',
    dot: 'bg-amber-500',
    ring: 'ring-amber-100',
  },
  low: {
    label: 'Low',
    badge: 'bg-sky-50 text-sky-700 border border-sky-200',
    dot: 'bg-sky-500',
    ring: 'ring-sky-100',
  },
}

export function priorityMeta(p) {
  return PRIORITY_META[(p || 'medium').toLowerCase()] || PRIORITY_META.medium
}

export const STATUS_META = {
  pending: { label: 'Pending', badge: 'bg-ink-100 text-ink-600' },
  in_progress: { label: 'In Progress', badge: 'bg-blue-50 text-blue-700' },
  completed: { label: 'Done', badge: 'bg-emerald-50 text-emerald-700' },
  done: { label: 'Done', badge: 'bg-emerald-50 text-emerald-700' },
}

export function statusMeta(s) {
  return STATUS_META[(s || 'pending').toLowerCase()] || STATUS_META.pending
}

export function initialsFromEmail(email) {
  if (!email) return 'U'
  const name = email.split('@')[0]
  return name.slice(0, 2).toUpperCase()
}

export function classNames(...args) {
  return args.filter(Boolean).join(' ')
}
