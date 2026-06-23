import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { auth, setUnauthorizedHandler } from '../services/api'

const EMAIL_KEY = 'lmls_email'

const AuthContext = createContext(null)

function decodeJwtEmail(token) {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    const tail = payload.sub ? null : null
    return payload.email || tail
  } catch {
    return null
  }
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => auth.getToken())
  const [email, setEmail] = useState(() => localStorage.getItem(EMAIL_KEY) || null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    setReady(true)
    setUnauthorizedHandler(() => {
      setToken(null)
      setEmail(null)
      localStorage.removeItem(EMAIL_KEY)
    })
  }, [])

  const login = useCallback(async (emailVal, password) => {
    const data = await auth.login(emailVal, password)
    auth.setToken(data.access_token)
    const decoded = decodeJwtEmail(data.access_token)
    const emailToStore = decoded || emailVal
    localStorage.setItem(EMAIL_KEY, emailToStore)
    setToken(data.access_token)
    setEmail(emailToStore)
    return data
  }, [])

  const signup = useCallback(async (emailVal, password) => {
    const data = await auth.signup(emailVal, password)
    // Auto-login after signup for smooth demo flow.
    await login(emailVal, password)
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
