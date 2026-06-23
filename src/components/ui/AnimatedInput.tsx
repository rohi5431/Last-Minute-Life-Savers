import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Eye, EyeOff } from 'lucide-react'

interface AnimatedInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
  icon?: React.ReactNode
}

export default function AnimatedInput({
  label,
  error,
  icon,
  type = 'text',
  className = '',
  ...props
}: AnimatedInputProps) {
  const [focused, setFocused] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const isPassword = type === 'password'

  return (
    <div className="w-full">
      <div className="relative">
        <motion.div
          className={`
            relative flex items-center gap-3
            rounded-xl
            bg-white/[0.03]
            border
            transition-all duration-200
            ${focused
              ? 'border-violet-500/50 bg-white/[0.05] shadow-lg shadow-violet-500/10'
              : error
                ? 'border-red-500/30'
                : 'border-white/[0.08]'
            }
          `}
        >
          {icon && (
            <div className={`pl-4 ${focused ? 'text-violet-400' : 'text-slate-500'} transition-colors`}>
              {icon}
            </div>
          )}

          <input
            {...props}
            type={isPassword && showPassword ? 'text' : type}
            className={`
              w-full px-4 py-3.5
              bg-transparent
              text-white text-sm
              placeholder-transparent
              focus:outline-none
              ${className}
            `}
            placeholder={label}
            onFocus={(e) => {
              setFocused(true)
              props.onFocus?.(e)
            }}
            onBlur={(e) => {
              setFocused(false)
              props.onBlur?.(e)
            }}
          />

          {/* Floating label */}
          <label
            className={`
              absolute left-4 transition-all duration-200 pointer-events-none
              ${icon ? 'left-12' : 'left-4'}
              ${focused || props.value
                ? '-top-2 text-xs bg-[#0a0a0f] px-2 text-violet-400'
                : 'top-1/2 -translate-y-1/2 text-sm text-slate-500'
              }
            `}
          >
            {label}
          </label>

          {/* Password toggle */}
          {isPassword && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="pr-4 text-slate-500 hover:text-slate-300 transition-colors"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          )}
        </motion.div>

        {/* Error message */}
        <AnimatePresence>
          {error && (
            <motion.p
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="mt-2 text-xs text-red-400"
            >
              {error}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
