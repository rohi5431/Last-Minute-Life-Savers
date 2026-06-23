import { useCallback, useRef, useState } from 'react'
import { goals } from '../services/api'

// Polls a goal's plan until the planner has produced one or the deadline elapses.
// Used to surface AI clarification + generated tasks after creating a goal.
export function useGoalPlan() {
  const [loading, setLoading] = useState(false)
  const [plan, setPlan] = useState(null)
  const [error, setError] = useState(null)
  const timerRef = useRef(null)

  const stop = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
    setLoading(false)
  }, [])

  const fetchUntilReady = useCallback(
    (goalId, { intervalMs = 2000, timeoutMs = 30000 } = {}) => {
      stop()
      setLoading(true)
      setError(null)
      setPlan(null)

      const startedAt = Date.now()
      timerRef.current = setInterval(async () => {
        if (Date.now() - startedAt > timeoutMs) {
          stop()
          setError('AI planning is taking longer than expected. Check back shortly.')
          return
        }
        try {
          const result = await goals.getPlan(goalId)
          if (!result) {
            return
          }
          // Clarification-only result means the AI is asking for more info.
          const clarification = result.clarification
          const isReady =
            !clarification?.needs_clarification &&
            (result.plan || result.schedule)

          setPlan(result)
          if (isReady) {
            stop()
          }
        } catch (e) {
          if (e.response?.status === 404) {
            // Plan not cached yet, keep polling.
            return
          }
          stop()
          setError(e.friendlyMessage || 'Failed to fetch AI plan')
        }
      }, intervalMs)
    },
    [stop]
  )

  const reset = useCallback(() => {
    stop()
    setPlan(null)
    setError(null)
  }, [stop])

  return { loading, plan, error, fetchUntilReady, stop, reset }
}

export default useGoalPlan
