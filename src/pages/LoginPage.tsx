import { useState } from 'react'
import { motion } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import { Mail, Lock, Zap, ArrowRight } from 'lucide-react'
import AnimatedBackground from '../components/ui/AnimatedBackground'
import FloatingBlobs from '../components/ui/FloatingBlobs'
import GlassCard from '../components/ui/GlassCard'
import AnimatedButton from '../components/ui/AnimatedButton'
import AnimatedInput from '../components/ui/AnimatedInput'
import { LoadingOverlay } from '../components/ui/LoadingSpinner'
import { useAuth } from '../context/AuthContext'

export default function LoginPage() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({})
  const [apiError, setApiError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const validate = () => {
    const newErrors: typeof errors = {}
    if (!email) {
      newErrors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Invalid email format'
    }
    if (!password) {
      newErrors.password = 'Password is required'
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    setLoading(true)
    setApiError(null)
    try {
      await login(email, password)
      setLoading(false)
      navigate('/dashboard')
    } catch (err: any) {
      setLoading(false)
      setApiError(err.friendlyMessage || 'Invalid email or password.')
    }
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {loading && <LoadingOverlay />}
      <AnimatedBackground />
      <FloatingBlobs />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-md px-6"
      >
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-white">LifeSaver</span>
          </Link>
          <h1 className="text-2xl font-bold text-white mb-2">Welcome back</h1>
          <p className="text-slate-400">Sign in to continue to your dashboard</p>
        </motion.div>

        {/* Login Card */}
        <GlassCard>
          <form onSubmit={handleSubmit} className="p-6 lg:p-8 space-y-5">
            {apiError && (
              <div className="text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-xl px-4 py-3">
                {apiError}
              </div>
            )}
            <AnimatedInput
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={errors.email}
              icon={<Mail className="w-4 h-4" />}
            />

            <AnimatedInput
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={errors.password}
              icon={<Lock className="w-4 h-4" />}
            />

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 text-slate-400">
                <input type="checkbox" className="w-4 h-4 rounded border-slate-600 bg-transparent" />
                Remember me
              </label>
              <a href="#" className="text-violet-400 hover:text-violet-300 transition-colors">
                Forgot password?
              </a>
            </div>

            <AnimatedButton
              type="submit"
              variant="gradient"
              className="w-full"
              icon={<ArrowRight className="w-4 h-4" />}
              loading={loading}
            >
              Sign In
            </AnimatedButton>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/[0.08]"></div>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-2 bg-[#0a0a0f] text-slate-500">Or continue with</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <motion.button
                type="button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white/[0.05] border border-white/[0.08] text-white text-sm hover:bg-white/[0.1] transition-colors"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#fff" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.38-1.03 2.56-2.17 3.36v2.78h3.51c2.05-1.89 3.23-4.68 3.23-7.15z"/>
                  <path fill="#fff" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.51-2.78c-.98.66-2.23 1.06-3.77 1.06-2.88 0-5.32-1.95-6.2-4.56H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#fff" d="M5.8 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.62 2.04 2-1.88z"/>
                  <path fill="#fff" d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.62 2.84C6.68 7.3 9.12 5.38 12 5.38z"/>
                </svg>
                Google
              </motion.button>
              <motion.button
                type="button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white/[0.05] border border-white/[0.08] text-white text-sm hover:bg-white/[0.1] transition-colors"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
                GitHub
              </motion.button>
            </div>
          </form>
        </GlassCard>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-center text-sm text-slate-400 mt-6"
        >
          Don&apos;t have an account?{' '}
          <Link to="/signup" className="text-violet-400 hover:text-violet-300 font-medium">
            Sign up
          </Link>
        </motion.p>
      </motion.div>
    </div>
  )
}
