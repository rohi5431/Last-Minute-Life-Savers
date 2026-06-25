import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Brain, ListTodo, Zap, Calendar, Check, Loader2 } from 'lucide-react'
import GlassCard from './ui/GlassCard'

interface AgentVisualizerProps {
  planLoading: boolean
  plan: any
  error: string | null
  needsClarification: boolean
}

interface AgentStep {
  id: string
  name: string
  role: string
  icon: any
  logs: string[]
}

const AGENTS: AgentStep[] = [
  {
    id: 'clarifier',
    name: 'Clarifier Agent',
    role: 'Specificity Audit',
    icon: Brain,
    logs: [
      'Scanning goal title and scope notes...',
      'Validating specificity criteria...',
      'Checking for potential ambiguities...',
      'Goal parameters validated successfully.'
    ]
  },
  {
    id: 'planner',
    name: 'Planner Agent',
    role: 'Task Decomposition',
    icon: ListTodo,
    logs: [
      'Initiating hierarchical decomposition...',
      'Extracting subtasks and milestones...',
      'Mapping task dependencies...',
      'Generated tasks: Hero, CTA, deployment steps.'
    ]
  },
  {
    id: 'prioritizer',
    name: 'Prioritizer Agent',
    role: 'Urgency & Load Scoring',
    icon: Zap,
    logs: [
      'Analyzing task deadlines...',
      'Estimating cognitive effort weights...',
      'Ordering by critical path impact...',
      'Priority rankings updated.'
    ]
  },
  {
    id: 'scheduler',
    name: 'Scheduler Agent',
    role: 'Calendar Integration',
    icon: Calendar,
    logs: [
      'Importing Google Calendar events...',
      'Identifying calendar conflicts...',
      'Allocating optimal work blocks...',
      'Schedule finalized and synchronized!'
    ]
  }
]

