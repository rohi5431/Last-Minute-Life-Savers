import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Mail, Lock, Loader2, ArrowRight, Check } from 'lucide-react'
import AuthLayout from '../components/AuthLayout'
import { useAuth } from '../context/AuthContext'

const MIN_PASSWORD = 6

export default function Signup() {
  const { signup } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  const passwordsMatch = password === confirm
  const passwordLong = password.length >= MIN_PASSWORD

  const onSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    if (!passwordLong) {
      setError(`Password must be at least ${MIN_PASSWORD} characters.`)
      return
    }
    if (!passwordsMatch) {
      setError('Passwords do not match.')
      return
    }
    setLoading(true)
    try {
      await signup(email.trim(), password)
      navigate('/dashboard', { replace: true })
    } catch (err) {
      setError(err.friendlyMessage || 'Could not create account')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout
      title="Create your account"
      subtitle="One step away from a calmer deadline."
    >
      <form onSubmit={onSubmit} className="space-y-5">
        <div>
          <label className="label" htmlFor="email">Email</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-400" />
            <input
              id="email"
              type="email"
              autoComplete="username"
              className="input pl-9"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
        </div>

        <div>
          <label className="label" htmlFor="password">Password</label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-400" />
            <input
              id="password"
              type="password"
              autoComplete="new-password"
              className="input pl-9"
              placeholder="At least 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={MIN_PASSWORD}
            />
            {password && (
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs">
                {passwordLong ? (
                  <Check className="h-4 w-4 text-emerald-500" />
                ) : (
                  <span className="text-ink-400">too short</span>
                )}
              </span>
            )}
          </div>
        </div>

        <div>
          <label className="label" htmlFor="confirm">Confirm password</label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-400" />
            <input
              id="confirm"
              type="password"
              autoComplete="new-password"
              className="input pl-9"
              placeholder="Re-enter password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
            />
            {confirm && (
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs">
                {passwordsMatch ? (
                  <Check className="h-4 w-4 text-emerald-500" />
                ) : (
                  <span className="text-red-500">mismatch</span>
                )}
              </span>
            )}
          </div>
        </div>

        {error && (
          <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2 animate-fade-in">
            {error}
          </div>
        )}

        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
          {loading ? 'Creating account...' : 'Create account'}
        </button>

        <p className="text-center text-sm text-ink-500">
          Already have an account?{' '}
          <Link to="/login" className="text-emerald-600 font-medium hover:text-emerald-700">
            Log in
          </Link>
        </p>
      </form>
    </AuthLayout>
  )
}
