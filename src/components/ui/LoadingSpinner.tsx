import { motion } from 'framer-motion'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  color?: 'violet' | 'white' | 'cyan'
}

const sizes = {
  sm: 'w-5 h-5',
  md: 'w-8 h-8',
  lg: 'w-12 h-12',
}

const colors = {
  violet: 'from-violet-500 to-violet-600',
  white: 'from-white to-slate-300',
  cyan: 'from-cyan-500 to-cyan-600',
}

export default function LoadingSpinner({ size = 'md', color = 'violet' }: LoadingSpinnerProps) {
  return (
    <div className="relative">
      {/* Outer spinning ring */}
      <motion.div
        className={`${sizes[size]} rounded-full border-2 border-transparent border-t-current`}
        style={{
          borderTopColor: color === 'violet' ? '#8b5cf6' : color === 'cyan' ? '#06b6d4' : '#ffffff',
        }}
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
      />

      {/* Inner pulsing dot */}
      <motion.div
        className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-gradient-to-r ${colors[color]}`}
        animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      />
    </div>
  )
}

export function LoadingOverlay() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 bg-[#0a0a0f]/80 backdrop-blur-sm z-50 flex items-center justify-center"
    >
      <div className="flex flex-col items-center gap-4">
        <LoadingSpinner size="lg" />
        <motion.p
          className="text-slate-400 text-sm"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          Loading...
        </motion.p>
      </div>
    </motion.div>
  )
}
