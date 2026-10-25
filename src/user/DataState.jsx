export default function DataState({ loading, error }) { //takes loading error and returns error message
  if (loading) return <p role="status">Loading...</p> // Loading message
  if (!error) return null

  const message = error.code === 'PGRST116' || error.code === '22P02' // Check for specific error codes
    ? 'This item is unavailable.' // Default error message 1
    : error.code === 'PGRST205'
      ? 'Your learning data is not available yet.' // Check for specific error codes
      : 'Could not load your data. Please try again.' // Default error message 2

  return <p role="alert">{message}</p>
}
