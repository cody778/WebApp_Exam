import { isUnavailableItem } from './dataErrors.js'

export default function DataState({ loading, error }) { //takes loading error and returns error message
  if (loading) return <p className="m-0 text-sm text-quiet" role="status">Loading...</p> // Loading message
  if (!error) return null

  const message = isUnavailableItem(error) // Check for specific error codes
    ? 'This item is unavailable.' // Default error message 1
    : error.code === 'PGRST205'
      ? 'Your learning data is not available yet.' // Check for specific error codes
      : 'Could not load your data. Please try again.' // Default error message 2

  return <p className="m-0 rounded-lg border border-[#9e2020]/25 bg-[#9e2020]/5 p-3 text-sm text-[#9e2020]" role="alert">{message}</p>
}
