import { motion } from 'framer-motion'
import { Calendar, Clock, MapPin, Video, Users } from 'lucide-react'
import GlassCard from './GlassCard'

interface ScheduleCardProps {
  event: {
    id: number
    title: string
    date: string
    time: string
    duration?: string
    location?: string
    type: 'meeting' | 'task' | 'reminder' | 'deadline'
    attendees?: number
  }
}

const typeConfig = {
  meeting: { color: 'from-violet-500 to-purple-500', icon: Users },
  task: { color: 'from-cyan-500 to-blue-500', icon: Clock },
  reminder: { color: 'from-amber-500 to-orange-500', icon: Calendar },
  deadline: { color: 'from-red-500 to-pink-500', icon: Calendar },
}

export default function ScheduleCard({ event }: ScheduleCardProps) {
  const config = typeConfig[event.type]
  const Icon = config.icon

  return (
    <GlassCard className="overflow-hidden">
      {/* Color bar */}
      <div className={`h-1 bg-gradient-to-r ${config.color}`} />

      <div className="p-4">
        <div className="flex items-start gap-3">
          {/* Icon */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            className={`w-10 h-10 rounded-xl bg-gradient-to-br ${config.color} flex items-center justify-center flex-shrink-0`}
          >
            <Icon className="w-5 h-5 text-white" />
          </motion.div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-white truncate">{event.title}</h4>

            <div className="flex items-center gap-3 mt-2 text-sm text-slate-400">
              <div className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-violet-400" />
                <span>{event.date}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-cyan-400" />
                <span>{event.time}</span>
              </div>
            </div>

            {(event.location || event.attendees) && (
              <div className="flex items-center gap-3 mt-2 text-xs text-slate-500">
                {event.location && (
                  <div className="flex items-center gap-1 truncate">
                    {event.location.includes('zoom') || event.location.includes('meet') ? (
                      <Video className="w-3 h-3" />
                    ) : (
                      <MapPin className="w-3 h-3" />
                    )}
                    <span>{event.location}</span>
                  </div>
                )}
                {event.attendees && (
                  <div className="flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    <span>{event.attendees}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </GlassCard>
  )
}
