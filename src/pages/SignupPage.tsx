import { useState } from 'react'
import { motion } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import { User, Mail, Lock, Zap, ArrowRight, Check } from 'lucide-react'
import AnimatedBackground from '../components/ui/AnimatedBackground'
import FloatingBlobs from '../components/ui/FloatingBlobs'
import GlassCard from '../components/ui/GlassCard'
import AnimatedButton from '../components/ui/AnimatedButton'
import AnimatedInput from '../components/ui/AnimatedInput'
import { LoadingOverlay } from '../components/ui/LoadingSpinner'
import { useAuth } from '../context/AuthContext'

export default function SignupPage() {
  const navigate = useNavigate()
  const { signup } = useAuth()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [apiError, setApiError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const passwordStrength = () => {
    const { password } = formData
    if (!password) return { score: 0, label: '', color: '' }
    let score = 0
    if (password.length >= 6) score++
    if (password.length >= 8) score++
    if (/[A-Z]/.test(password)) score++
    if (/[0-9]/.test(password)) score++
    if (/[^A-Za-z0-9]/.test(password)) score++

    const levels = [
      { label: 'Weak', color: 'text-red-400 bg-red-400/20' },
      { label: 'Fair', color: 'text-orange-400 bg-orange-400/20' },
      { label: 'Good', color: 'text-yellow-400 bg-yellow-400/20' },
      { label: 'Strong', color: 'text-emerald-400 bg-emerald-400/20' },
      { label: 'Excellent', color: 'text-violet-400 bg-violet-400/20' },
    ]
    return { score, ...levels[Math.min(score, levels.length - 1)] }
  }

  const strength = passwordStrength()

  const validate = () => {
    const newErrors: Record<string, string> = {}
    if (!formData.name) newErrors.name = 'Name is required'
    if (!formData.email) {
      newErrors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Invalid email format'
    }
    if (!formData.password) {
      newErrors.password = 'Password is required'
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters'
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
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
      await signup(formData.email, formData.password)
      setLoading(false)
      navigate('/dashboard')
    } catch (err: any) {
      setLoading(false)
      setApiError(err.friendlyMessage || 'Registration failed. Try a different email.')
    }
  }

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const requirements = [
    { met: formData.password.length >= 6, label: 'At least 6 characters' },
    { met: /[A-Z]/.test(formData.password), label: 'One uppercase letter' },
    { met: /[0-9]/.test(formData.password), label: 'One number' },
    { met: /[^A-Za-z0-9]/.test(formData.password), label: 'One special character' },
  ]

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden py-12">
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
          <h1 className="text-2xl font-bold text-white mb-2">Create your account</h1>
          <p className="text-slate-400">Start your journey to deadline-free productivity</p>
        </motion.div>

        {/* Signup Card */}
        <GlassCard>
          <form onSubmit={handleSubmit} className="p-6 lg:p-8 space-y-5">
            {apiError && (
              <div className="text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-xl px-4 py-3">
                {apiError}
              </div>
            )}
            <AnimatedInput
              label="Full Name"
              type="text"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              error={errors.name}
              icon={<User className="w-4 h-4" />}
            />

            <AnimatedInput
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              error={errors.email}
              icon={<Mail className="w-4 h-4" />}
            />

            <div>
              <AnimatedInput
                label="Password"
                type="password"
                value={formData.password}
                onChange={(e) => handleChange('password', e.target.value)}
                error={errors.password}
                icon={<Lock className="w-4 h-4" />}
              />

              {/* Password Strength */}
              {formData.password && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mt-3 space-y-2"
                >
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 rounded-full bg-white/[0.05] overflow-hidden">
                      <motion.div
                        className="h-full rounded-full bg-gradient-to-r from-violet-500 to-cyan-500"
                        initial={{ width: 0 }}
                        animate={{ width: `${(strength.score / 5) * 100}%` }}
                      />
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${strength.color}`}>
                      {strength.label}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-1">
                    {requirements.map((req, i) => (
                      <div
                        key={i}
                        className={`flex items-center gap-1.5 text-xs ${
                          req.met ? 'text-emerald-400' : 'text-slate-500'
                        }`}
                      >
                        <Check className={`w-3 h-3 ${req.met ? 'opacity-100' : 'opacity-30'}`} />
                        {req.label}
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>

            <AnimatedInput
              label="Confirm Password"
              type="password"
              value={formData.confirmPassword}
              onChange={(e) => handleChange('confirmPassword', e.target.value)}
              error={errors.confirmPassword}
              icon={<Lock className="w-4 h-4" />}
            />

            <label className="flex items-start gap-3 text-sm">
              <input
                type="checkbox"
                required
                className="mt-0.5 w-4 h-4 rounded border-slate-600 bg-transparent"
              />
              <span className="text-slate-400">
                I agree to the{' '}
                <a href="#" className="text-violet-400 hover:text-violet-300">Terms of Service</a>
                {' '}and{' '}
                <a href="#" className="text-violet-400 hover:text-violet-300">Privacy Policy</a>
              </span>
            </label>

            <AnimatedButton
              type="submit"
              variant="gradient"
              className="w-full"
              icon={<ArrowRight className="w-4 h-4" />}
              loading={loading}
            >
              Create Account
            </AnimatedButton>
          </form>
        </GlassCard>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-center text-sm text-slate-400 mt-6"
        >
          Already have an account?{' '}
          <Link to="/login" className="text-violet-400 hover:text-violet-300 font-medium">
            Sign in
          </Link>
        </motion.p>
      </motion.div>
    </div>
  )
}
