import { motion, HTMLMotionProps } from 'framer-motion'
import { forwardRef } from 'react'

interface GlassCardProps extends HTMLMotionProps<'div'> {
  children: React.ReactNode
  className?: string
  hover?: boolean
  glow?: 'purple' | 'blue' | 'cyan' | 'pink' | 'none'
}

const glowColors = {
  purple: 'hover:shadow-[0_0_30px_rgba(139,92,246,0.3)]',
  blue: 'hover:shadow-[0_0_30px_rgba(59,130,246,0.3)]',
  cyan: 'hover:shadow-[0_0_30px_rgba(34,211,238,0.3)]',
  pink: 'hover:shadow-[0_0_30px_rgba(236,72,153,0.3)]',
  none: '',
}

const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(
  ({ children, className = '', hover = true, glow = 'purple', ...props }, ref) => {
    return (
      <motion.div
        ref={ref}
        className={`
          relative rounded-2xl
          bg-white/[0.03]
          backdrop-blur-xl
          border border-white/[0.08]
          ${hover ? 'hover:border-white/[0.15] hover:bg-white/[0.05]' : ''}
          ${glow !== 'none' ? glowColors[glow] : ''}
          transition-all duration-300
          ${className}
        `}
        whileHover={hover ? { y: -2, scale: 1.01 } : undefined}
        transition={{ duration: 0.2 }}
        {...props}
      >
        {/* Gradient border overlay */}
        <div
          className="absolute inset-0 rounded-2xl opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none"
          style={{
            background: 'linear-gradient(135deg, rgba(139,92,246,0.1) 0%, transparent 50%, rgba(59,130,246,0.1) 100%)',
          }}
        />
        <div className="relative z-10">{children}</div>
      </motion.div>
    )
  }
)

GlassCard.displayName = 'GlassCard'

export default GlassCard
