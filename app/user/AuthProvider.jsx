import { createContext, useContext, useEffect, useState } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { supabase } from './client.js'

const AuthContext = createContext(null)

export function AuthProvider({ children }) { // Provide context to the app - loading state
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(Boolean(supabase))

  useEffect(() => {
    if (!supabase) return

    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => data.subscription.unsubscribe()
  }, [])

  return <AuthContext.Provider value={{ user, loading }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  return useContext(AuthContext)
}

export function RequireUser() { // This component is used to protect authentication
  const { user, loading } = useAuth()
  const location = useLocation()

  if (!supabase) return <p role="alert">Sign in is not configured yet.</p>
  if (loading) return <p role="status">Loading your account...</p>
  if (!user) return <Navigate to="/sign-in" state={{ from: location.pathname + location.search }} replace />

  return <Outlet key={user.id} />
}
