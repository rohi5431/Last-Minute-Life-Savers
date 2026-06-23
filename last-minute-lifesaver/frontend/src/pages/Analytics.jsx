import { BarChart3 } from 'lucide-react'
import AnalyticsDash from '../components/AnalyticsDash'

export default function Analytics() {
  return (
    <div className="space-y-5">
      <div>
        <div className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-emerald-500" />
          <h1 className="text-xl font-bold text-ink-900 tracking-tight">Analytics</h1>
        </div>
        <p className="text-sm text-ink-500 mt-1">
          Track completion, streak, and momentum across all your goals.
        </p>
      </div>
      <AnalyticsDash />
    </div>
  )
}
