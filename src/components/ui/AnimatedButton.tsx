import { motion } from 'framer-motion'
import { Loader2 } from 'lucide-react'

interface AnimatedButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode
  variant?: 'primary' | 'secondary' | 'ghost' | 'gradient'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  icon?: React.ReactNode
  iconPosition?: 'left' | 'right'
}

const variants = {
  primary: 'bg-violet-600 hover:bg-violet-500 text-white shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40',
  secondary: 'bg-white/[0.05] hover:bg-white/[0.1] text-white border border-white/10 hover:border-white/20',
  ghost: 'text-slate-300 hover:text-white hover:bg-white/[0.05]',
  gradient: 'bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-500 hover:from-violet-500 hover:via-indigo-500 hover:to-cyan-400 text-white shadow-lg',
}

const sizes = {
  sm: 'px-4 py-2 text-sm',
  md: 'px-6 py-3 text-sm',
  lg: 'px-8 py-4 text-base',
}

export default function AnimatedButton({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  iconPosition = 'right',
  className = '',
  disabled,
  ...props
}: AnimatedButtonProps) {
  return (
    <motion.button
      className={`
        relative inline-flex items-center justify-center gap-2
        font-semibold rounded-xl
        transition-all duration-200
        disabled:opacity-50 disabled:cursor-not-allowed
        ${variants[variant]}
        ${sizes[size]}
        ${className}
      `}
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      disabled={disabled || loading}
      {...props}
    >
      {/* Glow effect */}
      {(variant === 'primary' || variant === 'gradient') && (
        <motion.div
          className="absolute inset-0 rounded-xl opacity-0"
          style={{
            background: variant === 'gradient'
              ? 'linear-gradient(to right, #7c3aed, #6366f1, #06b6d4)'
              : '#7c3aed',
            filter: 'blur(20px)',
          }}
          animate={{ opacity: [0, 0.3, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      )}

      {loading && <Loader2 className="w-4 h-4 animate-spin" />}
      {icon && iconPosition === 'left' && !loading && icon}
      <span className="relative z-10">{children}</span>
      {icon && iconPosition === 'right' && !loading && icon}
    </motion.button>
  )
}
