// Missing or malformed records belong on the unavailable-item screen.
export function isUnavailableItem(error) {
  return error?.code === 'PGRST116' || error?.code === '22P02'
}
