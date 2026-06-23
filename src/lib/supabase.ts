import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL as string
const anon = import.meta.env.VITE_SUPABASE_ANON_KEY as string

if (!url || !anon) {
  throw new Error('Missing VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY')
}

export const supabase = createClient(url, anon, {
  auth: { persistSession: false },
})

export const DEMO_USER_ID = 1

// Simple session token (base64 of user id + email) — this is NOT a security
// boundary; it only lets the UI remember who's logged in across refreshes
// within this demo context. The real FastAPI backend issues a proper JWT.
const SESSION_KEY = 'lmls_session'

export function setSession(user: { id: number; email: string }) {
  localStorage.setItem(SESSION_KEY, btoa(JSON.stringify(user)))
}

export function getSession(): { id: number; email: string } | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY)
    if (!raw) return null
    return JSON.parse(atob(raw))
  } catch {
    return null
  }
}

export function clearSession() {
  localStorage.removeItem(SESSION_KEY)
}

export type SessionUser = { id: number; email: string }

export async function login(email: string, password: string) {
  const { data, error } = await supabase.rpc('verify_login', {
    p_email: email.trim().toLowerCase(),
    p_password: password,
  })
  if (error) throw new Error(error.message)
  if (!data || data.length === 0) {
    throw new Error('Invalid email or password')
  }
  const user = { id: data[0].id, email: data[0].email }
  setSession(user)
  return user
}
