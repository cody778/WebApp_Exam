import { isUnavailableItem } from './dataErrors.js'

export default function DataState({ loading, error }) {
  if (loading) return <p className="m-0 text-sm text-quiet" role="status">Loading...</p>
  if (!error) return null

  const message = isUnavailableItem(error)
    ? 'This item is unavailable.'
    : error.code === 'PGRST205'
      ? 'Your learning data is not available yet.'
      : 'Could not load your data. Please try again.'

  return <p className="m-0 rounded-lg border border-[#9e2020]/25 bg-[#9e2020]/5 p-3 text-sm text-[#9e2020]" role="alert">{message}</p>
}
