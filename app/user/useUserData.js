import { useEffect, useState } from 'react'
import { useAuth } from './AuthProvider.jsx'

export default function useUserData(load, id) {
  const { user, loading: authLoading } = useAuth()
  const userId = user?.id ?? null
  const [version, setVersion] = useState(0)
  const [state, setState] = useState(null)

  useEffect(() => {
    if (authLoading && !userId) return
    let active = true

    // Ignore a request if the page unmounts before it finishes.
    load(userId, id).then(
      data => { if (active) setState({ userId, id, version, data }) },
      error => { if (active) setState({ userId, id, version, error }) },
    )

    return () => { active = false }
  }, [load, authLoading, userId, id, version])

  const current = state?.userId === userId && state?.id === id && state?.version === version
  return { data: current ? state.data : null, error: current ? state.error : null, loading: !current, reload: () => setVersion(value => value + 1) }
}
