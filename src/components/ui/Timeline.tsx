import { motion } from 'framer-motion'
import { Clock, CheckCircle2, AlertCircle } from 'lucide-react'

interface TimelineItem {
  id: number
  time: string
  title: string
  status: 'completed' | 'current' | 'upcoming'
  type: 'task' | 'break' | 'meeting'
}

interface TimelineProps {
  items: TimelineItem[]
}

export default function Timeline({ items }: TimelineProps) {
  return (
    <div className="relative">
      {/* Timeline line */}
      <div className="absolute left-[19px] top-0 bottom-0 w-px bg-gradient-to-b from-violet-500/50 via-cyan-500/50 to-transparent" />

      <div className="space-y-4">
        {items.map((item, i) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            className={`relative flex items-start gap-4 ${item.status === 'current' ? 'z-10' : ''}`}
          >
            {/* Dot */}
            <div className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center
              ${item.status === 'completed'
                ? 'bg-emerald-500/20 border-2 border-emerald-500/50'
                : item.status === 'current'
                  ? 'bg-violet-500/20 border-2 border-violet-500 shadow-lg shadow-violet-500/20'
                  : 'bg-white/[0.05] border-2 border-white/[0.1]'
              }
            `}>
              {item.status === 'completed' && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
              {item.status === 'current' && (
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="w-3 h-3 rounded-full bg-violet-500"
                />
              )}
              {item.status === 'upcoming' && <Clock className="w-5 h-5 text-slate-500" />}
            </div>

            {/* Content */}
            <div className={`flex-1 pb-4 ${item.status === 'current' ? '' : 'opacity-60'}`}>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-medium text-cyan-400">{item.time}</span>
                {item.status === 'current' && (
                  <motion.span
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="text-xs px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-400"
                  >
                    Now
                  </motion.span>
                )}
              </div>
              <h4 className={`text-sm ${item.status === 'completed' ? 'line-through text-slate-500' : 'text-white'}`}>
                {item.title}
              </h4>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
