import { Sparkles, Clock } from 'lucide-react'

export default function AuthLayout({ children, title, subtitle }) {
  return (
    <div className="min-h-screen flex">
      {/* Left brand panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-ink-950 text-white relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-90"
          style={{
            background:
              'radial-gradient(900px 500px at 15% 20%, rgba(16,185,129,0.22), transparent), radial-gradient(700px 600px at 90% 90%, rgba(59,130,246,0.18), transparent)',
          }}
        />
        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          <div className="flex items-center gap-2.5">
            <div className="h-10 w-10 rounded-xl bg-emerald-500 flex items-center justify-center shadow-lg">
              <Clock className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-semibold tracking-tight">Last-Minute Life Saver</span>
          </div>

          <div className="space-y-6 max-w-md">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 backdrop-blur px-3 py-1 text-xs font-medium text-emerald-300">
              <Sparkles className="h-3.5 w-3.5" />
              AI-powered deadline rescue
            </div>
            <h1 className="text-4xl font-bold leading-tight tracking-tight">
              Turn panic into a plan in seconds.
            </h1>
            <p className="text-ink-300 leading-relaxed text-base">
              Drop your goal and deadline. The AI splits it into prioritized tasks, fits them into
              your day, and nudges you in real time.
            </p>
            <div className="flex gap-6 pt-2">
              <Stat label="Tasks planned" value="AI" />
              <Stat label="Live updates" value="Realtime" />
              <Stat label="Setup" value="Zero" />
            </div>
          </div>

          <p className="text-ink-400 text-xs">Built for the hackathon. Demo-ready.</p>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 bg-ink-50">
        <div className="w-full max-w-md animate-fade-in">
          <div className="lg:hidden flex items-center gap-2.5 mb-8">
            <div className="h-9 w-9 rounded-xl bg-emerald-500 flex items-center justify-center">
              <Clock className="h-5 w-5 text-white" />
            </div>
            <span className="font-semibold text-ink-900">Last-Minute Life Saver</span>
          </div>
          <h2 className="text-2xl font-bold text-ink-900 tracking-tight">{title}</h2>
          {subtitle && <p className="mt-1.5 text-ink-500 text-sm">{subtitle}</p>}
          <div className="mt-7">{children}</div>
        </div>
      </div>
    </div>
  )
}

function Stat({ label, value }) {
  return (
    <div>
      <div className="text-2xl font-bold tracking-tight">{value}</div>
      <div className="text-xs text-ink-400 mt-0.5">{label}</div>
    </div>
  )
}
