import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertOctagon, Heart, ShieldAlert, Sparkles, Loader2, CheckCircle2 } from 'lucide-react'
import GlassCard from './ui/GlassCard'
import AnimatedButton from './ui/AnimatedButton'
import { useTasks } from '../context/TaskContext'
import { calendar as apiCalendar } from '../services/api'

export default function PanicMeter({ conflictCount = 0 }: { conflictCount?: number }) {
  const { tasks, refreshAll } = useTasks()
  const [isOptimizing, setIsOptimizing] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  const pendingCount = tasks.filter((t) => t.status !== 'completed').length
  const highPriorityCount = tasks.filter((t) => t.priority === 'high' && t.status !== 'completed').length

  // Calculate Panic Index (0 - 100)
  const panicScore = Math.min(
    100,
    pendingCount === 0 ? 0 : Math.max(15, pendingCount * 6 + highPriorityCount * 12 + conflictCount * 15)
  )

  const getPanicMeta = (score: number) => {
    if (score < 30) {
      return {
        label: 'Calm & Collected',
        desc: 'Everything is planned. Deadlines are secure.',
        color: 'text-emerald-400',
        barColor: 'from-emerald-500 to-teal-500',
        glow: 'cyan' as const,
        icon: Heart,
        pulseSpeed: 'duration-3000',
      }
    } else if (score < 70) {
      return {
        label: 'Elevated Stress',
        desc: 'Tasks are stacking up. Consider organizing schedule.',
        color: 'text-amber-400',
        barColor: 'from-amber-500 to-orange-500',
        glow: 'purple' as const,
        icon: AlertOctagon,
        pulseSpeed: 'duration-2000 animate-pulse',
      }
    } else {
      return {
        label: 'CRITICAL PANIC',
        desc: 'Imminent deadlines and clashes! Activate Life Saver Protocol.',
        color: 'text-red-400',
        barColor: 'from-red-500 via-rose-500 to-pink-500',
        glow: 'pink' as const,
        icon: ShieldAlert,
        pulseSpeed: 'duration-1000 animate-pulse',
      }
    }
  }

  const meta = getPanicMeta(panicScore)

  const handleProtocol = async () => {
    setIsOptimizing(true)
    setShowSuccess(false)
    try {
      // Optimize schedule
      await apiCalendar.optimize()
      await refreshAll()
      setShowSuccess(true)
      setTimeout(() => setShowSuccess(false), 5000)
    } catch (err) {
      console.error(err)
    } finally {
      setIsOptimizing(false)
    }
  }

  return (
    <GlassCard glow={meta.glow} className="p-6 overflow-hidden relative">
      {/* Background glow effects */}
      <div className={`absolute top-0 right-0 w-64 h-64 bg-gradient-to-br ${meta.barColor} opacity-5 blur-3xl pointer-events-none`} />

      <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
        {/* Panic Index Score Visual */}
        <div className="flex items-center gap-4">
          <div className={`w-16 h-16 rounded-2xl bg-white/[0.03] border border-white/[0.05] flex items-center justify-center`}>
            <meta.icon className={`w-8 h-8 ${meta.color} ${meta.pulseSpeed}`} />
          </div>
          <div>
            <span className="text-xs text-slate-400 uppercase tracking-wider block">Stress Analyzer</span>
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              Panic Index: <span className={meta.color}>{Math.round(panicScore)}%</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">{meta.desc}</p>
          </div>
        </div>

        {/* Dynamic Progress Bar */}
        <div className="flex-1 w-full max-w-md">
          <div className="h-3 w-full rounded-full bg-white/[0.05] border border-white/[0.08] overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${panicScore}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className={`h-full rounded-full bg-gradient-to-r ${meta.barColor}`}
            />
          </div>
          <div className="flex justify-between mt-2 text-[10px] text-slate-500 font-semibold uppercase tracking-wider">
            <span>Calm</span>
            <span>Urgent</span>
            <span>Overloaded</span>
          </div>
        </div>

        {/* Life Saver Protocol Activation */}
        <div className="shrink-0 w-full md:w-auto">
          <AnimatePresence mode="wait">
            {showSuccess ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-sm font-semibold justify-center"
              >
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                Protocol Complete!
              </motion.div>
            ) : (
              <AnimatedButton
                onClick={handleProtocol}
                disabled={isOptimizing || panicScore < 15}
                variant="gradient"
                className="w-full justify-center text-sm py-2.5 px-5 font-bold"
                icon={isOptimizing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              >
                {isOptimizing ? 'Re-planning Workspace...' : 'Activate Life Saver Protocol'}
              </AnimatedButton>
            )}
          </AnimatePresence>
        </div>
      </div>
    </GlassCard>
  )
}
