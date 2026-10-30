import { createContext, useContext, useEffect, useState } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router'
import { supabase } from './client.js'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(Boolean(supabase))

  useEffect(() => {
    if (!supabase) return

    // This fires for the restored session and for later sign-in or sign-out changes.
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Remove the Supabase listener when the app shell unmounts.
    return () => data.subscription.unsubscribe()
  }, [])

  return <AuthContext.Provider value={{ user, loading }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  return useContext(AuthContext)
}

export function RequireUser() {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (!supabase) return <p className="text-[#9e2020]" role="alert">Sign in is not configured yet.</p>
  if (loading) return <p role="status">Loading your account...</p>
  // Keep the requested address so Sign In can return the user to it.
  if (!user) return <Navigate to="/sign-in" state={{ from: location.pathname + location.search }} replace />

  return <Outlet key={user.id} />
}
