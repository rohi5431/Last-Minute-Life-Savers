import { motion } from 'framer-motion'

interface SkeletonCardProps {
  variant?: 'card' | 'list' | 'stat' | 'chart'
  count?: number
}

export default function SkeletonCard({ variant = 'card', count = 1 }: SkeletonCardProps) {
  const variants = {
    card: (
      <div className="rounded-2xl bg-white/[0.03] border border-white/[0.08] p-6 space-y-4">
        <motion.div
          className="h-4 bg-white/[0.05] rounded-lg w-1/2"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
        <motion.div
          className="h-3 bg-white/[0.05] rounded-lg w-full"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity, delay: 0.2 }}
        />
        <motion.div
          className="h-3 bg-white/[0.05] rounded-lg w-3/4"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity, delay: 0.4 }}
        />
      </div>
    ),
    list: (
      <div className="rounded-xl bg-white/[0.03] border border-white/[0.08] p-4 space-y-3">
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            className="flex items-center gap-3"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity, delay: i * 0.1 }}
          >
            <div className="w-10 h-10 rounded-lg bg-white/[0.05]" />
            <div className="flex-1 space-y-2">
              <div className="h-3 bg-white/[0.05] rounded-lg w-1/2" />
              <div className="h-2 bg-white/[0.05] rounded-lg w-3/4" />
            </div>
          </motion.div>
        ))}
      </div>
    ),
    stat: (
      <div className="rounded-2xl bg-white/[0.03] border border-white/[0.08] p-6 text-center">
        <motion.div
          className="w-12 h-12 rounded-xl bg-white/[0.05] mx-auto mb-4"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
        <motion.div
          className="h-6 bg-white/[0.05] rounded-lg w-1/2 mx-auto mb-2"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity, delay: 0.2 }}
        />
        <motion.div
          className="h-3 bg-white/[0.05] rounded-lg w-2/3 mx-auto"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity, delay: 0.4 }}
        />
      </div>
    ),
    chart: (
      <div className="rounded-2xl bg-white/[0.03] border border-white/[0.08] p-6">
        <div className="flex items-center justify-between mb-6">
          <motion.div
            className="h-4 bg-white/[0.05] rounded-lg w-1/3"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          <motion.div
            className="h-6 w-16 rounded-lg bg-white/[0.05]"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity, delay: 0.2 }}
          />
        </div>
        <motion.div
          className="h-48 bg-white/[0.05] rounded-xl"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity, delay: 0.4 }}
        />
      </div>
    ),
  }

  return (
    <>
      {[...Array(count)].map((_, i) => (
        <div key={i}>{variants[variant]}</div>
      ))}
    </>
  )
}