export default function AgentVisualizer({ planLoading, plan, error, needsClarification }: AgentVisualizerProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [completedSteps, setCompletedSteps] = useState<string[]>([])
  const [terminalLogs, setTerminalLogs] = useState<string[]>([])
  const logContainerRef = useRef<HTMLDivElement>(null)

  // Auto-scroll logs
  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight
    }
  }, [terminalLogs])

  useEffect(() => {
    if (!planLoading) {
      if (plan && !needsClarification) {
        // Fast-forward all steps to complete
        setCompletedSteps(AGENTS.map(a => a.id))
        setCurrentStepIndex(AGENTS.length)
        const allLogs = AGENTS.flatMap(a => a.logs)
        setTerminalLogs(prev => {
          const unique = new Set([...prev, ...allLogs])
          return Array.from(unique)
        })
      }
      return
    }

    // Reset when starting
    setCurrentStepIndex(0)
    setCompletedSteps([])
    setTerminalLogs(['[SYSTEM] Initializing Multi-Agent Orchestrator...'])

    // Timed progression to match average API response times
    const stepDurations = [2500, 4500, 3500, 4000] // durations for each agent in ms
    let currentIdx = 0
    let logIntervals: any[] = []
    let stepTimers: any[] = []

    const runStep = (idx: number) => {
      if (idx >= AGENTS.length) return
      
      const agent = AGENTS[idx]
      setTerminalLogs(prev => [...prev, `[${agent.name.toUpperCase()}] Spin up active.`])

      // Push logs sequentially for this agent
      let logIndex = 0
      const pushLog = () => {
        if (logIndex < agent.logs.length) {
          setTerminalLogs(prev => [...prev, `[${agent.name.toUpperCase()}] ${agent.logs[logIndex]}`])
          logIndex++
          const delay = 600 + Math.random() * 800
          const t = setTimeout(pushLog, delay)
          logIntervals.push(t)
        }
      }
      pushLog()

      // Set timeout for next agent
      const nextStepTimer = setTimeout(() => {
        setCompletedSteps(prev => [...prev, agent.id])
        currentIdx = idx + 1
        setCurrentStepIndex(currentIdx)
        if (currentIdx < AGENTS.length) {
          runStep(currentIdx)
        }
      }, stepDurations[idx])
      stepTimers.push(nextStepTimer)
    }

    runStep(0)

    return () => {
      logIntervals.forEach(clearTimeout)
      stepTimers.forEach(clearTimeout)
    }
  }, [planLoading, plan, needsClarification])

  // If there's an error, add error log
  useEffect(() => {
    if (error) {
      setTerminalLogs(prev => [...prev, `[ERROR] Planning failed: ${error}`])
    }
  }, [error])

  // If clarification needed, halt
  useEffect(() => {
    if (needsClarification) {
      setTerminalLogs(prev => [
        ...prev,
        `[CLARIFIER AGENT] Clarification required. Halting execution loop.`
      ])
    }
  }, [needsClarification])

  return (
    <div className="mt-6 space-y-4">
      {/* Agents pipeline track */}
      <div className="grid grid-cols-4 gap-2 relative">
        {/* Connector Line */}
        <div className="absolute top-6 left-[12%] right-[12%] h-[2px] bg-white/[0.05] z-0">
          <motion.div
            className="h-full bg-gradient-to-r from-violet-500 via-cyan-500 to-emerald-500"
            initial={{ width: '0%' }}
            animate={{
              width: `${Math.min((completedSteps.length / (AGENTS.length - 1)) * 100, 100)}%`
            }}
            transition={{ duration: 0.5 }}
          />
        </div>

        {AGENTS.map((agent, index) => {
          const isCompleted = completedSteps.includes(agent.id)
          const isActive = currentStepIndex === index && planLoading
          const Icon = agent.icon

          return (
            <div key={agent.id} className="flex flex-col items-center relative z-10 text-center">
              {/* Node Circle */}
              <motion.div
                animate={isActive ? { scale: [1, 1.1, 1], borderColor: ['rgba(139, 92, 246, 0.2)', 'rgba(6, 182, 212, 0.8)', 'rgba(139, 92, 246, 0.2)'] } : {}}
                transition={{ repeat: Infinity, duration: 2 }}
                className={`w-12 h-12 rounded-xl flex items-center justify-center border transition-all ${
                  isCompleted
                    ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400'
                    : isActive
                    ? 'bg-cyan-500/10 border-cyan-400 text-cyan-400 shadow-cyan-500/10 shadow-lg'
                    : 'bg-white/[0.02] border-white/[0.08] text-slate-500'
                }`}
              >
                {isCompleted ? (
                  <Check className="w-5 h-5" />
                ) : isActive ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Icon className="w-5 h-5" />
                )}
              </motion.div>

              {/* Title / Role */}
              <span className={`text-[11px] font-bold mt-2.5 transition-colors ${
                isActive ? 'text-cyan-400' : isCompleted ? 'text-emerald-400' : 'text-slate-500'
              }`}>
                {agent.name.split(' ')[0]}
              </span>
              <span className="text-[9px] text-slate-600 font-medium hidden md:inline">
                {agent.role}
              </span>
            </div>
          )
        })}
      </div>

      {/* Terminal Monologue Window */}
      <GlassCard hover={false} className="border-white/[0.05] bg-[#07070b]/90">
        <div className="flex items-center justify-between px-4 py-2 border-b border-white/[0.05]">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500/50" />
            <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/50" />
            <span className="w-2.5 h-2.5 rounded-full bg-green-500/50" />
            <span className="text-[10px] text-slate-500 font-mono ml-2">agent_orchestrator.log</span>
          </div>
          <span className="text-[9px] text-slate-500 font-mono uppercase tracking-wider">
            {planLoading ? 'Orchestrator active' : 'Idle'}
          </span>
        </div>
        <div
          ref={logContainerRef}
          className="p-4 h-36 overflow-y-auto font-mono text-[11px] text-slate-400 space-y-1.5 scrollbar-thin scrollbar-thumb-white/10"
        >
          <AnimatePresence>
            {terminalLogs.map((log, i) => {
              const isError = log.includes('[ERROR]')
              const isSystem = log.includes('[SYSTEM]')

              let textColor = 'text-slate-400'
              if (isError) textColor = 'text-red-400'
              else if (isSystem) textColor = 'text-violet-400 font-semibold'
              else if (log.includes('Clarifier')) textColor = 'text-amber-300'
              else if (log.includes('Planner')) textColor = 'text-cyan-300'
              else if (log.includes('Prioritizer')) textColor = 'text-fuchsia-300'
              else if (log.includes('Scheduler')) textColor = 'text-emerald-300'

              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -5 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`${textColor}`}
                >
                  <span className="text-slate-600 mr-1.5">[{new Date().toLocaleTimeString([], { hour12: false })}]</span>
                  {log}
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>
      </GlassCard>
    </div>
  )
}
