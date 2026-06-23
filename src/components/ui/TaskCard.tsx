import { motion } from 'framer-motion'
import { Clock, AlertCircle, CheckCircle2, Calendar, MoreHorizontal } from 'lucide-react'
import GlassCard from './GlassCard'

interface TaskCardProps {
  task: {
    id: number
    title: string
    description?: string
    deadline?: string
    priority: 'high' | 'medium' | 'low'
    status: 'pending' | 'in_progress' | 'completed'
    duration?: number
  }
  onStatusChange?: (id: number, status: string) => void
  onClick?: () => void
}

const priorityConfig = {
  high: { color: 'text-red-400', bg: 'bg-red-400/10', border: 'border-red-400/30', label: 'High' },
  medium: { color: 'text-amber-400', bg: 'bg-amber-400/10', border: 'border-amber-400/30', label: 'Medium' },
  low: { color: 'text-cyan-400', bg: 'bg-cyan-400/10', border: 'border-cyan-400/30', label: 'Low' },
}

const statusConfig = {
  pending: { icon: Clock, color: 'text-slate-400', label: 'Pending' },
  in_progress: { icon: AlertCircle, color: 'text-blue-400', label: 'In Progress' },
  completed: { icon: CheckCircle2, color: 'text-emerald-400', label: 'Completed' },
}

export default function TaskCard({ task, onStatusChange, onClick }: TaskCardProps) {
  const priority = priorityConfig[task.priority]
  const status = statusConfig[task.status]
  const StatusIcon = status.icon

  return (
    <GlassCard
      className={`cursor-pointer group ${task.status === 'completed' ? 'opacity-60' : ''}`}
      onClick={onClick}
    >
      <div className="p-4 space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-start gap-3">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={(e) => {
                e.stopPropagation()
                const nextStatus = task.status === 'pending' ? 'in_progress' : task.status === 'in_progress' ? 'completed' : 'pending'
                onStatusChange?.(task.id, nextStatus)
              }}
              className={`mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors
                ${task.status === 'completed'
                  ? 'bg-emerald-500 border-emerald-500'
                  : task.status === 'in_progress'
                    ? 'border-blue-400 bg-blue-400/20'
                    : 'border-slate-500 hover:border-violet-500'
                }
              `}
            >
              {task.status === 'completed' && <CheckCircle2 className="w-3 h-3 text-white" />}
              {task.status === 'in_progress' && <div className="w-2 h-2 rounded-full bg-blue-400" />}
            </motion.button>

            <div className="flex-1">
              <h4 className={`font-medium ${task.status === 'completed' ? 'line-through text-slate-500' : 'text-white'}`}>
                {task.title}
              </h4>
              {task.description && (
                <p className="text-sm text-slate-400 mt-0.5 line-clamp-2">{task.description}</p>
              )}
            </div>
          </div>

          <button className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-white/5 rounded">
            <MoreHorizontal className="w-4 h-4 text-slate-400" />
          </button>
        </div>

        {/* Meta */}
        <div className="flex items-center gap-3 flex-wrap">
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs ${priority.bg} ${priority.color}`}>
            {priority.label}
          </span>

          {task.duration && (
            <span className="flex items-center gap-1 text-xs text-slate-500">
              <Clock className="w-3 h-3" />
              {task.duration}m
            </span>
          )}

          {task.deadline && (
            <span className="flex items-center gap-1 text-xs text-slate-500">
              <Calendar className="w-3 h-3" />
              {new Date(task.deadline).toLocaleDateString()}
            </span>
          )}
        </div>
      </div>
    </GlassCard>
  )
}
