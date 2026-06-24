import { createContext, useCallback, useContext, useEffect, useMemo, useState, ReactNode } from 'react'
import { auth, setUnauthorizedHandler } from '../services/api'

const EMAIL_KEY = 'lmls_email'

interface AuthContextType {
  token: string | null
  email: string | null
  isAuthenticated: boolean
  ready: boolean
  login: (emailVal: string, passwordVal: string) => Promise<any>
  signup: (emailVal: string, passwordVal: string) => Promise<any>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | null>(null)

function decodeJwtEmail(token: string): string | null {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    return payload.email || null
  } catch {
    return null
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => auth.getToken())
  const [email, setEmail] = useState<string | null>(() => localStorage.getItem(EMAIL_KEY) || null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    setReady(true)
    setUnauthorizedHandler(() => {
      setToken(null)
      setEmail(null)
      localStorage.removeItem(EMAIL_KEY)
    })
  }, [])

  const login = useCallback(async (emailVal: string, passwordVal: string) => {
    const data = await auth.login(emailVal, passwordVal)
    auth.setToken(data.access_token)
    const decoded = decodeJwtEmail(data.access_token)
    const emailToStore = decoded || emailVal
    localStorage.setItem(EMAIL_KEY, emailToStore)
    setToken(data.access_token)
    setEmail(emailToStore)
    return data
  }, [])

  const signup = useCallback(async (emailVal: string, passwordVal: string) => {
    const data = await auth.signup(emailVal, passwordVal)
    // Auto-login after signup for smooth demo flow.
    await login(emailVal, passwordVal)
    return data
  }, [login])

  const logout = useCallback(() => {
    auth.clearToken()
    localStorage.removeItem(EMAIL_KEY)
    setToken(null)
    setEmail(null)
  }, [])

  const value = useMemo(
    () => ({
      token,
      email,
      isAuthenticated: Boolean(token),
      ready,
      login,
      signup,
      logout,
    }),
    [token, email, ready, login, signup, logout]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

export default AuthContext
