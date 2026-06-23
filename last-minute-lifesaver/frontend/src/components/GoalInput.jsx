import { useEffect, useState } from 'react'
import {
  Target, Loader2, Send, Sparkles, AlertCircle, CheckCircle2, MessageSquareReply, RefreshCw,
} from 'lucide-react'
import { useTasks } from '../context/TaskContext'
import { useGoalPlan } from '../hooks/useGoals'
import { formatDateTime, classNames } from '../utils/format'

const DEMO_EXAMPLES = [
  { title: 'Finish hackathon project', days: 2, note: 'AI agent + frontend + demo' },
  { title: 'Prepare investor pitch', days: 5, note: 'Deck + financials + practice' },
  { title: 'Study for finals', days: 7, note: '4 subjects, focus on weak areas' },
]

export default function GoalInput() {
  const { addGoal, refreshTasks } = useTasks()
  const { loading, plan, error, fetchUntilReady, stop, reset } = useGoalPlan()

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [deadline, setDeadline] = useState('')
  const [notes, setNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(null)

  useEffect(() => () => stop(), [stop])

  const onSubmit = async (e) => {
    e.preventDefault()
    if (!title.trim()) return
    setSubmitting(true)
    setSuccess(null)
    reset()
    try {
      const payload = {
        title: title.trim(),
        description: description.trim() || undefined,
        deadline: deadline ? new Date(deadline).toISOString() : undefined,
      }
      const goal = await addGoal(payload)
      setSuccess(`Goal created. AI is planning your tasks...`)
      fetchUntilReady(goal.id)
    } catch (err) {
      setSuccess(null)
      reset()
    } finally {
      setSubmitting(false)
    }
  }

  const onRescheduleRefresh = async () => {
    await refreshTasks()
    setSuccess('Tasks refreshed.')
  }

  const clarification = plan?.clarification
  const needsClarification = clarification?.needs_clarification
  const planTasks = plan?.plan?.tasks || []
  const planReady = plan && !needsClarification && planTasks.length > 0

  const applyExample = (ex) => {
    setTitle(ex.title)
    setDescription(ex.note)
    const d = new Date()
    d.setDate(d.getDate() + ex.days)
    d.setHours(23, 59, 0, 0)
    setLocalDateTime(d, setDeadline)
  }

  return (
    <div className="card p-6 animate-slide-up">
      <div className="flex items-center gap-2.5 mb-1">
        <div className="h-9 w-9 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
          <Target className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-base font-semibold text-ink-900">What's the deadline?</h2>
          <p className="text-xs text-ink-500">Drop your goal. The AI turns it into a plan.</p>
        </div>
      </div>

      <form onSubmit={onSubmit} className="mt-5 space-y-4">
        <div>
          <label className="label" htmlFor="goal-title">Goal title</label>
          <input
            id="goal-title"
            className="input"
            placeholder="e.g. Submit final thesis"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            maxLength={140}
          />
        </div>

        <div>
          <label className="label" htmlFor="goal-desc">Description</label>
          <textarea
            id="goal-desc"
            className="input min-h-[84px] resize-y"
            placeholder="What does done look like? Any constraints, scope, or details?"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            maxLength={1000}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="label" htmlFor="goal-deadline">Deadline</label>
            <input
              id="goal-deadline"
              type="datetime-local"
              className="input"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
            />
          </div>
          <div>
            <label className="label" htmlFor="goal-notes">Context notes <span className="font-normal text-ink-400">(optional)</span></label>
            <input
              id="goal-notes"
              className="input"
              placeholder="e.g. after work hours only"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
        </div>

        <div className="flex items-center justify-between pt-1">
          <div className="hidden sm:flex items-center gap-2 flex-wrap">
            {DEMO_EXAMPLES.map((ex) => (
              <button
                key={ex.title}
                type="button"
                onClick={() => applyExample(ex)}
                className="text-xs px-2.5 py-1.5 rounded-lg bg-ink-50 hover:bg-ink-100 text-ink-600 border border-ink-200"
              >
                {ex.title}
              </button>
            ))}
          </div>
          <button
            type="submit"
            disabled={submitting || !title.trim()}
            className="btn-primary ml-auto"
          >
            {submitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
            {submitting ? 'Planning...' : 'Plan my goal'}
          </button>
        </div>
      </form>

      {/* Status / AI feedback */}
      {success && !plan && !error && (
        <div className="mt-4 flex items-center gap-2 text-sm text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-xl px-3.5 py-2.5 animate-fade-in">
          <Loader2 className="h-4 w-4 animate-spin" />
          {success}
          {loading && <span className="text-emerald-600/70">polling AI...</span>}
        </div>
      )}

      {error && (
        <div className="mt-4 flex items-start gap-2 text-sm text-red-700 bg-red-50 border border-red-100 rounded-xl px-3.5 py-2.5 animate-fade-in">
          <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
          <div>
            <p className="font-medium">Couldn't finalize the plan</p>
            <p className="text-red-600">{error}</p>
          </div>
        </div>
      )}

      {needsClarification && (
        <ClarificationCard clarification={clarification} />
      )}

      {planReady && (
        <PlanReadyCard tasks={planTasks} onRefresh={onRescheduleRefresh} />
      )}
    </div>
  )
}

function ClarificationCard({ clarification }) {
  const questions = clarification.questions || clarification.clarifying_questions || []
  const summary = clarification.summary || clarification.message
  return (
    <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50/60 p-4 animate-fade-in">
      <div className="flex items-center gap-2 text-amber-700">
        <MessageSquareReply className="h-4 w-4" />
        <span className="text-sm font-semibold">The AI has a few questions</span>
      </div>
      {summary && <p className="mt-1.5 text-sm text-ink-700">{summary}</p>}
      {questions.length > 0 && (
        <ul className="mt-2 space-y-1.5">
          {questions.map((q, i) => (
            <li key={i} className="flex gap-2 text-sm text-ink-700">
              <span className="text-amber-600 font-semibold">{i + 1}.</span>
              <span>{typeof q === 'string' ? q : q.question || q.text}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function PlanReadyCard({ tasks, onRefresh }) {
  return (
    <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50/50 p-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-emerald-700">
          <CheckCircle2 className="h-4 w-4" />
          <span className="text-sm font-semibold">
            AI generated {tasks.length} task{tasks.length === 1 ? '' : 's'}
          </span>
        </div>
        <button onClick={onRefresh} className="btn-ghost text-xs py-1.5 px-2.5">
          <RefreshCw className="h-3.5 w-3.5" />
          Load tasks
        </button>
      </div>
      <ul className="mt-2.5 space-y-1.5">
        {tasks.slice(0, 5).map((t, i) => (
          <li key={i} className="flex items-center gap-2 text-sm text-ink-700">
            <Sparkles className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
            <span>{typeof t === 'string' ? t : t.title}</span>
          </li>
        ))}
        {tasks.length > 5 && (
          <li className="text-xs text-ink-500 pl-5">+{tasks.length - 5} more in your task board</li>
        )}
      </ul>
    </div>
  )
}

function setLocalDateTime(date, setter) {
  const pad = (n) => String(n).padStart(2, '0')
  const v = `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
  setter(v)
}
