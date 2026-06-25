import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, Brain, RefreshCw, AlertTriangle, Lightbulb, Clock, CheckCircle2 } from 'lucide-react'
import GlassCard from './ui/GlassCard'
import AnimatedButton from './ui/AnimatedButton'
import { useTasks } from '../context/TaskContext'

export default function ProductivityTips() {
  const { recommendations, refreshRecommendations } = useTasks()
  const [loading, setLoading] = useState(false)

  const handleRefresh = async () => {
    setLoading(true)
    try {
      await refreshRecommendations()
    } catch (err) {
      console.error('Failed to refresh recommendations:', err)
    } finally {
      setLoading(false)
    }
  }

  const getPriorityStyles = (priority: string) => {
    switch (priority) {
      case 'high':
        return {
          bg: 'bg-red-500/5',
          border: 'border-red-500/20',
          text: 'text-red-400',
          glow: 'pink' as const,
        }
      case 'medium':
        return {
          bg: 'bg-amber-500/5',
          border: 'border-amber-500/20',
          text: 'text-amber-400',
          glow: 'purple' as const,
        }
      default:
        return {
          bg: 'bg-blue-500/5',
          border: 'border-blue-500/20',
          text: 'text-blue-400',
          glow: 'cyan' as const,
        }
    }
  }

  return (
    <div className="space-y-6">
      {/* Header Panel */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Brain className="w-5 h-5 text-cyan-400" />
            AI Productivity Coach
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Real-time, personalized schedule advice generated based on your tasks and calendar load.
          </p>
        </div>

        <AnimatedButton
          variant="secondary"
          size="sm"
          onClick={handleRefresh}
          disabled={loading}
          icon={<RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />}
        >
          {loading ? 'Analyzing...' : 'Ask Coach'}
        </AnimatedButton>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 gap-4">
        {recommendations.length === 0 ? (
          <GlassCard hover={false} className="p-8 text-center flex flex-col items-center justify-center">
            <Sparkles className="w-8 h-8 text-violet-400/50 mb-3 animate-pulse" />
            <p className="text-sm font-medium text-slate-300">No productivity recommendations yet</p>
            <p className="text-xs text-slate-500 mt-1 max-w-sm">
              Click the 'Ask Coach' button above to have our AI analyze your tasks, deadline urgency, and calendar conflicts.
            </p>
          </GlassCard>
        ) : (
          <div className="space-y-4">
            <AnimatePresence initial={false}>
              {recommendations.map((rec, index) => {
                const styles = getPriorityStyles(rec.priority)
                return (
                  <motion.div
                    key={rec.id || index}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <GlassCard glow={styles.glow} className={`p-5 ${styles.bg} ${styles.border}`}>
                      <div className="flex items-start gap-4">
                        <div className="mt-1 shrink-0 p-2 rounded-xl bg-white/[0.04]">
                          {rec.priority === 'high' ? (
                            <AlertTriangle className="w-5 h-5 text-red-400" />
                          ) : rec.priority === 'medium' ? (
                            <Lightbulb className="w-5 h-5 text-amber-400" />
                          ) : (
                            <CheckCircle2 className="w-5 h-5 text-blue-400" />
                          )}
                        </div>
                        <div className="space-y-2 flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-3">
                            <span className={`text-xs font-semibold uppercase tracking-wider ${styles.text}`}>
                              {rec.priority} Priority
                            </span>
                            <span className="text-[10px] text-slate-500">
                              {new Date(rec.created_at || Date.now()).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          </div>
                          <p className="text-sm font-medium text-white">{rec.tip}</p>
                          {rec.context && (
                            <div className="rounded-lg bg-black/20 border border-white/[0.03] p-3 text-xs text-slate-400 mt-2 leading-relaxed">
                              <strong className="text-slate-300 block mb-1">Context Analysis:</strong>
                              {rec.context}
                            </div>
                          )}
                        </div>
                      </div>
                    </GlassCard>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  )
}
