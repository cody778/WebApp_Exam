import { useEffect, useState } from 'react'
import { useAuth } from './AuthProvider.jsx'

export default function useUserData(load, id) { // takes user userID and data ID to return data, error, loading and reload function
  const { user, loading: authLoading } = useAuth()
  const userId = user?.id ?? null
  const [version, setVersion] = useState(0)
  const [state, setState] = useState(null)

  useEffect(() => { // load data when user, id or version changes
    if (authLoading && !userId) return
    let active = true

    load(userId, id).then( // load data from the load function passed
      data => { if (active) setState({ userId, id, version, data }) },
      error => { if (active) setState({ userId, id, version, error }) },
    )

    return () => { active = false }
  }, [load, authLoading, userId, id, version])

  const current = state?.userId === userId && state?.id === id && state?.version === version
  return { data: current ? state.data : null, error: current ? state.error : null, loading: !current, reload: () => setVersion(value => value + 1) }
}
