import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Flame, Check, Plus, Trash2, Award, Calendar, Loader2 } from 'lucide-react'
import GlassCard from './ui/GlassCard'
import AnimatedButton from './ui/AnimatedButton'
import { useTasks } from '../context/TaskContext'
import { Habit } from '../services/api'

export default function HabitsTracker() {
  const { habits, addHabit, completeHabit, removeHabit } = useTasks()
  const [newTitle, setNewTitle] = useState('')
  const [frequency, setFrequency] = useState<'daily' | 'weekly'>('daily')
  const [loadingId, setLoadingId] = useState<number | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const handleAddHabit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTitle.trim()) return

    setSubmitting(true)
    try {
      await addHabit(newTitle.trim(), frequency)
      setNewTitle('')
    } catch (err) {
      console.error('Failed to add habit:', err)
    } finally {
      setSubmitting(false)
    }
  }

  const handleComplete = async (id: number) => {
    setLoadingId(id)
    try {
      await completeHabit(id)
    } catch (err) {
      console.error('Failed to complete habit:', err)
    } finally {
      setLoadingId(null)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this habit?')) return
    try {
      await removeHabit(id)
    } catch (err) {
      console.error('Failed to delete habit:', err)
    }
  }

  const isCompletedToday = (habit: Habit) => {
    if (!habit.last_completed) return false
    const lastDate = new Date(habit.last_completed).toDateString()
    const today = new Date().toDateString()
    return lastDate === today
  }

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Award className="w-5 h-5 text-violet-400" />
            Goal & Habit Tracking
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Build routines and maintain streaks to keep panic away.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Add Habit Form */}
        <div className="lg:col-span-1">
          <GlassCard glow="blue">
            <form onSubmit={handleAddHabit} className="p-5 space-y-4">
              <h3 className="text-sm font-semibold text-white">Create New Habit</h3>
              
              <div className="space-y-1">
                <label className="text-xs text-slate-400">Habit Name</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g., Drink water, Review plans..."
                  required
                  className="w-full px-3 py-2 rounded-xl bg-white/[0.03] border border-white/[0.08] text-white text-sm placeholder:text-slate-500 focus:outline-none focus:border-violet-500/50"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-slate-400">Frequency</label>
                <div className="grid grid-cols-2 gap-2">
                  {(['daily', 'weekly'] as const).map((freq) => (
                    <button
                      key={freq}
                      type="button"
                      onClick={() => setFrequency(freq)}
                      className={`py-1.5 text-xs font-semibold rounded-lg capitalize border transition-all ${
                        frequency === freq
                          ? 'bg-violet-500/10 text-violet-400 border-violet-500/30'
                          : 'bg-white/[0.02] text-slate-400 border-white/[0.05] hover:bg-white/[0.05]'
                      }`}
                    >
                      {freq}
                    </button>
                  ))}
                </div>
              </div>

              <AnimatedButton
                type="submit"
                variant="gradient"
                className="w-full text-xs py-2"
                icon={submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                disabled={submitting || !newTitle.trim()}
              >
                {submitting ? 'Creating...' : 'Add Habit'}
              </AnimatedButton>
            </form>
          </GlassCard>
        </div>

        {/* Habits List */}
        <div className="lg:col-span-2 space-y-3">
          <GlassCard hover={false} className="p-5">
            <h3 className="text-sm font-semibold text-white mb-4">Active Routines</h3>
            {habits.length === 0 ? (
              <div className="text-center py-10 border border-dashed border-white/[0.05] rounded-xl text-slate-500 text-sm">
                No habits configured. Build routines to stay on top!
              </div>
            ) : (
              <div className="space-y-3">
                <AnimatePresence initial={false}>
                  {habits.map((habit) => {
                    const completed = isCompletedToday(habit)
                    return (
                      <motion.div
                        key={habit.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className={`flex items-center justify-between p-3.5 rounded-xl border transition-all ${
                          completed
                            ? 'bg-emerald-500/5 border-emerald-500/20'
                            : 'bg-white/[0.02] border-white/[0.05] hover:bg-white/[0.04]'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => !completed && handleComplete(habit.id)}
                            disabled={completed || loadingId === habit.id}
                            className={`w-6 h-6 rounded-full flex items-center justify-center border transition-all ${
                              completed
                                ? 'bg-emerald-500 border-emerald-500 text-white'
                                : 'border-slate-500 hover:border-violet-400 hover:bg-violet-500/10 text-transparent'
                            }`}
                          >
                            {loadingId === habit.id ? (
                              <Loader2 className="w-3 h-3 text-violet-400 animate-spin" />
                            ) : (
                              <Check className="w-3.5 h-3.5 text-white" />
                            )}
                          </button>
                          <div>
                            <span
                              className={`text-sm font-medium transition-all ${
                                completed ? 'text-slate-400 line-through' : 'text-white'
                              }`}
                            >
                              {habit.title}
                            </span>
                            <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-500">
                              <Calendar className="w-3 h-3" />
                              <span className="capitalize">{habit.frequency}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <div
                            className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
                              habit.streak > 0
                                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                : 'bg-slate-500/10 text-slate-400 border border-slate-500/10'
                            }`}
                          >
                            <Flame className={`w-3.5 h-3.5 ${habit.streak > 0 ? 'fill-amber-500/20 animate-pulse' : ''}`} />
                            <span>{habit.streak} day streak</span>
                          </div>

                          <button
                            onClick={() => handleDelete(habit.id)}
                            className="p-1.5 rounded-lg hover:bg-red-500/10 text-slate-500 hover:text-red-400 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </motion.div>
                    )
                  })}
                </AnimatePresence>
              </div>
            )}
          </GlassCard>
        </div>
      </div>
    </div>
  )
}
