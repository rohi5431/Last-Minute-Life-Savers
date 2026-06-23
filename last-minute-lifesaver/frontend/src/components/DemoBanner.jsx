import { useState, useEffect } from 'react'
import { Sparkles, X } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const DEMO_EMAIL = 'demo@lifesaver.app'
const DISMISS_KEY = 'lmls_demo_banner_dismissed'

// A slim, dismissible ribbon shown only when logged in as the seeded demo
// user. Helps judges see the demo credentials and reinforces the "living AI"
// feel without touching any flows.
export default function DemoBanner() {
  const { email } = useAuth()
  const [dismissed, setDismissed] = useState(
    () => localStorage.getItem(DISMISS_KEY) === 'true'
  )

  // Reset the dismissal whenever a different account logs in, so the demo
  // banner shows again the next time someone runs the seed.
  useEffect(() => {
    if (email !== DEMO_EMAIL) {
      localStorage.removeItem(DISMISS_KEY)
    }
  }, [email])

  if (email !== DEMO_EMAIL || dismissed) return null

  const dismiss = () => {
    setDismissed(true)
    localStorage.setItem(DISMISS_KEY, 'true')
  }

  return (
    <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white text-xs sm:text-sm border-b border-emerald-700/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2 flex items-center gap-2">
        <Sparkles className="h-3.5 w-3.5 shrink-0" />
        <span className="font-medium">Demo mode</span>
        <span className="hidden sm:inline text-emerald-50/90">
          · Seeded account (demo@lifesaver.app / demo1234) · Live AI, calendar, and WebSocket are active.
        </span>
        <span className="sm:hidden text-emerald-50/90 truncate">
          Seeded · demo@lifesaver.app / demo1234
        </span>
        <button
          onClick={dismiss}
          className="ml-auto p-1 rounded hover:bg-white/20 text-white"
          aria-label="Dismiss demo banner"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  )
}
